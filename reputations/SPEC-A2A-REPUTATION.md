# Agent Reputations: A2A Reputation Extension

**Version:** 0.1.3-draft
**Status:** Working Draft
**Date:** 2026-10-18

An A2A Agent Card is the agent's own account of itself. Reputation is,
definitionally, the account other parties give, and it cannot ride in the
card without stopping being that. This extension therefore carries no score,
no rating, and no cached report. It is a data-only card entry that says
where the agent's reputation report can be fetched: which bureau holds the
evidence, and under what subject identifier the bureau knows this agent. The
consumer asks the bureau; the card only says where to ask.

This document defines an extension to the A2A protocol
(https://a2a-protocol.org/latest/specification/). It is not part of the A2A
specification and is not endorsed by the A2A project. The Agent Reputations
specification (spec.html on this site) is the authority for every term this
document borrows: reports, enrollment states, scoring, and the bureau's
signing key. Where this document and that specification disagree, that
specification wins.

---

## 1. Conformance language and terminology

The key words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are to be
interpreted as described in RFC 2119.

- **Card**: an A2A Agent Card, the self-description document an A2A agent
  serves, typically at `/.well-known/agent-card.json`.
- **Bureau**: a service that ingests interaction evidence, maintains a
  tamper-evident ledger, computes scores under a published formula, and
  answers queries with signed reports (Agent Reputations specification,
  section 1).
- **Subject**: an agent about which a bureau holds evidence, identified by
  the identifier the bureau resolves: a Personal Agent Naming handle or an Agent Name Service (ANS) name (Agent
  Reputations specification, section 1).
- **Report**: the bureau's signed answer to a resolution query (Agent
  Reputations specification, section 8). Reports carry `issued_at` and
  `expires_at` and are deliberately short-lived.
- **Enrollment state**: one of `RATED`, `UNPROVEN`, `UNENROLLED`,
  `WITHDRAWN` (Agent Reputations specification, section 3.1).
- **Consumer**: any reader of a card carrying this extension, whether or not
  it goes on to query the bureau.

## 2. Extension URI

```
https://agentreputations.com/extensions/a2a-reputation/v1
```

The URI identifies this extension in a card's `extensions` array. Future
revisions that change the payload shape or the verification rule take a new
version segment; consumers match the URI exactly.

## 3. The declaration

The extension is declared as an `AgentExtension` object inside the card's
`capabilities.extensions` array:

```json
{
  "uri": "https://agentreputations.com/extensions/a2a-reputation/v1",
  "description": "Reputation: where to fetch this agent's signed bureau report",
  "required": false,
  "params": {
    "bureaus": [
      {
        "bureau": "https://agentreputations.com",
        "subject": "Coder.ana@example.org"
      }
    ]
  }
}
```

Rules:

1. **This is a data-only extension.** It defines no methods, no headers, and
   no request-time activation. Consistent with A2A's own guidance for
   data-only extensions, `required` MUST NOT be `true`. A card that marks
   this extension required is misdeclaring it, and a consumer MAY ignore the
   flag rather than refuse the agent.
2. `params.bureaus` is REQUIRED and MUST contain at least one entry. Each
   entry names one bureau the agent is enrolled with. An agent enrolled with
   several bureaus lists them all; the order carries no meaning.
3. Per entry, both fields are REQUIRED. `bureau` is the HTTPS base URL that
   identifies the bureau; it is where the bureau publishes its
   specification, its report signing key, and its query interface. `subject`
   is the agent's identifier as that bureau knows it, in the identifier
   system the bureau resolves.
4. **The payload is a pointer, never a score.** An entry MUST NOT carry a
   score, a bound, a sample size, an enrollment state, a report, or a digest
   of a report. The next section says why.

## 4. Why the card carries no report

The terms extension in this family commits to its referenced document by
digest, because a standing proposal is durable: the offer holds until it is
withdrawn, and binding the card to exact bytes is the protection. A
reputation report is the opposite kind of object. It is recomputed from the
ledger on every query, it decays by design (silence slides a score back
toward UNPROVEN), and it carries an `expires_at` minutes to hours after
`issued_at`. A carried or cached report is stale the moment it is issued,
and every hop it rides through (a card, a cache, a catalog) makes it staler
and easier to cherry-pick: an agent would embed its best report ever, not
its current one.

So the rule is structural, not advisory: the card names where to ask, and a
consumer that wants the answer asks the bureau. A consumer SHOULD fetch a
fresh report from the bureau at the moment it needs one, and MUST NOT treat
any reputation claim embedded in a card, in card prose, in skill
descriptions, or in a cached copy of a report, as current. Card prose
stating a score is not backed by this extension and never can be.

## 5. Verification

A consumer uses a listed entry in three steps:

1. **Query the bureau** at its published interface for the subject named in
   the entry. How to query is the bureau's own documented interface, found
   from `bureau`; this extension does not define the transport.
2. **Verify the report** as the Agent Reputations specification section
   8.1 requires. Section 8.1.1 defines the signed bytes, section 8.1.2 the
   bureau's published key set and how a consumer pins it, and section 8.1.3
   the steps of verification. The `bureau` of the entry is the URL the
   consumer finds the key set from, and the report's own `bureau` member must
   name the same bureau. A consumer MUST discard a report that fails any step
   of section 8.1.3, including a report whose signature fails, is absent, or
   is made by a key outside the bureau's pinned key set.
3. **Check the binding.** The report answers for `subject`. A consumer MUST
   confirm that this subject identifier actually denotes the agent the card
   describes, by resolving the identifier in its own system (Personal Agent Naming or ANS)
   and comparing the identity it binds, its key or its domain, against the
   agent the card presents. Where the consumer cannot confirm that binding,
   the report states nothing about this card's agent.

What a verified report proves is exactly what the bureau's trust model says
it proves (Agent Reputations specification, section 11): this bureau
received these signed events from these identified parties, kept them
unmodified, and applied the named formula. It does not prove the evaluators
were wise, and it does not prove the subject will perform tomorrow.

## 6. Reading the report

Rules the bureau already imposes on its consumers apply unchanged when the
path to the report started from a card, and three of them are restated here
because a card-mediated reader is the most likely to get them wrong:

1. **Enrollment states are answers, not blanks.** `UNPROVEN` means enrolled
   with insufficient evidence; `UNENROLLED` means never opted in;
   `WITHDRAWN` means enrolled and then left, and the exit is part of the
   record. A consumer MUST show these states as they are, MUST NOT render
   one as another, and MUST NOT render any of them as an empty field or a
   missing agent.
2. **Sample size beside any score.** A consumer that displays a score MUST
   display `n_eff` and the enrollment state beside it. A score without its
   sample size is a forgery of confidence.
3. **The report is advisory, never a gate.** It informs the consumer's
   choice; it does not make it, and nothing in this extension or the
   bureau's specification authorizes refusing, admitting, or ranking an
   agent mechanically on a report alone. A consumer weighs the report as
   one input, with the sample size and evidence context in view.
4. **A report about the agent's organization is about the organization.** The
   bureau's organization report (Agent Reputations specification, section
   8.5) groups the records of several agents and serves no score of its own. A
   consumer MUST NOT present it, or any member's report, as the report of the
   agent this card describes. The same holds for the sender block of a report
   (section 4.7): it counts other parties' refusals of the agent's requests and
   is never a quality score.

## 7. Honesty rules

1. A card carrying this extension asserts exactly this: the agent claims
   enrollment with the named bureaus under the named subject identifiers.
   It is not certification, not endorsement, not a score, and not evidence
   of past conduct. Consumers, catalogs, and user interfaces MUST NOT
   present it as any of those.
2. **Naming a bureau is not evidence the bureau is trustworthy.** Anyone
   can operate a bureau, and an agent picks which ones to enroll with. The
   extension tells the consumer which bureau to ask; the consumer chooses
   which bureaus it believes, and a report from a bureau the consumer has
   no reason to trust is a claim, not a finding. Cross-bureau
   corroboration is future work in the bureau's own specification
   (section 13), not something this extension provides.
3. Absence states nothing. A card without this extension is a card that is
   silent about reputation. A consumer MUST NOT read absence as a bad
   record, a good record, or any record, and MUST NOT rank or filter agents
   as if absence were a negative assertion. An unenrolled agent and an
   agent that simply did not update its card look identical from here, and
   that is all absence can mean.
4. A failed query or failed verification also states nothing about the
   agent's reputation. It is a signal worth surfacing (section 8); it is
   not a low score.

## 8. Security considerations

- **Reputation borrowing.** The sharpest attack this extension enables is a
  card naming a subject that is somebody else, an established agent with a
  good record. The digest had this covered in the terms extension; here the
  binding check of section 5 step 3 is the defense, and it is mandatory. A
  consumer that skips it is letting any card wear any agent's record.
- **Bureau substitution.** An attacker who cannot forge a bureau's
  signature can still stand up a flattering bureau and name it. That is not
  a protocol failure; it is why honesty rule 2 exists. Consumers maintain
  their own view of which bureaus they credit, exactly as they maintain
  which certificate authorities they trust.
- **Stale pointer.** The bureau URL can rot or the bureau can be down. An
  unreachable bureau means no report, and no report states nothing (honesty
  rule 4). A consumer MUST NOT fall back to a cached report beyond its
  `expires_at` and present it as current.
- **Downgrade by omission.** An agent whose record soured can drop the
  extension from its card, and absence states nothing, so the drop erases
  the pointer without erasing the record. A consumer that knows a subject
  identifier from an earlier card MAY still query the bureau; enrollment
  history at the bureau is permanent, and `WITHDRAWN` is served as
  `WITHDRAWN`. The card controls the pointer, never the ledger.
- **Organization borrowing.** A card can name, as its `subject`, a
  well-rated sibling, or an organization's anchor in place of an agent. The
  binding check of section 5 step 3 refuses both, because neither resolves to
  the key the card presents, and section 6 rule 4 keeps an organization report
  from standing in for the agent's own.
- **Cherry-picked bureaus.** An agent enrolled with three bureaus can list
  only the flattering one. The extension cannot prevent that and does not
  claim to; it is one more reason the report is advisory and the consumer's
  bureau choices are its own.

## 9. Out of scope

Four things are deliberately not in this document:

- **The bureau's own protocol.** Enrollment, evidence submission, outcome
  taxonomies, scoring, and the report format are the Agent Reputations
  specification's, defined there and only referenced here.
- **Submitting evidence over A2A.** A reporter or evaluator interface
  carried over A2A would be a method extension, a separate document.
- **Cross-bureau aggregation.** Combining reports from several bureaus into
  one figure is a consumer policy this extension does not define.
- **Terms.** What the agent offers and at what price is the terms
  extension, a sibling document
  (https://agentsow.com/extensions/a2a-terms/v1).

## 10. Relationship to other work

This extension is the second in a pair. The terms extension answers "on
what terms" with a durable document committed by digest; this one answers
"on what record" with a pointer to a perishable report fetched fresh. The
asymmetry between them is the design: commitments are pinned, judgments are
looked up. The A2A extension ecosystem at the time of writing addresses
payments, credentials, compliance verdicts, tracing, timestamps, and
routing; none of it carries reputation, and the nearest thing, traceability,
records what happened in a task rather than what a population of
counterparties concluded across many. The Agent Reputations bureau was
developed alongside Agent Messaging, and nothing in this extension
requires it: any bureau meeting the referenced specification's
obligations, and any A2A agent able to add one card entry, can use it.

---

## Changelog

**0.1.3-draft** (2026-10-18). Section 5 step 2 points to the Agent
Reputations specification section 8.1 for the signed bytes, the bureau's keys,
and the steps of verification, which Agent Reputations 0.6.0-draft defines
there, in place of describing the signature itself. The tag and the canonical
JSON this extension named are the ones section 8.1 defines. The step adds
that the entry's `bureau` is where the consumer finds the key set, and that
the report must name the same bureau. The payload is unchanged.

**0.1.2-draft** (2026-10-18). Restates two rules of Agent Reputations
0.4.0-draft for card readers, with no change to the payload or the
verification rule: an organization report or a sender block is never the
report of the card's agent (section 6 rule 4), and the binding check refuses
a card that names a sibling or an anchor as its subject (section 8).

**0.1.1-draft** (2026-10-18). Editorial, with no normative change.
Personal Agent Naming is written out, the Agent Name Service is named on first
use, and section 10 names Agent Messaging rather than a platform.

**0.1.0-draft** (2026-08-11). The card points at the record it cannot carry.

First draft, the second A2A card extension in this family. The shape
question was settled before the first line: a reputation embedded in a card
is a self-description wearing someone else's clothes, stale at issue,
staler at every cache, and selectable by the one party who must not select
it. So the payload is a pointer, bureau plus subject, and everything else
follows from the bureau's own discipline: fetch fresh, verify against the
pinned signing key, show UNPROVEN and UNENROLLED as the answers they are,
never show a score without its sample size, and treat the report as advice
rather than a gate. The extension adds one rule of its own, the binding
check, because a pointer can point at anyone's record and a digest cannot
defend a document that is recomputed hourly; the consumer confirms the
subject identifier denotes the card's agent before believing anything. The
multi-bureau reality is stated instead of smoothed over: the card says
which bureaus the agent enrolled with, naming a bureau proves nothing about
the bureau, and which bureaus to believe is the consumer's judgment, made
exactly the way it makes its certificate authority choices. Prior art was
checked in the same sweep as the terms extension: nothing in the A2A
extension ecosystem carries reputation.
