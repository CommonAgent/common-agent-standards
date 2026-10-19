# Agent Mandate Specification

**Version:** 0.5.0-draft
**Status:** Working Draft
**Date:** 2026-10-18

A **mandate** is authority, delegated in writing: a principal states who may
act on its behalf, for what, up to what limit, until when. An **Agent
Mandate** is that document for organizations whose software agents do the
work. It gives the organization itself a verifiable identity on the network,
and it gives the people who act for the organization signed, bounded,
revocable authority to do so.

This specification is the corporate companion to the
[Agent SoW](https://agentsow.com) and [Agent RFP](https://agentrfp.net)
specifications. Those define how work is offered, asked for, and bound;
this one defines who is entitled to bind an organization, and how a
counterparty checks. It is transport-neutral, developed alongside Agent Messaging;
nothing here requires a particular network or vendor.

---

## 1. Motivation

Two gaps motivate this document.

First, the organization itself. In an Agent SoW, the owner behind a party
is a display string: `"owner": "Harbor & Line Outfitters"` is prose, not an
identifier. Nothing binds the accounts, the agents, or the published offers
to the legal entity whose name is typed there. A counterparty doing real
business needs the entity to be a verifiable principal, not a caption.

Second, authorization. Agent SoW §6.1 lets a document demand that a person
approve formation or amendment, and it is explicit about what the approval
ceremony proves: a verified human was present and confirmed. It does not
prove the human was entitled to bind anyone. For an individual owner the
two are the same person, and the gap does not matter. For an organization
they are not: corporations act through officers who hold authority and
delegate it downward with limits, and "an employee clicked approve" is not
"the company agreed." The mandate closes that gap: the approving person
holds a signed, current, sufficient mandate, and the counterparty can see
that they did.

## 2. Conformance language and terminology

The key words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are to be
interpreted as described in RFC 2119.

- **Organization**: a principal anchored to a domain, declared by a charter.
- **Charter**: the organization's constitutive record: its domain, its root
  authority keys, its administrator keys, and its stated legal identity (§5).
- **Root authority**: the set of allocator keys named in the charter as
  holding the organization's full authority, with a signing threshold.
- **Allocator**: a person holding a root authority key: the business
  authority who assigns spending limits by issuing mandates. In full, a
  root capital allocator. The natural holders are the people entitled to
  commit the organization's money: a CFO, a managing partner, an owner.
- **Administrator**: the custodial role: a holder of keys named in the
  charter for filing and maintaining its registry record. In full, a root
  administrator. An administrator's signature carries no authority to
  spend or delegate (§5).
- **Mandate**: a signed document delegating bounded authority from an
  issuer to a holder (§6).
- **Issuer**: the authority a mandate is signed by: root authority, or a
  mandate that permits sub-delegation.
- **Holder**: the account (and its person) a mandate authorizes, and,
  where the mandate permits sub-delegation, the key that account signs
  with (§6).
- **Chain**: a mandate plus the mandates above it, up to root authority.
- **Treasury**: the organization's own balance on a settling platform,
  drawn on only under mandates naming the organization as payer (§8).
- **Registry**: a service that hosts charters and mandates and answers
  chain queries. The platform an organization's accounts live on normally
  plays this role.
- **Owner**, **Agent**, **Engagement**, **Node**: as defined in Agent SoW §2.

## 3. The enforcement gradient

Agent Mandate adopts the enforcement gradient of Agent SoW §3 normatively:
every claim in a charter or mandate is graded `enforced`, `evidence`, or
`recorded`, with the same meanings and rules. A document that claims more
enforcement than its runtime delivers is not conformant.

Stated up front, because it is the honesty boundary of the whole document:

- **Domain control is verifiable.** A charter's binding to its domain is
  checked mechanically and is `enforced` by the registry.
- **The chain is verifiable.** Signatures, expiries, ceilings, and scopes
  are bytes; a conforming platform refuses acts outside them. Where the
  platform holds approvals pending (Agent SoW §6.1), the mandate check is
  `enforced`; elsewhere it is `evidence`.
- **The law is not verifiable.** That the organization legally exists, that
  its officers were validly appointed, that a board resolution stands
  behind the root keys: no runtime can check any of it. Those claims are
  `recorded`. A mandate proves what the organization's keys signed, not
  what a court would hold, and nothing that renders one may suggest
  otherwise.

## 4. Document model

Charters and mandates are JSON documents in JCS (RFC 8785) canonical form,
signed with the tagged-signature convention of the family: the ASCII tag,
one newline, then the canonical JSON of the document with `signatures`
removed. The signed bytes include `id`, because the identifier is derived
before the document is signed.

Identifiers:

```
org_<crockford32(sha256(canonical bytes of charter version 1, minus id and signatures))[0..16]>
mnd_<crockford32(sha256(canonical bytes of mandate version 1, minus id and signatures))[0..16]>
```

1. **The hashed bytes exclude `id` and `signatures`.** An implementation
   MUST remove both members from the version-1 document, canonicalize what
   remains under JCS, and hash that. `id` is excluded because the document
   carries the identifier derived from it: bytes that contain `id` cannot
   be assembled until the identifier is known, and the derivation would
   not terminate. `signatures` is excluded because the signatures are made
   over a document the identifier already names. The two exclusions are
   not the same as the signed bytes above, which remove `signatures` only.
2. **`crockford32` is Crockford base32, lowercased.** The alphabet is
   `0123456789abcdefghjkmnpqrstvwxyz`, which omits `i`, `l`, `o`, and `u`.
   An implementation MUST emit lowercase, MUST NOT pad, MUST NOT insert
   hyphens, and MUST NOT use Crockford's check symbol. The digest is
   encoded five bits per character, most significant bit first, and the
   first 16 characters are taken, which are the first 80 bits of the
   digest. Crockford's decoding aliases, `o` for `0` and `i` or `l` for
   `1`, are a reader's convenience and MUST NOT appear in an emitted
   identifier. RFC 4648 base32 is not the encoding here and MUST NOT be
   substituted: its alphabet has no `0`, `1`, `8`, or `9`.
3. Two implementations following these rules derive the same identifier
   from the same document. An implementation that derives a different one
   is not conformant.

Charters and mandates are amended by full replacement at version N+1,
signed fresh, never by delta. A registry MUST retain prior versions. The
identifier is stable across replacements: it names the document, not one
version of it.

**Minting and re-derivation.** An identifier is minted once. The
implementation that creates the version-1 charter or mandate derives the
identifier there, writes it into `id`, and does not derive it again. From
that moment the identifier is a handle, and other documents hold it by
value: every mandate names its organization's `org_`, a sub-mandate names
the mandate it was issued under, an Agent SoW party names `organization` and
an approval record names `mandate` inside the SoW's signed bytes (§7), an
Agent NDA seat names `organization` and its signature record names
`mandate` (§7.2), a draw record names the mandate it settled under (§8), and a revocation act
names what it revokes (§13). Replacing a charter or a mandate at version N+1
leaves the identifier alone.

An implementation MUST derive an identifier once, when it mints the
version-1 document. Storing, replacing, rendering, exporting, or verifying a
document MUST NOT re-derive its identifier.

A verifier MUST NOT reject a charter or a mandate because its identifier
does not equal what the derivation above would produce from that document's
version-1 bytes, and a registry MUST NOT refuse to host one, suspend one, or
break a chain on that ground. The derivation rule binds the implementation
that mints an identifier. It does not bind the reader of a document minted
earlier, possibly under an earlier revision of this specification. Point 3
above is a test a minting implementation applies to the documents it mints,
and it is not a test a reader applies to the documents it receives.

Documents minted before this revision carry identifiers derived under a
superseded reading. Those identifiers remain valid and remain the names of
their documents. That is the reason re-derivation is not a conformance test.
A specification that made it one would invalidate every identifier minted
under its own earlier text, and here the damage would land on authority
itself: a chain verifies by each mandate naming the organization and the
mandate above it, so re-deriving identifiers would sever chains that verify
correctly today.

There is a check a reader may legitimately want, and it is narrower than it
looks. Where a reader holds a version-1 document and knows it was minted
under this revision, re-deriving the identifier and comparing detects
accidental damage: a truncated file, a re-encoded string, a record stored
against the wrong document. Implementations MAY run that check as a
diagnostic. A minting implementation SHOULD run it on its own output before
the document is signed and filed with a registry, which is the last moment a
wrong identifier is cheap to fix.

Four things the check does not establish, listed because an implementation
that has it working may be tempted to rely on it for more:

1. It says nothing about a document at version 2 or higher. The identifier
   commits to the version-1 bytes, and a charter amendment may rotate the
   root authority keys the whole system rests on while the identifier stays
   put.
2. A mismatch does not establish that a document was altered. The reader
   cannot tell an altered document from one minted correctly under an
   earlier reading.
3. It is not a tamper check. A party that alters a document can mint a
   fresh identifier over the altered bytes, so the check finds accidents and
   not adversaries.
4. Eighty bits of a truncated digest is sized to be read, typed, and quoted
   inside another document. It is not sized to resist a search for a
   colliding document.

The content commitment a reader can rely on is the signature: the tagged
bytes described above, covering the whole canonical document including `id`
at the version being read, checked against the `holder.key` of the mandate
above it or the charter's `root_authority.keys` (§6). An identifier that
does not re-derive is not evidence of anything. A signature that does not
verify is.

## 5. The charter

A charter exists to make the organization a principal a machine can
check. It is written once, when the organization first comes to the network:
the allocators sign it, the administrator files it with a registry, and
the registry verifies domain control before hosting it. From then on it
is the anchor everything else refers to: every mandate names the
charter's organization id, every chain verifies up to its root authority
keys, and a counterparty resolves the id to see whom it is dealing with.
A charter changes rarely; amending it, like rotating keys or changing
allocators, is an act of root authority at version N+1.

The document, signed by its root keys. Tag: `agent-charter-v1`.

```json
{
  "charter": "v1",
  "id": "org_7k2m9q4w1x8e5r3t",
  "version": 1,
  "domain": "harborandline.example",
  "name": "Harbor & Line Outfitters",
  "legal": {
    "jurisdiction": "Delaware, US",
    "registration": "SR-20241102-88417",
    "grade": "recorded"
  },
  "root_authority": {
    "keys": ["<allocator public key>", "<allocator public key>"],
    "threshold": 1,
    "grade": "evidence"
  },
  "administrator": {
    "keys": ["<administrator public key>"]
  },
  "created_at": "2026-08-01T00:00:00Z",
  "signatures": [ ]
}
```

Rules:

1. A registry MUST verify domain control before hosting a charter, using
   a DNS record or a well-known HTTPS path on the charter's domain that
   names the charter id. The binding is re-checkable by anyone at any
   time; a charter whose domain proof disappears is suspended, not
   deleted. Grade: `enforced` at the registry.
2. `root_authority.keys` are the organization's highest authority in this
   system, held by its allocators. `threshold` is how many root signatures
   an act of root authority needs; issuing a mandate, amending the
   charter, and rotating root keys are all acts of root authority. Root
   keys SHOULD be held by people with person-grade credentials (Agent SoW
   §6.1), and a registry SHOULD require a person-grade ceremony for every
   act of root authority.
3. The charter separates custody from authority. `administrator.keys`
   maintain the record: they submit the charter and its amendments to the
   registry, keep the domain proof current, and file acts the allocators
   have signed. An administrator signature is never sufficient for an act
   of root authority: it cannot issue a mandate, amend the charter,
   rotate keys, or approve anything, and a registry MUST refuse an act of
   root authority carried by administrator signatures alone. Grade:
   `enforced` at the registry. `administrator` MAY be omitted; the
   allocators then file for themselves.
4. `legal` is a statement, not a verification. Grade: `recorded`, always,
   and rendered as such.
5. `name` is prose. Anything that displays a charter MUST display the
   domain with at least equal prominence: the domain is the verified part.

## 6. The mandate

A mandate exists to put one line of spending authority in writing: this
account, held by this person, may commit the organization to these kinds
of act, up to this much per engagement and per month, on these offerings,
until this date. The set of mandates in force is the organization's
ledger of who can spend what. There is no separate ledger to maintain:
the mandates are it, the registry can list them, and an audit of the
organization's exposure is a query.

In use, an allocator issues a mandate when the business decides a person
may commit the company, the platform checks it every time that person
approves an act (§7), and the issuer revokes it when the person leaves or
the limits change. The delegation document. Tag: `agent-mandate-v1`.

```json
{
  "mandate": "v1",
  "id": "mnd_3f8c1n6z9v4b7q2m",
  "version": 1,
  "organization": "org_7k2m9q4w1x8e5r3t",
  "issuer": { "kind": "root" },
  "holder": {
    "account": "acct_2c9f7e1a",
    "person": "mari@harborandline.example",
    "key": "<holder public key>"
  },
  "powers": ["form", "amend", "terminate", "award", "nda"],
  "ceiling": {
    "currency": "XCR",
    "per_engagement": 50000000,
    "per_month": 200000000
  },
  "scope": { "offerings": ["audit-freight-*"], "note": "logistics purchasing only" },
  "settlement": { "payer": "organization" },
  "sub_delegation": { "allowed": true, "max_depth": 1 },
  "starts_at": "2026-08-01T00:00:00Z",
  "expires_at": "2027-08-01T00:00:00Z",
  "signatures": [ ]
}
```

Rules:

1. **Issuance.** A mandate is signed either by root authority (meeting the
   charter's threshold) or by the holder of a mandate whose
   `sub_delegation.allowed` is true. Where the issuer is root authority,
   every signature key MUST appear in `root_authority.keys` of the charter
   version the mandate names. Where the issuer is a mandate, the signature
   key MUST equal the `holder.key` of that mandate. Grade: `evidence`; the
   signatures are the record.
2. **Holder key.** `holder.key` is the public key the mandate's holder
   signs with. It MUST be present on a mandate whose
   `sub_delegation.allowed` is true, and it MAY be present on any other
   mandate. It is required only where sub-delegation is permitted because
   that is the only case in which someone later has to check a signature
   the holder made, and `holder.account` and `holder.person` name a party
   without naming a key. A registry MUST refuse a mandate that sets
   `sub_delegation.allowed` to true and carries no `holder.key`, and MUST
   refuse a sub-mandate whose signature is not by the `holder.key` of the
   mandate its `issuer` names. Grade: `enforced` at the registry.
3. **Narrowing.** A sub-mandate MUST be at most as broad as its issuer's
   mandate in every dimension: powers a subset, ceilings no higher, scope
   no wider, expiry no later, depth within `max_depth`. For
   `scope.nda_categories` (rule 8), no wider means this: where the
   issuer's mandate carries the list, the sub-mandate MUST carry it too,
   and every category in it MUST appear in the issuer's list. Where the
   issuer's mandate carries no list, the sub-mandate MAY carry one. A
   registry MUST refuse a sub-mandate that widens anything. Authority narrows going
   down; it never widens. Grade: `enforced` at the registry.
4. **Powers.** `form` covers countersigning an engagement into existence;
   `amend` covers approving amendments; `terminate` covers ending
   engagements; `award` covers awarding an RFP posting (which leads to
   `form`); `nda` covers every act on an Agent NDA for the organization:
   signing an offer or an open offer, countersigning an offer or accepting
   an open offer, joining a multilateral agreement, amending, terminating,
   and withdrawing (§7.2); `issue` is implied by `sub_delegation.allowed`.
   A power not listed is not held.
5. **Ceilings.** Amounts use the engagement's price vocabulary (Agent SoW
   §5.5). `per_engagement` bounds a single document's committed price;
   `per_month` bounds the holder's total formed commitments per calendar
   month. Both checks run at approval time.
6. **Settlement.** `settlement.payer` names whose balance pays for
   engagements approved under the mandate: `holder` (the default when the
   field is absent) or `organization`. When it is `organization`, acts
   approved under the mandate settle from the organization's balance on
   the settling platform, and the ceilings bound the holder's draw on it:
   one treasury, many bounded drawers, instead of a balance topped up per
   employee. A sub-mandate MAY name the organization as payer only if its
   issuer's mandate does: a draw on the treasury cannot be granted by
   someone who does not hold it. The organization's balance is the
   treasury, defined in the abstract in §8; how it is funded is outside
   this specification (§12). Grade: `enforced` where the platform
   settles the engagement; `evidence` elsewhere.
7. **Term and revocation.** A mandate has no force before `starts_at` or
   after `expires_at`. The issuer, or root authority at any time, revokes
   by a signed act (tag `agent-mandate-resolve-v1`, action named inside
   the signed bytes). Revoking a mandate revokes every mandate issued
   under it: a chain dies with its root. Grade: `enforced` at the
   registry from the moment the act is recorded.
8. **Agent NDA categories.** A mandate MAY carry `scope.nda_categories`, a
   list of the categories of Agent NDA §5.4. The list narrows the `nda`
   power to agreements whose `covers.categories` all appear in it. A
   mandate without the list places no limit on categories. Where the list
   is present, it MUST be non-empty, MUST contain only Agent NDA §5.4
   categories, and MUST NOT repeat one. The check that reads it is §7.2's,
   and so is its grade.

A chain verifies from the documents alone. A verifier holding the charter
and every mandate in the chain checks each sub-mandate's signature against
the `holder.key` of the mandate above it, checks the topmost mandate's
signatures against the charter's `root_authority.keys` and threshold, and
checks the narrowing rule, the powers, the ceilings, and the dates at
every hop. None of that requires a registry. Revocation is the exception,
because it is an event after issuance rather than a property of the bytes:
a verifier who needs to know that no mandate in the chain has been revoked
asks the registry for that one fact.

**A mandate ceiling is not a budget.** A budget (Agent SoW §7.7) caps
what a piece of work may cost: it lives on the engagement, and the
agent's spend is metered against it as the work runs. A mandate ceiling
caps what a person may commit: it lives on the person's authority, spans
every engagement they approve, and is checked once, at approval time,
before the commitment exists. The two compose. The engagement's committed
price, budget included, is what the approval check reads against
`per_engagement`; after formation the mandate has done its work and the
budget governs the spend. Both are one idea applied to different
subjects: a budget is the owner bounding the agent, and a mandate is the
organization bounding the person.

## 7. The check at approval

This section is why the document exists. Agent SoW §6.1 defines
person-grade approval: the platform holds the act pending until the
account's human confirms with a credential that attests presence. For an
account named as the holder of a mandate, a conforming platform extends
that check:

1. The confirming person's account holds a mandate for the organization
   the engagement's party names.
2. The mandate is in force: started, unexpired, unrevoked, and its chain
   verifies up to the charter's root authority, each hop checked against
   the `holder.key` of the mandate above it (§6).
3. The act is within the mandate's powers: `form` for formation, `amend`
   for amendments, `terminate` for terminations, `award` for RFP awards,
   `nda` for acts on an Agent NDA (§7.2).
4. The engagement's committed price is within `per_engagement`, and the
   holder's month-to-date formed total stays within `per_month`.
5. The engagement's offerings fall within the mandate's scope.

If any check fails, the platform refuses with the failing check named.
Where formation completes on a platform that can hold it pending, all
five checks are `enforced`. Where it cannot, the mandate reference is
`evidence`: the counterparty holds the chain and can verify it, but
nothing refused the act.

The approval record then carries the mandate id beside the person
confirmation, and the counterparty's copy shows it. What the counterparty
learns improves in one specific way: today, person-approval proves a
verified human confirmed; under a mandate it proves a human confirmed **who
held current, sufficient, traceable authority to bind the organization**,
as far as the organization's own signed delegations are concerned. What a
court would say about the delegations themselves remains outside the
system (§3).

Agent SoW documents need one addition to use this: a party MAY carry
`"organization": "org_…"` beside its owner prose, and an approval record
MAY carry `"mandate": "mnd_…"`. Both fields sit inside signed bytes.

### 7.1 The check at a resource proxy

The check above runs where a platform can hold an act pending. One more
place can run it, and it is the first place the gradient reaches a system
outside this family: a client agent answering a provider's requests against
a resource it holds, under an Agent SoW grant made `via: "proxy"` (SoW
§5.3.1).

Such a proxy MAY extend the check to the acts it answers for. A read within
the grant is answered on the grant alone. A mutating act, a write, a send,
anything with consequences outside the conversation, is answered only when
the caller presents a mandate in force whose powers and scope cover the act,
checked exactly as §7 checks it: chain to the charter, unexpired, unrevoked,
the act within powers, the resource within scope. A refusal names the
failing check, like every refusal in this family.

Nothing new is defined here. The mandate, its chain, and its check are §6
and §7's; the proxy is simply a counterparty that chose to run it at the
resource boundary. Where it does, the mandate is `enforced` at that
boundary, because the act does not happen without it, and the vendor behind
the resource never needed to learn what a mandate is.

### 7.2 The check for an Agent NDA

The owners of its seats sign an Agent NDA (https://agentnda.net). A seat MAY
name the organization it signs for, in `organization` (Agent NDA §5.1).
Then a person signs the agreement in the organization's name, and this
section says how a counterparty knows that the person may.

When a seat carries `organization`, the signature record for that seat MUST
carry `mandate`, and that mandate MUST hold the `nda` power. A runtime
checks the signature against the mandate in four steps:

1. The signer holds the mandate. The signing account is the mandate's
   holder, the mandate is for the organization the seat names, and where
   the mandate carries `holder.key`, the signature verifies under that key.
   This is check 1 of §7.
2. The mandate was in force when the person signed: started, unexpired,
   unrevoked, and its chain verifies up to the charter's root authority,
   each hop checked against the `holder.key` of the mandate above it (§6).
   This is check 2 of §7.
3. The mandate holds `nda`. This is check 3 of §7.
4. Where the mandate carries `scope.nda_categories` (§6 rule 8), every
   category in the agreement's `covers.categories` appears in that list. An
   agreement whose `covers.categories` includes a category outside the list
   fails the check.

Checks 4 and 5 of §7 do not apply. An Agent NDA commits no price and names
no offering, so there is no ceiling to read and no offering to match. A
mandate's `ceiling` and `scope.offerings` place no limit on the `nda` power.

The check applies to every act the seat signs on the agreement: the offer
or the open offer, the countersignature or the acceptance, joining a
multilateral agreement, an amendment, a termination, and a withdrawal. Each
of those acts names the mandate it was signed under.

A seat with no `organization` is an individual acting for themself. It
needs no mandate.

The grade depends on where the act passes. Where a platform or a board
holds the act pending and refuses it when a check fails, the check is
`enforced` there. Elsewhere the mandate reference is `evidence`: the
counterparty holds the chain and can verify it, but nothing refused the
act. A board that releases the sealed body of a gated Agent RFP posting
(Agent RFP §5.11) SHOULD run this check on the recipient seat when that
seat names an organization, and release nothing when it fails. Where the
board runs it, the check is `enforced` at the board.

The signature record names the mandate inside the agreement's signed bytes,
and the counterparty's copy shows it. What it proves is what an approval
record proves under §7: the person who signed held current, sufficient,
traceable authority to sign for the organization, as far as the
organization's own signed delegations are concerned. What a court would say
about the delegations themselves remains outside the system (§3).

In the Harbor & Line example, Marisol Vega signs Harbor & Line's open offer
for its freight-audit posting under the mandate of §6, which holds `nda`:

```json
"parties": {
  "discloser": { "agent": "<public key>",
                 "handle": "Petrel.mari@harborandline.example",
                 "owner": "Harbor & Line Outfitters",
                 "organization": "org_7k2m9q4w1x8e5r3t" },
  "recipient": null,
  "grade": "evidence"
},
"signatures": [
  { "role": "discloser", "over": "offer", "key": "<holder public key>",
    "mandate": "mnd_3f8c1n6z9v4b7q2m",
    "signed_at": "2026-10-20T15:00:00Z", "sig": "<base64>" }
]
```

A mandate that lets its holder sign only agreements about solicitations and
their terms carries the list in its scope:

```json
"scope": { "nda_categories": ["solicitation", "agreement_terms", "relationship"] }
```

## 8. The treasury, in the abstract

Where a mandate names the organization as payer (§6), the balance it
draws on is the organization's **treasury**. This section defines the
treasury as far as delegation requires and no further: what it is, how
value leaves it, and what record a draw leaves behind. How value enters
it, what a credit is worth in any currency, and where it is held are the
settling platform's territory (§12).

1. **One balance, owned by the entity.** A treasury is a balance held by
   the organization itself, anchored to its charter id. It belongs to no
   person. Personnel changes do not touch it, exactly as they do not
   touch formed engagements.
2. **Draws happen only under mandate.** The only way an engagement
   settles from the treasury is an act approved under a mandate in
   force that names the organization as payer, within its ceilings. A
   platform MUST refuse any other draw through this specification's
   machinery. Grade: `enforced` where the platform settles.
3. **Every draw leaves a record.** A settlement from the treasury
   produces a draw record naming the engagement, the mandate, the
   holder, the amount, and the time. Draw records are enumerable by
   root authority, and the month-to-date sums for the `per_month` check
   (§7) are computed over them. The treasury's history is the sum of
   its draw records, so an audit of where the money went is a query,
   with every line already attributed to a person and their authority.

The records are the books. This specification defines no accounting
layer, because the draw records, the approval records, and the
settlement history already are the organization's books, with every
line signed and attributed. An income view or a cash view is a
presentation derived from those records, and producing one is a job for
tools that read them, not for this document. The standard tool for that
job is the bookkeeper, a role defined at https://agentroles.ai: it
reads the records under a read-only grant, answers four questions, and
holds no mandate.

## 9. Lifecycle

```
charter:  drafted → anchored (domain proof verified) → active
          → suspended (domain proof lost; restored when proof returns)
          → superseded (replaced at version N+1)

mandate:  issued → active (starts_at reached)
          → expired (expires_at passed)
          → revoked (signed act; cascades to sub-mandates)
          → superseded (replaced at version N+1)
```

An organization's membership, for any purpose that needs one (directory
pages, disclosure rules, reputation grouping), is the set of accounts
holding mandates in force. There is no separate membership list to
maintain or to drift.

## 10. Organizations elsewhere in the family

- **Agent SoW**: the party's `organization` field and the approval
  record's `mandate` field, per §7. An engagement formed under a mandate
  is the organization's engagement; personnel changes do not touch it,
  and revoking the former employee's mandate does not unwind contracts
  it validly formed. What was signed stays signed.
- **Agent RFP**: a posting MAY carry `organization`; awarding is spending
  and takes the `award` power.
- **Agent NDA**: a seat's `organization` and a signature's `mandate`, per
  §7.2. Every act on an agreement takes the `nda` power. A board releasing
  the sealed body of a gated Agent RFP posting SHOULD run the check of §7.2
  on the recipient seat when that seat names an organization.
- **Agent Reputations**: the bureau's anchor concept (its §1) admits
  domains, and its organization report (its §8.5) groups the records of an
  organization's agents: those that share the organization's anchor, and
  those whose accounts hold mandates in force under §9. The grouping
  survives personnel changes, anchor-level abuse detection covers the
  corporate case, and members of one organization cannot attest for each
  other. Each agent keeps its own record, and the organization report never
  replaces it or pools it into one score.

## 11. Security considerations

**Who holds the keys.** Root keys are check-signing power, not IT
credentials. In practice the person who runs the technical setup is the
administrator, and the setup SHOULD NOT end with that person holding root
keys. A conforming setup ends three ways: each root key in the hands of
an allocator, the day-to-day mandates issued, and the root keys put away,
unused until a mandate needs changing or a key rotates. The
administrator role exists so that maintenance never requires touching
authority.

**Stolen root keys.** Root authority is the whole prize. The mitigations
are the charter's `threshold` (two allocators to act, if the organization
says so), person-grade ceremonies on acts of root authority, and key
rotation by charter amendment. A rotation MUST NOT retroactively
invalidate mandates validly issued before it; revocation is the tool for
that, and it is explicit.

**Over-delegation.** A careless broad mandate is the corporate failure
mode, and no protocol prevents generosity. What the protocol does: the
narrowing rule stops widening below the first grant, expiry forces
renewal, and every mandate in force is enumerable by the organization's
root authority, so an audit is a query, not an investigation.

**The window between compromise and revocation.** A revoked mandate stops
future acts from the moment the act is recorded, and nothing here claims
faster. Acts completed inside the window stand, exactly as a forged
signature on paper stands until discovered; the approval records name the
mandate, so the blast radius of a compromise is computable afterward.

**Impersonating an organization.** The charter binds to the domain, and
renderers show the domain as the verified part. A charter claiming a
famous name on an unrelated domain shows exactly that.

**The recorded layer.** Everything legal is `recorded`, and the temptation
this specification resists is dressing it up. A counterparty who needs
certainty that a company legally exists has due diligence, not a
protocol; what the protocol gives them is that the organization's own
keys, on their own domain, signed the delegations its people act under.

## 12. Out of scope

- Org charts, titles, reporting lines, HR semantics. A title on a mandate
  is prose. The network needs to know who may bind the entity and within
  what limits, and nothing else about the pyramid. The two roles this
  document does define, allocator and administrator, are positions the
  standard itself requires, not the start of an org chart.
- SSO and enterprise identity integration. A holder is an account; how
  the person signs into it is the platform's concern.
- Legal-entity verification services. `legal` is recorded; a registry MAY
  note third-party attestations, under the same grade.
- Treasury mechanics. §8 defines the treasury in the abstract; how it
  is funded, held, or paid out, and what a credit is worth in any
  currency, is the settling platform's territory.
- Litigation and dispute resolution about the delegations themselves.

## 13. Signature tags

- `agent-charter-v1`: the charter document.
- `agent-mandate-v1`: the mandate document.
- `agent-mandate-resolve-v1`: acts on either: `revoke`, `suspend`,
  `restore`, with the action named inside the signed bytes so a relay
  cannot convert one act into another.

---

*0.1.0-draft (2026-08-06): first draft. The check at approval (§7) is the
load-bearing section; argue with it first.*

*0.1.0-draft, second pass (2026-08-06): the allocator and administrator
roles replace "officer"; introductions added to §5 and §6; the mandates
as the spending-authority ledger stated plainly; key custody guidance
added to the security considerations.*

*0.1.0-draft, third pass (2026-08-06): the settlement clause: a mandate
MAY name the organization as payer, so engagements approved under it
settle from the organization's balance, with the ceilings bounding each
holder's draw.*

*0.1.0-draft, fourth pass (2026-08-06): the treasury in the abstract
(§8): one balance owned by the entity, draws only under mandate, every
draw leaves an attributed record. Funding, custody, and value stay out
of scope.*

*0.1.0-draft, fifth pass (2026-08-06): the records are the books,
stated in §8. No accounting layer; statements are derived views.
§8 now references the bookkeeper, the standard role for reading the
books, defined at https://agentroles.ai.*

*0.2.0-draft (2026-08-07): three corrections, each found by building a
registry against the 0.1.0-draft text and each a place the document could
not be implemented as written.*

*§4, the hashed bytes. The identifier was derived from the canonical bytes
of a document that carries the identifier, so the derivation never
terminated. The bytes hashed for an identifier now exclude both `id` and
`signatures`, which is the only reading that terminates. The signed bytes
are unchanged and still exclude `signatures` alone.*

*§4, the encoding. The text said `base32` without naming an alphabet. RFC
4648's alphabet has no `0`, `1`, `8`, or `9`, and every identifier in the
worked example contains at least one of them, so the document contradicted
its own example. The encoding is now named: Crockford base32, lowercased,
unpadded, no check symbol, first 16 characters of the digest encoding.*

*§6, the holder key. A sub-mandate is signed by the holder of its issuer's
mandate, but the holder block named an account and a person and carried no
key, so nothing in the documents told a verifier which key to check. That
made §6's offline verifiability claim false. `holder.key` is added, and it
is REQUIRED on any mandate whose `sub_delegation.allowed` is true. §6 now
states how a chain verifies from the documents alone, and the second check
of §7 names the key each hop is checked against. No cross reference in §8
became wrong: a draw on the treasury is still an act approved under a
mandate in force, and the definition of in force is where the correction
landed.*

*The minor version moves rather than the draft revision, because all three
corrections change bytes rather than prose. An identifier derived under the
0.1.0-draft reading does not in general equal one derived under this
reading, and identifiers are carried by reference into other documents: a
party's `organization`, an approval record's `mandate`. A mandate that
permits sub-delegation and carries no holder key was well formed under the
old text and is not well formed under this one. The five earlier passes
added prose to a fixed document shape and left every existing document
valid; these do not, and a reader needs to be able to tell from the version
number which text they are holding. This follows Agent SoW 0.4.0-draft,
which moved its minor version for the same reason.*

*0.3.0-draft (2026-08-07): an identifier is minted once, and re-derivation is
not a conformance test. §4 says how an identifier is derived and did not say
when, so a reader holding a stored charter or mandate whose identifier does
not equal a fresh derivation had nothing in the text telling it whether the
document was still good. It is. An identifier is minted once, from the
version-1 document, and is not derived again; from then on it is a handle
other documents hold by value, and a verifier MUST NOT reject a document on
an identifier mismatch, nor a registry refuse to host one, suspend one, or
break a chain on that ground. Charters and mandates minted under the
0.1.0-draft reading keep the identifiers they were minted with. §4 also gains
the sentence it was missing, that the identifier is stable across
replacements.*

*What the check is good for is stated with it, because the honest answer is
narrower than the appealing one. On a version-1 document known to have been
minted under the current rule, a match detects accidental damage, and a
minting implementation SHOULD check its own output before the document is
signed and filed. Beyond that it establishes nothing. It says nothing about a
document at version 2 or higher, and a charter amendment may rotate the root
authority keys while the identifier stays put. A mismatch does not
distinguish an altered document from one minted under an earlier reading. It
is not a tamper check, because whoever alters a document can mint an
identifier over the altered bytes. And eighty bits of a truncated digest is
sized to be read and quoted, not to resist a search for a colliding document.
The commitment a reader can rely on is the signature, checked at each hop up
the chain to the charter's root authority keys.*

*The minor version moves rather than the draft revision. The case against is
that nothing here changes bytes: no document becomes invalid, no identifier
changes, and 0.2.0-draft told no one to re-derive anything. The case for is
that point 3 of §4, read alone, is a plausible licence to treat a failed
re-derivation as non-conformance, and here that reading would cut chains, so
a registry built against 0.2.0-draft and one built against this text can
disagree about whether an organization's delegations verify at all. That is
behaviour a counterparty sees, and the version number is what tells them
which text a deployment was built against. Agent SoW 0.8.0-draft and Agent
RFP 0.3.0-draft carry the same rule; Agent SoW additionally withdraws an
instruction in its 0.7.0-draft entry that told implementations to re-derive
stored identifiers.*

*0.4.0-draft (2026-09-01): the check at a resource proxy (§7.1). A client
agent answering a provider's requests under a proxy grant MAY require a
mandate in force for any mutating act, checked as §7 checks it, which makes
the mandate enforced at a resource boundary no vendor had to integrate
with.*

*0.4.1-draft (2026-10-18): editorial, with no normative change. The text names
no platform: Agent Messaging is no longer given a former name, and "the
mesh" reads "the network". The 0.4.0-draft entry above, missing from this
text, is restored. No requirement, field, example, or section number
changes.*

*0.4.2-draft (2026-10-18): editorial, with no normative change. The Agent
Reputations entry of §10 said an organization's evidence aggregates at the
entity, which Agent Reputations did not define until its 0.4.0-draft. It
names the organization report of Agent Reputations §8.5 that does it, and
says that each agent keeps its own record. No requirement, field, example, or
section number changes.*

*0.5.0-draft (2026-10-18): who may sign an Agent NDA for an organization. A
new power, `nda`, covers every act on an Agent NDA for the organization:
signing an offer or an open offer, countersigning or accepting, joining a
multilateral agreement, amending, terminating, and withdrawing. A new
section, §7.2, states the check. When a seat carries `organization`, its
signature record carries `mandate`, and that mandate holds `nda`. Checks 1
to 3 of §7 apply. Checks 4 and 5 do not, because an Agent NDA commits no
price and names no offering. A mandate MAY carry `scope.nda_categories` (§6
rule 8), a list of Agent NDA §5.4 categories that narrows the power, and §6
rule 3 says how a sub-mandate narrows it. The check is `enforced` where a
platform or a board holds the act pending and refuses on failure, and
`evidence` elsewhere. A board releasing a gated Agent RFP body SHOULD run it
on the recipient seat. A seat with no `organization` needs no mandate. §4,
§7 check 3 and §10 name the new pieces, and the example mandate of §6 holds
`nda`.*

*The minor version moves because the change adds a power and a field. A
registry built against 0.4.2-draft does not know `nda` or
`scope.nda_categories`, and a reader needs the version number to tell which
text a deployment was built against.*
