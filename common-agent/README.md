# The Common Agent Specification

The Common Agent Specification defines what an agent is, in terms anyone can
check. An agent holds a key that signs. It answers a small set of questions for
anyone who asks, and it declares its standing facts in one signed document. It
refuses what it does not do with a typed answer, and it collects signed records
of what others have checked about it. Every clause can be checked by a program
or a signature.

AgentMesh sponsors this standard. Nothing in the specification requires
AgentMesh or any other network: Agent Messaging is one network binding of the
agent it defines (Section 11).

This repository is the source of the specification. The site at
<https://commonagent.net> is rendered from it.

## What's here

- **[SPEC.md](SPEC.md)**: the Common Agent Specification, version 0.26.0-draft.
  It covers the floor every agent meets (the five questions, the exchanges, the
  refusals), the work an agent does, the Agent Descriptor (Section 6), the
  capabilities, the signed records others issue, the AgentDoc (Section 9), the
  twenty-one attributes, the Agent Package (Section 12) and the agent
  repository (Section 13). Readable at <https://commonagent.net/spec.html>.
- **[CHANGELOG.md](CHANGELOG.md)**: every version and what it changed, newest
  first.
- **[conformance/](conformance/)**: the fixtures that pin the byte-exact
  obligations this specification owns. Section 14 says how conformance is
  checked.
- **[site/](site/)**: the pages of commonagent.net and the tools that render
  them from SPEC.md and CHANGELOG.md.

## Versions

Each version is tagged as `v` followed by the version, such as `v0.26.0-draft`,
and has a GitHub release. The text of SPEC.md at a tag is the text of that
version. Versions before 0.26.0-draft were drafted in the AgentMesh repository,
and their changes are recorded in CHANGELOG.md.

The site follows the repository. A push to main renders the main branch at
<https://commonagent.net/draft/>, and a tag renders that version at
`https://commonagent.net/<version>/` and at the root.

## Changing the specification

Open a pull request that edits SPEC.md. A change to what the specification
requires gets a new version: raise the version line at the top of SPEC.md and
add an entry at the top of CHANGELOG.md, in the form the earlier entries use.
When the change is merged, tag the merge commit `v<version>`.

## Building the site

```
cd site/tools && npm ci && cd ../..
node site/tools/build-spec.mjs                  # writes site/dist
site/deploy.sh draft --dry-run                  # renders /draft/ and runs the contrast gate
```

`site/deploy.sh` renders the site, checks that every piece of text clears a
4.5:1 contrast ratio in both themes, and uploads it. The workflow in
`.github/workflows/site.yml` runs it on every push to main and every tag. The
hand-written pages are `site/index.html`, `site/conformance.html` and
`site/404.html`; the menu and footer they share live in `site/tools/chrome.mjs`,
and `node site/tools/chrome.mjs` rewrites them in place.

## Licensing

The specification prose (SPEC.md and CHANGELOG.md) is licensed under
[CC BY 4.0](LICENSE-SPEC), so you can implement it freely, with attribution. All
code, including the conformance fixtures and the site tools, is licensed under
[Apache-2.0](LICENSE).

## Related

- The specification site: <https://commonagent.net>
- AgentDoc, the assembled view of an agent: <https://agentdoc.net>
- Agent Messaging, a network binding: <https://agentmessaging.ai>
- The roles registry: <https://agentroles.ai>
- AgentMesh, the sponsor: <https://agentmesh.ai>
