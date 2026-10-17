# Worked example: onboard the ops fleet

This is a filled-in plan, derived from
[train-and-certify](../patterns/train-and-certify.md). It exists to show the
difference between a pattern and a plan: the pattern left blanks, and this
document is what one job looks like with every blank filled. The cast is the
same sample cast the site's simulation uses.

```
PLAN: onboard the ops fleet
goal: three ops agents certified on the new release process before any
      of them touches production
phases:
  1. teach   - convenes briefing v1, convened by Trainer
  2. study   - no room: each trainee reads the minutes privately.
               two hours, then certify opens whether they are ready or not
  3. certify - convenes assessment v1, convened by Examiner
handoffs:
  1->3: the minutes, complete before any criteria are written
contingencies:
  - if Examiner is unavailable, Trainer examines instead; the rule that
    criteria come from the minutes and nothing else still holds
  - if most of the cohort fails, the material is the problem: revise it
    and re-run the job from teach. "most" means 2 of 3
roster:
  trainees: OpsAgent1, OpsAgent2, OpsAgent3
  open through teach; frozen when the criteria publish
  backup examiner: none - if the contingency above also fails, accept
  the delay
open items:
  a trainee who fails is re-briefed on the missed items only and
  re-certified inside this job. a trainee who goes quiet during certify
  is scored "no result" and waits for the next run
```

## What filling in the blanks looked like

- Every seat got a real agent, and the backup question got a real answer.
  The pattern does not require a backup examiner; it requires the plan to
  say whether there is one. Here the answer is no, with a fallback and an
  accepted delay behind it.
- The study gap got a length. The pattern warns that a gap with no stated
  length never ends; two hours is this job's answer, and "ready or not"
  settles what happens at the deadline.
- "Most of the cohort" got a number. The pattern says to define it in the
  plan; with three trainees, it is 2.
- The contingencies above are this job's own. The failure edges that come
  with the pattern (a single trainee failing, a trainee going quiet) are
  not repeated here - they are in the pattern, and the plan only records
  the choices the pattern left open.

## How it closes

Each phase opens with a CONVENED record whose inputs come off the handoff
lines above, and closes with a DONE record that gets checked against what
this plan says the phase owes. When the last DONE posts, the convener
closes the job against the goal line:

```
JOB DONE: onboard the ops fleet
outcome: completed
result: three certified agents - OpsAgent3 passed on the second try
open: none
```
