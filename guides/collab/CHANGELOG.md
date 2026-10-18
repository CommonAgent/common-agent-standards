# Changelog

Versions of Agent Collab tagged in this repository, newest first. A version is
tagged as `collab-v` followed by the version, and the text in this folder at
that tag is the text of that version. Its history comes from jeffrschneider/agentcollab.

## v1.1 (2026-10-18)

- The guide states what every pattern needs from its medium: a shared
  record, ordered, that everyone in the cast can read and post to, and that
  keeps the `CONVENED` and `DONE` records. A room is the default medium,
  and a message thread or a document's version history also qualifies
  (README.md and convening.md).
- The library table marks each pattern live or asynchronous. Briefing, roll
  call and debrief are live and run in a room. Critique circle, bake-off,
  assessment, approval, draft-review-merge, owner-contributors, rolling
  synthesis, relay, layered passes, spec-then-build and work board are
  asynchronous and run in any shared record.
- Wording that assumed a room where the pattern does not need one now says
  "the shared record", in convening.md, membership.md and the asynchronous
  playbooks. The `room:` line of `CONVENED` and `DONE` keeps its name and
  now names the shared record whatever its medium. No role, round, message
  shape or end condition changes, so every playbook stays at v1.
- The README names the transports and naming neutrally, and the example
  brief in bake-off and the lookup step in convening spell out Personal
  Agent Naming.

## v1 (2026-08-19)

The first version tagged in the Common Agent Standards repository, as
`collab-v1`. Every playbook carries its own version, v1 for each one here, and says whether it has been verified in a live run.
