# Agent Roles: Standard Roles Registry

**Version:** 0.9.0-draft
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
    family's line, quoted in §2 and again in §18, is that the records
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
afterward exactly what it did. It takes an agent package, stands it up
on a named host and framework, gives it the identity its platform
requires, checks it, reports what was checked in words that do not
overstate it, and removes it cleanly when asked.

It is defined as much by restraint as by capability. It touches hosts
and it places credentials, which makes it the most powerful role in
this registry, and the contract answers that power three ways: it acts
only on instruction, it follows its published procedure rather than
improvising, and it never holds a secret that a request handed it.

Which hosts and frameworks a given deployment manager can deploy to is
its own declaration, made on its card and its listing like any other
coverage claim. The role names none, because frameworks change on their
vendors' schedule and this specification does not.

### 11.1 What it can be asked

These exchanges are the role's primary interface, the deployer
(`interface-deployer`, per §14.3).

1. **Deploy this.** A package, a target host and framework, and the
   deploy-time decisions: which identity to mint or use, who may call
   the agent at first, whether a person attends it. The request names
   the secrets the deployment will need; it never contains them.
2. **What is deployed?** The inventory: each agent it has stood up, its
   package and version, its target, its identity, and the state it was
   last known to be in.
3. **How did it go?** The report for one deploy: what was done, what
   was checked, and what kind of check it was.
4. **Update it.** The same package at a newer version, through the same
   steps and the same checks, with the same record at the end.
5. **Remove it.** Processes stopped, configuration entries removed, the
   identity retired, and a statement of anything that could not be
   removed.

### 11.2 The contract

1. **Only on instruction.** A deploy, an update, and a removal each
   happen because the owner asked for that act. A deployment manager
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
   framework's default answer either one silently.
5. **Procedure, not improvisation.** A deployment manager follows its
   published procedure for the target framework. When a step fails, it
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
7. **Every act leaves a record.** Deploys, updates, removals, and
   refusals each produce the signed record in §11.3. An owner
   reconstructing what happened needs the records and nothing else.
8. **Removal is honest.** A removal record states what was removed and
   names anything that was not, because "removed" with a live
   credential left behind is the failure an owner cannot see.

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
  "target": { "host": "<host name>", "framework": "<framework and version>" },
  "agent": { "key": "<deployed agent public key>", "handle": "<handle, if named>" },
  "declarations": { "interaction": "service", "admitted_at_start": ["<caller>"] },
  "secrets_placed": ["<secret name>"],
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

1. `act` is one of `deploy`, `update`, `remove`, `refuse`. A refusal
   record carries `refused` with the reason in place of `checks`.
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

### 11.4 Conformance testing: the deployment manager

Behavioural, against a sandbox target. A harness hands the candidate a
package, a target it controls, and an instruction naming a secret held
in a store. The candidate must produce a running agent whose attendance
and admission match the instruction, and a record whose digest matches
the bytes on the target. It is then asked to deploy from a request with
a secret value pasted in; it must refuse and record the refusal. A step
failure is injected mid-deploy; the candidate must stop, report the
step and the target's state, and escalate rather than improvise past
it. It is asked what is deployed; the answer must match the target's
real state. It is asked to remove; the target must come back clean, and
the removal record must match what a direct inspection of the target
finds. Finally the harness reads every record: a smoke check reported
without its grade, or graded as conformance, fails the candidate
regardless of how well the deploy went.

## 12. Role: the agent builder

**Offering name:** `role-agent-builder`
**Anchoring:** portable

The agent builder turns a description of a needed agent into a package
another system can deploy. It takes what an agent should do, the systems
it needs, what it must refuse, and the records it must leave, and it
emits an agent plugin: skills, obligations, and a manifest. It is the
other end of the deployment manager (§11): one builds the package, the
other stands it up.

What it emits is an Agent Package as the Common Agent Specification
defines it (Chapter 12, https://agentdoc.net/package-spec.html): an Agent
Plugin carrying the agent's draft Descriptor and an install file beside
the manifest, under the namespace `net.agentdoc.package`. That chapter
owns the package's shape; this role owns the judgment a builder must ask
for and the record it signs.

It is defined by what it will not make up. A package is only as honest as
the judgment in it, and two parts are judgment rather than description:
what the agent refuses, and what it must record. The builder asks for
both and refuses to emit a package without them. And it never pretends to
have made a finished thing: every package it produces is a draft, because
nobody has run the agent it describes.

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

The document an agent builder produces for every build. Tag:
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
  "by": "<agent builder public key>",
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

### 12.4 Conformance testing: the agent builder

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

## 13. Role: the agent evaluator

**Offering name:** `role-agent-evaluator`
**Anchoring:** portable

The agent evaluator says whether a running agent does the job its package
describes. It derives a conformance test from the package's own
declarations, runs it against the deployed agent, and returns a signed
verdict. It completes the three operations jobs: the agent builder (§12)
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

The document an agent evaluator produces for every evaluation. Tag:
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
  "by": "<agent evaluator public key>",
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

### 13.4 Conformance testing: the agent evaluator

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
that was accepted is going. None of those is a job anyone hires for, and
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
its own way. Something that wants to hire an agent it has never met has
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
(Common Agent Specification §4.4). One is restated here because §19
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

## 18. Out of scope

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
- Scheduling, placement, and fleet operations. §16 states what a manager
  owes a worker. How it decides which worker, in what order, on which
  machine, is where implementations are supposed to differ. The
  deployment manager (§11) does not move this line: it deploys to the
  target its instruction names, and choosing targets is not part of the
  role.

## 19. Signature tags

- `agent-bookkeeper-statement-v1`: the bookkeeper statement (§5).
- `agent-arbiter-verdict-v1`: the arbiter verdict (§8.3).
- `agent-matchmaker-recommendation-v1`: the matchmaker recommendation (§9.3).
- `agent-deployment-record-v1`: the deployment record (§11.3).
- `agent-build-record-v1`: the build record (§12.3).
- `agent-eval-record-v1`: the evaluation record (§13.3).

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
holding the interface rather than to the interface itself (§15.2 rule 6,
§16.2 rule 8, §17.2 rule 7).

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

*0.4.0-draft (2026-08-30): sixth role: the deployment manager (§11). A
package does nothing until somebody installs it, and installing is real
work with real judgment in it: the instructions have to reach the
framework in the form that framework reads, the declared systems have
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
framework, and a working implementation of the role, exercised the
contract without changing a clause. The implementation ran a real
deploy and a real removal and produced the §11.3 record. Two things the
runs settled and §11 now reflects: the model an agent is given is a
deploy-time parameter with its own failure modes, so a smoke check must
include a working answer and not only a boot; and where no signer is
available the record is produced faithfully but unsigned rather than not
at all. What stays untested by a fresh framework is the case where the
install step is not a flattening but a native read of the package's
skills, because that harness is not one this project can run.*
