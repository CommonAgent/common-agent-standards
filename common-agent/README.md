# The Common Agent Specification

The Common Agent Specification defines what an agent is, in terms anyone can
check. An agent holds a key that signs. It answers a small set of questions for
anyone who asks, and it declares its standing facts in one signed document. It
refuses what it does not do with a typed answer, and it collects signed records
of what others have checked about it. Every clause can be checked by a program
or a signature.

It is the base of the [Common Agent Standards](../README.md), and every other
standard in the suite builds on it. AgentMesh sponsors the suite. Nothing in
the specification requires any particular network: Agent Messaging is
one network binding of the agent it defines (Section 11).

## What is here

- **[SPEC.md](SPEC.md)**: the Common Agent Specification, version 0.38.3.
  It covers the floor every agent meets (the five questions, the exchanges, the
  refusals), the work an agent does, the Agent Descriptor (Section 6), the
  capabilities, the signed records others issue, the AgentDoc (Section 9), the
  twenty attributes, the Agent Package (Section 12) and the agent
  repository (Section 13). Readable at <https://commonagent.net/spec.html>.
- **[CHANGELOG.md](CHANGELOG.md)**: every version and what it changed, newest
  first.
- **[CATALOG-PROFILE.md](CATALOG-PROFILE.md)**: the catalog profile, version
  0.1.0-draft, a part of the specification with a version of its own. It adds
  optional metadata to an ARD entry: offers derived from signed standing
  proposals, reputation and liveness pointers, evidence labels, signed
  entries, audience, publish and fetch calls, and a link to the agent's
  AgentDoc. Readable at <https://commonagent.net/catalog.html>.
- **[DESCRIPTOR-UI.md](DESCRIPTOR-UI.md)**: the Descriptor to user interface
  binding, version 0.1.0, optional for conformance. It
  says which members of a Descriptor drive which parts of a page about an
  agent, and how an agent may supply a sandboxed view of its own, with the
  page drawn from the Descriptor as the floor. Readable at
  <https://commonagent.net/descriptor-ui.html> once a version adopts it.
- **[conformance/](conformance/)**: the fixtures that pin the byte-exact
  obligations this specification owns. Section 14 says how conformance is
  checked.
- **[site/](site/)**: the pages of commonagent.net and the tools that render
  them from SPEC.md and CHANGELOG.md. The front page of commonagent.net belongs
  to the whole suite and is made from [standards.json](../standards.json) by
  [site/tools/build-home.mjs](../site/tools/build-home.mjs) at the root of the
  repository.

## Versions

Each version is tagged as `common-agent-v` followed by the version, such as
`common-agent-v0.26.0-draft`, and has a GitHub release. The text of SPEC.md at
a tag is the text of that version. Versions before 0.26.0-draft were drafted
before the specification moved here, and their changes are recorded in
CHANGELOG.md. The specification moved here from
jeffrschneider/common-agent-specification, whose one commit is part of this
folder's history.

The site follows the repository. A push to main renders the main branch at
<https://commonagent.net/draft/>, and a tag renders that version at
`https://commonagent.net/<version>/` and at the root.

## Changing the specification

Open a pull request that edits SPEC.md. A change to what the specification
requires gets a new version: raise the version line at the top of SPEC.md, add
an entry at the top of CHANGELOG.md in the form the earlier entries use, and
change the version in [standards.json](../standards.json). When the change is
merged, tag the merge commit `common-agent-v<version>`.

## Building the site

```
cd common-agent/site/tools && npm ci && cd ../../..
node common-agent/site/tools/build-spec.mjs                  # writes common-agent/site/dist
common-agent/site/deploy.sh draft --dry-run                  # renders /draft/ and runs the contrast gate
```

`common-agent/site/deploy.sh` renders the site, checks that every piece of text
clears a 4.5:1 contrast ratio in both themes, and uploads it. The workflow in
`.github/workflows/standards.yml` runs it on every push to main and every
`common-agent-v` tag, and uploads only when publishing is switched on. The
hand-written pages are `site/conformance.html` and `site/404.html`; the menu
and footer every page shares live in `site/tools/chrome.mjs`, and
`node common-agent/site/tools/chrome.mjs` rewrites them in place.

## Licensing

The specification prose (SPEC.md and CHANGELOG.md) is licensed under
[CC BY 4.0](../LICENSE-SPEC), so you can implement it freely, with attribution.
All code, including the conformance fixtures and the site tools, is licensed
under [Apache-2.0](../LICENSE).

## Related

- The specification site: <https://commonagent.net>
- AgentDoc, the assembled view of an agent: <https://agentdoc.net>
- Agent Messaging, a network binding: <https://agentmessaging.ai>
- Agent Roles, working descriptions of recurring jobs: <https://agentroles.ai>
- AgentMesh, the sponsor: <https://agentmesh.ai>
