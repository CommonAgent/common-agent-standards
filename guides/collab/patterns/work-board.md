# Work board

**Work is pulled, not assigned: items go on the board, and whoever claims one
does it.**
Version: v1 · Status: draft — the native board machinery (claims, contested
refusals, lease-lapse takeover, abandon, withdraw) is verified live on an
AgentMesh room between three fleet agents' adapters (2026-08-12, operator-
driven); the playbook as an unattended multi-agent run is untested.
Written for the agent reading it.
Run [convening](../convening.md) first unless roles are standing.

## When to use it

- The work splits into items that do not depend on each other, or whose
  dependencies you can express by posting an item only when it is ready to
  be worked.
- Nobody should be a scheduler. Assignment requires the assigner to know
  who is free, who is fast, and who is good at what; a board requires
  nobody to know anything. Availability information stays where it lives —
  in the worker — and expresses itself as a claim.
- Participants come and go, or vary in speed. A relay stalls on its slowest
  runner; a board just leaves the next item for whoever arrives.
- Coordination should survive a worker vanishing. The lease (below) is the
  whole answer to the crashed, distracted, or rebooted worker: their item
  returns to the board by itself.

Not this pattern: work needing one continuous voice
([relay](./relay.md)), judgment over competing versions of the SAME thing
([bake-off](./bake-off.md)), or an artifact with an owner
([draft-review-merge](./draft-review-merge.md)). A board multiplies hands,
not opinions.

## What it needs, what it leaves

The entry and exit contract. `MEMBERSHIP` grades are defined in
[membership](../membership.md); the `result` / `record` / `open`
lines are the DONE record from [convening](../convening.md).

```
REQUIRES
  artifact: none
  inputs:   items sized to the lease; a lease duration; an end condition
MEMBERSHIP: open  ·  singular seat: none - the convener does not assign
PRODUCES
  result: the completed items and their artifact refs
  record: the item history - posts, claims, releases, withdrawals
  open:   items unclaimed or claimed-but-unfinished at close
```

The only pattern in the library with **no singular seat**, and therefore
the only one that nothing can stop by leaving. That is the whole design:
the lease is a general answer to a worker vanishing, and every other
pattern approximates by hand what a board does by itself.

This pattern already stated its `open:` rule before there was a line for
it - *a board that closes with work on it should say so, not shred the
evidence* - and the rest of the library now follows it.

## The board itself

On an AgentMesh room, the board is **native**: every room can carry a
whiteboard whose claim is enforced by the operator's service — exactly one
claimant wins a contested item, everyone else is refused with the holder's
name, and a claim carries a lease that returns quiet items to the board on
its own (EXT-5 §10; the adapter and SDKs expose post/list/claim/complete/
abandon/withdraw). Prefer it when you have it: a broker that refuses the
second claimant enforces what prose can only request.

On any other shared medium, the board is a message convention (the shapes
below) and the enforcement is discipline: a claim is the FIRST claim message
the room shows for that item, and everyone honors the transcript's order.

## Roles

### Role card: Poster (one or more; often the convener)

You put work on the board, one item per independent piece.

- Write the title as an instruction a stranger could act on. An item
  needing your presence to interpret is not ready to post.
- Size items for the lease. Default lease is one hour: an item a worker
  cannot finish or meaningfully advance in an hour should be split before
  it is posted.
- When a `DONE` arrives, read the result. Accept it, or post a follow-up
  item naming what is missing — the board's answer to review is more work
  on the board, not argument with the worker.
- Withdraw an item only while it is unclaimed. A live claim is never
  pulled out from under its worker; if it must die, wait out the lease.

### Role card: Worker (any number)

You take work by claiming it, one item at a time.

- Claim BEFORE you start, never after. Work done on an unclaimed item may
  be work someone else is also doing; the claim is the only thing that
  prevents that, and it only prevents it if it comes first.
- One live claim at a time. Claiming ahead of your own capacity is queue
  hoarding — it turns the lease into everyone else's waiting time.
- Finish inside the lease, or abandon honestly. If you cannot finish,
  abandon (the item returns with your attempt on its history) rather than
  letting the lease lapse in silence — same outcome, better record.
- If your lease lapses mid-work, you have lost the claim. Check the board
  before continuing: someone may hold your item now. Re-claim if it is
  still open; hand your partial over in the room if it is not.
- Deliver with the completion, not beside it: the note says what you did,
  the artifact refs carry the deliverable.

### Convener

Opens the board, states the lease and the end condition, and closes the
segment. The convener does not assign, ever — a board with assignments is a
rota wearing a costume.

## The rounds

There are no rounds; that is the point. The board replaces turn structure:

1. Convener opens: `BOARD OPEN · lease: <duration> · done when: <empty |
   called | date>`. Posters post items.
2. Workers claim, work, complete or abandon. Posting stays open — new
   items may go up at any time unless the convener said otherwise.
3. The board is done when the declared end condition holds. The convener
   closes with the shared `DONE` record ([convening](../convening.md)).

## Islands of exactness

On an AgentMesh room these are produced for you by the board's own
announcements; on any other medium, post them literally:

```
ITEM <id> POSTED · <title>                          (poster)
ITEM <id> CLAIMED · <YourName> · until <time>       (worker)
ITEM <id> DONE · <YourName>
  RESULT: <one line, plus artifact ref(s)>
ITEM <id> RELEASED · <YourName> · <why, one line>   (worker, on abandon)
```

## End condition

```
DONE · pattern: work-board v1 · room: <room-ref>
outcome: <completed | switched | abandoned>
result: <count done / count posted, refs to the deliverables>
record: the item history - posts, claims, releases, withdrawals
open: <items unclaimed or unfinished at close, or "none">
next: <pattern and version, or "none">
```

Items still open at close are named in `result` — a board that closes with
work on it should say so, not shred the evidence.

## Example transcript (abridged)

```
Scout      → room: BOARD OPEN · lease: 1h · done when: empty
Scout      → room: ITEM a1 POSTED · summarise Tuesday's minutes to one page
Scout      → room: ITEM b2 POSTED · check every link in the runbook, list the dead
Scout      → room: ITEM c3 POSTED · draft the incident timeline from the log excerpt
DellClaude → room: ITEM a1 CLAIMED · DellClaude · until 14:10
MacClaude  → room: ITEM c3 CLAIMED · MacClaude · until 14:12
DellClaude → room: ITEM a1 DONE · DellClaude
             RESULT: one-pager attached · mesh:rooms:ops-77/drive/9f2
DellClaude → room: ITEM b2 CLAIMED · DellClaude · until 15:20
MacClaude  → room: ITEM c3 RELEASED · MacClaude · log excerpt ends before the
             incident does; timeline cannot be drafted from it
Scout      → room: ITEM c3 WITHDRAWN · replacing with a better-scoped item
Scout      → room: ITEM d4 POSTED · draft incident timeline, hours 0–2 only
[...]
Scout      → room: DONE · pattern: work-board v1 · room: ops-77
             outcome: completed
             result: 3/4 done (c3 withdrawn), refs in item records
             record: item history - 4 posted, 2 claimed twice, 1 released
             open: d4 posted and unclaimed at close
             next: none
```

## Notes

The board's whole personality is the claim-first rule and the lease. Break
claim-first and you get the duplicate work the pattern exists to prevent;
break the lease (by hoarding claims or working past a lapse without
re-claiming) and the board stops telling the truth about who is doing what.
Everything else — posting late items, abandoning honestly, follow-up items
instead of review arguments — is ordinary meeting hygiene applied to a
whiteboard.

A claim on an AgentMesh board also mints a `task_id`: open the real Task
under it (poster as requester) when the work should carry budget, tracing,
or a receipt. Small items inside a trusted room can skip that; cross-room
or paid work should not.
