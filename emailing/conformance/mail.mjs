// mail.mjs: the email side of Agent Emailing, for the fixture generator, the
// reference checker and the site build.
//
// - A small MIME reader: multipart, base64, quoted-printable, folded headers and
//   RFC 2047 encoded words. It is not a mail library.
// - The human part and the subject of SPEC.md §3.3: generated from the
//   envelope, summarized in the envelope's signed meta, and checked the way a
//   mail program that shows the text to a person checks it.
// - Signing and verifying Personal Agent Naming cards (§5.3), which the
//   example's "name card verified" badge rests on.
import { createPublicKey, sign, verify } from "node:crypto";
import { keypairFromSeed, canonical, sha256hex } from "./lib.mjs";

export const EMAILING_VERSION = "0.3.0";
export const MEDIA = "application/vnd.agentmessaging.envelope+json";

// ── MIME ────────────────────────────────────────────────────────────────────
function splitHead(raw) {
  const i = raw.indexOf("\r\n\r\n");
  const head = i < 0 ? raw : raw.slice(0, i);
  const body = i < 0 ? "" : raw.slice(i + 4);
  const headers = [];
  for (const line of head.split("\r\n")) {
    if (/^[ \t]/.test(line) && headers.length) headers[headers.length - 1][1] += " " + line.trim();
    else { const c = line.indexOf(":"); if (c > 0) headers.push([line.slice(0, c).trim().toLowerCase(), line.slice(c + 1).trim()]); }
  }
  return { headers, body };
}
export const header = (h, name) => (h.find(([k]) => k === name) ?? [])[1];
const param = (value, name) => {
  const m = (value ?? "").match(new RegExp(`${name}="?([^";]+)"?`, "i"));
  return m ? m[1] : undefined;
};
function decodeQP(s) {
  const bytes = [];
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "=" && /^[0-9A-F]{2}$/i.test(s.slice(i + 1, i + 3))) { bytes.push(parseInt(s.slice(i + 1, i + 3), 16)); i += 2; }
    else bytes.push(...Buffer.from(s[i], "utf8"));
  }
  return Buffer.from(bytes);
}
function decodeBody(body, cte) {
  const enc = (cte ?? "7bit").toLowerCase();
  if (enc === "base64") return Buffer.from(body.replace(/\s+/g, ""), "base64");
  if (enc === "quoted-printable") return decodeQP(body.replace(/=\r\n/g, ""));
  return Buffer.from(body, "utf8");
}
export function parseMail(raw) {
  const { headers, body } = splitHead(raw);
  const type = header(headers, "content-type") ?? "text/plain";
  const node = { headers, type: type.split(";")[0].trim().toLowerCase(), parts: [] };
  if (node.type.startsWith("multipart/")) {
    const b = param(type, "boundary");
    for (const chunk of body.split(`--${b}`).slice(1)) {
      if (chunk.startsWith("--")) break;
      node.parts.push(parseMail(chunk.replace(/^\r\n/, "").replace(/\r\n$/, "")));
    }
  } else node.bytes = decodeBody(body, header(headers, "content-transfer-encoding"));
  return node;
}
export const leaves = (n) => (n.parts.length ? n.parts.flatMap(leaves) : [n]);

export function encodeWords(s) {
  if (/^[\x20-\x7e]*$/.test(s)) return s;
  return Buffer.from(s, "utf8").toString("base64").match(/.{1,60}/g).map((x) => `=?UTF-8?B?${x}?=`).join("\r\n ");
}
export function decodeWords(s) {
  return (s ?? "").replace(/=\?([^?]+)\?([BQ])\?([^?]*)\?=(\s+(?==\?))?/gi, (m, cs, enc, text) =>
    enc.toUpperCase() === "B" ? Buffer.from(text, "base64").toString("utf8") : decodeQP(text.replace(/_/g, " ")).toString("utf8"));
}

// ── states, the subject and the human part ──────────────────────────────────
const OUTCOME = {
  completed: "done", input_required: "needs your input", auth_required: "needs your input",
  rejected: "declined", failed: "failed", canceled: "canceled", exhausted: "stopped at its limit",
  submitted: "in progress", working: "in progress",
};
/** The state word of SPEC.md §3.3's subject table. */
export function stateOf(env) {
  if (env.type === "request") {
    if (env.payload?.offering === "task.cancel") return "cancel";
    return env.task_id ? "answer" : "request";
  }
  return OUTCOME[env.payload?.status] ?? "update";
}
export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const isSealed = (env) => env.payload?.v === "sealedpayload.v1";

export function subjectFor(env, offeringName) {
  const base = `${offeringName} — ${stateOf(env)}`;
  return env.type === "respond" || env.task_id ? `Re: ${base}` : base;
}

/** SPEC.md §3.3: decoded to Unicode, line endings made LF, trailing spaces and
 *  tabs removed from each line, trailing empty lines removed. */
export function normalizeText(text) {
  return text.replace(/\r\n?/g, "\n").split("\n").map((l) => l.replace(/[ \t]+$/, "")).join("\n").replace(/\n+$/, "");
}
export const textDigest = (text) => `sha256:${sha256hex(Buffer.from(normalizeText(text), "utf8"))}`;

export const money = (c) => `${(c.amount_micro / 1e6).toFixed(2)} ${c.currency}`;
export function when(iso, tz) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(iso));
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
  return `${p.weekday} ${p.day} ${p.month} ${p.year}, ${p.hour}:${p.minute} ${tz === "America/Denver" ? "Mountain time" : tz}`;
}
const fileLine = (f) => `${f.name ?? "a file"} (${f.media_type}, ${f.size} bytes)`;
const returnedFiles = (env) => (env.artifacts ?? []).flatMap((a) => (a.parts ?? []).filter((x) => x.ref));

const NEXT = {
  "needs your input": "Reply with what is asked for. The work waits for your answer.",
  declined: "Nothing will be done. You may ask another agent.",
  failed: "The work stopped. You may try again later.",
  canceled: "The work was stopped. Nothing more will happen.",
  "stopped at its limit": "The work reached its agreed limit. Files made so far are attached.",
  "in progress": "The work continues. Updates will arrive in this thread.",
};

/** The human part, generated from the envelope and from the facts the name
 *  cards state. ctx: { sender: { handle, actsFor }, receiver: { handle },
 *  offeringName, timeZone }. */
export function renderHuman(env, ctx) {
  const p = env.payload ?? {};
  const sealed = isSealed(env);
  const forWhom = ctx.sender.actsFor ? `, acting for ${ctx.sender.actsFor},` : "";
  const state = stateOf(env);
  const L = [];
  if (env.type === "request") {
    const kind = { request: "Request", answer: "Answer to a question", cancel: "Cancellation" }[state];
    L.push(`${kind} from ${ctx.sender.handle}${forWhom} to ${ctx.receiver.handle}.`, "");
    L.push(`Asked for: ${ctx.offeringName}`);
    if (sealed) L.push("Message: sealed. Only the receiving agent can read it.");
    else if (typeof p.text === "string") L.push(`Message: ${p.text}`);
    const files = sealed ? [] : p.files ?? [];
    L.push(`Handed over: ${files.length ? files.map(fileLine).join("; ") : sealed ? "anything attached is sealed" : "nothing"}`);
    if (env.budget?.cost_ceiling) L.push(`Price: up to ${money(env.budget.cost_ceiling)}`);
    if (env.budget?.deadline) L.push(`Answer needed by: ${when(env.budget.deadline, ctx.timeZone)}`);
    L.push(`What happens next: ${state === "answer"
      ? `${ctx.receiver.handle} continues the work with this answer. Its reply will arrive in this thread.`
      : state === "cancel" ? `${ctx.receiver.handle} stops the work and confirms in this thread.`
      : `${ctx.receiver.handle} will do the work or ask for what it needs. Its answer will arrive in this thread.`}`);
  } else {
    L.push(`Answer from ${ctx.sender.handle}${forWhom} to ${ctx.receiver.handle}, about ${ctx.offeringName}.`, "");
    L.push(`Outcome: ${cap(state)}`);
    if (sealed) L.push("Result: sealed. Only the receiving agent can read it.");
    else if (typeof p.text === "string") L.push(`Result: ${p.text}`);
    else if (env.error?.message) L.push(`Result: ${env.error.message}`);
    if (!sealed && Array.isArray(p.problems) && p.problems.length) L.push(`Needed from you: ${p.problems.map((x) => x.description).join(" ")}`);
    const files = sealed ? [] : returnedFiles(env);
    L.push(`Files returned: ${files.length ? files.map(fileLine).join("; ") : "none"}`);
    if (p.price) L.push(`Price: ${money(p.price)}`);
    L.push(`What happens next: ${state === "done"
      ? files.length ? "Nothing more is needed. Open the attached files to use the result." : "Nothing more is needed."
      : NEXT[state] ?? "Updates will arrive in this thread."}`);
  }
  L.push("", "--",
    "Generated from the signed Agent Emailing envelope (envelope.json).",
    "Agents act only on the envelope. Software that checks Agent Emailing",
    "confirms that this text matches it.");
  return L.join("\n");
}

/** Put the signed summary of SPEC.md §3.3 into an unsigned envelope's meta. */
export function withHuman(env, ctx) {
  const text = renderHuman(env, ctx);
  const subject = subjectFor(env, ctx.offeringName);
  const meta = { ...(env.meta ?? {}), agent_emailing: { v: EMAILING_VERSION, offering_name: ctx.offeringName, subject, human_text: textDigest(text) } };
  return { env: { ...env, meta }, text, subject };
}

/** What software that shows the human part to a person checks (SPEC.md §3.3). */
export function checkHuman(mail, env, senderHandle) {
  const ae = env.meta?.agent_emailing ?? {};
  const textPart = leaves(mail).find((p) => p.type === "text/plain");
  const text = textPart ? textPart.bytes.toString("utf8") : "";
  const norm = normalizeText(text);
  const subject = decodeWords(header(mail.headers, "subject"));
  const missing = [];
  const need = (v, what) => { if (v && !norm.includes(v)) missing.push(what); };
  const p = env.payload ?? {};
  need(senderHandle, "the sender");
  need(ae.offering_name, "what was asked");
  if (!isSealed(env)) {
    need(typeof p.text === "string" ? p.text : null, "the message");
    for (const f of p.files ?? []) need(f.name, `the file ${f.name}`);
    for (const x of returnedFiles(env)) need(x.name, `the file ${x.name}`);
  }
  if (env.type === "respond") need(`Outcome: ${cap(stateOf(env))}`, "the outcome");
  if (env.budget?.cost_ceiling) need(money(env.budget.cost_ceiling), "the price");
  if (!isSealed(env) && p.price) need(money(p.price), "the price");
  const digest_ok = Boolean(textPart) && ae.human_text === textDigest(text);
  const subject_ok = Boolean(ae.subject) && ae.subject === subject;
  return { digest_ok, subject_ok, facts_ok: !missing.length, missing, matches: digest_ok && subject_ok && !missing.length, text, subject };
}

// ── name cards ──────────────────────────────────────────────────────────────
export function registrarFromSeed(seed) {
  const kp = keypairFromSeed(seed);
  const key = Buffer.from(kp.pub).toString("base64url");
  return { ...kp, key, kid: sha256hex(Buffer.from(key, "utf8")).slice(0, 12) };
}
export function signCard(card, reg) {
  return { card, registrar_key: reg.key, registrar_kid: reg.kid,
    registrar_sig: sign(null, Buffer.from(canonical(card), "utf8"), reg.priv).toString("base64") };
}
/** True when the card verifies under a key of the registrar's key set, is
 *  valid at `at`, binds `agentId`, and lists `address` as an email endpoint. */
export function verifyCard(resp, keySet, agentId, address, at) {
  if (!resp || !keySet.some((k) => k.key === resp.registrar_key && k.kid === resp.registrar_kid)) return false;
  const pub = createPublicKey({ key: Buffer.concat([Buffer.from("302a300506032b6570032100", "hex"), Buffer.from(resp.registrar_key, "base64url")]), format: "der", type: "spki" });
  if (!verify(null, Buffer.from(canonical(resp.card), "utf8"), pub, Buffer.from(resp.registrar_sig, "base64"))) return false;
  const c = resp.card, t = Date.parse(at);
  if (!(Date.parse(c.issued_at) <= t + 60000 && t <= Date.parse(c.expires_at) + 60000)) return false;
  if (!String(c.binding ?? "").startsWith("agent-key")) return false;
  if (!(c.endpoints ?? []).some((e) => e.protocol === "agentmesh" && e.agent_id === agentId)) return false;
  if (address && !(c.endpoints ?? []).some((e) => e.protocol === "email" && e.address.toLowerCase() === address.toLowerCase())) return false;
  return true;
}
