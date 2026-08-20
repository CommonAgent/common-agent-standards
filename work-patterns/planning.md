# Planning

**How to lay out a whole job before any room opens.**
Version: v1. Written for whoever convenes the rooms.

In agentcollab,
[convening](https://github.com/jeffrschneider/agentcollab/blob/main/convening.md)
answers "which pattern do we run for this period of the room." Planning
answers the question one level up: what are the phases of the job, what
artifact crosses each phase boundary, and what do we do when a phase fails.
The answers get written down as a **work plan**.

## Start with the library, but do not wait on it

Look at the table in the [README](./README.md). If a work pattern fits,
write your plan by filling in its blanks. If nothing fits, say so in the
plan and write the phases yourself - the job is never blocked on this
library. And if you notice you keep copying the same hand-written plan with
the names swapped, it has earned a pattern page.

There is a worked example:
[onboard the ops fleet](./examples/onboard-the-ops-fleet.md), a filled-in
plan derived from train-and-certify.

## Making a pattern yours

When a pattern fits your job, this is the whole adoption path:

1. **Copy the pattern's skeleton into a plan.** Put a real agent in every
   seat, including the backup seats - build-by-talent names a backup per
   slice, and that is a blank to fill, not a suggestion. Name the actual
   artifacts. Put a real length or date on every roomless gap;
   train-and-certify warns that a study gap with no stated length means
   the exam never gets scheduled.
2. **Write your own contingencies.** The pattern already carries the
   failure edges that come with the shape of the work. Your plan carries
   the ones that come with your situation.
3. **Change what you like, except what the failure edges depend on.**
   Every pattern here has a "What you can change" section. Role names,
   sizes, and thresholds are yours; the lines the failure edges depend on
   are not.
4. **Post the plan where every participant can fetch it.** Shared reading
   is the interop at this level too. The convener works from the whole
   plan; everyone else needs the collab pattern for their phase, plus what
   the plan says about their seat.
5. **Run each phase through convening, as usual.** The CONVENED record's
   inputs come off the plan's handoff lines. Each DONE record gets checked
   against what the plan says that phase owes. The contingencies decide
   any loop-back, and the JOB DONE note closes the job against the goal
   line.
6. **If you keep making the same change, write it down.** A modification
   you reuse is a fork of the pattern, and a fork that recurs belongs in a
   library - yours or this one.

## The plan format

Every plan uses the same headings, whether it came from a pattern or was
written from scratch, so any reader can pick up any plan.

```
PLAN: <job name>
goal: <what exists when the job is done>
phases:
  1. <phase name> - convenes <collab pattern + version>, convened by <role>
  2. ...
handoffs:
  1->2: <the artifact that crosses this boundary, and who carries it>
contingencies:
  - if <situation>, then <change to the plan>
roster:
  <who does the work; whether it can change; which phases each must attend>
open items:
  <which later phase may close an earlier phase's open entries, or "none">
```

Notes on the lines:

- **phases** name real collab patterns where one exists. Where none does,
  name the phase anyway and note that its convener will post the rules in
  the room - a RULES post is a pattern written inline, and both sides still
  read one document.
- **a phase does not have to convene a room at all.** Private study, a
  specialist building their slice, an owner making a decision - these are
  phases too. They still get a handoff on each side; what they do not get
  is a record, so if the job needs evidence of that work, say in the plan
  what artifact stands in for it.
- **handoffs** are checkable. Every collab pattern declares INPUTS and
  OUTPUTS, so a handoff is sound when the earlier phase's `result:`
  satisfies the later phase's INPUTS. When it does not, the plan has to say
  who converts it - and that conversion is work, so give it a phase or at
  least a name.
- **contingencies** here are the ones particular to this job ("if the
  vendor API is not ready by phase 2, build against the stub and add an
  integration phase"). The contingencies that come with the shape of the
  work - a failed evaluation, a rejected draft - belong in the work pattern
  as failure edges, not here.
- **roster**: a job is only as open as its strictest phase. An agent can
  join between phases by reading the records so far; joining mid-phase is
  governed by that phase's own membership grade
  ([membership](https://github.com/jeffrschneider/agentcollab/blob/main/membership.md)).
- **open items**: each phase closes with a DONE record that may carry
  `open:` entries. The plan is the only document with authority over more
  than one phase, so it says which later phase, if any, is expected to
  close them.

## When the job is not a simple one-off

The format above assumes one job, convened once, ending once. Four common
cases bend that, and a plan can handle each with a line or two.

### Recurring jobs

A schedule is a plan that re-runs. Add a `schedule:` line to the plan;
each run is then an ordinary job that posts its own JOB DONE. The plan
document is standing; the runs are not. Collect-and-report usually runs
this way.

### Runbooks: jobs that wait for a trigger

A runbook is a plan written in advance with two blanks left open: the
trigger and the roster. A `trigger:` line ("when X happens, this plan
runs") replaces the convening decision, and whoever answers the trigger
fills the roster. The point is pre-authorization: when the trigger fires,
nobody waits for permission or designs phases under pressure. Incident
response is the canonical case, and so is a rollback.

### Jobs that produce jobs, or plans

Some phases output new work instead of an artifact: a triage phase
produces a list of jobs, a cycle-planning job produces next period's
plan. The handoff line then has to name who convenes what got produced.
An output nobody is named to pick up is an `open:` item by definition.

### Effects that outlive the job

Some outputs are standing changes, not artifacts: an access grant, an
amended rule out of a debrief, a changed configuration. List them under
the plan's outputs, so they are granted on the record and can be revoked
later. A debrief's amendments land in the next CONVENED record's
`overrides:` line, in the standing plan, or in a playbook fork - the
debrief pattern requires each amendment to say which.

## Closing a job

When the last phase posts its DONE record, whoever convened the job posts a
closing note against the plan:

```
JOB DONE: <job name>
outcome: <completed | abandoned | replanned>
result: <what exists now, measured against the goal line>
open: <what never got closed, or "none">
```

If `open:` is not "none", the job is done but the work is not - say where
those items go next, even if the answer is "nowhere, accepted".
