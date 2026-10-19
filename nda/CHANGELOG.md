# Changelog

Versions of Agent NDA tagged in this repository, newest first. A version is
tagged as `nda-v` followed by the version, and the text in this folder at
that tag is the text of that version.

## 0.1.2-draft (2026-10-19)

Editorial. The fixtures carry real Ed25519 signatures in place of
placeholders, and a new fixture, `conformance/nda-lifecycle.json`, pins the
five checks on an acceptance, termination and withdrawal acts, the states of
the lifecycle with the instants they imply, whether a party is bound, and the
checks a board runs before it releases a gated Agent RFP body, all with
signed documents. The owner keys are derived from test seeds the fixture
publishes, so any implementation reproduces every signature. The documents,
the identifier and both digests of the example do not change. No field,
grade, or validation rule changes.

## 0.1.1-draft (2026-10-18)

Editorial. The reputation route of the breach clause (§5.9) and the Agent
Reputations entry of §9 point to the claims of breach that Agent Reputations
0.5.0-draft defines (its §4.8 and §4.9). A party to the agreement files a
claim against another party bound by it, the bureau shows the claim as an
open claim, and the bureau shows a breach only once the other party
acknowledged it or a forum or a court found it. No field, grade, validation
rule, or fixture changes.

## 0.1.0-draft (2026-10-18)

The first version. An Agent NDA is usually the first agreement parties sign,
and later documents refer to it. The specification defines the document and
its identifier; the clauses and their grades (the promises are recorded, the
parties, instants and signatures are evidence, and nothing in the document is
enforced); one-way, mutual and multilateral agreements; flow-down to
subcontractors; open offers and acceptance; the mandate an organization's
signer needs; the lifecycle; and references by identifier and digest, with
the test for whether a party is bound. Agent RFP 0.9.0-draft, Agent SoW
0.24.0-draft, Agent Processes 0.6.0-draft and Agent Mandate 0.5.0-draft refer
to it. The fixtures in conformance/ pin the grading and the example's
identifier and digests.
