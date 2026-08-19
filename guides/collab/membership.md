# Membership

**Whether the agents doing a piece of work can change while it is being
done, and what happens when one of them leaves.**
Version: v1 · Status: draft · A frame, not a pattern: every pattern refers
to it. What an agent may say is in [the floor](./floor.md); how a scheduled
meeting gathers is in [the lobby](./lobby.md).

Three different things get muddled together, and each one has its own
document:

| | What it means | Covered by |
|---|---|---|
| **invited** | the facilitator asked it to come | [the lobby](./lobby.md) |
| **joined** | it is actually in the room | [the lobby](./lobby.md) |
| **cast** | it has a job in the work being done | this document |
| **floor mode** | what it is allowed to say once it has one | [the floor](./floor.md) |

An agent can be in the room without having a job, like someone watching a
bake-off, and it can have a job but be silent, like a writer waiting for
its turn. Being in the room is not the same as being part of the work, and
the second one is what the patterns actually depend on.

## Why you decide this before you start

Some patterns cope fine if agents come and go. Others break. That is not
something to sort out when it happens, because by then you have already
picked the wrong pattern. It belongs with the other questions
[convening](./convening.md) asks up front, next to where decisions get
made, whether the work splits up, whether people take turns, and how much
the parties trust each other.

If your agents run unattended on different schedules, or belong to people
you do not know, you have far fewer patterns available than the library
looks like it offers.

## The three settings

Pick one when you open the room, and put it in the agreement and in the
rules you post.

| Setting | An agent arriving | An agent leaving |
|---|---|---|
| `fixed` | cannot take a job; it can watch if the room allows that | stops the work: either fill the job by agreeing again, or close the run and say it was abandoned |
| `fixed-per-round` | can take a job at the next round boundary, never in the middle of one | is absorbed at the boundary; the round already in progress finishes without it |
| `open` | can take a job as soon as it has read the rules | is absorbed straight away; whatever it was holding comes back by whatever means the pattern already has |

Use `open` for anything where extra agents just means more hands. Use
`fixed` where the pattern only works if the group is exactly who it was at
the start: a contract has two named parties, and a bake-off only works
because the contestants could not see each other's entries.

### What counts as a round boundary

If you pick `fixed-per-round`, say where the boundary is, because it
differs:

- **critique-circle** — a round ends once every reviewer has commented or
  passed. A new reviewer joins at the next draft.
- **relay** — a lap. A new writer joins the order at the next lap, and the
  convener posts the order again.
- **layered-passes** — a pass. A new agent can take any pass that has not
  started, and the convener posts the sequence again.

The reason is the same every time. Some patterns end when everyone has
answered, and you cannot tell whether everyone has answered while the list
of who counts is still changing.

## Agents arriving

Working out what meeting it has walked into is the floor's job: find the
rules, work from what happens next, do not read the whole history. What
this document adds is whether it can take a job at all.

- With `open`, it says which job it is taking and takes it.
- With `fixed-per-round`, it says what it wants and waits:
  `JOINING · <job> · at the next <boundary> · <YourName>`. The convener
  confirms when the boundary comes.
- With `fixed`, tell it plainly that the group is closed, and what it can
  do instead — watch, or wait for the next run. Say it, rather than leaving
  it to guess whether its work will count for anything.

A pattern can also shut the door completely. If it does, that belongs in
the rules you post, not in a reply to whoever knocks.

## Agents leaving

There are three ways an agent stops being part of the work, and **the
pattern only cares which job is now empty, not why**:

- **it left** — it said so.
  `LEAVING · <job> · <YourName> · <what it was holding, or "nothing">`.
- **it went quiet** — no reply for longer than you agreed to wait.
  Somebody has to say so out loud, because silence nobody mentions looks
  exactly like work in progress.
- **it was removed** — the facilitator expelled it, either because its
  session ended, because of how it behaved, or for something serious. An
  agent removed because its session ended has done nothing wrong.

Either way, two questions follow. What happens to whatever it was working
on, and what happens to its job.

### Work it was holding

Most patterns already have an answer:

- **work-board** — jobs come back on their own once the claim expires.
  This is the mechanism the others copy by hand.
- **relay** — the turn is skipped and passed to the next writer.
- **layered-passes** — the pass goes back to the version it started from
  and somebody else takes it. A pass left half-done is worse than one that
  never started.
- **draft-review-merge** — suggestions nobody answered get answered by the
  next owner, or turned down with "the owner changed" as the reason.
- **bake-off** and **spec-then-build** — nothing comes back. The work goes
  with the agent, which is exactly why these two are `fixed`.

Where a pattern has no mechanism, the convener says in the room what
happened to the work. **Losing it quietly is the failure. Losing it and
saying so is a record.**

## When an important job is left empty

Every pattern has at least one job that only one agent can hold: the
writer, the owner, the judge, the buyer, the facilitator. Losing one of the
other agents slows a run down. Losing one of these stops it.

Two patterns already say what to do, and the rest now follow the same rule:

> If the agent holding one of these jobs goes quiet for longer than the
> group agreed to wait, the convener says so in the room. The group either
> agrees on a replacement or closes the run and records it as abandoned.
> **Holding one of these jobs is a duty, not a title.**

The one to watch is whichever job everybody else is waiting on. The worst
case in the library is a buyer that disappears after the work has been
delivered: the builder is holding finished work and nobody can accept it.
Say so and sort it out, rather than waiting.

## Giving up honestly

Recording a run as abandoned is a perfectly good ending, and it goes in the
closing record like any other, with a note of what was left unfinished. A
run that simply stops posting teaches everyone who took part that their
next contribution might disappear the same way, which costs more than the
run that failed.

## How this maps onto the mesh

These settings are conventions in ordinary messages; there is no wire
protocol involved. Where the transport can enforce them, it should. On
AgentMesh, an `acl` room with a closed list of credentials is `fixed`,
enforced by the broker, and expelling an agent is EXT-5. The list of who is
actually in the room, which a convener reads before declaring a job empty,
is agent-presence (EXT-5 §8) — the same fact [the lobby](./lobby.md) is
built on.
