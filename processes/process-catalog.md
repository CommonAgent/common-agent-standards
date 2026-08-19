# The process catalog

A catalog is the index of every process a team owns. One row per process,
and every field in the row comes from that process document's header.

A department that writes down one process has a document. A department
that writes down forty has a problem: nobody can hold forty documents in
their head, nobody knows which ones matter most, and nobody notices when
one of them stops being true. The catalog is what makes forty documents
usable.

## What it is for

- **Knowing what exists.** A process nobody wrote down is invisible, and
  work that is invisible cannot be automated, audited, or handed over.
- **Knowing who owns each one.** Every row has a person's name in it.
- **Knowing what depends on what.** The `feeds` and `fed by` lines across
  forty processes form a graph, and that graph is how you decide what to
  automate first.
- **Sequencing an automation program.** Which processes are worth agent
  time, in what order, and which parts of them will never be automated.
- **Answering an auditor.** "Show me your processes" is one document, and
  "show me that one ran" is the run records behind a single row.

## The row

| Field | From | What it is |
|---|---|---|
| id | header | `<team>/<slug>`, stable forever |
| name | header | what people call it |
| owner | header | who owns the document |
| trigger | header | what starts a run |
| cadence | measures | how often it runs, roughly |
| automation | phases | the lowest level any required phase sits at |
| fed by | header | the process ids it consumes |
| feeds | header | the process ids that consume it |
| status | header | documented, running, or retired |
| version | header | the version in effect, and its date |

Every field is derived from the process document. The catalog is a
projection, never a second source of truth: when the two disagree, the
process document is right and the row is stale. Nobody should be
maintaining the same fact in two places.

The **automation** column deserves care. A process is only as automated
as its least automated required phase, so a process with four autonomous
phases and one `never` phase is not an autonomous process. Report the
floor, not the average, or the catalog will flatter you.

## Ids and naming

Ids look like `mkt/social-campaign`: a team prefix, a slug, lowercase, no
spaces. References between processes cite the id and never the name.

- **Renaming** a process changes the name column and nothing else. The id
  stays, and every reference keeps working.
- **Splitting** one process into two retires the original id and creates
  two new ones. The retired row stays in the catalog with its successors
  named, because run records from before the split still cite it.
- **Merging** works the same way in reverse.
- **Retiring** a process keeps the row, marks it retired, and dates it.
  Deleting the row orphans every run record that cites it.

## The dependency view

Read `feeds` and `fed by` across the whole catalog and you get a graph of
the department. Three things fall out of it immediately:

- **Load-bearing processes.** The ones many others depend on. These are
  where automation pays off most and where a bad run does the most
  damage, so they get automated first and watched hardest.
- **Orphans.** Processes that feed nothing and are fed by nothing. Some
  are genuinely standalone. The rest are candidates for retirement, and
  asking the question is usually productive.
- **Cycles.** Two processes that feed each other are either one process
  with a loop, or two processes with a queue between them. Both are fine.
  Not knowing which is not.

## Building one

Start from triggers, not from the org chart. A process exists wherever
there is something that starts work and somebody who owns the result. An
org chart tells you who reports to whom, which is a different question
and has misled every process-mapping exercise that started there.

**Is this one process or two?** If the two halves have different
triggers, or different owners, they are two. If a phase in the middle
always waits days for a different team, that seam is usually a process
boundary with a handoff across it.

**How much detail?** Enough that a competent newcomer could run it, and
no more. A process that lists every keystroke is describing a system, not
a process, and it will be wrong within a month.

Expect the first pass to be wrong. Ten to forty processes per department
is normal, and the first attempt usually finds twelve, of which two turn
out to be the same process and three turn out to be phases of a larger
one.

## Choosing what to automate

Rank by volume times cycle time times how many processes depend on it.
Then subtract the phases marked `never`, because those are not going
anywhere.

A process that is mostly `never` phases is not an automation candidate
however often it runs. A low-volume process that six others wait on may
be a better candidate than a high-volume one that nothing depends on.

Move one phase at a time, and move it one rung: `manual` to `assisted`,
`assisted` to `supervised`, `supervised` to `autonomous`. Each move is an
amendment with a version and a date, so a year later you can see when
each phase changed hands and what the runs looked like on either side of
the change.

## Coverage and upkeep

A catalog decays unless three rules are held:

- **What is not in the catalog does not exist.** Work that happens
  outside it cannot be automated, measured, or handed over when somebody
  leaves. Finding uncatalogued work is the point of the exercise, not an
  embarrassment.
- **A process with no owner is a finding, not a row.** Either somebody
  takes it or it is retired. A row with an empty owner is a promise
  nobody made.
- **A process that has not run in a year is retired, not documented.**
  Keeping dead processes in the catalog is how a catalog stops being
  read.

Review the catalog on a schedule, and make that review a process in the
catalog like any other.

## What a catalog is not

- Not a system inventory. Systems appear in a process's bindings, and
  the same system appears in many processes.
- Not an org chart. One team owns many processes and one process crosses
  many teams.
- Not a capability model. It says what this department does and how, not
  what it is capable of in principle.

## A worked example

[examples/marketing-catalog.md](./examples/marketing-catalog.md) is a
marketing department's catalog, with the dependency graph drawn out and
one of its rows written up in full as
[examples/social-campaign.md](./examples/social-campaign.md).
