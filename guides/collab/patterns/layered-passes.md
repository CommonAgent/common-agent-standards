# Layered passes

**Everyone touches the whole artifact, in sequential passes each focused on
one concern.**
Version: v1 · Status: draft, untested · Written for the agent reading it.
Run [convening](../convening.md) first unless roles are standing.

## When to use it

- The artifact exists in rough form and needs successive refinement:
  structure, then substance, then style, then correctness. Draft to
  developmental edit to copyedit to proofread; schematic to construction
  documents.
- Different agents are strong at different concerns, and each concern is
  best applied to the WHOLE artifact at once rather than piecemeal.
- The separation of concerns is the discipline being bought: a pass that
  fixes everything it sees converges on nothing.

Relay adds new material forward-only; passes rework the whole repeatedly.
If the artifact isn't drafted yet, start with relay or a single author,
then run passes on the result.

## Roles

### Role card: Pass owner (one agent per pass; an agent may own several)

For the duration of your pass you hold the pen on the entire artifact, for
exactly one concern.

- The pass sequence and each pass's concern are declared at convening.
  Typical sequences: `structure → content → style → correctness` for
  prose; `architecture → implementation → naming → tests` for code.
  Fewer, sharper passes beat many vague ones.
- Open with `PASS <n> BEGIN · <concern> · <YourName> · base @ <version>`.
- Change anything the artifact needs FOR YOUR CONCERN. Resist everything
  else, including obvious errors in someone else's lane; flag them
  instead:

```
FLAG · for <concern> · <where> · <what you saw>
```

  The flag discipline is the pattern. Fixing a typo during the structure
  pass feels free and costs the structure pass its focus; the correctness
  pass exists and will get your flag.
- Close with:

```
PASS <n> DONE · <concern> · @ <new-version>
CHANGED: <one or two lines>
FLAGS RAISED: <count, or none>
FLAGS RESOLVED: <which incoming flags for your concern you handled>
```

- One pass runs at a time. Between your passes, silence; your opinion of
  another pass's choices goes in a flag or nowhere.

### Convener

Declares the sequence at open, moves the baton between passes, and runs
the flag sweep at the end: any flags never resolved by a pass get one
cleanup decision each (assign a mini-pass or explicitly drop them) before
close.

## The rounds

1. Convener opens: `SEQUENCE: <concern:agent, concern:agent, ...> ·
   base @ <version>`.
2. Passes run in order, each `BEGIN` to `DONE`, version advancing.
3. Convener runs the flag sweep: `SWEEP: <flag> → <resolved by mini-pass |
   dropped: reason>` for each survivor.
4. Optionally one more short lap of the sequence if the artifact moved a
   great deal; declared, not assumed.

## End condition

Final pass done and flag sweep complete:
`DONE · layered-passes · @ <version>`.

## Example transcript (abridged)

```
Scout      → room: SEQUENCE: structure:DellClaude, content:MacClaude,
             style:SuesAgent · base @ 91acf0
DellClaude → room: PASS 1 BEGIN · structure · DellClaude · base @ 91acf0
DellClaude → room: FLAG · for content · section 3 · claims 40% with no source
DellClaude → room: PASS 1 DONE · structure · @ a2210b
             CHANGED: merged sections 2 and 4; promoted the risks list
             FLAGS RAISED: 1
             FLAGS RESOLVED: none incoming
MacClaude  → room: PASS 2 BEGIN · content · MacClaude · base @ a2210b
MacClaude  → room: PASS 2 DONE · content · @ b7f3c4
             CHANGED: sourced or cut every number; expanded the risks
             FLAGS RAISED: 0
             FLAGS RESOLVED: the 40% claim (cut; unsourceable)
SuesAgent  → room: PASS 3 BEGIN · style · SuesAgent · base @ b7f3c4
SuesAgent  → room: PASS 3 DONE · style · @ c90d11
             CHANGED: one voice throughout; sentence length variance up
             FLAGS RAISED: 0
             FLAGS RESOLVED: none incoming
Scout      → room: SWEEP: no surviving flags.
Scout      → room: DONE · layered-passes · @ c90d11
```

## Notes

Two ways this pattern dies. Passes that bleed: everyone fixes everything
and the third pass owner inherits a moving target; the FLAG line exists so
noticing never justifies touching. And sequences that sprawl: seven vague
passes are a queue, not a refinement; if a concern can't be named in a
word or two, it isn't a pass yet.
