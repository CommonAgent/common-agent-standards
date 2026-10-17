# Collect and report

**Ask each named agent one question, merge the answers into a report, and
deliver the same report to everyone who should see it.**
Version: v1.

## When to use it

- Several agents each hold a piece of the picture - status, numbers,
  findings - and someone needs the whole picture as one document.
- The reader has to be able to trace any line of the report back to the
  agent who reported it.
- This usually runs on a schedule (the weekly status report is the obvious
  case). See [planning](../planning.md) for how a recurring plan works.

If the answers are meant to drive a decision by one agent, that is
[decide-and-announce](./decide-and-announce.md) - the difference is that
here, the report itself is the deliverable.

## Phases

1. **Hear** - convenes
   [roll-call](https://github.com/jeffrschneider/agentcollab/blob/main/patterns/roll-call.md),
   convened by the reporter. The question is posted first; each named
   reporter answers once; nobody comments on anyone else's answer.

2. **Synthesize** - no room. The reporter merges the answers into the
   report. Merging means organizing and trimming, not rewriting: every
   claim in the report stays attributed to the agent who made it.

3. **Deliver** - convenes
   [briefing](https://github.com/jeffrschneider/agentcollab/blob/main/patterns/briefing.md),
   convened by the reporter, when the audience is a group of agents. When
   the audience is one agent or one person, delivery is just a message,
   and the plan says where it goes.

## Handoffs

- **hear -> synthesize:** the roll-call record, every answer attributed.
- **synthesize -> deliver:** the finished report. The deliver phase reads
  it out; it does not rewrite it.

## Failure edges

- **A required reporter stays silent.** The plan says how long to wait.
  When the wait runs out, the report names the missing input - "no report
  from X" is information, papering over it is not.
- **Two answers contradict each other.** The report records the
  contradiction, attributed to both. Resolving it is a different job,
  usually a [decide-and-announce](./decide-and-announce.md), and the
  contradiction line is its input.
- **The report finds something urgent.** The reporter delivers on
  schedule anyway and flags the urgent item to whoever the plan names.
  The report is not the alarm channel.

## Roster

Hear is not complete until every named reporter has answered or been
recorded missing - the plan names the reporters, and the roll is theirs.
Deliver is open: observers cost nothing and a latecomer reads the minutes.
On a recurring run, the reporter seat should survive between runs or hand
off explicitly; a report whose author changes silently loses its reader's
trust.

## What you can change

Yours to change: the cadence, the question, the audience, the report's
format, and whether deliver is a room at all.

Do not change these - the pattern stops working without them:

- the question is posted before any answer
- every named reporter is accounted for: answered, or recorded missing
- every claim in the report stays attributed
- the report ships on schedule, complete or not

## What the job produces

```
result: the report, delivered
record: the roll-call answers and the report itself
open:   reporters recorded missing; contradictions awaiting a decision
```
