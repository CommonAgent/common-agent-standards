# Agent NDA Specification

**Version:** 0.1.0-draft
**Status:** Working Draft
**Date:** 2026-10-18

A **non-disclosure agreement** (NDA) is the document two parties sign before
one of them shows the other something it wants kept private. It says what
counts as confidential, what the receiving party may use it for, who else may
see it, how long the duty lasts, and what happens to the material at the end.
An **Agent NDA** is that agreement written for two parties whose software
agents work together. It is a signed JSON document that names both parties
by their agents' keys and their accountable owners, so that an agent can
read it, check its signatures, and know which material it is holding under
which terms.

Agent NDA belongs to the same family as Agent RFP (https://agentrfp.net),
Agent SoW (https://agentsow.com), Agent Mandate (https://agentmandate.net)
and Agent Reputations (https://agentreputations.com), and it adopts the
enforcement gradient of Agent SoW §3. Almost everything an NDA promises
happens inside the receiving party's own walls, where no runtime can see.
This specification says so clause by clause: the signatures are evidence,
the promises are recorded, and the one step a machine can enforce, a board
releasing a sealed RFP body only to a party that has countersigned, is
defined in Agent RFP and named here.

This specification describes what the document records. It is not legal
advice, and nothing in it says what a court would make of a particular
agreement.

This specification is transport-neutral. Nothing here requires a particular
network, message bus, or vendor.

---

## 1. Motivation

Organizations often make a provider sign a non-disclosure agreement before it
may even see a request for proposal, because the RFP holds strategic
information: what the organization plans to change, what it spends today,
which suppliers it is unhappy with. Confidential material also changes hands
in an Agent SoW validation probe (Agent SoW §13), where a client sends real
sample inputs to a provider before anyone has signed a statement of work, and
during negotiation, while drafts and prices pass back and forth. And one NDA
often covers a whole relationship, across many statements of work signed one
after another over years.

A clause inside Agent SoW cannot cover any of that. Before a statement of
work exists there is no document for the clause to sit in, and once several
exist, each one would carry its own copy of the same promises with its own
start and end. Agent SoW §5.11 governs how an engagement's content is
handled while the work runs. The duty of confidence that comes before the
work, and outlasts any one engagement, needs a document of its own. Agent NDA
is that document, signed separately, and referred to by the documents that
depend on it.

Three moments are in view throughout:

1. **Before an RFP is shown.** A poster publishes a gated posting (Agent RFP
   §5.11): a public summary, and a sealed body that a board releases only to
   a provider who has countersigned the poster's Agent NDA.
2. **During a probe and a negotiation.** The parties exchange sample inputs,
   methods and draft terms under an NDA that is already in force.
3. **Across many contracts.** Each Agent SoW the parties sign names the NDA
   it runs under by identifier and digest (Agent SoW §5.16), so a reader of
   any one engagement knows which confidentiality terms bind the
   relationship.

## 2. Conformance language and terminology

The key words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are to be
interpreted as described in RFC 2119.

- **Agreement**: one Agent NDA document, at one version.
- **Discloser**: the party whose confidential material is protected.
- **Recipient**: the party that receives the material and takes on the
  duties of §5.
- **One-way agreement**: an agreement under which only the discloser's
  material is protected. **Mutual agreement**: an agreement under which each
  party is both a discloser and a recipient.
- **Confidential material**: material a discloser makes available to a
  recipient that falls in a category the agreement covers (§5.4).
- **Open offer**: an agreement signed by the discloser with the recipient
  seat left empty, which any qualifying party may accept (§6.1).
- **Acceptance**: the recipient's countersignature over the completed
  document formed from an open offer.
- **Board**, **Posting**, **Gated posting**: as defined in Agent RFP §2 and
  §5.11.
- **Owner**, **Agent**, **Node**, **Engagement**, **Processor**: as defined
  in Agent SoW §2 and §5.11.

## 3. The enforcement gradient

Agent NDA adopts the enforcement gradient of Agent SoW §3 normatively. Every
clause of an agreement carries exactly one grade, `enforced`, `evidence`, or
`recorded`, with the meanings and rules that section gives, and a document
that claims more enforcement than its runtime delivers is not conformant.

The gradient lands at one end of its range here, and that is worth stating
before the clause list. An NDA asks the recipient to do things in private:
to use material only for a purpose, to show it only to certain people, to
destroy it at the end. No runtime can watch any of that. So:

1. **The promises are `recorded`.** Purpose, the covered categories, the
   limits on disclosure, survival, the exclusions, compelled disclosure, and
   return or destruction are promises stated in the signed document that no
   runtime can verify. Breach is established outside the system (§5.9).
2. **The facts around the promises are `evidence`.** Who the parties are,
   when the agreement took effect and when it ends, and that each party
   signed are facts carried in signed, exportable bytes. A countersignature
   proves that the recipient's owner key signed these exact terms at a
   stated instant.
3. **Nothing in an agreement is `enforced`.** An agreement MUST NOT grade any
   of its own clauses `enforced`, and a document that does is not valid. That
   grade is the false enforcement claim of Agent SoW §3 rule 1 in its
   plainest form: no runtime can refuse a recipient's private misuse of what
   it already holds.
4. **The one enforced step sits outside the document.** A board that hosts a
   gated posting releases the sealed body only after it has verified a valid
   acceptance of the poster's agreement. That refusal is mechanical and
   happens before the recipient holds anything, so it is graded `enforced`,
   at the board. Agent RFP §5.11 defines it. Once the body is released, the
   recipient's handling of it is a `recorded` promise under the agreement.

A renderer MUST show each clause's grade wherever it shows the clause, and
MUST NOT present any promise of an agreement as enforced, whatever enforced
step came before it.

## 4. Document model

### 4.1 Encoding and identity

An agreement is a JSON document. The canonical form is JCS (RFC 8785)
canonical JSON. The document identifier is:

```
nda_<crockford32(sha256(canonical bytes of version 1, minus id and signatures))[0..16]>
```

The rules of Agent SoW §4.1 apply unchanged, with `nda_` as the prefix: the
hashed bytes exclude `id` and `signatures`; `crockford32` is Crockford base32,
lowercased, unpadded, with no hyphens and no check symbol, and the first 16
characters are taken. The hashed bytes and the signed bytes of §6 are two
different byte strings, and an implementation MUST NOT use one for the
other.

#### 4.1.1 Minting

An identifier is minted once, by the implementation that creates the
version-1 document, and the rules of Agent SoW §4.1.1 apply: storing,
amending, rendering or verifying an agreement MUST NOT re-derive its
identifier, and a verifier MUST NOT reject an agreement because its
identifier does not re-derive. The content commitment a reader relies on is
the signature of §6 and the digest of §8.

An agreement accepted from an open offer keeps the identifier minted for the
offer (§6.1). Each acceptance is a distinct agreement, told apart from the
others by its recipient and by its digest. An identifier names the terms a
discloser offered; a digest names one agreement exactly.

### 4.2 Top-level shape

```json
{
  "nda": "v1",
  "id": "nda_2bpnmagnx6925r5y",
  "version": 1,
  "language": { "id": "agent-nda-standard-language", "version": 1,
                "sha256": "<hash of that version's template text>" },
  "direction": "one_way",          // §5.1
  "parties": { },                  // §5.1
  "offer": { },                    // §6.1, open offers only
  "effective_at": null,            // §5.2
  "ends_at": "2027-11-30T00:00:00Z", // §5.2
  "purpose": { },                  // §5.3
  "covers": { },                   // §5.4
  "disclosure": { },               // §5.5
  "survival": { },                 // §5.2
  "exclusions": { },               // §5.6
  "compelled": { },                // §5.7
  "at_end": { },                   // §5.8
  "termination": { },              // §7.3
  "signatures": [ ]                // §6
}
```

`nda`, `id`, `version`, `language`, `direction`, `parties`, `ends_at`,
`purpose`, `covers` and `signatures` are REQUIRED. The other members are
OPTIONAL, and §5 says what each one's absence means. Every clause object
carries a `grade`, and the grade of each clause is fixed by this
specification (§11): a document whose clause carries a different grade does
not validate.

### 4.3 Contract language

`language` pins the template text the agreement's structured fields are read
in, exactly as Agent SoW §4.3 pins contract language. A renderer MUST render
an agreement in the language version it names, and a renderer that does not
know that version MUST say so and show the signed fields verbatim. The
sentences a person reads are covered by the signature because the hash of
their template is.

## 5. Clauses

### 5.1 Parties and direction

Two seats, `discloser` and `recipient`, each in the shape of one seat of an
Agent SoW parties clause (Agent SoW §5.1): the agent's public key, an
optional human-readable handle, and the accountable owner. A seat MAY carry
an `organization` reference naming the organization on whose behalf that
seat signs, per section 7 of Agent Mandate.

```json
"direction": "one_way",
"parties": {
  "discloser": { "agent": "<public key>",
                 "handle": "Petrel.mari@harborandline.example",
                 "owner": "Harbor & Line Outfitters",
                 "organization": "org_hl4q8m2x6t9w3k7r" },
  "recipient": { "agent": "<public key>",
                 "handle": "Sable.audit@calderafreight.example",
                 "owner": "Caldera Freight Systems" },
  "grade": "evidence"
}
```

`direction` is `one_way` or `mutual`. In a one-way agreement, only material
the discloser makes available is protected, and only the recipient takes on
the duties of this section. In a mutual agreement, each party is both a
discloser and a recipient: every duty applies to each party for material the
other makes available, and the seat names say only who signed where.

The recipient seat is `null` in an open offer (§6.1) and filled in every
other agreement.

Grade: `evidence`. The agreement records which keys and owners signed.
Identity verification is the transport's job, as in Agent SoW §5.1. A node
SHOULD NOT treat material as covered by an agreement unless the agent it
received the material from, or sent it to, is the agent named in the
corresponding seat.

### 5.2 Effective date, term and survival

`effective_at` and `ends_at` are first-order instants, like the term
instants of an Agent SoW. `effective_at` is when the duties begin; `null`
means the agreement takes effect when it is countersigned, at the later
signature's `signed_at`. `ends_at` is when the agreement stops covering new
disclosures. Both are `evidence`: the instants are in the signed bytes.

`survival` states how long the duties continue for material disclosed while
the agreement was in force, counted in whole days from the day the agreement
ends, whether it ends at `ends_at` or earlier by termination (§7.3):

```json
"ends_at": "2027-11-30T00:00:00Z",
"survival": { "days": 730, "grade": "recorded" }
```

`days` is a positive whole number. Grade: `recorded`. Whether a recipient
keeps its duties after the agreement ends is a promise no runtime can check.

**Absence.** An agreement without `survival` states no survival period, and
a reader MUST NOT supply one. The duties then end when the agreement ends.
This specification invents no default, because a default here would be a
number neither party wrote.

### 5.3 Purpose

What the recipient may use confidential material for. The purpose is the
heart of an NDA, because the main duty it records is that the recipient uses
the material for this and for nothing else.

```json
"purpose": {
  "statement": "Evaluating and responding to Harbor & Line's freight-audit posting, which names this offer, and running validation probes, negotiating, and performing any Agent SoW between the parties that names this agreement.",
  "activities": ["evaluate_solicitation", "validation_probe",
                 "negotiation", "perform_engagements"],
  "named": [ { "sow": "sow_k7m2q4x9w3e6r8t1" } ],
  "grade": "recorded"
}
```

- `statement` is REQUIRED: the sentence a person reads, and the operative
  statement of the purpose.
- `activities` is a closed list, so that software can tell which documents
  fall inside the purpose without reading prose:
  - `evaluate_solicitation`: evaluating and responding to any Agent RFP
    posting whose gate names this agreement or the offer it was accepted
    from (Agent RFP §5.11);
  - `validation_probe`: running Agent SoW validation probes (Agent SoW §13)
    between the parties;
  - `negotiation`: negotiating terms between the parties, including drafts
    and proposals that are never signed;
  - `perform_engagements`: performing any Agent SoW between the parties that
    names this agreement in its `nda` member (Agent SoW §5.16).
- `named` MAY list existing documents by identifier (`{ "rfp": "rfp_...",
  "version": n }` or `{ "sow": "sow_..." }`), which are inside the purpose
  as well.

An activity left out of the list is outside the purpose. An agreement whose
`activities` omits `perform_engagements` does not cover an engagement merely
because the engagement names it, and a node SHOULD warn when an Agent SoW
names an agreement whose purpose does not include it.

An open offer MUST NOT name, in `named` or anywhere else, the posting that
gates on it. The posting commits to the offer's digest (Agent RFP §5.11), so
the reference runs one way only; an offer that named its posting could not
be completed before the posting existed, and the posting could not be signed
before the offer was. `evaluate_solicitation` is how an offer covers the
posting that names it.

Grade: `recorded`.

### 5.4 What is confidential

A closed list of categories the parties choose. A category left out of the
list is not covered, and a reader MUST NOT infer that it is.

```json
"covers": {
  "categories": ["solicitation", "agreement_terms", "relationship",
                 "inputs", "deliverables"],
  "grade": "recorded"
}
```

| Category | What it covers |
|---|---|
| `solicitation` | A solicitation the discloser makes available, such as the sealed body of a gated Agent RFP posting, and anything released with it. |
| `agreement_terms` | The terms of any related agreement between the parties: Agent SoW documents, proposals, responses, drafts and prices, signed or not, and this agreement's own terms. |
| `relationship` | The fact that the parties are in a relationship, are negotiating, or have signed this agreement. |
| `inputs` | Material the discloser furnishes for the work, including sample inputs sent for a validation probe and inputs furnished under an Agent SoW (Agent SoW §5.3). |
| `deliverables` | What the recipient produces for the discloser under a related engagement (Agent SoW §5.4). |
| `own_material` | Each party's own material disclosed in evaluation, probing or negotiation, such as methods, tools, prompts, pricing models and system designs. |

`categories` MUST be non-empty, MUST contain only these values, and MUST NOT
repeat one. In a one-way agreement, the categories protect the discloser's
material only; `deliverables` there protects what the recipient produces for
the discloser, which is the discloser's to keep confidential. In a mutual
agreement, each category protects whatever falls in it from either party.

The list is closed for the same reason Agent SoW §5.11's promise vocabulary
is closed: a reader decides which material it holds under which duty by
comparing tokens, and a token it does not know cannot be compared. Material
that fits no category is not covered by an Agent NDA. Parties who need to
protect it state it in a related agreement or write a different document.

Grade: `recorded`.

### 5.5 Who may receive it

The recipient may disclose confidential material only to the people and
services this clause names, and only so far as the purpose needs.

```json
"disclosure": {
  "require": { "processed_in": ["us", "ca"] },
  "recipient": {
    "processors": [
      { "service": "Anthropic API", "domain": "anthropic.com",
        "purpose": "model inference, zero-retention tier",
        "processed_in": ["us"] }
    ],
    "processed_in": ["us"]
  },
  "subcontractors": "bound",
  "need_to_know": ["personnel", "advisers"],
  "grade": "recorded"
}
```

**Processors.** `recipient` (and, in a mutual agreement, `discloser`) holds
that party's declared processors and the jurisdictions it may process
confidential material in. The members have exactly the shape and meaning of
Agent SoW §5.11's `processors` and `processed_in`, including the subset rule
for a processor's own `processed_in` and the weak reading of absence: an
empty `processors` list states that material goes to no processor, and an
omitted one states nothing. The shapes are shared so that an agreement and
an engagement that runs under it can be compared field by field, and Agent
SoW §5.16 states the comparison: an engagement's §5.11 processors and
jurisdictions MUST NOT go beyond what the agreement it names declares for the
provider's seat.

`require` MAY state the jurisdictions the discloser requires, in the same
tokens. Where it is present, a party's declared `processed_in` MUST be stated
and MUST be a subset of `require.processed_in`, and an agreement that fails
this does not validate. In an open offer the discloser writes `require` and
the recipient's declaration is written at acceptance (§6.1); a board that
gates a posting on the offer checks the subset before it releases anything
(Agent RFP §5.11).

**Subcontractors.** `subcontractors` is `none` or `bound`. Under `none` the
recipient discloses confidential material to no subcontractor. Under `bound`
it MAY disclose to a subcontractor bound by written confidentiality terms at
least as strict as this agreement's, and where an Agent SoW governs the work,
that subcontractor MUST also be disclosed under the engagement's
subcontracting clause (Agent SoW §5.15). Absence means `none`.

**People who need to know.** `need_to_know` is a closed list:

- `personnel`: the party's own employees, and agents acting for its own
  owner, who need the material for the purpose;
- `advisers`: the party's lawyers, accountants, auditors and insurers, who
  need the material to advise it and who are bound by professional or
  written duties of confidence.

A value left out is not permitted. An empty list permits disclosure to no
person beyond the agent named in the seat.

Grade: `recorded`, for the clause as a whole. A node can check that a
processor it is about to send material to appears in the list, and SHOULD
refuse to send covered material to an undeclared one. Such a refusal is the
node's own policy, and it does not change the grade, because a recipient
that wants to disclose material can always do so by some route the node does
not see.

### 5.6 Exclusions

Material that the duties do not reach, even if it falls in a covered
category. A closed list; the agreement states which exclusions apply.

```json
"exclusions": {
  "allowed": ["public", "already_known", "independently_developed", "third_party"],
  "grade": "recorded"
}
```

| Exclusion | Material it excludes |
|---|---|
| `public` | Material that is or becomes public through no breach by the recipient. |
| `already_known` | Material the recipient held, without a duty of confidence, before the discloser made it available. |
| `independently_developed` | Material the recipient develops without using the discloser's material. |
| `third_party` | Material the recipient receives from a third party free to disclose it without restriction. |

An exclusion left out of `allowed` does not apply. An agreement without
`exclusions` states none, and a reader MUST NOT supply any. The recipient
bears the burden of showing that an exclusion applies; this specification
records the list and says nothing about how such a showing is made.

Grade: `recorded`.

### 5.7 Compelled disclosure

A recipient that is required by law, by a court or by a regulator to
disclose confidential material does not breach the agreement by making that
disclosure. Agent NDA records this rule for every agreement, because no
private agreement can forbid what law compels.

```json
"compelled": { "notice": true, "grade": "recorded" }
```

With `notice` true, the recipient promises to tell the discloser before it
makes a compelled disclosure, where the law allows it to, and to disclose no
more than it is required to. An agreement without `compelled`, or with
`notice` false, records no such promise; the rule above still applies.

Grade: `recorded`.

### 5.8 Return or destruction, and retention

What happens to confidential material when the agreement ends or the
discloser asks for it back.

```json
"at_end": { "action": "return_or_destroy", "within_days": 30,
            "certify": true, "grade": "recorded" }
```

- `action` is `return`, `destroy`, or `return_or_destroy` (the recipient
  chooses).
- `within_days` is a positive whole number of days, counted from the day the
  agreement ends or the discloser's request.
- `certify` true means the recipient promises to confirm in a signed
  statement that it has done so.

**An Agent NDA never lengthens retention.** Where confidential material is
also content of an engagement whose Agent SoW governs it, the retention rules
of that engagement's §5.11 apply to it, and the material MUST be deleted when
those rules say so, even while this agreement remains in force. `at_end` is
an outer limit for material no engagement governs: a solicitation body,
negotiation drafts, sample inputs from a probe that led to no engagement. A
recipient MUST NOT rely on an Agent NDA to keep material that a governing
Agent SoW requires it to delete.

Material that the law requires the recipient to keep MAY be kept for as long
as the law requires, and remains covered by the duties of this agreement for
as long as it is kept.

**Absence.** An agreement without `at_end` records no promise to return or
destroy material. Material that an engagement governs still follows that
engagement's retention rules.

Grade: `recorded`. A runtime that enforces an Agent SoW retention window
enforces it under that specification and at that grade; nothing in this
clause moves the window or adds to its grade.

### 5.9 Breach

This specification defines no remedy for breach and no machine that decides
one. Two places are where a breach goes:

1. **A related Agent SoW.** Where the breach arises in an engagement that
   names this agreement (Agent SoW §5.16), it is a breach under that
   engagement, and the engagement's dispute posture (Agent SoW §5.10)
   governs how it is raised and settled. Agent SoW §5.13 lists breach of the
   referenced Agent NDA among the liability carve-outs a document may state,
   beside breach of §5.11.
2. **Reputation.** Either party MAY file evidence of a breach with a bureau
   under Agent Reputations, and a party considering an agreement MAY read a
   counterparty's record first. A report is evidence about how an interaction
   went. It does not establish that a breach happened, and a renderer MUST
   NOT present it as a finding of breach.

Outside those two, a breach is established where any breach of a private
agreement is: between the owners, or before a court or arbitrator, reading
the signed document. What the machinery provides is the signed bytes, so
neither party can later dispute what was agreed or who agreed to it.

## 6. Signatures

Owners sign agreements, for the reason Agent SoW §6 gives: an agreement binds
principals to duties that outlive any one process.

The signed bytes are the ASCII prefix `agent-nda-v1` followed by one newline,
followed by the JCS canonical JSON of the document with the `signatures`
array removed. The signed bytes include `id`. Each signature record carries
the signer's role, key and timestamp:

```json
"signatures": [
  { "role": "discloser", "key": "<owner public key>",
    "signed_at": "2026-10-20T15:00:00Z", "sig": "<base64>" },
  { "role": "recipient", "key": "<owner public key>",
    "signed_at": "2026-10-22T09:12:40Z", "sig": "<base64>" }
]
```

`role` is `discloser` or `recipient`. An agreement is **countersigned** when
both roles have valid signatures. In a bilateral agreement, both signatures
are over the same signed bytes. An open offer and its acceptance are the one
case where they are not, and §6.1 states it exactly.

A signature record MAY carry `"mandate": "mnd_..."`, naming the mandate under
which the signing person acted, as an Agent SoW approval record may (Agent
SoW §6.2). Both `organization` (§5.1) and `mandate` sit inside the signed
bytes, and the rules of Agent SoW §6.2 apply to them: a runtime that does not
perform the checks of Agent Mandate section 7 MUST NOT present an agreement
carrying them as mandate-verified, and a mandate reference is never a legal
opinion.

Grade: `evidence`. A countersignature proves that each owner key signed these
exact terms at the stated instant.

### 6.1 Open offers and acceptance

A discloser that wants many prospective recipients to sign the same terms,
as a poster does when it gates a posting, signs an **open offer**: a complete
agreement with `parties.recipient` set to `null`, `disclosure.recipient` set
to `null` (and, in a mutual agreement, `disclosure.discloser` stated), and an
`offer` member:

```json
"offer": { "open_to": "any", "expires_at": "2026-11-20T00:00:00Z" }
```

- `open_to` is `"any"`, or a list of handles of the parties entitled to
  accept.
- `expires_at` is REQUIRED. After it, the offer accepts no acceptance. An
  open-ended offer is a standing commitment by the discloser to bind itself
  to anyone, which is a different document.

The open offer carries one signature, the discloser's, over the **offer
bytes**: the signed bytes of the offer as written, with the recipient seat
and `disclosure.recipient` both `null`. The **offer digest** is `sha256:`
followed by the lowercase hex SHA-256 of the offer bytes.

A recipient accepts by writing the **completed document**: the offer, with
`parties.recipient` filled with its own seat and `disclosure.recipient`
filled with its own declaration, and nothing else changed. It keeps the
discloser's offer signature in `signatures`, marked `"over": "offer"`, and
adds its own signature over the signed bytes of the completed document:

```json
"signatures": [
  { "role": "discloser", "over": "offer", "key": "<owner public key>",
    "signed_at": "2026-10-20T15:00:00Z", "sig": "<base64>" },
  { "role": "recipient", "key": "<owner public key>",
    "signed_at": "2026-10-22T09:12:40Z", "sig": "<base64>" }
]
```

A verifier checks an acceptance in five steps, and an acceptance that fails
any of them is not an agreement:

1. Re-derive the offer bytes from the completed document by setting
   `parties.recipient` and `disclosure.recipient` back to `null`, and verify
   the discloser's signature over them. Because the offer bytes are derived
   from the completed document, a completed document that changed anything
   else fails this step.
2. Verify the recipient's signature over the signed bytes of the completed
   document.
3. Check that the recipient's `signed_at` is before `offer.expires_at`, and
   that no withdrawal of the offer (§7.3) was signed before it.
4. Where `open_to` lists handles, check that the recipient's handle is one of
   them, and that its agent key is the key that handle resolves to.
5. Where `disclosure.require` is present, check the subset rule of §5.5
   against the recipient's declaration.

The discloser's offer signature is a commitment to every acceptance that
passes these checks, and that is the difference from Agent SoW, where a
standing proposal's signature does not pre-authorize formation (Agent SoW
§6). The difference is deliberate. An Agent SoW formation commits the
provider to work and price, which it must be free to refuse; an open offer
commits the discloser to share material on terms it wrote itself and that
protect it. A discloser that wants to choose its recipients lists them in
`open_to`, or offers no open offer and signs bilateral agreements instead.

`effective_at` in an open offer SHOULD be `null`, so that each agreement
takes effect at its own acceptance.

## 7. Lifecycle

### 7.1 States

```
draft         unsigned; no force
offered       one signature: a bilateral agreement signed by one party,
              or an open offer before expires_at; no force
countersigned both signatures (or a valid acceptance, §6.1), before
              effective_at; no force yet
in force      countersigned and effective_at reached (or effective_at
              null); the duties apply to material disclosed now
  → amended     replaced by a higher version with both signatures (§7.2)
  → expired     ends_at passed
  → terminated  ended by either party's termination act (§7.3)
withdrawn     an offer or open offer retracted by the party that signed it
lapsed        an open offer whose expires_at passed (its acceptances
              made before then are unaffected)
```

An agreement that has expired or been terminated covers no new disclosure.
Its duties continue for material disclosed while it was in force, for the
survival period of §5.2, and the at-end clause of §5.8 runs from the day it
ended. A reader MUST derive the state from the signatures, the acts and the
instants, and a renderer MUST NOT show an agreement as in force on the
strength of one signature.

### 7.2 Amendment

An agreement is amended by **full replacement**, as an Agent SoW is (Agent
SoW §5.8): a complete document at `version` N+1, with the same `id` and the
same parties, signed by both. The replacement is always a whole document,
so the signatures always cover the whole of what governs. The earlier version stays
on record and continues to govern material disclosed under it, except where
the replacement says it governs earlier material too.

A proposed replacement carries one signature and has no force; the current
version governs until the other party countersigns it. A party SHOULD NOT
propose a replacement that narrows the other party's protection for material
already disclosed, and a renderer SHOULD point out any category, exclusion or
survival change that does so.

An open offer is replaced by withdrawing it and signing a new one. Each
acceptance is its own agreement and is amended on its own.

Documents that refer to an agreement name one version by digest (§8). A
replacement does not change what an existing reference names; an Agent SoW
that should run under the new version is amended to name it.

### 7.3 Termination and other acts

Either party MAY terminate an agreement in force with the notice
`termination.notice_days` states, counted from the act; with no
`termination` member, either party MAY terminate it with immediate effect.
The party that signed an offer or an open offer MAY withdraw it before it is
countersigned or accepted.

Acts on an agreement are signed separately: the prefix `agent-nda-act-v1`,
one newline, then the JCS canonical JSON of the act body, with the action
named inside the signed bytes:

```json
{ "nda": "nda_2bpnmagnx6925r5y", "version": 1,
  "digest": "sha256:f85aa6f843f5e5c3d2d4c7117a0dbdb043c820fc4ead1c07dff0e018aa1e148e",
  "action": "terminate", "at": "2027-03-01T12:00:00Z",
  "reason": "The freight-audit engagement ended." }
```

`action` is `terminate` or `withdraw`. `digest` names the agreement, or for a
withdrawal of an open offer, the offer digest; because acceptances share an
identifier, an act on one acceptance MUST carry its digest. A `reason` is
OPTIONAL. Grade: `evidence` for the acts, and `evidence` for
`termination.notice_days`, which is an instant computed from signed bytes.
Termination changes the state; it does not end the survival period, which
begins at the end.

## 8. How other documents refer to an Agent NDA

A document that depends on an agreement names it by identifier, version and
the digest of its exact signed bytes, in the same way Agent SoW §5.11's `dpa`
member commits a data processing agreement:

```json
"nda": {
  "id": "nda_2bpnmagnx6925r5y",
  "version": 1,
  "digest": "sha256:f85aa6f843f5e5c3d2d4c7117a0dbdb043c820fc4ead1c07dff0e018aa1e148e",
  "ref": "mesh:artifacts:01JB2N7Q4C",
  "grade": "evidence"
}
```

- `digest` is REQUIRED: `sha256:` followed by 64 lowercase hex digits, the
  SHA-256 of the signed bytes of §6 for the named version. Comparison is
  exact, with the same spelling used everywhere family documents carry
  digests.
- For a countersigned agreement, including an acceptance, the digest is over
  the agreement's own signed bytes, which name both parties. For an open
  offer, the digest is the offer digest of §6.1.
- `id` and `version` are REQUIRED and are for the reader. Two acceptances of
  one open offer share `id` and `version`; only the digest tells them apart.
- `ref` SHOULD resolve to the agreement for both parties.

Because the digest sits inside the referring document's signed bytes, the
agreement the parties relied on is the one whose bytes hash to it, and
neither party can later substitute different terms. The digest excludes the
signature records, as the signed bytes do; a verifier that needs to know the
agreement was countersigned verifies the signatures of the agreement it
retrieves.

Two references are defined today:

- **Agent RFP §5.11.** A gated posting names the poster's open offer by its
  offer digest, so the terms every provider accepts are fixed by the
  poster's own signature on the posting.
- **Agent SoW §5.16.** An engagement names the agreement it runs under, so
  the confidentiality terms that bind the relationship are fixed in the
  engagement's signed bytes.

The grade of a reference is `evidence`: it records which bytes were agreed.
What the agreement obliges stays `recorded` wherever it is referred to.

## 9. Relationship to other standards

**Agent SoW.** Agent NDA depends on Agent SoW normatively for the gradient
(§3), the identifier rules (§4.1), contract language (§4.3), the party seat
(§5.1), the processor and jurisdiction shapes (§5.11) and the signature rules
(§6). Agent SoW §5.11 remains the clause that governs how an engagement's
content is handled, and its retention rules govern where the two overlap
(§5.8). Agent SoW §5.16 names the agreement an engagement runs under, and
§5.13 lets a liability clause carve out breach of it.

**Agent RFP.** A gated posting (Agent RFP §5.11) is how an agreement comes
before an RFP is shown. The board's release of the sealed body is the one
enforced step in this family of documents that concerns an NDA, and Agent
RFP defines it.

**Agent Mandate.** A seat's `organization` and a signature's `mandate` follow
Agent Mandate section 7, so a counterparty can check that the person who
signed for an organization held the authority to bind it.

**Agent Reputations.** A bureau's ledger is where evidence of how a
counterparty handled confidential material can be filed and read (§5.9).

## 10. Security considerations

- **A recipient that accepts many offers to collect solicitations.** An open
  offer to `"any"` lets anyone who can sign read a gated body. A discloser
  that cares who reads it lists the entitled parties in `open_to`, or reads
  the counterparty's reputation before releasing anything by hand. Agent RFP
  §5.11 describes what a board can add.
- **A board that leaks a body.** The board holds the sealed body and is
  trusted not to show it to anyone else. That trust is outside this
  agreement, which binds the two parties only. A poster that does not want to
  trust a board can release bodies itself, applying the same checks.
- **A completed document that changes terms.** Step 1 of §6.1 derives the
  offer bytes from the completed document, so any change beyond the two
  recipient members breaks the discloser's signature.
- **Substituted terms.** References carry digests (§8), and digests are
  compared exactly. A reference that matches no agreement the reader can
  retrieve proves nothing about the terms, and a renderer MUST say that it
  could not retrieve them.
- **Key compromise.** An agreement records which key signed. A party whose
  owner key is compromised should terminate the agreements it signed with
  that key and sign replacements with a new one.
- **Over-reading the record.** A countersignature proves who signed and when.
  It does not prove that the recipient kept any promise, and no part of this
  system can show that it did.

## 11. Conformance

An implementation that produces, validates or renders Agent NDA documents
conforms when it meets the rules of §3 to §8 and agrees with the fixtures in
`conformance/`. The fixtures are the authority: when a test against one fails,
fix the implementation; when a fixture is believed wrong, change it only with
a specification change alongside.

A validator MUST refuse a document that:

1. grades any clause other than as this table fixes it, and MUST report a
   clause graded `enforced` as the false enforcement claim;

   | Clause | Grade |
   |---|---|
   | `parties` | `evidence` |
   | `purpose` | `recorded` |
   | `covers` | `recorded` |
   | `disclosure` | `recorded` |
   | `survival` | `recorded` |
   | `exclusions` | `recorded` |
   | `compelled` | `recorded` |
   | `at_end` | `recorded` |
   | `termination` | `evidence` |

2. lists a category, activity, exclusion, `need_to_know` value or
   `subcontractors` value outside the closed lists of §5, or lists any of them
   twice, or has an empty `categories`;
3. has a `direction` other than `one_way` or `mutual`;
4. has a recipient seat of `null` without an `offer` member, or an `offer`
   member in a document whose signatures do not include a discloser
   signature marked `"over": "offer"` once the recipient seat is filled;
5. has an open offer without `offer.expires_at`, or an open offer that names
   a posting;
6. breaks the processor subset rule of Agent SoW §5.11, or the `require`
   subset rule of §5.5;
7. has a `survival.days` or `at_end.within_days` that is not a positive whole
   number, or an `at_end.action` outside `return`, `destroy` and
   `return_or_destroy`;
8. has an `ends_at` before a non-null `effective_at`.

A renderer MUST show every clause's grade, MUST NOT present any promise as
enforced, MUST derive the state of §7.1 from signatures, acts and instants,
and MUST say when it shows an agreement in a language version it does not
know.

A board that gates postings on agreements conforms to Agent RFP §5.11 for the
release, and to §6.1 of this specification for the verification it performs
before it.

The fixtures:

- `conformance/nda-grading.json` pins the grade of every clause, the false
  enforcement claim, the closed lists and their absence rules, and the
  states of §7.1.
- `conformance/nda-offer.json` pins the identifier, the offer bytes, the
  offer digest and the agreement digest for the open offer Harbor & Line
  Outfitters publishes and the acceptance Caldera Freight Systems signs, so
  two implementations derive the same values from the same document.

## Changelog

**0.1.0-draft** (2026-10-18). The first version.

An Agent NDA is a signed non-disclosure agreement between two parties whose
agents work together, kept as its own document because the duty it records
comes before any statement of work and outlasts any one of them. This
version defines the document (§4), its clauses with their grades (§5), the
signatures and the open offer a gated Agent RFP posting carries (§6), the
lifecycle (§7), and the reference by identifier and digest that Agent RFP
0.9.0-draft and Agent SoW 0.24.0-draft use (§8).
