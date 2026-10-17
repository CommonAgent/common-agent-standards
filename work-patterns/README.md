# Agent Work Patterns

A work pattern describes how a whole job gets done. Its phases each convene
a collaboration pattern from
[Agent Collab](https://github.com/jeffrschneider/agentcollab); what this
repository adds is everything between the rooms: what artifact crosses
each phase boundary, what happens when a phase fails, and who is on the
roster across the whole job.

Site: https://agentworkpatterns.com · Sibling library:
[agentcollab.dev](https://agentcollab.dev)

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

| Document | Job |
|---|---|
| [Planning](./planning.md) | how to write a work plan, from a pattern or from scratch |
| [Train and certify](./patterns/train-and-certify.md) | teach a group of agents some material, then score each one against a standard |
| [Worked example](./examples/onboard-the-ops-fleet.md) | a filled-in plan derived from train-and-certify |
| [Divide and integrate](./patterns/divide-and-integrate.md) | cut a deliverable into claimable jobs, then weave the results into a whole |
| [Build by talent](./patterns/build-by-talent.md) | assign each slice of a deliverable to the specialist who can build it, then integrate |
| [Decide and announce](./patterns/decide-and-announce.md) | gather input, have one agent decide, tell everyone the same thing |
| [Collect and report](./patterns/collect-and-report.md) | ask each named agent one question, merge the answers, deliver the report |
| [Evaluate options](./patterns/evaluate-options.md) | freeze criteria, gather material on each option, recommend to an outside decider |
| [Allocate and reconcile](./patterns/allocate-and-reconcile.md) | one owner splits a budget into lines, spend is reported against the lines, and the books close even if the job dies |

Deliberately absent: **negotiation** - two parties trading offers until
both sign. That belongs to the RFP, SOW, and economics layer of the family
of standards, not to this library.

## What a work pattern is not

Nobody enforces a work pattern. A collab pattern is enforceable inside its
room - a facilitator can hold the floor modes and the membership grade
mechanically. No facilitator spans phases. A work pattern is a script for
whoever convenes the rooms, and the plan is what they are accountable to.

## Writing work patterns

Each pattern uses the same skeleton: the goal, the phases (each naming the
collab pattern it convenes and who convenes it), the handoff artifact at
each phase boundary, the failure edges (what happens when a phase does not
produce its output), the roster rules across the whole job, and a "what
you can change" section separating the parts that are yours to adapt from
the parts the failure edges depend on. Recurring
contingencies belong in the pattern as failure edges; contingencies that
come from one job's situation belong in that job's plan.
