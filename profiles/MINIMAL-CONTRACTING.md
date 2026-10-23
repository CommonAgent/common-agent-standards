# The minimal contracting profile

**Version:** 0.5.6-draft
**Status:** Working Draft
**Date:** 2026-10-23
**Applies to:** Agent Mandate 0.9.0-draft · Agent SoW 0.34.0-draft · Agent Messaging 0.9.10-draft

The contracting standards of the Common Agent suite cover a lot of ground. They say how a client finds a provider, how two parties agree confidentiality before any work exists, how an engagement is formed, changed and ended, how a dispute is settled in four different ways, and how reputations are recorded afterwards. Implementing all of that before contracting anything is a large first step.

This profile names the smallest part of those standards that lets one organization's agent contract another organization's agent for services work, within a budget the organization delegated in writing, and leaves a receipt that both sides can check. It is a starting point. Everything it leaves out can be added later without changing anything it requires, and Section 7 says how each part is added.

An implementation that meets this profile can say that it implements "the minimal contracting profile 0.5.6-draft". The machine-readable half of the profile is [minimal-contracting.json](minimal-contracting.json), which names the version of each standard, its sections and its conformance vectors (Section 8). Where this document and one of the standards it names disagree, the standard governs.

## 1. Conformance language and terms

The key words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are to be interpreted as described in RFC 2119.

- **Profile implementation**: software that implements every section this profile requires and passes every conformance vector it names.
- **Profile engagement**: an Agent SoW engagement whose document carries only what Section 4.2 allows.
- **Client organization** and **provider organization**: the organizations on whose behalf the client seat and the provider seat engage (Agent SoW §6.2).

A profile implementation MUST refuse to sign, countersign or complete the formation of a document that is not a profile engagement, and MUST name in the refusal the member that is outside the profile. So it never commits to something it does not implement. It still reads and validates every document as the standard defines, so that a document a standard's vectors call valid is valid to it too, even where it declines to sign that document.

## 2. A profile engagement from start to finish

1. **The client organization delegates a budget.** It files a charter (Agent Mandate §5), and its root authority issues a mandate to the person who approves contracts (§6). The mandate holds the powers `form` and `terminate`, a ceiling per engagement and per month, and an offering scope.
2. **The provider makes an offer.** The provider's owner signs a standing proposal (Agent SoW §12.1), or a directed standing proposal that names the client (§12.1.1). Its price is a fixed fee per task, or time and materials with a cap and a reservation (§5.5).
3. **The engagement forms.** The client's agent fills the client seat with its `owner_key`, and with the `buyer_reference` where the client keeps one, and signs. The approving person confirms, and the platform runs the five checks of Agent Mandate §7 against the mandate. The provider's runtime then adds the provider's signature, and the engagement is agreed (Agent SoW §12.1).
4. **The work runs and is metered.** The client's agent sends tasks over Agent Messaging. Each terminal response carries the responder's usage report under its envelope signature (Agent Messaging §13.5), and each task has a task receipt that carries the `buyer_reference` (§19.2). Under time and materials the provider signs a usage act for each window it bills (Agent SoW §6.3), and the cap bounds what the client pays (§5.5.3 to §5.5.5). The provider signs a settlement record for each window or task it charges, naming the usage acts it settles (§6.3).
5. **The engagement ends.** It lapses at `ends_at`, ends `exhausted` when the cap is reached, or ends by a signed terminate act for convenience or for cause (§5.9, §6.3).
6. **The parties settle a disagreement, where one arises.** Under the posture `none`, settlements are final. Under `escalate_to_owners`, either seat opens a dispute with a signed dispute act, and the dispute closes when both seats sign resolve acts that agree (§5.10, §5.10.2, §6.3).

## 3. Agent Mandate 0.9.0-draft

Agent Mandate gives the client organization an identity a machine can check, and gives the person who approves contracts a signed, bounded and revocable authority to do so. That authority is the delegated budget.

**Required sections.**

| Section | What a profile implementation does with it |
|---------|---------------------------------------------|
| §2, §3 | The terms, and the grades `enforced`, `evidence` and `recorded`. |
| §4 | Identifiers and signed bytes for charters and mandates. |
| §5 | The charter: domain proof, root authority, the administrator, and a domain that never changes. |
| §6 | The mandate: issuance, the holder key, narrowing, powers, ceilings, the payer, term and revocation. |
| §7 | The five checks at approval, for the acts `form` and `terminate`. |
| §9 | The lifecycle, in which revoking a mandate revokes every mandate issued under it. |
| §13 | The signature tags `agent-charter-v1`, `agent-mandate-v1` and `agent-mandate-resolve-v1`. |

Three parts of these sections are left out. Under §6 rule 6 the payer is the holder, which is the default, so a mandate that names the organization as payer is outside the profile. Rules 8 and 9 of §6 serve Agent NDA and the resource proxy, and a profile implementation refuses an act that needs them. In §7 the powers `amend`, `award`, `nda` and `write` are never exercised, because the acts they cover are outside the profile. A profile implementation still validates a mandate that carries any of these, because a mandate is shared between implementations.

**Left out.**

- **§7.1, the check at a resource proxy.** A proxy lets a contracted agent change the client's own systems. Services work in this profile is delivered through tasks and their artifacts, which need no proxy.
- **§7.2, the check for an Agent NDA.** Agent NDA is outside the profile.
- **§8, the treasury.** A treasury needs an organization balance on the settling platform and a draw record for every settlement. The budget in this profile is bounded without one, by the mandate's ceilings and by the engagement's cap and reservation, and the engagement settles from the holder's account.

Sections 1, 10, 11 and 12 are informative.

**Vectors.**

| File | What a profile implementation passes |
|------|--------------------------------------|
| [mandate-documents.json](../mandate/conformance/mandate-documents.json) | Every case: identifiers, the signatures, and the shapes a registry refuses. |
| [mandate-checks.json](../mandate/conformance/mandate-checks.json) | Every chain, and the seven approvals of the five checks. The eight approvals of an Agent NDA are left out. |
| [mandate-ids.json](../mandate/conformance/mandate-ids.json) | Every case. |
| [mandate-scope.json](../mandate/conformance/mandate-scope.json) | `charter_amendments` only. The rest pins `scope.resources`, which serves the proxy. |

`mandate-proxy.json` is left out with §7.1, and `mandate-treasury.json` with §8.

## 4. Agent SoW 0.34.0-draft

Agent SoW is the contract: who the parties are, what work is in scope, what it costs, and how it ends. Both owners sign the same document, and the runtimes enforce what it says.

### 4.1 Required sections

| Section | What a profile implementation does with it |
|---------|---------------------------------------------|
| §2, §3 | The terms and the grades. |
| §4, §4.1, §4.1.1, §4.2, §4.3 | The document, its identifier, its shape and its contract language. |
| §5.1 | Parties, each seat with its `owner_key`. |
| §5.2, §5.3, §5.3.1 | Scope by offerings, and the inputs the client supplies. |
| §5.4, §5.4.1, §5.4.2 | Deliverables, the rights in them, and acceptance. |
| §5.5, §5.5.1 to §5.5.5 | A fixed fee, or time and materials with its rate schedule, the cap, the reservation and its window, and what happens at the cap. |
| §5.6, §5.7 | Volume, and the term. |
| §5.8 | The `change_control` clause, as far as formation uses it: the review window a request to form lapses with, and the approval authority. |
| §5.9 | Termination for convenience and for cause. |
| §5.10, §5.10.2 | The postures `none` and `escalate_to_owners`, and what a dispute freezes. |
| §5.11 | Confidentiality and retention. |
| §5.17 | The buyer's reference. |
| §6, §6.1, §6.2 | Signatures and owner keys, approval authority, and organizational authority. |
| §6.3 | The signed acts terminate, usage, settle, dispute and resolve, with the outcome `settled`. |
| §7, §8, §9 | The lifecycle, who enforces what, and precedence. |
| §12.1, §12.1.1 | Formation from a standing proposal, and from a directed one. |

### 4.2 What a profile engagement carries

A profile engagement is an Agent SoW document that meets every rule below. A profile implementation signs nothing else.

1. `price.arrangement` is `fixed_fee` or `time_and_materials`. No schedule line is a pass-through line, and the price carries no operator fee (§5.5.6, §5.5.8), so no settlement record carries `operator_fee`.
2. Under time and materials, `reservation.window_days` covers the term the parties mean to work in. Work stops when the window closes (§5.5.4), and since a profile engagement is never amended, more work after that needs a new engagement.
3. `disputes.posture` is `none` or `escalate_to_owners`.
4. `change_control.approval.formation` is `person` or `agent_then_person`, the client seat carries `organization`, and the client's approval record carries `mandate` (§6.1, §6.2). This is where the delegated budget applies, because Agent Mandate §7 runs its checks when a person approves.
5. The document carries no `nda`, `provider_contact`, `subcontracting`, `reporting`, `liability` or `service_floors` member. Its scope names offerings and no process (§5.2.1), and its deliverables state no revisions (§5.4.3).
6. A standing proposal it was formed from states no qualifications (§12.1).
7. `buyer_reference` MAY be present (§5.17).

### 4.3 Amendments

A profile implementation does not amend an engagement. It MUST NOT propose an amendment and MUST NOT approve one. A proposal it receives lapses at the end of its review window, which §5.8 records as a lapse with the current version still in force. Parties that need other terms terminate the engagement and form a new one. The formation messages of §5.8, and the review window rules for proposals, serve amendments only and are left out with them.

### 4.4 Left out

- **§5.2.1, a process as the scope.** It needs Agent Processes, which is outside the profile.
- **§5.4.3, revisions.** A deliverable that is rejected is disputed or terminated in this profile.
- **§5.5.6 to §5.5.8, pass-through lines, no charge and operator fees.** Each adds a way to pay that needs records of its own: an upstream receipt, no settlement at all, or a disclosed fee line. The profile keeps one way to pay for each arrangement.
- **§5.10.1 and the posture `refund_on_failed_task`.** An arbiter needs a third agent bound by the role contract, and an enforced refund needs clearing that can reverse a payment (§8.2).
- **§5.12 to §5.15, reporting, liability, service floors and subcontracting.** Each is an optional clause with obligations of its own.
- **§5.16, the Agent NDA the engagement runs under.** Agent NDA is outside the profile.
- **§5.18, contracted contact by the provider.** In a profile engagement the client's agent starts every task.
- **§12.2, §13, §14 and §15: listings, pre-engagement validation, problem reports and post-engagement review.** None of them is needed to form, run or end an engagement.

Sections 1, 10 and 11 are informative.

### 4.5 Vectors

| File | What a profile implementation passes |
|------|--------------------------------------|
| [sow-signatures.json](../sow/conformance/sow-signatures.json) | Every case: the signed bytes, binding to `owner_key`, and the canonical padded base64 signature. |
| [sow-pricing.json](../sow/conformance/sow-pricing.json) | The arrangement, every price case, rating without the cases for pass-through lines and operator fees, the settlement lines that are neither, the reservation, document and task states, parties, the directed proposal's clause and formation, approval, and signing. |
| [sow-acts.json](../sow/conformance/sow-acts.json) | Every terminate, usage and settle case except the two with an operator fee, every refusal that every kind of act shares, the disputes and resolutions under `escalate_to_owners` and `none`, and the three settlement pairs. The cases for refunds, verdicts and releases are left out. |
| [sow-buyer-reference.json](../sow/conformance/sow-buyer-reference.json) | The form, the template, the carriage onto settlement records and receipts, and the check for a discrepancy. The three carriage cases about amendments are left out. |
| [sow-data-use.json](../sow/conformance/sow-data-use.json) | The promises, the clause and its signing. The comparison against a stated requirement is left out. |
| [sow-disputes.json](../sow/conformance/sow-disputes.json) | The postures and the clause. The arbiter's verdict is left out. |

The fixtures for amendments, the formation messages, the review window of a proposal, the Agent NDA reference, provider contact, reporting, subcontracting, liability and service floors are left out with their sections.

## 5. Agent Messaging 0.9.10-draft

The two agents exchange tasks over Agent Messaging, and this profile assumes its core profile (Agent Messaging §1.6) without repeating it. On top of the core, a profile implementation implements two sections.

| Section | What a profile implementation does with it |
|---------|---------------------------------------------|
| §13.5 | Metering: the observed meters, the meter event, and the usage report a responder puts on its terminal response, which the envelope signature covers. |
| §19.2 | The task receipt for every completed or canceled task, carrying the engagement's `buyer_reference` byte for byte. |

The rest of §19, which covers prices, the money axis of the budget, the billing provider, the agreement and rating, is left out. The engagement's price clause states the price and Agent SoW §5.5.2 rates it.

**Vectors.** Every case of [metering.json](../messaging/conformance/metering.json) but one: the observed meters, the event, idempotency, the receipt and the valid events of the request id. The join of the request id group shows what a reader can do with the member, and is left out. How the `buyer_reference` reaches the receipt is pinned in `sow-buyer-reference.json`. `commerce.json` is left out with the rest of §19.

## 6. What the receipt lets each side check

The receipt of a profile engagement is four records, and each side can check every one of them against signed documents.

1. **The usage report on each response.** The responder reports its usage on its terminal response, and the envelope signature covers it (Agent Messaging §13.5). The signature proves who reported the usage, and it cannot prove that the numbers are true.
2. **The usage acts.** Under time and materials, the provider signs the counts for each window it bills (Agent SoW §6.3). The client rates them under §5.5.2, one line at a time as `floor(count × per_unit / per)`, and checks that the total stays within the cap. Under a fixed fee, each task is charged its offering's `per_task` rate.
3. **The settlement record.** The provider signs one for each window or task it charges (Agent SoW §6.3, tag `agent-sow-settlement-v1`). Under time and materials it names the usage acts it settles, each line counts what those acts read for its meter, and no usage act is settled twice. Under a fixed fee each line charges the rate's `per_task` for each task. The client recomputes every line and the total, checks the `buyer_reference`, and checks that the totals stay within the cap.
4. **The task receipt.** It carries the `buyer_reference` of the version the task was admitted under, and a client that finds the reference missing or altered treats the record as a discrepancy (Agent SoW §5.17). The task receipt is a view the platform derives (Agent Messaging §19.2), so the settlement record is the one of the four that commits the provider to the charge.

## 7. How the rest of the suite adds on

Each part this profile leaves out adds members, acts or documents that a profile implementation refuses today. An implementation that adds one keeps everything it already does.

- **Agent RFP.** A client that does not yet know its provider posts a request for proposals, and the award forms an Agent SoW engagement. Adding Agent RFP adds the posting, the responses and the award, and the `award` power of a mandate. Formation, the acts and the receipts stay as they are.
- **Agent NDA.** Parties that need to share confidential material before an engagement exists sign an Agent NDA, and the engagement names it in its `nda` member (Agent SoW §5.16). Adding Agent NDA adds that member, the `nda` power and its check (Agent Mandate §7.2).
- **Agent Reputations.** A bureau reads the records a profile engagement already leaves, which are the signed engagement, its acts and its receipts. Adding Agent Reputations adds post-engagement reviews (Agent SoW §15) and the reports a client reads before it contracts.
- **The rest of Agent SoW and Agent Mandate.** Amendments add the `amend` power and the formation messages of §5.8. The other dispute postures add the remaining resolve outcomes of §6.3. Subcontracting, provider contact, reporting, liability and service floors each add one clause. The treasury lets the organization pay in place of the holder, and the resource proxy lets a contracted agent write into the client's systems.

## 8. Profile conformance

[minimal-contracting.json](minimal-contracting.json) is the list tooling reads. For each standard it names the version this profile applies to, the required, partly required and excluded sections, and the conformance vectors a profile implementation must pass, by file and by group within the file. A group is a dotted path into the file. It takes everything under the path, or only the named cases of a list, or every case except the named ones, or entries of a list by position where the entries carry no names. The file also names the standards the profile leaves out and how each adds on.

A test runner that implements this profile runs the groups the file names and skips the rest. `tools/check-profiles.mjs` in the standards repository checks that every version, section, file, path and case the file names exists, and runs on every change, so a renamed case or a moved section breaks the check and is fixed in the same change.

## Changelog

**0.5.6-draft** (2026-10-23). The profile applies to Agent Messaging 0.9.10-draft, an editorial version whose specification text is unchanged. The patch version moves because an implementation of 0.5.5-draft meets this version unchanged.

**0.5.5-draft** (2026-10-23). The profile applies to Agent Messaging 0.9.9-draft, an editorial version whose specification text is unchanged. The patch version moves because an implementation of 0.5.4-draft meets this version unchanged.

**0.5.4-draft** (2026-10-23). The profile applies to Agent Messaging 0.9.8-draft, an editorial version whose specification text is unchanged. The patch version moves because an implementation of 0.5.3-draft meets this version unchanged.

**0.5.3-draft** (2026-10-20). The profile applies to Agent Messaging 0.9.7-draft, whose `canceled_by` is now verified or unverified and whose server never confirms that the requester did not ask for a cancel until it can know (Section 10.8). The profile does not require Sections 7.1 and 10.8, so it requires nothing new. The patch version moves because an implementation of 0.5.2-draft meets this version unchanged.

**0.5.2-draft** (2026-10-20). The profile applies to Agent Messaging 0.9.6-draft, whose Task object gains the platform-written `origin` and `canceled_by` members (Sections 7.1 and 10.8). The profile does not require those sections, so it requires nothing new. The patch version moves because an implementation of 0.5.1-draft meets this version unchanged.

**0.5.1-draft** (2026-10-20). The profile applies to Agent Mandate 0.9.0-draft, which gives the treasury's draw record a shape and a signature (§8.4). §8 stays outside the profile, and so does the new `mandate-treasury.json`. The patch version moves because nothing this profile requires changes.

**0.5.0-draft** (2026-10-20). The profile applies to Agent SoW 0.34.0-draft, which counts a fixed fee ceiling's months from the engagement's `starts_at` in UTC, counts a charge in the month its work was delivered, and stops counting a charge once it is reversed (§5.5.1). The new `ceiling_period` group of `sow-pricing.json` is required. The minor version moves because an implementation of 0.4.1-draft could count a ceiling's month another way.

**0.4.1-draft** (2026-10-20). The profile applies to Agent Messaging 0.9.5-draft, whose meter events derived from an answer carry an optional `request_id` naming the request they answer (§13.5). The valid events of the new `request_id` group of `metering.json` are required, and its join is left out. The patch version moves because an implementation of 0.4.0-draft reads every event of the new group as it reads any other, ignoring the member it does not know.

**0.4.0-draft** (2026-10-20). The profile applies to Agent SoW 0.33.0-draft, under which a fixed fee engagement settles per task or per window and never both, a record for one task carries one task line with a count of 1, and the instants of every act compare at every fractional digit. The new cases of `sow-acts.json` are required. The minor version moves because an implementation of 0.3.0-draft takes records and acts this version refuses.

**0.3.0-draft** (2026-10-20). The profile applies to Agent SoW 0.32.0-draft, whose settle act refuses a record for a task or a fixed fee window an earlier record under the engagement already settles, holds a fixed fee record within the price's ceiling, and refuses any number past 2^53 − 1. The new settle cases of `sow-acts.json` are required, except those with an operator fee or a pass-through line. The minor version moves because an implementation of 0.2.0-draft takes settlement records this version refuses.

**0.2.0-draft** (2026-10-20). The settlement record. The profile applies to Agent SoW 0.31.0-draft and requires its settle act (§6.3, `agent-sow-settlement-v1`), which the provider signs for each window or task it charges. Section 6 counts it among the records of the receipt in place of saying the suite has none, and the settle cases of `sow-acts.json` are required, except the two with an operator fee. The minor version moves because an implementation of 0.1.0-draft does not produce or check settlement records.

**0.1.0-draft** (2026-10-20). First version.
