/**
 * The quote story over a message broker (Agent Messaging) and over HTTPS (the
 * A2A Bridge, with Agent Messaging over A2A), against one supplier agent.
 *
 * Runs on a mesh host, from an Agent Messaging Server release's a2a-gateway
 * folder (0.4.6 or later), with story.mjs beside it:
 *
 *   A2A_KEY=<a gateway key> A2A_PUBLIC=https://<gateway> MESH_URL=ws://localhost:4443 \
 *   NODE_CREDS=<a node credential that may host agents> npx tsx lane-broker-a2a.ts
 *
 * The supplier is a throwaway test agent, hosted for the run and deregistered
 * at the end. Each buyer is a throwaway key that signs its own envelopes: on
 * the broker it publishes them through the node; over A2A it carries them in
 * the A2A message (EXT-14). Writes the two transcripts check.mjs reads, to
 * /tmp/xt-broker.json and /tmp/xt-a2a.json.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createUser } from "nkeys.js";
import { MeshNode } from "../sdk-typescript/src/node.js";
import { InputProblemsError } from "../sdk-typescript/src/problems.js";
import { createEnvelope } from "../sdk-typescript/src/internal/envelope-builder.js";
import { signEnvelope, keyPairFromSeed, verifyEnvelopeSig } from "../sdk-typescript/src/internal/identity.js";
import { decode, encode } from "../sdk-typescript/src/internal/codec.js";
import { Subjects } from "../sdk-typescript/src/internal/subjects.js";
import type { Envelope } from "../sdk-typescript/src/types/envelope.js";
// @ts-expect-error story.mjs is plain JavaScript, copied beside this file.
import * as S from "./story.mjs";

const GW = process.env.A2A_PUBLIC ?? "https://a2a.dev.agentmesh.ai";
const KEY = process.env.A2A_KEY!;
const MESH = process.env.MESH_URL ?? "ws://localhost:4443";
const URI = "mesh://extensions/agent-messaging-over-a2a/v1";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const newKey = () => keyPairFromSeed(new TextDecoder().decode(createUser().getSeed()));

function creds(file: string): { jwt: string; seed: string } {
  const text = readFileSync(file, "utf8");
  const jwt = /-----BEGIN NATS USER JWT-----\s*([^\s-]+)\s*------END NATS USER JWT------/.exec(text)?.[1];
  const seed = /-----BEGIN USER NKEY SEED-----\s*([^\s-]+)\s*------END USER NKEY SEED------/.exec(text)?.[1];
  if (!jwt || !seed) throw new Error("could not read the node credential");
  return { jwt, seed };
}

const fileRef = (f: { name: string; media_type: string; bytes: Buffer }) => ({
  name: f.name,
  media_type: f.media_type,
  size: f.bytes.length,
  digest: `sha256:${S.sha256hex(f.bytes)}`,
  ref: `urn:xt:${f.name}`,
});
const budget = () => ({ revision: 0, deadline: new Date(Date.now() + 3 * 24 * 3600_000).toISOString().replace(/\.\d+Z$/, "Z"), cost_ceiling: S.BUDGET_CEILING });

async function main(): Promise<void> {
  const c = creds(process.env.NODE_CREDS ?? "/opt/agentmesh/creds/bridge-a2a.creds");
  const node = await MeshNode.connect(MESH, { jwt: c.jwt, nodeSeed: c.seed });
  node.startHeartbeat();
  const supplier = node.addAgent();
  supplier.onRequest(S.OFFERING, async (input: unknown) => {
    const i = (input ?? {}) as { split_delivery?: unknown };
    if (i.split_delivery !== true) {
      throw new InputProblemsError({ input: "split_delivery", problem: "missing", description: "Is a split delivery fine?", expected: "true or false" }, S.QUESTION);
    }
    return { text: S.QUOTE_TEXT, ...S.QUOTE_OUTPUT, price: S.PRICE, files: [fileRef(S.FILES.done)] };
  });
  await supplier.register({
    name: "cross-transport-supplier (test)",
    visibility: "public",
    description: "Throwaway test agent for the cross-transport quote test. Deregistered after the run.",
    offerings: [{ id: S.OFFERING, name: S.OFFERING_NAME, description: "A test quote; asks about split delivery first." }],
    public: { access: { schemes: [{ id: "a2a-gateway", transport: "http", type: "apiKey", in: "header", name: "Authorization" }] } } as never,
  });
  await sleep(4000);
  const SID = supplier.id;
  try {
    const m = await supplier.getManifest(SID);
    console.log("supplier manifest:", JSON.stringify({ visibility: m.visibility, sandbox: (m as { sandbox?: unknown }).sandbox, access: (m.public as { access?: unknown } | undefined)?.access }));
  } catch (err) {
    console.log("supplier manifest unreadable:", (err as Error).message);
  }
  try {
    // ── over the broker ────────────────────────────────────────────────
    const b = newKey();
    const inbox: Envelope[] = [];
    const stop = node.watchEnvelopes(Subjects.agentInbox(b.getPublicKey()), (e) => inbox.push(e));
    const waitFor = async (id: string): Promise<Envelope> => {
      for (let i = 0; i < 120; i++) {
        const got = inbox.find((e) => e.in_reply_to === id && (e.payload as { status?: string })?.status !== "accepted");
        if (got) return got;
        await sleep(250);
      }
      throw new Error(`no answer to ${id} over the broker`);
    };
    const ask = signEnvelope(createEnvelope({ type: "request", from: b.getPublicKey(), to: SID, budget: budget(), payload: { offering: S.OFFERING, input: { ...S.ASK_INPUT, text: S.ASK_TEXT }, files: [fileRef(S.FILES.request)] } }), b);
    node.relayEnvelope(ask);
    const needs = await waitFor(ask.id);
    const answer = signEnvelope(createEnvelope({ type: "request", from: b.getPublicKey(), to: SID, task_id: needs.task_id, ...(needs.context_id ? { context_id: needs.context_id } : {}), payload: { offering: S.OFFERING, input: { ...S.ANSWER_INPUT, text: S.ANSWER_TEXT } } }), b);
    node.relayEnvelope(answer);
    const done = await waitFor(answer.id);
    stop();
    const forgedB = S.forge(done);
    let refusedB = false;
    try {
      decode(encode(forgedB));
    } catch {
      refusedB = true;
    }
    writeFileSync("/tmp/xt-broker.json", JSON.stringify({
      transport: "broker",
      environment: `AgentMesh's dev mesh (NATS), ${MESH}; the supplier hosted on a node, the buyer a key that signs its own envelopes`,
      run_at: new Date().toISOString(),
      parties: { buyer: b.getPublicKey(), supplier: SID },
      messages: [ask, needs, answer, done],
      buyer_view: [needs, done].map((e) => (e.payload as { status?: string }).status),
      forged: { envelope: forgedB, refused: refusedB, how: "the receive path's decode refused it: the signature does not verify against from (Agent Messaging §5.3)" },
    }, null, 2) + "\n");
    console.log("broker transcript written");

    // ── over HTTPS, through the A2A Bridge ──────────────────────────────
    const a = newKey();
    const rpc = async (params: unknown) => {
      const r = await fetch(`${GW}/agents/${SID}/rpc`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${KEY}`, "A2A-Version": "0.3" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "SendMessage", params }) });
      return (await r.json()) as { result?: { task?: { id: string; contextId?: string; status: { state: string }; metadata?: Record<string, { envelope?: Envelope }> }; message?: { metadata?: Record<string, { envelope?: Envelope }> } }; error?: unknown };
    };
    const ask2 = signEnvelope(createEnvelope({ type: "request", from: a.getPublicKey(), to: SID, budget: budget(), payload: { offering: S.OFFERING, input: { ...S.ASK_INPUT, text: S.ASK_TEXT }, files: [fileRef(S.FILES.request)] } }), a);
    const r1 = await rpc({ message: { role: "ROLE_USER", parts: [{ text: S.ASK_TEXT }], extensions: [URI], metadata: { [URI]: { envelope: ask2 } } } });
    if (!r1.result?.task) throw new Error(`A2A: no task for the request: ${JSON.stringify(r1)}`);
    const needs2 = r1.result.task.metadata?.[URI]?.envelope as Envelope;
    const states: string[] = [r1.result.task.status.state];
    const answer2 = signEnvelope(createEnvelope({ type: "request", from: a.getPublicKey(), to: SID, task_id: needs2.task_id, ...(needs2.context_id ? { context_id: needs2.context_id } : {}), payload: { offering: S.OFFERING, input: { ...S.ANSWER_INPUT, text: S.ANSWER_TEXT } } }), a);
    const r2 = await rpc({ message: { role: "ROLE_USER", parts: [{ text: S.ANSWER_TEXT }], taskId: r1.result.task.id, ...(needs2.context_id ? { contextId: needs2.context_id } : {}), extensions: [URI], metadata: { [URI]: { envelope: answer2 } } } });
    const done2 = (r2.result?.task?.metadata ?? r2.result?.message?.metadata)?.[URI]?.envelope as Envelope;
    if (r2.result?.task) states.push(r2.result.task.status.state);
    else if (r2.result?.message) states.push("completed");
    const forgedA = S.forge(done2);
    writeFileSync("/tmp/xt-a2a.json", JSON.stringify({
      transport: "a2a",
      environment: `the A2A Bridge at ${GW} (the Agent Messaging Server's A2A gateway), JSON-RPC, the buyer a key carrying its own signed envelopes (EXT-14)`,
      run_at: new Date().toISOString(),
      parties: { buyer: a.getPublicKey(), supplier: SID },
      messages: [ask2, needs2, answer2, done2],
      buyer_view: states.map((s) => s.replace("-", "_")),
      forged: { envelope: forgedA, refused: !verifyEnvelopeSig(forgedA), how: "the A2A caller refused it: the agent's envelope beside the result does not verify (EXT-14 §5)" },
    }, null, 2) + "\n");
    console.log("a2a transcript written");
  } finally {
    await supplier.deregister().catch(() => undefined);
    await node.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
