# Changelog

Versions of Agent SoW tagged in this repository, newest first. A version is
tagged as `sow-v` followed by the version, and the text in this folder at
that tag is the text of that version. Its history comes from jeffrschneider/agentsow.com.

## 0.29.0-draft (2026-10-20)

The bytes of the formation messages. §5.8
named the acknowledgement, the receipt and the void and did not define them.
Each is now a JSON object with a closed set of members: `kind`,
`engagement`, `version`, the `digest` of the approved replacement's signed
bytes, `formed` on an acknowledgement, `deadline` on a formed acknowledgement
and on a void, `of` on a receipt, `by`, `key`, `signed_at` and `sig`. Its
signed bytes are the prefix `agent-sow-formation-v1`, one newline, and the
JCS of the message without `sig`, so a message signature can never be read
as a document signature. An acknowledgement and a void come from the
proposer's seat and a receipt from the counterparty's, each signed with that
seat's `owner_key`, and `sig` is the canonical padded base64 of §6. A new
fixture, `conformance/sow-formation-messages.json`, pins the bytes with real
signatures, the four valid messages and an unformed acknowledgement, and ten
refusals. The minor version moves because a runtime built against
0.28.0-draft does not produce or check these bytes.

## 0.28.0-draft (2026-10-20)

A lost void is recovered. In the formation of
§5.8 the acknowledgement and the receipt were re-sent and the void was not,
so a counterparty that never received a void went on applying the voided
version while the proposer applied the current one. The counterparty now
sends a receipt for every copy of a void, the proposer re-sends the void at
least daily until it holds that receipt, and the proposer answers any request
that names the voided version with the void itself, in place of admitting
it. `conformance/sow-amendment-formation.json` gains a lost void recovered
by each of the two means. The minor version moves because a proposer built
against 0.27.0-draft does neither.

## 0.27.0-draft (2026-10-20)

Which review window governs a proposal, and
what governs while a formation is acknowledged.

§5.8 says that a proposal's review window is the governing version's
`review_window_days`, or 7 days where it states none. A proposal MAY shorten
its own window and cannot lengthen it: a longer value applies to proposals
made under the version the proposal forms. Before, a proposer could write a
window of years into a proposal and hold the single open-proposal slot for
that long.

§5.8 also defines formation as three signed messages: the proposer's
acknowledgement of each approval, with a deadline of the approval's receipt
plus the governing window; the counterparty's receipt of it; and the
proposer's void if no receipt arrives by the deadline. A table says which
version each side applies at each point. While the proposer holds no
receipt it is **formed, unacknowledged**: it admits each request under the
version the request names and applies the current version to its own new
acts. It re-sends the acknowledgement at least daily. A void undoes the
formation for work admitted after the counterparty receives it; work
admitted under the new version before then stays priced under it. Before,
the proposer could not tell whether the counterparty held the
acknowledgement, and nothing said what happened if it was lost.

A new fixture, `conformance/sow-amendment-formation.json`, pins the window
and the formation states, and `conformance/sow-review-window.json` gains
cases for a governing window and for a proposal that tries to lengthen it.
The minor version moves because both rules add requirements a runtime built
against 0.26.0-draft does not meet.

## 0.26.0-draft (2026-10-19)

A seat names the key that signs for it, one
spelling for a signature, and clarifications found by building an
implementation.

Every seat now carries `owner_key`, the public key of the owner that signs
for it (§5.1), and a signature counts for a seat only when it is made with
that key (§6, binding). Before, a seat named its agent and its owner, and a
signature named a key, and nothing in the document tied the key that signed
to the party in the seat. A runtime could not tell a signature by the
client's owner from a signature by anyone else who held a key. A standing
proposal carries the provider's `owner_key`, and the client's seat gets its
`owner_key` at formation with the rest of the seat (§12.1). A verifier also
checks a seat's `owner_key` at receipt against the attested owner the
registry holds for its agent (Agent Messaging §8.6). Where no attested owner
can be resolved the binding is evidence, the owner is shown as unconfirmed,
and a decision that rides on the binding treats it as a contradicted owner. A document is
written against this version when any seat carries `owner_key`, and one
where only some seats carry it is refused. A document where no seat carries
it was written against an earlier version: it stays agreed or active, its
grants and limits keep applying, and its signatures are shown as unbound
until an amendment adds `owner_key` to every seat. The minor version moves
because a new MUST applies to every document. Agent NDA 0.2.0-draft binds
its seats the same way with one difference: an organization's seat there
carries no `owner_key`, and its signer's key is the holder key of the
mandate the signature cites. The
example digest of §5.16 is the new digest of the Agent NDA example, whose
recipient seat now carries `owner_key`, and `conformance/sow-nda.json`
carries it too. A new fixture, `conformance/sow-signatures.json`, pins the
binding with real signatures.

`sig` is canonical base64 with padding, the spelling of Agent NDA §6, so each
signature has exactly one valid string (§6). The two engagement signatures
in `conformance/sow-pricing.json` are re-spelled from base64url to it; the
bytes they encode do not change.

The clarifications:

- §5.7 defines `term_months`, which standing proposals and their fixtures
  already carried without a definition, and says how a formed instance gets
  its `ends_at`: `starts_at` plus that many calendar months. A document with
  neither a non-null `ends_at` nor `term_months` is refused at formation.
- §7.1 says that `amendment proposed` is a state of the proposal. The
  engagement stays `active` under the current version, as §5.8 says.
- §5.8 gives `review_window_days` a default of 7 days, so that an unanswered
  proposal always lapses and never blocks the next one. The window counts
  from a signed instant, the new `change_control.proposed_at`, which both
  parties read from the same bytes. A counterparty refuses a proposal dated
  later than it arrived. A new version forms when the proposer receives the
  approval before the lapse instant, or accepts a later one, and the
  counterparty applies it only on the proposer's acknowledgement, so the two
  sides never disagree about which version governs. A new fixture,
  `conformance/sow-review-window.json`, pins the default, the lapse instant
  and formation.
- §5.11 says that a processor's `processed_in` is a subset of the clause's
  where both are present, as the 0.20.0-draft entry described.
- §5.3's example no longer shows a `grade` beside the `inputs` list, where no
  member can hold one; the grade is fixed by the section.
- §5.4.2 says that `acceptance` attaches to a deliverable, as `rights` does.
- §5.9 says when each termination takes effect: for convenience when the
  notice has run, for cause at once and with a reason. It said "at the next
  message", which conflicted with the notice period.
- §5.3.1 lets a grant made `via: "proxy"` name, in `writes`, the Agent
  Mandate power a mutating act on each resource needs: `write` or `amend`
  and no other. A resource it does not name needs `write`, which Agent
  Mandate 0.6.0-draft adds.

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
