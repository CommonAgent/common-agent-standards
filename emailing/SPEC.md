# Agent Emailing 0.4

Signed agent messages carried by ordinary email

**Version:** 0.4.0
**Status:** Published
**Date:** 2026-11-07

Agent Emailing says how a signed Agent Messaging envelope travels inside an ordinary email, so that two agents can exchange requests and answers through any email provider. It covers only the email parts. The envelope, its signature and the receiver protections are defined by Agent Messaging. What the envelope carries between agents is A2A's: its operations, and its Tasks, Messages, Parts and Artifacts with their states, carried as the binding A2A over Agent Messaging says. This document refers to all of them by section number. It never restates or changes them.

Every section number in this document that is written "Agent Messaging §n" refers to the Agent Messaging specification, version 0.10.0-draft. "The A2A binding §n" refers to A2A over Agent Messaging (binding URI `https://agentmessaging.ai/bindings/a2a/v1`), version 0.3.0-draft, which is Agent Messaging wire version 0.4.0. "A2A §n" refers to the A2A Protocol, version 1.0 (https://a2a-protocol.org/latest/specification/). "EXT-6" and "EXT-7" are the Agent Messaging extensions of those numbers. "Personal Agent Naming §n" refers to the Personal Agent Naming specification, version 0.10.3. A bare "§n" refers to this document.

---

## 1. Introduction

### 1.1. What this standard is

Agent Messaging defines a signed envelope that one agent sends to another (Agent Messaging §5), and the `request` and `respond` messages that carry work between them (Agent Messaging §6.4, §6.5). Each call between agents is an A2A operation in a `request` frame, and each answer is a `respond` frame, as the A2A binding §4 and §5 say. A binding carries those envelopes over a message broker (Agent Messaging §18).

Agent Emailing carries the same envelopes over email instead. The envelope travels as an attachment. The receiving agent verifies its signature exactly as it would on a broker, because the signature never depended on the wire (Agent Messaging §1.5, invariant 5). The email provider is only the pipe.

Agent Emailing is not a binding in the sense of Agent Messaging §18. Email does not provide what Agent Messaging §18.1 requires of a binding, and an Agent Emailing implementation does not claim the core profile of Agent Messaging §1.6. §2.3 says why.

### 1.2. Who it is for

Agent Emailing is for agents that have no connection to a message broker. A personal assistant, a small business's agent, or an agent run by a company that has not deployed a broker can still hold a signing key and an email address. With this standard, such an agent can send a signed request to another agent and get a signed answer back.

It is also for email providers. Many providers now offer inboxes for agents, each with its own API. This standard asks them to carry one attachment unchanged and to deliver it unchanged. A provider that does that can carry Agent Emailing without knowing anything about agents (§11).

### 1.3. What Agent Messaging defines, and this document uses

| Subject | Defined by | What this document adds |
|---|---|---|
| The envelope and its fields | Agent Messaging §5.1, §5.2 | Where the envelope sits in an email (§3.2) |
| Signing and verification, canonical JSON | Agent Messaging §4.5, §5.3 | Nothing. Verification is unchanged (§6.1) |
| `request` and `respond` | Agent Messaging §6.4, §6.5 | How each is sent as an email (§3) |
| A2A operations in frames | The A2A binding §4, §5 | Which operations travel by email (§2) |
| Tasks, Messages, Parts and Artifacts, and the states of a Task | A2A §4, carried as the A2A binding §6 says | How task updates travel by email, and their order when they arrive out of order (§10) |
| Files by reference | Agent Messaging §7.5, the A2A binding §6 and §12.5 | The `cid:` reference, for files carried in the same email (§3.4) |
| Errors | Agent Messaging §12, the A2A binding §9 | Nothing. Errors travel as `respond` envelopes |
| Receiver protections | Agent Messaging §22 | Which window applies, and that the duplicate memory persists (§7) |
| Admission | EXT-6 | Where email senders sort (§4.2, §6.2) |
| Sealing | EXT-7 | Files in a sealed email, and what the provider sees (§9) |
| Identity bridges | Agent Messaging §4.15 | The `email` front and caller kind (§4.2) |
| Names | Personal Agent Naming | The `email` endpoint on a name card (§5.1) |

Where this document and Agent Messaging appear to differ, Agent Messaging governs, and this document is what changes.

### 1.4. Requirements language

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

### 1.5. Terminology

- **Agent email:** an email that carries exactly one envelope part (§3.2).
- **Envelope part:** the MIME part that holds a signed Agent Messaging envelope.
- **File part:** a MIME part that holds the bytes of a file the envelope refers to with a `cid:` reference (§3.4).
- **Human part:** the readable text at the start of an agent email (§3.3).
- **Hint header:** an optional email header that copies a value from the envelope (§3.5).
- **Sending agent** and **receiving agent:** the agents that sign and verify the envelope.
- **Carrier:** the email provider, or the mail system, that sends and receives agent email for an agent. A carrier never signs envelopes.
- **Bridge:** a node in the sense of Agent Messaging §4.15 that hosts a mesh identity for a person or agent that sends plain email (§4.2).
- **Email endpoint:** the email address on a name card where an agent receives agent email (§5.1).
- **Native mode:** the sending agent holds its own key and signs the envelope (§4.1).
- **Bridged mode:** a bridge signs for a sender that sent plain email (§4.2).

---

## 2. Scope

### 2.1. What travels by email

These Agent Messaging messages MAY travel as agent email:

- `request` (Agent Messaging §6.4) carrying an A2A operation of the A2A binding §5, such as `SendMessage`, `GetTask` or `CancelTask`, except the streaming operations of §2.2;
- a knock, which is a request on the `knock` offering (EXT-6 §9.3) and is not an A2A operation (the A2A binding §11);
- `respond` (Agent Messaging §6.5) carrying an answer to an A2A operation, including task updates (§10) and errors (the A2A binding §9);
- a request or respond marked for the person behind the receiving agent (Agent Messaging §5.7).

### 2.2. What does not

These parts of Agent Messaging MUST NOT be carried as agent email, and an implementation MUST NOT present them as available over email:

- `register` and `discover` (Agent Messaging §6.2, §6.3). The registry is reached over a broker or over HTTPS.
- `emit`, `subscribe` and feeds (Agent Messaging §6.6, §6.6a, §6.7). Email has no subjects, no wildcards and no replay.
- Presence and heartbeats (Agent Messaging §9.6, §10.10). An email arriving says nothing about whether an agent is online now.
- Streaming: the operations `SendStreamingMessage` and `SubscribeToTask`, whose events are published on a task's stream subject (the A2A binding §8). Email has no subjects. A requester sends `SendMessage` instead and gets its updates as §10 says. A receiving agent that gets a streaming operation by email answers it with A2A's `UnsupportedOperationError`. In a 0.3.0 envelope (§3.2), a request with `payload.config.stream` set to `true` is not streamed: the receiving agent answers in task mode with ordinary task updates (§10).
- Rooms (EXT-5).
- The accept signal (Agent Messaging §6.4a). §8 explains why.

### 2.3. Why this is not a binding

Agent Messaging §18.1 lists what every binding MUST provide. Email provides some of it and not the rest:

| Agent Messaging §18.1 requirement | Email |
|---|---|
| Hierarchical subject addressing with wildcards | Not provided. An email address names one mailbox. |
| Ordered, at-least-once delivery per subject, with deduplication on `(from, id)` | At-least-once, with no order. Deduplication is the receiver's (§7.1). |
| Durable publish and subscribe | Not provided. |
| Request-reply with a reply address and a timeout | Not provided. A reply is a new email. |
| Durable task store | Not provided. Each party keeps its own task records (§10). |
| Large-payload storage | Partly. Files travel as attachments up to a size limit (§3.7). |
| Identity and credentials, node authentication, subject permissions | Not provided. Only the envelope signature identifies the sender. |
| Presence with time-to-live expiry | Not provided. |
| The `mesh` object of Agent Messaging §18.10 | Not applicable. There is no mesh server. |

A server that leaves out any part of the core profile does not implement Agent Messaging (Agent Messaging §1.6, rule 3). So Agent Emailing is a separate standard that uses Agent Messaging's envelope and rules. It is not a way to run an Agent Messaging mesh.

---

## 3. Message format

### 3.1. Structure

An agent email is a MIME message ([RFC 2045](https://www.rfc-editor.org/rfc/rfc2045) to [RFC 2049](https://www.rfc-editor.org/rfc/rfc2049)) whose top-level type is `multipart/mixed`. Its parts are, in this order:

1. the human part (§3.3), which is REQUIRED;
2. exactly one envelope part (§3.2);
3. zero or more file parts (§3.4).

```
multipart/mixed
├── text/plain: the human part, or a multipart/alternative
├── application/vnd.agentmessaging.envelope+json: the envelope part, envelope.json
└── text/calendar, application/pdf and others: file parts, each with a Content-ID
```

A receiver MUST find the envelope part by its media type, wherever it sits in the outer email's own MIME tree, and MUST NOT depend on its position. An email attached inside the email (a `message/rfc822` part) is another email: a receiver MUST NOT look inside it for an envelope part, and an envelope part inside it does not count toward the parts of the outer email. An email with more than one envelope part MUST be refused whole, silently, with a local signal (§7.2). An email with no envelope part is not an agent email, and §4.3 says what happens to it.

### 3.2. The envelope part

The envelope part holds one signed Agent Messaging envelope (Agent Messaging §5.1), including its `sig`, as JSON in UTF-8.

- Its media type MUST be `application/vnd.agentmessaging.envelope+json`.
- It MUST carry `Content-Disposition: attachment` with the filename `envelope.json`.
- A sender MUST encode it with `Content-Transfer-Encoding: base64`. A receiver MUST also accept quoted-printable, 7bit and 8bit, because a carrier may re-encode a part in transit.
- The envelope's `v` is the Agent Messaging wire version (Agent Messaging §5.2).

**Wire versions.** A sender MUST send wire version `0.4.0`, whose `request` and `respond` frames carry A2A objects as the A2A binding §4 says. Such a frame never carries the envelope fields `task_id`, `context_id` or `artifacts`, and a receiver MUST refuse a 0.4.0 envelope that carries any of them with `INVALID_ENVELOPE` (the A2A binding §4). A receiver MUST also accept envelopes of wire version `0.3.0`, which Agent Emailing 0.2 and 0.3 senders send and whose calls use the `request` payloads and the task fields of Agent Messaging 0.9, until its operator ends that window, as the A2A binding §14 says. It SHOULD answer each request in the wire version the request arrived in. Where this document names a field of a 0.3.0 envelope, it says so.

A receiver MUST parse the JSON and verify the signature over the canonical form of the parsed values (Agent Messaging §5.3). It MUST NOT compare the received bytes with any other bytes. A carrier that re-encodes the part, re-wraps its lines, or changes the JSON whitespace therefore does not break the signature. A carrier that changes any value does.

The envelope travels as an attachment, and not in a header or in the body text, because every carrier can send and receive an attachment with a chosen media type, while many carriers restrict custom headers (§11).

### 3.3. The human part and the subject

A person who opens the mailbox must be able to understand what the agents exchanged without opening any attachment. The human part says it in plain words, and the subject says it in the inbox list.

This section applies Agent Messaging §5.8, readable text generated from a signed message, to email. The human part is that section's readable text, `human_text` below is its digest under this standard's own name, and the A2A Bridge applies the same rule to A2A. Where this section asks for more than Agent Messaging §5.8 (the subject, what happens next, the time zone), the more applies to email.

#### What the human part is

- The human part is REQUIRED.
- It MUST include a `text/plain` part. It MAY be a `multipart/alternative` that also has a `text/html` part, which MUST be made from the same text.
- It MUST be generated from the envelope, and from the facts the sender's and the receiver's verified name cards state (Personal Agent Naming §5.1). It MUST NOT be written separately. A sender that writes the text by hand, or lets a model write it, can say something the agents did not act on, and this rule exists to prevent that.
- A sender MUST NOT use `format=flowed` for the text part, and SHOULD keep it in UTF-8.

#### What it states

In plain words, the human part MUST state:

1. **Who sent it, and for whom:** the sender's handle and the person or organization it acts for, and the receiver's handle.
2. **What was asked:** the offering the Message names in the offering extension (the A2A binding §12.1), by the name the receiving agent's manifest gives it (Agent Messaging §8.1), or by its `id` when no name is known.
3. **What was handed over:** each attached file, by its name. When nothing is attached, it says so.
4. **For a respond:** the outcome in words (done, needs your input, declined, failed, and the others in the table below), the result in a sentence, what is needed when more input is needed, and each file returned, by name. For a Task that failed or was canceled, it also states the reason the Task's `metadata` gives in the failure extension or the cancel extension (the A2A binding §12.7, §12.6), where there is one.
5. **The price, where there is one:** a request's cost ceiling, from the budget extension (the A2A binding §12.2), or the amount a respond reports in `payload.price`. `payload.price` is a money object as Agent Messaging §19.3 defines it, `{ "amount_micro": <integer>, "currency": "<ISO 4217 code>" }`, and states what the responder charges for the work this respond reports. In a 0.4.0 frame it sits beside `payload.a2a` and never inside the A2A object, as `payload.usage` and `payload.cost` do (Agent Messaging §13.5, §19.3). A respond that charges nothing leaves it out.
6. **What happens next,** or what the person must do.

The message's own text MUST appear in the human part word for word. In a 0.4.0 envelope that is the text Parts of the A2A Message the frame carries: the Message a request sends, or, in a respond, the Message that answers or the status message of the Task. In a 0.3.0 envelope it is `payload.text`. Times SHOULD be shown in the time zone of the person who will read them, where the sender knows it, and otherwise in UTC.

When the envelope is sealed (§9), the subject and the outcome come from `meta.a2a_state`, the Task's state that the sender may put in clear (the A2A binding §8a), and map as the table below says. A sender that leaves `meta.a2a_state` out writes `update` as the state, and the human part says that the outcome is sealed. `meta.a2a_state` holds only the state's name, so a Task the cap ended reads `canceled` there. When the envelope is sealed, the human part MUST NOT contain the sealed content, the sealed files' names, or anything else from the sealed payload. It still states who sent it, the offering and the outcome, which Agent Messaging §8.9 leaves readable, and says that the content is sealed for the receiving agent.

#### The subject

The subject MUST be the offering in words, followed by a dash and the state, so that the inbox alone tells the story:

The state in the subject follows the A2A state of the Task the frame carries (A2A §4.1.3):

| Envelope | State in the subject | Example |
|---|---|---|
| A new `request`: `SendMessage` whose Message names no Task | `request` | `Book a meeting — request` |
| A `request` that continues a task with more input: `SendMessage` whose Message names the Task's `taskId` | `answer` | `Re: Book a meeting — answer` |
| A `request` carrying `CancelTask` | `cancel` | `Re: Book a meeting — cancel` |
| A `respond` whose Task is `TASK_STATE_COMPLETED`, or whose answer is a Message with no Task | `done` | `Re: Book a meeting — done` |
| `TASK_STATE_INPUT_REQUIRED` or `TASK_STATE_AUTH_REQUIRED` | `needs your input` | `Re: Book a meeting — needs your input` |
| `TASK_STATE_REJECTED` | `declined` | `Re: Book a meeting — declined` |
| `TASK_STATE_FAILED` | `failed` | `Re: Book a meeting — failed` |
| `TASK_STATE_CANCELED` | `canceled` | `Re: Book a meeting — canceled` |
| `TASK_STATE_CANCELED` with the outcome `exhausted` in the budget extension (the A2A binding §12.2) | `stopped at its limit` | `Re: Book a meeting — stopped at its limit` |
| `TASK_STATE_SUBMITTED` or `TASK_STATE_WORKING` | `in progress` | `Re: Book a meeting — in progress` |

A 0.3.0 envelope (§3.2) names its state in `payload.status` with the lowercase names of Agent Messaging 0.9, and they map the same way: `completed` is `done`, `input_required` and `auth_required` are `needs your input`, `rejected` is `declined`, `failed` and `canceled` keep their names, `exhausted` is `stopped at its limit`, and `submitted` and `working` are `in progress`. A 0.3.0 `request` that carries a `task_id` is an `answer`, and one on the `task.cancel` offering is a `cancel`.

Every email in a thread except the first begins with `Re: `. A subject with characters outside ASCII, such as the dash, is encoded as [RFC 2047](https://www.rfc-editor.org/rfc/rfc2047) says.

The sender sets the subject itself, on every email, from the envelope it is sending. A sender MUST NOT use a carrier's reply operation, or any other shortcut, that writes the subject from the email being answered, because that subject carries the earlier state. Where a carrier's reply operation sets the subject on its own, the sender sends a new email instead and sets `In-Reply-To` and `References` itself (§3.6).

#### The signed summary

So that anyone can tell whether the text and the subject are the ones the sender signed, the sender MUST put an `agent_emailing` object in the envelope's `meta`, which the envelope signature covers (Agent Messaging §5.2, §5.7):

```json
"meta": {
  "agent_emailing": {
    "v": "0.4.0",
    "offering_name": "Book a meeting",
    "subject": "Book a meeting — request",
    "human_text": "sha256:<64 lowercase hex>"
  }
}
```

The object sits in `meta` beside `meta.a2a`, the A2A service parameters (the A2A binding §7), and is not one of them.

- `v` is the version of this standard. A sender of this version writes `0.4.0`. A 0.3.0 envelope from an Agent Emailing 0.2 or 0.3 sender carries `0.2.0` or `0.3.0`, and a receiver reads them all the same way.
- `offering_name` is the name the human part and the subject use for the offering.
- `subject` is the exact subject, before RFC 2047 encoding.
- `human_text` is the SHA-256 of the `text/plain` part after it is normalized: decoded to Unicode, line endings made LF, spaces and tabs at the end of each line removed, empty lines at the end removed, and encoded as UTF-8.
- When there is a `text/html` part, `human_html` is the SHA-256 of its decoded bytes.

The sender generates the text first, from the envelope without this object, then adds the object, then signs.

#### Who reads it

A receiving agent MUST NOT act on the human part or the subject, MUST NOT give either to a model, a tool or an offering handler, and MUST NOT treat any difference between them and the envelope as meaningful. What a model may read is the envelope's payload, under Agent Messaging §22.6.

Software that shows the human part to a person, such as a mail program or a provider's web mail, SHOULD check it against the envelope before it shows it. The check is that:

1. the envelope's signature verifies (§6.1);
2. the normalized text's digest equals `human_text`, and the decoded subject equals `subject`; and
3. the text states the sender's handle, `offering_name`, every file name in the envelope, the outcome of a respond, the price where there is one, and the message's own text word for word (§3.3, What it states).

When any part of the check fails, the software SHOULD warn the person that the text differs from the signed message, and SHOULD show what the envelope says. It MUST NOT show any sign that the message was checked unless every part of the check passed.

### 3.4. File parts and the `cid:` reference

A file the envelope refers to MAY travel in the same email as a file part.

- In a 0.4.0 envelope, a file is an A2A Part whose `url` is the reference (the A2A binding §6): a Part of the Message a request sends, or a Part of an Artifact or of a Message in a respond. Its `filename` is the file's name. In a 0.3.0 envelope, a request's files are entries of `payload.files` and a respond's files are `ref` parts of its artifacts (Agent Messaging §7.5, §7.5.3).
- The reference is a `cid:` URI ([RFC 2392](https://www.rfc-editor.org/rfc/rfc2392)) that names the file part's `Content-ID`. The A2A binding §12.5 names `cid:` as the reference email uses.
- A file with a `cid:` reference MUST carry its media type, its size and its digest. In a 0.4.0 envelope the media type is the Part's `mediaType`, and the size and digest are the Part's artifact references extension (the A2A binding §12.5). In a 0.3.0 envelope they are the entry's `media_type`, `size` and `digest` (Agent Messaging §7.5.1). This is stricter than Agent Messaging, where the digest is optional, because the signature then covers the file: the envelope is signed, the file part is not, and the digest is what binds one to the other.
- A file part SHOULD use `Content-Disposition: attachment`, and MUST be encoded with base64.

A receiver resolves a `cid:` reference only within the email it arrived in. It decodes the part's bytes, then checks their length against `size` and their SHA-256 against `digest`. A mismatch MUST be treated as a failed fetch (Agent Messaging §7.5.1). A reference with no matching part is unresolvable. Either outcome affects that file only, and the rest of the message is still delivered.

A receiver SHOULD NOT check or open file parts before it has admitted the message (Agent Messaging §7.5.3). A file part that no entry refers to MUST NOT be given to the agent.

A `cid:` reference means nothing outside the email that carried it. A bridge that relays an agent email to an agent on a broker MUST deliver the file bytes together with the envelope, because it cannot rewrite a signed reference.

### 3.5. Headers

An agent email MUST carry the headers [RFC 5322](https://www.rfc-editor.org/rfc/rfc5322) requires: `From`, `Date`, and a destination such as `To`. It SHOULD carry `Message-ID` and `Subject`.

A sender SHOULD set `Auto-Submitted: auto-generated` ([RFC 3834](https://www.rfc-editor.org/rfc/rfc3834)) when its carrier allows it.

A sender MAY add these hint headers when its carrier allows it:

| Hint header | Copies |
|---|---|
| `Agent-Emailing-Version` | The version of this standard, `0.4.0` |
| `Agent-Messaging-Id` | The envelope's `id` |
| `Agent-Messaging-Type` | The envelope's `type` |
| `Agent-Messaging-Task` | The A2A Task id the frame's A2A object names, where it names one; in a 0.3.0 envelope, its `task_id` |
| `Agent-Messaging-Context` | The A2A context id the frame's A2A object names, where it names one; in a 0.3.0 envelope, its `context_id` |

Hint headers exist so that mail filters and people can sort agent email without opening attachments. A receiver MUST take every value from the envelope and never from a hint header. When a hint header disagrees with the envelope, the receiver MUST process the envelope as if the header were absent, and SHOULD raise a local signal. A sender that DKIM-signs its mail SHOULD include the hint headers in the signature.

### 3.6. Correlation and threading

Correlation is the envelope's business. A respond names its request in `in_reply_to` (the A2A binding §4), and work is grouped by the Task id and the context id in the A2A objects the frames carry (A2A §3.4), or, in a 0.3.0 envelope, by `task_id` and `context_id` (Agent Messaging §5.2, §6.5). A receiver MUST correlate by those values alone.

The email's `Message-ID` is not the envelope's `id`. Some carriers assign their own `Message-ID` and overwrite the sender's. A sender MUST NOT rely on choosing it, and a receiver MUST NOT correlate by it.

So that a person's mail program shows the exchange as one thread, every email after the first SHOULD set `In-Reply-To` to the `Message-ID` of the email it answers, and `References` to the `Message-ID`s of the thread so far. Its subject begins with `Re: ` and carries the new state (§3.3). Some mail programs also compare subjects when they group a thread, and may show a change of state as a new thread. The threading headers are what keep it together.

### 3.7. Size

A sender MUST keep the whole encoded email within its carrier's limit and within the receiving endpoint's `max_message_bytes` (§5.1). When the endpoint states no limit, a sender SHOULD keep the encoded email under 10 MB. Base64 makes a file about a third larger.

A file too large for that MUST NOT be attached. The sender carries it by a reference the receiver can resolve, or by an address (a `url` Part naming one, or in a 0.3.0 envelope a `uri` entry, Agent Messaging §7.5.3), which a receiver MUST NOT fetch on its own. A short-lived signed download link (Agent Messaging §7.5.4) is the usual way.

The envelope itself is also bounded by the receiver's inbound size cap (Agent Messaging §22.5).

---

## 4. Modes

### 4.1. Native mode

In native mode, the sending agent holds its own Ed25519 key (Agent Messaging §4.3) and signs the envelope itself (Agent Messaging §4.5, §5.3). The receiving agent verifies the signature against `from`. The email address the message came from plays no part in who sent it.

### 4.2. Bridged mode

In bridged mode, a person or an agent sends plain email with no envelope to an address a bridge serves. The bridge hosts a mesh identity for the sender and signs for it, under every rule of Agent Messaging §4.15. In particular:

- the bridge is a node, and every distinct sender gets its own lasting identity (Agent Messaging §4.15, rules 1 and 3);
- the bridge's signature is its vouch, and a receiver MUST NOT treat bridged traffic as native (rule 2);
- every envelope the bridge signs carries the `identity_bridge` marker in its `meta` (rule 4), with `front` set to `email` and `caller_kind` set to `email`;
- `caller_ref` is the lowercase hex SHA-256 of the sender's address (the addr-spec of `From`), lowercased, in UTF-8.

Agent Messaging §4.15 lists the fronts `https`, `mcp` and `a2a` and the caller kinds it knows. A receiver that meets `caller_kind` `email` and does not know it treats the sender as bridged with no further standing, as Agent Messaging §4.15 requires. No change to Agent Messaging is needed for bridged mode to work.

**The credential is the sender's domain authentication.** Agent Messaging §4.15, rule 5, says a bridge checks a credential on every call. For email, that credential is a DMARC pass ([RFC 9989](https://www.rfc-editor.org/rfc/rfc9989)) for the `From` domain, with an aligned DKIM signature ([RFC 6376](https://www.rfc-editor.org/rfc/rfc6376)). A bridge MUST NOT host an identity for, or sign for, a message without an aligned DMARC pass. Such a message is handled as §4.3 says.

This credential is weaker than an OAuth token. It proves that the sender's domain sent the message, and it relies on that domain to have authenticated its own user. A receiver sorts a bridged sender into EXT-6's `bridged` tier, whose default stance is `hold` (EXT-6 §4, §10).

**What the bridge signs.** The bridge turns a plain email into a `request` frame that carries `SendMessage` (the A2A binding §5), as follows:

- The Message names, in the offering extension (the A2A binding §12.1), the offering the bridge's operator names for plain email to the receiving agent, its default offering. When the operator names none, it is `message`.
- The Message's text Part is the email's `text/plain` body, decoded and normalized as §3.3 normalizes the human part. An email with no `text/plain` part has the text of its `text/html` part, with the markup removed, normalized the same way.
- `payload.subject`, beside `payload.a2a`, is the email's decoded subject, when it has one.
- Each attachment of the email becomes a file Part of the Message (§3.4), with its `filename`, its `mediaType`, and its size and digest in the artifact references extension. The bridge delivers the attachments' bytes together with the envelope, as §3.4 says a relaying bridge does.
- `id` is derived from the email's own `Message-ID`, so that a redelivered email yields the same envelope `id` and the duplicate memory refuses it (§7.1). It is a version 8 UUID ([RFC 9562](https://www.rfc-editor.org/rfc/rfc9562)) made from the first 16 bytes of the SHA-256 of the UTF-8 string `agent-emailing bridged`, a newline, the sender's `caller_ref`, a newline, and the `Message-ID` with its angle brackets, with the version and variant bits set as RFC 9562 says. An email with no `Message-ID` uses its subject, a newline and the text in its place.

A bridge that sends a 0.3.0 envelope (§3.2) writes the same facts as `payload.offering`, `payload.text`, `payload.subject` and entries of `payload.files` (Agent Messaging 0.9 §7.5.3).

A bridge that answers a bridged sender sends a plain email to the sender's address. Its human part carries the agent's answer. It MAY also carry the envelope part.

### 4.3. Email with no envelope

An email with no envelope part, from a sender no bridge hosts, MUST NOT reach a receiving agent's model, tools or offering handlers. The pre-admission surface is only `describe` and `knock` (Agent Messaging §1.5, invariant 4). A receiver MAY record such an email as a held attempt for its owner to review (EXT-6 §9.1), or MAY discard it.

### 4.4. An envelope that does not verify

An email whose envelope part does not parse, or whose signature does not verify, MUST be refused whole (Agent Messaging §5.3). The receiver MUST NOT fall back to treating it as plain email in bridged mode, and MUST NOT answer it. Answering would put the receiver's signature on a reply to a message its supposed sender may never have sent (Agent Messaging §22.7). The receiver SHOULD raise a local signal.

---

## 5. Addressing

### 5.1. The email endpoint on a name card

An agent that receives agent email publishes the address on its name card, as an endpoint (Personal Agent Naming §5.1):

```json
{ "protocol": "email", "address": "bookings-agent@mail.example.com", "max_message_bytes": 10485760 }
```

- `protocol` is `email`.
- `address` is an addr-spec ([RFC 5322](https://www.rfc-editor.org/rfc/rfc5322) §3.4.1). It is REQUIRED.
- `max_message_bytes` is the largest encoded email the agent accepts. It is OPTIONAL.

A registrar MUST confirm that the agent's owner controls the address before it puts the endpoint on a card, by sending a confirmation message to it. Otherwise anyone could list another person's mailbox and have agents send mail there. The card is signed by the registrar (Personal Agent Naming §5.3), so a sender that verifies the card can trust the address.

Personal Agent Naming leaves what a consumer does with an endpoint to the endpoint's protocol (Personal Agent Naming §5.1). This section is that protocol for `email`.

A sending agent finds where to send by resolving the receiving agent's handle (Personal Agent Naming §5) and reading its `email` endpoint. It takes the receiving agent's key from the same verified card, and puts that key in the envelope's `to`.

An organization that controls the domain of its handles SHOULD serve the `email` endpoint from its own WebFinger (Personal Agent Naming §5.2), whose answer outranks any registrar (Personal Agent Naming §5.5).

### 5.2. A handle is not an email address

A handle such as `Scheduler.ana@example.org` has the form of an email address, but it is not one. Nobody parses handles (Personal Agent Naming §2, rule 1). A sender MUST NOT send mail to a handle string, and MUST NOT build an address from parts of a handle.

The risk is real. Some mailbox providers ignore dots in the local part of their own addresses, so mail sent to a handle such as `PublicAgent.ann@gmail.com` would be delivered to the unrelated mailbox `publicagentann@gmail.com`.

### 5.3. Where a respond goes

A receiving agent MUST send its respond only to an address it has verified. That is one of:

1. the `email` endpoint on the sending agent's verified name card, found by resolving the sender's key (Personal Agent Naming §5.4); or
2. the `From` address of the request's email, when that email had an aligned DMARC pass (§4.2).

If neither is available, the receiving agent MUST NOT send a respond. A reply to an unverified address would turn the receiver into a source of mail to whatever address a forger chose. The `Reply-To` header MUST NOT be used to choose where a respond goes.

---

## 6. Identity and trust

### 6.1. The envelope is authoritative

Who sent an agent email is decided by the envelope's signature, and by nothing else (Agent Messaging §4.5, §5.3). A receiver MUST verify `sig` against `from` and refuse with `IDENTITY_MISMATCH` when it fails (Agent Messaging §5.3, step 1). `From`, `Sender`, `Reply-To`, DKIM results and the carrier's own verdicts MUST NOT change who the sender is.

### 6.2. The standing of a native sender

Agent Messaging §5.3, step 2, says a receiver SHOULD confirm through the registry that `from` is vouched for by a node, and SHOULD refuse an unvouched agent. An agent that has no broker connection may have no node to vouch for it. For agent email, a receiver establishes a native sender's standing in one of two ways:

1. **A node vouch.** The registry confirms that `from` is vouched for (Agent Messaging §4.4). The sender is a `registered` sender at an EXT-6 door, or a `contact` or `rostered` sender where those apply (EXT-6 §4).
2. **A key-bound name.** The sender's key resolves to a verified Personal Agent Naming card whose `binding` is `agent-key` or `agent-key-delegated:<partner>` (Personal Agent Naming §4.1, §4.3), found by reverse resolution (Personal Agent Naming §5.4). The sender is sorted into EXT-6's `registered` tier, whose default stance is `hold`.

A sender with neither has no verified identity and is `anonymous` (EXT-6 §4). In every case, revoked and stopped keys are refused as Agent Messaging §5.3, step 2, requires.

**When the lookup is refused.** A registrar MAY refuse a reverse lookup, for example when it rate-limits them (Personal Agent Naming §5.4). A refused lookup is not an answer that the key has no name. When the registry has no vouch for the sender and the reverse lookup was refused, rather than answered, the receiver MUST NOT sort the sender as `anonymous` and block it. It treats the email as a knock (EXT-6 §9.3): the email does not reach the agent, and the owner sees a held attempt naming the sender, as §7.4 says. The shared rule for a refused lookup is Agent Messaging's and Personal Agent Naming's, and this paragraph is its form for email.

### 6.3. What email authentication adds

SPF ([RFC 7208](https://www.rfc-editor.org/rfc/rfc7208)), DKIM ([RFC 6376](https://www.rfc-editor.org/rfc/rfc6376)) and DMARC ([RFC 9989](https://www.rfc-editor.org/rfc/rfc9989)) prove that a domain sent a message. They do not identify an agent. A DKIM signature can be replayed to other recipients, and forwarding and mailing lists often break it. Agent Emailing uses them for three things only:

- as the credential for bridged mode (§4.2);
- to decide whether a `From` address is safe to reply to (§5.3);
- to keep agent email out of spam folders (§6.4).

The envelope already resists what DKIM does not: the signed `to` refuses a message replayed to another agent (Agent Messaging §22.4), and the signed `ts` with the duplicate memory refuses a replay over time (Agent Messaging §22.2, §22.3).

### 6.4. The minimum sending setup

A domain that sends agent email:

- MUST publish an SPF record;
- MUST sign every agent email with DKIM, with a key of at least 1024 bits (2048 bits is RECOMMENDED), with the DKIM domain aligned to the `From` domain;
- MUST publish a DMARC record. A policy of `quarantine` or `reject` is RECOMMENDED;
- SHOULD send over TLS;
- SHOULD send agent email from a subdomain used for nothing else, so that its reputation is kept apart from the domain's other mail.

A carrier-managed domain meets these rules when the carrier signs with DKIM aligned to it.

### 6.5. Domain corroboration

When the domain of a sender's handle is the same as the aligned DKIM domain of the email, a receiver MAY show the sender as corroborated by its domain. This is a display, not a grant. It never replaces the checks of §6.1 and §6.2.

---

## 7. Receiver protections

### 7.1. Agent Messaging §22 on the email path

Agent Messaging §22 applies in full to agent email. Email delivery is a mailbox delivery path, so:

- **Freshness** (Agent Messaging §22.3): a receiver MUST judge an agent email by the mailbox `max_age`, which is 7 days by default, and never by the live window. Mail can wait days in retry queues. The bound for a clock running fast, `max_clock_skew_ahead`, applies unchanged.
- **Duplicates** (Agent Messaging §22.2): carriers redeliver, and webhooks retry. A receiver MUST keep its `(from, id)` memory across restarts for at least as long as its mailbox `max_age`, 7 days by default. Agent Messaging allows that memory to be kept in process. For agent email it MUST persist, because the window it must cover is days, not minutes. The memory MUST also be bounded, and a receiver MAY drop an entry whose envelope the freshness window would already refuse. When the memory reaches its bound with every entry still inside the window, the receiver MUST NOT forget an entry to make room: it holds each new agent email, unopened and undelivered, until an entry leaves the window, and raises a local signal. Forgetting an entry inside the window would let a replay through. This rests on Agent Messaging §22.2 allowing a receiver to hold new mail rather than evict a remembered entry.
- **Addressing** (Agent Messaging §22.4): a forwarded or redirected agent email arrives at an agent its envelope does not name, and MUST be refused silently.
- **Size** (Agent Messaging §22.5) and **fencing** (Agent Messaging §22.6) apply to the envelope's payload. The human part is never shown to a model, fenced or not (§3.3).

### 7.2. The order of checks

A receiver handles an incoming email in this order:

1. If the carrier delivered it by webhook, verify the carrier's own webhook signature, where it has one.
2. Parse the MIME message. If it is a delivery status notification, handle it as §8 says and stop. If it is an automatic message, apply §7.3.
3. Find the envelope parts (§3.1). With none, go to §4.2 or §4.3. With more than one, refuse.
4. Parse the envelope and verify its signature (Agent Messaging §5.3). If it fails, refuse (§4.4). Refuse a 0.4.0 envelope that carries `task_id`, `context_id` or `artifacts` with `INVALID_ENVELOPE` (§3.2).
5. Apply the duplicate memory, then freshness (Agent Messaging §22.2, which fixes this order), then addressing and size (Agent Messaging §22.4, §22.5).
6. Establish the sender's standing (§6.2) and apply admission (EXT-6).
7. Resolve the `cid:` references (§3.4).
8. Hand the envelope to the agent, with its payload text fenced (Agent Messaging §22.6).

Refusals at steps 3 to 5 are silent toward the sender, with a local signal, as Agent Messaging §22.7 gives. An oversized envelope is refused at step 5, but its `CONTEXT_TOO_LARGE` answer waits for step 6: the receiver sends it only to a sender that admission lets in (EXT-6), and only where §5.3 allows a respond. A sender that is held or blocked gets no answer, so the size check never tells a stranger that the mailbox is read.

### 7.3. Automatic mail and loops

A receiving agent MUST NOT send a respond, or any other email, in answer to:

- an email whose `Auto-Submitted` header has any value other than `no` ([RFC 3834](https://www.rfc-editor.org/rfc/rfc3834)), unless that email carries a valid envelope;
- a delivery status notification ([RFC 3464](https://www.rfc-editor.org/rfc/rfc3464)) or any other `multipart/report`;
- an email with no envelope part, except as a bridge under §4.2.

An agent email with a valid envelope is not an automatic reply in this sense, even though its sender marks it `auto-generated`. Agents exchange such emails on purpose, and Agent Messaging's own rules decide what is answered.

A receiving agent MUST NOT request or send message disposition notifications ([RFC 8098](https://www.rfc-editor.org/rfc/rfc8098)). They would tell any sender, including one that is not admitted, that the mailbox is read.

### 7.4. Knocks

A knock is a `request` on the `knock` offering, with an empty input (EXT-6 §9.3). Over email it travels like any request, and the receiver applies §7.2 up to step 6. A knock never reaches the agent: the receiver records it as a held attempt for the owner (EXT-6 §9.1).

The receiver answers a knock by email with a signed `respond` in the same thread: `in_reply_to` is the knock's `id`, the email's `In-Reply-To` is the knock email's `Message-ID`, and the subject follows §3.3. It sends the answer only to a verified address (§5.3), at most once per knock. The answer is the same for every outcome, as EXT-6 §9.3 requires: `payload.status` is `completed`, and `payload.output` is `{ "knock": "received" }`. A sender the door lets in MAY be told so with `admitted: true` and the agent's declared `extensions` in `payload.output`, as EXT-6 §9.3 allows. Nothing in the answer says whether the sender is held, blocked or unknown.

A knock is a request of the channel and not an A2A operation (the A2A binding §11, Agent Messaging §6.4). A 0.4.0 frame therefore carries the knock and its answer with these payload fields and no `payload.a2a`.

---

## 8. Delivery signals

Agent Messaging gives a requester three kinds of signal: the accept signal, the queued acknowledgement, and silence (Agent Messaging §6.4a). Over email:

- **No accept signal.** The accept signal is a live-delivery signal only, and a request drained from a mailbox MUST NOT get one (Agent Messaging §6.4a). Agent email is mailbox delivery. A receiving agent that needs time SHOULD answer early with a Task in `TASK_STATE_SUBMITTED` or `TASK_STATE_WORKING` (the A2A binding §5), which tells the requester the same thing.
- **No queued acknowledgement.** It rides a transport reply channel (Agent Messaging §6.4a), and email has none.
- **Bounces.** A delivery status notification ([RFC 3464](https://www.rfc-editor.org/rfc/rfc3464)) for an agent email tells the sender the email did not reach the mailbox. A status of class 5 means the request is **undeliverable**. A status of class 4 means it is **deferred** and the carrier is still trying. These are local outcomes for the sending agent's own records. They are not envelopes and carry no Agent Messaging error code. A sender matches a notification to its request by the request's envelope `id` where the notification carries it, and otherwise by the `Message-ID` it recorded when it sent the request, or by the carrier's own message identifier. The envelope `id` is carried in the returned message's envelope part, when the notification returns the whole message, or in its `Agent-Messaging-Id` header (§3.5), when it returns only the headers. A sender SHOULD set that header wherever its carrier allows it, because some carriers replace the sender's `Message-ID`, and then the `id` is the only match.
- **The carrier's send result.** A carrier that reports "delivered" means the receiving mail server accepted the email. It says nothing about the receiving agent.
- **Silence.** Silence means the request is possibly still waiting (Agent Messaging §6.4). A requester SHOULD set any budget deadline (the budget extension, the A2A binding §12.2), and in a 0.3.0 envelope `payload.config.timeout_ms`, in hours or days rather than seconds.

---

## 9. Sealing

Pairwise sealing (EXT-7) works unchanged inside an agent email. The envelope's `payload` is replaced by a `sealedpayload.v1` object (EXT-7 §2), and the signature covers the ciphertext. A receiving agent that declares `sealing: "required"` refuses an unsealed request with `SEALING_REQUIRED` (Agent Messaging §8.9).

Three rules apply to email in particular:

- **Files.** EXT-7 seals only the payload. A sender of a sealed request MUST NOT attach a file in the clear. It either puts the file's content inside the sealed payload, or attaches only ciphertext, with the `files` entry inside the sealed payload so that the file's name and media type are sealed too.
- **The human part** MUST NOT contain the sealed content (§3.3).
- **The subject** SHOULD NOT describe the sealed content, because the carrier, and every mail server on the way, can read it.

Sealing protects content, not the fact of the exchange (Agent Messaging §8.9). The carrier can see the `From` and `To` addresses, the subject, the timing, the sizes, and every envelope field outside the sealed payload, such as `from`, `to` and the offering name. A carrier that hosts the receiving agent's mailbox and also opens its sealed payloads is inside the sealed boundary (Agent Messaging §4.3).

---

## 10. Tasks and ordering

The task is A2A's, carried as the A2A binding says, unchanged. Over email:

- **Task updates.** On a broker, the events after the first answer travel on the task's stream subject (the A2A binding §8). Email has no subjects, so over email the performer sends each later change of the Task as a `respond` envelope to the requester's email endpoint. Its `payload.a2a.result` is the whole Task as it then stands, `{"task": {...}}`, so that each email stands on its own when emails arrive out of order, as the A2A binding §8 says for carriers without subjects. Every respond that carries the Task is numbered by `payload.a2a.seq`, counting from 0 at the first respond that carries that Task and going up by one with each later one, across the whole thread. Its `in_reply_to` is the `id` of the request that started or last continued the task. In a 0.3.0 envelope, each update carries the `task_id` and the state in `payload.status` (Agent Messaging 0.9 §6.5).
- **Ordering.** Email does not keep order, so updates can arrive out of order. A receiver MUST apply updates in the order of their `payload.a2a.seq`, and in a 0.3.0 envelope, which has none, in the order of their envelopes' `ts`. An update whose number, or whose `ts`, is earlier than the last update applied to the task is recorded and does not change the task's state. A gap in the numbers says an email has not arrived yet. A Task moves only as A2A allows, and once a task is in a terminal state, a later update does not change it.
- **More input.** When the Task is in `TASK_STATE_INPUT_REQUIRED` or `TASK_STATE_AUTH_REQUIRED`, the requester sends `SendMessage` with a Message that names the Task's `taskId` and `contextId` (A2A §3.4). In a 0.3.0 envelope it sends a new `request` with the same `task_id` and `context_id`.
- **Cancellation.** The requester sends `CancelTask` (the A2A binding §5), with its reason in the cancel extension (the A2A binding §12.6). The performer's `respond`, carrying the Task in `TASK_STATE_CANCELED`, is the record, and a Task already in a terminal state is answered with `TaskNotCancelableError`. A performer that stops the work itself sends the Task in `TASK_STATE_CANCELED` as a task update. In a 0.3.0 envelope the requester sends the `task.cancel` request of Agent Messaging 0.9 §10.8, step 1, and step 2, which publishes on a task update subject, is left out.
- **The cap of an engagement.** A Task the not-to-exceed cap of its engagement ended arrives in `TASK_STATE_CANCELED` with the outcome `exhausted` in the budget extension (the A2A binding §12.2). A receiver MUST NOT record it as failed or retry it, and its subject says `stopped at its limit` (§3.3).
- **Deadlines.** A budget deadline (the A2A binding §12.2) is absolute, and the time an email spends in transit counts against it.

---

## 11. Provider requirements

### 11.1. Roles

A carrier sends and receives email for agents. It never signs envelopes and is never trusted to have checked one (Agent Messaging §1.5, invariant 5). This section says what a carrier must support for an agent, or a bridge, to send and receive agent email through it.

### 11.2. What a carrier MUST support

1. **Sending an attachment unchanged.** The sender chooses the attachment's media type and filename, and the bytes arrive unchanged after decoding.
2. **Delivering an attachment unchanged.** The receiving side can get the attachment's exact bytes, either from the raw message ([RFC 5322](https://www.rfc-editor.org/rfc/rfc5322)) or as an attachment download.
3. **DKIM aligned to the `From` domain** on every message it sends (§6.4). A carrier-managed domain is enough.

A carrier that meets these three can carry Agent Emailing. The carrier test of §12.3 checks the first two.

### 11.3. What a carrier SHOULD support

1. **Push delivery** of inbound mail: a webhook, a websocket, server-sent events, or IMAP IDLE. Polling works, but it adds latency.
2. **At-least-once delivery with a stable event identifier**, so that the receiver can tell a retry from a new email.
3. **Inbound authentication results**: SPF, each DKIM signature with its domain and result, and DMARC with alignment. Bridged mode needs these (§4.2).
4. **Threading fields** (`In-Reply-To` and `References`) on sending, or a reply operation that sets them (§3.6).
5. **Custom headers**, at least `Auto-Submitted`, and then the hint headers of §3.5.
6. **A custom sending domain**, so that an organization can send from its own domain (§6.5).
7. **Delivery status reporting**: bounces and deferrals, exposed through its interface (§8).
8. **Retention of inbound mail for at least 7 days**, the mailbox window (§7.1).
9. **Leaving the text part unchanged.** A carrier that adds a footer or a banner to the text changes it, and software that checks the human part will then warn (§3.3).

### 11.4. The adapter interface

A bridge, or an agent's runtime, that should work on any carrier puts a small adapter in front of each one. The adapter turns the carrier's own interface into four operations. They are written here in TypeScript notation, but nothing about them is specific to a language.

```ts
interface CarrierAdapter {
  /** What this carrier supports, from §11.2 and §11.3. */
  capabilities(): {
    rawInbound: boolean;          // §11.2 item 2 via the raw message
    attachmentDownload: boolean;  // §11.2 item 2 via attachment downloads
    push: "webhook" | "websocket" | "sse" | "imap-idle" | "none";
    authResults: boolean;         // §11.3 item 3
    threading: boolean;           // §11.3 item 4
    customHeaders: "any" | "some" | "none";
    maxOutboundBytes: number;
  };

  /** Send one email. The adapter builds the MIME message when the carrier
   *  does not accept raw MIME. */
  send(mail: {
    from: string; to: string[]; subject: string;
    text: string; html?: string;
    inReplyTo?: string; references?: string[];
    headers?: Record<string, string>;   // dropped where the carrier refuses them
    attachments: { filename: string; contentType: string; contentId?: string; bytes: Uint8Array }[];
  }): Promise<{ carrierId: string; messageId?: string }>;

  /** Inbound mail, pushed or polled. */
  receive(handler: (mail: {
    carrierEventId: string;             // stable across retries (§11.3 item 2)
    raw?: Uint8Array;                   // the RFC 5322 message, when available
    headers: [string, string][];
    attachments: { filename?: string; contentType: string; contentId?: string; bytes: Uint8Array }[];
    text?: string;                      // the human part; REQUIRED when raw is absent
    html?: string;                      // the HTML alternative, when there is one
    auth?: { spf: string; dkim: { domain: string; result: string; aligned: boolean }[]; dmarc: string };
    receivedAt: string;
  }) => Promise<void>): void;

  /** The delivery outcome of a sent email (§8). */
  status(carrierId: string): Promise<{ state: "delivered" | "deferred" | "bounced" | "unknown"; dsnStatus?: string }>;

  /** OPTIONAL. For a carrier that pushes by webhook: the server routes the
   *  carrier's HTTP call here, with the raw body. The adapter checks the
   *  carrier's own signature first (§7.2 step 1), answers 401 when it fails,
   *  and hands each email to the receive handler. */
  webhook?(req: { path: string; headers: Record<string, string>; body: Uint8Array }): Promise<{ status: number; body?: string }>;

  /** OPTIONAL. Bounces and deferrals the carrier pushes: the push form of
   *  status() (§8). */
  onStatus?(handler: (ev: { carrierId: string; state: "delivered" | "deferred" | "bounced"; dsnStatus?: string; messageId?: string; at?: string }) => Promise<void>): void;
}
```

An adapter MUST NOT change the bytes of the envelope part or of any file part. An adapter MUST pass through every attachment whose media type is `application/vnd.agentmessaging.envelope+json`. An adapter whose carrier gives no raw message MUST give the human part as `text`, and `html` when there is one, so that the check of §3.3 and the third check of §12.3 can run. `webhook` and `onStatus` are optional: an adapter offers them where its carrier pushes mail or delivery events.

### 11.5. Carriers that check envelopes

A carrier MAY verify the envelope of the agent email it delivers, and MAY report the result to its customer. A receiving agent MUST still verify every envelope itself (§6.1). A carrier's verdict is a convenience, never a substitute.

---

## 12. Conformance

### 12.1. What can claim conformance

Five roles can claim conformance with Agent Emailing 0.4.0. Each claim names its role:

- **A sending agent** builds agent email as §3 says, sends only to verified addresses (§5), and sends from a domain that meets §6.4.
- **A receiving agent** handles agent email as §3, §4, §6, §7, §8 and §10 say, and passes the receiving-agent cases of §12.2.
- **A carrier** meets §11.2 and passes the carrier test of §12.3. It states which items of §11.3 it supports.
- **A bridge** meets Agent Messaging §4.15 and §4.2 of this document, and passes the bridge cases of §12.2.
- **A mail program**, or any software that shows agent email to a person, checks the human part and the subject as §3.3 says, and reaches the `person_view` outcome of every case that has one.

A conforming implementation MUST NOT claim that it implements Agent Messaging, or a profile of it, because it implements Agent Emailing (§2.3).

### 12.2. The fixtures

The conformance folder holds email fixtures, `conformance/fixtures/*.eml`, a list of cases, `conformance/cases.json`, and test name cards, `conformance/cards.json`, signed by a test registrar. Each case names a fixture, the role that receives it, the agent key it is received as, the time to judge freshness by, the carrier's authentication results where they matter, and the expected outcome. Where a case needs them, it also gives the stance the receiver's door takes toward the sender, how the sender's standing came out, the bound of the duplicate memory, and the sending agent's records of the emails it sent. Every envelope in the fixtures is really signed with published test keys, which control nothing.

The cases cover: a four-email thread of request, a respond that needs input, the answer, and a respond that is done; a human part that disagrees with its envelope; a forgery whose signature, sender and text all fail; a forwarded email, a stale envelope, a tampered envelope, hint headers that disagree with the envelope, a file whose digest does not match, two envelope parts, an automatic reply, an email with no envelope from a stranger, an envelope re-encoded by a carrier, a duplicate, a bounce matched by its `Message-ID` and a bounce matched by the envelope `id` when the carrier replaced the `Message-ID`, a bridged sender with and without an aligned DMARC pass, a bridged email with an attachment and the same email delivered twice, a respond whose subject a reply shortcut wrote, a duplicate memory at its bound, a sender whose reverse lookup was refused and one whose key has no card, an oversized envelope from a held sender and from an admitted one, a knock and its answer, an agent email with another agent email attached inside it, a plain email with an agent email attached inside it, a respond that reports its price, a 0.3.0 request accepted in the window of §3.2, and a 0.4.0 envelope refused because it carries an envelope field the A2A binding §4 forbids.

The fixtures are the authority. When an implementation disagrees with them, the implementation changes.

### 12.3. The carrier test

A carrier passes when it carries `01-request.eml` from one of its addresses to another, and the receiving side recovers from what the carrier delivers:

- an envelope whose canonical form equals `envelopes.request.canonical` in `cases.json`;
- an `agenda.txt` whose SHA-256 equals the value in `cases.json`; and
- a text part whose digest equals the envelope's `meta.agent_emailing.human_text` (§3.3), taken from the raw message or, where the carrier gives none, from the adapter's `text` (§11.4).

The sending side may rebuild the email through the carrier's interface (§11.4) rather than send the fixture's bytes, as long as it attaches the envelope and the file unchanged.

### 12.4. The reference checker

`conformance/check-fixtures.mjs` is a small reference receiver. It runs every case and reports whether the fixtures produce the expected outcomes. Implementers MAY use it as a starting point for their own test harness.

---

## 13. Security considerations

- **Spoofing.** Anyone can write any `From` header. Only the envelope signature identifies a native sender (§6.1), and only an aligned DMARC pass admits a bridged one (§4.2).
- **Replay.** An attacker who holds a genuine agent email can send it again, or forward it to another agent. The duplicate memory, the freshness window and the addressing check refuse it (§7.1).
- **Forwarding and mailing lists.** Forwarders and lists may rewrite headers and break DKIM. The envelope still verifies if its values are unchanged. A list that strips attachments turns an agent email into plain email, which is then handled as §4.3 says.
- **Reflection and spam.** An agent that answered every email would send mail to whatever address a forger wrote. Agents reply only to verified addresses (§5.3), never answer automatic mail (§7.3), and never send to a handle string (§5.2). A registrar confirms an address before it lists it (§5.1).
- **Prompt injection.** Email bodies and HTML are a common carrier of instructions aimed at models. The human part never reaches a model (§3.3). Payload text is fenced (Agent Messaging §22.6). Email with no envelope never reaches a model (§4.3).
- **Attachments.** A matching digest proves a file is the one the sender meant. It does not prove the file is safe. A receiver MUST NOT execute attachments, and SHOULD scan or sandbox files before a tool opens them.
- **Misleading text.** A sender could write a human part that says something other than what it asked the agent to do, and a person might believe it. The text is generated from the envelope, its digest is signed, and software that shows it checks it and warns (§3.3). Agents never read it.
- **What the carrier sees.** Unless the payload is sealed (§9), the carrier can read every envelope. Even when it is sealed, the carrier sees who writes to whom, when, and how much.
- **Downgrade.** A receiver never treats an email with a broken envelope as plain email (§4.4), so an attacker cannot strip a signature to change how a message is handled.
- **Liveness leaks.** Read receipts are never sent (§7.3), and the silent refusals of Agent Messaging §22.7 keep a replayer from learning which copies are still accepted.

---

## 14. References

### 14.1. Normative

- Agent Messaging, version 0.10.0-draft, its binding A2A over Agent Messaging, version 0.3.0-draft (wire version 0.4.0), and its extensions EXT-6 (Admission) and EXT-7 (Pairwise sealing): https://agentmessaging.ai/
- The A2A Protocol, version 1.0: https://a2a-protocol.org/latest/specification/
- Personal Agent Naming, version 0.10.3: https://agentnaming.ai/
- [RFC 2045](https://www.rfc-editor.org/rfc/rfc2045) to [RFC 2049](https://www.rfc-editor.org/rfc/rfc2049): MIME
- [RFC 2047](https://www.rfc-editor.org/rfc/rfc2047): non-ASCII text in headers
- [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119): requirement levels
- [RFC 2392](https://www.rfc-editor.org/rfc/rfc2392): Content-ID and Message-ID URLs
- [RFC 3464](https://www.rfc-editor.org/rfc/rfc3464): delivery status notifications
- [RFC 3834](https://www.rfc-editor.org/rfc/rfc3834): automatic responses to email
- [RFC 5322](https://www.rfc-editor.org/rfc/rfc5322): Internet Message Format
- [RFC 6376](https://www.rfc-editor.org/rfc/rfc6376): DKIM
- [RFC 7208](https://www.rfc-editor.org/rfc/rfc7208): SPF
- [RFC 9562](https://www.rfc-editor.org/rfc/rfc9562): UUIDs
- [RFC 9989](https://www.rfc-editor.org/rfc/rfc9989): DMARC

### 14.2. Informative

- [RFC 5321](https://www.rfc-editor.org/rfc/rfc5321): SMTP, including its retry and give-up times (§4.5.4.1)
- [RFC 6647](https://www.rfc-editor.org/rfc/rfc6647): greylisting
- [RFC 7960](https://www.rfc-editor.org/rfc/rfc7960): DMARC and indirect mail flows such as mailing lists
- [RFC 8098](https://www.rfc-editor.org/rfc/rfc8098): message disposition notifications
- [RFC 8617](https://www.rfc-editor.org/rfc/rfc8617): ARC

---

## Change history

**0.4.0, 2026-11-07.** Agent Messaging carries A2A's own operations and data model, and Agent Emailing follows it. The envelope part now carries frames of wire version 0.4.0 under the binding A2A over Agent Messaging: each request is an A2A operation and each respond carries A2A's answer, with A2A's Tasks, Messages, Parts and Artifacts (§1, §2.1, §3.2). The subject's state words follow A2A's states, `TASK_STATE_CANCELED` with the budget extension's outcome `exhausted` reads `stopped at its limit`, and a 0.3.0 envelope's lowercase states map the same way (§3.3). A sealed frame's subject reads the state from `meta.a2a_state` where the sender put it there (§3.3). The human part states the reason of a Task that failed or was canceled, from the failure and cancel extensions (§3.3). A file carried in the email is a Part whose `url` is a `cid:` reference, with its size and digest in the artifact references extension (§3.4). The hint headers copy the Task id and context id from the A2A objects (§3.5). Over email, each later change of a Task is a respond that holds the whole Task and is numbered by `payload.a2a.seq`, which sets the order a receiver applies them in; a request continues a Task by naming its `taskId`; cancellation is `CancelTask` with a reason; and the streaming operations are answered with `UnsupportedOperationError` (§2.2, §10). A receiver refuses a 0.4.0 envelope that carries `task_id`, `context_id` or `artifacts` (§3.2, §7.2). A receiver still accepts 0.3.0 envelopes from Agent Emailing 0.2 and 0.3 senders until its operator ends that window. The fixes of 0.3.0 carry over in 0.4.0 frames: the bridge signs a `SendMessage` with the same facts (§4.2), `payload.price` sits beside `payload.a2a` (§3.3), and a knock and its answer keep their channel payloads, because a knock is not an A2A operation (§7.4). The fixtures are regenerated with 0.4.0 frames, `meta.agent_emailing.v` and the version hint header are `0.4.0`, and cases.json is version 4. Case e33 covers a 0.3.0 request accepted in the window, and case e34 a 0.4.0 envelope refused because it carries `context_id`. Cases e02 and e04 check the numbers of the two responds.

**0.3.0, 2026-10-29.** Fixes ten of the gaps found building the reference implementation. CHANGELOG.md lists them, one line each.

**0.2.0, 2026-10-29.** The human part becomes required and is generated from the envelope (§3.3). It states who sent it and for whom, what was asked, what was handed over, the outcome, the price and what happens next. The subject carries the offering and the state. The envelope's `meta.agent_emailing` signs the text's digest and the subject, and software that shows the text to a person checks it and warns when it differs. The fixtures follow these rules, the example thread grows to four emails, case e18 covers a human part that disagrees with its envelope, and case e19 a forgery that fails the signature, the name card and the text checks.

**0.1.0, 2026-10-29.** The first version.
