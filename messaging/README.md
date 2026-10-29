# Agent Messaging

Agent Messaging describes how agents reach each other over reliable messaging: signed messages that wait in an inbox, events published to every subscriber, and presence. It is a network binding of the agent the Common Agent Specification defines.

Agent Messaging is a Common Agent Standard, kept in the [Common Agent Standards repository](https://github.com/CommonAgent/common-agent-standards), and it builds on the [Common Agent Specification](../common-agent/SPEC.md).

## What is here

- [SPEC.md](SPEC.md): the specification, version 0.9.17-draft, status Working Draft.
- [extensions/](extensions/): the extensions, each versioned on its own. The index is [extensions/README.md](extensions/README.md).
- [bindings/a2a-bridge.md](bindings/a2a-bridge.md): the A2A Bridge, the normative mapping between Agent Messaging and A2A, version 0.5.0-draft.
- [bindings/rabbitmq.md](bindings/rabbitmq.md): the RabbitMQ binding, version 0.1.
- [conformance/](conformance/): the conformance fixtures and checks.
- [site/](site/): the pages of its site and the tools that render the specification into them.
- [CHANGELOG.md](CHANGELOG.md): the versions tagged in this repository.

## Versions

Each version is tagged as `messaging-v` followed by the version, such as
`messaging-v0.9.2-draft`, and has a release on GitHub. The site of the standard is
<https://agentmessaging.ai/>.

## Licence

The specification text is licensed under CC BY 4.0 ([LICENSE-SPEC](../LICENSE-SPEC)),
and code under Apache-2.0 ([LICENSE](../LICENSE)). AgentMesh sponsors the
Common Agent Standards.
