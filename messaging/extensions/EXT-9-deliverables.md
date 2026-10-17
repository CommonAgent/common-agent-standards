# EXT-9: Deliverables

| | |
|---|---|
| **URI** | `mesh://extensions/deliverables/v1` |
| **Status** | Draft |
| **Version** | 0.1.0 |
| **Requires** | An ordered, per-message-signed record. EXT-5 rooms are the reference carrier; nothing here is room-specific. |

Three record shapes for the facts a job produces: **this thing exists at this
version**, and **this party stands behind it**.

No collaboration pattern owns those facts. Agent Collab's playbooks govern
discourse — who may speak, in what order, with what standing — and deliberately
stop there. Its `MERGED` says a proposal was applied; it says nothing about
whether a deliverable is finished. A room's record says what was said; it does
not say what was made. This extension is the smallest vocabulary that closes
that gap, and it is deliberately three records rather than a framework.

## 1. Why this is separate from EXT-5

EXT-5 §5.3 already depends on it: a dossier keeps the bytes of **accepted
outputs** and only the digests of everything else, which is not a decision a
transport can make on its own. That dependency is why these shapes need a
normative home. Rooms are the carrier; the records would work unchanged over any
ordered, signed log.

## 2. The records

Each is the **first line** of an ordinary message body, with prose free to
follow on later lines. A message whose first line does not match is not one of
these records — see §4.

### 2.1 DELIVERABLE

```
DELIVERABLE · <name> · @ <version> · ref: <where the bytes are>
against: <name> @ <version>
```

`name` identifies the KIND of deliverable within the job (`outline`, `draft`,
`script`, `master`), not a filename. `version` is opaque and compared only for
equality. `ref` SHOULD be a content-addressed reference — an EXT-5 artifact ref
— so a reader can fetch the bytes and check them against a digest.

`against:` is OPTIONAL and names what this deliverable answers. It is the
job's dependency edge, recorded rather than declared in advance: a graph
assembled from what actually happened.

### 2.2 ACCEPTED

```
ACCEPTED · deliverable: <name> @ <version>
```

The responsible party's statement that this version stands. It is an **act, not
an artifact**: acceptance produces no document, and implementations MUST NOT
expect one.

### 2.3 REJECTED

```
REJECTED · deliverable: <name> @ <version>
reason: <one line>
```

The same authority exercised the other way. `reason:` is REQUIRED: a refusal
with no reason teaches the producer nothing and is indistinguishable from
silence.

## 3. Roles, derived

A file's role in a job is **computed from the record**, never declared and never
filed by anyone:

| Role | Condition |
|---|---|
| **input** | on the drive, never claimed by a `DELIVERABLE` |
| **interim** | claimed, but not the version that was accepted |
| **output** | the version an `ACCEPTED` names |

This is why the model needs no folders. Contributed material, work in progress
and finished work are distinguishable without anyone organising anything, and a
file's role can change later because the room said something new about it.

Matching a claim to a file MUST prefer `ref` and MAY fall back to name and
version. A ref names one object exactly; a name and version is a description two
files can answer to, and resolving an exact claim by a guess is worse than not
resolving it.

## 4. Recognition

Implementations MUST match against the **first line only**, and MUST treat any
message that does not match as ordinary prose with no effect on job state.

This is a normative requirement rather than an implementation detail. A record
is mostly conversation, and a reader that inferred job state from prose would be
guessing — a guess that silently satisfies a requirement is worse than having no
requirement. The literal shapes are the entire machine-readable surface, which
is also why they must stay small and stable.

Implementations SHOULD accept the middle dot (U+00B7) as the separator and MAY
accept others; emitters MUST use U+00B7.

## 5. Who acted

The actor of every record is read from the **envelope**, never from a `by:` line
in the body.

The distinction is the whole strength of §6. A signed envelope that survives
verification is a fact; a body field is a claim, and the point of a
separation-of-duties requirement is that it cannot be talked around. A record
identical in every byte except its signer must not produce the same verdict.

## 6. The responsible party

`ACCEPTED` and `REJECTED` are valid only from the party answerable for the job.
Implementations MUST bind that party from a statement made by the record's
creator — Agent Collab's `CONVENED` line naming a `responsible` role is the
reference form — and MUST NOT accept a party's own claim to the role.

Binding it to the record's creator directly is simpler and worse: whoever opens
a room is usually a coordinator, not the party who should be answerable. The
creator's designation keeps a verifiable root of authority while letting the
role sit where it belongs.

## 7. What this extension does not define

- **The plan.** Which deliverables a job expects, their dependencies, and who
  may produce each are a job's shape, not its record. `against:` records edges
  after the fact; declaring them in advance is a separate concern.
- **Governance.** Who speaks, in what order, under what floor — Agent Collab.
- **Storage.** Where bytes live and how they are addressed — EXT-5 §5.
- **Judgment.** Nothing here says whether a deliverable is any *good*. That is
  what §6 exists for: a responsible party is the answer to the questions a
  machine cannot decide, and pretending otherwise would be the failure mode of
  the whole idea.

## 8. Conformance

`conformance/deliverable-records.json` pins recognition and role derivation as
literal cases. Two implementations already produce these roles from the same
record — `services/src/rooms/dossier.ts` decides which bytes a dossier keeps,
and `app/src/files.ts` decides what a files panel shows as Accepted — so they
must agree, for the same reason `conformance/rooms-entry.json` exists.
