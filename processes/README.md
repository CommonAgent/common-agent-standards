# Agent Processes

How an organization writes down the work it actually does, in a form
agents can run.

A **process** is one recurring piece of work that belongs to your
organization: what starts it, who owns it, the graph of phases it runs,
which of them agents may run alone, and what a run has to leave behind.
A **catalog** is all of them together, which is how you find out what a
department really does and where automation is worth the money.

Site: https://agentprocesses.ai

## The library

| Document | What it covers |
|---|---|
| [The specification](./SPEC.md) | version 0.7.0-draft, status Working Draft: what a process document means, precisely enough that two programs reading it behave the same way |
| [Writing down a process](./process.md) | the format for one process: trigger, phase graph, automation level, bindings, policy, amendments |
| [The process catalog](./process-catalog.md) | the index of all of them: the row, ids, the dependency graph, what to automate first |
| [An example process](./examples/social-campaign.md) | one process written out in full, with its runs and its failure edges |
| [An example catalog](./examples/marketing-catalog.md) | a marketing department's eleven processes, and where it would start |
| [Onboard an agent](./reference/onboard-an-agent.md) | a reference process for bringing an outside agent into an organization's work |
| [Offboard an agent](./reference/offboard-an-agent.md) | a reference process for taking an outside agent out of it again |

## Where this sits

Agents work together in three ways, and Agent Processes covers the
first:

- **Process-led orchestration.** A written process leads, and an
  orchestrator follows it. This is Agent Processes.
- **Harness-led orchestration.** An agent's own loop leads. A process
  hands one phase to a harness by writing it as a `harness:` phase. The
  phase names what has to come out, and the process never reaches
  inside.
- **Choreography.** Nobody leads. Agents react to the same events, and
  an event carried by Agent Messaging can start a process.

[Agent Collab](https://agentcollab.dev) covers what happens inside one
room: who may speak, who holds the pen, what the record is. A process
names a collab playbook for each phase that convenes a room. The
dependency points one way, and Agent Collab does not know this library
exists.

## A process and a harness

A harness is an agent working out a job as it goes. It suits open-ended
work where nobody knows the steps yet, and when it finishes it leaves
one closing record saying what it produced.

A process is yours, and its steps are known. It has your brand rules in
it, your compliance gate, your systems, and a person's name on it. A
department usually has somewhere between ten and forty of them.

They also last different lengths of time. A harness takes up one job
and puts it down again. A process is a standing document: it gets
amended a few times a year, runs hundreds of times, and outlives
everyone who wrote it. That is why it carries a version, an owner, an
effective date, and an amendment history, and why every run records
which version it ran under.

## What this is for

Writing a process down is worth doing for its own sake, but the reason to
use this format is that agents can run from it. A phase says which
playbook it convenes or which agent leads it, what it may touch, and
whether a person has to approve the result. That is enough for an agent to take a phase, and
enough for a person to check afterwards that it did what it was supposed
to.

The automation level sits on each phase rather than on the process as a
whole, because that is how automation actually arrives: one phase at a
time, with each move dated and attributed. Some phases will never move,
and the format asks you to say so at the time rather than leaving it for
somebody to find out later.
