# The Common Agent Specification

**Version:** 0.26.0-draft
**Status:** Working draft, 2026-10-07. Home: https://commonagent.net/

Outside a governed network, "agent" is a marketing word: it obliges nothing, so it tells a reader nothing. This specification defines the agent as a testable claim. An agent is a party with a verifiable identity that answers a small set of exchanges to anyone, declares its standing facts in one authored place, refuses what it does not do in a typed and named way, and accumulates signed records of what others have checked about it. Every clause here is checkable by a program or a signature, never by trust in the word.

This document is self-contained, and two formerly separate standards now live inside it: the **Agent Descriptor**, the declaration surface, is Section 6, and the **AgentDoc**, the assembled view, is Section 9. A third chapter, added in 0.5.0-draft, says how an agent travels before it exists: the **Agent Package**, Section 12, carries the Descriptor as a draft inside a portable plugin together with what a host must have to run it, and defines the depot it is published to and the install that gives it a subject. A fourth, added in 0.17.0-draft, says where an agent is kept before it is packaged and how somebody comes to run their own copy of one: the **agent repository**, Section 13. Their published pages remain as renderings of those chapters. The remaining clauses were first published across the Agent Messaging specification (then called the AgentMesh Protocol), the roles registry, and the extensions tier; they are relocated here in full, because a definition of the agent that lives in a network protocol defines a network client, not an agent. Appendix A maps every section to where its text came from. The source documents have been cut down to their own subjects: each keeps its bindings and carries a governing note pointing here, and this document governs the agent's behavior.

Around this document: the [roles registry](https://agentroles.ai) defines the jobs an agent may take on; [Agent SoW](https://agentsow.com), [Agent RFP](https://agentrfp.net), [Agent Mandate](https://agentmandate.net), and the reputations bureau govern its dealings. [Agent Messaging](https://agentmessaging.ai), the protocol AgentMesh implements, is one network binding of this agent (Section 11); nothing in this document requires that network or any other.

## 1. Motivation

### 1.1 The word becomes a claim

Every obligation this family has published converged on the same implicit subject: a thing with an identity, a description, a door, a refusal discipline, and a record. That subject was never defined in one place, so its definition leaked into the network protocol, into optional interfaces, and into implementation convention. This document is that definition, extracted and owned. On a conforming deployment, calling something an agent means it meets Section 4, and the claim can be checked in seconds.

The specification's working definition, stated from the outside: a tool is invoked; an agent is engaged; and what makes engagement possible is that the counterparty can ask on what terms and rely on the answer. A thing that cannot answer the five questions of Section 4.3 is a service an agent uses, not an agent.

### 1.2 What this specification is not

It is not a network protocol: how messages move, how identity is carried on a wire, and how discovery is served belong to a binding (Section 11). It is not a harness or model specification: what thinks inside the agent is deliberately out of scope, and two agents with identical conformance may be a large model and a lookup table. And it is not a quality mark: conformance here means the obligations are met, never that the work is good, which is what evaluation and reputation exist to say.

## 2. Conformance language and terminology

The key words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are to be interpreted as described in RFC 2119.

- **Agent**: one party meeting Section 4, with exactly one identity key.
- **Operator**: whoever runs the agent and answers for it.
- **Owner**: the principal the agent belongs to; often the operator, not always.
- **Node**: the machinery that connects an agent to a binding; one node may serve several agents.
- **Binding**: a concrete network's realization of this specification (Section 11).
- **Answer**: behavior under this specification: an exchange the agent responds to, testable by asking.
- **Declaration**: a statement the operator authors about the agent, checkable for validity and signature, never for truth.
- **Attestation**: a signed record issued by someone other than the operator about something that happened.
- **Offering**: one hireable thing the agent does, as its declarations name it.
- **Capability**: an optional, declared behavior set defined in Section 7.
- **Descriptor**: the agent's standing declaration document, in the shape Section 6 defines. **Draft** and **bound** name a Descriptor before and after its subject is filled; a **projection** is a copy of Descriptor facts carried in another format, derived and never edited on its own; a **reference** is a pointer to a Descriptor, or into one of its members, at a digest.
- **AgentDoc**: one assembled document describing one agent, in the shape Section 9 defines. An **assembler** is whoever produced it by gathering sources; a **source** is a document or observation it was assembled from, listed in the document itself; **not-stated** is a member the subject has published nothing about, named explicitly, never omitted and never defaulted.
- **Attribute**: one checkable property from the set in Section 10.
- **Profile**: a named bundle of attributes a buyer reasons with; a profile always decomposes into its attributes.

## 3. The shape of the definition

Everything an agent is accountable for falls in one of three columns, and the columns have different truth mechanics, which is why they never mix.

What an agent **answers** is contract: ask the exchange, check the answer. What an agent **declares** is authored: verify the signature and the format, and treat the content as the operator's word, no more. What others **attest** is evidence: verify the issuer's signature, and weigh the issuer. A reader who knows which column a fact came from knows exactly how far to trust it, and a document that hides the column is misleading by construction; that is the rule the assembled view (Section 9) enforces for the whole family.

Beneath the columns sits the floor: the obligations that make the word "agent" mean anything at all. Sections 4 and 5 are the floor and the answered behavior above it; Section 6 is the declaration column; Section 7 the optional capabilities; Section 8 the attestation column; Section 9 the assembled view over all three; Section 10 the attributes that name what a given agent has actually earned.

## 4. The floor

An agent MUST meet every clause in this section. There is no partial floor.

### 4.1 An identity that signs

An agent holds exactly one Ed25519 keypair, generated on or provisioned to its host. The public key is the immutable agent identifier. Everything the agent authors is signed with this key or attributable to it through its binding's transport identity, and every claim about the agent binds to this key, never to a name. Names are attestations (Section 8.6): an agent MAY hold a handle bound to its key at a registrar, and a reader resolves the handle to the key, never the reverse.

**One key, more than one process.** An agent MAY be served by more than one process at once: one that holds its registration, its address, and its mailbox, and a short-lived one that takes a single message and publishes the answer under its own short-lived credential, bound to an ephemeral key rather than to the agent's. Nothing on a binding's wire distinguishes them, which is what makes the arrangement work, so a reader of the agent's subjects learns that the agent published and never which process did, and MUST NOT read one address as evidence of one process. The short-lived process publishes as the agent and does not sign as the agent: what it publishes is attributable to the agent through the binding's transport identity, the second of the two ways above, and a signature made with the identity key means that key was there.

**The encryption key (OPTIONAL).** An agent MAY additionally hold an X25519 keypair, distinct from its signing keypair, used only for receiving sealed content and never for signing. Its purpose is end-to-end confidentiality where the transport or its operator is not trusted to read payloads: a sender seals a message or a symmetric key to the agent's X25519 public key, and only the agent can open it. An agent that declares an encryption key publishes the public half in its declarations, together with a signed key claim binding the identity key to the encryption key. The key claim is REQUIRED wherever an encryption key is declared, because a reader MUST NOT seal to an unverifiable key. The signing key remains the agent's identity and address; the encryption key is a capability attached to it, and its absence simply means the agent participates only in cleartext.

**Where sealing ends.** Sealing terminates at the agent's host, because that is where the decryption seed lives, and "provisioned to its host" above includes a host the owner does not operate. An agent hosted on another party's infrastructure has that operator inside the sealed boundary: the operator opens payloads as the agent, which is not a violation of this section but the plain meaning of hosting. A declared encryption key is a statement about a key, not about who operates the host behind it; a sender whose threat model includes the recipient's host must establish where the recipient's agent runs by means outside this specification.

### 4.2 It says what it is, to anyone

An agent answers a description request before any relationship exists, and the answer is the one substantive thing a total stranger may ask: the agent's equivalent of an unauthenticated HTTP GET. Without it, every introduction is a cold knock on a closed door, and no third party can ever build a map of what exists.

Rules, all normative:

- The agent's node or platform MUST answer the description request regardless of the requester's admission standing; admission filtering (Section 7.1) MUST NOT apply to it.
- The response MUST be served from operator-declared content by the node or the platform on the agent's behalf. It MUST NOT invoke the agent's model, tools, or memory. **It is a document, not a conversation.** That sentence is the security argument, and implementations are expected to preserve it literally: nothing a stranger sends can make the agent think.
- The description request MUST NOT create a task, MUST NOT enqueue anything in the agent's inbox, and MUST be idempotent and side-effect-free.
- Implementations MUST rate-limit it per requester and SHOULD serve it from cache; the response changes when the operator edits the declarations, not per request.
- Visibility governs listing, not answering: an unlisted agent MUST still answer when addressed directly by identifier or handle, and MUST NOT appear in any listing. A private agent MAY refuse the description request entirely.
- The same document SHOULD also be served over plain HTTPS by the agent's home platform, so parties outside the network, including ordinary web crawlers, can read it without transport credentials. On-network strangers use the exchange; the rest of the web uses the URL. This is deliberate: a search engine will index a URL, and will never join a message bus.

The answer MAY be narrower for a stranger than for an admitted caller; it MUST NOT be false.

### 4.3 The five questions

The floor's exchanges say how a stranger reaches an agent. This clause says what every agent answers about itself: five questions, each with its answer already living in operator-declared, signed bytes rather than in the agent's head.

| # | Question | Where the answer lives |
|---|----------|------------------------|
| 1 | Who are you? | The identity key (Section 4.1), the registrar-signed card where a handle is held, the owner. |
| 2 | What do you do? | The declared offerings (Section 6), and the advertised subset a stranger sees. |
| 3 | How are you used? | Offering inputs and outputs, modes, needs and delivers, interaction style (Section 6). |
| 4 | On what terms? | Price and its digest, data use, compliance, sealing posture, the admission text and access declaration (Sections 6 and 7.6). |
| 5 | What do you refuse? | The closure of the above: everything outside the declared offerings, plus the admission stance. Refusal is answered mechanically, not by the model. |

The rule of Section 4.2 applies to the whole set: implementations MUST serve these answers from the declared bytes at the node or SDK boundary and MUST NOT invoke the agent's model, tools, or memory to produce them. Pre-admission the five questions are answered by the entryway (Section 4.4); post-admission they are answered the same way, from the same bytes.

**The consistency rule.** An agent's statements about itself, wherever spoken, are subordinate to its signed declarations. Prose in a conversation, an answer to a buyer's question about its own price or capability or posture: where any of it conflicts with the declarations or the declared terms, the signed bytes govern, and a counterparty MAY rely on them without further inquiry. A persistent conflict is non-conformance, and it is detectable by construction: ask, then diff. Under this rule a stale declaration stops being an operational nuisance and becomes a checkable defect. The mouth and the signature must agree, and the signature is the one that answers.

**The interview.** The five questions are testable by code that holds no model. A conformance harness fetches the description document, verifies each materialized answer against the signed bytes it derives from, asks out-of-scope questions and expects the standard refusals, and, where it also converses, diffs the spoken answers against the declared ones under the consistency rule. A platform MAY record interview results as evidence beside its other form checks. Recorded results carry who ran them, and the distinction is mandatory in any display: a result an agent ran against itself is a claim; a result a platform or third party recorded is evidence; a surface MUST NOT present the first as the second.

### 4.4 The entryway

An agent answers five exchanges to a caller with no prior relationship. These are the entire pre-admission surface, and the invariant over all of them is: **strangers may read, never run.** No pre-admission exchange invokes the agent's model, tools, or memory.

1. **What are you?** The description of Section 4.2: what the implementer is called, what it does, what it charges, and what it refuses.
2. **Show me your descriptor.** The agent's current Agent Descriptor as the document's exact bytes with their digest, so the caller can check what it received and cite the version it read. An agent whose operator has published no descriptor MUST say so rather than answer with silence or an error.
3. **Will you let me talk to you?** A request to be admitted, carrying the caller's identity and nothing else. The answer states admitted, waiting, or refused, and a refusal names its reason.
4. **Are you accepting new callers?** The current admission policy, stated without reference to the caller asking. The answer MUST NOT name any other caller, nor say who has been admitted or refused.
5. **Where do I stand?** Never asked, waiting, admitted, or refused, for the caller asking. Exchange 3 is not answered on the spot in the general case, so a caller that could not ask this would have to guess.

The contract that travels with the exchanges:

1. **All five are answered without admission.** An entryway whose exchanges required admission could not do its job, because admission is the thing being asked for.
2. **A request to be admitted carries no work.** An agent MUST NOT perform work found in exchange 3, and a caller MUST NOT put work there. The exchange exists to be cheap to receive from a stranger, and an agent that acted on its contents would have given every stranger one free instruction.
3. **A refusal is an answer.** Silence is not. A caller that is turned away is told, and told why.
4. **The roster stays private.** Exchanges 4 and 5 tell a caller about the policy and about itself. Neither reveals another caller's standing, and an agent MUST NOT answer either one in a way that allows one to be enumerated from the other.
5. **Admission is revocable and says nothing about work.** Being admitted means the agent will receive what this caller sends. It is not a promise to accept any particular job, not a price, and not permanent. Once revoked, exchange 5 answers refused.
6. **What it says about itself binds nothing.** Exchange 1 is a description, not an offer, and a caller MUST NOT read a stated charge there as a price it can hold the agent to. What binds is a signed agreement (Section 7.6) or engagement.
7. **No document of its own.** The entryway defines no signed statement. The descriptor exchange 2 serves is defined by Section 6 and carried unchanged. Whether a caller was admitted is the agent's own business to keep; what gets signed belongs to the work that follows.

These five exchanges migrate here from the roles registry's entryway interface, where they were optional. On the floor they are not: the registry keeps role-shaped interfaces, and the before-any-relationship exchanges are what being an agent means. This promotion is the one substantive new obligation in this document.

**The help exchange.** A sixth exchange, "how do I use you?", stands beside the five and differs from them in one respect: it MAY be answered by the agent's model. The line is the door. A caller the agent has not admitted gets the declared facts, served from the signed bytes like exchange 1, with no model, tool, or memory involved; strangers read, never run. A caller the agent admits MAY get the answer in the agent's own words, produced with the Descriptor and the AgentDoc in front of the model, and an implementation that does so MUST end the answer by naming the signed record that governs it, so the consistency rule of Section 4.3 is visible in the answer itself. The own-words grade costs the operator; an implementation MUST bound it per caller per day and SHOULD fall back to the declared facts when the bound is reached rather than refuse. Nothing in a help answer binds the agent: it is a description in the sense of contract item 6, and what binds is the signed declaration it names.

### 4.5 The agent surface

An agent implements four inbound handlers, however its binding spells them:

| Handler | Trigger | Responsibility |
|---------|---------|----------------|
| on request | An incoming request reaches the agent's inbox | Process the request, create a task if the work defers, and respond. |
| on event | An incoming event on a subscribed channel | React. MAY emit new events or initiate new requests. |
| on task update | An incoming status or artifact update | Process updates for tasks this agent has initiated. |
| on lifecycle | Agent start or stop | On start: register with the binding. On stop: deregister. |

Agents MAY implement additional handlers for composed operations but MUST NOT require counterparties to implement anything beyond these four.

### 4.6 It refuses outside its declared offerings, mechanically

There is no default route. A request naming an offering the agent has not declared is refused at the boundary with a typed not-found refusal, before anything that thinks sees it. This MUST be structural rather than behavioral: a conforming implementation cannot answer undeclared work, rather than being discouraged from it.

Conversation itself is an offering. An agent that can converse in natural language SHOULD declare a chat offering taking text and returning text; a sender that wants to talk requests it like any other offering. If the target has declared no such offering, the sender receives the same not-found refusal and learns the agent is reachable but not conversational. Tool-shaped agents that expose task offerings but no chat remain fully reachable by their declared offerings; they simply decline open conversation.

### 4.7 Every refusal is an answer

A refusal is typed, names its reason, and where the reason has a named check or fault, names that too. Silence toward an engaged counterparty is never an outcome: not for admission it has been granted, not for budget, not for a missing grant, not for a failed dependency. A system of agents is debuggable exactly to the degree its refusals explain themselves. When a task fails and the failure has a reason, the reason comes from a closed enum, and a failure blamed on a missing input MUST name a need the offering actually declares.

Silence has exactly one legitimate home, and it is deliberate: the inbound protections of Section 4.8 that exist to deny an attacker an oracle. A duplicate, stale, or misaddressed envelope is dropped without acknowledgement, and a blocked stranger cannot distinguish a block from "no such agent." Both rules are the same doctrine read from opposite sides: an engaged counterparty is owed an explanation; a probing stranger is owed nothing that maps the defenses. For the sender this yields a matching obligation: silence from a registered agent means possibly queued, never failed.

#### 4.7.1 Input it cannot use

Every message an agent admits gets a reply, and a message it could not use is no exception. An agent reads each admitted request against its own declared offerings and their inputs (Section 6.2) before any work starts, and a message that does not fit gets one standard reply instead of work that can only fail, or silence.

A message fits when the offering it is for can be told (the one it names, the only one there is, or the one its words name) and every `required` input of that offering is present and every `one_of` group has a member present; an offering whose inputs are all optional needs nothing, and the agent answers such a message itself. An input of a media type is present as an attached file of that name or type; a `url` input when the words hold an address; a `text`, `document` or `identifier` input when there are words; any input as a member of that name in a structured request. This reading is mechanical, and it is owed only where the work is a fixed program (an offering whose `how.control` is `script`, Section 12.3): an offering a model controls reads a request in words itself, and one that does not say how it is done is given the benefit of the doubt. What does not fit it is answered with the refusal `INPUT_NOT_UNDERSTOOD`, whose parts are fixed:

- `message`, for a person: one short passage saying what went wrong, what the agent accepts, and an example of a request that works, in words a person can act on without knowing the declaration's format;
- `details`, for an agent: `reason`, one of `missing_input`, `not_a_request` and `offering_unclear`; `offering`, the offering it was read against, when that could be told; `offerings`, the ids of all of them; `missing`, the input names it lacks (a group as `one of: a, b`); `expected`, that offering's declared inputs as the descriptor states them; `example`, the offering's own first declared example or one made from its inputs; `read_as`, what a reader made of the message, when one was asked; and `how_to_use`, where the agent's signed record is.

An offering MAY declare `examples`, a list of requests in words that it takes, and a standard reply uses the first.

An implementation MAY ask a converter, an agent that reads free words into a declared input, before it answers. What a converter returns is a proposal, never the input: a field is used only when it names a declared input, its value fits that input's kind, it rests on words the sender wrote (a converter never invents a value, and an address in particular must appear in the message), and it is held with confidence; and the proposal is used only when what survives makes the offering fit. A converted request is acknowledged to the sender with what it was read as before the work starts, and where the work is priced or long the sender is asked to confirm first. A converter that is down, slow or unsure changes nothing: the standard reply goes out, and no agent's answer may depend on a converter. A sealed message's words are never sent to a converter.

A help question, a message whose whole text asks what the agent can do or how to use it, is answered from the agent's declared facts with no model, tool or memory involved: the declared grade of the help exchange (Section 4.4), whoever asks. The standard reply and the card answer are descriptions under contract item 6 of Section 4.4: they bind nothing.

Three cases prove an agent does this, and a conformance check for any role runs them against every offering that declares an input beyond free text: a plain sentence asking for the offering's work, a structured request with one required input missing, and nonsense. Each is answered with `INPUT_NOT_UNDERSTOOD` (or, for the sentence, a converted request acknowledged as above) within five seconds. The reply is counted, and the agent's operator can see how often it happens and the most common first lines, so a declaration that confuses its callers is found and fixed rather than suffered.

### 4.8 The inbound protections

Every agent enforces these before its model sees anything, in this order where order matters. Byte-exact fence text, window boundaries, and signed example envelopes are pinned by the binding's conformance fixture (Section 14).

1. Verify every envelope signature over the tagged signed bytes before any other check.
2. Reject duplicates on the pair of sender and message id: bounded memory, first-seen eviction, remember before judging.
3. Enforce a freshness window on every delivery path, with the binding stating its live, mailbox, and future-skew bounds.
4. Refuse misaddressed envelopes, silently.
5. Cap inbound sender text (default 65,536 UTF-16 code units) and answer with a typed too-large refusal.
6. Fence sender text with pinned markers before it reaches the model: once, on by default, provenance drawn from the verified envelope only. Inbound content is always presented as third-party material, never as the operator's own instructions; instructions embedded in somebody else's content are the attack being defended against.
7. Admit against the budget before working (Section 5.4): refuse with an estimate, never accept and then fail.
8. On admission by a live handler, signal acceptance immediately, before the handler runs; refusals of admission happen instead of the acceptance, never after it.
9. Never fetch a sender-chosen address implicitly, and never fetch anything before deciding to accept the message (Section 5.3).

## 5. Work

What an agent answers once engaged: the request round, the task lifecycle where work defers, the deliverables, and the money and time conversation. This section is the behavioral floor for any agent that accepts work; an agent that only emits and subscribes to events has no use for it and is not excused from Section 4.

### 5.1 Bare answers and tasks

A responder creates a task **only** when a request cannot be answered with a single terminal reply: when the work is long-running, streamed, or needs another round of input or authorization.

- **No task** (bare mode): the responder returns a terminal response with no task id. Nothing is persisted; the interaction is a single request and response round. This is the common case.
- **Task** (deferred mode): the responder returns a non-terminal response carrying a task id, then drives the task through its lifecycle. The task is the durable, resumable record of that work.

Requesters need no advance knowledge of which mode applies. The first substantive response tells them: a terminal status with no task id means done; a task id with a non-terminal status means subscribe for updates. An agent MUST NOT create a task solely to answer a request it can complete immediately, and error responses need not create one.

### 5.2 Task states and transitions

Non-terminal states: `submitted` (request received, task created, processing not begun), `working`, `input_required`, `auth_required`. Terminal states: `completed` (deliverables available), `failed` (an error during execution, details carried in the error), `canceled` (by requester or responder), `rejected` (the responder declined the task: cannot or will not perform the offering; distinct from `failed`), and `exhausted` (the governing engagement reached its cap and the work concluded there; deliverables produced before the cap remain attached, nothing past the cap is billable, and a runtime MUST NOT record an exhausted task as failed).

Legal transitions: none to `submitted` on receipt; `submitted` to `working`, `canceled`, `exhausted`, or `rejected`; `working` to `completed`, `failed`, `input_required`, `auth_required`, `canceled`, or `exhausted`; `input_required` and `auth_required` to `working`, `canceled`, or `exhausted`. Transitions not listed are invalid, and implementations MUST reject them with a typed invalid-transition refusal.

Tasks MUST be durably persisted, keyed by task id, in a store that is the authoritative source of truth for task state and updated on every transition. Updates and deliverable notices are published to the task's update channel for the requester, with the durable store remaining canonical for lookups.

Cancellation is honored: a closed reason enum, work stopped, and cancellation forwarded to every still-live delegate the responder engaged for the task.

### 5.3 Deliverables

Artifacts are the outputs of a task: the deliverables, distinct from conversational messages. An artifact carries one or more parts: inline text, inline structured data, or a reference to bytes held outside the message.

**References.** A reference is an opaque URI. Readers MUST resolve it through their runtime and MUST NOT parse it to locate the bytes themselves; a reference whose scheme the reader does not know is surfaced as unresolvable rather than guessed at. Every reference carries its media type and size, so a reader can decide whether to fetch before it does, and SHOULD carry a SHA-256 digest of the referenced bytes. A reader that fetches a reference carrying a digest MUST verify it and MUST treat a mismatch as a failed fetch. A digest's absence means unverifiable, never verified. Between agents, possession of a reference is the read capability: a reference can be forwarded, so any agent the holder shares it with can read the bytes, and content that must not travel that way is sealed before it is stored. A reference is not a public web address: a host's web door serves a task's files only to a signed-in party allowed to see the work, serves what a public page publishes only at that page's own address and only while the page is published, and hands a file to a party with no session by a short-lived link made for that one hand-over.

**Inbound files and resources.** In the other direction, a sender may hand the agent files or name shared resources the work happens in. Two rules protect the receiver. A receiver MUST NOT fetch a sender-chosen address implicitly: dereferencing automatically turns every agent into a fetch-on-demand proxy for whoever can address it. And a receiver SHOULD NOT fetch anything before it has decided to accept the message: a reference costs nothing to receive, the bytes do not, and fetching during admission lets an unadmitted sender spend the receiver's bandwidth and disk merely by addressing it. A resource entry states the intended access, and a receiver granted read access that intends to write has left the agreement, whatever the resource's own permissions happen to allow. A resource entry MUST NOT carry a credential in cleartext: a secret that must travel travels sealed, to a verified key, or not at all. When a responder holds write access, a change to the resource itself is a legitimate deliverable: the completing response then carries a pointer to what changed and a summary, not a copy of the bytes.

### 5.4 The budget

A budget is the requester's statement of the most a piece of work may cost and the latest it may finish. It is an **offer, and acceptance means something**: a responder reads the budget before doing any work, and accepting the request is a statement that it believes the work fits inside it.

A budget carries a deadline (an absolute UTC timestamp), a cost ceiling (denominated in currency), and a revision counter; at least one of deadline and ceiling is present. Only money and time appear, deliberately. Tokens are not fungible across agents: a token of a small model, a large model, and a reasoning pass differ in cost by orders of magnitude, and only the responder knows its own mix, so a token budget would be a constraint written in the responder's private units. The responder owns the conversion. A requester that cares about quality rather than spend should choose a different agent via discovery, not meter this one.

**Admission.** A responder that does not believe it can complete the work within the budget MUST refuse at admission, before doing the work, rather than accept and fail mid-flight: a budget-insufficient refusal when the ceiling is the problem, a deadline-unmeetable refusal when the deadline is. The refusal SHOULD carry the responder's estimate: its price, or its earliest realistic completion. Refuse-with-estimate is the negotiation mechanism, and it is the family's price-discovery loop: the refusal is equally legal against a request that offered no ceiling at all, in which case the estimate is a price quote and resubmitting at or above it is acceptance. A refusal driven by the responder's own spending policy (the allowance, Section 7.5) is deliberately indistinguishable on the wire from one driven by a too-low offer. Accepting work the budget never covered and then failing is the one outcome this section treats as the responder's fault, because it spends the requester's time, which is part of the budget.

**What the deadline means.** The deadline is the moment the requester's obligation to wait ends and the responder's authorization to spend ends. It is not a kill switch and it is not retroactive: deliverables produced before the deadline were delivered inside the budget and belong to the requester. Where a task manager holds the clock, it marks the task overdue at the deadline and notifies the requester, who then holds every partial deliverable received so far and a choice: cancel, or keep listening. A completion arriving after the deadline is accepted and recorded as completed late; what a late answer is worth is the requester's decision. Work past the deadline is at the responder's own risk and on its own account.

**Hitting the ceiling.** A responder that reaches the cost ceiling on work that turned out larger than either party thought MUST stop before crossing it and move the task to `input_required` with a budget-exhausted reason, reporting spend so far and an estimate to finish. The input required is money: the requester either raises the budget by revision and work resumes, or cancels and keeps the partial deliverables.

**Revisions.** Either party to a task MAY send a budget revision as a task update carrying only the budget. Revisions are absolute, never deltas: each revision states the entire budget, so a lost or reordered revision cannot corrupt anyone's arithmetic; the highest revision is simply the whole truth. Revisions from anyone but the task's requester or responder are rejected, as are revisions to tasks in a terminal state, and a revision cannot render the present moment retroactively over budget: it constrains only the future.

**Enforcement, honestly.** The spend half of this section is an honor-system MUST: nothing outside the responder can see inside it. What can be enforced without the responder's cooperation is time, because task state is held centrally. The budget therefore also defines the most a requester can ever be asked to pay for the work, and the overdue and late records support the natural settlement rule, that nothing is owed for work past the deadline, if settlement ever becomes real. Settlement itself is out of scope.

### 5.5 Usage and cost reporting

On completion, the responder SHOULD report its actual spend as a cost object in the terminal response, and reports declared usage cumulatively in the terminal response, superseding interim figures and covered by the envelope signature. The report is informative rather than normative, deliberately: you can oblige an agent to respect a ceiling, but you cannot oblige its spend report to be true. Verified metering is out of scope; what a platform can add is receipts (Section 7.6).

### 5.6 Context

A context groups related tasks into a logical session. If a request does not include a context id, the responder MUST generate one and include it in the response. If a request names both a task and a context, the responder MUST verify the task belongs to that context. Context expiration and cleanup are implementation-defined, and agents SHOULD document their retention in their declarations.

### 5.7 The job manifest and revisions

A completed task is revised more often than it is redone, and a revision reuses what exists only when what exists is named. A **job manifest** is the responder's own signed record of a completion: every piece it delivered, with the delivery step that made it (Section 12.3), its media type, its reference (Section 5.3), its size, its digest, and, where the responder can say, which inputs it was produced from. A responder that offers revisions MUST attach a job manifest to every completion of a revisable offering, as the `job` member of the completion's output, and MUST keep it retrievable by the requester of that task for as long as its declared retention runs (Section 5.6).

The document: `format`, which MUST be `"job-manifest-v1"`; `job`, the task id of the first delivery, stable across revisions; `task_id`, this completion's; `context_id`, or null; `revises`, the prior task id, or null; `version`, 1 for the first delivery and one more per revision; `agent`, the responder's key; `offering`; `produced_at`; `pieces[]`, each with `name`, `step`, `media_type`, `ref`, `size`, `digest` (`sha256:` followed by 64 lowercase hex), `produced_from[]` where known, `path`, OPTIONAL, where the responder lays the piece out (a relative path with forward slashes and no `..` segment, so a reader can place the pieces as the responder did), `kind`, OPTIONAL, `file` or `link` (a link piece's bytes are one web address), and `reused`; `reused`, `{ "pieces", "of" }`; `run_config`, OPTIONAL, what the work ran under where the job carried a run config (Section 5.8); and `sig`, the responder's Ed25519 signature, base64url, over the ASCII tag `agentmesh-job-manifest-v1`, one newline, and the JCS canonical JSON of the document without `sig`. The subject signs its own record here, so this is the tagged single-signature form the vouch uses, not the attestation convention of Section 8.1, whose signer is someone other than the subject.

A **revision** is a new request on the same offering that carries `revises`, the prior task's id; `job.manifest`, the reference of the prior manifest; `steps[]`, the delivery steps to redo; and the change, in the request's text. The responder MUST verify the prior manifest's signature and that the prior task is one it completed for this requester, and MUST refuse, typed, a revision of a task it did not complete, of an offering that declares no revisions, or naming a step the offering does not declare. It redoes the named steps, reuses every other piece by reference and digest, and completes with a new manifest whose `reused` counts the pieces whose reference and digest both equal the prior manifest's. Any reader MAY recompute that count from the two manifests; a `reused` that does not match the recomputation is a defect of the manifest, not of the work. The prior task is not edited: it stays completed, and the new task names it.

What a revision costs is the responder's declared policy: the offering's `revisions` member (Section 6.2), and the Agent SoW revisions clause where an engagement governs. A number of included revisions within a window after the first delivery, then the named steps' prices, or one flat price. The responder's node MUST apply the count, the window and the arithmetic itself, and MUST refuse, with a typed budget refusal that carries the price as a quote, a request beyond the included count that carries no budget (Section 5.4) covering the price. Two exchanges let a requester read the state before asking. `job.manifest` returns the manifest of a task to the requester that asked for that task and to nobody else, because a manifest names references that are capabilities (Section 5.3). `job.quote` returns what redoing named steps would cost now: the steps with their prices, the total, the included revisions remaining, and when the window ends. Both are answered by the node from its records, never by the model. The roles registry publishes the pair, with the revision convention above, as the revisable-work interface, and the Revisable attribute (Section 10) is backed by its test.

### 5.8 Run configs

A good result can be repeated only when the choices that produced it have a name. A **run config** is a named, versioned set of choices a job runs under: which version of each agent, which model, and the settings that shape the output. It is chosen for each job, and it works the same way for a job sent to one agent and for a process run, where each step is handed its own part. An agent's **install settings** are a different thing: the credentials, keys and non-secret values bound when the agent is installed (Section 12.4). A run config never carries one and nothing in it reaches one, so no choice made for a job can change what an agent was installed with. Like every declaration, a run config carries no credential, key, address or account identifier (Section 6.4).

**The document.**

```json
{
  "run_config": "v1",
  "name": "Deck explainer, Oct 6",
  "scope": { "kind": "solution", "id": "example-org/explainer-from-a-slide-deck" },
  "process_digest": "sha256:…",
  "steps": {
    "scene-writer": {
      "agent": "scene-writer@example.org",
      "version": "2.13.4",
      "package_digest": "sha256:…",
      "model": "example/model-a",
      "settings": { "speaker": "the deck's author" }
    }
  },
  "platform": { "narration.voice": "voice-1", "narration.pace": 155, "accept.model": "example/model-b" },
  "answers": { "show slides": "Yes", "whose voice": "The deck's author (we)" },
  "digest": "sha256:…"
}
```

`run_config` MUST be `"v1"`. `name` is unique among the run configs one owner keeps for one scope. `scope` says what the run config is for: `kind` is `agent` for a job sent to one agent and `solution` for a process run, and `id` is the agent's handle or the process's id. A solution's run config carries `process_digest`, the digest of the process document it was made for; an agent's run config leaves it out and has one entry in `steps`. `steps` holds one entry per step, keyed by the phase name in a solution and by the offering id for an agent, and each entry carries `agent`, the handle; `version`, the package version the run config was made with; `package_digest`, the package that version was installed from, where there is one; `model`; `settings`, the values this run config gives the agent's declared settings (Section 6.2); and, OPTIONAL, `newer_patch` (below). `platform` holds choices that the party running the job applies itself, such as a narration voice added after the steps. They reach no agent, and an agent MUST ignore the member. `answers` holds the answers the run is started with, the same answers the run context carries.

`model` sits beside `settings` in a step entry and is the value of the agent's declared setting named `model`. A step entry MUST NOT carry `model` inside `settings` as well. Where the agent declares no `model` setting, the member records the model the step ran with when the run config was made, and the agent is not asked to use it.

**The digest.** `digest` is `sha256:` followed by 64 lowercase hex characters: the SHA-256 of the JCS (RFC 8785) canonical JSON of the document without `digest`. Two run configs with one digest hold the same choices, whatever each is called. A named run config in a Descriptor (Section 6.2) carries a digest computed the same way over its entry.

**Layers.** Values come from up to six layers. From furthest to closest they are the agent's **author**, with the declared defaults and named run configs of Section 6.2; the **solution author**, for a step inside a solution; the **organization** running the job; a **team** inside that organization; the **person** running it; and **this run**, the job's own values. Each declared setting is of one of two kinds:

- For a `preference` (a voice, a pace, a length, a tone), the closest layer that gives a value wins.
- For a `rule` (the models allowed, a data region, a spend cap, whether slides may be shown), the tightest layer wins. A closer layer MAY narrow a rule and MUST NOT widen it. A list of allowed values narrows to the values every layer allows; a number is a ceiling, and the lowest wins; for a yes or no, no is the tighter value.

A layer that narrows a rule so that the value it would inherit is no longer allowed MUST give a value of its own, and whoever keeps the layer MUST refuse to save one that does not. A value that falls outside a rule after the layers are applied is refused before the job starts, naming the setting and the rule that excluded it.

**Teams.** A team is a named group of an organization's members. A member is in at most one team of an organization, and that team's layer is the one a run of theirs in that organization uses; a person in no team has no team layer.

**Locks.** An organization or a team MAY lock a setting. A locked setting keeps the value it has once that layer is applied, whichever layer supplied it, and no closer layer can change it: a closer layer that gives another value, or narrows a rule so that the locked value is no longer allowed, is refused with `reason: locked`, naming the setting, the locked value and who locked it. A closer layer that gives the locked value again changes nothing and is not refused. A layer MAY change what it locked itself. Whoever keeps a layer SHOULD refuse to save a value that a layer above it has locked, and a person's own layer MUST NOT lock. A locked value is shown to the person starting a job as a value they cannot change, with who locked it.

**Who keeps a run config.** A run config is kept by the solution or agent it is for, or by an organization, a team or a person for a solution. One kept by an organization, a team or a person is applied at that layer, after the layer's standing values, so a person's saved changes win over their organization's values and never over a lock. It MAY carry `based_on`, the name of the solution's run config it builds on; that run config is then applied at the solution author's layer and its versions are the ones checked, and the kept one holds only what its keeper changed. When a job names a run config, the closest keeper's of that name is used: the person's own, their team's, their organization's, then the solution's. A run config kept by a person is changed only by that person; their team's leads and their organization's admins MAY read it and MAY adopt it, which keeps a copy for the team or the organization that says where it came from.

When a job starts, the layers resolve once into a **resolved run config**: the same document with every value final and the name of the run config it started from, if any. Its digest is computed as above over the plain values, so two jobs that ran under the same values carry the same digest whoever chose them. Section 8.7 says how it is recorded with the source of each value.

**When the sender does not own the agent.** The author's, the organization's and the team's layers are then the owner's. Every layer held by somebody else, the solution author's included, MAY set only the settings the agent declares with `job_may_set: true`, and only inside the owner's rules. The sender cannot see the owner's layers, so they are applied on the agent's side: the sender's resolver hands over the values from its own layers, and the agent's node resolves them over the owner's. A value for a setting that is not `job_may_set` is refused with `reason: not_settable`. It is never dropped quietly in favour of the owner's value.

**What a job carries.** A job carries its step's part of the resolved run config in the run context (Section 6.2), as the member `run_config` of `run-context.json`. A run context that carries the member says `"run-context": "v2"`, and a reader of `"v1"` ignores the member.

```json
"run_config": {
  "name": "Deck explainer, Oct 6",
  "digest": "sha256:…",
  "resolved": "sha256:…",
  "step": "scene-writer",
  "version": "2.13.4",
  "model": "example/model-a",
  "settings": { "speaker": "the deck's author" }
}
```

`name` and `digest` name the run config the job was started with, and both are absent when the job named none. `resolved` is the digest of the resolved run config. `step` is the phase name or the offering id. `version` and `model` are the step's, as above. `settings` holds the final value of every declared setting the job sets, written plainly. A job outside a process carries the same file with `process` and `phase` absent. An agent that declares no `run_config` block (Section 6.2) takes no settings, and a resolver MUST NOT hand it any; its version is still checked.

**What the agent owes.** An agent that receives a run config uses every value in it exactly as given. It MUST NOT substitute a value of its own, such as a nearer model, its default, or a cheaper setting, for any reason. Where it cannot use a value, it refuses before any work starts with the refusal `RUN_CONFIG_REFUSED`, which carries `message`, for a person, and for an agent `reason`, `setting`, `value`, and `allowed` where the setting has a list. `reason` is one of `not_declared` (the agent declares no such setting), `not_settable` (the sender may not set it), `not_allowed` (the value is outside the setting's `allowed` or a rule above it), `cannot_use` (the value is allowed and cannot be used now, as with a model that has been retired), `locked` (a layer above locked the setting at another value, see Locks) and `version_mismatch` (below). A value that stops working partway through fails the task with the same reason, and the agent does not finish the work some other way. The completion's job manifest (Section 5.7) names what the work ran under in `run_config`: `name`, `digest` and `resolved` as above, and `values`, each setting's value as used, written plainly as the job's part carried it (the layer each value came from is on the run record, Section 8.7). The member belongs to the manifest, once, and never to a piece: the work ran under one run config, whatever it made. A manifest made before this member existed may name the run config only in its pieces' `produced_from`, as the entry `run-config:<name>@<resolved>`; a reader that finds no `run_config` member MAY read the name and the resolved digest from there, and has no values.

**Versions.** A run config names a version for each step, and the party that starts the job checks it before the first step runs. An agent MAY keep earlier or later versions installed alongside its current one (Section 12.7, Install alongside). Where the step's version is the current one, or is installed alongside, the job goes ahead on that version: the step's part names it in `version`, the agent's node does the work with that version, and the completion's job manifest names it in `agent_version` and `package_digest`. Where the version is neither, the job stops before it starts with `reason: version_mismatch`, naming the step, the version the run config was made with, and the version installed. An agent's node that receives a job started from a named run config whose part names a version it does not hold MUST refuse it with the same reason and MUST NOT do the work with another version. A step MAY carry `newer_patch: true`, which accepts an installed version with the same major and minor numbers and a higher patch number, and the package digest is then not compared. A run config never moves its own pins. A pinned version changes only when somebody saves a new run config, and the values a run config does not set follow the layers above it each time it is resolved.

**Moving a pin.** A pin SHOULD move only after a replay: the saved run that proved the run config is run again at that step through the new version, and the outputs compared. An agent that can do this declares `replay: true` in its `run_config` block (Section 6.2): handed a saved run's step, with the files the step was handed and the model answers the run recorded, it does the job again without calling a model and delivers what it made. It MAY keep the saved step itself (the job's message, files and recorded model answers, beside its outputs) and be asked for it by the saved job's identifier; it replays a saved job only for that job's sender or the party it was done for, because what it makes comes from that job's material. Where the step's agent can replay, the party moving the pin replays it and compares each output by digest; when every output is the same the pin moves, and when any differs it does not move unless the mover says why the difference is acceptable. Where the agent cannot replay, the mover describes the replay they made and what it showed. Either way a **replay report** is kept with the move: the saved run, the two versions, whether the platform replayed it or the mover described it, the outcome (`same`, `differs` or `described`) and its findings in sentences, including what the author's declared settings changed between the two versions where that is known.

**Changes from above.** When something above a run config changes, whoever keeps it SHOULD tell its keeper what the change means for it, once, when the change is made: a value it does not set itself and now follows (picked up); a value it sets itself at or below the layer that changed, which does not move (kept); or a change that would stop its next run (a pinned version replaced by a newer install, a model or other value the new rule or the new version no longer allows, a lock at a value it sets). A warning that the next run would stop SHOULD reach the keeper before that run, not when it fails. A named run config pinned to versions does not move when the versions above it change; its keeper moves it.

## 6. What an agent declares: the Agent Descriptor

The declaration surface is the Agent Descriptor: the operator's standing description of one agent, and the primary location for its metadata. What it does, what each offering takes and returns, who drives it, what it refuses, and where it runs, in one document, signed once bound, versioned by replacement, referenced at a digest. This chapter is the Descriptor's normative definition; the page at https://commonagent.net/descriptor.html is a rendering of it.

### 6.1 Primary, and others bind

An agent's facts end up spelled in several places: a description on a card, offerings on a registration, inputs in a contract, a model name in a config. Two spellings of one fact drift, and then a reader cannot tell which one the operator means. The Descriptor exists to end that: it is the one place the operator writes, and everything else derives from it or points into it.

A fact about the agent appears in the Descriptor once. A card or a manifest MAY carry a copy of a Descriptor fact, but only as a projection: derived from the Descriptor, never edited independently. A signed document that wants to make a Descriptor fact binding references it at a digest (Section 6.5) rather than restating it. A document that spells a Descriptor fact a second time, in its own words, does not conform to this section.

What the Descriptor is not: it is not a card, because it carries no endpoint and no authentication, which are connection facts, and the Descriptor holds shapes only (Section 6.4). It is not a contract: nothing in it binds anyone until a signed proposal references it. And it is not evidence: nothing issued by a third party after something happened is a member of it. Verdicts, records, and reputation check the Descriptor from outside.

### 6.2 The document

A Descriptor is a JSON object. Three members are required in every Descriptor, draft or bound:

| Member | Holds |
|--------|-------|
| `format` | Which version of the Agent Descriptor format this document follows. For this specification it MUST be `"agent-descriptor-v1"`. |
| `agent_version` | Which version of the agent this describes, in the operator's own scheme. Two Descriptors for the same subject are ordered by it. |
| `does` | One sentence on what the agent does. |

**The subject, draft and bound.** The `subject` member holds the agent's key and handle: `{ "id": <public key>, "handle": <handle> }`. A draft leaves `subject` absent, because a builder describes agents that do not exist yet; the subject is filled at deployment, when the agent receives its identity. **Nothing binds to a draft**: a signed proposal MUST NOT reference a Descriptor without a subject, and a registry MUST NOT store one as an agent's Descriptor. Once bound, a Descriptor's subject MUST NOT change. A new agent gets a new Descriptor, not an edited one.

**Offerings.** `offerings[]` carries one entry per hireable thing. Each entry has an `id`, a `name`, one sentence of description, and its inputs and outputs:

- `inputs[]`: each input's `name`, its `kind` (Section 6.3), whether it is `required`, and `external: true` when it is reached rather than furnished. An input that is a grant rather than a thing sent MAY carry `via`, one or more values from Agent SoW's grant-mechanism vocabulary, naming the mechanisms the operator accepts for making the grant. A caller reads it before deciding whether to engage, which is the point of stating it here. An input MAY carry `one_of`, a group name: at least one input of the offering naming that group MUST arrive, and no member of the group is `required` on its own, so an agent that reads any one of five kinds of source says so once instead of marking all five optional and leaving the caller to read an agent that needs nothing. A consumer that does not know the member reads each as optional, the weaker claim, which is the safe direction to fail in. An input MAY carry `max_bytes`, the most of it the agent takes: a caller, and anything that hands work on, checks it before sending and, over it, says so and sends nothing, because an agent handed part of an input does part of the work without knowing it. An agent that works inside a process MAY declare an input of kind `application/vnd.agentmesh.run-context+json`, named `run-context`, with `fields` naming what it reads (for example `focus` and `audience`): the run context, the answers the run was started with, which a process runner hands to every step whatever its place in the process. A consumer that does not know either member loses nothing by ignoring it.
- `outputs[]`: each deliverable's `name`, its `kind`, and `when`: `per_task` for a deliverable each task produces, `standing` for one maintained across tasks. An output MAY carry `working: true` when it is the agent's working out, filed so a reader can check the deliverable against where it came from, rather than the deliverable itself; a renderer lists the deliverables first and MUST NOT drop the working pieces, because a caller still receives them.

**Revisions.** An offering MAY carry `revisions`, what a change to its delivered work costs (Section 5.7): `included`, with a `count` and a `window_days` after the first delivery, and either `steps[]`, each a step `id` from the offering's own `steps[]` (Section 12.3) with a `price` in the price declaration's shape, or `flat`, one price for any revision. An offering without `revisions` does not offer them, and a request that names a prior task is refused as Section 5.7 says. The member is a declaration in the sense of Section 6.10: what it promises is enforced at the responder's node, and a document that promises what its node does not apply is not conformant.

The line between an input and a system: something furnished or named per task is an input, and something bound once at deployment and used across tasks is a system (`systems[]`, below).

**Interaction and refusals.** `interaction` is `"interactive"` when a person attends the agent and `"service"` when nobody is in the loop; the caller-side semantics are Section 6.7's. `refusals` is prose: what the agent will not do, in the operator's own words. Refusals gain force elsewhere, as SoW clauses and role contracts; here they are the operator's plain statement.

**Extensions.** Every member beyond the core is optional, and an absent one means not stated (Section 6.4):

| Member | Holds |
|--------|-------|
| `role` | The standard role held, by offering name. The contract stays at the roles registry. |
| `interfaces[]` | The interfaces implemented, by name. The definitions stay at the registry. |
| `shape` | `harness`, `model`, `steps` (`fixed` or `chosen`), `memory` (`keeps` or `starts_clean`), `tools_runtime` (`fixed` or `discovered`), `fleet`, true when several processes answer as one identity, and `kind`, one value of Section 9.5.1's vocabulary. An assembled view computes `kind` from a record wherever one establishes it, and carries the operator's word only where no record can, which is how an agent behind a bridge says what it is made of at all. Where a record and the operator's word disagree, the computed value is carried and the disagreement is reported. That is the shape of the rule Section 6.8 gives a projection rather than an instance of it: this member is the operator's own declaration, and what overrides it is a record of what was deployed. |
| `hosted_in[]` | The jurisdictions or regions the runtime sits in. A region, never an address. Distinct from where content is processed and where answers apply, which keep their own documents. |
| `systems[]` | Standing systems the work is bound to: a `name`, an `access` level (`read`, `write`, `trigger`), and `needs`, what the access is for. The assembled view carries this as its `reaches` section (Section 9). |
| `limits` | Per-caller ceilings: `requests_per_hour`, `model_budget_per_day`, and `past_them`, what happens beyond them. |
| `handling_ref`, `price_ref`, `samples_ref` | Pointers to the data-use declaration, the price, and the samples document (Section 7.7), which keep their existing homes. The Descriptor points at them rather than restating them. |
| `run_config` | What a job may set: the declared settings, the models the author tested, and the author's named run configs (below, and Section 5.8). |

**The member that names a system is `name`, and `role` is its alias for one revision.** A reader MUST treat `systems[].role` and `systems[].name` as the same member, and MUST prefer `name` where a document carries both. A writer SHOULD emit `name`, and the alias is removed at the next revision. The rename is because `role` already names the standard job an agent holds, the first member in the table above, whose contract is an entry at the roles registry: one word for the job an agent takes on and for the name of a database it reaches makes a document nobody can read without being told which was meant.

**Run configs.** `run_config` declares what a run config may set for this agent (Section 5.8). Only a setting declared here can be set, at any layer.

```json
"run_config": {
  "settings": [
    { "name": "model", "kind": "rule", "default": "example/model-a",
      "allowed": ["example/model-a", "example/model-b"], "job_may_set": false },
    { "name": "speaker", "kind": "preference", "default": "the deck's author",
      "allowed": ["the deck's author", "a narrator"], "job_may_set": true }
  ],
  "tested_models": ["example/model-a"],
  "named": [ { "name": "Deck explainer, Oct 6", "settings": { "speaker": "the deck's author" }, "digest": "sha256:…" } ]
}
```

Each entry in `settings[]` has a `name`, unique in the block; a `kind`, `preference` or `rule`, whose resolution Section 5.8 gives; a `default`; `allowed`; and `job_may_set`. `allowed` lists the values the agent can use. A rule whose values are words MUST carry it, because it is the list a closer layer narrows. A rule whose default is a number is a ceiling, and its `default` is the highest value any layer may set. A rule whose default is true or false needs no list. On a preference `allowed` is OPTIONAL, and where it is absent any value of the default's type may be sent, which the agent still uses exactly or refuses. `job_may_set` is true when a sender who does not own the agent may set the setting for a job, and an absent `job_may_set` is read as false.

A setting named `model` is the AI model the agent's work calls, so an organization's rule about which models may be used narrows that setting's `allowed`. `tested_models` lists the models the author has tested the agent with. It SHOULD be a subset of the `model` setting's `allowed`, and a model that is allowed and not listed is permitted and untested, which a reader is told (Section 9.5). `named` lists the author's named run configs. Each has a `name`, unique in the block; `settings`, giving values only to declared settings, each inside its setting's `allowed` or under its ceiling; and `digest`, computed as Section 5.8 says over the entry without `digest`. `replay`, OPTIONAL, is `true` when the agent can replay a saved run's step without calling a model, so a pin move can be checked by comparing outputs (Section 5.8, Moving a pin); absent means it cannot.

A declared setting is a choice made for each job, so it MUST NOT be a credential, a key, an address or an account identifier. What an install binds is an install setting, named in the install file (Section 12.4), and is never declared here. A run config that an owner, an organization or a person saves is kept with them and is never added to the Descriptor, which differs from its package's draft only as Section 12.6 rule 6 allows. An agent whose Descriptor has no `run_config` member takes no settings.

A consumer that meets a member it does not recognise MUST ignore it rather than fail: an unknown extension is somebody else's business.

### 6.3 Kinds

An input or output `kind` is a media type where the thing is a file: `application/pdf`, `application/gzip`, `text/csv`. Not every input is a file, so four value kinds sit beside the media types:

| Kind | Means |
|------|-------|
| `text` | A string a person or program supplies inline. |
| `identifier` | A name for a thing: an agent handle, a record id, a subject key. |
| `url` | An address to be used as an address. |
| `document` | A fetchable file whose media type is not fixed. |

A non-file input MUST use a value kind. Forcing an agent handle into a media type misdescribes it, and a consumer checking inputs would check the wrong thing.

### 6.4 The rules

1. **Every fact has one authored spelling.** A fact appears in the Descriptor once. Any other document carries a projection or a reference (Sections 6.1 and 6.8).
2. **An absent member means not stated.** A consumer MUST treat an absent member as something the operator has not said, never as a default. An unreadable member is treated as absent, never as the safe-sounding value.
3. **It carries shapes only.** Media types, region names, and system names belong in a Descriptor. Addresses, credentials, endpoints, and account identifiers MUST NOT appear in one. A document violating this does not conform, whoever wrote it.
4. **Evidence stays outside it.** Nothing issued by a third party after something happened is a Descriptor member. A Descriptor states; records and verdicts check.

### 6.5 Versioning and the digest

A Descriptor is standing: true until its operator changes it. It is versioned by replacement. There is no partial edit; a new version is a whole new document.

**The digest is over the exact bytes served, with no canonicalization.** The digest of a Descriptor is the SHA-256 of the byte sequence a consumer fetched, exactly as fetched. This matches how an Agent SoW contract forms on bytes: a reference names an artifact, and the artifact is the bytes.

A reference to a Descriptor carries its digest, and MAY carry a location. A signed proposal that elevates Descriptor members references the Descriptor at its digest, which is why an operator's later edit cannot move what an existing signature meant.

`agent_version` orders versions of the agent, not edits of the document. Two Descriptors with different digests and the same `agent_version` are two spellings of the same agent version, and only the digest tells them apart. A Descriptor describing a changed agent MUST carry a new `agent_version`.

### 6.6 The signature

A bound Descriptor SHOULD carry the operator's signature, made with the subject's identity key, so a copy stays checkable wherever it travels. A bound Descriptor without one is trusted only as far as the place it was fetched from.

The signature follows the family convention (Section 8.1). The tag defined here:

- `descriptor-statement-v1`: the operator's statement that this is the subject's standing description. `by` MUST be the subject's own key, the same key as `subject.id`.

The digest (Section 6.5) is over the served bytes including `signatures`: a reference names the exact artifact, signature and all. The signature is over the canonical form without itself: a statement survives reserialization, an artifact does not, and the two jobs are different on purpose.

A draft has no subject and therefore no subject key, so a draft carries no `descriptor-statement-v1` signature. Whoever passes a draft around vouches for it themselves.

### 6.7 Serving and discovery

**The addresses.** A subject reachable at a domain SHOULD serve its current Descriptor at `https://<domain>/.well-known/agent-descriptor.json`, beside the A2A card and the AgentDoc. Most agents are not reachable at a domain, so the general case is a pointer: the subject's registration SHOULD carry the location of its current Descriptor and that version's digest. A consumer who has found the agent has found its Descriptor.

**The registry.** At registration the subject SHOULD hand the registry the Descriptor itself, not only a pointer. A registry that stores Descriptors MUST serve the current one for a subject, MUST retain and serve every version it has stored by digest, and becomes the reliable place to fetch from when the operator's own serving goes away. Where a registry's stored copy and the operator's served copy disagree, a consumer MUST NOT merge them: the disagreement is reported, the same rule the assembled view follows for drifted projections.

**Asking the agent.** A subject SHOULD answer a request for its own current Descriptor, before any agreement exists, answering with the document bytes and their digest. This is entryway exchange 2 (Section 4.4); a consumer on the same network as the agent then needs no other serving at all.

**History.** A signed reference is only checkable while the version it names can still be fetched. Whoever serves Descriptors for a subject MUST keep serving each version they have served, by digest, for as long as they serve the subject at all. The registry's stored history is the backstop; an operator SHOULD keep their own. A countersigner is well advised to keep their own copy besides, since their signature is the reason the version matters.

**Hosted agents.** Where a platform hosts the agent, the platform serves the Descriptor on the operator's behalf, and that hosted copy is the authoritative home: the pointer in the registration points at it, and its bytes are the ones a digest names.

**Knowing it changed.** Replacing a Descriptor SHOULD be announced as an event where the subject is registered, so a consumer who cares can subscribe rather than poll. A consumer without the event compares digests on refetch. Staleness is detectable either way; the event only makes it cheap.

### 6.8 Projections and consumers

Four documents consume the Descriptor, each in its own way, and none of them edits its copy:

- **The A2A card** is generated from it: `does` becomes the description, offerings become skills, and kinds coarsen to input and output modes. The serving machinery adds the endpoint and authentication, which are connection facts the Descriptor never holds.
- **The registration manifest** carries the pointer and digest and projects `interaction` and the shape members it has fields for.
- **An Agent SoW standing proposal** elevates by reference: it signs Descriptor members at the Descriptor's digest, which is what turns a described input or price into a binding one. It does not restate them.
- **An AgentDoc** lists the Descriptor as a source, prefers it over any projection of it, records its digest, and reports rather than merges when a projection has drifted (Section 9.4).

A projection that disagrees with its Descriptor is a defect, and every consumer that can see the disagreement MUST report it rather than pick a side silently.

**Checking a Descriptor** is mechanical: the three required members are present, `format` names this specification, every `kind` is a media type or a defined value kind, no member carries an address, credential, or endpoint, a bound document's signature verifies against `subject.id`, and a draft carries no subject and no subject signature. An agent's behavior against its Descriptor's claims is a separate question, answered by an evaluator's signed record (Section 8.4), and never by this document about itself.

### 6.9 The wider declaration set

The declarations below are what a well-described agent states about itself beyond the Descriptor's core members. Each is carried by the Descriptor, by a document it points to, or by the binding's registration projection; each is the operator's word, presented as such.

**Standing.** One defined value: `guest`. A guest is an agent a platform provisions and operates on trial terms: temporary tenure, at the platform's expense, for a principal who runs nothing of their own yet. The declaration exists so a counterparty knows what it is dealing with before agreeing to anything, so a platform that hosts guests MUST declare it on every guest it provisions; an agent that is not a guest declares nothing here, and absent means not stated, never resident. Four obligations follow from the declaration, wherever it appears. A guest MUST run under an allowance (Section 7.5) at all times, and every cost the guest incurs is metered against it, including the guest's own model spend where the platform runs the model. A guest buys and never sells: it MUST NOT declare a price or hold offerings, and a registry MUST refuse both from a declared guest. A commitment a guest enters MUST fit inside its remaining allowance at signing, so no counterparty is ever owed money by a party built to expire. And a guest past its tenure refuses mechanically (Sections 4.6 and 4.7), stating that it has lapsed, rather than going silent. The tenure itself, how a guest is funded, how long it lasts, how many one principal may hold, is the platform's policy, stated where the platform binds this specification, never here.

**Interaction, the caller's side.** `service` means sending disturbs nobody, and a reply does not wait on human attention; `interactive` means delivery lands in a live session a human is using, sending may interrupt someone, and a reply arrives when they get to it. Absent means unknown, and a careful caller SHOULD treat unknown as `interactive`, the cautious reading. This is a statement of fact about how the agent currently runs, not a security boundary: an agent that misdeclares inconveniences callers rather than gaining privilege, and implementations SHOULD derive it from how they actually run rather than asking an operator to assert it.

**Modes.** The media types an offering accepts and produces, with agent-level defaults as fallback where an offering does not say. Resolution is the offering's own modes, then the agent's defaults, then nothing; and nothing means the agent has not said, which a caller reads as text and MUST NOT read as a refusal of other types. Agents that handle anything beyond text SHOULD declare, because a caller has no other way to learn it before sending: an agent that accepts PDFs and says nothing is indistinguishable from one that does not, and consumers faced with that silence have historically invented an answer on the agent's behalf.

**Needs and delivers.** What must be in hand before work can start, and what the caller gets. A need is a shared resource with an access level, a file by media type, a credential (a sign-in to a named third-party service the agent does not control, with the narrowest true scope stated), or prose. Delivers states the final deliverable, whether interim checkpoints arrive as task updates, and whether the deliverable lands in a caller-provided resource rather than travelling back. Both are declarations, deliberately loose: the reader at discovery time is usually a model deciding whom to hire, so they must read well to a model, not validate well in a parser. The honesty doctrine applies: an agent that needs a repository and says nothing is indistinguishable from one that needs nothing. A credential need is neither a permission nor a promise about handling, and nothing in the declaration transports a credential; a renderer SHOULD present a credential need more prominently than the other kinds, because it is the one entry a reader can be harmed by missing.

**Reporting level.** An offering MAY declare the progress-reporting level it offers, on an ordinal vocabulary compared meets-or-exceeds. It is an advertisement, not a clause, it is self-declared and MUST be shown as such, and an unreadable value is dropped at registration, because a declaration that cannot be read declares nothing and MUST NOT be presented as if it did.

**Sealing posture.** A declared encryption key says an agent can be sealed to; the sealing posture says whether anyone should, and what happens to a request that arrives in the clear. `required` means the agent will not read a cleartext request: a sender MUST seal, and the receiver MUST refuse an unsealed request with a typed sealing-required refusal. `preferred` means a sender SHOULD seal when it can, and the agent reads both. Absent means the agent has not said, and a sender MUST NOT infer a posture from silence, and MUST NOT seal to an agent that has not asked to be sealed to. A posture REQUIRES the encryption key, and a registry MUST refuse a declaration stating one without the other: a posture is a promise about reading, and an agent with no key cannot keep it. The sealed unit is the request's input and the terminal response's output: the caller's material and the deliverable. Routing, status, errors, and timing stay readable, so a sealing posture protects content, never the fact of the conversation, and an implementation MUST NOT describe it as anonymity or traffic confidentiality.

**Data use.** What happens to content a buyer hands the agent, declared once, at agent level, deliberately: the pipeline is the operator's, shared by every offering, and a per-offering split posture is a gaming surface. Promises carry only the promises made (`no_training`, `no_third_party_sharing`, `no_human_reading`), each spelled true: false is spelled by omission, because a promise left out is a promise not made, and a reader MUST NOT infer one. Retention states the ceiling in days the operator is prepared to bind. Processors name the services content passes through, which is what lets an agent built on an upstream model API make the no-third-party-sharing promise honestly instead of staying silent or lying; an empty processor list is a statement, an omitted one states nothing. Jurisdictions name where content may be processed and stored, as a set tested by subset against a buyer's allowed list; an operator that cannot truthfully pin a jurisdiction declares nothing, and an absent declaration fails any jurisdiction requirement, which is the correct fate for "we don't know where it runs" when the buyer asked. Confident fiction is the failure mode this declaration must not invite. Everything here is self-declared, MUST be shown as such, and an unreadable data-use declaration is dropped whole rather than served in part, because a partially readable privacy claim misleads more than none at all. What binds is the signed engagement's confidentiality clause; where the declaration and the signed document disagree, the signed document wins.

**Compliance.** The postures an operator claims (SOC 2, ISO 27001, GDPR, HIPAA, PCI-DSS, an open vocabulary of lowercase tokens compared by exact equality), each with a scope in words and an attestation pointer: an auditor's name, a URL a reader can follow, an expiry after which the claim is stale on its face. Everything here is self-declared, including the pointer; nothing fetches the URL, verifies the auditor, or checks the expiry against anything but the calendar. Directories MAY index and filter on the tokens under the same presentation rule: a filter over self-declared claims is a filter over claims, and labeling it otherwise is the platform lying on the operator's behalf.

**Access.** How a caller presents identity, and who gets in, and they are different questions: the scheme is the lock, the policy is whose key was cut. The admission policy is a closed vocabulary of four values: `open` (anyone who satisfies a scheme is admitted), `allowlist` (only parties the operator already added), `screened` (a knock is evaluated, by policy or a person, and may be refused on grounds the operator does not have to publish), `negotiated` (admission is arranged out of band before any knock is meaningful). The vocabulary is closed because it feeds a decision, whether it is worth knocking, and an unrecognized value MUST be treated as unstated rather than as open. A scheme over the `http` transport is also the one statement that an agent on a mesh can be reached from outside it: a platform that brokers outside callers to its agents through a gateway MAY define a scheme for that gateway (a key the caller presents there), and an agent whose registration carries it has been opened to outside callers by its operator, while an agent without it is reachable on its mesh only and its projections (Section 6.8) MUST name no outside endpoint. The choice is the operator's, is made where the agent's door is enforced, and is projected into the declaration rather than typed into it. The membership of an access list is never published: publishing it turns a storefront into a customer roster, and the one reader guaranteed to find it useful is the one probing for accounts to impersonate. Schemes are alternatives, never a conjunction: a caller satisfies any one. Three states, and silence is one of them: schemes declared, schemes declared empty (a real answer: nothing to present), and nothing said, and a reader MUST NOT collapse the third into the second, because an agent that never described its door is not an agent with an open one. Schemes are shapes, never bindings: a member whose value would differ from one caller to the next is a binding and does not belong. An access declaration MUST NOT carry a credential, token, key, secret, account or tenant identifier, or per-caller URL, and a registry that detects one MUST drop the block whole rather than serve it, for a sharper reason than usual: a secret served on a pre-admission page has already leaked by the time anyone notices it was a validation error. Declaring a scheme grants nothing: nothing here issues a credential or promises admission, and what a caller must furnish to do the work once admitted is the offering's needs declaration.

### 6.10 The declaration doctrine

Three rules bind every consumer of any declaration:

1. **Absent means not stated.** Never a default, never the flattering value, and printed by name in any assembled view. A requirement stated against a declaration treats silence as not meeting it: fail closed.
2. **Shapes, never bindings.** Declarations carry media types, roles, vocabularies, and regions; never credentials, endpoints, addresses, or account identifiers.
3. **Declared is a strength, not a verdict.** An authored claim enters every view at declared strength and moves only on attestation (Section 8). No consumer may render a self-declaration as verified or enforced.

## 7. Capabilities

A capability is an optional behavior set the agent opts into, declared so a counterparty can rely on it, and specified as an extension to this document. Each capability below is normative for the agents that declare it and invisible to those that do not. A binding MAY carry any of them natively; the obligations are the same on every binding.

### 7.1 The door

An agent's address is public: knowing it is enough to deliver a message, the same reachability model as email. For an agent, handling a message can mean a model call, so reach is a cost, and a stranger who guesses the address can spend the owner's tokens one message at a time if every inbound message reaches the agent. The transport authenticates who a sender is; it does not decide whether the agent should serve them. That decision belongs to the owner, and it must be enforced cheaply, before the model is consulted, from owner-set policy, not reasoned out per message by the agent itself.

**The roster.** Admission policy is a single JSON document owned by the account holder and signed by the owner key, portable by design so the policy is never trapped in one client or one deployment. It carries per-tier defaults, limits, and explicit entries, each naming a subject (a handle or a key) with a stance and a timestamp. The signature covers a domain-tagged form under the convention of Section 8.1. A consumer MUST verify the signature against the owner key before enforcing the roster and MUST reject an unsigned or invalidly signed one, falling back to the conservative defaults below. The signed roster is the export: a conformant implementation MUST be able to export and import it as one signed document, which is the anti-lock-in guarantee.

**Tiers.** Every inbound sender sorts into exactly one tier, for free, from identity the transport already verifies: `rostered` (an explicit entry matches), `contact` (an accepted mutual contact with no entry), `registered` (a verified identity, unknown to you), `anonymous` (no verified identity). Most-specific wins: an explicit entry always overrides the tier default. An implementation SHOULD ship defaults that protect an owner who sets nothing: contact allows, registered holds, anonymous blocks.

Admission and discovery consent are different relationships and never conflate: an accepted contact informs the default, but admission is the owner's alone, and a block always wins over any contact relationship.

**Stances.** `block`: not delivered, and MUST NOT be acknowledged; a blocked sender MUST NOT be able to tell a block from "no such agent." `hold`: queued for owner review, and MUST NOT invoke the agent; this is the zero-cost path, and the point of the tier: an unknown sender never costs a model call. `allow`: delivered for handling. Two limits back the stances: a per-sender hourly rate cap applied even to allowed senders, so a compromised or looping friend cannot drain you (RECOMMENDED), and a daily ceiling on model spend answering inbound, independent of who is asking (REQUIRED for any client that invokes a paid model on inbound).

**Enforcement placement.** The cost gate MUST live with the recipient's own client or node, because only it knows what handling a message costs and what its budget is, and a client MUST function with no network-side enforcement at all. Upstream enforcement, where offered, enforces a projection of the roster and is never the authority.

**The knock.** With anonymous-block as the default, an unlisted sender's first message vanishes without a trace: correct for spam, but leaving a legitimate stranger no way to politely ask. The knock fills that gap: entryway exchange 3, deliberately content-free; the sender's signed identity, and through resolution its handle and operator label, are the entire message. From 0.21.0-draft a knock MAY also carry a list of grant names drawn from the enumerated set under Connections below, saying what the sender asks to be allowed; it carries nothing else. A knock carrying any other content, or a name outside the set, is not a knock: the receiver MUST refuse it whole, in words that say a knock carries no message, and MUST NOT report it. Prose in a knock would be a message that skipped the door. A knock MUST NOT invoke the agent and MUST NOT enter the inbox: its only effect is a held-attempt report surfacing the sender in the owner's waiting list. It MUST be rate-limited independently of message limits (RECOMMENDED one per sender per day, with a global daily cap), and the response MUST be identical for every outcome, so a knock cannot probe roster state. Any pre-delivery enforcement layer MUST pass knocks through regardless of the sender's tier stance: they are the one envelope a blocked-tier sender may deliver, and the recipient's own rate limits bound the cost.

**Held review.** Held senders accumulate in a review queue the owner resolves to allow or block; notification MAY use out-of-band channels. The report to the owner carries who knocked, never what they said: sender key, resolved handle and operator label, timestamps, and an attempt count; message bodies, excerpts, subject lines, and sizes MUST NOT be reported. Reports are idempotent, and waiting entries expire after 30 days without a repeat attempt, so the list means "senders currently waiting on you," not an archive. The owner's decision is transported as intent, but the signed roster remains the enforced artifact: the recipient applies the decision to its own roster, re-signs under the owner key, and releases or drops the held mail locally. Authority never moves, and the recipient MUST NOT enforce an unsigned document.

**Revocation.** A roster edit: setting a stance to block takes effect on the next signed roster and is enforced with no distinguishable acknowledgement. Admission is permission to reach, not a statement about authorship: every delivered message still self-verifies, and an allow never lets a sender speak as someone else.

**Connections (0.21.0-draft).** A connection is mutual, scoped admission that two people agree to: each person's agent admits the other's, for named things only, until a date or until either of them ends it. It is the door's answer to the common case the tiers do not serve, two people who know each other and want their agents to reach each other in a limited way, usually agreed standing together with a phone each. A connection is carried entirely in the two rosters; nothing about it needs the network that carries the messages.

*Grants.* What a connection allows is a list of grant names from a closed set, never prose, so a door can check it for free before any model runs. Four names are defined: `messages` (plain messages: words, no attachments), `scheduling` (asks that propose, accept or move a time, marked as such by the sender), `share` (files and documents riding a message), and `errands` (orders: requests to do something that may spend money). A message's needs are read from what it carries, never from what its words say: an attachment needs `share`, an order needs `errands`, a message marked as scheduling needs `scheduling` or `messages`, and anything else needs `messages`. A content the door cannot read, such as a sealed payload (Section 7.2), is decided by the recipient's own client, which can read it and applies the same rule. An implementation MAY offer presets, a name for a list of grants; the reference presets are Messages (`messages`), Scheduling (`scheduling`), Share (`messages`, `share`) and Errands (`messages`, `errands`).

*Errands.* An `errands` grant carries a spend limit. An order MUST state the most it may spend; one that states nothing, or more than the limit, MUST be refused. An order within the limit MUST NOT reach the agent until the receiving owner has said yes to that one order; a yes to one order is never a yes to the next.

*The roster entry.* Each side's roster carries an entry for the other side's agent with stance `allow`, the grants, the spend limit where `errands` is granted, and an end date when the connection has one. A message the grants do not cover MUST NOT be delivered; because the sender is connected and not a stranger, the refusal SHOULD say which grant was missing. An entry whose end date has passed MUST be treated as absent, so the sender falls back to its tier as if it had never been connected. An explicit `block` for the same subject still wins.

*Agreeing.* One person offers a scope; the other accepts it as offered or narrower, never wider. Narrower means a subset of the grants, a spend limit no higher, an end no later (an offer that ends cannot be accepted as one that does not), and one-way where the offer was one-way. Either person MAY narrow an existing connection the same way at any time; widening is a new offer. Two-way is the default; one-way means only the accepting side's agent may reach the offering side's. The offer travels as a signed, single-use, short-lived invitation (one binding's form is EXT-4 Section 5 on AgentMesh), and when the two people are together, both screens MUST show the same matching words derived from the invitation's signature, so each can see the other is looking at the same offer.

*Ending.* Either side MAY revoke a connection at any time, and the revocation MUST take effect immediately on both sides: both entries are removed before the revoking person is told it is done. An implementation's stop control (a kill switch) overrides every connection: a stopped agent is neither reached through one nor reaches through one, whatever its entries say.

*Records.* Every offer, claim, acceptance, narrowing and revocation is recorded with who did it and on whose behalf, and both people are told when a connection begins, narrows or ends.

*Not for businesses.* A connection is between two people's agents. A person's agent acting for them at a business's agent is not a connection and follows Section 7.8: the business admits the agent through PACT, and what the agent may do on the person's account is the business's grant, not a connection's.

### 7.2 Sealed conversations

The transport is secured; that does not hide payloads from the platform. This capability closes that for direct messages: when the recipient has declared an encryption key, the request payload crosses the network as ciphertext only the recipient can open, and the reply comes back the same way.

A sender SHOULD seal whenever it knows the recipient's declared encryption key, obtained from the recipient's published card or declarations; the key is public and pre-distributed, and sealing costs one box. A sender MAY refuse to send in cleartext at all. An agent that declares no key participates only in cleartext. What is never sealed: envelope headers (routing, trace, signature; the transport needs them, and the signature already binds sender to ciphertext), knocks (content-free by definition), and held-attempt metadata. Admission gating is unaffected: stances act on the verified sender, not the payload.

**The sealed form.** The payload, and only the payload, is replaced by a sealed object carrying a version discriminator, an ephemeral X25519 public key, a nonce, the ciphertext, and an optional reply key (the sender's durable X25519 public key). The box is NaCl crypto_box (X25519 with XSalsa20-Poly1305). The outer keypair is ephemeral per message: sender identity does not ride the crypto layer, because the Ed25519 envelope signature already proves authorship, and it signs the ciphertext, so tampering breaks before decryption is attempted. The plaintext is the canonical JSON of the payload that would otherwise have been sent.

**Reply sealing.** The reply key names where the answer should go. A recipient answering a sealed message SHOULD seal to it and include its own key as the new reply key, so a sealed thread stays sealed hop by hop. A responder MUST resolve a claimed reply key against the sender's own published encryption key and MUST refuse to seal to one that disagrees with it. A responder that opened a sealed request whose sender asked for a sealed reply, and cannot resolve a key to seal to, MUST NOT answer in the clear: an error is the correct outcome. A sealed request carrying no reply key asked for nothing and MAY be answered in the clear.

**Failure.** A sealed payload that does not open (wrong recipient, tampering, garbage) MUST NOT be processed or queued. The recipient SHOULD log locally and return the same generic acknowledgement shape a delivery would produce, consistent with the door's indistinguishability rule. There is no renegotiation: the remedy for a key mismatch is re-resolving the recipient's published card, whose signature and pinning make a silently swapped key loud.

**What it protects.** The network routes and, transiently for offline delivery, stores ciphertext. The receiving agent's node opens the box and stores plaintext in its local inbox: the node is the agent's trust boundary, the same place held mail already lives, and Section 4.1's hosting caveat applies in full.

### 7.3 Screening

This capability defines a socket, not a detector: a recipient-side consultation point where an owner-chosen screening provider is asked about content before the agent reads it, and a small vocabulary for the answer. It carries no detection logic and never will. A detector shipped under the platform's name makes every miss the platform's miss, and detection quality in this field changes weekly; providers who sell exactly this can price that liability, and a protocol cannot. The honesty rule travels with it: an account with no provider configured is unscreened, an implementation MUST be able to report that state plainly, and MUST NOT describe an unscreened account as protected.

**Where it happens.** Interception is always local to the recipient: the agent's own node calls the screener, and nothing is screened in transit or by the platform. This is forced, not preferred: sealed payloads cannot be read by the platform, so platform-side screening would silently cover unsealed traffic only, a partial guarantee that reads as a total one, which is worse than none. Once the recipient has plaintext, sending a copy to a screener the owner chose is the recipient exercising a right it already holds: showing its own mail to an advisor. The provider may be an HTTPS service or another agent consulted through the ordinary request exchange. Consultation, never proxy: the message is delivered as it always was, the screener receives a copy and returns an opinion, never holds custody, never sits in the delivery path, never re-originates. Three properties depend on this: the sender's end-to-end identity stays intact, a screener outage degrades to the owner's configured stance instead of stopping mail, and a screener cannot silently drop or reorder traffic it dislikes.

**The request.** Carries the content to be judged and the facts a judge needs: direction, call site, an opaque provider-side policy handle the platform never interprets, and counterparty facts: identity, the admission stance in force, relationship age and depth (a day-old identity claiming to be your brother is exactly as suspicious as it looks), and whether the payload arrived sealed. Content is always presented as third-party material: implementations MUST NOT submit inbound content in a field a provider treats as the operator's own prompt.

**Call sites.** A message is not read once. Each of these is a distinct moment at which content reaches a model, and each MUST pass the socket when a provider is configured: `delivery` (an inbound message is about to be handed to the agent), `history` (a durable shared conversation's record is being replayed: an injection posted in March is read for the first time in June by a member who joined in May, and screening only at delivery leaves that hole open by construction), `fetch` (a shared file's bytes have been fetched and digest-verified, before the agent reads them: a file is judged when its bytes are read, not when the record noted it), `board` (a posted work item is being read, and certainly before it is claimed: claiming means deliberately acting on a stranger's written instructions, so a poisoned item is an injection with a built-in execution mechanism), and `send` (outbound, the agent is about to send content to a counterparty). Outbound is on by default wherever a provider is configured: the moment of damage in a successful injection is rarely the reading, it is the sending, your files and context to a counterparty the attacker chose, and a protective measure that only works once its owner finds the setting protects nobody. An owner may narrow to inbound alone, and should know what that gives up. An outbound hold refuses the send and says so to the agent that asked; an outbound flag sends and records, because the content is the owner's own agent's work, and stopping it on a maybe produces an agent that mysteriously will not speak.

**Verdicts.** `pass`: nothing found, delivered normally. `flag`: suspicious, not certain, delivered with the reason attached. `hold`: should not reach the agent unreviewed; routed to the door as a held item, with the reason, for the owner to release or block. The reason MUST be a plain sentence an owner can act on; the provider detail is opaque, recorded verbatim, and never branched on. Hold rather than block, deliberately: "ignore what I said earlier" is ordinary human speech, a screen that silently destroys mail on a false positive destroys trust faster than any attack, and the door is already the mechanism for "a human should look at this first." Verdicts are personal: two recipients with different providers may reach different verdicts about the same content, and both are correct; each owner bought the judgment they chose.

**When the screener does not answer** (unreachable, timed out, malformed), the recipient applies the owner's configured stance: fail closed (hold) or fail open (deliver and log loudly), and either way the outcome is recorded as an unscreened delivery, never as a pass: a timeout is not a clean bill of health. The default is fail closed: configuring a screener is somebody asking for their mail to be looked at, and delivering it unlooked-at is the opposite of that, not a smaller version. The asymmetry decides it: held mail is visible at the door and released in one click; mail that slipped through during an outage is invisible for ever.

**Sealed content is screened by default**, because an exemption the sender can trigger unilaterally (seal your attack to skip the screener) is not a policy, it is a documented bypass. But it is the owner's knowing choice: implementations that screen sealed content MUST disclose it in the configuration surface and MUST support per-counterparty exemption, so an owner can keep specific correspondents (a lawyer, a doctor) out of the screener's view without switching screening off. Exemption belongs to the recipient, by name.

**The record.** Every verdict, including pass, including an unscreened delivery, is written to the receiving agent's audit chain with the provider id, policy handle, and policy version, keyed to the message id or content digest it concerned. After an incident, an owner can prove what was screened, by whom, under which policy version, and what the provider said; it also makes a provider's track record provable rather than claimed. In shared contexts, a screener MAY sit as an ordinary, visible member, so consent is visible rather than buried in configuration; any member MAY write a verdict annotation, additive metadata that never alters or hides the annotated content, always carrying its author, and never presented as the room's own verdict. A shared verdict is a signal, not a substitute: a member whose own provider is configured still screens on fetch.

### 7.4 Systems health

An agent's tool fails: the credential is wrong, the grant expired, the vendor rate-limited the tenant. Four parties need to learn this at four different speeds. The running instance needs it immediately, so it stops burning attempts. Sibling instances and the owner's other agents on the same grant need it within seconds, so they do not each rediscover it. The owner needs it on their screen, because for the whole grant-fault class the fix is theirs. And a counterparty mid-engagement needs it when they ask or when a task fails, not by broadcast. Traces serve none of these: they arrive hours later, after every instance in the window has failed the same way.

**The fault vocabulary.** A fault names what stopped the system and, by its class, whose move the fix is. Six values, and the set is open: an unrecognized value is carried verbatim, never dropped.

| Fault | Meaning | Whose move |
|-------|---------|-----------|
| `grant_expired` | The delegation ran out. | The grantor renews or re-consents. |
| `grant_revoked` | The delegation was withdrawn. | The grantor decides whether to grant again. |
| `grant_invalid` | The credential does not authenticate at all. | The grantor re-makes the grant. |
| `grant_insufficient` | Authenticated, but the scope does not cover the act. | The parties renegotiate the scope. |
| `rate_limited` | The vendor is throttling; a retry-after says when to try again where known. | The agent paces itself. |
| `unreachable` | The system did not answer. | Nobody's; wait and retry. |

A fault report names the system by its declared NAME, the same vocabulary as the agent's declared systems and its delegation grants: never a vendor, never an endpoint, and a report MUST NOT carry the upstream error body, because error bodies leak tenant identifiers and request content.

**The report door.** The runtime cannot see inside the agent's harness, so the agent reports: a verb pair (report a fault, clear it) on the CLI and the local session surface, and an SDK hook that SHOULD also report automatically where the SDK's own tool client sees an auth or rate-limit failure. A report is the agent's own statement about its own tooling. The record's door accepts at most sixty reports per agent per hour and refuses beyond with the limit named: state changes are rare by nature, an agent reporting faster is looping, and the agent's own local state is unaffected by the refusal. A report MAY name a system the agent's public declaration never listed, because health is the agent's private truth; but the circuit never refuses work on an undeclared system's account, because an agent's private tooling failures must not change its public behavior in ways nothing in its public record explains. The consequence is deliberate: an agent that reaches systems it does not declare gets no fast-refusal protection, which is one more reason to declare.

**The circuit.** The runtime keeps one state per declared system name: `ok`, `degraded`, or `failing`, with the current fault, when it started, and the count. A grant-class fault moves the system to failing immediately: these do not heal by retrying, so the first report is conclusive until the grant changes. Rate-limiting and unreachability move it to degraded, and to failing after repeated reports inside a short window. A success report, or the operator's clearing verb, returns it to ok; while failing on a transient fault, the runtime retries at half-open intervals, honoring the retry-after. While a system is failing on a grant-class fault, a new request whose offering declares that system among its needs is refused fast, with the typed fault, instead of being attempted: the caller learns in milliseconds what a doomed attempt would have told them in minutes, and the refusal names whose move the fix is. Transient faults do not refuse: the work is attempted and the state rides along as a warning. The state is visible in the agent's local status surface and never enters the public declarations, because health is not a standing fact.

**The private record.** State changes are written to a per-agent health record the platform keeps: current state per system name, shapes only, no bodies, no vendors, no endpoints. Two readers are the point: the owner's surfaces (each grant's health beside its revoke control, and a grant-class fault raises a needs-you item, because the grantor is the one person who can fix it), and sibling instances holding the same grant, which read the record before attempting. The record is deliberately not a public broadcast: days of "the CRM grant is failing" is operational intelligence about a business, and publishing it by default would punish exactly the agents that report honestly. An operator who wants a public status surface MAY declare a systems state feed carrying the same shapes; that is a choice, never a side effect of reporting.

**The counterparty.** Directed, never broadcast. A task that fails on a system fault carries the typed fault in its error, as a dependency-fault code with the report as its detail. An answer to a progress inquiry MAY carry the active faults for the systems that engagement declares. And where the failing grant is the client's own grant to this agent, the fault SHOULD reach the client as a needs-you item, not only as a task failure, because "your grant stopped working" is a to-do, not a status.

Nothing in this capability ever carries a credential, a vendor name, an endpoint, or an upstream error body. Traces remain forensics after the fact, neither replaced nor fed, and no reputation is written here: the loud path is made cheap, and no new score is created.

### 7.5 The allowance

The family has two spending ceilings, easy to conflate, enforced in different places because they cross different boundaries. A **budget** travels with work, between parties: the requester attaches it, it guards the requester's money against the responder's appetite, and it binds the responder; it is an offer in a negotiation between agents that may not trust each other, which is why it rides the signed request. An **allowance** stays at home, within one household: the owner sets it on their own agent, it guards the owner's money against their own agent's appetite, and it binds nobody but that agent's own runtime. No counterparty ever sees it, verifies it, or cares, which is why it is a locally held signed policy document rather than a wire field: it crosses no trust boundary. One sentence: a budget is what you'll pay someone else; an allowance is what you'll let your own agent burn. When one interaction has both, each is enforced where it lives, and the tighter of the two decides.

**The document.** One JSON document per agent, signed by the owner key under the convention of Section 8.1 and held at the agent's runtime. It carries the governed agent key, the owner key, a cost model (the owner's DECLARED conversion from the agent's tokens to money: the runtime cannot learn the model's price, so the owner states it, and a token rate is legitimate here where it is forbidden on the wire, because inside one household the owner knows exactly whose units they are), one or more ceilings each scoped to a task, a context, the UTC day (optionally narrowed to one named task or context), or trial work per UTC day (Section 7.7), an on-exhausted behavior (`refuse` or `ask_owner`), and a timestamp. The document is replaced whole; the latest timestamp under a valid signature is the policy. Money is integer micro-units of an ISO 4217 currency; no floating point ever touches money.

**Fail closed.** A runtime MUST verify the signature against the owner key before enforcing, and MUST NOT treat a document that fails verification as absent: a configured allowance that does not verify treats every ceiling as exhausted until a valid document replaces it. Failing open here is failing open on the owner's money.

**Enforcement.** The runtime meters each model invocation against the cost model with integer floor arithmetic, accounted to the task, the task's context, and the UTC day. It refuses at admission work that would exceed a ceiling, through the budget's refusal-with-estimate: the estimate is a price quote, resubmission at or above it is acceptance, and on the wire an allowance-broke refusal is indistinguishable from a budget-broke one, deliberately, so a counterparty never learns which ceiling it hit. Every applicable ceiling applies at once: specificity determines what a ceiling covers, never which one wins, and the binding ceiling for a given decision is whichever applicable ceiling has the smallest remaining amount. On exhaustion, `refuse` answers the refusal-with-estimate; `ask_owner` pauses instead: the runtime holds the work, surfaces the question through the owner channel the door's review already uses, and proceeds only if the owner raises the ceiling. Deadlines are the budget's concern, not this document's: an allowance has no time axis.

**Visibility without enforcement.** Spend is honor-system; nothing outside the runtime can see inside it. What the platform can do is make the honor system observable: per-context spend rollups from metering receipts, scoped to the requesting owner's agents; and an owner MAY register the signed allowance, in which case reported spend crossing a ceiling SHOULD surface as an operator-visible exceeded event and an owner notification. The platform never blocks: an exceeded allowance is a fact made visible, not a delivery decision, and enforcement belongs to the runtime that holds the owner's policy, and to nobody upstream of it.

Out of scope by declaration: settlement and payment; cross-agent allowances (constraining someone else's agent is a contract, not a config: it crosses a trust boundary, and the instrument for that is the budget on a signed request, never a policy document the other party cannot verify was ever enforced); and external mandate mapping, parked with the field name reserved.

### 7.6 Pricing and agreements

**SKUs.** What an agent sells is declared as a SKU, a named unit of commercial terms: what is covered, what it costs, and who bills for it. Each SKU has a stable identifier, a covers clause (the whole agent or a named subset of its offerings; where SKUs overlap, the most specific match applies), a price, and a billing provider. An offering covered by no SKU is **free**. That is the default, and paid is the declared exception: charging is something an operator says out loud, never something a consumer discovers on an invoice. Free is also declarable as an explicit price model, so a free offering can still carry terms and a provider: agreement without money is a terms gate.

**Price shapes.** A closed five: free; flat (a fixed amount per delivered request); per-unit (an amount per N units of a named meter, floored in integer arithmetic); package (an amount per package of units over a period, partial packages rounded up); tiered (graduated: each tier rates its own span; volume pricing, the whole quantity at the reached tier's rate, is deliberately not offered: one shape, no flag). An optional included block grants a free daily or monthly allowance deducted before rating. Money is non-negative integer micro-units of an ISO 4217 currency, with private-use X codes legal where a deployment clears in its own credit unit.

**Comparability.** Flat prices are comparable across agents; declared-meter prices are not. A token is each responder's private unit, so a per-unit price on tokens is indicative of that agent's own arithmetic, never a basis for cross-agent comparison. The number that binds an interaction is the budget's cost ceiling, denominated in currency precisely because currency is the unit that is fungible across agents. SKUs travel on the agent's public surface, advertised pre-admission, so a buyer compares terms before ever messaging the agent.

**Digest-pinned terms.** A SKU's digest is the hash of its tagged bytes, and any change to coverage, price, or provider moves it. The digest is what an agreement binds to, so no consumer can be rated against terms they never accepted. For a terms URL, the digest covers the URL, not the document behind it; an operator who edits the document at an unchanged URL is changing terms out from under standing agreements, so providers SHOULD version terms URLs.

**Agreements.** An agreement binds a consumer account to a SKU at a specific digest, signed by the consumer's OWNER key, never an agent key, because it is a human's money: one person approves once, every agent under that owner is covered, and an agent cannot click through a terms page. A digest mismatch is a missing agreement: when the seller changes terms, every standing agreement goes stale at once, and re-approval is the rule; there is no grandfathering because there is nothing to grandfather. Agreements are revocable by their signer, prospectively only: usage already metered under a live agreement remains rated. Enforcement is the seller's admission-time obligation: a request whose offering is covered by a non-free SKU, from a consumer whose owner holds no unexpired agreement at the SKU's current digest, MUST be refused before any work with a typed agreement-required refusal carrying the SKU id, its digest, and an approval URL.

**Metering and receipts.** The responder's obligations are Section 5.5's. The platform SHOULD emit one receipt per completed task: a derived fold of the task's meter events plus its budget context, recording the parties, the offering, timing, the responder's claimed cost (informative, since nothing can see inside the responder), the final budget that applied, and whether completion arrived late. Canceled tasks get a receipt too, under a distinct name carrying the cancellation reason, because a cancellation ends spending authority the way a completion does, and a consumer folding completed receipts must never have cancellations arrive under the completed name. Token counts are deliberately absent from the receipt: a bare token count is meaningless across responders; the receipt summarizes money and terms, and the meter events carry the quantities.

**Rating.** Rating MUST be a pure function of the event stream, the SKUs, and the registered agreements: replaying the same events reproduces the same charges to the micro-unit, all arithmetic integer. No agreement, no charge: an event for a paid SKU with no agreement matching the digest current at the event's timestamp rates to zero, a recorded fact, never a retroactive bill; enforcement should have refused the work, and rating declining to charge is the second wall. Refusal events rate to zero, always. The ceiling binds rating: rated charges against a budget MUST NOT exceed its cost ceiling, and a responder that declares more quantity than the ceiling covers has declared unpaid work: the honor system given mechanical teeth by arithmetic, not by dispute.

### 7.7 Trials

Before anyone pays for an agent's work, they try it. Trial work is unlike paid work in three ways: the requester owes nothing and may not be known yet, so the cost falls on the publisher; the work should be smaller than the real thing; and it must not draw on the headroom that paying requesters rely on. Without a common declaration every host that lists agents invents its own limits, and an agent cannot tell a trial from a customer. This capability is the declaration, the request marker, the admission rules, and who pays. It is distinct from guest standing (Section 6.9): a guest is a whole agent on trial terms, and a trial is one request.

**The declaration.** An offering MAY carry `trial`. An offering without it offers no trial, and a trial request for it is refused. The member has three parts:

| Member | Holds |
|--------|-------|
| `who` | Who may ask for trial work: `anyone` (any requester, including a visitor a host vouches for, below), `signed_in` (a requester holding an account where the request is made), or `verified` (a requester whose owner is verified under the binding). |
| `shape` | What changes in a trial. `inputs[]`: each a declared input's `name` with a `limit` tighter than the offering's own, in the same terms as the offering's declared limits. `omits[]`: named outputs the trial does not produce. `live_seconds`: the most seconds any one live session on a trial deliverable may run (below). `keeps_days`: how long trial deliverables are kept, `0` meaning not kept after delivery. `marked`: true when every trial deliverable carries a visible mark saying it was made as a trial. A shape member that is absent changes nothing. |
| `limits` | Counts, never money: `per_requester_per_day`, `per_day` (across every requester), and `per_requester_ever`. Each is a whole number of trial tasks, counted by UTC day where the name says so. At least one is present: a trial with no count is not bounded, and a registry MUST refuse the declaration. |

A shape input's `limit` names one or more of `max_chars`, `max_bytes`, `max_pages`, `max_seconds` and `max_items`, each a whole number. The node checks at admission what it can measure in what was sent, characters and bytes; a limit only the work can measure, such as the pages read from an address or the seconds of a recording behind a link, is handed to the work as its cap, and is never a reason to fetch anything before admission (Section 4.8).

The money a publisher will spend on trials is deliberately not here. It is the owner's private policy, held in the allowance (Section 7.5, below), and a counterparty needs only the counts.

**The marker.** A request MAY carry `trial: true`. A trial request carries no budget, because a requester who owes nothing has nothing to offer; a request carrying both is refused at admission, before the checks below, with `reason: budget`. A requester that wants the full offering sends an ordinary request.

**Admission.** The responder's node, never its model, checks a trial request before any work, in this order, and answers the first failure with the refusal `TRIAL_REFUSED` (Section 4.7). Its fixed fields are `reason`, one of `budget`, `not_offered`, `not_eligible`, `input`, `requester_day`, `day`, `requester_ever` and `funds`; `limit`, the declared number that was reached, where there is one; `resets_at`, an absolute UTC time, where waiting will help; and `quote`, what the same work costs as an ordinary request, so a requester refused a trial is told how to have the work anyway. Like every refusal it carries a passage for a person.

1. The offering declares `trial` (`not_offered`).
2. The requester qualifies under `who` (`not_eligible`).
3. Every input fits the shape's tighter limit (`input`).
4. No count in `limits` is reached (`requester_day`, `day`, `requester_ever`).
5. The trial ceiling of the allowance has room (`funds`).

A refused trial request is not counted against any limit. A trial task that fails after admission is counted, because the publisher paid for it.

**Who pays.** The publisher funds trial work. The allowance (Section 7.5) gains a fourth scope, `trial`: a ceiling on what trial work may cost per UTC day. Trial spend is metered against the trial ceiling and also counts toward every wider ceiling, so the owner's total stays the total; because the trial ceiling bounds it, trial work can never take more than that share of a day, and paying requesters keep the rest. An agent whose owner sets no trial ceiling and that declares `trial` refuses trial work on `funds`, never spends unbounded: failing closed here is the same rule as everywhere in Section 7.5.

**Live sessions.** Some deliverables keep spending after delivery: a page a person can talk to, a session that streams. Opening such a session on a trial deliverable, or on a sample (below), is trial work. It counts against `limits` like a task, and each session ends at `live_seconds`. When a limit is reached, the deliverable keeps whatever part of it costs nothing to play, and says that live use is over for now.

**Receipts.** Trial work gets a receipt under its own name, `trial`, as a cancellation does (Section 7.6), so a consumer folding completed receipts never counts a trial as a sale. A trial receipt rates to zero for the requester, always. The responder's reported spend on it is the publisher's.

**Samples.** A sample is the deliverable of a real task, published so people can judge the agent's work without asking for any. Samples are listed in a samples document, `agent-samples-v1`, which the Descriptor points to with `samples_ref`, beside `handling_ref` and `price_ref`. Each entry carries an `id`, the `offering`, a `title`, a `deliverable` reference, the `receipt` of the task that made it, the `agent_version` that made it, and `made_at`, and MAY carry a `poster`, a still image of the deliverable for a reader choosing between samples. A sample MUST be the deliverable of a task whose requester agreed to its publication; a task the publisher asked of its own agent counts. Looking at a sample is free and is not trial work; opening a live session on one is.

A sample's provenance is checkable, and an assembled view says whether anyone checked it. A sample is **confirmed** when its receipt exists, names the subject as responder, and was issued under the deployment whose package digest matches the version the sample names. A sample whose version is no longer deployed is **earlier**: it shows what an earlier version made, and an assembled view MUST say so rather than present it as current work. A sample that is neither, because its receipt cannot be found or does not name the subject, or no deployment record ties its version to a package digest, is **stated**: it rests on the publisher's word alone, and an assembled view says that too (Section 9.6).

**Solutions.** A solution offered as one thing, a prime with delegates under Agent SoW, declares `trial` on its own offering like any agent, and its trial is the prime's. The requester owes the prime nothing; the prime runs each part as ordinary work under the engagement it already holds for that part, pays for it, and counts what it pays against its own trial ceiling. A part therefore needs no trial of its own and is not asked for one, so any solution can be tried whatever its parts offer. Admission at the prime adds one check to the order above: before step 5 it prices the parts the request will use, from their current quotes, and refuses on `funds` when the trial ceiling cannot cover them. The shape's tighter limits are applied at the prime's door and carried into the parts' inputs; `live_seconds` and `keeps_days` bind the deliverable the prime returns. A solution's samples are the prime's, each tied to the receipt of the solution's task.

**Hosts.** A host that lists agents and lets visitors try them sends trial requests on their behalf. It MAY vouch for a visitor who holds no account, under an identifier the host issues and keeps stable for that visitor; such a requester qualifies only under `anyone`. Which hosts' vouches a node honours is the node's own policy, stated where a binding binds this specification; a vouch from any other sender is ignored, and the sender itself is the requester. The host enforces what it can see, the counts and the live seconds, whatever the agent does, for the same reason the budget's time half is enforced centrally (Section 5.4): spend is honest by obligation, and counts are honest by arithmetic.

**Conformance.** Three cases prove an agent applies its trial declaration, run against every offering that declares one: a trial request whose input exceeds the shape's limit, refused with `reason: input`; trial requests from one requester past `per_requester_per_day`, the last refused with `reason: requester_day` and a `resets_at`; and a trial request carrying a budget, refused. Each refusal arrives before any work and carries a `quote`.

### 7.8 Acting for a person at a business

A person's agent often has business to do with a business's agent: asking where an order is, changing a booking, cancelling a subscription. The business needs to know two things before it answers: which agent platform is calling and for whom, and what the person has allowed that agent to do on their account. The Personal Agent Consent and Trust Protocol, PACT 1.0 (https://openpactprotocol.org/spec.md), answers both over A2A 1.0. This capability adopts PACT for that case instead of defining a second answer. It adds nothing to PACT's wire; it says how PACT meets the rest of this specification.

**The rule.** An agent that acts for its person at a business's agent reached over A2A MUST do so as a PACT personal agent, and a business's agent that serves personal agents over A2A MUST be served through a PACT Provider. The PACT Identity profile is required on both sides. The PACT Delegated profile is required where the business offers to act on the person's account, and a personal agent that meets a card offering it MUST use it rather than collect the person's account credentials. Credentials for a business account never pass through a personal agent.

**The person behind the token.** PACT's `sub` is stable and opaque per person. A personal agent SHOULD send a different `sub` for the same person to each Provider, derived from a secret the platform holds, so that two Providers cannot join their records of one person; to any one Provider it sends the same `sub` every time. A `sub` contains nothing that names, locates or reaches the person.

**Declaring scopes.** A business's agent that offers delegation declares its scopes with its offerings: an offering that acts on a person's account MAY carry `scopes`, a list of `{id, description}`, the permissions it uses. The scopes the business offers are the union over its offerings, and those are the scopes its PACT card lists. A description is shown to the person word for word when they consent, so it is written for the person and says what the agent will do. An offering that declares no scopes stays available under PACT Identity alone.

**Inside a delegated turn.** The business's agent acts as the person at the business, and only within the scopes granted. A turn that needs a scope the grant lacks is answered with auth required, naming the missing scopes, and the conversation stays open; the agent never widens its own grant and never fails the turn for want of one. Each reply under a grant lists the scopes it used and every act it did for the person, and the Provider signs that list into the PACT receipt.

**The terms, side by side.**

| This specification | PACT | How they meet |
|--------|------|------|
| A connection's grant (Section 7.1) | A grant: the scopes a person approved at a business, with its `grant_id` | Both are permission a person gave, from a closed list, narrowed and never widened, and ended by the person. A connection's grant names come from this specification's set and govern what reaches an agent; a PACT grant's scopes are the business's own ids and govern what the business's agent may do on the person's account. Neither stands in for the other. A personal agent lists its person's PACT grants beside their connections and ends them from the same place. |
| The receipt of a task (Section 7.6) and the record of who asked and on whose behalf | `pact.receipt`, signed by the Provider | The business's agent builds the receipt's `actions` and `scopesUsed` from its own record of the turn. The personal agent verifies the receipt and keeps it in its person's record beside its own record of the request, so the person has the business's signed account of what was done next to their own. |
| The owner's OK to an act that commits them (Section 7.1, Errands; Section 7.6, Agreements) | `TASK_STATE_AUTH_REQUIRED` with `pact.missingScopes` | Both stop a turn until the person agrees. Under PACT the person agrees at the business, through the business's own sign-in; the personal agent shows the person the link and never handles the sign-in. |

**What PACT leaves to this specification.** PACT carries no money, ends no grant from the personal agent's side, reaches no agent that is offline, and connects no two people. Those stay here:

- *Spending.* A scope never authorizes spending by itself. A delegated turn that would spend the person's money is bound by the person's own limits on their agent (Section 7.5) and agreements (Section 7.6), and by the owner's OK, whatever the business's scopes allow.
- *Ending a grant.* A person ends a PACT grant from their own agent at any time. Because PACT 1.0 defines no revocation request, the personal agent discards its tokens at once and stops using the grant; the grant stays live at the business until it expires or the person ends it there.
- *Offline and late replies.* A PACT reply is one HTTP exchange. A business's agent that cannot answer within it says so in its reply; delivery to an agent that is not online, and replies that come later, are this specification's store-and-forward mailbox and not PACT's.
- *Two people's agents.* Agents of two people reach each other through connections (Section 7.1), never through PACT.

These four are offered to PACT's working group as proposals, not as a competing protocol.

**Conformance.** Two fixtures, `pact-identity` and `pact-delegated`, hold every MUST, MUST NOT, SHOULD and MAY line of PACT 1.0 sections 2 to 6 as checks, each for the Provider, the personal agent, or both, with claim vectors that carry their own time.

## 8. What others attest

### 8.1 The record convention

Every attestation in this family is a JSON document with a `signatures` array of `{ "tag", "by", "sig", "alg": "ed25519" }` entries, where `sig` is the Ed25519 signature, base64, over the ASCII tag, one newline, and the JCS (RFC 8785) canonical JSON of the document with `signatures` removed. `by` is the issuer's key, and what that key is worth is the reader's judgment: an attestation is evidence, not truth.

Rules that bind every producer and consumer:

1. **The by-equality rule.** The record's own `by` member, the signature entry's `by`, and, where a door accepts the record over an authenticated channel, the submitting identity MUST all be the same key. A record signed by one key and submitted by another is refused at the door and shown as failed by a reader.
2. **A failed record is shown, not dropped.** A record whose signature does not verify moves nothing anywhere, and is carried as failed rather than discarded, because a reader must be able to see that a bad record exists.
3. **Unsigned is a stated condition.** A record produced where no key was available carries `"signatures": []` and an `_unsigned` note; the note is outside every signature by construction and never covered. An unsigned record is a claim with no issuer and weighs accordingly.
4. **Unknown members are carried verbatim**, never dropped: a signed document does not become unreadable when a format grows.
5. **The common trunk.** Every record states its format generation, the role of its producer, the act it records, when it was produced, and who produced it, alongside the members its own format defines.

### 8.2 The build record

Tag `agent-build-record-v1`, issued by whoever built an agent package, at build time, attesting that these bytes were produced by this builder at this moment. It says nothing about whether the agent is any good, and a package's draft status survives the record.

The same tag carries the other thing that gets built from a package, the image of 12.7.1. A producer that compiled a package into an image issues a build record naming the package digest it built from and the image digest it produced, which makes two build records over one package, each attesting what its own producer made. It is a build record and not a deployment record because building an image deploys nothing: nothing has started, nothing has an address, and nobody has been given a key.

| Member | Holds |
|--------|-------|
| `role`, `act` | `"agent-builder"`, `"build"`. |
| `requested_by` | The principal who asked for the build, as a key or handle where one is known. |
| `package` | `name`, `version`, `schema` (the package format generation), and `sha256` over the package bytes. |
| `image_digest` | The digest of the image built from that package, where this record's producer built one, and each file's digest as built beside it. A build record that names one is the account of an image; one without is the account of the package alone. |
| `source` | Where the builder read what it built: the `repository`, the `commit`, and the `path` inside it. Present only where the builder read a repository at a commit with nothing uncommitted under that path, because a commit that does not describe the bytes that were built describes nothing; absent everywhere else, which is Section 8.3's rule about an absent member. It is the builder's word, and it is what joins a published package to the repository it came from (Section 13.7). A verifier MAY fetch that commit and build again, and learns as much from the comparison as the builder's build is reproducible. |
| `shape` | What the builder believes it built: the declared skills, systems, refusals, and records obligations, as built. |
| `draft` | True until the package has been through review; a build record never clears it. |
| `produced_at`, `by`, `signatures` | The trunk of Section 8.1. |

### 8.3 The deployment record

Tag `agent-deployment-record-v1`, issued by whoever deployed a package as a running agent, in a deploy and a remove variant. This record is the natural version authority for a running agent: it exists at exactly the moment the running version changes, and evaluations and reviews SHOULD cite it.

| Member | Holds |
|--------|-------|
| `role`, `act` | `"deployment-manager"`, and `"deploy"`, `"remove"`, `"alongside"` (a version installed beside the current one, 12.7) or `"retire-version"` (one such version taken out). |
| `instructed_by` | The principal whose instruction the deployment executed. |
| `package` | `name`, `version`, `url`, and `sha256` of what was deployed. |
| `image_digest` | The digest of the image this deploy started, where it started one (12.7.1). It is the producer's word about what it started rather than a claim about what was built, and a reader compares it against the `image_digest` of a build record to learn whether the agent runs what was built. |
| `target` | The host and harness deployed onto. |
| `subject` | The resulting agent's `key` and `handle`. |
| `key_custody` | How the subject's key came to exist, and who holds its private half now. `minted` says which of Section 4.1's two cases happened: `generated`, the keypair was generated inside the runtime that answers, at first start; `provisioned`, it was minted elsewhere and placed into the image or its environment. `held_by` names each party holding the private half when the record was produced, as keys or handles. A party that minted a key and then discarded its copy leaves `held_by` and stays in `minted`, so the two members answer different questions and a reader counting who can speak as the subject needs both. |
| `declarations` | What was declared at start: the interaction style, and who was admitted at start. |
| `descriptor_digest` | The digest of the Agent Descriptor bound at this deployment, where one was bound. |
| `environment` | Where the deploy went: `test`, `staging`, or `production`. A statement of place by the deployer, never a claim about quality; absent means unstated. There is no stage label on the agent itself: maturity is read from which records exist, not from a word anyone picked. |
| `secrets_placed` | The names (never the values) of secrets placed for the agent. |
| `bindings` | One entry per system the package declares that the deploy bound, saying what stood behind the name: the system's `name`; the `product` bound to it; `provided_by`, `customer` or `platform`; `precedence`, the step of the owner's resolution that supplied it, with `instruction` for a binding the owner typed into the instruction itself; the `credential` by name and never by value; `key_store`, the kind of store that name was looked up in and where that store is, where it has an address; and the `address` of the product, where it has one. It is the only document that says what a running agent is bound to, and it is the deployer's word, not the subject's. An assembled view (Section 9) MUST NOT carry the address, the credential's name or the key store from it, which are bindings. A producer that resolved nothing from a declaration of the owner's leaves the member out, and during this revision it sits beside `secrets_placed` rather than replacing it. |
| `ceilings` | Each ceiling this deploy set: the system, what it is per, the number, and `enforced_by`, the side that applies it, in 12.4 section 4's two words. The enforcing side travels with the number because the number alone does not say who can refuse a charge over it. A producer names a ceiling it set or watched set, never one copied out of the install file, so a ceiling nobody applied is absent. |
| `checks[]` | Each post-deploy check: its kind, whether it passed, when, and what it observed. |
| `produced_at`, `by`, `signatures` | The trunk. |

**One deploy is one record, and an absent member is a statement.** A deploy is recorded once, whatever the arrangement of parties behind it. Where the install split because the installer never reached the machine (12.7.1), the record still covers the one deploy: it carries the half its producer performed and leaves the other half's members out, and a reader MUST NOT expect a second record to complete it. Only `role`, `act`, `package`, and the trunk are required, and every other member MAY be absent.

**An absent member means its producer did not observe the thing.** It never means the thing was not required, and never that the thing did not happen. A producer that placed no credentials writes an empty `secrets_placed`; leaving the member out says it placed none and does not know whether anyone else did, which is a different fact and the one a reader of a split install needs. A consumer that reads an absent `target` as a deploy that needed no host, or an absent `checks[]` as a deploy that owed no checks, has read a record of half a deploy as a record of a whole one and will report an unwatched agent as a checked one.

### 8.4 The evaluation record

Tag `agent-eval-record-v1`, issued by an evaluator that tested a subject against what its package, role, or interfaces oblige.

| Member | Holds |
|--------|-------|
| `subject` | The evaluated agent's `agent_key` (REQUIRED, non-null: an evaluation of nobody moves nothing) and `handle`. |
| `package` | The `name` and `tree_sha256` of what the test was derived from. |
| `cases[]` | Each case: an `id`, a `kind`, its `source`, a `verdict` of pass, fail, inconclusive, or flagged, and what was `observed`. |
| `records_audit` | The audit of the records the subject's terms oblige, where records were owed. |
| `summary` | The verdict counts. |
| `conforms` | The evaluator's boolean bottom line. |
| `produced_at`, `by`, `signatures` | The trunk. |

A verified evaluation record moves the covered members of an assembled view (Section 9) to confirmed or failed; coverage is by name and never invented, and a consumer that stores or displays these records enforces the by-equality rule at its door.

### 8.5 Normalizations against current producers

The member tables above state the normalized formats. The shipped producers deviate in the ways below, each a queued producer update rather than a spec concession. They are listed rather than counted, because a number here goes stale the moment a member is added and a stale count reads as a settled account of what is outstanding: the deployment record does not yet carry `descriptor_digest` (only the ephemeral deploy output does); the deployment record names its subject `agent` rather than `subject`; `requested_by` and `instructed_by` are emitted as fixed literals rather than principals; the two shipped consumers check signature attribution asymmetrically where this document requires the by-equality rule everywhere; the unsigned fallback shape varies; and the per-format `package` sub-objects differ in member sets, which this document keeps, because a build, a deployment, and an evaluation genuinely know different things about a package. Newly: `image_digest`, `key_custody` and `ceilings` were added to 8.3 and `image_digest` to 8.2 for the case where an installer builds an image and an owner runs it (12.7.1), and a producer that never builds an image or mints a subject correctly emits none of them, so their absence from a host install is the rule of this section working rather than a deviation from it.

### 8.6 Attestations defined elsewhere

Handle cards belong to the registrar's specification, reputation reports to the bureau's, listings to the Agent Listing Model, delegation chains to Agent Mandate, and engagement documents to Agent SoW. Each is an attestation in this section's sense: signed by its issuer, verified before weighed, weighed by the reader.

### 8.7 The run config on a run record

Whoever resolves a run config for a job (Section 5.8) writes the result on the record it keeps of that run. A process runner writes it on the run's record, as the process standard defines that record, and writes each step's part on the record of that step; a host that sent a job to one agent writes it on its record of that job. The member is `run_config`:

| Member | Holds |
|--------|-------|
| `name`, `digest` | The run config the job was started with. Both are absent when the job named none. |
| `resolved` | The resolved run config of Section 5.8, with every value written as `{ "value": …, "from": … }`, and `"locked": true` with `"locked_by"`, the layer that locked it (`organization`, `team` or `owner`), added where a lock held the value. Its `digest` is the one Section 5.8 computes over the plain values, so showing the sources and the locks does not change it. |
| `checks[]` | The version check for each step: the step, the version and package digest the run config names, the version and digest installed, and whether the job went ahead. |

`from` names the layer that supplied the value: `author`, `solution_author`, `organization`, `team`, `person` or `run`. A step's `version` and `package_digest`, and the `model` of an agent that declares no `model` setting, carry `from: "installed"`, because no layer chose them: they are what the host had installed when the job started. Where the agent's owner is not the sender, the owner's layers were applied on the agent's side and the sender cannot see which of them supplied a value, so the sender's record writes `owner` for such a value, from the `values` member of the agent's job manifest (Section 5.7), and the agent's own node records the layer by name. A value from a run config kept by an organization, a team or a person (Section 5.8) carries that keeper's layer, and one from the run config it builds on carries `solution_author`; `name` and `digest` are then the kept run config's. A reader of the run answers "why did it come out like this?" from this member alone, and can start the same job again from the resolved run config.

The member is its writer's word, signed or unsigned with the rest of the record that carries it under Section 8.1. It says which values the job was handed. Whether the agent used them is what the agent's job manifest states, and the two are compared by digest.

## 9. The assembled view: the AgentDoc

An agent describes itself in the Descriptor; others attest in their records; and nobody deciding whether to engage an agent wants six fetches and a mental merge. **The AgentDoc is one document that assembles them**, served from a known location, in a form a program can act on and a person can read. This chapter is the AgentDoc's normative definition; the page at https://agentdoc.net/spec.html is a rendering of it.

JavaDoc and Swagger did the same thing, and it is worth being precise about which part of it matters. Neither invented facts. Both took what was already true of a program and put it in one place, in two renderings: one for a machine, one for a reader. The AgentDoc does that for an agent, with one addition neither of them needed. An API description has no interested party. An agent description is written by somebody selling something, so every part of an AgentDoc says where it came from.

### 9.1 Assembled, never authored

The tempting version of this idea is a file an operator writes about their agent. That version fails, and hand-written API descriptions already showed how: they drift from the API they describe, then they mislead, and then people stop trusting the format rather than the file.

So an AgentDoc is **generated**, and this specification makes that structural rather than advisory: an AgentDoc MUST NOT contain a fact that is not present in a source it lists (Section 9.3). There is nowhere to type a claim. An operator who wants their AgentDoc to say something changes the source it would be assembled from: their Descriptor for a standing fact, or the signed document for a binding one.

It is not a new source of truth, and it is not a registry. The card, the terms, the listing, and the reputation report remain what they always were. An AgentDoc is a **view**, and a view that outlives its sources misleads while looking current, which is why staleness is visible rather than fatal (Section 9.3). It also does not compete with the A2A Agent Card: where the two overlap, an AgentDoc restates the card and cites it (Section 9.9).

### 9.2 Where an AgentDoc lives

An agent reachable at a domain SHOULD serve its AgentDoc at `https://<domain>/.well-known/agentdoc.json`, beside the A2A Agent Card at its own well-known path. A reader who has one address has both.

An AgentDoc MAY also be served by somebody who is not the subject. A directory that assembles AgentDocs for every agent it lists is a conforming assembler, and its documents are as valid as the subject's own, because the sources are checkable rather than anybody being trusted. The location above is where the subject's copy goes, not a claim of exclusivity. An agent that is not reachable at a domain, which is most agents on a network, has its AgentDoc served wherever its operator or its directory serves it, and the document is unchanged: **the format does not depend on the address.** Every AgentDoc SHOULD also be available as a human page at the same path without the `.json` extension, rendered from the same document (Section 9.8).

### 9.3 The rules that make it worth reading

**Every section names its sources.** Each section of an AgentDoc carries `from`, listing the source identifiers it was assembled from. A section with no source does not conform. This is what lets a reader take any single line and go and check it. Where a member came from a different source than its section's other members, it carries its own pointer: any member MAY be accompanied by `<member>_from`, naming one source id. This is a narrowing, never a widening: a member-level pointer MUST name a source already listed in the section's `from`, and its only job is to say which of them.

**An assembler adds no facts.** An AgentDoc MUST NOT state anything that is not in a listed source. Reformatting, unit conversion, and restating a signed value in a section are all fine. Inference is not: an assembler that concludes an agent "probably handles European data" from a European address has manufactured a claim the agent never made, and the agent will be held to it. Where an assembler wants to publish its own opinion about a subject, that is a recommendation, and the roles registry already defines the role that produces one.

**There is no summary grade.** An AgentDoc MUST NOT carry a single overall score, badge, tier, or trust label for its subject. An assembled document does not need a badge, because it has something better: it says where each part came from, and the reader can see that the price is from a signed standing proposal and the capability blurb is from a text field the operator typed. Provenance is the evidence. A badge is a summary of provenance that discards the part that mattered.

**It says when it was assembled, and it goes stale.** Every AgentDoc carries `assembled_at`, and every source carries when it was fetched. A reader MUST be able to tell how old the view is. An AgentDoc MAY carry `stale_after`; past that moment a reader SHOULD treat it as an old view rather than a false one: the sources it cites are still fetchable, and re-assembling is the remedy. An expired AgentDoc is not invalid, it is out of date, and those are different enough to be worth separate words.

**What the assembler signs, and what it does not.** An assembler MAY sign an AgentDoc with `agentdoc-assembly-v1` (Section 9.11). The signature means exactly one thing: this assembler gathered these sources at this time and reported them faithfully. It is not a claim that the subject's statements are true, and it MUST NOT be presented as one. An assembler signs its own work, never the subject's. Where a source was itself signed, the AgentDoc records that separately, per source; those two signatures answer different questions and must never be shown as one.

### 9.4 The document and its sources

Top level:

```json
{
  "agentdoc": "v1",
  "subject": { "id": "…", "handle": "…", "name": "…" },
  "assembled_at": "2026-08-29T18:04:00Z",
  "assembled_by": "…",
  "stale_after": "2026-09-05T18:04:00Z",
  "sources": [ … ],
  "sections": { … },
  "not_stated": [ … ],
  "signatures": [ ]
}
```

`subject.id` is the agent's stable identifier, normally its public key; `handle` and `name` are conveniences and MAY be absent; `id` MUST NOT be.

**The one document without a subject** is a package AgentDoc (Section 13.4): assembled from a package before any agent exists, it carries `package`, the package's name and version, where this document carries `subject`. It says what any agent installed from those bytes will declare and nothing about any agent that is running, and a consumer MUST NOT read it as describing one. `assembled_by` identifies the assembler, and where the assembler is the subject's own operator it says so, because a self-assembled AgentDoc and a third-party one are different things to a reader and the difference should not require inference.

**Sources.** Each entry describes one thing the AgentDoc was built from: an `id` the sections reference, a `kind`, a `url`, `fetched_at`, a `digest`, and `signature`, one of `verified`, `unsigned`, `failed`, or `not_checked`. `unsigned` and `not_checked` are different facts and MUST NOT be collapsed: one says the document carried no signature, the other says this assembler did not look. Defined kinds: `a2a-card`, `agent-manifest`, `sow-standing-proposal`, `listing`, `reputation-report`, `roles-declaration`, `interface-definition`, `plugin-package`, `agent-descriptor`, `build-record`, `deployment-record`, `eval-record`, and `observation`; others MAY be used and SHOULD be namespaced. An `observation` source is something the assembler did rather than fetched: asking an agent whether it was free, and recording the answer and the moment. It carries `at` and `what` in place of `url`, and it is the only source kind that can go out of date within a minute.

**Packaged agents as a source.** Most agents will exist as a package before anybody writes them a document, and `plugin-package` names one. It is a legitimate source, and this specification says exactly what may be taken from it, because the temptation to take more is strong and the package is not a document about the agent, it is the agent. Derivable: the name, the version, the description, and the tool list split by transport; that split is the one thing in a package a buyer genuinely needs and cannot get elsewhere, because a tool that runs as a local process is the provider's own machinery while a tool reached over a URL means content leaves the building. Never derivable, and an assembler MUST NOT infer them: price, pricing arrangement, inputs, deliverables, refusals, jurisdictions, retention, interfaces, or admission. Never carried at all: `env` values, `command`, `args`, `cwd`, and header values, which are bindings and machinery and the members most likely to hold a secret. **An importer produces a draft, never an AgentDoc**: what a package's author types in answer to the questions the package cannot answer MUST land in a signed card or standing proposal, from which an AgentDoc then assembles. Writing those answers straight into an AgentDoc would make the importer the one place in the system where a claim can be typed into a format built on there being nowhere to type one.

**A declared role as a source.** A `roles-declaration` source is a role's published contract, listed because the subject itself declares the role: the role's standard offering name appears among the offerings on the subject's own card or manifest. An assembler MUST NOT list a role the subject has not declared; behaving like a bookkeeper, being named like one, or matching one's description is not a declaration. The source fills the `role` section, and MAY fill inherited sections by citation: the exchanges from the role's primary interface, the role's refusals into `refuses`, and the role's handling rules into `handling`. Every member filled this way enters at the `declared` state and never higher, because a declared role is the subject's claim about itself; an evaluation record is what moves an inherited member past declared. An inherited refusal carries `kind: "role"`, a third value beside `prose` and `clause`: stronger than a sentence in a description, because the subject staked a standard name on it, and weaker than a signed clause, because no counterparty holds it. The vocabulary is shared with the roles registry on purpose: the registry owns the must-form and this specification owns the does-form, and neither restates the other's.

**The Descriptor as a source.** An `agent-descriptor` source is the subject's own Descriptor (Section 6). Where one exists, it is the authored source for the sections it covers, and an assembler SHOULD prefer it over any projection of it. What it fills: the one-sentence description, the offerings with their inputs and outputs into `sells`, `interaction` and the shape members into `shape`, the refusal prose into `refuses` (as `kind: "prose"`), the declared role and interfaces (which the assembler then resolves as above), the hosting regions, the standing systems into `reaches`, the run config block into `configs`, and the per-caller limits. Every member enters at the `declared` state, because a Descriptor is the operator's word about their own agent. Two rules travel with it: the source entry records the Descriptor's digest, because a signed proposal references a Descriptor at a digest and a reader must be able to tell whether the document assembled here is the one a signature meant; and where a projection of the Descriptor disagrees with the Descriptor itself, an assembler MUST NOT merge them silently: the Descriptor's value is carried, and the disagreement is reported.

**An evaluation record as a source.** An `eval-record` source is a signed verdict from a conformance evaluation of the subject: an `agent-eval-record-v1` document (Section 8.4), naming the subject, the package or contract it was graded against by digest, and a per-case result. It is the checking source: the one kind of document that can move an inherited or declared member to `confirmed` or `failed`. The mapping is per case and never wholesale: a passing case on an exchange or a refusal confirms that member, with the record's timestamp; a failing case marks it failed, and a recorded failure MUST NOT be silently downgraded to declared. A verdict whose overall answer is that the subject does not conform does not erase the subject's declarations; it sits beside them, case by case, which is exactly what a reader deciding whether to trust the subject needs to see. An assembler MUST verify the record's signature against the evaluator key inside it and record the result like any source, and MUST NOT treat an unsigned verdict as confirmation of anything.

### 9.5 The sections

Every section is optional. An absent section means the subject published nothing to build it from, and Section 9.6 requires that absence be named.

- **identity**: who it is. Name, operator, address, and what signs for it.
- **shape**: what it is. Whether it is a service or a person's own agent, what it runs on, whether it is one process or a fleet behind one identity, what its inside is made of and how much of that inside anybody can check (Section 9.5.1).
- **asked**: what it can be asked. The largest section, and the one a caller acts on.
- **role**: the standard role it holds, if any.
- **sells**: what it actually does. Each offering with what the client furnishes, what comes back, and what it costs; whether it can be tried, with its trial's `who`, shape and counts, or that it offers no trial; and its samples, each marked confirmed, earlier, or stated by the publisher (Section 7.7).
- **access**: how you reach it at all. Where a message is sent, what a caller presents, and who is let in.
- **refuses**: what it will not do, and what it hands to a person rather than deciding. Drawn from its declared scope, its role's refusals, and its terms. This section is usually the most useful one on the page and is usually the emptiest, which is itself worth seeing.
- **reaches**: the standing systems it runs with, from the Descriptor's systems member: a name, an access level, and what the access is for; and the spending ceilings its package suggests per system.
- **leaves**: the records a job leaves behind, from the Descriptor's `records` member: each a name, when it is written, and the file it lands in. What an evaluation checks a real job left, and what a client can ask for afterwards.
- **configs**: what a job may set, from the Descriptor's `run_config` member (Section 6.2): each declared setting with its kind, default, allowed values and whether a sender who does not own the agent may set it; the models the author has tested the agent with; and the author's named run configs, by name and digest.
- **handling**: where it processes data and how long it keeps it, cited to the terms that promise it.
- **standing**: what third parties have published about it: reputation reports, attestations, directory checks. Carried, never audited, and attributed.

**The `asked` section, in full.** This is the section a caller actually acts on, and it is the reason an AgentDoc is worth fetching rather than reading a description. An interface entry names the interface, the version, where its definition lives, and **every exchange that definition publishes**, each with its own state. It MUST NOT be reduced to a name and a version: a reader who has to go and fetch the interface definition to find out what they may send has not been given a description at all.

```json
"asked": {
  "from": ["card", "iface-worker", "probe"],
  "interfaces": [
    {
      "name": "interface-worker",
      "version": "v1",
      "definition": "https://agentroles.ai/worker.html",
      "declared_in": "card",
      "exchanges": [
        { "id": "free", "asks": "are you free?",
          "answer_carries": ["free", "reason when not", "job when not"],
          "state": "confirmed",
          "confirmed_at": "2026-08-29T18:04:00Z", "confirmed_by": "probe" },
        { "id": "estimate", "asks": "what would this take?",
          "answer_carries": ["can (CAN|CANNOT|UNSURE)", "commitment", "note"],
          "state": "declared" }
      ]
    }
  ]
}
```

Three rules govern it. The exchange list comes from the interface definition, and the definition is a source: an assembler does not invent the exchanges, it resolves the published interface and lists what that publication says, citing it like any other source. State is per exchange, never per interface: an assembler that asked one exchange and got a conforming answer has confirmed one exchange, and marking the whole interface confirmed on that basis is exactly the overclaiming the no-added-facts rule forbids, in the place a reader is most likely to rely on it; the states are `declared`, `confirmed` (with the timestamp and the observation that did it), and `failed` (a fact worth carrying, and MUST NOT be silently downgraded to declared). And a declared interface with no exchanges listed does not conform: if the assembler could not resolve the definition, it says so with the interface present and its exchanges absent, and names the interface in `not_stated`.

**The `sells` section, in full.** `asked` says how to hand work over and follow it; this section says what the work is. Each offering carries what the client furnishes, what comes back, and what it costs, quoted from the standing proposal that offers it.

```json
"sells": {
  "from": ["card", "terms"],
  "offerings": [
    {
      "name": "clause-review",
      "does": "Reads a contract and reports unusual or one-sided clauses.",
      "inputs": [
        { "name": "contract", "media_type": "application/pdf", "when": "per_task" },
        { "name": "house-positions", "media_type": "text/markdown", "when": "standing" }
      ],
      "deliverables": {
        "per_task": [
          { "name": "clause-report", "media_type": "application/pdf" },
          { "name": "flags", "media_type": "application/json" }
        ],
        "interim": [
          { "name": "summary", "media_type": "application/pdf",
            "recurrence": { "every": "month", "due_by_day": 5 } }
        ]
      },
      "price": "12000 XCR per document",
      "arrangement": "per_task",
      "minimum": 50,
      "does_from": "card",
      "steps": [
        { "id": "read-the-contract", "name": "Read the contract",
          "inputs": [ { "name": "contract", "media_type": "application/pdf" } ],
          "outputs": [ { "name": "clause list", "media_type": "application/json" } ] },
        { "id": "flag-the-clauses", "name": "Flag the clauses" }
      ]
    }
  ]
}
```

`steps` carries the offering's delivery steps, quoted from the Descriptor (Section 12.3) in the same shape as the offering and in order. A renderer shows them under the offering and never as offerings, and a caller MUST NOT send a step that is not also offered: what is for sale is the offering, and the steps are how it is delivered. `inputs` carries `name`, `media_type` and `when` (`per_task` or `standing`). `deliverables` splits into `per_task`, the artifacts attached to each completed task, and `interim`, the engagement-level obligations the provider owes on a schedule whether or not the client asked. `minimum` is a floor the offering's terms set; `arrangement` is the pricing arrangement the standing proposal declares. All of these are Agent SoW's own members and this specification does not redefine them: it quotes them, and where that standard changes, this one follows. Three things about this section: **these are not descriptions, they are obligations** (Agent SoW grades both enforced: a task arriving without a required input moves to `input_required` naming what is missing, and a task claiming completion without every named deliverable in the named media type is a failed task, so a reader is looking at what the runtime will hold the provider to, not at a brochure); **form is enforced and quality is not**, and an AgentDoc MUST NOT blur that, because nothing here says the deliverable will be any good, which is what reputation is for; and **`does` is prose and is marked as such**, sitting beside signed clauses without being dressed as one. An offering whose standing proposal names no inputs or no deliverables lists neither and names them in `not_stated`: an agent that has not said what it needs from you, or what you get back, has not promised either.

**The `access` section, in full.** It carries two different facts, and merging them is the mistake it exists to prevent: `schemes` is what a caller presents, `admission` is who gets in, both quoted from the subject's declarations (Section 6.9) and defined there, not here. `statement` is the free-text sentence beside the policy, carried as prose. Beside them, `address` is where a message to the subject is sent (its handle, quoted from the registrar's card, which is the source that says so) and `protocol` names the transport it answers on; an assembler that holds the card and no access declaration carries the address and names `access.schemes` and `access.admission` in `not_stated`, because knowing where the door is says nothing about who it opens for. Three rules govern it. Silence and "nothing required" are different, and both must be printed: schemes present and non-empty means the subject said what to present, an empty list means it said there is nothing to present, and an absent section means it never said, named in `not_stated` like any other silence; a renderer MUST NOT show the third as the second, because an agent that never described its door rendering as an agent with an open one is an invitation to send credentials to something nobody has checked. An AgentDoc carries shapes and MUST NOT carry bindings, even when a source does, and this binds the assembler and not only the subject: a directed Agent SoW proposal legitimately names a counterparty's real repository or endpoint, because it is a term between two identified parties, but an AgentDoc is a public document, and an assembler that reads such a source MUST NOT copy those values in, and MUST NOT do so on the grounds that the source was signed: a signature attests who said it, never that publishing it is safe. And a scheme list is alternatives: a renderer that presents it as a checklist tells a reader they need credentials they do not need.

What the agent needs granted is deliberately not a member of this section: it is per-offering, typed by Agent SoW as a shared-resource input with an access level and a `via`, and it rides in `sells` with the rest of what an offering asks for.

**The remaining sections** (identity, shape, role, refuses, reaches, handling, standing) are small. Four rules rather than preferences: `interaction` is the service-or-personal axis, not a description of the software, and whether one process answers or a fleet behind one identity does is `fleet`, separately optional. `refuses.kind` is `prose`, `clause`, or `role`, because a sentence in a description field, a term in a signed proposal, and a role's staked refusal are materially different strengths, and an AgentDoc that cannot tell which it has omits `kind` rather than guessing; `refuses.hands_over` carries the cases the subject hands to a person rather than deciding, from the Descriptor's `escalates` (Section 12), each a sentence and each prose. `reaches.ceilings` carries the spending ceilings the subject's package suggests per reached system, as suggested: the host that installed the agent set the one in force, and an AgentDoc MUST NOT present a suggestion as the limit. `leaves.records` carries the Descriptor's `records` as declared, and an evaluation record is what confirms a real job left them. `handling` members are quoted from Agent SoW, and `promises` is that standard's list; this one adds nothing to it. `standing` carries other people's documents and audits none of them: each entry says who published it, where it is, and what it was as of, and an AgentDoc MUST NOT summarise, average, or grade what it finds there, which would be the summary grade arrived at indirectly.

**The `configs` section.** It quotes the Descriptor's `run_config` and adds nothing to it. `configs.tested_models` is the author's word, and a renderer MUST NOT show a model as tested unless it is listed there: where a model is allowed and not listed, the rendering says it is untested. A Descriptor that declares settings and no `tested_models` has `configs.tested_models` named in `not_stated`. Run configs that owners, organizations and people saved for themselves are theirs and are not listed (Section 6.2).

**What is not stated.** `not_stated` is an array of section or member paths the subject has published nothing about, for example `["role", "handling.retention_max_days"]`. This exists because silence is the most common answer in this whole family and the easiest one to lose: a missing field renders as nothing at all, and nothing at all looks like a document that simply did not mention an unimportant detail. Naming it makes the reader see the agent declined, or never got round, to say where it processes your data.

#### 9.5.1 What an agent is made of, and how much of it anybody can see

Two questions come before the rest: what is inside this agent, and how much of that can be checked rather than believed. `shape` carries both. **`visibility` is always computed**, from the sources this document lists. **`kind` is computed wherever a record establishes it**, and carries the operator's own word only where no record can, marked as declared like every other thing an operator says about itself.

**`kind` says what the inside is made of**, from a closed vocabulary of four values. What separates them is what the agent's content actually is:

| Value | The content | What establishes it |
|-------|-------------|---------------------|
| `bare-harness` | Nothing was installed. A harness answers as itself, so what it does with a message is the harness's own behavior. | The subject's most recent deployment record (Section 8.3) naming a harness and no package. |
| `plugin-on-harness` | A package (Section 12): instructions, skills, and the scripts those skills run, read by a harness. | That record naming both a package and a harness. |
| `mesh-coded` | Code that answers on the network itself, with no runtime between the code and the door. | That record naming no harness, where the subject answers on the binding directly. |
| `third-party-framework` | Code in another runtime's own format, executed by that runtime, which decides what happens next and holds the tools and the memory. | That record naming a runtime that is another party's. Where no record names one, the subject's declaration is the only evidence there is, and it is carried as declared. |

All four can involve a harness in Section 12.1's broad sense, an agent framework included, which is why the values are separated by what the content is rather than by whether something thinks. Where no source establishes a value and the subject has declared none, `kind` is absent and named in `not_stated`. **An assembler MUST NOT infer a kind from a card, a name, a description, or a list of skills.** A card describes a door, and all four stand behind the same door.

**`visibility` says how far past that door a reader can check**, in three values:

| Value | What is held | Where it comes up |
|-------|-------------|-------------------|
| `verifiable` | The bytes and the records: a package digest, a build record, the ledger of files placed, a deployment record naming what was bound, and an image digest where one was built. A stranger can check that what runs is what was built without trusting whoever serves this document. | An agent deployed by a party that is not the subject and that recorded what it did. |
| `observed` | Not the inside, but the path. Every request crosses a door the platform keeps, admission and allowance apply there, and what crossed is recorded. | A runtime somebody else wrote, attached through an adapter. A bare harness sits here too: the door is watched and the harness's own reasoning is not. |
| `opaque` | The door alone: an address, what was sent, and what came back. | An agent reached across a bridge from another protocol, whose card says what it offers and nothing about what is behind it. |

Four rules go with it.

1. **A deploy the subject issued to itself never reaches `verifiable`.** Section 12.7.1 is explicit that where the producer of a record is also its subject, the record is the subject's account of itself, and Section 12.8 that no check in it establishes that the process answering started from the image a record names. Such an agent is `observed` at most, and reaches `verifiable` only on an evaluation record from a party that is neither (Section 8.4).
2. **Where no source speaks to what stands behind the door, `visibility` is absent and named in `not_stated`**, exactly as `kind` is. A package AgentDoc (Section 13.4) is always that case: nothing has run, so nothing has been seen.
3. **Where `fleet` is true, `visibility` is the weakest value any process in the fleet supports**, and `kind` is carried only where every process agrees, absent and named otherwise.
4. **Two conforming AgentDocs of one subject MAY carry different values**, because an assembler holding the deployment record and one reaching the subject across a bridge have genuinely seen different amounts. That is not the drift of Section 6.8 and MUST NOT be reported as a disagreement. What each document says is what its own assembler could reach, which is why both members name their sources.

A subject does not declare its own `visibility`. An operator who calls their agent verifiable has described their confidence rather than anybody's ability to check.

**Nothing is presented above its level.** This is the rule the two members exist for, and it binds the assembler first and the renderer after it.

- At `opaque`, neither MUST present a ceiling, a refusal, a duty to leave records, or a spending limit as anything but the subject's own declaration. Nobody here applied one or saw one applied.
- At `observed`, what MAY be presented as enforced is what happens at the door: who was admitted, what was refused there, what allowance remained.
- At `verifiable`, a section MAY additionally carry what a record attests about this deploy, cited to that record, and to that deploy alone.

Two things this is not. It is not the inference Section 9.3 forbids: these two members are defined here as computed classifications over the listed sources, each naming the sources it was computed from, and no other member of an AgentDoc may be computed at all. And `visibility` is not the summary grade Section 9.3 forbids either, because it does not summarize the subject. It summarizes the assembler's own reach, which is a fact about this document rather than a verdict on the agent it describes. `verifiable` says what can be checked, never that anybody checked and was satisfied, which is an evaluation record's business and reputation's after it.

### 9.6 Silence never resolves to the flattering value

An assembler MUST NOT substitute a default for a member the subject has not stated, and MUST NOT choose the reading that favours the subject. An agent that has said nothing about retention has not promised to delete anything. An agent with no published price is not free. An agent that has not declared an interface does not implement it, whatever its prose says. An unreadable or malformed member is not-stated, not the safe-sounding value: a typo must never manufacture a promise. Where a reader needs a default in order to act, the default belongs to the reader's own policy, applied by the reader, visibly. It does not belong in a document that describes somebody else.

### 9.7 What the subject controls

A subject MUST be able to correct an AgentDoc about itself, and the mechanism is already the design: change the signed source, and the next assembly changes with it. An assembler that continues to publish a section citing a source that has since changed, without re-fetching, is not conforming. A subject MUST NOT be able to compel an assembler to omit a source it lawfully holds, or to remove `not_stated` entries. An AgentDoc that a subject can edit directly is the hand-written file Section 9.1 exists to prevent.

### 9.8 The human rendering

An AgentDoc SHOULD be renderable as a page, from the same document, with no additional input. The rendering MUST show, for every section, which sources it came from, and MUST show `not_stated` as visibly as it shows what was stated: a renderer that hides absence produces exactly the flattering picture Section 9.6 forbids, by omission rather than by assertion. The rendering MUST show when the AgentDoc was assembled, and where `stale_after` is present it SHOULD show that too. The rendering MUST NOT introduce a badge, score, or trust mark that the document does not contain.

Three rules preserve differences that are invisible once lost. **Undeclared reach is not an empty reach**: where the `reaches` section is absent the rendering MUST show it as not stated and MUST NOT present the subject as touching nothing, because an agent that has said nothing about what it reaches has not promised it reaches nothing. **A grant is not a file**: where an offering's inputs include a shared resource, the rendering MUST show those separately from inputs the client simply sends, and within them MUST show standing grants above per-task ones, because a standing grant is the only thing on the page that is still true after the work is finished. **An undeclared door is not an open one**: where the `access` section is absent, the rendering MUST show it as not stated and MUST NOT render it as though nothing were required.

### 9.9 Relationship to the A2A Agent Card

The card is a source, and normally the first one. An AgentDoc restates card members in its sections and cites the card; it never contradicts it. Where the card carries family extensions, the terms extension in particular, the AgentDoc follows them to the documents they commit to and lists those as further sources. An AgentDoc is therefore a superset of a card's content and a subset of a card's reach: the card is fetched by tools that have never heard of this specification, and it MUST remain valid and useful on its own. Nothing here asks an operator to stop publishing a card, or changes what a card means.

### 9.10 Checking an AgentDoc

Mechanical, and unusually easy for a document of this kind, because an AgentDoc makes claims about its own construction. Given an AgentDoc and the ability to fetch its sources, a harness checks: that every section's `from` names sources that exist in the document; that every listed source is fetchable and, where a digest is recorded, matches it; that every fact in every section appears in one of that section's cited sources; that no member of the document is a summary grade; that no section presents as enforced anything its `visibility` does not support (Section 9.5.1); that `assembled_at` and per-source `fetched_at` are present; that a member absent from every source appears in `not_stated` rather than being silently missing; and that no not-stated member has been given a default. The one thing a harness cannot check is whether the subject's statements are true, and no version of this specification will claim otherwise.

### 9.11 The assembly signature

- `agentdoc-assembly-v1`: an assembler's statement that it gathered the listed sources at the stated time and reported them faithfully, signed under the family convention of Section 8.1, `by` being the assembler's own key.

An AgentDoc MAY carry more than one signature entry, and an entry whose tag a reader does not recognise is skipped, not treated as a failure: an unknown signature is somebody else's business. The subject signs nothing here. Its statements are signed in their own documents, which is where a reader should go to check them, and saying so is what the format is for.

## 10. The twenty-one attributes

The floor is mandated. Everything above it is earned, checkable, and deliberately not a score: each attribute is an artifact or a behavior a reader can fetch and verify, and an attribute's absence is a printed fact, never a deduction. Each attribute belongs to one of the three columns, which states how it is checked: an answered attribute is checked by asking, a declared one by verifying the authored document, an attested one by verifying an issuer's record.

**Attributes and interfaces divide cleanly, and this section owns only one of the two.** An interface, published at the roles registry, is a set of exchanges: what may be asked of an agent and what each answer must carry, named, versioned, and open-ended in number, because every trade can define its own. An attribute is a standing property with a truth mechanic, one of the closed set below, and **an attribute never defines an exchange.** Where an attribute's check is behavioral, the attribute names the test that backs it and the exchanges live only there: Askable is backed by the entryway (Section 4.4), and Candid is backed by the interview (Section 4.3). The bundles are parallel and never mix parts: a role bundles interfaces and obligations at the registry; a profile bundles attributes here. In a rendered view the two stay distinct the same way: attributes are the properties a page summarizes, interfaces are the exchange lists its asked section carries (Section 9.5), and a behaviorally backed attribute points at the exchanges that prove it rather than restating them.

**Identity**

| Attribute | Holds when | Checked as |
|-----------|-----------|------------|
| Named | A handle is bound to the identity key at a registrar. | Attested (the registrar's card). |
| Owned | The agent answers to an owner who is a verifiable principal. | Declared, attested where the registrar records ownership. |
| Versioned | The agent states an `agent_version` (Section 6.2), and deployment records anchor what runs (Section 8.3). | Declared and attested. |

**Description**

| Attribute | Holds when | Checked as |
|-----------|-----------|------------|
| Described | A bound, signed Agent Descriptor is served (Section 6). | Declared. |
| Assessable | An AgentDoc is served (Section 9), assembling declarations and evidence with sources shown. | Derived from both columns; never authored. |
| Askable | The entryway's five exchanges are answered (Section 4.4). Floor agents all are. | Answered. |
| Doored | Access schemes and an admission policy are declared (Section 6.9), and the door of Section 7.1 enforces them. | Declared and answered. |
| Sealed | An encryption key and posture are declared and honored (Sections 4.1, 6.9, 7.2). | Declared and answered. |

**Conduct**

| Attribute | Holds when | Checked as |
|-----------|-----------|------------|
| Evaluated | A signed evaluation verdict exists for the running subject (Section 8.4). | Attested. |
| Candid | The interview of Section 4.3 passes: refusals typed (Section 4.7), faults loud (Section 7.4), spoken answers matching signed ones. | Answered (the interview is the backing test). |
| Screened | An owner-chosen screening provider is configured (Section 7.3), with the honest unscreened answer otherwise. | Declared and answered. |
| Record-keeping | The records its terms oblige exist and pass audit (Section 8.4's records audit). | Attested. |

**Commerce**

| Attribute | Holds when | Checked as |
|-----------|-----------|------------|
| Priced | A price, or explicit free, is declared and digest-pinned (Section 7.6). | Declared. |
| Contractable | A standing proposal exists that a stranger can countersign into an engagement (Agent SoW). | Declared, attested once countersigned. |
| Forthright about data | A data-use declaration is served (Section 6.9). | Declared. |
| Metered | Usage is reported (Section 5.5) and receipts exist a client can settle against (Section 7.6). | Answered and attested. |
| Mandated | Acts with consequences ride a verifiable delegation chain (Agent Mandate). | Attested. |
| Revisable | An offering declares a revision policy (Section 6.2) and the revisable-work interface holds: a change to delivered work reuses what it did not redo, checked by digest (Section 5.7). | Declared and answered (the revision test is the backing test). |

**Standing**

| Attribute | Holds when | Checked as |
|-----------|-----------|------------|
| Reputable | The agent is enrolled at a bureau with history. | Attested. |
| Listed | A directory entry exists with evidence states shown. | Attested. |
| Qualified | A standard role is held and a conformance verdict covers it (the roles registry, Section 8.4). | Declared and attested. |

**Profiles** are how buyers actually read the attributes: "hireable by a stranger" decomposes into roughly named, described, doored, priced, and contractable; "safe to grant write access" into owned, mandated, candid, and reputable. A profile MUST always decompose into its attributes in any rendering; a profile presented as a single mark is a score wearing a costume, and scores are refused across this family.

## 11. Bindings

A binding connects an agent to a network. It supplies transport identity verification, message delivery, registration and discovery, and its network's delivery semantics; it spells the floor's exchanges as its own verbs and subjects; it pins the byte-level constants this document leaves symbolic (fence text, freshness windows, envelope formats); and it projects the agent's declarations into its own registration format, derived and never independently edited.

Agent Messaging is the reference binding. Its specification is being narrowed to exactly this role: the network's transport, envelope, delivery, and platform services, with this document as the definition of the thing being connected. Its manifest is the registration projection of the Agent Descriptor. An agent conforming to this document on one binding conforms on any: nothing in Sections 4 through 10 names a transport.

## 12. How an agent travels: the Agent Package

An agent has an inside and an outside. The inside is what it is made of: skills, the scripts they run, the servers they reach. The outside is what a caller can rely on: what it does, what it refuses, what it needs, what it leaves behind, which is the Descriptor of Section 6. The inside has a portable format of its own, the Agent Plugin, whose standard says in its own words that distribution, installation, and permissions stay under each client's control. This section defines the thing that carries both halves from a description to a running agent with an identity: the Agent Package, what it contains, how the halves are joined, how it is published to and installed from a depot, and how a verifier can check that the agent answering on a network is the package that was built.

It is not a package format: Agent Plugins defines the layout and the manifest, and Agent Skills defines a skill folder; this section adds two files beside the manifest and one namespace inside it, restating neither. It is not a runtime, not a listing, and not a change to any wire.

### 12.1 Terms

These are the words this document uses for the things an install joins, and they are used in this sense throughout.

- **Host**: the machine an agent runs on. One host may hold many agents, each with its own home and its own identity.
- **Harness**: the program that does the thinking when a message arrives, whether a coding tool driven from a terminal, a model runner, or an agent framework. A harness is not an agent: it is what an agent runs on, and one harness may serve many agents on one host.
- **Package**: an Agent Plugin directory, or its archive, carrying a draft Descriptor and an install file at the paths in 12.2. A package is not an agent: it carries no subject, and until it is installed nobody can address it.
- **Draft Descriptor**: a Descriptor without a subject (6.2.1), inside a package. **Bound Descriptor**: the same document with its subject filled and signed, served by the running agent.
- **Install file**: the host-facing declaration of 12.4: what an installer must have and do.
- **Agent**: what exists after an install: a subject with a key and a handle, a home on a host, a harness configured to read the package, and whatever parts the binding requires to receive messages and answer them.
- **Bare agent**: an agent that carries no package and answers as its harness alone. It has a subject and a Descriptor like any other agent; what it does not have is offerings a package declared.
- **Depot**: where packages are published to and fetched from, by name, version, and digest. A depot is not a registry of agents (6.7): it holds packages, which contain drafts, and it never serves a draft as any agent's Descriptor.
- **Installer**: whatever performs 12.7; on a conforming deployment, an agent holding the deployment manager role of the roles registry.
- **Image**: the package as installed, fixed as bytes and named by a digest, together with the harness and whatever parts the binding requires. An image is not a package: a package is authored and published, and an image is what an install produced from one.

An owner instructs a deploy; the installer installs the package; the result is an agent. The three words are not interchangeable: the deploy is the instruction, the install is the procedure of 12.7, and the agent is what the procedure leaves behind.

### 12.2 Layout

A package is an Agent Plugin. Its portable parts are exactly what that standard says: `plugin.json`, `skills/`, and optionally `mcp.json`. Beside the manifest sit the two authored files this section adds, and one namespace directory holds the views generated from them.

```text
<name>/
├── plugin.json                  the Agent Plugins manifest
├── descriptor.json              the draft Descriptor: every caller-facing fact
├── install.json                 the install file: every host-facing fact
├── skills/<job-slug>/           one skill per job, offering or step: SKILL.md, scripts/, references/
├── mcp.json                     servers by system name, no vendor (optional)
└── net.agentdoc.package/        NOT.md, RECORDS.md, SYSTEMS.md, generated
```

The manifest's extension entry for the namespace `net.agentdoc.package` carries pointers and digests, never copies:

```json
"extensions": {
  "net.agentdoc.package": {
    "descriptor": { "path": "descriptor.json", "sha256": "<digest>" },
    "install":    { "path": "install.json",    "sha256": "<digest>" },
    "built": true,
    "draft": true
  }
}
```

A package copied from another carries one more member here, `from`, naming the packages it descends from; Section 13.5 defines it, because copying is what a repository is for and nothing in an install reads it.

The namespace is the same for every conforming implementation, so any reader that knows this section finds the pointers under one key. A package MUST declare the Agent Plugins schema version that clients read, and an implementation SHOULD validate against a pinned copy of that schema rather than a fetched one, so that a moved or unavailable address cannot make a valid package unverifiable.

### 12.3 The draft Descriptor

The draft Descriptor is the only authored spelling of every caller-facing fact in the package. Every rule of Section 6 applies to it unchanged: no subject, shapes only and never an address, credential, or endpoint, an absent member means not stated, versioned by replacement with its digest over exact bytes. Its `refusals` member is prose, and a builder SHOULD write it as one sentence per line, because an evaluator turns each refusal into a probe and a line is the one boundary it can rely on.

Two members are added to the Descriptor by this section, both optional and both ignored by a consumer that does not know them, as 6.2.4 requires:

- **`records[]`**: what the agent must leave behind, each with a `name`, `when` (`per_task` or `standing`), and an optional `file`, a pattern relative to the records directory. A record is not an output: outputs are what a caller receives, records are what an operator and an auditor can inspect, and a caller reading outputs would be misled by a spend log listed among deliverables. An audit with the pattern is exact; without it, it falls back to the name.
- **`escalates[]`**: what always goes to a person, one sentence each.
- **`steps[]` on an offering**: the delivery steps the offering runs, in order, to deliver what it promises. A package's jobs are of two kinds: what a caller orders, which becomes an offering, and what the agent runs to deliver it, which becomes a step listed under that offering in the same shape (id, name, what it does, inputs, outputs). A step is not an offering unless it also stands as one, and a caller MUST NOT be shown a step as something it can order. Steps are one level deep. A builder that marks no job as offered offers them all, which is what every package before this member meant.

- **`how` on a job or a step**: how the work is actually done, in four members, each a single word from a fixed set. A job or step that carries none says nothing, which is what every package before this member meant.

  - **`control`**: who decides what happens next: `script` (a program written in advance, the same every time), `model` (a model decides), or `person` (a person acts).
  - **`intelligence`**: how a model is used: `none`, `called` (a program calls a model at a named point and takes its answer back), or `open` (a model is given the work and chooses its own way through).
  - **`cost`**: what running it can spend: `none`, `metered` (bounded by a declared ceiling), or `unbounded`.
  - **`contract`**: how much of the method is written down: `full` (every step of it), `ends` (what must come out, not how), or `goal` (only the aim).

  One combination is refused rather than described: `control: model` with `contract: full`. A method written down in full and then handed to a model to improvise is the shape that fails, because the model does not follow the written method and nothing checks that it did. Either the method is a program, and `control` is `script`, or the contract is loosened to `ends`. `control: script` with `intelligence: open` is refused for the same reason from the other side: a program that hands the work to a model to find its own way is not a program, it is a model with a launcher. A checker MUST refuse a package carrying either, naming the job or step.

  What this is for: a caller is entitled to know whether the step they are buying is a fixed program or a model improvising, an operator needs to know what can spend, and a builder needs to be stopped from writing a procedure in prose and hoping. The first multi-agent run failed three times in exactly one way, a step with a written procedure left to a model to improvise, and nothing in the package said which steps those were.

- **`run` on a job**: the exact command the host runs for this job, when there is one. A job MAY carry it only when its `how` says `control: script` and `intelligence` is not `open`; a job that says a program decides what happens next and then names no command is describing a program nobody can find. It has five members: `command`, the argument vector, first element the program; `per_file`, an argument fragment repeated once for each file the message brought, or absent when files are not passed; `message_file`, where the sender's text is written before the command runs, or absent when it is not needed; `reply`, either `stdout` or `json:<member>`, saying where the words for the sender are in what the command printed; and `escalate_when`, `json:<member>`, naming a member of that same output which, when it is present and not false, means the command has decided this turn needs judgment. The host then wakes the model as it would for a job with no command at all, and the command's own reply is not used. A job that never needs judgment omits it.

  Every element may carry placeholders, and the host substitutes exactly these and no others: `{home}`, `{package}`, `{records}`, `{work}`, `{job_dir}`, `{message_id}`, `{sender}`, `{handle}`, `{in_reply_to}`, and, inside `per_file` only, `{file_path}` and `{file_media_type}`. A placeholder the host does not know is an error at install, not at run: a command that silently ran with the literal text `{job_dir}` in it would be worse than one that refused.

  What this is for. A host that has a command for a job MUST run it and MUST NOT wake a model to decide whether to. The step is the same every time, it costs nothing to decide, and it cannot be improvised into something else. `{in_reply_to}` is the word `none` when the message answers nothing, so the command's own argument list never changes shape. A command that names `escalate_when` is not a model in disguise: the program still decides, every time, and what it decides is whether this one turn is one it can finish. The job's `job_seconds` still caps it, and a command that fails is a failed turn like any other: the sender is told, and finished work already filed is handed over.

- **Named run configs.** A package MAY ship named run configs, in the draft Descriptor's `run_config.named`, beside the settings they set (Section 6.2). They are the author's layer of Section 5.8, and they travel in the package because the builder is the one who has seen which choices produce good work. The settings a job may set are caller-facing and are declared in the draft Descriptor; the install settings of 12.4 section 3 are host-facing and stay in the install file. A run config never reaches an install setting.

A system in `systems[]` to which the agent sends a caller's material during the work SHOULD say so with `leaves: true`; a caller deciding whether to engage is entitled to know that their text leaves the agent.

### 12.4 The install file

The install file is the host-facing half. Everything in it is something an installer must have or do, and nothing in it is something a caller could act on. It MUST NOT contain a credential value, an address, an account identifier, or a host path outside the package: it names things, and the host resolves the names. Its `format` is `"agent-install-v1"`, and it has five sections:

1. **`runtimes[]`** and **`binaries[]`**: what must be present on the host before install proceeds, each with a purpose a person can read. The installer MUST check each and MUST stop and escalate when one is missing, never substitute.
2. **`dependencies[]`**: what the skills' scripts need, per skill, as a lockfile with integrity hashes carried under the skill's own folder, and the lockfile's digest. The installer MUST install from the lockfile into the agent's own home, never system-wide, and MUST NOT execute install-time scripts or lifecycle hooks of any kind.
3. **`systems[]`**: one entry per system name the Descriptor names, and no others; the two sets MUST be equal. An entry names its system in `name`, with `role` accepted as an alias for one revision on the same terms as Section 6.2's, so an installer MUST read either and MUST prefer `name` where both are present. Each entry says what kind of thing the system is bound to (`directory`, `mcp`, or `service`) and, for a service, the name of the credential the scripts expect, the environment variable they read it from, and whether the service spends and in what unit. Kind `mcp` binds the system to an entry in `mcp.json`, which names the server by the same name and carries no vendor address. A service whose scripts also read a non-secret value the host must supply, such as a billing project, lists it under `settings` by variable name and purpose; the instruction supplies the value at install, and the record names the variable.
4. **`ceilings[]`**: which spending systems need a ceiling, per what, and which side applies it. The install file says a ceiling is required; the owner's instruction sets the number. Each entry MUST carry `enforced_by`, one of two words. `runtime`: the runtime the agent runs in applies the number and nothing else can, because the package's scripts reach the spending system directly, with the credential this file names, and the call is made before any other party sees it. `platform`: the spending passes through a party that is not the agent, which can refuse a charge the runtime has already decided to make. The value follows from how the package reaches the system and never from whose machine the agent runs on: a ceiling over a system the scripts reach with a credential named here MUST say `runtime`, whoever installs the package, and `platform` is available only where the agent reaches the system through a facility the host supplies. What a reader may conclude: under `platform`, the ceiling outlives a runtime that ignores it, because a second party is still in the path; under `runtime`, the ceiling is worth what the party that supplied the runtime is worth, and a number in a record is what that party was asked to apply rather than a limit anybody else can hold it to. A spending system with no ceiling entry does not conform, and neither does an entry with no `enforced_by`: an unstated enforcing side is read as the weaker one by a careful reader and as the stronger one by a hopeful one, and the hopeful reading is a buyer believing somebody is watching the spend when nobody is. An entry MAY carry `suggested`, a number in the system's unit that the builder considers reasonable for one task or day; an approver's form MAY offer it as the default, and it binds nothing until the owner's instruction adopts it.
5. **`directories[]`**: the working directories the installer creates and binds, including where records land. A directory is bound at install to storage that outlives a single run, and a host that cannot bind one MUST refuse rather than create a directory of the right name that does not survive: a working directory that is discarded between messages looks filed and is lost, which is worse than no directory at all.

Beside the five sections the file carries one number, **`job_seconds`**: how long one job may take at most, a whole number of seconds; the host caps each job at it. A package that says nothing gets the host's default, and work that outruns it is stopped, so a package whose job takes minutes MUST say so. It sits beside `ceilings[]` rather than inside it because it bounds time rather than spending, and the host applies it whoever else applies a ceiling.

Beside them it carries one name, **`answer`**: which of the pieces this package files is the reply to the sender, as `{ "piece": "<name>" }`. A package that files a deliverable and does not say which one answers leaves that decision to the host, and the only thing a host has to decide with is what the work printed. For a command whose run declaration already names a reply that is fine. For an agent that wakes a model it is not: a harness prints every assistant text part, so its output is a transcript of thinking rather than a deliverable, and the tail of a transcript is the end of the thinking. A sender given that has been told nothing, and in a process the next agent is handed it as input and produces something that looks like work.

So a host MUST take the named piece as the reply when the package names one and that piece is filed and carries a text media type. A host MUST NOT treat a piece of any other media type as a reply: a reply is words in a message, and a page, a recording or an archive is a piece to fetch. Where a package names no piece, a host SHOULD offer the work somewhere to write its answer and take what is written there in preference to what was printed. What the work printed is the last resort in both cases, and a host SHOULD record which of the three it used, because a sender given the deliverable and a sender given the transcript cannot tell the difference from the outside.

A package that names a piece it does not file has a fault its author needs to hear, and the host MUST say so where an operator will read it. It SHOULD still answer with whatever the work did manage to say: the sender is a third party to that mistake and silence serves them worse.

### 12.5 Skills and the generated views

One skill per job, offering or step, named by the job's slug, and no skill without a job. A skill folder is an Agent Skill and MAY carry `scripts/` and `references/`; its instructions are the place for the long-form judgment an agent needs to do the job well, and this section places no limit on their length. A skill MAY ship an acceptance check, a script that reads the skill's declared outputs and answers pass or fail on their form; it judges form, never quality.

`NOT.md`, `RECORDS.md`, and `SYSTEMS.md` exist so that a harness which reads markdown has them, and for no other reason. They are projections of the two authored files, generated by the builder, MUST NOT be edited by hand, and a checker regenerates them and compares bytes.

### 12.6 The rules

1. **One authored spelling.** A caller-facing fact appears in the draft Descriptor and nowhere else in the package; a host-facing fact appears in the install file and nowhere else. The manifest points, the markdown projects, and neither restates.
2. **The inside matches the outside.** Every offering has exactly one skill and every skill an offering; every system name in the Descriptor has exactly one install entry and every entry a name; every `mcp.json` server is a declared system name. A script reaches a system under its declared name, through the credential and the variable the install file names for it (12.4 section 3). A script carrying its own endpoint has gone around its own declaration: the system it reaches is in no `systems[]` entry, nobody bound it at install, no ceiling covers what it spends, and a caller reading the Descriptor cannot see that the work leaves. That is this rule's fault and not rule 3's, and the difference is the fix: rule 3's is deleting an address from a declaration, and this one's is declaring the system a script was already using.
3. **Shapes in the Descriptor, names in the install file, values nowhere.** No file in a package contains a credential value, whatever kind of file it is: a secret inside a package is a secret published, and rule 7 has the credentials placed at install and nowhere else. Addresses, endpoints, and account identifiers bind the three authored declarations absolutely: the manifest, the draft Descriptor, and the install file MUST NOT contain one, and a depot MUST refuse to publish a package whose declarations do. Those three are where the package says what it is and what it needs, read by a caller deciding and an installer binding, and an address in one of them ties the package to a deployment, which is the one thing a package is not (12.9).

   **The addresses excepted are excepted by member and by file**, and every one of them is in the manifest: its own `$schema`, naming the version of the Agent Plugins schema the manifest is written against; `homepage` and `repository`, the Agent Plugins members that say where a reader goes to read about this agent and where its source is kept; and the `repository` of each `from` entry in the `net.agentdoc.package` namespace, which says where an ancestor of this package was copied from (13.5). The test they pass is the one `$schema` passes: each names where a **reader** goes, and nothing at install or at run fetches any of them. An installer MUST NOT fetch from one, and a harness MUST NOT give one to a script. The install file carries no address of any kind, excepted or not, because it is read while an agent is being bound and run, where an address becomes a place. The Descriptor carries one exception and carries no other: the `schema` of each `can_use` entry, which names a published shape a caller may send with a job. It passes the same test the manifest's exceptions pass. A shape identifier is read the way a page reads an itemtype, as a name that is spelled as an address so that anybody may publish a shape without a registry agreeing to it first, and nothing at install or at run fetches it. An agent MUST NOT fetch it and a harness MUST NOT give it to a script: what a job hands an agent is the profile, never the address the profile was shaped by. A checker reads this member structurally and holds every other part of the Descriptor to the rule, because an exception tested by looking for an address anywhere in the file is not an exception but a hole.

   0.16.0-draft and earlier forbade `homepage` and `repository` too, on the reasoning that a package with an address in it is tied to a deployment. That reasoning holds for an endpoint and does not hold for a link to the source: the reference client already writes both members from its own spec, and a rule that forbids members of the format this section builds on is a rule against the wrong thing. What a link like that cannot do is prove anything, since anybody may type one; the build record's `source` (8.2) is where a repository is attested rather than claimed, and a reader who needs to know where bytes came from reads it there.

   **A lockfile is exempt, and the exemption is not a hole.** 12.4 section 2 requires a lockfile with integrity hashes, and every lockfile names where each dependency's bytes came from, so a rule that forbade addresses everywhere would forbid the thing another rule requires. The addresses in a lockfile are the provenance of bytes a hash already fixes: they say where a byte sequence came from, never where the agent talks, and striking them would delete the record of what was fetched while changing nothing the agent reaches. That is the test, and it is about direction rather than about file type: an address in a declaration is read at install or at run and becomes a place; an address in a lockfile is the history of bytes that are already pinned. An address anywhere the harness reads or a script calls is rule 2's business and never this exemption's, and a checker reports it there rather than passing it as provenance.
4. **Nothing commercial.** A package carries no price for what it offers, no handling terms, and no claim about who may call the agent or whether a person attends it. Those attach at listing and at install, by whoever makes those decisions.
5. **One digest.** A package is published and installed as an archive, and its SHA-256 over the archive bytes is the package's digest. Every record that mentions the package names that digest.
6. **The bound Descriptor is the draft plus a subject.** The Descriptor a running agent serves MUST differ from the draft in its package only by the presence of `subject` and `signatures` and by the members the install decides: `interaction`, `shape`, and `agent_version` when the draft leaves it empty (rule 4 keeps those out of the package). The deployment record names which members the binding added or changed. Any other difference means the agent is not the package that was built, and a verifier reports it.
7. **Nobody runs a package's code but the agent.** The depot executes nothing. The installer executes nothing from the package. The agent's harness runs the skills' scripts, in the agent's own home, with the credentials placed for it and no others.
8. **No hidden characters.** A depot MUST scan every text file for zero-width characters, bidirectional controls, and the tag block before publishing, and refuse a package carrying one. Agent configuration has no gap between install and execution the way code does, so the check belongs at the door.

**The one commercial member a package may carry.** An offered job's `revisions` policy (Section 6.2) travels in the package, including the price of redoing each step, because the builder is the one who knows which steps stand on their own and roughly what each costs to run again; it is a proposal, not a listing. The operator MAY change any of it before the Descriptor is bound at install, and the bound Descriptor, not the package, is what the agent's node applies. Rule 4 is otherwise unchanged: the offering's own price, the handling terms and the door stay outside the package.

### 12.7 Publish, install, update, remove

**Publish.** A package is published to a depot by name and version, signed by its builder. A publish MUST carry the build record (8.2) whose `package.sha256` equals the digest of the bytes being published, and a depot MUST refuse a publish without one or with a digest that does not match. A published version is immutable; a version can be withdrawn, which marks it and stops new installs, and is never deleted, because deploy records point at it. A depot serves bytes by digest and indexes the draft Descriptor and the install file, so a search can answer what a package does, refuses, needs, and spends; a package whose install file declares nothing is indexed as "not stated", never as needing nothing. A depot MUST check every named run config in the draft Descriptor against the settings the same block declares, and MUST refuse a publish where a named run config repeats another's name, sets a setting the block does not declare, gives a value outside its setting's `allowed` or above a numeric rule's ceiling, or carries a digest that does not match its entry. A depot SHOULD expose list-versions, download, and publish over the registry HTTP API that Agent Package Manager clients speak, so the skills in its packages reach any client that installs plugins.

**Install**, on instruction from an owner and under the deployment manager's contract, in order: fetch by name and version and verify the digest against the build record and the manifest against the pinned schema; check every runtime and binary; create the agent's home and the declared directories; install the dependencies from each lockfile, executing nothing from the package; bind each system, a directory to a path under the home, an `mcp` entry to the address the instruction supplies, a service to the credential the instruction names, fetched from the owner's store and placed in the agent's environment, and refuse a request that contains a credential value before the value is used; set each required ceiling to the number the instruction gives, and stop when a spending system has none; translate the skills, views, and instructions into the form the target harness reads; mint the subject and bind the draft into the bound Descriptor by adding `subject` and the operator's signature, placed where the agent serves it; start the agent and check it with the grade stated, smoke or conformance; produce the deployment record (8.3) with the package digest, the bound Descriptor's digest, the credentials placed by name, the ceilings set, and the checks.

**Update** installs a new version under the same subject: `agent_version` MUST increase and the subject MUST NOT change; the old version's files are retained until the check passes, and a failed check restores them; the record names both package digests and both Descriptor digests. Rollback is an update to the previous version.

**Install alongside** installs another version of an installed package under the same subject without replacing the current one, so a job whose run config names that version can be done by it (5.8). The subject MUST NOT change, and no new subject, key or handle is minted. The version MUST differ from the current one and from every version already installed alongside, and MAY be lower or higher. The bound Descriptor stays the current version's, so what the agent declares to the world does not change. The install binds each system as an install does, from the instruction, so each version keeps its own install settings. A version installed alongside is reached only by a job that names it; a job that names no version, or the current one, is done by the current version. An update installs a new current version and leaves every version installed alongside as it was. The deployment record's `act` is `"alongside"`, and it names the package digest and how the version is reached.

**Retire a version** removes one version installed alongside and never the current one, which only an update or a removal changes. The deployment record's `act` is `"retire-version"`, and it lists what was removed and what remains, as a removal does. An installer SHOULD keep a version installed alongside while any run config it knows of names it, and SHOULD tell the owner before it retires one on its own.

**Remove** lists what was removed and what remains, under `remaining`, which is empty only when the removal was complete; placed credentials are removed and named. The subject's Descriptor history at the registry is not removed (6.7).

**The ledger.** An installer MUST record every file it placed and each file's digest, in the deployment record or in a ledger it names, and answer "what is deployed" by rehashing those files and reporting every difference, so a hand edit to a running agent's instructions is detectable rather than invisible.

#### 12.7.1 When the owner runs the agent

The install above assumes the installer reaches the machine: it places files there, and it can rehash them afterwards. An owner MAY instead run the agent on compute the installer never touches. The procedure does not become optional when that happens. It splits in two, and each side MUST record the half it performed and MUST NOT record the other. The two halves are two kinds of record, not two deployment records: building an image deploys nothing, so the builder's account is a build record naming the image digest (8.2), and the side that starts the agent produces the one deployment record for the deploy.

**What the installer still does.** Everything that happens before a running machine is involved, in the order above and with the same refusals: fetch by name and version and verify the digest against the build record and the manifest against the pinned schema; satisfy each runtime and binary the install file names by putting it in rather than probing for it, and stop and escalate where one cannot be satisfied; install the dependencies from each lockfile; create the home and the declared directories; translate the skills, views, and instructions into the form the target harness reads. What those steps produce is an image, and the installer records its digest in a build record (8.2). Rule 7 of 12.6 is easiest to break here, because running one of the package's own scripts during a build is a single line and looks like part of building: an image build MUST execute nothing from the package, and an image whose contents were produced by the code under review is an image no digest usefully describes.

**What the owner now does.** Supply the compute and start the image. Place each credential the install file names, from their own store, under the variable it names; the installer MUST NOT hold a credential for an agent it does not run, and an owner MUST NOT hand one back to it. Bind each directory system to storage that outlives a single run, each service system to its variable, each `mcp` system to its address. Set every required ceiling to a number, and cap each job at `job_seconds`. Both of those are now applied on the owner's side and by nothing else, by the runtime or, where a ceiling's entry says `platform`, by whatever the owner put in the path, so a reader MUST NOT take a ceiling named in a record as one a depot, a builder, or a network applies: the number was set on the side that spends. What the owner does not do is any part of the install. An image the owner rebuilt is a different image, and a deployment record names the digest of the image it started and never one it was handed for an image it did not start, so a rebuild shows up as a digest no build record matches.

**Who mints the subject, and who holds the key.** Section 4.1 allows a key generated on the host and a key provisioned to it, and running on the owner's compute settles neither, so the record MUST. Where the key is generated inside the owner's runtime at first start, the installer never holds it, and the bound Descriptor cannot exist before then, because the signature 6.6 requires is made with the subject's own key: the binding happens on the owner's side, and the deployment record that names the bound Descriptor's digest is produced after the agent has first answered rather than before it starts. Where the key is minted by the installer and provisioned into the image or its environment, two parties have held it, and everything the subject ever signs is a signature more than one party could have made. A deployment record MUST state which of the two happened and who holds the key now. A record that names the subject's key and stops leaves a reader unable to count the parties who can speak as it. The handle is unaffected either way: it is bound to the key at a registrar (8.6), and where the key was made does not enter.

**Who produces the deployment record, and what it can honestly claim.** A record carries what its producer observed and nothing else. An installer that built an image and handed it over produces no deployment record: it deployed nothing, and what it built is stated in its build record, which names the package digest, the image digest, each file's digest as built, and the checks it ran against the image. The side that starts the agent produces the one deployment record, and it is the only side that can: it names the image digest it started, the target, the credentials it placed, the ceilings it set and who applies them, the subject and the custody of its key, and the checks it ran after start. What it did not observe is absent (8.3), because a record carrying a ceiling nobody watched anyone set has said the ceiling was set. Where the producer is also the subject, the record is the subject's account of itself. It is a record under 8.1, verified and carried as one, and it moves nothing in an assembled view that the subject's own declaration could not have moved. A check the subject ran on itself is the subject's word, and signing it with the subject's key adds a signature, not a witness.

**The ledger, when the files are layers.** The ledger answers "what is deployed" by rehashing what was placed. In an image the files are layers, and the answer is the digest the runtime reports for the image it started, which the deployment record names, compared against the image digest in the build record of whoever built it. That is the stronger half of the exchange: one digest covers every file at once, and no file inside can differ from the file that was built without the digest differing. It is also the narrower half, because it covers nothing the runtime laid over the image at start. A mounted directory, a replaced instruction file, a variable holding a prompt: each changes what the agent does while the digest still matches. So every file the harness reads as instruction, meaning the skills, the generated views, and the draft Descriptor, MUST be inside the image, and a deployment that mounts one over the image does not conform. The directories bound at start are for what the agent writes, never for what it is told. An installer MUST still record each file's digest as built, in the build record beside the image digest, so that a reader can ask what is inside a layer without starting it.

#### 12.7.2 The workspace contract

Some runtimes describe a run rather than a machine: what is mounted, what is in the environment, which directories exist when the process starts. Part of the install file maps onto such a description and part of it cannot, and the split is the reason a package compiles to an image rather than to a workspace description.

**What maps.** `directories[]` maps directly, with the standing requirement that the one records land in outlives the run, which an image's own filesystem does not. In `systems[]`, a `directory` system maps to a mount, a `service` system to an environment entry under the variable name the install file gives, and an `mcp` system to whatever the run hands the harness as that server's address. The entries holding credentials are exactly the ones a run MUST NOT leave behind when it ends. What does not survive the mapping is the part of `systems[]` that is a statement rather than a binding: that a system spends, in what unit, and what the access is for. A workspace description carries the value and drops the reason, so an implementation MUST NOT treat one as a place those facts live.

**What cannot map.** `dependencies[]` needs a resolution that happens once, from a lockfile, before the agent answers, and 12.4 forbids satisfying it by executing the package. A description of a starting state has nowhere to put that work, and resolving it at each start is worse than not conforming: two starts produce two insides, and no digest in any record describes either. `runtimes[]` and `binaries[]` are a check that stops a deploy, and a starting state cannot stop anything. `ceilings[]` and `job_seconds` need a party that can refuse while the work runs, which is the opposite of a starting state: one is applied to spending as it happens, and the other is a clock watched to the end of a job.

**Therefore the image.** A package declares things that must be made true before the agent answers and things that must be enforced while it does. A workspace description states what a run begins with, and it neither makes nor enforces. So the package compiles to an image, where the resolution happens once and is fixed as bytes a record can name, and the workspace description is what the owner supplies around that image. An implementation MUST NOT present a workspace description as an install: it carries no dependency resolution, no runtime check, and no ceiling, and an agent started from one alone is an agent whose inside nobody established and whose spending nobody capped.

### 12.8 Provenance

Three records join by digest. The build record names the package digest, the draft Descriptor's digest, each lockfile's digest, and the checks the builder ran with their grade, `unrun` or `acceptance`, with `draft` always true; where its producer built an image from the package it names that image's digest too, and a package built once and compiled into an image later has two build records, one per thing made. The deployment record names what its producer observed, out of the package digest, the image digest it started, the bound Descriptor's digest, the subject and how its key was minted, the credentials placed by name, the ceilings and who applies them, and the graded checks; a member it does not name is one it did not observe (8.3), so a record of a deploy whose image somebody else built joins on the digests it does carry and is weaker rather than invalid. Where both image digests exist, comparing them is how a reader learns whether the agent was started from what was built, and the answer is the starter's word. The evaluation record (8.4) names the bound Descriptor's digest and the verdict.

A verifier fetches the package by the deployment record's digest and confirms the bytes hash to it; confirms the build record names the same digest and its signature verifies against the builder's key; fetches the draft from the package and the bound Descriptor from the agent and confirms they differ only by `subject` and `signatures`; confirms the bound Descriptor's signature verifies against the subject's key; and confirms the evaluation record names that digest. A verifier that completes all five knows what is running and who vouched for each step. It does not know that the work is good, which no document about an agent can say. The evaluation record is optional. A verifier without one knows what is running and who vouched for the build and the deploy, and nothing about whether the work is done; an AgentDoc prints that nothing has been evaluated rather than hiding it. An agent a person attends is not evaluated by probing, because the person would be answering; the deploy's own graded check is the check it carries.

**When the producer is the subject.** Where the owner runs the agent (12.7.1), the five checks are not equally affected, and a reader is owed the difference rather than the count.

The first two are untouched. They are about bytes and a builder's signature: fetching the package by the digest the deployment record names and confirming the bytes hash to it, and confirming the build record names that digest and verifies against the builder's key. Neither has ever depended on the machine.

The third still runs and means less. Both documents are still fetchable, so the comparison happens as before. What changed is who chose the package to compare against. The deployment record names it, and where that record's producer is the subject, the subject chose its own comparison target: the check then proves that the Descriptor served matches the draft in the package the subject named, which is consistency. It never proved that the code answering was built from that package. It is weaker now only because the second party who used to name the package is gone.

The fourth is unchanged, and was always narrower than it reads. Section 6.6 requires the Descriptor's signature to be made with the subject's own key, so the check confirms that the document was signed by the key it names as subject. It catches substitution between the agent and the reader. It has never caught a subject describing itself generously, and who runs the machine does not touch it either way.

The fifth is untouched and carries more weight here than anywhere else. An evaluator probes the agent at its address, and where the agent runs does not enter. Where the deploy is self-issued, the evaluation record is the only one of the five whose issuer is neither the builder nor the subject and whose evidence is the running agent's own answers. It remains optional, and its absence costs more in this arrangement than in one where a second party performed the deploy.

What none of the five establishes, before this section and after it, is that the process answering was started from the image a record names. A runtime that reports the digest it started can be asked, and the answer is that runtime's word, weighed as its key is worth. Where the owner runs the agent, that key is the owner's, and a verifier who wants better than the owner's word has only the evaluator's probes.

### 12.9 What stays out of a package

The agent's identity, handle, admission list, and attendance, which are the owner's decisions at install. Price and handling terms, which attach at listing, and which the Descriptor points at rather than holds. Evidence: the three records are about a package and never inside one. The runtime: a package declares what a host must have and never carries the harness that runs it. The image: a package is what an image is built from, and an image's digest names bytes that did not exist when the package was published, so a package carrying one would be naming its own successor; the build and deployment records carry it instead. Building one is how the harness the previous line keeps out of the package reaches the agent, which is what an image is for. The compute: nothing in a package says whose machine runs the agent, one package serves both answers, and a deployment record says which for one deploy. What a run begins with: the mounts, the variables, and the numbers of 12.7.2 are supplied per deployment and per run by whoever runs the agent.

### 12.10 Conformance

A checker verifies a package mechanically: the layout of 12.2; the manifest validates against the pinned schema and carries no address outside the four members 12.6 rule 3 excepts, `$schema`, `homepage`, `repository`, and each `from` entry's `repository`; the draft Descriptor conforms to Section 6 and carries no subject; the install file has its five sections with no values, addresses, or paths outside the package; no file anywhere in the package carries a credential value; a lockfile's addresses are the provenance rule 3 exempts and pass, while an address a script calls is reported against rule 2, naming the skill, because a system reached from a script is a system nothing declared; every ceiling entry names the side that enforces it, and an entry over a system the scripts reach with a credential the install file names says `runtime`; one skill per offering and one offering per skill; the system names in the Descriptor and the install file are the same set, read through the `role` alias where a package still spells it that way; no job or step declares a `how` that 12.3 refuses; every `run` names a command, sits on a job whose `how` allows one, and uses only the placeholders 12.3 lists; every `mcp.json` server is a declared system name with no address; every named run config sets only declared settings, with values each setting allows, under a name used once and a digest that matches its entry; the generated views match a fresh generation byte for byte; the manifest's digests match the files; and no text file carries a hidden character. A depot conforms when it refuses a publish without a matching build record, serves immutable versions by digest, marks rather than deletes on withdraw, indexes the two authored files, checks the named run configs as 12.7 says, and scans for hidden characters. An installer conforms when it follows 12.7 in order, stops on a missing runtime, binary, credential, or ceiling, executes nothing from the package, produces a bound Descriptor that differs from the draft only by subject and signatures, keeps the ledger, and states the grade of its check. An installer that produces an image conforms when it executes nothing from the package during the build, resolves each dependency once from its lockfile, places every file the harness reads as instruction inside the image, records the image digest and each file's digest as built in a build record (8.2), and produces no deployment record, because it started nothing. The side that starts the agent produces the one deployment record, and it conforms when it names the image digest it started, states how the subject's key was minted and who holds it in 8.3's `key_custody`, names each ceiling it set with the side that applies it, and carries nothing its producer did not observe. A deployment record does not conform when it names a target, a placed credential, a ceiling, or a post-start check its producer did not perform, or an image digest for an image it did not start. It conforms with members absent, and a checker that requires a member its producer could not have observed has made the honest record the failing one. An owner-run deployment conforms when every file the harness reads as instruction is the image's rather than mounted over it, when every required ceiling has a number applied by the side its install entry names, and when each job is capped at `job_seconds`.

## 13. How an agent is shared: the agent repository

Section 12 says how an agent travels to a host: a package is published to a depot, an installer takes it, and what the install leaves behind is an agent. It says nothing about where the agent was kept before it was packaged, and nothing about how somebody who reads a published agent comes to run a copy of it that is theirs. This section says both, in the form the work already has.

A package is bytes at a version, and an installer is the only reader that needs it. A repository is the agent over time: its files, its history, its license, and the record of where it was copied from. It is what a person reads, forks, changes and publishes again. The two are not alternatives and neither replaces the other: what a copy is made from is a repository, and what a deploy installs is a package built from one.

### 13.1 Terms

- **Agent repository**: a version-controlled directory holding one agent's whole public material, laid out as 13.2 says. One repository holds one agent.
- **Publisher**: whoever controls the repository. The publisher of a repository need not run the agent, and where they do, that running agent is a separate thing with its own identity.
- **Copy**: a repository whose contents came from another repository at a named commit, and whose package says so (13.5).

Host, harness, package, agent, depot, installer and image keep the meanings 12.1 gives them.

### 13.2 The layout

```text
<agent-name>/
├── agent-repo.json       the manifest of 13.3
├── README.md             what this agent is, for a person
├── LICENSE               the terms the license member names
├── package/              the Agent Package of 12.2, exactly those files
├── agentdoc.json         the package AgentDoc of 13.4, generated
├── test/                 the suites that check the package's scripts (OPTIONAL)
└── …                     whatever the publisher's own builder reads (OPTIONAL)
```

A repository MUST carry the manifest, a package that conforms to 12.10, and the package AgentDoc. Everything else is the publisher's.

**The package directory holds the package and nothing else.** The archive a publish carries (12.6 rule 5) is built from that directory alone, so a reader can see what a copy of this agent would install without being told which files count. A test suite, a license text, a builder's input file and a screenshot are all outside it.

**Where a repository carries the source its own tools build the package from**, the package MUST be what that source builds, and a check rebuilds it and compares (12.5's rule for generated views, applied to the package). This specification does not define that source: the package is the authored thing a copy takes, and defining a second spelling of the same facts is the thing 12.6 rule 1 exists to prevent. The reference client reads a file called `agent.json` and is documented with itself.

### 13.3 The manifest

`agent-repo.json` says that this is an agent repository, where each part of it is, and the two things outside it a reader may want:

```json
{
  "format": "agent-repository-v1",
  "package": "package",
  "agentdoc": "agentdoc.json",
  "tests": "test",
  "source": "agent.json",
  "depot": "https://depot.example/agents",
  "listing": "https://catalog.example/agents/quiz-maker"
}
```

`format` and `package` are REQUIRED, and so is `agentdoc`. `tests` and `source` name what the repository carries, and an absent one means it carries none. `depot` says where the published versions of this package are fetched from, and absent means nothing has been published. `listing` points at the publisher's own running agent, for a reader who would rather hire it than run a copy; absent means the publisher offers none, which is a different thing from not having said.

The manifest points and never copies. The name, the version, the license and the lineage are in the package's manifest (12.2), and restating any of them here would put two spellings of one fact in one repository, which is 12.6 rule 1 one level up.

### 13.4 The package AgentDoc

An AgentDoc (Section 9) describes an agent that exists: it names a subject and carries what other parties have attested about it. A repository has no subject, because a subject is minted at install (12.7). What a repository carries instead is a **package AgentDoc**: the same document, assembled from the package alone, carrying `package` in place of `subject` (9.4). It answers what any agent installed from these bytes will declare, and nothing at all about any agent that is running.

Four rules:

1. **It is assembled, never authored** (9.1). Every member comes from the draft Descriptor or the manifest, each cited at its digest, and a repository that types a claim into it has broken the one rule the format rests on.
2. **It carries no subject, no signature by a subject, no `standing`, no `access`, no price and no handling terms**, and names each of them in `not_stated`, because silence is printed rather than left to look like an unimportant omission (9.6).
3. **It carries no assembly time and no staleness**. It is fixed to the package in the same commit rather than to a moment, and a checker regenerates it from the package and compares bytes, which is 12.5's rule for the generated views.
4. **A repository MUST NOT carry the AgentDoc of a running agent.** That document names a subject and carries its records and its standing, and a copy that shipped one would present another agent's identity and another agent's history as its own, which is exactly what a copy never inherits (13.6). Where the publisher runs the agent, that agent serves its own AgentDoc at its own address (9.2), and the manifest's `listing` is how a reader gets to it.

### 13.5 Copies and lineage

A copy is a new repository whose contents came from another at a commit. What makes it readable as a copy is one member in the package's manifest, in the namespace 12.2 defines:

```json
"extensions": {
  "net.agentdoc.package": {
    "descriptor": { "path": "descriptor.json", "sha256": "<digest>" },
    "install":    { "path": "install.json",    "sha256": "<digest>" },
    "from": [
      { "name": "quiz-maker", "version": "1.2.0",
        "repository": "https://github.com/example/quiz-maker",
        "commit": "9f2c…", "license": "Apache-2.0" }
    ]
  }
}
```

Each entry names a package this one descends from, as that package named itself, the repository and commit it was taken at, and the license it stated there. Entries are ordered nearest ancestor first. A copier prepends its parent and keeps every entry the parent carried, so the chain is still readable when a repository in the middle of it goes private or disappears.

**`from` is provenance and nothing else.** Nothing fetches it at build, install or run; an installer MUST NOT resolve an entry, and a consumer MUST NOT read one as a dependency. A new version of an ancestor obliges a copy nothing, and an ancestor's publisher never reaches into a copy. This is the same rule Agent Processes gives the `from:` line of an adopted process, for the same reason: a copy is the copier's, and provenance that quietly acts as a dependency makes it somebody else's again.

**The license is the package's, and this document does not interpret it.** The manifest's `license` member states it. A repository whose package states no license gives nobody permission to copy it, whatever its visibility, and a reader who finds none has found the answer rather than an omission. `from` carries every ancestor's license so that a reader sees all the terms in the chain and not only the last one.

**A copy SHOULD take a name of its own.** A depot addresses a package by name and version (12.7), so two copies published under one name cannot be told apart by anything a reader can see, and a depot MUST NOT accept a publish under a name another publisher holds.

### 13.6 What a copy does not inherit

**An identity.** A subject is minted at install, so a copy gets its own the first time somebody deploys it (12.7), and it is a different agent from the one it was copied from on the day it first answers.

**What others attested.** A build record names a package digest, a deployment record names a subject, an evaluation record names a bound Descriptor's digest (Section 8). A copy is none of those things, and no record of an ancestor covers it.

**Reputation.** Nothing an ancestor's subject earned attaches to a copy. An assembler MAY show `from` as lineage, and MUST NOT carry any ancestor's records, verdicts, or reputation into a copy's assembled view. A copy with nothing attested about it is a copy with nothing attested about it, and 9.6 requires that be printed rather than filled in from its parent.

**Bindings.** What the original runs against is in its deployment record and belongs to its owner's stack. A copy is bound at its own install, from its own owner's stack, and a package carries no binding at all (12.9).

### 13.7 Publishing from a repository

A repository holds the source and its history. It is not where a published version's bytes are kept, and an implementation MUST NOT present one as a depot. A tag can be moved, a release can be deleted, and a repository can be taken private or removed, while a deployment record names a package digest that has to stay fetchable for as long as anything cites it (12.7). A version is published to a depot, from a commit, as 12.7 says.

Three documents then join, and each says what its own producer knew. The deployment record names the package digest that was installed. The build record names that same digest and, in `source` (8.2), the repository and commit the builder read. The repository at that commit holds the files, the license and the lineage. A reader who has the running agent has all three, in that order, and a reader who has only the repository has everything except what anybody did with it.

A repository SHOULD tag the commit a version was published from with that version, so the release a digest came from can be found by name as well as by digest.

### 13.8 What stays out of a repository

An identity or a handle. A credential value, in any file, for the reason 12.6 rule 3 gives one level up: a secret in a repository is a secret published, and a repository is readable by everyone the moment it is readable at all. Bindings: the products behind system names, addresses, and key stores, which belong to a deployment record. Run records, working directories and whatever the agent remembers. Deployment and evaluation records, which are about a running agent. The AgentDoc of a running agent (13.4). Price and handling terms, which attach at listing and at install (12.9).

### 13.9 Conformance

A checker verifies a repository mechanically: the manifest declares `agent-repository-v1` and every path it names exists; the package at that path conforms to 12.10; the package AgentDoc regenerates from the package byte for byte and carries no subject, no standing and no signature; no file anywhere in the repository carries a credential value, and none is a Descriptor with a subject; each `from` entry carries a name, a version, a repository and a commit; and where the manifest names a source, the package is what that source builds. A directory that fails one of those is not an agent repository, whatever else it holds.

What a checker cannot answer, here as everywhere in this document, is whether the agent is any good, or whether the license permits what a copier did with it.

## 14. Conformance

The floor is checked mechanically, and a conforming deployment ships the checker: a program that asks Section 4's exchanges of an agent and treats silence as failure, because absence of an error is not evidence of permission. The interview of Section 4.3 is the template. Descriptor checking is Section 6.8's; AgentDoc checking is Section 9.10's. Attribute claims are checked by fetching their artifacts. Behavioral conformance to interfaces and roles is the evaluator's territory, and its verdicts are Section 8.4 records.

Byte-exact obligations are pinned by conformance fixtures, under the family's fixture doctrine: the fixture is the authority, and when an implementation disagrees with it, the implementation is what changes; every case is checkable without a network or a clock, cases whose verdict depends on time carrying their own now; and a fixture contains cases that MUST be accepted as well as cases that MUST be refused, because a fixture of refusals alone is passed by an implementation that refuses everything. Fixture identities are test vectors and control nothing.

Nothing in this section produces a score.

## 15. Out of scope

The harness, the model, and everything about how the agent thinks. The quality of the work. The network wire: envelopes, subjects, delivery semantics, and transport credentials belong to bindings. Settlement and payment. Whether the subject is any good: the assembled view reports what was said and by whom, judgment is a matchmaker's job, and quality is the reputation bureau's. Discovery: finding agents is a directory's job. Human organizational structure beyond what the mandate chain proves. And any composite mark, badge, or level that does not decompose into checkable attributes.

## Appendix A: the migration map

Where each section's text came from, and what stays behind. Transport-specific terms (subjects, endpoints, buckets, broker mechanics) were neutralized throughout; the sources keep the bindings. The sources were cut down on 2026-09-01: each affected section of AgentMesh SPEC.md, EXT-6, EXT-7, EXT-8, EXT-10, EXT-12, and the roles registry's entryway now carries a governing note naming its chapter here, and this document governs the agent's behavior. The sources remain authoritative for what stays behind: the bindings.

| Section here | Source | Stays behind at the source |
|--------------|--------|---------------------------|
| 4.1 | AgentMesh SPEC §4.3, §8.2 (`encryption_key`, `trust`) | Vouching, registration subjects, key-claim encoding, node credential lifecycle. |
| 12 | New text, 2026-09-05, condensed from the AgentMesh working draft `docs/agent-package-draft.md` | The longer rationale, the worked install file, and the AgentMesh implementation plan. |
| 13 | New text, 2026-09-15 | Nothing: the agent repository is defined here first. |
| 4.2 | SPEC §10.14, §8.7, §9 intro | Registry listing mechanics, the registrar path derivation, the describe subject. |
| 4.3 | SPEC §3.3.1, §1.5 invariant 4 | Invariants 1, 2, 3, 5 (name and wire layer). |
| 4.4 | Roles registry §17 (the entryway), promoted from optional to floor | The registry keeps role-shaped interfaces and its conformance harness text. |
| 4.5 | SPEC §3.3 | Inbox subject naming. |
| 4.6 | SPEC §6.4, §10.7 | Wire spelling of the refusal. |
| 4.7 | SPEC §10.8, §10.8a, §22.7, Appendix D | Byte-level refusal encodings. |
| 4.8 | SPEC Appendix D.1, §22.2 through §22.6, §7.5.3 | The fence bytes, window numbers, and signed envelope formats (fixture-pinned per binding). |
| 5.1, 5.2 | SPEC §7.0 through §7.4, §6.4, §6.4a | Task object wire shape, KV and stream bindings. |
| 5.3 | SPEC §7.5, §7.5.1, §7.5.3, §7.5.4, §7.5.5 | Store-operator rules (§7.5.2), stream chunk encoding (§11). |
| 5.4 | SPEC §7.7, §12.2, §19.3, §6.4a | Currency encoding details, budget conformance vectors. |
| 5.5 | SPEC §13.5, §19.3 | Metering event subjects. |
| 5.6 | SPEC §7.6 | none. |
| 6.1 through 6.8 | The Agent Descriptor specification 0.2.0-draft, absorbed whole; descriptor-spec.html is now a rendering of this chapter | Nothing; the standalone standard is retired. |
| 6.9 | SPEC §8.3a, §8.5, §8.5.1, §8.5.2, §8.9, §8.10, §8.11, §8.12 | Manifest schema plumbing, registry materialization, A2A card projection. |
| 7.1 | EXT-6 admission 0.3.0 | Guarded-inbox relay, roster HTTP store, held-ledger and proposal wire protocols. |
| 7.2 | EXT-7 pairwise sealing | Wire-field encodings, the Rooms sealed-key lineage. |
| 7.3 | EXT-10 screening 0.3.0-draft | Request and verdict JSON layouts, configuration file shape, provider survey, screener-as-a-service packaging. |
| 7.4 | EXT-12 systems health 0.1.0-draft | Store name, CLI verb spellings, grants-ledger sequencing. |
| 7.5 | EXT-8 allowance 0.1.0 | Store-and-sync posture, fixture mechanics, event subject plumbing. |
| 7.6 | SPEC §19.1, §19.2, §19.3, §19.5, §19.6 | The billing provider rail (§19.4), event subjects, ledger and clearing. |
| 8.2 through 8.4 | The reference producers (agentbuilder pack, deploymgr record, agenteval run) and the roles registry §12.3, §11.3, §13.3 | The producers' code; Section 8.5 lists the deviations. |
| 9 | The AgentDoc specification 0.8.0-draft, absorbed whole; spec.html is now a rendering of this chapter | Nothing; the standalone standard is retired. Its per-version changelog remains on the page. |
| 10 | This document's own synthesis of the family | none. |

## Changelog

Every version of this specification and what it changed is recorded in [CHANGELOG.md](CHANGELOG.md), newest first. Each version is tagged in this repository as `v` followed by the version, such as `v0.26.0-draft`.
