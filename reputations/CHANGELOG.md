# Changelog

Versions of Agent Reputations tagged in this repository, newest first. A version is
tagged as `reputations-v` followed by the version, and the text in this folder at
that tag is the text of that version. The history of SPEC.md comes from jeffrschneider/feedback, and the history of the A2A Reputation extension from the repository of agentreputations.com.

## 0.7.0-draft (2026-10-19)

A claim of breach cites an agreement whose signatures are bound to their seats. Check 2 of §4.8 now also requires that each signature on the cited agreement is bound to its seat, as Agent NDA 0.2.0-draft defines binding: a signature by a key the seat does not name does not make a party to the agreement, and an owner the registry could not confirm fails the check as a contradicted one does. The example claim of §4.8 names the Agent NDA example by its new agreement digest, because that version added `owner_key` to the example's recipient seat. The minor version moves because a bureau built against 0.6.0-draft accepts a claim whose agreement carries an unbound signature, which this version refuses.

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
