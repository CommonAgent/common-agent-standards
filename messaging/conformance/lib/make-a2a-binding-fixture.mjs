#!/usr/bin/env node
// Writes ../a2a-binding.json, the fixture set for the binding "A2A over Agent
// Messaging" (bindings/a2a.md, §15) and the A2A Bridge's HTTP+JSON side of it.
//
//   node messaging/conformance/lib/make-a2a-binding-fixture.mjs
//
// Every frame is really signed. The client signs with the published test seed
// that audience.json, budget.json and accept-signal.json use; the server agent
// signs with the published responder seed of Agent Emailing's
// emailing/conformance/cases.json. So no new private-key-shaped string enters
// the repository. Ids and times are fixed, so the file is the same on every
// run. lib/check-a2a-binding.mjs checks it against reference readings.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { signEnvelope } from "./envelope-vectors.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..", "..", "..");
const ids = JSON.parse(readFileSync(join(REPO, "emailing", "conformance", "cases.json"), "utf8")).identities;
const CLIENT_SEED = ids.requester_seed;
const CLIENT = ids.requester;
const SERVER_SEED = ids.responder_seed;
const SERVER = ids.responder;
const OTHER = "UAKQRYZBYFOC65OQZVJ3QPCIERDTRNNZPMOJUYXC3DGPRCDWSKD4HV5A";

const BINDING = "https://agentmessaging.ai/bindings/a2a/v1";
const EXT = {
  offering: "https://agentmessaging.ai/extensions/offering/v1",
  budget: "https://agentmessaging.ai/extensions/budget/v1",
  audience: "https://agentmessaging.ai/extensions/audience/v1",
  economics: "https://agentmessaging.ai/extensions/economics/v1",
  artifactRefs: "https://agentmessaging.ai/extensions/artifact-refs/v1",
};
const T0 = Date.parse("2026-11-07T18:00:00Z");
const at = (sec) => new Date(T0 + Math.round(sec * 1000)).toISOString();
const TRACE = { trace_id: "4bf92f3577b34da6a3ce929d0e0e4736", span_id: "00f067aa0ba902b7" };
const META = { a2a: { "A2A-Version": "1.0" } };

let n = 0;
const fid = () => `0199b000-0000-7000-8000-${String(++n).padStart(12, "0")}`;
let clock = 0;
const tick = (sec = 0.2) => at((clock += sec));

/** A signed request frame (binding §4). */
function req(method, params, over = {}, seed = CLIENT_SEED) {
  return signEnvelope({ v: "0.4.0", id: fid(), type: "request", ts: tick(), from: CLIENT, to: SERVER, trace: TRACE, payload: { a2a: { method, params } }, meta: META, ...over }, seed);
}
/** A signed respond frame carrying an A2A result. */
function res(request, a2a, over = {}) {
  return signEnvelope({ v: "0.4.0", id: fid(), type: "respond", ts: tick(), from: SERVER, to: CLIENT, in_reply_to: request.id, trace: TRACE, payload: { a2a }, ...over }, SERVER_SEED);
}
/** A signed respond frame carrying an A2A error (binding §9). */
const CODES = {
  TaskNotFoundError: -32001, TaskNotCancelableError: -32002, PushNotificationNotSupportedError: -32003,
  UnsupportedOperationError: -32004, ContentTypeNotSupportedError: -32005, InvalidAgentResponseError: -32006,
  ExtendedAgentCardNotConfiguredError: -32007, ExtensionSupportRequiredError: -32008, VersionNotSupportedError: -32009,
  InvalidParamsError: -32602, InternalError: -32603,
};
const HTTP = {
  TaskNotFoundError: [404, "NOT_FOUND"], TaskNotCancelableError: [400, "FAILED_PRECONDITION"],
  PushNotificationNotSupportedError: [400, "FAILED_PRECONDITION"], UnsupportedOperationError: [400, "FAILED_PRECONDITION"],
  ContentTypeNotSupportedError: [400, "INVALID_ARGUMENT"], InvalidAgentResponseError: [500, "INTERNAL"],
  ExtendedAgentCardNotConfiguredError: [400, "FAILED_PRECONDITION"], ExtensionSupportRequiredError: [400, "FAILED_PRECONDITION"],
  VersionNotSupportedError: [400, "FAILED_PRECONDITION"], InvalidParamsError: [400, "INVALID_ARGUMENT"], InternalError: [500, "INTERNAL"],
};
const reasonOf = (name) => name.replace(/Error$/, "").replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase();
function errRes(request, name, message, data = {}, retryable = false) {
  return signEnvelope({ v: "0.4.0", id: fid(), type: "respond", ts: tick(), from: SERVER, to: CLIENT, in_reply_to: request.id, trace: TRACE, payload: { a2a: {} },
    error: { code: name, message, details: { a2a: { code: CODES[name], data } }, retryable } }, SERVER_SEED);
}

// The bridge's HTTP+JSON side (the A2A Bridge §4.1, §13).
const q = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, String(v)]));
function route(method, p) {
  const H = { "A2A-Version": "1.0" };
  switch (method) {
    case "SendMessage": return { method: "POST", path: "message:send", headers: H, body: p };
    case "SendStreamingMessage": return { method: "POST", path: "message:stream", headers: H, body: p };
    case "GetTask": { const { id, ...rest } = p; return { method: "GET", path: `tasks/${id}`, headers: H, query: q(rest) }; }
    case "ListTasks": return { method: "GET", path: "tasks", headers: H, query: q(p) };
    case "CancelTask": { const { id, ...rest } = p; return { method: "POST", path: `tasks/${id}:cancel`, headers: H, ...(Object.keys(rest).length ? { body: rest } : {}) }; }
    case "SubscribeToTask": return { method: "POST", path: `tasks/${p.id}:subscribe`, headers: H };
    case "CreateTaskPushNotificationConfig": { const { taskId, ...rest } = p; return { method: "POST", path: `tasks/${taskId}/pushNotificationConfigs`, headers: H, body: rest }; }
    case "GetTaskPushNotificationConfig": return { method: "GET", path: `tasks/${p.taskId}/pushNotificationConfigs/${p.id}`, headers: H };
    case "ListTaskPushNotificationConfigs": { const { taskId, ...rest } = p; return { method: "GET", path: `tasks/${taskId}/pushNotificationConfigs`, headers: H, query: q(rest) }; }
    case "DeleteTaskPushNotificationConfig": return { method: "DELETE", path: `tasks/${p.taskId}/pushNotificationConfigs/${p.id}`, headers: H };
    case "GetExtendedAgentCard": return { method: "GET", path: "extendedAgentCard", headers: H };
    default: throw new Error(method);
  }
}
function httpError(name, message, data) {
  const [status, canonical] = HTTP[name];
  const strings = Object.fromEntries(Object.entries(data).filter(([, v]) => typeof v === "string"));
  const details = [{ "@type": "type.googleapis.com/google.rpc.ErrorInfo", reason: reasonOf(name), domain: "a2a-protocol.org", metadata: strings }];
  if (Object.keys(data).length) details.push({ "@type": "type.googleapis.com/google.protobuf.Struct", value: data });
  return { status, contentType: "application/a2a+json", body: { error: { code: status, status: canonical, message, details } } };
}
const unary = (request, response) => {
  const { method, params } = request.payload.a2a;
  return { request: route(method, params), response: { status: 200, contentType: "application/a2a+json", body: response.payload.a2a.result } };
};

// A2A objects.
const text = (t) => ({ text: t });
const userMsg = (id, parts, extra = {}) => ({ messageId: id, role: "ROLE_USER", parts, ...extra });
const agentMsg = (id, parts, extra = {}) => ({ messageId: id, role: "ROLE_AGENT", parts, ...extra });
const status = (state, sec, message) => ({ state, ...(message ? { message } : {}), timestamp: at(sec) });
const offering = (o) => ({ [EXT.offering]: { offering: o } });
const quoteArtifact = { artifactId: "art-quote-1", name: "quote", parts: [{ data: { item: "part 7741", units: 200, unitPriceMicro: 1250000, currency: "USD" } }] };

// ---------------------------------------------------------------- operations
const ops = [];
{
  clock = 0;
  const r = req("SendMessage", { message: userMsg("msg-1", [text("Is part 7741 in stock?")], { metadata: offering("stock") }) });
  const a = res(r, { result: { message: agentMsg("msg-1-reply", [text("Yes, 1,450 units of part 7741 are in stock.")], { contextId: "ctx-1" }) } });
  ops.push({ name: "SendMessage answered with a Message", operation: "SendMessage", frames: [r, a], http: unary(r, a) });
}
{
  const r = req("SendMessage", { message: userMsg("msg-2", [text("Quote 200 units of part 7741, delivered by Dec 1.")], { metadata: offering("quote") }) });
  const a = res(r, { result: { task: { id: "task-9f2c", contextId: "ctx-51a0", status: status("TASK_STATE_WORKING", clock + 0.1) } } });
  ops.push({ name: "SendMessage answered with a Task", operation: "SendMessage", frames: [r, a], http: unary(r, a) });
}
let streamCase;
{
  const r = req("SendStreamingMessage", { message: userMsg("msg-3", [text("Quote 50 units of part 7742.")], { metadata: offering("quote") }) });
  const tid = "task-7f00", ctx = "ctx-7f00";
  const events = [
    { task: { id: tid, contextId: ctx, status: status("TASK_STATE_SUBMITTED", clock + 0.1) } },
    { statusUpdate: { taskId: tid, contextId: ctx, status: status("TASK_STATE_WORKING", clock + 0.3) } },
    { artifactUpdate: { taskId: tid, contextId: ctx, artifact: { artifactId: "art-quote-2", name: "quote", parts: [text("Part 7742: 50 units at 3.10 USD.")] }, append: false, lastChunk: false } },
    { artifactUpdate: { taskId: tid, contextId: ctx, artifact: { artifactId: "art-quote-2", parts: [text(" Delivery in 5 days.")] }, append: true, lastChunk: true } },
    { statusUpdate: { taskId: tid, contextId: ctx, status: status("TASK_STATE_COMPLETED", clock + 1.2) } },
  ];
  const frames = events.map((e, i) => res(r, { result: e, streamId: r.id, seq: i, ...(i === events.length - 1 ? { final: true } : {}) }));
  const deliveries = frames.map((f, i) => ({ subject: i === 0 ? "inbox" : `mesh.task.${tid}.stream`, frame: f }));
  streamCase = { r, frames, deliveries, events, tid };
  ops.push({ name: "SendStreamingMessage: the first event to the inbox, the rest on the Task's stream subject", operation: "SendStreamingMessage", frames: [r], deliveries,
    http: { request: route("SendStreamingMessage", r.payload.a2a.params), response: { status: 200, contentType: "text/event-stream", events } } });
}
const doneTask = { id: "task-9f2c", contextId: "ctx-51a0", status: status("TASK_STATE_COMPLETED", 4), artifacts: [quoteArtifact] };
{
  const r = req("GetTask", { id: "task-9f2c", historyLength: 0 });
  const a = res(r, { result: doneTask });
  ops.push({ name: "GetTask, answered from the task store", operation: "GetTask", frames: [r, a], http: unary(r, a) });
}
{
  const r = req("ListTasks", { contextId: "ctx-51a0", pageSize: 10 });
  const a = res(r, { result: { tasks: [doneTask], nextPageToken: "", pageSize: 10, totalSize: 1 } });
  ops.push({ name: "ListTasks, filtered to Tasks the client may read", operation: "ListTasks", frames: [r, a], http: unary(r, a) });
}
{
  const r = req("CancelTask", { id: "task-a1b2" });
  const a = res(r, { result: { id: "task-a1b2", contextId: "ctx-a1b2", status: status("TASK_STATE_CANCELED", clock + 0.1) } });
  ops.push({ name: "CancelTask on a working Task", operation: "CancelTask", frames: [r, a], http: unary(r, a) });
}
{
  const r = req("SubscribeToTask", { id: "task-c3d4" });
  const events = [
    { task: { id: "task-c3d4", contextId: "ctx-c3d4", status: status("TASK_STATE_WORKING", clock) } },
    { statusUpdate: { taskId: "task-c3d4", contextId: "ctx-c3d4", status: status("TASK_STATE_COMPLETED", clock + 2) } },
  ];
  const frames = events.map((e, i) => res(r, { result: e, streamId: r.id, seq: i, ...(i === events.length - 1 ? { final: true } : {}) }));
  ops.push({ name: "SubscribeToTask, starting from the Task's current state", operation: "SubscribeToTask", frames: [r],
    deliveries: frames.map((f, i) => ({ subject: i === 0 ? "inbox" : "mesh.task.task-c3d4.stream", frame: f })),
    http: { request: route("SubscribeToTask", r.payload.a2a.params), response: { status: 200, contentType: "text/event-stream", events } } });
}
const pushOps = [
  ["CreateTaskPushNotificationConfig", { taskId: "task-9f2c", url: "https://hooks.client.example.com/a2a", token: "tok-1" }],
  ["GetTaskPushNotificationConfig", { taskId: "task-9f2c", id: "cfg-1" }],
  ["ListTaskPushNotificationConfigs", { taskId: "task-9f2c", pageSize: 10 }],
  ["DeleteTaskPushNotificationConfig", { taskId: "task-9f2c", id: "cfg-1" }],
];
for (const [method, params] of pushOps) {
  const r = req(method, params);
  const msg = "This agent does not send push notifications.";
  const a = errRes(r, "PushNotificationNotSupportedError", msg);
  ops.push({ name: `${method}, from an agent whose card says pushNotifications: false`, operation: method, frames: [r, a],
    http: { request: route(method, params), response: httpError("PushNotificationNotSupportedError", msg, {}) } });
}
{
  const r = req("GetExtendedAgentCard", {});
  const card = {
    name: "Quote desk", description: "Quotes parts for delivery.", version: "2.1.0",
    supportedInterfaces: [
      { url: `https://api.mesh.example.com/agents/${SERVER}`, protocolBinding: BINDING, protocolVersion: "1.0" },
      { url: `https://bridge.example.com/agents/${SERVER}/rpc`, protocolBinding: "JSONRPC", protocolVersion: "1.0" },
      { url: `https://bridge.example.com/agents/${SERVER}`, protocolBinding: "HTTP+JSON", protocolVersion: "1.0" },
    ],
    capabilities: { streaming: true, pushNotifications: false, extendedAgentCard: true,
      extensions: [{ uri: EXT.offering, required: false }, { uri: EXT.budget, required: false }, { uri: EXT.artifactRefs, required: false }] },
    defaultInputModes: ["text/plain", "application/json"], defaultOutputModes: ["text/plain", "application/json"],
    skills: [{ id: "quote", name: "Quote", description: "A priced quote for parts.", tags: ["quote"] }, { id: "stock", name: "Stock", description: "Whether a part is in stock.", tags: ["stock"] }],
  };
  const a = res(r, { result: card });
  ops.push({ name: "GetExtendedAgentCard, the client known from its signature", operation: "GetExtendedAgentCard", frames: [r, a], http: unary(r, a) });
}

// ------------------------------------------------------------------- errors
const errors = [];
const errCase = (name, method, params, errName, message, data = {}, over = {}) => {
  const r = req(method, params, over);
  const a = errRes(r, errName, message, data);
  const http = { request: route(method, params), response: httpError(errName, message, data) };
  if (over.meta?.a2a) http.request.headers = { ...over.meta.a2a };
  errors.push({ name, error: errName, frames: [r, a], jsonrpc: { jsonrpc: "2.0", id: 1, error: { code: CODES[errName], message, ...(Object.keys(data).length ? { data } : {}) } }, http });
};
errCase("a Task that does not exist, or that the client may not read", "GetTask", { id: "task-unknown" }, "TaskNotFoundError", "No task with that id.", { taskId: "task-unknown" });
errCase("canceling a Task in a terminal state", "CancelTask", { id: "task-9f2c" }, "TaskNotCancelableError", "The task is completed.", { taskId: "task-9f2c", state: "TASK_STATE_COMPLETED" });
errCase("push notifications from an agent that sends none", "CreateTaskPushNotificationConfig", { taskId: "task-9f2c", url: "https://hooks.client.example.com/a2a" }, "PushNotificationNotSupportedError", "This agent does not send push notifications.");
errCase("a Message to a Task in a terminal state", "SendMessage", { message: userMsg("msg-e4", [text("One more thing.")], { taskId: "task-9f2c", contextId: "ctx-51a0" }) }, "UnsupportedOperationError", "The task is in a terminal state.", { taskId: "task-9f2c" });
errCase("a Part of a media type the agent does not take", "SendMessage", { message: userMsg("msg-e5", [{ raw: "TVqQAAMAAAAEAAAA", mediaType: "application/x-msdownload", filename: "setup.exe" }]) }, "ContentTypeNotSupportedError", "This agent does not take application/x-msdownload.", { mediaType: "application/x-msdownload" });
errCase("an agent that relays a downstream agent's broken answer", "SendMessage", { message: userMsg("msg-e6", [text("Quote via the supplier.")], { metadata: offering("quote") }) }, "InvalidAgentResponseError", "The supplier's answer did not verify.");
errCase("an extended card the agent does not have", "GetExtendedAgentCard", {}, "ExtendedAgentCardNotConfiguredError", "This agent has no extended card.");
errCase("a required extension the client did not activate", "SendMessage", { message: userMsg("msg-e8", [text("Quote 10 units.")], { metadata: offering("quote") }) }, "ExtensionSupportRequiredError", "This agent requires the budget extension.", { extensions: [EXT.budget] });
errCase("an A2A version the agent does not speak", "GetTask", { id: "task-9f2c" }, "VersionNotSupportedError", "This agent speaks A2A 1.0.", { supported: ["1.0"] }, { meta: { a2a: { "A2A-Version": "0.3" } } });
errCase("an offering the agent does not declare", "SendMessage", { message: userMsg("msg-e10", [text("Launch it.")], { metadata: offering("launch") }) }, "InvalidParamsError", "This agent has no offering 'launch'.", { offerings: ["quote", "stock"] });
errCase("an agent that failed inside", "SendMessage", { message: userMsg("msg-e11", [text("Quote 10 units.")], { metadata: offering("quote") }) }, "InternalError", "The pricing service crashed.");
{
  const r = signEnvelope({ v: "0.4.0", id: fid(), type: "request", ts: tick(), from: CLIENT, to: SERVER, trace: TRACE, payload: { a2a: { method: "LaunchTask", params: { id: "task-9f2c" } } }, meta: META }, CLIENT_SEED);
  const a = signEnvelope({ v: "0.4.0", id: fid(), type: "respond", ts: tick(), from: SERVER, to: CLIENT, in_reply_to: r.id, trace: TRACE, payload: { a2a: {} },
    error: { code: "MethodNotFoundError", message: "No operation LaunchTask.", details: { a2a: { code: -32601, data: {} } }, retryable: false } }, SERVER_SEED);
  errors.push({ name: "an operation A2A does not define", error: "MethodNotFoundError", unknown_method: true, frames: [r, a], jsonrpc: { jsonrpc: "2.0", id: 1, error: { code: -32601, message: "No operation LaunchTask." } }, http: null });
}
const channel = [
  { name: "rate limited by the mesh", error: { code: "RATE_LIMITED", message: "Too many requests.", details: { retry_after_ms: 2000 }, retryable: true }, http_status: 429 },
  { name: "the agent is not reachable", error: { code: "AGENT_UNAVAILABLE", message: "The agent is not accepting requests.", retryable: true }, http_status: 502 },
  { name: "no answer within the reply window", error: { code: "TRANSPORT_TIMEOUT", message: "No answer in time.", retryable: true }, http_status: 504 },
  { name: "a Part too large to carry", error: { code: "PAYLOAD_TOO_LARGE", message: "The frame exceeds the mesh's size limit.", retryable: false }, http_status: 413 },
  { name: "the node's credential does not permit the subject", error: { code: "TRANSPORT_PERMISSION_DENIED", message: "Not permitted.", retryable: false }, http_status: 403 },
  { name: "an unexpected failure on the channel", error: { code: "INTERNAL_ERROR", message: "Something failed in the node.", retryable: true }, http_status: 500 },
].map((c) => ({ ...c, jsonrpc: { jsonrpc: "2.0", id: 1, error: { code: -32603, message: c.error.message, data: { agentmesh_code: c.error.code, ...(c.error.details ? { details: c.error.details } : {}) } } },
  http: { status: c.http_status, body: { error: { code: c.http_status, status: { 401: "UNAUTHENTICATED", 403: "PERMISSION_DENIED", 413: "INVALID_ARGUMENT", 429: "RESOURCE_EXHAUSTED", 500: "INTERNAL", 502: "UNAVAILABLE", 504: "DEADLINE_EXCEEDED" }[c.http_status], message: c.error.message,
    details: [{ "@type": "type.googleapis.com/google.rpc.ErrorInfo", reason: "INTERNAL", domain: "a2a-protocol.org", metadata: { agentmesh_code: c.error.code } }] } } } }));

// ------------------------------------------------------------ part by reference
const REF = "mesh:artifacts:01JC8Z2K9Q0DRAWING0000000001";
const DIGEST = "sha256:9f2b8c1d4e5a6b7c8d9e0f1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e";
const refPart = { url: REF, mediaType: "application/pdf", filename: "drawing-7741.pdf", metadata: { [EXT.artifactRefs]: { size: 48291337, digest: DIGEST } } };
const refReq = req("SendMessage", { message: userMsg("msg-r1", [text("Quote to this drawing."), refPart], { metadata: offering("quote"), extensions: [EXT.artifactRefs] }) });
const partByReference = {
  comment: "Binding §6, §12.5; the A2A Bridge §6. A Part too large to travel inline is a url Part whose value is an Agent Messaging artifact reference, with the artifact references extension giving its size and digest. The extension may sit on a reference of any carrier (a cid: attachment by email, an https: URL), and wherever it sits it must be well formed. Inbound it passes unchanged; outbound to a caller with no key the bridge may replace only the url with an HTTPS link, keeping size and digest.",
  frames: [refReq],
  http: { request: route("SendMessage", refReq.payload.a2a.params) },
  outbound_to_keyless_caller: { mesh: refPart, http: { ...refPart, url: "https://bridge.example.com/agents/x/artifacts/01JC8Z2K9Q0DRAWING0000000001" } },
  parts: [
    { name: "a reference with its size and digest", part: refPart, expect: { ok: true } },
    { name: "an HTTPS reference may carry the extension too (binding §12.5)", part: { url: "https://files.example.com/drawing-7741.pdf", mediaType: "application/pdf", metadata: { [EXT.artifactRefs]: { size: 48291337, digest: DIGEST } } }, expect: { ok: true } },
    { name: "an email attachment by cid: with the extension", part: { url: "cid:drawing-7741@mail.example.com", mediaType: "application/pdf", metadata: { [EXT.artifactRefs]: { size: 48291337, digest: DIGEST } } }, expect: { ok: true } },
    { name: "the extension malformed on an HTTPS reference", part: { url: "https://files.example.com/drawing-7741.pdf", metadata: { [EXT.artifactRefs]: { size: 48291337 } } }, expect: { ok: false } },
    { name: "an HTTPS url Part needs no extension", part: { url: "https://files.example.com/spec.pdf", mediaType: "application/pdf" }, expect: { ok: true } },
    { name: "a small file inline", part: { raw: "JVBERi0xLjcK", mediaType: "application/pdf", filename: "note.pdf" }, expect: { ok: true } },
    { name: "a reference without the extension", part: { url: REF, mediaType: "application/pdf" }, expect: { ok: false } },
    { name: "a digest in capitals", part: { ...refPart, metadata: { [EXT.artifactRefs]: { size: 48291337, digest: DIGEST.toUpperCase().replace("SHA256", "sha256") } } }, expect: { ok: false } },
    { name: "a size that is not a whole number", part: { ...refPart, metadata: { [EXT.artifactRefs]: { size: 12.5, digest: DIGEST } } }, expect: { ok: false } },
    { name: "two kinds of content in one Part", part: { ...refPart, text: "drawing" }, expect: { ok: false } },
    { name: "no content at all", part: { mediaType: "text/plain" }, expect: { ok: false } },
  ],
};

// -------------------------------------------------------------- stream resume
const sr = streamCase;
// A second stream that passes through an interrupted state, with another
// stream of the same Task interleaved on the shared subject.
clock = 50;
const s2 = req("SendStreamingMessage", { message: userMsg("msg-s2", [text("Quote 30 units of part 7743.")], { metadata: offering("quote") }) });
const t2 = "task-8a00", c2 = "ctx-8a00";
const ev2 = [
  { task: { id: t2, contextId: c2, status: status("TASK_STATE_WORKING", 50.5) } },
  { statusUpdate: { taskId: t2, contextId: c2, status: status("TASK_STATE_INPUT_REQUIRED", 51, agentMsg("st-s2", [text("Do you accept a split delivery?")])) } },
  { statusUpdate: { taskId: t2, contextId: c2, status: status("TASK_STATE_WORKING", 110) } },
  { statusUpdate: { taskId: t2, contextId: c2, status: status("TASK_STATE_COMPLETED", 140) } },
];
const f2 = ev2.map((e, i) => res(s2, { result: e, streamId: s2.id, seq: i, ...(i === ev2.length - 1 ? { final: true } : {}) }));
const d2 = f2.map((f, i) => ({ subject: i === 0 ? "inbox" : `mesh.task.${t2}.stream`, frame: f }));
const s2sub = req("SubscribeToTask", { id: t2 });
const otherStream = [
  { subject: "inbox", frame: res(s2sub, { result: { task: { id: t2, contextId: c2, status: ev2[1].statusUpdate.status } }, streamId: s2sub.id, seq: 0 }) },
  { subject: `mesh.task.${t2}.stream`, frame: res(s2sub, { result: ev2[2], streamId: s2sub.id, seq: 1 }) },
];
const badFinal = res(s2, { result: ev2[1], streamId: s2.id, seq: 1, final: true });
const streamResume = {
  comment: "Binding §8 (0.3.0-draft). The first event reaches the client's inbox; the rest are published to mesh.task.{taskId}.stream. Several streams of one Task share that subject, so every frame carries payload.a2a.streamId, the id of the request frame that opened the stream, and payload.a2a.seq counting from 0 within it; a client reads only its own stream's frames. The stream ends where A2A says, at a terminal state or with the Message that answers without a Task, and that frame carries final: true; an interrupted state keeps it open, and final on any other event is a broken stream. A client that loses its connection resumes its durable subscription after the last event it acknowledged; a redelivered event is dropped by seq. A gap it cannot close sends it to SubscribeToTask. Nothing after final is read. The events, in seq order, are the bridge's Server-Sent Events, one StreamResponse each.",
  request: sr.r,
  cases: [
    { name: "a connection dropped after seq 2 was acknowledged, resumed with a redelivery of seq 2", deliveries: [sr.deliveries[0], sr.deliveries[1], sr.deliveries[2], { drop: true, acknowledged: 2 }, sr.deliveries[2], sr.deliveries[3], sr.deliveries[4]],
      expect: { events: sr.events, complete: true } },
    { name: "an unbroken stream", deliveries: sr.deliveries, expect: { events: sr.events, complete: true } },
    { name: "a gap the subscription cannot close", deliveries: [sr.deliveries[0], sr.deliveries[1], sr.deliveries[3]],
      expect: { events: sr.events.slice(0, 2), complete: false, gap_at: 2, next: "SubscribeToTask" } },
    { name: "a frame after the final one is not read", deliveries: [...sr.deliveries, { subject: `mesh.task.${sr.tid}.stream`, frame: res(sr.r, { result: { statusUpdate: { taskId: sr.tid, contextId: "ctx-7f00", status: status("TASK_STATE_WORKING", 9) } }, streamId: sr.r.id, seq: 5 }) }],
      expect: { events: sr.events, complete: true, ignored: 1 } },
    { name: "a later event sent to the inbox instead of the stream subject", deliveries: [sr.deliveries[0], { subject: "inbox", frame: sr.deliveries[1].frame }],
      expect: { events: sr.events.slice(0, 1), complete: false, gap_at: 1, next: "SubscribeToTask" } },
    { name: "an interrupted state keeps the stream open, and another stream of the Task on the same subject is skipped by streamId", request: s2,
      deliveries: [d2[0], d2[1], otherStream[0], d2[2], otherStream[1], d2[3]],
      expect: { events: ev2, complete: true, skipped: 2 } },
    { name: "final on an interrupted state is a broken stream", request: s2, deliveries: [d2[0], { subject: `mesh.task.${t2}.stream`, frame: badFinal }],
      expect: { events: ev2.slice(0, 1), complete: false, broken: "final on an event that does not end the stream" } },
  ],
  http: { request: route("SendStreamingMessage", sr.r.payload.a2a.params), response: { status: 200, contentType: "text/event-stream", events: sr.events } },
};

// ------------------------------------------------------------------ long task
clock = 0;
const lr = req("SendMessage", { message: userMsg("msg-l1", [text("Reconcile the Q3 ledger against the bank statements.")], { metadata: offering("reconcile") }) });
const la = res(lr, { result: { task: { id: "task-long-1", contextId: "ctx-long-1", status: status("TASK_STATE_WORKING", 0.3) } } });
clock = 600;
const lg1 = req("GetTask", { id: "task-long-1" });
const lg1a = res(lg1, { result: { id: "task-long-1", contextId: "ctx-long-1", status: status("TASK_STATE_WORKING", 590, agentMsg("st-1", [text("Matched 4,100 of 6,020 lines.")])) } });
clock = 5400;
const lg2 = req("GetTask", { id: "task-long-1" });
const lg2a = res(lg2, { result: { id: "task-long-1", contextId: "ctx-long-1", status: status("TASK_STATE_COMPLETED", 5300), artifacts: [{ artifactId: "art-rec-1", name: "reconciliation", parts: [{ data: { matched: 6012, unmatched: 8 } }] }] } });
const longTask = {
  comment: "Binding §5, §15: a Task that runs far longer than the mesh's reply window. The first answer comes inside the window and is a Task; the client reads it later with GetTask, from the task store, and gets the same Task id each time until it is terminal. The same reads through the bridge's HTTP+JSON interface return the same objects.",
  reply_window_ms: 30000,
  exchanges: [
    { frames: [lr, la], http: unary(lr, la) },
    { frames: [lg1, lg1a], http: unary(lg1, lg1a) },
    { frames: [lg2, lg2a], http: unary(lg2, lg2a) },
  ],
};

// --------------------------------------------------------------------- budget
clock = 0;
const bReq = req("SendMessage", { message: userMsg("msg-b1", [text("Summarize controlling case law on anticipatory repudiation.")], {
  metadata: { ...offering("caselaw-summary"), [EXT.budget]: { deadline: "2026-11-20T17:00:00Z", revision: 0, costCeiling: { amountMicro: 4000000, currency: "USD" } } },
  extensions: [EXT.budget] }) }, { meta: { a2a: { "A2A-Version": "1.0", "A2A-Extensions": `${EXT.offering}, ${EXT.budget}` } } });
const bGet = req("GetTask", { id: "task-b1" });
const bExhausted = res(bGet, { result: {
  id: "task-b1", contextId: "ctx-b1",
  status: status("TASK_STATE_CANCELED", 3600, agentMsg("st-b1", [text("Stopped: the engagement's not-to-exceed cap was reached. The work done so far is attached.")])),
  artifacts: [{ artifactId: "art-b1", name: "partial summary", parts: [text("Three of five jurisdictions summarized.")] }],
  metadata: { [EXT.budget]: { outcome: "exhausted" } } } });
const bInsufficient = res(bReq, { result: { task: { id: "task-b2", contextId: "ctx-b2",
  status: status("TASK_STATE_REJECTED", 1, agentMsg("st-b2", [text("This work would cost about 5.00 USD, above the 4.00 USD ceiling.")])),
  metadata: { [EXT.budget]: { outcome: "insufficient", estimate: { amountMicro: 5000000, currency: "USD" } } } } } });
const bDeadline = res(bReq, { result: { task: { id: "task-b8", contextId: "ctx-b8",
  status: status("TASK_STATE_REJECTED", 1, agentMsg("st-b8", [text("This work cannot be finished by 20 November; the earliest is 24 November.")])),
  metadata: { [EXT.budget]: { outcome: "deadline_unmeetable", earliestCompletion: "2026-11-24T17:00:00Z" } } } } });
const bGetPaused = req("GetTask", { id: "task-b9" });
const pausedMeta = { outcome: "ceiling_reached", spent: { amountMicro: 900000, currency: "USD" }, estimateToFinish: { amountMicro: 2500000, currency: "USD" } };
const partial = [{ artifactId: "art-b9", name: "partial summary", parts: [text("Two of five jurisdictions summarized.")] }];
const bPaused = res(bGetPaused, { result: { id: "task-b9", contextId: "ctx-b9",
  status: status("TASK_STATE_INPUT_REQUIRED", 1800, agentMsg("st-b9", [text("Paused at the 4.00 USD ceiling after spending 0.90 USD. The work needs about 2.50 USD more. Raise the budget or cancel.")])),
  artifacts: partial, metadata: { [EXT.budget]: pausedMeta } } });
const bRevise = req("SendMessage", { message: userMsg("msg-b9", [text("Go ahead with the higher budget.")], { taskId: "task-b9", contextId: "ctx-b9",
  metadata: { [EXT.budget]: { deadline: "2026-11-20T17:00:00Z", revision: 1, costCeiling: { amountMicro: 7000000, currency: "USD" } } }, extensions: [EXT.budget] }) },
  { meta: { a2a: { "A2A-Version": "1.0", "A2A-Extensions": EXT.budget } } });
const bResumed = res(bRevise, { result: { task: { id: "task-b9", contextId: "ctx-b9", status: status("TASK_STATE_WORKING", 1900) } } });
const bGetLate = req("GetTask", { id: "task-b11" });
const bLate = res(bGetLate, { result: { id: "task-b11", contextId: "ctx-b11", status: status("TASK_STATE_COMPLETED", 90000, agentMsg("st-b11", [text("Done, a day after the deadline.")])),
  artifacts: [{ artifactId: "art-b11", name: "summary", parts: [text("Five of five jurisdictions summarized.")] }], metadata: { [EXT.budget]: { outcome: "completed_late" } } } });
const budget = {
  comment: "Binding §12.2 (0.3.0-draft), with the completed_late mark: a Task in TASK_STATE_COMPLETED that finished after its deadline carries {outcome: completed_late}, a marker and not a failure. The budget travels on the Message that starts or revises the work, under the budget extension's URI, in camelCase. Each outcome is a Task state with the outcome named in the Task's metadata under that URI: insufficient (with estimate) and deadline_unmeetable (with earliestCompletion) in TASK_STATE_REJECTED, ceiling_reached (with spent and estimateToFinish) in TASK_STATE_INPUT_REQUIRED, and exhausted in TASK_STATE_CANCELED with its artifacts kept. A client that knows the extension never records an exhausted Task as failed and never retries it; sending any other canceled or refused work again is the client's choice (may_retry). A paused Task resumes on a Message with a higher revision. During the transition window the older mark agentmesh.state: exhausted (the A2A Bridge §5.2) reads as exhausted.",
  uri: EXT.budget,
  blocks: {
    valid: [
      { deadline: "2026-11-20T17:00:00Z", revision: 0, costCeiling: { amountMicro: 4000000, currency: "USD" } },
      { deadline: "2026-11-20T17:00:00.000Z", revision: 3 },
      { revision: 0, costCeiling: { amountMicro: 0, currency: "EUR" } },
    ],
    invalid: [
      { case: "no_axes", block: { revision: 0 } },
      { case: "missing_revision", block: { deadline: "2026-11-20T17:00:00Z" } },
      { case: "float_money", block: { revision: 0, costCeiling: { amountMicro: 4000000.5, currency: "USD" } } },
      { case: "snake_case_from_0_3_0", block: { revision: 0, cost_ceiling: { amount_micro: 4000000, currency: "USD" } } },
      { case: "date_only_deadline", block: { revision: 0, deadline: "2026-11-20" } },
      { case: "null_axis", block: { revision: 0, deadline: null, costCeiling: { amountMicro: 100, currency: "USD" } } },
    ],
  },
  tasks: [
    { name: "stopped at the cap", frames: [bGet, bExhausted], window: true, expect: { reading: "exhausted", failed: false, may_retry: false } },
    { name: "refused as over budget", frames: [bReq, bInsufficient], window: true, expect: { reading: "insufficient", failed: false, may_retry: true } },
    { name: "refused: the deadline cannot be met", frames: [bReq, bDeadline], window: true, expect: { reading: "deadline_unmeetable", failed: false, may_retry: true } },
    { name: "paused at the cost ceiling", frames: [bGetPaused, bPaused], window: true, expect: { reading: "ceiling_reached", failed: false, may_retry: true } },
    { name: "the paused Task resumes on a higher revision", frames: [bRevise, bResumed], window: true, expect: { reading: "working", failed: false, may_retry: true } },
    { name: "ceiling_reached on a Task that is not paused is not the budget's", task: { id: "task-b10", contextId: "ctx-b10", status: status("TASK_STATE_WORKING", 60), metadata: { [EXT.budget]: { outcome: "ceiling_reached" } } }, window: true, expect: { reading: "working", failed: false, may_retry: true } },
    { name: "the older mark from a 0.3.0-wire agent, inside the window", task: { id: "task-b3", contextId: "ctx-b3", status: status("TASK_STATE_CANCELED", 60), metadata: { "agentmesh.state": "exhausted" } }, window: true, expect: { reading: "exhausted", failed: false, may_retry: false } },
    { name: "both marks, as a bridge writes them for a 0.3.0-wire agent", task: { id: "task-b4", contextId: "ctx-b4", status: status("TASK_STATE_CANCELED", 60), metadata: { [EXT.budget]: { outcome: "exhausted" }, "agentmesh.state": "exhausted" } }, window: true, expect: { reading: "exhausted", failed: false, may_retry: false } },
    { name: "the older mark alone, after the window", task: { id: "task-b5", contextId: "ctx-b5", status: status("TASK_STATE_CANCELED", 60), metadata: { "agentmesh.state": "exhausted" } }, window: false, expect: { reading: "canceled", failed: false, may_retry: true } },
    { name: "the outcome on a Task that is not canceled is not the budget's", task: { id: "task-b6", contextId: "ctx-b6", status: status("TASK_STATE_FAILED", 60), metadata: { [EXT.budget]: { outcome: "exhausted" } } }, window: true, expect: { reading: "failed", failed: true, may_retry: true } },
    { name: "completed after the deadline", frames: [bGetLate, bLate], window: true, expect: { reading: "completed_late", failed: false, may_retry: true } },
    { name: "a plain cancel", task: { id: "task-b7", contextId: "ctx-b7", status: status("TASK_STATE_CANCELED", 60) }, window: true, expect: { reading: "canceled", failed: false, may_retry: true } },
  ],
};
const withHeaders = (r, a) => { const h = unary(r, a); h.request.headers = { ...r.meta.a2a }; return h; };
for (const t of budget.tasks) if (t.frames) t.http = withHeaders(t.frames[0], t.frames[1]);
budget.overdue = {
  comment: "Binding §12.2: the overdue mark is {overdue: true} under the budget extension's URI on the status update event that reports the deadline passed; the state does not change and it is not a failure.",
  events: [
    { name: "overdue while working", event: { statusUpdate: { taskId: "task-b12", contextId: "ctx-b12", status: status("TASK_STATE_WORKING", 7300), metadata: { [EXT.budget]: { overdue: true } } } }, expect: { overdue: true, state: "TASK_STATE_WORKING", failed: false } },
    { name: "an ordinary update", event: { statusUpdate: { taskId: "task-b12", contextId: "ctx-b12", status: status("TASK_STATE_WORKING", 7400) } }, expect: { overdue: false, state: "TASK_STATE_WORKING", failed: false } },
    { name: "overdue must be true, not a string", event: { statusUpdate: { taskId: "task-b12", contextId: "ctx-b12", status: status("TASK_STATE_WORKING", 7500), metadata: { [EXT.budget]: { overdue: "yes" } } } }, expect: { overdue: false, state: "TASK_STATE_WORKING", failed: false } },
  ],
};

// --------------------------------------------------------------- cancel reasons
const CANCEL = "https://agentmessaging.ai/extensions/cancel/v1";
const ACTIVATE = (uri) => ({ meta: { a2a: { "A2A-Version": "1.0", "A2A-Extensions": uri } } });
const cReq = req("CancelTask", { id: "task-c1", metadata: { [CANCEL]: { reason: "superseded", note: "a broader query replaces this one" } } }, ACTIVATE(CANCEL));
const cRes = res(cReq, { result: { id: "task-c1", contextId: "ctx-c1", status: status("TASK_STATE_CANCELED", clock + 0.1), metadata: { [CANCEL]: { reason: "superseded", note: "a broader query replaces this one" } } } });
const cStock = req("CancelTask", { id: "task-c2" });
const cStockRes = res(cStock, { result: { id: "task-c2", contextId: "ctx-c2", status: status("TASK_STATE_CANCELED", clock + 0.1), metadata: { [CANCEL]: { reason: "user_requested" } } } });
const cBudget = req("CancelTask", { id: "task-b9", metadata: { [CANCEL]: { reason: "budget_exhausted", note: "not worth raising the ceiling" } } }, ACTIVATE(CANCEL));
const cBudgetRes = res(cBudget, { result: { id: "task-b9", contextId: "ctx-b9", status: status("TASK_STATE_CANCELED", clock + 0.1), artifacts: partial,
  metadata: { [EXT.budget]: pausedMeta, [CANCEL]: { reason: "budget_exhausted", note: "not worth raising the ceiling" } } } });
const CANCEL_LIST = ["user_requested", "superseded", "deadline_exceeded", "budget_exhausted", "upstream_cancelled", "policy", "needs_not_furnished", "dependency_failed"];
const cNoReason = req("CancelTask", { id: "task-c3" }, ACTIVATE(CANCEL));
const cBadReason = req("CancelTask", { id: "task-c4", metadata: { [CANCEL]: { reason: "bored" } } }, ACTIVATE(CANCEL));
const cancelReasons = {
  comment: "Binding §12.6 (0.2.0-draft). A CancelTask request carries its reason under the cancel extension's URI in its metadata: reason from the closed list of SPEC.md §10.8, an optional note, unmetNeed (kind:value; SPEC.md §10.8 spells it unmet_need on a 0.3.0 envelope) required with needs_not_furnished and allowed with no other reason, and dependency only with dependency_failed. The canceled Task carries the same object under the same URI. A CancelTask with no reason from a client that does not declare the extension (it does not activate it in A2A-Extensions) is recorded as user_requested. A client that declares the extension and sends no reason, or a reason outside the list, gets InvalidParamsError with the reasons in the error's data (0.3.0-draft). Through the bridge the reason passes unchanged and the bridge adds none.",
  uri: CANCEL,
  reasons: ["user_requested", "superseded", "deadline_exceeded", "budget_exhausted", "upstream_cancelled", "policy", "needs_not_furnished", "dependency_failed"],
  exchanges: [
    { name: "a reason and a note", frames: [cReq, cRes], http: withHeaders(cReq, cRes), recorded: { reason: "superseded", note: "a broader query replaces this one" } },
    { name: "a stock A2A client that sends no reason", frames: [cStock, cStockRes], http: withHeaders(cStock, cStockRes), recorded: { reason: "user_requested" } },
    { name: "a declaring client that sends no reason", frames: [cNoReason, errRes(cNoReason, "InvalidParamsError", "A cancel reason is required.", { reasons: CANCEL_LIST })], error: true, http: { request: { ...route("CancelTask", cNoReason.payload.a2a.params), headers: { ...cNoReason.meta.a2a } }, response: httpError("InvalidParamsError", "A cancel reason is required.", { reasons: CANCEL_LIST }) } },
    { name: "a declaring client that sends a reason outside the list", frames: [cBadReason, errRes(cBadReason, "InvalidParamsError", "Unknown cancel reason 'bored'.", { reasons: CANCEL_LIST })], error: true, http: { request: { ...route("CancelTask", cBadReason.payload.a2a.params), headers: { ...cBadReason.meta.a2a } }, response: httpError("InvalidParamsError", "Unknown cancel reason 'bored'.", { reasons: CANCEL_LIST }) } },
    { name: "canceling a Task paused at its ceiling", frames: [cBudget, cBudgetRes], http: withHeaders(cBudget, cBudgetRes), recorded: { reason: "budget_exhausted", note: "not worth raising the ceiling" } },
  ],
  objects: [
    { name: "a reason alone", value: { reason: "policy" }, expect: { ok: true } },
    { name: "needs_not_furnished with what was not furnished", value: { reason: "needs_not_furnished", unmetNeed: "credential:Salesforce" }, expect: { ok: true } },
    { name: "dependency_failed naming the dependency", value: { reason: "dependency_failed", dependency: "Colorado DMV" }, expect: { ok: true } },
    { name: "a reason not on the list", value: { reason: "bored" }, expect: { ok: false } },
    { name: "no reason in the object", value: { note: "stop" }, expect: { ok: false } },
    { name: "a reason in other capitals", value: { reason: "User_Requested" }, expect: { ok: false } },
    { name: "a note that is not text", value: { reason: "policy", note: 42 }, expect: { ok: false } },
    { name: "needs_not_furnished without unmetNeed", value: { reason: "needs_not_furnished" }, expect: { ok: false } },
    { name: "unmetNeed of the wrong shape", value: { reason: "needs_not_furnished", unmetNeed: "the licence" }, expect: { ok: false } },
    { name: "unmetNeed on another reason", value: { reason: "user_requested", unmetNeed: "credential:Salesforce" }, expect: { ok: false } },
    { name: "dependency on another reason", value: { reason: "policy", dependency: "Colorado DMV" }, expect: { ok: false } },
  ],
};

// ------------------------------------------------------------- failure reasons
const FAILURE = "https://agentmessaging.ai/extensions/failure/v1";
const fGet = req("GetTask", { id: "task-f1" });
const fRes = res(fGet, { result: { id: "task-f1", contextId: "ctx-f1", status: status("TASK_STATE_FAILED", 600, agentMsg("st-f1", [text("The DMV search form moved and the lookup cannot read it.")])),
  metadata: { [FAILURE]: { reason: "dependency_failed", dependency: "Colorado DMV" } } } });
const failureReasons = {
  comment: "Binding §12.7 (0.3.0-draft). A Task in TASK_STATE_FAILED may carry {reason} under the failure extension's URI, with the reason from SPEC.md §10.8's closed list and the field that reason requires: unmetNeed (kind:value) for needs_not_furnished, dependency for dependency_failed, and neither for another reason. A failure with no stated reason carries no object. The attribution of SPEC.md §10.8a is computed by the platform and never read from this object.",
  uri: FAILURE,
  exchange: { frames: [fGet, fRes], http: withHeaders(fGet, fRes) },
  tasks: [
    { name: "a dependency that broke", state: "TASK_STATE_FAILED", value: { reason: "dependency_failed", dependency: "Colorado DMV" }, expect: { ok: true } },
    { name: "a need the client did not furnish", state: "TASK_STATE_FAILED", value: { reason: "needs_not_furnished", unmetNeed: "credential:Salesforce" }, expect: { ok: true } },
    { name: "a reason that needs no extra field", state: "TASK_STATE_FAILED", value: { reason: "policy" }, expect: { ok: true } },
    { name: "a failure with no stated reason carries nothing", state: "TASK_STATE_FAILED", value: null, expect: { ok: true } },
    { name: "needs_not_furnished without unmetNeed", state: "TASK_STATE_FAILED", value: { reason: "needs_not_furnished" }, expect: { ok: false } },
    { name: "the 0.3.0 snake case is not a 0.4.0 spelling", state: "TASK_STATE_FAILED", value: { reason: "needs_not_furnished", unmet_need: "credential:Salesforce" }, expect: { ok: false } },
    { name: "dependency on another reason", state: "TASK_STATE_FAILED", value: { reason: "policy", dependency: "Colorado DMV" }, expect: { ok: false } },
    { name: "a reason outside the list", state: "TASK_STATE_FAILED", value: { reason: "gremlins" }, expect: { ok: false } },
    { name: "an attribution in the object is not an input", state: "TASK_STATE_FAILED", value: { reason: "dependency_failed", dependency: "Colorado DMV", attribution: "client" }, expect: { ok: false } },
    { name: "the extension on a Task that did not fail", state: "TASK_STATE_COMPLETED", value: { reason: "policy" }, expect: { ok: false } },
  ],
};

// ------------------------------------------------------- trial, reply and receipt
const TRIAL = "https://agentmessaging.ai/extensions/trial/v1";
const REPLY = "https://agentmessaging.ai/extensions/reply/v1";
const RECEIPTS = "mesh://extensions/receipts/v1";
const BUDGET_URI = "https://agentmessaging.ai/extensions/budget/v1";
const trialReplyReceipt = {
  comment: "Binding §12.8 to §12.10 (0.4.0-draft). A trial is {trial: true} under the trial extension's URI on the Message that starts the work, and never with a budget; a refused trial is a TASK_STATE_REJECTED Task with {refusal: TRIAL_REFUSED, reason} under the same URI, the reason from the Common Agent Specification §7.7. A reply sent as a new call carries the received Message's contextId and {inReplyTo: messageId} under the reply extension's URI. A receipt is asked for with {receipt: summary or full} under EXT-15's URI on the starting Message.",
  uris: { trial: TRIAL, reply: REPLY, receipts: RECEIPTS },
  messages: [
    { name: "a trial request", metadata: { [TRIAL]: { trial: true } }, expect: { ok: true } },
    { name: "a trial with a budget is refused", metadata: { [TRIAL]: { trial: true }, [BUDGET_URI]: { deadline: "2026-11-20T17:00:00Z", revision: 0 } }, expect: { ok: false } },
    { name: "trial must be true", metadata: { [TRIAL]: { trial: "yes" } }, expect: { ok: false } },
    { name: "a reply naming the message it answers", contextId: "ctx-r1", metadata: { [REPLY]: { inReplyTo: "msg-r0" } }, expect: { ok: true } },
    { name: "a reply with no contextId", metadata: { [REPLY]: { inReplyTo: "msg-r0" } }, expect: { ok: false } },
    { name: "the 0.3.0 snake case in a reply", contextId: "ctx-r1", metadata: { [REPLY]: { in_reply_to: "msg-r0" } }, expect: { ok: false } },
    { name: "a summary receipt asked for", metadata: { [RECEIPTS]: { receipt: "summary" } }, expect: { ok: true } },
    { name: "a full receipt asked for", metadata: { [RECEIPTS]: { receipt: "full" } }, expect: { ok: true } },
    { name: "a receipt level outside the list", metadata: { [RECEIPTS]: { receipt: "everything" } }, expect: { ok: false } },
  ],
  tasks: [
    { name: "a refused trial", state: "TASK_STATE_REJECTED", value: { refusal: "TRIAL_REFUSED", reason: "requester_day", limit: 3 }, expect: { ok: true } },
    { name: "a trial refusal with a reason outside the list", state: "TASK_STATE_REJECTED", value: { refusal: "TRIAL_REFUSED", reason: "bored" }, expect: { ok: false } },
    { name: "a trial refusal on a Task that was not rejected", state: "TASK_STATE_FAILED", value: { refusal: "TRIAL_REFUSED", reason: "day" }, expect: { ok: false } },
  ],
};

// ------------------------------------------------------- carriers without subjects
clock = 0;
const eReq = req("SendMessage", { message: userMsg("msg-m1", [text("Quote 20 units of part 7741.")], { metadata: offering("quote") }) });
const eTasks = [
  { id: "task-m1", contextId: "ctx-m1", status: status("TASK_STATE_WORKING", 1) },
  { id: "task-m1", contextId: "ctx-m1", status: status("TASK_STATE_INPUT_REQUIRED", 300, agentMsg("st-m1", [text("Do you accept a split delivery?")])) },
  { id: "task-m1", contextId: "ctx-m1", status: status("TASK_STATE_COMPLETED", 900), artifacts: [quoteArtifact] },
];
const eFrames = eTasks.map((t, i) => res(eReq, { result: i === 0 ? { task: t } : t, seq: i }));
const eStream = req("SendStreamingMessage", { message: userMsg("msg-m2", [text("Quote 20 units, streaming.")], { metadata: offering("quote") }) });
const carrierWithoutSubjects = {
  comment: "Binding §8 (0.2.0-draft), carriers without subjects, such as email. Each later change to a Task is a respond frame to the client whose result is the whole Task as it then stands, numbered by payload.a2a.seq. The client reads them in seq order, whatever order they arrive in, and the Task it holds is the one with the highest seq it has read without a gap. Such a carrier answers SendStreamingMessage and SubscribeToTask with UnsupportedOperationError.",
  request: eReq,
  cases: [
    { name: "in order", frames: [eFrames[0], eFrames[1], eFrames[2]], expect: { seq: 2, state: "TASK_STATE_COMPLETED" } },
    { name: "out of order, as mail may arrive", frames: [eFrames[2], eFrames[0], eFrames[1]], expect: { seq: 2, state: "TASK_STATE_COMPLETED" } },
    { name: "the same frame twice", frames: [eFrames[0], eFrames[1], eFrames[1]], expect: { seq: 1, state: "TASK_STATE_INPUT_REQUIRED" } },
    { name: "a gap: seq 1 has not arrived", frames: [eFrames[0], eFrames[2]], expect: { seq: 0, state: "TASK_STATE_WORKING", waiting_for: 1 } },
  ],
  streaming: { frames: [eStream, errRes(eStream, "UnsupportedOperationError", "This carrier cannot stream.")] },
};

// ------------------------------------------------------------------- offering
const offeringRouting = {
  comment: "Binding §12.1; the A2A Bridge §4.5. The offering a Message calls is the offering extension's value in its metadata. One declared offering serves a Message that names none; with several, naming none or an undeclared one is InvalidParamsError (-32602) listing the offerings. During the transition window the older keys agentmesh.offering and agentmesh.skill are still read from a caller with no key: the bridge adds the extension's key with the same value before it signs, and refuses the two disagreeing.",
  uri: EXT.offering,
  cases: [
    { name: "the extension names a declared offering", declared: ["quote", "stock"], metadata: offering("quote"), window: true, expect: { offering: "quote" } },
    { name: "none named, one declared", declared: ["quote"], metadata: {}, window: true, expect: { offering: "quote" } },
    { name: "none named, several declared", declared: ["quote", "stock"], metadata: {}, window: true, expect: { error: -32602, offerings: ["quote", "stock"] } },
    { name: "an undeclared offering", declared: ["quote", "stock"], metadata: offering("launch"), window: true, expect: { error: -32602, offerings: ["quote", "stock"] } },
    { name: "the older key, inside the window", declared: ["quote", "stock"], metadata: { "agentmesh.offering": "stock" }, window: true, expect: { offering: "stock", added: true } },
    { name: "the pre-rename key, inside the window", declared: ["quote", "stock"], metadata: { "agentmesh.skill": "stock" }, window: true, expect: { offering: "stock", added: true } },
    { name: "both keys, agreeing", declared: ["quote", "stock"], metadata: { ...offering("quote"), "agentmesh.offering": "quote" }, window: true, expect: { offering: "quote" } },
    { name: "both keys, disagreeing", declared: ["quote", "stock"], metadata: { ...offering("quote"), "agentmesh.offering": "stock" }, window: true, expect: { error: -32602, offerings: ["quote", "stock"] } },
    { name: "the older key after the window names nothing", declared: ["quote", "stock"], metadata: { "agentmesh.offering": "stock" }, window: false, expect: { error: -32602, offerings: ["quote", "stock"] } },
  ],
};
{
  const httpBody = { message: userMsg("msg-o1", [text("Is part 7741 in stock?")], { metadata: { "agentmesh.offering": "stock" } }) };
  const frame = req("SendMessage", { message: userMsg("msg-o1", [text("Is part 7741 in stock?")], { metadata: { "agentmesh.offering": "stock", ...offering("stock") } }) },
    { meta: { a2a: { "A2A-Version": "1.0", "A2A-Extensions": EXT.offering } } });
  offeringRouting.added_key = { comment: "A caller with no key sent only the older key; the frame the bridge signs carries the extension's key beside it and lists the extension in A2A-Extensions. Nothing else in the Message changes.", http_body: httpBody, frame };
}

// ------------------------------------------------- frames that keep 0.3.0 fields
const legacy = (over, v = "0.4.0") => signEnvelope({ v, id: fid(), type: "request", ts: tick(), from: CLIENT, to: SERVER, trace: TRACE,
  payload: v === "0.4.0" ? { a2a: { method: "SendMessage", params: { message: userMsg("msg-x", [text("Status?")], { taskId: "task-9f2c", contextId: "ctx-51a0" }) } } } : { offering: "quote", input: { text: "Status?" } },
  ...(v === "0.4.0" ? { meta: META } : {}), ...over }, CLIENT_SEED);
const legacyFields = {
  comment: "Binding §4, §14. The Task id, the context id, the budget and the artifacts are carried in the A2A object. A receiver refuses a 0.4.0 frame that carries the envelope fields task_id, context_id, budget or artifacts with INVALID_ENVELOPE. A 0.3.0 envelope, whose calls use the request payloads of Agent Messaging 0.9, still carries them and is accepted until the operator ends the transition window; after it, a 0.3.0 envelope is refused with INVALID_VERSION.",
  cases: [
    { name: "a clean 0.4.0 frame", frame: legacy({}), window: true, expect: { ok: true } },
    { name: "a 0.4.0 frame carrying task_id", frame: legacy({ task_id: "task-9f2c" }), window: true, expect: { ok: false, code: "INVALID_ENVELOPE" } },
    { name: "a 0.4.0 frame carrying context_id", frame: legacy({ context_id: "ctx-51a0" }), window: true, expect: { ok: false, code: "INVALID_ENVELOPE" } },
    { name: "a 0.4.0 frame carrying budget", frame: legacy({ budget: { revision: 0, cost_ceiling: { amount_micro: 4000000, currency: "USD" } } }), window: true, expect: { ok: false, code: "INVALID_ENVELOPE" } },
    { name: "a 0.4.0 frame carrying artifacts", frame: legacy({ artifacts: [{ digest: DIGEST, ref: REF, name: "drawing.pdf", role: "input" }] }), window: true, expect: { ok: false, code: "INVALID_ENVELOPE" } },
    { name: "a 0.4.0 respond frame carrying task_id", frame: signEnvelope({ v: "0.4.0", id: fid(), type: "respond", ts: tick(), from: SERVER, to: CLIENT, in_reply_to: "0199b000-0000-7000-8000-000000000001", trace: TRACE, task_id: "task-9f2c", payload: { a2a: { result: { id: "task-9f2c", contextId: "ctx-51a0", status: status("TASK_STATE_WORKING", 1) } } } }, SERVER_SEED), window: true, expect: { ok: false, code: "INVALID_ENVELOPE" } },
    { name: "a 0.3.0 envelope carrying task_id, inside the window", frame: legacy({ task_id: "task-9f2c" }, "0.3.0"), window: true, expect: { ok: true } },
    { name: "a 0.3.0 envelope after the window", frame: legacy({ task_id: "task-9f2c" }, "0.3.0"), window: false, expect: { ok: false, code: "INVALID_VERSION" } },
    { name: "a 0.4.0 frame addressed to another agent still verifies; addressing is checked elsewhere", frame: legacy({ to: OTHER }), window: true, expect: { ok: true } },
  ],
};

const fixture = {
  fixture: "a2a-binding",
  spec: "A2A over Agent Messaging (bindings/a2a.md), §15, with the A2A Bridge's HTTP+JSON interface (bindings/a2a-bridge.md, §4, §7, §13)",
  comment: "TEST VECTORS. The client signs with the published test seed of audience.json; the server agent signs with the published responder seed of emailing/conformance/cases.json. Neither controls anything. Each operation appears as signed frames over the binding and as the same call through a bridge's HTTP+JSON interface, and the A2A objects must agree. Each case stands alone. lib/check-a2a-binding.mjs runs every case against reference readings; an implementation reads this file in its own tests. Generated by lib/make-a2a-binding-fixture.mjs.",
  identities: { client_seed: CLIENT_SEED, client: CLIENT, server_seed: SERVER_SEED, server: SERVER, comment: "client_seed is messaging/conformance/audience.json's sender_seed; server_seed is emailing/conformance/cases.json's responder_seed." },
  binding_uri: BINDING,
  wire_version: "0.4.0",
  extensions: EXT,
  operations: { comment: "Binding §5 and the A2A Bridge §4.1: every A2A operation, as frames and as the bridge's HTTP+JSON call. The HTTP request is the A2A request object with its path and query parameters placed as A2A §11 names them, and the HTTP answer is the respond frame's payload.a2a.result unchanged (or the error, §7). A streaming answer's Server-Sent Events are the frames' results in seq order.", cases: ops },
  errors: { comment: "Binding §9 and the A2A Bridge §7.1, §13.3: every A2A error. The frame's error.code is the A2A error's name and details.a2a.code its JSON-RPC integer; the JSON-RPC error uses that integer, the message and details.a2a.data; the HTTP+JSON error is google.rpc.Status with the reason formed from the name. Channel errors keep their Agent Messaging codes, have no A2A name, and reach an HTTP caller as -32603 with data.agentmesh_code (the A2A Bridge §7.2).", cases: errors, channel },
  part_by_reference: partByReference,
  stream_resume: streamResume,
  long_task: longTask,
  budget,
  cancel_reasons: cancelReasons,
  failure_reasons: failureReasons,
  trial_reply_receipt: trialReplyReceipt,
  carrier_without_subjects: carrierWithoutSubjects,
  offering: offeringRouting,
  legacy_fields: legacyFields,
};

writeFileSync(join(HERE, "..", "a2a-binding.json"), JSON.stringify(fixture, null, 2) + "\n");
console.log("wrote a2a-binding.json");
