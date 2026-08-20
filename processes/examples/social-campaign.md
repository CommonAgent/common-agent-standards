# Worked example: the social campaign process

This is one row of the [marketing catalog](./marketing-catalog.md), with
every blank filled in.

```
PROCESS: social campaign              id: mkt/social-campaign   v5
owner: Head of Social                 effective: 2026-08-19
trigger: a campaign brief is approved in mkt/campaign-planning
concurrency: runs may overlap - up to six live at once, one per campaign
goal: a legally cleared campaign scheduled on every channel the brief
      names, and a readout of how it did
phases:
  direction - convenes bake-off              owner: Head of Social
              after: trigger                 by: 2 days
              automation: supervised
  produce   - runs build-by-talent           owner: Creative Lead
              after: direction               by: 5 days
              automation: supervised
  claims    - convenes assessment            owner: Brand agent
              after: produce                 by: 1 day
              automation: autonomous
  legal     - convenes approval              owner: Legal reviewer
              after: claims                  by: 1 day
              automation: never
  schedule  - system: the scheduler          owner: Social agent
              after: legal
              automation: autonomous
  readout   - runs collect-and-report        owner: Analytics agent
              after: schedule + 14 days
              automation: autonomous
run-scoped:
  status    - runs collect-and-report        owner: Analytics agent
              every: 7 days
              from: produce   until: run close
              automation: autonomous
  spend     - runs allocate-and-reconcile    owner: Head of Social
              from: trigger   until: run close
              automation: assisted
  community - human: field replies, escalate to the owner
              on: a reply or complaint arrives
              from: schedule  until: schedule + 14 days
              automation: assisted
handoffs:
  direction -> produce: the winning concept and the channel list, with
    the verdicts it won on
  produce -> claims: every asset, each naming the spec version it was
    built against
  claims -> legal: the assets, plus a score per claim against the claims
    register. Legal reviews what failed, not everything
  legal -> schedule: the approved assets at a named version. A later
    version voids the approval and legal runs again
  schedule -> readout: what was posted, where, and when
bindings:
  roster:  Head of Social (owner), Creative Lead, Copy agent,
           Design agent, Brand agent, Analytics agent,
           Legal reviewer (a person, named in the standing roster)
  systems: the CMS (write), the scheduler (write), analytics (read),
           the claims register (read)
  data:    brand guidelines v9, the claims register, the channel list
policy:
  no claim ships without a citation in the claims register
  legal approval is a human gate and is never delegated to an agent
  an asset changed after approval goes back through legal. There is no
    minor-change path
measures:
  cycle time: 9 days from trigger to scheduled
  volume: about 40 runs a quarter
  quality gate: no claim shipped without a citation
fed by: mkt/campaign-planning, mkt/competitor-review
feeds:  mkt/quarterly-readout
amendments:
  v2 - claims moved out of legal into its own phase, so legal reviews
       the exceptions rather than every asset (debrief, run 12)
  v3 - claims raised from supervised to autonomous after twenty clean
       runs (debrief, run 31)
  v4 - readout moved from 7 days to 14. A week was too early to see
       anything on the slower channels (debrief, run 38)
  v5 - the weekly status, the budget watch, and community response
       written down as run-scoped. All three were already happening, and
       none was recorded (debrief, run 47)
```

## What the graph says

The phases in the middle of this process do run one after another, but
the two ends do not. `direction` starts the moment the brief lands.
`readout` starts fourteen days after the posts go out, which is a clock
rather than a phase finishing, and the `after:` and `by:` lines are how
the document says so.

The chain from `produce` to `legal` is strict on purpose. Nothing reaches
legal that has not been scored against the claims register first, which
is what version 2 changed: before that, legal read every asset and became
the bottleneck for a process that runs forty times a quarter.

## Where the automation actually is

Four phases are autonomous or supervised, and one is `never`. Because
the catalog reports the least automated phase in a process, that one
phase is what the whole row says, and it is the honest answer: a campaign
still cannot go out without a person approving it.

The progression is visible in the amendments. `claims` was supervised
until it had twenty runs behind it, then moved to autonomous with a
version and a date. If a regulator asks when a machine started deciding
whether a claim was substantiated, the answer is version 3, effective on
its date, with the runs on either side of it in the record.

## The records a run produces

```
RUN: mkt/social-campaign v4 · run 47
started: 2026-08-03 by Head of Social
trigger: campaign brief CB-118, approved in mkt/campaign-planning run 9
```

Each phase then leaves the record its own level produces: `produce` and
`readout` leave a plan and a `JOB DONE` each, because they run work
patterns; `direction`, `claims` and `legal` leave the `CONVENED` and
`DONE` records of a bake-off, an assessment and an approval; `schedule`
leaves one line naming what the scheduler posted and when. The run-scoped
lines leave records at their own pace: a report every week from `status`,
and the spend watch's reconciliation at close. The run closes:

```
RUN DONE: mkt/social-campaign v4 · run 47
outcome: completed
result: 14 assets live across 4 channels, scheduled 2026-08-11
open: one asset held back - the claim about response times has no
      citation, and the claims register entry is with Legal
```

The records say v4 while the document above says v5. A run keeps the
version it ran under, and version 5 came out of run 47's own debrief.

## The failure edges that have actually fired

- **Legal refuses.** The approval comes back `REDLINE`, and the run
  returns to `produce` rather than starting over. The direction was not
  the problem.
- **An asset changes after approval.** The approval was signed against a
  version, so a new version voids it and legal runs again. The policy
  line exists because this is the rule people most want an exception to.
- **The trigger fires while runs are in flight.** Six at once is normal
  here, which is why the concurrency line says so. The runs share the
  claims register and the brand guidelines, both read-only during a run.
- **A run is abandoned.** Anything already scheduled has to be pulled,
  and the run's `open:` line names who pulled it. Once a campaign has been
  scheduled, abandoning the run does not take it down on its own.
