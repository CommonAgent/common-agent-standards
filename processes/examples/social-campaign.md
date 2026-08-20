# Worked example: the social campaign process

This is one row of the [marketing catalog](./marketing-catalog.md), with
every blank filled in. Version 6 rewrote it around the thirteen
activities a social media manager actually does, after walking the full
activity list against the earlier draft and finding how much it had
compressed or left out.

```
PROCESS: social campaign              id: mkt/social-campaign   v6
owner: Head of Social                 effective: 2026-08-20
trigger: a campaign brief is approved in mkt/campaign-planning
concurrency: runs may overlap - up to six live at once, one per campaign
goal: a campaign launched on every channel the brief names, run for its
      window, and reported against what the brief asked for
phases:
  take-in-brief    - human: read the brief, pull out what the campaign
                     must accomplish
                     owner: Manager           after: trigger
                     automation: assisted
  set-parameters   - human: pick platforms, audience and dates, and put
                     a number on it. Leadership confirms the budget
                     owner: Manager           after: take-in-brief
                     automation: assisted
  brief-creatives  - convenes briefing: the team hears what is needed
                     and by when, together
                     owner: Manager           after: set-parameters
                     automation: assisted
  settle-direction - convenes bake-off: two or three concepts, one
                     chosen, with the reasons said out loud
                     owner: Manager           after: brief-creatives
                     by: 5 days               automation: supervised
  produce-posts    - runs build-by-talent: copy, images and video,
                     each sized and worded for its platform
                     owner: Manager           after: settle-direction
                     by: 5 days               automation: supervised
  get-sign-offs    - convenes approval: brand and legal sign, as named
                     signers, against a version of the posts
                     owner: Legal reviewer    after: produce-posts
                     by: 2 days               automation: never
  practical-side   - human: tracking links, the landing page check, the
                     ad campaigns, the posting schedule
                     owner: Manager           after: set-parameters
                     by: launch               automation: supervised
  launch           - human: the manager says go. The scheduler and the
                     ad platforms take it from there
                     owner: Manager
                     after: get-sign-offs + practical-side
                     automation: supervised
  watch            - human: track results against the brief
                     owner: Manager           after: launch
                     automation: assisted
  engage           - human: answer comments and messages, flag what
                     needs the manager
                     owner: Community manager  after: launch
                     automation: assisted
  optimize         - human: move ad money toward what works, swap
                     creative that has gone stale
                     owner: Media buyer       after: launch
                     automation: assisted
  wrap-up          - runs collect-and-report: the numbers from every
                     channel, reported against the brief
                     owner: Manager
                     after: watch + engage + optimize
                     automation: assisted
  record-learnings - convenes debrief: what to repeat, what to avoid
                     owner: Manager           after: wrap-up
                     automation: assisted
run-scoped:
  spend  - runs allocate-and-reconcile       owner: Manager
           from: set-parameters   until: run close
           automation: assisted
  status - runs collect-and-report           owner: Manager
           every: 7 days
           from: launch   until: run close
           automation: assisted
handoffs:
  take-in-brief -> set-parameters: the goal, stated in one line that
    every later decision can be tested against
  set-parameters -> brief-creatives: the channels, audience, dates and
    budget
  set-parameters -> practical-side: the same parameters. Both branches
    read one record, which is what keeps them from drifting apart
  settle-direction -> produce-posts: the chosen concept, and why it won
  produce-posts -> get-sign-offs: the posts at a version
  get-sign-offs -> launch: the approved posts at the signed version. A
    later change voids the approval and sign-offs run again
  practical-side -> launch: tracking, ads and schedule, ready to fire
  wrap-up -> record-learnings: the report, as delivered
bindings:
  roster:  Manager (owner), Marketing lead, Copywriter, Designer,
           Video editor, Brand reviewer, Legal reviewer (a person,
           named in the standing roster), Community manager, Media buyer
  systems: the scheduler (write), the ad platforms (write),
           the CMS (write), analytics (read)
  data:    brand guidelines v9, the claims register, the campaign brief
policy:
  no claim ships without a citation in the claims register
  sign-off is a human gate and is never delegated to an agent
  a post changed after sign-off goes back through sign-offs. There is
    no minor-change path
measures:
  cycle time: about two weeks from the brief to launch, plus the
    campaign window
  volume: about 40 runs a quarter
  quality gate: nothing publishes unsigned
fed by: mkt/campaign-planning, mkt/competitor-review
feeds:  mkt/quarterly-readout
amendments:
  v2 - claims checking moved out of legal review, so legal reads the
       exceptions rather than every asset (debrief, run 12)
  v3 - claims checking raised from supervised to autonomous after
       twenty clean runs (debrief, run 31)
  v4 - the readout moved from 7 days to 14. A week was too early to see
       anything on the slower channels (debrief, run 38)
  v5 - the weekly status, the budget watch, and community response
       written down as run-scoped. All three were already happening,
       and none was recorded (debrief, run 47)
  v6 - rewritten around the thirteen activities the manager actually
       does. Setting parameters, the practical side, the launch
       decision, the live window and the learnings had been compressed
       into six phases or left out entirely (activity walk, 2026-08-20)
```

## What the graph says

The graph has two branches and a window. After the parameters are set,
the creative chain (brief the team, settle a direction, produce, get
sign-offs) and the practical side run at the same time, and launch waits
for both. After launch, three activities - watch, engage, optimize - run
at once for as long as the campaign is live, and wrap-up waits for all
three. Nothing about that is visible when the phases are numbered 1 to
13, which is why the order comes from the `after:` lines.

Two edges point backwards, and both go to the same place. A sign-off
that comes back with changes reopens produce-posts, and only the part
that failed. Creative that goes stale mid-flight reopens produce-posts
too. One is a gate refusing, the other is the world changing, and the
process treats both as normal work rather than exceptions.

## Where the automation actually is

Most phases are `assisted`: an agent drafts, gathers, or watches, and a
person decides. The two `supervised` phases are where agents do the work
and a person reviews it before it moves on. One phase is `never`:
sign-off stays with people no matter how good the agents get, because
that is a policy decision rather than a capability question.

The earlier versions of this document tell the automation story in
miniature. Claims checking inside sign-offs went from supervised to
autonomous only after twenty clean runs, and the amendment that moved it
carries the date, which is what an auditor reads a year later.

## The records a run produces

```
RUN: mkt/social-campaign v6 · run 52
started: 2026-08-20 by Manager
trigger: campaign brief CB-118, approved in mkt/campaign-planning run 9
```

Each activity leaves whatever record its own kind of work produces. The
briefing, the bake-off, the approval and the debrief leave their
CONVENED and DONE records. Produce-posts and wrap-up leave a plan and a
JOB DONE each, because they run work patterns. The `human:` activities
leave one line each saying what happened and who did it. The run-scoped
lines leave records at their own pace: a status report every week, and
the spend line's reconciliation at close. The run closes:

```
RUN DONE: mkt/social-campaign v6 · run 52
outcome: completed
result: the campaign ran its window on 4 channels; posts reached v3;
        reported against the brief
open: one flagged reply is waiting on an answer from support
```

## The failure edges that have actually fired

- **A sign-off comes back with changes.** The run returns to
  produce-posts, and only the piece the signers named reopens. The
  direction was never the problem.
- **Creative goes stale mid-flight.** Optimize sends the run back to
  produce-posts while the campaign is live, and the replacement assets
  get a new version like any others.
- **The trigger fires while runs are in flight.** Six at once is normal
  here, which is why the concurrency line says so. The runs share the
  claims register and the brand guidelines, both read-only during a run.
- **A run is abandoned.** Scheduled posts have to be pulled and the ads
  turned off by hand, and the spend line reconciles anyway. Abandoning a
  campaign cancels its remaining work. The books still have to close.
