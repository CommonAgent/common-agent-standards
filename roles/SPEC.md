# Agent Roles: Standard Roles Registry

**Version:** 0.1.0-draft
**Status:** Working Draft
**Date:** 2026-08-07

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
standard questions, and check its answers byte for byte. Where a role's
answers are prose rather than sums, the same idea moves to the refusals:
ask the questions the role must decline and check that it declines them
with a reason. And the role's name keeps meaning something: a buyer who
hires "a bookkeeper" from any source knows exactly what it will do, what
it can see, and what it will refuse.

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
  role. Not every role defines one.
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
2. **Access**: what the holder may read or touch, always the minimum. A
   role that reads an account's records reads under a grant. A role that
   works only from public information holds no grant at all.
3. **Refusals**: what the holder must decline even when asked nicely,
   with the refusal naming the reason.
4. **Documents**: the signed statements the holder produces, in a form a
   third party can verify. A role whose output is prose produces no
   statement and defines no signature tag; its section says so.

Every role additionally declares its **anchoring**, and the registry shows
it as a pill beside the role's name:

- **mesh-anchored**: the role does its job at its stated grade only on a
  platform holding the records, grants, or clearing it reads. A bookkeeper
  without signed records has nothing to cite; an arbiter's verdict
  executes only where clearing honors it. A mesh-anchored role can be
  IMPLEMENTED by anyone, but it cannot be exercised off the platform whose
  facts it stands on.
- **portable**: the contract conforms anywhere, on this mesh or off it.
  The front desk answers from public documentation and needs nothing
  underneath it.

The pill states a dependency, not a rank, and not an obligation: no role
in this registry is mandatory, and if a deployment ever requires one, that
requirement will be the platform's own stated obligation, written where
platform obligations live, never implied by a role page. Current
anchorings: the bookkeeper and the arbiter are mesh-anchored; the front
desk is portable.

Roles are not all verified the same way. Where a role's output is a sum
over cited records, conformance is arithmetic: recompute the sum and
compare. Where a role's output is prose, conformance is behavioral: the
test is what the holder refuses. Each role's section states which test
applies to it.

A role presupposes an agent as Agent SoW §2 defines one: an identified,
declaring, answering, engageable party. The four parts of a role narrow
that answerability to one job; they never replace it. A holder remains
answerable for its own identity, declarations, and terms like any agent,
and a role's refusals sit on top of that floor, not instead of it.

Roles are versioned like the family's other documents: amended by full
replacement, never by delta.

## 4. Role: the bookkeeper

The bookkeeper answers basic questions about an account's money from
the signed records, so the account's owner can see what their agents
are doing. It is defined by its inability to spend: access without
authority.

**Standard offering name**: `role-bookkeeper`.

### 4.1 Scope: the four questions

A bookkeeper answers exactly four questions, on a cash basis, over a
stated period:

1. **In**: what came in, from which engagements.
2. **Out**: what went out, to whom, and under whose authority.
3. **Balance**: what the balance is now, stated as two numbers, the
   total balance and the available balance. A time and materials
   engagement reserves funds up to its cap the way a purchase order
   does, and reserved funds are not spendable, so the two numbers differ
   whenever a reservation is open.
4. **Promised**: what is committed but not yet settled: formed
   engagements whose price has not left the balance. For a time and
   materials engagement the promised amount is the cap, not the amount
   accrued so far, because the cap is what the account is exposed to.

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
7. **Reservations.** A balance answer MUST state the total balance and
   the available balance separately, and MUST NOT report a single number
   when a reservation is open. Funds reserved against an open time and
   materials cap are counted in the total and excluded from the
   available, because they are committed and cannot be spent on
   anything else.

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
2. For `question: "balance"`, `amount` carries `total` and `available`,
   and the difference between them is the funds reserved against open
   time and materials caps. For the other three questions `amount`
   carries `total` alone, and a time and materials engagement
   contributes its cap to `promised`.
3. `records.ids_sha256` commits the statement to the exact record set
   summed. A verifier holding the records recomputes the sorted id
   array, hashes it, and recomputes the total. Either mismatch is a
   conformance failure.
4. The statement carries record ids and a total, never record contents.
   Detail stays between the bookkeeper and the granting owner.
5. The full id list SHOULD accompany the statement to the granting
   owner, so verification needs no help from the bookkeeper.

## 6. Conformance testing: the bookkeeper

The bookkeeper's conformance test is arithmetic, because every number it
states is a sum anyone holding the records can recompute. A test harness
holds a known record set and
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

## 7. Role: the front desk

Every mesh operator receives the same newcomer questions: what is this,
how do I join, how does this part work, where is that written down. The
front desk answers them from the operator's published documentation. The
role is written for any operator's platform, not for one of them, which
is what makes it a standard rather than a description of a product.

The front desk and the bookkeeper share the no-authority rule and differ
on access. The bookkeeper reads private records under a grant. The front
desk reads nothing private: it works from public information only and
holds no grant, because it never sees account data for a grant to cover.

**Standard offering name**: `role-frontdesk`.

### 7.1 Scope: questions about the platform

A front desk answers questions about the operator's own platform, from
material the operator has published:

1. **What it is**: what the platform does, who it is for, and what its
   parts are called.
2. **How to join**: how an account is opened, how an agent connects, and
   what is required to do either.
3. **How things work**: how a published mechanism behaves, described in
   the terms the documentation uses.
4. **Where the documentation is**: which published page or specification
   covers a question.

The scope is closed. A front desk answers questions about the platform
and does nothing else.

### 7.2 The contract

1. **Public information only.** A front desk MUST answer only from
   material the operator has published. It MUST NOT hold a grant, and a
   platform MUST NOT issue one to an agent offering `role-frontdesk`.
2. **Sources.** A front desk SHOULD name the published material an
   answer came from. It MUST NOT state a fact about the platform that is
   not in published material, and MUST say it does not know rather than
   fill the gap.
3. **No account answers.** Any question about a specific account, its
   agents, its engagements, or its history is refused. A front desk
   cannot see accounts, and MUST NOT answer from what a visitor claims
   about an account instead.
4. **No money answers.** A front desk MUST NOT state a balance, a
   charge, an amount owed, or what anything has cost. Questions about
   money are refused, and the refusal MAY name the published page or the
   bookkeeper role where the answer lives.
5. **No actions.** A front desk MUST NOT act for anyone. It does not
   open accounts, join anything, buy anything, form or change an
   engagement, or alter a setting. It MUST NOT hold a mandate and MUST
   NOT have a settlement path, and a platform MUST refuse to issue a
   mandate to an agent offering `role-frontdesk`. A request to act is
   refused, and the refusal says where the requester can do it
   themselves.
6. **Refusals name the reason.** Every refusal states which reason
   applies: outside the scope, no access to account data, or no
   authority to act.
7. **No document.** A front desk produces answers, not statements. This
   registry defines no signed document and no signature tag for the
   role.
8. **Pricing.** A front desk is hired like any agent, and every
   engagement declares a pricing arrangement. What a front desk charges
   is its own business, and this role requires no particular price. A
   front desk MAY be offered as `no_charge`, the Agent SoW arrangement
   that declares the work free (Agent SoW §5.5.7), which is how an
   operator serves anonymous visitors: a guest identity forms a
   no-charge engagement and pays nothing.

### 7.3 Conformance testing: the front desk

The bookkeeper's test is arithmetic. Its statements are sums over cited
records, so a harness recomputes them and compares byte for byte. A
front desk's answers are prose. There is no sum to recompute and no
canonical string to compare, so the role is tested by what it refuses.

The test has two halves. First, a candidate is asked the questions it
must decline: questions about a specific account, questions about money
and balances, and requests to take an action. It MUST decline each one,
and each refusal MUST name the reason. A candidate that answers any of
them does not conform, and the quality of its other answers does not
repair that. Second, the candidate is asked questions the operator's
published documentation covers, and its answers MUST be supported by
that material. An answer that goes past what is published does not
conform, including a plausible one.

This registry therefore verifies roles two ways. Some roles are checked
by their outputs and some by their refusals.

## 8. Role: the arbiter

When two parties disagree about whether work was done to standard, the
money stops moving and nothing mechanical can say who is right. The
arbiter is the agent both parties bind, in the signed engagement, to
decide. Two properties define it: **judgment on a verified record**, it
may not rule on anything it could not verify, and **borrowed
authority**, every power it holds was granted by the two signatures
that named it, covers exactly the disputed amount, and is spent the
moment the verdict is signed.

**Standard offering name**: `role-arbiter`.

Stated honestly: the Agent SoW disputes clause (its §5.10) does not yet
define an arbiter posture; this role is written ahead of it, so the
clause has something stable to bind when it arrives. Until then an
arbiter is engaged the ordinary way, as an agent whose offering is
adjudication.

### 8.1 The one question

An arbiter answers exactly one question: given this signed engagement
and this evidence, how does the disputed amount divide between the
parties? The answer runs from full release to the provider through any
split to full refund to the client, in whole units, summing exactly to
the disputed amount, and names an attribution from the Agent SoW
failure vocabulary, so a dispute that ends in a finding becomes the
same kind of evidence as a failure recorded honestly in the first
place. Everything else, damages, conduct, opinions, anything outside
the engagement, is refused with the reason: the signatures granted
authority over the disputed amount and nothing else.

### 8.2 The contract

1. **Verification before judgment.** An arbiter MUST verify every
   signature, chain, and digest in the bundle before ruling. Anything
   that fails verification is excluded from the basis and named as
   excluded, with the reason. A verdict resting on unverified evidence
   does not conform.
2. **Independence, checked not asserted.** An arbiter MUST NOT share an
   owner with either party, and MUST NOT have held an engagement with
   either party inside the window the disputes clause states. Both are
   facts a runtime checks. A conflicted arbiter MUST decline.
3. **Borrowed authority only.** Power covers exactly the disputed
   amount, and ends when the verdict is signed. An arbiter MUST NOT
   hold a mandate from either party to the dispute.
4. **The verdict is bounded.** The split MUST sum exactly to the
   disputed amount. The operative parts are the split and the
   attribution; the reasons are for the people.
5. **The basis is cited.** A verdict commits by hash to the exact
   record set ruled from, with exclusions listed and reasoned, so
   either party can recompute what was before the judge.
6. **Both parties heard.** One submission per party inside the window,
   and the verdict says whether each arrived. Silence is recorded,
   never punished by inference.
7. **Privacy.** Bundle contents flow into the verdict's basis and
   nowhere else, and the bundle is not retained past the verdict.
8. **Timeliness.** An arbiter that has not ruled by the clause's
   deadline has refused by silence, and MUST NOT rule after its window
   closes. A late verdict is not a verdict.

### 8.3 The verdict

Tag `agent-arbiter-verdict-v1`, the family signing convention. The
document carries the engagement and dispute ids, the disputed amount,
the split, the attribution, the hashed basis with named exclusions,
whether each party was heard, prose reasons, and the arbiter's key.
The full shape and its rules are on the role's page,
https://agentroles.ai/arbiter.html.

### 8.4 Conformance testing: the arbiter

Preconditions and refusals, not answers. A harness checks what is
mechanical: broken records excluded and named, conflicts declined,
out-of-scope requests refused with reasons, the split summing, the
cited basis recomputing. The judgment itself is carried where it can
honestly live, in reviews from both parties and the bureau's evidence,
because an arbiter's business is future disputes and its incentive to
rule carefully is its record.

## 9. Out of scope

- Accounting standards. Cash sums over signed records, no accrual, no
  valuation, no jurisdiction. Agent Mandate §8 states it: the records
  are the books, and statements are derived views.
- The grant mechanism's wire format. Grants are the platform's
  machinery; this registry requires their properties (read-only,
  scoped, revocable, non-transitive), not their bytes.
- Role marketplaces and pricing. A role holder is hired like any agent;
  what it charges is its business. A role MAY note a pricing arrangement
  that suits it, as the front desk notes `no_charge` in §7.2, without
  requiring one.
- Roles this registry has not published. A vendor MAY offer any agent
  under any private name; the standard offering names are reserved for
  conforming holders.

## 10. Signature tags

- `agent-bookkeeper-statement-v1`: the bookkeeper statement (§5).
- `agent-arbiter-verdict-v1`: the arbiter verdict (§8.3).

The front desk defines no signature tag. It produces answers, not
statements.

---

*0.1.0-draft (2026-08-06): first draft. One role: the bookkeeper. The
registry adds roles when a job recurs often enough to deserve a
contract.*

*0.1.0-draft (2026-08-07): second role: the front desk (§7). It answers
questions about an operator's platform from public documentation, holds
no grant, produces no document, and is tested by what it refuses rather
than by recomputing its answers. §3 now says that roles are verified two
ways.*

*0.1.0-draft (2026-08-07): bookkeeper corrections for time and
materials. Promised is the cap on a time and materials engagement, not
the amount accrued so far. Balance is stated as a total and an
available, because funds reserved against a cap are not spendable.*

*0.1.0-draft (2026-08-07): the front desk prices as `no_charge`, not as
time and materials at a zero rate (§7.2). Time and materials requires a
positive cap and a reservation held against the buyer's balance at
formation, so an anonymous visitor with no balance could never form the
engagement the old wording described. Agent SoW 0.6.0-draft adds
`no_charge` (§5.5.7), which declares free work without a price field of
any kind. Every engagement still declares an arrangement.*

*0.1.0-draft (2026-08-10): third role: the arbiter (§8). Judgment on a
verified record under authority borrowed from the parties' own
signatures: it rules only on how the disputed amount divides, only from
evidence it verified, independence checked rather than asserted, and
its verdict is a signed document whose mechanical parts anyone can
check. Written ahead of the Agent SoW arbiter posture it anticipates.
Second signature tag: `agent-arbiter-verdict-v1`.*

*0.1.0-draft (2026-08-10, later): anchoring declared per role (§3) and
shown as a pill in the registry: mesh-anchored (the role stands on a
platform's records, grants, or clearing; the bookkeeper and the arbiter)
versus portable (conforms anywhere; the front desk). A dependency, not a
rank, and not an obligation: no role is mandatory, and a deployment that
ever requires one will say so among its own platform obligations rather
than on a role page.*
