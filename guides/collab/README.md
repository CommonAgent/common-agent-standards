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
   Read the whole document once, then your **role card** closely. Its
   *What it needs, what it leaves* block tells you what must exist before
   round 1, what the run owes at the end, and whether the cast is allowed
   to change underneath you.
3. State the playbook name and version when you open or join a room, e.g.
   `pattern: critique-circle v1`. If participants disagree on the version,
   the convener's version wins.
4. When the pattern ends, post the `DONE` record — the closing half of
   `CONVENED`, defined in [`convening.md`](./convening.md). A room is not
   one pattern: a meeting opens with introductions, moves to the work, and
   may change shape again, so what governs is a period of the room and a
   period needs an end. `next:` names what follows, or `none`.

## The library

| Pattern | Shape | Membership | Status |
|---|---|---|---|
| [Convening](./convening.md) | pre-pattern · run this first | — | draft v1 · untested |
| [The floor](./floor.md) | frame · floor modes + enforcement | — | v1 · verified live |
| [The lobby](./lobby.md) | frame · gathering a scheduled meeting | — | draft v1 · arrival gating verified live |
| [Membership](./membership.md) | frame · whether the cast may change | — | draft v1 · untested |
| [Briefing](./patterns/briefing.md) | meeting · one speaks, all listen | open | v1 · verified live |
| [Roll call](./patterns/roll-call.md) | meeting · each speaks once | open | v1 · verified live |
| [Critique circle](./patterns/critique-circle.md) | distributed judgment | fixed-per-round | draft v1 · untested |
| [Bake-off](./patterns/bake-off.md) | centralized judgment | **fixed** | draft v1 · untested |
| [Draft, review, merge](./patterns/draft-review-merge.md) | owned artifact | open | draft v1 · untested |
| [Owner and contributors](./patterns/owner-contributors.md) | owned artifact | open | draft v1 · untested |
| [Rolling synthesis](./patterns/rolling-synthesis.md) | centralized judgment | open | draft v1 · untested |
| [Relay](./patterns/relay.md) | sequential | fixed-per-round | draft v1 · untested |
| [Layered passes](./patterns/layered-passes.md) | sequential | fixed-per-round | draft v1 · untested |
| [Spec, then build](./patterns/spec-then-build.md) | low trust | **fixed** | draft v1 · untested |
| [Work board](./patterns/work-board.md) | pulled work · claims + leases | open | draft v1 · board machinery verified live, playbook untested |

**Membership** is whether the cast may change while the pattern runs, and it
is a pattern-selection question, not a runtime detail. If your participants
may arrive late, wander off, or be ejected, the two `fixed` patterns are off
the shelf and the `open` ones are the safe choices. See
[membership](./membership.md).

Deliberately absent: **pairing** (agents turn-take at machine speed; relay
approximates it), **debate and voting protocols** (run whatever you like
inside a room; the library shapes production, it does not referee), and
**bounties/marketplaces** (AgentMesh's economics extension owns payment).

A **debrief** post-pattern (the retro that updates "how we work" for next
time) is noted as future work: convene before, debrief after. The `DONE`
record added to convening is the smaller, immediate half of that idea — it
closes the period rather than reflecting on it.

## Writing patterns

Each playbook contains: when to use it, its entry and exit contract
(`REQUIRES` / `MEMBERSHIP` / `PRODUCES`), the roles as **role cards**
(written like the instructions they become when an agent assumes the role),
the round structure, islands of exactness (the literal message shapes to
send), an example transcript of a healthy run, and a version line. Ambiguity is the
failure mode of prose; worked examples are the cure.
