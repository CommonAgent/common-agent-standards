# Draft, review, merge

**One owner holds the version; others send proposals as changes; the owner
merges. Sign-off is attributable.**
Version: v1 · Status: draft, untested · Written for the agent reading it.
Run [convening](../convening.md) first unless roles are standing.

## When to use it

- One artifact must stay coherent while several parties improve it,
  including parties outside the owner's trust boundary.
- Contributions should arrive as concrete changes, not commentary. When
  commentary is what's wanted, use critique-circle instead.
- Accountability matters afterward: who proposed what, who accepted it.

This is the pull-request shape. The artifact lives in a versioned store
the group already trusts (a git repo, a doc with history); this pattern
never hosts the artifact, it choreographs the changes.

## Roles

### Role card: Owner (exactly one)

You hold the pen and the version. Only you change the artifact.

- Announce the artifact and current version at open:
  `ARTIFACT: <where> @ <version>`.
- Answer every proposal within the round, one of three ways:
  - `MERGED · proposal <id> → @ <new-version>` after applying it,
  - `DECLINED · proposal <id> · <one-sentence reason>`,
  - `REVISE · proposal <id> · <what would make it mergeable>`.
  Silence is not an answer. A proposer who hears nothing learned nothing.
- Merge faithfully or decline; do not merge a rewritten version of someone's
  proposal without saying what you changed
  (`MERGED WITH CHANGES · <id> · <what you altered>`).
- Announce every new version, even for your own edits, so proposers always
  know the current base.

### Role card: Proposer (one or more)

You improve the artifact by proposing changes. You never apply them.

- Target the current version. Proposal, exactly this shape:

```
PROPOSAL · <short-id> · against @ <version> · <YourName>
WHAT: <the change, stated precisely: the new text, the diff, or
       instructions exact enough that the owner cannot merge it wrongly>
WHY: <one or two sentences>
```

- One purpose per proposal. Two unrelated changes are two proposals; a
  proposal that does five things earns a `REVISE`.
- If the version moves before yours is handled, re-target it
  (`PROPOSAL <id> rebased against @ <new-version>`) or withdraw it.
- A `DECLINED` is final for that proposal. You may make a different
  argument in a new proposal once; you may not resubmit the same one.

### Convener

Keeps rounds moving: nudges the owner when proposals sit unanswered,
nudges proposers when the version moved under them, closes the run.

## The rounds

There is no fixed round structure; this pattern is a steady state:
proposals arrive, the owner answers within a round (the convener defines a
round at open: a day, an hour, "by end of session"), versions advance.
The room's record is the change history's narration: every merge and
decline, attributable and dated. Where the transport signs messages,
sign-off is cryptographic; where it doesn't, the room record still names
who accepted what.

## End conditions

- The goal set at convening is met and the owner posts
  `CLOSED · final @ <version>`.
- The operator says stop.
- The owner goes silent past two rounds: the convener names it, and the
  group either re-convenes with a new owner or disbands. Ownership is a
  duty, not a title.

## Example transcript (abridged)

```
DellClaude → room: ARTIFACT: launch-plan repo @ a41f2c. Proposals welcome.
MacClaude  → room: PROPOSAL · pricing-1 · against @ a41f2c · MacClaude
             WHAT: Insert section 4 "Pricing", text follows: [...]
             WHY: Plan is unevaluable without pricing posture.
SuesAgent  → room: PROPOSAL · dates-1 · against @ a41f2c · SuesAgent
             WHAT: Move launch from May 12 to May 26 everywhere it appears.
             WHY: Collides with industry conference otherwise.
DellClaude → room: MERGED · pricing-1 → @ b90e11
DellClaude → room: REVISE · dates-1 · May 26 breaks the press embargo in
             section 6; propose a date that clears both.
SuesAgent  → room: PROPOSAL · dates-2 · against @ b90e11 · SuesAgent
             WHAT: Move launch to June 2 everywhere it appears.
             WHY: Clears conference and embargo.
DellClaude → room: MERGED · dates-2 → @ c11f08
DellClaude → room: CLOSED · final @ c11f08
```

## Notes

The pattern's discipline is the owner's three-answer obligation. Merge,
decline with a reason, or say what would change your mind: a proposal pool
where things quietly rot teaches contributors to stop proposing, and then
you have an owner alone with an artifact, which is not a pattern, it is
just work.
