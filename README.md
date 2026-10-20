# The Common Agent Standards

The Common Agent Standards are open specifications for agents that work for
people and organizations. The Common Agent Specification is the base of the
Common Agent Standards that every other standard builds on. It defines what an
agent is, in terms anyone can check. Each other standard is a Common Agent
Standard and covers one part of the work agents do together: reaching each
other, naming, delegated authority, the documents two parties exchange to
agree on work and to record how it went, the jobs agents hold, and how a piece
of work runs.

AgentMesh sponsors the suite. Nothing in any of the standards requires a
particular network or vendor, and any party can implement them.

The suite's home is <https://commonagent.net>.

## The standards

| Standard | Kind | Version | Status | Site |
|----------|------|---------|--------|------|
| [The Common Agent Specification](common-agent/) | The base | 0.28.4-draft | Working Draft | [commonagent.net](https://commonagent.net/spec.html) |
| [Agent Messaging](messaging/) | A Common Agent Standard | 0.9.4-draft | Working Draft | [agentmessaging.ai](https://agentmessaging.ai/) |
| [Personal Agent Naming](naming/) | A Common Agent Standard | 0.10.3 | Published | [agentnaming.ai](https://agentnaming.ai/) |
| [Agent Mandate](mandate/) | A Common Agent Standard | 0.8.0-draft | Working Draft | [agentmandate.net](https://agentmandate.net/) |
| [Agent RFP](rfp/) | A Common Agent Standard | 0.10.0-draft | Working Draft | [agentrfp.net](https://agentrfp.net/) |
| [Agent SoW](sow/) | A Common Agent Standard | 0.32.0-draft | Working Draft | [agentsow.com](https://agentsow.com/) |
| [Agent NDA](nda/) | A Common Agent Standard | 0.2.0-draft | Working Draft | [agentnda.net](https://agentnda.net/) |
| [Agent Reputations](reputations/) | A Common Agent Standard | 0.11.0-draft | Draft | [agentreputations.com](https://agentreputations.com/) |
| [Agent Processes](processes/) | A Common Agent Standard | 0.7.0-draft | Working Draft | [agentprocesses.ai](https://agentprocesses.ai/) |
| [Agent Collab](guides/collab/) | A guide | v1.1 | Guide | [agentcollab.dev](https://agentcollab.dev/) |
| [Agent Roles](roles/) | A guide | v1 | Guide | [agentroles.ai](https://agentroles.ai/) |

Agent Messaging's extensions are in [messaging/extensions/](messaging/extensions/),
and its bindings, the A2A Bridge and the RabbitMQ binding, are in
[messaging/bindings/](messaging/bindings/). Agent Collab is a library of
playbooks and is kept under [guides/](guides/) as a guide. Agent Roles is a guide
of working descriptions of recurring jobs, kept in [roles/](roles/).

## Profiles

A profile names a part of several standards that an implementation can build
first. [The minimal contracting profile](profiles/MINIMAL-CONTRACTING.md) is the
smallest part of Agent Mandate, Agent SoW and Agent Messaging that lets one
organization's agent contract another's for services work, within a delegated
budget, with a receipt both sides can check. Its list for tooling is
[profiles/minimal-contracting.json](profiles/minimal-contracting.json), and it is
published at <https://commonagent.net/minimal-contracting.html>.

## How the repository is laid out

- One folder per standard, holding its specification (`SPEC.md`, or the
  documents that make it up), its `CHANGELOG.md`, and its `conformance/`
  fixtures where it has them. A standard whose site is rendered from its
  specification also has a `site/` folder with the pages and the tools that
  render them.
- [standards.json](standards.json): the registry of the suite. It lists every
  standard with its folder, domain, version and status, and the front page of
  commonagent.net is made from it by [site/tools/build-home.mjs](site/tools/build-home.mjs).
- [profiles/](profiles/): the profiles, each a document and a list that
  tooling reads.
- [tools/](tools/): the checks the workflow runs on every change, and the
  script that renders a standard's site.
- [.github/workflows/standards.yml](.github/workflows/standards.yml): checks the
  links in every folder, checks the registry against the specifications,
  renders each site that has a builder, and holds the steps that publish them.

## Versions and tags

A standard's version is the version line of its specification. Each version is
tagged with the standard's id and the version, such as
`common-agent-v0.26.0-draft` or `messaging-v0.9.0-draft`, and has a release on
GitHub. A draft version is released as a prerelease. The text in a standard's
folder at its tag is the text of that version.

## Licences

The text of every specification, changelog and guide is licensed under
[CC BY 4.0](LICENSE-SPEC). Code, including the conformance runners and
fixtures and the site tools, is licensed under [Apache-2.0](LICENSE).

## Taking part

[GOVERNANCE.md](GOVERNANCE.md) says how a change is proposed and decided, and
[CONTRIBUTING.md](CONTRIBUTING.md) says how to make one.
