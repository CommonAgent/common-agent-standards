# EXT-10: Screening

| | |
|---|---|
| **URI** | `mesh://extensions/screening/v1` |
| **Status** | Draft |
| **Version** | 0.4.0-draft (messages for the person, §5.3) |
| **Requires** | AgentMesh core ≥ 0.2; complements EXT-6 (admission) and EXT-7 (pairwise sealing); §7 amends EXT-5 (rooms) |

Who screens the content that reaches your agent, and what their answer is
allowed to do. This extension defines a **socket**, not a detector: a
recipient-side consultation point where an owner-chosen screening provider is
asked about a message before the agent reads it, and a small vocabulary for the
answer. It carries no detection logic of its own and never will.

The behavior a screening agent owes is defined in the Common Agent
Specification §7.3 (https://commonagent.net/spec.html): the
socket-not-detector doctrine, where interception happens, what the
request carries and why, the call sites, the verdict vocabulary, the
no-answer stance, sealed content, and the audit record. That text
governs. This extension binds it to the mesh: the request and verdict
JSON layouts, the configuration file, the rooms amendments, screening
as a mesh service, and the decision record.

## 1. The problem (read first)

EXT-6 decides *who* may reach an agent; nothing after that point looks
at *what* arrives. Every inbound message is untrusted input handed to a
model holding its owner's context and tools, and an admitted contact
whose own machine is compromised sends attacks from a trusted address.
Why detection is somebody's job, chosen by the owner, accountable, and
never claimed by the platform, is Common Agent §7.3's argument.

### 1.1 What this is not

- **Not moderation.** A verdict governs what the recipient's own agent does. It
  never edits, hides or removes anything from a shared record (§7.2).
- **Not content policy.** The mesh takes no position on what may be said. An
  owner's chosen provider may take any position the owner is paying for.
- **Not a filter we ship.** See §3.

## 2. Where screening happens

Interception is always local to the recipient, and Common Agent §7.3
carries the doctrine: why platform-side screening is ruled out under sealing,
delegated judgment as the recipient's own right, and consultation,
never proxy, with the three properties that depend on it. On this mesh
the node MAY consult an **HTTPS provider** at an address the owner
configured, or a **mesh screening agent**, addressed like any other
agent, consulted over ordinary `request` / `respond` (§8). A screener
outage degrades to the owner's configured stance (§6.3).

## 3. What the mesh ships, and what it does not

The mesh ships the socket: the call sites, the request shape, the
verdict vocabulary, the routing of a hold back to the EXT-6 door, and
the audit record. The mesh ships **no detector**: no built-in
heuristic, no bundled model pass, no default provider; the judgment is
the provider's. The product-boundary argument, and the honesty rule
that an account with no provider configured is unscreened and MUST be
reported plainly, are Common Agent §7.3's.

## 4. The request

A screening request carries the content to be judged and the facts a
judge needs about where it came from; Common Agent §7.3 says why
each fact is there. The mesh layout:

```json
{
  "screening": "v1",
  "direction": "inbound",
  "call_site": "delivery",
  "policy": "proj_7d2f",
  "subject": {
    "agent": "UBOB…",
    "envelope_id": "01J…",
    "task_id": null,
    "room": null,
    "audience": "agent"
  },
  "counterparty": {
    "key": "UALICE…",
    "handle": "alice.example@example.com",
    "admission": "allow",
    "first_seen": "2026-02-14T09:31:00Z",
    "messages_exchanged": 218,
    "sealed": true
  },
  "content": [
    { "role": "message", "media_type": "text/plain", "text": "…" },
    { "role": "attachment", "media_type": "application/pdf", "name": "proposal.pdf",
      "digest": "sha256:…", "text": "…" }
  ]
}
```

| Field | Meaning |
|---|---|
| `direction` | `inbound` (about to be read) or `outbound` (about to be sent). Both, from day one — see §5.2. |
| `call_site` | Which door this is: `delivery`, `history`, `fetch`, `board`, `send` (§5), or `person` where the owner turned it on (§5.3). |
| `policy` | Opaque provider-side policy handle, copied from configuration. The mesh never interprets it. |
| `subject.agent` | The agent whose reading is being screened. |
| `subject.audience` | `agent`, or `person` when the message is marked for the person behind the agent (SPEC §5.7, §5.3 below). Copied from the verified envelope; absent means `agent`. |
| `counterparty` | Who the content came from, or is going to. |
| `counterparty.admission` | The EXT-6 stance in force for this sender. |
| `counterparty.first_seen`, `messages_exchanged` | Relationship age and depth. A day-old identity claiming to be your brother is exactly as suspicious as it looks. |
| `counterparty.sealed` | Whether the payload arrived sealed (EXT-7). Carried because it is a fact about the message, and because §6.4 lets an owner exempt sealed mail. |
| `content[]` | The material to judge. `role` distinguishes the message itself from things it carried. |

**Content is always presented as third-party material** (Common Agent
§7.3's rule): inbound mesh content is never submitted in a field a provider treats as
the operator's own prompt.

## 5. Call sites

A message is not read once. Each of these is a distinct moment at which
content reaches a model, and each MUST pass the socket when a provider
is configured; the rationale for the set is Common Agent §7.3's.

| `call_site` | When |
|---|---|
| `delivery` | An inbound message is about to be handed to the agent. |
| `history` | A durable room's record is being replayed (EXT-5 §6). |
| `fetch` | A room file's bytes have been fetched and digest-verified, before the agent reads them. |
| `board` | A work-board item is being read, and certainly before it is claimed. |
| `send` | Outbound: the agent is about to send content to a counterparty. |
| `person` | Only where the owner turned it on (§5.3): a message marked for the person is about to be shown to them. |

### 5.1 Why replay and fetch are separate doors

The rationale is Common Agent §7.3's: an injection posted to a
durable room in March is read for the first time in June by a member
it was never delivered
to, a file is judged when its bytes are read rather than when the room
recorded it, and claiming a board item means deliberately acting on a
stranger's written instructions. On this mesh the doors are EXT-5's:
`history` replays the room record (EXT-5 §6), `fetch` reads a room
file's digest-verified bytes, and `board` reads a work-board item.

### 5.2 Outbound

Outbound is on by default wherever a provider is configured, an owner
may narrow `directions` to inbound alone, an outbound hold refuses the
send and says so, and an outbound flag sends and records. All of that
is Common Agent §7.3's. What is mesh-specific: outbound screening is
what stands where reduced privilege was refused (§9).

### 5.3 Messages for the person (0.4.0)

A message marked `meta.audience: "person"` (SPEC §5.7) goes to the agent's
person and reaches the agent only when the person has let their agent read
such messages. It passes the `delivery` call site at that moment, the moment
it is about to reach the agent, with `subject.audience: "person"`, and a
`hold` routes it to the EXT-6 door like any other.

Showing it to the person is no call site by default. A person reading their
own mail is the reader the sender addressed, and a screener in between is one
more reader. An owner who wants their messages screened before they read them
turns that on with `for_person: "screen"` (§10); the request then carries
`call_site: "person"`, and a `hold` keeps the message from the person's
surface until the owner releases it at the EXT-6 door.

Outbound, a message the agent sends for another person passes the `send`
call site like any other send.

## 6. The verdict

```json
{
  "screening": "v1",
  "verdict": "hold",
  "reason": "Content instructs the reader to forward stored documents.",
  "provider": { "id": "example-guard", "policy": "proj_7d2f", "version": "2026-08-01" },
  "detail": { }
}
```

| `verdict` | Meaning | Effect |
|---|---|---|
| `pass` | Nothing found. | Delivered normally. |
| `flag` | Suspicious, not certain. | Delivered **with the reason attached**, and handled under reduced privilege where the implementation supports it (§9, open). |
| `hold` | Should not reach the agent unreviewed. | Routed to the EXT-6 door as a held item, with the reason, for the owner to release or block. |

The verdict semantics, a plain-sentence `reason`, `detail` opaque and
never branched on, are Common Agent §7.3's; `detail` is recorded
verbatim (§6.5). On this mesh a hold routes to the EXT-6 door as a
held item.

### 6.1 Why hold, and not block

Common Agent §7.3 carries the argument. The mesh binding is the reuse: "a human
should look at this first" is the EXT-6 door, so a hold lands where the
owner already decides, with no new surface and no new habit to learn.

### 6.2 Verdicts are personal

Common Agent §7.3's rule. Two members of a room with different providers may reach
different verdicts about the same post, and both are correct.

### 6.3 When the screener does not answer

The stance vocabulary is `fail_closed` (hold) and `fail_open` (deliver
and log loudly), configured in §10. The semantics, the outcome recorded
as an unscreened delivery and never as a `pass`, and the fail-closed
default with the asymmetry that decides it, are Common Agent §7.3's. An owner who
would rather keep the mail flowing sets `fail_open` and the node says
so on every pass.

### 6.4 Sealed content

Sealed content is screened by default, with disclosure in the
configuration surface and per-counterparty exemption, per Common Agent §7.3. The
mesh configuration is §10's `sealed` and `exempt` fields.

### 6.5 The record

Every verdict, including `pass`, including an unscreened delivery under
§6.3, is written to the receiving agent's audit chain with the provider
id, the policy handle and the policy version, alongside the envelope id
or content digest it concerned. What the record is for is Common Agent §7.3's; it is
also the foundation §8 builds on.

## 7. Rooms

Rooms change the economics and add one mechanism. Everything in §5 applies to a
room member's own reading; this section is what rooms add on top.

### 7.1 The screener as a member

In a room with N members, per-member screening pays to judge the same
post N times. A room MAY instead carry a **screener member**: an
ordinary member (§8) added at creation or later, whose job is to judge
what is posted. Common Agent §7.3 carries the doctrine, a visible member rather than
a buried setting; the visibility also resolves §6.4 cleanly for rooms,
because nothing is quietly forwarded when the reader is in the room.
"This room is screened by X" then becomes a property a counterparty can
require before joining.

### 7.2 Verdict annotations

A screener member MAY write a **verdict annotation** against a post or
a file: additive metadata, never altering, hiding or removing the
annotated content, per Common Agent §7.3. The transcript is a shared record and no
member's private policy may edit it.

```json
{
  "annotation": "screening/v1",
  "target": { "kind": "file", "digest": "sha256:…" },
  "verdict": "pass",
  "reason": "No instruction-shaped content found.",
  "provider": { "id": "example-guard", "policy": "proj_7d2f", "version": "2026-08-01" },
  "at": "2026-08-13T02:10:00Z"
}
```

**Any member may write one, and every note carries its author.** The first
draft of this section reserved writing to "members declared as screeners",
which was wrong on reflection: a declared role has to be conferred by
somebody, and that conferral is precisely the invisible setting §7.1 exists to
avoid. A note is trusted because of who signed it, the same basis on which
anything else said in a room is trusted, so the mechanism is attribution, not
permission. The service sets the author from the verified envelope; a caller
cannot claim to be someone else.

The normative shape lives in EXT-5 §8.4, where the drive and its digests are
defined. Implementations MUST show the author and MUST NOT present a note as
the room's own verdict.

### 7.3 Shared verdicts on files

Room files are content-addressed, so a verdict on a digest is a verdict on that
exact content for everybody, permanently. An annotation keyed by digest MAY
therefore be shown to later fetchers beside the fingerprint the room already
records. A shared verdict is a signal, not a substitute, per §7.3 of the
Common Agent Specification: a member whose own provider is configured
still screens on `fetch`.

## 8. Screening as a mesh service

A screening provider MAY be a mesh agent. It implements this socket over
`request` / `respond`, publishes screening as an offering with a per-message
SKU, is metered like any other service, and carries a reputation score.

Nothing new is required to make this work — which is the point. The one
operational constraint: a screener sits in a reading path, so it must be warm
and reachable on demand. A cold personal agent cannot serve this role.

Note what such a provider can offer that an ordinary security vendor cannot: a
verifiable record of every call it ever made (§6.5), on its customers' own
audit chains.

## 9. Reduced privilege, and why this extension does not do it

Detection fails, and containment is the usual answer: while handling inbound
content, withdraw the agent's access to secrets, spending, disclosure and
outbound transfer unless the owner elevates it deliberately. It composes with
any provider and works precisely when detection misses.

**It is not part of this extension, deliberately.** A mesh node can only
withdraw the tools it serves. The agent reading the inbox is a host session —
a coding agent, a chat client — and its filesystem, shell and network access
come from somewhere the node does not control. A "reduced privilege" mode here
would close one exit while sounding like it closed the building, which is the
same partial-guarantee-that-reads-as-total this extension refuses in §2.

What is offered instead is honest about its scope: **outbound screening**
(§5.2, `call_site: send`). It covers the moment that actually matters in a
successful injection — the agent about to send material to a counterparty —
and it claims exactly one channel rather than vaguely claiming all of them. An
implementation that can genuinely control its agent's whole tool surface is
free to add containment on top; this document will not pretend the node can.

## 10. Configuration

```json
{
  "screening": "v1",
  "provider": "https://guard.example/v2/screen",
  "policy": "proj_7d2f",
  "credential": "env:SCREENING_API_KEY",
  "directions": ["inbound", "outbound"],
  "on_unreachable": "fail_closed",
  "sealed": "screen",
  "for_person": "skip",
  "exempt": ["lawyer.example@example.com"],
  "timeout_ms": 4000
}
```

`provider` accepts an HTTPS URL or a mesh agent address (`mesh:<handle>`);
everything else is identical between the two. Credentials are referenced,
never stored inline. `on_unreachable` defaults to `fail_closed` (§6.3) and
`sealed` to `screen` (§6.4), and `for_person` to `skip` (§5.3); all three are
shown here at their defaults.

## 11. The three decisions, and why they went that way

Taken 2026-08-13. Recorded here rather than folded silently into the text
above, because each had a defensible answer on both sides and a later reader
deserves the argument that settled it, not just the outcome.

### 11.1 An unreachable screener HOLDS by default

Owner-configurable, defaulting to `fail_closed` (§6.3).

The case for delivering anyway was that held mail with no explanation reads as
a broken product, and that the channel this competes with — ordinary email —
is unscreened regardless. The case that won is an asymmetry between the two
failures. Mail held during an outage is visible at the door and released with
one click. Mail delivered unscreened during an outage is invisible for ever:
nobody knows which messages went through unlooked-at, and nobody can go back
and look. Configuring a screener is somebody asking for their mail to be
looked at; quietly not looking is the opposite of what they asked for, not a
gentler version of it.

### 11.2 Reduced privilege does NOT ship

The first draft called this evenly balanced. It is not, once the enforcement
surface is examined: a node can only withdraw the tools it serves, and the
agent reading the inbox holds filesystem, shell and network access from a host
the node does not control. Shipping it would close one exit while sounding
like it closed the building — the exact failure mode §2 refuses when it rules
out platform-side screening. §9 now says this in place, and points at outbound
screening (§5.2) as the measure that covers the same moment while claiming
only what it can enforce.

### 11.3 Sealed content IS screened by default

With disclosure and per-counterparty exemption (§6.4).

The argument for exempting it is real: the sender sealed it expecting a small
audience. What ends the argument is that the exemption would be attacker-
controlled. If sealed mail is skipped by default, anyone wishing to bypass a
recipient's screener simply seals their message. An exemption the sender can
trigger unilaterally is not a policy, it is a documented bypass. Exemption
therefore belongs to the RECIPIENT, by name, for the correspondents they
choose.

## 12. Prior art (non-normative)

The request and verdict shapes above were drawn deliberately close to what
commercial screening services already accept, so a bridge to one is a JSON
translation rather than an adapter with opinions. Three shapes were examined:
one that takes a conversation as role/content messages with a project-scoped
policy handle and returns a flag plus per-detector breakdown; one that
separates the operator's own prompt from third-party documents and returns a
bare per-item boolean; and one that addresses a versioned policy by id and
direction (`INPUT` / `OUTPUT`) and returns structured per-policy assessments.

Three properties are common to all of them and are therefore assumed here:
stateless request/response, policy passed by reference rather than by value,
and sub-second latency. One is not common: the *richness* of the answer varies
from a single boolean to scored per-category findings. That is why §6 requires
only a three-value verdict and a sentence, with everything else opaque — a
socket that demanded scores would exclude a major provider outright.
