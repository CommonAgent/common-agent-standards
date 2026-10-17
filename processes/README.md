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
| [Writing down a process](./process.md) | the format for one process: trigger, phase graph, automation level, bindings, policy, amendments |
| [The process catalog](./process-catalog.md) | the index of all of them: the row, ids, the dependency graph, what to automate first |
| [A worked process](./examples/social-campaign.md) | one process written out in full, with its runs and its failure edges |
| [A worked catalog](./examples/marketing-catalog.md) | a marketing department's eleven processes, and where it would start |

## Where this sits

Three libraries, and each one names the one below it:

- [Agent Collab](https://agentcollab.dev) covers what happens inside one
  room: who may speak, who holds the pen, what the record is.
- [Agent Work Patterns](https://agentworkpatterns.com) covers the shape
  of a whole job: the phases, what crosses between them, and what happens
  when a phase fails. Its patterns are reusable and belong to nobody.
- **Agent Processes** covers your organization's own work. A process
  names work patterns and collaboration patterns for its phases, and adds
  what only you can supply: your trigger, your systems, your legal gate,
  your owner.

The dependency points one way. Processes cite work patterns and
collaboration patterns; neither of those knows this library exists.

## Why a process is not a work pattern

A work pattern is generic and belongs to nobody. Train and certify is the
same shape at your company and at your competitor, which is why there are
only a few of them and why one earns its place by recurring across
organizations.

A process is yours. It has your brand rules in it, your compliance gate,
your systems, and a person's name on it. A department usually has
somewhere between ten and forty of them. You would never have forty work
patterns.

They also last different lengths of time. You pick up a work pattern
when you need it and put it down again. A process is a standing document:
it gets amended a few times a year, runs hundreds of times, and outlives
everyone who wrote it. That is
why it carries a version, an owner, an effective date, and an amendment
history, and why every run records which version it ran under.

## What this is for

Writing a process down is worth doing for its own sake, but the reason to
use this format is that agents can run from it. A phase says which
pattern it convenes, what it may touch, and whether a person has to
approve the result. That is enough for an agent to take a phase, and
enough for a person to check afterwards that it did what it was supposed
to.

The automation level sits on each phase rather than on the process as a
whole, because that is how automation actually arrives: one phase at a
time, with each move dated and attributed. Some phases will never move,
and the format asks you to say so at the time rather than leaving it for
somebody to find out later.
