# Build by talent

**Divide a deliverable among specialists, each building the slice only they
can build, then integrate the slices.**
Version: draft v1 - untested.

## When to use it

- The deliverable divides along skill lines - a schema, a UI, the copy -
  and each slice has an obvious owner.
- The assignment matters. Handing the schema to the copywriter is not
  slower, it is wrong.

Do not run this through
[work-board](https://github.com/jeffrschneider/agentcollab/blob/main/patterns/work-board.md).
The board is deliberately anti-assignment: whoever claims first gets the
job, regardless of talent. Assignment happens in the plan, before any room
opens - the plan's roster line names each specialist and their slice.

## Phases

1. **Spec** - convenes
   [owner-contributors](https://github.com/jeffrschneider/agentcollab/blob/main/patterns/owner-contributors.md),
   convened by the lead. The lead owns the spec; each specialist
   contributes the part about their own slice and, more important, the
   seams - what each slice promises the others. The phase ends with the
   spec frozen and versioned.

2. **Build** - no room. Each specialist builds their slice privately
   against the frozen spec. A slice that needs its own collaboration
   convenes its own pattern in its own room; that room is the specialist's
   problem, not this plan's.

3. **Integrate** - convenes
   [rolling-synthesis](https://github.com/jeffrschneider/agentcollab/blob/main/patterns/rolling-synthesis.md),
   convened by the lead. Specialists deliver; the lead assembles.

4. **Review** - convenes
   [critique-circle](https://github.com/jeffrschneider/agentcollab/blob/main/patterns/critique-circle.md)
   on the assembled deliverable. Cast the critics so each specialist
   reviews the seams they consume, not the slice they built.

## Handoffs

- **spec -> build:** the frozen spec, seams stated. This is the only thing
  a specialist needs to start.
- **build -> integrate:** the slices. Each delivery states which spec
  version it was built against.
- **integrate -> review:** the assembled deliverable, as one artifact.

## Failure edges

- **A specialist misses.** This is the specific risk of dividing by
  talent: no substitute exists, by definition. The plan names a backup per
  slice or accepts the delay in writing. Do not put the orphaned slice on
  a board - if anyone could do it, the assignment was never about talent.
- **A seam was never specced.** Two slices meet and neither promised the
  other what it needed. Reopen the spec, fix that seam only, and only the
  slices touching it rebuild.
- **The spec changes mid-build.** Version it. The lead posts the change
  and names which slices it touches; the untouched specialists keep
  building against what they have.

## Roster

Fixed, by definition - the roster was cast by talent in the plan before
any room opened. If a specialist leaves, the job stalls on their slice.
That is why the backup line in the plan is not optional.

## What the job produces

```
result: the assembled deliverable, after review
record: the spec and its versions, each slice's delivery, the review log
open:   MUST-FIXes the lead refused, seams patched but never respecced
```
