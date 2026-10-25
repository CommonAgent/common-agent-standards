# Changelog

Versions of Agent Reputations tagged in this repository, newest first. A version is
tagged as `reputations-v` followed by the version, and the text in this folder at
that tag is the text of that version. The history of SPEC.md comes from jeffrschneider/feedback, and the history of the A2A Reputation extension from the repository of agentreputations.com.

## 0.12.0-draft (2026-10-25)

The owner signs an attestation. §6.1 said the evaluator's agent key signs an attestation, while Agent SoW §15 said the reviewing owner signs a review, so one judgment had two signers. An attestation, and a value judgment under §6.6, is now signed with the evaluator's owner key: the owner of the evaluator's agent as the registry verified it through an `owner_attestation`, never a default owner with no attestation, or, for an interaction under an Agent SoW, the `owner_key` of the evaluator's seat, and the two are the same key where both are known. An agent may draft the attestation for its owner and submits the marker of the Common Agent Specification 0.37.0-draft §7.9 beside it in the same submission, whose draft bytes are the statement in full. A bureau accepts no marker added later, records the marker, refuses an attestation whose marker fails, and shows that an agent drafted it. An attestation signed with the agent's key and not the owner's is rejected, and one recorded under 0.11.1-draft or earlier stays in the ledger as it was recorded. §1 defines the evaluator as the agent's owner, §2 says a subject is its agent key and an attestation is its owner's, and §6.2 rule 2 checks the owner key. No tag, field or formula changes. The minor version moves because a bureau built against 0.11.1-draft accepts attestations this version rejects.

## 0.11.1-draft (2026-10-20)

A witness named after the first commitment, by a bureau that named none before, has a defined start. §4.1.1 said how a witness joins through a change of the witness list, and not what list a bureau that names no witness serves, so a bureau could put a late witness on the first list, where rule 1 lets it start only at the first commitment, which it can no longer co-sign. A bureau that names no witness now serves an empty `witnesses` list, or none, and a consumer pins either as the empty list. Its first witness joins in a change from the empty list whose `after` is the latest commitment; no witness signs that change, because the empty list has none. A consumer that pinned the empty list accepts that witness on the bureau's word alone, and one that first sees the key set later learns the empty first list from the change's `previous`. §8.1.3 step 7 now says that a report resting on a commitment whose named witness list is empty is unanchored, shown as the bureau naming no witness, and never counted as anchored. A bureau MUST NOT name such a witness on the first list. No signed bytes change, so the patch version moves.

## 0.11.0-draft (2026-10-20)

A witness that joins mid-chain has a defined start. Rule 1 of §4.1.1 said how a witness starts at a bureau's first commitment and not how one added through `witness_changes` starts. A change of the witness list now carries `after`, the commitment current when it takes effect, which the witnesses before it co-signed, or `null` before the first commitment. A joining witness's record begins there: its first co-signature is of the next commitment, and it never co-signs that commitment or any before it. The list before a change is named for every commitment up to `after` and the new list for every one after it, and §8.1.3 step 7 checks each commitment against the list named for its `seq`. `conformance/fdbk-heads-v1.json` gains a change adding a third witness after the second commitment, a third commitment co-signed by all three, and four refused cases. The minor version moves because the change object gains a member inside its signed bytes, so a change signed under 0.10.0-draft does not verify under this version.

## 0.10.0-draft (2026-10-20)

The claimant's `filed` counts are no longer public. Under rules 2 and 6 of §4.9, one filing moved the respondent's public `open.count` and the claimant's public `filed.open` at the same moment, so anyone polling public reports could tell who filed against whom and that the two had an agreement, which rule 4 protects. A bureau now MUST serve `filed` only in the party's own subject-scoped excerpt and in a respondent's excerpt beside a claim by that party, and never in a report another reader can fetch. This removes the correlated signal entirely. Publishing on a fixed batch schedule was considered and not chosen: with few claims in a batch, the two changes still line up. The counts stay useful where a pattern of dismissed claims matters, to the respondent facing the claimant and, through it, to the forum. The example report drops `filed`. A new fixture, `conformance/fdbk-nda-record-v1.json`, and a check in `reference.mjs` pin what each reader is served. The minor version moves because a bureau built against 0.9.0-draft publishes `filed`, which this version forbids.

## 0.9.0-draft (2026-10-19)

A bureau may keep a rejected claim of breach of an Agent NDA by its digest.
Until this version §4.8 had a rejected claim recorded with its reason, and
§4.9 rule 8 had the respondent's excerpt carry it with every record it
cites. Anyone who holds an agent key can file a claim against anyone, so a
bureau that kept every rejected claim in full let any filer write data of its
choosing into another subject's permanent history, without bound.

- §4.8, What a rejection keeps: a bureau MAY keep a rejected claim as its
  digest, the number of the failing check and the reason, and SHOULD bound
  the rejections it records a day per claimant and per respondent. A
  respondent that wants the whole claim asks the claimant for it, and the
  digest checks it. A claim whose signature does not verify, or whose
  signing key resolves to no identity, MAY be refused unrecorded.
- §4.9 rule 8 carries rejected claims in that form.
- §4.8 defines the claim's digest: `sha256:` and the lowercase hex SHA-256
  of the claim's JCS, the bytes answers, acknowledgments and withdrawals
  sign over.

The new file `conformance/fdbk-nda-claim-v1.json` fixes a signed claim with
its signed bytes, signature and digest, the rejection kept of it, and two
changed claims that must not verify, and `reference.mjs` reproduces it. The
minor version moves because a respondent's excerpt from a bureau conforming
to this version may hold a rejected claim without its document, which
0.8.0-draft did not allow.

## 0.8.0-draft (2026-10-19)

A bureau may keep one log per subject (§4.1.1). Until this version §4.1 asked
for one append-only log chained across every subject, in which erasing one
subject's history, which the law or the subject's own account closing can
require of a bureau, breaks the hash of every later entry for everyone.

A bureau that keeps one log per subject keeps what one log gave, that it
cannot show readers different histories or rewrite one it has shown, with a
chain of commitments:

- At least daily it publishes a commitment over a sparse Merkle tree of
  height 256 with one slot per subject, at the SHA-256 of the name's
  canonical caseless form (Unicode D145: NFD, full case folding at Unicode
  15.1.0, NFD), the form Personal Agent Naming 0.10.3 compares handles in. A slot holds the subject's head, the tombstone of its erasure, or
  nothing, so a subject has one head and an absent subject can be proved
  absent.
- Each commitment carries a sequence number and `prev`, the hash of the
  previous one's signed bytes. It is signed under `fdbk-heads-v1` with the
  report signing key, and within 24 hours every witness the bureau's key set
  names must co-sign it under `fdbk-heads-cosign-v1`. A witness co-signs only
  the commitment that extends the last one it co-signed for the bureau, so it
  never co-signs two with one `seq`. A public append-only log may stand in
  only when it refuses a second entry for one `bureau` and `seq`.
- The witness list is pinned with the keys and changes additively, by
  changes every witness on the earlier list signs under `fdbk-witnesses-v1`,
  which the key set lists in `witness_changes`.
- Every slot carries forward: a head moves only up its own log, leaves only
  for a tombstone, and a tombstone gives way only to a new log that names
  the erasure in `after_erasure`.
- Commitments are kept and served by sequence number, with a proof for any
  slot of any of them.
- Reports carry `log`: a head of the subject's log and a commitment that
  holds exactly that head. §8.1.3 step 7 is required for every report that
  carries `log`, and a consumer that cannot fetch the commitment or the
  proof says the report is unanchored.
- A privacy note says what slot keys over guessable names reveal, and names
  a key from a verifiable random function, as in CONIKS, as a later option.
- §8.1.1 and §8.1.2 rule 4 name the commitment's tag, and the key's `use`
  governs commitments as it does reports.

The new file `conformance/fdbk-heads-v1.json` fixes four pairs of slot keys,
a witness change, two commitments co-signed by two witnesses, four proofs
and fifteen refused cases, and `reference.mjs` reproduces it with the case
folding in `conformance/casefolding-15.1.0.json`, which is Unicode data
under the Unicode License V3 (`conformance/LICENSE-UNICODE`). The
minor version moves because a bureau conforming to 0.7.0-draft with one log
stays conforming, while one with a log per subject conforms only from this
version, and only with the commitments.

## 0.7.0-draft (2026-10-19)

A claim of breach cites an agreement whose signatures are bound to their seats. Check 2 of §4.8 now also requires that each signature on the cited agreement is bound to its seat, as Agent NDA 0.2.0-draft defines binding: a signature by a key the seat does not name does not make a party to the agreement, and an owner the registry could not confirm fails the check as a contradicted one does. The example claim of §4.8 names the Agent NDA example by its new agreement digest, because that version added `owner_key` to the example's recipient seat, and its material digest is the new digest of the Agent RFP example body, which now carries a nonce. The minor version moves because a bureau built against 0.6.0-draft accepts a claim whose agreement carries an unbound signature, which this version refuses.

## 0.6.0-draft (2026-10-18)

Report signing, test vectors, and the age of an event. The A2A Reputation
extension moves to 0.1.3-draft, which points to §8.1 for the signature in
place of describing it. Its extension URI, and those of the A2A Terms and A2A
Interview extensions of Agent SoW, resolve to a page about the extension
on each site, written by the site's builder.

- §8.1 defines how a report is signed. Before this version it said that
  signing followed Personal Agent Naming §5.3 verbatim, which signs canonical
  JSON with no tag, while the A2A Reputation extension said the bureau signs
  the tag `fdbk-report-v1`. The two could not both be followed.
- The signed bytes are the tag (`fdbk-report-v1` for a report,
  `fdbk-org-report-v1` for an organization report), one line feed, and the JCS
  (RFC 8785) canonical JSON of the whole signed object in UTF-8, the
  tagged-signature convention of Agent SoW §6 and Agent Mandate §4 (§8.1.1).
  Every member of the signed object is covered, including members a reader
  does not know. `bureau_key`, `bureau_kid`, and `bureau_sig` sit outside the
  signed bytes, and the envelope holds nothing else.
- The signature is Ed25519 (RFC 8032) in base64 with padding, and the key is
  the 32-byte public key in the same base64. A key id is the first 12
  hexadecimal digits of the SHA-256 of the key's base64 text, as Personal Agent
  Naming's reference registrar derives it.
- A bureau publishes its key set at `GET <bureau>/api/bureau-key`, in the form
  of Personal Agent Naming §5.3 with `use: "fdbk-report-signing"`, rotates
  additively, and keeps a retired key listed for at least the validity of the
  reports it signed (§8.1.2). A consumer finds the key set from the bureau URL
  it already holds, never from the report, pins it per bureau, and extends the
  pin only on an additive rotation.
- A consumer verifies a report in six steps: the envelope, the bureau, the
  key, the signature over the canonical form of the object it parsed, the
  time window with at most 60 seconds of grace, and the answer (§8.1.3).
- §7.2 states what an event's age is measured from: the end of the interaction
  it scores, to the instant the score is computed, in days of 86,400 seconds
  without rounding. An attestation takes the age of its interaction.
- §7.3 and §7.5 state that `n_eff` is the sum of the weights and never counts
  a portfolio prior, so a prior moves the mean and the bound and never moves a
  new agent to RATED. This is the reading the organization report of §8.5
  already showed, with a member at an `n_eff` of 6.1 under a prior of 10 events.
- §14 points to the conformance folder: `fdbk-score-1.json`, thirteen
  ledgers with their expected `a`, `b`, `mean`, `sd`, `lcb`, `n_eff`, state, and
  pool; `fdbk-report-v1.json`, a published test key, two JCS cases, a signed
  report and a signed organization report with their exact bytes and
  signatures, and eight reports that verification must refuse; and
  `reference.mjs`, a script with nothing outside Node.js that reproduces both.
  The repository's workflow runs it on every change.
- The formula version stays `fdbk-score-1`, because the outcome values and the
  arithmetic of §7.3 are unchanged.

The version moves to 0.6.0-draft, a minor version, because a conforming
bureau's obligations change. A bureau that signed reports with no tag, served
its key at another address, or counted a portfolio prior in `n_eff` does not
conform to this version without a change.

## 0.5.0-draft (2026-10-18)

Claims of breach of an Agent NDA. The A2A Reputation extension is unchanged at
0.1.2-draft. Agent NDA moves to 0.1.1-draft in the same change, with an
editorial line that points its breach clause here.

- Claim of breach, claimant, respondent, and upheld breach are defined (§1),
  with the ledger actions `nda_claimed`, `nda_answered`, and `nda_resolved`
  (§4.1).
- A party to an Agent NDA files a signed claim (`fdbk-nda-claim-v1`) against
  another party bound by the same agreement (§4.8). The claim names the
  completed agreement by identifier and digest, the categories the material
  falls in, and at least one record that the material reached the respondent
  while the agreement covered it: an Agent RFP release record, an Agent SoW
  task record of an engagement that names the agreement, or a delivery fact
  from a configured reporter. The bureau checks the signatures, the seats, the
  categories, the record, and the window, and records the claim as open. It
  does not decide whether a leak happened.
- A claim is upheld only by the respondent's signed acknowledgment
  (`fdbk-nda-ack-v1`), an arbiter verdict under the role the parties bound or
  appointed, a settlement both owners signed, or a court's finding the bureau
  checked under a published procedure. It can also be dismissed, withdrawn,
  set aside, or lapse. The claim, the records it cites, the respondent's
  silence, a refund, a termination, and a dispute that ended with no finding
  never uphold it. The respondent may answer on the record
  (`fdbk-nda-answer-v1`).
- The 30-day attestation window does not apply. A claim may be filed until a
  filing period (RECOMMENDED 365 days) after the agreement's duties end at
  the end of its survival period. An open claim lapses after an open period
  (RECOMMENDED 365 days), and a later resolution still lands. Claims are shown
  for a record period (RECOMMENDED five years).
- The NDA record (§4.9) lists each upheld breach with its date, basis,
  categories, and direction, counts open claims by distinct claimant anchor,
  and keeps dismissed, withdrawn, set aside, and lapsed claims visible in
  their states. It names neither the agreement nor the claimant, carries the
  claimant's own record of the claims it filed, needs no enrollment, and lands
  on the party in the respondent's seat and on its organization report.
- The outcome code `NDA_BREACH` is added (§5). It is never the code of an
  interaction, never enters a pool, and cannot be named in an attestation
  (§6.2). Agent SoW dispute rows are added to §4.4.
- Reports and organization reports gain the `nda` block, which a consumer
  display that shows the score must show whenever it holds an upheld breach
  or an open claim (§8.1, §8.2, §8.3, §8.5). §9 notes that Agent NDA promises
  never score. Bureau obligations 14 and 15 and the new published values are
  added (§10), with entries in the trust model (§11), the attacks (§12.1), and
  the scope (§13).
- The formula version stays `fdbk-score-1`. Nothing added enters a pool, so no
  score computed under 0.4.0-draft moves.

## 0.4.0-draft (2026-10-18)

Requests stopped before the work, the sender, and organizations. The A2A
Reputation extension moves to 0.1.2-draft.

- Operator, sender, stop, and organization are defined (§1). An operator is
  whoever runs an agent and answers for it, as the Common Agent Specification
  defines the term, identified by the operator identity the agent's card or
  Descriptor names.
- A stop is a request refused or held before the subject saw it, by a rule, a
  screener, or a person (§4.6). It is recorded as the ledger action `stopped`
  about the sender, and never enters the intended recipient's records. A table
  says how each case is recorded: Agent SoW scope, volume, and qualification
  refusals, screening holds that the owner blocked, released, or left open,
  screening flags, door decisions, the inbound protections, budget and input
  answers, guest standing, and Agent Mandate §7 refusals. A stop is accepted
  only from a configured reporter, with the sender's own signature on the
  request.
- Four outcome codes are added, none of which enters quality (§5): `REFUSED`
  for an agent's own refusal of a harmful or out-of-scope request, kept out of
  `decline_rate`; `REFUSED_UNSTATED` for a refusal on a ground no declaration
  or document states; `UNAVAILABLE` for a refusal caused by the subject's own
  condition; and `STOPPED`. Agent SoW gate refusals gain rows in §4.4.
- An attestation on an interaction with no work (`DECLINED`, `REFUSED`,
  `REFUSED_UNSTATED`, `UNAVAILABLE`, `STOPPED`) is rejected (§6.2).
- The sender record (§4.7) counts stops per class against the sender, per
  distinct refusing anchor, with the largest refuser's share. Nothing is served
  below three distinct refusing parties, a solicited request counts for nobody,
  a screening hold counts only once the owner blocks it, and the classes are
  never combined with each other or with quality.
- The organization report (§8.5) groups the records of the agents that share an
  anchor, or that an Agent Mandate charter's membership admits. It serves no
  pooled score and lists every member. Members of one organization are
  self-dealing for each other (§6.4), and the portfolio prior is drawn per
  capability from anchor members only (§7.5).
- Reports gain `candor.refusals`, `facts.unstated_refusals_90d`,
  `facts.unavailable_90d`, and the `sender` block, with their mandatory context
  (§8.1 to §8.3). Bureau obligations 11 to 13 are added (§10), and the trust
  model (§11), the attacks (§12.1), and the safety bullet (§13) follow.
- The formula version stays `fdbk-score-1`. The eligibility, exclusion, and
  prior rules can change which events enter a pool, so a recomputed score can
  differ from one computed under 0.3.1-draft.
- The fact example of §4.2 names an example reporter in place of a platform's
  address.

## 0.3.1-draft (2026-10-18)

Editorial, with no normative change. The specification and its A2A Reputation
extension name no platform, Personal Agent Naming is written out rather than
abbreviated, and the Agent Name Service is named on first use. The extension
moves to 0.1.1-draft. No requirement, field, example, or section number changes.

## 0.3-draft (2026-08-07)

The first version tagged in the Common Agent Standards repository, as
`reputations-v0.3-draft`. The A2A Reputation extension, [SPEC-A2A-REPUTATION.md](SPEC-A2A-REPUTATION.md), is at 0.1.0-draft. Example subjects in both documents use a made-up handle at an example domain.
