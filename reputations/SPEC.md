# Agent Reputations Specification

**Version:** 0.11.1-draft
**Date:** 2026-10-19
**Status:** Draft; first bureau implementation in progress alongside a reference mesh stack
**Canonical source:** SPEC.md (this document). Hosted at https://agentreputations.com.
**Family:** Agent Messaging (transport), Personal Agent Naming (naming), the Agent Name Service or ANS (domain identity), Agent SoW (engagements), Agent NDA (confidentiality), Agent Reputations (reputation)

*Naming note: the protocol was drafted under the working name Feedback, and the
signed tag prefixes (`fdbk-enroll-v1`, `fdbk-attest-v1`, `fdbk-score-1`, …) keep
that prefix permanently. Tags are stable identifiers, not branding. The product
and bureau name is Agent Reputations.*

---

Personal Agent Naming says who an agent is. Agent Messaging carries what it says. Agent Reputations records how it went.

Agent Reputations is a small protocol for agent reputation. It defines how evidence about
agent interactions is collected, how it is stored so it cannot be quietly rewritten,
how a score is computed from it deterministically, and how the answer is served in a
signed, portable form. It is a ledger discipline with a formula on top, not a judging
service: **the bureau is an accountant, not a judge.**

Two commitments shape everything below.

First, **facts before opinions.** What the mesh measured (did the agent answer, how
fast, did it violate a declared promise) is recorded for any agent the mesh observed.
What a caller *thought* of the work (the quality layer) exists only for agents that
enrolled. Nobody opts out of physics; everybody opts into judgment.

Second, **scores are derived, never stored.** Every number a bureau serves is a pure
function of the ledger and a versioned formula. Given the same ledger and the same
formula version, any party computes the same score. A score that cannot be recomputed
is an opinion with a haircut.

The key words MUST, MUST NOT, REQUIRED, SHOULD, SHOULD NOT, MAY, RECOMMENDED are to
be interpreted as described in RFC 2119.

---

## 1. Terminology

**Subject**: an agent about which a bureau holds evidence. Identified by its Personal Agent Naming
handle (e.g. `Coder.ana@example.org`) or ANS name. Agent Reputations does not mint identities;
it binds evidence to identities minted elsewhere.

**Anchor**: the identity root behind a subject or evaluator, as defined by Personal Agent Naming (the
email that owns the handle) or ANS (the domain). A bureau uses anchors to detect
self-dealing (§6.4) and to group a publisher's portfolio (§12.1).

**Bureau**: a service that ingests evidence, maintains the ledger, computes scores,
and answers queries with signed reports. The role parallels Personal Agent Naming's registrar.

**Reporter**: a mesh, runtime, or gateway that observed interactions firsthand and
submits interaction facts to a bureau under its own signature. A bureau accepts facts
only from reporters it is configured to trust (§4.2).

**Evaluator**: a caller (agent or the human behind one) that submits an attestation
about an interaction it participated in.

**Operator**: whoever runs an agent and answers for it, as the Common Agent
Specification defines the term (its §2). A bureau identifies an agent's operator
by the operator identity that the agent's resolved card or signed Descriptor
names, and where neither names one, it treats the agent's anchor as its
operator. Two agents share an operator when those identities are equal. A party
that only carries an agent's messages, only quotes or settles its charges (an
Agent SoW operator in the sense of its §5.5.8), or only hosts its runtime for an
owner who answers for the agent, is not the agent's operator for any rule in
this document.

**Sender**: the party that sent a request, identified by the identity that
signed it (§4.7).

**Stop**: a request refused or held before the subject began the work, by a
rule, a screener, or a person other than the subject's own judgment (§4.6).

**Organization**: the set of subjects that share an anchor, together with, for
a domain that holds an Agent Mandate charter, the subjects that the charter's
membership rule admits (§8.5).

**Claim of breach**: a signed statement by a party to an Agent NDA that
another party bound by the same agreement breached it (§4.8). The party that
files it is the **claimant**, and the party it names is the **respondent**.

**Upheld breach**: a claim of breach that the respondent acknowledged, or that
a forum the parties chose, or a court, found against the respondent, recorded
under §4.8. A claim that is not upheld is a claim and nothing more.

**Interaction**: one call from a caller to a subject, identified by an interaction
id, optionally carrying a parent id (§4.5).

**Outcome**: the coded result of an interaction, drawn from the taxonomy in §5.

**Attestation**: a signed, structured statement by an evaluator about the outcome
of one interaction it participated in (§6).

**Probe**: a synthetic interaction with a known-correct answer, injected to produce
ground truth. This document defines how probe results enter the ledger (§4.3);
operating a probe program is out of scope and belongs to a companion specification
(working name: *Canary*).

**Capability**: an opaque string tag scoping a subject's quality evidence
(e.g. `code-review`, `translation.en-es`). Quality is always per-capability. Tags are
declared by the subject at enrollment and treated as opaque keys; a bureau MUST NOT
parse them.

**Promise**: a machine-readable commitment declared by a subject at enrollment
(§9): a latency bound, a schema, a behavioral claim.

**Ledger**: the bureau's append-only, hash-chained event log (§4). Evidence lands
here; nothing else does.

**Report**: the signed answer to a reputation query (§8). The role parallels Personal Agent Naming's
card.

**Enrollment**: a subject's opt-in to the quality layer, with the states defined in
§3.

## 2. Layering

Agent Reputations does one thing: it turns interaction evidence into a signed, recomputable
reputation report. It does not transport messages (Agent Messaging), name agents (Personal Agent Naming,
ANS), discover agents (ARD), route or select agents (a consumer concern), move money,
or arbitrate quality disputes.

Agent Reputations is normative for the mesh in one direction only: a mesh that emits
interaction facts to a bureau MUST emit them in the forms defined here. Nothing in
the mesh requires a bureau to exist. An agent network without a bureau still runs;
it just doesn't remember.

A bureau consumes Personal Agent Naming and ANS in the usual way: it resolves handles, verifies cards, and
pins keys per Personal Agent Naming §5.3. Attestations are signed with the same agent key a subject or
evaluator bound in Personal Agent Naming §4. One key, one identity, every layer.

## 3. Enrollment

The quality layer is opt-in. Participation itself is a market signal, and the signal
only works if absence is visible and exit leaves a mark. **You can leave, but you
cannot leave quietly.**

### 3.1. States

Every subject known to a bureau is in exactly one state:

- **UNENROLLED**: never opted in. Facts (§4.2) may still be served if a reporter
  observed the subject; quality evidence MUST NOT be solicited, accepted, or served.
- **UNPROVEN**: enrolled, but a capability has insufficient evidence (§7.4). This
  state is per-capability; a subject can be RATED for one capability and UNPROVEN
  for another.
- **RATED**: enrolled, with sufficient evidence for the capability queried.
- **WITHDRAWN**: previously enrolled, opted out. Last-known scores are served,
  labeled with the withdrawal date. They decay on the normal schedule (§7.2) and are
  never silently deleted.

Reports MUST state the enrollment state. Consumers MUST be able to distinguish all
four; a consumer that renders WITHDRAWN as UNENROLLED is destroying the exit record,
which is the record that matters most.

### 3.2. Enrolling

Enrollment is a signed act by the subject's key:

    fdbk-enroll-v1:<subject>:<bureau-url>:<ISO-8601 timestamp>

signed with the agent key bound to the handle in Personal Agent Naming. The bureau MUST verify the
signature against the currently resolved card and MUST record the enrollment in the
ledger.

Enrollment is **all-or-nothing across capabilities and evidence classes.** A subject
enrolls the whole agent, not its strong suits. A bureau MUST NOT offer
per-capability enrollment. Rationale: selective enrollment converts the quality
layer into advertising.

At enrollment the subject declares its capability tags and its promises (§9). Both
may be amended later by the same signed mechanism; amendments land in the ledger.

### 3.3. Withdrawing

Withdrawal is the same signed act with `fdbk-withdraw-v1:`. It takes effect after a
cooling-off period of **30 days** (bureau-configurable, MUST be published, MUST NOT
be less than 14 days). During cooling-off, attestations for interactions that began
before the withdrawal request continue to land and continue to score. Rationale:
without this, withdrawal is a free dodge of in-flight bad news.

The enrollment history (enrolled_at, withdrew_at, re-enrolled_at) is permanent
ledger content. A subject that re-enrolls resumes its prior evidence (decayed by the
gap, per §7.2); it does not start clean. **A fresh start requires a fresh identity,
and fresh identities rank below proven ones** (§7.4, §12.2).

## 4. Evidence and the ledger

### 4.1. The ledger

Each bureau maintains one append-only log of evidence events, or one such log
per subject (§4.1.1). Entries are never updated or deleted. Each entry carries
the hash of the previous entry in its log:

```json
{
  "seq": 88412,
  "at": "2026-07-31T18:22:04.113Z",
  "action": "attested",
  "subject": "Coder.ana@example.org",
  "capability": "code-review",
  "detail": { "...": "action-specific fields, see below" },
  "prev_hash": "b64…",
  "entry_hash": "b64…"
}
```

`entry_hash` is SHA-256 over the canonical JSON of the entry minus the two hash
fields, concatenated with `prev_hash`. Actions: `enrolled`, `amended`, `withdrew`,
`fact`, `attested`, `probed`, `stopped` (§4.6), `nda_claimed`, `nda_answered`,
`nda_resolved` (§4.8), `excluded` (§6.4), `corrected` (§10, data-error
repairs, which append a correction and never rewrite). The `subject` of a
`stopped` entry is the sender of the stopped request, and the intended
recipient appears in it only as a salted anchor hash. The `subject` of the
three `nda_` entries is the respondent, and the claimant appears in them only
as a salted anchor hash.

Ledger access is subject-scoped: a subject can retrieve every entry about itself
(explainability is an obligation, §10), a reporter can retrieve what it submitted,
and the public gets aggregate reports (§8), not the raw feed. Rationale mirrors Personal Agent Naming
§6: audit for the owner, privacy against enumeration.

#### 4.1.1. One log per subject

A bureau MAY keep one log per subject in place of one log for every subject.
Each subject's log is then chained as above, starting from its own first entry,
and its `seq` counts that subject's entries only.

The reason is erasure. A bureau holds records about the people and businesses
behind the agents it rates, and the law where it operates may oblige it to
erase a subject's history, as may the subject's own account closing. In one log
chained across every subject, removing one subject's entries breaks the hash of
every entry after them, for every other subject too. One log per subject can be
erased whole and leaves every other log verifying.

One log gives a guarantee that many logs alone do not: a bureau cannot show
one reader a history it hides from another, or rewrite a history it has shown,
because every entry is bound into one chain whose head everyone can see. A
bureau that keeps one log per subject MUST keep that guarantee with a chain of
commitments over every subject's log, defined below.

**The tree.** A commitment's root is a sparse Merkle tree of height 256 with
one slot for every possible subject:

- A subject's slot is at its key: the SHA-256 of the UTF-8 of the subject's
  name in its canonical caseless form, the form Personal Agent Naming §2
  compares handles in: normalization form D, full case folding (the `C` and
  `F` entries of `CaseFolding.txt`), and normalization form D again, all at
  Unicode 15.1.0, which is the canonical caseless match of Unicode's
  definition D145. A name is case folded and never merely lowercased, so
  `Straße` and `STRASSE` take one slot, as do `ſam` and `SAM`, and a name
  ending in `ς` and the same name in capitals. Decomposing on both sides of
  the folding keeps each combining mark with its base, so `ᾷ` and `Α`
  followed by U+0342 and U+0345 take one slot as well, where folding between
  two steps of form C would give them two. Bit 0 of the key, the highest bit
  of its first byte, chooses the side at the root, and each later bit the
  side one level down.
- A slot holds the subject's head, the tombstone of an erased subject, or
  nothing. A head is an object holding `key` (the key in lowercase hex),
  `subject`, `seq` (the `seq` of the log's last entry), and `head_hash` (that
  entry's `entry_hash` as the entry carries it), and `after_erasure` when the
  log was started after an erasure (below). A tombstone holds `key` and
  `erased_at`.
- A filled slot's digest is SHA-256 over the byte 0x00 followed by the JCS
  (RFC 8785) of what it holds, in UTF-8. An empty subtree of height h has the
  digest `EMPTY[h]`: 32 zero bytes at height 0, and SHA-256 over the byte 0x01
  and two copies of `EMPTY[h − 1]` above. A node's digest is SHA-256 over the
  byte 0x01, its left child's digest and its right child's digest.
- The root is the digest at the top, in lowercase hex. A tree with no filled
  slot has the root `EMPTY[256]`.

Each subject has exactly one slot, so a tree can hold one head for a subject
and no more: a second head for the same subject, under any spelling of its
name, lands in the same slot, and its path cannot reach a root the first head
is in.

**A proof** for a slot lists, from the slot up to the root, the digest of the
sibling at each of the 256 levels, or `null` where the sibling is an empty
subtree. A consumer recomputes the slot's digest from the head it was shown,
folds the siblings in order using the key's bits, and compares the result
with the root of a commitment it verified. The same proof with an empty slot
in place of a head proves that the commitment holds no head and no tombstone
for that subject.

**The commitment.** At least once in every 24 hours the bureau publishes a
commitment, an object holding:

- `bureau`, the bureau's URL as reports carry it (§8.1.2);
- `seq`, which is 1 for the bureau's first commitment and one more than the
  previous commitment's for each later one;
- `prev`, the SHA-256 in lowercase hex of the previous commitment's signed
  bytes, or `null` in the first;
- `issued_at`;
- `root`;
- `subjects` and `tombstones`, the number of heads and of tombstones in the
  tree.

The commitment is signed as a report is (§8.1.1), under the tag
`fdbk-heads-v1` and with the bureau's report signing key, in an envelope whose
signed member is `heads`. A tombstone's `erased_at` is no later than the
`issued_at` of every commitment that carries it.

**Witnesses.** A bureau names its witnesses in its key set (§8.1.2), in a
`witnesses` list whose entries give each witness's `id` (a URL), its
Ed25519 `key` in padded base64, and its `kind`: `cosigner`, or `log` for a
public append-only log. Within 24 hours of `issued_at`, every witness named
for the commitment's `seq` (below) MUST have co-signed the commitment, and
the bureau serves every co-signature beside the commitment. A co-signer:

1. starts its record for a bureau at one point in the chain, and never
   co-signs a commitment before it. A witness named before the bureau has
   published any commitment starts at the beginning: its first co-signature
   is of a commitment whose `seq` is 1 and whose `prev` is `null`. A witness
   that joins mid-chain, through a change of the list (below), starts at the
   commitment the change names in `after`, the one the witnesses before it
   co-signed: its first co-signature is of the next commitment, whose `seq`
   is one more than that one's and whose `prev` is that one's hash, and it
   never co-signs that commitment or any before it. After its first, it
   co-signs only the commitment whose `seq` is one more than the last it
   co-signed for that bureau and whose `prev` is that commitment's hash, so it
   never co-signs two commitments with one `seq`;
2. signs, under the tag `fdbk-heads-cosign-v1` with the signed bytes of
   §8.1.1, the JCS of an object holding `bureau`, `seq`, and `commitment`,
   the SHA-256 in lowercase hex of the commitment's signed bytes; and
3. publishes every co-signature it makes, so that anyone can find which
   commitment it co-signed for each `seq`.

A public append-only log counts as a witness only when it refuses a second
entry for the same `bureau` and `seq`, accepts the commitment's signed
bytes, and returns a proof of inclusion that anyone can check against a head
of the log it publishes. Its proof stands in for the co-signature. A log that
would accept two commitments with one `seq` keeps nothing of rule 1 and does
not count.

**Changing the witnesses.** A consumer pins the witness list with the
bureau's keys on first sight (§8.1.2), and the list changes as the keys do,
additively: a new witness joins in one change, and an old one leaves in a
later one. A change is an object holding `bureau`, `previous` (the SHA-256 in
lowercase hex of the JCS of the list it changes), `after`, and `witnesses`
(the new list). Every co-signer on the list it changes signs it under the tag
`fdbk-witnesses-v1` with the signed bytes of §8.1.1, and every log on that
list holds it as it holds a commitment.

`after` names the commitment current when the change takes effect: `null` when
the bureau has published no commitment, and otherwise an object holding that
commitment's `seq` and `commitment`, the SHA-256 in lowercase hex of its
signed bytes. It is the latest commitment the bureau has published, and every
witness on the list the change replaces has co-signed it or holds it. That
list is the one named for every commitment up to and including `after`, and
the new list is the one named for every commitment after it. So a joining
witness's first co-signature is of the commitment after `after` (rule 1), and
a leaving witness's last is of `after`. A co-signer signs a change only once
it has co-signed the commitment `after` names, and a joining co-signer checks
the co-signatures of the witnesses before it on that commitment before it
co-signs the next. A consumer refuses a change whose `after` names a
commitment it cannot find co-signed by every witness on the list the change
replaces, or a commitment before the one named by the `after` of the change
before it. The key set carries every change, in order and with its signatures,
in `witness_changes`. A consumer moves its pin only along changes that lead
from the list it pinned to the list the key set names, each signed by every
witness on the list before it. Otherwise it keeps its pin and accepts the new
list only after its operator confirms the change by some means other than the
bureau's own answer. A witness that has stopped working cannot sign its own
removal, so removing it takes that confirmation.

A bureau that names no witness yet serves `witnesses` as an empty list, or
leaves `witnesses` and `witness_changes` out, and a consumer pins either as
the empty list. The empty list is named for every commitment the bureau
publishes while it names no witness. The first witness it names after it has
published a commitment joins in a change from the empty list whose `after`
is the latest commitment, so the witness starts there (rule 1) and its first
co-signature is of the next commitment. The empty list has no co-signer, so
no witness signs that change, and the commitments up to `after` stay
unwitnessed: a consumer treats a report resting on one of them as step 7 of
§8.1.3 says for a commitment whose named list has no witness. A bureau MUST
NOT name such a witness on the first list, as if named before any
commitment, because rule 1 would then let it start only at the commitment
whose `seq` is 1, which it can no longer co-sign.

What the witnesses give is this. While at least one named witness keeps
rule 1, or is a log that refuses a second entry for a `seq`, a bureau cannot
have two different commitments with one `seq` both co-signed by every named
witness, so a consumer that checks every co-signature (§8.1.3 step 7) is
never shown one side of a fork. The witnesses do not check the logs behind
the root, and they do not help a reader that skips step 7 or a bureau whose
witnesses all sign both sides.

**What a commitment may change.** Each commitment carries every slot of the
previous one forward:

1. A head stays, or moves up its own log: its `seq` is the same, with the
   same `head_hash`, or higher, and the subject's log MUST hold, at the
   earlier `seq`, the entry whose hash the earlier head named. A head never
   moves back and never changes its hash at the same `seq`.
2. A head leaves the tree only for a tombstone, when the subject is erased.
   A slot never empties.
3. A tombstone stays in every later commitment. It gives way only to the
   head of a new log for the same subject, and that head carries
   `after_erasure` equal to the tombstone's `erased_at`, so every reader can
   see that the history before the erasure is gone and this one started
   after it.

A reader holding two commitments checks the first two rules for any subject
whose proofs it holds in both, and the subject checks rule 1 against its own
excerpt.

**Privacy.** A slot key is the hash of a name without a secret, so anyone who
can guess a handle can compute its key, ask for the proof of its slot, and
learn whether the bureau holds a log for it, holds a tombstone for it, or
holds nothing. A tombstone therefore reveals that the subject was held and
erased, and an absence proof that a guessed name was never held. A bureau
that must not reveal either keeps one log for every subject instead, or
waits for a later version of this section: a tree keyed by a verifiable
random function of the name, as CONIKS keys its directory, would let the
bureau prove a subject's slot to someone who knows the name without letting
anyone enumerate names, and is left for that version.

**Serving.** The bureau serves the latest commitment at
`GET <bureau>/api/heads`, keeps every commitment it has published with its
witness evidence, and serves each at `GET <bureau>/api/heads/<seq>`. For any
commitment it keeps, it serves the proof for any slot at
`GET <bureau>/api/heads/<seq>/proof/<key>`, including the proof of an empty
slot. The head a commitment holds for a subject is an entry of that subject's
log, so it appears in the subject's excerpt (§4.1), and the subject can check
that the history it was shown passes through every head committed for it.

**Reports name their basis.** A report about a subject, or an organization
report about each member, carries in its signed object a `log` member holding
the `seq` and `head_hash` of a head of the subject's log, and the `seq` of a
commitment that holds exactly that head in the subject's slot (§8.1). The
report's figures are computed from the log as it stood at that head. A
consumer fetches the commitment and the proof and checks them as §8.1.3 step
7 says, and calls a report whose commitment or proof it cannot get
unanchored.

**Erasure.** When a subject is erased, the bureau deletes its log and puts a
tombstone in its slot, which every later commitment carries. Commitments
published before the erasure stay as they were published, with their
witnesses. Their roots can no longer be recomputed from the logs that remain,
and that is the trade this section makes: the erasure holds, and the earlier
commitments still prove what the bureau had committed to on their dates.

The file [conformance/fdbk-heads-v1.json](conformance/fdbk-heads-v1.json)
holds four pairs of names that share a slot, two changes of the witness list,
one before the first commitment and one adding a witness mid-chain, three
chained commitments with the co-signature of every witness named for each, the
proofs of a head, of a head in the earlier commitment, of a tombstone and of
an absent subject, and nineteen cases a conforming check refuses (§14). The
file
[conformance/casefolding-15.1.0.json](conformance/casefolding-15.1.0.json)
holds the case folding the slot key uses. It is Unicode data under the Unicode
License V3, in [conformance/LICENSE-UNICODE](conformance/LICENSE-UNICODE).

### 4.2. Facts

A **fact** is an interaction record submitted by a configured reporter, signed with
the reporter's key:

```json
{
  "action": "fact",
  "detail": {
    "interaction_id": "itx_9f4c…",
    "parent_id": "itx_2ab0…",
    "reporter": "https://runtime.example.net",
    "caller_anchor_hash": "sha256:…",
    "capability": "code-review",
    "started_at": "…",
    "ended_at": "…",
    "transport": "OK | UNREACHABLE | TIMEOUT | MALFORMED",
    "latency_ms": 843,
    "promise_checks": [ { "promise_id": "p1", "held": true } ],
    "derived_outcome": "OK_CORRECTED",
    "derived_from": "retry-then-accept"
  }
}
```

Facts are the non-gameable substrate: reachability, latency, schema conformance,
adherence to mesh-verifiable promises, and outcomes the reporter's SDK can derive
from caller behavior without anyone filling out a form (a retry followed by
acceptance, an escalation to another agent, an abandoned workflow). Reporters SHOULD
derive outcomes automatically wherever the transport makes it possible; evidence
that costs a developer effort is evidence that stops arriving.

A bureau MUST accept facts only from reporters on its configured list, MUST verify
reporter signatures, and MUST record which reporter supplied each fact. Facts about
UNENROLLED subjects are recorded and MAY be served as facts-only reports (§8.3),
clearly labeled.

The caller's identity in a fact is carried as a salted hash of its anchor
(`caller_anchor_hash`), sufficient for the concentration and self-dealing checks in
§6.4 and §8.2 without publishing a caller graph.

### 4.3. Probes

A probe result is a fact from a reporter operating a ground-truth program:

```json
{ "action": "probed",
  "detail": { "interaction_id": "…", "capability": "…",
               "result": "PASS | FAIL", "program": "canary-v1",
               "library_version": "v2026.07" } }
```

Probe results enter the quality pool (§7.1) with value 1.0 (PASS) or 0.0 (FAIL) and
normal weight. A bureau MUST record `library_version` so a probe-derived score can be
dated. Everything else about probes is the companion specification's problem,
deliberately: libraries, rotation, indistinguishability, classification, and
appeals.

### 4.4. Engagements as an evidence source

Since this specification was first drafted, the Agent SoW specification
(https://agentsow.com) has defined **engagements**: signed statements of work
under which two agents do recurring tasks, with signed task histories, mechanical
deliverable checks, problem reports, metering receipts, and a post-engagement
review. An engagement is the richest evidence source a bureau can have, because
every event in it is signed, witnessed by both runtimes, and attached to a real
interaction by construction. A bureau operating alongside an Agent SoW runtime
SHOULD treat engagements as its primary evidence source, mapped as follows.

Identity mapping: the **capability** tag for engagement evidence is the offering
identifier from the engagement's scope clause (Agent SoW §5.2). The
**interaction_id** is the task id; the engagement id is carried in `detail`.
The **reporter** is the platform runtime that enforced the engagement.

| Agent SoW event | Evidence class | Outcome |
|---|---|---|
| Task completed, all named artifacts conform (SoW §5.4) | fact | `OK` |
| Task completed after a problem report was resolved (SoW §14) | fact | `OK_CORRECTED` |
| Completion claimed with a required artifact missing or malformed | fact | `FAILED_SILENT` |
| Task failed, reported as failed by the subject | fact | `FAILED` |
| Task declined up front | fact | `DECLINED` (candor, never quality) |
| Task parked `input_required` awaiting the caller (SoW §5.3) | excluded from quality; counted as a fact statistic |
| Post-engagement review: accepted (SoW §15) | attestation | `OK` |
| Post-engagement review: rejected with reasons (SoW §15) | attestation | `FAILED_SILENT` |
| Termination for cause by the client (SoW §5.9) | fact, recorded; MAY feed `contract_violations_90d`; not quality-scored in v1 |
| Time and materials engagement concluded on reaching its not-to-exceed cap, the `exhausted` state (SoW §5.5.5) | fact, recorded; witnesses the engagement for §6.6; not quality-scored |
| Time and materials review: the buyer judged the spend worthwhile (SoW §15) | attestation | `VALUE_OK` (§6.6) |
| Time and materials review: the buyer judged the spend not worthwhile, with reasons (SoW §15) | attestation | `VALUE_POOR` (§6.6) |
| Request refused at the provider's admission gate because it names an offering or a process outside the scope (SoW §5.2, §5.2.1) | stop (§4.6) | `STOPPED`, class `scope`, recorded about the client |
| Request refused at the admission gate as over the agreed volume (SoW §5.6) | stop (§4.6) | `STOPPED`, class `volume`, recorded about the client |
| Formation refused for an unmet qualification named in a typed refusal (SoW §12.1) | stop (§4.6) | `STOPPED`, class `qualification`, recorded about the countersigning party |
| Formation or a request refused on a ground the document does not state (SoW §12.1 rule 3) | fact about the provider | `REFUSED_UNSTATED`; counted in `unstated_refusals_90d`; not quality-scored |
| A dispute under an engagement that names an Agent NDA (SoW §5.16) and cites a claim of breach of it, concluded by an arbiter verdict that finds the breach and places it on the respondent (SoW §5.10.1) | resolution of the claim (§4.8) | `NDA_BREACH`, upheld, basis `arbiter`; shown in the NDA record (§4.9); not quality-scored |
| The same dispute settled under `escalate_to_owners` by a record both owners signed that states the breach (SoW §5.10) | resolution of the claim (§4.8) | `NDA_BREACH`, upheld, basis `owners`; not quality-scored |
| The same dispute concluded by a verdict or a signed settlement that finds no breach | resolution of the claim (§4.8) | the claim is `dismissed` |
| The same dispute ended by the posture's fallback with no finding, a refund under `refund_on_failed_task`, or a termination for cause that cites the agreement (SoW §5.9) | fact, recorded | the claim stays as it was; none of these upholds or dismisses it |

The completion-with-missing-artifact mapping deserves its sentence of rationale:
a subject that claimed completion without producing what the document names was
wrong while confident, and the fact that a runtime rather than a human caught it
does not change the class of the failure.

Concluding at the cap is the arrangement working as designed. Time and materials
work is best effort, and the cap is the buyer's budget rather than a promise the
provider made about an artifact. Scoring the conclusion would let the size of a
buyer's budget move a provider's score, so it is recorded as a fact and left
unscored, which is the treatment terminations already get.

Because time and materials work names no deliverable, there is nothing to accept,
and the accepted and rejected rows above MUST NOT be used for it. A buyer who
rejected would be rejecting something the document never promised. The buyer is
asked a different question instead, and the answer is a value judgment, defined
in §6.6.

An engagement review satisfies the witnessed-interaction rule (§6.2) by
construction: the review's signature tag (`agent-sow-review-v1`) binds it to an
engagement whose signed task history the reporter holds. A bureau MUST verify
that binding rather than assume it, and MUST apply the same eligibility rules to
review-derived attestations as to any other (one per interaction, in-window,
non-excluded).

Evidence from outside engagements (one-off mesh calls observed by a reporter)
remains valid under §4.2 unchanged. Engagements are the primary source, not the
only one.

### 4.5. Attribution

Every fact carries an `interaction_id`; every fact for a call made *by an agent in
service of another interaction* carries the `parent_id`. This makes the call DAG
recoverable from the ledger.

Accountability defaults to the direct callee. If A called B and B's subcontractor C
failed, the caller's evidence lands on B. B chose C and didn't verify the work,
the same as a general contractor. Statistical re-attribution across many traces is
possible *because* parent ids exist, but it is an analysis someone runs later, not a
scoring rule in this document. **Record the DAG now; argue about blame later.
The first is unbackfillable, the second is not.**

### 4.6. Requests stopped before the work

Some requests never reach the agent they were sent to. A runtime gate refuses
them at admission, a screener holds them for the owner, or a platform refuses
the act because the authority behind it does not check out. A **stop** is such
a request: one refused or held before the subject began the work, decided by a
rule, a screener, or a person, and never by the subject's own judgment of the
request. Who decided is the `decided_by` member that every refusal carries
under the Common Agent Specification (its §4.7).

Two principles govern every stop, and every rule below follows from them.

1. **A stop says nothing about the intended recipient's work.** The recipient
   never saw the request, so a stop MUST NOT enter the recipient's quality pool
   (§7.1), its candor statistics, its facts, or any report about it. A bureau
   MAY show a recipient the stops addressed to it in its own subject-scoped
   excerpt (§4.1), and MUST NOT serve them to anyone else.
2. **An agent never loses standing for refusing.** The same holds when the
   agent itself refuses a request it judges malicious or outside its declared
   offerings: that refusal is `REFUSED` (§5), and it never scores against the
   agent (§5, §6.2).

A stop is evidence about one party at most: the sender, in the sender record of
§4.7, and only for the classes the table below names. A reporter submits a stop
as a `stopped` entry signed with the reporter's key:

```json
{
  "action": "stopped",
  "subject": "Scout.lee@example.net",
  "detail": {
    "interaction_id": "itx_51d2…",
    "reporter": "https://runtime.example.net",
    "class": "screening",
    "stage": "delivery",
    "ground": "Content instructs the reader to forward stored documents.",
    "decided_by": "person",
    "resolution": "blocked",
    "recipient_anchor_hash": "sha256:…",
    "solicited": false,
    "envelope_digest": "sha256:…",
    "sender_signature": "<base64>",
    "screening_provider": { "id": "example-guard", "policy_version": "2026-08-01" },
    "at": "2026-10-11T09:14:52.006Z"
  }
}
```

`class` is one of the five sender-record classes in the table below: `screening`,
`scope`, `volume`, `qualification`, and `mandate`. `stage` names where the stop
happened, using the call site of the Common Agent Specification §7.3 for a
screening stop, and `boundary`, `admission`, `formation`, or `approval`
otherwise. `ground` is the reason the refusal or the verdict named, in its own
words. `resolution` is REQUIRED for the `screening` class and is one of
`blocked`, `released`, and `open`. `solicited` is true when the stopped request
answers a request the recipient itself sent, which a reporter tells from the
parent or correlation id the request carries.

| Where the request stopped | Class | Recorded about | Effect |
|---|---|---|---|
| Screening hold (Common Agent Specification §7.3; Agent Messaging's screening extension, EXT-10 §6) that the owner then blocked | `screening` | the sender | counted in the sender record |
| Screening hold that the owner released | `screening`, `resolution: released` | the screening provider | never counted against the sender; counted in the provider's statistics |
| Screening hold not yet resolved, or expired unresolved | `screening`, `resolution: open` | nobody | recorded, and counts for nobody |
| Screening `flag` verdict, delivered with the reason | none | nobody | no stop; corroborates a later `REFUSED` on the same interaction (§8.2) |
| Refusal at the boundary for an undeclared offering, or for a workspace or authority the offering does not declare (Common Agent Specification §4.6, §6.11), and the Agent SoW scope refusals of §4.4 | `scope` | the sender | counted in the sender record |
| The Agent SoW volume refusal of §4.4 | `volume` | the sender | counted in the sender record |
| The Agent SoW qualification refusal at formation of §4.4 | `qualification` | the countersigning party | counted in the sender record |
| Act refused at approval under Agent Mandate §7, or at a resource proxy under its §7.1, with the failing check named | `mandate` | the party whose act was refused | counted in the sender record |
| Door decisions under Agent Messaging's admission extension (EXT-6): a held or blocked sender, a knock | none | nobody | no stop of record, and a reporter MUST NOT submit one |
| The inbound protections that drop silently, and the typed too-large refusal (Common Agent Specification §4.8) | none | nobody | no stop of record, and a reporter MUST NOT submit one |
| A refusal with a quote or an estimate because the budget does not cover the work (Common Agent Specification §5.4; Agent SoW §5.4.3, §5.5.1), and `INPUT_NOT_UNDERSTOOD` (Common Agent Specification §4.7.1) | none | nobody | no stop of record; these are ordinary commercial and input answers |
| Refusal because of the recipient's own condition: a lapsed guest's refusal (Agent Messaging's guest standing extension, EXT-13 §5), an allowance at zero (EXT-8), a cap reached (Agent SoW §5.5.5) | none | the recipient | fact `UNAVAILABLE` (§5), never a quality event |
| Refusal by the sender's own runtime or operator: a per-guest rate limit or the platform's daily ceiling for guests (EXT-13 §7), or the sender's own allowance | none | nobody | no stop of record, because a party limiting itself is no evidence against it |

A bureau MUST accept a `stopped` entry only when all of these hold:

1. **A configured reporter submitted it.** The reporter is the runtime, node, or
   platform on the recipient's side that applied the gate or carried the hold.
   It is on the bureau's configured list (§4.2), and its signature verifies.
2. **It is witnessed.** The entry carries the signature the sender made over
   the request, or over the envelope that carried it, and the bureau verifies
   that signature against the sender's currently resolved identity before it
   records the stop. A stop the bureau cannot tie to the sender's own signature
   is only the reporter's claim, and the bureau MUST reject it. The bureau MUST
   NOT serve the request's content to anyone, and SHOULD keep only its digest
   once the signature has been checked.
3. **It names a class and a ground.** A refusal that names no ground, or names
   a ground that the governing declaration or document does not state, is the
   recipient refusing. It is recorded as `REFUSED_UNSTATED` (§5) and is never
   a stop.
4. **The recipient is somebody else.** A stop where the recipient shares the
   sender's anchor or operator is recorded and counts for nobody.

A stop never becomes an attestation, and nobody can file an attestation on a
stop, because no fact about the recipient exists for it to match (§6.2).

### 4.7. The sender record

A party whose requests other parties' protections keep stopping is showing
something a counterparty may want to know before it takes work from that party
or sends it work. The **sender record** is the bureau's count of those stops,
attributed to the sender's identity and grouped by its anchor in the
organization report (§8.5). It is a record of facts: it needs no enrollment, a
bureau serves it for any sender a configured reporter observed, and it carries
counts only, with no score.

A bureau computes the sender record from accepted `stopped` entries in a window
(RECOMMENDED: 90 days, the window of the other facts), per class, under these
rules:

1. **Counted per distinct refusing party.** The number that matters is how many
   distinct recipient anchors stopped the sender in the window. Recipients that
   share an anchor or an operator count as one. A bureau MUST serve that number
   beside every count, with the largest refusing anchor's share of the class,
   in the manner of the concentration fields of §8.2.
2. **A threshold before anything is served.** A bureau MUST NOT serve a class
   until at least 3 distinct refusing anchors stand behind it in the window. A
   bureau MAY set a higher threshold, MUST publish the one it uses (§10), and
   MUST NOT set it lower than 3. Below the threshold the class is left out of
   the report, and the report states the threshold, so a reader knows that a
   missing class means fewer refusing parties than that, including none.
3. **Only what a person or a rule decided.** A `screening` stop counts only when
   the recipient's owner blocked the held request (`resolution: blocked`). A
   screener's verdict alone is an opinion the owner bought, and the owner's
   decision is what turns it into a record. The other classes count only when
   the refusal was `decided_by` `rule` or `person`.
4. **Solicited requests do not count.** A stop with `solicited: true` counts for
   nobody, so a party cannot ask a sender a question and then block the answer
   to build a record against it.
5. **Classes are never combined.** A bureau MUST serve each class separately,
   and MUST NOT combine the classes with each other, or any class with quality,
   candor, or facts, into one figure. A `scope` refusal is often an honest
   mistake about what an agent offers, and only the `screening` class reflects
   a judgment about the content itself.
6. **It is never a quality event.** No count in the sender record enters any
   quality pool (§7.1), and that includes the sender's own pool as a subject.
7. **The sender can see and correct it.** The sender's subject-scoped excerpt
   (§4.1) MUST carry every `stopped` entry about it, including those below the
   threshold, with recipient anchors hashed and the content withheld, and the
   data-error correction process of §10 applies to them.

Where its reporters identify the sender of each request they carry, a bureau
SHOULD serve the number of witnessed requests the sender made in the window
beside the counts, because ten stops among a million requests and ten among
twenty are different records.

A bureau MAY keep, for each screening provider named in `stopped` entries, the
number of its holds that owners released and the number they blocked. A
provider whose holds owners mostly release is a provider whose verdicts carry
little information, which is the evaluator rule of §6.5 applied to screeners.

### 4.8. Claims of breach of an Agent NDA

An Agent NDA (https://agentnda.net) is a signed non-disclosure agreement
between parties whose agents work together. Its promises are that the
recipient uses the material only for the purpose, shows it only to the people
and services the agreement names, and returns or destroys it at the end. No
runtime can watch any of that, so Agent NDA grades those promises `recorded`
(Agent NDA §3) and defines no machine that decides breach (Agent NDA §5.9). No
reporter can measure a leak, and a leak never arrives as a fact. What the
record does hold is who signed which version of the agreement, what was
released to whom and when, and what a forum the parties chose later decided.
This section defines how a party files a claim of breach, what the bureau
checks, and the narrow conditions under which a claim counts. §4.9 says how
claims are shown.

One principle governs the section: **a claim remains an accusation until the
respondent, a forum the respondent agreed to, or a court says otherwise.** A
filed claim is shown as an open claim. It never enters a quality pool (§7.1),
a candor statistic, or the facts, and it never becomes an upheld breach on the
claimant's word, on the respondent's silence, or on the bureau's own reading
of the evidence.

**Filing.** A claim is signed with the claimant's agent key: the tag
`fdbk-nda-claim-v1`, one newline, and the JCS canonical JSON (RFC 8785) of the
claim body. The claim's digest, which answers, acknowledgments and
withdrawals sign over, is `sha256:` followed by the SHA-256 of that JCS in
lowercase hex.

```json
{
  "nda": { "id": "nda_dtzv6z8tans9k5s6", "version": 1,
           "digest": "sha256:98e111dee46ccf35e88bf863bd9e6021fb6d635c48a53a751f27ec2802c89c15",
           "ref": "mesh:artifacts:01JB2N7Q4C" },
  "claimant": { "agent": "<public key>", "handle": "Petrel.mari@harborandline.example" },
  "respondent": { "agent": "<public key>", "handle": "Sable.audit@calderafreight.example" },
  "categories": ["solicitation"],
  "disclosures": [
    { "kind": "rfp_release",
      "digest": "sha256:<digest of the release record>",
      "at": "2026-10-22T09:13:05Z" }
  ],
  "found": { "at": "2027-04-09T00:00:00Z",
             "material_digest": "sha256:1904a3f5b73cb54a8c22e36dc0844fbd4543a1605a62c6d6e33367710384304f",
             "note": "The sealed posting body was offered for sale on a public site." },
  "breach_at": null,
  "at": "2027-04-10T16:02:11Z"
}
```

- `nda` names the agreement by the reference shape of Agent NDA §8, with the
  digest of the completed agreement both parties signed. For an agreement
  formed from an open offer, that is the digest of the acceptance, which
  names the recipient, and never the offer digest.
- `categories` names the categories of Agent NDA §5.4 the material falls in.
- `disclosures` lists at least one record that shows the material reached the
  respondent. Each entry names its `kind`, the `digest` of the record, and the
  instant the record states. The kinds are `rfp_release`, a board's release
  record under Agent RFP §5.11.3, which names the agreement and the recipient;
  `sow_task`, a signed task record of an engagement whose `nda` member names
  this agreement (Agent SoW §5.16), whose inputs the claimant furnished; and
  `delivery`, a fact from a configured reporter (§4.2) for a message the
  claimant signed to the respondent, named by its envelope digest. The
  claimant supplies each record with the claim.
- `found` says when the claimant found the material, the digest of what it
  found, and a note. The note is stored and never scored, as for an
  attestation (§6.1).
- `breach_at` is the instant of the breach where the claimant knows it, and
  `null` otherwise.

**What the bureau checks.** A bureau MUST record a claim as open only when all
of these hold, and MUST otherwise record it as rejected, with the reason, in
the claimant's and the respondent's subject-scoped excerpts (§4.1) and nowhere
else, as the next paragraph allows:

1. **The claimant signed it.** The signature verifies against the claimant's
   currently resolved identity, and that identity's agent key is the key in
   `claimant`.
2. **The agreement is the one both parties signed.** The bureau retrieves the
   agreement, its signed bytes hash to `nda.digest`, its signatures verify
   and each is bound to its seat (Agent NDA §6), and the digest is that of a
   completed agreement as the first bullet above requires. A seat that names
   no organization counts only with its owner confirmed against the
   registry, as the agreement's receiving verifier recorded it or, without
   that record, as the bureau resolves it. An unconfirmed owner fails this
   check as a contradicted one does, so a claim never does better because an
   owner could not be resolved. The one exception is the recipient of an
   acceptance of an open offer whose discloser chose `"owners": "any"`
   (Agent NDA §6.1), which counts with an unconfirmed owner. A contradicted
   owner never counts.
3. **The claimant is a party whose material the agreement protects.** The
   claimant's agent key is in a seat of the agreement. In a one-way agreement
   it is the discloser's seat (Agent NDA §5.1).
4. **The respondent is bound by it.** The respondent's agent key is in
   another seat of the same agreement, or is the recipient of the acceptance
   the digest names, so that the respondent is bound under Agent NDA §8.1
   rules 1 or 2. A subcontractor bound through a flow-down agreement (Agent NDA
   §5.5) is a party to that flow-down agreement and to no other. A claim
   against it cites the flow-down agreement and is filed by the party that
   bound it, while the original discloser files against its own counterparty,
   which answers for its subcontractor as §4.5 provides.
5. **The two are different parties.** A claim where the claimant and the
   respondent share an anchor or an operator (§1), or belong to one
   organization (§8.5), is recorded and counts for nobody.
6. **The material is covered.** Every category in `categories` is in the
   agreement's `covers.categories`.
7. **The material reached the respondent while the agreement covered it.** At
   least one record in `disclosures` verifies, names this agreement or an
   engagement that names it, names the respondent's agent key, and states an
   instant from the agreement's taking effect to its end at `ends_at` or by
   termination (Agent NDA §5.2, §7.3).
8. **It is filed in time.** It arrives within the claim window below, and a
   stated `breach_at` falls before the duties ended.
9. **It is the claimant's only open claim on this agreement against this
   respondent.** A later claim from the same claimant anchor on the same
   agreement and respondent is recorded as an amendment to the first, and
   only the claim's latest state is shown.

The bureau checks only these. It does not read the material, decide whether a
leak happened, or decide whether an exclusion of Agent NDA §5.6 applies, such
as material that was already public. Those questions belong to the forum.

**What a rejection keeps.** A bureau MAY keep a rejected claim as its digest,
the number of the check that failed, and the reason, in place of the claim
and the records it cites, and SHOULD bound how many rejections it records in
a day from one claimant and against one respondent. Anyone who holds an agent
key can file a claim against anyone, and a bureau that recorded every rejected
claim in full would let any filer write data of its choosing into another
subject's history, without bound and for good, since entries are never
deleted. A respondent that wants the whole claim can ask the claimant for it,
and the digest lets it check that what it gets is the claim that was filed.
A claim whose signature does not verify against the key in `claimant`, or
whose signing key the bureau can resolve to no identity, is no claim of
anyone the bureau can name, and a bureau MAY refuse it without recording it
at all.

**Answers.** The respondent MAY answer any claim about it, signed with its
agent key, or with the owner key that signed its seat, under the tag
`fdbk-nda-answer-v1` over the claim's digest and the answer text. It may say,
for example, that an exclusion applies, that the material came from somewhere
else, or that the claim names the wrong party. A respondent MAY answer more
than once, and the latest answer is the current one. The bureau records each
answer as an `nda_answered` entry, and every report that shows the claim
shows that an answer exists and when it was made (§4.9).

**What makes a claim count.** A claim leaves the `open` state only by an
`nda_resolved` entry, and a claim is upheld only on one of these bases:

1. **`acknowledged`.** The respondent signed an acknowledgment of the breach
   under the tag `fdbk-nda-ack-v1` over the claim's digest, with its agent key
   or with the owner key that signed its seat. For a seat that names an
   organization, the acknowledgment carries the signer's mandate, as acts on
   such a seat do (Agent NDA §6.2, §7.3).
2. **`arbiter`.** An arbiter verdict signed under `agent-arbiter-verdict-v1`
   finds the breach and places it on the respondent, and its basis cites the
   claim. The arbiter is one the parties bound under the arbiter posture of an
   engagement that names this agreement (Agent SoW §5.10.1, §5.16), or one
   both owners appointed for this claim by a countersigned appointment under
   the same role contract. The bureau verifies the verdict's signature, the
   binding or the appointment, and the independence facts the role requires.
3. **`owners`.** A settlement under the `escalate_to_owners` posture (Agent
   SoW §5.10), signed by both owners, states that the respondent breached the
   agreement.
4. **`court`.** A court, or an arbitral tribunal outside this system, found
   the breach, and the bureau recorded the finding under its published
   procedure (§10), by which a named person at the bureau checked the cited
   record. The resolution carries the forum, the citation, the date of the
   finding, and who at the bureau checked it. This is the one basis that rests
   on the bureau's own check, so a report MUST name it wherever it shows the
   breach.

The other resolutions are:

- `dismissed`: a forum under bases 2 to 4 found no breach, or both owners
  signed a settlement stating that there was none;
- `withdrawn`: the claimant signed a withdrawal under `fdbk-nda-withdraw-v1`
  over the claim's digest;
- `set_aside`: a later finding of a forum under the same basis, or of a court
  reviewing the earlier finding, reversed an upheld breach, or the data-error
  process of §10 found that the claim named the wrong agreement or the wrong
  party. The upheld entry stays in the ledger, and the claim is shown as set
  aside;
- `lapsed`: the claim stayed open for the whole open period below with no
  resolution.

None of these upholds a claim: the claim and the records it cites, including
a release record or a digest of the leaked material that matches the
discloser's (a match proves whose material it is and says nothing about who
leaked it, as Agent RFP's security considerations note); the respondent's
silence or its failure to answer; a dispute that ended by its fallback with
no finding; a refund under `refund_on_failed_task`; a termination for cause;
a screener's verdict; and claims from other claimants.

**Windows.** The attestation window of §6.2 does not apply. A leak is often
found months after the work, and the duties of an Agent NDA outlast the
agreement by its survival period (Agent NDA §5.2). Three windows apply
instead, and a bureau MUST publish each (§10):

- **The claim window.** A claim MAY be filed from the first disclosure it
  cites until the filing period has passed after the duties ended. The
  duties end when the survival period ends, counted from `ends_at` or from
  termination, and, for an agreement without `survival`, when the agreement
  ends. The filing period is RECOMMENDED to be 365 days and MUST NOT be less
  than 90 days.
- **The open period.** A claim with no resolution after this period from its
  filing is shown as `lapsed` (RECOMMENDED: 365 days). A resolution that
  arrives later still lands, because a court can take longer than any window
  a bureau sets, and a lapsed claim that is later upheld is shown as upheld.
- **The record period.** Every claim is shown in reports for this period
  from its latest entry (RECOMMENDED: 1825 days, five years, and MUST NOT be
  less than 1095 days). After it, the claim stays in the ledger and in the
  subject-scoped excerpts and leaves reports.

A claim is a dated record and is never decayed by §7.2.

### 4.9. The NDA record

The **NDA record** is the part of a report that shows claims of breach about
a subject and the claims the subject itself filed. It is a record of dated
findings and counts, served under these rules:

1. **Upheld breaches are listed with their dates.** Each upheld breach in the
   record period appears as one entry with the date it was upheld, its basis,
   the categories, the agreement's direction (Agent NDA §5.1), the salted hash
   of the claimant's anchor, and whether the respondent answered and when.
   Several upheld claims on one agreement against one respondent are one
   entry, with the latest date.
2. **Open claims are counts.** Open claims appear only as a count, with the
   number of distinct claimant anchors behind them, the earliest filing date,
   and the number the respondent answered. Claimants that share an anchor or
   an operator count as one. An open claim is never listed as an entry, never
   presented as a breach, and never shown as `NDA_BREACH`.
3. **Closed claims stay visible as what they became.** Dismissed, withdrawn,
   set aside, and lapsed claims in the record period appear as counts in
   their own states, so a reader can see that a claim was made and how it
   ended, including when it ended in the respondent's favour.
4. **Nothing names the agreement or the claimant.** A report MUST NOT carry
   the agreement's identifier or digest, the claimant's identity, the note, the
   answers' text, or the records a claim cites. An Agent NDA can protect the
   fact that the parties work together (the `relationship` category of Agent
   NDA §5.4), and a report must not disclose what the agreement protects. The
   bureau serves those details only to the claimant and the respondent, in
   their subject-scoped excerpts.
5. **It is never a score.** No part of the NDA record enters any quality pool
   (§7.1). A bureau MUST serve it separately, and MUST NOT combine it with
   quality, candor, the facts, or the sender record (§4.7) into one figure.
6. **Claimants have a record too, shown to those it concerns.** A party's
   NDA record carries, under `filed`, the count of claims it filed in the
   record period in each state. A party whose claims are mostly dismissed or
   withdrawn shows that, as an evaluator's record shows its partiality
   (§6.5). A bureau MUST serve `filed` only in the party's own
   subject-scoped excerpt (§4.1) and in the excerpt of a respondent of one
   of the party's claims, beside that claim, and MUST NOT put it in any
   report another reader can fetch. A public `filed` would move at the same
   moment as the respondent's open count, and anyone polling both reports
   could then tell who filed against whom and that the two have an
   agreement, which rule 4 forbids. The respondent of a claim, who already
   knows the claimant, sees the claimant's record and can put it before the
   forum, which is where a pattern of dismissed claims matters.
7. **It needs no enrollment.** The respondent signed an agreement that names
   its key, and a finding against it is a finding the bureau did not solicit
   or judge. A bureau serves the NDA record for any subject, enrolled or not,
   in a facts-only report as well (§8.3).
8. **The respondent can see it and answer it.** The respondent's
   subject-scoped excerpt (§4.1) MUST carry every claim about it with every
   record the claim cites, and every rejected claim about it, which may be
   kept as its digest, its failing check and the reason (§4.8, What a
   rejection keeps). The data-error process
   of §10 applies to wrong agreements, wrong parties, and failed
   deduplication. Disagreement with a finding is not a data error: the
   respondent answers on the record and takes it to the forum.
9. **It lands on the party that was bound.** The subject is the agent whose
   key is in the respondent's seat, whether that party was the provider or the
   client in the work. The organization report (§8.5) counts the NDA record
   across its members. Where the respondent's seat names an organization
   (Agent NDA §5.1), the organization report for that organization's charter
   counts it as well, because the organization signed the agreement through
   that seat.

```json
"nda": {
  "record_days": 1825,
  "upheld": [
    { "upheld_at": "2027-06-02T…", "basis": "arbiter",
      "categories": ["solicitation"], "direction": "one_way",
      "claimant_anchor_hash": "sha256:…",
      "answered": true, "answered_at": "2027-04-14T…" }
  ],
  "open": { "count": 1, "claimants": 1, "earliest": "2027-08-19T…", "answered": 0 },
  "closed": { "dismissed": 1, "withdrawn": 0, "set_aside": 0, "lapsed": 0 }
}
```

In the subject's own excerpt, and in a respondent's excerpt beside a claim
by this subject, the record also carries `filed`:

```json
"filed": { "open": 0, "upheld": 0, "dismissed": 0, "withdrawn": 0,
           "set_aside": 0, "lapsed": 0 }
```

An empty NDA record states that this bureau holds no accepted claim about the
subject in the record period. It says nothing about agreements no claim was
ever filed under, and a consumer MUST NOT present it as a finding that the
subject kept every agreement it signed.

## 5. Outcomes

One taxonomy, used by facts, attestations, probes, stops, and claims of
breach alike. Every interaction resolves to exactly one code. `NDA_BREACH` is
the exception: it is recorded about a party to an agreement, and never
replaces the code of any interaction (§4.8).

| Code | Meaning | Quality value |
|---|---|---|
| `OK` | Succeeded; caller accepted the work | 1.0 |
| `OK_CORRECTED` | Succeeded after caller-driven retry or correction | 0.6 |
| `DECLINED` | Subject declined the task up front | excluded (candor stat) |
| `REFUSED` | Subject refused a request it judged harmful or outside its declared offerings | excluded (refusal stat, §8.2) |
| `REFUSED_UNSTATED` | Subject's runtime refused on a ground no declaration or document of the subject states (§4.6) | excluded (fact stat) |
| `FAILED` | Failed and said so | 0.15 |
| `FAILED_SILENT` | Wrong, but confident. Caller discovered the failure | 0.0 |
| `CONTRACT` | Violated a declared promise (§9) | 0.0 |
| `UNREACHABLE` | Transport failure; no answer | excluded (fact stat) |
| `UNAVAILABLE` | Subject's own runtime refused because of the subject's own condition: lapsed standing, an exhausted allowance or cap, a ceiling (§4.6) | excluded (fact stat) |
| `STOPPED` | A gate, a screener, or a person stopped the request before the subject saw it (§4.6) | excluded; never about the recipient; may count in the sender's record (§4.7) |
| `VALUE_OK` | Buyer judged the spend worthwhile; no deliverable was promised (§6.6) | 1.0, weighted per §7.6 |
| `VALUE_POOR` | Buyer judged the spend not worthwhile; no deliverable was promised (§6.6) | 0.0, weighted per §7.6 |
| `NDA_BREACH` | A party bound by an Agent NDA breached it, as the respondent acknowledged or a forum or a court found (§4.8) | excluded; never about an interaction; shown in the NDA record (§4.9) |

Deliberate asymmetries, because a taxonomy is an incentive schedule:

**Declining is free.** `DECLINED` never scores against quality. It feeds the candor
statistics (§8.2) instead. An agent that knows what it doesn't know is exhibiting
the behavior this whole system exists to find, and a scoring rule that punishes
refusal pays agents to bluff.

**Refusing is free too.** `REFUSED` is the agent's own judgment that a request
was harmful or outside what it offers, made by its model (`decided_by: "model"`
under the Common Agent Specification §4.7). It never scores against quality and
never counts in `decline_rate`, so an agent that turns down a malicious request
loses nothing for doing it. A `DECLINED` task is work the agent offers and chose
not to take, and the candor statistics exist to show that choice. A `REFUSED`
request is one the agent was right to turn away, and it is counted on its own
(§8.2), with the share that a screener or a stop corroborated, so an agent that
files hard work under refusal is visible doing it.

**A stop belongs to nobody's work.** `STOPPED` is recorded when a rule, a
screener, or a person other than the subject stopped the request first. The
subject never saw the request, so nothing about it can count for or against the
subject (§4.6). `UNAVAILABLE` is the subject's runtime saying the subject cannot
take work at all just then, which is a fact about availability, recorded like
reachability and left out of quality.

**Honest failure outranks confident failure.** The 0.15 for `FAILED` against the
0.0 for `FAILED_SILENT` is small, but it is the entire incentive to fail loudly.
The distance between those two numbers is the price of honesty; a bureau MUST NOT
set it to zero.

**The last two codes answer a different question.** `VALUE_OK` and `VALUE_POOR`
do not say the work was accepted or rejected. They say the buyer judged the spend
worthwhile or not, on engagements where nothing was named that either party could
accept (§6.6). They enter the pool at a reduced weight (§7.6), and reports
disclose their share of it (§8.2), so a value judgment is never presented as an
acceptance. A bureau MUST NOT record an acceptance code for work that promised
effort rather than a deliverable, and MUST NOT record a value judgment for work
that named deliverables.

**A breach of confidence is kept apart from the work.** An agent can deliver
every task, have every deliverable accepted, and still leak what it was given.
`NDA_BREACH` says nothing about the quality of the work, and scoring it would
put a forum's finding into a formula that is otherwise a function of
witnessed evidence. It is shown in its own part of the report instead, with
its date and basis (§4.9), and the report shows it wherever it shows the score
(§8.2). A claim that has not been upheld never appears under this code.

## 6. Attestations

### 6.1. Form

An attestation is the evaluator's signed statement about one interaction:

    fdbk-attest-v1:<interaction_id>:<subject>:<capability>:<outcome>:<ISO-8601 timestamp>

signed with the evaluator's agent key bound under Personal Agent Naming, submitted with an optional
free-text note (stored, never scored, because text is for the subject's
remediation and not for the formula).

### 6.2. Eligibility

A bureau MUST reject an attestation unless:

1. The `interaction_id` matches a fact from a configured reporter. **No attestation
   without a witnessed interaction.** This single rule removes drive-by reviews,
   most ballot stuffing, and all rating of rivals one has never called.
2. The evaluator's signature verifies against its currently resolved Personal Agent Naming card.
3. It is the evaluator's first attestation for that interaction (later ones are
   recorded as amendments, and only the final state scores).
4. The attestation arrives within the attestation window (RECOMMENDED: 30 days from
   `ended_at`). Late evidence is stale evidence.
5. The subject did work on the interaction. A bureau MUST reject an attestation
   on an interaction that resolved to `DECLINED`, `REFUSED`, `REFUSED_UNSTATED`,
   `UNAVAILABLE`, or `STOPPED` (§5). There is no work to judge, and a sender
   that was turned away MUST NOT be able to answer the refusal with a rating.
6. Its outcome is not `NDA_BREACH`. A breach reaches the record only as a
   claim under §4.8, and an attestation that names it MUST be rejected.

### 6.3. Conflicts between attestation and derived outcome

If an attestation contradicts the fact's derived outcome, the attestation wins for
quality scoring, because the caller knows things the transport cannot. Both are
kept, and the disagreement rate per evaluator is a published evaluator statistic
(§6.5). Facts are never edited to agree with opinions.

### 6.4. Exclusions

A bureau MUST exclude from scoring (recording the exclusion in the ledger):

- **Self-dealing:** attestations where the evaluator's anchor equals the subject's
  anchor, both resolve to the same operator (§1), or both are members of one
  organization (§8.5). Your other agent is not a reference, and neither is your
  colleague's.
- **Undisclosed competition, where declared:** subjects MAY declare competitor
  anchors at enrollment; attestations from declared competitors are recorded,
  served in aggregates, but down-weighted or excluded per the bureau's published
  policy.
- **Rate-limit excess:** more than the bureau's published per-evaluator-per-subject
  ceiling in a window.

### 6.5. Evaluators are subjects too

An evaluator that attests is accruing a track record. Bureaus MUST maintain, per
evaluator: volume, outcome distribution, disagreement rate with derived outcomes,
and agreement with truth where probe ground truth passed through the evaluator.

Two rules, one distinction:

- **Bias is correctable.** An evaluator that is systematically harsh or generous but
  rank-orders subjects consistently is a good instrument with an offset. Bureaus
  SHOULD recenter, not punish.
- **Noise is not.** An evaluator whose ratings carry no information (every subject
  gets `OK`, or the distribution is indistinguishable from random) SHOULD be
  down-weighted toward zero.

The weighting method and its version MUST be published (§10). The full statistical
treatment (joint estimation of subject quality and evaluator reliability) is
explicitly a future formula version; v1 bureaus satisfy this section with the
recorded statistics and the two rules above.

### 6.6. Value judgments

Some engagements promise effort, not deliverables. Under the time and materials
arrangement in Agent SoW (https://agentsow.com), the buyer sets a mandatory
not-to-exceed cap, funds are reserved for a window, and reaching the cap concludes
the work. No artifact is named, so there is nothing for either party to point at
when the engagement ends. Acceptance is the wrong question there, and the codes in
§5 that carry an acceptance meaning MUST NOT be used for it. Reusing them would
let a buyer record a rejection of something the document never promised.

A **value judgment** is the evaluator's signed answer to the question the
arrangement does support: was the spend worth it. It is an attestation and it
resolves to `VALUE_OK` or `VALUE_POOR`:

    fdbk-value-v1:<interaction_id>:<subject>:<capability>:<outcome>:<amount>:<currency>:<units>:<ISO-8601 timestamp>

signed with the evaluator's agent key bound under Personal Agent Naming. `amount` and `currency` are the
settled spend; `units` is the metered quantity that spend paid for, in the units
of the engagement's meter. Both SHOULD be present, and they are signed rather than
attached as commentary so a reader can trust them. A poor rating on a large
engagement and a poor rating on a small one are not the same evidence, and without
the numbers a reader cannot tell them apart. A bureau that accepts a value
judgment without them MUST record it as carrying no amount and MUST show that
absence wherever the judgment is surfaced.

`VALUE_POOR` requires a reason, on the same rule that governs rejection in Agent
SoW §15. An unreasoned negative judgment is not evidence and MUST be rejected. The
reason text is stored and never scored, per §6.1.

The interaction a value judgment refers to is the engagement itself when the work
produced no task records. The witnessed-interaction requirement of §6.2 is
satisfied by the runtime's signed fact for that engagement, either the
concluded-at-cap fact of §4.4 or the engagement's metering record, rather than by
a task fact. The requirement is met by a different record, not waived.

Every other guard applies unchanged: the eligibility rules and the attestation
window (§6.2), one judgment per interaction per evaluator with later ones recorded
as amendments (§6.2), the exclusions for self-dealing, declared competitors, and
rate-limit excess (§6.4), the enrollment gate that keeps quality evidence off
UNENROLLED subjects (§3.1), and the precedence in §6.3 under which a review
outranks a mechanical form check, which outranks a transport fact.

This is also the evidence source that reaches work the transport never saw. An
agent whose engagement is a week of research inside one long conversation produces
no task facts, no deliverable checks, and no derived outcomes, so the mechanical
layers have nothing to record. The buyer's signed judgment is the only evidence
there is. Facts remain the substrate wherever the mesh can measure, and where it
can measure nothing, this is the difference between an agent with a record and an
agent with none.

## 7. Scoring

### 7.1. The pool

For a (subject, capability) pair, the quality pool is every non-excluded scored
event: attested outcomes, derived outcomes with no overriding attestation, and probe
results. Each event `i` contributes a value `v_i` from the table in §5 and a weight
`w_i` from §7.2. Stops and the sender record (§4.6, §4.7), claims of breach
and the NDA record (§4.8, §4.9), and the codes that §5 marks excluded never
enter a pool.

### 7.2. Decay

    w_i = 2 ^ ( -age_days_i / H )

`H` is the half-life in days. Default **60**; a bureau MAY choose differently but
MUST publish it and MUST use one value per formula version. Evidence never expires
at a cliff; it fades. An agent that was great a year ago and absent since is not
great now, and an agent that was bad a year ago and diligent since is not bad now.

`age_days_i` is the time from the end of the interaction the event scores to the
instant the score is computed, which for a served score is the report's
`issued_at`, counted in days of 86,400 seconds and kept as a real number
without rounding. The end of an interaction is the `ended_at` of its fact
(§4.2), and of a probe, the `ended_at` the probe's reporter recorded. An
attestation takes the age of the interaction it is about. Its signature can
come weeks after the work, inside the attestation window, and a late judgment
must not make old work look recent. A value judgment on an engagement with no
task records takes the `ended_at` of the engagement's fact (§6.6).

### 7.3. The posterior

    a = 1 + Σ ( w_i · v_i )
    b = 1 + Σ ( w_i · ( 1 − v_i ) )

    mean  = a / ( a + b )
    sd    = sqrt( a·b / ( (a+b)² · (a+b+1) ) )
    lcb   = max( 0, mean − 1.2816 · sd )
    n_eff = a + b − 2

This is a Beta posterior with a uniform prior, summarized by its mean and a lower
confidence bound at roughly the 10th percentile. It is ordinary arithmetic with no
iteration, no randomness, and no lookup tables, and therefore recomputable by anyone
holding the events (verification levels, §8.4). This formula is
**`fdbk-score-1`** and every report names the formula version it used.

`n_eff` is the sum of the weights `w_i`, the effective number of events in the
pool. The two 1s are the prior, and `n_eff` never counts them: where a portfolio
prior replaces them (§7.5), `n_eff` is `a + b` less the two prior terms. The
constant 1.2816 is exact as written. The test vectors of §14 fix every value
this section defines for a set of ledgers, so two implementations can confirm
that they compute the same score.

**Consumers MUST rank by `lcb`, not `mean`.** The lower bound is where the evidence
runs out; the mean is where the marketing starts. Three lucky calls can produce a
mean of 0.94; they cannot produce an lcb of 0.94.

### 7.4. UNPROVEN

If `n_eff < 20` (formula constant of `fdbk-score-1`), the capability is UNPROVEN and
the report says so instead of serving lcb/mean as if they were seasoned.
An UNPROVEN subject MUST NOT be presented by a bureau as ranking above any RATED
subject. Unknown is not a compliment: if a clean slate outranks a known-mediocre
record, every bad actor's best move is a new slate.

### 7.5. Priors from the portfolio

A bureau MAY replace the uniform prior (the two 1s in §7.3) with a prior derived
from the anchor's other RATED agents, so a proven publisher's new agent starts warm.
If it does: the prior's weight MUST NOT exceed the equivalent of 10 effective
events, the report MUST disclose that a portfolio prior is in effect, and direct
evidence MUST dominate as it accumulates. A prior is a head start, not an
inheritance.

Written as numbers, a portfolio prior is a pair `a0`, `b0` that takes the place
of the two 1s in `a` and `b`, with `a0 + b0 − 2` no more than 10. It moves
`mean`, `sd`, and `lcb`. It does not move `n_eff`, which counts direct evidence
only (§7.3), so a new agent reaches RATED on its own record and never on its
publisher's (§7.4). The organization report of §8.5 shows a prior's weight as
`weight_events`, which is `a0 + b0 − 2`.

The prior for a capability MUST be derived only from the anchor's other agents
that are RATED for that same capability, because a publisher's record at code
review says nothing about its new agent's translations. Where no other agent of
the anchor is RATED for the capability, the uniform prior applies. The agents a
prior may draw on are the anchor members of the organization report (§8.5) and
no others: an agent that belongs to an organization only through an Agent
Mandate charter's membership lends nothing to a prior. The organization report
names, for each member, whether a portfolio prior is in effect and from how
many agents it was drawn, so the head start is visible at both ends.

### 7.6. The weight of a value judgment

A value judgment counts for less than an acceptance of named work. With no
artifact to point at, the rating is more subjective and more disputable, and the
honest way to price that is one constant a reader can see and argue with, not an
adjustment buried in an implementation.

For a value-judgment event, the decay weight of §7.2 is multiplied by `K_value`:

    w_i = K_value · 2 ^ ( -age_days_i / H )

`K_value` defaults to **0.5**, a constant of `fdbk-score-1` alongside `H` and the
UNPROVEN threshold. As with the half-life, a bureau MAY choose differently, MUST
publish the value it uses (§10.3), and MUST use one value per formula version. It
MUST NOT set `K_value` above 1.0, and SHOULD NOT set it above 0.5: a judgment
about whether money was well spent does not outweigh a judgment about work that
was named and delivered.

Because the multiplier lands on `w_i`, it reduces the event's effect on `mean`,
`sd`, `lcb`, and `n_eff` together. Ten value judgments move a score about as far
as five acceptances and leave the subject closer to UNPROVEN, which is the correct
reading of thinner evidence. Nothing else in §7.3 changes.

The amount and the metered units a value judgment carries (§6.6) are context for
the reader, not inputs to the formula. `fdbk-score-1` does not weight by
transaction value. Value-weighted scoring is named as future work in §12.1 and is
not introduced here by the back door.

Adding this kind changes no score computed before it existed, because no ledger
written before this revision contains a value judgment, so the formula version
stays `fdbk-score-1`. That is a fact about this change, not a general license: any
implementation MUST state the formula version that produced a score it serves
(§7.3, §10.4), and a bureau that changes the outcome values of §5 or the
arithmetic of §7.3 MUST issue a new formula version rather than reuse this one.

## 8. Reports

### 8.1. The report

The answer to a resolution query, signed by the bureau:

```json
{
  "report": {
    "subject": "Coder.ana@example.org",
    "capability": "code-review",
    "enrollment": "RATED",
    "enrolled_at": "2026-03-02T…",
    "quality": { "lcb": 0.902, "mean": 0.931, "n_eff": 412.6 },
    "candor": {
      "decline_rate": 0.11,
      "silent_failure_rate": 0.004,
      "refusals": { "count_90d": 37, "caller_anchors": 21,
                    "top_caller_share": 0.16, "corroborated_share": 0.41 }
    },
    "facts": {
      "reachability_90d": 0.998,
      "latency_ms": { "p50": 820, "p95": 4100 },
      "contract_violations_90d": 0,
      "unstated_refusals_90d": 0,
      "unavailable_90d": 0.002
    },
    "sender": {
      "window_days": 90,
      "threshold_refusers": 3,
      "witnessed_requests": 5120,
      "classes": {
        "scope": { "count": 6, "refusers": 4, "top_refuser_share": 0.5 }
      }
    },
    "nda": {
      "record_days": 1825,
      "upheld": [],
      "open": { "count": 0, "claimants": 0, "earliest": null, "answered": 0 },
      "closed": { "dismissed": 1, "withdrawn": 0, "set_aside": 0, "lapsed": 0 }
    },
    "evidence": {
      "half_life_days": 60,
      "oldest": "2026-03-04T…",
      "newest": "2026-07-31T…",
      "attester_anchors": 63,
      "top_anchor_share": 0.09,
      "probe_share": 0.06,
      "value_judgment_share": 0.12,
      "portfolio_prior": false
    },
    "promises": [ { "id": "p1", "class": "mesh-verifiable",
                     "text": "p95 latency under 5s", "held_90d": 1.0 } ],
    "formula_version": "fdbk-score-1",
    "bureau": "https://agentreputations.com",
    "issued_at": "2026-07-31T18:40:00.000Z",
    "expires_at": "2026-07-31T19:40:00.000Z"
  },
  "bureau_key": "<Ed25519 public key>",
  "bureau_kid": "<key id>",
  "bureau_sig": "<base64>"
}
```

A bureau that keeps one log per subject also puts a `log` member in the
report, naming the subject's head the figures were computed from and the
commitment to check it against (§4.1.1):

```json
"log": { "seq": 415, "head_hash": "b64…", "commitment": 2 }
```

The report is the `report` member. The three members beside it are the
signature envelope, which has the shape Personal Agent Naming §5.3 gives a
signed card, with `bureau_` in place of `registrar_`. The signed bytes, the
keys, and the steps of verification are defined in §8.1.1 to §8.1.3. The file
[conformance/fdbk-report-v1.json](conformance/fdbk-report-v1.json) beside this
document holds a test key, the signed bytes, and the expected signature of a
report and of an organization report, so an implementation can check its
signing byte for byte (§14).

#### 8.1.1. The signed bytes

A report is signed under the tagged-signature convention of this family, the
one Agent SoW §6 and Agent Mandate §4 use. The signed bytes are, in order:

1. the ASCII signature tag, which is `fdbk-report-v1` for a report,
   `fdbk-org-report-v1` for an organization report (§8.5), and
   `fdbk-heads-v1` for a commitment over every subject's log (§4.1.1);
2. one line feed (the byte 0x0A);
3. the JCS (RFC 8785) canonical JSON of the signed object, in UTF-8. The
   signed object is the value of the `report` member for a report, of the
   `organization_report` member for an organization report, and of the
   `heads` member for a commitment (§4.1.1).

The signed object is covered whole. Every member it holds is inside the signed
bytes, at every depth, including `subject`, `capability`, `bureau`,
`formula_version`, `issued_at`, `expires_at`, and any member this version does
not define, so a member cannot be added, removed, or changed after signing
without breaking the signature. A bureau MUST put every statement a consumer
relies on inside the signed object.

Three members are outside the signed bytes: `bureau_key`, `bureau_kid`, and
`bureau_sig`, which sit beside the signed object in the envelope. The signature
cannot cover itself. The key and the key id can stay outside because a consumer
never takes them on the envelope's word: it checks both against the bureau's
published key set (§8.1.2), so a key id changed in transit selects a key the
set does not hold, or a key that does not verify. A bureau MUST NOT add any
other member to the envelope.

JCS fixes one byte string for every value a report can carry. Members are
sorted by the UTF-16 code units of their names at every depth, there is no
whitespace between tokens, strings are escaped in the one way JCS defines, and
numbers are written in the ECMAScript form, so a bureau that stores `0.90` or
`412.60` signs `0.9` and `412.6`. A signed object MUST NOT hold a number that
JCS cannot write exactly: a value that is not finite, or an integer whose
magnitude is above 2^53. A count that large is written as a string. A signed
object MUST NOT repeat a member name, and a consumer MUST reject a report that
does.

The tag keeps the kinds apart. The same object signed under one tag does not
verify under the other, so a report cannot be presented as an organization
report or the reverse (§8.5 rule 4), and a report cannot be presented as a
Personal Agent Naming card, which a registrar signs over canonical JSON with no
tag. The tag is the one place where a report's signature departs from Personal
Agent Naming §5.3. The envelope, the key set, rotation, and pinning are the
same.

`bureau_sig` is the Ed25519 signature (RFC 8032, without prehashing or a
context) over the signed bytes, in base64 with padding (RFC 4648 §4).
`bureau_key` is the bureau's 32-byte Ed25519 public key in the same base64, and
`bureau_kid` is that key's id (§8.1.2).

#### 8.1.2. The bureau's keys

A bureau publishes its report signing keys as a key set at
`GET <bureau>/api/bureau-key`, where `<bureau>` is the HTTPS URL that the
`bureau` member of its reports carries. The key set has the form of Personal
Agent Naming §5.3, with `bureau` in place of `registrar`:

```json
{ "bureau": "https://bureau.example",
  "keys": ["<current>", "<retired>"],
  "key_set": [
    { "kid": "<kid of current>", "key": "<current>", "status": "current", "use": "fdbk-report-signing" },
    { "kid": "<kid of retired>", "key": "<retired>", "status": "retired", "use": "fdbk-report-signing" }
  ],
  "witnesses": [
    { "id": "https://witness.example", "key": "<witness key>", "kind": "cosigner" }
  ],
  "witness_changes": [] }
```

`witnesses` is there for a bureau that keeps one log per subject (§4.1.1),
and names who co-signs its commitments. `witness_changes` lists every change
to that list, in order, each with the signatures of the witnesses on the
list it changes (§4.1.1). A consumer pins `witnesses` with the keys and
moves the pin only along those changes.

The rules are those of Personal Agent Naming §5.3:

1. Every key carries a `kid`, which is the first 12 lowercase hexadecimal
   digits of the SHA-256 of the key's base64 text, so anyone can check a `kid`
   against the key it names. A `kid` is never reused for another key.
2. The current signing key is first, in `keys` and in `key_set`.
3. Rotation is additive. The bureau publishes the new key beside the old one,
   then signs with the new one, and drops the old key only after an overlap at
   least as long as the longest validity of a report it signed with the old
   key. A key the set lists as `retired` still verifies a report. A key the set
   does not list never does.
4. Every key carries `use: "fdbk-report-signing"`, and one key signs both kinds
   of report and the commitments of §4.1.1, which the tag of §8.1.1 tells
   apart. A key whose `use` is anything else MUST NOT verify a report, an
   organization report, or a commitment.
5. A bureau MAY also show its keys on a page for people. The key set at
   `/api/bureau-key` is the one a consumer reads.

A consumer finds the key set from the `bureau` URL it already holds: the
bureau it chose to query, the `bureau` of an entry in an A2A card's Reputation
extension, or the bureau that served an organization report it is following.
It never takes the key set from the report it is about to verify, because a
forged report would name a forged key set.

A consumer MUST pin each bureau's key set on first sight, per bureau, as
Personal Agent Naming §5.3 pins registrar keys, because one global pin would
refuse every correct answer from a second bureau. When a report names a key
outside the pinned set, the consumer MUST NOT accept it silently. It refuses
that report, keeps the pin it holds, fetches the key set again from the bureau,
and extends the pin only when the fresh set lists the new key beside a key it
already pinned, which is what an additive rotation looks like. A fresh set that
shares no key with the pinned one replaces the bureau's keys outright, and the
consumer accepts it only after its operator confirms the change by some means
other than the bureau's own answer.

#### 8.1.3. Verifying a report

A consumer MUST verify every report before it relies on any member, and MUST
discard the report at the first of these steps that fails:

1. **The envelope.** The envelope holds the signed object, `bureau_key`,
   `bureau_kid`, and `bureau_sig`, and no member name repeats in it or in the
   signed object. An absent signature fails here.
2. **The bureau.** The signed object's `bureau` is the URL of the bureau the
   consumer asked.
3. **The key.** The consumer's pinned key set for that bureau holds an entry
   whose `kid` is `bureau_kid`, whose `key` is `bureau_key`, whose `use` is
   `fdbk-report-signing`, and whose status is `current` or `retired`.
4. **The signature.** The signature verifies under that key over the tag, one
   line feed, and the JCS form of the signed object as the consumer parsed it.
   The consumer canonicalizes the object it received, with every member it
   holds. It MUST NOT verify over the bytes as they arrived, which need not be
   canonical, and MUST NOT verify over an object rebuilt from the members it
   understands, which would drop the ones it does not.
5. **The time.** `expires_at` has not passed and `issued_at` is not in the
   future. A grace for clock skew is permitted, RECOMMENDED no more than 60
   seconds, as Personal Agent Naming §5.3 permits for cards.
6. **The answer.** The report's `subject` and `capability` are the ones the
   consumer asked about, and an organization report's `anchor` is the anchor
   it asked about.

7. **The log**, for every report that carries one (§4.1.1). The consumer
   MUST fetch the commitment `log` names and the proof of the subject's slot
   in it, and check that the commitment verifies under the bureau's key with
   the tag `fdbk-heads-v1`, that every witness its pinned witness list, moved
   along `witness_changes`, names for the commitment's `seq` (§4.1.1) has
   co-signed it or holds it, and that the proof folds from a head holding the
   report's `subject`, `seq` and `head_hash` to the commitment's `root`. It
   discards the report when any of these fails. A consumer that cannot get
   the commitment or the proof MUST treat the report as unanchored: it MAY
   rely on the report as verified by the first six steps, and MUST say that
   the report is unanchored wherever it shows the report or passes it on.

A report that passes the first six steps, and the seventh for a report that
carries `log`, is verified at L1 (§8.4). Verification
establishes that the bureau signed these bytes for this window. What the bytes
are worth is the question of the trust model (§11).

### 8.2. Mandatory context

`n_eff`, `enrollment`, `attester_anchors`, and `top_anchor_share` are REQUIRED in
every quality report and REQUIRED in any consumer display that shows the score.
**A score without its sample size is a forgery of confidence.** The concentration
fields are the collusion tell: sixty distinct anchors with a 9% top share is a
reputation; four anchors with a 70% top share is a book club.

`value_judgment_share` is REQUIRED whenever the pool contains a value judgment
(§6.6), and REQUIRED in any consumer display that shows the score. It is the share
of the pool's weight, after §7.6, that came from value judgments. A reader who
cannot separate acceptances of named work from judgments about whether a spend was
worth it is reading two different measurements as one number. A bureau MUST also
serve, on the subject-scoped excerpt of §4.1, the amount and units carried by each
value judgment about that subject, so a subject can see which engagements the
judgments came from.

`refusals` is REQUIRED in the candor block whenever the subject has a `REFUSED`
outcome in the window, and REQUIRED in any consumer display that shows
`decline_rate`. `caller_anchors` and `top_caller_share` are the concentration
fields for refusals, so a reader can see when one caller sent most of what was
refused, which is what a flood of bad requests aimed at an agent looks like.
`corroborated_share` is the share of refusals where a screener flagged or held
the same request, or a gate stopped another request from the same sender in the
window. A bureau MUST NOT combine `refusals` with `decline_rate` or with quality,
and a consumer MUST NOT read a refusal count as a defect.

The `sender` block carries the sender record of §4.7. Whenever a bureau serves
the block, `window_days` and `threshold_refusers` are REQUIRED, and each class
it serves carries `count`, `refusers`, and `top_refuser_share`, all REQUIRED,
and REQUIRED in any consumer display that shows the class. `witnessed_requests`
is served where §4.7 says it should be. A class the block leaves out has fewer
distinct refusing parties than the threshold. A bureau MUST NOT serve a block
with an empty `classes` object as a clean record: an empty block states only
that no class reached the threshold.

The `nda` block carries the NDA record of §4.9. It is REQUIRED in every report
about a subject with an upheld breach, an open claim, or a closed claim in the
record period, and `record_days` is REQUIRED whenever the block is served.
Whenever the block holds an upheld breach or an open claim, it is REQUIRED in
any consumer display that shows the score, the facts, or the enrollment
state. A consumer display MUST show each upheld breach with its date and its
basis, MUST show open claims as claims, with their count and their distinct
claimants, and MUST NOT present an open, dismissed, withdrawn, set aside, or
lapsed claim as a breach. An upheld breach with the basis `court` MUST be
shown as recorded by the bureau's check of the cited finding (§4.8).

### 8.3. Facts-only reports

For UNENROLLED subjects a bureau MAY serve the `facts` block alone, enrollment
state UNENROLLED, no quality or candor blocks. Rationale: reachability is physics,
and physics was never opt-in. The `sender` block is a record of facts as well,
and a facts-only report MAY carry it. The `nda` block is served under §8.2 in a
facts-only report as in any other (§4.9 rule 7).

### 8.4. Verification levels

- **L1**: verify the report signature. Every consumer, every time.
- **L2**: request the subject-scoped event excerpt (with the subject's
  authorization), recompute §7, compare. Confirms the formula was followed.
- **L3**: audit the ledger chain itself, checking hash continuity, reporter
  signatures, and exclusion records. Confirms the evidence wasn't cooked.

A bureau MUST support L2 for the subject itself (self-audit is how an agent
developer debugs a score) and SHOULD offer L3 to independent auditors on published
terms.

### 8.5. Organization reports

Each of an organization's agents is its own subject with its own record. The
**organization report** groups those records at the entity, so a reader can see
the whole of what one publisher or one company runs. It is a view over its
members' records and adds no evidence of its own.

**Membership.** An organization report is keyed by an anchor, and its members
come from one of three bases, each named on the member's entry:

- `anchor`, for an email anchor under Personal Agent Naming: every subject whose
  handle that email owns. This report is a publisher's portfolio.
- `anchor`, for a domain anchor: every subject whose ANS name sits under the
  domain, and, when the domain holds an Agent Mandate charter whose domain
  proof is current (Agent Mandate §5), every subject whose owning email address
  is at the domain. Without such a charter a bureau MUST NOT group handles by
  the domain of their email addresses, because anyone can hold an address at a
  large mail provider.
- `mandate`, for a domain with an Agent Mandate charter: every subject whose
  owning account holds a mandate in force from that charter, which is the
  membership rule of Agent Mandate §9, whatever the subject's own anchor.

Anchor membership does not depend on any person, so it survives personnel
changes. Mandate membership follows the mandates in force, so a revoked mandate
removes its holder's agents from the report from that moment, and the agents
keep their own records unchanged.

```json
{
  "organization_report": {
    "anchor": "harborandline.example",
    "anchor_kind": "domain",
    "charter": { "id": "org_7k2m9q4w1x8e5r3t", "domain_proof": "current" },
    "members": [
      { "subject": "Audit.ops@harborandline.example", "basis": "anchor",
        "member_since": "2026-08-02T…", "enrollment": "RATED",
        "capabilities": [ { "capability": "freight-audit", "state": "RATED",
                            "lcb": 0.884, "n_eff": 233.0 } ],
        "portfolio_prior": false },
      { "subject": "Claims.ops@harborandline.example", "basis": "anchor",
        "member_since": "2026-10-01T…", "enrollment": "UNPROVEN",
        "capabilities": [ { "capability": "freight-audit", "state": "UNPROVEN",
                            "n_eff": 6.1 } ],
        "portfolio_prior": { "from_agents": 1, "weight_events": 10 } },
      { "subject": "Buyer.lee@example.net", "basis": "mandate",
        "member_since": "2026-09-14T…", "enrollment": "UNENROLLED" }
    ],
    "former_members_90d": [
      { "subject": "Quotes.ops@harborandline.example", "basis": "anchor",
        "left_at": "2026-09-30T…", "enrollment": "WITHDRAWN" }
    ],
    "counts": { "RATED": 1, "UNPROVEN": 1, "UNENROLLED": 1, "WITHDRAWN": 0,
                "joined_90d": 2 },
    "facts": { "contract_violations_90d": 0 },
    "self_dealing_excluded_90d": 3,
    "sender": { "window_days": 90, "threshold_refusers": 3, "classes": { } },
    "nda": { "record_days": 1825, "upheld": 0, "members_with_upheld": 0,
             "open": { "count": 0, "claimants": 0 },
             "closed": { "dismissed": 0, "withdrawn": 0, "set_aside": 0, "lapsed": 0 } },
    "formula_version": "fdbk-score-1",
    "bureau": "https://agentreputations.com",
    "issued_at": "2026-10-18T12:00:00.000Z",
    "expires_at": "2026-10-18T13:00:00.000Z"
  },
  "bureau_key": "<Ed25519 public key>",
  "bureau_kid": "<key id>",
  "bureau_sig": "<base64>"
}
```

What the report shows: every member with its basis, its enrollment state, and,
per capability, the state, `lcb`, and `n_eff` its own report serves; whether a
portfolio prior is in effect for it and from how many agents (§7.5); the members
that left in the window; the count of members in each state and of members that
joined in the window, which is where a publisher cycling through fresh
identities shows (§12.1); the sum of the members' contract violations; the
number of attestations excluded in the window because evaluator and subject were
members of this organization (§6.4); and the sender record of §4.7 computed
across the members, counting distinct refusing parties across all of them, under
the same threshold; and the NDA record of §4.9 counted across the members and
across any respondent seat that names the organization, as the number of
upheld breaches, the number of members with one, and open and closed claims
by state, with open claims counted by distinct claimant anchors across all of
them. Each member's own report carries the dated entries.

Rules:

1. **It never replaces a member's report.** A bureau MUST NOT serve a pooled
   quality score, mean, or bound for an organization. The work is done by one
   agent at a time, and a pooled number would let strong agents hide a weak
   one. A consumer about to contract an agent MUST read that agent's own report,
   and MUST NOT present an organization report as a report about any one member.
2. **Every member is listed.** A bureau MUST list every member it knows,
   including UNPROVEN, WITHDRAWN, and UNENROLLED ones, and MUST NOT serve a
   quality figure for an UNENROLLED member (§3.1). An organization cannot keep a
   weak agent out of its own report.
3. **Members cannot vouch for each other.** Attestations between members of one
   organization are self-dealing (§6.4), whatever their basis, and the only way
   one member's record reaches another is the disclosed, capped portfolio prior
   of §7.5.
4. **It is signed as a report is.** The signed bytes, keys, and verification
   are those of §8.1.1 to §8.1.3, under the signature tag `fdbk-org-report-v1`,
   so neither kind of report can be presented as the other. The verification levels of §8.4 apply to each
   member's figures through that member's own report.

## 9. Promises

A promise is declared at enrollment, carried in reports, and classed by how it can
be checked:

- **mesh-verifiable**: checkable per-interaction from facts (latency bounds,
  schema conformance, availability floors). Reporters check these inline
  (`promise_checks`, §4.2); violations resolve the interaction to `CONTRACT`.
- **probe-verifiable**: checkable only by sampling (behavioral claims: "always
  cites sources"). Scored only where a probe program covers them.
- **attested-only**: not checkable at runtime ("we do not retain your data").
  Carried in reports as declarations, clearly classed, and MUST NOT contribute to
  any score. An unverifiable promise is marketing, and a bureau that scores
  marketing is laundering it.

The promises of an Agent NDA are attested-only in this sense: Agent NDA grades
them `recorded`, and no runtime can check them. They never contribute to a
score. A breach of one reaches a report only as a claim under §4.8, and only
as a dated entry in the NDA record once the respondent acknowledged it or a
forum or a court found it (§4.9).

## 10. Bureau obligations

A conforming bureau:

1. MUST maintain the ledger append-only and hash-chained, and never rewrite an
   entry. Corrections append.
2. MUST serve scores that are pure functions of (ledger, formula version), and
   MUST recompute rather than cache across formula versions.
3. MUST publish its formula version, half-life, UNPROVEN threshold, value-judgment
   weight (`K_value`, §7.6), prior policy, evaluator-weighting method and version,
   cooling-off period, attestation window, and rate ceilings, and for claims of
   breach (§4.8) the filing period, the open period, the record period, and
   the procedure by which it records a court's finding. **Publish the method;
   withhold nothing but the tripwires.** Anti-abuse detection thresholds are the one
   category a bureau MAY keep private.
4. MUST version formula changes (`fdbk-score-2`, …) and re-serve historical queries
   under the version that was current at the time, on request.
5. MUST verify every signature it relies on (enrollments, attestations, reporter
   facts) against currently resolved Personal Agent Naming or ANS identities, and pin keys per Personal Agent Naming §5.3.
6. MUST enforce §6.2 eligibility and §6.4 exclusions, and record both in the ledger.
7. MUST give every subject access to its own evidence (subject-scoped ledger
   excerpt) and an L2 recompute path. A subject that cannot see why it scores badly
   cannot improve, and a bureau that cannot show why is not measuring.
8. MUST provide a data-error correction process (wrong subject, wrong interaction,
   failed dedup). Formula disagreements are not data errors; the formula is the
   formula.
9. MUST label WITHDRAWN and UNPROVEN states honestly in every report, and MUST NOT
   serve a quality score for an UNENROLLED subject.
10. MUST rate-limit unauthenticated queries and bound the effect of any
    unauthenticated caller.
11. MUST accept `stopped` entries only under the conditions of §4.6, MUST keep
    every stop out of the intended recipient's records, and MUST NOT let a stop,
    a `REFUSED` outcome, or a sender-record count enter any quality pool.
12. MUST compute and serve the sender record only under the rules of §4.7, and
    MUST publish its window and its threshold of distinct refusing parties.
13. MUST NOT serve a pooled quality figure for an organization, and MUST list
    every member in an organization report it serves (§8.5).
14. MUST record a claim of breach as open only under the checks of §4.8, MUST
    uphold one only on a basis §4.8 names, and MUST NOT let a claim or the NDA
    record enter any quality pool.
15. MUST serve the NDA record under the rules of §4.9 and §8.2, MUST keep
    withdrawn, dismissed, set aside, and lapsed claims visible in their states
    for the record period, and MUST NOT serve the agreement's identifier, the
    claimant's identity, or a claim's text in any report.

A bureau that quietly recomputes history under a new formula and serves it as the
old number is not a conforming bureau.

## 11. Trust model

What a report attests, precisely: *this bureau received these signed events from
these identified parties, kept them unmodified, and applied the named formula.* It
does not attest that evaluators were wise, that reporters were incorruptible, or
that the subject will perform tomorrow.

Assumptions, named:

- **Identity cost lives upstream.** Every sybil, whitewash, and carousel defense in
  this document leans on Personal Agent Naming and ANS making identities stable and anchors meaningful.
  Reputation on top of free, disposable identity is decoration. This is a stated
  dependency, not a solved problem.
- **Reporters are trusted witnesses.** A compromised reporter can forge facts.
  Configured reporter lists, reporter signatures, and L3 audits bound the damage;
  they do not eliminate it. This is the same trust shape as Personal Agent Naming's registrar: a
  notary, not an oracle.
- **The bureau can lie by omission.** Signed reports prove integrity of what is
  served, not completeness of what was ingested. Cross-bureau corroboration is
  future work (§13).
- **Evaluators are partial.** The system is built so that partiality is measured
  (§6.5), bounded (§6.2, §6.4), and visible (§8.2), not so that it is absent.
- **A sender record counts other owners' decisions.** It attests that this many
  distinct parties stopped a sender's signed requests, on these grounds, through
  configured reporters. It does not attest that the sender meant harm, and a
  screener's verdict enters it only after the recipient's owner acted on it
  (§4.7).
- **An NDA record counts findings made elsewhere.** It attests that a party to
  a signed agreement filed a claim that met the checks of §4.8, and that the
  respondent acknowledged it, or a forum or a court the record names found
  it, on the date shown. It does not attest that a leak happened, which the
  bureau has no way to know, and an open claim attests only that a claim was
  made.

## 12. Security considerations

### 12.1. Attacks and where they break

- **Sybil evaluators** break at §6.2 (no attestation without a witnessed
  interaction) and at upstream identity cost. Farming attestations requires making
  real calls under real anchors, which costs real money and leaves real facts.
- **Collusion rings** are visible at §8.2 (anchor concentration) and excludable
  at §6.4. Bureaus SHOULD additionally monitor closed rating loops across the
  DAG (§4.5); detection thresholds are legitimate tripwires (§10.3).
- **Whitewashing** breaks at §3.3 (permanent enrollment history), §7.4 (UNPROVEN
  ranks below RATED), and identity cost. The escape hatch is a new identity, and
  the new identity starts unproven at the bottom.
- **Carousel / portfolio cycling** is visible because evidence and priors group by
  anchor (§7.5), so a publisher shuffling agents under one anchor shows up there.
  Bureaus SHOULD evaluate abuse at anchor level, not agent level.
- **Cowardice (cherry-picking easy work)** is partially priced by design: declines
  are free but *counted* (`decline_rate`, §8.2), and consumers with hard tasks can
  read the candor block. Full difficulty normalization is future formula work.
- **Reputation cashing (build cheap, defect big)** is out of scope until value flows
  through the mesh, noted here so nobody mistakes silence for a solution. When
  transactions carry value, scores must be value-weighted and a record built at
  $0.001 must not underwrite a $10,000 call.
- **Retaliation** is bounded because attestations are not served individually to
  subjects with evaluator identity attached; subjects see aggregates and their
  own ledger excerpt with evaluator anchors hashed. Retaliatory *scoring* by evaluator-agents
  shows up in §6.5 statistics.
- **Stale-score coasting** is answered by decay (§7.2): silence is not evidence
  of quality, and a score with no recent evidence slides toward UNPROVEN as
  `n_eff` decays below the threshold.
- **Baiting refusals** (flooding an agent with malicious or out-of-scope requests
  so that it refuses them) breaks at §4.6 and §5: a stop never touches the
  recipient's record, a `REFUSED` outcome never scores, a turned-away sender
  cannot answer with a rating (§6.2), and the refusal count carries its caller
  concentration (§8.2), so a flood shows as one caller's share.
- **Weaponizing the sender record** (a rival arranging refusals of a target's
  requests) breaks at §4.6 and §4.7. A stop needs a configured reporter and the
  target's own signature on the request, so a rival cannot invent requests the
  target never sent. Counts are per distinct refusing anchor, recipients sharing
  an anchor or an operator count once, nothing is served below three distinct
  refusing parties, and a solicited request counts for nobody, so asking the
  target a question and blocking the answer achieves nothing. A screening hold
  counts only once the recipient's owner blocks it. Defeating these rules takes
  several real identities under distinct anchors, each of which the target must
  have chosen to contact, which is the same identity cost every other defence
  here relies on.
- **Weaponizing the NDA record** (a rival filing claims to damage a target)
  breaks at §4.8 and §4.9. Only a party to an agreement the target signed can
  file, with a record showing that the claimant's material reached the target
  while the agreement covered it, so a rival with no agreement can file
  nothing. A claim never touches a score, and it never becomes a breach until
  the target acknowledges it or a forum or a court finds it. Open claims are
  counts by distinct claimant, the target answers on the record, every closed
  claim stays visible in its own state, and the claimant's own record shows
  how its claims ended. One party with many agreements can file many claims,
  and they count as one claimant.
- **Hiding a breach** breaks at §4.9 as well. The record needs no enrollment,
  so staying unenrolled or withdrawing hides nothing, and an organization's
  report counts its members' breaches and those signed through its seats.
- **Organization halo** (a strong company record lifting a weak agent) breaks at
  §8.5: there is no pooled score, every member is listed, and the only transfer
  between members is the capped, disclosed, per-capability prior of §7.5.

### 12.2. What this spec refuses to do

A bureau MUST NOT serve an "average of stars." Every design in §5 to §8 exists
because scalar averages of unverified opinions are the failure mode this protocol was
written against: they punish honesty, reward volume, hide sample size, and launder
collusion. If an implementer strips the outcome taxonomy, the eligibility rules,
and the confidence bound, what remains is not a smaller system; it is the thing
Agent Reputations replaces.

## 13. Out of scope

- **Routing and selection.** Consumers rank; the bureau reports. Exploration budgets
  (giving unproven agents a chance to become proven) are a consumer/mesh policy.
  That policy is necessary, since a mesh that always picks the top lcb ossifies,
  but it is policy rather than protocol.
- **Probe operations.** The *Canary* companion covers libraries, rotation,
  indistinguishability, classification, appeals, and the legal and bias review
  that covert testing demands.
- **Safety certification.** A probe program may measure refusal behavior, and
  this document defines how a probe result, a refusal, and a stop are recorded
  (§4.3, §4.6, §5). Whether an agent is safe for a given use is a judgment this
  document leaves to the reader of those records.
- **Payments, escrow, staking, bonding.** If the mesh grows a value layer,
  reputation-priced escrow is the obvious extension, in its own document.
- **Cross-bureau federation.** Corroboration, migration of evidence between
  bureaus, and referral formats. The single-bureau trust model (§11) is honest
  about this gap.
- **Deciding breach.** Whether a leak happened, whether an exclusion of Agent
  NDA §5.6 applies, and what remedy follows are questions for the parties, a
  forum they chose, or a court. A bureau records what they decided (§4.8).
- **Human-readable review text** as scored content. Stored for remediation,
  never scored.
- **Difficulty normalization and joint evaluator-subject estimation.** Future
  formula versions, taken when the data volume justifies them.

## 14. Reference implementation and test vectors

The intended first implementation of a bureau sits alongside a reference mesh
stack, with the mesh runtime as its first configured reporter and Personal Agent
Naming as its identity resolver.

The arithmetic and the signing every bureau uses are fixed by test vectors and a
reference script in the [conformance](conformance/) folder beside this
document. The vectors are normative. The script is one implementation that
reproduces them, written for reading beside this document, with nothing
outside Node.js itself.

- [conformance/fdbk-score-1.json](conformance/fdbk-score-1.json) holds the
  ledgers of thirteen (subject, capability) pairs, with every event's
  `ended_at` given against one stated evaluation instant, its outcome code, and
  any exclusion, and for each one the expected `a`, `b`, `mean`, `sd`, `lcb`,
  `n_eff`, the state (RATED or UNPROVEN), and the events that entered the pool
  with their values and weights. They cover an empty record, a thin record and
  the threshold of §7.4 from both sides, decay over several half-lives,
  `OK_CORRECTED`, `FAILED` beside `FAILED_SILENT`, the codes that never enter a
  pool, an attestation on an interaction with no work, a value judgment at the
  weight of §7.6, a portfolio prior at the most §7.5 allows, an upheld breach
  of an Agent NDA that enters no pool, and attestations that override,
  amend, or are excluded, beside probes.
- [conformance/fdbk-report-v1.json](conformance/fdbk-report-v1.json) holds a
  test key whose private part is published so that anyone can sign with it,
  the bureau key set that names it, two JCS cases, a report and an
  organization report with their signed bytes and the expected signatures,
  and eight changed reports that verification must refuse, each with the step
  of §8.1.3 that refuses it. The test key is a test key only. A report signed
  with it proves nothing, and a bureau MUST NOT sign with it and a consumer
  MUST NOT pin it.
- [conformance/fdbk-heads-v1.json](conformance/fdbk-heads-v1.json) holds four
  pairs of names that fold to one slot key (a sharp s, a long s, a final
  sigma, and a Greek letter whose two combining marks match only in the
  decomposed forms of D145); a change of the witness list from one test
  witness to two before the first commitment, signed by the first, and a
  change adding a third after the second commitment, signed by the first
  two; three chained commitments of §4.1.1 signed with the test key of
  `fdbk-report-v1.json`, the first two co-signed by the first two witnesses
  and the third by all three, the second carrying one head forward
  unchanged, moving two up their logs,
  adding a subject, and putting a tombstone in an erased subject's slot; the
  digest of every filled slot; the root of an empty tree; the proofs of a
  head, of a head in the earlier commitment, of a tombstone and of an absent
  subject; and nineteen cases a conforming check refuses: a second head for
  one subject under another spelling, two spellings of one subject in one
  tree, an erasure dated after its commitment, a fork the witness refuses, a
  fork whose two sides two different witnesses co-signed, a witness list
  changed without the signature of a witness it changes, a joining witness
  co-signing the commitment its change names, a joining witness co-signing
  an earlier commitment, a joining witness skipping a commitment, a change
  whose `after` names a commitment the bureau did not publish,
  two entries for one slot, an absence claimed where a head is, a head shown
  where a tombstone is, a broken `prev`, a skipped sequence number, a head
  that goes back, a head rewritten at the same `seq`, a slot that empties
  without a tombstone, and an erased subject back without naming its
  erasure.
- [conformance/casefolding-15.1.0.json](conformance/casefolding-15.1.0.json)
  holds the `C` and `F` entries of Unicode 15.1.0's `CaseFolding.txt`, which
  the slot key of §4.1.1 folds with. It is Unicode data under the Unicode
  License V3, whose text is in
  [conformance/LICENSE-UNICODE](conformance/LICENSE-UNICODE). The Apache-2.0
  license of the rest of the folder does not cover it.
- [conformance/fdbk-nda-claim-v1.json](conformance/fdbk-nda-claim-v1.json)
  holds a claim of breach of §4.8 signed with a test claimant key whose
  private part is published, its signed bytes, signature and digest, the
  rejection a bureau may keep of it in place of the claim, and two changed
  claims whose signature must not verify.
- [conformance/fdbk-nda-record-v1.json](conformance/fdbk-nda-record-v1.json)
  holds the NDA records of a claimant and a respondent before and after one
  claim is filed, as each reader is served them: a public report, the
  subject's own excerpt, and the respondent's excerpt beside the claim. It
  pins that `filed` appears only in the last two, so the claimant's public
  report does not move when the respondent's open count does, and holds a
  public report carrying `filed` that a conforming bureau must not serve.
- [conformance/reference.mjs](conformance/reference.mjs) computes the pool of
  §7.1 and the score of §7.3 from a ledger, signs and verifies under §8.1,
  computes the commitments and proofs of §4.1.1 and checks their chain, signs
  a claim of §4.8 and takes its digest, and checks all five vector files. The
  repository runs it on every change.

An implementation of `fdbk-score-1` conforms to the vectors when every number
it computes is within the stated tolerance of the expected one, which allows
for the last digits that `2^x` can differ in between platforms, and its state
and the codes in its pool are equal to the expected ones. An implementation of
report signing conforms when it produces the expected signed bytes and
signatures exactly, which Ed25519 makes possible because its signatures are
deterministic, and refuses every report the vectors say it must refuse.

---


*0.11.1-draft (2026-10-20): a witness named after the first commitment, when the bureau named none before, has a defined start. §4.1.1 said how a witness joins through a change of the list and not what list a bureau that names no witness serves. Such a bureau serves an empty list, or none, and a consumer pins either as the empty list. Its first witness joins in a change from the empty list whose `after` is the latest commitment, which no witness signs, and it never goes on the first list. No signed bytes change.*

*0.11.0-draft (2026-10-20): a witness that joins mid-chain has a defined
start. Rule 1 of §4.1.1 said how a witness starts at a bureau's first
commitment and not how one added through `witness_changes` starts. A change
of the witness list now carries `after`, the commitment current when it
takes effect, which the witnesses before it co-signed, or `null` before the
first commitment. A joining witness's record begins there: its first
co-signature is of the next commitment, and it never co-signs that
commitment or any before it. The list before a change is named for every
commitment up to `after` and the new list for every one after it, and
§8.1.3 step 7 checks each commitment against the list named for its `seq`.
`conformance/fdbk-heads-v1.json` gains a change adding a third witness
after the second commitment, a third commitment co-signed by all three, and
four refused cases. The minor version moves because the change object gains
a member inside its signed bytes, so a change signed under 0.10.0-draft does
not verify under this version.*

*0.10.0-draft (2026-10-20): The claimant's `filed` counts are no longer public. Under rules 2 and 6 of
§4.9, one filing moved the respondent's public `open.count` and the
claimant's public `filed.open` at the same moment, so anyone polling public
reports could tell who filed against whom and that the two had an agreement,
which rule 4 protects. A bureau now MUST serve `filed` only in the party's
own subject-scoped excerpt and in a respondent's excerpt beside a claim by
that party, and never in a report another reader can fetch. This removes the
correlated signal entirely. Publishing on a fixed batch schedule was
considered and not chosen: with few claims in a batch, the two changes
still line up. The counts stay useful where a pattern of dismissed claims
matters, to the respondent facing the claimant and, through it, to the
forum. The example report drops `filed`. A new fixture,
`conformance/fdbk-nda-record-v1.json`, and a check in `reference.mjs` pin
what each reader is served. The minor version moves because a bureau built
against 0.9.0-draft publishes `filed`, which this version forbids.*

*0.9.0-draft (2026-10-19): a bureau may keep a rejected claim of breach as
its digest, its failing check and the reason, in place of the claim and its
records, and should bound how many it records a day per claimant and per
respondent, because recording junk claims in full lets anyone write
unbounded, permanent data into another subject's history (§4.8, §4.9 rule
8). A claim no identity the bureau can resolve signed may be refused
unrecorded. §4.8 now defines the claim's digest, and
`conformance/fdbk-nda-claim-v1.json` fixes a signed claim, its digest and the
rejection kept of it.*

*0.8.0-draft (2026-10-19): a bureau may keep one log per subject (§4.1.1),
which lets it erase a subject's history without breaking every other log, if
it publishes at least daily a chained commitment signed under
`fdbk-heads-v1` and co-signed by every witness its key set names: a sparse
Merkle tree with one slot per subject at the hash of the name's canonical
caseless form (Unicode D145), holding its head or the tombstone of its
erasure, each commitment naming the one before and carrying every slot
forward. The witness list changes only by changes its witnesses sign.
Reports name the head and commitment they rest on, §8.1.3 step 7 checks
them, and a report whose commitment cannot be fetched is unanchored. The
vectors in `conformance/fdbk-heads-v1.json` fix four pairs of slot keys, a
witness change, two co-signed commitments, four proofs and fifteen refused
cases.*

*0.7.0-draft (2026-10-19): a claim of breach cites an agreement whose
signatures are bound to their seats. Check 2 of §4.8 now also requires that
each signature on the cited agreement is bound to its seat, as Agent NDA
0.2.0-draft defines binding: a signature by a key the seat does not name
does not make a party to the agreement, and an owner the registry could not
confirm fails the check as a contradicted one does. The example claim of §4.8 names the
Agent NDA example by its new agreement digest, because that version added
`owner_key` to the example's recipient seat, and its material digest is the
new digest of the Agent RFP example body, which now carries a nonce. The
minor version moves because
a bureau built against 0.6.0-draft accepts a claim whose agreement carries an
unbound signature, which this version refuses.*

*0.6.0-draft (2026-10-18): report signing, test vectors, and the age of an
event. §8.1 defines how a report is signed, which it had left to Personal
Agent Naming §5.3 while the A2A Reputation extension named a tag that
specification does not use. The signed bytes are the tag `fdbk-report-v1` (or
`fdbk-org-report-v1` for an organization report), one line feed, and the JCS
(RFC 8785) canonical JSON of the whole signed object (§8.1.1). The envelope's
`bureau_key`, `bureau_kid`, and `bureau_sig` are outside the signed bytes, and
nothing else may sit beside them. Keys and signatures are Ed25519 in base64
with padding, a key id is the first 12 hexadecimal digits of the SHA-256 of the
key's base64 text, and the key set is published at `/api/bureau-key` and
pinned per bureau, with the rotation rule of Personal Agent Naming (§8.1.2).
A consumer verifies in six steps (§8.1.3). §7.2 states that an event's age runs
from the end of the interaction it scores to the instant the score is computed,
in days of 86,400 seconds, and §7.3 and §7.5 state that `n_eff` counts direct
evidence only and never a portfolio prior. §14 points to the test vectors for
`fdbk-score-1` and for report signing, and the reference script that
reproduces them, in the conformance folder. The formula version stays
`fdbk-score-1`, because the outcome values and the arithmetic of §7.3 are
unchanged. A bureau that signed reports as Personal Agent Naming signs cards,
with no tag, signs differently under this version, and a bureau that counted a
portfolio prior in `n_eff` serves a different state for a new agent.*

*0.5.0-draft (2026-10-18): claims of breach of an Agent NDA. Added claim of
breach, claimant, respondent, and upheld breach (§1), and the ledger actions
`nda_claimed`, `nda_answered`, and `nda_resolved` (§4.1). A party to an Agent
NDA files a signed claim against another party bound by it, naming the
agreement by identifier and digest and citing a record that the material
reached the respondent while the agreement covered it: an Agent RFP release
record, an Agent SoW task record, or a delivery fact (§4.8). The bureau checks
the parties, the categories, the record, and the window, and records the
claim as open. A claim is upheld only by the respondent's signed
acknowledgment, an arbiter verdict, a settlement both owners signed, or a
court's finding the bureau checked under a published procedure, and it can be
dismissed, withdrawn, set aside, or lapse. The attestation window does not
apply. A claim window tied to the agreement's survival period, an open period,
and a record period apply instead. The NDA record (§4.9) lists upheld breaches
with their dates and basis, counts open claims by distinct claimant, keeps
closed claims visible in their states, names neither the agreement nor the
claimant, carries the claimant's own filing record, and needs no enrollment.
Added the code `NDA_BREACH` (§5), which never enters a pool, the Agent SoW
dispute rows of §4.4, the rule that an attestation cannot name the code
(§6.2), the `nda` block of reports and organization reports (§8.1, §8.2, §8.3,
§8.5), the note on Agent NDA promises (§9), bureau obligations 14 and 15 and
the new published values (§10), and the trust, attack, and scope entries. The
formula version stays `fdbk-score-1`, because nothing added enters a pool and
no score moves.*

*0.4.0-draft (2026-10-18): requests stopped before the work, the sender, and
organizations. Defined a stop (§1, §4.6): a request a gate, a screener, or a
person refused or held before the subject saw it, recorded as the ledger action
`stopped` about the sender and never about the intended recipient, with a table
covering Agent SoW gate refusals, screening holds under the Common Agent
Specification §7.3 and Agent Messaging's screening extension, door decisions,
guest standing, and Agent Mandate §7 refusals. Added the outcome codes
`REFUSED`, `REFUSED_UNSTATED`, `UNAVAILABLE`, and `STOPPED` (§5), none of which
enters quality, and the Agent SoW gate rows to §4.4. An agent's refusal of a
harmful or out-of-scope request is left out of `decline_rate`, and an
attestation on an interaction with no work is rejected (§6.2). Added the sender
record (§4.7), counted per distinct refusing anchor, served only from three
distinct refusing parties, and limited to witnessed requests from configured
reporters. Added the organization report (§8.5), keyed by an anchor or an Agent
Mandate charter, with no pooled score, and made members of one organization
self-dealing for each other (§6.4). The portfolio prior is drawn per
capability from anchor members only (§7.5). Defined operator (§1). Reports gain
`candor.refusals`, `facts.unstated_refusals_90d`, `facts.unavailable_90d`, and
the `sender` block (§8.1 to §8.3); bureau obligations 11 to 13, the trust model,
attacks, and the safety bullet of §13 follow. The formula version stays
`fdbk-score-1`, because the outcome values and the arithmetic of §7.3 are
unchanged and every new code is excluded from the pool. The eligibility,
exclusion, and prior rules of §6.2, §6.4, and §7.5 can change which events enter
a pool, so a score recomputed under this revision can differ from one computed
before it. The fact example of §4.2 names an example reporter.*

*0.3.1-draft (2026-10-18): editorial, with no normative change. The text names
no platform: the transport is Agent Messaging, and the intended first
implementation sits beside a reference mesh stack. Personal Agent Naming is written out
rather than abbreviated, the Agent Name Service is named on first use, and the
canonical source names this file. The A2A Reputation extension moves to
0.1.1-draft for the same edits. No requirement, field, example, or section
number changes.*

*0.3-draft (2026-08-07): added the time and materials mappings to §4.4. An
engagement that concludes on reaching its not-to-exceed cap is recorded as a fact
and left unscored, the same treatment terminations get, because concluding at the
cap is the arrangement working as designed. Added value judgments as a distinct
attestation kind (§6.6), signed under `fdbk-value-v1`, carrying the amount spent
and the metered units, with the outcome codes `VALUE_OK` and `VALUE_POOR` (§5) and
the weighting constant `K_value` defaulting to 0.5 (§7.6). Added
`value_judgment_share` to reports (§8.1, §8.2) and `K_value` to the publication
list (§10.3). The version moved from 0.2 to 0.3 because the outcome taxonomy and
the report shape both changed, and an implementation built to 0.2 would be missing
both. The formula
version is unchanged at `fdbk-score-1`, since no ledger written before this
revision contains a value judgment and no score computed under it moves.*

*0.2-draft (2026-08-06): renamed to Agent Reputations (tags keep the fdbk prefix); added §4.4 Engagements as an evidence source, mapping Agent SoW task outcomes, problem reports, reviews, and terminations into the evidence classes; bureau URL updated.*

*0.1-draft (2026-07-31): first draft. Argue with it.*
