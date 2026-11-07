#!/usr/bin/env node
// Checks ../a2a-binding.json against reference readings of the binding "A2A
// over Agent Messaging" (bindings/a2a.md) and the A2A Bridge's HTTP+JSON
// interface (bindings/a2a-bridge.md), with node alone.
//
//   node messaging/conformance/lib/check-a2a-binding.mjs
//
// Every signed frame must verify, and every section must have cases; the
// count of each is printed, because a check that quietly skipped a section
// would pass while checking nothing. The reference functions state the rules
// once in a checkable form; they are no implementation to copy. Exits 1 on any
// case the readings disagree with.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { canonical, idFromSeed, verifyEnvelope } from "./envelope-vectors.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const fx = JSON.parse(readFileSync(join(HERE, "..", "a2a-binding.json"), "utf8"));
const { client: CLIENT, server: SERVER } = fx.identities;
const EXT = fx.extensions;
const same = (a, b) => canonical(a ?? null) === canonical(b ?? null);

// A2A §3.1 (operations), §5.4 (error codes), §11.6 (reasons).
const OPS = ["SendMessage", "SendStreamingMessage", "GetTask", "ListTasks", "CancelTask", "SubscribeToTask",
  "CreateTaskPushNotificationConfig", "GetTaskPushNotificationConfig", "ListTaskPushNotificationConfigs",
  "DeleteTaskPushNotificationConfig", "GetExtendedAgentCard"];
const A2A_ERRORS = {
  TaskNotFoundError: [-32001, 404, "NOT_FOUND"],
  TaskNotCancelableError: [-32002, 400, "FAILED_PRECONDITION"],
  PushNotificationNotSupportedError: [-32003, 400, "FAILED_PRECONDITION"],
  UnsupportedOperationError: [-32004, 400, "FAILED_PRECONDITION"],
  ContentTypeNotSupportedError: [-32005, 400, "INVALID_ARGUMENT"],
  InvalidAgentResponseError: [-32006, 500, "INTERNAL"],
  ExtendedAgentCardNotConfiguredError: [-32007, 400, "FAILED_PRECONDITION"],
  ExtensionSupportRequiredError: [-32008, 400, "FAILED_PRECONDITION"],
  VersionNotSupportedError: [-32009, 400, "FAILED_PRECONDITION"],
  InvalidParamsError: [-32602, 400, "INVALID_ARGUMENT"],
  InternalError: [-32603, 500, "INTERNAL"],
};
// Binding §9 (0.3.0-draft): the JSON-RPC standard errors by A2A's JSON-RPC names.
const JSONRPC_STANDARD = { JSONParseError: -32700, InvalidRequestError: -32600, MethodNotFoundError: -32601 };
const REASON = (name) => name.replace(/Error$/, "").replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase();
// The A2A Bridge §7.2, §13.3: channel errors.
const CHANNEL_HTTP = { RATE_LIMITED: 429, AGENT_UNAVAILABLE: 502, AGENT_OVERLOADED: 502, TRANSPORT_NO_RESPONDERS: 502, TRANSPORT_TIMEOUT: 504, PAYLOAD_TOO_LARGE: 413, UNAUTHORIZED: 403, TRANSPORT_PERMISSION_DENIED: 403 };
const STATUS_OF = { 401: "UNAUTHENTICATED", 403: "PERMISSION_DENIED", 413: "INVALID_ARGUMENT", 429: "RESOURCE_EXHAUSTED", 500: "INTERNAL", 502: "UNAVAILABLE", 504: "DEADLINE_EXCEEDED" };
const TERMINAL = new Set(["TASK_STATE_COMPLETED", "TASK_STATE_FAILED", "TASK_STATE_CANCELED", "TASK_STATE_REJECTED"]);
const STATES = new Set([...TERMINAL, "TASK_STATE_SUBMITTED", "TASK_STATE_WORKING", "TASK_STATE_INPUT_REQUIRED", "TASK_STATE_AUTH_REQUIRED"]);

// Binding §4: a frame's shape, beside its signature.
const OLD_FIELDS = ["task_id", "context_id", "budget", "artifacts"];
function frameProblem(f, request, { anyMethod = false } = {}) {
  if (!verifyEnvelope(f)) return "does not verify";
  if (f.v !== "0.4.0") return `wire version ${f.v}`;
  for (const k of OLD_FIELDS) if (k in f) return `carries ${k}`;
  const a = f.payload?.a2a;
  if (!a || typeof a !== "object") return "no payload.a2a";
  if (f.type === "request") {
    if (f.from !== CLIENT || f.to !== SERVER) return "request not from the client to the server";
    if (!anyMethod && !OPS.includes(a.method)) return `method ${a.method}`;
    if (!a.params || typeof a.params !== "object" || Array.isArray(a.params)) return "params is not an object";
    return null;
  }
  if (f.type !== "respond") return `type ${f.type}`;
  if (f.from !== SERVER || f.to !== CLIENT) return "answer not from the server to the client";
  if (request && f.in_reply_to !== request.id) return "in_reply_to does not name the request";
  if (("result" in a) === Boolean(f.error)) return "needs exactly one of payload.a2a.result and error";
  if (f.error && !(f.error.code in A2A_ERRORS) && !(f.error.code in JSONRPC_STANDARD) && f.error.details?.a2a) return "a channel error carries an A2A code";
  if (a.seq !== undefined && request && a.streamId !== undefined && a.streamId !== request.id) return "streamId does not name the request";
  return null;
}

// The A2A Bridge §4.1, §13.1: where an A2A request goes on HTTP+JSON.
const str = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, String(v)]));
function routeOf(method, p) {
  const split = (key) => { const { [key]: v, ...rest } = p; return [v, rest]; };
  switch (method) {
    case "SendMessage": return { method: "POST", path: "message:send", body: p };
    case "SendStreamingMessage": return { method: "POST", path: "message:stream", body: p };
    case "GetTask": { const [id, rest] = split("id"); return { method: "GET", path: `tasks/${id}`, query: str(rest) }; }
    case "ListTasks": return { method: "GET", path: "tasks", query: str(p) };
    case "CancelTask": { const [id, rest] = split("id"); return { method: "POST", path: `tasks/${id}:cancel`, body: Object.keys(rest).length ? rest : undefined }; }
    case "SubscribeToTask": return { method: "POST", path: `tasks/${p.id}:subscribe` };
    case "CreateTaskPushNotificationConfig": { const [t, rest] = split("taskId"); return { method: "POST", path: `tasks/${t}/pushNotificationConfigs`, body: rest }; }
    case "GetTaskPushNotificationConfig": return { method: "GET", path: `tasks/${p.taskId}/pushNotificationConfigs/${p.id}` };
    case "ListTaskPushNotificationConfigs": { const [t, rest] = split("taskId"); return { method: "GET", path: `tasks/${t}/pushNotificationConfigs`, query: str(rest) }; }
    case "DeleteTaskPushNotificationConfig": return { method: "DELETE", path: `tasks/${p.taskId}/pushNotificationConfigs/${p.id}` };
    case "GetExtendedAgentCard": return { method: "GET", path: "extendedAgentCard" };
    default: return null;
  }
}
function requestProblem(http, frame) {
  const want = routeOf(frame.payload.a2a.method, frame.payload.a2a.params);
  if (!want) return "no route";
  if (http.method !== want.method || http.path !== want.path) return `route ${http.method} ${http.path}, expected ${want.method} ${want.path}`;
  if (!same(http.query ?? (want.query ? {} : undefined), want.query)) return "query differs from the request object";
  if (!same(http.body, want.body)) return "body differs from the request object";
  if (!same(http.headers, frame.meta?.a2a)) return "service parameters differ from meta.a2a";
  return null;
}

// Binding §9, the A2A Bridge §7.1, §13.3: one A2A error three ways.
function errorProblem(c, frame) {
  const e = frame.error, row = A2A_ERRORS[c.error];
  if (!row) return `${c.error} is not an A2A error`;
  if (e.code !== c.error) return `frame code ${e.code}`;
  if (e.details?.a2a?.code !== row[0]) return `details.a2a.code ${e.details?.a2a?.code}, expected ${row[0]}`;
  const data = e.details.a2a.data ?? {};
  const j = c.jsonrpc.error;
  if (j.code !== row[0] || j.message !== e.message) return "JSON-RPC code or message differs";
  if (!same(j.data ?? {}, data)) return "JSON-RPC data differs from details.a2a.data";
  const h = c.http.response;
  if (h.status !== row[1] || h.body.error.code !== row[1] || h.body.error.status !== row[2]) return `HTTP ${h.status} ${h.body.error.status}, expected ${row[1]} ${row[2]}`;
  const info = h.body.error.details[0];
  if (info["@type"] !== "type.googleapis.com/google.rpc.ErrorInfo" || info.reason !== REASON(c.error) || info.domain !== "a2a-protocol.org") return "ErrorInfo differs";
  const strings = Object.fromEntries(Object.entries(data).filter(([, v]) => typeof v === "string"));
  if (!same(info.metadata, strings)) return "ErrorInfo metadata is not the data's string members";
  const struct = h.body.error.details.find((d) => d["@type"] === "type.googleapis.com/google.protobuf.Struct");
  if (Object.keys(data).length ? !same(struct?.value, data) : struct) return "the data object is not carried whole";
  return null;
}
function channelProblem(c) {
  const code = c.error.code;
  if (code in A2A_ERRORS || /Error$/.test(code) || !/^[A-Z_]+$/.test(code)) return `${code} is named like an A2A error`;
  const status = CHANNEL_HTTP[code] ?? 500;
  const j = c.jsonrpc.error;
  if (j.code !== -32603 || j.data?.agentmesh_code !== code) return "not -32603 with data.agentmesh_code";
  if (c.error.details && !same(j.data.details, c.error.details)) return "details lost";
  const b = c.http.body.error;
  if (c.http.status !== status || b.code !== status || b.status !== STATUS_OF[status]) return `HTTP ${c.http.status} ${b.status}, expected ${status} ${STATUS_OF[status]}`;
  const info = b.details[0];
  if (info.reason !== "INTERNAL" || info.metadata?.agentmesh_code !== code) return "reason or agentmesh_code differs";
  return null;
}

// Binding §6, §12.5: a Part.
const MESH_REF = /^mesh:(artifacts|rooms):/;
function partOk(p) {
  if (!p || typeof p !== "object") return false;
  const kinds = ["text", "raw", "url", "data"].filter((k) => k in p);
  if (kinds.length !== 1) return false;
  const r = p.metadata?.[EXT.artifactRefs];
  if (r === undefined) return !(p.url !== undefined && MESH_REF.test(p.url));
  if (p.url === undefined) return false;
  return Number.isInteger(r.size) && r.size >= 0 && typeof r.digest === "string" && /^sha256:[0-9a-f]{64}$/.test(r.digest);
}

// Binding §8: reading a stream from its deliveries.
const ENDS = (r) => Boolean(r.message) || TERMINAL.has((r.task ?? r.statusUpdate)?.status?.state);
function assemble(deliveries, streamId) {
  const events = [];
  let next = 0, taskId = null, done = false, ignored = 0, skipped = 0;
  for (const d of deliveries) {
    if (d.drop) continue;
    const f = d.frame, a = f.payload.a2a;
    if (a.streamId !== streamId) { skipped++; continue; }
    if (done) { ignored++; continue; }
    if (a.seq < next) continue; // a redelivery
    if (a.seq > next) return { events, complete: false, gap_at: next, next: "SubscribeToTask" };
    const where = next === 0 ? "inbox" : `mesh.task.${taskId}.stream`;
    if (d.subject !== where) return { events, complete: false, gap_at: next, next: "SubscribeToTask" };
    if (next === 0) taskId = a.result.task?.id ?? a.result.statusUpdate?.taskId ?? a.result.artifactUpdate?.taskId ?? null;
    if (a.final === true && !ENDS(a.result)) return { events, complete: false, broken: "final on an event that does not end the stream" };
    events.push(a.result);
    next++;
    if (a.final === true) done = true;
  }
  const extra = { ...(ignored ? { ignored } : {}), ...(skipped ? { skipped } : {}) };
  return done ? { events, complete: true, ...extra } : { events, complete: false, gap_at: next, next: "SubscribeToTask" };
}

// Binding §12.2: the budget block and what a client reads from a Task.
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
function blockOk(b) {
  if (!b || typeof b !== "object") return false;
  const allowed = new Set(["deadline", "revision", "costCeiling"]);
  if (Object.keys(b).some((k) => !allowed.has(k))) return false;
  if (!Number.isInteger(b.revision) || b.revision < 0) return false;
  if (b.deadline === undefined && b.costCeiling === undefined) return false;
  if (b.deadline !== undefined && (typeof b.deadline !== "string" || !INSTANT.test(b.deadline))) return false;
  if (b.costCeiling !== undefined) {
    const c = b.costCeiling;
    if (!c || !Number.isInteger(c.amountMicro) || c.amountMicro < 0 || typeof c.currency !== "string" || !/^[A-Z]{3}$/.test(c.currency)) return false;
  }
  return true;
}
const OUTCOME_STATE = { insufficient: "TASK_STATE_REJECTED", deadline_unmeetable: "TASK_STATE_REJECTED", ceiling_reached: "TASK_STATE_INPUT_REQUIRED", exhausted: "TASK_STATE_CANCELED", completed_late: "TASK_STATE_COMPLETED" };
const OUTCOME_FIELDS = { insufficient: ["estimate"], deadline_unmeetable: ["earliestCompletion"], ceiling_reached: ["spent", "estimateToFinish"], exhausted: [], completed_late: [] };
function overdueReading(event) {
  const u = event.statusUpdate;
  return { overdue: u.metadata?.[EXT.budget]?.overdue === true, state: u.status.state, failed: false };
}

// Binding §12.7: the failure extension's object.
const FAILURE_REASONS = new Set(["user_requested", "superseded", "deadline_exceeded", "budget_exhausted", "upstream_cancelled", "policy", "needs_not_furnished", "dependency_failed"]);
function failureOk(state, o) {
  if (o === null || o === undefined) return true;
  if (state !== "TASK_STATE_FAILED" || typeof o !== "object" || !FAILURE_REASONS.has(o.reason)) return false;
  const allowed = new Set(["reason", ...(o.reason === "needs_not_furnished" ? ["unmetNeed"] : []), ...(o.reason === "dependency_failed" ? ["dependency"] : [])]);
  if (Object.keys(o).some((k) => !allowed.has(k))) return false;
  if (o.reason === "needs_not_furnished" && !(typeof o.unmetNeed === "string" && /^(resource|file|credential|text):.+$/.test(o.unmetNeed))) return false;
  if (o.reason === "dependency_failed" && o.dependency !== undefined && typeof o.dependency !== "string") return false;
  return true;
}
function budgetReading(task, window) {
  const state = task.status.state;
  const b = task.metadata?.[EXT.budget];
  const out = window && state === "TASK_STATE_CANCELED" && task.metadata?.["agentmesh.state"] === "exhausted" && b === undefined ? "exhausted" : b?.outcome;
  if (out !== undefined && OUTCOME_STATE[out] === state && OUTCOME_FIELDS[out].every((k) => b === undefined || k in b)) {
    return { reading: out, failed: false, may_retry: out !== "exhausted" };
  }
  return { reading: state.replace("TASK_STATE_", "").toLowerCase(), failed: state === "TASK_STATE_FAILED", may_retry: true };
}

// Binding §12.6: the cancel extension's object, and what a server records.
const CANCEL_REASONS = new Set(["user_requested", "superseded", "deadline_exceeded", "budget_exhausted", "upstream_cancelled", "policy", "needs_not_furnished", "dependency_failed"]);
const NEED = /^(resource|file|credential|text):.+$/;
function cancelObjectOk(o) {
  if (!o || typeof o !== "object" || !CANCEL_REASONS.has(o.reason)) return false;
  if (o.note !== undefined && typeof o.note !== "string") return false;
  if (o.reason === "needs_not_furnished" ? !(typeof o.unmet_need === "string" && NEED.test(o.unmet_need)) : o.unmet_need !== undefined) return false;
  if (o.reason !== "dependency_failed" && o.dependency !== undefined) return false;
  return true;
}
function recordedCancel(request) {
  const o = request.payload.a2a.params.metadata?.[fx.cancel_reasons.uri];
  const declared = (request.meta?.a2a?.["A2A-Extensions"] ?? "").split(/,\s*/).includes(fx.cancel_reasons.uri);
  if (o === undefined) return declared ? null : { reason: "user_requested" };
  return cancelObjectOk(o) ? o : null;
}

// Binding §8, carriers without subjects: whole Tasks in seq order.
function readWhole(frames) {
  const bySeq = new Map();
  for (const f of frames) if (!bySeq.has(f.payload.a2a.seq)) bySeq.set(f.payload.a2a.seq, f.payload.a2a.result.task ?? f.payload.a2a.result);
  let seq = -1;
  while (bySeq.has(seq + 1)) seq++;
  const highest = Math.max(...bySeq.keys());
  return { seq, state: bySeq.get(seq)?.status.state, ...(highest > seq ? { waiting_for: seq + 1 } : {}) };
}

// Binding §12.1, the A2A Bridge §4.5: which offering a Message calls.
function routeOffering(declared, md, window) {
  const ext = md[EXT.offering]?.offering;
  const old = window ? (md["agentmesh.offering"] ?? md["agentmesh.skill"]) : undefined;
  const refuse = { error: -32602, offerings: declared };
  if (ext !== undefined && old !== undefined && ext !== old) return refuse;
  const named = ext ?? old;
  if (named === undefined) return declared.length === 1 ? { offering: declared[0] } : refuse;
  if (!declared.includes(named)) return refuse;
  return ext === undefined ? { offering: named, added: true } : { offering: named };
}

// Binding §4, §14: whether a receiver takes a frame for its fields and version.
function acceptFields(f, window) {
  if (!verifyEnvelope(f)) return { ok: false, code: "IDENTITY_MISMATCH" };
  if (f.v === "0.3.0") return window ? { ok: true } : { ok: false, code: "INVALID_VERSION" };
  if (f.v !== "0.4.0") return { ok: false, code: "INVALID_VERSION" };
  if (OLD_FIELDS.some((k) => k in f)) return { ok: false, code: "INVALID_ENVELOPE" };
  return { ok: true };
}

let bad = 0;
const section = (name, cases, run) => {
  if (!cases?.length) { console.log(`FAIL  ${name}: no cases`); bad++; return; }
  let ok = 0;
  for (const c of cases) {
    let r;
    try { r = run(c); } catch (e) { r = `threw ${e.message}`; }
    if (r === true || r === null) ok++;
    else { bad++; console.log(`FAIL  ${name} / ${c.name}: ${r}`); }
  }
  console.log(`${name}: ${ok} of ${cases.length}`);
};
const pair = (frames) => frameProblem(frames[0]) ?? (frames[1] ? frameProblem(frames[1], frames[0]) : null);

section("identities", [{ name: "the seeds name the keys" }], () =>
  idFromSeed(fx.identities.client_seed) === CLIENT && idFromSeed(fx.identities.server_seed) === SERVER ? true : "a seed does not name its key");

const seen = new Set();
section("operations", fx.operations.cases, (c) => {
  const p = pair(c.frames);
  if (p) return p;
  const [r, a] = c.frames;
  if (r.payload.a2a.method !== c.operation) return "the frame calls another operation";
  seen.add(c.operation);
  const rp = requestProblem(c.http.request, r);
  if (rp) return rp;
  if (c.deliveries) {
    for (const d of c.deliveries) { const fp = frameProblem(d.frame, r); if (fp) return `stream frame: ${fp}`; }
    const got = assemble(c.deliveries, r.id);
    if (!got.complete) return "the stream does not end";
    return same(got.events, c.http.response.events) ? true : "the Server-Sent Events differ from the frames' results";
  }
  if (a.error) return errorProblem({ error: a.error.code, jsonrpc: { error: { code: a.error.details.a2a.code, message: a.error.message, data: a.error.details.a2a.data } }, http: c.http }, a);
  if (c.http.response.status !== 200) return `HTTP ${c.http.response.status}`;
  return same(c.http.response.body, a.payload.a2a.result) ? true : "the HTTP+JSON body differs from the frame's result";
});
section("every operation is covered", [{ name: "all eleven" }], () => {
  const missing = OPS.filter((o) => !seen.has(o));
  return missing.length ? `missing ${missing.join(", ")}` : true;
});

const errSeen = new Set();
section("errors", fx.errors.cases, (c) => {
  if (c.error in JSONRPC_STANDARD) {
    const p = frameProblem(c.frames[0], undefined, { anyMethod: true }) ?? frameProblem(c.frames[1], c.frames[0]);
    if (p) return p;
    const e = c.frames[1].error;
    if (OPS.includes(c.frames[0].payload.a2a.method)) return "the method is one A2A defines";
    if (e.code !== c.error || e.details.a2a.code !== JSONRPC_STANDARD[c.error] || c.jsonrpc.error.code !== JSONRPC_STANDARD[c.error]) return "the name and the integer disagree";
    return c.http === null ? true : "an unknown operation has no HTTP+JSON route";
  }
  const p = pair(c.frames);
  if (p) return p;
  errSeen.add(c.error);
  return requestProblem(c.http.request, c.frames[0]) ?? errorProblem(c, c.frames[1]) ?? true;
});
section("every A2A error is covered", [{ name: "all eleven" }], () => {
  const missing = Object.keys(A2A_ERRORS).filter((e) => !errSeen.has(e));
  return missing.length ? `missing ${missing.join(", ")}` : true;
});
section("channel errors", fx.errors.channel, (c) => channelProblem(c) ?? true);

const pr = fx.part_by_reference;
section("a Part by reference", [{ name: "the frame and the HTTP+JSON body" }], () => {
  const f = pr.frames[0];
  const fp = frameProblem(f);
  if (fp) return fp;
  if (!f.payload.a2a.params.message.parts.some((p) => MESH_REF.test(p.url ?? "") && partOk(p))) return "no Part by reference";
  const rp = requestProblem(pr.http.request, f);
  if (rp) return rp;
  const o = pr.outbound_to_keyless_caller;
  const { url: u1, ...m } = o.mesh, { url: u2, ...h } = o.http;
  if (!same(m, h) || !/^https:\/\//.test(u2) || !MESH_REF.test(u1)) return "outbound, more than the url changed";
  return true;
});
section("Parts", pr.parts, (c) => (partOk(c.part) === c.expect.ok ? true : `read as ${!c.expect.ok}`));

const sres = fx.stream_resume;
section("stream resume", sres.cases, (c) => {
  const request = c.request ?? sres.request;
  const rp = frameProblem(request);
  if (rp) return rp;
  for (const d of c.deliveries) {
    if (d.drop) continue;
    if (d.frame.payload.a2a.streamId === undefined) return "a stream frame without streamId";
    const own = d.frame.payload.a2a.streamId === request.id;
    const fp = frameProblem(d.frame, own ? request : undefined);
    if (fp) return fp;
  }
  const got = assemble(c.deliveries, request.id);
  return same(got, c.expect) ? true : `got ${JSON.stringify({ ...got, events: got.events.length })}`;
});
section("stream resume through the bridge", [{ name: "the SSE events" }], () =>
  requestProblem(sres.http.request, sres.request) ?? (same(sres.http.response.events, sres.cases[0].expect.events) ? true : "events differ"));

const lt = fx.long_task;
section("a long Task", [{ name: "longer than the reply window" }], () => {
  const window = lt.reply_window_ms;
  let id = null, terminal = false;
  for (const [i, x] of lt.exchanges.entries()) {
    const p = pair(x.frames);
    if (p) return p;
    const [r, a] = x.frames;
    const rp = requestProblem(x.http.request, r);
    if (rp) return rp;
    if (!same(x.http.response.body, a.payload.a2a.result)) return "HTTP+JSON body differs";
    if (Date.parse(a.ts) - Date.parse(r.ts) >= window) return `answer ${i} came after the reply window`;
    if (i > 0 && Date.parse(r.ts) - Date.parse(lt.exchanges[0].frames[0].ts) <= window) return `read ${i} is inside the reply window`;
    const t = a.payload.a2a.result.task ?? a.payload.a2a.result;
    if (!STATES.has(t.status.state)) return `state ${t.status.state}`;
    if (id !== null && t.id !== id) return "the Task id changed";
    if (terminal) return "a terminal Task moved";
    id = t.id; terminal = TERMINAL.has(t.status.state);
  }
  return terminal ? true : "the Task never ended";
});

const bg = fx.budget;
section("budget blocks", [...bg.blocks.valid.map((b, i) => ({ name: `valid ${i}`, b, ok: true })), ...bg.blocks.invalid.map((x) => ({ name: x.case, b: x.block, ok: false }))],
  (c) => (blockOk(c.b) === c.ok ? true : `read as ${!c.ok}`));
section("budget outcomes", bg.tasks, (c) => {
  let task = c.task;
  if (c.frames) {
    const p = pair(c.frames);
    if (p) return p;
    const result = c.frames[1].payload.a2a.result;
    task = result.task ?? result;
    const rp = requestProblem(c.http.request, c.frames[0]);
    if (rp) return rp;
    if (!same(c.http.response.body, result)) return "HTTP+JSON body differs";
  }
  const got = budgetReading(task, c.window);
  return same(got, c.expect) ? true : `got ${JSON.stringify(got)}`;
});
section("budget on the request", [{ name: "the budget extension, activated" }], () => {
  const f = fx.budget.tasks[1].frames[0];
  const m = f.payload.a2a.params.message;
  if (!blockOk(m.metadata?.[EXT.budget])) return "the budget block is not valid";
  return (f.meta.a2a["A2A-Extensions"] ?? "").split(/,\s*/).includes(EXT.budget) ? true : "the extension is not activated";
});

section("the overdue mark", bg.overdue.events, (c) => (same(overdueReading(c.event), c.expect) ? true : `got ${JSON.stringify(overdueReading(c.event))}`));
section("every budget outcome", [{ name: "four outcomes and completed_late" }], () => {
  const got = new Set(bg.tasks.map((c) => c.expect.reading));
  const missing = Object.keys(OUTCOME_STATE).filter((o) => !got.has(o));
  return missing.length ? `missing ${missing.join(", ")}` : true;
});

const cr = fx.cancel_reasons;
section("cancel reasons on the wire", cr.exchanges, (c) => {
  const p = pair(c.frames);
  if (p) return p;
  const [r, a] = c.frames;
  if (r.payload.a2a.method !== "CancelTask") return "not a CancelTask";
  if (c.error) {
    if (recordedCancel(r) !== null) return "a cancel the agent must refuse would be recorded";
    if (!same(a.error?.details?.a2a?.data?.reasons, [...CANCEL_REASONS])) return "the refusal does not list the reasons";
    return requestProblem(c.http.request, r) ?? errorProblem({ error: "InvalidParamsError", jsonrpc: { error: { code: -32602, message: a.error.message, data: a.error.details.a2a.data } }, http: c.http }, a) ?? true;
  }
  const rp = requestProblem(c.http.request, r);
  if (rp) return rp;
  if (!same(c.http.response.body, a.payload.a2a.result)) return "HTTP+JSON body differs";
  const rec = recordedCancel(r);
  if (!same(rec, c.recorded)) return `recorded ${JSON.stringify(rec)}`;
  if (a.payload.a2a.result.status.state !== "TASK_STATE_CANCELED") return "the Task is not canceled";
  return same(a.payload.a2a.result.metadata?.[cr.uri], c.recorded) ? true : "the canceled Task does not carry the recorded reason";
});
section("cancel reason objects", cr.objects, (c) => (cancelObjectOk(c.value) === c.expect.ok ? true : `read as ${!c.expect.ok}`));
section("the cancel reason list", [{ name: "SPEC.md §10.8's eight" }], () => (same([...cr.reasons].sort(), [...CANCEL_REASONS].sort()) ? true : "the list differs"));

const fr = fx.failure_reasons;
section("failure reasons on the wire", [{ name: "a failed Task with its reason" }], () => {
  const p = pair(fr.exchange.frames);
  if (p) return p;
  const t = fr.exchange.frames[1].payload.a2a.result;
  const rp = requestProblem(fr.exchange.http.request, fr.exchange.frames[0]);
  if (rp) return rp;
  if (!same(fr.exchange.http.response.body, t)) return "HTTP+JSON body differs";
  return failureOk(t.status.state, t.metadata?.[fr.uri]) ? true : "the failure object is not valid";
});
section("failure reason objects", fr.tasks, (c) => (failureOk(c.state, c.value) === c.expect.ok ? true : `read as ${!c.expect.ok}`));

const cw = fx.carrier_without_subjects;
section("carriers without subjects", cw.cases, (c) => {
  for (const f of c.frames) { const fp = frameProblem(f, cw.request); if (fp) return fp; }
  const got = readWhole(c.frames);
  return same(got, c.expect) ? true : `got ${JSON.stringify(got)}`;
});
section("no streaming without subjects", [{ name: "UnsupportedOperationError" }], () => {
  const p = pair(cw.streaming.frames);
  if (p) return p;
  return cw.streaming.frames[0].payload.a2a.method === "SendStreamingMessage" && cw.streaming.frames[1].error?.code === "UnsupportedOperationError" ? true : "not refused";
});

const of = fx.offering;
section("offering routing", of.cases, (c) => { const got = routeOffering(c.declared, c.metadata, c.window); return same(got, c.expect) ? true : `got ${JSON.stringify(got)}`; });
section("the added offering key", [{ name: "the bridge adds the extension's key and nothing else" }], () => {
  const f = of.added_key.frame;
  const fp = frameProblem(f);
  if (fp) return fp;
  const sent = f.payload.a2a.params.message, got = of.added_key.http_body.message;
  const old = got.metadata["agentmesh.offering"] ?? got.metadata["agentmesh.skill"];
  const want = { ...got, metadata: { ...got.metadata, [EXT.offering]: { offering: old } } };
  if (!same(sent, want)) return "the signed Message is not the caller's with the key added";
  return (f.meta.a2a["A2A-Extensions"] ?? "").split(/,\s*/).includes(EXT.offering) ? true : "the extension is not activated";
});

section("0.3.0 fields on 0.4.0 frames", fx.legacy_fields.cases, (c) => { const got = acceptFields(c.frame, c.window); return same(got, c.expect) ? true : `got ${JSON.stringify(got)}`; });

console.log(bad ? `${bad} disagreement(s)` : "a2a-binding.json: every case agrees with the reference readings");
process.exit(bad ? 1 : 0);
