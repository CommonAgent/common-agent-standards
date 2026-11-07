#!/usr/bin/env node
// Checks ../a2a-bridge.json against reference readings of the A2A Bridge
// (0.9.0-draft) and EXT-14 (Agent Messaging over A2A, 0.4.0-draft), with node
// alone.
//
//   node messaging/conformance/lib/check-a2a-bridge-fixture.mjs
//
// Every section must have cases, and the count of each is printed: a check
// that quietly skipped a section would pass while checking nothing. The
// reference functions state the rules once in a checkable form; they are no
// implementation to copy. Exits 1 on any case the readings disagree with.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { canonical, idFromSeed, verifyEnvelope } from "./envelope-vectors.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const fx = JSON.parse(readFileSync(join(HERE, "..", "a2a-bridge.json"), "utf8"));
const SKEW_AHEAD_MS = 5 * 60_000;
const LIVE_MAX_AGE_MS = 10 * 60_000;
const URI = fx.extension_uri;
const OFFERING = "https://agentmessaging.ai/extensions/offering/v1";
const AUDIENCE = "https://agentmessaging.ai/extensions/audience/v1";
const BUDGET = "https://agentmessaging.ai/extensions/budget/v1";
const MARKER = "mesh://extensions/a2a-bridge/v1";
const same = (a, b) => canonical(a ?? null) === canonical(b ?? null);

// EXT-14 §4.
function checkCarried(env, { agent, declared, now, call }) {
  if (!env || typeof env !== "object" || typeof env.v !== "string" || typeof env.id !== "string" || typeof env.from !== "string" || typeof env.sig !== "string") return { ok: false, reason: "malformed" };
  const a2a = env.payload?.a2a;
  if (env.v === "0.4.0") {
    if (["task_id", "context_id", "artifacts"].some((k) => k in env)) return { ok: false, reason: "malformed" };
    if (!a2a || typeof a2a !== "object") return { ok: false, reason: "malformed" };
  } else if (env.v !== "0.3.0") return { ok: false, reason: "malformed" };
  if (!verifyEnvelope(env)) return { ok: false, reason: "signature" };
  if (env.type !== "request") return { ok: false, reason: "type" };
  if (env.to !== agent) return { ok: false, reason: "addressee" };
  const drift = Date.parse(now) - Date.parse(env.ts);
  if (Number.isNaN(drift) || drift < -SKEW_AHEAD_MS || drift > LIVE_MAX_AGE_MS) return { ok: false, reason: "stale" };
  if (env.v === "0.4.0") {
    if (a2a.method !== call.operation || !a2a.params || typeof a2a.params !== "object") return { ok: false, reason: "method" };
    const m = a2a.params.message;
    const person = m?.metadata?.[AUDIENCE]?.audience !== undefined && m.metadata[AUDIENCE].audience !== "agent";
    const off = m?.metadata?.[OFFERING]?.offering;
    if (!person && off !== undefined && !declared.includes(off)) return { ok: false, reason: "offering" };
    if (call.operation === "SendMessage") {
      if (call.message?.taskId !== undefined && call.message.taskId !== m?.taskId) return { ok: false, reason: "mismatch" };
      if (call.message?.contextId !== undefined && call.message.contextId !== m?.contextId) return { ok: false, reason: "mismatch" };
    } else if (call.params?.id !== undefined && call.params.id !== a2a.params.id) return { ok: false, reason: "mismatch" };
    return { ok: true };
  }
  const person = env.meta?.audience !== undefined && env.meta.audience !== "agent";
  const off = env.payload?.offering;
  if (!person && (typeof off !== "string" || !(declared.includes(off) || ["task.cancel", "knock", "describe"].includes(off)))) return { ok: false, reason: "offering" };
  if (call.message?.taskId && call.message.taskId !== env.task_id) return { ok: false, reason: "mismatch" };
  if (call.message?.contextId && env.context_id && call.message.contextId !== env.context_id) return { ok: false, reason: "mismatch" };
  return { ok: true };
}

// EXT-14 §5.
function answerProblem(c) {
  const f = c.frame;
  if (!verifyEnvelope(f) || f.v !== "0.4.0" || f.type !== "respond") return "the answer frame does not verify as a 0.4.0 respond";
  if (f.from !== fx.identities.agent || f.to !== fx.identities.caller || f.in_reply_to !== c.request.id) return "the answer is not the agent's to this request";
  const result = f.payload.a2a.result, [kind] = Object.keys(result);
  const got = c.a2a_result[kind];
  if (!got || Object.keys(c.a2a_result).length !== 1) return "the result's kind changed";
  const { [URI]: carried, ...restMeta } = got.metadata ?? {};
  if (!same(carried, { envelope: f })) return "the agent's frame is not under the extension's URI";
  const stripped = { ...got, metadata: restMeta };
  if (!Object.keys(restMeta).length) delete stripped.metadata;
  return same(stripped, result[kind]) ? null : "more than the frame was added";
}

// The A2A Bridge §8.3, §9.0.
function checkMarkers(meta) {
  const g = meta?.identity_bridge, a = meta?.a2a_bridge;
  if (!g || !a) return { ok: false };
  if (g.front !== "a2a" || a.direction !== "inbound") return { ok: false };
  if (g.caller_ref !== a.caller_ref || g.caller_kind !== a.caller_kind || g.bridge !== a.node) return { ok: false };
  const allowedG = new Set(["bridge", "caller_ref", "caller_kind", "front"]);
  const allowedA = new Set(["direction", "node", "caller_ref", "caller_kind", "a2a_protocol_version"]);
  if (Object.keys(g).some((k) => !allowedG.has(k)) || Object.keys(a).some((k) => !allowedA.has(k))) return { ok: false };
  return { ok: true };
}

// The A2A Bridge §5.1, §5.2.
const KIND = {
  TASK_STATE_SUBMITTED: "active", TASK_STATE_WORKING: "active",
  TASK_STATE_INPUT_REQUIRED: "interrupted", TASK_STATE_AUTH_REQUIRED: "interrupted",
  TASK_STATE_COMPLETED: "terminal", TASK_STATE_FAILED: "terminal", TASK_STATE_CANCELED: "terminal", TASK_STATE_REJECTED: "terminal",
};
const isState = (s) => Object.hasOwn(KIND, s);
function fromWire030(mesh) {
  if (mesh === "exhausted") return { a2a: "TASK_STATE_CANCELED", metadata: { [BUDGET]: { outcome: "exhausted" }, "agentmesh.state": "exhausted" } };
  const s = `TASK_STATE_${String(mesh).toUpperCase()}`;
  return isState(s) ? { a2a: s } : null;
}

// The A2A Bridge §5.2, §7.3: a 0.3.0 agent's budget answers and cancels.
const money = (m) => ({ amountMicro: m.amount_micro, currency: m.currency });
const CODE_030 = { TASK_NOT_FOUND: -32001, TASK_EXPIRED: -32001, TASK_NOT_CANCELABLE: -32002, TASK_INVALID_TRANSITION: -32004, CONTENT_TYPE_NOT_SUPPORTED: -32005, OFFERING_NOT_FOUND: -32602, SKILL_NOT_FOUND: -32602, INPUT_INVALID: -32602, INVALID_QUERY: -32602 };
function budget030(answer) {
  const e = answer.error ?? {}, d = e.details ?? {};
  if (e.code === "BUDGET_INSUFFICIENT") return { state: "TASK_STATE_REJECTED", metadata: { [BUDGET]: { outcome: "insufficient", estimate: money(d.estimate) }, [MARKER]: { held: true } } };
  if (e.code === "DEADLINE_UNMEETABLE") return { state: "TASK_STATE_REJECTED", metadata: { [BUDGET]: { outcome: "deadline_unmeetable", earliestCompletion: d.earliest_completion }, [MARKER]: { held: true } } };
  if (e.code === "BUDGET_EXHAUSTED" && answer.payload?.status === "input_required") return { state: "TASK_STATE_INPUT_REQUIRED", metadata: { [BUDGET]: { outcome: "ceiling_reached", spent: money(d.spent), estimateToFinish: money(d.estimate_to_finish) } } };
  return { error: CODE_030[e.code] ?? -32603, agentmesh_code: e.code };
}
function cancel030(params) {
  const o = params.metadata?.["https://agentmessaging.ai/extensions/cancel/v1"] ?? { reason: "user_requested" };
  return { offering: "task.cancel", input: { task_id: params.id, ...o } };
}

// EXT-14 §8, binding §10, A2A §3.1.1.
function answerOnTask(task, caller, message, wire) {
  if (!task || task.creator !== caller || task.id !== message.taskId) return { error: -32001 };
  if (message.contextId && task.context && message.contextId !== task.context) return { error: -32602 };
  if (wire === "0.3.0") {
    if (task.state !== "input_required" && task.state !== "auth_required") return { error: -32004, agentmesh_code: "TASK_INVALID_TRANSITION" };
    return { relay: { task_id: task.id, context_id: task.context, offering: task.offering } };
  }
  if (KIND[task.state] === "terminal") return { error: -32004 };
  return { accepted: true };
}

// EXT-14 §9, the A2A Bridge §4.3.
function knockInput(k) {
  if (!k || typeof k !== "object" || Array.isArray(k)) return { refused: "KNOCK_CARRIES_NO_MESSAGE" };
  const { via, grants, ...rest } = k;
  if (Object.keys(rest).length) return { refused: "KNOCK_CARRIES_NO_MESSAGE" };
  if (via !== undefined && (typeof via !== "string" || via.length > 80)) return { refused: "KNOCK_CARRIES_NO_MESSAGE" };
  if (grants !== undefined && (!Array.isArray(grants) || grants.some((g) => typeof g !== "string"))) return { refused: "KNOCK_CARRIES_NO_MESSAGE" };
  return { input: { ...(via !== undefined ? { via } : {}), grants: grants ?? [] } };
}
function ackAnswer(payload) {
  const c = payload?.output && typeof payload.output === "object" ? payload.output : payload ?? {};
  if (c.delivered === true || c.paused === true) return { state: "TASK_STATE_SUBMITTED", metadata: { [MARKER]: { held: true } } };
  return { state: "TASK_STATE_AUTH_REQUIRED", metadata: { [MARKER]: { held: true }, [URI]: { admission: "held" }, "agentmesh.admission": "held" } };
}

// EXT-14 §11, the older form.
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
function olderBudget(md) {
  if (md[BUDGET] !== undefined) return { budget: md[BUDGET] };
  const b = md[URI]?.budget;
  if (!b || typeof b !== "object" || b.revision !== 0) return { refused: "INVALID_BUDGET" };
  if (b.deadline === undefined && b.cost_ceiling === undefined) return { refused: "INVALID_BUDGET" };
  if (b.deadline !== undefined && (typeof b.deadline !== "string" || !INSTANT.test(b.deadline))) return { refused: "INVALID_BUDGET" };
  const out = { revision: 0, ...(b.deadline !== undefined ? { deadline: b.deadline } : {}) };
  if (b.cost_ceiling !== undefined) {
    const c = b.cost_ceiling;
    if (!c || !Number.isInteger(c.amount_micro) || c.amount_micro < 0 || typeof c.currency !== "string" || !/^[A-Z]{3}$/.test(c.currency)) return { refused: "INVALID_BUDGET" };
    out.costCeiling = { amountMicro: c.amount_micro, currency: c.currency };
  }
  return { budget: out };
}

// Agent Messaging §5.8.
const normalize = (t) => {
  const lines = t.replace(/\r\n?/g, "\n").split("\n").map((l) => l.replace(/[ \t]+$/, ""));
  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines.join("\n");
};
function readableOk(env, text) {
  if (!verifyEnvelope(env)) return false;
  const d = env.meta?.readable_text?.text;
  if (d !== `sha256:${createHash("sha256").update(normalize(text), "utf8").digest("hex")}`) return false;
  const shown = normalize(text);
  const words = env.v === "0.4.0"
    ? (env.payload?.a2a?.params?.message?.parts ?? []).filter((p) => typeof p.text === "string").map((p) => p.text).join("\n")
    : env.payload?.text;
  if (typeof words === "string" && !shown.includes(normalize(words))) return false;
  return shown.includes(env.from);
}

let bad = 0;
const section = (name, cases, run) => {
  if (!cases?.length) { console.log(`FAIL  ${name}: no cases`); bad++; return; }
  let ok = 0;
  for (const c of cases) {
    let r;
    try { r = run(c); } catch (e) { r = `threw ${e.message}`; }
    if (r === true) ok++;
    else { bad++; console.log(`FAIL  ${name} / ${c.name ?? c.mesh ?? c.state ?? c}: ${r}`); }
  }
  console.log(`${name}: ${ok} of ${cases.length}`);
};

const ctx = { agent: fx.identities.agent, declared: fx.declared_offerings, now: fx.now };
section("identities", [{ name: "the seeds name the keys" }], () =>
  idFromSeed(fx.identities.caller_seed) === fx.identities.caller && idFromSeed(fx.identities.agent_seed) === fx.identities.agent ? true : "a seed does not name its key");
section("signed callers", fx.signed_callers.cases, (c) => {
  const r = checkCarried(c.envelope, { ...ctx, call: c.call });
  return r.ok === c.expect.ok && (r.ok || r.reason === c.expect.reason) ? true : `got ${JSON.stringify(r)}`;
});
section("signed callers, both wire versions", [{ name: "0.4.0 and 0.3.0 cases present" }], () => {
  const w = new Set(fx.signed_callers.cases.map((c) => c.envelope.v));
  return w.has("0.4.0") && w.has("0.3.0") ? true : `only ${[...w].join(", ")}`;
});
section("answers", fx.answers.cases, (c) => answerProblem(c) ?? true);
section("unsigned callers", fx.unsigned_callers.cases, (c) => (checkMarkers(c.meta).ok === c.expect.ok ? true : "marker reading differs"));
section("states", fx.states.a2a, (c) => (KIND[c.state] === c.kind ? true : `kind ${KIND[c.state]}`));
section("every A2A state", [{ name: "eight states" }], () => (same(fx.states.a2a.map((c) => c.state).sort(), Object.keys(KIND).sort()) ? true : "the set differs"));
section("spellings never sent", fx.states.never_sent, (s) => (isState(s) ? `${s} read as a state` : true));
section("states from 0.3.0 agents", fx.states.wire_0_3_0, (c) => {
  const got = fromWire030(c.mesh);
  return same(got, { a2a: c.a2a, ...(c.metadata ? { metadata: c.metadata } : {}) }) ? true : `got ${JSON.stringify(got)}`;
});
section("0.3.0 budget answers", fx.wire_0_3_0_budget_and_cancel.budget, (c) => (same(budget030(c.answer), c.expect) ? true : `got ${JSON.stringify(budget030(c.answer))}`));
section("0.3.0 cancels", fx.wire_0_3_0_budget_and_cancel.cancel, (c) => (same(cancel030(c.params), c.expect) ? true : `got ${JSON.stringify(cancel030(c.params))}`));
section("answers on a Task",fx.answers_on_a_task.cases, (c) => {
  const got = answerOnTask(c.task, c.caller, c.message, c.wire);
  return same(got, c.expect) ? true : `got ${JSON.stringify(got)}`;
});
section("knock inputs", fx.knock.inputs, (c) => (same(knockInput(c.knock), c.expect) ? true : `got ${JSON.stringify(knockInput(c.knock))}`));
section("knock acknowledgements", fx.knock.acknowledgements, (c) => (same(ackAnswer(c.payload), c.answer) ? true : `got ${JSON.stringify(ackAnswer(c.payload))}`));
section("the budget's older form", fx.budget_older_form.cases, (c) => (same(olderBudget(c.metadata), c.expect) ? true : `got ${JSON.stringify(olderBudget(c.metadata))}`));
section("readable text", fx.readable_text.cases, (c) => (readableOk(c.envelope, c.text) === c.expect.ok ? true : "check differs"));
console.log(bad ? `${bad} disagreement(s)` : "a2a-bridge.json: every case agrees with the reference readings");
process.exit(bad ? 1 : 0);
