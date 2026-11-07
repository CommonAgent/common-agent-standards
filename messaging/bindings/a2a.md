# A2A over Agent Messaging

| | |
|---|---|
| **Binding URI** | `https://agentmessaging.ai/bindings/a2a/v1` |
| **Version** | 0.2.0-draft |
| **Status** | Working Draft |
| **Date** | 2026-11-07 |
| **Applies to** | A2A Protocol 1.0 · Agent Messaging 0.10 (`../SPEC.md`), wire version 0.4.0 |
| **Reference implementation** | The Agent Messaging Server (Apache-2.0), <https://github.com/agent-messaging/agent-messaging-server> |

The key words MUST, MUST NOT, REQUIRED, SHOULD, SHOULD NOT, RECOMMENDED, MAY and
OPTIONAL are to be interpreted as described in RFC 2119.

## 1. Purpose

A2A defines what agents say to each other: its operations (A2A §3), its data
model of Tasks, Messages, Parts and Artifacts (A2A §4), and its Agent Card. Its
standard bindings carry that over HTTP, which assumes each agent has a public
URL.

This document is an A2A custom protocol binding (A2A §12). It carries A2A's
operations and data model, unchanged, over an Agent Messaging mesh. An agent on
a mesh needs no public URL: it holds one outbound connection, every message it
sends is signed with its own key, and messages for it wait in its inbox while it
is away.

The division of labour is fixed:

- **A2A is the authority for the conversation**: the operations, the Task and
  its states, Messages, Parts, Artifacts and the Agent Card. This binding does
  not add a state, rename a field or change what an operation means.
- **Agent Messaging is the authority for the channel**: reaching an agent,
  verifying who sent each message, admitting strangers, presence, and events
  published to subscribers.
- **What A2A has no place for** is carried either by the channel (§11) or as A2A
  extensions (§12), through A2A's own extension mechanism (A2A §4.6).

Agent Messaging 0.10 uses this binding for every call between agents. It has no
task model of its own: SPEC.md §7 says how A2A Tasks are stored and delivered
on a mesh and defers everything else to A2A.

## 2. Terms

- **Client** and **server**: as in A2A. The client sends an operation, the
  server agent answers it. Both are agents on a mesh, each with its own Ed25519
  key (SPEC.md §4.3).
- **Frame**: one Agent Messaging envelope (SPEC.md §5.1) that carries an A2A
  operation or one of its answers.
- **Mesh home**: the HTTPS origin that identifies a mesh instance (SPEC.md
  §18.10).

## 3. Declaring the binding in an Agent Card (A2A §12.7)

An agent reachable on a mesh lists this binding in its Agent Card's
`supportedInterfaces`:

```json
{
  "supportedInterfaces": [
    {
      "url": "https://api.mesh.example.com/agents/quotes.acme@example.com",
      "protocolBinding": "https://agentmessaging.ai/bindings/a2a/v1",
      "protocolVersion": "1.0"
    },
    {
      "url": "https://a2a.mesh.example.com/agents/quotes.acme@example.com",
      "protocolBinding": "JSONRPC",
      "protocolVersion": "1.0"
    }
  ]
}
```

- `url` MUST be the mesh home, then `/agents/`, then the agent's handle
  (Personal Agent Naming) or, for an agent without a handle, its agent ID, with
  any character outside the URL path set percent-encoded. A client connects to
  the mesh found from the mesh home (SPEC.md §18.10) and addresses the agent the
  last path segment names, resolving a handle to its key as Personal Agent
  Naming says.
- `protocolBinding` MUST be this document's URI.
- `protocolVersion` MUST be the A2A version the agent speaks over this binding,
  `1.0` for this version of the binding.
- An agent MAY list other interfaces beside it, as the second entry shows: an
  A2A Bridge (`a2a-bridge.md`) serving the same agent over A2A's JSON-RPC binding
  for clients that are not on a mesh. Order says preference (A2A §8.3).

The Agent Card lists, in `capabilities.extensions`, each extension of §12 the
agent supports.

## 4. Frames

An A2A operation is a `request` frame. Each answer to it is a `respond` frame.
Frames use the envelope of SPEC.md §5.1 with wire version `0.4.0`, are signed
as SPEC.md §5.3 says, and travel on the subjects SPEC.md §6.4 and §6.5 name: the
request to the server agent's inbox, each answer to the client's inbox, except
the stream events of §8.

A request frame's payload is:

```json
{
  "a2a": {
    "method": "SendMessage",
    "params": { "<the A2A request object for that operation>" }
  }
}
```

A respond frame's payload is:

```json
{
  "a2a": {
    "result": { "<the A2A response object>" }
  }
}
```

or, when the operation fails, no `payload.a2a.result` and an `error` (§9).

- `method` MUST be one of the operation names of §5, spelled as A2A spells it.
- `params` and `result` MUST be the A2A objects for that operation, in A2A's
  JSON form (§6).
- A respond frame's `in_reply_to` MUST be the request frame's `id`.
- A frame MUST NOT carry the envelope fields `task_id`, `context_id` or
  `artifacts`. The Task id, the context id and the artifacts are A2A's and live
  in the A2A object. A receiver MUST refuse a 0.4.0 frame that carries them with
  `INVALID_ENVELOPE`.

## 5. Operations (A2A §12.1)

Every A2A operation is carried. The server agent's node answers the operations
about stored Tasks from its durable task store (SPEC.md §7.4, §18.1).

| A2A operation | Frames | Notes |
|---|---|---|
| `SendMessage` | One request, one respond | The result is a Message (the work finished in one round) or a Task (the work continues), as A2A says |
| `SendStreamingMessage` | One request, then stream events | §8 |
| `GetTask` | One request, one respond | Answered from the task store |
| `ListTasks` | One request, one respond | Answered from the task store, filtered to Tasks the client may read (§10) |
| `CancelTask` | One request, one respond | `TaskNotCancelableError` when the Task is in a terminal state |
| `SubscribeToTask` | One request, then stream events | §8, starting from the Task's current state |
| `CreateTaskPushNotificationConfig`, `GetTaskPushNotificationConfig`, `ListTaskPushNotificationConfigs`, `DeleteTaskPushNotificationConfig` | One request, one respond each | Webhooks are plain HTTPS as A2A §3.5.1 says. An agent whose card says `pushNotifications: false` answers `PushNotificationNotSupportedError` |
| `GetExtendedAgentCard` | One request, one respond | The client is known from its signature (§10); `ExtendedAgentCardNotConfiguredError` when the agent has none |

Each operation behaves as A2A's abstract definition says. In particular a Task
moves only through A2A's states, and a Task in a terminal state does not move
again.

## 6. Data model (A2A §12.2)

- Every A2A object is carried in A2A's JSON form: field names in camelCase, enum
  values as their names (`"TASK_STATE_INPUT_REQUIRED"`, `"ROLE_USER"`), and
  messages as A2A's protocol buffer definition gives them.
- Timestamps follow A2A §5.6.1: RFC 3339, UTC.
- Bytes in a Part's `raw` field are base64, as A2A's JSON form says.
- The envelope's signature covers the A2A object with the rest of the envelope,
  over the canonical JSON of SPEC.md §5.3.
- A frame larger than the mesh's message size limit (SPEC.md §18.9) is not
  allowed. A Part too large to travel inline is sent by reference: a `url` Part
  whose value is an Agent Messaging artifact reference (SPEC.md §7.5.1), with
  the artifact references extension (§12.5) giving its size and digest.

## 7. Service parameters (A2A §12.3)

- A2A's service parameters travel in the envelope's `meta.a2a`, an object whose
  keys are the parameter names and whose values are strings: for example
  `{"A2A-Version": "1.0", "A2A-Extensions": "https://agentmessaging.ai/extensions/budget/v1"}`.
- Names are case-insensitive, as HTTP header names are; a sender SHOULD use
  A2A's spelling. Values are UTF-8. The whole `meta.a2a` object MUST NOT exceed
  8 KiB in canonical JSON.
- The binding reserves no parameter name. The envelope's own reserved `meta`
  keys (SPEC.md §5.2) are outside `meta.a2a` and are not service parameters.
- Every frame has `meta`, so no fallback is needed.

## 8. Streaming (A2A §12.5)

`SendStreamingMessage` and `SubscribeToTask` answer with A2A stream events
(A2A's StreamResponse: a Task, a Message, a TaskStatusUpdateEvent or a
TaskArtifactUpdateEvent).

- **Mechanism.** The first event goes to the client's inbox in a respond frame,
  so the client learns the Task id. Every later event is a respond frame
  published to `mesh.task.{taskId}.stream`, where `taskId` is the A2A Task id.
  The client holds a durable subscription to that subject (SPEC.md §18.6).
- **Order.** Events are published in the order they were generated. Each frame
  carries `payload.a2a.seq`, counting from 0 for the first event of the stream,
  so a client detects a gap.
- **Reconnection.** A client that loses its connection resumes its durable
  subscription after the last event it acknowledged. A client that lost the
  subscription itself calls `SubscribeToTask`, which starts from the Task's
  current state.
- **Termination.** The stream ends with the event that puts the Task in a
  terminal or interrupted state (A2A §4.1.3), or with the Message that answers a
  `SendStreamingMessage` without a Task. That frame carries
  `payload.a2a.final: true`. No frame follows it on that stream.
- Every event is a signed frame of its own, so a stream needs no separate chunk
  signature.

**Carriers without subjects.** A carrier of these frames that has no stream
subjects, such as email (Agent Emailing), cannot hold a subscription. It
delivers each later change to a Task as a respond frame to the client whose
result is the whole Task as it then stands, numbered by `payload.a2a.seq`, and
it answers `SendStreamingMessage` and `SubscribeToTask` with
`UnsupportedOperationError`. The client reads the frames in `seq` order.

## 8a. Sealed frames

A frame sealed for its receiver (EXT-7) hides its payload, the A2A object
included. Its sender MAY put the Task's current state in clear in
`meta.a2a_state`, as A2A's enum name, for a carrier that shows a person the
state, such as an email subject line (Agent Emailing). That discloses the state
to every carrier on the path, so a sender that does not want it disclosed
leaves it out. A receiver reads the state from the sealed payload and ignores
`meta.a2a_state` where the two differ.

## 9. Errors (A2A §12.4)

An A2A error travels as the respond frame's `error` (SPEC.md §12.1):

```json
{
  "code": "TaskNotFoundError",
  "message": "No task with that id.",
  "details": { "a2a": { "code": -32001, "data": {} } },
  "retryable": false
}
```

- `code` MUST be the A2A error's name as A2A §3.3.2 names it.
- `details.a2a.code` MUST be the integer A2A's JSON-RPC binding assigns to that
  error, so a client or bridge that speaks JSON-RPC uses it unchanged, and
  `details.a2a.data` carries the error's data.
- Errors that come from the channel rather than from A2A, such as a refused
  signature, a sender not admitted or a transport timeout, keep their Agent
  Messaging codes (SPEC.md §12.2) and are never given an A2A name.
- Delivery follows SPEC.md §12.3.

## 10. Authentication and authorization (A2A §12.6)

- **Credentials.** Every frame is signed by the sending agent's own key, under
  its node's vouch (SPEC.md §4.4, §4.5). The signature is the credential: the
  server agent knows the client from the frame it receives, and so does the
  client of every answer. The security schemes declared in an Agent Card apply
  to its other interfaces; for this binding the signature takes their place.
- **Admission.** A sender the server agent has not admitted is refused before
  any operation runs, as SPEC.md §1.5 invariant 4 and EXT-6 say. It may knock.
- **Challenges.** An agent that needs more authorization for a piece of work
  puts the Task in `TASK_STATE_AUTH_REQUIRED`, as A2A says.
- **Who may read a Task.** `GetTask`, `ListTasks` and `SubscribeToTask` answer
  only the agent that created the Task with its first message, and the agents
  that agent delegated to (SPEC.md §4.11). Anyone else gets
  `TaskNotFoundError`, so a Task's existence is not disclosed.
- **Practice.** The transport's own security applies as SPEC.md §4 and the
  binding in use (SPEC.md §18) say.

## 11. What the channel adds

These are Agent Messaging's own and sit beside the A2A operations. They are
unchanged by this binding.

| Feature | Where it is defined |
|---|---|
| Presence: who is reachable now | SPEC.md §8.4, §9 |
| Events and feeds: `emit`, `subscribe` | SPEC.md §6.6, §6.6a, §6.7 |
| Registration and live discovery | SPEC.md §6.2, §6.3 |
| Admission: `describe` and `knock` | SPEC.md §1.5, EXT-6 |
| The accept signal: delivered, admitted, running | SPEC.md §6.4a. It is a respond frame whose payload is `{"accepted": {...}}` with no `a2a` member, and it precedes the first A2A answer |
| Who sent a frame and for whom, delegation, acting for a person | SPEC.md §4.11, §4.16, read from the signed envelope |
| Receipts | EXT-15 |

The server agent's node records, beside each stored Task, the keys of the agent
that created it and of the agent that answers it, and the engagement it runs
under. They are kept beside the A2A Task, never inside it.

## 12. Extensions

Each extension below is an A2A extension (A2A §4.6). An agent that supports one
lists it in `capabilities.extensions` with `required: false`, and a client
activates it in the `A2A-Extensions` service parameter (§7). Each URI equals
the Agent Messaging extension or section named beside it, so an agent declares
the meaning once.

| URI | Carries | Agent Messaging meaning |
|---|---|---|
| `https://agentmessaging.ai/extensions/offering/v1` | Which declared offering a message calls | SPEC.md §8.5 |
| `https://agentmessaging.ai/extensions/budget/v1` | A budget, and why a Task ended at its cap | SPEC.md §7.7 |
| `https://agentmessaging.ai/extensions/audience/v1` | A message meant for the person behind the agent | SPEC.md §5.7, `mesh://extensions/audience/v1` |
| `https://agentmessaging.ai/extensions/economics/v1` | Payment required, with the price and how to pay | SPEC.md §19 |
| `https://agentmessaging.ai/extensions/artifact-refs/v1` | A large Part's size and digest | SPEC.md §7.5.1 |
| `https://agentmessaging.ai/extensions/cancel/v1` | Why a Task was canceled | SPEC.md §10.8 |

Each extension's data sits in the `metadata` of the object it describes, under
the extension's URI as the key.

### 12.1. Offering

On a Message: `{"offering": "<offering id>"}`. An agent that declares exactly
one offering serves it when a Message names none. An agent that declares
several and receives a Message naming none, or naming one it does not declare,
answers with A2A's invalid-parameters error and lists its offerings in the
error's data.

### 12.2. Budget

On the Message that starts or revises the work:

```json
{ "deadline": "2026-11-20T17:00:00Z", "revision": 0,
  "costCeiling": { "amountMicro": 4000000, "currency": "USD" } }
```

The fields mean what SPEC.md §7.7 says. Each budget outcome puts the Task in an
A2A state, and the Task's `metadata` says which outcome it was under this URI,
with a status message saying so in words:

| Outcome | A2A state | Metadata under this URI |
|---|---|---|
| The work does not fit the cost ceiling, refused at admission | `TASK_STATE_REJECTED` | `{"outcome": "insufficient", "estimate": {"amountMicro": ..., "currency": "..."}}` |
| The deadline cannot be met, refused at admission | `TASK_STATE_REJECTED` | `{"outcome": "deadline_unmeetable", "earliestCompletion": "<RFC 3339>"}` |
| The work reached its cost ceiling and paused for more money | `TASK_STATE_INPUT_REQUIRED` | `{"outcome": "ceiling_reached", "spent": {...}, "estimateToFinish": {...}}` |
| An engagement's not-to-exceed cap ended the work (Agent SoW §5.5.5) | `TASK_STATE_CANCELED` | `{"outcome": "exhausted"}` |

A paused Task resumes when the client revises the budget with a new Message
whose `revision` is higher, or ends when the client cancels it with the reason
`budget_exhausted` (§12.6).

An exhausted Task keeps the artifacts produced before the cap. A2A's state list
is fixed, and canceled is the state whose meaning is closest: the work stopped
before it finished, and nothing went wrong. A client that knows this extension
MUST NOT record an exhausted Task as failed and MUST NOT retry it, because a
retry would spend past a cap the engagement set. For every other canceled Task,
whether to send the work again is the client's choice, as A2A leaves it.

### 12.3. Audience

On a Message: `{"audience": "person"}` marks it as meant for the person behind
the receiving agent, with every rule of SPEC.md §5.7.

### 12.4. Economics

A server agent that requires payment before the work ends the Task in
`TASK_STATE_REJECTED` with `{"paymentRequired": {"price": {...}, "accepted": [...]}}`
under this URI, as SPEC.md §19 defines the price and the accepted settlement
methods.

### 12.5. Artifact references

On a `url` Part whose bytes are held outside the message:
`{"size": 12345, "digest": "sha256:<64 lowercase hex>"}`. The reference may be
any URI its carrier defines: an Agent Messaging artifact reference on a mesh
(SPEC.md §7.5.1), a `cid:` reference to an attachment by email (Agent
Emailing), or an `https:` URL. The Part's `mediaType` and `filename` are A2A's
own fields. A reader resolves the reference as its carrier says and checks the
digest before it uses the bytes.

### 12.6. Cancel reasons

URI `https://agentmessaging.ai/extensions/cancel/v1`. On a `CancelTask`
request's `metadata` (A2A's CancelTaskRequest carries one):
`{"reason": "<reason>", "note": "<optional text>"}`, where `reason` is one of
the closed list of SPEC.md §10.8 (`user_requested`, `superseded`,
`deadline_exceeded`, `budget_exhausted`, `upstream_cancelled`, `policy`,
`needs_not_furnished`, `dependency_failed`), with the extra fields that section
requires for a reason. The canceled Task's `metadata` carries the same object
under this URI, so the reason stays on the record. A client written to this
version MUST send a reason; a server agent MUST accept a `CancelTask` without
one from a client that does not declare the extension, and records the reason
as `user_requested`.

## 13. The A2A Bridge

The A2A Bridge (`a2a-bridge.md`) serves mesh agents to clients that use A2A's
HTTP bindings, and attaches HTTP A2A agents to a mesh. Both sides now carry the
same A2A objects, so the bridge moves them between HTTP and frames and maps
identity at the edge (SPEC.md §4.15). It translates nothing.

## 14. Versions

- This binding is wire version `0.4.0` of Agent Messaging. A node written to
  Agent Messaging 0.10 MUST also accept 0.3.0 envelopes, whose calls use the
  `request` payloads of Agent Messaging 0.9, until its operator ends that
  window, and SHOULD answer each request in the wire version it arrived in.
- A breaking change to this binding takes a new URI, as A2A §5.8 requires.
- A breaking change to an extension takes a new extension URI.

## 15. Interoperability testing (A2A §12.8)

The conformance fixture set `../conformance/a2a-binding.json` runs each A2A
operation over this binding and the same operation through an A2A Bridge over
A2A's HTTP+JSON binding, and checks that the A2A objects that come back are the
same. It covers every error of §9, a Part sent by reference, a stream resumed
after a dropped connection, and a Task that runs longer than the mesh's reply
window.

## 16. Example

A client asks for a quote. The request frame:

```json
{
  "v": "0.4.0",
  "id": "0192f3a4-6f1e-7c3a-9d2b-1a2b3c4d5e6f",
  "type": "request",
  "ts": "2026-11-07T18:04:05.123Z",
  "from": "<client agent key>",
  "to": "<server agent key>",
  "trace": { "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736", "span_id": "00f067aa0ba902b7" },
  "payload": {
    "a2a": {
      "method": "SendMessage",
      "params": {
        "message": {
          "messageId": "msg-1",
          "role": "ROLE_USER",
          "parts": [ { "text": "Quote 200 units of part 7741, delivered by Dec 1." } ],
          "metadata": {
            "https://agentmessaging.ai/extensions/offering/v1": { "offering": "quote" }
          }
        }
      }
    }
  },
  "meta": { "a2a": { "A2A-Version": "1.0", "A2A-Extensions": "https://agentmessaging.ai/extensions/offering/v1" } },
  "sig": "<signature>"
}
```

The server agent will take a while, so it answers with a Task:

```json
{
  "v": "0.4.0",
  "id": "0192f3a4-7a10-7c3a-9d2b-1a2b3c4d5e70",
  "type": "respond",
  "ts": "2026-11-07T18:04:05.410Z",
  "from": "<server agent key>",
  "to": "<client agent key>",
  "in_reply_to": "0192f3a4-6f1e-7c3a-9d2b-1a2b3c4d5e6f",
  "trace": { "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736", "span_id": "a3ce929d0e0e4736" },
  "payload": {
    "a2a": {
      "result": {
        "task": {
          "id": "task-9f2c",
          "contextId": "ctx-51a0",
          "status": { "state": "TASK_STATE_WORKING", "timestamp": "2026-11-07T18:04:05.400Z" }
        }
      }
    }
  },
  "sig": "<signature>"
}
```

The client later calls `GetTask`, or subscribes, and reads the finished Task
with the quote as an Artifact.
