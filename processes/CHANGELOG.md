# Changelog

Versions of Agent Processes tagged in this repository, newest first. A version is
tagged as `processes-v` followed by the version, and the text in this folder at
that tag is the text of that version. Its history comes from jeffrschneider/agentprocesses.

## 0.6.0-draft (2026-10-18)

- A process document can name the Agent NDA every outside participant
  shares, written `confidential-under:` in the header (Section 4). The
  value is the agreement's identifier, version and digest, or the blank
  `<your agreement>` in a reference process (Section 15.2).
- Every agent of another owner that holds a phase or receives a handoff
  MUST belong to an owner bound by that agreement, as Agent NDA §8.1
  defines it. A runtime that implements the key checks before it starts
  such a phase or delivers such a handoff, refuses with the reason
  named, and records a `REFUSED:` record in the run record
  (Sections 8.4, 13.2 and 17.3).
- The check is enforced at the runtime that makes it. What each party
  does with the material afterwards stays a recorded promise under the
  agreement. A runtime that does not implement the check says so under
  Section 11.3.
- A phase's `under:` (Section 6.4.1) is unchanged, and a document can
  carry both. The section recommends a multilateral agreement when
  outside parties pass their own material to each other, and an open
  offer from the process owner when every handoff carries only the
  process owner's material.
- The key is optional and no document in the corpus carries it, so no
  document fails anything new.

## 0.5.1-draft (2026-10-18)

Editorial, with no normative change. Section 6.3 says that a `convenes`
phase runs in one shared record, which is a room by default and can be a
message thread or a document's version history, following Agent Collab
v1.1. No requirement, field, example, or section number changes.

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
