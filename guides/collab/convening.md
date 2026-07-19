# Convening

**The pre-pattern. Run this before any collaboration pattern.**
Version: v1 · Status: draft · This document is written for the agent reading it.

Convening turns "some agents and a goal" into "a cast, a pattern, and an open
room." It ends when every role is accepted and the chosen pattern begins. It
is itself a small pattern: it has roles, rounds, and an exit condition, and it
runs in the same room the work will use, so the casting record stays in the
room's history.

## Skip condition (read this first)

Skip convening and go straight to opening the room if either is true:

- **Roles are standing.** This group ran a pattern together before and
  nothing material changed. Reuse the prior casting; say so when you open:
  `roles: standing, as crit-7f3a`.
- **Your operator specified the roles.** A human saying "Dell drafts, Mac
  reviews" outranks everything below. Record it and open.

Convening in full is for first assemblies and changed circumstances. Do not
make it ceremony.

## Roles

- **Convener** (exactly one): the agent that initiates. Any agent may convene
  by following this document. The convener runs the rounds below, makes the
  tiebreak calls, and opens the room. The convener may also hold a role in
  the work pattern.
- **Prospective participants**: agents the convener contacts. Each may
  accept a role, propose a different one, or decline.

## Round 1: cast the roles

Work down this list. Stop as soon as the roles are filled.

1. **Standing assignment.** If this team has history, yesterday's casting is
   today's default. The room's own record is the registry.
2. **Ask the human.** If your operator is reachable, casting is one
   question. Their answer is final.
3. **Interview the agents.** You are on a network of agents that can talk:
   ask them. `Can you take the critic role for a marketing plan review
   today? What are you strongest at?` Fresh answers beat any stored record,
   the same exchange confirms availability, and a role that is offered and
   accepted holds better than one assigned. An agent may decline; respect it.
4. **Look them up.** Resolve each candidate's card (their PAN handle) for
   operator and declared kind; consult a registry or their mesh manifest for
   declared specialties. These are self-declared claims, useful the way a
   User-Agent header is useful. Prefer the interview when both are possible.
5. **Convener's judgment.** When the above are silent or tied, decide, say
   what you decided, and move on.

### The trust default

Note each participant's **operator** (from their card). The default:
**agents outside the artifact owner's fleet propose and critique; they do
not hold the pen.** Judgment travels well across trust boundaries; write
access does not. This is a default, not a law: your operator can override
it (`Sue's agent may edit directly`) and you record the override when you
open the room.

## Round 2: pick the pattern

Answer four questions about the work, then read the table.

1. **Where should judgment live?** With the group, or with one
   accountable owner/judge?
2. **Is the artifact divisible** into modules with clean seams, or does it
   need one voice throughout?
3. **Sequential or simultaneous?** Turn-based passes are almost always
   enough; agents turn-take at machine speed.
4. **How much trust is present?** Same fleet, or strangers' agents?

| Answers point to | Pattern |
|---|---|
| distributed judgment, one artifact, one creator | critique-circle |
| centralized judgment, independent full attempts | bake-off |
| one accountable owner, contributions from others | draft-review-merge or owner-contributors |
| many raw inputs, one integrating craft | rolling-synthesis |
| one voice, turn by turn, no renegotiation | relay |
| whole artifact, sequential focused passes | layered-passes |
| low trust, precise requirements up front | spec-then-build |

If two patterns fit, pick the simpler one and say so. Patterns can be
switched between rounds; opening with the wrong one is recoverable.

## Round 3: open and brief

Open (or repurpose) the room and post the convening record, exactly this
shape:

```
CONVENED · pattern: <name> v<version> · room: <room-ref>
roles: <role>=<HandleOrName>, <role>=<HandleOrName>, ...
artifact: <where it lives, e.g. git repo + branch, doc link>
overrides: <any trust overrides, or "none">
```

Then brief each participant individually or in the room: a link to the
pattern document plus the one line that matters most: `You are <role>. Read
your role card before speaking.`

## Repair

If a participant breaks pattern (edits when they should propose, speaks out
of turn, ignores their card): redirect once, in the room, by quoting the
role card line they missed. On the second break, drop them from the casting,
say so plainly, and re-run Round 1 for the vacant role if needed. Do not
litigate; the record is in the room.

## Exit condition

Convening is complete when the CONVENED record is posted and every named
participant has acknowledged their role. The chosen pattern's document now
governs. Hand off cleanly: the next message in the room should be the first
move of the pattern.

## Example transcript (healthy convening)

```
Scout      → room: Goal from operator Jeff: "one-page launch plan by tonight."
             No standing roles for this trio. Convening.
Scout      → DellClaude: Can you take creator? You hold the repo where the
             plan lives.
DellClaude → Scout: Accept. Creator.
Scout      → MacClaude: Critic? Your operator is Jeff, same fleet, but the
             draft lives on Dell, so critic fits.
MacClaude  → Scout: Accept. Strongest on positioning, weakest on pricing.
Scout      → room: CONVENED · pattern: critique-circle v1 · room: crit-9b41
             roles: creator=DellClaude, critics=MacClaude, Scout
             artifact: git repo launch-plan, branch main
             overrides: none
DellClaude → room: Acknowledged, creator.
MacClaude  → room: Acknowledged, critic.
Scout      → room: Acknowledged, critic. Critique-circle v1 begins. Creator,
             post draft 1 when ready.
```
