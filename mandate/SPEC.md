# Agent Mandate Specification

**Version:** 0.1.0-draft
**Status:** Working Draft
**Date:** 2026-08-06

A **mandate** is authority, delegated in writing: a principal states who may
act on its behalf, for what, up to what limit, until when. An **Agent
Mandate** is that document for organizations whose software agents do the
work. It gives the organization itself a verifiable identity on the mesh,
and it gives the people who act for the organization signed, bounded,
revocable authority to do so.

This specification is the corporate companion to the
[Agent SoW](https://agentsow.com) and [Agent RFP](https://agentrfp.net)
specifications. Those define how work is offered, asked for, and bound;
this one defines who is entitled to bind an organization, and how a
counterparty checks. It is transport-neutral, developed alongside the
AgentMesh protocol; nothing here requires a particular network or vendor.

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
- **Holder**: the account (and its person) a mandate authorizes.
- **Chain**: a mandate plus the mandates above it, up to root authority.
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
removed.

Identifiers:

```
org_<base32(sha256(canonical bytes of charter version 1, minus signatures))[0..16]>
mnd_<base32(sha256(canonical bytes of mandate version 1, minus signatures))[0..16]>
```

Charters and mandates are amended by full replacement at version N+1,
signed fresh, never by delta. A registry MUST retain prior versions.

## 5. The charter

A charter exists to make the organization a principal a machine can
check. It is written once, when the organization first comes to the mesh:
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
    "person": "mari@harborandline.example"
  },
  "powers": ["form", "amend", "terminate", "award"],
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
   `sub_delegation.allowed` is true. Grade: `evidence`; the signatures are
   the record.
2. **Narrowing.** A sub-mandate MUST be at most as broad as its issuer's
   mandate in every dimension: powers a subset, ceilings no higher, scope
   no wider, expiry no later, depth within `max_depth`. A registry MUST
   refuse a sub-mandate that widens anything. Authority narrows going
   down; it never widens. Grade: `enforced` at the registry.
3. **Powers.** `form` covers countersigning an engagement into existence;
   `amend` covers approving amendments; `terminate` covers ending
   engagements; `award` covers awarding an RFP posting (which leads to
   `form`); `issue` is implied by `sub_delegation.allowed`. A power not
   listed is not held.
4. **Ceilings.** Amounts use the engagement's price vocabulary (Agent SoW
   §5.5). `per_engagement` bounds a single document's committed price;
   `per_month` bounds the holder's total formed commitments per calendar
   month. Both checks run at approval time.
5. **Settlement.** `settlement.payer` names whose balance pays for
   engagements approved under the mandate: `holder` (the default when the
   field is absent) or `organization`. When it is `organization`, acts
   approved under the mandate settle from the organization's balance on
   the settling platform, and the ceilings bound the holder's draw on it:
   one treasury, many bounded drawers, instead of a balance topped up per
   employee. A sub-mandate MAY name the organization as payer only if its
   issuer's mandate does: a draw on the treasury cannot be granted by
   someone who does not hold it. How a balance is funded is outside this
   specification (§11). Grade: `enforced` where the platform settles the
   engagement; `evidence` elsewhere.
6. **Term and revocation.** A mandate has no force before `starts_at` or
   after `expires_at`. The issuer, or root authority at any time, revokes
   by a signed act (tag `agent-mandate-resolve-v1`, action named inside
   the signed bytes). Revoking a mandate revokes every mandate issued
   under it: a chain dies with its root. Grade: `enforced` at the
   registry from the moment the act is recorded.

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
   verifies up to the charter's root authority.
3. The act is within the mandate's powers: `form` for formation, `amend`
   for amendments, `terminate` for terminations, `award` for RFP awards.
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

## 8. Lifecycle

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

## 9. Organizations elsewhere in the family

- **Agent SoW**: the party's `organization` field and the approval
  record's `mandate` field, per §7. An engagement formed under a mandate
  is the organization's engagement; personnel changes do not touch it,
  and revoking the former employee's mandate does not unwind contracts
  it validly formed. What was signed stays signed.
- **Agent RFP**: a posting MAY carry `organization`; awarding is spending
  and takes the `award` power.
- **Agent Reputations**: the bureau's anchor concept (its §1) already
  admits domains. An organization's agents share its anchor, so evidence
  aggregates at the entity, survives personnel changes, and anchor-level
  abuse detection covers the corporate case with no new machinery.

## 10. Security considerations

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

## 11. Out of scope

- Org charts, titles, reporting lines, HR semantics. A title on a mandate
  is prose. The mesh needs to know who may bind the entity and within
  what limits, and nothing else about the pyramid. The two roles this
  document does define, allocator and administrator, are positions the
  standard itself requires, not the start of an org chart.
- SSO and enterprise identity integration. A holder is an account; how
  the person signs into it is the platform's concern.
- Legal-entity verification services. `legal` is recorded; a registry MAY
  note third-party attestations, under the same grade.
- Treasury mechanics. `settlement.payer` names whose balance pays;
  how an organization's balance is funded, held, or paid out, and what a
  credit is worth in any currency, is the settling platform's territory.
- Litigation and dispute resolution about the delegations themselves.

## 12. Signature tags

- `agent-charter-v1` — the charter document.
- `agent-mandate-v1` — the mandate document.
- `agent-mandate-resolve-v1` — acts on either: `revoke`, `suspend`,
  `restore`, with the action named inside the signed bytes so a relay
  cannot convert one act into another.

---

*0.1.0-draft (2026-08-06): first draft. The check at approval (§7) is the
load-bearing section; argue with it first.*

*0.1.0-draft, second pass (2026-08-06): the allocator and administrator
roles replace "officer"; introductions added to §5 and §6; the mandates
as the spending-authority ledger stated plainly; key custody guidance
added to §10.*

*0.1.0-draft, third pass (2026-08-06): the settlement clause: a mandate
MAY name the organization as payer, so engagements approved under it
settle from the organization's balance, with the ceilings bounding each
holder's draw.*
