# Changelog

Versions of Personal Agent Naming tagged in this repository, newest first. A version is
tagged as `naming-v` followed by the version, and the text in this folder at
that tag is the text of that version. Its history comes from AgentNaming/personal-agent-naming.

## 0.10.3 (2026-10-19)

A clarification. §2 defines the case-folded form of a handle, which §2 rule 2,
§5 and §5.6 compare in and did not define: Unicode's canonical caseless match
(definition D145) at Unicode 15.1.0, normalization form D, full case folding,
and normalization form D again. A registrar that folded between two steps of
normalization form C, or lowercased, could keep apart two handles this form
matches. Agent Reputations hashes subject names in the same form, so the two
standards pin one definition. No field, wire value or section number changes.

## 0.10.2 (2026-10-18)

Editorial, with no normative change. The prose writes the standard's name, Personal Agent
Naming, in the places that used the abbreviation PAN. Protocol identifiers keep their spelling:
the `urn:pan:*` link relations and properties, the `_pan` DNS label, the `pan-registrar=`
record and the `pan-card-signing` key use. No requirement, field, wire value or section number
changes.

## 0.10.1 (2026-10-18)

Editorial, with no normative change. The specification names no platform: the header,
the introduction, Sections 3.1, 8 and 11 speak of the reference deployment and the
reference implementation, and the examples of Section 5 use `example.com` addresses.
No requirement, field, wire value or section number changes.

## 0.10 (2026-10-13)

The first version tagged in the Common Agent Standards repository, as
`naming-v0.10`. The changes in each version are listed at the top of [SPEC-NAMING.md](SPEC-NAMING.md).
