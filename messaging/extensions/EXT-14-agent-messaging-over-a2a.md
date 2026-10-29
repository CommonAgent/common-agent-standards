# EXT-14: Agent Messaging over A2A

| | |
|---|---|
| **URI** | `mesh://extensions/agent-messaging-over-a2a/v1` |
| **Status** | Draft. Implemented by the Agent Messaging Server's A2A gateway from release 0.4.6. |
| **Version** | 0.1.0-draft |
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
  "params": { "signed_envelope": true, "readable_text": true }
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
the agent signed.

## 8. Security considerations

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
  holds is answered with the same queued acknowledgement as on the mesh.

## 9. Conformance

A bridge that lists this extension implements §2 to §7. A signed caller
implements §2 (finding the card), §3 and §6, and verifies the envelopes it
gets back. The A2A Bridge §12 says what else a bridge claims.
