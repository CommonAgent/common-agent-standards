# EXT-14: Agent Messaging over A2A

| | |
|---|---|
| **URI** | `mesh://extensions/agent-messaging-over-a2a/v1` |
| **Status** | Draft. Implemented by the Agent Messaging Server's A2A gateway from release 0.4.6. |
| **Version** | 0.3.1-draft (§13 names the fixture set). 0.3.0-draft: the card from the Descriptor, §10, and the budget, §11. 0.2.0-draft: the conversation, §8, and the knock, §9. 0.1.0-draft: signed requests, answers and readable text, §2 to §7. |
| **Requires** | Agent Messaging §5.1 to §5.3 (the envelope and its signature), §5.7 (messages for the person), §5.8 (readable text), §22 (inbound protections); the A2A Bridge (`../bindings/a2a-bridge.md`); A2A 1.0 extensions (A2A §4.6) |

The A2A Bridge lets a stock A2A client call an agent on a mesh. Without this
extension the caller's own signature stops at the bridge: the HTTPS leg
carries A2A JSON-RPC messages, and the bridge signs for a hosted identity it
keeps for the caller (Agent Messaging §4.15). That is the right answer for a
caller that holds no Agent Messaging key, and it is the only answer A2A alone
can give.

A caller that does hold a key should not have to give up its signature to use
HTTPS. This extension is how it keeps it. The caller signs an ordinary Agent
Messaging envelope and carries it inside the A2A message. The bridge checks it
and passes it to the mesh unchanged. The receiving agent verifies the caller's
own signature, exactly as it would on the mesh, and the answer comes back with
the agent's own signed envelope beside it. The same envelope then means the
same thing whether it travelled by broker, by email (Agent Emailing) or over
HTTPS.

## 1. Terms

- **Signed caller.** An A2A client that holds an Agent Messaging key and signs
  its own envelopes under this extension.
- **Bridged caller.** An A2A client with no key, for which the bridge signs
  (the A2A Bridge §9). Nothing in this extension changes how a bridged caller
  is served.
- **Carried envelope.** A signed Agent Messaging envelope, `sig` included,
  inside an A2A message's metadata.

## 2. Declaring the extension

A bridge that implements this extension lists it in every card it generates,
in `capabilities.extensions[]`:

```json
{
  "uri": "mesh://extensions/agent-messaging-over-a2a/v1",
  "description": "Agent Messaging over A2A: a caller that holds an Agent Messaging key carries its own signed envelope in this extension's metadata, and the gateway passes it through unchanged. Answers carry the agent's signed envelope.",
  "required": false,
  "params": { "signed_envelope": true, "readable_text": true, "budget": true }
}
```

`required` is always `false`: a caller without a key uses the card as before.

**Finding the card from a name.** Personal Agent Naming lets a name card list
an `a2a` endpoint, `{ "protocol": "a2a", "url": "…/agent-card.json" }`, and
leaves what a consumer does with an endpoint to its protocol (Personal Agent
Naming §5.1). For a signed caller, this section is that protocol. It resolves
the handle, reads the `a2a` endpoint, fetches the card, and checks that the
bridge marker's `agent_id` in the card (the A2A Bridge §8.3) equals the key on
the verified name card. It puts that key in the envelope's `to`. A card whose
`agent_id` differs from the name card's key is not that agent's card, and the
caller MUST NOT send to it.

## 3. Carrying a signed request

A signed caller sends `SendMessage` (JSON-RPC) or `message:send` (HTTP+JSON)
with:

- the extension's URI in the message's `extensions`;
- in `message.metadata`, under the extension's URI, an object whose
  `envelope` member is the signed request:

```json
{
  "message": {
    "role": "ROLE_USER",
    "parts": [{ "text": "Quote for 40 chairs, delivered by 14 November" }],
    "extensions": ["mesh://extensions/agent-messaging-over-a2a/v1"],
    "metadata": {
      "mesh://extensions/agent-messaging-over-a2a/v1": {
        "envelope": {
          "v": "0.3.0", "id": "…", "type": "request", "ts": "2026-10-29T18:02:11Z",
          "from": "<the caller's agent ID>", "to": "<the agent's ID>",
          "trace": { "trace_id": "…", "span_id": "…" },
          "payload": { "offering": "quote", "input": { "item": "chair", "quantity": 40 } },
          "sig": "…"
        }
      }
    }
  }
}
```

The envelope is authoritative. The bridge MUST NOT read the A2A `parts` for
content when an envelope is carried, and a receiver never sees them. A caller
SHOULD still send parts that say the same thing in A2A's terms, so that A2A
software along the way can show the message, and §6's rule applies to any
text a person will read.

A caller MAY also send `message.taskId` and `message.contextId`. When it does,
they MUST equal the envelope's `task_id` and `context_id`.

The HTTP admission of the A2A Bridge §9 applies unchanged: a signed caller
presents whatever credential the bridge requires, and the bridge counts its
calls against that credential's rate. The signature replaces the hosted
identity, not the admission.

`SendStreamingMessage` does not carry an envelope in this version. A bridge
MUST refuse one that does with `UnsupportedOperationError` (`-32004`).

## 4. What the bridge checks

Before it relays anything, the bridge MUST check that:

1. the carried value is an envelope with `id`, `from` and `sig`;
2. its signature verifies against its `from` (Agent Messaging §5.3);
3. its `type` is `request`;
4. its `to` is the agent whose interface URL the call came to;
5. its `ts` is inside the freshness window for live delivery (Agent Messaging
   §22.3);
6. its `payload.offering` is one the agent declares, or `task.cancel`, `knock`
   or `describe`. A message marked for the person (Agent Messaging §5.7)
   carries no offering and is not checked for one;
7. `message.taskId` and `message.contextId`, where present, match the
   envelope.

A failure refuses the whole call. The bridge relays nothing and answers with
`InvalidParamsError` (`-32602`), `data.agentmesh_code: "INVALID_ENVELOPE"` and
`data.reason` set to one of `malformed`, `signature`, `type`, `addressee`,
`stale`, `offering` or `mismatch`. On the HTTP+JSON binding the reason is
`INVALID_PARAMS` and the same two members are in
`details[0].metadata`.

The bridge does not check duplicates. The receiver does (Agent Messaging
§22.2), and a duplicate it refuses is refused there.

## 5. Relaying and answering

**The bridge passes the envelope through.** It publishes the carried envelope,
unchanged, to the inbox of the agent its `to` names. It MUST NOT sign it,
re-sign it, add to its `meta`, or send it from a hosted identity. It carries
neither `meta.identity_bridge` nor `meta.a2a_bridge`, because nothing in it is
the bridge's: the receiver sorts the sender by its own key, as it sorts any
native sender (EXT-6 §4).

**The answer comes to the signer's inbox.** The responder answers the
envelope's `from`, as it answers anyone (Agent Messaging §6.5). The bridge
reads the signer's inbox for answers to the envelope and takes one only when:

- it verifies on its own signature;
- its `in_reply_to` names the carried envelope and its `to` is the signer;
- its `from` is the agent the request went to. The one exception is the
  queued acknowledgement of the mesh's admission service (EXT-6 §7), which
  stands in for an agent that has not let the sender in. The bridge pins that
  service's key on first use, as an SDK does (Agent Messaging §6.2).

An accept signal (Agent Messaging §6.4a) resets the bridge's wait. Anything
else on the inbox is not the bridge's to read, and it ignores it. The signer's
own node, if one is running, may receive the same answer. It is addressed to
the signer, so that copy is the signer's business.

**The bridge returns the answer with its envelope.** The A2A result follows the
A2A Bridge §4.3: a bare `completed` answer is a Message, a deferred answer is a
Task, and a `failed` or `rejected` one is a JSON-RPC error. Whatever the shape,
the result carries the responder's signed envelope in the extension's
metadata: on the Message's or the Task's `metadata`, or in the error's `data`,
under the extension's URI, as `{ "envelope": … }`. A signed caller can then
verify what the agent said, not what the bridge says it said.

Files in the answer stay by reference. A signed caller holds its own key and
reads them itself (Agent Messaging §7.5.4). The bridge does not make signed
links for it.

**A bridged caller can ask for the envelope too.** A caller with no key that
lists the extension in its message's `extensions` gets the responder's signed
envelope on its results in the same way. The responder signed it to the
caller's hosted identity, and it verifies all the same.

**Activation is echoed.** When the bridge acts on the extension it names it in
the response's `A2A-Extensions` header (A2A §4.6, §14.2.2).

## 6. Readable text

A message meant for a person (Agent Messaging §5.7) that crosses the bridge
carries readable text generated from the signed envelope, under Agent
Messaging §5.8. On A2A that text is the first part of the message: a text part
whose `metadata`, under the extension's URI, is `{ "readable_text": true }`,
and the envelope rides beside it as §5 says. The envelope's
`meta.readable_text` is the digest of that text, signed by whoever signed the
envelope.

- **From a signed caller,** the caller generates the text and signs its
  digest.
- **From a bridged caller,** the bridge signs for the caller's hosted
  identity, so it generates the text and signs its digest.
- **From a mesh agent,** the agent signs the digest. A bridge that relays a
  person's reply generates the text part from the reply's envelope, so the
  digest the agent signed matches it.

Software that shows the text to a person runs §5.8's check against the
envelope beside it, and warns when they differ. A receiving agent never acts
on the text.

## 7. Tasks

**Reading.** A task that came from a carried request is the bridge's record of
the signer's exchange, read with `GetTask` on the same credential, as any
task is (the A2A Bridge §4.1). The bridge keeps it current from the
responder's own signed updates on the task's update subject (Agent Messaging
§7.3). It applies only an update the responder signed, and carries the latest
update's envelope on the task's `metadata`.

**Canceling.** The bridge holds no identity for a signed caller, so it cannot
cancel for it. `CancelTask` on such a task MUST carry, in `params.metadata`
under the extension's URI, the caller's own signed `task.cancel` request for
that task (Agent Messaging §10.8), signed by the same key that made the
original request. The bridge checks it as §4 says and relays it. Without one
the bridge answers `TaskNotCancelableError` (`-32002`) with
`data.agentmesh_code: "SIGNED_CANCEL_REQUIRED"`. A cancel signed by another
key, or naming another task, is refused with `reason: "mismatch"`.

**Queued.** When the answer is the queued acknowledgement, the result is a
Task in `submitted` whose id is the carried envelope's id, as for a bridged
caller (the A2A Bridge §4.3, §6.4a). The agent's late answer, when it comes, is
addressed to the signer. The bridge watches the signer's inbox for it while
the task record lasts and completes the task with it, applying only an answer
the agent signed. An acknowledgement that means the agent has not let the
signer in is answered as §9 says.

## 8. Answering on the same task

An agent that needs more from its caller pauses its task in
`input_required` or `auth_required` (Agent Messaging §7.3). On A2A the caller
answers by sending a new message with the same `taskId` and `contextId` (A2A
§3.4.3). The bridge carries that answer to the mesh as the follow-up
`request` Agent Messaging §7.3 names, on the same mesh task, so the agent
resumes its own task.

**Seeing that the agent is waiting.** `GetTask` follows the task as the
mesh reports it, not only as its first answer left it. A task the agent
paused reads `input-required` (or `auth-required`), and its status message
carries the words of the agent's update, such as the question it asks
(`payload.message`). A caller reads the task only when it asks, so it may
never see `working`; it applies what it reads as Agent Messaging §7.3.1 says,
which lets `input-required` follow nothing and `completed` follow
`input-required`.

**A caller with no key.** The bridge sends a follow-up request from the
caller's hosted identity, with:

- the task's id in the envelope's `task_id`;
- the task's `context_id`;
- the offering the task's first request named;
- the answer's parts as `input`, mapped as the A2A Bridge §6 maps any
  message.

The bridge MUST refuse, before sending anything:

- a `taskId` that names no task of this caller's on this agent, with
  `TaskNotFoundError` (`-32001`), as A2A §3.4.2 requires;
- a `contextId` that differs from the task's, with `InvalidParamsError`
  (`-32602`), as A2A §3.4.3 requires;
- an answer to a task that is not waiting for input, with
  `InvalidParamsError` (`-32602`) and
  `data.agentmesh_code: "TASK_INVALID_TRANSITION"`.

The result is the task as the agent's answer leaves it: `working`,
`completed` with the output as its status message, or paused again.

**A signed caller.** The caller signs the follow-up request itself, with
the task's id in its `task_id` and the task's `context_id`, and carries it
as §3 says. The bridge checks and relays it like any carried request, and
§4's check 7 holds `message.taskId` and `message.contextId` to the
envelope's.

**`exhausted`.** A2A has no state for work that stopped because the money
ran out (Agent Messaging §7.2). The bridge maps it to `canceled` (the A2A
Bridge §5) and puts `"agentmesh.state": "exhausted"` in the task's
`metadata`, so a caller can tell work that stopped at its cap from work
somebody canceled.

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
the bridge answers the A2A caller with a task in `auth-required` whose id is
the request's id and whose status message says, in plain words:

- that the agent's owner has not let the caller in;
- that what it sent is with the owner, who decides, and that nothing
  reaches the agent until they do;
- that if the owner lets it in, a reply that names the request lands on
  this task, so it polls `GetTask`;
- how to knock without sending anything (below).

The task's `metadata` carries `"agentmesh.admission": "held"`. The answer is
the same for a held caller, a blocked one and an agent that does not exist,
because the acknowledgement is the same. The bridge MUST NOT answer
`rejected`, which would tell a blocked caller that it is blocked. An
acknowledgement that says `delivered: true` or `paused: true` stays a task in
`submitted`, as the A2A Bridge §4.3 says.

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

- **A caller with no key.** The bridge sends the content-free `knock`
  request from the caller's hosted identity, with only `via` and `grants`.
  It MUST NOT send the message's parts: a knock carries no words.
- **A signed caller.** It signs a `request` on the `knock` offering itself,
  with the same input, and carries it as §3 says. The bridge relays it.

**The answer.** A caller the door lets in (the door's answer says
`admitted: true`, EXT-6 §9.3) gets a Message whose one data part is
`{ "admitted": true, "extensions": [ … ] }`, with the agent's signed answer
beside it. Every other outcome, held, blocked, rate-limited or no such agent,
gets the same task in `auth-required`, with a status message that says the
knock is with the owner and that nothing more is needed, and
`"agentmesh.admission": "knocked"` in its `metadata`. The owner sees the
knock where they see every knock (EXT-6 §9.1), with the caller's hosted
identity or its own key.

## 10. The card from the Descriptor

The Common Agent Specification makes an agent's Descriptor the one
description of it, and every other description a projection of the
Descriptor. An A2A card is one such projection. So a bridge that generates a
card for an agent that published a Descriptor generates it from the
Descriptor itself, not from the registration manifest's copy of it.

**What comes from the Descriptor.** Where the agent published a Descriptor
(the manifest points to it by digest and the registry keeps it, Agent Messaging §8.13), the generated card
takes:

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
Descriptor gets the card §8.1 makes from its manifest.

**What the card cannot hold.** An A2A card declares media types, not the
inputs and outputs of the work. The extension's entry in
`capabilities.extensions[]` carries them in its `params`:

```json
"params": {
  "signed_envelope": true,
  "readable_text": true,
  "budget": true,
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

A request on the mesh carries its budget (Agent Messaging §7.7): the most
the work may cost, the latest it may finish, or both. The agent applies it
to the task, refuses with an estimate when the work would not fit it, and
pauses when the money runs out. Over A2A the budget travels the same way.

- **A signed caller** puts the budget in its own envelope, where its
  signature covers it. The bridge relays it with the rest of the envelope.
- **A caller with no key** puts it under the extension's URI in the
  message's `metadata`, as `budget`, in the same shape:

  ```json
  { "budget": { "revision": 0, "deadline": "2026-11-14T17:00:00Z",
                "cost_ceiling": { "amount_micro": 5000000, "currency": "USD" } } }
  ```

  The bridge checks it as Agent Messaging §7.7 checks a budget, and requires
  `revision` 0, as for any new request. A budget that fails the check is
  refused with `InvalidParamsError` (`-32602`) and
  `data.agentmesh_code: "INVALID_BUDGET"`, and nothing is sent. Otherwise the
  bridge carries it on the request it signs for the caller.

A budget is for a new request. An answer on an existing task (§8) carries
none, because a task's budget changes only by revision (Agent Messaging
§7.7).

**Refusals.** An agent's budget refusal (`BUDGET_INSUFFICIENT`, or a pause
with `BUDGET_EXHAUSTED`) reaches the caller as the A2A Bridge §7 maps it, with
the refusal's `details`, such as the estimate, in the error's `data.details`,
so the caller can decide whether to try again with more.

The bridge's own fee is a separate matter, disclosed as the A2A Bridge §9.2
says. A budget bounds what the agent's work may cost; it is not a payment.

## 12. Security considerations

- **What the bridge can no longer do.** With a carried envelope the bridge
  cannot change the request, cannot send it as a different sender and cannot
  answer it in the agent's name. A caller that verifies the returned envelope
  is protected against a bridge that lies about the answer.
- **What it still can.** It can drop the request, delay it, or withhold the
  answer. A signed caller that needs proof of delivery reads the receipt the
  agent signs, as on the mesh.
- **Replay.** A carried envelope is a bearer token for as long as somebody
  accepts it. The bridge refuses one outside the freshness window, and the
  receiver refuses a duplicate `(from, id)` (Agent Messaging §22.2, §22.3).
- **Admission is the receiver's.** A signed caller is a native sender. The
  agent's door sorts it by its key, and a key the mesh does not know sorts as
  `anonymous`, whose default is `block` (EXT-6 §4). A first contact the door
  holds or blocks is answered with the same queued acknowledgement as on the
  mesh, and §9 says how the bridge answers it on A2A.

## 13. Conformance

`../conformance/a2a-bridge.json` pins the cases of §4 to §9 and of Agent Messaging §5.8 as they apply here, and an implementation reads it in its own tests. A bridge that lists this extension implements §2 to §11. A signed caller
implements §2 (finding the card), §3 and §6, and verifies the envelopes it
gets back. The A2A Bridge §12 says what else a bridge claims.
