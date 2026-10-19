# Changelog

Versions of Agent Mandate tagged in this repository, newest first. A version is
tagged as `mandate-v` followed by the version, and the text in this folder at
that tag is the text of that version. Its history comes from the repository of agentmandate.net.

## 0.5.0-draft (2026-10-18)

Who may sign an Agent NDA for an organization. A new power, `nda`, covers
every act on an Agent NDA for the organization: signing an offer or an open
offer, countersigning or accepting, joining a multilateral agreement,
amending, terminating, and withdrawing (§6 rule 4). A new section, §7.2,
states the check. When a seat carries `organization`, its signature record
carries `mandate`, and that mandate holds `nda`. Checks 1 to 3 of §7 apply.
Checks 4 and 5 do not, because an Agent NDA commits no price and names no
offering. A mandate MAY carry `scope.nda_categories`, a list of Agent NDA §5.4
categories that narrows the power (§6 rule 8), and a sub-mandate narrows it as
it narrows the rest of its scope (§6 rule 3). The check is `enforced` where a
platform or a board holds the act pending and refuses on failure, and
`evidence` elsewhere. A board releasing a gated Agent RFP body SHOULD run it on
the recipient seat. A seat with no `organization` needs no mandate. §4, §7
check 3 and §10 name the new pieces, and the example mandate of §6 holds
`nda`. The minor version moves because the change adds a power and a field.

## 0.4.2-draft (2026-10-18)

Editorial, with no normative change. The Agent Reputations entry of §10 said
an organization's evidence aggregates at the entity, which Agent Reputations
did not define until its 0.4.0-draft. It names the organization report of
Agent Reputations §8.5, which groups the records of the organization's agents
by anchor and by mandate membership (§9), and says that each agent keeps its
own record. No requirement, field, example, or section number changes.

## 0.4.1-draft (2026-10-18)

Editorial, with no normative change. The specification names no platform:
Agent Messaging is no longer given a former name, and "the mesh" reads "the
network". The missing version note for 0.4.0-draft (2026-09-01), the check at a
resource proxy of §7.1, is restored to the specification, and the date of
0.4.0-draft below is corrected to match it. No requirement, field, example, or
section number changes.

## 0.4.0-draft (2026-09-01)

The first version tagged in the Common Agent Standards repository, as
`mandate-v0.4.0-draft`. The site of the standard showed 0.3 while the specification read 0.4.0-draft. The version here is the specification's, 0.4.0-draft.
