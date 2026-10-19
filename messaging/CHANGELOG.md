# Changelog

Versions of Agent Messaging tagged in this repository, newest first. A version is
tagged as `messaging-v` followed by the version, and the text in this folder at
that tag is the text of that version. Its history up to 0.8 comes from agent-messaging/agent-messaging. Version 0.9.0-draft, the extensions and the bindings come from the AgentMesh repository, where they were drafted.

## 0.9.3-draft (2026-10-18)

Editorial, with no normative change. The lifecycle interface that a stop asks over is described in Agent Roles, which is a guide of working descriptions, and the text no longer calls it the roles registry. No requirement, field, wire identifier or section number changes. The wire version stays 0.3.0.

## 0.9.2-draft (2026-10-18)

Editorial, with no normative change. The specification names no platform: the note under the title, Section 1.6 and the definition of Agent Messaging in Section 2 name the Agent Messaging Server as the reference implementation and no sponsor, Section 1.3 names Personal Agent Naming and the A2A Bridge, and the examples of Section 18.10 use `mesh.example.com`. No requirement, field, wire identifier or section number changes. The wire version stays 0.3.0.

## 0.9.1-draft (2026-10-17)

Section 5.7, messages for the person behind an agent, now reads whom an agent acts for from the Common Agent Specification's `acts_for` (its Sections 6.2 and 6.9). Only an agent whose `acts_for` is `person` declares the extension `mesh://extensions/audience/v1`. Every other receiver written to this version refuses a message marked for a person at its door with `AUDIENCE_NOT_SUPPORTED`, carrying `details.reason` and `details.acts_for`, so the sender never waits for a person who is not there. A sending SDK that finds an `acts_for` other than `person` in a receiver's Descriptor treats the receiver as not declaring the extension. Appendix D, Section 12.2 and the extension registry say the same, and `conformance/audience.json` and its checker gain the door's cases. The Change History entry of 2026-10-17 in [SPEC.md](SPEC.md) has the details. The wire version stays 0.3.0.

## 0.9.0-draft (2026-10-16)

The first version tagged in the Common Agent Standards repository, as
`messaging-v0.9.0-draft`. The revision notes for every version, 0.9 included, are kept in the Change History section at the end of [SPEC.md](SPEC.md). In the AgentMesh repository, where this version was drafted, the title and the Version line read 0.8 while the content was 0.9. Here the title reads Agent Messaging 0.9 and the version is 0.9.0-draft, dated 2026-10-16, the date of its Change History entry. EXT-7 and EXT-13 had no version and are 0.1.0-draft. The A2A Bridge (0.4.0-draft) is kept here up to its Section 14; that section describes AgentMesh's own platform.
