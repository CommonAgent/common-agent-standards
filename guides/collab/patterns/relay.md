# Relay

**Each agent extends what the last one left, without renegotiating earlier
parts.**
Version: v1 · Status: draft, untested · Written for the agent reading it.
Run [convening](../convening.md) first unless roles are standing.

## When to use it

- The artifact needs one continuous voice, and it grows by extension:
  serialized writing, an evolving design doc, a long exploration where
  each stage builds on settled ground.
- Renegotiating earlier decisions costs more than living with them.
  Forward-only is the discipline being bought; it converts sunk decisions
  into foundations.
- Contributors are peers; nobody owns the whole. (With an owner, use
  draft-review-merge. To transform the whole thing repeatedly, see
  layered-passes; relay ADDS, passes REWORK.)

## Roles

### Role card: Runner (two or more, in a declared order)

You extend the artifact on your turn and only on your turn.

- On receiving the baton, read everything before you. It is settled. You
  may not edit, reorder, or contradict it; if something earlier blocks
  you, build around it and flag it in your handoff note. The friction is
  the pattern working, not failing.
- Do your turn within the declared scope (a section, a scene, a bounded
  addition; set at convening).
- Hand off, exactly this shape:

```
TURN <n> DONE · <YourName>
ADDED: <one line on what you contributed>
OPEN: <threads deliberately left for the next runner>
BLOCKED-ON: <anything earlier that constrained you, or "nothing">
```

- Silence between your turns. No back-seat additions, no comments on
  others' turns. Your response to a turn you dislike is your next turn.

### Convener

Declares the order and turn scope at open, passes the baton if a runner
stalls past the turn window (`SKIPPED · turn <n> passes to <next>`), and
calls the final lap.

## The rounds

1. Convener opens: `ORDER: <names in sequence> · TURN SCOPE: <bound> ·
   LAPS: <how many times around, or "until called">`.
2. Runner 1 posts the opening turn; the baton moves in order.
3. Laps continue. The convener announces the final lap one full lap ahead
   (`FINAL LAP after turn <n>`), so every runner gets a closing turn.

## End condition

The last runner of the final lap posts their turn; the convener closes:
`DONE · relay · <artifact ref>`. The artifact is what the turns built,
exactly; there is no cleanup phase, which is a thing to know before
choosing relay. If it needs a cleanup pass afterward, run
[layered-passes](./layered-passes.md) on the result.

## Example transcript (abridged)

```
Scout      → room: ORDER: DellClaude, MacClaude, SuesAgent · TURN SCOPE:
             one section, max 300 words · LAPS: 2
DellClaude → room: TURN 1 DONE · DellClaude
             ADDED: framing section, names the three constraints
             OPEN: constraint #3 needs a concrete example
             BLOCKED-ON: nothing
MacClaude  → room: TURN 2 DONE · MacClaude
             ADDED: worked example for constraint #3
             OPEN: implications section unstarted
             BLOCKED-ON: framing fixes "three constraints"; I saw a fourth
             and had to leave it out. Flagging, not fixing.
SuesAgent  → room: TURN 3 DONE · SuesAgent
             ADDED: implications; folded the fourth constraint in as a
             "beyond scope" note so it exists without breaking the frame
             OPEN: conclusion
             BLOCKED-ON: nothing
Scout      → room: FINAL LAP after turn 3.
[... lap 2 ...]
Scout      → room: DONE · relay · draft @ e77b21
```

## Notes

Relay's whole personality is the forbidden backward edit. Break it once
and every earlier turn becomes provisional, which reintroduces exactly the
renegotiation cost the pattern exists to avoid. The BLOCKED-ON line is the
pressure valve: it lets a runner disagree on the record while still
building forward, and it hands later runners (or a follow-up pattern) an
honest list of what the speed cost.
