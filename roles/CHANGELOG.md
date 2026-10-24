# Changelog

Versions of Agent Roles tagged in this repository, newest first. A version is
tagged as `roles-v` followed by the version, and the text in this folder at
that tag is the text of that version. Its history comes from the repository of agentroles.ai.

## v1.2 (2026-10-24)

The deployment manager (§11) and the package maker (§12) follow three
changes to the stages of the agent development lifecycle. The package
maker holds the stage now called Package, which was Build and package. It
hands back the package: the declaration, which is agent-descriptor.json
and agent-runtime-requirements.json, the parts, a manifest and a digest,
and building only generates the views and digests, as the Common Agent
Specification 13.2 says. The deployment manager no longer holds a separate
Configure stage. A deploy places the agent's credentials by name and sets
its ceilings before the agent starts, as the install procedure of the
Common Agent Specification 12.7 orders them, and hands back a running
agent with an identity, an address and an inbox, and a signed deployment
record. The deployment manager also holds the new Reconfigure stage, which
changes the settings, credentials or ceilings of a running agent without a
new version and leaves a signed record of what changed. The deployer
interface is now v2, with two more exchanges, roll it back and reconfigure
it, and the deployment record gains the acts `rollback` and `reconfigure`
and the members `ceilings` and `changed`. Two contract rules are added to
§11.2, as rules 9 and 10, so no existing rule is renumbered. No offering
name or section number changes.

## v1.1 (2026-10-24)

The package maker (§12) follows the Common Agent Specification
0.30.0-draft, which renamed the Agent Package's host-facing file: the
package it emits carries the agent's draft Descriptor and its runtime
requirements, which the specification called the install file. No role,
interface, offering name, section number or wire string changes.

## v1 (2026-10-18)

Agent Roles is a guide. Its roles and interfaces are working descriptions of
recurring jobs and the exchanges underneath them, and they will change as we
learn. The file of descriptions is ROLES.md, which was SPEC.md, and its title
is "Agent Roles: working descriptions". Its opening says what the guide is
and that MUST, SHOULD and MAY describe what a holder does, and §2 says the
same. The text names no platform: the lifecycle interface's reference check
(§29.3) and the withdrawal of the ledger (§31) no longer name a sponsor, and
`interfaces/interface-lifecycle.json` names the reference implementation.
"hire" is now "contract", and two dashes are commas. No role, interface,
offering name, section number or wire string changes. Versions are now
numbered v1, v2 and on, as the guides are; this is the version after
0.14.0-draft.

## 0.14.0-draft (2026-10-05)

The first version tagged in the Common Agent Standards repository, as
`roles-v0.14.0-draft`. Earlier changes are recorded in the history of this folder.
