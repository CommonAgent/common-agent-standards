# Conformance fixtures

Section 14 of the specification says how conformance is checked. The floor, the
Descriptor, the AgentDoc, a package and a repository are each checked by a
program that the chapter defining them describes. The byte-exact obligations are
pinned by fixtures, and this folder holds the fixtures whose authority is this
specification.

A fixture is a file of test cases that an implementation must agree with. When an
implementation disagrees with a fixture, the implementation is what changes, and
a fixture changes only together with a change to the specification. Every case
can be checked without a network or a clock, and each fixture holds cases that
must be accepted beside cases that must be refused.

| Fixture | What it pins | Sections |
|---------|--------------|----------|
| [trial.json](trial.json) | Which trial declarations a registry refuses, the order of admission and its first-failure answer, the fields of a `TRIAL_REFUSED` refusal, what a node measures at admission, and that only admitted trials are counted. | 7.7, with 7.5 and 4.7 |

The cases in `trial.json` are the same as those in the copy the Agent Messaging
Server repository carries.

A binding pins the byte-level constants this specification leaves symbolic, such
as fence text and freshness windows, in its own fixtures. The fixtures for Agent
Messaging are in <https://github.com/agent-messaging/agent-messaging>.
