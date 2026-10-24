# Agent Roles: working descriptions

**Version:** v1.3.1
**Status:** Guide
**Date:** 2026-10-24

> Agent Roles is a guide. It holds working descriptions of jobs that recur wherever agents work, and of the exchanges underneath them. Each description says what a holder does, what it needs and what it refuses. The descriptions are semi-formal, and they will change as we learn. Where the text says MUST, SHOULD or MAY, read it as a plain description of what a holder does. The site at https://agentroles.ai shows each role and interface on a page of its own.

Some jobs on a mesh recur everywhere: every account eventually needs the
same few things done, the same way, by an agent it can trust on sight. A
**role** describes one of those jobs: the questions the agent answers, the
access it may hold, what it refuses, and the documents it produces. Any
agent that does the job as described can hold the role. Agent Roles
describes roles in three families (§3.1): roles that act on the mesh's own
workings, roles that act on an agent as a thing being made, proved and
run, and roles that act on work that spans agents.

Some behaviour recurs without being a whole job. Answering what a piece
of work would cost, or saying whether you are free right now, is not a
job anybody contracts an agent for, but two agents that have never met
still have to agree on how it is asked and answered. Agent Roles describes
those as **interfaces**: a slice of behaviour an agent implements,
alongside whatever else it does. Roles say what an agent is. Interfaces
say what an agent can be asked. An agent implements as many as it likes
and holds at most one role.

Agent Roles is a guide among the Common Agent Standards, beside
[Agent SoW](https://agentsow.com), [Agent RFP](https://agentrfp.net),
[Agent Mandate](https://agentmandate.net), and
[Agent Reputations](https://agentreputations.com). Those standardize
documents between parties. Agent Roles describes recurring jobs and the
recurring exchanges underneath them. It is transport-neutral and was
written alongside Agent Messaging, and nothing here requires a particular
network or vendor.

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
contracts "a bookkeeper" from any source knows exactly what it will do, what
it can see, and what it will refuse.

## 2. Terminology

MUST, MUST NOT, SHOULD, SHOULD NOT and MAY describe what a holder of a
role does, in the sense RFC 2119 gives them. The descriptions are working
ones, and any version of this guide can change them.

- **Role**: a recurring job published as a contract: scope, access,
  refusals, and output documents.
- **Profile**: the normative rules an agent must honor to hold a role.
- **Holder** (of a role): an agent that conforms to the profile and
  offers the role under its standard offering name.
- **Interface**: a slice of behaviour published as a contract: the
  exchanges an agent accepts, what each answer must carry, and what it
  refuses. Narrower than a role, and composable with other interfaces.
- **Implementer** (of an interface): an agent that declares the
  interface and answers its exchanges as published. Implementing an
  interface states nothing about what else the agent does.
- **Exchange**: one asked-and-answered pair an interface defines. An
  interface is a closed set of exchanges; anything outside it is
  refused, the same way a role's scope is closed.
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
desk, the matchmaker, and the facilitator are portable.

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

### 3.1 Three families

Roles are grouped by what they act on. The family is a way of reading the
registry, not a rank, and a role belongs to exactly one.

- **Mesh roles** act on the mesh's own workings: the bookkeeper (§4), the
  front desk (§7), the arbiter (§8), the matchmaker (§9), and the
  facilitator (§10).
- **Lifecycle roles** act on an agent as a thing being made, proved and
  run: the spec writer (§19), the solution planner (§32), the solution
  architect (§36), the impact
  analyst (§30), the catalog (§33), the test writer (§20), the code
  writer (§21), the code critic (§22), the security reviewer (§34), the
  package maker (§12), the deployment manager (§11), the conformance
  checker (§13), the agent critic (§23), the documenter (§35), the doc
  writer (§24), the publisher (§25), the watcher (§26), and the incident
  recorder (§27). Each
  holds one or more stages of the lifecycle mapped at
  https://agenticdevelopment.ai, and its chapter names them.
- **Composition roles** act on work that spans agents: the process runner
  (§28), and later whatever holds decomposing an ask into members.

### 3.2 What earns a page

One rule decides whether a job becomes a role here: a recurring job with
an artifact in, an artifact out, and a check the holder does not control.
A job that recurs but hands back nothing a third party can read is not a
role. A job whose check is the holder's own word is not a role either,
because the name would then mean whatever the holder said it meant. The
check need not be mechanical; a person reading the artifact against what
they already know is a check the holder does not control, and two roles
in this registry rest on that.


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
8. **Pricing.** A front desk is contracted like any agent, and every
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

## 9. Role: the matchmaker

An agent that finds other agents. One agent has work it cannot do
itself and no idea which agent to hand it to; it asks a matchmaker and
gets back a few candidate agents in order, each with a reason and a note
of what could not be established about it. The asker is an agent, the
candidates are agents, and the answer is machine-readable.

Directories answer "who does this?" and stop short of "who should I
contract?", because a directory that ranked on price or reputation would
bury small honest listings under large ones. That leaves the weighing to
somebody. Doing it in an agent means several matchmakers can compete, a
bad one can be replaced, and no single party's taste becomes the
market's.

### 9.1 The one question

Given this work and what matters to the asker, which agents are worth
approaching, and why each?

The answer is a short ordered list. Each pick carries an identifier, one
sentence of reasoning specific to it, and what the matchmaker could not
establish about it. The list carries a disclosure that the order is the
matchmaker's own.

### 9.2 The contract

1. **The order is disclosed as the matchmaker's own.** Every
   recommendation MUST state that the ranking is its judgment and not
   the index's. A buyer who mistakes an opinion for a neutral order
   cannot correct for it.
2. **Missing information is never evidence against a candidate.** An
   unrated agent is unrated, not bad; an unpublished price is unknown,
   not free. Absence MUST score neutrally and be disclosed. A
   matchmaker that penalises silence ranks paperwork rather than
   agents.
3. **Fitness outranks everything.** Relevance to the stated need MUST
   retain material weight whatever the buyer prioritises. Asked for
   "cheapest", a matchmaker returning free agents that cannot do the job
   has answered a different question.
4. **Every pick carries what is not known about it.** A recommendation
   with nothing said against it reads as vetted.
5. **Reasons distinguish.** The justification MUST name something
   separating that pick from the others in the same list; where nothing
   does, say so.
6. **Unverified claims travel labelled.** Where ranking uses what a
   candidate declared about itself, the recommendation MUST carry that
   these are the operator's own statements, verified by nobody.
7. **Narrowing is named.** Exclusions MUST be stated: the buyer's
   constraints, a mandate's limits, the matchmaker's reach. An
   unstated exclusion is indistinguishable from an empty market.
8. **It recommends; it does not commit.** A matchmaker MUST NOT form an
   engagement, sign for the buyer, or move money. It MAY hold a mandate
   to read on the buyer's behalf; it MUST NOT hold one to buy.
9. **An empty answer says which kind of empty.** "Nobody does this" and
   "nobody I can see does this" are different facts.
10. **Payment does not move a row.** A matchmaker MUST NOT accept
    consideration from a candidate to affect placement, and MUST
    disclose any commercial relationship with one it recommends.

### 9.3 The recommendation

Tag `agent-matchmaker-recommendation-v1`, signed with the family
convention. Required: `need`, `picks` (ordered, each with `id`, `why`
and `unknowns`), `considered`, `narrowed_by`, `sources`, `disclosure`,
`produced_at`, `by`. A recommendation without `disclosure`, or with a
pick lacking `unknowns`, does not conform however good its picks.

### 9.4 Conformance testing: the matchmaker

Verified by refusals and invariants, not by agreement with its picks;
taste cannot be recomputed and this registry does not pretend otherwise.

A harness checks: an unrated candidate does not rank below a badly rated
one; a capable paid agent still beats a free one that cannot do the job
when "cheapest" was asked; a request to contract an agent is refused; a request to
rank on something unobservable is declined rather than proxied; every
pick carries unknowns; the disclosure is present; reasons differ from
each other; an empty result distinguishes the two kinds of empty.

Whether its recommendations are good lives where that can honestly be
measured: whether the engagements it suggested were formed, what buyers
said afterwards, and the bureau's evidence about the matchmaker itself.
Several matchmakers competing on that record is the design, not a
tolerated side effect.

## 10. Role: the facilitator

A conversation with several agents in it runs some collaboration
pattern: a roll call, a critique circle, a relay. Real work does not
stay in one pattern. It opens with one, moves to another, and ends in a
third, and traditionally a person does the moving. Without somebody
holding that job, the pattern a conversation declared when it opened is
the only one anyone can point to, and the conversation quietly stops
matching it.

The facilitator holds that job. It is a member of the conversation, not
machinery around it, and its powers are exactly two: to say where the
conversation is, and to write that down where every member can check
it.

Two properties define it. **It runs the meeting and never judges the
work**, which is the line separating it from the arbiter (§8): the
arbiter judges and does nothing else, and a facilitator runs the
meeting and never judges. And **the conversation works without
it**: a facilitator's calls are advisory, the members proceed whether
or not it speaks, and a facilitator that has become a required path has
broken the role, because a stalled facilitator would then be a stalled
conversation.

**Standard offering name**: `role-facilitator`.

The same job also exists as an abstract agent in the
[Agent Catalog](https://agentcatalog.com/)
(`facilitator v1`, taking activities in
`ref/gm/run-a-working-session`). The two describe one job from two
sides: the abstract agent is the job description inside a process, and
this role is the checkable contract between strangers. An agent may
claim both, and conformance is tested here.

### 10.1 Scope: the five acts

A facilitator performs exactly five acts, each of them a signed message
in the conversation's record:

1. **Call the phase**: state which pattern the conversation is working
   in now.
2. **Keep the plan**: say where the conversation stands against its
   declared agenda, and what remains on it.
3. **Name whose turn it is**, where the pattern in force actually has
   turns.
4. **Note a departure** from the pattern, without blocking anything.
5. **Say when the agenda is exhausted**, rather than inventing a next
   phase.

The scope is closed. What is not on this list is refused.

### 10.2 The contract

1. **Membership, not observation.** A facilitator is a member of the
   conversation it runs, so it sees everything the members see,
   including the contents of an end-to-end encrypted conversation whose
   key it necessarily holds. That is the trust this role asks for, and
   it is stated rather than left implied. A facilitator holds no grant
   over any account's records: it reads the conversation it is in and
   nothing else, and it MUST NOT retain the conversation's contents
   after the conversation ends.
2. **Advisory, never a required path.** A facilitator's calls are
   advisory. The conversation MUST be able to proceed without them, and
   a facilitator MUST NOT present itself as a step the members have to
   clear. A composition that cannot progress while its facilitator is
   silent has not deployed this role.
3. **No judgment.** A facilitator MUST NOT rule on whether work is
   good, whether a party is right, or how anything divides. That is the
   arbiter's job (§8), under authority the arbiter borrows from the two
   signatures that named it. Nobody has granted a facilitator any such
   authority.
4. **No speaking for a member.** A facilitator MUST NOT state a
   member's position, summarise one as if the member had said it, or
   answer on a member's behalf. It MAY say that a member has not
   spoken. Silence is recorded, never interpreted.
5. **No blocking.** A facilitator MUST NOT claim to have stopped,
   muted, dropped, or refused anyone's message. Where the platform
   gives it no such power, claiming the power misstates what happened;
   where a platform provides one, it belongs to whoever holds the
   conversation, not to this role.
6. **No removals.** Expelling a member belongs to whoever convened the
   conversation. A facilitator notes conduct; it does not act on it.
7. **No authority over money.** A facilitator MUST NOT hold a mandate
   and MUST NOT have a settlement path, and a platform MUST refuse to
   issue a mandate to an agent offering `role-facilitator`.
8. **No self-extension.** A facilitator MUST NOT prolong a
   conversation, add a phase, or call for further rounds in order to
   keep itself engaged. A facilitator is paid to run a meeting and
   therefore has a standing incentive to have more meeting; the role
   forbids acting on it, and because every call it makes is a signed
   message in the record, acting on it is visible.
9. **Refusals name the reason.** Every declined request states which
   reason applies: outside the five acts, no authority to judge, no
   standing to speak for a member, or no power over who is in the
   conversation.
10. **No document.** This registry defines no signed statement and no
    signature tag for the facilitator, and the reason is not that its
    acts are unimportant. They are already signed, ordered, and
    attributable, because every phase call is a signed message in the
    conversation's record. A separate minutes document would be a
    weaker second copy of something the record already holds, and the
    family's line, quoted in §2 and again in §37, is that the records
    are the books.

### 10.3 Conformance testing: the facilitator

Behavioural, like the front desk and the matchmaker. A facilitator's
calls are judgments about where a conversation is, and this registry
does not pretend those can be recomputed, so the test is the refusals
and the invariants.

A harness checks that a candidate declines to judge disputed work, with
a reason; declines to state the position of a member that has not
spoken; does not claim to have blocked, muted, or removed anything;
declines to call the phase in a conversation where it is not the named
facilitator; says the agenda is exhausted rather than inventing a next
phase; states, where the pattern in force has no turn order, that it
has none rather than inventing one; and that a conversation whose
facilitator stops responding still progresses. A candidate that fails
any of these does not conform, and the quality of its other calls does
not repair that.

## 11. Role: the deployment manager

**Offering name:** `role-deployment-manager`
**Anchoring:** portable

The deployment manager turns a package into a running agent, and can say
afterward exactly what it did. The owner instructs a deploy; the
deployment manager installs the package; the result is an agent. Those
are three different things and this section keeps them apart: the acts
below are named deploy, update, rollback, reconfigure, remove and refuse
because they are what the owner asked for, and what happens inside a
deploy is an install. It takes an agent package, stands it up
on a named host and harness, gives it the identity its platform
requires, checks it, reports what was checked in words that do not
overstate it, and removes it cleanly when asked.

A deploy includes the agent's configuration. The deployment manager
places the agent's credentials by name and sets its ceilings before the
agent starts, as the install procedure of the Common Agent Specification
12.7 orders them, so there is never a moment when the agent is live
without its credentials and its limits. What a deploy hands back is a
running agent with an identity, an address and an inbox, its credentials
placed and its ceilings set, and a signed deployment record. A later
change to the settings, credentials or ceilings of a running agent is a
reconfigure. It installs no new version, and it leaves a signed record
of what changed.

It is defined as much by restraint as by capability. It touches hosts
and it places credentials, which makes it the most powerful role in
this registry, and the contract answers that power three ways: it acts
only on instruction, it follows its published procedure rather than
improvising, and it never holds a secret that a request handed it.

Which hosts and harnesses a given deployment manager can deploy to is
its own declaration, made on its card and its listing like any other
coverage claim. The role names none, because harnesses change on their
vendors' schedule and this specification does not. A harness, in the
sense the Common Agent Specification 12.1 gives the word, is the program
that does the thinking when a message arrives; it is not an agent, and
an agent is what exists after the install.

Stages held on the lifecycle map (https://agenticdevelopment.ai/stages.html): Deploy, Update, Rollback, Reconfigure and Decommission. Deploy includes configuring the agent before it starts, and the map has no separate stage for it.

### 11.1 What it can be asked

These exchanges are the role's primary interface, the deployer
(`interface-deployer`, per §14.3).

1. **Deploy this.** A package, a target host and harness, and the
   deploy-time decisions: which identity to mint or use, who may call
   the agent at first, whether a person attends it, and the ceiling for
   each system that spends. The request names the secrets the
   deployment will need; it never contains them. The answer is a
   running agent with an identity, an address and an inbox, its
   credentials placed and its ceilings set before it started, and the
   signed record.
2. **What is deployed?** The inventory: each agent it has stood up, its
   package and version, its target, its identity, and the state it was
   last known to be in.
3. **How did it go?** The report for one deploy: what was done, what
   was checked, and what kind of check it was.
4. **Update it.** The same package at a newer version, through the same
   steps and the same checks, with the same record at the end.
5. **Roll it back.** The running agent returned to the version it ran
   before, under the same identity, through the same steps and the same
   checks. A rollback is its own act, as the Common Agent
   Specification 12.7 says, and its record names both versions.
6. **Reconfigure it.** A change to the settings, credentials or ceilings
   of a running agent, with no new version. The request names any
   credential by name, as a deploy request does. The answer says what
   changed, and the record lists each change.
7. **Remove it.** Processes stopped, configuration entries removed, the
   identity retired, and a statement of anything that could not be
   removed.

### 11.2 The contract

1. **Only on instruction.** A deploy, an update, a rollback, a
   reconfigure and a removal each happen because the owner asked for
   that act. A deployment manager
   MUST NOT infer one from conversation, from a schedule, or from
   another agent's request, unless the owner has put that standing
   instruction in writing.
2. **Secrets are named, never carried.** A request names which secrets
   the deployment needs; the deployment manager fetches them from the
   owner's designated store and places them. A request that contains a
   secret value MUST be refused before the secret is used, because a
   role that accepted secrets in requests would teach every owner to
   paste credentials into messages.
3. **Checks are graded, and the grade is stated.** Every deploy ends
   with a check, and the record says which kind: a **smoke check**
   proves the agent boots, connects, and answers something; a
   **conformance check** proves it does the job its package describes,
   against known-answer work. A report that says "verified" without the
   grade does not conform. A smoke check reported as conformance is a
   false statement.
4. **The declarations are part of the deploy.** Who may call the agent
   at first, and whether a person attends it, are decisions the
   instruction must settle. A deployment manager MUST NOT let a
   harness's default answer either one silently.
5. **Procedure, not improvisation.** A deployment manager follows its
   published procedure for the target harness. When a step fails, it
   stops, reports the step and the state the target was left in, and
   escalates to a person. It MUST NOT work around a failed step by
   unplanned means, because it operates with host access and identity
   authority, which is exactly where an unanticipated step does the
   most damage.
6. **Least power, and no driving.** It holds access to the hosts it
   deploys to and to its platform's identity mint, uses both only in
   service of an instructed act, and MUST NOT operate the agents it
   deploys. Installing an agent and speaking as it are different
   powers, and this role holds only the first.
7. **Every act leaves a record.** Deploys, updates, rollbacks,
   reconfigures, removals, and refusals each produce the signed record
   in §11.3. An owner reconstructing what happened needs the records and
   nothing else.
8. **Removal is honest.** A removal record states what was removed and
   names anything that was not, because "removed" with a live
   credential left behind is the failure an owner cannot see.
9. **Configured before it starts.** A deploy places every credential
   the instruction names and sets every ceiling the instruction gives
   before the agent starts. A deployment manager MUST NOT start an
   agent whose credentials or ceilings are not in place. An instruction
   that gives no ceiling for a system that spends is refused before
   anything is installed, with a refusal record, because an agent that
   runs for even a minute without its limits can spend without them.
10. **A reconfigure changes settings, never the version.** A
    reconfigure changes the settings, credentials or ceilings of a
    running agent and nothing else. It MUST NOT change the package
    version or the identity, and a change that needs either is an
    update. The settings are the values the install decides rather than
    the package, such as a system's binding or the model the harness is
    given. A reconfigure keeps the limits a deploy keeps: it MUST NOT
    raise a ceiling above the one the package declares (Common Agent
    Specification 12.6, rule 6). Who may call the agent and whether a
    person attends it are declarations of the bound Descriptor, so a
    reconfigure that changes either binds a new Descriptor, and its
    record names the digest before and after. Credentials in a
    reconfigure are named and fetched as they are in a deploy, and a
    request that carries a credential value is refused.

### 11.3 The record

The document a deployment manager produces for every act. Tag:
`agent-deployment-record-v1`, signed with the family convention: the
ASCII tag, one newline, then the JCS (RFC 8785) canonical JSON of the
document with `signatures` removed.

```json
{
  "record": "v1",
  "role": "deployment-manager",
  "act": "deploy",
  "instructed_by": "<owner identity>",
  "package": {
    "name": "<package name>",
    "version": "<package version>",
    "url": "<where the package was fetched>",
    "sha256": "<digest of the bytes actually deployed>"
  },
  "target": { "host": "<host name>", "harness": "<harness and version>" },
  "agent": { "key": "<deployed agent public key>", "handle": "<handle, if named>" },
  "declarations": { "interaction": "service", "admitted_at_start": ["<caller>"] },
  "secrets_placed": ["<secret name>"],
  "ceilings": [
    { "system": "<system name>", "per": "<what the ceiling is per>",
      "number": "<the ceiling>", "enforced_by": "<the side that applies it>" }
  ],
  "checks": [
    { "kind": "smoke", "passed": true, "at": "<timestamp>",
      "what": "<plain words for what the check exercised>" }
  ],
  "produced_at": "<timestamp>",
  "by": "<deployment manager public key>",
  "signatures": [ ]
}
```

Rules:

1. `act` is one of `deploy`, `update`, `rollback`, `reconfigure`,
   `remove`, `refuse`. A refusal record carries `refused` with the
   reason in place of `checks`.
2. `package.sha256` commits the record to the bytes actually deployed,
   not the bytes the URL serves later. A verifier who fetches the URL
   and gets a different digest has learned the package moved, not that
   the record lies.
3. `checks[].kind` is `smoke` or `conformance`, and `what` says in
   plain words what the check exercised. The grade travels with every
   copy of the claim.
4. `secrets_placed` carries names only. A record containing a secret
   value is a conformance failure in itself.
5. A removal record repeats `agent` and `target`, lists what was
   removed, and lists what was not under `remaining`, which is empty
   only when the removal was complete.
6. `ceilings` lists each ceiling the act set, with the side that applies
   it. A deploy record lists every ceiling set before the agent started.
7. A rollback record carries `package` for the version the agent
   returned to and `rolled_back_from`, with the same members, for the
   version it left, so both digests are named.
8. A reconfigure record repeats `agent`, `target` and `package`
   unchanged, and lists under `changed` one entry for each setting,
   credential and ceiling it changed, each with `what`, `before` and
   `after`. A credential appears by name only, before and after. The
   record ends with the checks run after the change.
9. The acts `rollback` and `reconfigure`, and the members
   `rolled_back_from` and `changed`, are defined in the deployment record
   of the Common Agent Specification 8.3 with the meaning given here, and
   12.7 records a rollback under its own act so the record says whether
   the owner asked for an update or a rollback. The acts `update` and
   `refuse` are this role's additions to 8.3. A reader that knows only
   8.3 can still read the record, because every member 8.3 defines keeps
   its meaning.

### 11.4 Conformance testing: the deployment manager

Behavioural, against a sandbox target. A harness hands the candidate a
package, a target it controls, and an instruction naming a secret held
in a store. The candidate must produce a running agent whose attendance
and admission match the instruction, and a record whose digest matches
the bytes on the target. It is then asked to deploy from a request with
a secret value pasted in; it must refuse and record the refusal. A step
failure is injected mid-deploy; the candidate must stop, report the
step and the target's state, and escalate rather than improvise past
it. It is given an instruction that sets no ceiling for a system that
spends; it must refuse before anything is installed, and record the
refusal. It is asked to
reconfigure a ceiling on the running agent; the ceiling must change,
the version and the identity must not, and the record must list the
change. It is asked to roll back an update; the target must run the
previous version under the same identity, and the record must name both
versions. It is asked what is deployed; the answer must match the
target's real state. It is asked to remove; the target must come back clean, and
the removal record must match what a direct inspection of the target
finds. Finally the harness reads every record: a smoke check reported
without its grade, or graded as conformance, fails the candidate
regardless of how well the deploy went.

## 12. Role: the package maker

**Offering name:** `role-package-maker` (alias: `role-agent-builder`, the
name the role carried until 2026-09-14; a holder offering either name holds
the role)
**Anchoring:** portable

The package maker turns a description of a needed agent into a package
another system can deploy. It takes what an agent should do, the systems
it needs, what it must refuse, and the records it must leave, and it
hands back the package and its digest. The package holds the
declaration, which is the two files `agent-descriptor.json` and
`agent-runtime-requirements.json`, the parts the declaration names, such
as its skills, and a manifest. The digest is the SHA-256 over the
package's archive, which every record that mentions the package names
(Common Agent Specification 12.6, rule 5). It is
the other end of the deployment manager (§11): one makes the package, the
other stands it up.

Making a package is mostly authoring. The declaration and the parts are
written, and building, in the sense the Common Agent Specification 13.2
gives the word, only generates the views and writes the manifest's
digests. A build adds no fact the authored files did not state.

What it emits is an Agent Package as the Common Agent Specification
defines it (Chapter 12, https://agentdoc.net/package-spec.html): an Agent
Plugin carrying the agent's draft Descriptor and its runtime requirements
beside the manifest, under the namespace `net.agentdoc.package`. That chapter
owns the package's shape; this role owns the judgment a builder must ask
for and the record it signs.

It is defined by what it will not make up. A package is only as honest as
the judgment in it, and two parts are judgment rather than description:
what the agent refuses, and what it must record. The builder asks for
both and refuses to emit a package without them. And it never pretends to
have made a finished thing: every package it produces is a draft, because
nobody has run the agent it describes.

Stages held on the lifecycle map (https://agenticdevelopment.ai/stages.html): Package and Release.

### 12.1 What it can be asked

These exchanges are the role's primary interface, the builder
(`interface-builder`, per §14.3).

1. **Build this.** A description: a name, one sentence on what the agent
   does, the jobs it does (each becomes a skill), the systems it needs
   and at what access, what it refuses, what always goes to a person, and
   the records it must leave. The builder returns a package, or refuses
   and says what the description was missing.
2. **What did you build?** The manifest of a package it produced: its
   name, version, skills, systems, and obligations, and the note that it
   is a draft.
3. **Revise it.** The same description changed, rebuilt to a new version,
   with the same parts required.

### 12.2 The contract

1. **The judgment parts are required, never invented.** A package MUST
   carry what the agent refuses and the records it must leave, and the
   builder MUST refuse to emit one that lacks either. It does not derive
   them from the description, because an agent with nothing written down
   that it will not do, and no records it must keep, is the failure a run
   only reveals once it is too late.
2. **Every package is a draft.** The builder has not run the agent it
   describes and MUST NOT present the package as more than a starting
   point. The manifest carries the draft mark, and the record says nobody
   has run it.
3. **Systems are named by role, not by product.** Each system the agent
   needs is a role, an access level, and what the access is for. The
   builder MUST NOT name a vendor or wire a package to a particular
   supplier; binding roles to real systems belongs to whoever deploys it.
4. **Least access asked for.** Each system's access is the most the job
   needs and no more. The builder MUST NOT request write where the
   description only reads, or a trigger the jobs never fire.
5. **Skills are jobs, not tools.** One skill per thing somebody would ask
   the agent for, each saying when to reach for it, what a good result
   looks like, and what to do when it comes back empty.
6. **The manifest conforms to the plugin standard.** A package MUST
   validate against the Agent Plugin schema it declares, so any
   conforming runtime can load it. A package only this builder's own
   deployer can read is not portable, which defeats the point.
7. **Every build leaves a record.** Builds, revisions, and refusals each
   produce the signed record in §12.3.

### 12.3 The record

The document a package maker produces for every build. Tag:
`agent-build-record-v1`, signed with the family convention: the ASCII
tag, one newline, then the JCS (RFC 8785) canonical JSON of the document
with `signatures` removed.

```json
{
  "record": "v1",
  "role": "agent-builder",
  "act": "build",
  "requested_by": "<who asked>",
  "package": {
    "name": "<package name>",
    "version": "<version>",
    "schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
    "sha256": "<digest of the package the builder emitted>"
  },
  "shape": { "skills": 3, "systems": 2, "refuses": 3, "records": 4 },
  "draft": true,
  "produced_at": "<timestamp>",
  "by": "<package maker public key>",
  "signatures": [ ]
}
```

Rules:

1. `act` is one of `build`, `revise`, `refuse`. A refusal record carries
   `refused` with the reason and names which required part the
   description was missing.
2. `package.sha256` commits the record to the bytes the builder emitted,
   so a reviewer can confirm they are looking at what was built.
3. `draft` is always true. A build record claiming otherwise would assert
   the agent had been run, which the builder never does.
4. `shape` counts what the package carries. A build whose `refuses` or
   `records` count is zero is not a conforming build, and the counts are
   where that shows.
5. `role` carries `agent-builder`, the name the role had when this record
   format was published. A verifier accepts `package-maker` beside it, and
   records already signed keep the old value.

### 12.4 Conformance testing: the package maker

Behavioural. A harness hands the candidate a description and reads what
it emits. The package must validate against the schema it declares, carry
one skill per named job, name each system by role with the least access
the description implies, and carry the refusals and records the
description gave. The harness then hands a description with the refusals
removed, and one with the records removed; the candidate must refuse
each, naming the missing part, rather than emit a package with an empty
obligation. It hands a description that names a vendor for a system; the
package must carry the role and not the vendor. Finally the harness reads
the record: a build record whose `draft` is not true, or whose `shape`
disagrees with the package it points at, fails the candidate regardless
of how good the package is.

## 13. Role: the conformance checker

**Offering name:** `role-conformance-checker` (alias: `role-agent-evaluator`,
the name the role carried until 2026-09-14; a holder offering either name
holds the role)
**Anchoring:** portable

The conformance checker says whether a running agent does the job its package
describes. It derives a conformance test from the package's own
declarations, runs it against the deployed agent, and returns a signed
verdict. It completes the three operations jobs: the package maker (§12)
makes the package, the deployment manager (§11) stands it up, and the
evaluator checks that what is running actually holds.

It is defined by what it will and will not judge. A package's checkable
promises are three: what it refuses, what it escalates to a person, and
the records it must leave. The evaluator checks those mechanically. It
never grades the quality of the work, because quality is not a promise a
package makes and a machine cannot score it honestly.

Evaluation is a separate act an owner asks for, never a step a deploy
requires: the deployment manager's own graded check (§11) is what a deploy
ends with, and the record family says plainly when no evaluation exists
rather than implying one. An agent a person attends is not evaluated by
probing, because the person would be answering; its deploy check is the
check it carries.

Stages held on the lifecycle map (https://agenticdevelopment.ai/stages.html): Conformance.

### 13.1 What it can be asked

These exchanges are the role's primary interface, the evaluator
(`interface-evaluator`, per §14.3).

1. **Evaluate this.** A deployed agent and the package it was built from.
   The evaluator derives the test, runs it against the agent, audits the
   records the agent left, and returns a graded verdict.
2. **What is the test?** The eval derived from a package, without running
   it: the cases it would put and the records it would audit.
3. **What did you find?** The verdict for one evaluation: each case, its
   result, the records audit, and whether the agent conforms.

### 13.2 The contract

1. **The test is derived, never authored.** Every case MUST come from a
   declaration in the package under test: a refusal, an escalation, a
   skill, or a required record. The evaluator MUST NOT add a case from its
   own opinion of what the agent should do, because a hand-written test
   drifts from the agent and then fails it for the wrong reason. The
   verdict names, for each case, the declaration it came from.
2. **Only the checkable is graded.** Refusals, escalations, and records
   are checked mechanically: did it decline, did it route to a person,
   does the record exist. The evaluator MUST NOT auto-grade the quality of
   an agent's output. Skill cases confirm the agent engages and are
   flagged for human review, never passed or failed on quality.
3. **Inconclusive is not a pass.** A case the evaluator could not decide
   is reported inconclusive, and an agent with an inconclusive case does
   not conform until it is resolved. A missing record is a fail. Fail
   closed: the benefit of the doubt is never a passing grade.
4. **It observes, and does not touch.** The evaluator sends the agent
   requests and reads the records the agent left. It MUST NOT change the
   agent, its configuration, or its records, and MUST NOT deploy,
   redeploy, or remove anything. Testing and fixing are different powers,
   and this role holds only the first.
5. **The verdict is tied to the exact package.** A verdict names the
   package it graded by digest, so a report cannot be quietly moved onto a
   different version of the agent.
6. **Every evaluation leaves a record.** Evaluations and refusals to
   evaluate each produce the signed record in §13.3.

### 13.3 The record

The document a conformance checker produces for every evaluation. Tag:
`agent-eval-record-v1`, signed with the family convention: the ASCII tag,
one newline, then the JCS (RFC 8785) canonical JSON of the document with
`signatures` removed.

```json
{
  "record": "v1",
  "role": "agent-evaluator",
  "act": "evaluate",
  "requested_by": "<who asked>",
  "subject": { "agent_key": "<the evaluated agent>", "handle": "<handle>" },
  "package": { "name": "<package name>", "tree_sha256": "<digest graded>" },
  "cases": [
    { "id": "refuse-1", "kind": "refusal", "source": "<the declared refusal>",
      "verdict": "pass", "observed": "declined and named the reason" }
  ],
  "records_audit": { "required": 4, "found": 4, "missing": [ ] },
  "summary": { "pass": 6, "fail": 0, "inconclusive": 0, "flagged_for_review": 3 },
  "conforms": true,
  "produced_at": "<timestamp>",
  "by": "<conformance checker public key>",
  "signatures": [ ]
}
```

Rules:

1. `act` is one of `evaluate`, `refuse`. A refusal record carries
   `refused` with the reason, such as an agent it could not reach or a
   package it could not read.
2. Each case's `verdict` is `pass`, `fail`, or `inconclusive`. A capability
   case is `flagged`, never pass or fail, and `observed` says the agent
   engaged.
3. `conforms` is true only when no case is a fail, no case is
   inconclusive, and the records audit found every required record.
4. `package.tree_sha256` ties the verdict to the exact package. A verdict
   read against a different package version proves nothing.
5. `role` carries `agent-evaluator`, the name the role had when this record
   format was published. A verifier accepts `conformance-checker` beside
   it, and records already signed keep the old value.

### 13.4 Conformance testing: the conformance checker

Behavioural. A harness gives the candidate three deployed agents and their
packages: one built to hold its contract, one built to break a specific
declared refusal, and one that leaves none of its required records. The
candidate must return `conforms: true` for the first, a verdict whose
failing case is exactly the broken refusal for the second, and a
records-audit failure for the third. It is given a package and asked for
the test without running it; the cases must all trace to declarations in
that package. It is asked to grade the quality of an output; it must
decline, and its records must show no quality score. Finally the harness
inspects a verdict: a case with no source declaration, a quality grade, or
a `conforms: true` sitting over a fail or an inconclusive, fails the
candidate regardless of how much of the run was right.

## 14. Interfaces

A role is a whole job, and an agent holds at most one. That weight is
deliberate: the name has to mean something, so the scope is closed and
the refusals are absolute. It also means most agents will never hold a
role. Almost nothing is a bookkeeper.

The same few exchanges keep recurring underneath every job anyway.
Something asks an agent whether it is free. Something asks what a piece
of work would cost before committing to it. Something asks how a job
that was accepted is going. None of those is a job anyone contracts an agent for, and
all of them have to work between two agents that have never met and
share no vendor, no harness, and no code.

An **interface** publishes one of those slices. An agent implements as
many as it likes, alongside whatever else it does, and implementing one
says nothing about the rest. That is the difference from a role. A role
is what an agent is. An interface is what an agent can be asked.

### 14.1 What an interface publishes

Every interface publishes four parts, narrower than a role's and read
the same way:

1. **Exchanges**: what the implementer accepts, and what each answer
   MUST carry. The set is closed, and anything outside it is refused.
2. **Refusals**: what the implementer MUST decline or MUST NOT claim,
   with the refusal naming its reason.
3. **Documents**: the signed statements the interface defines, if any.
   Most define none, and say so.
4. **Conformance**: how a candidate is tested. For an interface this is
   always the same shape, because an interface is only its exchanges.
   Ask them, and check the answers.

An interface declares its anchoring like a role does. Both interfaces
published here are portable, and that is not incidental. An interface
exists so two parties who share nothing can work together; one that
needed a particular platform underneath it would have defeated its own
purpose.

Standard interface names are reserved the same way standard offering
names are. An implementer declares which interfaces it answers, and at
which version, wherever it declares the rest of its capabilities.

### 14.2 The rules that make interfaces composable

1. **Implementing states nothing else.** An implementer MUST NOT be
   read as claiming anything beyond the exchanges it declared. An agent
   that will tell you what a job would cost has said nothing about
   whether it can be trusted with money.
2. **Interfaces do not collide.** An agent MAY implement any number of
   them. Where two would define the same exchange, they are the same
   exchange or one is misnamed, and this registry MUST NOT publish
   interfaces whose exchanges overlap.
3. **A declaration is checkable by exercising it.** An interface MUST
   NOT require a claim that cannot be tested by asking, because a
   declaration nobody can check is a claim about paperwork.
4. **Silence is not an answer.** An implementer that does not answer a
   declared exchange does not implement it. There is no partial
   implementation and no degraded mode. An exchange that cannot be
   served right now is refused with a reason, and a refusal is an
   answer.
5. **Versioned by replacement**, like everything else in this family.
   An implementer declares the version it answers.
6. **A role MAY require interfaces of its holders.** §14.3 defines the
   relationship and what adding a requirement costs. The three operations
   roles publish their primary interfaces as named entries; no role
   requires a further interface beyond its primary yet.

### 14.3 Primary and required interfaces

A role's defining exchanges are its **primary interface**. Every role
answers a closed set of exchanges, and that set is an interface like any
other: it can be named, published, and implemented. When a role's primary
interface is published as its own entry, the role's scope section cites
it rather than restating the exchanges.

Implementing a primary interface alone does not grant the role. An
interface carries only the exchanges. The role also carries its
refusals, its access and handling rules, its conformance test, and the
documents its holders sign, and an agent holds the role only when it
meets all of it. An agent MAY implement a primary interface without
holding the role, and doing so states nothing beyond the exchanges
themselves, which is the same rule every interface carries (§14.2 rule
1).

Roles published before this section keep their exchanges inline until
each is migrated deliberately, and each migration is recorded in that
role's own changelog.

A role MAY also require interfaces beyond its primary one. A required
interface is part of the role's contract: every holder implements it,
and the role's page lists it beside the primary interface. An interface
a particular agent implements on its own, beyond what its role requires,
binds that agent alone, and nothing about the role promises it to a
caller.

Requiring an interface is a change to the role's contract, because every
existing holder must then implement it or stop conforming. A required
interface is therefore added only in a new version of the role, and only
for behaviour every holder truly must have. A role does not require an
interface that most holders would merely find useful.

## 15. Interface: the worker

An agent that can be given a piece of work by something that knows
nothing about it.

A fleet is rarely built from one thing. The agents in it come from
different vendors, run on different harnesses, and were mostly not
written to be managed at all. Something still has to hand them work and
find out how it is going. This interface is what lets the directing side
do that without knowing anything about the side being directed.

Standard interface name `interface-worker`. Portable.

### 15.1 The exchanges

1. **Are you free?** The answer states whether the implementer can take
   work now, and MAY state when that changes. The answer MUST come from
   the agent itself. A process being up is not the same as an agent
   being able to answer, and an interface that let anything other than
   the agent answer this would be reporting on the wrong thing.
2. **What would this take?** Given a description of work, the answer
   states whether the implementer can do it, what it would cost, and how
   long it would take. It MUST distinguish "I cannot do this" from "I
   cannot tell whether I can do this". An estimate is not a commitment
   unless the answer says it is, and the answer MUST say which it is.
3. **Will you take it?** The implementer accepts or refuses, and a
   refusal names its reason. Accepting means it owns that job until it
   delivers, fails, or is told to stop.
4. **How is it going?** For a job it accepted, the answer states
   working, blocked, done, or failed, with one line of detail. The
   implementer MUST answer even when nothing has happened, and MUST NOT
   report progress it cannot point at. Asked about a job it never
   accepted, it says so rather than inventing one.
5. **What came of it?** The result, or the failure stated plainly.
   Either is an answer. Only silence is not.
6. **What do you need?** The implementer raises a block: what it needs,
   and who it needs it from. This exchange exists because a stuck agent
   and a slow agent look identical from outside, and only the agent
   knows which it is.
7. **Stop.** The implementer accepts cancellation and states what
   condition the work is in. It MUST NOT keep working on a cancelled
   job.

### 15.2 The contract

1. **It does not price the deal.** The implementer says what work costs
   it. What that work is sold for is not its business, and the two
   numbers answer to different parties.
2. **It is never held to terms it was not given.** An implementer
   honours the constraints handed to it with the job, and MUST NOT be
   held to one it was never told. Making sure it is always told is what
   §16 is for.
3. **An accepted job is never dropped silently.** Where the implementer
   cannot continue, it says so through exchange 4 or 6. Going quiet is
   the failure this interface exists to eliminate.
4. **A second job is declared, not absorbed.** An implementer asked to
   take work while holding other work MUST say whether it can run both.
   Accepting quietly and then doing them one after another is how a
   stated turnaround becomes untrue.
5. **Refusal is specific.** An exchange outside what the implementer
   does is refused with the reason, never answered with a guess. An
   invented estimate is worse than no estimate, because it will be
   planned against.
6. **No document.** This interface defines no signed statement and no
   signature tag. Everything here is a live exchange between two parties
   that already know each other. Where a durable record of what was
   agreed matters, it is the directing side that owes it, and that
   obligation belongs to the role holding §16 rather than to either
   interface.

### 15.3 Conformance testing: the worker

Behavioural, like the front desk. A harness asks the seven exchanges and
checks that being free is answered by the agent rather than by something
watching it; that work outside what it does draws a refusal rather than
an invented estimate; that work it cannot assess draws "I cannot tell"
rather than a number; that a status question about a job it never
accepted is answered as such; that a job it accepted and then abandoned
reports failed rather than nothing; that a cancelled job stops; and that
every estimate says whether it is a commitment. Refusing an exchange
with a reason conforms. Not answering does not.

## 16. Interface: the manager

The other side of §15: what a worker can rely on from whatever is
directing it.

An interface with only one side published is half a contract. A worker
that answers all seven exchanges faithfully can still be stranded. It
can be handed a job with no statement of what counts as done, raise a
block that nobody answers, or keep working for an hour on something
cancelled upstream. This interface states what the directing side owes.

Anything that directs a worker implements it, including a person's
script. An agent that manages a fleet on an owner's behalf is a job
rather than a slice of behaviour, and this registry expects to publish
that as a role; the role would implement this interface, and nothing
here waits on it.

Standard interface name `interface-manager`. Portable.

### 16.1 The exchanges

1. **Here is work.** A job handed to a worker carries what is wanted,
   what counts as done, and every constraint already agreed with
   somebody else that limits how it may be done. A worker cannot honour
   a promise it was never told about.
2. **Here is your answer.** When a worker raises a block, the manager
   answers it. "I cannot clear this, refuse the job" is an answer. Not
   answering is the failure.
3. **Stop that.** The manager tells a worker when its job is no longer
   wanted. Work cancelled upstream and still running is spending
   somebody's money on nothing.
4. **What did you commit?** Asked by its owner, the manager states what
   it agreed on the owner's behalf and which worker it gave the work to.
   This is the one exchange facing the owner rather than the worker, and
   it is here because something that can commit on your behalf without
   being answerable for it is not something you should run.

### 16.2 The contract

1. **Terms flow down.** A manager MUST pass on every constraint it
   already agreed that bears on how the work is done, including where
   the work may be performed and what may be kept afterwards. A
   constraint that stops at the manager is a promise nobody is keeping.
2. **It MUST NOT assign work whose terms the worker cannot meet.**
   Checking that is the manager's job, and it happens before the
   assignment rather than after the failure.
3. **Capacity is confirmed, not assumed.** A manager MUST NOT state
   capacity it has not confirmed by asking, through exchange 1 of §15.
   A process list, a schedule, and its own memory of an earlier answer
   are not asking.
4. **It MUST NOT commit beyond the authority it holds.** Where a
   manager can commit at all, it refuses at its limit rather than at the
   failure that follows exceeding it.
5. **It answers, or it says it will not.** A raised block draws an
   answer within a stated time, or a statement that none is coming.
6. **Cancellation reaches the worker.** A manager that learns work is
   no longer wanted MUST tell whoever is doing it.
7. **It does not hide what it committed.** Exchange 4 is not optional
   and MUST NOT be answered selectively.
8. **No document.** Like §15, this interface defines no signed
   statement. What a manager committed on an owner's behalf is worth
   signing, and this registry expects the role holding this interface to
   define that statement. An interface says how two parties talk. What
   gets signed belongs to the job.

### 16.3 Conformance testing: the manager

Behavioural. A harness checks that a job handed down carries the
constraints already agreed above it; that a manager whose only available
worker cannot meet those constraints declines to assign rather than
assigning and hoping; that a raised block draws an answer or an explicit
refusal to answer, and never silence; that cancelling work upstream
produces a stop downstream; that a request to commit beyond its
authority is refused at the limit; and that asked what it committed, it
says, in full.

## 17. Interface: the entryway

What a stranger may ask before anybody has agreed to anything.

Every agent decides who it will deal with, and today each one decides in
its own way. Something that wants to contract an agent it has never met has
to be built for that agent specifically: work out what it is, ask for
access however that agent happens to expect it, and find out later
whether the request went anywhere. This interface names the small
set of exchanges that work before a relationship exists, so a caller
who knows nothing about the implementer can still get to the point of
being admitted or told no.

These exchanges are no longer optional. The Common Agent Specification
(https://agentdoc.net/common-agent.html) promoted them to the agent
floor: every conforming agent answers them, and that document's Section
4.4 carries their full text and contract and governs where the two ever
differ. This registry keeps the interface name, so a role can name the
entryway among its interfaces, and keeps the conformance harness below.

It is not the front desk (§7). The front desk is a whole job, answering
newcomer questions about an operator's platform from published material.
This is five exchanges about one agent's own door.

Standard interface name `interface-entryway`. Portable.

### 17.1 The exchanges

Five, by name: what are you; show me your descriptor; will you let me
talk to you; are you accepting new callers; and where do I stand. Each
exchange's question, what its answer must carry, and who it is answered
to are defined at the floor (Common Agent Specification §4.4).

### 17.2 The contract

The seven rules that travel with the exchanges are defined at the floor
(Common Agent Specification §4.4). One is restated here because §38
relies on it: the entryway defines no signed statement (rule 7). The
descriptor that exchange 2 serves is defined by the Common Agent
Specification's Descriptor chapter and carried unchanged; whether a
caller was admitted is the implementer's own business to keep.

### 17.3 Conformance testing: the entryway

Behavioural. A harness checks that a caller with no prior relationship
gets an answer to all five exchanges; that the descriptor exchange
returns bytes matching the stated digest, or plainly says none is
published; that a request to be admitted
carrying a piece of work is refused rather than performed; that every
refusal names a reason; that the policy exchange answers without naming
another caller; that a caller who has never asked is told so rather than
receiving an error; and that a caller whose admission was revoked is
told refused rather than still admitted.

## 18. Interface: revisable work

A delivered piece of work can be changed without being redone.

Work that comes back from an agent is often nearly right, and the usual
remedy is to run the whole job again. That charges the buyer the full
price for a change to one part, and it costs the agent the work of
producing the parts that were already right. A buyer that wants one
section rewritten or one image replaced has no way to ask for exactly
that, and no way to check afterwards that the rest was left alone.

This interface publishes what makes a delivered job changeable. With
every completion the implementer hands back a signed job manifest naming
each delivered piece: its name, the delivery step that made it, its
media type, its artifact reference, its size, its SHA-256 digest, and
the inputs it was produced from. A later request on the same offering
names the prior task and its manifest and asks for named steps to be
redone. The implementer redoes those steps and reuses every other piece,
at the same reference and the same digest, in the new manifest. The
caller checks the reuse by comparing digests, which is why the manifest
carries them.

Two things are cited here and defined elsewhere. The manifest's format
is the Common Agent Specification's `job-manifest-v1`. The revision
policy, meaning how many revisions a job includes, what a further one
costs, and how long the window stays open, is the agent's own
declaration under the Agent SoW revisions clause (Agent SoW §5.4.3) and
the descriptor's offering `revisions` member. The attribute this
interface backs, Revisable, lives in the Common Agent Specification's
attribute table.

It is not the builder's revise exchange (§12.1). That rebuilds a whole
package from a changed description. This applies to the output of any
offering, and it names the steps to redo rather than describing what
changed.

Standard interface name `interface-revisable-work`. Portable.

### 18.1 The exchanges

The first two are exchanges of this interface. The third is a request
on the offering that produced the work, and it is listed here because
this interface is what makes the offering answer it.

1. **What did you deliver?** The `job.manifest` exchange. The request
   names a task the implementer completed. The answer MUST be the
   signed job manifest of that completion, or a typed answer that it
   has none: no manifest for that task, or the task is unknown to it.
   The node answers from its records, without involving the model.
2. **What would redoing these steps cost now?** The `job.quote`
   exchange. The request names the prior task, the prior manifest by
   its artifact reference, and the step ids to redo. The answer MUST
   name each step with a flat price, the total price, how many included
   revisions are left, and when the revision window closes, or that it
   does not close. The node computes it from the declared revision
   policy and the count so far, without involving the model.
3. **Redo these steps.** Not a new exchange. A request on the offering
   that produced the work, carrying the prior task id, the prior
   manifest's reference, the step ids to redo, and the change itself in
   the request's text. It completes like any task, with a new job
   manifest attached, in which every piece not redone MUST carry the
   same reference and digest as before, and the manifest's `reused`
   member counts those pieces.

The definition file for this interface carries two members the other
definition files do not, `request` and `input`, which name the request
types and members each exchange is carried on; this is the one place
the registry names wire-level names, and it does so because the Common
Agent Specification defines them, not this registry.

### 18.2 The contract

1. **Every completion carries a manifest.** An implementer MUST attach
   a job manifest to every completion on an offering it implements this
   interface for, not only to the ones it expects to be revised. A
   revision names a manifest, so a completion without one cannot be
   revised.
2. **The manifest is signed by the agent's own key.** A manifest signed
   by anything other than the agent that did the work is not that
   agent's manifest, and an implementer MUST NOT hand one back as its
   own.
3. **Included revisions and prices come from the declared policy.** A
   quote MUST be computed from the declared revision policy and the
   count so far, and MUST NOT be set at the moment of asking.
4. **A revision it cannot cover is refused with its price.** A revision
   beyond the included count, with no budget covering its price, MUST
   be refused with a typed budget refusal carrying the price as a
   quote. The caller then knows what it would take, and a refusal with
   a reason is an answer.
5. **Reuse is computed, never asserted.** The `reused` count MUST be
   derived from the digests. A piece counts as reused only when the new
   manifest carries the same reference and the same digest for it as
   the prior one did. An implementer MUST NOT state a count it cannot
   show digest by digest.
6. **The two exchanges are answered from records.** The node answers
   `job.manifest` from what it holds and `job.quote` from the declared
   policy and the count so far, and MUST NOT involve the model in
   either, so both answers are cheap and the same each time they are
   asked.
7. **No document of its own.** This interface defines no signed
   statement and no signature tag. The job manifest it obliges is
   defined by the Common Agent Specification and carried here
   unchanged, the same way §17.2 carries the descriptor. What gets
   signed belongs to the work.

### 18.3 Conformance testing: revisable work

Behavioural. A harness runs a job on the offering and checks that the
completion carries a signed job manifest naming every delivered piece
with its digest; asks for one step to be redone through a request
carrying the prior task, the prior manifest, and the step; fetches both
manifests through the manifest exchange; and asserts that every piece
not redone has the same reference and the same digest in both, that at
least one piece changed, and that the new manifest's `reused` count
equals the number of unchanged pieces. It also checks that the manifest
exchange answers a task the implementer never completed with a typed
answer rather than an error; that a quote for named steps returns each
step's price, the total, the remaining included count, and the window;
and that a revision past the included count with no budget is refused
with the price as a quote rather than performed or dropped. Refusing an
exchange with a reason conforms. Not answering does not.

## 19. Role: the spec writer

**Offering name:** `role-spec-writer`
**Anchoring:** portable
**Family:** lifecycle roles (§3.1)

The spec writer turns what somebody wants, said in words, into the statement of the job that every later stage reads: what the agent does, what it refuses, what it needs access to, what it records, and what it costs. It hands back that statement and, beside it, the questions it could not answer.

It is the furthest left of the lifecycle roles, and the one whose output every other role consumes. The stage is safe to hand to an agent because of a check the writer does not control: the package maker refuses a statement that is wrong, so a statement that does not build is not a statement.

Three things are never invented here, whatever the model drafting the statement would prefer: the agent's name, its price, and access to any system. Each is a commitment somebody would be held to, so each is asked for, and the statement goes out with it still open.

Stages held on the lifecycle map (https://agenticdevelopment.ai/stages.html): Requirements, and Design, the second part of Architecture and Design, for a single agent. The solution planner (§32) holds the same for a solution. The solution architect (§36) holds Architecture, the first part of that stage, and the spec writer writes a statement whose steps use only the systems the architecture record names.

### 19.1 What it can be asked

These exchanges are the role's primary interface, stated here, with no
entry of its own (§14.3). Implementing them alone does not
grant the role.

1. **Write the statement.** What somebody wants, in words, with whatever they have: notes, a document, an earlier statement, a prototype. The writer returns the statement of the job and the questions it could not answer.
2. **Revise it.** A statement sent back with what to change. The writer changes what was asked, keeps the rest, and does not draft again from the start.

### 19.2 The contract

1. **It writes the statement and nothing after it.** The spec writer MUST NOT write the scripts the statement names. Its output is the statement, and the code writer's check depends on the statement having been written by something that will not write the code.
2. **A blank is asked, never filled.** The name, the price, and access to any system are commitments. The writer MUST ask for each and MUST NOT fill it in, and a request that names anything outside the agent's own folder MUST settle what systems the agent reaches or raise the question, never declare that nothing is needed.
3. **The statement is checked by the builder.** A statement is delivered only when the package maker's own check accepts it. A statement the builder refuses is returned as the refusal and the writer's questions, never as a finished statement.
4. **Every job says how it is done.** Each step of the statement says when it is the right one, what a good result looks like, what happens when there is nothing to give, and whether it is a program or a judgment. A step written down in full and left to a model to interpret is refused by the check.
5. **What it went without is said.** Where the writer goes ahead missing something it takes, it records what it went without and repeats it in the reply.

### 19.3 The record

The statement itself, in the package specification's form, and the questions beside it. The role defines no signature tag: what it delivers is carried under the signed job manifest the Common Agent Specification defines for every delivery (§18.2 rule 7), and the statement's own form is that specification's Chapter 12.

### 19.4 Conformance testing: the spec writer

Behavioral. A harness hands the candidate an account of a needed agent that names a system outside the agent's own folder and leaves the price open. The statement must name the system's role and access or raise the question, must leave the price open, and must build under the package maker. The harness sends the statement back with one change; the revision must carry that change and nothing else changed. It hands an account with nothing to build from; the candidate must ask and must not invent. A statement that fills a commitment the account left open fails the candidate regardless of how well the rest reads.

### 19.5 Open

Whether the spec writer interviews a person over several messages or answers once, as every other role here does, is not settled.

## 20. Role: the test writer

**Offering name:** `role-test-writer`
**Anchoring:** portable
**Family:** lifecycle roles (§3.1)

The test writer writes the suite from the statement of the job, before any script exists, and by something that will not write the scripts. The suite names the functions the scripts will have to export, so the scripts are written to meet an interface they did not choose.

Test sits before Code in this lifecycle, whatever the habit of the older ones, because the same model often writes the program and the test, and a test can pass by agreeing with a mistake. The order is the answer.

The model writes the suite; the program proves it. A suite written before any script exists is run against an empty stand-in for every script the statement names, and it has to fail. Once the scripts exist, each is removed in turn and the suite has to notice.

Stages held on the lifecycle map (https://agenticdevelopment.ai/stages.html): Test.

### 20.1 What it can be asked

These exchanges are the role's primary interface, stated here, with no
entry of its own (§14.3). Implementing them alone does not
grant the role.

1. **Write a suite.** The statement of the job. The writer returns the suite and a note of what no test could be written for and why.
2. **Prove a suite.** A package with its scripts. The writer runs the suite, removes each script in turn, and returns which scripts the suite noticed going missing and which it did not.

### 20.2 The contract

1. **It never touches a script.** The test writer MUST NOT change a script to make a test pass. Its output is the suite; the scripts are the code writer's.
2. **A suite must fail against nothing.** A suite that passes with every function absent has asserted nothing, and the writer MUST NOT deliver it. The suite is run against empty stand-ins for every script the statement names before it is handed back.
3. **A script the suite does not notice is named.** When the scripts exist, each is blanked in turn. A script whose absence the suite never notices is a script nothing tests, and the reply names it.
4. **What could not be tested is said.** Where the statement gives no material for a test, the writer says so beside the suite and writes no test that asserts nothing.

### 20.3 The record

The suite, and the note of what could not be tested. The role defines no signature tag; the delivery travels under the signed job manifest the Common Agent Specification defines (§18.2 rule 7).

### 20.4 Conformance testing: the test writer

Behavioral. A harness hands the candidate a statement naming three scripts. The suite must import from those scripts and fail when every one is an empty stand-in. The harness then supplies scripts that pass, blanks one, and asks the candidate to prove the suite; the reply must name the blanked script as noticed, or as not noticed when the suite did not catch it. It hands a package with a failing test and asks for it to pass; the candidate must not change a script. A suite delivered that passes against empty stand-ins fails the candidate.

## 21. Role: the code writer

**Offering name:** `role-code-writer`
**Anchoring:** portable
**Family:** lifecycle roles (§3.1)

The code writer writes the scripts the statement names, in the stack the owner has settled on, passing a suite it did not write. It takes the statement, the suite, and a prototype in any language when somebody made one, and hands back the scripts, an account of what it wrote and what the statement did not settle, and the record of every round.

This is the one role in the lifecycle where the model holds control. Every other lifecycle role calls a model at a named point. A coding harness works the way a coding session works: write, run the check, read the failures, fix, for as many rounds as it takes up to a ceiling. Which harness is a setting of the deploy, not the package's to choose.

A model in control needs a stronger check than a model called at a named point, and this role has one because none of the check is the model's: a suite it did not write, each script blanked in turn, the package maker taking what was written, and a fence of digests over the tests and the statement so the writer of the scripts cannot also change what checks them. Afterward the code critic (§22) reviews the delivery. The check runs outside the work, on the host, before the reply is accepted, and a delivery it refuses does not move on whatever the harness said about it.

Only what this role delivers moves on to Build. Whatever else was written, in whatever language and by whoever, is a prototype. A prototype is read here as the most exact statement of what was wanted and written again against the suite. Anything the prototype did that the statement never said does not survive the rewrite; if it is wanted, it goes into the statement first.

Stages held on the lifecycle map (https://agenticdevelopment.ai/stages.html): Code.

### 21.1 What it can be asked

These exchanges are the role's primary interface, stated here, with no
entry of its own (§14.3). Implementing them alone does not
grant the role.

1. **Write the scripts.** The statement, the suite, and a prototype when there is one. The writer returns the scripts, its account, and the record of every round, or the last failures named when the ceiling was reached, or a conflict for a person to settle when a test cannot pass without breaking the statement.

### 21.2 The contract

1. **It writes scripts and nothing else.** The code writer MUST NOT edit a test, edit the statement, write outside the scripts folder, install anything, or reach a network. The tests and the statement are compared by digest on every round, and a changed one ends the job as a broken fence.
2. **Done is mechanical.** A delivery is done when the suite passes, every blanked script is noticed, the package maker takes the package, and the fence held. When the four do not hold there is no handoff. A blanked script the suite does not notice is said, not held against the writer, because fixing it means writing a test.
3. **An open question a test depends on is a conflict, not a decision.** The writer MUST NOT settle a question the statement left open when a test depends on the answer. It reports the conflict for the review gate to settle.
4. **The check is outside the work.** The harness that does the work can write anything into its job folder, including a record that says it is done. So the check that decides a delivery is run by the host, over what came in and what went out, and reads nothing the harness wrote about itself.
5. **A prototype is rewritten, never packed.** A prototype is read as a statement of intent and written again in the settled stack against the suite. The writer MUST NOT deliver the prototype's files as its own.
6. **Every round is recorded.** The record of every round, with what failed and what changed, is delivered with the scripts.

### 21.3 The record

The scripts, the writer's account, and the record of every round. The role defines no signature tag; the delivery travels under the signed job manifest the Common Agent Specification defines (§18.2 rule 7), and that manifest is what the package maker reads to trace every script it packs to this role's delivery.

### 21.4 Conformance testing: the code writer

Behavioral. A harness hands the candidate a statement, a suite that fails against empty stand-ins, and no prototype. The delivery must pass the suite, be noticed when each script is blanked, and build under the package maker. The harness then hands a suite whose one test cannot pass without breaking the statement; the candidate must report the conflict and must not change the test or the statement. It hands a prototype in another language; the delivery must be scripts in the settled stack and must not carry the prototype's files. Finally the harness reads the job folder after a run: a delivery whose scripts fail the suite when run outside the work fails the candidate whatever the account says.

## 22. Role: the code critic

**Offering name:** `role-code-critic`
**Anchoring:** portable
**Family:** lifecycle roles (§3.1)

The code critic reads a change to a package and says what is wrong with it. It hands back findings, each naming a file and a line, for a person to decide on. It changes nothing.

A change to a package includes more than its scripts. What the package declares is part of the change too: the systems it asks for, at what access, with which credentials, and what it says it refuses. A change that adds write access to a new system gets a finding even when no script changed.

Deciding what the whole package may reach and spend is the job of the security reviewer (§34), at the next stage. The code critic reports on the change it is given and writes no statement of what the agent may be given.

Stages held on the lifecycle map (https://agenticdevelopment.ai/stages.html): Review.

### 22.1 What it can be asked

These exchanges are the role's primary interface, stated here, with no
entry of its own (§14.3). Implementing them alone does not
grant the role.

1. **Review this change.** The diff of a package's scripts and any change to what it declares. The critic returns findings, each naming a file, a line, a claim and a consequence.

### 22.2 The contract

1. **It changes nothing.** The code critic MUST NOT change the code, open a pull request, or fix what it found. A critic that fixes holds the next stage's authority.
2. **A finding names a place.** Every finding names a file and a line, states a claim, and states a consequence. A finding a person cannot locate is not a finding.
3. **No grade on the whole.** The critic MUST NOT grade the work overall. It reports findings; accepting or rejecting each one is a person's act.
4. **The declaration is read as code.** A change to what the package asks for, at what access, or what it refuses, is reviewed as a change, whether or not a script changed with it.

### 22.3 The record

The findings. The role defines no signature tag; the delivery travels under the signed job manifest the Common Agent Specification defines (§18.2 rule 7).

### 22.4 Conformance testing: the code critic

Behavioral. A harness hands the candidate a change that adds write access to a new system and changes no script. The findings must include that access, naming the declaration. It hands a change with a defect in a script; the findings must name the file and the line. It hands a change and asks for it to be fixed; the candidate must decline. A reply that grades the change as a whole, or a finding with no location, fails the candidate.

## 23. Role: the agent critic

**Offering name:** `role-agent-critic`
**Anchoring:** portable
**Family:** lifecycle roles (§3.1)

The agent critic judges the work itself. The conformance checker says an agent answers as its package declares; the agent critic says whether the answer was any good, against a standard set beforehand by somebody other than the maker. It hands back graded findings with the cases behind each grade.

It sits in Run because it judges what an agent does on real jobs after it is installed, beside the monitoring that says whether it answered at all. A standard set beforehand is what makes the grade a stage's output; without one it is an opinion.

Its backlog is already written down. Every case the conformance checker cannot judge goes into a bucket flagged for a person with a reason, and that bucket is the specification for this role.

Stages held on the lifecycle map (https://agenticdevelopment.ai/stages.html): Eval.

### 23.1 What it can be asked

These exchanges are the role's primary interface, stated here, with no
entry of its own (§14.3). Implementing them alone does not
grant the role.

1. **Grade this work.** An agent's answers to real or posed work, and the standard they are graded against. The critic returns graded findings, each with the cases behind it.

### 23.2 The contract

1. **It changes nothing.** The agent critic MUST NOT change the agent it grades.
2. **No grade without its cases.** A grade is reported with the cases behind it, each one readable. The critic MUST NOT report a grade on its own.
3. **The standard predates the work.** The critic grades against a standard set before the work was done, by somebody other than the maker. A standard written after the fact is an opinion.
4. **It is checked by agreement.** The role's check is agreement with a person on a sample of its findings, and the sample is part of what it hands back.

### 23.3 The record

The graded findings with their cases. The role defines no signature tag; the delivery travels under the signed job manifest the Common Agent Specification defines (§18.2 rule 7).

### 23.4 Conformance testing: the agent critic

Behavioral. A harness hands the candidate an agent's answers and a standard, with one answer that meets the standard and one that does not. The findings must grade each, with the cases behind each grade. It asks for a grade with no standard; the candidate must decline. It asks the candidate to fix the agent; it must decline. A grade reported without its cases fails the candidate.

### 23.5 Open

What the agent critic judges against is not settled: the package's own declaration is checkable and narrow, what the buyer wanted needs something the package does not contain, and a standard written per offering is a third option.

## 24. Role: the doc writer

**Offering name:** `role-doc-writer`
**Anchoring:** portable
**Family:** lifecycle roles (§3.1)

The doc writer writes the documentation for whoever has to use or maintain a package, from the package and its records. It is distinct from the AgentDoc, which is assembled from what an agent already declares and never authored; this role writes the software's own documentation.

Its check is the weakest in this registry, and that is why it is published last among the lifecycle roles: nothing mechanical says whether documentation is right.

Stages held on the lifecycle map (https://agenticdevelopment.ai/stages.html): Docs, for the written documentation. The documenter (§35) holds Docs for the AgentDoc.

### 24.1 What it can be asked

These exchanges are the role's primary interface, stated here, with no
entry of its own (§14.3). Implementing them alone does not
grant the role.

1. **Document this package.** A package and its records. The writer returns the documentation for whoever has to use or maintain it.

### 24.2 The contract

1. **It writes from the package and its records.** Every statement in the documentation traces to the package's declaration, its scripts, or a record the package left. The writer MUST NOT describe behavior the package does not declare.
2. **It changes nothing it documents.** The doc writer MUST NOT change the package or its records.
3. **What is not documented is said.** Where the package or its records give nothing to write from, the documentation says so and leaves the gap open.

### 24.3 The record

The documentation. The role defines no signature tag; the delivery travels under the signed job manifest the Common Agent Specification defines (§18.2 rule 7).

### 24.4 Conformance testing: the doc writer

Behavioral, and weak. A harness hands the candidate a package with three declared jobs and records from two of them. The documentation must cover the three jobs, must trace each statement to the declaration or a record, and must say that the third job has no record to write from. A statement about behavior the package does not declare fails the candidate.

## 25. Role: the publisher

**Offering name:** `role-publisher`
**Anchoring:** portable
**Family:** lifecycle roles (§3.1)

The publisher puts finished files where the person who asked for them can open them, and takes them down again by the same authority. It hands back an address that opens and a record of what is served there, or a record of what was taken down and when.

Publishing is the one stage that makes work visible outside the system, so it is the one stage where a mistake is public, and the one whose output outlives the job that made it. The ability to publish without the ability to undo it is a decision, and this role holds both acts because the same authority and the same record cover them.

The holder writes under the one folder it was bound to and nowhere else, reads every byte before it goes, refuses anything that looks like a credential whatever the file is called, and reads back what is served to check it matches what it was handed. Nothing is given as published until the address has been read.

Stages held on the lifecycle map (https://agenticdevelopment.ai/stages.html): Publish and Retract.

### 25.1 What it can be asked

These exchanges are the role's primary interface, stated here, with no
entry of its own (§14.3). Implementing them alone does not
grant the role.

1. **Publish this.** Finished files and where they may be written. The publisher returns an address a person can open and the digest of what is there.
2. **Retract this.** The address, or the name it was published under. The publisher returns a record of what was taken down, by whom, and when.

### 25.2 The contract

1. **One folder, and nothing outside it.** The publisher writes under the folder it was bound to and MUST NOT write anywhere else.
2. **Every byte is read before it goes.** The publisher reads what it is handed and MUST refuse anything that looks like a credential, whatever the file is called.
3. **Published means read back.** Nothing is reported as published until the address has been read and what it serves matches the digest of what was handed over.
4. **It takes down only what it put up.** The publisher MUST NOT take down something it did not publish, however it is asked. The standing record of every name it has published under is what lets it tell the difference.
5. **Retracted means read back too.** A retraction is reported only when the address has been read and nothing is there, and the record says who took it down and why.

### 25.3 The record

The address and the digest of what is served there, or the record of the takedown, and the standing record of every name published under. The role defines no signature tag; each delivery travels under the signed job manifest the Common Agent Specification defines (§18.2 rule 7).

### 25.4 Conformance testing: the publisher

Behavioral. A harness binds the candidate to one folder and hands it files; the address returned must open and serve bytes matching the digest. It hands a file containing what looks like a credential; the candidate must refuse and publish nothing. It asks for a write outside the bound folder; the candidate must refuse. It asks the candidate to retract an address it never published; it must refuse. It asks it to retract one it did; the address must then serve nothing, and the record must say who and when. A report of published or retracted made without reading the address back fails the candidate.

## 26. Role: the watcher

**Offering name:** `role-watcher`
**Anchoring:** mesh-anchored
**Family:** lifecycle roles (§3.1)

The watcher reports on a fleet from the platform's own records: who answered, who went quiet, and what each agent spent against its declared ceiling. One role for two stages, because both are standing reports off data the platform already holds, on the same cadence, for the same reader.

The trap specific to agentic work is that a process being up says almost nothing: an agent whose inbox is served and whose model is refusing every call looks healthy from the outside. Liveness is measured by an answer, and silence counts as a failure.

It wakes no model. Its intelligence is none and its cost is none; it reads numbers it does not produce and reports them.

Stages held on the lifecycle map (https://agenticdevelopment.ai/stages.html): Monitor and Cost.

### 26.1 What it can be asked

These exchanges are the role's primary interface, stated here, with no
entry of its own (§14.3). Implementing them alone does not
grant the role.

1. **Who is quiet, and what did we spend?** The agents to watch. The watcher returns, for each, whether it answered and when it was last seen, and what it spent against its ceiling, with every ceiling crossed named.

### 26.2 The contract

1. **It reads the platform's numbers and produces none.** The watcher reports from the records the platform keeps of who answered and what was spent. It MUST NOT compute a figure those records do not carry, which is what makes its report checkable against them.
2. **Silence is a failure.** An agent that did not answer is reported as not answering, never left out of the report as no news.
3. **It wakes no model.** The watcher calls no model. Its report is a reading of records.
4. **The agents it watches are named to it.** The owner names the agents to watch. The watcher does not enumerate an account's agents on its own, which is the more sensitive read by a distance.

### 26.3 The record

The standing report. The role defines no signature tag; each delivery travels under the signed job manifest the Common Agent Specification defines (§18.2 rule 7).

### 26.4 Conformance testing: the watcher

Arithmetic and behavioral. A harness gives the candidate a platform's records for three named agents, one of which stopped answering and one of which crossed its ceiling. The report must name the quiet one as not answering, name the crossed ceiling, and carry spend figures equal to the records'. A report that omits the quiet agent, or states a figure the records do not carry, fails the candidate.

### 26.5 Open

Nothing on the platform yet sends the watcher a message on a schedule, so whether it reports on its own or only when asked is not settled, and a packaged agent cannot yet read the platform's spend and liveness records, which is a platform change before this role can be held.

## 27. Role: the incident recorder

**Offering name:** `role-incident-recorder`
**Anchoring:** portable
**Family:** lifecycle roles (§3.1)

The incident recorder writes the timeline of what happened when an agent went quiet or failed, with what is known and what is not. It restarts nothing, changes nothing, and does not say what caused it.

Responding to an incident is a person's act. Recording one is not, and the first version of this role does only the second. The account it writes outlives the people who were there.

Stages held on the lifecycle map (https://agenticdevelopment.ai/stages.html): Incident response.

### 27.1 What it can be asked

These exchanges are the role's primary interface, stated here, with no
entry of its own (§14.3). Implementing them alone does not
grant the role.

1. **Record this incident.** An agent that has gone quiet, or a failure, and whatever monitoring saw and the agent's records. The recorder returns a timeline of what happened, with what is known and what is not.

### 27.2 The contract

1. **It changes nothing.** The incident recorder MUST NOT restart anything or change anything.
2. **It records, and does not diagnose.** The recorder MUST NOT say what caused the incident. It writes what happened and when, and marks what is not known as not known.
3. **Known and not known are kept apart.** Every line of the timeline is either a fact from a record, with the record named, or a gap, said to be one.

### 27.3 The record

The timeline. The role defines no signature tag; the delivery travels under the signed job manifest the Common Agent Specification defines (§18.2 rule 7).

### 27.4 Conformance testing: the incident recorder

Behavioral. A harness hands the candidate the records of an agent that stopped answering, with one hour of the record missing. The timeline must place each event from the records and mark the missing hour as not known. It asks what caused it; the candidate must decline. It asks the candidate to restart the agent; it must decline. A timeline that states a cause, or fills the gap, fails the candidate.

## 28. Role: the process runner

**Offering name:** `role-process-runner`
**Anchoring:** portable
**Family:** composition roles (§3.1)

The process runner runs a process document as written: it sends each phase to the agent that holds it, stops at every gate for the owner, records who did what and when, and delivers the account and the run record. The document is the owner's. The runner adds nothing to it and takes nothing away, and when a message and the document disagree, the document governs.

It is the first composition role: its job is the work that spans agents. Toward the agents that hold the phases it is the manager (§16): here is work, here is your answer, stop that, what did you commit. Toward the owner it holds every gate, asks one question at a time, and answers for everything it committed.

Every message it receives is handled by running one command, including a one word answer such as yes, stop or status. It never answers a run from its own words.

### 28.1 What it can be asked

These exchanges are the role's primary interface, stated here, with no
entry of its own (§14.3). Implementing them alone does not
grant the role.

1. **Run this process.** A process document with its owner and effective date filled in, a roster of who holds each phase, and the material the trigger delivers. The runner starts the run, or refuses to start and names every reason.
2. **What is the status?** The account of an open run: what it waits on, who holds each phase, what has been approved by whom and when.
3. **What did you commit?** The whole of it, from the run record: every message sent, to whom, with its id and time; what money was committed; which holder was given each phase and how it was found. Never a selection.
4. **Stop.** Every holder still working is told the work is no longer wanted, and the run closes as abandoned with what was left open named.

### 28.2 The contract

1. **A document with no owner runs nowhere.** A document with no owner or no effective date is a reference process, and the runner MUST refuse to start a run from it. The same for a document with an automation level still blank: choosing one is the owner's amendment, not the runner's decision.
2. **No level is ever raised.** The runner MUST NOT raise a phase to a higher level of automation than the document states, on any flag, override or timeout. A gate approved the same way forty times is still a gate.
3. **Order comes from the document, not the list.** A phase starts only when every phase its document names before it has closed and every handoff into it exists. The runner MUST NOT infer the order of phases from the order they are listed in.
4. **A gate is the owner's word.** A phase a person must do completes only with the named owner's answer, recorded with their name and the time. A posted message, an expiry, or silence is not an approval. A yes at a gate, a deviation, and the answer to a holder's question come from the owner the document names and from nobody else.
5. **A holder's question is answered from the document or by the owner.** The runner MUST NOT answer a holder's question from its own opinion or with a fact the document does not carry. It quotes the line that settles the question, or relays the question to the owner, and a holder is never left waiting without a word.
6. **It commits no money beyond the instruction.** Without a budget line the runner commissions only free or already agreed work and says so in every work message. A price that arrives is put to the owner and never accepted by the runner.
7. **Terms flow down.** A message to a holder carries what is wanted, what counts as done, the files it needs, and every constraint from the document. A holder that never saw a constraint cannot be held to it.
8. **Records are written once.** The run records the version of the document it ran under and MUST NOT alter a record after it is written, including when the document changes. A credential value that arrives in a message is removed before anything is written.
9. **What it committed is answered in full.** Asked what it committed, the runner answers from the run record and MUST NOT answer selectively.

### 28.3 The record

The run record, with every event of the run in order and the version of the document it ran under, and the account for the owner, rewritten after every turn. The role defines no signature tag; each delivery travels under the signed job manifest the Common Agent Specification defines (§18.2 rule 7). The process document's own form is defined by the Agent Processes language and cited here.

### 28.4 Conformance testing: the process runner

Behavioral. A harness hands the candidate a document with no owner; it must refuse and name what is missing. It hands a document whose phases are listed out of order from what their lines say; the run must follow the lines. It runs a document with one supervised phase and posts a message from somebody other than the owner saying yes; the phase must stay held. It has a holder ask a question the document does not settle; the candidate must relay it to the owner and must not answer from its own opinion. It asks what the candidate committed; the answer must match the run record message for message. It says stop; every working holder must be told, and the run must close as abandoned with what was open named. A run that raises a level, starts a phase early, or answers a holder from its own opinion fails the candidate.

## 29. Interface: the lifecycle

An agent can be asked to pause, resume, and stop, and it does what it is
asked, including work it was doing off the mesh.

An owner or an operator who needs an agent to stop can cut it off from
the mesh. That stops its messages. It does not stop work the agent was
doing somewhere else, such as a program it started on its own machine
or a call it is making to an outside service. Only the agent can end
that work, so the first step in stopping an agent is to ask it to stop.
This interface says how that request is made and what the answer must
say. A caller that also plans to cut the agent off from the mesh SHOULD
send the request first, before it cuts the connection.

Two parties may ask: the agent's owner, and the operator of the mesh the
agent is on. Anyone else is refused, and nothing changes.

Standard interface name `interface-lifecycle`. Portable.

### 29.1 The exchanges

1. **Pause.** The answer MUST say the agent is paused and how many
   pieces of running work it stopped. From then on the agent takes no
   new work and sends nothing until it is resumed.
2. **Resume.** The answer MUST say the agent is running again, or refuse
   with the reason. Work the pause stopped does not restart; the agent
   takes new work again.
3. **Stop.** The answer MUST say the agent is stopped and that every
   piece of work it had was stopped, on the mesh and off it.
4. **Are you running?** The answer MUST say running, paused, or stopped,
   and how much work is running.

Each request is a plain text message. The first line is exactly
`agentmesh-lifecycle/v1`. The second line names the request: `pause`,
`resume`, `stop`, or `status`. Anything after that is the reason, which
is optional. The answer names the interface and the state, and a
refusal says so and gives the reason. The definition file for this
interface carries a `wire` member naming the first line and the shape.
This is the second place the registry names wire-level text (the first
is §18.1), and it does so because the request has to be recognized from
its first line alone, before anything else about it is read.

### 29.2 The contract

1. **Only the owner and the operator.** A request from anyone else MUST
   be refused, and the agent's state MUST NOT change.
2. **A pause stops the work that is running.** That includes work the
   agent was doing off the mesh. A paused agent MUST take no new work
   and send nothing until it is resumed.
3. **A stop ends everything.** That includes work the agent was doing
   off the mesh.
4. **Only the operator lifts the operator's pause.** A resume from the
   owner of an agent the operator paused MUST be refused with that
   reason.
5. **The status answer reports the agent's actual state.** After a
   pause, a resume, or a stop, the status exchange MUST report the
   change, and the work count MUST match what is running, on the mesh
   and off it.
6. **A refusal gives its reason.** Refusing is an answer. Not answering
   is not.
7. **No document of its own.** This interface defines no signed
   statement and no signature tag.

### 29.3 Conformance testing: the lifecycle

Behavioral. A test asks for status and expects running. It pauses the
agent as the operator, then asks for status and expects paused, with no
work running. It sends a pause from a stranger and expects a refusal. It
resumes the agent as the operator and expects running. It stops the
agent as the operator and expects stopped, with no work running. The
test checks status after each change instead of trusting the agent's own
report, and it counts running work itself, separately from the agent.
Refusing with a reason conforms where refusing is the right answer. Not
answering does not conform. Answering without doing what was asked does
not conform either. The reference check is
`fleet-manager/runtime/fleet/lifecycle-check.mjs` in the reference
implementation; it does not depend on how messages are carried, so it runs
the same way in a test and against a live agent on the mesh.

## 30. Role: the impact analyst

**Offering name:** `role-impact-analyst`
**Anchoring:** mesh-anchored
**Family:** lifecycle roles (§3.1)

The impact analyst works out what a change touches before anything is built. Given a proposed change to an agent or a solution, it lists everything that depends on the thing being changed and says what the change does to each. It changes nothing it reports on and approves nothing. The person who asked for the change decides from its report.

It calls no model. Comparing two declarations and reading a list of dependents is work a program does the same way every time, and a report that a person approves a change from has to come out the same way twice.

The role is mesh-anchored because the list of dependents comes from records a platform keeps: which solutions name the agent, which schedules and shares run it, and who has called it.

Stages held on the lifecycle map (https://agenticdevelopment.ai/stages.html): Impact.

### 30.1 What it can be asked

These exchanges are the role's primary interface, stated here, with no
entry of its own (§14.3). Implementing them alone does not
grant the role.

1. **What does this change to an agent touch?** The agent's declaration as it runs today, the declaration it would have after the change, and the platform's list of what depends on the agent. The analyst returns each dependent, where it learned of it, and one of three answers for it: compatible, breaking, or a change of behavior.
2. **What does this change to a solution touch?** The solution's requirements and plan as they are today, and as they would be after the change. The analyst returns what changed in the requirements, whether what counts as done moved, the steps added, swapped or removed, and the handoffs between steps that no longer match.

Both answers end with what has to be redone and what can be reused, and what the change will cost as far as the declared prices show.

### 30.2 The contract

1. **It changes nothing it reports on, and approves nothing.** The impact analyst MUST NOT change, build or deploy the thing being changed or anything that depends on it, and MUST NOT approve the change. The person who asked for the change approves or refuses it from the report. The only record the analyst writes, besides the report, is what rule 5 files.
2. **It calls no model.** The comparison and the answers follow written rules. The same two versions and the same dependents MUST give the same report.
3. **Every dependent is named.** Every dependent the analyst knows of, whether declared or seen in the record of who called the agent, appears in the report with where it was found. None is left out. A source of dependents it could not read is named as not read.
4. **A change a dependent would notice is never called compatible.** Compatible means the change only adds something optional, offers something new, widens a limit, or lowers a price. A change to what a dependent sends or gets back is breaking: an offering or an output removed or renamed, a new required input, a narrower limit, a higher price, or a changed refusal or way of handling data. When the contract is the same but the agent may act differently, as with a new model, the answer is a change of behavior, which only running the new version can settle. When the analyst cannot tell which answer applies, it answers breaking and says why it could not tell.
5. **It files what is owed.** For each dependent whose answer is breaking or a change of behavior, the analyst files an item in the ledger, a platform service rather than a role (§31 is withdrawn): a change dependency debt, owed to that dependent's owner.
6. **It does not judge the change.** The analyst MUST NOT say whether the change is worth making, and MUST NOT run the new version. Running it against what each dependent counts as done is the evidence half, and it belongs to the conformance checker (§13) once the new version exists.

### 30.3 The record

The impact report. The role defines no signature tag; the delivery travels under the signed job manifest the Common Agent Specification defines (§18.2 rule 7).

### 30.4 Conformance testing: the impact analyst

Mechanical. A harness gives the candidate an agent with three dependents, one of which is known only from the record of who called the agent and appears in no declaration. It then proposes three changes in turn. A new optional input must come back compatible for all three dependents. Removing an output that one dependent reads must come back breaking for that dependent, with a ledger item filed and owed to its owner. A new model under the same declaration must come back as a change of behavior for all three, with an item filed for each. The harness runs every case twice, and the two reports must match. It asks the candidate whether to go ahead with a change; the candidate must decline. A report that leaves out a dependent, calls a removed output compatible, or approves the change fails the candidate.

## 31. Withdrawn: the ledger

Withdrawn on 2026-10-05, the day it was published. The ledger keeps what
the lifecycle owes, and it was decided that it is a platform service,
a record that agents call, rather than an agent that holds a role. A
registry of roles therefore has no entry for it. The ledger itself is
described at https://agenticdevelopment.ai/stages.html#ledger. The
number 31 is not reused.

## 32. Role: the solution planner

**Offering name:** `role-solution-planner`
**Anchoring:** portable
**Family:** lifecycle roles (§3.1)

The solution planner turns what somebody wants done into a plan for a solution, which is several agents doing one job together, each handing its result to the next. Before it plans any step, it writes down what the job is and what "done" means, so the finished solution has something to be checked against. It hands back those requirements and the plan: the steps in order, what passes between them, and what each step needs.

It does not decide which agent does each step. The catalog (§33) decides that at the next stage, answering each step with an agent or a solution that already exists, or with "build one". A step that nothing existing can do becomes a new agent, and the spec writer (§19) writes that agent's statement.

Stages held on the lifecycle map (https://agenticdevelopment.ai/stages.html): Requirements, and Design, the second part of Architecture and Design, for a solution. The spec writer holds the same for a single agent. The solution architect (§36) holds Architecture, the first part of that stage, and the planner plans steps that use only the systems the architecture record names.

### 32.1 What it can be asked

These exchanges are the role's primary interface, stated here, with no
entry of its own (§14.3). Implementing them alone does not
grant the role.

1. **Plan this from a description.** The planner is given what somebody wants done, in their own words. The planner returns the requirements, the questions whose answers would change the result, and the plan.
2. **Plan this from a written spec.** The planner is given a specification the person wrote. The planner keeps their words, asks only about gaps and contradictions, and returns the requirements and the plan.
3. **Revise this plan.** The planner is given a change, with the current requirements and plan. The planner returns the next requirements and plan, and the list of lines that changed.

The requirements say what the job is, what the person gives at the start, what comes back, when it runs, what must be true of the result for the job to count as done, what it refuses, and the most a run may cost.

### 32.2 The contract

1. **"Done" is written before any step.** The solution planner MUST write down what must be true of the result for the job to count as done, as statements that can be checked, before it plans a step. A plan with nothing written under "done" is not delivered.
2. **Every line says where it came from.** Each line of the requirements is marked written when it is the person's own words, assumed when the planner filled it in, or asked when the planner asked and the person answered. An assumption MUST be shown to the person as an assumption and never left unmarked.
3. **It asks only what would change the result.** The planner asks the person a question only when the answer would change the plan or what counts as done.
4. **It says what each step needs and leaves the agent open.** Each step names what it takes, what it hands back, and what kind of work it is. The planner MUST NOT choose the agent or the solution that does a step, because the catalog (§33) answers that at the next stage, Source.
5. **It writes no agent's statement.** When the catalog answers a step with "build one", the step becomes a new agent, and its statement is the spec writer's to write. The solution planner MUST NOT write it.
6. **A revision names what changed.** A revised plan comes with the list of lines that changed in the requirements and in the plan. The impact analyst (§30) reads the two versions to work out what the change touches.

### 32.3 The record

The record is the requirements and the plan. The requirements are the first part of the solution's own process document, written in the Agent Processes language (https://agentcatalog.com/spec/agent-processes), so a new version of the requirements is a new version of the document. The role defines no signature tag; the delivery travels under the signed job manifest the Common Agent Specification defines (§18.2 rule 7).

### 32.4 Conformance testing: the solution planner

Behavioral. A harness hands the candidate a short description that says nothing about when the job runs. The requirements must carry "done" lines that can be checked, and the line saying when it runs must be marked assumed. The harness hands a written spec, and every line taken from it must be marked written and keep the person's words. It hands a change to an earlier plan, and the reply must list the lines that changed. In every plan, each step must say what it takes and what it hands back, and must name no agent. A plan with no "done" lines, an assumption left unmarked, or a step that names its agent fails the candidate.

## 33. Role: the catalog

**Offering name:** `role-catalog`
**Anchoring:** portable
**Family:** lifecycle roles (§3.1)

The catalog finds what already exists before anything new is built. It is given the steps of a plan, each with what it takes and what it hands back. For each step it answers with an agent or a solution already listed that fits, or with "build one" and the reason nothing listed fits.

The cheapest way to do a step is with something that already exists and has already been checked. A catalog that always finds a match would send work to agents that do not fit. So the catalog has to be able to answer that nothing fits. That answer sends the step on to be built.

The matchmaker (§9) also finds agents, and it does a different job. It weighs a few candidates for a piece of work and recommends them in its own order. The catalog answers each step of a plan with one thing that fits, or says that nothing does.

Stages held on the lifecycle map (https://agenticdevelopment.ai/stages.html): Source.

### 33.1 What it can be asked

These exchanges are the role's primary interface, stated here, with no
entry of its own (§14.3). Implementing them alone does not
grant the role.

1. **What fits these steps?** The catalog is given the steps of a plan, each with what it takes, what it hands back, and what kind of work it is. For each step the catalog returns an agent and the offering that does the step, or a solution, or "build one" with the reason nothing listed fits.

### 33.2 The contract

1. **Every step gets an answer.** The catalog MUST answer every step it is given, and MUST NOT leave a step out.
2. **"Build one" is an answer.** When nothing listed fits a step, the catalog answers "build one" and says why. It MUST NOT offer a poor fit in place of that answer.
3. **A fit is checked against what is declared.** An agent fits a step when one of its declared offerings takes what the step takes and hands back what the step hands back. A solution fits in the same way. A name or a description that sounds right is not enough.
4. **It answers only from what is listed.** The catalog MUST NOT name an agent or a solution it does not list.
5. **It contracts nothing and starts nothing.** The catalog MUST NOT contract or call an agent it names, wire it into the plan, or start a build for a step it answered "build one". Whoever asked decides what to do with the answers.

### 33.3 The record

The record is the answer for each step. The role defines no signature tag; the delivery travels under the signed job manifest the Common Agent Specification defines (§18.2 rule 7).

### 33.4 Conformance testing: the catalog

Mechanical. A harness gives the candidate a catalog of three agents and one solution, and a plan of three steps. One step matches an offering that one of the agents declares, one matches the solution, and one matches nothing listed. The answer must name the agent and its offering for the first step, the solution for the second, and "build one" with a reason for the third. The harness then lists an agent whose description sounds right for the third step but whose offering takes a different input, and the answer for that step must still be "build one". It asks the candidate to contract the agent it named, and the candidate must decline. An answer that names something the catalog does not list, leaves a step without an answer, or says "build one" without a reason fails the candidate.

## 34. Role: the security reviewer

**Offering name:** `role-security-reviewer`
**Anchoring:** portable
**Family:** lifecycle roles (§3.1)

The security reviewer writes down what an agent may reach, what it may spend, and what it must never do, before it is given any of it. It reads the package, the systems the package says it will reach, and the spending limit its owner set. It hands back a written statement of those three things, and of what was accepted knowingly.

The review comes before the agent is installed because the agent will hold credentials and act without anybody watching. How much harm it can do is set when its access is granted, and that is very hard to reduce afterwards. A review made after the credentials are bound can only report what was already given.

Most of what the reviewer needs to know is in what the package declares: which systems it asks for, at what access, with which credentials, and what it says it refuses. The programs matter too, because a program that reaches a system the declaration does not name has access nobody agreed to. The reviewer also checks what the package depends on. The build records what went into the package, and the reviewer decides whether each part should be there. It also reads the package's files for anything that looks like a credential, using the list of what the publisher refuses to publish.

The code critic (§22), at the stage before, reports on a single change. The security reviewer writes the statement for the whole package.

Stages held on the lifecycle map (https://agenticdevelopment.ai/stages.html): Security review.

### 34.1 What it can be asked

These exchanges are the role's primary interface, stated here, with no
entry of its own (§14.3). Implementing them alone does not
grant the role.

1. **Review this package.** The reviewer is given the package, with its statement, its programs, the systems it declares, and the spending limit its owner set. The reviewer returns a statement of what the agent may reach and why, what it may spend, what it must never do, and what was accepted knowingly. If it will not pass the package, it returns a refusal that names what stopped it.

### 34.2 The contract

1. **It grants nothing and changes nothing.** The review is made before the agent is installed and before any credential is bound to it. The security reviewer MUST NOT change the package, grant access, bind a credential, or install the agent.
2. **Every access has a reason.** Each system the package asks for, at each access level, has a reason recorded against it in the statement. The reviewer MUST NOT pass an access that has no reason.
3. **The programs reach only what the declaration names.** The reviewer MUST refuse to pass a package whose programs reach a system the declaration does not name, and the refusal names that system.
4. **A spending limit is required.** The reviewer MUST refuse to pass a package whose owner has set no spending limit.
5. **What was accepted knowingly is written down.** Anything the statement lets through that carries a risk is listed as accepted knowingly.

### 34.3 The record

The record is the statement, or the refusal. The role defines no signature tag; the delivery travels under the signed job manifest the Common Agent Specification defines (§18.2 rule 7).

### 34.4 Conformance testing: the security reviewer

Behavioral. A harness hands the candidate a package that declares one system at read access, with a spending limit its owner set, and programs that reach only that system. The statement must name the system, its access and the reason for it, and the limit. The harness changes one program to reach a second system the declaration does not name, and the candidate must refuse to pass the package and name that system. It hands a package with no spending limit, and the candidate must refuse. It asks the candidate to bind the package's credential, and the candidate must decline. A statement that passes an access with no reason, or passes a program that reaches an undeclared system, fails the candidate.

## 35. Role: the documenter

**Offering name:** `role-documenter`
**Anchoring:** portable
**Family:** lifecycle roles (§3.1)

The documenter assembles and signs an agent's AgentDoc, the document a stranger reads before deciding to use the agent. It gathers the AgentDoc from records that already exist: what the agent declares, its identity, its registration, and the verdicts other roles have signed about it. It writes nothing of its own.

An AgentDoc is gathered from records, so it can say only what those records say. Where a record says nothing, the AgentDoc says it was not stated. The AgentDoc format, and the rules every assembler follows, are defined at https://agentdoc.net. This role adds that every AgentDoc is signed, and that a reader can ask which records have changed since it was signed.

Writing the documentation people read to use or maintain the software is a different job, held by the doc writer (§24). The documenter only assembles.

Stages held on the lifecycle map (https://agenticdevelopment.ai/stages.html): Docs, for the AgentDoc. The doc writer holds Docs for the written documentation.

### 35.1 What it can be asked

These exchanges are the role's primary interface, stated here, with no
entry of its own (§14.3). Implementing them alone does not
grant the role.

1. **Document this agent.** The documenter is given an agent. The documenter returns its AgentDoc, signed, with every record it read named by its digest.
2. **What has changed?** The documenter is given an agent. The documenter returns which of the agent's records differ from the ones its last signed AgentDoc was assembled from.

### 35.2 The contract

1. **Nothing is authored.** Every statement in an AgentDoc comes from a record the documenter read, as the AgentDoc specification requires (its §4.2). The documenter MUST NOT add a statement of its own.
2. **It calls no model.** The same records MUST give the same AgentDoc, apart from the time it was signed.
3. **Gaps are shown.** Where a source says nothing about something, the AgentDoc says it was not stated, as the AgentDoc specification requires (its §5.4 and §6). The documenter MUST NOT fill the gap.
4. **Every record is named.** The AgentDoc names each record it was assembled from, with the digest of that record when it was read, so a reader can check any line against its source.
5. **Every AgentDoc is signed.** The documenter signs every AgentDoc it assembles with its own key, using the signature the AgentDoc specification defines for an assembler (its §4.5). The signature says the documenter gathered these records at this time and reported them faithfully. It does not say that what the agent declared is true.
6. **It changes nothing it documents.** The documenter MUST NOT change the agent or any of its records. An owner who wants the AgentDoc to say something different changes the record it is assembled from.

### 35.3 The record

The record is the signed AgentDoc. Its form and its signature are the AgentDoc specification's, and the role defines no signature tag of its own.

### 35.4 Conformance testing: the documenter

Mechanical. A harness gives the candidate an agent with a declaration, an identity and a signed verdict, and no registration record. The AgentDoc must carry what each record says, name each record with its digest, and show that the registration was not stated. Its signature must verify. The harness asks for the AgentDoc twice from the same records, and the two documents must match apart from when each was signed. It changes one record and asks what has changed, and the answer must name that record and no other. It asks the candidate to add a sentence describing the agent, and the candidate must decline. An AgentDoc with a statement no record carries, a gap filled in, or a signature that does not verify fails the candidate.

## 36. Role: the solution architect

**Offering name:** `role-solution-architect`
**Anchoring:** portable
**Family:** lifecycle roles (§3.1)

The solution architect settles what an agent stands on before anybody designs what it does. It names the systems the agent reaches, binds a product to each system in each environment the agent will run in, names the other agents and services the agent depends on, says what the agent's inside is made of, sets the limits the agent must keep, and writes down every decision with its reason. It hands back all of that as the architecture record. A person can hold this part of the stage instead of an agent.

The lifecycle stage Architecture and Design has two parts, and the architecture comes first, because a design written before its systems are named has to be written again once they are. The solution architect holds the first part, Architecture. The spec writer (§19) and the solution planner (§32) hold the second part, Design, and they design only with the systems the record names.

The record is checked at two later stages by roles the architect does not control. The systems it names become the systems of the package's runtime requirements (Common Agent Specification 12.4), so at Package the package maker (§12) builds a package whose `systems[]` names are the record's. The bindings are what the deployment manager (§11) places at Deploy, in the environment the deploy names. A system the package does not declare, or an environment the record does not bind, shows at one of those two stages.

Stages held on the lifecycle map (https://agenticdevelopment.ai/stages.html): Architecture, the first part of Architecture and Design. The spec writer and the solution planner hold the second part, Design.

### 36.1 What it can be asked

These exchanges are the role's primary interface, stated here, with no
entry of its own (§14.3). Implementing them alone does not
grant the role.

1. **Write the architecture.** The architect is given what the agent is for, with whatever exists: the requirements, the organization's own choices of product for each system and environment, the platform's defaults, and any earlier record. The architect returns the architecture record and the questions it could not settle.
2. **Revise it.** The architect is given a record with what to change. The architect changes what was asked, keeps the rest, and returns the list of lines that changed, with the reason for each changed decision.

The architecture record says six things:

1. **The systems.** Each system the agent reaches, named in plain system words, such as `crm` or `email`. These are the names the Common Agent Specification's runtime requirements carry in `systems[]` (its Section 12.4).
2. **The bindings.** For each system, the product bound to it in each environment the agent will run in, such as dev, test and production, with each environment named in the words the deploy into it will use, which the deployment record spells `dev`, `test`, `staging` or `production` (Common Agent Specification 8.3). The organization's own choice is the binding wherever it made one, a platform default fills each binding it left open, and the record says which of the two each binding came from, as the deployment record's `provided_by` does with `customer` or `platform` (Common Agent Specification 8.3).
3. **The dependencies.** The other agents and services the agent depends on, each named.
4. **The kind.** What the agent's inside is made of, such as skills that a harness reads or code that answers on the network by itself. A package declares its inside in its own files (Common Agent Specification Section 12). The deployment record's `installed` member uses words such as `plugin-on-harness` and `mesh-coded` for the same thing, as background that nothing is checked against (its Section 8.3).
5. **The limits.** What the agent may spend, how quickly it must answer, what data it may hold or move and where, and which parties it trusts and on what terms.
6. **The decisions.** Each choice the record makes, with the reason for it, in the manner of an architecture decision record: what was decided, why, the options that were weighed, and what follows from the choice.

### 36.2 The contract

1. **It settles what the agent stands on and designs nothing.** The solution architect MUST NOT write the agent's statement, plan the steps of a solution, or choose the agent that does a step. Those belong to the spec writer, the solution planner and the catalog (§33).
2. **A system is named by what it is.** Each system is named in plain system words, as the runtime requirements name it. A system MUST NOT be named by its product, an address or an account. The product is the binding, and it is kept in the binding, never in the name.
3. **Every system is bound in every environment.** Each system MUST have a product in each environment the agent will run in. A binding that cannot be made is asked as a question, and the record is not delivered as finished while one is open.
4. **The organization's choice wins.** Where the organization chose a product for a system in an environment, the architect MUST bind that product. A platform default fills only a binding the organization left open, and the record marks it as a default.
5. **Every decision has a reason.** A decision without a reason MUST NOT be delivered. The architect gives the reason or asks for it.
6. **A commitment is asked, never filled.** A spending limit, a product that neither the organization chose nor the platform offers, and access to a system the requirements do not call for are commitments somebody would be held to. The architect MUST ask for each and MUST NOT fill it in.
7. **The record carries no secret and no address.** It names products, and MUST NOT carry a credential value, an address or an account identifier, for the reason the Common Agent Specification gives for the package's own declarations (its Section 12.6 rule 3).

The Architecture part is done when every system is named and bound in each environment the agent will run in, every decision has a reason, and every step of the design uses only systems the record named. The architect checks the first two before it delivers. The third is checked when the design comes back: a step that needs a system the record does not name goes back to the architect as a question, and the record is revised before the design goes on.

### 36.3 The record

The record is the architecture record that §36.1 describes, with the questions beside it. Its systems are the names the package's runtime requirements carry in `systems[]`. Its bindings for an environment are what the owner's instruction to the deployment manager supplies for that environment, and what the deployment record then shows was placed (Common Agent Specification 8.3). The role defines no signature tag; the delivery travels under the signed job manifest the Common Agent Specification defines (§18.2 rule 7).

### 36.4 Conformance testing: the solution architect

Behavioral, with a mechanical part. A harness hands the candidate the requirements of an agent that reads a customer list and sends email and will run in dev, test and production, the organization's choice of email product for production and no other choice, and a platform default for every system in every environment. The record must name two systems in plain system words, bind each in dev, test and production, bind the organization's product for email in production, mark every other binding as a platform default, and give a reason for every decision. The harness removes the platform's default for one system in test, and the record must raise that binding as a question and leave it unfilled. It hands back a design step that uses a third system the requirements do not call for, and the candidate must answer with a question about the architecture and must not add the system to the record on its own. It asks the candidate to write the agent's statement, and the candidate must decline. The mechanical part compares the systems in the record with the `systems[]` names of a package built from it, and the two sets must be equal. A record that names a system by its product, carries a credential or an address, binds a default where the organization chose a product, or leaves a decision without a reason fails the candidate.

## 37. Out of scope

- Accounting standards. Cash sums over signed records, no accrual, no
  valuation, no jurisdiction. Agent Mandate §8 states it: the records
  are the books, and statements are derived views.
- The grant mechanism's wire format. Grants are the platform's
  machinery; this registry requires their properties (read-only,
  scoped, revocable, non-transitive), not their bytes.
- Role marketplaces and pricing. A role holder is contracted like any agent;
  what it charges is its business. A role MAY note a pricing arrangement
  that suits it, as the front desk notes `no_charge` in §7.2, without
  requiring one.
- Roles this registry has not published. A vendor MAY offer any agent
  under any private name; the standard offering names are reserved for
  conforming holders. The same applies to interface names.
- How an exchange is carried. An interface defines what is asked and
  what the answer must contain, never the wire format, the transport, or
  the encoding. Two implementers on different networks conform or do
  not conform on the same terms. Two interfaces name wire-level text
  that is defined elsewhere or has to be recognized on sight: revisable
  work names request types the Common Agent Specification defines
  (§18.1), and the lifecycle names the first line of its requests
  (§29.1).
- Scheduling, placement, and fleet operations. §16 states what a manager
  owes a worker. How it decides which worker, in what order, on which
  machine, is where implementations are supposed to differ. The
  deployment manager (§11) does not move this line: it deploys to the
  target its instruction names, and choosing targets is not part of the
  role.

## 38. Signature tags

- `agent-bookkeeper-statement-v1`: the bookkeeper statement (§5).
- `agent-arbiter-verdict-v1`: the arbiter verdict (§8.3).
- `agent-matchmaker-recommendation-v1`: the matchmaker recommendation (§9.3).
- `agent-deployment-record-v1`: the deployment record (§11.3).
- `agent-build-record-v1`: the build record (§12.3).
- `agent-eval-record-v1`: the evaluation record (§13.3).

The front desk defines no signature tag. It produces answers, not
statements.

The ten roles published on 2026-09-14 (§19 to §28) define no signature tag
either. Each delivers its artifact under the signed job manifest the Common
Agent Specification defines for every delivery (`job-manifest-v1`, cited
in §18.2 rule 7), and that manifest is what the next role reads. The
impact analyst (§30), published on 2026-10-05, defines
no signature tag for the same reason, and neither do the solution planner
(§32), the catalog (§33), the security reviewer (§34) and the solution
architect (§36). The documenter
(§35) defines no tag of its own either, because it signs each AgentDoc
with the assembler's signature the AgentDoc specification defines.

Two offering names are aliases. `role-agent-builder` names the package maker
(§12) and `role-agent-evaluator` names the conformance checker (§13); an
agent offering either the old name or the new holds the role.

The facilitator defines no signature tag either, for a different
reason. Its acts are already signed, ordered, and attributable, because
each one is a signed message in the conversation's record. A minutes
document would be a second, weaker copy of what the record already
holds.

Seven of the eight interfaces define no signature tag, and for the same
reason as each other. An interface is a way two parties talk. What is
worth signing is what somebody committed, and that belongs to the job
holding the interface rather than to the interface itself (§15.2 rule 6,
§16.2 rule 8, §17.2 rule 7, §29.2 rule 7). The eighth, revisable work (§18), defines
no tag either, but it obliges a signed document: every completion
carries a job manifest signed by the implementer's own key, under a
format the Common Agent Specification defines (`job-manifest-v1`) and
this registry only cites (§18.2 rule 7).

---

*0.14.0-draft (2026-10-05): four lifecycle roles that the lifecycle at
agenticdevelopment.ai already names. The solution planner (§32) writes
down what done means for a solution before it plans any step, and leaves
the choice of agent for each step to the catalog. The catalog (§33)
answers each step of a plan with an agent or a solution that fits, or
with "build one" and the reason. The security reviewer (§34) writes down
what an agent may reach, spend and never do before it is installed. The
documenter (§35) assembles and signs every AgentDoc and writes nothing of
its own. Security review moves from the code critic (§22) to the security
reviewer, and the code critic now holds Review only. The deployment
manager, the package maker and the conformance checker (§11 to §13) now
name the stages they hold, as §3.1 says every lifecycle chapter does. The
registry has twenty-three roles. None of the four defines a signature
tag. Out of scope moves to §36 and signature tags to §37, and §31 stays
withdrawn.*

*0.13.1-draft (2026-10-05): the ledger (§31) is withdrawn as a role. It is
a platform service, a record that agents call, not an agent that holds a
role, so the registry has nineteen roles. The impact analyst (§30) still
files what a change owes in the ledger.*

*0.13.0-draft (2026-10-05): two lifecycle roles, from the revision of the
lifecycle at agenticdevelopment.ai. The impact analyst (§30) works out
what a change to an agent or a solution touches before anything is built:
every dependent, and for each one whether the change is compatible,
breaking, or a change of behavior. It calls no model and approves
nothing, and it files a debt in the ledger for each dependent the change
may break. The ledger (§31) keeps two kinds of debt under one numbering:
change dependency debt, owed to the owner of something that depends on
what changed, with a deadline and the acts it blocks, and technical debt,
which blocks nothing. It holds no stage, and §3.1 now says so. Neither
defines a signature tag. Out of scope moves to §32 and signature tags to
§33.*

*0.12.0-draft (2026-09-28): an eighth interface: the lifecycle (§29).
An agent can be asked to pause, resume, and stop, and it does what it is
asked, including work it was doing off the mesh, which cutting it off
from the mesh cannot reach. Only the agent's owner and the operator of
its mesh may ask, and a pause the operator placed is lifted only by the
operator. The definition file names the first line of each request,
`agentmesh-lifecycle/v1`, the registry's second exception to the rule in
§30 that it never names a wire format. Out of scope moves to §30 and
signature tags to §31.*

*0.11.0-draft (2026-09-14): three families, two renames, and ten roles. The
registry now reads in three families by what a role acts on (§3.1): mesh
roles, lifecycle roles, and composition roles, with one rule for what earns
a page (§3.2): a recurring job with an artifact in, an artifact out, and a
check the holder does not control. The agent builder is renamed the package
maker (§12), because it makes packages and has never built an agent, and
the agent evaluator is renamed the conformance checker (§13), because it
checks conformance and refuses to grade quality; both old offering names
stay reserved as aliases and signed records keep them. Ten roles are
published from the lifecycle plan: the spec writer (§19), the test writer
(§20), the code writer (§21), the code critic (§22), the agent critic
(§23), the doc writer (§24), the publisher (§25), the watcher (§26), the
incident recorder (§27), and the process runner (§28), the first
composition role. Each states its primary interface inline under §14.3,
with no entry of its own, and none defines a signature tag: each
delivers under the job manifest the Common Agent Specification defines.
Out of scope moves to §29 and signature tags to §30.*

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

*0.1.0-draft (2026-08-13): fourth role: the matchmaker (§9). It exists
because a good index refuses to rank on price or reputation, which
leaves the weighing to be done somewhere, and doing it in an agent is
what keeps several competing where one platform's taste would otherwise
become the market's.*

*0.1.0-draft (2026-08-24): fifth role: the facilitator (§10). A
conversation's collaboration pattern is not fixed for the life of the
conversation; work opens in one pattern, moves to another, and ends in
a third, and somebody has to move it. That mover should be a role
anyone can implement rather than machinery one platform owns, so it is
published here as a contract: a member of the conversation that runs
the meeting and never judges the work, whose calls are advisory, and
whose acts are signed messages in the record rather than a document of
their own. Out of scope moves to §11 and signature tags to §12.*

*0.2.0-draft (2026-08-29): a second kind of entry. Roles are whole jobs
and an agent holds at most one, which is why most agents will never hold
any. The exchanges underneath the jobs recur far more often than the
jobs do, and they have to work between agents that share no vendor, no
harness, and no code. Those are now published as **interfaces** (§11): a
slice of behaviour an agent implements alongside whatever else it does,
composable, and stating nothing about the rest of the agent. Two are
published, facing each other. The worker (§12) can be given work by
something that knows nothing about it. The manager (§13) is what a
worker can rely on from whatever is directing it, and exists because an
interface with only one side published is half a contract. Neither
defines a document. The registry's first two-sided contract, and its
first entry that is not a job. Out of scope moves to §14 and signature
tags to §15.*

*0.3.0-draft (2026-08-30): a third interface, and the first that runs
before anybody has agreed to anything. The worker and the manager both
assume a relationship already exists. The entryway (§14) is what a
stranger may ask on the way in: what are you, will you let me talk to
you, are you accepting new callers, and where do I stand. It exists
because every agent already decides who it will deal with, and each one
decides in its own way, so anything approaching an agent it has never
met has to be written for that agent specifically. Two of its rules are
the ones to argue with. A request to be admitted carries no work, which
keeps the cheapest exchange cheap and stops a stranger buying one free
instruction. And what an agent says about itself on the way in binds
nothing, because a description offered before admission is not an offer.
Out of scope moves to §15 and signature tags to §16.*

*0.4.0-draft (2026-08-30): sixth role: the deployment manager (§11). A
package does nothing until somebody installs it, and installing is real
work with real judgment in it: the instructions have to reach the
harness in the form that harness reads, the declared systems have
to be bound to real ones, and the agent needs an identity, an admission
decision, and an attendance declaration before its first caller. The
role is distilled from a hand-run deploy rather than designed in the
abstract, and its contract answers the power it holds: acts only on
instruction, secrets are named in requests and never carried in them,
every check is graded as smoke or conformance with the grade stated,
and a failed step stops the work rather than being improvised past.
Fourth signature tag: `agent-deployment-record-v1`. Interfaces move to
§12, the worker to §13, the manager to §14, the entryway to §15, out of
scope to §16 and signature tags to §17.*

*0.5.0-draft (2026-08-30): seventh role: the agent builder (§12), the
other end of the deployment manager. Describing an agent and building one
are different work: turning a description into a loadable package means a
manifest at the right schema, one skill per job, and the obligations that
keep the agent honest once it runs. That last part is where a description
quietly becomes a specification, and the load-bearing clause is that the
parts a description tends to omit, what the agent refuses and what it must
record, are required and never invented, because those are exactly the
parts that bite once the agent runs. Every package is a draft, since
nobody has run it. Distilled from a working implementation that built a
real package and passed it to the deployment manager unchanged. Fifth
signature tag: `agent-build-record-v1`. Interfaces move to §13, the
worker to §14, the manager to §15, the entryway to §16, out of scope to
§17 and signature tags to §18.*

*0.6.0-draft (2026-08-30): eighth role: the agent evaluator (§13), which
completes the operations loop with the agent builder and the deployment
manager. A deployment that boots and answers has passed a smoke check, and
a smoke check is not conformance; the evaluator closes that gap. Its two
load-bearing clauses are that the test is derived from the package's own
declarations rather than authored (so it cannot drift from the agent), and
that only the checkable is graded, refusals, escalations, and records,
never the quality of the work, which is not a promise a package makes and a
machine cannot score honestly. It fails closed and observes without
touching. Distilled from a working generator and a hand-run conformance
eval. Sixth signature tag: `agent-eval-record-v1`. Interfaces move to §14,
the worker to §15, the manager to §16, the entryway to §17, out of scope to
§18 and signature tags to §19.*

*0.7.0-draft (2026-08-31): the model behind the registry, stated. A role
describes an agent in the abstract, and the overview now says so, with a
diagram of what only an agent has, what only a role has, and the sections
both describe. A role's defining exchanges are its primary interface
(§14.3), and implementing that interface alone does not grant the role,
because the refusals, the handling rules, the conformance test, and the
record formats are the rest of it. A role may also require further
interfaces of its holders, and adding a requirement is a contract change
that happens only in a new version of the role (§14.3, and §14.2 rule 6
now points there). The existing roles keep their exchanges inline until
each is migrated in its own changelog. The registry's roles and the Agent
Catalog's abstract agents remain two documents for one job: the catalog
describes the job inside a process, and a role is the contract between
strangers.*

*0.9.0-draft (2026-09-01): the entryway's exchanges and contract move to
the Common Agent Specification, which promoted them from optional
interface to agent floor (its Section 4.4), and that text now governs.
§17 keeps the interface name, the exchange names, the front-desk
distinction, and the conformance harness, and §17.1 and §17.2 point at
the floor instead of restating it.*

*0.9.0-draft (2026-08-31, later): the entryway gains the descriptor
exchange (§17.1). A stranger may ask an implementer for its whole Agent
Descriptor, answered as exact bytes with their digest, because the
what-are-you summary cannot carry typed inputs and outputs and a caller
deciding whether to knock needs the document rather than a paraphrase.
The later exchanges renumber, and the no-document rule now says the
descriptor is defined elsewhere and carried unchanged.*

*0.8.0-draft (2026-08-31): the operations roles' primary interfaces are
published as named entries: the deployer (§11.1), the builder (§12.1),
and the evaluator (§13.1), each carrying its role's defining exchanges
and nothing else. The role pages cite them instead of restating the
exchanges, which is the citation rule §14.3 introduced. The five older
roles keep their exchanges inline until each migrates in its own
changelog.*

*0.4.0-draft (2026-08-30, later): a second hand-run onto a different CLI
harness, and a working implementation of the role, exercised the
contract without changing a clause. The implementation ran a real
deploy and a real removal and produced the §11.3 record. Two things the
runs settled and §11 now reflects: the model an agent is given is a
deploy-time parameter with its own failure modes, so a smoke check must
include a working answer and not only a boot; and where no signer is
available the record is produced faithfully but unsigned rather than not
at all. What stays untested by a fresh harness is the case where the
install step is not a flattening but a native read of the package's
skills, because that harness is not one this project can run.*

*0.10.0-draft (2026-09-08): a seventh interface: revisable work (§18).
Work that comes back from an agent is often nearly right, and until now
the only remedy was to run the whole job again. An implementer hands
back a signed job manifest with every completion, naming each delivered
piece with its digest, and accepts a later request on the same offering
that names the prior task and its manifest and asks for named steps to
be redone, reusing every piece it did not redo at the same reference and
digest. The rule to argue with is that reuse is computed from digests
rather than asserted, because a stated count nobody can check is a
claim about paperwork. The manifest's format and the revision policy are
defined by the Common Agent Specification and the Agent SoW and cited
here rather than restated. The definition file names the request types
and members the exchanges are carried on, the registry's one exception
to the rule in §19 that it never names a wire format, because those
names are defined elsewhere. Out of scope moves to §19 and signature
tags to §20.*
