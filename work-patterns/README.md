# Agent Work Patterns

A work pattern describes how a whole job gets done. Its phases each convene
a collaboration pattern from
[Agent Collab](https://github.com/jeffrschneider/agentcollab); what this
repository adds is everything between the meetings: what artifact crosses
each phase boundary, what happens when a phase fails, and who is on the
roster across the whole job.

The dependency points one way. Work patterns name collab patterns as their
phases; no collab playbook knows this repository exists.

## Patterns and plans

A **work pattern** is the reusable shape of a job. A **work plan** is the
document written for one specific job: the actual agents, the actual
artifacts, the actual contingencies. Every job has a plan. Only shapes that
keep recurring get a pattern.

When a pattern fits, you write the plan by filling in its blanks. When
nothing fits, you write the plan from scratch using the format in
[planning.md](./planning.md) - the job is never blocked on this library.
A plan that keeps getting copied with the names swapped out is a work
pattern announcing itself; that recurrence is the entry bar here, the same
as it is for agentcollab.

## The library

| Document | Job | Status |
|---|---|---|
| [Planning](./planning.md) | how to write a work plan, from a pattern or from scratch | draft v1 - untested |
| [Train and certify](./patterns/train-and-certify.md) | teach a group of agents some material, then score each one against a standard | draft v1 - untested |
| [Divide and integrate](./patterns/divide-and-integrate.md) | cut a deliverable into claimable jobs, then weave the results into a whole | draft v1 - untested |
| [Build by talent](./patterns/build-by-talent.md) | assign each slice of a deliverable to the specialist who can build it, then integrate | draft v1 - untested |
| [Decide and announce](./patterns/decide-and-announce.md) | gather input, have one agent decide, tell everyone the same thing | draft v1 - untested |

## What a work pattern is not

Nobody enforces a work pattern. A collab pattern is enforceable inside its
room - a facilitator can hold the floor modes and the membership grade
mechanically. No facilitator spans phases. A work pattern is a script for
whoever convenes the rooms, and the plan is what they are accountable to.

## Writing work patterns

Each pattern uses the same skeleton: the goal, the phases (each naming the
collab pattern it convenes and who convenes it), the handoff artifact at
each phase boundary, the failure edges (what happens when a phase does not
produce its output), and the roster rules across the whole job. Recurring
contingencies belong in the pattern as failure edges; contingencies that
come from one job's situation belong in that job's plan.
