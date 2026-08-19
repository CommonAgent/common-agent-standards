# Train and certify

**Teach a group of agents some material, then score each one against a
standard.**
Version: draft v1 - untested.

## When to use it

- A group of agents needs to learn material they will be held to: new
  standing instructions, a revised protocol, a domain they are about to
  work in.
- "Learned it" has to be demonstrated, not assumed. Each agent is scored
  against a published standard, and every agent can pass. This is not a
  contest - if you want a ranking and one winner, run
  [bake-off](https://github.com/jeffrschneider/agentcollab/blob/main/patterns/bake-off.md)
  instead.

## Phases

1. **Teach** - convenes
   [briefing](https://github.com/jeffrschneider/agentcollab/blob/main/patterns/briefing.md),
   convened by the trainer. The trainer presents the material as numbered
   items; trainees are observers in listen-only mode. The minutes matter
   more here than in most briefings: they are the study text for phase 2,
   and a latecomer joins the cohort by reading them.

2. **Certify** - convenes **assessment**, a pattern agentcollab does not
   have yet. The closest existing pattern is bake-off, and it is close for
   a reason: frozen brief, criteria published before work starts,
   candidates working privately, one submission each, fixed membership.
   But bake-off's verdict ranks the candidates against each other and
   picks one winner, and that is the wrong behavior here - each trainee is
   scored independently against the published standard, and everyone can
   pass. Until assessment is written, the examiner posts the rules in the
   room: criteria first, then frozen; each trainee submits privately; the
   examiner scores each submission against the criteria only, never
   against another trainee's submission.

Between the phases there is no room: trainees study the minutes privately.
Give this gap a stated length in the plan, or the certify phase never gets
scheduled.

## Handoffs

- **teach -> certify:** the minutes. They must be complete before the
  criteria are published, because the criteria may only test what the
  minutes cover. If the examiner wants to test something the trainer never
  taught, that is a gap in the teach phase, not a harder exam.

## Failure edges

- **A trainee fails.** Re-brief only the failed trainees on the items they
  missed, then re-run certify for them alone. The passing trainees' scores
  stand.
- **Most of the cohort fails.** The problem is the material or the
  criteria, not the trainees. Revise one or both and re-run the whole job
  from teach. Say in the plan who judges "most".
- **A trainee goes quiet during certify.** Score what was submitted, or
  record "no result" for that trainee. Do not hold the cohort's results
  for one absentee.

## Roster

The job is as strict as its strictest phase. Teach is open - observers
cost nothing and the minutes catch a latecomer up. Certify is fixed once
the criteria are published: nobody joins an exam in progress. So the
practical rule is that anyone may join the cohort up to the moment the
criteria are published, by reading the minutes, and after that the roster
is frozen until the scores post. An agent who arrives later waits for the
next run.

## What you can change

Yours to change: the cohort size, the number of items, the passing
threshold, the length of the study gap, the role names, and whether the
trainer and the examiner are the same agent.

Load-bearing - the failure edges and the roster rule depend on these:

- the criteria are written from the minutes and nothing else
- the criteria freeze before the exam, and the roster freezes with them
- each trainee is scored against the criteria, never against another
  trainee
- a re-run re-briefs only the failed trainees, on only what they missed

## What the job produces

```
result: a score per trainee against the published standard, pass or fail
record: the minutes (teach) and the scored submissions (certify)
open:   trainees who failed or went quiet, if no re-run is planned
```
