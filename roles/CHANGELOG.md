# Changelog

Versions of Agent Roles tagged in this repository, newest first. A version is
tagged as `roles-v` followed by the version, and the text in this folder at
that tag is the text of that version. Its history comes from the repository of agentroles.ai.

## v1.3.2 (2026-10-24)

One change follows the Common Agent Specification 0.32.0-draft, whose
deployment record (8.3) now defines the act `update` and the member
`updated_from`. The deployment manager's rule 7 of §11.3 says an update
record carries `package` for the new version and `updated_from`, with the
same members and the Descriptor digest bound before the update, for the
version it left, so it names both package digests and both Descriptor
digests. Rule 9 says 8.3 defines `update` with `rollback` and
`reconfigure`, and names `refuse` as the role's one addition. The
deployment manager's page on agentroles.ai says the same. No section
number, offering name, interface or wire string changes.

## v1.3.1 (2026-10-24)

Two changes follow the Common Agent Specification 0.31.0-draft. The
deployment manager (§11) no longer calls a rollback an update: the
specification now records a rollback under its own act, and its deployment
record (8.3) defines the acts `rollback` and `reconfigure` and the members
`rolled_back_from` and `changed` with the meaning §11.3 gives them, so rule 9
of §11.3 says so and names `update` and `refuse` as the role's own additions.
The solution architect (§36) spells its example environments dev, test and
production, the spellings the deployment record uses, and says that record
names `dev`, `test`, `staging` or `production`. On agentroles.ai the solution
architect's page links to the Architecture and Design stage on the lifecycle
map. No section number, offering name, interface or wire string changes.

## v1.3 (2026-10-24)

The lifecycle stage that was called Design is now Architecture and Design.
It is one stage with two parts, and the architecture comes first. A new
lifecycle role, the solution architect (§36), holds the first part, and a
person can hold it instead. It hands back an architecture record: the
systems the agent reaches, named in the plain system words the Common Agent
Specification's runtime requirements use in `systems[]` (12.4); the product
bound to each system in each environment, such as dev, test and prod, where
the organization's own choice wins and a platform default fills the rest, and
the record says which of the two each binding came from;
the other agents and services the agent depends on; what the agent's inside
is made of; its limits on cost, speed, data and trust; and every decision
with its reason. The part is done when every system is named and bound in
each environment the agent will run in, every decision has a reason, and
every step of the design uses only systems the record named. The record is
checked at Package, where its systems become the package's runtime
requirements, and at Deploy, where the deployment manager places its
bindings. The role defines no signature tag. The spec writer (§19) and the
solution planner (§32) hold the second part, Design, as before, and their
chapters now say they design only with the systems the record names. Out
of scope moves to §37 and signature tags to §38. The registry has
twenty-four roles. No other section number, offering name, interface or
wire string changes.

## v1.2 (2026-10-24)

The deployment manager (§11) and the package maker (§12) follow three
changes to the stages of the agent development lifecycle. The package
maker holds the stage now called Package, which was Build and package. It
hands back the package and its digest: the declaration, which is
agent-descriptor.json and agent-runtime-requirements.json, the parts and
a manifest, and building only generates the views and digests, as the Common Agent
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
and the members `ceilings`, `changed` and `rolled_back_from`, as
additions this role makes to the record of the Common Agent
Specification 8.3. Two contract rules are added to
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
