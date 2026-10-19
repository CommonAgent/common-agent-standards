# Changelog

Versions of Agent SoW tagged in this repository, newest first. A version is
tagged as `sow-v` followed by the version, and the text in this folder at
that tag is the text of that version. Its history comes from jeffrschneider/agentsow.com.

## 0.25.0-draft (2026-10-19)

Section 5.17 adds an optional top-level `buyer_reference` member: the client's
own purchase order number or other internal reference, so that a client's
accounting system can match each charge under an engagement to it. It is a
string of 1 to 128 Unicode code points with no control character. The client
supplies it at formation, both signatures cover it, and it changes only by
amendment, which the provider does not propose. A standing proposal does not
carry it and a listing does not show it. The runtime does not interpret it,
and copies it unchanged onto every settlement record and task receipt issued
under the engagement, including the Agent Messaging task receipt (Agent
Messaging 0.9.4-draft, §19.2), from the version of the engagement the work was
admitted under. A missing or altered reference on a record is a discrepancy
for the client to record; it does not by itself make the settlement disputed.
Sections 4.2 and 12.1 name the member, and a new fixture,
`conformance/sow-buyer-reference.json`, pins the form, the template rule and
the carriage rule.

Section 5.18 adds an optional top-level `provider_contact` member, which
admits the provider's agent at named agents of the client's for the
engagement's term, so that interim deliverables, reports and notices reach the
client without the client adding a standing `allow` to its roster by hand. It
names the client's agents, grants from the closed set of the Common Agent
Specification, Section 7.1 (`messages`, `scheduling`, `share`, never
`errands`), and a per-hour or per-day limit. The client's runtime applies it
as a roster entry in the shape of a connection's, removes it when the
engagement lapses, is terminated, reaches its cap or is amended to drop it,
and refuses a message the grants do not cover with the missing grant named.
An explicit block and the stop control win over it. An interim deliverable
that the client's door held for lack of it is not a missed due instant. Common
Agent Specification 0.28.2-draft describes the entry from the door's side. A
new fixture, `conformance/sow-provider-contact.json`, pins the form, the term
and the door's decisions. No section is renumbered, and every 0.24.1-draft
document remains valid.

## 0.24.1-draft (2026-10-19)

Editorial, with no normative change. The extension URIs
`https://agentsow.com/extensions/a2a-terms/v1` and
`https://agentsow.com/extensions/a2a-interview/v1` returned 404. Each now
answers with a page that describes the extension. The URI strings and the
extension texts are unchanged, and every 0.24.0-draft document remains valid.

## 0.24.0-draft (2026-10-18)

Section 5.16 lets an engagement name the Agent NDA (https://agentnda.net) it
runs under, with an optional top-level `nda` member carrying the agreement's
id, version, and a REQUIRED digest over its signed bytes. The NDA's parties
are the engagement's parties, its obligations are graded `recorded`, and §5.11,
whose text is unchanged, still governs retention of the engagement's content.
The engagement's processors and jurisdictions MUST fit inside what the NDA
permits the provider, and a runtime holding the NDA's bytes refuses an
engagement that does not fit. Section 5.13's carve-outs cover breach of the
referenced NDA, section 12.1.1 asks a response to a gated Agent RFP posting to
name the NDA the provider accepted, and section 13 notes that probe material
is commonly covered by an Agent NDA. A new fixture, `conformance/sow-nda.json`,
pins the reference shape. No section is renumbered, and every 0.23.1-draft
document remains valid.

## 0.23.1-draft (2026-10-18)

Editorial, with no normative change. The specification and its A2A Terms and
A2A Interview extensions name no platform, "hire" reads "contract", and em
dashes become plain punctuation. Both extensions move to 0.1.1-draft. The
specification's job manifest reference points at the Common Agent
Specification (https://commonagent.net/spec.html), and its missing version note
for 0.21.0-draft (2026-09-01), the `proxy` grant mechanism of §5.3.1, is
restored. No requirement, field, example, or section number changes.

## 0.23.0-draft (2026-09-17)

The first version tagged in the Common Agent Standards repository, as
`sow-v0.23.0-draft`. The A2A Terms and A2A Interview extensions are at 0.1.0-draft.
