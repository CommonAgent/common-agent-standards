# Evaluate options

**Freeze the criteria before anyone starts researching, gather material
about each option, compare the options against the criteria only, and hand
a recommendation to a decider who was never in the room.**
Version: v1.

## When to use it

- Someone has to choose between options - vendors, designs, approaches -
  and wants a recommendation they can actually decide from.
- The decider is outside the work: they set the question, they read the
  recommendation, and they do not join the rooms. If the decider is in the
  room, you wanted [decide-and-announce](./decide-and-announce.md).
- The comparison has to be defensible afterwards: every line traceable to
  a criterion that existed before the research started.

## Phases

1. **Frame** - no room. The requester writes the question and the
   criteria, and freezes both. This is the same discipline as a bake-off
   brief, applied to options instead of contestants: criteria written
   after the research starts inherit the research's biases.

2. **Gather** - convenes
   [work-board](https://github.com/jeffrschneider/agentcollab/blob/main/patterns/work-board.md).
   The jobs ask for material about each option against each criterion -
   facts, measurements, quotes, caveats - not opinions about which option
   should win.

3. **Compare** - convenes
   [rolling-synthesis](https://github.com/jeffrschneider/agentcollab/blob/main/patterns/rolling-synthesis.md),
   convened by the evaluator. One pen builds the comparison, criterion by
   criterion, from the delivered material and nothing else.

4. **Recommend** - no room. The evaluator writes the recommendation on top
   of the comparison and sends both to the decider. The recommendation
   names a choice; the comparison is there so the decider can disagree
   with reasons.

## Handoffs

- **frame -> gather:** the frozen question and criteria. Every job on the
  board cites them.
- **gather -> compare:** the delivered material, tied to job ids.
- **compare -> recommend:** the comparison. The recommendation adds a
  choice; it does not add new facts.

## Failure edges

- **An option cannot be researched.** A criterion with no obtainable
  material is scored "insufficient information", never guessed. If the
  gap is decisive, the recommendation says so - "we cannot recommend
  until X is known" is a legitimate recommendation.
- **The criteria turn out wrong mid-gather.** Version them, as a bake-off
  would withdraw its brief: the requester posts the change, and only the
  jobs the change touches re-run.
- **The comparison is a tie.** Report the tie, with the smallest fact
  that would break it. Manufacturing a winner to seem decisive hands the
  decider a coin flip dressed as analysis.

## Roster

Open through gather - that is the point of the board. Compare has one
pen. The decider never joins: their independence from the research is
what makes the recommendation worth having, and the frozen criteria are
their controls on it.

## What you can change

Yours to change: the number of options, whether gather runs on a board or
as assigned slices, the comparison's format, and whether the
recommendation includes a ranked list or a single choice.

Load-bearing - the pattern stops working without these:

- the criteria freeze before any research starts
- the jobs ask for material, not verdicts
- every comparison line traces to a criterion
- the decider stays outside the roster

## What the job produces

```
result: the recommendation, delivered to the decider
record: the frozen criteria, the board, and the comparison
open:   criteria scored "insufficient information"; jobs never delivered
```
