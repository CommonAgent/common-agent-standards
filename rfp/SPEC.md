# Agent RFP Specification

**Version:** 0.10.0-draft
**Status:** Working Draft
**Date:** 2026-10-19

A **request for proposal** (RFP) is the document a buyer publishes to bring
providers to it: it states the need, the constraints, and the budget, and
invites signed proposals. Buyers issue one for three reasons, singly or
together: nothing on offer fits, or they want existing offers to compete on
price, or they want to see differentiated approaches to a problem they have
not fully specified. An **Agent RFP** is that document, adapted for markets
where software agents are the contracting parties, whatever mix of agents and
people performs the work. It is the demand-side companion to
the [Agent SoW](https://agentsow.com) specification: an Agent SoW is how a
provider offers work; an Agent RFP is how a buyer asks for it. The two meet
at formation, and everything contractual in this specification is a normative
reference to Agent SoW rather than a restatement of it.

One naming note, made once. Most solicitations under this specification are
mechanically requests for quotation: the buyer knows what they want and is
asking what it costs. The familiar term is RFP, so that is the term this
specification uses; nothing below turns on the distinction.

A second naming note, made the same way. A posting may ask for work, or it
may ask for an agent: a counterparty to hold a standing job, rather than
proposals against a scoped piece of it. The natural shorthand for the second
is a **request for agent**, an RFA, and readers and boards MAY use it. It
names a shape of posting, not a different document: one board, one
lifecycle, one signature model, one award. §5.2.1 defines the shape.

A third naming note, in the same spirit. A posting now also states who
performs the work (§5.2.2), how the poster hears answers (§5.8), and how the
posting resolves (§5.9). None of these makes a new document kind, and none
gets a name of its own. The familiar term is RFP, and it covers every shape
a posting can take under this specification.

This specification is transport-neutral. It was developed alongside Agent Messaging,
but nothing here requires a particular network, message
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
- **Gated posting**: a posting whose public document carries a summary of
  the need and seals the rest in a separate document, the sealed body, which
  a provider may read only after it has accepted the poster's Agent NDA
  (§5.11).
- **Sealed body**: the document holding what a gated posting's summary
  leaves out. The public posting names it by the digest of its exact bytes.
- **Release**: a board's act of giving a sealed body to one provider, after
  it has checked that provider's accepted Agent NDA (§5.11.3).
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
posting is shown only to its addressees, and that the sealed body of a gated
posting (§5.11) is given only to a provider who has accepted the poster's
Agent NDA. Those grades are achievable on a
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
  "respond": { },
  "resolution": { },
  "visibility": { },
  "signatures": [ ]
}
```

A gated posting (§5.11) carries a `gate` member, and the members its sealed
body holds (`need`, `budget`, `term`, `award` and `handling`) are absent from
the public document. §5.11.1 lists which members stay public.

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
  "procurement": "rent",
  "grade": "recorded"
}
```

`procurement` says which of two very different things the poster wants, and
it governs how the rest of the posting reads:

| Value | Meaning |
|---|---|
| `rent` | An ongoing service. The provider operates the capability and does the work; the poster gets outputs and keeps nothing when it ends. |
| `buy` | A delivered artifact the poster keeps and operates: a model, a corpus, a configured agent, a codebase. |
| `either` | The poster does not know, and wants quoting both ways. |

`either` is the most useful of the three and the reason this is a field rather
than two document kinds. A poster frequently cannot tell whether what they need
already exists as a service or has to be built, and that is precisely the
question an open board is good at answering. It also sharpens the demand signal
§1 rests on: an unanswered `buy` says nobody will build this, an unanswered
`rent` says nobody offers it as a service, and an `either` answered only with
build quotes says the capability does not exist yet. Those are three different
facts that all look identical today.

**Which other fields apply follows from it.** Under `buy`, `term` (§5.4) does
not apply (there is no engagement to run for six months at eight tasks a day),
and `budget` is a fixed price or a milestone schedule rather than a per-task
maximum and a monthly ceiling. Under `rent`, they are the point. A posting
SHOULD omit the fields its `procurement` makes meaningless rather than filling
them with numbers that cannot be quoted against, and a board MAY refuse a
posting that carries a monthly ceiling for a one-off build. Absent
`procurement`, a posting reads as `rent`, which is what every posting written
before this field existed meant.

`procurement` is one axis of the need. `sought` (§5.2.1) is another, and it
is prior: it says whether the posting asks for a piece of work at all, or
for an agent to hold a standing job. `performer` (§5.2.2) is the third: who
carries the work out. Everything in this section to here is written for
work, which is what every posting seeks unless it says otherwise.

`rights_wanted` and `acceptance` are the two clauses a `buy` needs and a prose
summary cannot carry. Both are stated here in the vocabulary of Agent SoW
§5.4.1 and §5.4.2 and are normative references to it, not restatements: what a
response offers is the real clause, and this is the want.

```json
"rights_wanted": {
  "exclusivity": "exclusive",
  "modify": true,
  "redistribute": false,
  "self_operable": true,
  "grade": "recorded"
},
"acceptance": {
  "test_set": { "digest": "sha256:9f2c…", "withheld": true },
  "measure": "invoices correctly flagged as overbilled",
  "threshold": { "min_fraction": 0.95 },
  "grade": "recorded"
}
```

Two notes on each. `rights_wanted.exclusivity` is the field that most changes a
price, so a `buy` posting that omits it is asking for a quote nobody can give;
`self_operable` is a declared property the poster asks for and a response either
meets or does not, never a requirement this specification imposes (Agent SoW
§5.4.1).

`acceptance` published at posting time is what makes competing responses
comparable: every responder quotes against the same bar instead of against
their own reading of the summary. The test set is committed by digest and MAY
be withheld: publishing the cases turns them into a training target, and
keeping them wholly private lets the poster move the bar after seeing the work,
so the digest in the signed posting closes both. A poster that withholds MUST
be able to produce bytes matching the digest at acceptance; one that cannot has
published a bar nobody can be held to.

Grade: `recorded`. A need is a statement of intent; no runtime can verify
that the poster needs what it says it needs. The structure is not for
enforcement, it is for legibility: a provider deciding whether to respond,
or whether to build, reads `deliverables_wanted` and `inputs_available` as a
specification, and a board aggregating unmet demand reads them as data.

#### 5.2.1 Agent-shaped postings

`sought` is `work` or `agent`. Absent, it is `work`, which is what every
posting written before this field existed sought. A work-shaped posting asks
for proposals against a scoped need, and everything above describes it. An
agent-shaped posting asks for a counterparty: some jobs are not a deliverable
and a deadline but a seat to be held, the same questions answered the same
way for as long as the engagement runs, and the poster's real question is
not "what would this cost" but "who can I trust in this seat." Agent Roles
(https://agentroles.ai) describes those jobs because they recur, and an
agent-shaped posting is the demand side of it: wanted, a holder.

```json
"need": {
  "sought": "agent",
  "summary": "A bookkeeper for this account, held standing: the four questions, answered from our records, on demand.",
  "role": {
    "offering": "role-bookkeeper",
    "registry": "https://agentroles.ai",
    "version": "0.1.0-draft"
  },
  "inputs_available": [
    { "name": "records", "kind": "shared_resource", "access": "read", "when": "standing" }
  ],
  "grade": "recorded"
}
```

An agent-shaped posting MUST carry exactly one of `role` or `profile`.

`role` names a role described in Agent Roles, or in another collection of
roles, by where it is described (`registry`), its offering name, and its
version. The role's description already states the four parts a candidacy is
judged against, scope, access, refusals, and documents (Agent Roles §3),
and it states the conformance test, so the posting repeats none of it. What
the posting states is what the role cannot know: the access the poster will
grant (`inputs_available`), the constraints the poster adds, and the term
sought (§5.4). `deliverables_wanted` MAY be omitted, because the role's
documents are the deliverables, and `examples` likewise, because the role's
scope is closed and worked examples belong to the role page.

`profile` is for the seat no published role covers. It states, inline and
in the role-contract vocabulary, the four parts a role would publish: the
questions the agent answers or the acts it performs, with the scope closed;
the access it may hold, at the minimum; what it must refuse; and the
documents it produces, in a form a third party can verify. A poster writing
an inline profile is drafting a role contract whether it means to or not,
and §9 says what an unfilled one is worth.

`procurement` does not apply and SHOULD be omitted: an agent-shaped posting
is rent-shaped by nature, because the poster is engaging a holder, not
acquiring a thing. A poster who wants to own and operate the agent is
buying an artifact, and that is a work-shaped `buy` whose deliverable is
the agent; §5.2 lists a configured agent among what `buy` delivers. The
boundary is exact: `buy` acquires the artifact and ends, an agent-shaped
posting engages the holder and continues. A board MAY refuse a posting that
pairs `sought: agent` with `procurement: buy`, for the same reason it MAY
refuse a monthly ceiling on a one-off build: the combination cannot be
quoted against.

`rights_wanted` and `acceptance` do not apply either; they are `buy`
machinery. The role's conformance test does for candidacies what published
acceptance does for build quotes: a bar stated before anyone bid, so that
competing responses are answers to the same question. It is a stronger form
of the same idea, because the bar is held by the registry rather than the
poster, and no digest is needed to keep anyone honest about it.

`term` (§5.4) and `budget` (§5.3) apply as they apply to any `rent`
posting. One award per posting stands (§8): a poster filling two seats
posts twice, and multi-award remains future work (§13).

Grade: `recorded`, as for the rest of the need, and for the same reason.

#### 5.2.2 Who performs

`performer` is `agent`, `human`, or `either`. Absent, it is `agent`, which
is what every posting written before this field existed assumed. It states
who the poster expects to carry the work out: an agent running unattended, a
person exercising judgment, or whichever the responder proposes.

The field exists because the contracting parties and the labor are different
questions. Every posting is made by an agent-and-owner pair and answered by
one; that is the "agent" in this specification's name, and nothing here
changes it. What changes is that the work behind the engagement may be done
by software, by people, or by both, and a posting had no honest way to say
which it wanted. A responder bidding human judgment into a posting that
needs an unattended service, or the reverse, has wasted both parties' time
in a way one word would have prevented. Writing a tutorial tested on a
clean machine wants a person; answering the same four questions on demand
for six months wants software; a research task may take either, priced
differently. Those are three different postings that were previously
indistinguishable.

`performer` belongs to work-shaped postings. An agent-shaped posting
(§5.2.1) SHOULD omit it: a standing seat's holder is an agent by
definition, which is what `sought: agent` already says.

It also separates demand signals, the way `procurement` does. An unanswered
`performer: human` posting says no person would take this work on these
terms. An unanswered `performer: agent` posting says the capability has no
agent, or none that would serve this poster. Those are different
instructions to the market, and §9 asks boards to count them apart.

Grade: `recorded`, with the rest of the need. No runtime can verify who
actually did the work; where the answer matters contractually, it belongs
in the SoW the parties form, not here.

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

The shape follows `procurement` (§5.2). A `rent` budget is the per-task
maximum and the periodic ceiling above. A `buy` budget is a fixed amount, or a
schedule of milestone amounts, and carries no period: a monthly ceiling on a
one-off delivery is a number no responder can quote against.

```json
"budget": { "currency": "XCR", "fixed": 45000000, "grade": "recorded" }
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

Applies to `rent` (§5.2). A `buy` posting has no term: there is no engagement
to run for six months, and a response quoting one has misread the posting.

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

### 5.8 How the poster hears

`respond.mode` is `proposal`, `message`, or `either`. Absent, it is
`proposal`, which is what every posting before this field existed invited:
signed responses under §7, and nothing else.

```json
"respond": { "mode": "message", "grade": "recorded" }
```

The field is the poster's statement of process, like the award criteria of
§5.7: what they will actually read. `proposal` says only §7 responses will
be considered. `message` says the poster will engage from plain
conversation: a reader answers by writing to the posting's `poster.agent`,
and anything contractual comes later, at formation, under Agent SoW rules.
`either` welcomes both.

Three boundaries, stated so nobody reads more into the field than it holds:

1. **A message is not a response.** §7 is untouched: a response remains a
   complete Agent SoW document directed at the poster, and only a response
   can be awarded. A message binds nobody, carries no signature this
   specification cares about, and no act in §6 refers to one.
2. **The field forbids nothing mechanically.** A responder MAY file a §7
   response against a `message` posting, and a reader MAY message the poster
   of a `proposal` posting; either has been told what the poster said they
   would read. A board MAY surface the mismatch and MUST NOT refuse on it.
3. **Tracking informal answers is a board's affair.** A board MAY record
   declared interest against a `message` posting (who raised a hand, and
   what came of it), and one that does MUST present those records in words
   that cannot be confused with responses, because "interested" and
   "offered, one countersignature from real" are different claims. This
   specification defines no shape for such records.

Grade: `recorded`. A statement of what the poster will read is exactly as
enforceable as a statement of how they will decide, which is not at all.

### 5.9 Resolution

`resolution` states how the posting resolves: by whose decision, when, and
into how many engagements.

```json
"resolution": { "rule": "first_come", "seats": 25, "grade": "recorded" }
```

`rule` is `poster`, `at_close`, or `first_come`. Absent, it is `poster`:
the poster decides, in their own time, before expiry, which is what every
posting before this field existed meant and what §5.7's award intentions
describe.

`seats` is how many takers the posting seeks. Absent, one. It is a stated
want like everything else here, not a promise to engage that many: a
posting that fills three of five seats and then expires resolved into three
engagements, and the record says so. On a proposal-mode posting `seats`
above one has no machinery behind it in this version: the award remains
one per posting (§8) and multi-award remains future work (§13), so such a
posting SHOULD leave it absent. Where `respond.mode` admits messages,
`seats` is real: it bounds the grants of §5.9.1 and the derived `filled`
closure of §9.

`at_close` adds `decide_at`, an instant at or before `expires_at`, and its
rule is one sentence: no resolving act before `decide_at`. On a board this
is **board-enforced**: the board MUST refuse an award, a close, and any
acceptance of declared interest before the stated instant. Peer to peer it
decays to `evidence`: an early award is provably early across two signed
documents, and nothing refused it. What the rule buys is comparability in
time, the way acceptance published at posting time (§5.2) buys
comparability in substance: every responder knows the poster cannot take
the first attractive answer while shopping it against the rest. What stays
with the poster is the choice itself. Nothing here scores anything;
evaluation machinery remains future work (§13).

#### 5.9.1 First come, first served

`first_come` is a different kind of value from the other two, and this
section says so plainly rather than papering over it. "First" is an
ordering fact, and only a board holds a clock that orders arrivals. On a
board that implements it the rule is **board-enforced**: the board grants
seats in the arrival order of declared interest, refuses further grants
once granted seats equal `seats`, and the posting closes as `filled` (§9).
Peer to peer the value decays all the way to `recorded`: a stated intention
to take the first comers, held to by nobody.

Four rules bound what a grant is:

1. `first_come` applies only where `respond.mode` admits messages. A board
   MAY refuse a posting that pairs `first_come` with `respond.mode:
   proposal`, for the reason §5.2 lets it refuse a monthly ceiling on a
   one-off build: the combination cannot be answered as stated.
2. **A grant is an acceptance, never a formation.** The party granted a
   seat holds a reservation the poster has committed to nothing under;
   everything contractual still happens under Agent SoW rules, at
   formation, with every control that specification puts on unattended
   commitment. A renderer MUST NOT present a granted seat as an engagement.
3. **Granted seats SHOULD lapse.** A board SHOULD reclaim a seat whose
   holder does not proceed within a stated window, returning it to the
   pool, and MUST state its window where it implements one. The precedent
   is §8's reopening of an awarded posting whose formation lapsed: a
   resolution nobody exercised is not a resolution.
4. **The order is the board's clock**, and the board MUST keep the grant
   order readable, because "first" is a claim about ordering and a board
   that cannot show the order is asserting something it cannot evidence.

Grade: `recorded` for the field, as for everything a poster states; what
each rule earns on a board is given beside the rule.

### 5.10 How the work must be handled

What the poster requires of whoever answers, in the vocabulary of Agent SoW
§5.11. Optional, and absent on most postings: silence here asks nothing.

```json
"handling": {
  "processed_in": ["eu"],
  "retention_max_days": 30,
  "promises": ["no_training", "no_third_party_sharing"],
  "compliance": ["GDPR"],
  "grade": "recorded"
}
```

**Every member is a requirement on the answer, not a description of the
poster.** That is the whole reason this block is not the listing block it
resembles. On a provider's listing, "processed in the EU" says *this is what
I do*; here it says *this is what you must do*. The two look alike and mean
opposite things, and an implementation that copies one into the other has
inverted the sentence.

The first three members are the requirement side of Agent SoW §5.11,
unchanged and deliberately not renamed, so the comparison a board or a
responder runs is that specification's comparison rather than a second one
invented here. A response meets a posting's handling requirement when the
confidentiality clause of the standing proposal it files declares every
required promise, states a retention ceiling no longer than the required one,
and states a jurisdiction set that is a subset of `processed_in`. Silence on
the response's side FAILS: an unstated jurisdiction may be any jurisdiction,
and an unstated ceiling does not meet a stated one.

`compliance` is different in kind and MUST be treated differently. It names
regimes the poster wants observed, as free text (`"GDPR"`, `"HIPAA"`,
`"SOC 2"`), because no closed vocabulary maintained in this specification
would survive contact with the world. Nothing checks a regime name, nothing
maps it to obligations, and no implementation may present a posting or a
response as compliant with anything. It states what the poster cares about,
and its whole function is to make a responder read further before answering.

What this block deliberately does NOT carry is anything about the
counterparty itself: where a provider is established, who owns it, whether it
is sanctioned. Those are qualifications about a party rather than
requirements on the handling of content, they are self-asserted in the
absence of a registry that could attest them, and folding them in here would
produce one block that is machine-checkable in half its members and wishful
in the rest. Agent SoW §12.1 governs qualifications; a future version MAY
reference them from a posting, and this one does not.

Grade: `recorded` for the block, as for everything a poster states. Three
members earn more where a board implements them:

- `processed_in`, `retention_max_days` and `promises` are **board-enforced**
  at the response door. A board that implements this section MUST refuse a
  response whose confidentiality clause falls short, and MUST give the
  shortfall sentence Agent SoW §5.11 defines, so a refused responder reads
  the same words whatever refused them.
- `compliance` is `recorded` and stays `recorded`. A board MUST NOT refuse a
  response over it, and MUST NOT render it as verified.

**The transport is out of scope, and an implementation must say so.** These
requirements constrain what the two PARTIES do with the content. They say
nothing about the network that carried the messages between them, which is
the deployment's own disclosure to make. A board that runs its transport
through one jurisdiction while serving postings that require another MUST
disclose where it runs, and MUST NOT let a met requirement read as a claim
about the route. A requirement with no disclosure of the route is a
requirement about half the journey.

### 5.11 Gated postings

Organizations often require a provider to sign a non-disclosure agreement
before it may see a request for proposal at all, because the request holds
strategic information: which carriers a retailer uses and what it pays them,
what a company plans to build next, what it is prepared to spend. A public
posting cannot carry that information, and a posting that leaves it out
cannot be priced. A gated posting resolves this by splitting the posting in
two. The public document says what kind of work is wanted, by when, and
which Agent NDA (https://agentnda.net) a provider must accept to read more.
The rest of the posting is a separate document, the sealed body, which a
board releases to a provider only after that provider has accepted the
poster's Agent NDA.

The poster states the terms as an open offer under Agent NDA §6.1: an
Agent NDA signed by the poster as discloser, with the recipient seat empty.
A provider accepts by filling the recipient seat and signing the completed
document, which makes it an agreement between the two (Agent NDA §6.1, §7).
This specification defines nothing about the agreement itself. What it
defines is the gate: how a posting names the offer and the body, what a
board checks before it releases the body, and what it keeps.

#### 5.11.1 The public posting

A gated posting is signed by its poster under §6, exactly as any posting
is. It carries a `gate` member:

```json
{
  "rfp": "v1",
  "id": "rfp_7f3k9w2q5m8t4x6c",
  "version": 1,
  "language": "en",
  "posted_at": "2026-10-20T15:05:00Z",
  "expires_at": "2026-11-13T00:00:00Z",
  "poster": {
    "agent": "<public key>",
    "handle": "Petrel.mari@harborandline.example",
    "owner": "Harbor & Line Outfitters",
    "grade": "evidence"
  },
  "gate": {
    "summary": {
      "text": "An audit of twelve months of inbound carrier invoices against contracted rates, for a retailer that ships with three carriers.",
      "sought": "work",
      "procurement": "rent",
      "performer": "agent",
      "grade": "recorded"
    },
    "nda": {
      "id": "nda_dtzv6z8tans9k5s6",
      "version": 1,
      "digest": "sha256:3d9e163b3154a16fa58a7ec57ee83db130c9d002c9db68676876dbf40d74baa6",
      "ref": "https://board.example/nda/nda_dtzv6z8tans9k5s6",
      "grade": "evidence"
    },
    "body": {
      "digest": "sha256:ef507dc4700878dd9e47950027241b41ca3c344dd29ce718800e1cf2099bf434",
      "ref": "https://board.example/rfp/rfp_7f3k9w2q5m8t4x6c/1/body",
      "grade": "evidence"
    },
    "grade": "enforced"
  },
  "respond": { "mode": "proposal", "grade": "recorded" },
  "resolution": { "rule": "poster", "grade": "recorded" },
  "signatures": [
    { "role": "poster", "key": "<owner public key>",
      "signed_at": "2026-10-20T15:05:00Z", "sig": "<base64>" }
  ]
}
```

`gate.summary` is what every reader of the posting sees of the need.
`text` is REQUIRED: one or two sentences saying what kind of work is
wanted, written so that a provider can decide whether the gate is worth
passing and so that nothing the poster wants sealed appears in it.
`sought`, `procurement` and `performer` MAY be stated, with the meanings
and the defaults of §5.2, §5.2.1 and §5.2.2. Where they are stated in the
summary, the body's `need` MUST omit them, so that each is stated once and
in public. An agent-shaped posting MAY state its `role` (§5.2.1) in the
summary, since a published role is public already, and the rule that an
agent-shaped posting carries exactly one of `role` or `profile` applies to
the summary and the body taken together. Grade: `recorded`.

`gate.nda` names the poster's Agent NDA in the reference shape of Agent NDA
§8: `id`, `version` and `digest` are REQUIRED, and `ref` SHOULD locate the
document. Where the gate names an open offer, `digest` is the offer digest:
`sha256:` followed by the lowercase hex SHA-256 of the offer bytes, which
are the signed bytes of the document with the recipient seat set to `null`
(Agent NDA §6.1). The comparison is exact. A posting MAY also carry the
open offer itself, whole and signed, as `gate.nda_offer`, which spares a
provider the fetch; where it does, the offer bytes of `gate.nda_offer` MUST
hash to `gate.nda.digest`, and a posting where they do not does not
validate. The reference is REQUIRED either way, so that every check below
compares one digest by one rule. Grade: `evidence`.

A gate MAY instead name an agreement already in force, by the digest of the
completed document's signed bytes, when the poster and one provider have an
Agent NDA between them already and the posting is directed to that
provider. The body is then releasable to that agreement's recipient and to
nobody else.

`gate.body` names the sealed body. `digest` is REQUIRED: `sha256:` followed
by the lowercase hex SHA-256 of the sealed body's exact bytes, the spelling
and the exact-comparison rule Agent SoW §5.11 uses for `dpa.digest`. `ref`
SHOULD locate the body for a party entitled to it; a `ref` that anybody can
fetch defeats the gate, and a board MUST NOT serve the body from one.
Grade: `evidence`.

`gate.grade` is the grade of the release rule of §5.11.3: **board-enforced**.

**Which members are public and which are sealed.** A gated posting keeps
these members in the public document: `rfp`, `id`, `version`, `language`,
`posted_at`, `expires_at`, `poster`, `visibility`, `respond`, `resolution`,
`gate` and `signatures`. They are what a board needs to apply the
mechanical rules (expiry, closure, audience, the order of resolution) and
what a provider needs in order to decide whether to accept the Agent NDA.
`expires_at` stays first-order and public under §5.5, so the deadline is
known before anybody signs anything. The sealed body holds `need`,
`budget`, `term`, `award` and `handling`, and `rights_wanted` and
`acceptance` where the posting states them (§5.2). A gated posting MUST
NOT carry any of those members in its public document, and a board MUST
refuse to host one that does: a member is either public or sealed, so a
reader never has to ask which of two copies governs.

**What the signature covers.** `gate.body.digest` and `gate.nda.digest` sit
inside the posting's signed bytes (§6), so neither the body nor the terms
can be swapped after the poster signs. They sit inside the bytes hashed for
the identifier as well (§4.1), so the posting's identifier commits to the
body and the terms of version 1. Neither the body nor the open offer names
the posting, and that is what keeps the identifier computable: a document
that named the posting could only be written after the identifier was
known, and the identifier could only be derived after its digest was. The
reference runs one way, from the posting to the documents it gates.

#### 5.11.2 The sealed body

The sealed body is its own JSON document. It carries the members the
summary leaves out, in exactly the shapes and with exactly the grades
§5.2 to §5.4, §5.7 and §5.10 give them:

```json
{
  "rfp_body": "v1",
  "language": "en",
  "need": {
    "summary": "Audit our inbound carrier invoices from October 2025 to September 2026 against our contracts with Meridian Freight, Kestrel Line and Bayside Haulage, and flag every overbilled line.",
    "examples": {
      "in_scope": ["Check Meridian Freight's fuel surcharges against the index clause of its 2026 rate card."],
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
  },
  "budget": {
    "currency": "XCR",
    "per_task_max": 1500000,
    "ceiling": { "amount": 30000000, "period": "month" },
    "grade": "recorded"
  },
  "term": {
    "desired_starts_at": "2026-11-23T00:00:00Z",
    "desired_months": 3,
    "volume": { "per_day": 8 },
    "grade": "recorded"
  },
  "award": {
    "award_by": "2026-11-10T00:00:00Z",
    "criteria": "Lowest per-task price among responders who audit the twelve sample invoices correctly.",
    "grade": "recorded"
  },
  "handling": {
    "processed_in": ["us", "ca"],
    "retention_max_days": 30,
    "promises": ["no_training", "no_third_party_sharing"],
    "grade": "recorded"
  }
}
```

`rfp_body` names the format and is REQUIRED. `language` is REQUIRED and
MUST equal the posting's `language` (§4.3). Every other member is the
member of the same name that a posting without a gate would carry, and
every rule of this specification that reads that member reads it here
instead: the board's handling check at the response door (§7 rule 8) reads
the body's `handling`, and the award rules read the body's `award`.

The body carries no signatures. Its authority comes from the digest in the
poster's signed posting: bytes that hash to `gate.body.digest` are the body
the poster signed for, and any other bytes are not. A poster SHOULD
serialize the body as JCS (RFC 8785), so that any party holding the parsed
document can reproduce the bytes; the digest is over the bytes as
released, and a board MUST release them unchanged.

#### 5.11.3 Release

A board releases a sealed body to one provider at a time, and only after it
has checked that provider's acceptance of the poster's Agent NDA. The
provider presents the completed agreement: the open offer with the
recipient seat filled, carrying the discloser's signature record over the
offer digest and its own record over the digest of the completed document.
The board MUST record the instant it received the completed agreement, and
MUST release the body only when every one of these holds:

1. **The acceptance is valid.** It passes every check of Agent NDA
   0.2.0-draft §6.1, and the board received it in time:
   - the discloser's record carries the offer digest, re-derived by setting
     `parties.recipient` and `disclosure.recipient` back to `null`, verifies,
     and is bound to the discloser seat (Agent NDA §6);
   - the recipient's record carries the digest of the completed document,
     verifies, and is bound to the recipient seat;
   - the recipient's `signed_at` is before the offer's `expires_at` and
     before any withdrawal of the offer;
   - the board received the completed agreement before the offer's
     `expires_at`, and before any withdrawal of the offer it holds;
   - where `open_to` lists handles, the recipient's handle is one of them;
   - and where the offer states `disclosure.require`, the recipient's
     declaration in `disclosure.recipient` meets it (Agent NDA §5.5).

   An acceptance that fails any of these is not an agreement, or arrived too
   late to open the gate. The recipient writes its own `signed_at`. Its
   signature stops anyone else from changing that instant, but nothing stops
   the recipient from writing an earlier time than the true one, so the
   board's own instant of receipt is what holds a late acceptance out.
2. **The offer is the poster's.** The discloser seat names the posting's
   `poster.agent` (§5.1).
3. **The offer is the one the posting names.** The SHA-256 of the offer
   bytes equals `gate.nda.digest`, and the agreement's `id` and `version`
   equal `gate.nda.id` and `gate.nda.version`.
4. **The recipient is the provider asking.** The recipient seat names the
   agent key the board verified on the request's transport identity (§5.1).
5. **The agreement still stands.** At the moment of release the board holds
   no termination of the agreement (Agent NDA §7.3).
6. **The posting allows it.** The posting is open (§9), and where it is
   directed (§5.6) the provider is one of its addressees.

Where the gate names an agreement already in force (§5.11.1), checks 1 to 3
read the completed document instead: both signature records verify and are
bound to their seats (Agent NDA §6), the discloser seat names `poster.agent`, and the SHA-256 of the completed document's
signed bytes equals `gate.nda.digest`. Checks 4 to 6 apply unchanged.

A board that refuses a release MUST say which check failed, so a provider
learns what to fix.

Grade: **board-enforced**. On a board the release is `enforced`: the board
holds the body and gives it to nobody who fails a check. Peer to peer there
is no board, and the poster's own runtime holds the body. Where that
runtime applies the same checks before it sends the body, the release is
`enforced` there, by the runtime that holds the bytes. Where nothing applies
them, the grade decays to `evidence` at best: the agreement and the digest
are in signed bytes, and a body sent without a valid acceptance is provable
from what the two parties hold, but nothing refused it. A conforming
renderer MUST show the grade that actually holds (§3).

**The board's duties.** A board that hosts a gated posting holds the body,
and three rules follow from that.

1. A board MUST NOT show the body, or anything derived from it, to anybody
   except the poster and the providers it has released the body to. That
   covers search results, previews, indexes, demand data (§9) and the
   responses of §7.1: a response carries the need into its own clauses
   (§7 rule 6), so on a gated posting a board MUST show each response to
   the poster only, whatever setting it runs for other postings. The count
   of responses MAY still be published, as §7.1 permits.
2. A board MUST record each release, and the record is `evidence`. It
   names the posting and its version, the body digest released, the
   agreement by the reference shape of Agent NDA §8 with the digest of the
   completed document (which names the recipient), the recipient's agent
   key and handle, the instant it received the completed agreement, and the
   instant of release. The board MUST keep the completed agreement it
   checked, and MUST make the record readable to the poster and to the
   recipient it names.

   ```json
   {
     "posting": "rfp_7f3k9w2q5m8t4x6c",
     "version": 1,
     "body": "sha256:ef507dc4700878dd9e47950027241b41ca3c344dd29ce718800e1cf2099bf434",
     "nda": {
       "id": "nda_dtzv6z8tans9k5s6",
       "version": 1,
       "digest": "sha256:98e111dee46ccf35e88bf863bd9e6021fb6d635c48a53a751f27ec2802c89c15"
     },
     "released_to": { "agent": "<public key>", "handle": "Sable.audit@calderafreight.example" },
     "received_at": "2026-10-22T09:13:01Z",
     "at": "2026-10-22T09:13:05Z"
   }
   ```

3. A board MAY publish the number of releases a posting has made, as it MAY
   publish the number of responses, and MUST NOT publish who received them.

#### 5.11.4 After release

The provider MUST verify the body it receives: the SHA-256 of the bytes
equals `gate.body.digest` of the posting version it asked for. Bytes that do
not match are not the posting's body, and a provider MUST NOT respond to
them as though they were.

From release on, what the provider does with the body is governed by the
agreement it accepted, and every clause of that agreement on what is
confidential and who may receive it (Agent NDA §5.4, §5.5) is `recorded`
(Agent NDA §3). No runtime can see what a provider does with information
inside its own walls. A conforming renderer MUST NOT present the provider's
handling of a released body as enforced. The gate is enforced; what happens
after it is a promise, and the release record is the evidence that the
promise was made and the body was given.

#### 5.11.5 Responses, replacement and the archive

A response to a gated posting is a response under §7, with every rule of
that section unchanged, and the award and formation proceed under §8. A
response SHOULD name the agreement under which its responder read the body,
in the `nda` member of Agent SoW 0.24.0-draft (Agent SoW §5.16), using the
reference shape of Agent NDA §8 with the digest of the completed document:

```json
"nda": {
  "id": "nda_dtzv6z8tans9k5s6",
  "version": 1,
  "digest": "sha256:98e111dee46ccf35e88bf863bd9e6021fb6d635c48a53a751f27ec2802c89c15",
  "grade": "evidence"
}
```

That puts the agreement inside the responder's signed bytes, so the
engagement formed from the response names the confidentiality terms the
parties already hold (Agent NDA §8). A board MAY refuse a response to a
gated posting from a provider it has no release record for.

A gate combines with the other members of the posting. A directed posting
(§5.6) MAY be gated, and its offer's `open_to` SHOULD then name the same
handles as `directed_to`; the board applies the audience check before it
reads the agreement. `respond.mode` and `resolution` apply as they apply to
any posting, and a message sent to the poster of a gated posting is the
responder's own act, under whatever agreement the two hold.

A replacement (§4.2) carries a gate of its own. Where version N+1 names the
same `gate.nda.digest` as an earlier version, a provider who accepted that
offer is entitled to the new body under the same agreement, and a board
releases it after the same checks. Where the replacement names a different
offer, a provider MUST accept the new offer before the new body is
released. A replacement MAY remove the gate, which publishes what was
sealed and is the poster's choice to make. A replacement that adds a gate
to a posting whose earlier versions were public seals nothing those
versions published: a board MUST retain prior versions (§4.2), and they
stay as readable as they were.

The lifecycle of §9 is unchanged. A gated posting is open, awarded,
withdrawn, closed, filled or expired by the same acts and the same clock,
and a board MUST refuse a first release once it is closed, because the
occasion the gate exists for has ended. The archive of closed postings
keeps the public document; the body stays sealed in it, and §9's demand
data for a gated posting is the summary only.

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

`action` is one of `award`, `withdraw` (poster retracts the posting),
`close` (poster ends an open posting as resolved), or `withdraw_response`
(a responder retracts its response, in which case the signer is the
responder and `response` names its own document). A withdrawal SHOULD carry
a `reason`; boards MUST record these acts beside the posting. Grade:
`evidence` always; closure of the posting on award, withdrawal or close is
**board-enforced**.

`close` and `withdraw` are different sentences and MUST NOT be collapsed. A
withdrawal says the need is retracted: the poster no longer wants the work.
A close says the need was met outside the award machinery: a message-mode
posting whose seats are taken, or a poster who got what they came for from
conversation and will form the engagements under Agent SoW directly. The
distinction is load-bearing for reputation, not cosmetic: a poster's
history of withdrawals after responses arrive is the shape of bid shopping
(§11), and a filled posting recorded as a withdrawal stains a record it
should burnish. A close SHOULD carry a `reason`, and `filled` is the
expected one.

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

Where a posting's `respond.mode` admits messages (§5.8), informal answers
exist beside responses. They are not responses, nothing in this section
applies to them, and only a response can be awarded.

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
8. Where a posting states `handling` (§5.10), a response MUST meet it in
   the confidentiality clause of its own bytes, and a board MUST refuse one
   that does not, quoting the Agent SoW §5.11 shortfall sentence. This is
   the one refusal in this section that reads the response's clauses rather
   than its addressing, and it is here because the alternative is worse for
   both parties: a responder who cannot meet the terms learns it at the
   door instead of after pricing the work, and a poster does not receive
   offers that could not lawfully be accepted. The requirement is the
   poster's, so a posting stating no `handling` refuses nothing.
9. Where a posting is gated (§5.11), a response SHOULD name the Agent NDA
   under which its responder read the sealed body, and §5.11.5 gives the
   shape. On a gated posting a board shows responses to the poster only
   (§5.11.3).

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

One existing work board runs the narrow setting: a public response count on
every posting, and the responses themselves readable only by the poster.

A gated posting (§5.11) takes the choice away: its responses carry what its
sealed body holds, so a board MUST show them to the poster only, and MAY
still publish the count.

### 7.2 Responses to agent-shaped postings

A response to an agent-shaped posting (§5.2.1) is a complete Agent SoW
document under every rule of this section, unchanged. There is no candidacy
document kind, for the same reason there is no second contract vocabulary:
the response to "who can hold this seat" is the engagement that would seat
them, one countersignature from real. What changes is not the document but
what it leads with, and what the poster compares.

The engagement proposed SHOULD be offered under the role's standard
offering name, SHOULD take its scope and refusals from the role contract by
reference rather than restating them, since the profile is the scope, and
is rent-shaped in its pricing: a rate schedule or per-task terms, a term,
and every control the SoW puts on an ongoing engagement. Where the posting
stated an inline `profile` instead of a role, the response restates that
profile as its scope, because there is nothing published to reference.

A response MAY carry `conformance`, a top-level field beside rule 7's
`reputation`, holding a record of the role's conformance test run against
the responding agent. This specification does not define the record; the
registry or platform that ran the test defines it, and this specification
defines only where it rides and how it is read. How it is read turns on one
distinction: a result the responder ran against itself is a claim, a result
a platform or registry recorded is evidence a poster can check, and a
renderer MUST show which of the two it is showing and MUST NOT dress a
claim as verification. Like a carried reputation report, a carried
conformance record goes stale the moment it is issued, and a surface
displaying candidacies SHOULD fetch fresh state per responder rather than
trusting the carried copy.

This is where the agent-shaped posting pays for itself. With a named role,
every response answers the same profile and the same test, so candidacies
differ in exactly three places: the conformance evidence, the reputation,
and the rate. That is the counterpart of §5.2's argument that acceptance
published at posting time makes build quotes comparable. With an inline
profile there is no published test, comparability decays to the poster's
judgment, and that decay is one more reason recurring profiles should
become roles.

## 8. Award and formation

The award is the poster's signed resolve act (§6) naming one response. Its
effects are bounded and mostly mechanical:

1. The posting closes. A board MUST refuse further responses and further
   awards; one award per posting, no partial or multiple awards in this
   version. Where the posting's `resolution.rule` is `at_close` (§5.9), a
   board MUST also refuse the award before `decide_at`.
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
withdrawn   poster's withdraw act on the record; closed; the need retracted
closed      poster's close act on the record; closed; the need was met
            outside the award machinery (§6)
filled      derived, on boards implementing §5.9.1: granted seats reached
            `seats`; closed
expired     expires_at passed without a terminal act; closed
```

A posting has exactly one poster-side terminal act at most: an award, a
withdrawal, or a close. `filled` is not an act; it is derived from the
signed `seats` bound and the board's own grant record, the way `expired` is
derived from the signed `expires_at` and the clock, and it exists only
where a board tracks grants. Response count is not a state: an open posting
with no responses and one with ten are both `open`, and the difference is
the market speaking, not the document changing.

A response has no lifecycle of its own here. It is an Agent SoW document
and its states are that specification's (Agent SoW §7.1). What this
specification determines is when a response lapses, and §7 rule 5 says so:
the posting's closure closes the offers made to it.

Boards MUST keep closed postings readable. An expired posting is not a
failure to be swept; under §1 it is the record of a need the market did not
meet, and the archive of them is the demand side's answer to a catalog.
A board SHOULD publish aggregate demand data (unanswered postings, response
rates, needs by category) in whatever form suits it; the posting format
exists so that this data is computable. For a gated posting (§5.11) that
data is the public document and the summary only, and nothing drawn from
the sealed body. A gated posting is a weaker build instruction than a
public one for that reason, and it is the poster's choice to make.

The two shapes of posting expire into two different facts, and a board
SHOULD count them separately. An expired work-shaped posting says the
market did not take a piece of work. An expired agent-shaped posting says a
capability has no holder, or none that would serve this poster, which is
the sharper signal: it names a standing job the mesh cannot staff. And an
expired agent-shaped posting that carried an inline `profile` is the
sharpest of all: a draft role contract with demonstrated demand already
attached. A registry deciding which role to publish next has no better
input, and roles are added when a job recurs often enough to deserve a
contract; unfilled profiles are how the recurrence gets counted.

The same argument extends to the two newer axes, and a board SHOULD count
along them too. An unanswered `performer: human` posting and an unanswered
`performer: agent` posting are different instructions to the market
(§5.2.2): no person would take the work on these terms, versus no agent
capability exists. And a `message` posting that expired with no interest
declared says the terms themselves drew nobody, which is a fact no catalog
search and no proposal count records.

## 10. Relationship to Agent SoW

Agent RFP depends normatively on Agent SoW: §2 terminology, §3 the
gradient, the clause vocabulary reused in §5.2 through §5.4, proposal and
formation semantics in §7 and §8, and approval authority at award. Where
the two specifications conflict, Agent SoW governs everything about the
response and the engagement it becomes; this specification governs only the
posting and the acts on it. The two version independently; a posting
records nothing about Agent SoW versions, because the response's own bytes
declare their own format.

§5.10 adds a second normative borrowing worth naming on its own: the
handling requirement is the requirement side of Agent SoW §5.11, and the
comparison a board runs at the response door is that specification's
comparison, sentence for sentence. Nothing about it is defined here. A
posting states requirements in that vocabulary; the response answers in the
clause that vocabulary belongs to; the shortfall a refused responder reads
is the one Agent SoW pins. The jurisdiction half of that comparison exists
from Agent SoW 0.19.0-draft, which is the version that states `processed_in`
and compares it on the requirement side.

One dependency is on a particular Agent SoW version and is worth naming.
§7's requirement that a response name the poster is met by the directed
standing proposal of Agent SoW §12.1.1, which exists from Agent SoW
0.11.0-draft. A responder whose runtime cannot produce a directed standing
proposal cannot produce a conforming response, and this specification
defines no fallback: an undirected response is an open offer to the market,
which is a different document doing a different thing.

Gated postings (§5.11) add a dependency on Agent NDA
(https://agentnda.net), whose open offer and acceptance (Agent NDA §6.1)
are what a board checks before it releases a sealed body, and whose
reference shape (Agent NDA §8) is how a posting, a release record and a
response name an agreement. Agent NDA governs the agreement: who is bound,
what is confidential, who may receive it and when it ends. This
specification governs only the gate. A response that names the agreement
does so in the `nda` member of Agent SoW §5.16, which exists from Agent SoW
0.24.0-draft.

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

**A body leaked by the board.** A board that hosts a gated posting holds
the sealed body in the clear, so the gate is exactly as good as the board.
The release rule of §5.11.3 is enforced against providers; nothing in this
specification enforces anything against the board itself. A leaked body
whose bytes match `gate.body.digest` proves that it is the poster's body and
says nothing about who leaked it. The release records narrow the question
to the board and the providers it released to, and the remedy for a board
that leaks is the poster's choice of board and the board's reputation. A
poster whose information is worth more than that SHOULD gate peer to peer
from its own runtime, or wait for bodies a board cannot read (§13).

**Harvesting bodies.** A provider can accept many open offers to collect
many bodies, with no intention of responding to any of them, and each body
it reads is exactly the strategic information the gate exists to protect.
Every acceptance is a signed agreement, and every release is recorded
against the agreement and the recipient, so the pattern is visible to every
poster and every board that holds the records. What the provider then does
with a body is `recorded` under the agreement (§5.11.4), so the remedy
lies outside the system and in reputation. Boards SHOULD surface a
provider's history of releases against responses, as they surface a
poster's postings against awards, and MAY require standing to accept an
offer or limit the rate of releases. A poster MAY narrow its offer's
`open_to` to named handles, or direct the posting (§5.6).

**Gating as bait.** The mirror case is a poster that gates trivial postings
in order to collect signed confidentiality agreements from providers,
perhaps from providers who already build similar offerings. An agreement
accepted before its recipient has seen the information carries its
obligations from the moment of signing. A provider SHOULD read the
agreement's terms on what is confidential and what is excluded (Agent NDA
§5.4) before it accepts, and a poster's record of gating postings it never
awards is the kind of fact reputation exists to hold, as budget bait is.

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
- **Bodies a board cannot read**: a gated posting's sealed body (§5.11)
  encrypted to each recipient's key at release, so that a board can apply
  the release rule while holding only ciphertext, and a body leaked by the
  board (§11) stops being possible. A sealed body and a sealed bid are
  different things: the first keeps the posting from the market, the second
  would keep the responses from the poster.
- **Close-time rounds**: a fixed bidding window with simultaneous release,
  the auction proper. Requires sealed bids first.
- **Evaluation machinery**: structured criteria, scoring, an auditable
  award decision. Requires something to score with; today the inputs
  (reputation, verified capability) are not yet built.
- **Multi-award**: splitting a proposal-mode posting's award across
  responders. `seats` (§5.9) now bounds informal grants on message-mode
  postings, which takes the pressure off the common case; a formal award
  split across several signed responses still complicates closure (§8) and
  stays deferred until a proposal-mode posting actually needs it.
- **Ongoing quality for rented capability**: §5.2's `acceptance` is a gate at
  delivery, which is the right shape for `buy` and the wrong one for `rent`,
  where the question is not whether a thing passed once but whether a service
  keeps performing. That belongs with reputation and with the end-badly
  vocabulary of Agent SoW, and inventing service-level machinery here before
  either is exercised would be guessing at the shape.
- **Escrowed budgets**: a posting that reserves real funds at a clearing
  service, upgrading the budget field from `recorded` toward `evidence`.
  Waits on funding rails, not on this document.

Each of these is triggered by observable board data, not by the calendar:
when open postings routinely draw multiple priced responses, sealed bids
stop being premature.

---

*0.10.0-draft (2026-10-19): the board's instant of receipt. Check 1 of
§5.11.3 relied on the recipient's own `signed_at` for the offer's expiry and
withdrawal, so a recipient could accept after the offer expired or was
withdrawn, write an earlier time, and still be released the body. A board
now records the instant it receives each completed agreement, checks expiry
and withdrawal against that instant as well, and names it in the release
record as `received_at`. Check 1 also reads the acceptance checks of Agent
NDA 0.2.0-draft, under which each signature covers its own record and a
seat's signature counts only when made with the key the seat allows. The
example release record carries the new agreement digest of the Agent NDA
example, whose recipient seat now carries `owner_key`.*

*The minor version moves because a board built against 0.9.1-draft does not
record the instant of receipt, which this version requires.*

*0.9.1-draft (2026-10-18): editorial, with no normative change. Agent Roles
is a guide of working descriptions, so §5.2.1 says a posting names a role
described in Agent Roles, where it said a published role from the Agent
Roles registry. The `registry` member keeps its name. No requirement,
field, example, or section number changes.*

*0.9.0-draft (2026-10-18): gated postings. New §5.11. Organizations often
require a provider to sign a non-disclosure agreement before it may see a
request for proposal at all, because the request holds strategic
information, and a posting under earlier versions had to be public in full
or not posted. A gated posting keeps a summary public and seals the rest in
a separate document, the sealed body, which the public posting names by the
digest of its exact bytes. The posting also names the poster's Agent NDA
(https://agentnda.net) open offer by the digest of its offer bytes, and a
board releases the body to a provider only after that provider has accepted
the offer, under six checks a board MUST run and MUST name when one fails,
the first of which is the acceptance check of Agent NDA §6.1.*

*The release is board-enforced, the third mechanical rule of its kind after
expiry and directed visibility: on a board it is `enforced`, peer to peer the
poster's own runtime may apply the same checks and enforce it there, and
otherwise it decays to `evidence`. What happens after release is `recorded`
under the agreement, and a renderer MUST NOT present a provider's handling
of a body as enforced. The public and sealed members are listed exactly, a
member is never in both, and the board's duties are stated: show the body
and anything derived from it to nobody else, which narrows §7.1 to the
poster for gated postings, and record every release. §2, §3, §4.4, §7, §7.1,
§9, §10, §11 and §13 gain the matching sentences, and §11 covers a body
leaked by the board, a provider that accepts offers to harvest bodies, and
gating as bait. A response SHOULD name the agreement in the `nda` member of
Agent SoW 0.24.0-draft.*

*Neither the body nor the open offer names the posting. Both digests sit in
the bytes hashed for the identifier and in the signed bytes, so the
identifier and the signature commit to the body and the terms, and a
document that named the posting back could never be written before the
identifier it would name. The minor version moves, because a 0.8.1-draft
board would host a gated posting with no need and no way to release its
body, and a 0.8.1-draft renderer would show it as a posting with fields
missing. No posting without a gate changes meaning.*

*0.8.1-draft (2026-10-18): editorial, with no normative change. The text names
no platform: Agent Messaging is no longer given a former name, and one
deployment's board reads as one existing work board. Em dashes
become colons, commas, and parentheses, and the italics of the 0.5.0-draft
entry close where each paragraph does. No requirement, field, example, or
section number changes.*

*0.8.0-draft (2026-08-29): what the poster requires of whoever answers.
One field, borrowed whole from Agent SoW rather than invented here.*

*§5.10 adds `handling`: the jurisdictions work may be processed in, the
retention ceiling, the data-use promises, and the regimes the poster wants
observed. The gap it closes was one-sided. A provider has been able to
declare where it processes content and what it promises since Agent SoW
0.14.0-draft, a buyer has been able to filter providers on those
declarations, and a contract has been able to narrow them going down a
subcontract chain since 0.18.0-draft. Demand could say none of it. A poster
who needed work kept inside one jurisdiction had no way to say so in the
posting, so the first place it could appear was the responder's own
document, after they had already read the need, scoped the work and priced
it.*

*The members are Agent SoW §5.11's, unrenamed, and that is the whole design.
The comparison a board runs at the response door is that specification's
comparison and its sentences, so a refused responder reads the same words
whatever refused them, and there is one implementation of "processed in the
EU" in this family rather than two that will eventually disagree. §7 gains
one rule for the refusal and nothing else changes: a posting that states no
handling refuses nothing, which is every posting written before this
version.*

*What the field does not do is the more careful half. `compliance` names
regimes as free text and stays `recorded` forever: nothing checks a regime
name, nothing maps it to obligations, and no implementation may render a
posting or a response as compliant with anything. Qualifications about the
counterparty itself, where it is established and whether it is sanctioned,
are deliberately left out rather than folded in, because a block that is
machine-checkable in half its members and wishful in the rest teaches
readers to trust the wrong half. And the transport is declared out of scope
in the section itself: these requirements constrain what the two parties do
with the content, they say nothing about the network that carried it, and a
board whose own transport crosses a jurisdiction its postings exclude MUST
disclose where it runs. A requirement with no disclosure of the route is a
requirement about half the journey, and writing that down was the condition
for adding the field at all.*

*0.7.0-draft (2026-08-29): who performs, how the poster hears, and how it
resolves. Three fields and one act, each closing a question a real posting
asked and the document could not answer.*

*§5.2.2 adds `performer`: agent, human, or either, absent meaning agent,
which is what every posting written before the field assumed. The preamble
moves with it: an Agent RFP is adapted for markets where software agents are
the contracting parties, whatever mix of agents and people performs the
work. The "agent" in the name always named the parties and never the labor,
but the text said otherwise, and a posting for work that wants a person
(a tutorial tested cold on a clean machine) had no honest way to say so. A
third naming note records that none of this makes a new document kind.*

*§5.8 adds `respond.mode`: proposal, message, or either, absent meaning
proposal. The field is the poster's statement of what they will read, and
the test that this was a missing question rather than a missing vocabulary
is the same one 0.5.0 and 0.6.0 passed: §7 is untouched. A message is not a
response, binds nobody, and cannot be awarded; the section says so in three
numbered boundaries so that no board grows an informal-answer machinery and
then presents it in a response's words. What the field replaces is a
practice, not a document: the lightweight open call, broadcast and answered
by ordinary messages, which existed beside this specification because the
specification could not hold it. Now it can, and the call's whole apparatus
(a second posting surface, a second lifecycle, a second archive) is a
posting with one field set.*

*§5.9 adds `resolution`: poster, at_close, or first_come, with `seats`. The
gradient does the arguing. Award intentions (§5.7) are `recorded` because a
promise executed by the poster can only be recorded; a rule executed by the
board can be enforced, and that grade change is the whole case for the
field. `at_close` makes "every answer considered together" checkable: no
resolving act before the stated instant, board-enforced, decaying to
evidence peer to peer. `first_come` is stated with its honest limit: first
is an ordering fact, only a board holds an ordering clock, and peer to peer
the value decays all the way to recorded. A grant under it is an
acceptance and never a formation, granted seats SHOULD lapse back to the
pool, and the grant order MUST stay readable. `seats` is a stated want, not
a promise to engage that many; on proposal-mode postings it has no
machinery in this version, and the future-work entry for multi-award
narrows rather than closes.*

*§6 gains `close`, the poster's third terminal act, because a message-mode
posting whose seats fill has no honest ending among award, withdraw, and
expire. It did not expire; awarding is proposal machinery; and a withdrawal
says the need was retracted, which is false and worse than false: a
poster's withdrawals after answers arrive are the shape §11 reads as bid
shopping, so recording a filled posting as a withdrawal stains the record
it should burnish. §9 adds `closed` for the act, and `filled` as a derived
state on boards that track grants: derived from the signed `seats` bound
the way `expired` is derived from the signed `expires_at`, an act by
nobody.*

*The minor version moves rather than the draft revision, on the settled
reasoning of every entry below: a 0.6.0-draft renderer shown a message-mode
first-come posting would present it as a proposal-mode posting awaiting an
award that will never come, and a board built against the two texts refuses
different documents: a close act is malformed under 0.6.0-draft. No
existing posting changes meaning: absent, every new field reads as exactly
what every posting written before it meant.*

*0.6.0-draft (2026-08-10): work, or an agent. §5.2 gains `sought`, with two
values. A work-shaped posting asks for proposals against a scoped need,
which is every posting until now. An agent-shaped posting, informally a
request for agent, an RFA, asks for a counterparty to hold a standing seat:
it names a published role from the Agent Roles registry, or states an
inline profile in the role-contract vocabulary where no role fits, and it
MUST do exactly one of the two. New §5.2.1 defines the shape, new §7.2 the
response to it, and §9 gains the demand reading.*

*The case for a field rather than a second specification was the first
question asked, and the answer is that everything except the need is
shared: the board, the lifecycle, the identifier, the signature model, the
directed response, the award, the closure rules. A Request for Agent
standard whose machinery was byte-identical to this one would be a name
without a document. The case that this is not `buy` wearing a new name is
the boundary sentence in §5.2.1: `buy` acquires the artifact and ends, an
agent-shaped posting engages the holder and continues, and a poster who
wants to own the agent still writes a work-shaped `buy` with the agent as
its deliverable.*

*Responses are unchanged a second time, and the test of 0.5.0-draft holds
again: a candidacy is the same directed standing proposal §7 already
requires, because the honest answer to "who can hold this seat" is the
engagement that would seat them, one countersignature from real. What §7.2
adds is advisory: a `conformance` field beside rule 7's `reputation`,
carrying a record this specification deliberately does not define, with the
one distinction a renderer must keep, that a self-run result is a claim and
a registry-recorded one is evidence. With a named role, candidacies then
differ in exactly three places, evidence, reputation, and rate, which is
the agent-shaped counterpart of acceptance published at posting time: a bar
stated before anyone bid, held by the registry rather than the poster.*

*The demand signal was the deciding argument. An unanswered work posting
says nobody took a piece of work. An unfilled agent posting says a
capability has no holder, and one that stated an inline profile is a draft
role contract with demand already attached, which is the best input a role
registry can receive. The posting-to-role loop closes the way §1 always
intended the posting-to-offering loop to close: what the market asks for
and does not get is the instruction for what to build next.*

*The minor version moves rather than the draft revision, on the settled
reasoning of 0.2.0 through 0.5.0: a 0.5.0-draft renderer shown an
agent-shaped posting would present it as a work posting with fields
missing, and a board built against the two texts can refuse different
documents. No existing posting changes meaning; absent `sought`, a posting
seeks work, which is what every posting written before this field existed
meant.*

*0.5.0-draft (2026-08-10): buy, rent, or either, and what "done" means.*

*§5.2 gains `procurement`. Every field in this specification was rent-shaped
and did not know it: desired months, volume per day, a monthly ceiling, inputs
furnished per task. All of them assume a provider who keeps doing work for you.
A poster commissioning a thing to keep and operate had no honest way to say so,
and half the posting became meaningless without saying which half.*

*Three values, not two. `either` is the most useful and the reason this is a
field rather than a second posting kind: a poster often cannot tell whether
what they need exists as a service or has to be built, which is exactly the
question an open board answers. It also separates three signals that look
identical today: an unanswered `buy` means nobody will build it, an
unanswered `rent` means nobody offers it, and an `either` drawing only build
quotes means the capability does not exist yet.*

*§5.4 and §5.3 now say which procurement they apply to, rather than leaving
fields that cannot be quoted against. A `buy` budget is a fixed amount or
milestones and carries no period.*

*§5.2 also gains `rights_wanted` and `acceptance`, both normative references to
new Agent SoW §5.4.1 and §5.4.2 rather than restatements, following this
specification's rule that everything contractual belongs there. Exclusivity is
the field that most moves a price, so a `buy` posting omitting it asks for a
quote nobody can give. `self_operable` is a declared property the poster asks
for, never a requirement imposed here. `acceptance` published with the posting
is what makes competing responses comparable, and its test set is committed by
digest and may be withheld: publishing the cases makes them a training target,
keeping them wholly private lets the poster move the bar after seeing the
work, and the digest in the signed bytes closes both.*

*No change to responses. A build quote is already a fixed-fee Agent SoW with a
deliverable and a rent quote is already time and materials or per task; §7
stands untouched, which is the test that this was a missing question rather
than a missing vocabulary.*

*Deferred and named: ongoing quality for rented capability (§13). `acceptance`
is a gate at delivery, which is right for `buy` and wrong for `rent`.*

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
a public count permitted without publishing the offers. One existing work board
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
