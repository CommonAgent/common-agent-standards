# Rolling synthesis

**Many agents submit raw material; one integrator's whole craft is the merge
into a coherent artifact.**
Version: v1 · Status: draft, untested · Written for the agent reading it.
Run [convening](../convening.md) first unless roles are standing.

## When to use it

- The inputs are scattered across many heads: research findings, stakeholder
  positions, field notes, logs, opinions. No single source has the picture.
- Coherence must come from one editorial hand; a committee-written summary
  of many voices reads like one.
- The sources shouldn't pre-polish. Raw material synthesized once beats
  twelve mini-essays synthesized twice.

If the sources should critique the evolving artifact rather than feed it,
that's critique-circle. If their contributions are finished parts that slot
into seams, that's division of labor, not synthesis.

## Roles

### Role card: Integrator (exactly one)

The synthesis is your craft. You own the artifact; sources own their facts.

- Open with a call, exactly this shape:

```
CALL · <topic>
NEED: <the kinds of material wanted, as concrete questions where possible>
FORM: <how to submit: bullets, links, fragments all welcome; RAW IS FINE>
BY: <when the next synthesis will be cut>
```

- Cut syntheses on the rhythm you announced, numbered:
  `SYNTHESIS <n>` with the current whole, then `GAPS: <what's missing,
  what conflicts, what needs a source's confirmation>`. The gaps line is
  the next call; sharp gaps pull better material than broad ones.
- Attribute meaningfully inside the artifact where a claim rests on one
  source; you are accountable for the whole, they are accountable for
  their material.
- You may weigh, cut, and reframe material freely. You may not silently
  contradict it: where sources conflict, the synthesis says so or picks
  one and says why.

### Role card: Source (one or more, the more the better)

You supply material. You do not shape the artifact.

- Submit anything responsive to the CALL or the current GAPS:
  `MATERIAL · <YourName>` plus the goods. Fragments, half-thoughts, links,
  and contradictions of other material are all legitimate; polishing is
  the integrator's job, not yours.
- Read each synthesis for your own material only. If it's been distorted
  (not merely cut or reweighted), say so:
  `CORRECTION · <YourName> · synthesis <n> misstates my material: <what it
  said> vs <what I said>`. Corrections are about fidelity, not editorial
  taste; the integrator must fix or justify by the next cut.
- Do not submit commentary on the synthesis's structure, emphasis, or
  prose. If asked to weigh in on those, you're in a critique-circle now;
  someone should say so.

### Convener

Sets the cadence expectation at open, nudges the integrator if a cut is
missed, and closes the run.

## The rounds

1. Integrator posts `CALL`.
2. `MATERIAL` flows in; the integrator works continuously or in batches.
3. `SYNTHESIS 1` + `GAPS`. More material, aimed at the gaps.
4. Repeat. Healthy runs show gaps getting narrower and more factual each
   cut. Gaps that repeat verbatim mean the sources are exhausted or the
   call is aimed at the wrong agents; the integrator says which.

## End conditions

- The integrator posts `FINAL · synthesis <n>` when gaps are closed or
  remaining gaps are named as known-unknowns inside the artifact.
- Deadline set at convening arrives; the current synthesis ships with its
  gaps declared.
- Outstanding `CORRECTION`s block `FINAL` until fixed or justified.

## Example transcript (abridged)

```
MacClaude  → room: CALL · what did we learn from the pilot?
             NEED: user quotes, failure incidents, feature requests,
             anything with a timestamp
             FORM: raw fragments fine, links fine
             BY: synthesis cut in 2 hours
DellClaude → room: MATERIAL · DellClaude: 14 session logs, 3 rage-quits
             around the pairing step, quotes attached [...]
SuesAgent  → room: MATERIAL · SuesAgent: Sue's notes: billing confusion
             twice; one "this is magic" moment at first reply [...]
MacClaude  → room: SYNTHESIS 1: [...] GAPS: no data on time-to-first-
             success; DellClaude's rage-quit cause unconfirmed: UI or docs?
DellClaude → room: MATERIAL · DellClaude: rage-quits correlate with the
             pairing code expiring; median time-to-first-success 11m.
MacClaude  → room: SYNTHESIS 2: [...] GAPS: none blocking.
MacClaude  → room: FINAL · synthesis 2
```

## Notes

Two failure smells. Sources writing essays: the material arrives
pre-synthesized and the integrator becomes a stapler; restate RAW IS FINE.
And the integrator broadcasting drafts for approval: that's a critique
loop leaking in; the integrator's authority over form is the entire reason
this pattern produces one voice from many.
