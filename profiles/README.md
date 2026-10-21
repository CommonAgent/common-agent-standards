# Profiles

A profile names a part of several Common Agent Standards that an implementation can build first and still interoperate with the rest of the suite. Each profile is two files: a document that says what is in the profile and why, and a JSON list that tooling reads, naming each standard's version, its sections and the conformance vectors an implementation passes.

| Profile | Version | Document | List |
|---------|---------|----------|------|
| The minimal contracting profile | 0.5.3-draft | [MINIMAL-CONTRACTING.md](MINIMAL-CONTRACTING.md) | [minimal-contracting.json](minimal-contracting.json) |

The minimal contracting profile is published at <https://commonagent.net/minimal-contracting.html>. [tools/check-profiles.mjs](../tools/check-profiles.mjs) checks that every version, section, file and case a list names exists, and the workflow runs it on every change.
