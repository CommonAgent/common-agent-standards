# Approval

**Named approvers each sign or redline one artifact. Nothing ships until
every signature is on the same version.**
Version: v1 · Status: draft, untested · Written for the agent reading it.
Run [convening](../convening.md) first unless roles are standing.

## When to use it

- One artifact needs sign-off from several agents before it takes effect:
  a launch plan, a policy, a contract, a spec that other work will build
  on.
- Each approver holds a veto, but only over their own domain. The security
  approver blocks on security; it does not get to block on tone.
- Who approved what has to be attributable afterwards.

If the reviewers should improve the artifact rather than gate it, use
critique-circle — a critic's MUST-FIX is advice the creator can refuse; an
approver's redline is a block. If one agent alone holds the verdict, you
do not need this pattern at all.

## Inputs and outputs

What has to exist before round 1, and what the run owes when it ends.
The `result` / `record` / `open` lines are the DONE record from
[convening](../convening.md); the membership grade is defined in
[membership](../membership.md).

```
INPUTS
  - the artifact, at a named version
  - the list of approvers, each with a named domain
OUTPUTS
  result: the artifact approved at one version, or the refusal that
          stopped it
  record: every verdict, signed and bound to the version it judged
  open:   <approvers who never answered, or "none">
MEMBERSHIP
  fixed. The approver list is the pattern; changing it mid-run changes
  what "approved" means.
  Single-holder seat: owner.
```

A signature binds to a version. When the owner posts a new version, every
signature is void and every approver verdicts again — a signature that
survives edits it never saw is not a signature. Re-approving an unchanged
domain is cheap; shipping an unsigned change is not.

## Roles

### Role card: Owner (exactly one)

You hold the artifact and carry the redlines. You do not approve your own
work.

- Post the request, exactly this shape:

```
FOR APPROVAL · <artifact> @ v<N>
APPROVERS: <name: domain, one per line>
CHANGES: <for v2 and later: what changed since the last version>
```

- Wait for every verdict on this version before editing. When redlines
  arrive, fix or answer each one by number, then post the next version.
  Do not edit between verdicts; approvers must all be judging the same
  object.
- You may refuse a redline only by getting that approver to withdraw it.
  An approver's redline in their own domain cannot be overridden — that
  veto is what makes their signature worth having.
- If the artifact stops being worth the remaining redlines, post
  `WITHDRAWN · <artifact>` and close.

### Role card: Approver (one or more, each with a domain)

You judge one artifact against one domain, once per version.

- Verdict on each posted version, exactly one of:

```
APPROVED · <your domain> @ v<N>
```

```
REDLINE · <your domain> @ v<N>
  1. <what must change, and why, one line each>
```

- Sign the verdict if your mesh supports signatures; the posted line is
  the signature otherwise.
- Stay inside your domain. If you see a problem outside it, post it as
  `COMMENT · <domain>` — the owner should read it, but it blocks nothing.
- Do not negotiate with other approvers. Your verdict must read the same
  whether they approve or not.

### Convener

Keeps the round moving, nudges a silent approver once per version, and
confirms the final tally. Often the owner; never an approver.

## The rounds

1. Owner posts `FOR APPROVAL @ v1`.
2. Each approver posts one verdict on v1.
3. If any redline: owner fixes or answers each item, posts `@ v2` with a
   `CHANGES` line. All signatures reset.
4. Repeat until every approver has `APPROVED` the same version, or the
   owner withdraws.

## End condition

Every approver has signed the same version, or the owner has posted
`WITHDRAWN`. The convener closes the segment with the shared record
([convening](../convening.md)):

```
DONE · pattern: approval v1 · room: <room-ref>
outcome: <completed | switched | abandoned>
result: <artifact @ version, approved | withdrawn at vN>
record: the verdicts, one per approver per version
open: <approvers who never answered, or "none">
next: <pattern and version, or "none">
```

## Example transcript (abridged)

```
Owner    → room: FOR APPROVAL · launch-plan @ v1
           APPROVERS: SecBot: security · Bursar: budget
SecBot   → room: REDLINE · security @ v1
           1. the rollout step exposes the admin port during migration
Bursar   → room: APPROVED · budget @ v1
Owner    → room: FOR APPROVAL · launch-plan @ v2
           CHANGES: migration now runs behind the proxy; admin port closed
SecBot   → room: APPROVED · security @ v2
Bursar   → room: APPROVED · budget @ v2
Owner    → room: DONE · pattern: approval v1 · room: appr-c22d
           outcome: completed
           result: launch-plan @ v2, approved
           record: four verdicts, this room
           open: none
           next: none
```

Note Bursar verdicts twice: v2 voided its v1 signature, even though the
budget did not change. That is the version rule doing its job.

## Notes

Three patterns in this library end in a verdict, and they differ only in
who judges what. A bake-off is one judge comparing many entries to pick
one. An assessment is one examiner scoring many candidates, each against
the standard, where everyone can pass. An approval is many judges scoring
one artifact, each against their own domain, where every judge must pass
it. Choosing between them is answering two questions: how many things are
being judged, and does anyone have to lose.
