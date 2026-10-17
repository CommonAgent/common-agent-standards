# EXT-6: Admission

| | |
|---|---|
| **URI** | `mesh://extensions/admission/v1` |
| **Status** | Draft |
| **Version** | 0.6.0 draft (a sender it lets in reads the agent's declared extensions at the knock door, §9.3). 0.5.0 draft (the `bridged` tier and entries by `source`, §4 and §4.1, for core §4.13 to §4.15). 0.4.0 draft: switches on `grants` for connections; per-entry `expires_at`; knocks may carry grant names. Published: 0.3.0 (domain-tags the roster signature) |
| **Requires** | AgentMesh core ≥ 0.2; complements EXT-4 (contacts); EXT-3 for the review notification path |

Who may put a message in your agent's inbox, and what it costs you to handle
it. This extension defines a **unilateral, owner-controlled admission policy**
for direct inbound messages, carried as a signed, portable **admission
roster**. It is the inbox counterpart to EXT-4: EXT-4 is bilateral consent to
be *found*; this is unilateral control over being *messaged* once your address
is already known.

The behavior an admitting agent owes is defined in the Common Agent
Specification §7.1 (https://commonagent.net/spec.html): why the
door exists, the roster's semantics, the tiers, the stances and their
limits, where enforcement lives, the knock, held review, and
revocation. That text governs. This extension binds it to the mesh: the
roster document and its signed bytes, the roster HTTP store, the
guarded-inbox relay, the held-ledger and proposal wire protocols, and
the knock's wire form.

## 1. The problem (read first)

Why owner-set admission policy must gate inbound delivery, cheaply and
before the model is consulted, is stated at Common Agent §7.1. The gap
this extension fills on the mesh: EXT-4 gates *discovery* (whether
someone can find your agents from a handle); it does **not** gate
*delivery* to an address already known.

## 2. Two notions of contact (reconciliation with EXT-4)

There are two different relationships, and they must not be conflated:

- An **EXT-4 contact** is bilateral and mutual-consent. It gates discovery and
  roster disclosure: Bob accepted Jeff, so Jeff can resolve Bob's agents.
- An **EXT-6 admission entry** is unilateral. It gates inbound delivery and
  cost: my inbox, my rules, regardless of whether the sender agreed to
  anything.

They connect but do not constrain each other. An accepted EXT-4 contact
**defaults to `allow`** here (§5), because someone you agreed to connect with is
presumably welcome to message you. But admission is the owner's alone: you MAY
`allow`, `hold`, or `block` any sender regardless of EXT-4 state, and **`block`
always wins** over any contact relationship. EXT-4 informs the defaults; it
never overrides an explicit admission entry.

## 3. The admission roster (the artifact)

Admission policy is a single JSON document owned by the account holder and
**signed by the owner key**. It is portable by design — the OPML of your inbox
— so your policy is never trapped in one client or one mesh (§8).

```json
{
  "admission": "v1",
  "owner_key": "UBOB…",
  "defaults": { "contact": "allow", "registered": "hold", "anonymous": "block" },
  "limits": { "per_sender_per_hour": 12, "inbound_model_budget_per_day": 500000 },
  "entries": [
    { "subject": "Coder.ana@example.org", "stance": "allow", "note": "known", "updated_at": "…" },
    { "subject": "UHACK…", "stance": "block", "updated_at": "…" }
  ],
  "updated_at": "<ISO-8601>",
  "sig": "<owner-key signature over the tagged signed bytes: `agentmesh-admission-roster-v1` + LF + the canonical document, sig excluded>"
}
```

`subject` is a handle or an agent/owner key. From 0.5.0 an entry may name where a sender's identity came from in `source` instead (§4.1). The bytes `sig` covers are the
ASCII prefix `agentmesh-admission-roster-v1` followed by exactly one newline
(0x0A), then the canonical JSON (SPEC §5.3) of the document excluding `sig`.
The prefix exists only inside the signed bytes — it never appears in the
roster itself — and the encoding of `sig` is unchanged; it is there for the
reason SPEC §5.3 gives for the envelope's tag: a signature over untagged
bytes cannot say what it is. `conformance/signature-tags.json` pins the
prefix with a signed vector. Signers MUST emit the tagged form from core 0.2
on; verifiers SHOULD also accept the legacy untagged form — a signature over
the bare canonical JSON — during the 0.2 draft window, and MUST refuse it
from 0.3. A consumer **MUST verify `sig` against `owner_key` before enforcing
the roster** and MUST reject an unsigned or invalidly-signed roster, falling
back to the conservative defaults of §10.

## 4. Tiers (deterministic, pre-model)

The four tiers, sorting, and the most-specific-wins rule are Common
Agent §7.1's. Their names are the keys of the roster's `defaults` map:
`rostered` (an explicit `entries[]` match), `contact` (an accepted
EXT-4 contact with no explicit entry), `registered` (resolves to a
verified mesh identity, unknown to you), and `anonymous` (no verified
identity).

On this mesh one more key is defined: `guest`, a platform-hosted agent
the control plane vouches for, sorted between `registered` and
`anonymous`. Its definition, check, and default live in EXT-13 §6; an
implementation that does not know the tier treats such a sender as
`anonymous`, which fails closed. A guest is not anonymous: it has signed
up and verified an address, and only its standing differs.

**`bridged` (0.5.0).** A sender whose identity a bridge hosts (core §4.15)
is sorted into its own tier, `bridged`, between `registered` and `guest`.
It is a vouched mesh identity, but the bridge signs for it (core §4.15,
rule 2), so it gets less standing than a native sender. Its default is
`hold`. A consumer learns that a sender is bridged from the
`identity_bridge` or `a2a_bridge` marker in the envelope's `meta`, which
the envelope signature covers, or from the sender's `identity_source`
(core §9.7) with `kind: "bridged"`. "Native senders only" is
`"defaults": { "bridged": "block" }`. A consumer written before 0.5.0 sorts
a bridged sender as `registered`, whose default is also `hold`.

### 4.1 Entries by source (0.5.0)

An entry may name where a sender's identity came from, in `source`, instead
of a sender in `subject`:

```json
{ "source": "oauth:https://login.example.com/<tenant>/v2.0", "stance": "allow", "updated_at": "…" }
{ "source": "spiffe://example.com", "stance": "allow", "updated_at": "…" }
```

- `oauth:<issuer>` matches a sender whose `identity_source` (core §9.7) has
  that `issuer`, whether it enrolled natively (core §4.14) or a bridge hosts
  it.
- `spiffe://<trust-domain>` matches a sender whose `identity_source` has
  that `trust_domain`.
- An entry carries `subject` or `source`, never both.

**Most specific wins.** An entry that names the sender (`subject`) beats an
entry that names its source, which beats the sender's tier default. Two
source entries cannot both match one sender, because a sender has one
`identity_source`.

**Unknown sources fail closed.** A consumer that does not know the kind of
a `source` (anything other than `oauth:` and `spiffe://`) MUST NOT let that
entry admit anyone: an `allow` or `hold` entry with an unknown source
matches no sender, and a `block` entry with an unknown source is kept and
applied as soon as the consumer knows the kind. A consumer looks a sender's
`identity_source` up in the registry and MAY cache it; a sender whose
record it cannot read matches no source entry and is sorted by its tier.

**On a conforming mesh an anonymous sender exists only in a sandbox.**
Core §4.1 requires every node credential to be issued to an account with
a verified owner, and confines throwaway credentials to a sandbox that
cannot deliver outside it; core §6.2 has the registry refuse an agent
with no verified name. So a production agent should never see an
`anonymous` sender. The tier and its `block` default stay anyway, as a
second line of defense: the receiver does not have to trust that every
instance it can be reached from got the first line right, and a sender
arriving from another instance (core §21) is sorted here like any other.

## 5. Admission stances (the v1 privilege primitive)

The three stances and their semantics are Common Agent §7.1's. Their
names are the roster's `stance` and `defaults` values: `block`, `hold`,
and `allow`. Review (§9) resolves a hold.

## 6. Privileges (beyond the stance)

Version 1 keeps the privilege model deliberately small: the **stance is
the privilege**, plus the two limits Common Agent §7.1 defines, carried
in `limits` as `per_sender_per_hour` (the per-sender rate cap) and
`inbound_model_budget_per_day` (the daily ceiling, REQUIRED for any
client that invokes a paid model, §10).

### 6.1 Grants, end dates and spend limits (0.4.0, next version)

Version 0.3.0 reserved an optional `grants` array on an entry. From 0.4.0 it
is switched on, to carry connections (Common Agent §7.1, Connections): mutual
scoped admission two people agree to. An entry may carry four more members:

```json
{
  "subject": "UJO…",
  "stance": "allow",
  "grants": ["messages", "errands"],
  "spend_limit_cents": 2500,
  "expires_at": "2027-01-01T00:00:00Z",
  "connection": "019a…",
  "note": "connection: 019a…",
  "updated_at": "…"
}
```

- `grants`: a list of names from this closed set, and only these:
  `messages` (plain messages: words, no files), `scheduling` (requests that
  carry `purpose: "scheduling"`, or the `schedule` offering), `share` (files
  riding a message as §7.5 references), and `errands` (requests that carry an
  `order` object). The names reserved in 0.3.0 (`may-message`,
  `may-invite-to-rooms`, `may-request-tasks`) were never emitted and are
  withdrawn. A consumer MUST treat an entry whose `grants` contains a name
  outside the set as granting nothing.
- `spend_limit_cents`: present when `errands` is granted; the most one order
  may state, in US cents.
- `expires_at`: when the entry stops applying. Past it, the entry MUST be
  treated as absent, so the sender falls back to its tier default. An
  unreadable date counts as past.
- `connection`: the id of the connection the entry belongs to, so a revoke or
  a narrowing replaces exactly its own entries. The `note` repeats it for
  consoles that show notes.

An entry **without** `grants` keeps its 0.3.0 meaning: `allow` admits
everything. An entry **with** `grants` admits only what they name. The
check reads what a request carries, never what its words say:

| The request carries | It needs |
|---|---|
| an `order` object | `errands`, a stated `amount_cents` no higher than `spend_limit_cents`, and the owner's yes to this order |
| one or more `files` | `share` |
| `purpose: "scheduling"`, or the `schedule` offering | `scheduling` or `messages` |
| anything else | `messages` |
| a sealed input (EXT-7) | decided by the recipient's client, which can read it |

A request the grants do not cover is not delivered. The sender is connected,
not a stranger, so the reference door answers it in words with a code,
`NOT_GRANTED` or `OVER_SPEND_LIMIT`, rather than the benign ack a blocked
stranger gets. An order the grants cover is held, not delivered, until the
recipient's owner says yes to that one order (the reference control plane
keeps it as an order record and releases the one held message on yes).
Words sent back to an agent the recipient itself wrote to are an answer and
are delivered under `scheduling` as under `messages`; files and orders never
ride on that exception. Responds (answers to the recipient's own requests)
are not grant-checked.

The Kill Switch overrides every entry: a stopped sender or recipient is not
reached through a connection, whatever its grants.

## 7. Enforcement (where each part runs)

The placement rule is Common Agent §7.1's: the cost gate lives with the
recipient's own client or node, a client MUST function with no
mesh-side enforcement at all, and upstream enforcement acts on a
projection of the roster and is never the authority. On this mesh:

- **Client / node (REQUIRED).** Verifies the roster signature on load,
  applies `hold`/`allow`, runs the review workflow, and enforces the
  budget cap.
- **Control plane / mesh — OPTIONAL, RECOMMENDED for public instances.** Stores
  the signed roster, syncs it across the owner's devices, hosts the management
  UI (§9), and enforces `block` and per-sender rate limits **before delivery**,
  so floods die upstream and never reach the client. The mesh enforces a
  *projection* of the roster; it is never the authority. **Storage and sync are
  implemented** (`GET`/`PUT /v1/rosters/:owner`): a `PUT` is accepted only if the
  document is validly signed by the `owner_key` it is stored under, so no login
  is needed and the operator cannot forge a roster; `GET` is public (signed
  policy, re-verified by the consumer). The reference client syncs with
  `mesh-adapter contacts push` / `pull`. **Pre-delivery enforcement is
  implemented** by the admission service: a guarded agent subscribes a private
  `mesh.agent.<id>.inbox.guarded` subject and the service subscribes its public
  inbox, drops what the roster blocks (explicit `block`, over-rate, or tier
  default = block) with a benign ack, and transparently relays the rest to the
  guarded subject. Opt-in via `register({ guarded: true })` (reference:
  `mesh-adapter start --inbox --guarded`); if the service is unreachable the
  agent falls back to its public inbox so it stays reachable. The nuanced
  hold/allow decision stays on the client — the mesh only stops what should
  never arrive.
- **Connections (0.4.0).** The mesh-side relay applies §6.1 to a request from
  a sender whose entry carries `grants`: an expired entry is absent, a request
  the grants plainly do not cover is dropped, and what it cannot read (a
  sealed input) or must not decide (an order's per-order yes) goes on to the
  recipient's client, which applies the same table. A platform-hosted agent's
  door (the control plane's own) applies the whole of §6.1, including the
  held order and the refusal in words.

**Authorizing a roster write** follows the owner-policy authority model in core
§4.9; a roster is owner policy. The two paths there apply directly:

- **Account-session (primary).** The owner manages the roster in the mesh's
  account console: they sign in, edit, and the mesh stores and enforces it. No
  signature is produced in the browser. This is the default management surface
  (§9) and it trusts the operator, which is already assumed for mesh-side
  enforcement.
- **Owner-signed (secondary).** A headless client signs the roster with the
  owner key and pushes it; any consumer verifies the signature and treats it as
  the authority regardless of where it is stored. This is the portable path (§8)
  and the one that holds under an untrusted operator.

The `PUT /v1/rosters/:owner` endpoint accepts the owner-signed form (verified by
signature, no login); an account-session write is authorized by the session. In
both cases the mesh stores a *projection* it enforces and is never itself the
authority.

### 7.1 The guard handshake

An agent asks to be guarded on `mesh.admission.guard` and asks to stop on
`mesh.admission.unguard`. Both carry an **empty payload**: the request is
authorized by the requester's own signed envelope, and the service MUST derive
which inbox is meant from the verified `from`, never from the payload. There is
no way to guard somebody else's inbox.

A client MUST treat **only an explicit `ok` acknowledgement** as meaning it is
guarded. A timeout, a no-responders signal, an undecodable reply, and an error
reply MUST all read as *not guarded*, and in every one of those cases the
client MUST stay subscribed to its public inbox. The failure is silent, which
is why the rule is strict: an agent that wrongly believes it is guarded
subscribes only to the guarded subject, which nothing is relaying to, and goes
quietly unreachable while looking healthy.

The service MAY refuse by **answering nothing at all**. It refuses an agent
that is not registered — guarding costs a live subscription and a stored record
replayed at every restart, and registration is the one step that ran the core
§4.4 vouch — and it refuses once its guard ceiling is reached. Silence rather
than an error is deliberate: a spoken refusal that a client mistook for an ack
would strand it on a subject nobody serves. That is exactly why silence and
error must mean the same thing on the client side.

Both control subjects MUST be rate-limited like any other service subject. Each
guard creates a durable subscription plus a stored record replayed at service
restart, and identity on the mesh is free, so an unbounded control path is an
unbounded cost.

## 8. Export & portability (the OPML analogue)

The signed roster is the export, and the export-and-import obligation
is Common Agent §7.1's anti-lock-in guarantee. Import MUST verify the
signature against the stated `owner_key`. The exported document is the
§3 form, byte for byte.

## 9. Review & notification

`hold` accumulates a review queue of senders awaiting a decision. The primary
management surface is a **control-plane UI hosted by the mesh** (the account
console), authorized by an account session (core §4.9): the owner signs in, sees
held senders with their verified identity, and `allow`s or `block`s them, edits
entries, and sets limits. No signature is produced in the browser; the mesh
stores and enforces the result under account-session authority. A headless
client also manages the roster from a CLI under owner-key authority (the
reference adapter's `contacts` commands), which additionally produces the signed
portable form (§8). Owner notification that someone new is waiting MAY use EXT-3
channels (an email or SMS: "a new sender wants to reach your agent").

### 9.1 The held-attempt ledger (wire protocol)

The console can only show held senders if it learns about them, and held mail
lives in the node's local inbox, not on the mesh. The bridge is a control-plane
**held-attempt ledger**: when a node holds a first-contact message, it reports
*who* knocked — never what they said — and later fetches the owner's decision.

**Report (node → control plane).** `POST /v1/held-reports` with:

```json
{
  "agent":    "<owner key the message was addressed to>",
  "sender":   "<sender's agent key>",
  "handle":   "<sender's resolved PAN handle, if any>",
  "operator": "<sender's registered operator label, if any>",
  "grants":   "<0.4.0: absent, or the knock's grant names (§6.1); never prose>",
  "ts":       "<RFC 3339 timestamp>",
  "sig":      "<base64 Ed25519 signature>",
  "resolved": "<absent, or allow|block when acking a resolution>"
}
```

The signature is by the **agent key itself** (the same scheme as PAN pairing
and roster signing) over the canonical string:

```
held-report-v1:<agent>:<sender>:<ts>:<resolved or the literal "waiting">
```

The control plane MUST verify the signature against `agent`, MUST reject
timestamps more than 300 seconds from its clock, and MUST treat reports as
idempotent upserts: a repeat knock bumps `count` and `last_at` on the existing
entry rather than duplicating it. The freshness window means a captured report
is replayable for its lifetime; this is accepted because reports are
idempotent and carry no privilege beyond "this sender knocked."

**Decisions (node ← control plane).** The owner's console decision
(`allow`/`block`) is recorded on the entry, not enforced by the ledger. The
node polls `POST /v1/held-decisions` — body `{agent, ts, sig}`, canonical
string `held-decisions-v1:<agent>:<ts>`, same signature and freshness rules —
and receives entries carrying a decision. For each, the node applies the
decision to its **own** roster (adding the entry and re-signing under the owner
key, §3), releases or drops the held mail locally, pushes the re-signed roster
to the control-plane store (§7), and acks by sending a report with `resolved`,
which deletes the ledger entry. Authority never moves: the ledger transports
the owner's intent; the signed roster remains the enforced artifact.

**Account surface.** `GET /v1/accounts/:id/held` lists waiting entries for the
account's owner key; `POST /v1/accounts/:id/held/:sender` with
`{"stance": "allow" | "block"}` records a decision. Both require the account
session (core §4.9). A decision MAY also be folded immediately into the
control-plane roster copy so mesh-side enforcement (§7) follows the owner's
intent during the convergence window (bounded by the node's poll interval,
RECOMMENDED 60 seconds).

**Lifecycle and expiry.** `waiting → decided → deleted` (on node ack), or
`waiting → deleted` (the node resolved it locally via its CLI and reported
`resolved`), or `waiting → expired`. Entries expire after 30 days without a
repeat attempt, refreshed by each new knock, so the list means "senders
currently waiting on you," not an archive.

### 9.2 Roster proposals (console edits reach the node)

The console cannot produce the owner-key signature (§11), so its Save has two
effects. First, the control plane stores the account-authored document and
enforces it for mesh-side gating immediately (account-session authority,
§7). Second, the same document is queued as the agent's pending **roster
proposal**. The node polls `POST /v1/roster-proposals` — body
`{agent, ts, sig[, ack]}`, canonical string
`roster-proposal-v1:<agent>:<ts>:<ack timestamp or the literal "fetch">`,
same signature and freshness rules as §9.1 — adopts the proposal into its
local roster, **re-signs it under the owner key**, reconciles held mail with
the adopted stances, pushes the signed roster to the control-plane store
(§7), and acks with the proposal's `proposed_at`, which deletes it.

Convergence, not co-authority: the node MUST NOT enforce an unsigned
document, and after one poll interval (RECOMMENDED 60 seconds) both the mesh
and the node are enforcing the same owner-signed roster. One pending
proposal exists per agent; a newer Save replaces an unfetched older one
(the console loads current state before editing, so the latest Save is the
owner's most recent intent). Concurrent CLI edits between a console load and
its Save are overwritten by the proposal; implementations SHOULD keep the
window small by polling promptly and MAY surface the overwrite in the log.

### 9.3 Knock (asking to be admitted)

The knock's semantics, content-free, never invoking the agent, never
entering the inbox, rate-limited on its own, answered identically for
every outcome, passed through any pre-delivery enforcement, are Common
Agent §7.1's. On the mesh it is a request on the `knock` offering whose input
is empty or, from 0.4.0, carries only `grants` (a list of names from §6.1)
and the client's short `via` label (at most 80 characters). An input with
any other member, or a grant name outside the set, is refused whole with the
code `KNOCK_CARRIES_NO_MESSAGE` and a sentence, by the recipient's door and,
for a guarded agent, already by the mesh-side relay (§7); it is not reported.
A held-attempt report MAY carry the knock's `grants` (§9.1), and the owner
MAY answer the knock by allowing exactly those grants or fewer, which writes
a one-way connection entry (§6.1) rather than a plain allow. Its only effect
otherwise is a held-attempt ledger report (§9.1), the
reference limits are one knock per sender per day with a global daily
cap of 50, and a knock from a sender the roster already covers simply
refreshes the ledger entry.

**Reading a private agent's declared extensions (0.6.0).** The registry
gives a private agent's manifest to its owner, so a sender cannot always
read there what the agent declares, such as Agent Messaging §5.7's
`mesh://extensions/audience/v1`. The knock door is the second place to read
it, after the registry. A door's answer to a sender it lets in (by the same
admission decision it makes for a message from that sender) MAY say so with
`admitted: true`, and then carries `extensions`, the list of extension URIs
the agent declares in its registration (empty when it declares none). A
knock whose input carries only `ask: ["extensions"]` is that read and
nothing else: it writes no held-attempt report, puts nobody on a waiting
list. A sender the
door does not let in, a blocked sender included, gets exactly the answer any
knock gets, which is the same as the answer for an agent that does not
exist, so the read is no oracle for a private agent's existence or its
declarations. Besides `grants` and `via`, `ask` is the one member a knock's
input may carry, and `extensions` is the one name it may ask for in this
version.

Knocking presumes a **persistent sender identity**: approving an
identity that evaporates buys the owner nothing. Reference clients
therefore send knocks (and messages) as the machine's durable identity,
routed through the live node when one is running. Mesh-side guarded
enforcement (§7) passes knocks through regardless of the sender's tier
stance, per §7.1's passthrough rule.

## 10. Defaults (normative recommendation)

The protective defaults an implementation SHOULD ship are Common Agent
§7.1's: contact allows, registered holds, anonymous blocks, an explicit
entry as it states. A bridged sender (§4, 0.5.0) holds. The `inbound_model_budget_per_day` backstop is
REQUIRED for any client that invokes a paid model on inbound; the
per-sender rate limit is RECOMMENDED.

## 11. Privacy & security requirements (normative)

The behavioral requirements here are Common Agent §7.1's: verify before
enforcing and fall back to defaults on failure, `block` indistinguishable
from "no such agent", `hold` never invoking the agent, the ledger
carrying who knocked and never what they said, and admission being
permission to reach, never a statement about authorship. Two are
mesh-specific:

- Control-plane roster storage is per-account and visible only to the
  owner, and held-ledger entries (§9.1) are visible only to the owning
  account.
- Admission does **not** defend against a compromised client holding the
  owner key. A trojaned client presents the owner's own credentials and
  passes every gate; that threat belongs to release signing and key
  custody, not here.

## 12. Relationship to other extensions

- **EXT-4 (contacts):** accepted contacts default to `allow` (§2). EXT-4 gates
  discovery; EXT-6 gates delivery; `block` overrides any contact relationship.
- **EXT-3 (contact channels):** the out-of-band path for review notifications
  (§9).
- **EXT-5 (rooms):** rooms carry their own admission (the `acl` grade, per-room,
  broker-minted scoped credentials). EXT-6 is per-inbox for direct messages. The
  two rate-limit layers complement each other.

## 13. Open questions

1. ~~Whether v1 enforces admission at the broker or only client-side.~~
   RESOLVED: both shipped. Client-side gate first, then the admission service
   for opt-in pre-delivery enforcement (§7). A guarded agent depends on the
   service being up; the fallback to the public inbox keeps it reachable if not.
2. ~~Owner-key custody for the mesh-hosted UI.~~ RESOLVED by core §4.9: the
   mesh-hosted UI uses account-session authority (no browser signing); owner-key
   signing is the separate portable path used by headless clients. There is no
   browser-signing requirement.
3. ~~The capability-grant vocabulary reserved in §6.~~ RESOLVED in 0.4.0
   (§6.1): four names for connections, read from what a request carries.
   Room invitations and task requests as grants remain open.
4. Group and role admission ("allow anyone on my team") without importing org
   modeling. Track with EXT-4 open question 2.
5. Cross-mesh admission when sender and recipient are on different control
   planes. Track with EXT-4 open question 1 and federation (SPEC §21).
