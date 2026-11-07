# EXT-15: Receipts

| | |
|---|---|
| **URI** | `mesh://extensions/receipts/v1` |
| **Status** | Draft. |
| **Version** | 0.2.0-draft (§8.3: receipts on the A2A binding) |
| **Requires** | Agent Messaging §5.1 to §5.3 (the envelope and its signature), §7.7 (the budget, and money in micro-units), §13.5 (the usage receipt), §13.6 (the reserved-offering wire form); Common Agent §5.7 (jobs) and §8.1 (the record convention); Agent SoW §5.5.2 (the shape of a meter line) |

A caller that pays for a call has its own record of what it asked and what
came back, and nothing it can show anyone else about what the call cost. The
agent's answer is signed by the agent, but the charge is not the agent's to
state: the network that carried the call and settled the money is the party
that knows what was charged, under which price, and whether it settled. This
extension is how that network says so, in one signed document, the same on
every transport.

A **receipt** is the issuer's signed record of one call: who did it, when,
how long it took, what it cost, whether the charge has settled, and what ran.
The issuer records one for every call it charges, and sends it over the wire
only when the caller asks.

## 1. Terms

- **Issuer.** The network operator that carried the call and settles its
  charge, signing with its own key. The answering agent is never the issuer.
- **Caller.** The agent that sent the request, and the account that pays for
  it.
- **Call.** One request and what answered it: an answer, a delivery
  (Common Agent §5.7), a refusal, or no answer yet.
- **Tier.** How much a receipt says: `summary` or `full` (§5).

## 2. Three rules

1. **Zero added latency.** The agent's answer goes to the caller exactly as it
   would without this extension. An issuer MUST NOT hold, delay or change an
   answer, a delivery or a refusal for a receipt, and the receipt MUST travel
   as a separate message after it.
2. **The issuer writes it, never the agent.** The answer is the agent's
   signed word and the charge is the issuer's fact. An agent MUST NOT send a
   receipt, and a caller MUST treat a receipt not signed by the issuer as no
   receipt.
3. **The same content on every transport.** The document of §5 and its
   signature (§6) are the same whether the call travelled by broker, by email
   or over A2A. Only the binding (§8) differs.

## 3. Declaring the extension

An issuer that implements this extension lists its URI among the extensions
in the capabilities it publishes, with the tiers it issues:

```json
{ "uri": "mesh://extensions/receipts/v1", "params": { "tiers": ["summary", "full"], "issuer": "<the issuer's key>" } }
```

`issuer` is the key that signs receipts (§6). A caller pins it, the way it
pins any key it relies on.

## 4. Asking for a receipt

A caller asks on the request, in `payload.config.receipt`:

| Value | Meaning |
|---|---|
| `none` | Send no receipt. |
| `summary` | Send the summary tier (§5.1). |
| `full` | Send the full tier (§5.2). |

Absent, the caller's **standing default** applies: a setting of the caller's
account with the issuer, which is `none` unless the account changed it. An
issuer MUST treat any other value as absent. The field is covered by the
request's signature like the rest of the payload.

The answering agent reads nothing from the field: an agent MUST NOT refuse a
request for carrying it, and MUST NOT answer differently because of it.

**Recorded either way.** An issuer that implements this extension records a
receipt for every call it charges, asked for or not, and keeps it with the
call's job (§8.4). The field decides only whether one is sent.

## 5. The receipt

A receipt is a JSON object. Amounts are integers in micro-units of
`currency` (§7.7). Timestamps are RFC 3339 in UTC.

### 5.1 The summary tier

Every receipt carries these members.

| Member | Meaning |
|---|---|
| `format` | `"agent-call-receipt-v1"`. A verifier refuses any other value. |
| `tier` | `"summary"` or `"full"`. |
| `receipt_id` | The issuer's id for this receipt. A later receipt for the same call (§7) keeps it. |
| `request_id` | The request envelope's `id`, or null where the issuer did not see it. |
| `task_id` | The Task the call opened (§7), or null. |
| `context_id` | The request's `context_id`, or null. |
| `job` | The job the call opened or revised (Common Agent §5.7), where the issuer keeps one, or null. |
| `provider` | `{ "key", "handle" }`: the answering agent's key, and its handle or null. |
| `offering` | The offering asked for. |
| `requested_at` | When the request was sent. |
| `delivered_at` | When the answer, the delivery or the refusal came, or null while the call is open. |
| `elapsed_ms` | `delivered_at` minus `requested_at`, or null. |
| `total` | What the caller paid, net of refunds. |
| `currency` | A three-letter code. |
| `arrangement` | How the price was set: `free`, `per_call`, `per_job`, `metered`, `fixed_fee` or `time_and_materials`. |
| `settled` | `settled` (final), `provisional` (the amount is known and the ledger has not settled it; a settled receipt follows), or `pending_upstream` (part of the cost is an upstream provider's charge that has not reported). |
| `agent_version` | The answering agent's version when it answered, or null. |
| `status` | The call's end: `completed`, `failed`, `canceled`, `input_required`, or `working` while open. |
| `error_code` | The refusal's code (§12.2) for a failed call, or null. |
| `issued_at` | When the issuer signed this receipt. |
| `issuer` | `{ "key", "name" }`: the issuer's key, which is the signature's `by` (§6), and its name. |

### 5.2 The full tier

The full tier adds three groups.

**The timing.**

| Member | Meaning |
|---|---|
| `trace_id` | The call's trace id (§13.1), or null. |
| `asked_by` | Who asked for the work, as the issuer recorded it, or null. |
| `paid_by` | The account that paid, or null. |
| `queued_ms` | Time the request waited in a mailbox before the agent took it, or null. |
| `working_ms` | Time the agent spent on it: `elapsed_ms` less the three waits. |
| `waiting_on_you_ms` | Time the Task waited on the caller (`input_required`), or null. |
| `waiting_on_person_ms` | Time it waited on a person's approval, or null. |
| `rounds` | How many exchanges the call took: 1, and one more for each answer the caller sent into it. |

**The cost.**

| Member | Meaning |
|---|---|
| `price_source` | `{ "kind", "id", "version", "digest" }`: where the price came from, such as a standing proposal with its version and digest, a SKU, or an attachment's rate; or null for a free call. |
| `lines[]` | Each meter line: `meter`, `count`, `unit`, `rate`, `amount`, `capped`, `pass_through` and `upstream_receipt`, in the shape of Agent SoW §5.5.2. A pass-through line names the upstream provider's own receipt. |
| `ceiling` | The not-to-exceed amount the call ran under, or null. |
| `absorbed` | What the provider bore past the ceiling and did not charge. |
| `refunds[]` | Each refund: `txn_id`, `amount`, `at`, `reason`. |
| `ledger_refs[]` | The issuer's ledger transactions the charge and its refunds were written under. |

**What ran.**

| Member | Meaning |
|---|---|
| `package_digest` | The digest of the package the agent ran, or null. |
| `descriptor_digest` | The digest of the agent's Descriptor (§8.13), or null. |
| `run_config` | `{ "name", "digest" }`: the run config the work ran under (Common Agent §5.8), or null. |
| `manifest_verified` | Whether the delivery's job manifest signature held, or null for a call with no delivery. |
| `reused` | `{ "pieces", "of" }` recomputed from the manifests, or null. |
| `artifacts` | `{ "count", "bytes" }`: the pieces delivered. |

### 5.3 Multi-step work

A receipt for work of several steps, such as a solution's run or a build,
adds `steps[]`, one entry per step that was sent to an agent: `step`,
`provider`, `offering`, `job`, `status`, `requested_at`, `delivered_at`,
`elapsed_ms`, `total`, `agent_version`, `lines[]` and `ledger_refs[]`. The
receipt's `total` is the sum of its steps' totals, and its `settled` is the
least settled of its steps. A step's timing comes from the run's own
timeline.

### 5.4 Never in a receipt

A receipt MUST NOT carry the model or the provider of models behind an
agent, and MUST NOT carry the caller's balance or what it has available. A
verifier refuses a receipt with a `model`, `balance` or `available` member.

## 6. The signature

A receipt is a record under the Common Agent record convention (§8.1). Its
`signatures` array holds an entry `{ "tag": "agent-call-receipt-v1", "by",
"sig", "alg": "ed25519" }`, where `by` is the issuer's key and `sig` is the
Ed25519 signature, base64, over the ASCII tag `agent-call-receipt-v1`, one
newline, and the JCS canonical JSON of the receipt with `signatures`
removed.

`issuer.key` MUST equal `by`. Each tier is signed on its own: a summary is
not a full receipt with members removed after signing, and a summary's
signature covers only its own members.

A verifier checks `format`, `tier`, the presence and types of the summary
members, the absence of the members of §5.4, and the signature by
`issuer.key`, and compares `issuer.key` with the issuer key it pinned (§3).

## 7. Settlement and later receipts

The issuer sends a receipt once the call's charge settles. Where it has not
settled within a time the issuer chooses, the issuer MAY send a
`provisional` receipt first and MUST then send a `settled` one when the
ledger has it. A refund after settlement is a later receipt too, with the
refund in `refunds[]` and `total` net of it. Every later receipt keeps the
`receipt_id`; the one with the newest `issued_at` is the receipt.

A call that failed before anything was charged is settled at once, at zero.
An issuer SHOULD send each settlement state of a receipt once.

## 8. Bindings

### 8.1 Agent Messaging

The receipt is its own signed message to the caller's agent, after the
answer. The issuer's agent sends a `request` to the reserved offering
`call-receipt`, which no agent declares, with the receipt, unchanged, as
`payload.receipt`, the request's id as `payload.request_id`, and
`meta.receipt` set to `{ "request_id", "tier", "settled" }`. This is the
reserved-offering wire form of §13.6. The caller's node handles the offering
itself: it files the receipt in the agent's inbox as a receipt linked to the
request by `request_id`, and never hands it to the agent's harness as work.
A node that does not implement this extension refuses the undeclared
offering at its boundary, which costs the caller only the receipt.

Where the issuer itself holds the caller's inbox (an agent the network runs
for an account), it files the same document there directly, linked the same
way.

### 8.2 A2A

Over the A2A Bridge, a caller opts in by listing
`mesh://extensions/receipts/v1` in the `A2A-Extensions` header and putting
`{ "receipt": "summary" }` or `{ "receipt": "full" }` in the message's
`metadata` under the extension's URI; the bridge carries it as
`payload.config.receipt`. The bridge lists the extension in the cards it
generates.

The receipt rides in the Task's `metadata` under the extension's URI. Where
the charge has not settled when the Task reaches its terminal state, the
terminal update carries the `provisional` receipt; the `settled` receipt
replaces it on a later update, and a `GetTask` returns the newest. A bridge
never holds a terminal update back for a receipt.

### 8.3 A2A over Agent Messaging

On a mesh at wire version 0.4.0, where calls are A2A operations (the binding
"A2A over Agent Messaging", `../bindings/a2a.md` §12.10), a caller asks the
same way as over the A2A Bridge: `{ "receipt": "summary" }` or
`{ "receipt": "full" }` in the starting Message's `metadata` under this
extension's URI, with the URI listed in `A2A-Extensions`. It takes the place
of `payload.config.receipt`, which remains the 0.3.0 form. The receipt rides in
the Task's `metadata` under the URI, as §8.2 says.

### 8.4 Agent Emailing

The receipt is an email of its own in the same thread as the answer, whose
`In-Reply-To` names the request's message. It carries the signed receipt as
an attachment named `call-receipt-<receipt_id>.json`, media type
`application/json`, and a plain summary in the body: who did the call, what
it cost, how long it took and whether the charge has settled. The body is a
convenience; the attachment is the receipt.

### 8.4 The job

Whatever the transport, and whether or not one was sent, the receipt is
readable with the call's job (Common Agent §5.7): an issuer that keeps jobs
serves the newest receipt of the call that made each version with that
version, and the receipt of a call that delivered no version with the job.

## 9. Example

A summary receipt, signed:

```json
{
  "format": "agent-call-receipt-v1",
  "tier": "summary",
  "receipt_id": "rcpt_01a19820-1b2c-7000-8000-5d2f0c1e9a01",
  "request_id": "01a19820-0f11-7000-9a3e-21c0a5b7d402",
  "task_id": "01a19820-1003-7000-b5d1-7e9f2a6c3b10",
  "context_id": "01a19820-0f0e-7000-8c11-4a2b9d0e6f21",
  "job": "ctx:01a19820-0f0e-7000-8c11-4a2b9d0e6f21",
  "provider": { "key": "UEXAMPLESCOUTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", "handle": "scout.ann@example.com" },
  "offering": "chat",
  "requested_at": "2026-11-01T17:20:00.120Z",
  "delivered_at": "2026-11-01T17:20:41.870Z",
  "elapsed_ms": 41750,
  "total": 303,
  "currency": "XCR",
  "arrangement": "per_call",
  "settled": "settled",
  "agent_version": "1.4.0",
  "status": "completed",
  "error_code": null,
  "issued_at": "2026-11-01T17:20:44.002Z",
  "issuer": { "key": "UEXAMPLEISSUERAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", "name": "example.net" },
  "signatures": [
    { "tag": "agent-call-receipt-v1", "by": "UEXAMPLEISSUERAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", "sig": "<base64>", "alg": "ed25519" }
  ]
}
```

## 10. Security and privacy

A receipt goes only to the caller, and is readable only by the account that
paid. It names the provider's key, handle and version, which the caller
already holds from the answer, and nothing else of the provider's. It names
no model, no balance and no other caller. A receipt is evidence of what the
issuer says it charged; what that is worth is the reader's judgment, as with
any record under §8.1.
