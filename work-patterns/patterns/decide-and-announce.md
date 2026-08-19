# Decide and announce

**Hear from everyone who holds a piece of the picture, have one agent
decide, then tell everyone the same thing.**
Version: draft v1 - untested.

## When to use it

- A decision needs input from several agents but belongs to one.
- The decision has to land on everyone identically and attributably - no
  version of it arriving secondhand.

This is the ownership version of deciding. If the group decides by vote or
debate, that machinery is out of scope for the collab library, and this
pattern is not it.

## Phases

1. **Hear** - convenes
   [roll-call](https://github.com/jeffrschneider/agentcollab/blob/main/patterns/roll-call.md),
   convened by the decision owner. The question is posted first; each
   agent who holds a piece of the picture answers once; nobody debates.

2. **Decide** - no room. The owner decides alone, on the record from
   phase 1, and writes the decision down with its reasons before opening
   the next room. If the answers conflict in a way the owner cannot
   resolve, that is a missing input, not a hard call: re-run hear with a
   narrower question to the agents who conflict.

3. **Announce** - convenes
   [briefing](https://github.com/jeffrschneider/agentcollab/blob/main/patterns/briefing.md),
   convened by the owner. The decision, the reasons, and what changes for
   whom, including any standing instructions.

Notice that the decision itself happens in no room. The rooms exist to
produce the record the decision is made on, and the record that it was
made. When someone asks later why it went that way, both records exist.

## Handoffs

- **hear -> decide:** the roll-call record, every answer attributed.
- **decide -> announce:** the decision written down, with reasons. Writing
  it before the briefing keeps announcing from turning into deciding out
  loud.

## Failure edges

- **The answers conflict.** The owner decides anyway - conflict is why the
  decision has an owner. Name the dissent in the announcement ("X advised
  against this") so it is on the record, not smoothed over.
- **An agent whose answer is required stays silent.** The plan says how
  long the owner waits and whether the decision may proceed without them.
  If it proceeds, the announcement says whose input was missing.
- **The decision proves wrong later.** That is a new job, not a failure of
  this one. This job's records are what make revisiting it cheap.

## Roster

The plan names whose answers are required; hear is not complete until the
named agents have spoken, however open the room is otherwise. Announce is
open - a latecomer reads the minutes. The only seat that can never change
hands mid-job is the owner's.

## What you can change

Yours to change: how many agents are heard, how long the owner waits for
a required answer, and whether hear runs a second time with a narrower
question.

Load-bearing - the pattern stops working without these:

- the decision belongs to one owner
- the decision is written down, with reasons, before the announce room
  opens
- dissent and missing answers are named in the announcement

## What the job produces

```
result: the decision, announced
record: the roll-call answers and the minutes of the announcement
open:   named dissent, and any required answer that never came
```
