# Changelog

Versions of Agent SoW tagged in this repository, newest first. A version is
tagged as `sow-v` followed by the version, and the text in this folder at
that tag is the text of that version. Its history comes from jeffrschneider/agentsow.com.

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
