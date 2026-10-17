# Allocate and reconcile

**One owner splits a budget into lines, everyone who spends reports
against those lines while the job runs, and the books are closed at the
end even if the job is not.**
Version: v1.

## When to use it

- A job spends money, and more than one party can spend it.
- Someone has to answer later for where the money went, line by line.
- The job the money pays for is usually somebody else's. This pattern
  runs alongside a campaign, an event, or a project, from before its
  first purchase until after its last invoice.

The watch phase looks like [collect-and-report](./collect-and-report.md),
and it is close. The difference is that these reports are compared
against a standard - the allocation - and this pattern owns what happens
when the comparison fails. When one actor spends against one number, skip
the pattern and keep a ledger.

## Phases

1. **Allocate** - convenes
   [briefing](https://github.com/jeffrschneider/agentcollab/blob/main/patterns/briefing.md),
   convened by the budget owner. The owner posts the allocation before
   the room opens: the total, the lines it splits into, and the named
   spender for each line. The room exists so that every spender has
   fetched their line and the version it belongs to. Nobody spends before
   this phase closes.

2. **Watch** - convenes
   [roll-call](https://github.com/jeffrschneider/agentcollab/blob/main/patterns/roll-call.md),
   convened by the budget owner, on the cadence the plan names, repeating
   until the parent job closes. Each spender reports what actually went
   out against their line since the last roll. The owner compares the
   running total to the allocation's pace and acts on the failure edges
   below.

3. **Reconcile** - convenes
   [assessment](https://github.com/jeffrschneider/agentcollab/blob/main/patterns/assessment.md),
   convened by the reconciler. The actuals - invoices, receipts,
   statements - are scored line by line against the allocation at its
   final version. Every line closes as matched, as a variance with an
   explanation, or as a variance with a name on it and no explanation
   yet.

## Handoffs

- **allocate -> watch:** the allocation at a version - the total, the
  lines, and a named spender per line.
- **watch -> reconcile:** the spend reports, every entry attributed to a
  line and a spender.
- **reconcile -> close:** the reconciliation, every line matched,
  explained, or named open.

## Failure edges

- **Spend runs ahead of pace.** The owner decides among three moves: trim
  the line, move money between lines, or stop the line. Moving money is
  an amendment to the allocation and bumps its version - reconcile scores
  against versions, so an undocumented shuffle turns into a variance
  later.
- **An unbudgeted need appears mid-job.** The request goes to the owner
  before the money moves, and a yes is an amendment with a version. Money
  spent first and explained later is what the reconcile phase exists to
  catch.
- **The invoices do not match the reports.** The variance is recorded
  against the line and the spender. Explaining it belongs to the
  reconciler, and when no explanation arrives, the line stays open with
  the spender's name on it.
- **The parent job is abandoned.** Committed spend still lands after a
  job dies, so reconcile runs anyway, against whatever was actually
  spent. Abandoning a job cancels its remaining work. The books still
  have to close.

## Roster

One budget owner, named, for the whole job - two owners means nobody is
the owner. Every spender is named against a line before the watch phase
starts, and adding a spender mid-job is an amendment. The reconciler
should be somebody other than the owner where the roster allows it,
because the person who allocated the money should not be the only one
checking where it went.

## What you can change

Yours to change: the line structure, the cadence of the watch, the
thresholds that put a line in front of the owner, and the form the spend
reports take.

Do not change these - the pattern stops working without them:

- one named owner
- the allocation is posted, at a version, before anything is spent
- every spender is named against a line before they spend
- every spend report is attributed to a line and a spender
- reconcile runs even when the parent job dies

## What the job produces

```
result: the reconciliation, every line matched, explained, or named open
record: the allocation at each version, the spend reports, the
        reconciliation
open:   unexplained variances, each with the name that owes the
        explanation
```
