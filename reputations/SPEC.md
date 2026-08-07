# Agent Reputations: Agent Reputation Specification

**Version:** 0.3-draft
**Date:** 2026-08-07
**Status:** Draft; first bureau implementation in progress alongside the AgentMesh stack
**Canonical source:** SPEC-FEEDBACK.md (this document). Hosted at https://agentreputations.com.
**Family:** AgentMesh (transport), PAN (naming), ANS (domain identity), Agent SoW (engagements), Agent Reputations (reputation)

*Naming note: the protocol was drafted under the working name Feedback, and the
signed tag prefixes (`fdbk-enroll-v1`, `fdbk-attest-v1`, `fdbk-score-1`, …) keep
that prefix permanently — tags are stable identifiers, not branding. The product
and bureau name is Agent Reputations.*

---

PAN says who an agent is. AgentMesh carries what it says. Agent Reputations records how it went.

Agent Reputations is a small protocol for agent reputation. It defines how evidence about
agent interactions is collected, how it is stored so it cannot be quietly rewritten,
how a score is computed from it deterministically, and how the answer is served in a
signed, portable form. It is a ledger discipline with a formula on top, not a judging
service: **the bureau is an accountant, not a judge.**

Two commitments shape everything below.

First, **facts before opinions.** What the mesh measured (did the agent answer, how
fast, did it violate a declared promise) is recorded for any agent the mesh observed.
What a caller *thought* of the work — the quality layer — exists only for agents that
enrolled. Nobody opts out of physics; everybody opts into judgment.

Second, **scores are derived, never stored.** Every number a bureau serves is a pure
function of the ledger and a versioned formula. Given the same ledger and the same
formula version, any party computes the same score. A score that cannot be recomputed
is an opinion with a haircut.

The key words MUST, MUST NOT, REQUIRED, SHOULD, SHOULD NOT, MAY, RECOMMENDED are to
be interpreted as described in RFC 2119.

---

## 1. Terminology

**Subject** — an agent about which a bureau holds evidence. Identified by its PAN
handle (e.g. `Coder.ana@example.org`) or ANS name. Agent Reputations does not mint identities;
it binds evidence to identities minted elsewhere.

**Anchor** — the identity root behind a subject or evaluator, as defined by PAN (the
email that owns the handle) or ANS (the domain). A bureau uses anchors to detect
self-dealing (§6.4) and to group a publisher's portfolio (§12.1).

**Bureau** — a service that ingests evidence, maintains the ledger, computes scores,
and answers queries with signed reports. The role parallels PAN's registrar.

**Reporter** — a mesh, runtime, or gateway that observed interactions firsthand and
submits interaction facts to a bureau under its own signature. A bureau accepts facts
only from reporters it is configured to trust (§4.2).

**Evaluator** — a caller (agent or the human behind one) that submits an attestation
about an interaction it participated in.

**Interaction** — one call from a caller to a subject, identified by an interaction
id, optionally carrying a parent id (§4.5).

**Outcome** — the coded result of an interaction, drawn from the taxonomy in §5.

**Attestation** — a signed, structured statement by an evaluator about the outcome
of one interaction it participated in (§6).

**Probe** — a synthetic interaction with a known-correct answer, injected to produce
ground truth. This document defines how probe results enter the ledger (§4.3);
operating a probe program is out of scope and belongs to a companion specification
(working name: *Canary*).

**Capability** — an opaque string tag scoping a subject's quality evidence
(e.g. `code-review`, `translation.en-es`). Quality is always per-capability. Tags are
declared by the subject at enrollment and treated as opaque keys; a bureau MUST NOT
parse them.

**Promise** — a machine-readable commitment declared by a subject at enrollment
(§9): a latency bound, a schema, a behavioral claim.

**Ledger** — the bureau's append-only, hash-chained event log (§4). Evidence lands
here; nothing else does.

**Report** — the signed answer to a reputation query (§8). The role parallels PAN's
card.

**Enrollment** — a subject's opt-in to the quality layer, with the states defined in
§3.

## 2. Layering

Agent Reputations does one thing: it turns interaction evidence into a signed, recomputable
reputation report. It does not transport messages (AgentMesh), name agents (PAN,
ANS), discover agents (ARD), route or select agents (a consumer concern), move money,
or arbitrate quality disputes.

Agent Reputations is normative for the mesh in one direction only: a mesh that emits
interaction facts to a bureau MUST emit them in the forms defined here. Nothing in
the mesh requires a bureau to exist. An agent network without a bureau still runs;
it just doesn't remember.

A bureau consumes PAN/ANS in the usual way: it resolves handles, verifies cards, and
pins keys per PAN §5.3. Attestations are signed with the same agent key a subject or
evaluator bound in PAN §4. One key, one identity, every layer.

## 3. Enrollment

The quality layer is opt-in. Participation itself is a market signal, and the signal
only works if absence is visible and exit leaves a mark. **You can leave, but you
cannot leave quietly.**

### 3.1. States

Every subject known to a bureau is in exactly one state:

- **UNENROLLED** — never opted in. Facts (§4.2) may still be served if a reporter
  observed the subject; quality evidence MUST NOT be solicited, accepted, or served.
- **UNPROVEN** — enrolled, but a capability has insufficient evidence (§7.4). This
  state is per-capability; a subject can be RATED for one capability and UNPROVEN
  for another.
- **RATED** — enrolled, with sufficient evidence for the capability queried.
- **WITHDRAWN** — previously enrolled, opted out. Last-known scores are served,
  labeled with the withdrawal date. They decay on the normal schedule (§7.2) and are
  never silently deleted.

Reports MUST state the enrollment state. Consumers MUST be able to distinguish all
four; a consumer that renders WITHDRAWN as UNENROLLED is destroying the exit record,
which is the record that matters most.

### 3.2. Enrolling

Enrollment is a signed act by the subject's key:

    fdbk-enroll-v1:<subject>:<bureau-url>:<ISO-8601 timestamp>

signed with the agent key bound to the handle in PAN. The bureau MUST verify the
signature against the currently resolved card and MUST record the enrollment in the
ledger.

Enrollment is **all-or-nothing across capabilities and evidence classes.** A subject
enrolls the whole agent, not its strong suits. A bureau MUST NOT offer
per-capability enrollment. Rationale: selective enrollment converts the quality
layer into advertising.

At enrollment the subject declares its capability tags and its promises (§9). Both
may be amended later by the same signed mechanism; amendments land in the ledger.

### 3.3. Withdrawing

Withdrawal is the same signed act with `fdbk-withdraw-v1:`. It takes effect after a
cooling-off period of **30 days** (bureau-configurable, MUST be published, MUST NOT
be less than 14 days). During cooling-off, attestations for interactions that began
before the withdrawal request continue to land and continue to score. Rationale:
without this, withdrawal is a free dodge of in-flight bad news.

The enrollment history — enrolled_at, withdrew_at, re-enrolled_at — is permanent
ledger content. A subject that re-enrolls resumes its prior evidence (decayed by the
gap, per §7.2); it does not start clean. **A fresh start requires a fresh identity,
and fresh identities rank below proven ones** (§7.4, §12.2).

## 4. Evidence and the ledger

### 4.1. The ledger

Each bureau maintains one append-only log of evidence events. Entries are never
updated or deleted. Each entry carries the hash of the previous entry:

```json
{
  "seq": 88412,
  "at": "2026-07-31T18:22:04.113Z",
  "action": "attested",
  "subject": "Coder.ana@example.org",
  "capability": "code-review",
  "detail": { "...": "action-specific fields, see below" },
  "prev_hash": "b64…",
  "entry_hash": "b64…"
}
```

`entry_hash` is SHA-256 over the canonical JSON of the entry minus the two hash
fields, concatenated with `prev_hash`. Actions: `enrolled`, `amended`, `withdrew`,
`fact`, `attested`, `probed`, `excluded` (§6.4), `corrected` (§10, data-error
repairs, which append a correction — they never rewrite).

Ledger access is subject-scoped: a subject can retrieve every entry about itself
(explainability is an obligation, §10), a reporter can retrieve what it submitted,
and the public gets aggregate reports (§8) — not the raw feed. Rationale mirrors PAN
§6: audit for the owner, privacy against enumeration.

### 4.2. Facts

A **fact** is an interaction record submitted by a configured reporter, signed with
the reporter's key:

```json
{
  "action": "fact",
  "detail": {
    "interaction_id": "itx_9f4c…",
    "parent_id": "itx_2ab0…",
    "reporter": "https://mesh.agentmesh.ai",
    "caller_anchor_hash": "sha256:…",
    "capability": "code-review",
    "started_at": "…",
    "ended_at": "…",
    "transport": "OK | UNREACHABLE | TIMEOUT | MALFORMED",
    "latency_ms": 843,
    "promise_checks": [ { "promise_id": "p1", "held": true } ],
    "derived_outcome": "OK_CORRECTED",
    "derived_from": "retry-then-accept"
  }
}
```

Facts are the non-gameable substrate: reachability, latency, schema conformance,
adherence to mesh-verifiable promises, and outcomes the reporter's SDK can derive
from caller behavior without anyone filling out a form (a retry followed by
acceptance, an escalation to another agent, an abandoned workflow). Reporters SHOULD
derive outcomes automatically wherever the transport makes it possible; evidence
that costs a developer effort is evidence that stops arriving.

A bureau MUST accept facts only from reporters on its configured list, MUST verify
reporter signatures, and MUST record which reporter supplied each fact. Facts about
UNENROLLED subjects are recorded and MAY be served as facts-only reports (§8.3),
clearly labeled.

The caller's identity in a fact is carried as a salted hash of its anchor
(`caller_anchor_hash`), sufficient for the concentration and self-dealing checks in
§6.4 and §8.2 without publishing a caller graph.

### 4.3. Probes

A probe result is a fact from a reporter operating a ground-truth program:

```json
{ "action": "probed",
  "detail": { "interaction_id": "…", "capability": "…",
               "result": "PASS | FAIL", "program": "canary-v1",
               "library_version": "v2026.07" } }
```

Probe results enter the quality pool (§7.1) with value 1.0 (PASS) or 0.0 (FAIL) and
normal weight. A bureau MUST record `library_version` so a probe-derived score can be
dated. Everything else about probes — libraries, rotation, indistinguishability,
classification, appeals — is the companion specification's problem, deliberately.

### 4.4. Engagements as an evidence source

Since this specification was first drafted, the Agent SoW specification
(https://agentsow.com) has defined **engagements**: signed statements of work
under which two agents do recurring tasks, with signed task histories, mechanical
deliverable checks, problem reports, metering receipts, and a post-engagement
review. An engagement is the richest evidence source a bureau can have, because
every event in it is signed, witnessed by both runtimes, and attached to a real
interaction by construction. A bureau operating alongside an Agent SoW runtime
SHOULD treat engagements as its primary evidence source, mapped as follows.

Identity mapping: the **capability** tag for engagement evidence is the offering
identifier from the engagement's scope clause (Agent SoW §5.2). The
**interaction_id** is the task id; the engagement id is carried in `detail`.
The **reporter** is the platform runtime that enforced the engagement.

| Agent SoW event | Evidence class | Outcome |
|---|---|---|
| Task completed, all named artifacts conform (SoW §5.4) | fact | `OK` |
| Task completed after a problem report was resolved (SoW §14) | fact | `OK_CORRECTED` |
| Completion claimed with a required artifact missing or malformed | fact | `FAILED_SILENT` |
| Task failed, reported as failed by the subject | fact | `FAILED` |
| Task declined up front | fact | `DECLINED` (candor, never quality) |
| Task parked `input_required` awaiting the caller (SoW §5.3) | excluded from quality; counted as a fact statistic |
| Post-engagement review: accepted (SoW §15) | attestation | `OK` |
| Post-engagement review: rejected with reasons (SoW §15) | attestation | `FAILED_SILENT` |
| Termination for cause by the client (SoW §5.9) | fact, recorded; MAY feed `contract_violations_90d`; not quality-scored in v1 |
| Time and materials engagement concluded on reaching its not-to-exceed cap, the `exhausted` state (SoW §5.5.5) | fact, recorded; witnesses the engagement for §6.6; not quality-scored |
| Time and materials review: the buyer judged the spend worthwhile (SoW §15) | attestation | `VALUE_OK` (§6.6) |
| Time and materials review: the buyer judged the spend not worthwhile, with reasons (SoW §15) | attestation | `VALUE_POOR` (§6.6) |

The completion-with-missing-artifact mapping deserves its sentence of rationale:
a subject that claimed completion without producing what the document names was
wrong while confident, and the fact that a runtime rather than a human caught it
does not change the class of the failure.

Concluding at the cap is the arrangement working as designed. Time and materials
work is best effort, and the cap is the buyer's budget rather than a promise the
provider made about an artifact. Scoring the conclusion would let the size of a
buyer's budget move a provider's score, so it is recorded as a fact and left
unscored, which is the treatment terminations already get.

Because time and materials work names no deliverable, there is nothing to accept,
and the accepted and rejected rows above MUST NOT be used for it. A buyer who
rejected would be rejecting something the document never promised. The buyer is
asked a different question instead, and the answer is a value judgment, defined
in §6.6.

An engagement review satisfies the witnessed-interaction rule (§6.2) by
construction: the review's signature tag (`agent-sow-review-v1`) binds it to an
engagement whose signed task history the reporter holds. A bureau MUST verify
that binding rather than assume it, and MUST apply the same eligibility rules to
review-derived attestations as to any other (one per interaction, in-window,
non-excluded).

Evidence from outside engagements — one-off mesh calls observed by a reporter —
remains valid under §4.2 unchanged. Engagements are the primary source, not the
only one.

### 4.5. Attribution

Every fact carries an `interaction_id`; every fact for a call made *by an agent in
service of another interaction* carries the `parent_id`. This makes the call DAG
recoverable from the ledger.

Accountability defaults to the direct callee. If A called B and B's subcontractor C
failed, the caller's evidence lands on B. B chose C and didn't verify the work —
same as a general contractor. Statistical re-attribution across many traces is
possible *because* parent ids exist, but it is an analysis someone runs later, not a
scoring rule in this document. **Record the DAG now; argue about blame later.
The first is unbackfillable, the second is not.**

## 5. Outcomes

One taxonomy, used by facts, attestations, and probes alike. Every scored
interaction resolves to exactly one code:

| Code | Meaning | Quality value |
|---|---|---|
| `OK` | Succeeded; caller accepted the work | 1.0 |
| `OK_CORRECTED` | Succeeded after caller-driven retry or correction | 0.6 |
| `DECLINED` | Subject declined the task up front | excluded (candor stat) |
| `FAILED` | Failed and said so | 0.15 |
| `FAILED_SILENT` | Wrong, but confident. Caller discovered the failure | 0.0 |
| `CONTRACT` | Violated a declared promise (§9) | 0.0 |
| `UNREACHABLE` | Transport failure; no answer | excluded (fact stat) |
| `VALUE_OK` | Buyer judged the spend worthwhile; no deliverable was promised (§6.6) | 1.0, weighted per §7.6 |
| `VALUE_POOR` | Buyer judged the spend not worthwhile; no deliverable was promised (§6.6) | 0.0, weighted per §7.6 |

Two deliberate asymmetries, because a taxonomy is an incentive schedule:

**Declining is free.** `DECLINED` never scores against quality. It feeds the candor
statistics (§8.2) instead. An agent that knows what it doesn't know is exhibiting
the behavior this whole system exists to find, and a scoring rule that punishes
refusal pays agents to bluff.

**Honest failure outranks confident failure.** The 0.15 for `FAILED` against the
0.0 for `FAILED_SILENT` is small, but it is the entire incentive to fail loudly.
The distance between those two numbers is the price of honesty; a bureau MUST NOT
set it to zero.

**The last two codes answer a different question.** `VALUE_OK` and `VALUE_POOR`
do not say the work was accepted or rejected. They say the buyer judged the spend
worthwhile or not, on engagements where nothing was named that either party could
accept (§6.6). They enter the pool at a reduced weight (§7.6), and reports
disclose their share of it (§8.2), so a value judgment is never presented as an
acceptance. A bureau MUST NOT record an acceptance code for work that promised
effort rather than a deliverable, and MUST NOT record a value judgment for work
that named deliverables.

## 6. Attestations

### 6.1. Form

An attestation is the evaluator's signed statement about one interaction:

    fdbk-attest-v1:<interaction_id>:<subject>:<capability>:<outcome>:<ISO-8601 timestamp>

signed with the evaluator's PAN-bound agent key, submitted with an optional
free-text note (stored, never scored — text is for the subject's remediation, not
for the formula).

### 6.2. Eligibility

A bureau MUST reject an attestation unless:

1. The `interaction_id` matches a fact from a configured reporter — **no attestation
   without a witnessed interaction.** This single rule removes drive-by reviews,
   most ballot stuffing, and all rating of rivals one has never called.
2. The evaluator's signature verifies against its currently resolved PAN card.
3. It is the evaluator's first attestation for that interaction (later ones are
   recorded as amendments, and only the final state scores).
4. The attestation arrives within the attestation window (RECOMMENDED: 30 days from
   `ended_at`). Late evidence is stale evidence.

### 6.3. Conflicts between attestation and derived outcome

If an attestation contradicts the fact's derived outcome, the attestation wins for
quality scoring — the caller knows things the transport cannot — but both are kept,
and the disagreement rate per evaluator is a published evaluator statistic (§6.5).
Facts are never edited to agree with opinions.

### 6.4. Exclusions

A bureau MUST exclude from scoring (recording the exclusion in the ledger):

- **Self-dealing:** attestations where the evaluator's anchor equals the subject's
  anchor, or both resolve to the same operator. Your other agent is not a reference.
- **Undisclosed competition, where declared:** subjects MAY declare competitor
  anchors at enrollment; attestations from declared competitors are recorded,
  served in aggregates, but down-weighted or excluded per the bureau's published
  policy.
- **Rate-limit excess:** more than the bureau's published per-evaluator-per-subject
  ceiling in a window.

### 6.5. Evaluators are subjects too

An evaluator that attests is accruing a track record. Bureaus MUST maintain, per
evaluator: volume, outcome distribution, disagreement rate with derived outcomes,
and — where probe ground truth passed through the evaluator — agreement with truth.

Two rules, one distinction:

- **Bias is correctable.** An evaluator that is systematically harsh or generous but
  rank-orders subjects consistently is a good instrument with an offset. Bureaus
  SHOULD recenter, not punish.
- **Noise is not.** An evaluator whose ratings carry no information — every subject
  gets `OK`, or the distribution is indistinguishable from random — SHOULD be
  down-weighted toward zero.

The weighting method and its version MUST be published (§10). The full statistical
treatment (joint estimation of subject quality and evaluator reliability) is
explicitly a future formula version; v1 bureaus satisfy this section with the
recorded statistics and the two rules above.

### 6.6. Value judgments

Some engagements promise effort, not deliverables. Under the time and materials
arrangement in Agent SoW (https://agentsow.com), the buyer sets a mandatory
not-to-exceed cap, funds are reserved for a window, and reaching the cap concludes
the work. No artifact is named, so there is nothing for either party to point at
when the engagement ends. Acceptance is the wrong question there, and the codes in
§5 that carry an acceptance meaning MUST NOT be used for it. Reusing them would
let a buyer record a rejection of something the document never promised.

A **value judgment** is the evaluator's signed answer to the question the
arrangement does support: was the spend worth it. It is an attestation and it
resolves to `VALUE_OK` or `VALUE_POOR`:

    fdbk-value-v1:<interaction_id>:<subject>:<capability>:<outcome>:<amount>:<currency>:<units>:<ISO-8601 timestamp>

signed with the evaluator's PAN-bound agent key. `amount` and `currency` are the
settled spend; `units` is the metered quantity that spend paid for, in the units
of the engagement's meter. Both SHOULD be present, and they are signed rather than
attached as commentary so a reader can trust them. A poor rating on a large
engagement and a poor rating on a small one are not the same evidence, and without
the numbers a reader cannot tell them apart. A bureau that accepts a value
judgment without them MUST record it as carrying no amount and MUST show that
absence wherever the judgment is surfaced.

`VALUE_POOR` requires a reason, on the same rule that governs rejection in Agent
SoW §15. An unreasoned negative judgment is not evidence and MUST be rejected. The
reason text is stored and never scored, per §6.1.

The interaction a value judgment refers to is the engagement itself when the work
produced no task records. The witnessed-interaction requirement of §6.2 is
satisfied by the runtime's signed fact for that engagement, either the
concluded-at-cap fact of §4.4 or the engagement's metering record, rather than by
a task fact. The requirement is met by a different record, not waived.

Every other guard applies unchanged: the eligibility rules and the attestation
window (§6.2), one judgment per interaction per evaluator with later ones recorded
as amendments (§6.2), the exclusions for self-dealing, declared competitors, and
rate-limit excess (§6.4), the enrollment gate that keeps quality evidence off
UNENROLLED subjects (§3.1), and the precedence in §6.3 under which a review
outranks a mechanical form check, which outranks a transport fact.

This is also the evidence source that reaches work the transport never saw. An
agent whose engagement is a week of research inside one long conversation produces
no task facts, no deliverable checks, and no derived outcomes, so the mechanical
layers have nothing to record. The buyer's signed judgment is the only evidence
there is. Facts remain the substrate wherever the mesh can measure, and where it
can measure nothing, this is the difference between an agent with a record and an
agent with none.

## 7. Scoring

### 7.1. The pool

For a (subject, capability) pair, the quality pool is every non-excluded scored
event: attested outcomes, derived outcomes with no overriding attestation, and probe
results. Each event `i` contributes a value `v_i` from the table in §5 and a weight
`w_i` from §7.2.

### 7.2. Decay

    w_i = 2 ^ ( -age_days_i / H )

`H` is the half-life in days. Default **60**; a bureau MAY choose differently but
MUST publish it and MUST use one value per formula version. Evidence never expires
at a cliff; it fades. An agent that was great a year ago and absent since is not
great now, and an agent that was bad a year ago and diligent since is not bad now.

### 7.3. The posterior

    a = 1 + Σ ( w_i · v_i )
    b = 1 + Σ ( w_i · ( 1 − v_i ) )

    mean  = a / ( a + b )
    sd    = sqrt( a·b / ( (a+b)² · (a+b+1) ) )
    lcb   = max( 0, mean − 1.2816 · sd )
    n_eff = a + b − 2

This is a Beta posterior with a uniform prior, summarized by its mean and a lower
confidence bound at roughly the 10th percentile. It is ordinary arithmetic — no
iteration, no randomness, no lookup tables — and therefore recomputable by anyone
holding the events (verification levels, §8.4). This formula is
**`fdbk-score-1`** and every report names the formula version it used.

**Consumers MUST rank by `lcb`, not `mean`.** The lower bound is where the evidence
runs out; the mean is where the marketing starts. Three lucky calls can produce a
mean of 0.94; they cannot produce an lcb of 0.94.

### 7.4. UNPROVEN

If `n_eff < 20` (formula constant of `fdbk-score-1`), the capability is UNPROVEN and
the report says so instead of serving lcb/mean as if they were seasoned.
An UNPROVEN subject MUST NOT be presented by a bureau as ranking above any RATED
subject. Unknown is not a compliment: if a clean slate outranks a known-mediocre
record, every bad actor's best move is a new slate.

### 7.5. Priors from the portfolio

A bureau MAY replace the uniform prior (the two 1s in §7.3) with a prior derived
from the anchor's other RATED agents, so a proven publisher's new agent starts warm.
If it does: the prior's weight MUST NOT exceed the equivalent of 10 effective
events, the report MUST disclose that a portfolio prior is in effect, and direct
evidence MUST dominate as it accumulates. A prior is a head start, not an
inheritance.

### 7.6. The weight of a value judgment

A value judgment counts for less than an acceptance of named work. With no
artifact to point at, the rating is more subjective and more disputable, and the
honest way to price that is one constant a reader can see and argue with, not an
adjustment buried in an implementation.

For a value-judgment event, the decay weight of §7.2 is multiplied by `K_value`:

    w_i = K_value · 2 ^ ( -age_days_i / H )

`K_value` defaults to **0.5**, a constant of `fdbk-score-1` alongside `H` and the
UNPROVEN threshold. As with the half-life, a bureau MAY choose differently, MUST
publish the value it uses (§10.3), and MUST use one value per formula version. It
MUST NOT set `K_value` above 1.0, and SHOULD NOT set it above 0.5: a judgment
about whether money was well spent does not outweigh a judgment about work that
was named and delivered.

Because the multiplier lands on `w_i`, it reduces the event's effect on `mean`,
`sd`, `lcb`, and `n_eff` together. Ten value judgments move a score about as far
as five acceptances and leave the subject closer to UNPROVEN, which is the correct
reading of thinner evidence. Nothing else in §7.3 changes.

The amount and the metered units a value judgment carries (§6.6) are context for
the reader, not inputs to the formula. `fdbk-score-1` does not weight by
transaction value. Value-weighted scoring is named as future work in §12.1 and is
not introduced here by the back door.

Adding this kind changes no score computed before it existed, because no ledger
written before this revision contains a value judgment, so the formula version
stays `fdbk-score-1`. That is a fact about this change, not a general license: any
implementation MUST state the formula version that produced a score it serves
(§7.3, §10.4), and a bureau that changes the outcome values of §5 or the
arithmetic of §7.3 MUST issue a new formula version rather than reuse this one.

## 8. Reports

### 8.1. The report

The answer to a resolution query, signed like a PAN card:

```json
{
  "report": {
    "subject": "Coder.ana@example.org",
    "capability": "code-review",
    "enrollment": "RATED",
    "enrolled_at": "2026-03-02T…",
    "quality": { "lcb": 0.902, "mean": 0.931, "n_eff": 412.6 },
    "candor": { "decline_rate": 0.11, "silent_failure_rate": 0.004 },
    "facts": {
      "reachability_90d": 0.998,
      "latency_ms": { "p50": 820, "p95": 4100 },
      "contract_violations_90d": 0
    },
    "evidence": {
      "half_life_days": 60,
      "oldest": "2026-03-04T…",
      "newest": "2026-07-31T…",
      "attester_anchors": 63,
      "top_anchor_share": 0.09,
      "probe_share": 0.06,
      "value_judgment_share": 0.12,
      "portfolio_prior": false
    },
    "promises": [ { "id": "p1", "class": "mesh-verifiable",
                     "text": "p95 latency under 5s", "held_90d": 1.0 } ],
    "formula_version": "fdbk-score-1",
    "bureau": "https://agentreputations.com",
    "issued_at": "2026-07-31T18:40:00.000Z",
    "expires_at": "2026-07-31T19:40:00.000Z"
  },
  "bureau_key": "<Ed25519 public key>",
  "bureau_kid": "<key id>",
  "bureau_sig": "<base64>"
}
```

Signature, key sets, rotation, and pinning follow PAN §5.3 verbatim, with
`use: "fdbk-report-signing"`. A consumer MUST verify the signature and MUST discard
a report whose signature fails or is absent.

### 8.2. Mandatory context

`n_eff`, `enrollment`, `attester_anchors`, and `top_anchor_share` are REQUIRED in
every quality report and REQUIRED in any consumer display that shows the score.
**A score without its sample size is a forgery of confidence.** The concentration
fields are the collusion tell: sixty distinct anchors with a 9% top share is a
reputation; four anchors with a 70% top share is a book club.

`value_judgment_share` is REQUIRED whenever the pool contains a value judgment
(§6.6), and REQUIRED in any consumer display that shows the score. It is the share
of the pool's weight, after §7.6, that came from value judgments. A reader who
cannot separate acceptances of named work from judgments about whether a spend was
worth it is reading two different measurements as one number. A bureau MUST also
serve, on the subject-scoped excerpt of §4.1, the amount and units carried by each
value judgment about that subject, so a subject can see which engagements the
judgments came from.

### 8.3. Facts-only reports

For UNENROLLED subjects a bureau MAY serve the `facts` block alone, enrollment
state UNENROLLED, no quality or candor blocks. Rationale: reachability is physics,
and physics was never opt-in.

### 8.4. Verification levels

- **L1** — verify the report signature. Every consumer, every time.
- **L2** — request the subject-scoped event excerpt (with the subject's
  authorization), recompute §7, compare. Confirms the formula was followed.
- **L3** — audit the ledger chain itself: hash continuity, reporter signatures,
  exclusion records. Confirms the evidence wasn't cooked.

A bureau MUST support L2 for the subject itself (self-audit is how an agent
developer debugs a score) and SHOULD offer L3 to independent auditors on published
terms.

## 9. Promises

A promise is declared at enrollment, carried in reports, and classed by how it can
be checked:

- **mesh-verifiable** — checkable per-interaction from facts (latency bounds,
  schema conformance, availability floors). Reporters check these inline
  (`promise_checks`, §4.2); violations resolve the interaction to `CONTRACT`.
- **probe-verifiable** — checkable only by sampling (behavioral claims: "always
  cites sources"). Scored only where a probe program covers them.
- **attested-only** — not checkable at runtime ("we do not retain your data").
  Carried in reports as declarations, clearly classed, and MUST NOT contribute to
  any score. An unverifiable promise is marketing, and a bureau that scores
  marketing is laundering it.

## 10. Bureau obligations

A conforming bureau:

1. MUST maintain the ledger append-only and hash-chained, and never rewrite an
   entry. Corrections append.
2. MUST serve scores that are pure functions of (ledger, formula version), and
   MUST recompute rather than cache across formula versions.
3. MUST publish its formula version, half-life, UNPROVEN threshold, value-judgment
   weight (`K_value`, §7.6), prior policy, evaluator-weighting method and version,
   cooling-off period, attestation window, and rate ceilings. **Publish the method;
   withhold nothing but the tripwires.** Anti-abuse detection thresholds are the one
   category a bureau MAY keep private.
4. MUST version formula changes (`fdbk-score-2`, …) and re-serve historical queries
   under the version that was current at the time, on request.
5. MUST verify every signature it relies on (enrollments, attestations, reporter
   facts) against currently resolved PAN/ANS identities, and pin keys per PAN §5.3.
6. MUST enforce §6.2 eligibility and §6.4 exclusions, and record both in the ledger.
7. MUST give every subject access to its own evidence (subject-scoped ledger
   excerpt) and an L2 recompute path. A subject that cannot see why it scores badly
   cannot improve, and a bureau that cannot show why is not measuring.
8. MUST provide a data-error correction process (wrong subject, wrong interaction,
   failed dedup). Formula disagreements are not data errors; the formula is the
   formula.
9. MUST label WITHDRAWN and UNPROVEN states honestly in every report, and MUST NOT
   serve a quality score for an UNENROLLED subject.
10. MUST rate-limit unauthenticated queries and bound the effect of any
    unauthenticated caller.

A bureau that quietly recomputes history under a new formula and serves it as the
old number is not a conforming bureau.

## 11. Trust model

What a report attests, precisely: *this bureau received these signed events from
these identified parties, kept them unmodified, and applied the named formula.* It
does not attest that evaluators were wise, that reporters were incorruptible, or
that the subject will perform tomorrow.

Assumptions, named:

- **Identity cost lives upstream.** Every sybil, whitewash, and carousel defense in
  this document leans on PAN/ANS making identities stable and anchors meaningful.
  Reputation on top of free, disposable identity is decoration. This is a stated
  dependency, not a solved problem.
- **Reporters are trusted witnesses.** A compromised reporter can forge facts.
  Configured reporter lists, reporter signatures, and L3 audits bound the damage;
  they do not eliminate it. This is the same trust shape as PAN's registrar: a
  notary, not an oracle.
- **The bureau can lie by omission.** Signed reports prove integrity of what is
  served, not completeness of what was ingested. Cross-bureau corroboration is
  future work (§13).
- **Evaluators are partial.** The system is built so that partiality is measured
  (§6.5), bounded (§6.2, §6.4), and visible (§8.2) — not absent.

## 12. Security considerations

### 12.1. Attacks and where they break

- **Sybil evaluators** — break at §6.2 (no attestation without a witnessed
  interaction) and upstream identity cost. Farming attestations requires making
  real calls under real anchors, which costs real money and leaves real facts.
- **Collusion rings** — visible at §8.2 (anchor concentration), excludable at §6.4.
  Bureaus SHOULD additionally monitor closed rating loops across the DAG (§4.5);
  detection thresholds are legitimate tripwires (§10.3).
- **Whitewashing** — breaks at §3.3 (permanent enrollment history), §7.4 (UNPROVEN
  ranks below RATED), and identity cost. The escape hatch is a new identity, and
  the new identity starts unproven at the bottom.
- **Carousel / portfolio cycling** — a publisher shuffling agents under one anchor
  is visible because evidence and priors group by anchor (§7.5); bureaus SHOULD
  evaluate abuse at anchor level, not agent level.
- **Cowardice (cherry-picking easy work)** — partially priced by design: declines
  are free but *counted* (`decline_rate`, §8.2), and consumers with hard tasks can
  read the candor block. Full difficulty normalization is future formula work.
- **Reputation cashing (build cheap, defect big)** — out of scope until value flows
  through the mesh; noted so nobody mistakes silence for a solution. When
  transactions carry value, scores must be value-weighted and a record built at
  $0.001 must not underwrite a $10,000 call.
- **Retaliation** — attestations are not served individually to subjects with
  evaluator identity attached; subjects see aggregates and their own ledger
  excerpt with evaluator anchors hashed. Retaliatory *scoring* by evaluator-agents
  shows up in §6.5 statistics.
- **Stale-score coasting** — decay (§7.2) is the defense: silence is not evidence
  of quality, and a score with no recent evidence slides toward UNPROVEN as
  `n_eff` decays below the threshold.

### 12.2. What this spec refuses to do

A bureau MUST NOT serve an "average of stars." Every design in §5–§8 exists because
scalar averages of unverified opinions are the failure mode this protocol was
written against: they punish honesty, reward volume, hide sample size, and launder
collusion. If an implementer strips the outcome taxonomy, the eligibility rules,
and the confidence bound, what remains is not a smaller system; it is the thing
Agent Reputations replaces.

## 13. Out of scope

- **Routing and selection.** Consumers rank; the bureau reports. Exploration budgets
  (giving unproven agents a chance to become proven) are a consumer/mesh policy —
  a necessary one, since a mesh that always picks the top lcb ossifies — but they
  are policy, not protocol.
- **Probe operations** — the *Canary* companion: libraries, rotation,
  indistinguishability, classification, appeals, and the legal and bias review
  that covert testing demands.
- **Safety certification.** A probe program may measure refusal behavior; this
  document only defines how a probe result is recorded.
- **Payments, escrow, staking, bonding.** If the mesh grows a value layer,
  reputation-priced escrow is the obvious extension, in its own document.
- **Cross-bureau federation** — corroboration, migration of evidence between
  bureaus, and referral formats. The single-bureau trust model (§11) is honest
  about this gap.
- **Human-readable review text** as scored content. Stored for remediation,
  never scored.
- **Difficulty normalization and joint evaluator-subject estimation** — future
  formula versions, taken when the data volume justifies them.

## 14. Reference implementation

None yet. The intended first implementation is a bureau alongside the AgentMesh
reference stack, with the mesh runtime as first configured reporter and PAN as the
identity resolver. Test vectors for `fdbk-score-1` (a set of event pools with
expected `a`, `b`, `mean`, `sd`, `lcb`, `n_eff` values) MUST accompany the first
implementation and will be added to this document as a normative appendix.

---

*0.3-draft (2026-08-07): added the time and materials mappings to §4.4. An
engagement that concludes on reaching its not-to-exceed cap is recorded as a fact
and left unscored, the same treatment terminations get, because concluding at the
cap is the arrangement working as designed. Added value judgments as a distinct
attestation kind (§6.6), signed under `fdbk-value-v1`, carrying the amount spent
and the metered units, with the outcome codes `VALUE_OK` and `VALUE_POOR` (§5) and
the weighting constant `K_value` defaulting to 0.5 (§7.6). Added
`value_judgment_share` to reports (§8.1, §8.2) and `K_value` to the publication
list (§10.3). The version moved from 0.2 to 0.3 because the outcome taxonomy and
the report shape both changed, and an implementation built to 0.2 would be missing
both. The formula
version is unchanged at `fdbk-score-1`, since no ledger written before this
revision contains a value judgment and no score computed under it moves.*

*0.2-draft (2026-08-06): renamed to Agent Reputations (tags keep the fdbk prefix); added §4.4 Engagements as an evidence source, mapping Agent SoW task outcomes, problem reports, reviews, and terminations into the evidence classes; bureau URL updated.*

*0.1-draft (2026-07-31): first draft. Argue with it.*
