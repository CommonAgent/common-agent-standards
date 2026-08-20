# Divide and integrate

**Split a deliverable into jobs anyone can claim, then have one agent weave
the results into a whole.**
Version: v1.

## When to use it

- The deliverable is divisible: it can be cut into jobs that do not need to
  know about each other while they are being worked.
- You do not know, or do not care, who does which piece. Workers claim from
  a board as they free up.
- One agent can hold the whole deliverable in their head. Nobody else has
  to.

If the pieces must go to specific agents because of what those agents are
good at, do not use this - the board hands a job to whoever claims it
first. Use [build by talent](./build-by-talent.md) instead.

## The condition that makes it work

**The jobs must ask for material, not finished prose.** If each worker
delivers a polished section, the integrator is not integrating, they are
rewriting - and the seams will show. Ask each job for facts, options,
measurements, drafts marked as drafts. This condition appears in neither
underlying playbook; it only exists at the seam between them, which is why
this chain gets a page.

## Phases

1. **Divide** - no room. The convener cuts the deliverable into jobs and
   writes the job list. If the cut itself needs judgment, convene
   [critique-circle](https://github.com/jeffrschneider/agentcollab/blob/main/patterns/critique-circle.md)
   on the job list first, as its own phase.

2. **Produce** - convenes
   [work-board](https://github.com/jeffrschneider/agentcollab/blob/main/patterns/work-board.md).
   Workers claim jobs, hold leases, and deliver material against the job
   ids.

3. **Integrate** - convenes
   [rolling-synthesis](https://github.com/jeffrschneider/agentcollab/blob/main/patterns/rolling-synthesis.md),
   convened by the synthesizer. One pen. The delivered material goes in;
   the deliverable comes out.

## Handoffs

- **divide -> produce:** the job list. Each job states what material it
  wants and in what form, so a claimant needs no conversation to start.
- **produce -> integrate:** the delivered material, tied to job ids. The
  board's own record says what was delivered and what is still open.

## Failure edges

- **A job sits unclaimed.** The board never errors on this - the job just
  sits. So the plan gives the board a deadline. When it passes, split the
  job smaller, rewrite what it asks for, or the synthesizer does it
  themselves.
- **Delivered material does not fit.** The synthesizer posts a follow-up
  job asking for what is missing rather than negotiating with the original
  worker, who may already be gone. The board is open; assume workers are
  transient.
- **The whole does not cohere.** That failure belongs to the synthesizer
  alone. One pen means one place to look.

## Roster

Open all the way through produce - that is the point of the board. In
integrate, one agent holds the pen and feeders can come and go. This is the
most open job in this library; reach for it when you cannot predict who
will be available.

## What you can change

Yours to change: how the deliverable is cut, the size of the jobs, the
board's deadline, and whether the synthesizer posts follow-up jobs while
still integrating.

Do not change these - the pattern stops working without them:

- the jobs ask for material, not finished prose
- one agent holds the pen in integrate
- material that does not fit becomes a follow-up job, never a negotiation
  with the original worker

## What the job produces

```
result: the integrated deliverable
record: the board (jobs asked, claimed, delivered) and the synthesis room
open:   jobs never delivered that the synthesizer worked around
```
