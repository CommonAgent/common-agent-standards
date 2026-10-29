#!/usr/bin/env node
// The quote story over email (Agent Emailing), between two Agent Emailing
// Servers joined by its loopback network: mail is rendered to raw MIME and
// parsed again on arrival, as a real carrier carries it.
//
//   node lane-email.mjs --aes <agent-emailing-server checkout, built> [--out results/<run>-email.json]
//
// Writes the transcript check.mjs reads.
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import * as S from "./story.mjs";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : d; };
const AES = arg("aes");
if (!AES) { console.error("needs --aes <agent-emailing-server checkout, built>"); process.exit(2); }
const OUT = arg("out", `results/${new Date().toISOString().slice(0, 10)}-email.json`);
const ae = await import(pathToFileURL(resolve(AES, "dist/index.js")).href);
const { AgentEmailServer, LoopbackNetwork, StaticCardResolver, createAgentKey, createRegistrarKey, signCard, renderHuman, parseMail, leaves, filenameOf, contentId, header, decodeWords, parseMessageIds, ENVELOPE_MEDIA_TYPE } = ae;

const net = new LoopbackNetwork();
const dir = mkdtempSync(join(tmpdir(), "xt-email-"));
const bKey = createAgentKey(), sKey = createAgentKey(), reg = createRegistrarKey();
const ADDR = { buyer: "purchasing@agents.example.org", supplier: "sales-agent@mail.example.com" };
const now = Date.now();
const mkCard = (key, handle, operator, address) => signCard({
  handle, operator: { name: operator }, binding: "agent-key", endpoints: [{ protocol: "agentmesh", agent_id: key.id }, { protocol: "email", address }],
  registrar: "https://registrar.example.net", issued_at: new Date(now - 60_000).toISOString(), expires_at: new Date(now + 3 * 3600_000).toISOString(),
}, reg);
const cards = new StaticCardResolver({
  [bKey.id]: mkCard(bKey, S.HANDLES.buyer, S.ACTS_FOR.buyer, ADDR.buyer),
  [sKey.id]: mkCard(sKey, S.HANDLES.supplier, S.ACTS_FOR.supplier, ADDR.supplier),
}, [{ kid: reg.kid, key: reg.key, status: "current" }]);
const got = { buyer: [], supplier: [] };
const supplier = new AgentEmailServer({
  agent: { key: sKey, address: ADDR.supplier, handle: S.HANDLES.supplier, actsFor: S.ACTS_FOR.supplier, name: "Sales agent", offerings: { [S.OFFERING]: S.OFFERING_NAME }, timeZone: "America/Denver" },
  carrier: net.mailbox(ADDR.supplier), stateDir: join(dir, "supplier"), cards, roster: { contacts: [bKey.id] }, log: () => {},
  deliver: async (d) => {
    got.supplier.push(d);
    if (d.kind !== "request") return;
    if (!d.envelope.task_id) return { status: "input_required", text: S.QUESTION, problems: [{ input: "split_delivery", problem: "missing", description: "Is a split delivery fine?", expected: "true or false" }] };
    return { status: "completed", text: S.QUOTE_TEXT, price: S.PRICE, output: S.QUOTE_OUTPUT, files: [{ name: S.FILES.done.name, media_type: S.FILES.done.media_type, bytes: S.FILES.done.bytes }] };
  },
});
const buyer = new AgentEmailServer({
  agent: { key: bKey, address: ADDR.buyer, handle: S.HANDLES.buyer, actsFor: S.ACTS_FOR.buyer, name: "Purchasing agent", timeZone: "America/Denver" },
  carrier: net.mailbox(ADDR.buyer), stateDir: join(dir, "buyer"), cards, roster: { contacts: [sKey.id] }, log: () => {},
  deliver: async (d) => { got.buyer.push(d); },
});

try {
  await supplier.start();
  await buyer.start();
  const budget = { deadline: new Date(Date.now() + 3 * 24 * 3600_000).toISOString().replace(/\.\d+Z$/, "Z"), revision: 0, cost_ceiling: S.BUDGET_CEILING };
  await buyer.request({ to: sKey.id, offering: S.OFFERING, offering_name: S.OFFERING_NAME, text: S.ASK_TEXT, input: S.ASK_INPUT, files: [{ name: S.FILES.request.name, media_type: S.FILES.request.media_type, bytes: S.FILES.request.bytes }], budget });
  await net.settle();
  const taskId = got.buyer[0]?.envelope?.task_id;
  await buyer.request({ to: sKey.id, offering: S.OFFERING, task_id: taskId, text: S.ANSWER_TEXT, input: S.ANSWER_INPUT });
  await net.settle();

  // The forged quote: email 4, its price raised after signing, sent again from the supplier's mailbox.
  const doneRaw = net.log[3]?.raw;
  const doneEnv = got.buyer[1]?.envelope;
  const forged = S.forge(doneEnv);
  const m = parseMail(doneRaw);
  const atts = leaves(m).filter((x) => filenameOf(x)).map((x) => ({ filename: filenameOf(x), contentType: x.type, contentId: contentId(x), bytes: x.type === ENVELOPE_MEDIA_TYPE ? Buffer.from(JSON.stringify(forged)) : x.bytes }));
  const text = renderHuman(forged, { sender: { handle: S.HANDLES.supplier, actsFor: S.ACTS_FOR.supplier }, receiver: { handle: S.HANDLES.buyer }, offeringName: S.OFFERING_NAME, timeZone: "America/Denver" });
  const before = got.buyer.length;
  await net.mailbox(ADDR.supplier).send({ from: ADDR.supplier, to: [ADDR.buyer], subject: decodeWords(header(m, "subject")), text, attachments: atts, inReplyTo: parseMessageIds(header(m, "in-reply-to"))[0], references: parseMessageIds(header(m, "references")) });
  await net.settle();
  const refused = got.buyer.length === before && buyer.signals.some((s) => /signature does not verify/.test(s.text));

  const transcript = {
    transport: "email",
    environment: "two Agent Emailing Servers on a loopback network (raw MIME, rendered and parsed again)",
    run_at: new Date().toISOString(),
    parties: { buyer: bKey.id, supplier: sKey.id },
    messages: [got.supplier[0]?.envelope, got.buyer[0]?.envelope, got.supplier[1]?.envelope, got.buyer[1]?.envelope],
    buyer_view: got.buyer.slice(0, 2).map((d) => d.task?.state),
    forged: { envelope: forged, refused, how: "the buyer's server refused it silently: the signature does not verify (Agent Emailing §4.4)" },
  };
  writeFileSync(OUT, JSON.stringify(transcript, null, 2) + "\n");
  console.log(`wrote ${OUT}`);
} finally {
  await buyer.close().catch(() => {});
  await supplier.close().catch(() => {});
  rmSync(dir, { recursive: true, force: true });
}
