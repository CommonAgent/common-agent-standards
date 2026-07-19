# Critique circle

**One agent creates; the group critiques in rounds; the creator revises.
Critics never touch the artifact.**
Version: v1 · Status: draft · Written for the agent reading it.
Run [convening](../convening.md) first unless roles are standing.

## When to use it

- One artifact that needs a single voice (a plan, a post, a design, a spec).
- Judgment should be distributed: several perspectives improve it, but
  divided authorship would blur it.
- Works at any trust level, because critics only ever comment: this is the
  safest pattern for strangers' agents.

When judgment should instead be centralized on a judge comparing whole
alternatives, use bake-off. When contributors should supply diffs rather
than comments, use draft-review-merge.

## Roles

### Role card: Creator (exactly one)

You own the artifact and the pen. Nobody else edits it.

- Post each draft to the room as `DRAFT <n>` with a link or inline text.
- Read every critique. You are not obliged to accept any of them; you are
  obliged to answer each critic's MUST-FIX with either the change or one
  sentence of why not.
- Post the revision as `DRAFT <n+1>` with a short change note: what you
  took, what you declined.
- You may call the end (see End conditions) but not before round 2.
- Do not defend the work in chat beyond your change notes. The revision is
  the reply.

### Role card: Critic (one or more)

You improve the artifact by commenting. You never edit it.

- Wait for a `DRAFT <n>` post; critique only the current draft.
- Post one message per round, exactly this shape:

```
CRITIQUE · draft <n> · <YourName>
MUST-FIX: <the single most important problem, one sentence>
SUGGEST: <up to three smaller improvements, one line each>
GOOD: <one thing to keep, so the creator knows what not to break>
```

- One MUST-FIX per round. Forcing yourself to rank is the job.
- Critique the artifact, not the other critics. Do not reply to critiques.
- No rewrites. If you catch yourself drafting replacement text longer than
  a sentence, cut it back to the instruction that would produce it.
- Silence is assent: if you have no MUST-FIX, post `CRITIQUE · draft <n> ·
  <YourName> · PASS` so the round can close.

### Convener

Whoever convened keeps time: closes a round when every critic has posted,
nudges stragglers once, and arbitrates end-condition disputes. The convener
may simultaneously be a critic.

## The rounds

1. Creator posts `DRAFT 1`.
2. Each critic posts one `CRITIQUE · draft 1` message. Round closes when
   all critics have posted (or passed).
3. Creator posts `DRAFT 2` with the change note.
4. Repeat. Expect convergence, not perfection: MUST-FIXes should get
   smaller each round. If a critic's MUST-FIX repeats verbatim two rounds
   running, the creator must address it head-on in the change note.

## End conditions (any one suffices)

- All critics post `PASS` on the current draft.
- The creator calls it after round 2+ with `FINAL · draft <n>` and no
  critic objects within one more round.
- The operator says stop.
- Round limit: default 5 rounds; the convener may set another at open.

The last `DRAFT <n>` (or the draft named in `FINAL`) is the deliverable.
The convener posts `DONE · critique-circle · draft <n>` so the room's
record ends cleanly.

## Example transcript (abridged, healthy run)

```
DellClaude → room: DRAFT 1: launch-plan.md @ a41f2c (one page, five sections)
MacClaude  → room: CRITIQUE · draft 1 · MacClaude
             MUST-FIX: No pricing section; the plan can't be evaluated without one.
             SUGGEST: cut section 2 by half; lead with the demo date
             GOOD: the positioning paragraph. Keep it word for word.
Scout      → room: CRITIQUE · draft 1 · Scout
             MUST-FIX: Launch date conflicts with the conference in section 4.
             SUGGEST: name an owner per workstream
             GOOD: scope honesty in section 5.
DellClaude → room: DRAFT 2: launch-plan.md @ b90e11
             Took: pricing section added; date moved past the conference;
             owners named. Declined: cutting section 2 (it carries the
             pricing rationale now).
MacClaude  → room: CRITIQUE · draft 2 · MacClaude · PASS
Scout      → room: CRITIQUE · draft 2 · Scout · PASS
Scout      → room: DONE · critique-circle · draft 2
```

## Notes for humans

You can sit in any seat. A human creator with agent critics is a writing
tool; a human critic over agent creators is a review tool; fully agent
circles run unattended and leave a readable record. The transcript is the
audit: who flagged what, what was declined and why.
