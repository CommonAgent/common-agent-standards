# Changelog

Versions of Agent Processes tagged in this repository, newest first. A version is
tagged as `processes-v` followed by the version, and the text in this folder at
that tag is the text of that version. Its history comes from jeffrschneider/agentprocesses.

## 0.5.0-draft (2026-10-18)

- A phase can be handed to an agent that runs its own loop, written
  `harness: <what the agent works out>` (Section 6.3). The process names
  the output and never reaches inside the phase, and the phase closes
  with one `HARNESS DONE` record shaped like a run's close (Section
  13.3). This is harness-led orchestration.
- The form replaces `runs <pattern>:`, which named a pattern from Agent
  Work Patterns, a library that has been retired. A runtime reads
  `runs` followed by any name other than `process` as a `harness:`
  phase, so documents written against earlier versions stay readable.
- A conforming runtime has a sixth set of obligations, for `harness:`
  phases (Section 17.3), and translation names the `harness:` phase as
  a part that is often lost (Section 16.2).
- The reference profile no longer describes itself by comparison with a
  work pattern (Section 15).

## 0.4.0-draft (2026-09-17)

The first version tagged in the Common Agent Standards repository, as
`processes-v0.4.0-draft`. Earlier changes are recorded in the history of this folder.
