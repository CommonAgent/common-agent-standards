# Agent Processes Specification

**Version:** 0.1.0-draft
**Status:** Working Draft
**Date:** 2026-08-22

A process document says how work actually gets done: what happens, in what
order, who does each part, what passes between them, where a person has to sign,
and what the run leaves behind. This specification says what such a document
means, precisely enough that two people reading the same document reach the same
conclusion and two programs reading it behave the same way.

It also specifies the reference profile: a process document with the
organizational parts deliberately left blank, which is what makes a process
publishable by one organization and adoptable by another.

## 1. Introduction

Process documentation usually fails in one of two directions. It describes
somebody else's organization, so it does not fit and nobody uses it. Or it is a
blank template, so it fits everybody and helps nobody. The format specified here
sits between the two: the walk through the work is written down, the roles are
named, the ways a run goes wrong are drawn, and everything that belongs to a
particular organization is left as a blank for that organization to fill in.

This document was promoted from guidance. The prose it came from described the
format well and obliged nothing, which was tolerable while one team wrote all
the documents and stopped being tolerable the moment a second implementer had to
read one. Almost nothing here is new. What is new is that the obligations are
now stated as obligations, and that the parts a second implementer would
otherwise have to guess at are decided.

### 1.1 What this specifies

A process document, its phase graph, its handoffs, its bindings and the records
a run must produce; the four automation levels and what each obliges of whatever
runs the process; the reference profile and what adopting a reference process
produces; and what it means to claim that a document conforms.

### 1.2 What this does not specify

How to run a process. Nothing here describes an engine, a scheduler, a message
format or a runtime, and no such thing is required to use this format. A process
document is a specification of work, and the systems that carry it out are
whatever an organization already runs.

It also does not specify the wrapper a catalog publishes a document in. A
publisher may present a process with a diagram, an activity table and a summary,
or as the document alone. The document is the normative artifact.

## 2. Terminology

The key words MUST, MUST NOT, REQUIRED, SHOULD, SHOULD NOT, MAY and OPTIONAL in
this document are to be interpreted as described in RFC 2119.

Obligations name who carries them. "The document MUST" is an obligation on
whoever writes it, and a document that fails one is not conformant. "A runtime
MUST" is an obligation on whatever carries out a run, whether that is software,
a person following a checklist, or both.

**Process.** A document describing how a piece of work is done, from a trigger
to a close, owned by an organization and in force from a date.

**Reference process.** A process document with the organizational parts left
blank, published to be adopted rather than run. Specified in section 15.

**Run.** One execution of a process, from its trigger firing to its close.

**Phase.** One step of the work, named, with a way it resolves and a place in
the graph. The activity table and the phase list describe the same steps.

**Handoff.** What passes from one phase to the next, stated as a thing rather
than as a conversation.

**Gate.** A phase a person must sign, written `automation: never`.

**Blank.** An angle-bracket placeholder, `<like this>`, marking a decision the
document deliberately refuses to make on the reader's behalf.

**Runtime.** Whatever carries out a run: a workflow engine, an agent, a person
with the document open, or any combination.

## 3. The document

A process document is plain text. Its parts appear in this order:

    PROCESS: <name>                       id: <id>   v<n>
    from: <reference process> v<n>
    owner: <who>                          effective: <date>
    trigger: <what starts a run>
    concurrency: <what may overlap>
    goal: <what is true when a run closes>
    phases:
      <phase-name> - <how it resolves>: <what happens>
                     owner: <role>   after: <phase>
                     automation: <level>
    run-scoped:
      <name> - <how it resolves>   owner: <role>
               every: <cadence>
               from: <phase>   until: <phase or run close>
    handoffs:
      <phase> -> <phase>: <what passes>
    bindings:
      roster:  <who holds each role>
      systems: <system> (<access>)
      data:    <what a run reads>
    policy:
      <a rule a run is held to>
    measures:
      <what a run is measured on>

A document MUST carry `PROCESS:`, `id:`, `trigger:`, `goal:`, `phases:` and
`handoffs:`. Everything else is REQUIRED only where a later section says so.

Sections 4 to 13 specify each part. Section 14 covers failure edges, which are
deliberately not normative. Section 15 specifies the reference profile, 16
translation, 17 conformance and 18 versioning.

## 4. The header

The header is the block of lines above `phases:`. It says which document
this is, which version of it, where it came from, who is answerable for
it, and what a run is for.

A process document MUST carry `PROCESS:`, `id:`, a version, `trigger:`,
`concurrency:`, `goal:` and `phases:`. `trigger:` and `concurrency:` are
defined in Section 5; the rest are defined here.

The header from a real document:

```
PROCESS: negotiate the agreement   id: <team>/negotiate-the-agreement   v1
from: ref/sls/negotiate-the-agreement v1
owner: <who>                          effective: <date>
```

### `PROCESS:`

`PROCESS:` names the process in plain words. The name is for a reader.
It is not an identifier, it changes without ceremony, and nothing cites
it. Authors SHOULD write it lowercase, as the corpus does, so that a
list of processes reads as a list of work rather than as a list of
titles.

### `id:`

`id:` is what every other document cites. A document MUST carry one, and
it MUST take the form `<team>/<slug>`, lowercase, with no spaces.

A citing document MUST cite the id and MUST NOT cite the name. Names
change and ids do not, so a catalog entry, a `fed by:` line, a `feeds:`
line and a run record all point at the id. The slug is not obliged to
match the words in `PROCESS:`; the corpus has `PROCESS: customer
advisory board` under `id: <team>/advisory-board`, and that is
conformant.

### The version

The header MUST carry a version, written `v<n>`. It is written on the
`PROCESS:` line in most documents, but layout is free: two documents in
the corpus wrap `id:` and the version onto the following line, and both
are conformant.

The version is what a run record points at. What changes it is defined
by the amendments rules, not here.

### `owner:`

`owner:` names who owns the **document**, not the work. They decide what
version 5 says.

A process MUST name an owner. A runtime MUST NOT read `owner:` as naming
who may start a run; who may start a run comes from the trigger
(Section 5). Conflating the two is how a process goes stale, because the
people running it change it in practice and nobody changes the page.

### `effective:`

`effective:` is the date this version took over.

A run MUST record the version it ran under. That record MUST NOT be
rewritten when a later version takes over. This is the whole reason the
date is in the header: an audit a year later reads a run's records
against the version that was effective when it ran, not against today's
page.

### `owner:` and `effective:` in a reference process

A reference process MUST NOT name an owner and MUST NOT carry an
effective date. Those two blanks are the mark that the document is not
yet anyone's process.

A reference process MUST still carry both lines, with the blanks marked,
exactly as the corpus does:

```
owner: <who>                          effective: <date>
```

The line stays because it shows the adopter where the value goes. A
catalog MUST NOT report a reference process as running, and a runtime
MUST NOT start a run from a document that has no owner and no effective
date. Filling those two blanks is what turns a reference process into
somebody's process at version 1.

### `from:`

`from:` records where the document came from. It MUST name a reference
process and a version, in the form `ref/<domain>/<slug> v<n>`.

A document adopted from a reference process MUST carry `from:`. A
reference process MUST also carry the line in its own document block,
naming itself and its version, because that is the line the adopter
keeps when they copy it. All 169 reference processes in the corpus do.

`from:` is provenance and nothing else. It MUST NOT be read as a
dependency: once adopted, the document is the adopter's, they amend it
from their own debriefs, and the reference process never reaches into
it. `from:` also never claims that anything is running. It names a
document and a version of that document. A reference process has no
owner, no runs and no records, so a `from:` line pointing at one is a
statement about lineage, not about a live system somewhere.

### `goal:`

`goal:` MUST state what exists when a run is done.

It is a state, not an activity, because it has to be checkable against
the close of the graph (Section 6). "every ask on the table closed as
given, traded or refused, each with a reason and a named approver, and
one written position both sides hold" is a goal. "negotiate with the
buyer" is not.

### Layout

Whitespace in the header carries no meaning. Fields are separated by
runs of spaces so that a person can read them in columns, and values
wrap onto continuation lines. A translator MUST NOT depend on column
positions, on a field appearing on any particular line, or on a
field-per-line layout. It reads fields by their `name:` prefix.

---

## 5. The trigger

`trigger:` says what starts a run.

A process does not begin because somebody remembered it. It begins when
something specific and observable happens: a brief is approved, a
termination is recorded, the first Monday of the month arrives, a
threshold is crossed.

A process MUST carry a `trigger:` line, and it MUST name an observable
event. A trigger that names an intention rather than an event ("when we
decide to refresh the messaging") is not conformant, because nothing can
be watched for it and no run record can point at the thing that fired.

A trigger MAY name more than one event. Nearly half the corpus does:

```
trigger: the buyer replies to an offer with asks, in <your CRM>
```

is one event, and other documents name an alternative with `or`. Any one
of the named events starting a run is what a multi-event trigger means.

A trigger SHOULD also name who may start a run. Most of the corpus
leaves this to the roster and the phase owners, so it is not a MUST, but
a trigger that names its starter is the one that survives an argument
about who was allowed to fire it.

### 5.1 A structured trigger

A document MAY carry, alongside the sentence, a structured form of the
trigger that names what arrives: the record, the system it arrives in,
and the field or state that changed. No document in the corpus does this
today, so it is a MAY and not a SHOULD.

It is written as an indented `watch:` line under the sentence, naming the
record, the system it arrives in, and the change that starts a run:

```
trigger: the buyer replies to an offer with asks, in <your CRM>
         watch: record=<opportunity> system=<your CRM>
                change=<a reply is logged against a sent offer>
```

Each value MAY be a blank, and in a reference process each of them
normally is, because which system holds the record is exactly the kind
of decision a reference refuses to make.

Where a document carries one:

- The sentence remains the normative statement of the trigger. A
  structured form MUST NOT contradict it. Where the two disagree, the
  sentence governs and the document MUST be amended to remove the
  disagreement.
- A runtime MAY watch the structured form and start a run when it
  matches, without a person acting.
- A runtime MUST NOT treat the absence of a structured form as meaning
  the process has no trigger. The sentence is the trigger. The
  structured form is an aid to automating its detection.

### 5.2 `concurrency:`

`concurrency:` is part of the trigger and is the part that gets
forgotten. A process MUST carry it, and it MUST say whether runs of this
process may overlap.

The value is prose, not an enumeration. The corpus writes "runs may
overlap", "one run at a time", "runs never overlap for one process",
"one run per account", and scoped forms that allow overlap globally
while forbidding it for one subject:

```
concurrency: runs may overlap - <how many> negotiations live at once,
             and one opportunity is negotiated by one run at a time
```

Where runs may overlap, the line SHOULD say what they share. Two runs
that share nothing are eight independent campaigns. Two runs that share
a system, a budget or a customer are two agents able to do
contradictory things to the same thing, and the reader needs to know
which case they are in.

### 5.3 The trigger fires while a run is in flight

This is the case `concurrency:` exists to answer, and the one an
implementer gets wrong by default.

When the trigger fires while a run of the same process is in flight, a
runtime MUST resolve it as the `concurrency:` line directs, and the
resolution MUST be exactly one of:

- **start another run**, where the line allows runs to overlap;
- **queue it**, and start a run when a run closes;
- **join it** to the run already in flight; or
- **refuse it**, and record the refusal.

A runtime MUST record which of the four it did, and MUST NOT silently
drop the trigger. A dropped trigger is the failure nobody sees: the
event happened, the work never started, and no record exists that says
so. This is why `concurrency:` is required rather than recommended.
A document that does not answer the question forces the runtime to
guess, and the guess is invisible.

---

## 6. The phase graph

`phases:` is the body of the process. It is a graph, not a list, and
this section is where a second implementer would otherwise guess.

### 6.1 A phase line

A phase opens with two spaces, a name, and a dash:

```
  hold-session        - human: the asks worked through with the buyer,
                        in the order the list sets, against the approved
                        give and trade positions
                        owner: <your deal owner role>
                        after: confirm-deciders + approve-concessions
                        automation: <level>
```

The name MUST be lowercase kebab: lowercase letters and digits,
separated by single hyphens. It MUST be unique within the document. All
2,702 phases in the corpus satisfy both.

The name is what `after:` lines, handoff lines and run-scoped `from:`
and `until:` lines cite. Everything after the dash on the opening line
and on its continuation lines belongs to that phase, until the next line
that opens with two spaces and a name.

### 6.2 Names, not numbers

Phases have names rather than numbers, and a runtime MUST take order
from `after:` lines only.

A runtime MUST NOT infer that a phase follows the phase listed above it.
Listing order is for reading. Several phases commonly start the moment
the trigger fires, run without waiting for each other, and join later.

Where no path through `after:` lines connects two phases, a runtime MUST
NOT require one to finish before the other starts. Serializing an
unordered graph is not a conservative choice. It converts a process that
takes two days into one that takes nine, silently, and no record says
why.

### 6.3 How a phase resolves

A phase MUST resolve to exactly one of four forms, and it MUST name that
form immediately after the dash.

**`runs <pattern>:`** The phase is a whole sub-job with its own plan and
its own close, running a work pattern. The process names what comes out
of it and MUST NOT reach inside it. The corpus writes
`runs assessment:`, `runs collect-and-report:`, `runs build-by-talent:`.

**`convenes <pattern>:`** The phase is one room, running a collab
playbook as written. The corpus writes `convenes approval:`,
`convenes decide-and-announce:`, `convenes debrief:`.

**`system: <action>`** No agents collaborate. A system does something: a
scheduler publishes, a job runs, a record is written.

**`human: <action>`** A person acts outside any room.

The last two carry more weight than they look. Most real processes have
steps where nobody collaborates with anybody, and 1,162 phases in the
corpus are `human:` against 164 `system:`. A format with no way to
describe those steps makes authors write down something other than what
happens.

The same pattern name MAY appear after `runs` in one phase and after
`convenes` in another. `roll-call`, `assessment`, `bake-off` and
`decide-and-announce` all do in the corpus. A translator MUST NOT infer
the family of a pattern from its name; the verb says which family is
meant.

### 6.4 `owner:`

Every phase MUST carry `owner:`, naming the role or the agent answerable
for that phase. All 2,702 phases in the corpus do.

In a reference process, a phase owner MUST be either an abstract agent,
named as the slug the activity table cites, or a role left as a marked
blank such as `<your sales leadership role>`. A reference process MUST
NOT name a person, because the roster is one of the things it leaves
blank.

### 6.5 `after:`

Every phase MUST carry `after:`. All 2,702 phases in the corpus do.

The value names the phases this one waits for, or the keyword `trigger`.

**`after: trigger`** means the phase starts when the trigger fires.
Every process MUST have at least one phase with `after: trigger`, or
nothing in the graph ever begins. All 169 documents in the corpus have
one.

**`after: a + b` is a join, and it waits for BOTH.** A phase whose
`after:` names more than one phase MUST NOT begin until every phase
named has closed. Not the first of them, not any of them.

```
after: confirm-deciders + approve-concessions
```

means the session does not open until the deciders are confirmed **and**
the concessions are approved. Reading `+` as "either" is the defect that
produces a run where the buyer is in the room and the concessions were
never signed off, which is exactly the failure the phase exists to
prevent.

**A phase MUST NOT begin before its inbound handoff exists.** For every
handoff line `x -> y`, phase `y` MUST NOT begin until what that line
says crosses the edge and contains what the line says it must contain.
For a phase that runs a work pattern, the handoff is that sub-job's
declared output, which means it is checkable before anything starts. For
a `system:` phase, the handoff is whatever the system wrote, and the
phase after it names where to find it. `after:` says when a phase is
allowed to start; the handoff says what has to be there when it does,
and a runtime MUST satisfy both.

The value of `after:` is normally names joined by `+`. It MAY carry
qualifying prose where an edge is conditional; two documents in the
corpus write forms like `after: do-the-work, when it slips`. A
translator that cannot parse such a value MUST refuse it rather than
discard the qualification.

### 6.6 `by:`

`by:` is OPTIONAL. About half the phases in the corpus carry one.

Where present, it states a deadline, either as a duration relative to
the trigger or to the phase this one follows (`by: <days>`,
`by: <hours>`, `by: <weeks>`), or as a named point in the run
(`by: launch`).

Deadlines belong in the process rather than in a run because they are
usually policy: payroll has a legal deadline, an access revocation has a
security one.

A reference process MUST leave the number blank. It shows where the
number goes; the number is the adopter's decision.

A document that carries `by:` on any phase MUST say, in its failure
edges, what happens when a deadline is missed. Both answers are
legitimate, the run continues and the miss is recorded, or the run
stops. Not choosing is not.

### 6.7 Deviation edges

A deviation edge is a backward or sideways edge: a gate that comes back
refused, a check that fails, a deadlock that goes up.

A deviation edge MUST name the phase it returns to. It MUST NOT return
"to the beginning". An approval that comes back with redlines returns to
the phase that can act on them:

```
  A7 -. a concession is refused inside .-> A6
  A13 -. the paper does not say what was agreed .-> A9
```

The second one is worth reading twice. The reconciliation finds that the
contract text and the agreed record disagree, and the edge returns to
the agreed record, not to the contract. Which phase an edge returns to
is a decision about where the work can actually be repaired, and naming
it is the whole point of writing the edge down.

Every document in the corpus carries at least one deviation edge.

### 6.7.1 Deviations in the document

The examples above are drawn from a diagram, and Section 6.10 says a
diagram is a rendering rather than a source of truth. Read together,
those two statements oblige a document to carry something the document
block has no way to write down, which is a defect in this
specification rather than in any document.

A document MAY carry a `deviations:` block, after `handoffs:` and in the
same shape, so that going backwards is stated where the rest of the
graph is stated:

```
deviations:
  approve-concessions -> price-asks [concession-refused]: an approver
    refuses a concession, so the ask is priced again against the floor
  reconcile-paper -> record-agreed [paper-disagrees]: the contract text
    and the agreed record disagree, and the agreed record governs
```

The left side names the phase the run is in, the right side names the
phase it returns to, the key is optional and shares the namespace with
handoff and record keys, and the sentence says what happened. A
deviation line MUST NOT return to a phase that does not exist, and MUST
NOT be the only statement of a failure the failure edges also describe:
the two say different things, one to a machine and one to a person.

Where a document carries deviation lines and a diagram, they MUST agree.
Where they disagree, the document governs.

Until a document carries them, a reader takes the deviations from the
diagram, which is what every document in the corpus does today.

### 6.8 The close

A document MUST name the close: the state that exists when a run is
over. At least one phase MUST reach it.

The close and `goal:` MUST describe the same state. The diagram states
it as a terminal node:

```
  A15 --> DONE([both sides hold one written agreed position])
```

More than one phase MAY reach the close, and the phase that reaches it
is not obliged to be the last one listed. Two documents in the corpus
have a second closing phase, and several list exception-handling phases
after the phase that closes the ordinary path.

### 6.9 The phase list and the activity table

The activity table and the phase list describe the same work in the same
order.

A document MUST have exactly one phase for each row of its activity
table, in the same order, and a document whose counts disagree is not
conformant. All 169 documents in the corpus satisfy this, including
every document that lists exception phases and every document with more
than twenty activities.

The two exist because they answer different questions. The table says
what happens, in words a person reads once. The phase list says when it
happens and who is answerable, in a form an agent and an auditor read.
When they drift apart, a reader cannot tell which one is the process,
and both stop being trusted.

Run-scoped lines are not phases. They MUST NOT appear in the activity
table and MUST NOT be counted against it.

### 6.10 The diagram

A document SHOULD carry a diagram of the graph. All 169 documents in the
corpus do.

The diagram is a rendering of the graph, not a second source of truth.
Where the diagram and the `after:` lines disagree, the `after:` lines
govern, and the document MUST be amended to bring the diagram back into
line. A runtime MUST NOT read the graph from the diagram.

The graph is written as `after:` lines because text is something a
person, an agent and an auditor can all read, and because a diagram
cannot carry an owner, a deadline or an automation level.

---

## 7. Automation

Every phase MUST carry `automation:`, and its value MUST be one of
`manual`, `assisted`, `supervised`, `autonomous` or `never`. All 2,702
phases in the corpus carry one.

The level says who does the work and who decides:

| Level | Who does the work | Who decides |
|---|---|---|
| `manual` | people | people |
| `assisted` | an agent drafts or gathers | a person decides and acts |
| `supervised` | an agent | a person approves the output before it moves on |
| `autonomous` | an agent | nobody in the loop; the record is the check |
| `never` | people, permanently | people |

`manual`, `assisted`, `supervised` and `autonomous` are a ladder. An
organization moves a phase up it as it gains confidence. `never` is not
on the ladder and is defined first below, because it is the one level
that bears safety.

Raising or lowering a phase's level MUST be an amendment, and the
amendment MUST get a version. A runtime MUST NOT change a phase's
effective level without one. That is what makes the change dated,
attributable, and visible to whoever audits the process later.

This section states what each level obliges a runtime to do. The levels
are not descriptions of a working style. They are the column an
organization uses to decide where to start, and the column that decides
whether a person is standing between an agent and the world.

### 7.1 `never`

`never` means the phase stays with a person no matter how good the
agents get, because a regulator, a contract, or a customer relationship
requires it.

A runtime MUST interrupt every run at a `never` phase and MUST NOT
proceed past it until a named person has acted. The person MUST be
identified in the record by name, and the record MUST carry when they
acted.

**A notification nobody has to answer does not satisfy `never`.** A
runtime MUST NOT treat a posted message, an email, a timed window that
expires, or any other signal that proceeds on its own as the person
acting. If the run can continue without a person having done something,
the phase was not held.

**A runtime MUST NOT raise a `never` phase to any other level.** Not on
a configuration flag, not on an operator override, not on a timeout, not
because the phase has been approved the same way forty times. The only
thing that may change a `never` phase is an amendment to the document,
carrying a version, made by the document's owner. A runtime that offers
an override for `never` has removed the only reason the word exists as a
separate value.

An agent MAY prepare a `never` phase: gather the material, draft the
document, lay out the options. What it MUST NOT do is decide, or act on
the decision. `never` binds the decision and the act, not the
preparation.

`never` is 383 of the corpus's phase levels, and the phases that carry
it are the ones that would be expensive to get wrong:
`set-walk-away`, `approve-concessions`, `escalate-deadlock` and
`confirm-position` all read `automation: never`.

### 7.2 `assisted`

`assisted` means an agent drafts or gathers, and a person decides and
acts.

A runtime MUST present the agent's output to a person before anything
leaves the phase, and the person acts. The act is the person's: the
runtime MUST NOT perform it on the person's behalf on the strength of
the draft alone.

The record for an `assisted` phase MUST name the person who acted and
MUST record when. It SHOULD identify what the agent produced, so that a
later reader can tell the draft from the decision.

### 7.3 `supervised`

`supervised` means an agent does the work and a person approves the
output before it moves on.

A runtime MUST hold the output at the phase boundary until a person
approves it. Approval is an act, so the same rule `never` states applies
here: a window that expires, a notification nobody answers, or a default
that proceeds on silence MUST NOT be recorded as an approval.

The record MUST name the approver and MUST record when the approval was
given. Where the phase feeds a handoff, the record of the approval
SHOULD travel with what crosses, so the next phase can see that the
thing it received was approved and by whom.

The difference from `assisted` is who acts. Under `assisted` the person
does the thing. Under `supervised` the agent does the thing and the
person says yes first.

### 7.4 `autonomous`

`autonomous` means an agent does the work and nobody is in the loop. The
record is the check.

A runtime MAY complete an `autonomous` phase without any person acting.
Because nothing else stands between the phase and the world, the record
carries the whole weight, and the obligation is correspondingly strict:
a runtime MUST write a record for every `autonomous` phase it completes,
naming the agent that acted, what it did, and when. A runtime MUST NOT
complete an `autonomous` phase without leaving that record.

An `autonomous` phase MUST still respect its `by:` deadline, its
handoffs, and any policy rule that names it. Autonomous means unattended,
not unbounded.

### 7.5 The level in a reference process

A reference process SHOULD leave `automation:` blank, written
`automation: <level>`, except where the level is `never`, which it
states.

This is a choice the reference makes for the adopter deliberately. Where
a phase may be automated, how far to automate it is the adopter's
decision, and depends on their regulators, their agents and their
appetite. Where a phase must stay with a person, that is a property of
the work rather than of the adopter, so the reference states it and the
adopter inherits it. 2,178 phases in the corpus carry the blank and 383
carry `never`.

A reference process MAY state a concrete level where the shape of the
work fixes it. Twenty-four documents in the corpus do. No reference
process states `manual`, because a phase that people are free to
automate later is left blank rather than pinned at the bottom of the
ladder.

An adopter MUST fill in every `<level>` blank before starting a run. A
runtime MUST NOT start a run against a document that still carries an
unfilled `automation:` blank, and MUST NOT choose a level for it. There
is no safe default: guessing low stalls the run and guessing high puts
an agent somewhere a person was meant to stand.

## 8. Handoffs

A handoff is what one phase leaves for the next. The graph says which
phase follows which. The handoff says what crosses the edge and what it
has to contain. A document with a graph and no handoffs tells a reader
the order of the work and nothing about the work, and the phase on the
receiving side has to go and ask.

### 8.1. The line

A handoff is written as one line under `handoffs:`, in the form
`<sending side> -> <receiving side>: <what crosses>`, continued on
indented lines where it does not fit. Quoted from
`ref/sls/negotiate-the-agreement`:

```
  confirm-position -> hand-on: one dated list of agreed terms, held by
    both sides, and the open items nobody closed
```

A handoff line MUST say what crosses. A line that names two phases and
stops repeats an edge the graph already carries and tells the receiving
phase nothing it did not already know.

A document is not required to write a handoff on every edge of its
graph. It SHOULD write one on every edge where the receiving phase
needs something it cannot get for itself, which in practice is most of
them.

### 8.2. Both sides name something that exists

A document MUST NOT name a phase key on either side that its phase list
does not declare. A handoff to a phase that does not exist is a promise
nobody can keep, and a handoff from one is an input that never arrives.
Both read as complete on the page, which is what makes them worth a
MUST: this is the defect a reader is least likely to catch by eye.

The sending side MUST be a phase of this document. A run cannot hand on
what it did not produce.

The receiving side MAY instead name a destination outside the document,
written in prose rather than as a key. This is how a run hands its
result out of the process. Quoted from
`ref/mkt/approve-marketing-material`:

```
  release -> the submitting process: the cleared version, the clearance
    record, and the date the clearance stops being good
```

Two things that are not phases MUST NOT appear on either side. The
trigger is one: what the trigger carries is stated in the trigger, and
taking it in is the job of the first phase. A run-scoped line
(Section 9) is the other: it has no edges, so it can neither take a
handoff nor give one.

### 8.3. Joins and fan-out

A handoff MAY name more than one phase on a side.

Several phases on the sending side are joined with `+`. This is one
handoff, and it exists only when all of the named phases have produced
their part. Quoted from `ref/mkt/display-retargeting`:

```
  check-frequency + check-suppression -> record-in-force: the delivered
    figures beside the settings they were read against
```

Several phases on the receiving side are separated with `/`. This is
also one handoff, read by each of the named phases. A phase that hands
the same thing to two or three others MAY state it once this way rather
than repeating itself. Quoted from `ref/mkt/product-launch`:

```
  plan-launch -> produce-content / enable-sales / prep-channels: each
    branch's deliverables and deadlines. Three branches read one plan
```

A document MUST NOT write `+` on the receiving side or `/` on the
sending side. The two symbols are not interchangeable, and a reader who
cannot tell a join from a fan-out cannot tell whether a phase waits for
one input or for three.

Stating it once is a permission, not an instruction. A phase that hands
different things to two others writes two lines, and so does a phase
that hands the same thing for two different reasons.

### 8.4. Nothing starts before its handoff exists

In a run, a receiving phase MUST NOT begin before every handoff the
document names into it exists. A runtime that starts phases MUST NOT
start one before then, and MUST NOT treat an `after:` edge as satisfied
by a phase whose handoff was never produced.

The `after:` line and the handoff answer different questions. `after:`
says when a phase may begin. The handoff says what has to be in hand
when it does. A phase that starts on the edge alone starts without its
input, and the work it does before the input arrives is work that has
to be done again.

### 8.5. A handoff is a thing, not a conversation

What a handoff names MUST be something a later reader can point at: a
document at a version, a list, a record, a dated confirmation, a signed
approval. A document MUST NOT name as a handoff something that exists
only as a discussion. "The two phases meet" and "a handover call" are
not handoffs, because they leave the receiving phase nothing to read
and leave an auditor nothing to check.

This is the same rule the records section applies to a run (Section
13), stated one edge at a time. It is also what makes a phase safe to
move from a person to an agent: an agent can be handed a list, and
cannot be handed the memory of a meeting.

### 8.6. Handoff keys

A document MAY give a handoff a stable key alongside its sentence. The
key is written in square brackets before the colon:

```
  price-asks -> sort-asks [ask-costing]: what each ask costs, which
    budget carries it, and the margin after it
```

A key is lowercase, hyphen-separated, and unique within the document.
Keys are one namespace: a handoff key and a record key (Section 13) in
the same document MUST NOT be the same string.

The key exists because a sentence cannot be a field name. A runtime
that tracks handoffs, or a translator that renders the document into
another form, needs a short identifier that survives an edit to the
wording. Where a document gives a key, the key is what other systems
cite, and an author who rewrites the sentence MUST keep the key. An
author who means a different handoff gives it a different key.

The sentence is not optional. A key next to no description says even
less than a bare edge.

---

## 9. What attaches to the run

Not everything a process does sits in a phase. A weekly status report
runs for the whole run. A spend watch starts at the first purchase and
does not stop until the last invoice. These are run-scoped lines, and
they are written under `run-scoped:`.

Most of a process's management lives here: the status reporting, the
spend watch, the escalation path. A document that lists only its phases
reads as if nobody is watching between handoffs.

### 9.1. The line

A run-scoped line resolves to the same four things a phase does, and it
names an owner. Quoted from `ref/mkt/display-retargeting`:

```
run-scoped:
  spend     - runs allocate-and-reconcile      owner: media-buyer
              cap: <n>/day
              from: launch   until: run close
  frequency - runs collect-and-report          owner: analytics
              every: <cadence>
              from: launch   until: run close
```

A run-scoped line MUST carry `from:` and `until:`. Without them the
line says something is being watched and does not say from when, which
leaves the first hours of a run uncovered and nobody accountable for
that.

A run-scoped line MAY carry a cap of its own, as `spend` does above,
where the line is the thing being limited. The grant that cap belongs
to is still written in the bindings (Section 10).

### 9.2. `every:`

A line that runs on a cadence carries `every: <cadence>`. In a
reference process the cadence is a blank, because how often a run
reports is the adopting organization's decision.

A line that is continuously live rather than periodic carries no
`every:`. A budget watch is not a meeting; it is in force the whole
time. A document MAY instead carry `on: <event>` for a line that fires
when something happens rather than on a clock.

### 9.3. `from:` and `until:`

`from:` names the phase the line starts at, or `trigger` when it is
live from the moment the run begins.

`until:` names the phase the line stops at, or `run close`, or a stated
condition. `until: run close` is the common case. Quoted from
`ref/mkt/field-event` and from `ref/mkt/nurture-sequence`:

```
  from: promote   until: run-the-event
  until: the program is switched off
```

A phase named in `from:` or `until:` MUST be declared in the phase
list, for the same reason a handoff's phases must be.

A run is not complete until every run-scoped line has closed. A line
whose `until:` has not been reached is a line still running, and a run
that closes over the top of one closes without the thing that was
watching it.

### 9.4. Run-scoped lines are not activities

A run-scoped line is not an activity. It MUST NOT appear in the
activity table, and it MUST NOT carry an `after:` line. It has no
incoming or outgoing edges, so it has no node in the graph.

The discriminator is not repetition. A phase MAY carry `every:` and
`until:` as well: `ref/mkt/display-retargeting` has a phase
`check-frequency` that runs `after: launch` and then `every:
<cadence>`, and it is a phase because it sits in the activity table and
in the graph, takes a handoff, and hands one on. What makes a line
run-scoped is that it has no place in the graph, not that it repeats.

An author who puts a status report in the activity table gets a graph
with a node nothing can reach and nothing leaves. An author who puts a
phase under `run-scoped:` loses its handoffs. Both are the same
mistake, made in opposite directions.

---

## 10. Bindings

Bindings are what an agent needs before it can run a phase: who holds
each role, what a run may touch, and what it reads. They settle
permissions in advance. When a trigger fires, nobody should still be
working out what the agents are allowed to do.

A document MUST carry all three binding lines: `roster:`, `systems:`
and `data:`. A missing line reads as "nothing needed", which is a
different claim from "not yet decided", and only one of the two is ever
true.

### 10.1. Roster

The roster says which agent or person holds each role, standing,
between runs. A run fills its cast from the roster instead of
negotiating one.

The roster MUST account for every role the activity table names. A role
that appears in the table and nowhere in the roster is a role nobody
holds, and the phase that needs it stalls on the day it runs.

Every role in the activity table is one of two kinds, and the table
says which:

- A role an agent can hold cites an abstract agent. The citation is a
  link at the role's first mention in the document, and the bare name
  thereafter.
- A role only a person holds is written as a person, with `(person)`
  after the name.

Both forms are quoted here from the agents column of
`ref/sls/negotiate-the-agreement`, the first from activity 1 and the
second from activity 7:

```
  [negotiation-coordinator](../../agents/negotiation-coordinator.md)
  sales leader (person) · finance approver (person)
```

A document MUST mark each role one way or the other. The mark is what
tells a reader whether the automation column is a decision that is
still open or one that was closed when the process was written.

In a reference process the roster is unbound. It names which roles the
adopter has to fill and stops there, because a reference process is not
running anywhere and has nobody to name. Quoted from
`ref/sls/negotiate-the-agreement`:

```
  roster:  <who holds each role - agents claiming the abstract agents
           above, and named people for the deal owner, the sales leader
           who sets the floor, the finance approver and the legal
           reviewer>
```

An adopted process names a holder for each role. That is part of what
adoption is.

### 10.2. Systems

`systems:` lists what a run may touch and at what permission. An agent
that has to ask for access halfway through a run stalls the run, and an
agent with more access than the process needs is a finding waiting to
happen.

Every system in the list MUST carry an access word. The access words
are `read`, `write` and `trigger`, and a grant MUST carry exactly one
of them:

- `read` is the right to look. Nothing changes.
- `write` is the right to change what is stored.
- `trigger` is the right to make something happen outside the system:
  a send goes out, a session goes live, a signature request leaves the
  building. `trigger` is separated from `write` because staging a send
  and sending it are different risks, and a run that may do the first
  is not thereby allowed the second.

A system that needs two of them takes two grants. The corpus writes
both inside one parenthesis, separated by a semicolon, and MAY qualify
either with what it covers. Quoted from `ref/mkt/display-retargeting`:

```
  systems: ad platforms (write, cap: <n>/day),
           the audience tools in the ad platforms (write),
           the consent record (read), the suppression lists (write),
           the contact database (read), the website (write:
           measurement code only), analytics (write: tags and
           conversion definitions; read: reporting),
```

### 10.3. Caps

A cap is a limit on a grant, and it is written inside the grant it
limits: `ad platforms (write, cap: <n>/day)`. A cap written anywhere
else limits nothing, because the thing it would restrain is the access,
and the access is granted here.

In a reference process every cap is a blank. The reference process
shows where a number goes; the number is the adopting organization's
decision, and it is the decision the organization is most likely to
want to argue about.

A cap in the document is the only place a cap comes from. An agent
never grants itself anything, and an agent MUST NOT raise a cap it was
given. A grant that flows from the document to the agent is auditable;
one an agent arranged for itself is not.

### 10.4. Data

`data:` is the reference material a run reads: brand guidelines, a
claims register, a price list, the record a decision is checked
against. Quoted from `ref/sls/negotiate-the-agreement`:

```
  data:    <your price book> <version>, <your discount policy>
           <version>, <your standard terms> <version>, the offer as
           sent, the concession record
```

A data item that a run's output is judged against SHOULD carry a
version marker. A run's output is only defensible against the version
it read, and a year later the current version is not that one.

The document names the material. Naming which version a particular run
actually read is the run's obligation, not the document's, and it is
discharged in the records (Section 13).

---

## 11. Policy

Policy is the set of rules a run is held to for legal, compliance or
brand reasons, rather than for coordination. Coordination rules travel
with the pattern and apply everywhere the pattern is used. Policy rules
are the organization's own and apply here.

"Every claim ships with a citation in the claims register" is policy.
"One agent holds the pen during synthesis" is coordination.

### 11.1. Policy is prose

Policy lines are written as prose, one rule to a line, in language the
person who has to follow the rule would use. Quoted from
`ref/sls/negotiate-the-agreement` and `ref/mkt/display-retargeting`:

```
  no concession is offered to the buyer before it is approved inside,
    and the approval names a person
  a discount past <threshold> needs <who> to sign before it is offered
  sign-off is a human gate and is never delegated to an agent
```

Policy is not machine-readable and a document MUST NOT be written as if
it were. There is no grammar here, no operators, and no expectation
that a program can evaluate a policy line. A rule stated in prose is a
rule a person can be held to; a rule compressed into a syntax to make a
program's life easier usually stops saying the thing the lawyer meant.

A policy line in a reference process carries the generic rule and
leaves the organization's numbers and names as blanks. `<threshold>`
and `<who>` above are the shape of the decision, not the decision.

### 11.2. Who policy binds

Policy is normative for the organization that adopts the process. Once
a document is adopted, its policy lines bind the runs of that process
the way any of the organization's own rules bind it. They are not
normative for this specification, for a runtime vendor, or for anybody
who did not adopt the document.

Enforcement is by a person, or by whatever runs the process, or by
both. Nothing in the format enforces a policy line by itself. What
holds a run to its policy is the records it leaves and the fact that
somebody reads them.

### 11.3. A runtime says what it cannot enforce

A runtime MUST NOT silently drop a policy line it cannot enforce. It
says so instead: it reports the line, in the document's own words, as
not enforced by the runtime, and it does so where the person running
the process will see it rather than in a log nobody opens.

A dropped policy line is worse than an absent one. An absent rule is
visibly absent. A rule that is written in the document, believed by
everyone who read the document, and quietly unenforced by the system
running the work is a gap that shows up for the first time in an audit.
A runtime that cannot enforce a rule is not failing; a runtime that
hides which rules it did not enforce is.

The same obligation falls on a translator that renders the document
into another form: a policy line it cannot carry MUST be reported, not
dropped.

### 11.4. Repeated policy belongs somewhere else

A policy rule that appears in every process in a department SHOULD live
in a standing policy document that processes cite, rather than being
copied into forty of them. Forty copies drift, and the day the rule
changes, thirty-nine of them are wrong and nobody knows which.

---

## 12. Measures

Measures say what a good run looks like: how long it should take, how
many run in a period, what coverage or accuracy is expected, and the
gate a run has to pass. Measures are what a debrief reads. Without
them, amendments come from whoever complained most recently.

Quoted from `ref/sls/negotiate-the-agreement`:

```
measures:
  cycle time: <target> from the buyer's reply to a confirmed position
  concession depth: <target> for the gap between the offer as sent and
                    the position as agreed
  volume: <negotiations per period>
  quality gate: every closed ask carries an approver, and no offered
                concession is missing its approval
```

### 12.1. The names are open

The measure names are not a closed list. `cycle time`, `volume`,
`coverage`, `accuracy`, `rework` and others are in use across the
catalog, and a process measures what its work is actually judged on. A
document SHOULD name a cycle time, because how long a run takes is the
question asked of nearly every process.

Measures are not machine-readable. A runtime MAY compute a number a
measure names, where a run's records happen to carry what the
arithmetic needs, but no runtime is obliged to, and a measure is not
written to be parsed.

### 12.2. The quality gate

A document MUST name a quality gate, and the gate MUST be written as a
condition a run either meets or does not:

```
  quality gate: no campaign switches on against a pool the suppression
                list has not been applied to
```

Every other measure is a number that can be better or worse. The gate
is the one that can be failed. A measures block without a gate says how
the work is scored and never says what would make a run unacceptable,
which is the only part of it that ever stops anything.

### 12.3. Targets are blanks

In a reference process the targets are blanks. The reference process
names what to measure; the target is the adopting organization's
decision, and two organizations running the same process honestly hold
it to different numbers.

A measure whose target is `<target>` is complete for a reference
process. A measure without a target is not a failure of the document,
and a tool that validates these documents MUST NOT report an unfilled
target in a reference process as an error. The blank is the point: it
marks where a decision goes and says the decision has not been made
here.

A gate may carry a blank inside it and still be a gate, as in
"first-week report delivered within `<days>` of launch". What the gate
tests is written; the number it tests against is the adopter's.

---

## 13. The records a run produces

A record is what makes a run auditable. The process document says what
the process is; the records show that it ran. Because each record is
written as the work happens and names who acted and when, nobody has to
reconstruct any of it afterwards.

Records are also what make automation safe. An activity moves from a
person to an agent on the strength of what it leaves behind, not on the
strength of a promise about the agent. At `autonomous` there is nobody
in the loop and the record is the only check there is. A phase whose
records are thin cannot honestly be moved past `assisted`, whatever the
agent is capable of.

### 13.1. The document says what a run leaves behind

The document MUST say what a run leaves behind, and it says it in three
ways at once:

- Each phase's level fixes the shape of that phase's record
  (Section 13.3). A document that names a level for every phase has
  named a record for every phase.
- Each role's abstract agent carries a `records:` line of its own,
  saying what a run can expect that agent to leave. Quoted from
  `media-buyer v1`: "Every campaign configuration at a version, every
  budget move with the number, the direction, and the reason, and the
  stop record when the buy comes off."
- Individual phases say so outright where the record is the point of
  the phase. Quoted from `ref/mkt/display-retargeting`:

```
  record-in-force   - human: the pools, the caps, the membership
                      windows and the exclusions written down at a
                      version
```

A document MAY additionally carry a `records:` block of its own, in the
same form an abstract agent uses (Section 13.7). A document that has
records nobody would predict from the levels SHOULD write them out.

A run MUST leave what its document names. This is the obligation the
rest of the section rests on. A run that produced the work and not the
records produced something nobody can check, and for an auditor a year
later it is indistinguishable from a run that never happened.

### 13.2. The run record

A run opens with a record naming the process, the version it ran under,
when it started, who started it, and the record that fired it:

```
RUN: mkt/social-campaign v4 · run 47
started: <date> by <who>
trigger: <the record that fired it>
```

The version in that record MUST NOT change afterwards, even when the
process is amended. An auditor reads a run's records against the
version that was effective at the time, not against today's page. A run
record that follows the document forward destroys the only evidence of
what the run was actually held to.

### 13.3. What each phase leaves

Each phase leaves the record its own level produces:

| The phase | What it leaves |
|---|---|
| `runs <work pattern>` | the sub-job's plan and its `JOB DONE` |
| `convenes <collab pattern>` | that pattern's `CONVENED` and `DONE` records |
| `system: <action>` | one line: what happened, when, and what did it |
| `human: <action>` | one line: what happened, when, and who did it |

A phase whose records are not written is not complete. A runtime MUST
NOT mark such a phase complete, MUST NOT treat it as satisfying an
`after:` edge, and MUST NOT treat a handoff out of it as existing
(Section 8.4).

The one-line records matter more than they look. Most real processes
have steps where nobody collaborates with anybody, and a format that
records only the rooms leaves the majority of a run unwitnessed.

### 13.4. Run-scoped records

Run-scoped lines leave records too, at their cadence or as their events
fire. A run is not complete until each of them has closed (Section
9.3). A weekly report that stopped being written in week three is how a
reader finds out that nobody was watching from week three on, and that
is worth knowing.

### 13.5. The close

A run closes with:

```
RUN DONE: mkt/social-campaign v4 · run 47
outcome: <completed | abandoned>
result: <what exists now that did not before>
open: <what nobody finished, and who may close it>
```

`abandoned` is a legitimate outcome and MUST be recorded as one. A run
that stopped and was never closed is not an abandoned run; it is an
open run that nobody is running, and the difference is visible only in
this record. The `open:` line names what was left and who may close it,
so that the next person to touch the work starts from what is there.

### 13.6. A record names its source and its versions

A record MUST name its source and the version of anything it was
computed against. A number with no source is an assertion. A figure
read against a rule, a list, a price book or a set of guidelines is
only defensible against the version that was read, and the version is
the part that is impossible to recover later.

In practice this means a record names the data bindings it read at
their versions (Section 10.4), the process version it ran under
(Section 13.2), and, where the record is a reading of something, the
settings it was read against. Quoted from `ref/mkt/display-retargeting`:
"the delivered figures beside the settings they were read against".

A runtime MUST NOT write a record that names a version it did not
actually read. Recording today's version because it is the one to hand
is worse than recording no version, because it converts an unknown into
a wrong answer that reads as an authoritative one.

### 13.7. Record keys

A document MAY give each record a stable key, for the same reason a
handoff MAY have one (Section 8.6): a runtime storing records and a
translator rendering them both need a field name, and a sentence cannot
be one. A key is lowercase, hyphen-separated, and unique within the
document, sharing one namespace with the handoff keys:

```
  records:
    concession-record - every closed ask with the answer, the reason,
                        the date and the person on each side who agreed
```

A key is stable across amendments. An author who rewrites what a record
contains keeps the key; an author who means a different record uses a
different key. A key that changes meaning between versions is worse
than no key, because everything that cited it is now quietly citing
something else.

## 14. Failure edges

A run does not always go the way the graph hoped. A phase misses its
deadline. A gate comes back refused. The trigger fires while a run is
already in flight. Somebody stops the run halfway through. None of those
is visible from inside a single phase, which is why a document states
them separately.

A process document SHOULD state its failure edges. They are not a key in
the document. They are prose stated alongside it, one entry per
condition, saying what went wrong, what happens next, and where the run
picks up. The corpus writes each as a bolded condition followed by the
answer:

> **A sign-off comes back with changes.** The run returns to
> produce-posts, and only the piece the signers named reopens.

Apart from that SHOULD and the one in section 14.2, nothing in this
section is normative. That is a decision rather than an omission, and
the rest of the section explains it.

### 14.1 Why they are prose

The quoted edge carries three different things at once. "The run returns
to produce-posts" is an edge, and a machine could hold it. "Only the
piece the signers named reopens" is a rule about scope, and an edge has
nowhere to put it. That a sign-off comes back with changes at all is a
judgment about this particular work, made by the person who wrote the
process down.

Making failure edges machine-readable means fixing a closed set of
conditions and a closed set of responses. The conditions are not closed.
Each document's edges are about its own work: "The buyer's real decider
was never in the room", "The paper does not say what the room agreed",
"The model drifts". A vocabulary wide enough to hold all three says
nothing about any of them. The part that survives such a translation is
the part that mattered least, and what is left reads as complete, which
is worse than prose that admits it is prose.

So the specification takes the other side. Failure edges stay readable
by the person who has to act on one at two in the morning. A runtime
that needs an edge in a form it can act on takes it from the graph and
the automation level, not from here.

### 14.2 Abandonment

One condition SHOULD always be covered: a run that is abandoned partway
through.

By the time a run stops, some phases have already changed the world.
Access was granted. Money was paid. A post is public. A concession was
approved and can be reused on another deal. A document SHOULD name what
has to be undone and who does it:

> **A run is abandoned.** The offer is withdrawn or marked stale in the
> quoting system, the approvals given for concessions are cancelled so
> they cannot be reused on another deal, the buyer is told the
> negotiation has stopped and who to speak to, and the deal goes to the
> lost deal process with the reason it stopped.

"It does not happen" is a legitimate answer, as long as it is stated
rather than left out:

> **A run is abandoned.** It never is; a run costs seconds. A submission
> that fails midway restarts from capture, because every phase is safe
> to repeat.

A process that cannot be abandoned safely SHOULD say so. This is the one
failure edge whose absence is a real gap. Most other conditions a reader
can work out from the graph. What a half-finished run has already
changed is knowable only to whoever wrote the process down, and the
person who needs it is under time pressure when they need it.

The run's closing record carries `outcome: <completed | abandoned>`, so
a run can record that it stopped. The record says that it happened. The
failure edge says what it costs.

---

## 15. The reference profile

A **reference process** is a process document published to be adopted
rather than run. Its shape is filled in and its specifics are blank. It
stands to a process the way a work pattern stands to a work plan: the
walk through the work is done, and the parts that belong to an
organization are left for that organization to supply.

A reference process MUST satisfy everything sections 3 to 14 require of
a process document, plus the obligations in this section. The
obligations here are of two kinds, and both are checkable by a reader
who knows nothing about the work: things that MUST be present, and
things that MUST be absent.

### 15.1 Identity

A reference process MUST carry an id of the form `ref/<domain>/<slug>`,
lowercase, no spaces, and MUST carry a version:

    ref/sls/negotiate-the-agreement v1

The document block a reference process publishes is written as the
adopted document will read, not as the reference reads. Its `id:` leaves
the team blank and keeps the slug, and its `from:` line already names
the reference process and the version being adopted:

    PROCESS: negotiate the agreement   id: <team>/negotiate-the-agreement   v1
    from: ref/sls/negotiate-the-agreement v1
    owner: <who>                          effective: <date>

Adopting is then what section 15.6 says it is: filling in the blanks.

### 15.2 What MUST be absent

A reference process MUST NOT carry a named owner. `owner:` MUST be a
blank.

A reference process MUST NOT carry an effective date. `effective:` MUST
be a blank.

A reference process MUST NOT bind a role to a named agent or a named
person. The roster MUST be a blank. The roles themselves are named; who
holds them is not.

A reference process MUST NOT carry a chosen number. Every cap,
threshold, deadline, cadence and target MUST appear as a blank:
`by: <days>`, `every: <cadence>`, `cycle time: <target>`,
`the pricing model (read, cap: <n> discount)`,
`a discount past <threshold> needs <who> to sign before it is offered`.

A reference process's policy lines carry the generic rule and leave the
specifics blank. "Nothing publishes unsigned" is a rule the shape of the
work produces. Which regulator, which contract and which brand standard
apply is the adopter's, and appears as a blank.

A reference process MUST NOT carry run records and MUST NOT cite a run.

The absences are what make the profile enforceable. An owner, a date or
a number in a reference process is a defect a reader can find in
seconds, without knowing anything about the work being described.

### 15.3 What MUST be present

**The walk.** A reference process MUST state its activities, each with a
name, a plain description of what happens, and the roles involved. This
is the part that took the work, and inheriting it instead of starting
from a blank page is the whole reason to adopt one.

**The graph.** A reference process MUST state the order of its
activities as `after:` lines (section 6), including the branches.

**The roles.** A reference process MUST distinguish a role an agent may
hold from a role only a person holds. Each role an agent may hold MUST
name an **abstract agent**, a job description an implementation can
claim, whose format this specification does not define. The corpus marks
a person's role by writing `(person)` after it, as in
`deal owner (person)` and `sales leader (person)`, and cites an abstract
agent by link on first mention. A publisher SHOULD follow that.

**The handoffs.** A reference process MUST state what crosses each edge
and what it has to contain (section 9). Handoffs come with the shape of
the work rather than with the organization, so they are filled in, not
blank.

**The records.** A reference process MUST state the records a run
leaves (section 13).

**The failure edges.** A reference process MUST state its failure edges
(section 14). Section 14 makes this a SHOULD for a process document
generally; for the reference profile it is a MUST, because the failure
edges are the part an adopter is least able to reconstruct and most
likely to need.

### 15.4 Blanks

A **blank** is an angle-bracket placeholder marking a decision the
reference process deliberately refuses to make.

An author MUST NOT use a blank for something the reference process does
know. A blank is not a gap in the writing and not a note to finish
later. It is the point where the reference stops on purpose, because
what goes there is a decision only the adopting organization can make. A
plausible default in that position is worse than nothing, because it
gets adopted unread and then it is policy.

An author SHOULD shape a blank so that it says what kind of decision it
holds. `<your sales leadership role>` says more than `<who>`, and
`<your price book> <version>` says more than `<data>`.

### 15.5 It is not running anywhere

A reference process MUST NOT claim to be in force. It has no owner, no
effective date, no runs and no records, and a publisher MUST NOT list
one as running. The reason is not tidiness. A catalog that listed
reference processes as `running` would be one people stop believing, and
a catalog nobody believes is worth less than no catalog.

A reference process is also not a best practice, and SHOULD NOT be
published as one. It is a first draft to argue with. Its value is that
the argument starts from a complete picture instead of a blank page.

### 15.6 Adoption

Adopting a reference process produces a **new document**: the adopter's
own, at version 1, with their id and their name on it.

An adopted document MUST carry a `from:` line naming the reference
process and the version adopted:

    PROCESS: social campaign              id: acme-mkt/social-campaign   v1
    from: ref/mkt/social-campaign v1

An adopted document MUST name an owner and an effective date. The
reference profile is the one place those are blank, and a document that
still shows `owner: <who>` has not been adopted; it has been copied.

The `from:` line is provenance rather than dependency. Once adopted, the
document is the adopter's. They amend it from their own debriefs
(section 18), and the reference process never reaches into it. A new
version of the reference process obliges an adopter to do nothing.

Where an adopter's amendment teaches the reference process something
every adopter needs, it MAY flow back as a new version of the reference
process, the same way a plan that keeps being copied becomes a work
pattern.

---

## 16. Translation

A **translation** is what you get when a process document is rendered
into the format some runtime actually executes. This section says what a
translator owes its reader. It names no target platform, because the
obligations are the same for all of them.

### 16.1 A translation is a draft

A translation is a draft. The process document remains the normative
artifact (section 3).

A translator MUST NOT present a translation as equivalent to the
document it came from, and MUST NOT present it as an output that can be
run without being read. The distinction that matters is between a build
artifact, which you regenerate and do not inspect, and a draft, which
somebody has to sit down with. A translation is the second thing.

Editing a translation does not amend the process. An organization that
changes how the work is done amends the document and translates again
(section 18).

### 16.2 Fidelity

A translator MUST NOT claim fidelity it does not have.

A translator SHOULD report, per target, what came across and what did
not. The report is the deliverable that makes the translation usable,
because the reader's real question is not "did it convert" but "what am
I now missing".

The parts that usually do not come across are worth naming, because a
translator that reports nothing is usually a translator that lost these:

- **`automation: never`.** Most runtimes can express that a step is
  currently assigned to a person. Few can express that it must stay with
  one permanently. A translator that maps `never` onto an ordinary
  approval task has quietly offered to automate the step later, which is
  the one thing the level exists to prevent.
- **The failure edges.** They are prose (section 14), and prose is
  exactly what a runtime format has no slot for.
- **The policy lines.** They are rules a run is held to rather than
  steps a run performs, and most formats only have steps.
- **The reason a handoff contains what it contains.** The contents may
  survive as a schema. Why they are required does not.
- **The measures.** A runtime that reports its own cycle time is not
  reporting the same thing the document asked to be measured.

### 16.3 Blanks

A translator MUST NOT substitute a value for a blank. Where the target
format requires a value in that position, the translator MUST report the
blank rather than invent one.

This is the strictest rule in the section, and it earns that. A blank is
a decision the document refuses to make (section 15.4). A translator
that picks a number for `<threshold>` has made that decision on behalf
of an organization that never saw the question, and the number then
propagates into a running system with nobody's name on it.

### 16.4 Provenance

An emitted artifact SHOULD carry the same provenance a `from:` line
carries: the id and version of the document it was translated from, and,
where that document is itself an adoption, the reference process and
version behind it.

An artifact that cannot say which version it came from cannot be checked
against the document later, which puts it outside everything section 18
makes possible.

### 16.5 Loss is expected

A translation that loses something is behaving as expected. It is not a
defect to be fixed by widening the target format until nothing is lost,
and a translator SHOULD NOT be judged on how little it drops.

A reference process is already a first draft to argue with (section
15.5). A translation is the second draft, in a form the argument can be
run against. Both are supposed to be read and pushed back on. What makes
a lossy translation dangerous is not the loss but the silence about it,
which is why section 16.2 puts the obligation on reporting rather than
on completeness.

---

## 17. Conformance

Conformance is a claim about a document. Nobody issues it. This
specification names no authority, no registry, no badge and no test
suite that grants it. A publisher claims a document conforms and a
reader checks the claim, which is possible only because every obligation
here is readable from the document itself.

### 17.1 A conforming process document

A conforming process document:

- carries `PROCESS:`, `id:`, `trigger:`, `goal:`, `phases:` and
  `handoffs:` (section 3);
- carries a version alongside its id;
- names every phase in its phase list;
- states both endpoints of every handoff as phases declared in the same
  document;
- satisfies every MUST in sections 4 to 13.

The handoff check is the one a second implementer gets wrong, because a
handoff is not always a graph edge. A document may state a handoff for a
return path the `after:` lines do not carry, as
`escalate-deadlock -> hold-session` does. That is allowed. Both ends
still have to be phases the document declares, or the handoff points at
nothing.

A document that fails one of those is not conformant. A document that is
merely thin is conformant: four phases, no run-scoped lines and three
policy rules conform exactly as much as twenty phases do.

### 17.2 A conforming reference process

A conforming reference process is a conforming process document that
additionally:

- carries an id of the form `ref/<domain>/<slug>` and a version;
- states the walk, the graph, the roles with the agent and person split,
  the handoffs, the records and the failure edges (section 15.3);
- carries a `from:` line in its published block naming itself and its
  version (section 15.1);

and that additionally **lacks**:

- a named owner;
- an effective date;
- a bound roster;
- any chosen number;
- any run record.

A reference process that gained an owner did not become a better
reference process. It became somebody's process, and it should say so
with its own id, a version 1 and a `from:` line (section 15.6).

### 17.3 A conforming runtime

A runtime is whatever carries out a run: a workflow engine, an agent, a
person with the document open, or any combination (section 2). It
conforms by what it does with four sets of obligations.

**The graph (section 6).** A runtime MUST NOT begin a phase before every
phase its `after:` line names has closed. A runtime MUST allow phases
with no path between them to be in flight at the same time. Order comes
from the `after:` lines and never from the order the phases are listed
in, and a runtime that walks the list top to bottom is not running the
process the document describes.

**Automation (section 7).** A runtime MUST run each phase at the level
the document states, and MUST NOT run a phase at a higher level than it
states. At `manual` and `assisted` a runtime MUST NOT let an agent take
the action the phase describes; an agent may draft and gather, and the
person decides and acts. At `supervised` a runtime MUST NOT pass a
phase's output on to the next phase until a person has approved it. At
`never` a runtime MUST NOT complete the phase without the person who
owns it, whatever the agents are capable of by then. Raising a phase's
level is an amendment to the document (section 18), not a decision a
runtime makes at run time.

**Run-scoped lines (section 9).** A runtime MUST keep each run-scoped
line live from its `from:` until its `until:`, and MUST NOT close a run
before every run-scoped line has closed. Most of a process's management
lives in those lines. A run whose status reporting stops when the last
phase finishes has skipped the part where somebody was watching.

**Records (section 13).** A runtime MUST leave the records section 13
requires, and MUST record the version of the document the run ran under.
A runtime MUST NOT alter a record afterwards, including when the
document changes (section 18).

Nothing in this specification enforces a run. A process is not
enforceable, and nothing holds a run to the graph except the records it
leaves and the fact that somebody reads them. That is why the records
are the obligations a runtime cannot route around: they are the only
place its conformance is visible.

### 17.4 What conformance is not

Conformance is not a certification, and no part of this specification
issues one.

Conformance is also not a claim that the process is any good. A document
can conform and describe the work badly, name the wrong roles, and set
measures nobody reads. Conformance says that a reader and a runtime will
take the same meaning from it. Whether the meaning is worth having is
what debriefs and amendments are for.

---

## 18. Versioning and amendments

### 18.1 Every document carries a version

A published document MUST carry a version alongside its id, written
`v<n>`, where n is an integer that increases:

    id: acme-mkt/social-campaign   v1

### 18.2 A change is a new version

A change to a published document that changes what a run must do MUST
produce a new version. It MUST NOT be made as an edit in place.

A cosmetic change MAY be made in place with no version. Fixing a typo,
correcting a link, or rewording a description without changing what it
asks for are cosmetic.

The line between the two is whether a run would go differently. Moving a
phase from `supervised` to `autonomous` is a new version. So is adding a
phase, adding a policy rule, changing a deadline, and changing what a
handoff has to contain. Rewriting a sentence so it reads better is not.

### 18.3 What a version bump obliges, and what it does not

A document above version 1 SHOULD record its amendments: for each
version, what changed and what produced it, a debrief, a failed run or a
policy change.

    amendments:
      v<n> - <what changed, and which debrief or run produced it>

Recording where a change came from is what keeps the document honest
about its own history. Without it, amendments come from whoever
complained most recently, and nobody can tell afterwards which changes
were paid for by experience.

A version bump obliges a runtime starting a new run to run the new
version.

A version bump obliges nothing of a run that has already closed. A run
records the version it ran under, and that record does not change
afterwards even when the process does. A closed run is read against the
version it recorded, never against the current page. That is what makes
an audit possible a year later, and it is the reason section 17.3 says a
runtime MUST NOT alter a record.

A version bump also obliges nothing of anyone who adopted the document.
Nothing propagates. See section 18.4.

### 18.4 Versions and adoption

An adopted document carries `from: <reference id> v<n>` (section 15.6).
The version in that line MUST be the version that was adopted. An
adopter MUST NOT change the `from:` line to name a version they did not
take.

That pair, the version in the `from:` line and the reference process's
current version, is what makes drift detectable. When the reference is
at v3 and an adopted document still reads
`from: ref/mkt/social-campaign v1`, the gap is two versions of somebody
else's thinking, and it is visible without reading either document. This
is the only thing the `from:` line is for, and it is the reason the line
carries a version rather than just an id.

Taking a later version of a reference process is not a version bump on
the reference. It is an amendment to the adopter's own document and
takes the adopter's next version number. An adopter MAY take some of a
new reference version's changes and not others, because the document is
theirs.

A new version of a reference process changes no adopted document.
