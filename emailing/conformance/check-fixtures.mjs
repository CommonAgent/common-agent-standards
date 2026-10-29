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
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { verifyEnvelope, sha256hex } from "./lib.mjs";
import { parseMail, leaves, header, stateOf, checkHuman } from "./mail.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
// Run from tools/ in the source folder, or from conformance/ on the site.
const CONF = HERE.endsWith("conformance") ? HERE : resolve(HERE, "../conformance");
const CASES = JSON.parse(readFileSync(resolve(CONF, "cases.json"), "utf8"));
const CARDS = JSON.parse(readFileSync(resolve(CONF, "cards.json"), "utf8"));
const MEDIA = CASES.envelope_media_type;
const MAILBOX_WINDOW_MS = 7 * 24 * 3600 * 1000; // Agent Messaging §22.3, mailbox max_age
const SKEW_AHEAD_MS = 5 * 60 * 1000;              // Agent Messaging §22.3, max_clock_skew_ahead

const memory = new Set();

function receive(c) {
  const mail = parseMail(readFileSync(resolve(CONF, "fixtures", c.fixture), "utf8"));
  const out = { deliver: false, reply: "none" };

  // §8: a delivery status notification answers a message we sent. The sender
  // looks the request up by the Message-ID it recorded at send time.
  if (mail.type === "multipart/report") {
    const dsn = leaves(mail).find((p) => p.type === "message/delivery-status").bytes.toString("utf8");
    const status = (dsn.match(/^Status:\s*(\S+)/m) ?? [])[1];
    const orig = leaves(mail).find((p) => p.type === "text/rfc822-headers").bytes.toString("utf8");
    const msgid = (orig.match(/^Message-ID:\s*(\S+)/mi) ?? [])[1];
    const sent = { "<a7f3c9e1.20261029161403@agents.example.org>": CASES.envelopes.request.envelope.id };
    out.outcome_for_request = { request: sent[msgid], outcome: status?.startsWith("5") ? "undeliverable" : "deferred", status };
    return out;
  }

  const auto = (header(mail.headers, "auto-submitted") ?? "no").toLowerCase();
  const envParts = leaves(mail).filter((p) => p.type === MEDIA);
  if (envParts.length > 1) return { ...out, refusal: "more than one envelope part", local_signal: true };
  if (envParts.length === 0) {
    // §7.3: never act on automatic replies.
    if (auto !== "no") return { ...out, refusal: "automatic reply" };
    // §4.2: a bridge may host an identity only on an aligned DMARC pass.
    const a = c.carrier_auth ?? {};
    const aligned = a.dmarc === "pass" && (a.dkim ?? []).some((d) => d.result === "pass" && d.aligned);
    if (c.role === "bridge" && aligned) {
      const from = header(mail.headers, "from").match(/<([^>]+)>/)[1].toLowerCase();
      return { deliver: "as a bridged request", mode: "bridged",
        identity_bridge: { front: "email", caller_kind: "email", caller_ref: sha256hex(Buffer.from(from, "utf8")) },
        admission_tier: "bridged", default_stance: "hold" };
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
  // mailbox window; then §22.4, byte for byte.
  const key = `${env.from}\n${env.id}`;
  const seen = memory.has(key); memory.add(key);
  if (seen) return { ...out, refusal: "duplicate" };
  const drift = Date.parse(c.now) - Date.parse(env.ts);
  if (Number.isNaN(drift) || drift < -SKEW_AHEAD_MS || drift > MAILBOX_WINDOW_MS) return { ...out, refusal: "stale", local_signal: true };
  if (env.to !== undefined && env.to !== c.receive_as) return { ...out, refusal: "misaddressed", local_signal: true };

  const result = { deliver: true, mode: "native", acted_on: "the envelope", state: stateOf(env) };
  if (env.task_id) result.task = env.task_id;
  // §3.5: hint headers never change what is done.
  const hintType = header(mail.headers, "agent-messaging-type");
  const hintCtx = header(mail.headers, "agent-messaging-context");
  if ((hintType && hintType !== env.type) || (hintCtx && hintCtx !== env.context_id)) {
    result.acted_on = `the envelope, as type ${env.type}`; result.local_signal = true;
  }
  if (env.type === "request") result.reply = "the agent's own answer";
  else { result.reply = "none"; result.correlates_to = env.in_reply_to; }

  // §3.4: resolve cid: references inside this email, checking size and digest.
  const refs = [...(env.payload?.files ?? []), ...(env.artifacts ?? []).flatMap((a) => a.parts ?? [])].filter((r) => r.ref?.startsWith("cid:"));
  if (refs.length) {
    result.files = {};
    for (const r of refs) {
      const part = leaves(mail).find((p) => (header(p.headers, "content-id") ?? "") === `<${r.ref.slice(4)}>`);
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
