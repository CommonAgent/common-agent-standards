# Conformance fixtures

Section 14 of the specification says how conformance is checked. The floor, the
Descriptor, the AgentDoc, a package and a repository are each checked by a
program that the chapter defining them describes. The byte-exact obligations are
pinned by fixtures, and this folder holds the fixtures whose authority is this
specification.

A fixture is a file of test cases that an implementation must agree with. When an
implementation disagrees with a fixture, the implementation is what changes, and
a fixture changes only together with a change to the specification. Every case
can be checked without a network or a clock, and each fixture holds cases that
must be accepted beside cases that must be refused.

| Fixture | What it pins | Sections |
|---------|--------------|----------|
| [trial.json](trial.json) | Which trial declarations a registry refuses, the order of admission and its first-failure answer, the fields of a `TRIAL_REFUSED` refusal, what a node measures at admission, and that only admitted trials are counted. | 7.7, with 7.5 and 4.7 |
| [descriptor-floor.json](descriptor-floor.json) | Which served Descriptors meet the floor: bound, signed with `descriptor-statement-v1` by the subject, and holding the minimal Descriptor's members, with signatures that really verify; and which answers to the entryway's descriptor exchange conform. Check it with `node common-agent/conformance/lib/check-descriptor-floor.mjs`. | 4.9, with 6.2, 6.6, 6.8 and 4.4 |
| [offering-scope.json](offering-scope.json) | Which offering declarations a registry accepts by scope, focus, workspace, authority and ceilings; the boundary's checks in order and the refusal each gives, with its `decided_by`; how values a reader does not recognise are read, `acts_for` among them; how a Descriptor's former `shape` maps; and that a search by the work wanted never returns an open-ended offering. | 6.11 and 6.12, with 6.2, 4.6 and 4.7 |
| [draft-approval.json](draft-approval.json) | The marker an act carries when an agent drafted it and its owner approved it: the draft bytes and the draft statement for a marker in an act, in an act's body and beside a statement, with real signatures; and the acts a verifier refuses because the owner changed a byte, the agent signed the wrong bytes, the marker names another agent, carries another member or is dated after the act, or the owner never signed. | 7.9 |
| [agentdoc/](agentdoc/) | Which AgentDocs pass the static checks of Section 9.10 and which fail, one case per file: a card-only AgentDoc, a card with a signed Descriptor, open offerings at visibility verifiable and a package AgentDoc, which all pass, and at least one case for each static check, which fails that check alone. Check them with `node common-agent/conformance/lib/check-agentdoc.mjs`. | 9.3 to 9.10, with 6.11 and 13.4 |

The cases in `trial.json` are the same as those in the copy the Agent Messaging
Server repository carries.

## The AgentDoc cases

Each file in `agentdoc/` is one case:

```json
{ "name": "...", "note": "...", "agentdoc": { ... }, "expect": { "ok": true, "fail": [] } }
```

`expect.ok` says whether the AgentDoc passes, and `expect.fail` lists the
checks it fails, by rule id. A case agrees with a checker when the checker
fails exactly those rules. The rule ids are the ones the
`@common-agent/agentdoc` package reports, and that package's tests carry these
cases.

[lib/check-agentdoc.mjs](lib/check-agentdoc.mjs) runs the twelve static
checks with node alone. Its opening comment says how it reads each one. Run it
over the whole folder, over one case, or over an AgentDoc of your own:

```
node common-agent/conformance/lib/check-agentdoc.mjs
node common-agent/conformance/lib/check-agentdoc.mjs common-agent/conformance/agentdoc/pass-card-only.json
node common-agent/conformance/lib/check-agentdoc.mjs path/to/agentdoc.json
```

It exits 1 when a case disagrees with its `expect` or an AgentDoc fails, and 2
when a file cannot be read. Two checks of Section 9.10 need the sources
themselves, and no static checker can make them: `source-digest`, that each
source can be fetched and matches its digest, and `fact-in-source`, that each
fact is in one of its section's sources.

A member is presented as enforced when it carries `"enforced": true`. A
package AgentDoc is fixed to its package and not to a moment, so it carries no
`assembled_at` and its sources carry no `fetched_at` (Section 13.4, rule 3).

| Case | Expected | What it shows |
|------|----------|---------------|
| [pass-card-only.json](agentdoc/pass-card-only.json) | passes | An A2A agent known only by its card. Everything the card does not say is named in `not_stated`. |
| [pass-card-and-signed-descriptor.json](agentdoc/pass-card-and-signed-descriptor.json) | passes | A card and the subject's signed Descriptor. The Descriptor is the case `with_optional_members` in descriptor-floor.json, its digest is real and its signature verifies. |
| [pass-open-offerings-verifiable.json](agentdoc/pass-open-offerings-verifiable.json) | passes | An open-with-focus and an open-ended offering at visibility verifiable, with ceilings shown as enforced. |
| [pass-package.json](agentdoc/pass-package.json) | passes | A package AgentDoc, with `package` in place of `subject`. |
| [pass-sow-clause-grade.json](agentdoc/pass-sow-clause-grade.json) | passes | A promise quoted from Agent SoW terms keeps its clause grade, which grades the clause, not the agent. |
| [fail-sources-exist.json](agentdoc/fail-sources-exist.json) | fails `sources-exist` | A section cites a source the document does not list. |
| [fail-section-has-source-missing.json](agentdoc/fail-section-has-source-missing.json) | fails `section-has-source` | A section has no `from`. |
| [fail-section-has-source-empty.json](agentdoc/fail-section-has-source-empty.json) | fails `section-has-source` | A section has an empty `from`. |
| [fail-no-summary-grade-top-level.json](agentdoc/fail-no-summary-grade-top-level.json) | fails `no-summary-grade` | The document carries a trust label. |
| [fail-no-summary-grade-in-standing.json](agentdoc/fail-no-summary-grade-in-standing.json) | fails `no-summary-grade` | The standing section averages a report it carries. |
| [fail-no-summary-grade-letter-grade.json](agentdoc/fail-no-summary-grade-letter-grade.json) | fails `no-summary-grade` | The same quoted promise with a letter grade, which reads as a grade of the agent. |
| [fail-visibility-supports-claim-opaque.json](agentdoc/fail-visibility-supports-claim-opaque.json) | fails `visibility-supports-claim` | Ceilings are shown as enforced at visibility opaque. |
| [fail-visibility-supports-claim-observed.json](agentdoc/fail-visibility-supports-claim-observed.json) | fails `visibility-supports-claim` | A job ceiling is shown as enforced at visibility observed, away from the door. |
| [fail-decided-by-rule-model.json](agentdoc/fail-decided-by-rule-model.json) | fails `decided-by-rule` | A ceiling the model keeps is shown as enforced. |
| [fail-decided-by-rule-absent.json](agentdoc/fail-decided-by-rule-absent.json) | fails `decided-by-rule` | A refusal with no `decided_by` is shown as enforced. |
| [fail-sells-scope.json](agentdoc/fail-sells-scope.json) | fails `sells-scope` | An offering in `sells` carries no `scope`. |
| [fail-open-offering-members-workspace.json](agentdoc/fail-open-offering-members-workspace.json) | fails `open-offering-members` | An open-with-focus offering has no `workspace`. |
| [fail-open-offering-members-cost-ceiling.json](agentdoc/fail-open-offering-members-cost-ceiling.json) | fails `open-offering-members` | An open-ended offering has no `cost_per_job` ceiling. |
| [fail-open-ended-no-claim.json](agentdoc/fail-open-ended-no-claim.json) | fails `open-ended-no-claim` | An open-ended offering says what it can do. |
| [fail-assembled-at.json](agentdoc/fail-assembled-at.json) | fails `assembled-at` | The document does not say when it was assembled. |
| [fail-fetched-at.json](agentdoc/fail-fetched-at.json) | fails `fetched-at` | A source does not say when it was fetched. |
| [fail-not-stated-complete-section.json](agentdoc/fail-not-stated-complete-section.json) | fails `not-stated-complete` | A missing section is not named in `not_stated`. |
| [fail-not-stated-complete-access.json](agentdoc/fail-not-stated-complete-access.json) | fails `not-stated-complete` | An access section gives an address and does not name its missing schemes and admission. |
| [fail-not-stated-complete-package.json](agentdoc/fail-not-stated-complete-package.json) | fails `not-stated-complete` | A package AgentDoc does not name `standing`. |
| [fail-no-default.json](agentdoc/fail-no-default.json) | fails `no-default` | A section named in `not_stated` is given a value. |
| [fail-no-default-package-subject.json](agentdoc/fail-no-default-package-subject.json) | fails `no-default` | A package AgentDoc carries the subject it names as not stated. |

A binding pins the byte-level constants this specification leaves symbolic, such
as fence text and freshness windows, in its own fixtures. The fixtures for Agent
Messaging are in <https://github.com/agent-messaging/agent-messaging>.
