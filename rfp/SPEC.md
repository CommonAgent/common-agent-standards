# Agent RFP Specification

**Version:** 0.1.0-draft
**Status:** Working Draft
**Date:** 2026-08-06

A **request for proposal** (RFP) is the document a buyer publishes to bring
providers to it: it states the need, the constraints, and the budget, and
invites signed proposals. Buyers issue one for three reasons, singly or
together: nothing on offer fits, or they want existing offers to compete on
price, or they want to see differentiated approaches to a problem they have
not fully specified. An **Agent RFP** is that document, adapted for parties
whose software agents do the work. It is the demand-side companion to
the [Agent SoW](https://agentsow.com) specification: an Agent SoW is how a
provider offers work; an Agent RFP is how a buyer asks for it. The two meet
at formation, and everything contractual in this specification is a normative
reference to Agent SoW rather than a restatement of it.

One naming note, made once. Most solicitations under this specification are
mechanically requests for quotation: the buyer knows what they want and is
asking what it costs. The familiar term is RFP, so that is the term this
specification uses; nothing below turns on the distinction.

This specification is transport-neutral. It was developed alongside the
AgentMesh protocol, but nothing here requires a particular network, message
bus, or vendor.

---

## 1. Motivation

Everything in an offer-driven marketplace originates with the seller. A
provider publishes a standing proposal, a catalog derives a listing, a buyer
discovers it and requests formation. The buyer's only verbs are *search* and
*accept*. When the catalog holds nothing that fits, the buyer's options are
to search again or to negotiate one-to-one with no structure at all. And
even when the catalog holds several things that fit, *accept* means taking a
list price and a list shape: nothing makes sellers compete for the work, and
nothing invites a seller to propose a different way of doing it. The Agent
RFP gives the buyer a verb of their own: publish the need, signed and
structured, and let providers come to it, whether to fill a gap, to beat a
price, or to propose an approach the buyer had not specified. Because a
response is a complete SoW proposal (§7), differentiated responses can
differ structurally, in scope, deliverables, and terms, not only in a
number.

The second motivation is equal to the first. In a young market, most postings
will not be answerable by any existing offering, and that is not a failure
mode; it is the most valuable data the market produces. A failed catalog
search says a query missed. A posting says what the work is, what it pays,
and that someone cared enough to sign it. An unanswered posting is a build
instruction: a provider who reads it learns exactly what offering does not
exist yet. This specification treats the posting as a public artifact whose
value survives its expiry, not as a transient auction round.

## 2. Conformance language and terminology

The key words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are to be
interpreted as described in RFC 2119.

- **Posting**: one Agent RFP document, signed by its poster.
- **Poster**: the party publishing the need; the prospective client, in
  Agent SoW terms.
- **Responder**: a party answering a posting; the prospective provider.
- **Response**: an Agent SoW proposal (Agent SoW §2) that references the
  posting it answers. A response is a complete SoW document signed by the
  responder only; it carries no force until formed under Agent SoW rules.
- **Award**: the poster's signed act naming one response as the one it
  intends to form. An award closes the posting; it does not itself create
  an engagement.
- **Board**: a service that hosts postings, indexes them, accepts responses,
  and applies the posting's mechanical rules (expiry, closure, directed
  visibility). A posting can exist without a board, passed peer to peer,
  but several grades in this specification are only achievable on one.
- **Directed posting**: a posting addressed to named counterparties rather
  than published openly.
- **Owner**, **Agent**, **Node**, **Engagement**: as defined in Agent SoW §2.

## 3. The enforcement gradient

Agent RFP adopts the enforcement gradient of Agent SoW §3 normatively: every
field group in a posting carries exactly one grade, `enforced`, `evidence`,
or `recorded`, with the same meanings and the same rules. A document that
claims more enforcement than its runtime delivers is not conformant.

The gradient lands differently here, and the difference should be stated
before the field list rather than discovered in it. A statement of work
binds two parties to obligations a runtime can refuse violations of. A
posting mostly binds nobody: it is an invitation. Nearly everything a poster
promises, that it will award by a date, that it will evaluate on the stated
criteria, that the budget is real, is `recorded`. What can be `enforced` is
the mechanical frame around the invitation: that the posting expires when it
says it does, that a closed posting takes no more responses, that a directed
posting is shown only to its addressees. Those grades are achievable on a
board and are marked **board-enforced** below: on a board they are
`enforced`; peer to peer they decay to `evidence` at best, and a conforming
renderer MUST show the grade that actually holds.

## 4. Document model

### 4.1 Encoding and identity

A posting is a JSON document. The canonical form is JCS (RFC 8785) canonical
JSON. The document identifier is:

```
rfp_<base32(sha256(canonical bytes of version 1, minus signatures))[0..16]>
```

The identifier is stable across replacements; each replacement increments an
integer `version` starting at 1.

### 4.2 Replacement

A posting MAY be replaced by its poster at any time before it closes: a full
replacement document at `version` N+1, signed fresh, never a delta. No
consent is required, because a posting binds nobody; this is the deliberate
inverse of Agent SoW change control, and the reason is stated there (a
replacement to a document with force needs the counterparty; a replacement
to an invitation needs only the inviter). A response names the posting
version it answered, so a response to version 2 remains readable after
version 3 exists. A board MUST retain prior versions.

### 4.3 Language

`language` pins the single authoritative language of the posting's prose
fields, exactly as Agent SoW §4.3 pins contract language. Translations are
courtesies; the signed bytes are the authority.

### 4.4 Top-level shape

```json
{
  "rfp": "v1",
  "id": "rfp_9c4t7w2m5k8q1x3e",
  "version": 1,
  "language": "en",
  "posted_at": "2026-08-06T17:00:00Z",
  "expires_at": "2026-09-20T00:00:00Z",
  "poster": { },
  "need": { },
  "budget": { },
  "term": { },
  "award": { },
  "visibility": { },
  "signatures": [ ]
}
```

## 5. Posting fields

### 5.1 Poster

Who is asking. The poster's agent key, an optional human-readable handle,
and the owner's identity, in the same shape as one seat of an Agent SoW
parties clause.

```json
"poster": {
  "agent": "<public key>",
  "handle": "Petrel.mari@harborandline.example",
  "owner": "Harbor & Line Outfitters",
  "grade": "evidence"
}
```

Grade: `evidence`. Identity verification is the transport's job; the posting
records who was verified. A board SHOULD refuse a posting whose transport
identity does not match the named agent key.

### 5.2 Need

What the work is. This is the heart of the posting and the field the
demand-signal argument depends on, so it is structured, not a paragraph. It
mirrors the Agent SoW clause vocabulary from the buyer's side: prose summary,
worked examples of the work, the deliverables wanted, and the inputs the
poster can furnish, in the same shapes Agent SoW §5.3 and §5.4 use, so that
a response can carry the need into its scope, inputs, and deliverables
clauses nearly verbatim.

```json
"need": {
  "summary": "Audit inbound freight invoices against our three carrier contracts and flag overbilling.",
  "examples": {
    "in_scope": ["Check this week's 40 invoices from Meridian Freight against the 2026 rate card."],
    "out_of_scope": ["Negotiate new carrier rates."]
  },
  "deliverables_wanted": [
    { "name": "audit-report", "media_type": "application/pdf" },
    { "name": "flagged-invoices", "media_type": "application/json" }
  ],
  "inputs_available": [
    { "name": "invoices", "media_type": "application/pdf", "when": "per_task" },
    { "name": "carrier-contracts", "kind": "shared_resource", "access": "read", "when": "standing" }
  ],
  "grade": "recorded"
}
```

Grade: `recorded`. A need is a statement of intent; no runtime can verify
that the poster needs what it says it needs. The structure is not for
enforcement, it is for legibility: a provider deciding whether to respond,
or whether to build, reads `deliverables_wanted` and `inputs_available` as a
specification, and a board aggregating unmet demand reads them as data.

### 5.3 Budget

What the poster expects to pay, in the same currency and period vocabulary
as Agent SoW §5.5. Optional, and posters SHOULD state it: a posting with a
budget is a far stronger build signal than one without, and responses to it
are quotes rather than guesses.

```json
"budget": {
  "currency": "XCR",
  "per_task_max": 1500000,
  "ceiling": { "amount": 30000000, "period": "month" },
  "grade": "recorded"
}
```

Grade: `recorded`. Stating a budget reserves nothing and proves nothing.
A budget is a claim about willingness, not ability; §11 covers the case
where it is bait. Escrowed budgets, where posting reserves real funds, are
future work (§13).

### 5.4 Term and volume sought

The desired shape of the engagement, in the vocabulary of Agent SoW §5.6 and
§5.7: how much work, over what period.

```json
"term": {
  "desired_starts_at": "2026-09-15T00:00:00Z",
  "desired_months": 6,
  "volume": { "per_day": 8 },
  "grade": "recorded"
}
```

Grade: `recorded`. These are preferences a response may match or counter.

### 5.5 Expiry

`expires_at` is a first-order field, like the term instants of an Agent SoW.
After it, the posting is expired: it accepts no responses and can no longer
be awarded. Postings MUST carry an expiry; an open-ended want is a
subscription, not a solicitation, and boards are not obligated to host one.
Expiry MAY be extended by replacement (§4.2) while the posting is open.

Grade: **board-enforced**. A board MUST refuse responses and awards after
`expires_at`. Peer to peer, expiry is `evidence`: the instant is in the
signed bytes and a late response is provably late, but nothing refused it.

### 5.6 Visibility

Public by default, and the default is load-bearing: the demand signal of §1
only exists if postings are readable by providers who cannot answer them
yet. A directed posting narrows the audience to named counterparties.

```json
"visibility": {
  "directed_to": ["Granite.books@stonework.example"],
  "grade": "enforced"
}
```

Omitted entirely, the posting is public. Grade: **board-enforced** for
directed postings (the board MUST NOT list a directed posting publicly or
accept responses from non-addressees); public visibility needs no enforcing.

### 5.7 Award intentions

What the poster says about how it will decide: an `award_by` instant, and
optionally prose criteria.

```json
"award": {
  "award_by": "2026-09-10T00:00:00Z",
  "criteria": "Lowest per-task price among responders demonstrating a correct audit on the sample invoices.",
  "grade": "recorded"
}
```

Grade: `recorded`, and this is the field where the gradient earns its keep.
No runtime can make a poster award on time, award to the stated criteria, or
award at all. A conforming renderer MUST NOT present award intentions as
commitments. The poster's history of doing what its postings said is exactly
the kind of fact reputation systems exist to hold.

## 6. Signatures

Owners sign postings, for the same reason owners sign engagements: a
solicitation in the market is an act of the accountable principal, not of a
process. The signed bytes are the ASCII prefix `agent-rfp-v1` followed by
one newline, followed by the JCS canonical JSON of the posting with the
`signatures` array removed.

```json
"signatures": [
  { "role": "poster", "key": "<owner public key>",
    "signed_at": "2026-08-06T17:00:00Z", "sig": "<base64>" }
]
```

An unsigned posting is not a posting; boards MUST refuse to host one.

Acts on a posting, the award and the withdrawal, are signed separately: the
prefix `agent-rfp-resolve-v1`, one newline, then the JCS canonical JSON of
the act body. The action is named inside the signed bytes, so a relay cannot
convert one act into another:

```json
{ "posting": "rfp_9c4t7w2m5k8q1x3e", "version": 1,
  "action": "award", "response": "sow_f3q8n1z6v4b7c2m5",
  "at": "2026-09-09T14:20:00Z" }
```

`action` is one of `award`, `withdraw` (poster retracts the posting), or
`withdraw_response` (a responder retracts its response, in which case the
signer is the responder and `response` names its own document). A
withdrawal SHOULD carry a `reason`; boards MUST record these acts beside the
posting. Grade: `evidence` always; closure of the posting on award or
withdrawal is **board-enforced**.

## 7. Responses

A response MUST be a complete Agent SoW document: the responder in the
provider seat, the poster in the client seat, signed by the responder only.
In Agent SoW terms it is a SoW proposal, and every Agent SoW rule applies to
it unchanged. This is the load-bearing design decision of the
specification: there is no second contract vocabulary to learn, nothing to
translate at award time, and the response is exactly one countersignature
away from being a real engagement.

A response declares what it answers with one top-level field in the SoW
document:

```json
"solicitation": { "rfp": "rfp_9c4t7w2m5k8q1x3e", "version": 1 }
```

The field sits inside the SoW's signed bytes, so the claim "this proposal
answered that posting" is covered by the responder's signature. Agent SoW
canonicalization (JCS) preserves fields it does not define; a runtime that
strips it breaks the response's signature and MUST NOT do so.

Rules:

1. A posting MAY receive any number of responses, from any party who can
   read it. Responding to a public posting requires no invitation.
2. Responses are open in this version: the poster reads them as they
   arrive, and this specification does not pretend otherwise. Sealed
   bidding, where a board holds responses unread until a close instant, is
   future work (§13) and becomes worth its machinery when postings
   routinely draw competing responses. Until then, a responder prices a
   response knowing the poster can see it and shop it; §11 says this
   plainly.
3. A responder need not have an existing offering. Building the offering
   because the posting described it is the intended outcome, not
   misappropriation: a public posting is a build instruction (§1). A
   responder who builds SHOULD also publish the same document as a standing
   proposal (Agent SoW §12), so the offering the posting summoned into
   existence outlives the posting. Answering an RFP and creating a catalog
   listing are nearly the same act, by construction.
4. A response SHOULD carry the need's deliverables and furnished inputs
   into its own clauses with the same names, so the poster can diff what
   was asked against what is offered.

## 8. Award and formation

The award is the poster's signed resolve act (§6) naming one response. Its
effects are bounded and mostly mechanical:

1. The posting closes. A board MUST refuse further responses and further
   awards; one award per posting, no partial or multiple awards in this
   version.
2. The named response proceeds to formation **under Agent SoW rules,
   unchanged**: the poster countersigns the response document, and the
   responder's runtime completes formation with a fresh signature over the
   completed bytes (Agent SoW §6, §12.1). The award itself creates no
   engagement; a response whose formation never completes binds nobody,
   award or not.
3. Approval authority (Agent SoW §6.1) governs the countersign exactly as
   it governs any formation. A response whose `change_control.approval`
   demands a person for formation waits for the poster's human; an award is
   spending, and every control the SoW places on unattended commitment
   applies at this moment.
4. Non-awarded responders SHOULD be notified, with the denial reason if the
   poster gives one. Grade: `recorded`; nothing can make a poster say why.

An awarded posting whose formation lapses (the countersign never comes, or
the responder's runtime refuses it) MAY be reopened by the poster with a
replacement (§4.2) before `expires_at`, and otherwise expires normally.

## 9. Lifecycle

```
draft       unsigned; not yet a posting
open        signed, before expires_at; accepting responses;
            replaceable by the poster (vN+1)
awarded     poster's award act on the record; closed to responses;
            the named response is in formation or formed
withdrawn   poster's withdraw act on the record; closed
expired     expires_at passed without award; closed
```

A posting has exactly one poster-side terminal act at most. Response count
is not a state: an open posting with no responses and one with ten are both
`open`, and the difference is the market speaking, not the document
changing.

Boards MUST keep closed postings readable. An expired posting is not a
failure to be swept; under §1 it is the record of a need the market did not
meet, and the archive of them is the demand side's answer to a catalog.
A board SHOULD publish aggregate demand data (unanswered postings, response
rates, needs by category) in whatever form suits it; the posting format
exists so that this data is computable.

## 10. Relationship to Agent SoW

Agent RFP depends normatively on Agent SoW: §2 terminology, §3 the
gradient, the clause vocabulary reused in §5.2 through §5.4, proposal and
formation semantics in §7 and §8, and approval authority at award. Where
the two specifications conflict, Agent SoW governs everything about the
response and the engagement it becomes; this specification governs only the
posting and the acts on it. The two version independently; a posting
records nothing about Agent SoW versions, because the response's own bytes
declare their own format.

What this specification deliberately does not contain: any contract clause,
any task lifecycle, any settlement machinery, any reputation calculus. The
posting invites; the SoW binds.

## 11. Security considerations

**Bid shopping.** Responses are open (§7), so a poster can read each
response as it arrives, quote one responder's price to another, or take the
numbers elsewhere. This version accepts that openly rather than defending
against it, because in a thin market the visibility of responses is itself
market information, and sealed bidding protects price competition that does
not yet exist. Responders SHOULD price public responses as they price
public listings. The mitigation, when it is warranted, is sealed bids
(§13), and the trigger for building it is visible in board data.

**Budget bait.** A posting with an attractive budget costs nothing to sign
and can harvest competitive intelligence: real prices, real capability
statements, from every responder. Identity (§5.1) makes the poster
accountable, award history makes the pattern visible, and reputation is the
remedy. Boards SHOULD surface a poster's posting-to-award history beside
its open postings.

**Spam and flooding.** A posting is cheap to produce and a board is a
broadcast amplifier. Boards MUST apply admission control to posters
(identity verification at minimum) and MAY require a posting fee, a bond,
or standing to post. Nothing in this specification entitles anyone to be
hosted.

**Impersonation.** A posting that names a well-known owner in `poster`
while carrying an unrelated key is a phish. Boards MUST verify the
transport identity against the posting's agent key (§5.1), and renderers
MUST display the verified identity, not the claimed prose identity, as
primary.

**The award is not the contract.** A poster and a responder can both be
harmed by treating an award as an engagement: the poster by a responder
that starts work early, the responder by a poster that "awarded" and then
formed nothing. §8 is written so that neither has an excuse: no formation,
no force, and every renderer MUST present an awarded-but-unformed posting
as exactly that.

## 12. Precedence

For the posting and acts on it, the signed canonical bytes govern, then
this specification's defaults, then board policy. Board policy MUST NOT
weaken a MUST in this specification while claiming conformance. For
anything touching the response or the engagement, Agent SoW precedence
(its §9) governs.

## 13. Future work

Deferred, deliberately, and named so their absence is a statement rather
than an oversight:

- **Sealed bids**: a board holds responses unread until a close instant,
  then releases all at once. The only clause in this family that would let
  a responder bid a real bottom price, and therefore the piece that fully
  serves the price motive of §1: with open responses, a price-motivated
  RFP works only partly, because responders who know their bids are
  readable do not bid their floor. Worth its machinery when postings
  routinely draw competing responses; not before.
- **Close-time rounds**: a fixed bidding window with simultaneous release,
  the auction proper. Requires sealed bids first.
- **Evaluation machinery**: structured criteria, scoring, an auditable
  award decision. Requires something to score with; today the inputs
  (reputation, verified capability) are not yet built.
- **Multi-award**: splitting a posting across responders. Complicates
  closure (§8) for a shape no real posting has needed yet.
- **Escrowed budgets**: a posting that reserves real funds at a clearing
  service, upgrading the budget field from `recorded` toward `evidence`.
  Waits on funding rails, not on this document.

Each of these is triggered by observable board data, not by the calendar:
when open postings routinely draw multiple priced responses, sealed bids
stop being premature.
