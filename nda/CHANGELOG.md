# Changelog

Versions of Agent NDA tagged in this repository, newest first. A version is
tagged as `nda-v` followed by the version, and the text in this folder at
that tag is the text of that version.

## 0.2.0-draft (2026-10-19)

Signatures cover their own records, seats name the key that signs for them,
and acts have a defined shape. This version is breaking: a 0.1.x signature
does not verify under it.

- Each signature signs its own record (§6). The record carries
  `digest`, the digest of the bytes it covers, and the signature is over the
  prefix `agent-nda-sig-v1` and the canonical record with `sig` removed. So
  `signed_at`, which the expiry check of §6.1 reads, and `mandate` can
  no longer change without breaking the signature. The signed bytes, the
  agreement digest and the offer digest are defined as before.
- A seat without an organization carries `owner_key`, and only that key signs
  for it. A seat with an organization carries none, and its signer's key is
  the `holder.key` of the mandate the record cites (§5.1, §6, §6.2).
- An act is `{ act, signature }`, with the acting seat in `by`, and the signed
  bytes cover the signature record too (§7.3).
- `sig` is canonical base64 with padding, so each signature has exactly one
  valid string (§6).
- A verifier that receives an acceptance, such as a board, checks expiry and
  withdrawal against the instant it received it (§6.1, step 3).

The acceptance in the specification's example now carries Caldera Freight
Systems' `owner_key`, so its agreement digest changes to
`sha256:98e111dee46ccf35e88bf863bd9e6021fb6d635c48a53a751f27ec2802c89c15`. The
identifier and the offer digest do not change. All three fixtures are
regenerated with real signatures under the new rules.

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
