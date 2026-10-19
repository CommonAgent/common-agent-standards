# Agent NDA Specification

**Version:** 0.1.1-draft
**Status:** Working Draft
**Date:** 2026-10-18

An **Agent NDA** is a signed non-disclosure agreement between parties whose
software agents work together. It is usually the first agreement they sign.
It says what is confidential, what it may be used for, who may see it, and
for how long. The documents the parties sign later refer to it.

An Agent NDA is a JSON document. It names each party by its agent's key and
its accountable owner. An agent can read it, check its signatures, and know
which terms cover the material it holds.

It adopts the enforcement gradient of Agent SoW §3. Most of what an NDA
promises happens inside a party's own walls, where no runtime can see. So the
promises are recorded, the signatures are evidence, and nothing in the
document is enforced.

This specification describes what the document records. It is not legal
advice. It is transport-neutral and requires no particular network, message
bus, or vendor.

---

## 1. Motivation

A relationship between two organizations usually starts with an NDA. It is
signed before anything private is shown, and it often outlasts every piece of
work that follows. The later documents depend on it. An RFP is shown under
it. A statement of work runs under it. A process run with outside agents
needs every participant bound by it.

Those later documents cannot carry the duty themselves. A clause inside an
Agent SoW does not exist before the statement of work is signed, and each
statement of work would carry its own copy. So Agent NDA is a separate signed
document, and the others refer to it by identifier and digest (§8).

Today these documents refer to it:

- **Agent RFP** (https://agentrfp.net). A gated posting shows a public
  summary and releases its sealed body only to a provider that has accepted
  the poster's Agent NDA (Agent RFP §5.11).
- **Agent SoW** (https://agentsow.com). A validation probe and a negotiation
  happen before any statement of work exists, under an NDA already in force.
  Each statement of work then names the NDA it runs under (Agent SoW §5.16).
- **Agent Processes** (https://agentprocesses.ai). A process document names
  the NDA that every outside participant in a run must be bound by (Agent
  Processes 0.6.0-draft §4, `confidential-under:`).
- **Agent Mandate** (https://agentmandate.net). An organization says who may
  sign an Agent NDA for it (Agent Mandate 0.5.0-draft §7.2).

More of the Common Agent Standards will refer to it as the family grows.

## 2. Conformance language and terminology

The key words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are to be
interpreted as described in RFC 2119.

- **Agreement**: one Agent NDA document, at one version.
- **Discloser**: a party whose confidential material is protected.
- **Recipient**: a party that receives the material and takes on the
  duties of §5.
- **One-way agreement**: only the discloser's material is protected.
  **Mutual agreement**: two parties, each both a discloser and a recipient.
  **Multilateral agreement**: three or more parties, each a discloser and a
  recipient to every other (§5.1).
- **Confidential material**: material a discloser makes available that falls
  in a category the agreement covers (§5.4).
- **Open offer**: an agreement signed by the discloser with the recipient
  seat left empty, which a qualifying party may accept (§6.1).
- **Acceptance**: the recipient's countersignature over the completed
  document formed from an open offer.
- **Flow-down agreement**: an agreement by which a party binds its own
  subcontractor, naming the agreement it flows from (§5.5).
- **Board**, **Posting**, **Gated posting**: as defined in Agent RFP §2 and
  §5.11.
- **Owner**, **Agent**, **Node**, **Engagement**, **Processor**: as defined
  in Agent SoW §2 and §5.11.

## 3. The enforcement gradient

Agent NDA adopts the enforcement gradient of Agent SoW §3 normatively. Every
clause carries exactly one grade, `enforced`, `evidence`, or `recorded`, with
the meanings and rules given there. A document that claims more enforcement
than its runtime delivers is not conformant.

An NDA asks a recipient to act in private. It must use the material only for
the purpose, show it only to certain people, and destroy it at the end. No
runtime can watch any of that. So:

1. **The promises are `recorded`.** Purpose, the covered categories, the
   limits on disclosure, survival, the exclusions, compelled disclosure, and
   return or destruction are promises no runtime can verify. Breach is
   established outside the system (§5.9).
2. **The facts are `evidence`.** Who the parties are, when the agreement
   starts and ends, and who signed are carried in signed bytes. A
   countersignature proves that an owner key signed these exact terms at a
   stated instant.
3. **Nothing in an agreement is `enforced`.** An agreement MUST NOT grade any
   of its clauses `enforced`, and a document that does is not valid. No
   runtime can refuse a recipient's private use of what it already holds.
4. **Enforced steps happen before material moves, outside the document.**
   Three are defined elsewhere. A board releases a gated RFP body only after
   it verifies an acceptance (Agent RFP §5.11). A process runtime hands a
   phase or a handoff to an outside agent only after it checks that the
   agent's owner is bound (§8.1; Agent Processes 0.6.0-draft §4). A platform
   holds an organization's signature until the signer's mandate is checked
   (§6.2; Agent Mandate 0.5.0-draft §7.2). Each refusal happens before the
   recipient holds anything, so each is `enforced` where it runs. Once the
   material arrives, its handling is a `recorded` promise.

A renderer MUST show each clause's grade wherever it shows the clause. It
MUST NOT present any promise as enforced, whatever enforced step came before.

## 4. Document model

### 4.1 Encoding and identity

An agreement is a JSON document in JCS (RFC 8785) canonical form. Its
identifier is:

```
nda_<crockford32(sha256(canonical bytes of version 1, minus id and signatures))[0..16]>
```

The rules of Agent SoW §4.1 apply, with `nda_` as the prefix. The hashed
bytes exclude `id` and `signatures`. `crockford32` is lowercase Crockford
base32 with no padding, hyphens or check symbol, cut to 16 characters. The
hashed bytes and the signed bytes of §6 are different byte strings, and an
implementation MUST NOT use one for the other.

#### 4.1.1 Minting

An identifier is minted once, when the version-1 document is created. The
rules of Agent SoW §4.1.1 apply. No later step re-derives it, and a verifier
MUST NOT reject an agreement because its identifier does not re-derive. A
reader relies on the signatures (§6) and the digest (§8).

An acceptance keeps the identifier of the open offer it accepts (§6.1). Each
acceptance is a separate agreement, told apart by its recipient and its
digest.

### 4.2 Top-level shape

```json
{
  "nda": "v1",
  "id": "nda_dtzv6z8tans9k5s6",
  "version": 1,
  "language": { "id": "agent-nda-standard-language", "version": 1,
                "sha256": "<hash of that version's template text>" },
  "direction": "one_way",            // §5.1
  "parties": { },                    // §5.1
  "offer": { },                      // §6.1, open offers only
  "flows_from": { },                 // §5.5, flow-down agreements only
  "effective_at": null,              // §5.2
  "ends_at": "2027-11-30T00:00:00Z", // §5.2
  "purpose": { },                    // §5.3
  "covers": { },                     // §5.4
  "disclosure": { },                 // §5.5
  "survival": { },                   // §5.2
  "exclusions": { },                 // §5.6
  "compelled": { },                  // §5.7
  "at_end": { },                     // §5.8
  "termination": { },                // §7.3
  "signatures": [ ]                  // §6
}
```

`nda`, `id`, `version`, `language`, `direction`, `parties`, `ends_at`,
`purpose`, `covers` and `signatures` are REQUIRED. The other members are
OPTIONAL, and §5 says what each absence means. Every clause carries a
`grade`, fixed by this specification (§11). A clause with a different grade
does not validate.

### 4.3 Contract language

`language` pins the template text the fields are read in, as Agent SoW §4.3
pins contract language. A renderer MUST use the version named. A renderer
that does not know it MUST say so and show the signed fields verbatim.

## 5. Clauses

### 5.1 Parties and direction

Each seat has the shape of one seat of an Agent SoW parties clause (Agent SoW
§5.1): the agent's public key, an optional handle, and the accountable owner.
A seat MAY carry `organization`, naming the organization it signs for
(§6.2).

```json
"direction": "one_way",
"parties": {
  "discloser": { "agent": "<public key>",
                 "handle": "Petrel.mari@harborandline.example",
                 "owner": "Harbor & Line Outfitters",
                 "organization": "org_7k2m9q4w1x8e5r3t" },
  "recipient": { "agent": "<public key>",
                 "handle": "Sable.audit@calderafreight.example",
                 "owner": "Caldera Freight Systems" },
  "grade": "evidence"
}
```

`direction` is `one_way`, `mutual` or `multilateral`.

- **`one_way`**: two seats, `discloser` and `recipient`. Only the
  discloser's material is protected, and only the recipient takes on the
  duties of §5.
- **`mutual`**: the same two seats. Each party is both a discloser and a
  recipient. The seat names say only who signed where.
- **`multilateral`**: `parties.members`, a list of 3 to 16 seats, replaces
  the two seats. Every member is a discloser and a recipient to every other
  member. A duty one member owes, it owes to each of the others.

```json
"direction": "multilateral",
"parties": {
  "members": [
    { "agent": "<public key>", "handle": "Petrel.mari@harborandline.example",
      "owner": "Harbor & Line Outfitters", "organization": "org_7k2m9q4w1x8e5r3t" },
    { "agent": "<public key>", "handle": "Sable.audit@calderafreight.example",
      "owner": "Caldera Freight Systems" },
    { "agent": "<public key>", "handle": "Heron.desk@tidewatercustoms.example",
      "owner": "Tidewater Customs Brokers" },
    { "agent": "<public key>", "handle": "Kestrel.rates@northgaterates.example",
      "owner": "Northgate Rate Data" }
  ],
  "grade": "evidence"
}
```

No two members may share an agent key. Each member signs the same bytes
(§6). A multilateral agreement is in force only when every member has
signed. Adding or removing a member is an amendment (§7.2), signed by every
member of the new version. A multilateral agreement has no open offer.

Use a multilateral agreement when several parties will pass their own
material to each other, as the outside participants of a process run often
do. When every party receives only one discloser's material, a one-way
agreement with each of them, or an open offer, is enough.

The recipient seat is `null` in an open offer (§6.1) and filled in every
other agreement.

Grade: `evidence`. The agreement records which keys and owners signed.
Identity verification is the transport's job (Agent SoW §5.1). A node SHOULD
NOT treat material as covered unless the agent it came from, or goes to, is
named in a seat.

### 5.2 Effective date, term and survival

`effective_at` and `ends_at` are first-order instants. `effective_at` is when
the duties begin. `null` means the agreement takes effect when the last
required signature is made. `ends_at` is when the agreement stops covering
new disclosures. Both are `evidence`.

`survival` says how long the duties last for material disclosed while the
agreement was in force. It counts whole days from the day the agreement
ends, at `ends_at` or earlier by termination (§7.3).

```json
"ends_at": "2027-11-30T00:00:00Z",
"survival": { "days": 730, "grade": "recorded" }
```

`days` is a positive whole number. Grade: `recorded`.

**Absence.** Without `survival` there is no survival period, and a reader
MUST NOT supply one. The duties end when the agreement ends.

### 5.3 Purpose

What the recipient may use the material for. The main duty an NDA records is
that the recipient uses the material for this purpose and nothing else.

```json
"purpose": {
  "statement": "Evaluating and responding to Harbor & Line's freight-audit posting, which names this offer, and running validation probes, negotiating, and performing any Agent SoW between the parties that names this agreement.",
  "activities": ["evaluate_solicitation", "validation_probe",
                 "negotiation", "perform_engagements"],
  "grade": "recorded"
}
```

- `statement` is REQUIRED. It is the sentence a person reads, and it is the
  operative statement of the purpose.
- `activities` is a closed list, so software can tell which documents fall
  inside the purpose:
  - `evaluate_solicitation`: evaluating and responding to an Agent RFP
    posting whose gate names this agreement or its offer (Agent RFP §5.11);
  - `validation_probe`: running Agent SoW validation probes between the
    parties (Agent SoW §13);
  - `negotiation`: negotiating terms between the parties, including drafts
    that are never signed;
  - `perform_engagements`: performing an Agent SoW between the parties that
    names this agreement (Agent SoW §5.16);
  - `process_runs`: performing phases of an Agent Processes run whose
    document names this agreement in `confidential-under:` (Agent Processes
    0.6.0-draft §4).
- `named` MAY list existing documents by identifier, such as
  `{ "rfp": "rfp_...", "version": 1 }` or `{ "sow": "sow_..." }`. They are
  inside the purpose too.

An activity left out is outside the purpose. A node SHOULD warn when a
document names an agreement whose purpose does not include it.

An open offer MUST NOT name the posting that gates on it. The posting commits
to the offer's digest (Agent RFP §5.11), so the reference runs one way.
`evaluate_solicitation` is how an offer covers that posting.

Grade: `recorded`.

### 5.4 What is confidential

A closed list of categories the parties choose. A category left out is not
covered, and a reader MUST NOT infer that it is.

```json
"covers": {
  "categories": ["solicitation", "agreement_terms", "relationship",
                 "inputs", "deliverables"],
  "grade": "recorded"
}
```

| Category | What it covers |
|---|---|
| `solicitation` | A solicitation the discloser makes available, such as the sealed body of a gated Agent RFP posting. |
| `agreement_terms` | The terms of related agreements between the parties, signed or not: statements of work, proposals, responses, drafts, prices, and this agreement. |
| `relationship` | The fact that the parties work together, are negotiating, or have signed this agreement. |
| `inputs` | Material the discloser furnishes for the work, including probe samples and Agent SoW inputs (Agent SoW §5.3). |
| `deliverables` | What a recipient produces for the discloser (Agent SoW §5.4), or for the owner of a process run. |
| `own_material` | A party's own material shown during evaluation, probing or negotiation, such as methods, tools, prompts, pricing models and system designs. |

`categories` MUST be non-empty, MUST hold only these values, and MUST NOT
repeat one. In a one-way agreement the categories protect the discloser's
material only. In a mutual or multilateral agreement they protect whatever
falls in them from any party.

The list is closed so that a reader can compare tokens. Material that fits
no category is not covered by an Agent NDA.

Grade: `recorded`.

### 5.5 Who may receive it

A recipient may pass confidential material only to the people and services
this clause names, and only as far as the purpose needs.

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

**Processors.** Each party that receives material declares its processors
and the jurisdictions it may process material in. `recipient` holds the
recipient's declaration, and `discloser` holds the discloser's in a mutual
agreement. In a multilateral agreement, `members` is a list of declarations,
one per member, each naming its seat by `agent`:

```json
"members": [
  { "agent": "<public key>", "processors": [ ], "processed_in": ["us"] }
]
```

A declaration has exactly the shape and meaning of Agent SoW §5.11's
`processors` and `processed_in`. That includes the subset rule for a
processor's own `processed_in` and the reading of absence: an empty list
says no processor, and an omitted one says nothing. The shapes are shared so
an engagement can be compared with the agreement it runs under (Agent SoW
§5.16).

`require` MAY state the jurisdictions the discloser requires. Where it is
present, every declared `processed_in` MUST be stated and MUST be a subset of
it. An agreement that fails this does not validate. In an open offer the
recipient's declaration is written at acceptance (§6.1).

**Subcontractors.** `subcontractors` is `none` or `bound`. Absence means
`none`. Under `bound`, a party MAY pass material to a subcontractor it has
bound by a **flow-down agreement**: an Agent NDA between the party and the
subcontractor that carries a `flows_from` member naming this agreement.

```json
"flows_from": { "id": "nda_dtzv6z8tans9k5s6", "version": 1,
                "digest": "sha256:<digest of the upstream agreement>" }
```

A flow-down agreement MUST be at least as strict as the agreement it flows
from. The test compares fields:

- its `covers.categories` include every upstream category;
- its `purpose.activities` are a subset of the upstream ones;
- the subcontractor's processors and `processed_in` are a subset of the
  party's own upstream declaration;
- its `survival.days` is at least the upstream value, where one is stated;
- its `at_end.within_days` is at most the upstream value, where one is
  stated;
- its `exclusions.allowed` and `need_to_know` are subsets of the upstream
  ones;
- its own `subcontractors` is `none` or `bound`, and any further flow-down
  follows the same rule.

A flow-down agreement that fails the test does not bind the subcontractor
for §8.1. Where an Agent SoW governs the work, the subcontractor MUST also
be disclosed under its subcontracting clause (Agent SoW §5.15).

**People who need to know.** `need_to_know` is a closed list:

- `personnel`: the party's own employees, and agents acting for its owner;
- `advisers`: its lawyers, accountants, auditors and insurers, bound by
  professional or written duties of confidence.

A value left out is not permitted. An empty list permits no person beyond
the agent named in the seat.

Grade: `recorded`. A node SHOULD refuse to send covered material to a
processor its party has not declared. That refusal is the node's own policy
and does not change the grade.

### 5.6 Exclusions

Material the duties do not reach, even when it falls in a covered category.
A closed list. The agreement states which exclusions apply.

```json
"exclusions": {
  "allowed": ["public", "already_known", "independently_developed", "third_party"],
  "grade": "recorded"
}
```

| Exclusion | Material it excludes |
|---|---|
| `public` | Material that is or becomes public through no breach by the recipient. |
| `already_known` | Material the recipient held, free of any duty of confidence, before it was disclosed. |
| `independently_developed` | Material the recipient develops without using the discloser's material. |
| `third_party` | Material the recipient receives from a third party that is free to share it. |

An exclusion left out does not apply. Without `exclusions` none applies, and
a reader MUST NOT supply any. The recipient must show that an exclusion
applies.

Grade: `recorded`.

### 5.7 Compelled disclosure

A recipient that the law, a court or a regulator requires to disclose
material does not breach the agreement by doing so. This rule holds for every
agreement.

```json
"compelled": { "notice": true, "grade": "recorded" }
```

With `notice` true, the recipient promises to tell the discloser first,
where the law allows, and to disclose no more than required. Without
`compelled`, or with `notice` false, there is no such promise. The rule
above still holds.

Grade: `recorded`.

### 5.8 Return or destruction, and retention

What happens to the material when the agreement ends, or when the discloser
asks for it back.

```json
"at_end": { "action": "return_or_destroy", "within_days": 30,
            "certify": true, "grade": "recorded" }
```

- `action` is `return`, `destroy`, or `return_or_destroy` (the recipient
  chooses).
- `within_days` is a positive whole number of days from the end or the
  request.
- `certify` true means the recipient promises a signed statement that it
  has done so.

**An Agent NDA never lengthens retention.** When material is also content of
an engagement, that engagement's Agent SoW §5.11 retention rules apply. The
material MUST be deleted when those rules say so, even while the agreement is
in force. `at_end` is the outer limit for material no engagement governs,
such as a solicitation body, negotiation drafts, or probe samples that led to
no engagement.

Material the law requires a recipient to keep MAY be kept as long as the law
requires. It stays covered while it is kept.

**Absence.** Without `at_end` there is no promise to return or destroy.
Engagement content still follows its own retention rules.

Grade: `recorded`.

### 5.9 Breach

This specification defines no remedy and no machine that decides breach. A
breach goes to two places:

1. **A related Agent SoW.** A breach that arises in an engagement naming this
   agreement (Agent SoW §5.16) is a breach under that engagement. Its dispute
   posture applies (Agent SoW §5.10). Agent SoW §5.13 lets a liability clause
   carve out breach of the referenced Agent NDA.
2. **Reputation.** A party to the agreement MAY file a claim of breach with a
   bureau under Agent Reputations 0.5.0-draft §4.8, against another party
   bound by it, naming the agreement by the reference of §8 and citing the
   records that show the material reached that party. The bureau shows the
   claim as an open claim, and shows a breach only once the other party
   acknowledged it or a forum or a court found it (Agent Reputations §4.9). A
   party MAY read a counterparty's record before signing. A renderer MUST NOT
   present an open claim, or any other part of a report, as a finding of
   breach unless the report shows it as an upheld breach.

Otherwise a breach is settled as for any private agreement: between the
owners, or before a court or arbitrator, reading the signed document.

## 6. Signatures

Owners sign agreements. An agreement binds principals to duties that outlive
any one process (Agent SoW §6).

The signed bytes are the ASCII prefix `agent-nda-v1`, one newline, and the
JCS canonical JSON of the document with `signatures` removed. The signed
bytes include `id`.

```json
"signatures": [
  { "role": "discloser", "key": "<owner public key>",
    "signed_at": "2026-10-20T15:00:00Z", "sig": "<base64>" },
  { "role": "recipient", "key": "<owner public key>",
    "signed_at": "2026-10-22T09:12:40Z", "sig": "<base64>" }
]
```

`role` is `discloser` or `recipient`, or `member` in a multilateral
agreement. A `member` record MUST carry `agent`, naming the seat it signs
for. An agreement is **countersigned** when every seat has a valid
signature. All signatures are over the same signed bytes, except for an open
offer and its acceptance (§6.1).

Grade: `evidence`.

### 6.1 Open offers and acceptance

A discloser that wants many recipients to sign the same terms signs an
**open offer**. A poster gating an RFP does this. An open offer is a complete
one-way or mutual agreement with `parties.recipient` and
`disclosure.recipient` set to `null`, and an `offer` member:

```json
"offer": { "open_to": "any", "expires_at": "2026-11-20T00:00:00Z" }
```

- `open_to` is `"any"`, or a list of handles entitled to accept.
- `expires_at` is REQUIRED. No acceptance is valid after it.

The discloser signs the **offer bytes**: the signed bytes of the offer, with
both recipient members `null`. The **offer digest** is `sha256:` and the
lowercase hex SHA-256 of the offer bytes.

A recipient accepts by writing the **completed document**. It fills
`parties.recipient` with its seat and `disclosure.recipient` with its
declaration, and changes nothing else. It keeps the discloser's signature,
marked `"over": "offer"`, and adds its own over the completed document:

```json
"signatures": [
  { "role": "discloser", "over": "offer", "key": "<owner public key>",
    "signed_at": "2026-10-20T15:00:00Z", "sig": "<base64>" },
  { "role": "recipient", "key": "<owner public key>",
    "signed_at": "2026-10-22T09:12:40Z", "sig": "<base64>" }
]
```

A verifier checks an acceptance in five steps. An acceptance that fails any
step is not an agreement.

1. Set `parties.recipient` and `disclosure.recipient` back to `null`, and
   verify the discloser's signature over the resulting offer bytes. Any
   other change to the document fails here.
2. Verify the recipient's signature over the completed document.
3. Check that the recipient signed before `offer.expires_at`, and before any
   withdrawal of the offer (§7.3).
4. Where `open_to` lists handles, check that the recipient's handle is one of
   them and resolves to its agent key.
5. Where `disclosure.require` is present, check the subset rule of §5.5.

The discloser's signature commits it to every acceptance that passes. This
differs from an Agent SoW standing proposal, whose signature does not
pre-authorize formation (Agent SoW §6). An Agent SoW formation commits a
provider to work and price, which it must be free to refuse. An open offer
commits the discloser only to terms it wrote to protect itself. A discloser
that wants to choose its recipients lists them in `open_to`.

`effective_at` in an open offer SHOULD be `null`, so each agreement takes
effect at its own acceptance.

### 6.2 Who may sign for an organization

Anyone with a key can sign an Agent NDA for themself. Signing for an
organization binds the organization, so it needs authority.

When a seat carries `organization`, the signature for that seat MUST carry
`mandate`, naming a mandate of that organization that holds the `nda` power
(Agent Mandate 0.5.0-draft §6 and §7.2). This applies to every act on an
agreement: signing an offer or an open offer, countersigning, accepting,
joining a multilateral agreement, amending, terminating and withdrawing.

```json
{ "role": "discloser", "key": "<owner public key>",
  "signed_at": "2026-10-20T15:00:00Z", "sig": "<base64>",
  "mandate": "mnd_3f8c1n6z9v4b7q2m" }
```

The check is Agent Mandate §7.2. The signer holds the mandate, the mandate is
in force and its chain verifies, and it holds `nda`. A mandate MAY narrow
which categories its holder may agree to (`scope.nda_categories`). There is
no price ceiling to check, because an NDA commits no price.

A seat without `organization` is a person or party acting for itself. It
needs no mandate.

Grade: `enforced` where a platform or board holds the act until the check
passes and refuses it otherwise. A board releasing a gated body (Agent RFP
§5.11) SHOULD run the check on a recipient seat that names an organization.
Elsewhere the mandate reference is `evidence`: the counterparty can verify
the chain, but nothing refused the act. A runtime that does not run the
check MUST NOT present an agreement as mandate-verified. A mandate reference
is never a legal opinion.

## 7. Lifecycle

### 7.1 States

```
draft          unsigned; no force
offered        some but not all seats signed, or an open offer before
               expires_at; no force
countersigned  every seat signed (or a valid acceptance, §6.1), before
               effective_at; no force yet
in force       countersigned and effective_at reached (or effective_at
               null); covers material disclosed now
  → amended      replaced by a higher version signed by every seat (§7.2)
  → expired      ends_at passed
  → terminated   ended by a termination act (§7.3)
withdrawn      an offer retracted by the party that signed it
lapsed         an open offer whose expires_at passed (acceptances made
               before then are unaffected)
```

An agreement that has expired or been terminated covers no new disclosure.
Its duties continue for the survival period of §5.2, and the at-end clause
of §5.8 runs from the day it ended. A reader MUST derive the state from the
signatures, acts and instants. A renderer MUST NOT show an agreement as in
force while any seat is unsigned.

### 7.2 Amendment

An agreement is amended by **full replacement**, as an Agent SoW is (Agent
SoW §5.8). The replacement is a complete document at `version` N+1 with the
same `id`, signed by every seat. The signatures always cover the whole of
what governs. In a one-way or mutual agreement the parties stay the same. In
a multilateral agreement, adding or removing a member is a replacement signed
by every member of the new version.

A proposed replacement has no force until every seat signs it. The earlier
version keeps governing material disclosed under it, unless the replacement
says otherwise. A party SHOULD NOT propose a replacement that narrows
protection for material already disclosed, and a renderer SHOULD point out
any change that does.

An open offer is replaced by withdrawing it and signing a new one. Each
acceptance is its own agreement and is amended on its own.

A reference names one version by digest (§8). A replacement does not change
an existing reference. An Agent SoW that should run under the new version is
amended to name it.

### 7.3 Termination and other acts

A party MAY terminate an agreement in force with the notice
`termination.notice_days` states, counted from the act. Without
`termination`, the termination takes effect at once. In a multilateral
agreement a member's termination ends its own participation. The agreement
stays in force among the others while at least two remain. The party that
signed an offer MAY withdraw it before it is countersigned or accepted.

Acts are signed separately: the prefix `agent-nda-act-v1`, one newline, and
the JCS canonical JSON of the act body.

```json
{ "nda": "nda_dtzv6z8tans9k5s6", "version": 1,
  "digest": "sha256:04b87bb12cda549043a33fb4b24e5513d1eaaf34f25ade3c05e88f7e569a6ec9",
  "action": "terminate", "at": "2027-03-01T12:00:00Z",
  "reason": "The freight-audit engagement ended." }
```

`action` is `terminate` or `withdraw`. `digest` names the agreement, or the
offer digest for a withdrawn offer. Acceptances of one offer share an
identifier, so an act on one acceptance MUST carry its digest. `reason` is
OPTIONAL. An act signed for a seat that names an organization MUST carry
`mandate` (§6.2). Grade: `evidence`. Termination starts the survival period.

## 8. How other documents refer to an Agent NDA

A document that depends on an agreement names it by identifier, version and
the digest of its signed bytes. Agent SoW §5.11's `dpa` member commits a
data processing agreement the same way.

```json
"nda": {
  "id": "nda_dtzv6z8tans9k5s6",
  "version": 1,
  "digest": "sha256:04b87bb12cda549043a33fb4b24e5513d1eaaf34f25ade3c05e88f7e569a6ec9",
  "ref": "mesh:artifacts:01JB2N7Q4C",
  "grade": "evidence"
}
```

- `digest` is REQUIRED. It is `sha256:` and 64 lowercase hex digits, the
  SHA-256 of the signed bytes (§6) of the named version. Comparison is exact.
- For a countersigned agreement, including an acceptance, the digest covers
  its own signed bytes. For an open offer it is the offer digest (§6.1).
- `id` and `version` are REQUIRED. Acceptances of one offer share both, so
  only the digest tells them apart.
- `ref` SHOULD resolve to the agreement for every party.

The digest sits inside the referring document's signed bytes. Nobody can
later substitute other terms. The digest excludes signatures, so a verifier
that needs to know the agreement was signed checks the signatures of the
agreement it retrieves.

These references are defined today:

- **Agent RFP §5.11.** A gated posting names the poster's open offer by its
  offer digest.
- **Agent SoW §5.16.** An engagement names the agreement it runs under.
- **Agent Processes 0.6.0-draft §4.** A process document names, in
  `confidential-under:`, the agreement every outside participant must be
  bound by.

A reference is `evidence`: it records which bytes were agreed. What the
agreement obliges stays `recorded`.

### 8.1 Whether a party is bound

Agent Processes, and any later standard that needs every participant bound,
asks one question: is this party's owner bound by the named agreement? The
answer is yes when one of these holds and the agreement is in force:

1. The owner's key signed a seat of the named agreement. For a multilateral
   agreement that means a member seat.
2. The named reference is an open offer, and the owner is the recipient of
   an acceptance of it that passes §6.1.
3. The owner is the subcontractor in a flow-down agreement (§5.5) whose
   `flows_from` names an agreement that binds the party above it, and the
   flow-down agreement passes the strictness test. The check repeats hop by
   hop until it reaches the named agreement.

Where a seat names an organization, the mandate check of §6.2 is part of
whether that seat's signature counts.

A runtime that answers this question before material moves, and refuses when
the answer is no, enforces that refusal (§3, point 4). It cannot enforce
what the party does with the material afterwards.

## 9. Relationship to other standards

**Agent SoW.** Agent NDA takes from Agent SoW the gradient (§3), the
identifier rules (§4.1), contract language (§4.3), the party seat (§5.1), the
processor and jurisdiction shapes (§5.11) and the signature rules (§6).
Agent SoW §5.11 still governs an engagement's content, and its retention
rules win where the two overlap (§5.8). Agent SoW §5.16 names the agreement
an engagement runs under.

**Agent RFP.** A gated posting (Agent RFP §5.11) releases its body only to a
provider that has accepted the poster's agreement.

**Agent Processes.** A process document names the agreement every outside
participant shares (Agent Processes 0.6.0-draft §4). A runtime checks §8.1
before it starts a phase held by an outside agent or delivers a handoff to
one.

**Agent Mandate.** An organization says who may sign an Agent NDA for it
(Agent Mandate 0.5.0-draft §7.2), and §6.2 applies that check.

**Agent Reputations.** A bureau's ledger holds claims of breach of an
agreement and their outcomes, and its reports show them in the NDA record
(§5.9; Agent Reputations 0.5.0-draft §4.8, §4.9).

## 10. Security considerations

- **Collecting solicitations.** An open offer to `"any"` lets anyone who can
  sign read a gated body. A discloser that cares who reads it lists the
  entitled parties in `open_to`, or checks reputation first.
- **A board that leaks a body.** A board holds the sealed body, and the
  agreement does not bind the board. A poster that does not trust a board can
  release bodies itself with the same checks.
- **Changed terms at acceptance.** Step 1 of §6.1 rebuilds the offer bytes
  from the completed document, so any other change breaks the discloser's
  signature.
- **Substituted terms.** Digests are compared exactly (§8). A renderer that
  cannot retrieve the agreement a digest names MUST say so.
- **A weak flow-down.** A subcontract that is less strict than the upstream
  agreement does not count as binding (§5.5, §8.1).
- **Key compromise.** A party whose owner key is compromised should terminate
  the agreements it signed with that key and sign replacements.
- **Reading too much into a signature.** A signature proves who signed and
  when. Nothing in this system shows that a recipient kept its promises.

## 11. Conformance

An implementation conforms when it meets §3 to §8 and agrees with the
fixtures in `conformance/`. The fixtures are the authority. When a test
fails, fix the implementation. Change a fixture only with a specification
change.

A validator MUST refuse a document that:

1. grades a clause other than as this table fixes it, and MUST report a
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
   `subcontractors` value outside the closed lists of §5, lists one twice,
   or has an empty `categories`;
3. has a `direction` other than `one_way`, `mutual` or `multilateral`;
4. is multilateral with fewer than 3 or more than 16 members, two members
   sharing an agent key, an `offer` member, or a `member` signature without
   `agent`;
5. has a recipient seat of `null` without an `offer` member;
6. has an open offer without `offer.expires_at`, or one that names a posting;
7. breaks the processor subset rule of Agent SoW §5.11 or the `require`
   subset rule of §5.5;
8. has a `survival.days` or `at_end.within_days` that is not a positive whole
   number, or an `at_end.action` outside the three values;
9. has an `ends_at` before a non-null `effective_at`;
10. has a seat with `organization` whose signature carries no `mandate`.

A renderer MUST show every grade, MUST NOT present a promise as enforced,
MUST derive the state from signatures, acts and instants, and MUST say when
it does not know the language version.

The fixtures:

- `conformance/nda-grading.json` pins the grades, the false enforcement
  claim, the closed lists, absence, multilateral agreements, the flow-down
  test, the mandate rule and the states of §7.1.
- `conformance/nda-offer.json` pins the identifier, the offer bytes and both
  digests for Harbor & Line Outfitters' open offer and Caldera Freight
  Systems' acceptance.

## Changelog

**0.1.1-draft** (2026-10-18). Editorial. The reputation route of §5.9 and
the Agent Reputations entry of §9 point to the claims of breach that Agent
Reputations 0.5.0-draft defines: a party to the agreement files a claim, the
bureau shows it as an open claim, and it shows a breach only once the other
party acknowledged it or a forum or a court found it. No field, grade, or
validation rule changes.

**0.1.0-draft** (2026-10-18). The first version.

An Agent NDA is usually the first agreement parties sign, and later
documents refer to it. This version defines the document (§4); the clauses
and their grades (§5), including multilateral agreements and flow-down to
subcontractors; signatures, open offers and the mandate an organization's
signer needs (§6); the lifecycle (§7); and references by identifier and
digest, with the test for whether a party is bound (§8). Agent RFP
0.9.0-draft, Agent SoW 0.24.0-draft, Agent Processes 0.6.0-draft and Agent
Mandate 0.5.0-draft refer to it.
