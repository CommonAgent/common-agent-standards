# Changelog

Versions of Agent Processes tagged in this repository, newest first. A version is
tagged as `processes-v` followed by the version, and the text in this folder at
that tag is the text of that version. Its history comes from jeffrschneider/agentprocesses.

## 0.7.0-draft (2026-10-19)

- A run MAY close with a signed close (§13.5.1): one attestation, made by
  the process owner in the record convention of the Common Agent
  Specification §8.1 under the tag `agent-process-close-v1`, that names
  every record the run left by the SHA-256 of its exact bytes, from `RUN`
  through `RUN DONE`. A reader who holds the records can check that they are
  the records the owner closed the run on, with none added, changed or
  dropped. A runtime that writes one lists every record in it and writes no
  record for the run after it (§17.3). The signed close is `evidence` of what
  the records were, and not of whether they are true.
- The reference process `ref/gm/offboard-an-agent` closes with a signed
  close, so the run's own records are the signed proof of exit. Its
  `sign-exit` gate stays for an organization that wants named people to
  countersign, and is marked as a phase that does not run in every run.
- The minor version moves because the signed close adds obligations for a
  runtime that writes one.

## 0.6.1-draft (2026-10-19)

- Editorial. The site gains a Reference processes section with two
  reference processes, `ref/gm/onboard-an-agent` and
  `ref/gm/offboard-an-agent`, kept in `processes/reference/`. They bring
  an agent of another owner into an organization's work and take it out
  again, using acts the Common Agent Standards already define. No rule in
  this specification changes.

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
- The process owner MUST be a party to the named agreement, as the
  discloser of the open offer or as a member, and a runtime that
  implements the key does not start a run when it is not (Section 4).
- A phase that runs another process passes the agreement on to the
  inner run. An inner document with no `confidential-under:` of its own
  is held to the outer agreement. An inner document that names its own
  is held to both, so it can add an agreement and cannot drop the outer
  one. A firing that joins an inner run already in flight is checked
  against the outer agreement first (Sections 4 and 6.3.1).
- An agent that a `harness:` phase contracts on its own is bound by
  flow-down only (Agent NDA §5.5), and the runtime does not check it.
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
