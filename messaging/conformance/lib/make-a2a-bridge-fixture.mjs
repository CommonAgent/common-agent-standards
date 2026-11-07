#!/usr/bin/env node
// Writes ../a2a-bridge.json, the fixture set for the A2A Bridge
// (bindings/a2a-bridge.md, 0.9.1-draft) and its extension EXT-14 (Agent
// Messaging over A2A, 0.4.1-draft).
//
//   node messaging/conformance/lib/make-a2a-bridge-fixture.mjs
//
// The envelopes are really signed, with published test seeds only: the caller
// signs with the seed audience.json, accept-signal.json and budget.json use,
// and the agent signs with the published responder seed of Agent Emailing's
// emailing/conformance/cases.json. So no new private-key-shaped string enters
// the repository. Times are fixed, so the file is the same on every run.
// Carried frames are wire version 0.4.0, the binding's (bindings/a2a.md);
// the cases marked wire 0.3.0 are the ones the transition window keeps.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { signEnvelope } from "./envelope-vectors.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..", "..", "..");
const caller = JSON.parse(readFileSync(join(HERE, "..", "audience.json"), "utf8")).identities;
const agent = JSON.parse(readFileSync(join(REPO, "emailing", "conformance", "cases.json"), "utf8")).identities;
const SEED = caller.sender_seed;
const CALLER = caller.sender;
const AGENT_SEED = agent.responder_seed;
const AGENT = agent.responder;
const OTHER = "UAKQRYZBYFOC65OQZVJ3QPCIERDTRNNZPMOJUYXC3DGPRCDWSKD4HV5A";
const NOW = "2026-11-07T18:00:00Z";
const TRACE = { trace_id: "4bf92f3577b34da6a3ce929d0e0e4736", span_id: "00f067aa0ba902b7" };
const URI = "mesh://extensions/agent-messaging-over-a2a/v1";
const OFFERING = "https://agentmessaging.ai/extensions/offering/v1";
const BUDGET = "https://agentmessaging.ai/extensions/budget/v1";
const AUDIENCE = "https://agentmessaging.ai/extensions/audience/v1";
const MARKER = "mesh://extensions/a2a-bridge/v1";

let n = 0;
const nextId = () => `0199a000-0000-7000-8000-${String(++n).padStart(12, "0")}`;
const msg = (over = {}) => ({ messageId: "msg-1", role: "ROLE_USER", parts: [{ text: "Quote for the attached parts list." }], metadata: { [OFFERING]: { offering: "request-quote" } }, ...over });

/** A carried 0.4.0 request frame. */
const frame = (over = {}, a2a = { method: "SendMessage", params: { message: msg() } }) => signEnvelope({
  v: "0.4.0", id: nextId(), type: "request", ts: "2026-11-07T17:59:30Z", from: CALLER, to: AGENT, trace: TRACE,
  payload: { a2a }, meta: { a2a: { "A2A-Version": "1.0" } }, ...over,
}, SEED);
/** A carried 0.3.0 envelope, for the transition window. */
const env03 = (over = {}) => signEnvelope({
  v: "0.3.0", id: nextId(), type: "request", ts: "2026-11-07T17:59:30Z", from: CALLER, to: AGENT, trace: TRACE,
  payload: { offering: "request-quote", input: { parts_list: "parts-list.csv" } }, ...over,
}, SEED);

const signed = frame();
const forged = { ...signed, payload: { a2a: { method: "SendMessage", params: { message: msg({ parts: [{ text: "Quote for the attached parts list, version 2." }] }) } } } };
const send = (message) => ({ operation: "SendMessage", message });

const normalize = (t) => {
  const lines = t.replace(/\r\n?/g, "\n").split("\n").map((l) => l.replace(/[ \t]+$/, ""));
  while (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines.join("\n");
};
const digest = (t) => `sha256:${createHash("sha256").update(normalize(t), "utf8").digest("hex")}`;
const personText = `From ${CALLER}\n\nCan we meet on Tuesday?`;
const personMsg = { messageId: "msg-p", role: "ROLE_USER", parts: [{ text: "Can we meet on Tuesday?" }], extensions: [AUDIENCE], metadata: { [AUDIENCE]: { audience: "person" } } };
const personFrame = frame({ meta: { a2a: { "A2A-Version": "1.0", "A2A-Extensions": AUDIENCE }, readable_text: { v: 1, text: digest(personText) } } }, { method: "SendMessage", params: { message: personMsg } });
const personEnv03 = env03({ payload: { text: "Can we meet on Tuesday?" }, meta: { audience: "person", readable_text: { v: 1, text: digest(personText) } } });

// The agent's signed answers (EXT-14 §5).
const answerTo = (request, result) => signEnvelope({
  v: "0.4.0", id: nextId(), type: "respond", ts: "2026-11-07T17:59:31Z", from: AGENT, to: CALLER, in_reply_to: request.id, trace: TRACE, payload: { a2a: { result } },
}, AGENT_SEED);
const taskAnswer = answerTo(signed, { task: { id: "task-q1", contextId: "ctx-q1", status: { state: "TASK_STATE_WORKING", timestamp: "2026-11-07T17:59:31.000Z" } } });
const msgAnswer = answerTo(signed, { message: { messageId: "msg-1-reply", role: "ROLE_AGENT", parts: [{ text: "Received; quoting now." }], contextId: "ctx-q1" } });
const withFrame = (obj, f) => ({ ...obj, metadata: { ...(obj.metadata ?? {}), [URI]: { envelope: f } } });
const cancelFrame = frame({}, { method: "CancelTask", params: { id: "task-q1" } });
const getFrame = frame({}, { method: "GetTask", params: { id: "task-q1" } });

const fixture = {
  fixture: "a2a-bridge",
  spec: "The A2A Bridge 0.9.1-draft (bindings/a2a-bridge.md) and EXT-14 0.4.1-draft, Agent Messaging over A2A (extensions/EXT-14-agent-messaging-over-a2a.md)",
  comment: "TEST VECTORS. The caller signs with the published test seed of audience.json; the agent signs with the published responder seed of emailing/conformance/cases.json. Carried frames are wire version 0.4.0 (bindings/a2a.md); cases marked wire 0.3.0 are the ones the binding's transition window keeps. lib/check-a2a-bridge-fixture.mjs runs every case against reference readings of the rules; an implementation reads this file in its own tests. Generated by lib/make-a2a-bridge-fixture.mjs.",
  identities: { caller_seed: SEED, caller: CALLER, agent_seed: AGENT_SEED, agent: AGENT },
  extension_uri: URI,
  now: NOW,
  declared_offerings: ["request-quote"],
  signed_callers: {
    comment: "EXT-14 §4: the checks a bridge runs on a carried frame before it relays it. call is the A2A call that carries it: its operation and the outer message or request. A failure refuses the call with -32602, data.agentmesh_code INVALID_ENVELOPE and data.reason, and relays nothing. A frame that passes is relayed unchanged.",
    cases: [
      { name: "a signed request", envelope: signed, call: send(msg()), expect: { ok: true } },
      { name: "a forged frame: the message changed after signing", envelope: forged, call: send(msg()), expect: { ok: false, reason: "signature" } },
      { name: "no signature at all", envelope: (({ sig: _s, ...rest }) => rest)(signed), call: send(msg()), expect: { ok: false, reason: "malformed" } },
      { name: "a 0.4.0 frame that carries task_id", envelope: frame({ task_id: "task-q1" }), call: send(msg()), expect: { ok: false, reason: "malformed" } },
      { name: "a 0.4.0 frame that carries the envelope field budget", envelope: frame({ budget: { revision: 0, cost_ceiling: { amount_micro: 5000000, currency: "USD" } } }), call: send(msg()), expect: { ok: false, reason: "malformed" } },
      { name: "a 0.4.0 frame with no payload.a2a", envelope: frame({ payload: { offering: "request-quote", input: {} } }), call: send(msg()), expect: { ok: false, reason: "malformed" } },
      { name: "addressed to another agent", envelope: frame({ to: OTHER }), call: send(msg()), expect: { ok: false, reason: "addressee" } },
      { name: "outside the freshness window", envelope: frame({ ts: "2026-11-07T16:00:00Z" }), call: send(msg()), expect: { ok: false, reason: "stale" } },
      { name: "a respond is not carried on SendMessage", envelope: frame({ type: "respond", in_reply_to: "0199a000-0000-7000-8000-000000000999" }, { result: { message: { messageId: "m", role: "ROLE_AGENT", parts: [] } } }), call: send(msg()), expect: { ok: false, reason: "type" } },
      { name: "a GetTask frame carried on SendMessage", envelope: frame({}, { method: "GetTask", params: { id: "task-q1" } }), call: send(msg()), expect: { ok: false, reason: "method" } },
      { name: "an offering the agent does not declare", envelope: frame({}, { method: "SendMessage", params: { message: msg({ metadata: { [OFFERING]: { offering: "launch" } } }) } }), call: send(msg()), expect: { ok: false, reason: "offering" } },
      { name: "no offering named: the agent routes it (binding §12.1)", envelope: frame({}, { method: "SendMessage", params: { message: msg({ metadata: {} }) } }), call: send(msg({ metadata: {} })), expect: { ok: true } },
      { name: "a message for the person carries no offering", envelope: personFrame, call: send(personMsg), expect: { ok: true } },
      { name: "the outer taskId differs from the frame's", envelope: frame({}, { method: "SendMessage", params: { message: msg({ taskId: "task-1" }) } }), call: send(msg({ taskId: "task-2" })), expect: { ok: false, reason: "mismatch" } },
      { name: "an answer on a Task, the ids agreeing", envelope: frame({}, { method: "SendMessage", params: { message: msg({ taskId: "task-1", contextId: "ctx-1", parts: [{ text: "Yes, split the delivery." }] }) } }), call: send(msg({ taskId: "task-1", contextId: "ctx-1" })), expect: { ok: true } },
      { name: "a signed CancelTask for the Task the call names", envelope: cancelFrame, call: { operation: "CancelTask", params: { id: "task-q1" } }, expect: { ok: true } },
      { name: "a signed CancelTask naming another Task", envelope: cancelFrame, call: { operation: "CancelTask", params: { id: "task-q2" } }, expect: { ok: false, reason: "mismatch" } },
      { name: "a signed GetTask in the Agent-Messaging-Frame header", envelope: getFrame, call: { operation: "GetTask", params: { id: "task-q1" } }, expect: { ok: true } },
      { name: "wire 0.3.0: a signed request, inside the window", wire: "0.3.0", envelope: env03(), call: send(msg()), expect: { ok: true } },
      { name: "wire 0.3.0: a knock is carried, though no agent declares it", wire: "0.3.0", envelope: env03({ payload: { offering: "knock", input: {} } }), call: send(msg()), expect: { ok: true } },
      { name: "wire 0.3.0: an offering the agent does not declare", wire: "0.3.0", envelope: env03({ payload: { offering: "launch", input: {} } }), call: send(msg()), expect: { ok: false, reason: "offering" } },
      { name: "wire 0.3.0: message.taskId differs from the envelope's task_id", wire: "0.3.0", envelope: env03({ task_id: "task-1" }), call: send(msg({ taskId: "task-2" })), expect: { ok: false, reason: "mismatch" } },
      { name: "wire 0.3.0: a message for the person carries no offering", wire: "0.3.0", envelope: personEnv03, call: send(personMsg), expect: { ok: true } },
    ],
  },
  answers: {
    comment: "EXT-14 §5: the A2A result the bridge returns is the agent's payload.a2a.result unchanged, with the agent's signed frame added under the extension's URI in the Message's or the Task's metadata, and nothing else.",
    cases: [
      { name: "a Task", request: signed, frame: taskAnswer, a2a_result: { task: withFrame(taskAnswer.payload.a2a.result.task, taskAnswer) } },
      { name: "a Message", request: signed, frame: msgAnswer, a2a_result: { message: withFrame(msgAnswer.payload.a2a.result.message, msgAnswer) } },
    ],
  },
  unsigned_callers: {
    comment: "The A2A Bridge §8.3, §9.0: every frame a bridge signs for a caller with no key carries both markers in meta, with the same caller_ref and caller_kind, front a2a, and never the caller's account.",
    cases: [
      { name: "an account key's caller", meta: { identity_bridge: { bridge: "UNODEEXAMPLEEXAMPLEEXAMPLEEXAMPLEEXAMPLEEXAMPLEEXAMPLEEX", caller_ref: "c0ffee00-0000-4000-8000-000000000001", caller_kind: "account", front: "a2a" }, a2a_bridge: { direction: "inbound", node: "UNODEEXAMPLEEXAMPLEEXAMPLEEXAMPLEEXAMPLEEXAMPLEEXAMPLEEX", caller_ref: "c0ffee00-0000-4000-8000-000000000001", caller_kind: "account", a2a_protocol_version: "1.0" } }, expect: { ok: true } },
      { name: "a marker that names the account", meta: { identity_bridge: { bridge: "UNODE", caller_ref: "r", caller_kind: "account", front: "a2a", account: "acct_123" }, a2a_bridge: { direction: "inbound", node: "UNODE", caller_ref: "r", caller_kind: "account", a2a_protocol_version: "1.0" } }, expect: { ok: false } },
      { name: "the two markers disagree", meta: { identity_bridge: { bridge: "UNODE", caller_ref: "r1", caller_kind: "account", front: "a2a" }, a2a_bridge: { direction: "inbound", node: "UNODE", caller_ref: "r2", caller_kind: "account", a2a_protocol_version: "1.0" } }, expect: { ok: false } },
    ],
  },
  states: {
    comment: "The A2A Bridge §5. States are A2A's own, by enum name, on both A2A bindings and on the mesh; there is nothing to map. A2A 0.3's lowercase spellings are never sent. During the transition window an agent that answers in 0.3.0 envelopes has its states spelled as A2A 1.0 spells them; its exhausted is TASK_STATE_CANCELED with the budget extension's outcome and the older agentmesh.state mark.",
    a2a: [
      { state: "TASK_STATE_SUBMITTED", kind: "active" },
      { state: "TASK_STATE_WORKING", kind: "active" },
      { state: "TASK_STATE_INPUT_REQUIRED", kind: "interrupted" },
      { state: "TASK_STATE_AUTH_REQUIRED", kind: "interrupted" },
      { state: "TASK_STATE_COMPLETED", kind: "terminal" },
      { state: "TASK_STATE_FAILED", kind: "terminal" },
      { state: "TASK_STATE_CANCELED", kind: "terminal" },
      { state: "TASK_STATE_REJECTED", kind: "terminal" },
    ],
    never_sent: ["submitted", "working", "input-required", "auth-required", "completed", "failed", "canceled", "rejected", "input_required", "exhausted", "TASK_STATE_UNSPECIFIED"],
    wire_0_3_0: [
      { mesh: "submitted", a2a: "TASK_STATE_SUBMITTED" },
      { mesh: "working", a2a: "TASK_STATE_WORKING" },
      { mesh: "input_required", a2a: "TASK_STATE_INPUT_REQUIRED" },
      { mesh: "auth_required", a2a: "TASK_STATE_AUTH_REQUIRED" },
      { mesh: "completed", a2a: "TASK_STATE_COMPLETED" },
      { mesh: "failed", a2a: "TASK_STATE_FAILED" },
      { mesh: "canceled", a2a: "TASK_STATE_CANCELED" },
      { mesh: "rejected", a2a: "TASK_STATE_REJECTED" },
      { mesh: "exhausted", a2a: "TASK_STATE_CANCELED", metadata: { [BUDGET]: { outcome: "exhausted" }, "agentmesh.state": "exhausted" } },
    ],
  },
  wire_0_3_0_budget_and_cancel: {
    comment: "The A2A Bridge §5.2, §7.3, for an agent that answers only 0.3.0 during the transition window. Its budget refusals become a Task the bridge holds in TASK_STATE_REJECTED with the binding's outcome; its budget pause becomes TASK_STATE_INPUT_REQUIRED with ceiling_reached; snake case becomes camelCase. A failed update with a reason gives the failed Task the failure extension's object (unmet_need becomes unmetNeed), and a completion the Task record marks DEADLINE_EXCEEDED gives the completed Task the completed_late mark. A CancelTask becomes its task.cancel request with the cancel extension's object, or user_requested when there is none.",
    budget: [
      { name: "BUDGET_INSUFFICIENT", answer: { payload: { status: "failed" }, error: { code: "BUDGET_INSUFFICIENT", details: { estimate: { amount_micro: 5000000, currency: "USD" } } } },
        expect: { state: "TASK_STATE_REJECTED", metadata: { [BUDGET]: { outcome: "insufficient", estimate: { amountMicro: 5000000, currency: "USD" } }, [MARKER]: { held: true } } } },
      { name: "DEADLINE_UNMEETABLE", answer: { payload: { status: "failed" }, error: { code: "DEADLINE_UNMEETABLE", details: { earliest_completion: "2026-11-24T17:00:00Z" } } },
        expect: { state: "TASK_STATE_REJECTED", metadata: { [BUDGET]: { outcome: "deadline_unmeetable", earliestCompletion: "2026-11-24T17:00:00Z" }, [MARKER]: { held: true } } } },
      { name: "the budget pause", answer: { task_id: "task-1", payload: { status: "input_required" }, error: { code: "BUDGET_EXHAUSTED", details: { spent: { amount_micro: 900000, currency: "USD" }, estimate_to_finish: { amount_micro: 2500000, currency: "USD" } } } },
        expect: { state: "TASK_STATE_INPUT_REQUIRED", metadata: { [BUDGET]: { outcome: "ceiling_reached", spent: { amountMicro: 900000, currency: "USD" }, estimateToFinish: { amountMicro: 2500000, currency: "USD" } } } } },
      { name: "a failed update naming a dependency", answer: { task_id: "task-1", payload: { status: "failed", reason: "dependency_failed", dependency: "Colorado DMV", note: "the search form moved" } },
        expect: { state: "TASK_STATE_FAILED", metadata: { "https://agentmessaging.ai/extensions/failure/v1": { reason: "dependency_failed", dependency: "Colorado DMV" } } } },
      { name: "a failed update naming an unmet need", answer: { task_id: "task-1", payload: { status: "failed", reason: "needs_not_furnished", unmet_need: "resource:git-repo" } },
        expect: { state: "TASK_STATE_FAILED", metadata: { "https://agentmessaging.ai/extensions/failure/v1": { reason: "needs_not_furnished", unmetNeed: "resource:git-repo" } } } },
      { name: "a bare failure carries no failure object", answer: { task_id: "task-1", payload: { status: "failed" } }, expect: { state: "TASK_STATE_FAILED" } },
      { name: "a completion the Task record marks DEADLINE_EXCEEDED", answer: { task_id: "task-1", payload: { status: "completed", output: { text: "Done." } }, marker: "DEADLINE_EXCEEDED" },
        expect: { state: "TASK_STATE_COMPLETED", metadata: { [BUDGET]: { outcome: "completed_late" } } } },
      { name: "an error that is no budget outcome stays an error", answer: { payload: { status: "failed" }, error: { code: "TASK_NOT_FOUND" } }, expect: { error: -32001, agentmesh_code: "TASK_NOT_FOUND" } },
    ],
    cancel: [
      { name: "a reason and a note", params: { id: "task-1", metadata: { "https://agentmessaging.ai/extensions/cancel/v1": { reason: "superseded", note: "replaced" } } }, expect: { offering: "task.cancel", input: { task_id: "task-1", reason: "superseded", note: "replaced" } } },
      { name: "needs_not_furnished keeps unmet_need", params: { id: "task-1", metadata: { "https://agentmessaging.ai/extensions/cancel/v1": { reason: "needs_not_furnished", unmet_need: "credential:Salesforce" } } }, expect: { offering: "task.cancel", input: { task_id: "task-1", reason: "needs_not_furnished", unmet_need: "credential:Salesforce" } } },
      { name: "a stock client with no reason", params: { id: "task-1" }, expect: { offering: "task.cancel", input: { task_id: "task-1", reason: "user_requested" } } },
    ],
  },
  answers_on_a_task: {
    comment: "EXT-14 §8. Under wire version 0.4.0 an A2A caller's answer on an existing Task is a Message with the Task's taskId and contextId, carried to the agent as it is; the agent answers as A2A and binding §10 say. task is the agent's stored Task (its state, the identity that created it, its context); caller is the identity the answer comes from. During the window, for an agent that answers only 0.3.0, the bridge builds the follow-up request itself (wire 0.3.0 cases).",
    cases: [
      { name: "an answer to TASK_STATE_INPUT_REQUIRED", task: { id: "task-1", state: "TASK_STATE_INPUT_REQUIRED", creator: "k1", context: "ctx-1" }, caller: "k1", message: { taskId: "task-1", contextId: "ctx-1" }, expect: { accepted: true } },
      { name: "an answer to TASK_STATE_AUTH_REQUIRED", task: { id: "task-1", state: "TASK_STATE_AUTH_REQUIRED", creator: "k1", context: "ctx-1" }, caller: "k1", message: { taskId: "task-1" }, expect: { accepted: true } },
      { name: "a Message to a working Task is the agent's to take", task: { id: "task-1", state: "TASK_STATE_WORKING", creator: "k1", context: "ctx-1" }, caller: "k1", message: { taskId: "task-1" }, expect: { accepted: true } },
      { name: "another caller's Task is not found", task: { id: "task-1", state: "TASK_STATE_INPUT_REQUIRED", creator: "k1", context: "ctx-1" }, caller: "k2", message: { taskId: "task-1" }, expect: { error: -32001 } },
      { name: "no such Task", task: null, caller: "k1", message: { taskId: "task-9" }, expect: { error: -32001 } },
      { name: "a context that differs from the Task's", task: { id: "task-1", state: "TASK_STATE_INPUT_REQUIRED", creator: "k1", context: "ctx-1" }, caller: "k1", message: { taskId: "task-1", contextId: "ctx-2" }, expect: { error: -32602 } },
      { name: "a Task in a terminal state takes no more Messages", task: { id: "task-1", state: "TASK_STATE_COMPLETED", creator: "k1", context: "ctx-1" }, caller: "k1", message: { taskId: "task-1" }, expect: { error: -32004 } },
      { name: "wire 0.3.0: an answer to input_required", wire: "0.3.0", task: { id: "task-1", state: "input_required", creator: "k1", context: "ctx-1", offering: "request-quote" }, caller: "k1", message: { taskId: "task-1", contextId: "ctx-1" }, expect: { relay: { task_id: "task-1", context_id: "ctx-1", offering: "request-quote" } } },
      { name: "wire 0.3.0: a Task that is not waiting", wire: "0.3.0", task: { id: "task-1", state: "working", creator: "k1", context: "ctx-1", offering: "request-quote" }, caller: "k1", message: { taskId: "task-1" }, expect: { error: -32004, agentmesh_code: "TASK_INVALID_TRANSITION" } },
      { name: "wire 0.3.0: another caller's Task is not found", wire: "0.3.0", task: { id: "task-1", state: "input_required", creator: "k1", context: "ctx-1", offering: "request-quote" }, caller: "k2", message: { taskId: "task-1" }, expect: { error: -32001 } },
    ],
  },
  knock: {
    comment: "EXT-14 §9. A knock's metadata carries only via (at most 80 characters) and grants; anything else is refused with KNOCK_CARRIES_NO_MESSAGE and nothing is sent. A queued acknowledgement that says neither delivered nor paused means the door has not let the caller in, whoever signed it: a Task the bridge holds (the A2A Bridge §4.3: {held: true} under the bridge marker's URI) in TASK_STATE_AUTH_REQUIRED with {admission: held} under the extension's URI (and the older agentmesh.admission key during the window), the same answer for held, blocked and absent, never TASK_STATE_REJECTED.",
    inputs: [
      { name: "an empty knock", knock: {}, expect: { input: { grants: [] } } },
      { name: "a label and grants", knock: { via: "Quote desk at example.com", grants: ["read"] }, expect: { input: { via: "Quote desk at example.com", grants: ["read"] } } },
      { name: "words are refused", knock: { text: "Let me in, I have an offer" }, expect: { refused: "KNOCK_CARRIES_NO_MESSAGE" } },
      { name: "a label over 80 characters is refused", knock: { via: "x".repeat(81) }, expect: { refused: "KNOCK_CARRIES_NO_MESSAGE" } },
      { name: "grants that are not names are refused", knock: { grants: [1] }, expect: { refused: "KNOCK_CARRIES_NO_MESSAGE" } },
    ],
    acknowledgements: [
      { name: "the mesh door's answer", from: "the admission service", payload: { status: "completed", output: { queued: true, inbox_id: "i-1", text: "Sent; it reaches the recipient if the recipient admits you." } }, answer: { state: "TASK_STATE_AUTH_REQUIRED", metadata: { [MARKER]: { held: true }, [URI]: { admission: "held" }, "agentmesh.admission": "held" } } },
      { name: "the agent's own door, holding a stranger", from: "the agent", payload: { status: "completed", output: { queued: true, inbox_id: "i-2", text: "Sent; it reaches Sales agent if Sales agent admits you." } }, answer: { state: "TASK_STATE_AUTH_REQUIRED", metadata: { [MARKER]: { held: true }, [URI]: { admission: "held" }, "agentmesh.admission": "held" } } },
      { name: "put in the agent's inbox", from: "the agent", payload: { status: "completed", output: { queued: true, inbox_id: "i-3", delivered: true, text: "Delivered to Sales agent's inbox." } }, answer: { state: "TASK_STATE_SUBMITTED", metadata: { [MARKER]: { held: true } } } },
      { name: "a paused agent", from: "the mesh", payload: { status: "completed", output: { queued: true, inbox_id: "i-4", paused: true, code: "agent_paused" } }, answer: { state: "TASK_STATE_SUBMITTED", metadata: { [MARKER]: { held: true } } } },
    ],
  },
  budget_older_form: {
    comment: "EXT-14 §11. During the window a caller with no key may still send the budget under this extension's URI as budget, in snake case. The bridge checks it (revision 0, at least one axis, integer micro-units) and puts the same budget on the message under the budget extension's URI in camelCase, or refuses with -32602 and INVALID_BUDGET and sends nothing. A message that already carries the budget extension is passed unchanged.",
    uri: BUDGET,
    cases: [
      { name: "a ceiling and a deadline", metadata: { [URI]: { budget: { revision: 0, deadline: "2026-11-14T17:00:00Z", cost_ceiling: { amount_micro: 5000000, currency: "USD" } } } }, expect: { budget: { revision: 0, deadline: "2026-11-14T17:00:00Z", costCeiling: { amountMicro: 5000000, currency: "USD" } } } },
      { name: "a deadline alone", metadata: { [URI]: { budget: { revision: 0, deadline: "2026-11-14T17:00:00Z" } } }, expect: { budget: { revision: 0, deadline: "2026-11-14T17:00:00Z" } } },
      { name: "a revision above 0 on a new request", metadata: { [URI]: { budget: { revision: 1, deadline: "2026-11-14T17:00:00Z" } } }, expect: { refused: "INVALID_BUDGET" } },
      { name: "no axis", metadata: { [URI]: { budget: { revision: 0 } } }, expect: { refused: "INVALID_BUDGET" } },
      { name: "money as a fraction", metadata: { [URI]: { budget: { revision: 0, cost_ceiling: { amount_micro: 1.5, currency: "USD" } } } }, expect: { refused: "INVALID_BUDGET" } },
      { name: "the budget extension already present wins, unchanged", metadata: { [BUDGET]: { revision: 0, costCeiling: { amountMicro: 2000000, currency: "EUR" } }, [URI]: { budget: { revision: 0, cost_ceiling: { amount_micro: 5000000, currency: "USD" } } } }, expect: { budget: { revision: 0, costCeiling: { amountMicro: 2000000, currency: "EUR" } } } },
    ],
  },
  readable_text: {
    comment: "Agent Messaging §5.8, EXT-14 §6: the text part generated from a signed message for the person, its digest signed in meta.readable_text. Software that shows it checks the signature, the digest, and that the text states the sender and the message's words word for word: the text Parts of a 0.4.0 frame's message, or payload.text of a 0.3.0 envelope.",
    cases: [
      { name: "the generated text", envelope: personFrame, text: personText, expect: { ok: true } },
      { name: "line endings and trailing blanks do not matter", envelope: personFrame, text: `${personText.replace(/\n/g, "\r\n")}  \r\n`, expect: { ok: true } },
      { name: "a changed word fails", envelope: personFrame, text: personText.replace("Tuesday", "Thursday"), expect: { ok: false } },
      { name: "a forged frame fails, whatever the text", envelope: { ...personFrame, payload: { a2a: { method: "SendMessage", params: { message: { ...personMsg, parts: [{ text: "Can we meet on Thursday?" }] } } } } }, text: personText.replace("Tuesday", "Thursday"), expect: { ok: false } },
      { name: "wire 0.3.0: the generated text", wire: "0.3.0", envelope: personEnv03, text: personText, expect: { ok: true } },
    ],
  },
};

writeFileSync(join(HERE, "..", "a2a-bridge.json"), JSON.stringify(fixture, null, 2) + "\n");
console.log("wrote a2a-bridge.json");
