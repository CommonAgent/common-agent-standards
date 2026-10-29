#!/usr/bin/env node
// Checks ../a2a-bridge.json against reference readings of the A2A Bridge's
// mapping and EXT-14 (Agent Messaging over A2A), with node alone.
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
import { verifyEnvelope } from "./envelope-vectors.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const fx = JSON.parse(readFileSync(join(HERE, "..", "a2a-bridge.json"), "utf8"));
const SKEW_AHEAD_MS = 5 * 60_000;
const LIVE_MAX_AGE_MS = 10 * 60_000;

// EXT-14 §4.
function checkCarried(env, { agent, declared, now, message }) {
  if (!env || typeof env !== "object" || typeof env.id !== "string" || typeof env.from !== "string" || typeof env.sig !== "string") return { ok: false, reason: "malformed" };
  if (!verifyEnvelope(env)) return { ok: false, reason: "signature" };
  if (env.type !== "request") return { ok: false, reason: "type" };
  if (env.to !== agent) return { ok: false, reason: "addressee" };
  const drift = Date.parse(now) - Date.parse(env.ts);
  if (Number.isNaN(drift) || drift < -SKEW_AHEAD_MS || drift > LIVE_MAX_AGE_MS) return { ok: false, reason: "stale" };
  const person = env.meta?.audience !== undefined && env.meta.audience !== "agent";
  const off = env.payload?.offering;
  if (!person && (typeof off !== "string" || !(declared.includes(off) || ["task.cancel", "knock", "describe"].includes(off)))) return { ok: false, reason: "offering" };
  if (message?.taskId && message.taskId !== env.task_id) return { ok: false, reason: "mismatch" };
  if (message?.contextId && env.context_id && message.contextId !== env.context_id) return { ok: false, reason: "mismatch" };
  return { ok: true };
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

// The A2A Bridge §5.
const JSON_OF = { submitted: "submitted", working: "working", input_required: "input-required", auth_required: "auth-required", completed: "completed", failed: "failed", canceled: "canceled", rejected: "rejected", exhausted: "canceled" };
const toEnum = (json) => `TASK_STATE_${json.replace("-", "_").toUpperCase()}`;
const fromA2A = (json) => Object.entries(JSON_OF).find(([m, j]) => j === json && m !== "exhausted")?.[0];

// EXT-14 §8.
function relay(task, caller, message) {
  if (!task || task.caller !== caller || task.id !== message.taskId) return { error: -32001 };
  if (message.contextId && task.context && message.contextId !== task.context) return { error: -32602 };
  if (task.state !== "input_required" && task.state !== "auth_required") return { error: -32602, agentmesh_code: "TASK_INVALID_TRANSITION" };
  return { relay: { task_id: task.id, context_id: task.context, offering: task.offering } };
}

// EXT-14 §9.
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
  return c.delivered === true || c.paused === true ? "submitted" : "auth-required";
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
  if (typeof env.payload?.text === "string" && !shown.includes(normalize(env.payload.text))) return false;
  return shown.includes(env.from);
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
let bad = 0;
const section = (name, cases, run) => {
  if (!cases?.length) { console.log(`FAIL  ${name}: no cases`); bad++; return; }
  let ok = 0;
  for (const c of cases) {
    const r = run(c);
    if (r === true) ok++;
    else { bad++; console.log(`FAIL  ${name} / ${c.name ?? c.mesh}: ${r}`); }
  }
  console.log(`${name}: ${ok} of ${cases.length}`);
};

const ctx = { agent: fx.identities.agent, declared: fx.declared_offerings, now: fx.now };
section("signed callers", fx.signed_callers.cases, (c) => {
  const r = checkCarried(c.envelope, { ...ctx, message: c.message });
  return r.ok === c.expect.ok && (r.ok || r.reason === c.expect.reason) ? true : `got ${JSON.stringify(r)}`;
});
section("unsigned callers", fx.unsigned_callers.cases, (c) => (checkMarkers(c.meta).ok === c.expect.ok ? true : "marker reading differs"));
section("states", fx.states.cases, (c) => {
  if (JSON_OF[c.mesh] !== c.json || toEnum(c.json) !== c.enum) return "spelling differs";
  if (c.mesh === "exhausted" && (!same(c.metadata, { "agentmesh.state": "exhausted" }) || fromA2A(c.json) !== c.back)) return "exhausted is not marked, or maps back wrong";
  if (c.mesh !== "exhausted" && fromA2A(c.json) !== c.mesh) return "does not map back";
  return true;
});
section("state relay", fx.state_relay.cases, (c) => (same(relay(c.task, c.caller, c.message), c.expect) ? true : `got ${JSON.stringify(relay(c.task, c.caller, c.message))}`));
section("knock inputs", fx.knock.inputs, (c) => (same(knockInput(c.knock), c.expect) ? true : `got ${JSON.stringify(knockInput(c.knock))}`));
section("knock acknowledgements", fx.knock.acknowledgements, (c) => (ackAnswer(c.payload) === c.answer ? true : `got ${ackAnswer(c.payload)}`));
section("readable text", fx.readable_text.cases, (c) => (readableOk(c.envelope, c.text) === c.expect.ok ? true : "check differs"));
console.log(bad ? `${bad} disagreement(s)` : "a2a-bridge.json: every case agrees with the reference readings");
process.exit(bad ? 1 : 0);
