# Changelog

Versions of Agent NDA tagged in this repository, newest first. A version is
tagged as `nda-v` followed by the version, and the text in this folder at
that tag is the text of that version.

## 0.3.0-draft (2026-10-25)

A signature or an act an agent drafted. A signature record (§6) and the body
of an act (§7.3) may carry `proposed`, the marker of the Common Agent
Specification 0.37.0-draft §7.9, where an agent drafted the record or the
act and the signer approved it. The draft bytes are the record's signature
bytes, or the act's signed bytes, computed without the marker and without
the signer's `signed_at`, so the signer writes the instant it actually
signs. A record's draft names the agreement by its digest, so the agent
drafted the signature over exactly the agreement the signer signed. The
marker does not change which key may sign for a seat, and a record or act
whose marker fails is refused. The closed member lists of §6 and §7.3 name
`proposed`, and §11 points at the Common Agent fixture that pins an act and
a signature record carrying it. The minor version moves because a verifier
built against 0.2.0-draft refuses a record or act that carries the new
member.

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
- A signer writes its own `signed_at` and `at`. A verifier that receives an
  acceptance, such as a board, checks expiry and withdrawal against the
  instant it received it as well as against `signed_at`, records that
  instant, and checks a mandate at it too (§6.1 step 3, §6.2). An act takes
  effect for a verifier no earlier than when it received it, and its `at`
  never precedes its `signed_at` (§7.3).
- The receiving verifier, the party a record or act was delivered to,
  records the instant of receipt and resolves each seat's owner then. A seat
  without an organization is confirmed only where an attested registry owner
  of its agent (Agent Messaging §8.6) is the seat's `owner_key`. An
  unreachable registry, an unlisted agent or an unattested default owner
  leaves the owner unconfirmed: the agreement stands, and every decision
  that rides on the binding treats the owner as not bound (§6, §8.1). An
  open offer MAY say `"owners": "any"` to accept unconfirmed recipients, at
  the risk the discloser accepts that a party unlists its agent to avoid a
  contradiction (§6.1).
- A signature record and an act carry only the members this specification
  defines, and `over` is valid only on the discloser's record of an open
  offer or its acceptance (§6, §7.3).

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
