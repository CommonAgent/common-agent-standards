# Agent RFP Specification

**Version:** 0.4.0-draft
**Status:** Working Draft
**Date:** 2026-08-08

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
- **Response**: a directed standing proposal (Agent SoW §12.1.1) that names
  the poster as the party entitled to countersign it and references the
  posting it answers. A response is a complete SoW document signed by the
  responder only, with the client seat blank as a standing proposal's is;
  the poster enters that seat at formation, not at response, and the
  response carries no force until formed under Agent SoW rules.
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
rfp_<crockford32(sha256(canonical bytes of version 1, minus id and signatures))[0..16]>
```

1. **The hashed bytes exclude `id` and `signatures`.** An implementation
   MUST remove both members from the version-1 document, canonicalize what
   remains under JCS, and hash that. `id` is excluded because the document
   carries the identifier derived from it: bytes that contain `id` cannot be
   assembled until the identifier is known, and the derivation would not
   terminate. `signatures` is excluded because the signatures are made over
   a document the identifier already names. The two exclusions are not the
   same as the signed bytes of §6, which remove `signatures` only. The
   signed bytes include `id`, because the identifier is derived before the
   posting is signed. Two byte strings are therefore in play, and they are
   not interchangeable: an implementation that hashes the signed bytes
   derives the wrong identifier, and an implementation that signs the hashed
   bytes produces a signature no verifier will accept.
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

The identifier is stable across replacements; each replacement increments an
integer `version` starting at 1.

#### 4.1.1 Minting and re-derivation

An identifier is minted once. The implementation that creates the version-1
posting derives the identifier there, writes it into `id`, and does not derive
it again. From that moment the identifier is a handle, and other documents
hold it by value: a response's `solicitation.rfp` (§7) sits inside the
responder's signed bytes, an award or a withdrawal names `posting` inside the
signer's (§6), and a board's index and its retained prior versions are keyed
on it. Replacing a posting at version N+1 under §4.2 leaves the identifier
alone, which is what stability across replacements means above.

An implementation MUST derive an identifier once, when it mints the version-1
posting. Storing, replacing, indexing, rendering, or verifying a posting MUST
NOT re-derive its identifier.

A verifier MUST NOT reject a posting because its identifier does not equal
what §4.1 would derive from that posting's version-1 bytes, and a board MUST
NOT refuse to host one on that ground. The derivation rule binds the
implementation that mints an identifier. It does not bind the reader of a
posting minted earlier, possibly under an earlier revision of this
specification. Point 3 of §4.1 is a test a minting implementation applies to
the postings it mints, and it is not a test a reader applies to the postings
it receives.

Postings minted before this revision carry identifiers derived under a
superseded reading of §4.1. Those identifiers remain valid and remain the
names of their postings. That is the reason re-derivation is not a
conformance test. A specification that made it one would invalidate every
identifier minted under its own earlier text, and here most of the damage
would land outside the party doing the re-deriving: a response's claim to
have answered a posting is covered by the responder's signature, and the
poster cannot re-sign it.

There is a check a reader may legitimately want, and it is narrower than it
looks. Where a reader holds a version-1 posting and knows it was minted under
§4.1 as this revision states it, re-deriving the identifier and comparing
detects accidental damage: a truncated file, a re-encoded string, a record
stored against the wrong posting. Implementations MAY run that check as a
diagnostic. A minting implementation SHOULD run it on its own output before
the posting is signed and published, which is the last moment a wrong
identifier is cheap to fix; afterwards it is inside bytes other parties hold
and signed.

Four things the check does not establish, listed because an implementation
that has it working may be tempted to rely on it for more:

1. It says nothing about a posting at version 2 or higher. The identifier
   commits to the version-1 bytes, and a replacement under §4.2 may change
   the need, the budget, and the expiry while the identifier stays put. A
   response names the posting version it answered for exactly this reason.
2. A mismatch does not establish that a posting was altered. The reader
   cannot tell an altered posting from one minted correctly under an earlier
   reading of §4.1.
3. It is not a tamper check. A party that alters a posting can mint a fresh
   identifier over the altered bytes, so the check finds accidents and not
   adversaries.
4. Eighty bits of a truncated digest is sized to be read, typed, and quoted
   inside another document. It is not sized to resist a search for a
   colliding document.

The content commitment a reader can rely on is the signature of §6. It covers
the whole canonical posting, including `id`, at the version being read. An
identifier that does not re-derive is not evidence of anything. A signature
that does not verify is.

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
`signatures` array removed. The signed bytes include `id`, because the
identifier is derived before the posting is signed. They are not the bytes
hashed for the identifier, which remove `id` as well (§4.1).

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
provider seat, the client seat blank, the poster named as the party
entitled to countersign it, and the whole signed by the responder only. In
Agent SoW terms it is a directed standing proposal (Agent SoW §12.1.1), and
every Agent SoW rule applies to it unchanged. This is the load-bearing
design decision of the specification: there is no second contract
vocabulary to learn, nothing to translate at award time, a response is the
same kind of document a provider publishes to its catalog with one party
named instead of none, and the response is exactly one countersignature
away from being a real engagement.

The poster is named in `parties.offered_to`, not in the client seat, and
the difference between those two places is the whole of the construction.
Naming the poster makes the response an offer to the poster and to nobody
else. Leaving the client seat blank keeps formation what Agent SoW says it
is: a two-step gate, where the poster's countersign is a request to form
and the responder's runtime completes formation with a fresh signature over
the completed bytes. A response is directed and unformed at the same time,
which is exactly what a bid is.

A response therefore carries two fields the posting is named in, and they
do different work:

```json
"parties": {
  "provider": { "agent": "<responder key>",
                "handle": "Granite.books@stonework.example",
                "owner": "Stonework Analytics" },
  "client": null,
  "offered_to": { "agent": "<poster key>",
                  "handle": "Petrel.mari@harborandline.example",
                  "owner": "Harbor & Line Outfitters",
                  "grade": "enforced" },
  "grade": "evidence"
},
"solicitation": { "rfp": "rfp_9c4t7w2m5k8q1x3e", "version": 1 }
```

`offered_to` says who may countersign. `solicitation` says what the
proposal answers, and it names the posting version, so a response to
version 2 stays readable after version 3 exists (§4.2). A response MUST
carry both. `offered_to.agent` MUST equal the posting's `poster.agent`
(§5.1), and a board MUST refuse a response where it does not: a document
offered to somebody other than the poster is not an answer to this posting,
whatever its solicitation reference claims. Grade: **board-enforced**; peer
to peer the mismatch is `evidence`, visible in two signed documents and
refused by nothing.

Both fields sit inside the SoW's signed bytes, so the claim "this proposal
answered that posting, and it is for that poster" is covered by the
responder's signature. Agent SoW canonicalization (JCS) preserves fields it
does not define; a runtime that strips `solicitation` breaks the response's
signature and MUST NOT do so.

A directed posting (§5.6) and a directed response are different
restrictions on different documents, and a reader should not carry one over
to the other. `visibility.directed_to` narrows who may read a posting.
`parties.offered_to` narrows who may countersign a response.

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
   misappropriation: a public posting is a build instruction (§1). What
   responding does not do is publish the offering. A response is directed
   at the poster, so it yields no public listing and it lapses with the
   posting (Agent SoW §12.1.1). A responder who builds SHOULD also publish
   an open standing proposal for the offering, so that the offering a
   posting summoned into existence outlives the posting, and SHOULD derive
   the response from that document so the two carry the same clauses;
   Agent SoW `derived_from` records the provenance. Answering an RFP and
   creating a catalog listing are two acts from one set of clauses.
4. A response is an offer to the poster. Only the poster may countersign
   it, and a runtime completing formation MUST refuse a countersign whose
   client seat names any other party (Agent SoW §12.1.1). A responder MAY
   therefore quote this poster a price below its list price: the bid is a
   bid, not a listing, and it does not become a price the market can take.
   A renderer MUST NOT present a response as an open offer.
5. A response lapses when the posting closes. The `solicitation` reference
   is the named occasion Agent SoW §12.1.1 requires a directed proposal to
   be bounded by, so a response needs no expiry of its own; it MAY carry an
   `offered_to.expires_at`, which lapses it earlier and never later.
   Concretely, the posting closes at its own `expires_at`, on the poster's
   withdrawal of the posting, or on an award to a different response. The
   awarded response does not lapse at award: it proceeds to formation
   under §8, and if that formation never completes it lapses with the
   posting. A responder MAY end its own response earlier with the
   `withdraw_response` act of §6, which is the provider withdrawal of
   Agent SoW §12.1.1 under this specification's name for it. After lapse a
   board MUST refuse a countersign, and a renderer MUST NOT present a
   lapsed response as open. Grade: **board-enforced**; peer to peer the
   instants are in signed bytes and a late countersign is provably late,
   but nothing refuses it.
6. A response SHOULD carry the need's deliverables and furnished inputs
   into its own clauses with the same names, so the poster can diff what
   was asked against what is offered.
7. A response MAY carry the responder's reputation: a top-level
   `reputation` field holding a bureau's signed report (Agent Reputations,
   https://agentreputations.com) for the offering's capability. The report
   is advisory context for the poster, never a gate, and it goes stale the
   moment it is issued, so anything that displays responses to a poster
   SHOULD fetch a fresh report per responder rather than trusting the
   carried one, MUST show the enrollment state as it is (UNPROVEN and
   UNENROLLED are answers, not blanks), and MUST show the sample size
   beside any score. A responder with no reputation loses nothing
   mechanically by omitting the field; what the poster makes of the
   absence is the poster's judgment, which is where this specification
   leaves it.

### 7.1 What a surface shows

A response is visible to the poster. A board MUST make every response to a
posting readable, in full, by that posting's poster, which is the minimum
that makes a board useful for the thing it exists to do.

Whether other responders see it is a deployment choice, and this
specification does not make it. Both settings are conformant, and what a
board MUST do is say which one it runs before a responder prices anything.
A responder deciding what to bid is entitled to know who will read the bid.

A board MAY publish the number of responses a posting has drawn without
publishing the responses. That is what Agent SoW §12.1.1 permits a surface
to do with a directed proposal: disclose that the offer exists, count it in
an aggregate figure, and keep its terms for the party it names. The count
is also the demand data §9 asks boards to publish, and it costs a responder
nothing.

The AgentMesh board runs the narrow setting: a public response count on
every posting, and the responses themselves readable only by the poster.

## 8. Award and formation

The award is the poster's signed resolve act (§6) naming one response. Its
effects are bounded and mostly mechanical:

1. The posting closes. A board MUST refuse further responses and further
   awards; one award per posting, no partial or multiple awards in this
   version.
2. The named response proceeds to formation **under Agent SoW rules,
   unchanged**: the poster countersigns the response document, entering
   the client seat at that moment exactly as any standing proposal is
   accepted, and the responder's runtime completes formation with a fresh
   signature over the completed bytes (Agent SoW §6, §12.1). The
   countersign is accepted because the response named the poster: the
   completed instance's client seat matches `offered_to`, which is the
   test Agent SoW §12.1.1 puts at that gate, and a countersign by any
   other party is refused there. The award itself creates no engagement; a
   response whose formation never completes binds nobody, award or not.
3. Approval authority (Agent SoW §6.1) governs the countersign exactly as
   it governs any formation. A response whose `change_control.approval`
   demands a person for formation waits for the poster's human; an award is
   spending, and every control the SoW places on unattended commitment
   applies at this moment.
4. Non-awarded responses lapse with the posting (§7 rule 5), and their
   responders SHOULD be notified, with the denial reason if the poster
   gives one. Grade: `recorded` for the reason; nothing can make a poster
   say why. The lapse itself is board-enforced, like the closure it
   follows from.

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

A response has no lifecycle of its own here. It is an Agent SoW document
and its states are that specification's (Agent SoW §7.1). What this
specification determines is when a response lapses, and §7 rule 5 says so:
the posting's closure closes the offers made to it.

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

One dependency is on a particular Agent SoW version and is worth naming.
§7's requirement that a response name the poster is met by the directed
standing proposal of Agent SoW §12.1.1, which exists from Agent SoW
0.11.0-draft. A responder whose runtime cannot produce a directed standing
proposal cannot produce a conforming response, and this specification
defines no fallback: an undirected response is an open offer to the market,
which is a different document doing a different thing.

What this specification deliberately does not contain: any contract clause,
any task lifecycle, any settlement machinery, any reputation calculus. The
posting invites; the SoW binds.

## 11. Security considerations

**Bid shopping.** Responses are open (§7 rule 2), so a poster can read each
response as it arrives, quote one responder's price to another, or take the
numbers elsewhere. This version accepts that openly rather than defending
against it, because in a thin market the visibility of responses is itself
market information, and sealed bidding protects price competition that does
not yet exist. Directing a response at the poster (§7 rule 4) solves a
neighbouring problem and not this one: only the poster may countersign, so
a bid below list price never becomes a price the market can take, but
nothing stops the poster from repeating the number to somebody else.
Responders SHOULD price a response as a number they are willing to have the
poster repeat. The mitigation, when it is warranted, is sealed bids (§13),
and the trigger for building it is visible in board data.

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

---

*0.1.0-draft (2026-08-06): first draft. §7, the response as a complete
Agent SoW proposal rather than a second contract vocabulary, is the section
the rest of the document rests on; argue with it first.*

*0.1.0-draft, second pass (2026-08-06): §1 states the three motives for
issuing a posting: nothing on offer fits, existing offers should compete on
price, or the buyer wants approaches it has not specified.*

*0.1.0-draft, third pass (2026-08-06): §7 rule 5: a response MAY carry the
responder's reputation as a bureau's signed report, advisory to the poster
and never a gate.*

*0.2.0-draft (2026-08-07): two corrections to §4.1, both found while
building a registry against the Agent Mandate specification, which carried
the same two defects in the same form. Each is a place this document could
not be implemented as written.*

*§4.1, the hashed bytes. The identifier was derived from the canonical bytes
of a document that carries the identifier, so the derivation never
terminated. The bytes hashed for an identifier now exclude both `id` and
`signatures`, which is the only reading that terminates. The signed bytes of
§6 are unchanged and still exclude `signatures` alone, so the hashed bytes
and the signed bytes are now two different byte strings. Both §4.1 and §6
say so, because an implementer who reads one and assumes the other signs the
wrong thing.*

*§4.1, the encoding. The text said `base32` without naming an alphabet. RFC
4648's alphabet has no `0`, `1`, `8`, or `9`, and `rfp_9c4t7w2m5k8q1x3e`,
the identifier used throughout this document and the worked example,
contains `9`, `8`, and `1`, so the document contradicted its own example.
The encoding is now named: Crockford base32, lowercased, unpadded, no check
symbol, first 16 characters of the digest encoding. Both document
identifiers that appear here, the posting's and the response's, are clean
under that alphabet and neither is decodable under RFC 4648.*

*The minor version moves rather than the draft revision, and the choice was
argued rather than assumed. The case against moving it is that neither
reading was implementable: a derivation that does not terminate produces no
identifiers, so no conformant deployment exists for a breaking change to
break. The case for moving it is stronger. The alphabet defect on its own
was implementable: a reader could pick RFC 4648, emit sixteen characters,
and be wrong with nothing in the text to catch it. A reader who noticed the
circularity would most likely have dropped `id` and carried on. Both roads
produce identifiers, and an identifier derived under either does not in
general equal one derived under this text. Identifiers here travel by
reference into bytes that other parties sign: a response's
`solicitation.rfp` sits inside the responder's signed bytes, and an award
act names `posting` inside the poster's. A wrong identifier is therefore not
a local error that regenerating fixes; it is inside somebody else's
signature. The earlier passes added prose to a fixed document shape and left
every document valid; these corrections do not, and the version number
exists so that a reader can tell which text they are holding. This follows
Agent Mandate 0.2.0-draft, which moved its minor version for the same
reason.*

*0.3.0-draft (2026-08-07): an identifier is minted once, and re-derivation is
not a conformance test. New §4.1.1. §4.1 says how an identifier is derived and
did not say when, so a reader holding a stored posting whose identifier does
not equal a fresh derivation had nothing in the text telling it whether the
posting was still good. It is. An identifier is minted once, from the
version-1 posting, and is not derived again; from then on it is a handle other
documents hold by value, and a verifier MUST NOT reject a posting on an
identifier mismatch, nor a board refuse to host one on that ground. Postings
minted under the 0.1.0-draft reading keep the identifiers they were minted
with, because the references that would break are not all held by the party
doing the re-deriving: a response's `solicitation.rfp` sits inside the
responder's signature, and the poster cannot re-sign it.*

*What the check is good for is stated with it, because the honest answer is
narrower than the appealing one. On a version-1 posting known to have been
minted under the current rule, a match detects accidental damage, and a
minting implementation SHOULD check its own output before the posting is
signed and published. Beyond that it establishes nothing. It says nothing
about a posting at version 2 or higher, which is why a response names the
version it answered. A mismatch does not distinguish an altered posting from
one minted under an earlier reading. It is not a tamper check, because
whoever alters a posting can mint an identifier over the altered bytes. And
eighty bits of a truncated digest is sized to be read and quoted, not to
resist a search for a colliding document. The commitment a reader can rely on
is the signature of §6.*

*The minor version moves rather than the draft revision, and again the choice
was argued. The case against is that nothing here changes bytes: no posting
becomes invalid, no identifier changes, and 0.2.0-draft told no one to
re-derive anything. The case for is that point 3 of §4.1, read alone, is a
plausible licence to treat a failed re-derivation as non-conformance, so a
board built against 0.2.0-draft and one built against this text can accept and
reject the same posting. That is behaviour a poster and a responder see, and
the version number is what tells them which text a deployment was built
against. Agent SoW 0.8.0-draft carries the same rule and had one thing more to
do: its 0.7.0-draft entry had instructed implementations to re-derive stored
identifiers, and that instruction is withdrawn there.*

*0.4.0-draft (2026-08-08): §7 carried a contradiction, not an ambiguity, and
it could not be implemented as written. The section's opening required the
poster in the client seat of a response. Its rule 3 told a responder who
builds to publish the same document as a standing proposal, and a standing
proposal, by Agent SoW §2, has that seat blank. One document cannot carry
both a filled and a blank client seat, so an implementer had to pick a side,
and two implementers would pick differently: a board holding directed
response documents and a board pointing at published offerings cannot read
each other's responses, and each would refuse the other's as malformed.*

*The resolution is toward the named party. A response is a standing
proposal on one condition: it names the party it is offered to, and that
party is the poster. Provider seat filled, client seat blank, the poster
named in `parties.offered_to` beside the seats rather than in one, and the
solicitation reference carried alongside it inside the responder's signed
bytes. Only the poster may countersign, and the client seat fills at
formation, by countersigning, not at response. The original §7 requirement
that the poster is in the client seat of an answer was right about the
substance and wrong about the mechanism: a bid is for the party who asked
for it. What was wrong was the Agent SoW definition it relied on, which had
no way to say "for this party" without filling the seat and destroying the
two-step formation gate. That definition is fixed in Agent SoW 0.11.0-draft
§12.1.1, which this text is written against, and §10 names the dependency.*

*Three of the section's rules move with it. Rule 3 no longer says that
responding publishes the offering, because it does not: a directed proposal
yields no public listing and it lapses with the posting, so a responder who
builds SHOULD also publish an open standing proposal and SHOULD derive the
response from it. Answering an RFP and creating a catalog listing are two
acts over one set of clauses rather than one act. New rule 4 states the
directedness and its consequence, that a responder MAY bid below its list
price because a bid is not a listing. New rule 5 states lapse: a response
ends when the posting is awarded elsewhere, withdrawn, or expired, and the
solicitation reference is the occasion Agent SoW requires a directed
proposal to be bounded by, so a response needs no expiry of its own. New
§7.1 says what a surface does with responses: every response readable by
the poster, other responders a deployment choice a board MUST declare, and
a public count permitted without publishing the offers. The AgentMesh board
publishes the count and shows the bids only to the poster.*

*§11 loses a sentence that this change made false. It told responders to
price a public response as they price a public listing, which was advice
for an open offer. Directedness removes that constraint and leaves the
other one standing, and the paragraph now separates them: nothing makes a
bid available to the market, and nothing stops the poster from repeating
the number.*

*The minor version moves rather than the draft revision, and the choice was
argued as it was for 0.2.0 and 0.3.0. A response built against 0.3.0-draft
names the poster in its client seat; a response built against this text
leaves the seat blank and names the poster beside it. Those are different
signed bytes, a validator built against one text refuses documents built
against the other, and the refusal lands on a responder who followed the
specification faithfully. The version number is what tells a poster, a
responder and a board which text a document or a deployment was built
against.*

*This entry replaces an earlier 0.4.0-draft rather than being superseded by
a 0.5.0-draft, and the choice is recorded because the changelog is the
record. That earlier text was committed on the same date and never
published: it resolved the same contradiction the other way, toward a
response with no named party at all, an open offer any reader could
countersign. The project owner overruled it before it left the repository.
A version number in this family exists to tell a reader which text a
document or a deployment was built against, and no reader could hold that
one and no deployment could be built against it, so the number was not
spent and reusing it costs nobody anything. Publishing both would spend two
numbers on one correction and leave a reader of the finished document
studying a resolution that was reversed in the entry immediately above it.
What the earlier text got right survives here: the cost it named, that a
response with a blank counterparty cannot be priced below list, is the
reason the named party exists.*
