// check-fixtures.mjs: a reference receiver for the Agent Emailing conformance
// cases. It parses each fixture, applies SPEC.md §3, §4 and §7 in the order
// §7.2 gives, runs the person-view check of §3.3 where a case asks for it, and
// compares the outcome with conformance/cases.json.
//
//   node tools/check-fixtures.mjs
//
// It is deliberately small. It shows that the fixtures say what the cases say,
// and it is a starting point for an implementer's own test harness.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { verifyEnvelope, sha256hex } from "./lib.mjs";
import { parseMail, leaves, header, stateOf, checkHuman, normalizeText, decodeWords, money } from "./mail.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
// Run from tools/ in the source folder, or from conformance/ on the site.
const CONF = HERE.endsWith("conformance") ? HERE : resolve(HERE, "../conformance");
const CASES = JSON.parse(readFileSync(resolve(CONF, "cases.json"), "utf8"));
const CARDS = JSON.parse(readFileSync(resolve(CONF, "cards.json"), "utf8"));
const MEDIA = CASES.envelope_media_type;
const MAILBOX_WINDOW_MS = 7 * 24 * 3600 * 1000; // Agent Messaging §22.3, mailbox max_age
const SKEW_AHEAD_MS = 5 * 60 * 1000;              // Agent Messaging §22.3, max_clock_skew_ahead
const SIZE_CAP = 65536;                           // Agent Messaging §22.5, in UTF-16 code units

const memory = new Set();

// §3.1: only the outer email's own parts count. The parser does not open a
// message/rfc822 part, so an email attached inside this one is a single leaf.
const parts = (mail) => leaves(mail);
const isAttachment = (p) => /^attachment/i.test(header(p.headers, "content-disposition") ?? "");
const filename = (p) => ((header(p.headers, "content-disposition") ?? "").match(/filename="?([^";]+)"?/i) ?? [])[1];

// Agent Messaging §22.5: what the size cap measures.
function measured(payload) {
  if (typeof payload === "string") return payload.length;
  for (const k of ["text", "message", "prompt"]) {
    const v = payload?.[k];
    if (v === undefined || v === null) continue;
    return typeof v === "string" ? v.length : JSON.stringify(v).length;
  }
  return JSON.stringify(payload ?? null).length;
}

// §4.2: a bridged envelope's id.
function bridgedId(callerRef, messageId, subject, text) {
  const tail = messageId ?? `${subject ?? ""}\n${text}`;
  const h = createHash("sha256").update(`agent-emailing bridged\n${callerRef}\n${tail}`).digest();
  h[6] = (h[6] & 0x0f) | 0x80;
  h[8] = (h[8] & 0x3f) | 0x80;
  const x = h.subarray(0, 16).toString("hex");
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
}

// Agent Messaging §22.2 with SPEC.md §7.1: a new entry when the memory is at
// its bound, with every entry inside the window, is held, not let in.
function remember(c, key) {
  if (memory.has(key)) return "duplicate";
  if (c.memory_bound !== undefined && memory.size >= c.memory_bound) return "full";
  memory.add(key);
  return "new";
}
const FULL = { deliver: false, outcome: "held", refusal: "duplicate memory at its bound", reply: "none", local_signal: true };

function receive(c) {
  const mail = parseMail(readFileSync(resolve(CONF, "fixtures", c.fixture), "utf8"));
  const out = { deliver: false, reply: "none" };

  // §8: a delivery status notification answers a message we sent. The sender
  // matches it by the envelope id where it is returned, and otherwise by the
  // Message-ID it recorded at send time.
  if (mail.type === "multipart/report") {
    const dsn = parts(mail).find((p) => p.type === "message/delivery-status").bytes.toString("utf8");
    const status = (dsn.match(/^Status:\s*(\S+)/m) ?? [])[1];
    const returned = parts(mail).find((p) => p.type === "message/rfc822" || p.type === "text/rfc822-headers").bytes.toString("utf8");
    const head = returned.split(/\r\n\r\n/)[0];
    const envId = (head.match(/^Agent-Messaging-Id:\s*(\S+)/mi) ?? [])[1];
    const msgid = (head.match(/^Message-ID:\s*(\S+)/mi) ?? [])[1];
    const sent = c.sent ?? [];
    const byId = envId && sent.find((s) => s.request === envId);
    const byMsgId = !byId && msgid && sent.find((s) => s.message_id === msgid);
    const hit = byId || byMsgId;
    out.outcome_for_request = { request: hit?.request, outcome: status?.startsWith("5") ? "undeliverable" : "deferred", status,
      matched_by: byId ? "envelope id" : byMsgId ? "Message-ID" : "nothing" };
    return out;
  }

  const auto = (header(mail.headers, "auto-submitted") ?? "no").toLowerCase();
  const envParts = parts(mail).filter((p) => p.type === MEDIA);
  if (envParts.length > 1) return { ...out, refusal: "more than one envelope part", local_signal: true };
  if (envParts.length === 0) {
    // §7.3: never act on automatic replies.
    if (auto !== "no") return { ...out, refusal: "automatic reply" };
    // §4.2: a bridge may host an identity only on an aligned DMARC pass.
    const a = c.carrier_auth ?? {};
    const aligned = a.dmarc === "pass" && (a.dkim ?? []).some((d) => d.result === "pass" && d.aligned);
    if (c.role === "bridge" && aligned) {
      const from = header(mail.headers, "from").match(/<([^>]+)>/)[1].trim().toLowerCase();
      const callerRef = sha256hex(Buffer.from(from, "utf8"));
      const body = parts(mail).find((p) => p.type === "text/plain" && !isAttachment(p));
      const text = normalizeText(body ? body.bytes.toString("utf8") : "");
      const subject = header(mail.headers, "subject") ? decodeWords(header(mail.headers, "subject")) : undefined;
      const id = bridgedId(callerRef, header(mail.headers, "message-id"), subject, text);
      if (remember(c, `bridged:${callerRef}\n${id}`) === "duplicate") return { ...out, refusal: "duplicate" };
      const files = parts(mail).filter(isAttachment).map((p) => ({ name: filename(p), media_type: p.type, size: p.bytes.length, digest: `sha256:${sha256hex(p.bytes)}` }));
      return { deliver: "as a bridged request", mode: "bridged",
        identity_bridge: { front: "email", caller_kind: "email", caller_ref: callerRef },
        admission_tier: "bridged", default_stance: "hold",
        bridged_request: { id, offering: "message", text, ...(subject ? { subject } : {}), ...(files.length ? { files } : {}) } };
    }
    return c.role === "bridge"
      ? { ...out, refusal: "no aligned DMARC pass, so no bridged identity", reaches_model: false }
      : { ...out, refusal: "no envelope and no admitted bridged sender", reaches_model: false, held_attempt_report: "allowed" };
  }

  // §3.2: the envelope's values, never its bytes.
  let env;
  try { env = JSON.parse(envParts[0].bytes.toString("utf8")); } catch { return { ...out, refusal: "INVALID_ENVELOPE", local_signal: true }; }
  if (!verifyEnvelope(env)) return { ...out, refusal: "IDENTITY_MISMATCH", local_signal: true,
    // §3.3: software that shows it to a person must not present it as checked.
    ...(c.expect.person_view ? { person_view: "fail: do not trust this email" } : {}) };

  // Agent Messaging §22.2, remembered before it is judged; then §22.3 with the
  // mailbox window; then §22.4, byte for byte; then §22.5.
  const seen = remember(c, `${env.from}\n${env.id}`);
  if (seen === "duplicate") return { ...out, refusal: "duplicate" };
  if (seen === "full") return FULL;
  const drift = Date.parse(c.now) - Date.parse(env.ts);
  if (Number.isNaN(drift) || drift < -SKEW_AHEAD_MS || drift > MAILBOX_WINDOW_MS) return { ...out, refusal: "stale", local_signal: true };
  if (env.to !== undefined && env.to !== c.receive_as) return { ...out, refusal: "misaddressed", local_signal: true };
  const admission = c.admission ?? "allow";
  // §7.2: the CONTEXT_TOO_LARGE answer waits for admission.
  if (measured(env.payload) > SIZE_CAP)
    return { ...out, refusal: "too large", local_signal: true, ...(admission === "allow" ? { reply: "CONTEXT_TOO_LARGE" } : {}) };

  // §6.2 and EXT-6: the sender's standing, then admission. A refused reverse
  // lookup is not an answer that the key has no card: the email is a knock.
  const standing = c.standing ?? { vouched: true };
  if (!standing.vouched && standing.reverse_lookup === "refused")
    return { ...out, outcome: "knock", reaches_model: false, held_attempt_report: "recorded" };
  if (!standing.vouched && standing.reverse_lookup === "no card")
    return { ...out, admission_tier: "anonymous", reaches_model: false };
  // §7.4: a knock never reaches the agent, and every knock gets the same answer.
  if (env.type === "request" && env.payload?.offering === "knock")
    return { deliver: "as a knock", reaches_model: false, held_attempt_report: "recorded", reply: "a signed respond in the same thread" };
  if (admission !== "allow") return { ...out, outcome: admission, reaches_model: false, held_attempt_report: "recorded" };

  const result = { deliver: true, mode: "native", acted_on: "the envelope", state: stateOf(env) };
  if (env.task_id) result.task = env.task_id;
  // §3.5: hint headers never change what is done.
  const hintType = header(mail.headers, "agent-messaging-type");
  const hintCtx = header(mail.headers, "agent-messaging-context");
  if ((hintType && hintType !== env.type) || (hintCtx && hintCtx !== env.context_id)) {
    result.acted_on = `the envelope, as type ${env.type}`; result.local_signal = true;
  }
  if (env.type === "request") result.reply = "the agent's own answer";
  else {
    result.reply = "none"; result.correlates_to = env.in_reply_to;
    if (env.payload?.output !== undefined) result.output = env.payload.output;
    // §3.3: the amount a respond reports is payload.price.
    if (env.payload?.price) result.price_stated = money(env.payload.price);
  }

  // §3.4: resolve cid: references inside this email, checking size and digest.
  const refs = [...(env.payload?.files ?? []), ...(env.artifacts ?? []).flatMap((a) => a.parts ?? [])].filter((r) => r.ref?.startsWith("cid:"));
  if (refs.length) {
    result.files = {};
    for (const r of refs) {
      const part = parts(mail).find((p) => (header(p.headers, "content-id") ?? "") === `<${r.ref.slice(4)}>`);
      const ok = part && part.bytes.length === r.size && `sha256:${sha256hex(part.bytes)}` === r.digest;
      result.files[r.name] = !part ? "unresolvable" : ok ? "verified" : "digest_mismatch";
    }
  }

  // §3.3: what software that shows the text to a person concludes. The agent
  // never reads the text; this check is the mail program's.
  if (c.expect.person_view) {
    const handle = CARDS.cards[env.from]?.card.handle;
    result.person_view = checkHuman(mail, env, handle).matches ? "matches" : "warn: the text does not match the signed message";
  }
  return result;
}

// ── compare ─────────────────────────────────────────────────────────────────
const sub = (want, got) => Object.entries(want).every(([k, v]) =>
  v && typeof v === "object" ? got?.[k] && sub(v, got[k]) : got?.[k] === v);

let failed = 0;
for (const c of CASES.cases) {
  memory.clear();
  if (c.after) receive(CASES.cases.find((x) => x.id === c.after));
  const got = receive(c);
  const ok = sub(c.expect, got);
  if (!ok) failed++;
  console.log(`${ok ? "pass" : "FAIL"}  ${c.id}  ${c.fixture}${ok ? "" : `\n      expected ${JSON.stringify(c.expect)}\n      got      ${JSON.stringify(got)}`}`);
}
console.log(failed ? `${failed} case(s) failed` : `all ${CASES.cases.length} cases pass`);
process.exit(failed ? 1 : 0);
