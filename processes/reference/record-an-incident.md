# Reference process: Record an Incident

`ref/dev/record-an-incident v1`

An agent the organization runs has gone quiet, or a job it was doing
has failed, and this process writes down what happened before anyone
decides what to do about it. A watcher notices from the platform's own
records, or a person notices and names the agent and the time. A
person gathers the records for the window around the failure. An
incident recorder turns them into a timeline that names the source of
every fact and every gap, and a person reads it and decides what
happens next. No agent in the run guesses a cause or fixes anything.

This is a reference process. It is a first draft for an organization to
adopt and argue with, and it is not running anywhere. Its owner, its
dates, its targets and its roster are blank, and the adopting
organization fills them in. The agent phases are held by roles the
[Agent Roles](https://agentroles.ai/) standard defines. The process is
written from the side of the organization that runs the agent.

The first phase has a gap that the document keeps in plain sight.
Agent Roles defines the [watcher](https://agentroles.ai/watcher.html),
and says in its open questions that the role cannot be held yet: nothing
yet sends a watcher a message on a schedule, and a packaged agent cannot
yet read a platform's records of who answered and what was spent. Until
an adopter has a watcher, a person notices and sends the trigger by
hand, and the `notice` phase is theirs.

## The activities

| # | Activity | What happens | Agents |
|---|---|---|---|
| 1 | Notice the Failure | the quiet agent or failed job, and the time | [watcher](https://agentroles.ai/watcher.html), or a person until one is held |
| 2 | Gather the Records | the platform's and the agent's records, attached | incident owner (person) |
| 3 | Record the Incident | a timeline naming every fact's source and every gap | [incident recorder](https://agentroles.ai/incident-recorder.html) |
| 4 | Decide What Happens | leave it, restart it, retire it, or change it | incident owner (person) |

## What the graph says

The graph is a single line of four phases. Two are held by agents and
two by a person, and the two agent phases only report. The watcher
reports what the platform's records show and computes nothing of its
own. A person gathers the records, because which records exist for the
window, and where they are kept, is something a person in the
organization knows. The incident recorder writes the timeline from
those files alone. It never contacts the agent being recorded, because
an agent that has failed is the least reliable witness to its own
failure.

The decision is a person's every time. The record is written so that a
person can decide from it, and the choices are the ones the
organization already has a way to carry out: leave the agent as it is,
restart it, retire it through [retire an agent](./retire-an-agent.md),
or change it through a run of [make a new agent](./make-a-new-agent.md).

One edge points backwards. When the record names a gap that the person
could fill from records they did not attach, the run returns to
gathering, the person attaches them, and the record is written again.

## The document, with the blanks marked

```
PROCESS: record an incident           id: <team>/record-an-incident   v1
from: ref/dev/record-an-incident v1
owner: <who>                          effective: <date>
trigger: an agent on <your hosts> goes quiet or a job fails, noticed by
         the watcher, or reported by a person naming the agent and the
         time
concurrency: runs may overlap - one run per agent and time
goal: an incident record that names every fact's source and every gap,
      in front of a person who decides what happens next, with nothing
      guessed and nothing fixed by an agent
phases:
  notice              - harness: the agent that went quiet or the job
                        that failed, with the time, from the platform's
                        records; until a watcher is held, a person
                        notices and sends the trigger by hand
                        owner: watcher            after: trigger
                        automation: <level>
  gather-the-records  - human: the person collects the platform's
                        activity records and the agent's own records
                        for the window around the failure and attaches
                        them
                        owner: <your incident owner role>
                        after: notice
                        automation: <level>
  record-the-incident - harness: the timeline of what is known and what
                        is not, and the incident record naming every
                        fact's source and every gap
                        owner: incident-recorder  after: gather-the-records
                        automation: <level>
  decide              - human: the person reads the record and decides:
                        leave it, restart the agent, retire it, or start
                        a run of make a new agent to change it
                        owner: <your incident owner role>
                        after: record-the-incident
                        automation: never
handoffs:
  notice -> gather-the-records [alarm]: the agent's name, the time, and
    what the watcher or the person saw
  gather-the-records -> record-the-incident [records]: the platform's
    activity records and the agent's own records for the window, as
    files
  record-the-incident -> decide [incident]: the timeline and the
    incident record, with the gaps named
deviations:
  record-the-incident -> gather-the-records [more-records]: the record
    names a gap the person can fill from records they did not attach;
    they attach them and the record is written again
bindings:
  roster:  <who holds each role - an agent claiming the incident
           recorder, an agent claiming the watcher once one can be held,
           and a named person for the incident owner>
  systems: none of the phases reaches a system of its own; the records
           arrive as files
  data:    the platform's activity records, the agent's own records
policy:
  no cause is guessed and no fix is proposed by an agent; the record
    says what is known, what is not, and where each fact came from
  the agent being recorded is never contacted by the recorder
  the decision is a person's, every time
measures:
  cycle time: <target> from the notice to the decision
  gaps: intervals in the timeline no record covers
records:
  alarm           - the agent's name, the time, and what was seen, with
                    who or what noticed it
  incident-record - the timeline, each line either a fact with the
                    record it came from or a gap said to be one
  decision        - what the person decided, and when
```

## The records a run leaves

Each phase leaves the record its own kind of work produces, and the
incident record is the one that matters after the run. Every line of
its timeline is either a fact with the record it came from, or a gap
said to be one. A reader who holds the attached files can check every
fact against its source, and a reader who finds a gap knows it was not
filled by a guess.

The decision is recorded beside it, with the time it was made and the
person who made it.

The run closes:

```
RUN DONE: <team>/record-an-incident v1 · run <n>
outcome: <completed | abandoned>
result: <the incident record and the decision taken on it>
open: <what nobody finished, and who may close it>
```

## The failure edges

- **No watcher is held yet.** A person notices the failure and sends
  the trigger by hand, and the run records who noticed it. The rest of
  the run is the same.
- **The records leave a gap.** The timeline names it. When the person
  can fill it from records they did not attach, the run returns to
  gathering. When nobody can, the gap stays in the record as a gap.
- **Somebody asks the recorder what caused it.** The recorder declines.
  A cause in the record that no record supports is a guess that the
  next reader will take as a finding.
- **Somebody asks the recorder to restart the agent.** The recorder
  declines. Restarting is one of the decisions, and the decision is a
  person's.
- **The same agent fails again while a run is open.** A run covers one
  agent and one time, so a failure at another time starts its own run.
- **A run is abandoned.** Nothing was changed by the run, because no
  phase changes anything. The record says how far it got and what was
  never gathered.

## Where each phase is specified

| Phase | Where it is specified |
|---|---|
| notice | [The watcher](https://agentroles.ai/watcher.html) in Agent Roles |
| record-the-incident | [The incident recorder](https://agentroles.ai/incident-recorder.html) in Agent Roles |
| decide | [Retire an agent](./retire-an-agent.md) and [make a new agent](./make-a-new-agent.md), for two of the four decisions |
