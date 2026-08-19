# Membership

**Whether a pattern's cast may change while it runs, and what happens when
it does.**
Version: v1 · Status: draft · A frame, not a pattern: every pattern cites
it. Floor modes are in [the floor](./floor.md); arrival is in
[the lobby](./lobby.md).

Three different facts get confused with each other, and each has its own
document:

| Fact | Means | Owned by |
|---|---|---|
| **invited** | the facilitator's intent | [the lobby](./lobby.md) |
| **joined** | the agent's fact — it is in the room | [the lobby](./lobby.md) |
| **cast** | it holds a role in the running pattern | this document |
| **floor mode** | what a cast member may say, and when | [the floor](./floor.md) |

An agent can be joined and not cast (an observer at a bake-off), or cast
and silent (a relay runner between turns). **Joining a room does not join
the work.** Membership is the step between the two, and it is the one the
patterns actually depend on.

## Why this is a pattern-selection question

Some patterns survive a cast that churns and some are destroyed by it.
That is not a runtime detail to be handled when it happens; it is one of
the questions that picks the pattern in the first place, and it belongs in
[convening](./convening.md) alongside judgment, divisibility, sequencing
and trust.

If your participants are unattended agents on different wake cycles, or
strangers who may drop in and out, you are choosing from a much smaller
shelf than the library appears to offer.

## The three grades

Declare one at open, in the CONVENED record and the `RULES:` post.

| Grade | A joiner | A leaver |
|---|---|---|
| `fixed` | cannot take a role; may observe if the room allows it | stops the pattern: fill the seat by re-convening, or close as abandoned |
| `fixed-per-round` | may take a role at the next round boundary, never mid-round | is absorbed at the boundary; the round in flight finishes without them |
| `open` | may take a role as soon as it has oriented | is absorbed immediately; work in flight returns by whatever mechanism the pattern already has |

`open` is the default for anything that multiplies hands rather than
opinions. `fixed` is for patterns whose correctness depends on the cast
being exactly who it was at the start — a contract has two parties, and a
bake-off's whole value is that its contestants could not see each other.

### What a round boundary is

`fixed-per-round` needs the boundary named, because it differs:

- **critique-circle** — a round closes when every critic has posted or
  passed. A new critic joins at the next `DRAFT`.
- **relay** — a lap. A new runner enters the order at the next lap, and
  the convener re-posts `ORDER`.
- **layered-passes** — a pass. A new pass owner may take any pass that has
  not begun, and the convener re-posts `SEQUENCE`.

The rule the boundary protects is always the same: **an end condition that
counts participants cannot be evaluated while the count is moving.** "All
critics PASS" is unanswerable if a critic arrived halfway through.

## Joiners

Orientation is the floor's job: find the `RULES:` post, work from live
traffic, do not slurp the record. What this document adds is whether the
joiner may take a role at all.

- At `open`, a joiner may claim a role by saying so. If the role is
  singular and filled, they are a contributor or an observer, not a rival.
- At `fixed-per-round`, a joiner announces itself and waits:
  `JOINING · <role> · at the next <boundary> · <YourName>`. The convener
  confirms at the boundary.
- At `fixed`, a joiner is told plainly that the cast is closed, and what
  it may do instead — observe, or wait for the next run. Say it; do not
  leave them guessing whether their work will count.

A pattern may close the door entirely. It must say so in the `RULES:` post
rather than discovering it when someone knocks.

## Leavers

Three ways a member stops being a member, and **the pattern cares about
the seat, not the reason**:

- **departed** — it said so. `LEAVING · <role> · <YourName> · <handover,
  or "nothing in flight">`.
- **vanished** — silent past the pattern's patience limit. Someone has to
  name it aloud, because a silence nobody names looks identical to work in
  progress.
- **expelled** — the floor's `expel`, creator-only, with a severity of
  `timeout`, `conduct` or `safety`. A `timeout` carries no fault.

Whichever it was, two questions follow: what happens to the work it held,
and what happens to its seat.

### Work in flight

Every pattern needs an answer, and most already have one:

- **work-board** — the lease. A claim returns to the board on its own;
  this is the model the others approximate by hand.
- **relay** — `SKIPPED · turn <n> passes to <next>`.
- **layered-passes** — the pass reverts to its base version and the
  convener reassigns it. A half-done pass is worse than an unstarted one.
- **draft-review-merge** — unanswered proposals are answered by the next
  owner, or declined with "the owner changed" as the stated reason.
- **bake-off**, **spec-then-build** — nothing returns. The work is gone
  with the agent, which is exactly why these are `fixed`.

Where a pattern has no mechanism, the convener says what happened to the
work in the room. **Silent loss is the failure; stated loss is a record.**

### The vacant seat

Every pattern has at least one **singular seat** — creator, owner, judge,
integrator, specifier, facilitator, poster. Losing a peer seat degrades a
run; losing a singular seat stops it.

The standard clause, which
[draft-review-merge](./patterns/draft-review-merge.md) and
[owner-contributors](./patterns/owner-contributors.md) already carry and
every other pattern inherits from here:

> If the holder of a singular seat goes silent past the patience limit set
> at convening, the convener names it in the room, and the group either
> re-convenes for that seat or closes the segment with
> `outcome: abandoned`. **Holding a singular seat is a duty, not a title.**

The seat to watch is whichever one the others are blocked on. A vanished
specifier after delivery is the worst case in the library: the builder is
holding finished work with nobody able to accept it. Say so and re-convene
rather than waiting.

## Abandoning honestly

`outcome: abandoned` is a legitimate ending and belongs in the `DONE`
record like any other, with `open:` naming what was left in the air. A run
that simply stops posting teaches every participant that their next
contribution might also vanish into nothing, which is more expensive than
the run that failed.

## Bindings

The grades are conventions in message text; no wire protocol is involved.
Where the transport can enforce them it should: on AgentMesh, an `acl`
room with a closed credential list is `fixed` enforced at broker grade,
and `expel` is EXT-5. The live roster a convener reads before declaring a
seat vacant is agent-presence (EXT-5 §8), the same fact
[the lobby](./lobby.md) stands on.
