# Governance

## Sponsor

AgentMesh sponsors the Common Agent Standards. It maintains this repository,
publishes the sites of the standards, and appoints the editors. Sponsorship
gives AgentMesh no special standing in the text: no standard may require
AgentMesh's network or products, and every standard can be implemented by any
party.

## Editors

Each standard has an editor who decides what is merged into its folder. The
editors of the suite decide changes that touch more than one standard,
standards.json, and the shared tools.

## Proposing a change

1. Open an issue that describes the problem, or open a pull request with the
   change. A pull request changes one standard where it can.
2. A change to what a standard requires gets a new version: the pull request
   raises the version line of the specification, adds an entry to the
   standard's CHANGELOG.md, and changes the version in standards.json.
3. The editor reviews the change in the open, on the pull request, and merges
   it or says why it is declined.
4. After the merge, the editor tags the merge commit with the standard's id
   and the version, such as `messaging-v0.9.0-draft`, and publishes a release.
   A draft version is released as a prerelease.

A new standard joins the suite by a pull request that adds its folder and its
entry in standards.json. It must build on the Common Agent Specification.

## Conduct

Discussion stays on the substance of the text. The editors may hide comments
and lock threads that do not.
