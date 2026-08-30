# Agent Roles: Standard Roles Registry

**Version:** 0.3.0-draft
**Status:** Working Draft
**Date:** 2026-08-30

Some jobs on a mesh recur everywhere: every account eventually needs the
same few things done, the same way, by an agent it can trust on sight. A
**standard role** publishes the contract for one of those jobs: the
questions the agent answers, the access it may hold, what it must
refuse, and the documents it produces. Any agent that meets the contract
can hold the role. This registry lists the standard roles, starting with
the bookkeeper.

Some behaviour recurs without being a whole job. Answering what a piece
of work would cost, or saying whether you are free right now, is not a
job anybody hires for, but two agents that have never met still have to
agree on how it is asked and answered. This registry publishes those as
**interfaces**: a slice of behaviour an agent implements, alongside
whatever else it does. Roles say what an agent is. Interfaces say what
an agent can be asked. An agent implements as many as it likes and holds
at most one role.

This specification is part of the family that includes
[Agent SoW](https://agentsow.com), [Agent RFP](https://agentrfp.net),
[Agent Mandate](https://agentmandate.net), and
[Agent Reputations](https://agentreputations.com). Those standardize
documents between parties; this one standardizes recurring jobs and the
recurring exchanges underneath them. It is transport-neutral, developed
alongside the AgentMesh protocol; nothing here requires a particular
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

## 9. Role: the matchmaker

An agent that finds other agents. One agent has work it cannot do
itself and no idea which agent to hand it to; it asks a matchmaker and
gets back a few candidate agents in order, each with a reason and a note
of what could not be established about it. The asker is an agent, the
candidates are agents, and the answer is machine-readable.

Directories answer "who does this?" and stop short of "who should I
hire?", because a directory that ranked on price or reputation would
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
7. **Narrowing is named.** Exclusions — the buyer's constraints, a
   mandate's limits, the matchmaker's reach — MUST be stated. An
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
when "cheapest" was asked; a request to hire is refused; a request to
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
[Agent Catalog](https://github.com/jeffrschneider/agentcatalog)
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
    family's line, quoted in §2 and again in §15, is that the records
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

## 11. Interfaces

A role is a whole job, and an agent holds at most one. That weight is
deliberate: the name has to mean something, so the scope is closed and
the refusals are absolute. It also means most agents will never hold a
role. Almost nothing is a bookkeeper.

The same few exchanges keep recurring underneath every job anyway.
Something asks an agent whether it is free. Something asks what a piece
of work would cost before committing to it. Something asks how a job
that was accepted is going. None of those is a job anyone hires for, and
all of them have to work between two agents that have never met and
share no vendor, no harness, and no code.

An **interface** publishes one of those slices. An agent implements as
many as it likes, alongside whatever else it does, and implementing one
says nothing about the rest. That is the difference from a role. A role
is what an agent is. An interface is what an agent can be asked.

### 11.1 What an interface publishes

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

### 11.2 The rules that make interfaces composable

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
6. **A role MAY require interfaces of its holders.** None of the roles
   published here does. Restating the existing five as bundles of
   interfaces is left to a later revision rather than done in the same
   pass that introduces the idea.

## 12. Interface: the worker

An agent that can be given a piece of work by something that knows
nothing about it.

A fleet is rarely built from one thing. The agents in it come from
different vendors, run on different harnesses, and were mostly not
written to be managed at all. Something still has to hand them work and
find out how it is going. This interface is what lets the directing side
do that without knowing anything about the side being directed.

Standard interface name `interface-worker`. Portable.

### 12.1 The exchanges

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

### 12.2 The contract

1. **It does not price the deal.** The implementer says what work costs
   it. What that work is sold for is not its business, and the two
   numbers answer to different parties.
2. **It is never held to terms it was not given.** An implementer
   honours the constraints handed to it with the job, and MUST NOT be
   held to one it was never told. Making sure it is always told is what
   §13 is for.
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
   obligation belongs to the role holding §13 rather than to either
   interface.

### 12.3 Conformance testing: the worker

Behavioural, like the front desk. A harness asks the seven exchanges and
checks that being free is answered by the agent rather than by something
watching it; that work outside what it does draws a refusal rather than
an invented estimate; that work it cannot assess draws "I cannot tell"
rather than a number; that a status question about a job it never
accepted is answered as such; that a job it accepted and then abandoned
reports failed rather than nothing; that a cancelled job stops; and that
every estimate says whether it is a commitment. Refusing an exchange
with a reason conforms. Not answering does not.

## 13. Interface: the manager

The other side of §12: what a worker can rely on from whatever is
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

### 13.1 The exchanges

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

### 13.2 The contract

1. **Terms flow down.** A manager MUST pass on every constraint it
   already agreed that bears on how the work is done, including where
   the work may be performed and what may be kept afterwards. A
   constraint that stops at the manager is a promise nobody is keeping.
2. **It MUST NOT assign work whose terms the worker cannot meet.**
   Checking that is the manager's job, and it happens before the
   assignment rather than after the failure.
3. **Capacity is confirmed, not assumed.** A manager MUST NOT state
   capacity it has not confirmed by asking, through exchange 1 of §12.
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
8. **No document.** Like §12, this interface defines no signed
   statement. What a manager committed on an owner's behalf is worth
   signing, and this registry expects the role holding this interface to
   define that statement. An interface says how two parties talk. What
   gets signed belongs to the job.

### 13.3 Conformance testing: the manager

Behavioural. A harness checks that a job handed down carries the
constraints already agreed above it; that a manager whose only available
worker cannot meet those constraints declines to assign rather than
assigning and hoping; that a raised block draws an answer or an explicit
refusal to answer, and never silence; that cancelling work upstream
produces a stop downstream; that a request to commit beyond its
authority is refused at the limit; and that asked what it committed, it
says, in full.

## 14. Interface: the entryway

What a stranger may ask before anybody has agreed to anything.

Every agent decides who it will deal with, and today each one decides in
its own way. Something that wants to hire an agent it has never met has
to be built for that agent specifically: work out what it is, ask for
access however that agent happens to expect it, and find out later
whether the request went anywhere. This interface publishes the small
set of exchanges that work before a relationship exists, so a caller
who knows nothing about the implementer can still get to the point of
being admitted or told no.

It is not the front desk (§7). The front desk is a whole job, answering
newcomer questions about an operator's platform from published material.
This is four exchanges about one agent's own door, and any agent can
implement it alongside whatever else it does.

Standard interface name `interface-entryway`. Portable.

### 14.1 The exchanges

1. **What are you?** The answer states what the implementer is called,
   what it does, what it charges, and what it refuses. It is answered to
   callers who have not been admitted, because a caller that must be
   admitted before it can find out what it is asking to be admitted to
   has learned nothing. The answer MAY be narrower for a stranger than
   for an admitted caller; it MUST NOT be false.
2. **Will you let me talk to you?** A request to be admitted, carrying
   the caller's identity and nothing else. The answer states admitted,
   waiting, or refused, and a refusal names its reason.
3. **Are you accepting new callers?** The current admission policy,
   stated without reference to the caller asking. The answer MUST NOT
   name any other caller, nor say who has been admitted or refused.
4. **Where do I stand?** The answer states never asked, waiting,
   admitted, or refused, for the caller asking. Exchange 2 is not
   answered on the spot in the general case, so a caller that could not
   ask this would have to guess.

### 14.2 The contract

1. **All four are answered without admission.** An interface whose
   exchanges required admission could not do its job, because admission
   is the thing being asked for.
2. **A request to be admitted carries no work.** An implementer MUST NOT
   perform work found in exchange 2, and a caller MUST NOT put work
   there. The exchange exists to be cheap to receive from a stranger,
   and an implementer that acted on its contents would have given every
   stranger one free instruction.
3. **A refusal is an answer.** Silence is not. A caller that is turned
   away is told, and told why, in the terms of §11.2 rule 4.
4. **The roster stays private.** Exchanges 3 and 4 tell a caller about
   the policy and about itself. Neither reveals another caller's
   standing, and an implementer MUST NOT answer either one in a way that
   allows one to be enumerated from the other.
5. **Admission is revocable and says nothing about work.** Being
   admitted means the implementer will receive what this caller sends.
   It is not a promise to accept any particular job, not a price, and
   not permanent. Once revoked, exchange 4 answers refused.
6. **What it says about itself binds nothing.** Exchange 1 is a
   description. It is not an offer, and a caller MUST NOT read a stated
   charge there as a price it can hold the implementer to.
7. **No document.** Like §12 and §13, this interface defines no signed
   statement. Whether a caller was admitted is the implementer's own
   business to keep; what gets signed belongs to the work that follows.

### 14.3 Conformance testing: the entryway

Behavioural. A harness checks that a caller with no prior relationship
gets an answer to all four exchanges; that a request to be admitted
carrying a piece of work is refused rather than performed; that every
refusal names a reason; that the policy exchange answers without naming
another caller; that a caller who has never asked is told so rather than
receiving an error; and that a caller whose admission was revoked is
told refused rather than still admitted.

## 15. Out of scope

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
  conforming holders. The same applies to interface names.
- How an exchange is carried. An interface defines what is asked and
  what the answer must contain, never the wire format, the transport, or
  the encoding. Two implementers on different networks conform or do
  not conform on the same terms.
- Scheduling, placement, and fleet operations. §13 states what a manager
  owes a worker. How it decides which worker, in what order, on which
  machine, is where implementations are supposed to differ.

## 16. Signature tags

- `agent-bookkeeper-statement-v1`: the bookkeeper statement (§5).
- `agent-arbiter-verdict-v1`: the arbiter verdict (§8.3).
- `agent-matchmaker-recommendation-v1`: the matchmaker recommendation (§9.3).

The front desk defines no signature tag. It produces answers, not
statements.

The facilitator defines no signature tag either, for a different
reason. Its acts are already signed, ordered, and attributable, because
each one is a signed message in the conversation's record. A minutes
document would be a second, weaker copy of what the record already
holds.

None of the three interfaces defines a signature tag, and for the same
reason as each other. An interface is a way two parties talk. What is
worth signing is what somebody committed, and that belongs to the job
holding the interface rather than to the interface itself (§12.2 rule 6,
§13.2 rule 8, §14.2 rule 7).

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

*0.1.0-draft (2026-08-13): fourth role: the matchmaker (§9). It exists
because a good index refuses to rank on price or reputation, which
leaves the weighing to be done somewhere — and doing it in an agent is
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
