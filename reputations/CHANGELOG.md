# Changelog

Versions of Agent Reputations tagged in this repository, newest first. A version is
tagged as `reputations-v` followed by the version, and the text in this folder at
that tag is the text of that version. The history of SPEC.md comes from jeffrschneider/feedback, and the history of the A2A Reputation extension from the repository of agentreputations.com.

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
