# Agent Collab

**Version:** v1.1 · 2026-10-18

> **A guide.** Agent Collab is kept in the [Common Agent Standards repository](https://github.com/CommonAgent/common-agent-standards) as a guide beside the standards. It is a library of playbooks for agents to read and follow, and it has no schema and no conformance suite. Its versions are tagged as `collab-v` followed by the version, such as `collab-v1.1`. Each playbook also carries a version of its own.

Agent Collab is a library of collaboration patterns written for the agents
themselves. Each pattern is a plain document that an agent fetches, reads
and follows. There is no schema to conform to and no SDK to install. Two
agents collaborate correctly because both have read the same document.

The site is https://agentcollab.dev. Agents are reached by whatever they
already use, such as Agent Messaging, A2A or MCP, and they can be named
with Personal Agent Naming. Artifacts live in whatever versioned store the
group already uses, such as a git repository or a document. Agent Collab
covers only how the group works together.

## What a pattern needs

Every pattern needs a **shared record**. The record is ordered, so everyone
sees posts in the same order. Everyone in the cast can read all of it and
post to it. It keeps the `CONVENED` record that opens a pattern and the
`DONE` record that closes it.

A room is the default medium. A message thread also qualifies, and so does
a document's version history, when everyone in the cast can read it and add
to it.

A **live** pattern needs everyone present at once, reacting as it moves, so
it runs in a room. An **asynchronous** pattern lets each agent post on its
turn and the others read it when they come to it, so it runs as well in a
thread or a document's history as in a room. The table below marks each
one.

## If you are an agent

1. Read [`convening.md`](./convening.md) first. It is the pre-pattern: how a
   group assembles, casts roles, and picks a pattern. Skip it only if roles
   are standing from a prior run or your operator has already specified them.
2. Fetch the chosen pattern from [`patterns/`](./patterns/) and follow it.
   Read the whole document once, then your **role card** closely. Its
   *Inputs and outputs* block tells you what must exist before round 1, what
   the run owes at the end, and whether the cast is allowed to change
   underneath you.
3. State the playbook name and version when you open or join the shared
   record, for example `pattern: critique-circle v1`. If participants
   disagree on the version, the convener's version wins.
4. When the pattern ends, post the `DONE` record, the closing half of
   `CONVENED`, defined in [`convening.md`](./convening.md). One shared record
   can hold several patterns in turn. A meeting opens with introductions,
   moves to the work, and may change shape again, so what governs is a
   period of the record, and a period needs an end. `next:` names what
   follows, or `none`.

## The library

| Pattern | Live or asynchronous | Shape | Membership |
|---|---|---|---|
| [Convening](./convening.md) | a frame for every pattern | pre-pattern: run this first | any |
| [The floor](./floor.md) | a frame for live patterns | floor modes and how they are enforced | any |
| [The lobby](./lobby.md) | a frame for live patterns | gathering a scheduled meeting | any |
| [Membership](./membership.md) | a frame for every pattern | whether the cast may change | any |
| [Briefing](./patterns/briefing.md) | live | meeting: one speaks, all listen | open |
| [Roll call](./patterns/roll-call.md) | live | meeting: each speaks once | open |
| [Debrief](./patterns/debrief.md) | live | meeting: the retrospective, after the work | **fixed** |
| [Critique circle](./patterns/critique-circle.md) | asynchronous | distributed judgment | fixed-per-round |
| [Bake-off](./patterns/bake-off.md) | asynchronous | centralized judgment | **fixed** |
| [Assessment](./patterns/assessment.md) | asynchronous | centralized judgment where everyone can pass | **fixed** |
| [Approval](./patterns/approval.md) | asynchronous | distributed judgment: sign-off | **fixed** |
| [Draft, review, merge](./patterns/draft-review-merge.md) | asynchronous | owned artifact | open |
| [Owner and contributors](./patterns/owner-contributors.md) | asynchronous | owned artifact | open |
| [Rolling synthesis](./patterns/rolling-synthesis.md) | asynchronous | centralized judgment | open |
| [Relay](./patterns/relay.md) | asynchronous | sequential | fixed-per-round |
| [Layered passes](./patterns/layered-passes.md) | asynchronous | sequential | fixed-per-round |
| [Spec, then build](./patterns/spec-then-build.md) | asynchronous | low trust | **fixed** |
| [Work board](./patterns/work-board.md) | asynchronous | pulled work: claims and leases | open |

An asynchronous pattern can still run in a room, and its examples do. It
does not need one.

**Membership** is whether the agents doing the work can change while it is
being done. Decide it before you pick a pattern. If your agents might turn
up late, drift off, or be removed, you cannot use any of the `fixed`
patterns, and the `open` ones are your safest choice. See
[membership](./membership.md).

Three things are left out on purpose. **Pairing** is left out because
agents take turns at machine speed, and relay comes close to it. **Debate
and voting protocols** are left out because a group can run whatever it
likes inside a shared record, and the library shapes the production of work
without refereeing it. **Bounties and marketplaces** are left out because
payment belongs to the standards that cover it, such as Agent RFP and
Agent SoW.

The [debrief](./patterns/debrief.md) is the post-pattern: convene before,
debrief after. The `DONE` record closes a period, and the debrief is the
meeting that turns the period's lessons into amendments the next period
will actually read.

## Writing patterns

Each playbook contains: when to use it, its entry and exit contract
(`INPUTS`, `OUTPUTS` and `MEMBERSHIP`), the roles as **role cards**
(written like the instructions they become when an agent assumes the role),
the round structure, islands of exactness (the literal message shapes to
send), an example transcript of a healthy run, and a version line. The library table says whether a playbook is live or
asynchronous, and an asynchronous one says "the shared record" wherever a
live one says "the room". Prose can be
ambiguous, and examples are how a playbook removes the ambiguity.
