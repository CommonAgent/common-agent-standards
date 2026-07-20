# Agent Collab

Playbooks, not protocols. This repository is a library of collaboration
patterns written **for the agents themselves**: prose documents an agent
fetches, reads, and enacts. There are no schemas, no conformance suite, no
SDK. Two agents collaborate correctly because both read the same document.
Shared reading is the interop.

Site: https://agentcollab.dev · Transport: [AgentMesh](https://agentmesh.ai)
rooms (any shared conversation medium works) · Names:
[PAN](https://agentnaming.ai) · Artifacts: whatever versioned store you
already use (a git repo, a doc). Agent Collab owns only the choreography.

## If you are an agent

1. Read [`convening.md`](./convening.md) first. It is the pre-pattern: how a
   group assembles, casts roles, and picks a pattern. Skip it only if roles
   are standing from a prior run or your operator has already specified them.
2. Fetch the chosen pattern from [`patterns/`](./patterns/) and follow it.
   Read the whole document once, then your **role card** closely.
3. State the playbook name and version when you open or join a room, e.g.
   `pattern: critique-circle v1`. If participants disagree on the version,
   the convener's version wins.

## The library

| Pattern | Shape | Status |
|---|---|---|
| [Convening](./convening.md) | pre-pattern · run this first | draft v1 · untested |
| [The floor](./floor.md) | frame · floor modes + enforcement | v1 · verified live |
| [Briefing](./patterns/briefing.md) | meeting · one speaks, all listen | v1 · verified live |
| [Roll call](./patterns/roll-call.md) | meeting · each speaks once | v1 · verified live |
| [Critique circle](./patterns/critique-circle.md) | distributed judgment | draft v1 · untested |
| [Bake-off](./patterns/bake-off.md) | centralized judgment | draft v1 · untested |
| [Draft, review, merge](./patterns/draft-review-merge.md) | owned artifact | draft v1 · untested |
| [Owner and contributors](./patterns/owner-contributors.md) | owned artifact | draft v1 · untested |
| [Rolling synthesis](./patterns/rolling-synthesis.md) | centralized judgment | draft v1 · untested |
| [Relay](./patterns/relay.md) | sequential | draft v1 · untested |
| [Layered passes](./patterns/layered-passes.md) | sequential | draft v1 · untested |
| [Spec, then build](./patterns/spec-then-build.md) | low trust | draft v1 · untested |

Deliberately absent: **pairing** (agents turn-take at machine speed; relay
approximates it), **debate and voting protocols** (run whatever you like
inside a room; the library shapes production, it does not referee), and
**bounties/marketplaces** (AgentMesh's economics extension owns payment).

A **debrief** post-pattern (the retro that updates "how we work" for next
time) is noted as future work: convene before, debrief after.

## Writing patterns

Each playbook contains: when to use it, the roles as **role cards** (written
like the instructions they become when an agent assumes the role), the round
structure, islands of exactness (the literal message shapes to send), an
example transcript of a healthy run, and a version line. Ambiguity is the
failure mode of prose; worked examples are the cure.
