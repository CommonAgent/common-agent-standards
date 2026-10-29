// example.mjs: the example page's mail views, built from the conformance
// fixtures.
//
// Every badge on the page is earned here, at build time, passed or failed. The
// build parses each fixture, verifies its envelope (Agent Messaging §5.3),
// verifies the sender's name card (SPEC.md §5.1, §6.2), checks the human part
// and the subject (§3.3) and every file's digest (§3.4), and renders each
// badge in the state its check actually reached. If a fixture does not reach
// the state the page describes, the build stops, so the page can never show a
// badge its fixture does not earn.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { verifyEnvelope, sha256hex } from "../../conformance/lib.mjs";
import { parseMail, leaves, header, decodeWords, stateOf, cap, checkHuman, verifyCard, money, MEDIA, EMAILING_VERSION } from "../../conformance/mail.mjs";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const svg = (paths, cls = "bi") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths}</svg>`;
const ICON = {
  check: svg(`<path d="M20 6 9 17l-5-5"/>`),
  x: svg(`<path d="M18 6 6 18"/><path d="m6 6 12 12"/>`),
  shield: svg(`<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>`),
  shieldx: svg(`<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m14.5 9.5-5 5"/><path d="m9.5 9.5 5 5"/>`),
  card: svg(`<rect width="20" height="14" x="2" y="5" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M14 10h4M14 14h3"/>`),
  doc: svg(`<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v5h6"/><path d="M9 13h6M9 17h4"/>`),
  warn: svg(`<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>`),
  clip: svg(`<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>`),
  seal: svg(`<path d="M12 2l2.4 1.8 3-.2.9 2.9 2.5 1.7-1 2.8 1 2.8-2.5 1.7-.9 2.9-3-.2L12 22l-2.4-1.8-3 .2-.9-2.9-2.5-1.7 1-2.8-1-2.8 2.5-1.7.9-2.9 3 .2z"/><path d="m8.8 12.2 2.2 2.2 4.4-4.6"/>`),
  mail: svg(`<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>`),
  ban: svg(`<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>`),
};
const STATE_CLASS = { done: "st-done", "needs your input": "st-input", request: "st-request", answer: "st-answer", declined: "st-fail", failed: "st-fail", cancel: "st-fail" };

const timeOf = (iso) => new Intl.DateTimeFormat("en-GB", { timeZone: "America/Denver", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(iso));
const dayOf = (iso) => new Intl.DateTimeFormat("en-GB", { timeZone: "America/Denver", weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
const dateHeaderTime = (d) => { const t = Date.parse(d); return Number.isNaN(t) ? null : new Date(t).toISOString(); };
const addrOf = (h) => (h.match(/<([^>]+)>/) ?? [, h])[1];
const nameOf = (h) => (h.match(/^"?([^"<]+?)"?\s*</) ?? [, h])[1];
const initials = (n) => n.replace(/'s\b/g, "").split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

/** Parse and check one fixture: every check, whether it passed or failed. */
export function inspect(root, file) {
  const raw = readFileSync(resolve(root, "conformance/fixtures", file), "utf8");
  const mail = parseMail(raw);
  const cards = JSON.parse(readFileSync(resolve(root, "conformance/cards.json"), "utf8"));
  const envPart = leaves(mail).filter((p) => p.type === MEDIA);
  const env = envPart.length === 1 ? JSON.parse(envPart[0].bytes.toString("utf8")) : null;
  const sig = Boolean(env) && verifyEnvelope(env);
  const from = header(mail.headers, "from");
  const resp = env ? cards.cards[env.from] : null;
  const claimed = resp?.card.handle ?? null;
  const cardOk = Boolean(env) && verifyCard(resp, cards.key_set, env.from, addrOf(from), env.ts);
  const cardAddresses = (resp?.card.endpoints ?? []).filter((e) => e.protocol === "email").map((e) => e.address);
  const human = env ? checkHuman(mail, env, claimed) : null;
  const refs = env ? [...(env.payload?.files ?? []), ...(env.artifacts ?? []).flatMap((a) => a.parts ?? [])].filter((r) => r.ref?.startsWith("cid:")) : [];
  const files = refs.map((r) => {
    const part = leaves(mail).find((p) => (header(p.headers, "content-id") ?? "") === `<${r.ref.slice(4)}>`);
    const match = Boolean(part) && part.bytes.length === r.size && `sha256:${sha256hex(part.bytes)}` === r.digest;
    return { name: r.name, type: r.media_type, size: r.size, verified: sig && match };
  });
  return {
    file, raw, mail, env, sig, from, to: header(mail.headers, "to"),
    when: dateHeaderTime(header(mail.headers, "date")) ?? env?.ts,
    subject: decodeWords(header(mail.headers, "subject")),
    version: sig && env.meta?.agent_emailing?.v === EMAILING_VERSION,
    claimed, cardOk, cardAddresses, human, files,
    textOk: sig && Boolean(human?.matches),
    state: sig ? stateOf(env) : null,
  };
}

// ── badges: an icon tile joined to a label ──────────────────────────────────
const tile = (kind, icon, label) => `<span class="tb ${kind}"><span class="tb-i">${ICON[icon]}</span><span class="tb-t">${esc(label)}</span></span>`;
export const versionShield = (ok = true) => ok
  ? `<span class="shield"><span class="sh-l">${ICON.seal}Agent Emailing</span><span class="sh-r">${EMAILING_VERSION}</span></span>`
  : `<span class="shield bad"><span class="sh-l">${ICON.seal}Agent Emailing</span><span class="sh-r">not verified</span></span>`;
export const stateBadge = (state) => state ? `<span class="state ${STATE_CLASS[state] ?? ""}">${esc(cap(state))}</span>` : "";
const failState = `<span class="state st-fail">Fail</span>`;

function badges(m) {
  const out = [versionShield(m.version)];
  out.push(m.sig ? tile("ok", "shield", "Signature verified") : tile("bad", "shieldx", "Signature does not verify"));
  out.push(m.cardOk ? tile("ok", "card", `Sender: ${m.claimed}, name card verified`)
    : tile("bad", "x", m.claimed ? `Sender does not match the name card of ${m.claimed}` : "No name card for this sender"));
  out.push(m.textOk ? tile("ok", "doc", "Text matches the signed message")
    : tile(m.sig ? "warn" : "bad", m.sig ? "warn" : "x", "Text does not match the signed message"));
  return out.join("");
}

// ── the human part as a table, with the plain text folded beneath ───────────
const LABELS = ["Asked for", "Message", "Handed over", "Price", "Answer needed by", "What happens next", "Outcome", "Result", "Needed from you", "Files returned"];
const FIRST = /^(Request|Answer to a question|Cancellation|Answer) from (.+?)(?:, acting for (.+?),)? to (.+?)(?:, about (.+))?\.$/;
function factsTable(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const cut = lines.indexOf("--");
  const main = (cut < 0 ? lines : lines.slice(0, cut)).filter((l) => l.trim() !== "");
  const rows = [];
  const first = main[0]?.match(FIRST);
  if (first) {
    rows.push(["Kind", first[1]], ["From", first[2]]);
    if (first[3]) rows.push(["For", first[3]]);
    rows.push(["To", first[4]]);
  } else if (main[0]) rows.push(["Summary", main[0]]);
  for (const l of main.slice(first ? 1 : 1)) {
    const i = l.indexOf(": ");
    const k = i > 0 ? l.slice(0, i) : "";
    if (LABELS.includes(k)) rows.push([k, l.slice(i + 2)]);
    else rows.push(["", l]);
  }
  const cls = (k, v) => k === "Outcome" ? ` class="v-outcome ${STATE_CLASS[v.toLowerCase()] ?? ""}"` : k === "What happens next" ? ' class="v-next"' : "";
  return `<dl class="facts">${rows.map(([k, v]) => `<div class="f-row"><dt>${esc(k)}</dt><dd${cls(k, v)}>${k === "Outcome" ? `<span class="state ${STATE_CLASS[v.toLowerCase()] ?? ""}">${esc(v)}</span>` : esc(v)}</dd></div>`).join("")}</dl>`;
}
const plainFold = (m) => `<details class="plain-fold"><summary>Plain text as sent</summary><pre>${esc(m.human.text.replace(/\r\n/g, "\n").replace(/\n+$/, ""))}</pre></details>`;

const kb = (n) => (n < 1024 ? `${n} bytes` : `${(n / 1024).toFixed(1)} KB`);
function chips(m) {
  const files = m.files.map((f) => `<span class="chip-file">${ICON.clip}<span class="cf-name">${esc(f.name)}</span><span class="cf-meta">${esc(f.type)}, ${kb(f.size)}</span>${f.verified
    ? `<span class="cf-ok">${ICON.check}<span>digest verified</span></span>` : `<span class="cf-bad">${ICON.x}<span>not verified</span></span>`}</span>`);
  files.push(`<span class="chip-file env">${ICON.seal}<span class="cf-name">envelope.json</span><span class="cf-meta">the signed message</span></span>`);
  return `<div class="msg-files">${files.join("")}</div>`;
}

function messageCard(m, { failed = false } = {}) {
  const who = nameOf(m.from);
  return `<article class="msg${failed ? " msg-fail" : ""}">
          <header class="msg-head">
            <span class="avatar ${failed ? "av-x" : who.startsWith("Ana") ? "av-a" : "av-b"}" aria-hidden="true">${esc(initials(who))}</span>
            <div class="msg-who">
              <p class="msg-from"><b>${esc(who)}</b> <span class="addr">&lt;${esc(addrOf(m.from))}&gt;</span></p>
              <p class="msg-to">to ${esc(nameOf(m.to))}</p>
            </div>
            <p class="msg-time"><time datetime="${esc(m.when)}">${esc(dayOf(m.when))}, ${esc(timeOf(m.when))}</time></p>
          </header>
          <p class="msg-subj">${esc(m.subject)} ${failed ? failState : stateBadge(m.state)}</p>
          <div class="msg-badges" aria-label="What checking software found">${badges(m)}</div>
          <div class="msg-body">${factsTable(m.human.text)}${plainFold(m)}</div>
          ${chips(m)}
        </article>`;
}

function listRow(m, { on = false, preview, sent = false }) {
  const who = nameOf(m.from);
  return `<li class="mc-row${on ? " on" : ""}">
              <span class="avatar sm ${who.startsWith("Ana") ? "av-a" : "av-b"}" aria-hidden="true">${esc(initials(who))}</span>
              <div class="mc-r">
                <p class="mc-who"><b>${esc(sent ? `To: ${nameOf(m.to)}` : who)}</b><time>${esc(timeOf(m.when))}</time></p>
                <p class="mc-subj">${esc(m.subject)}</p>
                <p class="mc-prev">${esc(preview)}</p>
                <p class="mc-tags">${stateBadge(m.state)}${m.sig && m.textOk && m.cardOk ? `<span class="mini-ok">${ICON.check}checked</span>` : ""}</p>
              </div>
            </li>`;
}

const bar = (mailbox, address) => `<div class="mc-bar">
          <span class="mc-mbox">${ICON.mail}<span><b>${esc(mailbox)}</b> <span class="addr">${esc(address)}</span></span></span>
          <span class="mc-seal">${ICON.seal}<span>Checked for Agent Emailing</span></span>
        </div>`;

function must(cond, what) { if (!cond) throw new Error(`example: ${what}`); }

export function exampleSections(root) {
  const thread = ["01-request.eml", "02-respond-input.eml", "03-request-answer.eml", "04-respond-done.eml"].map((f) => inspect(root, f));
  for (const m of thread) must(m.sig && m.version && m.cardOk && m.textOk && m.files.every((f) => f.verified), `${m.file} does not pass every check`);
  const [m1, m2, m3, m4] = thread;
  const mm = inspect(root, "16-text-mismatch.eml");
  must(mm.sig && mm.cardOk && !mm.textOk, "16-text-mismatch.eml should verify, match its card, and fail the text check");
  const fx = inspect(root, "17-forged.eml");
  must(!fx.sig && !fx.cardOk && !fx.human.matches, "17-forged.eml should fail the signature, the name card and the text checks");

  const preview = (m) => m.env.payload?.text ?? "";
  const client = `<div class="mc" role="figure" aria-label="The four emails as they appear in the mailbox scheduler@agents.example.org">
        ${bar("Ana's scheduling agent", "scheduler@agents.example.org")}
        <div class="mc-grid">
          <nav class="mc-list" aria-label="Mailbox">
            <p class="mc-folder">Inbox <span>Times are Mountain time</span></p>
            <ul>
              ${listRow(m4, { on: true, preview: preview(m4) })}
              ${listRow(m2, { preview: preview(m2) })}
              <li class="mc-row">
                <span class="avatar sm av-c" aria-hidden="true">PD</span>
                <div class="mc-r">
                  <p class="mc-who"><b>Pat Doe</b><time>09:02</time></p>
                  <p class="mc-subj">Lunch on Friday?</p>
                  <p class="mc-prev">Are you free for lunch on Friday? The usual place at noon.</p>
                  <p class="mc-tags"><span class="plain-tag">Ordinary email</span></p>
                </div>
              </li>
            </ul>
            <p class="mc-folder">Sent</p>
            <ul>
              ${listRow(m3, { preview: preview(m3), sent: true })}
              ${listRow(m1, { preview: preview(m1), sent: true })}
            </ul>
          </nav>
          <section class="mc-thread" aria-label="The open thread">
            <div class="mc-thread-head">
              <h3>Book a meeting</h3>
              ${stateBadge(m4.state)}
              <span class="mc-count">4 messages, ${esc(dayOf(m1.when))}</span>
            </div>
            ${thread.map((m) => messageCard(m)).join("\n            ")}
          </section>
        </div>
      </div>`;

  // The text mismatch: a good signature, a text that is not the signed one.
  const e = mm.env;
  const said = [
    `<li><span class="lbl">Message:</span> ${esc(e.payload.text)}</li>`,
    ...(e.budget?.cost_ceiling ? [`<li><span class="lbl">Price:</span> up to ${esc(money(e.budget.cost_ceiling))}</li>`] : []),
    `<li><span class="lbl">Handed over:</span> ${esc(e.payload.files.map((f) => f.name).join(", "))}</li>`,
  ].join("");
  const gives = mm.human.missing;
  const why = [!mm.human.digest_ok && "The text is not the one the sender signed.",
    gives.length && `It does not give ${gives.length > 1 ? gives.slice(0, -1).join(", ") + " or " + gives.at(-1) : gives[0]} as the envelope does.`].filter(Boolean).join(" ");
  const mismatch = `<div class="mc single" role="figure" aria-label="An email whose text does not match its signed message">
        ${bar("Bookings desk agent", "bookings-agent@mail.example.com")}
        <section class="mc-thread">
          <div class="warnbox" role="note">
            <p class="wb-title">${ICON.warn}<b>This text differs from the message the sender signed.</b></p>
            <p>${esc(why)} Agents act only on the signed message, so the bookings agent will book what the envelope asks for. The signed message says:</p>
            <ul>${said}</ul>
          </div>
          ${messageCard(mm)}
        </section>
      </div>`;

  // The forgery: every failed check, in plain words, computed from the fixture.
  const fails = [];
  if (!fx.sig) fails.push(["Signature does not verify",
    `The signed message was changed after it was signed, or the key it names never signed it. Nothing in it can be relied on: not the sender, not the request, not the price.`]);
  if (!fx.cardOk) fails.push(["Sender does not match the name card",
    fx.claimed
      ? `It claims to come from ${fx.claimed}, whose verified name card lists ${fx.cardAddresses.join(", ")}. This email came from ${addrOf(fx.from)}, which is not on that card.`
      : `No verified name card names the key this email claims to come from.`]);
  if (!fx.human.matches) fails.push(["Text does not match the signed message",
    `The text a person would read is not the text the sender signed. It asks for things the original request did not.`]);
  const forged = `<div class="mc single fail" role="figure" aria-label="An email that fails the trust checks">
        ${bar("Bookings desk agent", "bookings-agent@mail.example.com")}
        <div class="failbar" role="alert">
          <p class="fb-title">${ICON.ban}<span><b>FAIL:</b> do not trust this email</span></p>
          <ol class="fb-list">${fails.map(([t, d]) => `<li><b>${esc(t)}.</b> ${esc(d)}</li>`).join("")}</ol>
          <p class="fb-what"><b>What happens.</b> A conforming agent refuses this email and does not answer it, so nothing is booked and nothing is charged. Software that checks Agent Emailing shows this warning instead of the badges of a good email.</p>
        </div>
        <section class="mc-thread">
          ${messageCard(fx, { failed: true })}
        </section>
      </div>`;

  const li = (badge, text) => `<li><span class="lg-b">${badge}</span><p>${text}</p></li>`;
  const legend = `<ul class="legend-list">
            ${li(versionShield(true), "The email carries exactly one signed envelope, and its signed summary names this version (<a href=\"spec.html#3-3-the-human-part-and-the-subject\">section 3.3</a>).")}
            ${li(tile("ok", "shield", "Signature verified"), "The envelope's signature verifies against the key that sent it (Agent Messaging §5.3, <a href=\"spec.html#6-1-the-envelope-is-authoritative\">section 6.1</a>).")}
            ${li(tile("ok", "card", "Sender: handle, name card verified"), "The sender's name card is signed by its registrar, is valid at the time of the email, binds the key that signed it, and lists the address it came from (<a href=\"spec.html#5-1-the-email-endpoint-on-a-name-card\">section 5.1</a>).")}
            ${li(tile("ok", "doc", "Text matches the signed message"), "The text and the subject are exactly the ones the sender signed, and the text states the sender, what was asked, every file, the outcome and the price as the envelope gives them (<a href=\"spec.html#3-3-the-human-part-and-the-subject\">section 3.3</a>).")}
            ${li(`<span class="badges-row">${stateBadge("request")}${stateBadge("needs your input")}${stateBadge("answer")}${stateBadge("done")}</span>`, "The state, read from the signed envelope. The subject line carries the same word, so the inbox list tells the story on its own.")}
            ${li(tile("warn", "warn", "Text does not match the signed message"), "The signature is good, but the text a person would read is not what the sender signed. The software warns, and shows what the envelope says.")}
            ${li(`<span class="badges-row">${tile("bad", "shieldx", "Signature does not verify")}${failState}</span>`, "The email was changed after it was signed, or was never signed by the key it names. A conforming agent refuses it, and checking software shows it as a failure.")}
          </ul>`;
  return { client, mismatch, forged, legend };
}
