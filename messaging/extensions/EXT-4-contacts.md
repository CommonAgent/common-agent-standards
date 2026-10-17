# EXT-4: Contacts

| | |
|---|---|
| **URI** | `mesh://extensions/contacts/v1` |
| **Status** | Draft |
| **Version** | 0.2.0 draft, next version (§5 becomes the signed, scoped, single-use invite for connections). Published: 0.1.0 |
| **Requires** | AgentMesh core ≥ 0.2 (owner grouping §8.6, owner discovery filter §9.3) |

Private, mutual-consent contact exchange between **people**: how Jeff finds
Bob's agents without knowing a key, and how Bob controls who sees them.
Signal-shaped, not directory-shaped.

## 1. Non-goals (read first)

- **Not a public directory.** Nothing here is crawled, indexed, or searchable.
  Public, web-scale discovery of *published* agents — including organizations
  and their departmental namespaces — is ceded to **ARD**
  (agenticresourcediscovery.org): orgs publish `ai-catalog.json` at their
  domains; hierarchy is their URN namespace (`urn:air:acme.com:engineering:…`).
  AgentMesh does not model organizations, departments, or roles.
- **Not routing.** A contact's roster presents distinct agents (a coding agent
  is not a CAD agent); the caller always sees and chooses. Nothing delivers
  "to Bob" by picking an agent for you.
- **Not key syncing.** One person, many devices = many agent keys under one
  owner key (§8.6). Private keys never move between machines.

## 2. The model

```
handle ("bob@example.com")
   │  resolves to (mutual consent only)
   ▼
owner key (UBOB…)                 ← "Bob" — one identity, §8.6
   │  discover({ owner })         ← the roster lookup, core §9.3
   ▼
Bob's agents, each with capabilities + live availability
   │  caller picks ONE, by intent
   ▼
signed request to that agent's inbox (core, unchanged)
```

The core protocol contributes the bottom half (owner grouping, roster
discovery, delivery). This extension defines the top half: consent-gated
resolution from a human handle to an owner key, and disclosure of non-public
rosters to accepted contacts.

## 3. Contact lifecycle (control-plane API)

All state lives at the account layer of the mesh home (control plane), keyed
by the pair of accounts. States: `pending` → `accepted`, or `declined`;
`accepted` → `revoked` (either side, any time).

| Endpoint | Semantics |
|---|---|
| `POST /v1/accounts/:id/contacts { email }` | Send a contact request. The response MUST NOT reveal whether the target account exists. |
| `GET /v1/accounts/:id/contacts` | List contacts with state. `owner_key` and display name appear **only** on `accepted` entries. |
| `POST /v1/accounts/:id/contacts/accept { email }` | Accept a pending request — the pair becomes mutual. |
| `POST /v1/accounts/:id/contacts/deny { email }` | Decline (idempotent; indistinguishable from "no account" to the requester). |
| `DELETE /v1/accounts/:id/contacts/:email` | Revoke. Resolution stops immediately for both sides. |

Accounts publish their owner key once (`owner_key` on the account record, set
by the account holder's client). This is the account-level owner key defined in
core §4.9 (Owners and Authority), the same key used for owner-signed policy
elsewhere; this extension only publishes its public half for contact resolution.
Rotation: setting a new owner key updates what accepted contacts resolve; old
rosters age out of the registry.

## 4. Roster disclosure

Given an accepted contact's `owner_key`, the client performs standard
owner-filtered discovery (`discover({ owner })`, §9.3) over its own mesh
connection. Visibility interaction:

- `public` agents: visible to anyone; contacts add nothing.
- `unlisted` agents: reachable by ID for anyone; **listed** in an exact
  owner-filtered query when — and only when — the agent was registered with an
  explicit owner attestation (a deliberate person/org roster, §8.6). The
  registry learns nothing about the contact relationship; the disclosure
  happens because the client learned the owner key at all (capability-style:
  knowing the key *is* the grant, and contacts learn it via mutual consent).
  Node-defaulted ownership never participates, so observing node IDs on the
  wire (heartbeats) exposes nothing. An instance MAY additionally enforce
  contact-aware registry filtering; that requires the registry to consult the
  contact store and is OPTIONAL.
- `private` agents: never disclosed to contacts.

## 5. Invitations (0.2.0, next version)

In 0.1.0 an invitation was an unsigned link carrying `owner-key@mesh-name`
and a display name, which created a `pending` contact pair. From 0.2.0 an
invitation is how two people make a **connection** (Common Agent §7.1,
Connections): mutual, scoped admission between their agents, landing as
entries with grants in both EXT-6 rosters (EXT-6 §6.1). It is signed, scoped,
single use and short lived. Accepting it is the explicit act on the invited
side; making it was the explicit act on the inviter's, so nothing waits on
either side afterwards.

### 5.1 The invite

The control plane signs the invite with its own key over the tagged bytes
`agentmesh-connection-invite-v1` + LF + the canonical JSON (SPEC §5.3) of
this body:

```json
{
  "v": "connection-invite-v1",
  "id": "<22 base64url characters, random: the invite's address and its single-use token>",
  "inviter": {
    "account": "<the inviter's account id>",
    "agent": "<the inviter's agent key the connection lands on>",
    "agent_name": "<that agent's verified name>",
    "display_name": "<the inviter's public name, or null>"
  },
  "scope": {
    "grants": ["messages", "share"],
    "spend_limit_cents": 2500,
    "expires_at": "<when the connection itself would end, or null for until revoked>",
    "two_way": true
  },
  "preset": "messages | scheduling | share | errands",
  "carriage": "in_person | link",
  "issued_at": "<RFC 3339>",
  "expires_at": "<RFC 3339>"
}
```

`spend_limit_cents` is present only when `errands` is granted. Two-way is the
default; one-way means only the accepting side's agent may reach the
inviter's. An agent with no verified name cannot make or accept an invite: a
connection lands on a named agent or not at all.

### 5.2 Lifetimes

- **In person:** 10 minutes from issue.
- **As a link:** 1 day from issue.
- **Held once claimed:** when a person claims the invite by email (§5.4) it is
  held for that address for 24 hours from the claim, past its own lifetime if
  need be, so finishing sign-up on a phone does not race the clock. Another
  address cannot claim or accept it while the hold lasts.
- **Single use:** the first acceptance consumes it, decided by compare-and-set
  so two acceptances cannot both win. A used, cancelled or expired invite
  answers the same way to every later attempt.

Nothing is created for a person who never finishes: no account beyond the
one their own code opened, no roster entry, no temporary name.

### 5.3 Carriage

The same invite travels four ways, all resolving to its `id`:

- **QR:** the accept page's URL, so a phone camera opens the page a link does.
- **URL:** `<app>/connect/accept/<id>`.
- **Spoken short code:** three words and a number from 10 to 99 (`maple river
  candle 42`), from a fixed list of 256 plain words. The control plane keeps
  only a digest of it, lowercases, ignores punctuation and accepts the number
  first or last, and stops resolving it when the invite is used, cancelled or
  expired. Lookups are rate-limited per address.
- **A knock with grants:** an agent asks another to be admitted for named
  grants (EXT-6 §9.3); the owner answers by allowing those grants or fewer,
  which makes a one-way connection from the knocking agent. No invite is
  issued; the knock is the offer.

When both people are together, both screens MUST show the same two
**matching words**, derived from the invite's signature (the first two bytes
of SHA-256 over `connection-match-v1:` + the signature, each indexing the
same 256-word list). A different invite, such as a look-alike QR somebody
swapped in, shows different words.

### 5.4 Accepting

The accept page is the invite's URL. For a person not signed in it asks for
an email address on the page and sends a six-digit code to it; the person
types the code on the same page, so the phone never leaves it. The code lasts
10 minutes, five wrong tries spend it, and a claim may ask for at most five
codes. A right code signs the address in, opening an account if it has none
(the same refusals as any sign-up apply), and the resulting session proves
the email as an emailed sign-in link does. If the person's agent has no name
yet, they name it on the platform's one approval screen and come back. They
see the inviter's name, the agent's verified name, what is offered, when it
ends and, in person, the matching words; they may narrow the scope (fewer
grants, a lower spend limit, an earlier end, one-way) and never widen it;
then they accept.

### 5.5 The acceptance record, on both sides

Acceptance writes one connection record naming both sides (account, agent,
verified name), the scope as accepted, and a log: the invite's creation, the
claim, the email proved, the acceptance, and later every narrowing and the
revocation, each with who did it (actor) and on whose account (principal).
Each side's agent roster gains an entry for the other's agent (EXT-6 §6.1):
the inviter's always, the acceptor's when two-way. Both people's agents are
told in their own mailboxes. Either side lists its connections, narrows one,
or revokes one; a revocation removes both entries before it answers.

### 5.6 HTTP binding (reference control plane)

| Endpoint | Semantics |
|---|---|
| `POST /v1/accounts/:id/agent-connections/invites` | Make an invite `{ preset, two_way?, carriage?, spend_limit_cents?, ends_at?, agent? }`. Answers `invite_id`, `url`, `qr`, `spoken_code`, `matching_words`, `expires_at`, `scope`. |
| `GET /v1/invites/:id` | What the invite offers, its state and the matching words. Public: knowing the id is the grant. |
| `POST /v1/invites/spoken` | `{ code }` to `{ invite_id }`. One answer for every miss. |
| `POST /v1/invites/:id/claim` | `{ email }`: sends the code and holds the invite. |
| `POST /v1/invites/:id/verify` | `{ email, code }`: signs in or up; answers the session, and `join_url` when the agent still needs its name. |
| `POST /v1/invites/:id/accept` | Session. `{ grants?, spend_limit_cents?, expires_at?, two_way?, agent? }`, never wider than offered. |
| `GET /v1/accounts/:id/agent-connections` | Connections and open invites. |
| `POST /v1/accounts/:id/agent-connections/:cid/narrow` | Either side narrows. |
| `DELETE /v1/accounts/:id/agent-connections/:cid` | Either side revokes, at once. |

A connection is not an EXT-4 contact pair (§3): it does not disclose rosters
or resolve handles. The two can coexist; an accepted contact's default
`allow` (EXT-6 §2) is replaced by the connection's entry for the same agent,
and an explicit `block` still wins over both.

## 6. Privacy requirements (normative)

- Handle resolution MUST be consent-gated both ways; there is no lookup of
  "does this email have an account," and no enumeration surface.
- Contact state is visible only to the two accounts in the pair.
- Revocation MUST take effect immediately at the control plane; clients MUST
  treat cached owner keys of revoked contacts as stale.
- Nothing in this extension is exposed to mesh-wide subjects; it is entirely
  control-plane (HTTPS) + standard core discovery.

## 7. Relationship to other extensions

- **EXT-3 (contact channels)**: EXT-3 is *how to notify* a person (email/SMS);
  EXT-4 is *how to find and verify* their agents. An accepted EXT-4 contact is
  a natural consent anchor for EXT-2/EXT-3 features.
- **EXT-6 (admission)**: EXT-4 is *bilateral consent to be found*; EXT-6 is
  *unilateral control over inbound delivery* once an address is known. An
  accepted EXT-4 contact defaults to `allow` in an EXT-6 roster, but admission
  is the owner's alone and `block` overrides any contact relationship.
- **ARD bridge** (future, separate): public mesh agents exported as
  `ai-catalog.json`. Orthogonal — nothing in EXT-4 is ever exported.

## 8. Open questions

1. Cross-mesh contacts (Jeff on mesh A, Bob on mesh B): the handle format
   already carries the mesh; the consent store spans two control planes.
   Deferred with federation (SPEC §21).
2. Group rosters (a family, a team) without becoming org modeling.
3. Contact-aware registry filtering (§4, OPTIONAL) — worth the coupling?
