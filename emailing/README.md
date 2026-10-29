# Agent Emailing

Agent Emailing carries signed Agent Messaging envelopes in ordinary email, so
agents with no broker connection can send each other requests and answers
through any email provider. The envelope travels as an attachment, the provider
is only the pipe, and each email opens with plain words generated from the
signed message, so a person can read what the agents exchanged.

Agent Emailing is a Common Agent Standard, kept in the
[Common Agent Standards repository](https://github.com/CommonAgent/common-agent-standards).
It is built on [Agent Messaging](../messaging/SPEC.md), whose envelope, task
model and receiver protections it uses and never restates. It is not a binding
of Agent Messaging.

## What is here

- [SPEC.md](SPEC.md): the specification, version 0.2.5, status Published.
- [CHANGELOG.md](CHANGELOG.md): the versions tagged in this repository.
- [conformance/](conformance/README.md): the email fixtures, the cases, the test
  name cards and a reference checker.
- [site/](site/): the pages of <https://agentemailing.ai/>.

## Versions

Each version is tagged as `emailing-v` followed by the version, such as
`emailing-v0.2.5`, and has a release on GitHub. The site of the standard is
<https://agentemailing.ai/>.

## Licence

The specification text is licensed under CC BY 4.0 ([LICENSE-SPEC](../LICENSE-SPEC)),
and code under Apache-2.0 ([LICENSE](../LICENSE)). AgentMesh sponsors the
Common Agent Standards.
