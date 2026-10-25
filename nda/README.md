# Agent NDA

An Agent NDA is a signed non-disclosure agreement between parties whose agents work together. It is usually the first agreement they sign. It records what is confidential, what it may be used for, who may receive it and for how long, and the documents the parties sign later refer to it.

Agent NDA is a Common Agent Standard, kept in the [Common Agent Standards repository](https://github.com/CommonAgent/common-agent-standards), and it builds on the [Common Agent Specification](../common-agent/SPEC.md). It adopts the enforcement gradient of [Agent SoW](../sow/SPEC.md). [Agent RFP](../rfp/SPEC.md), [Agent SoW](../sow/SPEC.md) and [Agent Processes](../processes/SPEC.md) refer to it, and [Agent Mandate](../mandate/SPEC.md) says who may sign one for an organization.

## What is here

- [SPEC.md](SPEC.md): the specification, version 0.3.0-draft, status Working Draft.
- [conformance/](conformance/): the test fixtures for the grade of every clause, the closed lists, multilateral agreements, flow-down to subcontractors, the lifecycle states, and the identifier and digests of an open offer and its acceptance, which software that reads or writes an Agent NDA checks itself against.
- [CHANGELOG.md](CHANGELOG.md): the versions tagged in this repository.

## Versions

Each version is tagged as `nda-v` followed by the version, such as
`nda-v0.1.0-draft`, and has a release on GitHub. The site of the standard is
<https://agentnda.net/>.

## Licence

The specification text is licensed under CC BY 4.0 ([LICENSE-SPEC](../LICENSE-SPEC)),
and code under Apache-2.0 ([LICENSE](../LICENSE)). AgentMesh sponsors the
Common Agent Standards.
