# Writing down a process

A process is a standing document that belongs to your organization. It
says how one recurring piece of work gets done, what starts it, who owns
it, which parts agents may run, and what a run has to leave behind.

This document is the format. Every process in your
[catalog](./process-catalog.md) uses the same headings, so a reader who
knows one can read all of them.

## A process, a pattern, and a run

Three different things get muddled together, and each has its own owner:

- A **work pattern** is a reusable shape, and belongs to nobody. Train and
  certify is the same shape at your company and at your competitor. There
  are few of these, and one earns its place by recurring across
  organizations. They live in
  [Agent Work Patterns](https://github.com/jeffrschneider/agentworkpatterns).
- A **process** is yours. It has your legal gate in it, your brand rules,
  your systems, and a person's name on it. A department has ten to forty.
- A **run** is one execution of a process. Run 47 of the social campaign
  process is a different thing from the process itself, and both need
  records.

The distinction that matters most is the last one: the process is the
definition, and a run is an instance. A process document is amended a few
times a year; a run happens this afternoon and is finished by Friday.

## The format

```
PROCESS: <name>                     id: <team>/<slug>   v<version>
owner: <who owns this document>     effective: <date>
trigger: <what starts a run, and who may start one>
concurrency: <one run at a time | runs may overlap>
goal: <what exists when a run is done>
phases:
  <name> - <runs|convenes|system:|human:> <what>   owner: <who>
           after: <phase names, or trigger>        by: <deadline>
           automation: <manual|assisted|supervised|autonomous|never>
handoffs:
  <phase> -> <phase>: <what crosses, and what it has to contain>
bindings:
  roster:  <role = agent or person, standing>
  systems: <system (read|write), ...>
  data:    <reference material a run reads>
policy:
  <a rule that exists for legal, compliance, or brand reasons>
measures:
  <what a good run looks like: cycle time, volume, quality gate>
fed by: <process ids>
feeds:  <process ids>
amendments:
  v<n> - <what changed, and which debrief or run produced it>
```

Everything below explains one of those lines.

## The header

The **id** is what other documents cite. Names change and ids do not, so
the catalog, other processes, and every run record point at the id. Use
`<team>/<slug>`, lowercase, no spaces.

The **owner** owns the document, not the work. They decide what version 5
says. Whoever starts a run is usually somebody else, and conflating the
two is the most common way a process goes stale: the people running it
change it in practice and nobody changes the page.

**Effective** is the date this version took over. A run records which
version it ran under, and that record does not change afterwards even
when the process does.

## The trigger

A process does not begin because someone remembered it. It begins when
something specific happens: a brief is approved, a termination is
recorded, the first Monday of the month arrives, a threshold is crossed.
Write the trigger as an observable event, and name who is allowed to
start a run from it.

**Concurrency** is part of the trigger and gets forgotten. A social
campaign process runs eight times at once and the runs never touch each
other. An incident response process should usually run once at a time,
because two runs mean two agents doing contradictory things to the same
system. Say which, and if runs may overlap, say what they share.

## The phase graph

Phases are named, not numbered. Numbering implies a sequence, and a real
process is a graph: several phases start the moment the trigger fires,
they run without waiting for each other, and they join at the end.

Order comes from `after:` lines, not from the order phases are listed.
Two phases with no path between them run at the same time. A phase with
several `after:` entries waits for all of them. The last phase, the one
that closes the run, usually waits for everything.

`by:` is a deadline relative to the trigger or to the phase it follows.
Deadlines belong in the process rather than in a run because they are
usually policy: payroll has a legal deadline, an access revocation has a
security one.

A phase resolves to exactly one of four things:

- **`runs <work pattern>`** - the phase is a whole sub-job with its own
  plan and its own close. The process names what comes out and never
  reaches inside.
- **`convenes <collab pattern>`** - the phase is one room, running an
  [Agent Collab](https://github.com/jeffrschneider/agentcollab) playbook
  as written.
- **`system: <action>`** - no agents collaborate. A system does something:
  a scheduler publishes, a job runs, a record is written.
- **`human: <action>`** - a person acts outside any room.

The last two are why a business process cannot be written with work
patterns alone. Most real processes have steps where nothing collaborates
at all, and a format that cannot express them forces people to lie.

## Automation, phase by phase

Every phase carries an automation level. This is the column an
organization actually uses to decide where to start, and the one that
changes as they gain confidence.

| Level | Who does the work | Who decides |
|---|---|---|
| `manual` | people | people |
| `assisted` | an agent drafts or gathers | a person decides and acts |
| `supervised` | an agent | a person approves the output before it moves on |
| `autonomous` | an agent | nobody in the loop; the record is the check |
| `never` | people, permanently | people |

Four of those are rungs on a ladder. `never` is not: it is a decision
that this phase stays with a person no matter how good the agents get,
because a regulator, a contract, or a customer relationship requires it.
Keeping it separate stops an automation program from quietly climbing
over a gate that was put there on purpose.

Moving a phase up the ladder is an amendment, with a version. That is
deliberate: it means the change is dated, attributable, and visible to
whoever audits the process later.

## Handoffs

The same rule as a work plan: name what crosses each edge and what it has
to contain. For a phase that runs a work pattern, the handoff is that
sub-job's declared output, which means it can be checked before anything
starts. For a `system:` phase, the handoff is whatever the system wrote,
and the phase after it should say where to find it.

## Bindings

Bindings are what make a process executable rather than merely described.

- **roster** - which agent or person holds each role, standing, between
  runs. A run fills its cast from here instead of negotiating one.
- **systems** - what a run may touch, and at what permission. An agent
  that has to ask for access halfway through a run stalls the run, and an
  agent with more access than the process needs is a finding waiting to
  happen.
- **data** - the reference material a run reads: brand guidelines, a
  claims register, a price list. Version these, because a run's output is
  only defensible against the version it read.

Bindings are also the pre-authorization. When a trigger fires, nobody
should be deciding what the agents are allowed to do.

## Policy

Policy rules exist for legal, compliance, or brand reasons rather than
for coordination. The difference matters: coordination rules live in the
pattern and apply everywhere the pattern is used, while policy rules are
yours and apply only here.

"Every claim ships with a citation in the claims register" is policy.
"One agent holds the pen during synthesis" is coordination. If you find a
policy rule that keeps appearing in every process, it belongs in a
standing policy document that processes cite, not copied into forty
places.

## Measures

What a good run looks like: how long it should take, how many run per
period, and the quality gate. Measures are what a debrief reads. Without
them, amendments come from whoever complained most recently.

## Feeds and fed by

Processes connect without merging. `fed by` names the processes whose
output this one consumes; `feeds` names the ones that consume this one's.
Both cite ids.

Two processes that feed each other in a loop are usually one process with
a cycle in it, or two processes with a queue between them. Say which.

## Amendments

An amendment is a change to the document, and it gets a version. Record
what changed and where it came from - a debrief, a failed run, a policy
change. Cosmetic edits do not need a version; anything that changes what
a run must do does.

A run records the version it ran under. That is what makes an audit
possible a year later: the auditor reads the run's records against the
version that was effective at the time, not against today's page.

## What a run leaves behind

A run produces a chain of records, one per level:

```
RUN: mkt/social-campaign v4 · run 47
started: <date> by <who>
trigger: <the record that fired it>
```

Each phase then leaves the record its own level produces. A phase that
convenes a collab pattern leaves that pattern's `CONVENED` and `DONE`
records. A phase that runs a work pattern leaves its plan and its
`JOB DONE`. A `system:` or `human:` phase leaves one line saying what
happened, when, and who or what did it. The run closes with:

```
RUN DONE: mkt/social-campaign v4 · run 47
outcome: <completed | abandoned>
result: <what exists now that did not before>
open: <what nobody finished, and who may close it>
```

Read from the bottom up, that chain answers the three questions an
auditor asks: what is your process, did it run, and can you show me. The
process document answers the first. The run records answer the second.
The third is answered by the fact that each record names who acted and
when, and none of them were written afterwards from memory.

## Failure edges at the process level

A work plan's failure edges cover a phase that does not produce its
output. A process has four more that no single phase can see:

- **A phase misses its deadline.** Say what happens: the run continues
  and the miss is recorded, or the run stops. Both are legitimate; not
  choosing is not.
- **A gate is refused.** An approval phase that comes back `REDLINE`
  sends the run back to a named phase, not to the beginning. Say which.
- **The trigger fires while a run is in flight.** Either queue it, join
  it to the running one, or refuse it. This is the concurrency line doing
  its work.
- **A run is abandoned partway.** Some phases have already changed the
  world - access granted, money paid, a post published. Name what has to
  be undone and who does it. A process that cannot be abandoned safely
  should say so.

## What a process is not

A process is not a work pattern. Do not publish yours as one unless the
shape recurs beyond your organization, with your specifics removed.

A process is not a diagram. The graph is written as `after:` lines
because a person, an agent, and an auditor can all read text, and only
one of the three can read a diagram.

A process is not enforceable. Nothing holds a run to the graph except the
records it leaves, and the fact that somebody reads them.
