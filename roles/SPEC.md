# Agent Roles: Standard Roles Registry

**Version:** 0.1.0-draft
**Status:** Working Draft
**Date:** 2026-08-06

Some jobs on a mesh recur everywhere: every account eventually needs the
same few things done, the same way, by an agent it can trust on sight. A
**standard role** publishes the contract for one of those jobs: the
questions the agent answers, the access it may hold, what it must
refuse, and the documents it produces. Any agent that meets the contract
can hold the role. This registry lists the standard roles, starting with
the bookkeeper.

This specification is part of the family that includes
[Agent SoW](https://agentsow.com), [Agent RFP](https://agentrfp.net),
[Agent Mandate](https://agentmandate.net), and
[Agent Reputations](https://agentreputations.com). Those standardize
documents between parties; this one standardizes recurring jobs. It is
transport-neutral, developed alongside the AgentMesh protocol; nothing
here requires a particular network or vendor.

---

## 1. Motivation

The family's consistent line is to standardize signed documents and the
checks a platform runs on them, never implementations. A role follows
the same line. We do not standardize a program called "the bookkeeper";
we standardize the bookkeeper's contract and the statements it signs.
Any implementation that honors both is a bookkeeper, including a
platform's own default agent, which is simply the first conforming
implementation with no privileged machinery.

Two things follow from publishing a role this way. Conformance becomes a
test instead of a promise: hand a candidate the same records, ask the
standard questions, and check its answers byte for byte. And the role's
name keeps meaning something: a buyer who hires "a bookkeeper" from any
source knows exactly what it will do, what it can see, and what it will
refuse.

## 2. Conformance language and terminology

The key words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are to be
interpreted as described in RFC 2119.

- **Role**: a recurring job published as a contract: scope, access,
  refusals, and output documents.
- **Profile**: the normative rules an agent must honor to hold a role.
- **Holder** (of a role): an agent that conforms to the profile and
  offers the role under its standard offering name.
- **Grant**: the account holder's explicit permission for a role holder
  to read a defined set of records. Grants are read-only, revocable,
  and never transitive.
- **Statement**: a signed document a role holder produces, defined per
  role.
- **Records**: the signed, attributed entries a platform keeps for an
  account: receipts, settlements, draw records, approval records, and
  formed engagements. Agent Mandate §8 states the principle this
  registry depends on: the records are the books.
- **Owner**, **Agent**, **Engagement**: as defined in Agent SoW §2.
  **Mandate**, **Treasury**: as defined in Agent Mandate.

## 3. What a role defines

Every role in this registry publishes the same four parts:

1. **Scope**: the questions the holder answers or the acts it performs.
   The scope is closed; what is not listed is refused.
2. **Access**: what the holder may read or touch, always the minimum,
   always under a grant.
3. **Refusals**: what the holder must decline even when asked nicely,
   with the refusal naming the reason.
4. **Documents**: the signed statements the holder produces, in a form a
   third party can verify.

Roles are versioned like the family's other documents: amended by full
replacement, never by delta.

## 4. Role: the bookkeeper

The bookkeeper answers basic questions about an account's money from
the signed records, so the account's owner can see what their agents
are doing. It is the one role in the system defined by its inability to
spend: access without authority.

**Standard offering name**: `role-bookkeeper`.

### 4.1 Scope: the four questions

A bookkeeper answers exactly four questions, on a cash basis, over a
stated period:

1. **In**: what came in, from which engagements.
2. **Out**: what went out, to whom, and under whose authority.
3. **Balance**: what the balance is now.
4. **Promised**: what is committed but not yet settled: formed
   engagements whose price has not left the balance.

### 4.2 The contract

1. **Provenance.** A bookkeeper MUST NOT state a number that is not a
   sum over records it cites. Every statement names the record set it
   summed. No estimates, ever.
2. **Access.** A bookkeeper reads under a grant: read-only, scoped to
   the granting account's records, revocable at any time, never
   transitive. It MUST NOT retain record contents beyond producing the
   statement.
3. **No authority.** A bookkeeper MUST NOT hold a mandate and MUST NOT
   have a settlement path. A platform MUST refuse to issue a mandate to
   an agent offering `role-bookkeeper`. It cannot spend, approve,
   amend, or terminate anything.
4. **Refusals.** Forecasts, advice, tax treatment, valuation, and any
   question outside the four are refused, and the refusal names the
   reason. A bookkeeper that speculates does not conform.
5. **Privacy.** Book contents flow to the granting owner and nowhere
   else. The bookkeeper's own operational records (its receipts, its
   reputation evidence) MUST NOT carry book contents.
6. **Determinism.** The same question, period, and records MUST yield
   the same cited record set and the same amount, from any conforming
   bookkeeper.

## 5. The bookkeeper statement

The document a bookkeeper produces. Tag: `agent-bookkeeper-statement-v1`,
signed with the family convention: the ASCII tag, one newline, then the
JCS (RFC 8785) canonical JSON of the document with `signatures` removed.

```json
{
  "statement": "v1",
  "role": "bookkeeper",
  "question": "out",
  "subject": "acct_2c9f7e1a",
  "period": { "from": "2026-09-01T00:00:00Z", "to": "2026-10-01T00:00:00Z" },
  "records": {
    "count": 14,
    "ids_sha256": "<sha256 over the JCS array of the record ids, sorted>"
  },
  "amount": { "currency": "XCR", "total": 6200000 },
  "produced_at": "2026-10-01T00:05:12Z",
  "by": "<bookkeeper agent public key>",
  "signatures": [ ]
}
```

Rules:

1. `question` is one of `in`, `out`, `balance`, `promised`. `period` is
   required for `in`, `out`, and `promised`; `balance` is as of
   `produced_at`.
2. `records.ids_sha256` commits the statement to the exact record set
   summed. A verifier holding the records recomputes the sorted id
   array, hashes it, and recomputes the total. Either mismatch is a
   conformance failure.
3. The statement carries record ids and a total, never record contents.
   Detail stays between the bookkeeper and the granting owner.
4. The full id list SHOULD accompany the statement to the granting
   owner, so verification needs no help from the bookkeeper.

## 6. Conformance testing

Conformance is mechanical. A test harness holds a known record set and
the expected answers. A candidate bookkeeper is granted the records and
asked the four questions; its statements must cite the expected record
sets and state the expected totals, byte for byte after
canonicalization. It is then asked questions outside the scope; it must
refuse each one with a reason. A candidate that states an uncited
number, an incorrect sum, or an answer beyond the four questions does
not conform.

A platform MAY record conformance results as evidence in the same way
it records form checks, so a role holder's reputation reflects whether
it does the job the role defines.

## 7. Out of scope

- Accounting standards. Cash sums over signed records, no accrual, no
  valuation, no jurisdiction. Agent Mandate §8 states it: the records
  are the books, and statements are derived views.
- The grant mechanism's wire format. Grants are the platform's
  machinery; this registry requires their properties (read-only,
  scoped, revocable, non-transitive), not their bytes.
- Role marketplaces and pricing. A role holder is hired like any agent;
  what it charges is its business.
- Roles this registry has not published. A vendor MAY offer any agent
  under any private name; the standard offering names are reserved for
  conforming holders.

## 8. Signature tags

- `agent-bookkeeper-statement-v1` — the bookkeeper statement (§5).

---

*0.1.0-draft (2026-08-06): first draft. One role: the bookkeeper. The
registry adds roles when a job recurs often enough to deserve a
contract.*
