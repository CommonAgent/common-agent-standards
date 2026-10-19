# Changelog

Versions of Agent Mandate tagged in this repository, newest first. A version is
tagged as `mandate-v` followed by the version, and the text in this folder at
that tag is the text of that version. Its history comes from the repository of agentmandate.net.

## 0.6.1-draft (2026-10-19)

Editorial, with no normative change. Two more conformance fixtures join
`mandate-ids.json` and `mandate-proxy.json` in `mandate/conformance/`:
`mandate-documents.json` pins identifier derivation (§4), the acceptance of an
identifier nobody holds that does not re-derive, signed bytes and real
signatures, and the shape rules of §5.3 and §6 rules 2, 4 and 8;
`mandate-checks.json` pins chain verification (§6 rules 1, 3 and 7), the check
at approval (§7) and the check for an Agent NDA (§7.2). Their documents are
signed with test keys derived from published seeds, and name each holder by a
display name. A README describes all four files. No requirement, field or
section number changes.

## 0.6.0-draft (2026-10-19)

The holder key for the `nda` power, and an accurate claim about signed bytes.
A mandate that holds `nda` MUST carry `holder.key`, and a registry refuses one
that does not (§6 rule 2), because an Agent NDA signature made under it is
checked against that key (§7.2 check 1), as Agent NDA 0.2.0-draft requires of
a seat that names an organization. §7.2 claimed that the `mandate` an Agent
NDA signature record cites sat inside the agreement's signed bytes. It did
not, because Agent NDA removed the whole `signatures` array from the signed
bytes. Agent NDA 0.2.0-draft signs each record, so the claim now holds. §7
says where an Agent SoW approval record sits, in the `change_control` clause
inside the signed bytes, so that its `mandate` is signed too. A new power,
`write`, covers a mutating act through a resource proxy (§6 rule 4, §7.1),
and an Agent SoW grant made `via: "proxy"` MAY name, in `writes`, the power
each resource's mutating acts need instead, `write` or `amend` and no other;
before, no power covered one. §7.1 says how a proxy decides an act is
mutating: from the operation, reading the resource's own read-only
declaration, with an operation it cannot classify counted as mutating. A
new fixture, `conformance/mandate-proxy.json`, pins the rule. §7.2 check 2
is also run at the instant the verifier received the signature, where it
received it, because the signer writes the instant of signing. §4 lets a
registry reserve a charter's identifier for the domain it handed it out for,
because the identifier is published for the domain proof before filing, and
requires it to refuse a filing under an identifier held for another domain
or, for a mandate, another organization; the rule that an identifier is not
refused for failing to re-derive applies only to one nobody holds. A new
fixture, `conformance/mandate-ids.json`, pins it. `holder.person` SHOULD NOT
be an email address, because mandates are public. The minor
version moves because a registry built against 0.5.1-draft accepts a mandate
holding `nda` without `holder.key`, which this version refuses.

## 0.5.1-draft (2026-10-18)

Editorial, with no normative change. §8 says that the bookkeeper is a role described in Agent Roles, which is a guide of working descriptions, where it said a role defined at agentroles.ai. No requirement, field or section number changes.

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
