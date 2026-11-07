# EXT-14: Agent Messaging over A2A

| | |
|---|---|
| **URI** | `mesh://extensions/agent-messaging-over-a2a/v1` |
| **Status** | Draft. Implemented by the Agent Messaging Server's A2A gateway from release 0.4.6. |
| **Version** | 0.4.0-draft (the carried envelope is a frame of the binding "A2A over Agent Messaging", wire version 0.4.0; 0.3.0 envelopes are still accepted during the transition window, §14). 0.3.1-draft: §13 names the fixture set. 0.3.0-draft: the card from the Descriptor, §10, and the budget, §11. 0.2.0-draft: the conversation, §8, and the knock, §9. 0.1.0-draft: signed requests, answers and readable text, §2 to §7. |
| **Requires** | Agent Messaging §5.1 to §5.3 (the envelope and its signature), §5.7 (messages for the person), §5.8 (readable text), §22 (inbound protections); A2A over Agent Messaging (`../bindings/a2a.md`); the A2A Bridge (`../bindings/a2a-bridge.md`); A2A 1.0 extensions (A2A §4.6) |

The A2A Bridge lets a stock A2A client call an agent on a mesh. Without this
extension the caller's own signature stops at the bridge: the HTTPS leg
carries A2A requests, and the bridge signs the frame for a hosted identity it
keeps for the caller (Agent Messaging §4.15). That is the right answer for a
caller that holds no Agent Messaging key, and it is the only answer A2A alone
can give.

A caller that does hold a key should not have to give up its signature to use
HTTPS. This extension is how it keeps it. The caller signs the frame itself,
exactly the frame it would send on a mesh under the binding "A2A over Agent
Messaging" (binding §4), and carries it inside the A2A request. The bridge
checks it and passes it to the mesh unchanged. The receiving agent verifies
the caller's own signature, exactly as it would on the mesh, and the answer
comes back with the agent's own signed frame beside it. The same frame then
means the same thing whether it travelled by broker, by email (Agent
Emailing) or over HTTPS.

Since 0.4.0-draft the frame carries the A2A request itself, in
`payload.a2a`. The A2A request on the HTTPS leg and the one in the frame are
the same request, so the bridge has nothing to translate: it checks that the
two agree and relays the signed one.

## 1. Terms

- **Signed caller.** An A2A client that holds an Agent Messaging key and signs
  its own frames under this extension.
- **Bridged caller.** An A2A client with no key, for which the bridge signs
  (the A2A Bridge §9). Nothing in this extension changes how a bridged caller
  is served.
- **Carried frame.** A signed Agent Messaging envelope, `sig` included, carried
  inside an A2A request as §3 says. Under wire version 0.4.0 it is a request
  frame of the binding (binding §4). The member that holds it is named
  `envelope`, as it was before 0.4.0-draft.

## 2. Declaring the extension

A bridge that implements this extension lists it in every card it generates,
in `capabilities.extensions[]`:

```json
{
  "uri": "mesh://extensions/agent-messaging-over-a2a/v1",
  "description": "Agent Messaging over A2A: a caller that holds an Agent Messaging key carries its own signed frame in this extension's metadata, and the gateway passes it through unchanged. Answers carry the agent's signed frame.",
  "required": false,
  "params": { "signed_envelope": true, "readable_text": true, "budget": true, "wire_versions": ["0.4.0", "0.3.0"] }
}
```

`required` is always `false`: a caller without a key uses the card as before.
`wire_versions` lists the frame versions the bridge accepts, newest first; a
bridge drops `0.3.0` when the transition window ends (§14). A card without
`wire_versions` is a card from before 0.4.0-draft and accepts `0.3.0` only.

**Finding the card from a name.** Personal Agent Naming lets a name card list
an `a2a` endpoint, `{ "protocol": "a2a", "url": "…/agent-card.json" }`, and
leaves what a consumer does with an endpoint to its protocol (Personal Agent
Naming §5.1). For a signed caller, this section is that protocol. It resolves
the handle, reads the `a2a` endpoint, fetches the card, and checks that the
bridge marker's `agent_id` in the card (the A2A Bridge §8.3) equals the key on
the verified name card. It puts that key in the frame's `to`. A card whose
`agent_id` differs from the name card's key is not that agent's card, and the
caller MUST NOT send to it.

## 3. Carrying a signed request

**`SendMessage`.** A signed caller sends `SendMessage` (JSON-RPC) or
`message:send` (HTTP+JSON) with:

- the extension's URI in the message's `extensions`;
- in `message.metadata`, under the extension's URI, an object whose
  `envelope` member is the signed request frame, whose `payload.a2a` is the
  same `SendMessage` request.

```json
{
  "message": {
    "messageId": "msg-1",
    "role": "ROLE_USER",
    "parts": [{ "text": "Quote for 40 chairs, delivered by 14 November" }],
    "extensions": ["mesh://extensions/agent-messaging-over-a2a/v1"],
    "metadata": {
      "mesh://extensions/agent-messaging-over-a2a/v1": {
        "envelope": {
          "v": "0.4.0", "id": "…", "type": "request", "ts": "2026-11-07T18:02:11Z",
          "from": "<the caller's agent ID>", "to": "<the agent's ID>",
          "trace": { "trace_id": "…", "span_id": "…" },
          "payload": { "a2a": { "method": "SendMessage", "params": { "message": {
            "messageId": "msg-1",
            "role": "ROLE_USER",
            "parts": [{ "text": "Quote for 40 chairs, delivered by 14 November" }],
            "metadata": { "https://agentmessaging.ai/extensions/offering/v1": { "offering": "quote" } }
          } } } },
          "meta": { "a2a": { "A2A-Version": "1.0" } },
          "sig": "…"
        }
      }
    }
  }
}
```

The carried frame is authoritative. The bridge MUST NOT read the outer
message's `parts` for content, and a receiver never sees them. A caller
SHOULD make the outer message the frame's message with this extension's
entries added, so that A2A software along the way shows what was signed, and
§6's rule applies to any text a person will read.

When the outer message carries `taskId` or `contextId`, each MUST equal the
same field of the frame's message.

**The other operations.** A signed caller's Tasks are the agent's, and the
agent answers questions about them only to their creator (binding §10). So a
signed caller carries a signed frame on those operations too:

| Operation | Where the frame travels |
|---|---|
| `CancelTask` | `params.metadata`, under the extension's URI, as `{ "envelope": … }` |
| `GetTask`, `ListTasks` | the service parameter `Agent-Messaging-Frame`, an HTTP header on both A2A HTTP bindings, whose value is the frame's UTF-8 JSON in base64url without padding. These requests have no `metadata` of their own |

The frame's `payload.a2a.method` is the operation's name and its `params` are
the same request object. `SendStreamingMessage`, `SubscribeToTask`,
`GetExtendedAgentCard` and the push configuration operations carry no frame
in this version. A bridge MUST refuse a streaming call that carries one with
`UnsupportedOperationError` (`-32004`). A call without a frame is a bridged
caller's call.

The HTTP admission of the A2A Bridge §9 applies unchanged: a signed caller
presents whatever credential the bridge requires, and the bridge counts its
calls against that credential's rate. The signature replaces the hosted
identity, not the admission.

## 4. What the bridge checks

Before it relays anything, the bridge MUST check that:

1. the carried value is an envelope with `v`, `id`, `from` and `sig`; a 0.4.0
   frame has a `payload.a2a` with a `method` and a `params` object, and
   carries none of the envelope fields `task_id`, `context_id` or `artifacts`
   (binding §4);
2. its signature verifies against its `from` (Agent Messaging §5.3);
3. its `type` is `request`;
4. its `to` is the agent whose interface URL the call came to;
5. its `ts` is inside the freshness window for live delivery (Agent Messaging
   §22.3);
6. its `payload.a2a.method` is the operation of the call that carries it. A
   0.3.0 envelope has no `payload.a2a`, and check 7 covers what it asks for;
7. the offering it names, if it names one, is one the agent declares: in a
   0.4.0 frame the offering extension's value on the message (binding §12.1),
   and in a 0.3.0 envelope its `payload.offering`, which may also be
   `task.cancel`, `knock` or `describe`. A message marked for the person
   (Agent Messaging §5.7) carries no offering and is not checked for one;
8. the outer request agrees with the frame's: `message.taskId` and
   `message.contextId` on `SendMessage`, and `id` on `CancelTask` and
   `GetTask`. For a 0.3.0 envelope the frame's values are its `task_id` and
   `context_id`.

A frame whose payload is one of the channel's own requests (binding §11: the
`knock` and `describe` of Agent Messaging §1.5 and EXT-6) has no
`payload.a2a`; check 6 does not apply to it, and checks 1 and 7 read it in
the form Agent Messaging gives it for the frame's wire version (§9).

A failure refuses the whole call. The bridge relays nothing and answers with
`InvalidParamsError` (`-32602`), `data.agentmesh_code: "INVALID_ENVELOPE"` and
`data.reason` set to one of `malformed`, `signature`, `type`, `addressee`,
`stale`, `method`, `offering` or `mismatch`. On the HTTP+JSON binding the
reason is `INVALID_PARAMS` and the same two members are in
`details[0].metadata`.

The bridge does not check duplicates. The receiver does (Agent Messaging
§22.2), and a duplicate it refuses is refused there.

## 5. Relaying and answering

**The bridge passes the frame through.** It publishes the carried frame,
unchanged, to the inbox of the agent its `to` names. It MUST NOT sign it,
re-sign it, add to its `meta`, or send it from a hosted identity. It carries
neither `meta.identity_bridge` nor `meta.a2a_bridge`, because nothing in it is
the bridge's: the receiver sorts the sender by its own key, as it sorts any
native sender (EXT-6 §4).

**The answer comes to the signer's inbox.** The responder answers the
frame's `from`, as it answers anyone (binding §4). The bridge reads the
signer's inbox for answers to the frame and takes one only when:

- it verifies on its own signature;
- its `in_reply_to` names the carried frame and its `to` is the signer;
- its `from` is the agent the request went to. The one exception is the
  queued acknowledgement of the mesh's admission service (EXT-6 §7), which
  stands in for an agent that has not let the sender in. The bridge pins that
  service's key on first use, as an SDK does (Agent Messaging §6.2).

An accept signal (Agent Messaging §6.4a) resets the bridge's wait. Anything
else on the inbox is not the bridge's to read, and it ignores it. The signer's
own node, if one is running, may receive the same answer. It is addressed to
the signer, so that copy is the signer's business.

**The bridge returns the answer with its frame.** The A2A result is the
answer frame's `payload.a2a.result`, unchanged, and an A2A error is the
frame's `error`, as the A2A Bridge §7 returns it. Whatever the shape, the
result carries the responder's signed frame in the extension's metadata: on
the Message's or the Task's `metadata`, or in the error's `data`, under the
extension's URI, as `{ "envelope": … }`. A signed caller can then verify what
the agent said, not what the bridge says it said. The bridge adds only that
member, and the result inside the frame is the one the agent signed.

An answer in a 0.3.0 envelope, from an agent that answers only 0.3.0 during
the window, is presented as the A2A Bridge §5.2 and §7.3 say, with its
envelope beside it in the same way.

Files in the answer stay by reference. A signed caller holds its own key and
reads them itself (Agent Messaging §7.5.4). The bridge does not make signed
links for it.

**A bridged caller can ask for the frame too.** A caller with no key that
lists the extension in its message's `extensions` gets the responder's signed
frame on its results in the same way. The responder signed it to the caller's
hosted identity, and it verifies all the same.

**Activation is echoed.** When the bridge acts on the extension it names it in
the response's `A2A-Extensions` header (A2A §4.6, §14.2.2).

## 6. Readable text

A message meant for a person (Agent Messaging §5.7) that crosses the bridge
carries readable text generated from the signed frame, under Agent Messaging
§5.8. On A2A that text is the first part of the message: a text part whose
`metadata`, under the extension's URI, is `{ "readable_text": true }`, and the
frame rides beside it as §5 says. The frame's `meta.readable_text` is the
digest of that text, signed by whoever signed the frame.

- **From a signed caller,** the caller generates the text and signs its
  digest.
- **From a bridged caller,** the bridge signs for the caller's hosted
  identity, so it generates the text and signs its digest.
- **From a mesh agent,** the agent signs the digest. A bridge that relays a
  person's reply generates the text part from the reply's frame, so the
  digest the agent signed matches it.

Software that shows the text to a person runs §5.8's check against the
frame beside it, and warns when they differ. A receiving agent never acts
on the text.

## 7. Tasks

**Reading.** A Task that came from a carried request is the agent's own Task,
and the agent answers about it only to the signer (binding §10). A signed
caller reads it with `GetTask` or `ListTasks` carrying its own signed frame
(§3), which the bridge checks and relays like any carried request. The answer
is the agent's signed frame, with the Task in it. The same call without a
frame is a bridged caller's call, and the agent answers it with
`TaskNotFoundError`, because the bridge's hosted identity did not create the
Task.

**Canceling.** The bridge holds no identity for a signed caller, so it cannot
cancel for it. `CancelTask` on such a Task carries the caller's own signed
`CancelTask` frame for that Task in `params.metadata` under the extension's
URI, signed by the same key that made the original request. The frame's
`CancelTask` request carries its reason under the cancel extension's URI,
`https://agentmessaging.ai/extensions/cancel/v1`, as binding §12.6 requires of
a client written to it. The bridge checks the frame as §4 says and relays it.
A frame signed by another key is answered by the
agent with `TaskNotFoundError` (binding §10), and one naming another Task is
refused by the bridge with `reason: "mismatch"`.

During the transition window a Task that came from a 0.3.0 carried request
is canceled as before: the caller's signed `task.cancel` request for that
Task (Agent Messaging 0.9 §10.8) in the same place. Without one the bridge
answers `TaskNotCancelableError` (`-32002`) with
`data.agentmesh_code: "SIGNED_CANCEL_REQUIRED"`.

**Queued.** When the answer is the queued acknowledgement, the bridge holds a
Task for the exchange whose id is the carried frame's id, as for a bridged
caller (the A2A Bridge §4.3). The agent's late answer, when it comes, is
addressed to the signer. The bridge watches the signer's inbox for it while
it holds the Task and settles the Task with it, applying only an answer the
agent signed. An acknowledgement that means the agent has not let the
signer in is answered as §9 says.

## 8. Answering on the same Task

An agent that needs more from its caller puts its Task in
`TASK_STATE_INPUT_REQUIRED` or `TASK_STATE_AUTH_REQUIRED`, as A2A says. The
caller answers by sending a new Message with the Task's `taskId` and
`contextId`. Under wire version 0.4.0 that Message reaches the agent as it
is, in a `SendMessage` frame (binding §5), and the agent resumes its own Task.
There is nothing for the bridge to build.

**Seeing that the agent is waiting.** `GetTask` returns the agent's Task as
its node stores it, so a Task the agent paused reads
`TASK_STATE_INPUT_REQUIRED` (or `TASK_STATE_AUTH_REQUIRED`), and its status
message carries the agent's words, such as the question it asks. A caller
reads the Task only when it asks, so it may never see some states in between.

**A caller with no key.** The bridge signs the Message for the caller's
hosted identity and relays it like any `SendMessage` (the A2A Bridge §4.1).
The agent answers it as A2A and the binding say:

- a `taskId` that names no Task this caller may read: `TaskNotFoundError`
  (`-32001`), as binding §10 requires;
- a `taskId` that names a Task in a terminal state:
  `UnsupportedOperationError` (`-32004`), as A2A §3.1.1 requires;
- a `contextId` that differs from the Task's: `InvalidParamsError`
  (`-32602`).

The result is the Task as the agent's answer leaves it: working, completed,
or paused again.

**A signed caller.** The caller signs the `SendMessage` frame itself, with the
Task's `taskId` and `contextId` on its message, and carries it as §3 says.
The bridge checks and relays it like any carried request, and §4's check 8
holds the outer message's `taskId` and `contextId` to the frame's.

**An agent that answers only 0.3.0.** During the transition window the bridge
carries a bridged caller's answer to such an agent as the follow-up `request`
Agent Messaging 0.9 §7.3 names: the Task's id in the envelope's `task_id`,
the Task's `context_id`, the offering the Task's first request named, and the
Message's Parts as `input`, mapped as the A2A Bridge §5.2 maps them. It
refuses, before sending anything, an answer to a Task that is not waiting for
input, with `UnsupportedOperationError` (`-32004`) and
`data.agentmesh_code: "TASK_INVALID_TRANSITION"`.

**Work that stopped at its cap.** When an engagement's cap ends the work, the
Task ends in `TASK_STATE_CANCELED` with `{"outcome": "exhausted"}` under the
budget extension's URI (binding §12.2), so a caller can tell work that
stopped at its cap from work somebody canceled. During the transition window
such a Task may instead, or also, carry the older mark
`"agentmesh.state": "exhausted"` (the A2A Bridge §5.2), and a caller reads
either as the same thing.

## 9. The knock

A stranger knocks before it talks (EXT-6 §9.3, Common Agent §7.1). The knock
carries no words, never reaches the agent's model, and gets the same answer
whether the sender is held, blocked, or knocking on an agent that does not
exist. Over email, plain mail from a stranger never reaches the agent (Agent
Emailing §4.3). This section gives A2A the same door.

**A first contact the door has not let in.** A door that holds a sender, or
blocks it, answers its request with the queued acknowledgement (Agent
Messaging §6.4a), in the same words either way and without `delivered`. The
agent's own node may sign it, or the mesh's admission service answering for
the agent (EXT-6 §7). Only a message put in the agent's inbox is
acknowledged with `delivered: true`, and a paused agent's acknowledgement
says `paused: true`. So the bridge reads the acknowledgement and never its
signer. One that says neither means the agent has not let the caller in, and
the bridge answers the A2A caller with a Task it holds (the A2A Bridge §4.3)
in `TASK_STATE_AUTH_REQUIRED`, whose id is the request frame's id and whose
status message says, in plain words:

- that the agent's owner has not let the caller in;
- that what it sent is with the owner, who decides, and that nothing
  reaches the agent until they do;
- that if the owner lets it in, the agent's answer to the request lands on
  this Task, so it polls `GetTask`;
- how to knock without sending anything (below).

The Task's `metadata` carries `{"admission": "held"}` under the extension's
URI. During the transition window it also carries the older key
`"agentmesh.admission": "held"`. The answer is the same for a held caller, a
blocked one and an agent that does not exist, because the acknowledgement is
the same. The bridge MUST NOT answer `TASK_STATE_REJECTED`, which would tell a
blocked caller that it is blocked. An acknowledgement that says
`delivered: true` or `paused: true` gives a Task in `TASK_STATE_SUBMITTED`,
as the A2A Bridge §4.3 says.

**The knock itself.** A caller asks to be let in, and says nothing else, by
sending a message that lists the extension's URI and carries, under that URI
in `metadata`, a `knock` object:

```json
{ "knock": { "via": "Quote desk at example.com", "grants": [] } }
```

`via` is a short label of at most 80 characters and `grants` names grants
from EXT-6 §6.1, both optional, as on the mesh. Any other member, or a `via`
or `grants` of the wrong shape, is refused with `InvalidParamsError`
(`-32602`) and `data.agentmesh_code: "KNOCK_CARRIES_NO_MESSAGE"`, and nothing
is sent.

- **A caller with no key.** The bridge sends the content-free knock from the
  caller's hosted identity, with only `via` and `grants`. It MUST NOT send
  the message's parts: a knock carries no words.
- **A signed caller.** It signs the knock itself, with the same input, in the
  form Agent Messaging gives the knock for the frame's wire version (a
  `request` on the `knock` offering in a 0.3.0 envelope), and carries it as
  §3 says. The bridge relays it.

**The answer.** A caller the door lets in (the door's answer says
`admitted: true`, EXT-6 §9.3) gets a Message whose one data part is
`{ "admitted": true, "extensions": [ … ] }`, with the agent's signed answer
beside it. Every other outcome, held, blocked, rate-limited or no such agent,
gets the same held Task in `TASK_STATE_AUTH_REQUIRED`, with a status message
that says the knock is with the owner and that nothing more is needed, and
`{"admission": "knocked"}` under the extension's URI in its `metadata` (with
`"agentmesh.admission": "knocked"` during the window). The owner sees the
knock where they see every knock (EXT-6 §9.1), with the caller's hosted
identity or its own key.

## 10. The card from the Descriptor

The Common Agent Specification makes an agent's Descriptor the one
description of it, and every other description a projection of the
Descriptor. An A2A card is one such projection. So a bridge that generates a
card for an agent that published a Descriptor generates it from the
Descriptor itself, not from the registration manifest's copy of it.

**What comes from the Descriptor.** Where the agent published a Descriptor
(the manifest points to it by digest and the registry keeps it, Agent
Messaging §8.13), the generated card takes:

- its `description` from the Descriptor's `does`;
- its `version` from `agent_version`;
- one skill for each offering the Descriptor describes and the agent's
  manifest declares, with the skill's `name` from the offering's `name` and
  its `description` from the offering's `does`. An offering the Descriptor
  describes and the agent does not declare gets no skill, because a skill
  the agent does not answer cannot be called;
- each skill's `inputModes` and `outputModes` from the media types among its
  inputs' and outputs' `kind`, beside `application/json` and `text/plain`.

Everything else on the card (the interfaces, the security schemes, the
capabilities) is the A2A Bridge §8.1's. An agent that published no
Descriptor gets the card §8.1 describes.

**What the card cannot hold.** An A2A card declares media types, not the
inputs and outputs of the work. The extension's entry in
`capabilities.extensions[]` carries them in its `params`:

```json
"params": {
  "signed_envelope": true,
  "readable_text": true,
  "budget": true,
  "wire_versions": ["0.4.0", "0.3.0"],
  "descriptor": {
    "url": "https://<bridge-host>/agents/<agent-id>/descriptor.json",
    "digest": "sha256:<64 lowercase hex>"
  },
  "offerings": {
    "quote": {
      "inputs": [{ "name": "item", "kind": "text", "required": true }],
      "outputs": [{ "name": "quote", "kind": "application/pdf", "when": "per_task" }],
      "input_schema": { "type": "object", "required": ["item"] }
    }
  }
}
```

- `descriptor.digest` is the SHA-256 of the Descriptor's exact bytes, as the
  registry holds them.
- `descriptor.url` is where the bridge serves those bytes, unchanged. A
  bridge MUST serve them there, with the same admission as the card, and a
  caller that reads them SHOULD check them against the digest.
- `offerings` has one member per skill on the card: the offering's `inputs`
  and `outputs` from the Descriptor, and its `input_schema` and
  `output_schema` from the manifest where it declares them (Agent Messaging
  §8.5).

## 11. The budget

Work on the mesh carries its budget (Agent Messaging §7.7): the most the work
may cost, the latest it may finish, or both. Under wire version 0.4.0 the
budget is the budget extension of binding §12.2, on the Message that starts
or revises the work, in the Message's `metadata` under
`https://agentmessaging.ai/extensions/budget/v1`:

```json
{ "deadline": "2026-11-14T17:00:00Z", "revision": 0,
  "costCeiling": { "amountMicro": 5000000, "currency": "USD" } }
```

- **A signed caller** puts the budget on the message inside its own frame,
  where its signature covers it. The bridge relays it with the rest of the
  frame.
- **A caller with no key** puts it in the same place on its message, and the
  bridge passes it unchanged in the frame it signs. The agent checks it as
  Agent Messaging §7.7 says.

A new Task's budget has `revision` 0. A Message on an existing Task carries a
budget only to revise it, with a higher `revision` (Agent Messaging §7.7).

**The older form.** Before 0.4.0-draft a caller with no key put the budget
under this extension's URI, as `budget`, with the members `cost_ceiling` and
`amount_micro`. During the transition window a bridge still accepts that form
when the message carries no budget extension. It checks it as Agent Messaging
§7.7 checks a budget, requires `revision` 0, and refuses one that fails with
`InvalidParamsError` (`-32602`) and `data.agentmesh_code: "INVALID_BUDGET"`,
sending nothing. Otherwise it puts the same budget on the message under the
budget extension's URI, with the members spelled `costCeiling` and
`amountMicro`, before it signs.

**Outcomes.** Every budget outcome is a Task state with the outcome named
under the budget extension's URI (binding §12.2): `insufficient` and
`deadline_unmeetable` in `TASK_STATE_REJECTED`, `ceiling_reached` in
`TASK_STATE_INPUT_REQUIRED`, and `exhausted` in `TASK_STATE_CANCELED`. Each
reaches the caller as the agent's Task, unchanged, so the caller can decide
whether to try again with more, revise the budget of a paused Task with a
higher `revision`, or cancel it with the reason `budget_exhausted` (§7). An
agent that answers only 0.3.0 refuses or pauses in the older form, and the
bridge presents it as the same outcomes (the A2A Bridge §5.2, §7.3).

The bridge's own fee is a separate matter, disclosed as the A2A Bridge §9.2
says. A budget bounds what the agent's work may cost; it is not a payment.

## 12. Security considerations

- **What the bridge can no longer do.** With a carried frame the bridge
  cannot change the request, cannot send it as a different sender and cannot
  answer it in the agent's name. A caller that verifies the returned frame
  is protected against a bridge that lies about the answer.
- **What it still can.** It can drop the request, delay it, or withhold the
  answer. A signed caller that needs proof of delivery reads the receipt the
  agent signs, as on the mesh.
- **Replay.** A carried frame is a bearer token for as long as somebody
  accepts it. The bridge refuses one outside the freshness window, and the
  receiver refuses a duplicate `(from, id)` (Agent Messaging §22.2, §22.3).
  A frame in the `Agent-Messaging-Frame` header is a frame like any other and
  gets the same checks.
- **Admission is the receiver's.** A signed caller is a native sender. The
  agent's door sorts it by its key, and a key the mesh does not know sorts as
  `anonymous`, whose default is `block` (EXT-6 §4). A first contact the door
  holds or blocks is answered with the same queued acknowledgement as on the
  mesh, and §9 says how the bridge answers it on A2A.

## 13. Conformance

`../conformance/a2a-bridge.json` pins the cases of §4 to §9 and of Agent
Messaging §5.8 as they apply here, for 0.4.0 frames and for the 0.3.0
envelopes the transition window keeps, and an implementation reads it in its
own tests. `../conformance/a2a-binding.json` pins the binding's frames that a
carried frame is one of. A bridge that lists this extension implements §2 to
§11. A signed caller implements §2 (finding the card), §3 and §6, and
verifies the frames it gets back. The A2A Bridge §12 says what else a bridge
claims.

## 14. Versions

- The carried frame is a frame of wire version 0.4.0, the binding's
  (binding §14). A bridge that implements 0.4.0-draft also accepts carried
  0.3.0 envelopes, whose `payload` is the `request` payload of Agent
  Messaging 0.9, until its operator ends the binding's transition window, and
  lists the versions it accepts in `wire_versions` (§2).
- The extension's URI is unchanged, because a 0.3.0-draft caller is still
  served during the window. A change that drops 0.3.0 changes no URI either:
  a card says it in `wire_versions`.
