# Reference process: Onboard an Agent

`ref/gm/onboard-an-agent v2`

An organization has decided it wants an outside agent to take on a
piece of its work, and this process brings that agent in the way a new
employee or contractor is brought in. The agent is checked against what
it declares about itself and interviewed before anyone signs anything,
and its code is inspected without being run. Where the work involves
confidential material, an Agent NDA is signed first. The terms are
agreed and the engagement is formed under Agent SoW, and the agent is
given a mandate no wider than the work needs. Then it comes in the way
every agent comes in, whoever built it: it passes Admission, and only
then is it deployed. Where the organization wants a trial, it is
admitted for a trial first, deployed to a test environment and tried
against a pass line agreed in advance, then admitted again to go live.
It is given access that ends when the engagement ends, deployed, checked
against its own declarations, handed the context it needs, and put into
the work. The run closes when the agent is working, every grant it holds
is on one list with an end date, and the people working beside it know
it is there.

This is a reference process. It is a first draft for an organization to
adopt and argue with. Its owner, its
dates, its numbers and its roster are blank, and the adopting
organization fills them in. Every phase is an act another Common Agent
Standard already defines, and the table at the end says where each one
is specified. The process is written from the side of the organization
bringing the agent in. The agent's owner is a counterparty, and what
happens on their side is not a phase of this document. Inside the
organization the sponsor answers for the agent, and it is the sponsor's
yes or no that each admission records.

## The activities

| # | Activity | What happens | Agents |
|---|---|---|---|
| 1 | Take in the Request | the work, the team, the systems, and who sponsors it | sponsor (person) |
| 2 | Verify the Agent | Descriptor and records verified, reputation read | supplier-check |
| 3 | Interview the Agent | the five questions asked and checked against declarations | supplier-check |
| 4 | Inspect the Agent | its code read without running it, and the inspection report written, with no verdict | [inspector](https://agentroles.ai/inspector.html) |
| 5 | Sign the NDA | an Agent NDA signed, where the work is confidential | signature-manager · sponsor (person) · agent's owner (person) |
| 6 | Agree the Terms | the terms scored against the standard terms | terms-check |
| 7 | Form the Engagement | the Agent SoW engagement signed by both owners | signature-manager · sponsor (person) · agent's owner (person) |
| 8 | Grant the Mandate | a mandate no wider than the engagement needs | spending authority (person) · budget-keeper |
| 9 | Admit for a Trial | where there is a trial, the admission rules checked and the sponsor's yes recorded, for a test environment only | [admission checker](https://agentroles.ai/admission-checker.html) · sponsor (person) |
| 10 | Deploy for the Trial | the trial copy placed in the test environment, with its outputs held aside | [deployment manager](https://agentroles.ai/deployment-manager.html) |
| 11 | Run the Trial | the trial copy tried against the pass line the engagement states | certification-check |
| 12 | Admit to Go Live | the admission rules checked and the sponsor's yes or no recorded | admission checker · sponsor (person) · security reviewer (person) |
| 13 | Grant Access | each grant scoped to the engagement, with an end date | tool-administrator |
| 14 | Deploy the Agent | the agent placed where the admission record lets it | deployment manager |
| 15 | Check Conformance | its own declarations tested on the agent as deployed | [conformance checker](https://agentroles.ai/conformance-checker.html) |
| 16 | Hand Over the Context | the material, documents and contacts the agent needs | handover-coordinator |
| 17 | Put the Agent into the Work | the roster updated and the register entry opened | supplier-manager |
| 18 | Record What Was Learned | what to repeat, what to avoid | supplier-manager · sponsor (person) |
| 19 | Close a Rejected Onboarding | closed with its reason, and nothing left granted | sponsor (person) |

## What the graph says

The graph is a single line with three branches that do not always run.
Verification and the interview come before anything is signed, because
both read only what the agent publishes about itself, and nothing
confidential has to reach the agent for either of them. Inspection
reads the agent's code at a named commit, and its agent card, without
running it. It says what the agent does, the systems it uses and what
the organization must supply for each, its risks, its tests and its
portability, and it gives no verdict. An agent reached only through its
A2A agent card, whose code the organization is not given, has nothing
to inspect, so inspection is marked as a phase that does not run in
every run, and that agent goes to admission with its card and its
verified declarations. The NDA comes next where the work needs one. It
is marked the same way, so a run with no confidential material goes
straight from the interview to the terms and nothing waits for an
agreement that was never needed.

The mandate is granted after the engagement is formed and before the
agent is admitted. The order matters. An agent that is admitted before
its mandate exists can be asked to commit the organization to something
with nothing saying how far it may go, and an agent given a mandate
before an engagement exists holds authority with no terms behind it.

Admission is the one way in, and it runs twice where there is a trial.
The first admission lets the agent into a test environment only, with
its outputs held aside and its outside access limited, and the
deployment manager places the trial copy there. The trial grades that
copy against the pass line. The second admission reads the inspection
report and the trial result against the organization's admission rules,
marks each rule passed or failed with the line behind it, and records
the sponsor's yes or no. The trial is the third branch that does not
always run: an organization that needs none goes from the mandate
straight to the admission to go live. At each admission the admission
checker checks and records and deploys nothing; the deployment manager
carries out the signed record. An agent turned away stays out at that
version.

Access is granted only after the agent is admitted to go live, and each
grant ends no later than the engagement. The deployment manager then
places the agent where the admission record lets it: in a harness the
organization runs in its own environment, with the AgentMesh Adapter
beside it, or on the organization's platform, or, for an agent reached
by its card, by registering its A2A agent card, where nothing is
installed. A conformance checker that had no part in bringing it in
tests the agent as deployed against its own declarations before the
context is handed over and the agent is put into the work.

Two things in the run come from the agent's owner: the engagement they
propose, which `agree-terms` reads as it arrived, and their signatures on
the NDA and the engagement. The process records what arrived and when,
and makes no claim about what happened on the other side to produce it.

Five edges point backwards. A verification that fails returns the run to
the request, where the sponsor either names another candidate or closes
the run. Interview answers that contradict the signed declarations
return the run to verification, because the declarations are what the
organization is entitled to rely on and they have to be read again. A
trial that falls short because the agent lacked something it needed
returns the run to the trial deployment, with the gap named. The
admission to go live can send the run back to the trial with the
findings named. And a failed conformance case returns the run to the
admission to go live, which reads the failure against the rules.

## The document, with the blanks marked

```
PROCESS: onboard an agent             id: <team>/onboard-an-agent   v2
from: ref/gm/onboard-an-agent v2
owner: <who>                          effective: <date>
trigger: a request to bring an outside agent into <your team's work> is
         approved in <your request or procurement process>
         watch: record=<the request>
                system=<your request or procurement process>
                change=<the request is approved, with a sponsor named>
concurrency: runs may overlap - <how many> onboardings open at once,
             and one agent is onboarded by one run at a time
goal: the agent working in the organization under a formed engagement
      and a mandate no wider than the work, admitted on a signed
      admission record and checked as deployed, with every grant it
      holds on one list with an end date, and the people beside it told
phases:
  take-in-request  - human: what work the agent will do, for which
                     team, on which systems and with which data, who
                     sponsors it, and whether the work involves
                     confidential material
                     owner: <your sponsoring role>   after: trigger
                     automation: <level>
  verify-agent     - harness: the agent checked against what it
                     declares: its signed Descriptor verified and
                     current, its build, deployment and evaluation
                     records read at their versions, and its reputation
                     report read with the date it was issued
                     owner: supplier-check       after: take-in-request
                     by: <days>                  automation: <level>
  interview-agent  - harness: the five questions asked, each answer
                     compared with the signed declarations, and
                     questions outside its offerings asked so its
                     refusals can be read
                     owner: supplier-check       after: verify-agent
                     by: <days>                  automation: <level>
  inspect-agent    - harness: the agent's code at a named commit, and
                     its agent card, read without running anything, and
                     the inspection report written: what it does, each
                     system the code reads marked Required, Optional or
                     any one of these with what the organization must
                     supply, each risk at its place in the code, its
                     tests, and its portability, with no verdict; it
                     runs where the organization is given the code
                     owner: inspector            after: interview-agent
                     by: <days>                  automation: <level>
  sign-nda         - convenes approval: an Agent NDA signed by both
                     sides at one version, naming what is confidential
                     and for how long, before any confidential material
                     reaches the agent
                     owner: signature-manager    after: interview-agent
                     by: <days>                  automation: never
  agree-terms      - harness: the engagement the agent's owner
                     proposes, as it arrived and at its version, scored
                     clause by clause against <your standard terms>:
                     scope, price and cap, term, termination, disputes,
                     confidentiality and retention, and access
                     owner: terms-check
                     after: interview-agent + sign-nda?
                     by: <days>                  automation: <level>
  form-engagement  - convenes approval: the Agent SoW engagement signed
                     by both owners at one version, carrying
                     <your purchase reference> where the organization
                     uses one
                     owner: signature-manager    after: agree-terms
                     by: <days>                  automation: never
  grant-mandate    - human: a mandate issued to the agent under
                     <your charter>, with the powers, the counterparties
                     and the amounts the engagement needs and no more
                     owner: <your spending authority role>
                     after: form-engagement
                     by: <days>                  automation: never
  admit-for-trial  - convenes approval: where there is a trial, the
                     inspection report, or for an agent reached only by
                     its card the card and the verified declarations,
                     checked against <your admission rules> for a
                     trial, each rule marked passed or failed with the
                     line behind it, and the sponsor's yes or no
                     recorded with who and when; the signed admission
                     record lets the agent into <your test environment>
                     only, with its outputs held aside and its outside
                     access limited
                     owner: admission-checker
                     after: grant-mandate + inspect-agent?
                     by: <days>                  automation: never
  deploy-for-trial - harness: the trial copy placed in <your test
                     environment> as the trial admission record lets
                     it, or its A2A agent card registered there, with
                     the material the trial needs at its versions; the
                     deployment manager answers with where the copy
                     runs and the signed deployment record
                     owner: deployment-manager   after: admit-for-trial
                     by: <days>                  automation: <level>
  run-trial        - harness: a trial run on <your trial work> against
                     the pass line the engagement states, graded on the
                     trial copy, with every result kept beside the line
                     it was scored against
                     owner: certification-check  after: deploy-for-trial
                     by: <days>                  automation: <level>
  admit-to-go-live - convenes approval: the inspection report, or the
                     card and the verified declarations, and the trial
                     result where there was a trial, checked against
                     <your admission rules> to go live, each rule
                     marked passed or failed with the line behind it,
                     and the sponsor's yes or no recorded with who and
                     when; the signed admission record lets the agent
                     in with its owner, its way in and the rules it
                     runs under, or turns it away with the reasons
                     owner: admission-checker
                     after: grant-mandate + inspect-agent? + run-trial?
                     by: <days>                  automation: never
  grant-access     - human: each grant the agent needs made with its
                     scope written down and an end date no later than
                     the engagement's end, within what the admission
                     record allows
                     owner: tool-administrator   after: admit-to-go-live
                     by: <days>                  automation: <level>
  deploy-agent     - harness: the agent placed where the admission
                     record lets it: in <your harness> run in the
                     organization's own environment with the AgentMesh
                     Adapter beside it, or on <your platform>, or, for
                     an agent reached by its card, its A2A agent card
                     registered and nothing installed; the deployment
                     manager answers with the agent's name and the
                     signed deployment record
                     owner: deployment-manager   after: grant-access
                     by: <days>                  automation: <level>
  check-conformance - harness: the test derived from the agent's own
                     declarations, run against the agent as deployed,
                     with each case confirmed, failed or flagged
                     owner: conformance-checker  after: deploy-agent
                     by: <days>                  automation: <level>
  hand-over-context - harness: the material, the process documents and
                     the contacts the agent needs to start, given at
                     their versions, with what was withheld and why
                     owner: handover-coordinator after: check-conformance
                     by: <days>                  automation: <level>
  go-live          - human: the agent put into the work: the roster
                     updated, the register entry opened with the
                     engagement's end date, and the people working
                     beside it told what it does and whom to ask
                     owner: supplier-manager     after: hand-over-context
                     automation: <level>
  record-learnings - convenes debrief: what to repeat, what to avoid
                     owner: supplier-manager     after: go-live
                     automation: <level>
  close-rejected   - human: the onboarding closed with the reason the
                     agent was not brought in, and the sponsor told
                     owner: <your sponsoring role>
                     after: verify-agent or admit-for-trial or
                            admit-to-go-live, whichever ended the
                            onboarding
                     by: <days>                  automation: never
run-scoped:
  status - harness: a status report      owner: supplier-manager
           every: <cadence>
           from: verify-agent   until: go-live
           automation: <level>
handoffs:
  take-in-request -> verify-agent [agent-request]: the work, the team,
    the systems and data the agent will need, the sponsor, and whether
    confidential material is involved
  verify-agent -> interview-agent [agent-verified]: the Descriptor
    digest that was verified, each record read with its version, the
    reputation report with its date, and every check that could not be
    made with the reason
  interview-agent -> inspect-agent [interview-for-inspection]: each of
    the five answers beside the declaration it was compared with, and
    where the agent's code is, at its named commit, with its agent card
  interview-agent -> sign-nda [agent-interviewed]: each of the five
    answers beside the declaration it was compared with, and every
    difference found
  interview-agent -> agree-terms [interview-for-terms]: the same record,
    which the terms are read against
  sign-nda -> agree-terms [nda]: the agreement's identifier, version and
    digest, what it makes confidential, and for how long
  agree-terms -> form-engagement [scored-terms]: every clause that
    departs from the standard terms, by how far, and the answer given
  form-engagement -> grant-mandate [engagement]: the engagement's
    identifier, version and digest, its scope, price and cap, its end
    date, and the purchase reference where there is one
  inspect-agent -> admit-for-trial [inspected]: the inspection report,
    tied to the repository and the commit digest
  inspect-agent -> admit-to-go-live [inspected-for-go-live]: the same
    report
  grant-mandate -> admit-for-trial [mandate-for-trial]: the mandate's
    identifier, the powers it grants and the amounts it allows
  grant-mandate -> admit-to-go-live [mandate]: the same mandate
  admit-for-trial -> deploy-for-trial [trial-admission]: the signed
    admission record for a trial: the test environment, what is held
    aside, and the outside access allowed
  deploy-for-trial -> run-trial [trial-copy]: where the trial copy
    runs, the material given for the trial at its versions, and the
    signed deployment record
  run-trial -> admit-to-go-live [trial-result]: each result beside the
    pass line it was scored against
  admit-to-go-live -> grant-access [go-live-admission]: the signed
    admission record to go live: the agent's owner, its way in, and
    the rules it runs under
  grant-access -> deploy-agent [access-granted]: every grant the agent
    holds, with its scope and its end date
  deploy-agent -> check-conformance [deployed-agent]: the agent's name,
    or its registered card, and the signed deployment record
  check-conformance -> hand-over-context [conformance-checked]: every
    case confirmed, failed or flagged, signed by the conformance checker
  hand-over-context -> go-live [context-given]: what was handed over at
    which version, and what was withheld and why
  go-live -> record-learnings [register-entry]: the opened register
    entry, with the engagement's end date and the access list
deviations:
  verify-agent -> take-in-request [verification-failed]: the agent's
    declarations do not verify, or its records do not support the work,
    so the request is taken in again with another candidate or closed
  interview-agent -> verify-agent [answers-contradict]: the interview
    answers contradict the signed declarations, so the declarations are
    read again at their current version
  run-trial -> deploy-for-trial [missing-context]: the trial fell short
    because the agent lacked material it needed, so the trial copy is
    given it again with the gap named
  admit-to-go-live -> run-trial [trial-not-passed]: the trial did not
    meet the pass line, so it is run again against the findings named
  check-conformance -> admit-to-go-live [conformance-failed]: a case
    the agent's own declarations promise failed as deployed, so the
    admission is read again with the failure named
bindings:
  roster:  <who holds each role - agents claiming the abstract agents
           above, an inspector, an admission checker, a deployment
           manager and a conformance checker, none of them the agent
           being brought in, named people for the sponsor, the
           spending authority and the security reviewer, and the
           agent's owner, who is the counterparty>
  systems: <your request or procurement process> (read),
           the register of outside parties (write), <your agreement
           store> (write), <your access control> (write),
           <your mandate registry> (write), <your test environment>
           (write), <your harness> or <your platform> (write)
  data:    <your standard terms> <version>, <your charter> <version>,
           <your security and privacy standards> <version>,
           <your admission rules> <version>
policy:
  nothing confidential reaches the agent before the NDA is in force
  the agent is not admitted, for a trial or to go live, before the
    engagement is formed and the mandate is granted
  no agent is deployed, for a trial or to go live, without a signed
    admission record that carries the sponsor's yes; the admission
    checker checks and records, and the deployment manager carries out
    the record
  a trial copy runs only in <your test environment>, with its outputs
    held aside and its outside access limited
  an agent turned away at admission stays out at that version
  every grant carries an end date no later than the engagement's end
  the mandate is no wider than the engagement needs
  signing the NDA, forming the engagement, granting the mandate and
    the yes at each admission are human gates and are never delegated
    to an agent
measures:
  cycle time: <target> from the approved request to go-live
  coverage: <share> of grants on the access list with an end date
  quality gate: no agent goes live without a formed engagement, a
                mandate, a signed admission record and a passed
                conformance check, and a passed trial where there was
                one
records:
  verification-report - the Descriptor digest, each record read with its
                        version, and the reputation report with its date
  interview-record    - each answer beside the declaration it was
                        compared with
  inspection-report   - what the agent does, its systems, its risks, its
                        tests and its portability, tied to the commit
  trial-record        - the signed admission record for a trial, and the
                        trial's results, where there was one
  admission-record    - the signed admission record to go live: each
                        rule passed or failed with the line behind it,
                        and the sponsor's yes or no with who and when
  access-list         - every grant the agent holds, with its scope and
                        its end date, read again at offboarding
  deployment-record   - where the agent was placed, and the signed
                        deployment record
  evaluation-record   - every conformance case confirmed, failed or
                        flagged, signed by the conformance checker
```

## The records a run leaves

Each phase leaves the record its own kind of work produces. The two
signing phases and each admission leave their approval records, and
the harness phases leave one closing record each. The admission records
are signed by the admission checker and carry the sponsor's yes or no.
Eight records matter across the whole run, and the document names them
in its `records:` block. The access list matters most. It is the list
the offboarding process reads when the engagement ends, and every grant
on it has to carry an end date for that reading to work.

The run closes:

```
RUN DONE: <team>/onboard-an-agent v2 · run <n>
outcome: <completed | abandoned>
result: <the agent in the work under its engagement and mandate>
open: <what nobody finished, and who may close it>
```

## The failure edges

- **The declarations do not verify.** The run returns to the request.
  An agent whose signed Descriptor does not verify has nothing the
  organization can rely on, and the right next step is another
  candidate or a closed request, recorded with the reason.
- **The interview contradicts the declarations.** The signed
  declarations govern, and the run reads them again. Where they still
  do not support the work, the run closes as rejected.
- **The inspection finds a risk the rules do not allow.** The report
  names it and its place in the code, and gives no verdict. The
  admission marks the rule failed with that line behind it, and the
  sponsor decides. An agent turned away stays out at that version, and
  the run closes as rejected.
- **The agent's owner will not sign the NDA.** The run stops before any
  confidential material moves. The sponsor decides whether the work can
  be done without that material, which removes the NDA phase from the
  run, or the run closes as rejected.
- **The terms cannot be agreed.** The departures stay on the scored
  list with the answer given to each, and the run waits. An engagement
  formed on terms nobody scored is the failure this phase exists to
  prevent.
- **The mandate cannot be as narrow as the work.** The spending
  authority narrows the engagement through an amendment, or the run
  stops. A mandate wider than the engagement is authority with no terms
  behind it.
- **The trial does not pass.** The run returns to the trial, or to the
  trial deployment when the agent lacked something it needed. A trial
  passed by changing the pass line has not been passed.
- **A conformance case fails as deployed.** The run returns to the
  admission to go live, which reads the failure against the rules. The
  agent can be turned away there; it is not rebuilt, because the
  organization took it as it is.
- **The trigger fires while runs are in flight.** Onboardings overlap
  normally, and the concurrency line says how many. One agent is
  onboarded by one run at a time.
- **A run is abandoned.** Every grant already made is withdrawn, any
  mandate already granted is revoked, a trial copy already placed is
  taken down, and an engagement already formed is terminated on its
  own terms. The register entry says the onboarding did not complete,
  so nobody later finds an agent with access and no record of why it
  has it.

## Where each phase is specified

| Phase | Where it is specified |
|---|---|
| verify-agent | [The signed Descriptor](https://commonagent.net/spec.html#4-9-it-serves-a-bound-signed-descriptor) and [what others attest](https://commonagent.net/spec.html#8-what-others-attest) in the Common Agent Specification; [reports](https://agentreputations.com/spec.html#s8) in Agent Reputations |
| interview-agent | [The five questions](https://commonagent.net/spec.html#4-3-the-five-questions) in the Common Agent Specification |
| inspect-agent | [The inspector](https://agentroles.ai/inspector.html) in Agent Roles; [Inspection](https://agenticdevelopment.ai/stages.html#inspection) in the Agent Development Lifecycle |
| sign-nda | [Signatures](https://agentnda.net/spec.html#s6) and [what is confidential](https://agentnda.net/spec.html#s5-4) in Agent NDA |
| agree-terms, form-engagement | [Agent SoW](https://agentsow.com/spec.html), including [the NDA an engagement runs under](https://agentsow.com/spec.html#s5-16) |
| grant-mandate | [The mandate](https://agentmandate.net/spec.html#s6) in Agent Mandate |
| admit-for-trial, admit-to-go-live | [The admission checker](https://agentroles.ai/admission-checker.html) in Agent Roles; [Admission](https://agenticdevelopment.ai/stages.html#admission) in the Agent Development Lifecycle |
| deploy-for-trial, deploy-agent | [The deployment manager](https://agentroles.ai/deployment-manager.html) in Agent Roles; [install and update](https://commonagent.net/spec.html#12-7-publish-install-update-remove) and [the deployment record](https://commonagent.net/spec.html#8-3-the-deployment-record) in the Common Agent Specification |
| run-trial | [Trials](https://commonagent.net/spec.html#7-7-trials) in the Common Agent Specification |
| grant-access | [Scope and authority](https://commonagent.net/spec.html#6-11-scope-and-authority) and [the door](https://commonagent.net/spec.html#7-1-the-door) in the Common Agent Specification; [granting access](https://agentsow.com/spec.html#s5-3-1) in Agent SoW |
| check-conformance | [The conformance checker](https://agentroles.ai/conformance-checker.html) in Agent Roles; [the evaluation record](https://commonagent.net/spec.html#8-4-the-evaluation-record) in the Common Agent Specification |
| hand-over-context | [Context](https://commonagent.net/spec.html#5-6-context) and [the job manifest](https://commonagent.net/spec.html#5-7-the-job-manifest-and-revisions) in the Common Agent Specification |

The process that ends the engagement is
[offboard an agent](./offboard-an-agent.md).
