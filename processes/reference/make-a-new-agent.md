# Reference process: Make a New Agent

`ref/dev/make-a-new-agent v3`

A person in an organization wants an agent to do a piece of work, and
this process makes one the way careful software teams make a program.
The request is turned into a written spec, and the person who asked
reads it and says yes before anything else is written. Then the agent is
built: its architecture, its own files, a suite of tests and its
scripts, in whatever order the builder works best. A check the builder
can't change judges them all together and names what each still needs.
The tests are shown to fail while every script is empty, and they can't
change once the scripts are first judged against them, so the scripts
must meet a standard they did not choose. The
package is made from the spec and the scripts and nothing else, and the
person says yes again before the package is deployed. After the deploy, an agent that built none of it
checks the running agent against what its own package declares. The
run closes when the person has read the agent's AgentDoc and said it
may be listed.

This is a reference process. It is a first draft for an organization to
adopt and argue with. Its owner, its
dates, its targets and its roster are blank, and the adopting
organization fills them in. Each agent phase is the work of a role the
[Agent Roles](https://agentroles.ai/) standard defines, and any agent
that takes on the role may do the phase. One agent can take on several
roles: the build in particular can be done by one agent doing the work
of the solution architect, the test writer and the code writer, such as
the organization's own coding agent, a vendor's, or one it contracts for
the run, or by a separate agent for each. The table at the end says where each
phase is specified. The process is written from the side of the
organization that wants the agent, and the person who asks for it is
the agent's owner for the whole run.

The process makes one kind of agent: an Agent Package that a harness
reads, which the Common Agent Specification calls `plugin-on-harness`.
Code that answers on the network by itself, and another party's
framework wrapped as an agent, are made another way and not here.

## The activities

| # | Activity | What happens | Agents |
|---|---|---|---|
| 1 | Write the Spec | the four answers settled and the spec drafted | [spec writer](https://agentroles.ai/spec-writer.html) · agent's owner (person) |
| 2 | Approve the Spec | the owner answers what is open and says yes | agent's owner (person) |
| 3 | Build the Agent | the architecture, the agent's own files, the suite and the scripts, in any order, judged together by a check the builder can't change | [solution architect](https://agentroles.ai/solution-architect.html) · [test writer](https://agentroles.ai/test-writer.html) · [code writer](https://agentroles.ai/code-writer.html), one agent, or a separate agent for each |
| 4 | Make the Package | a signed package from the spec and the scripts only | [package maker](https://agentroles.ai/package-maker.html) |
| 5 | Approve the Deploy | the owner reads the package's record and says yes | agent's owner (person) |
| 6 | Deploy the Agent | the package installed, or the running agent updated | [deployment manager](https://agentroles.ai/deployment-manager.html) |
| 7 | Check Conformance | the package's own declarations tested on the agent | [conformance checker](https://agentroles.ai/conformance-checker.html) |
| 8 | Publish the Agent | the owner reads the AgentDoc and says it may be listed | agent's owner (person) |

## What the graph says

The graph is a single line with three gates held by the agent's owner.
The spec comes first, and it settles four answers before it settles the
shape of the agent: which kind of agent is wanted, whether it is one
agent or several, whether the organization can stand a product behind
every system the design names, and whether the thing already exists.
Each answer is the person's, chosen from a short list, and two of them
can end the run. They come before any suite is written, because the
alternative is to find them at the deploy approval, after the work they
would have saved has been done. That is also why the spec phase is
`assisted`: the spec writer gathers and drafts, and the person settles
the four answers.

The build starts once the spec is approved. The builder writes the
architecture, the agent's own files, the suite and the scripts in
whatever order it works best, and a check it can't change judges them
together and names what each still needs. One thing has a fixed order.
The suite is shown to fail against an empty stand-in for every script,
and once the scripts are first judged against it, it can't change.
Tests changed to fit the scripts can pass by agreeing with a mistake, so
this is the protection, even when one agent writes both. The package is made only from the approved spec and
the scripts the code writing phase delivered, so nothing reaches the
package that the suite never saw.

Conformance is checked after the deploy, against the agent as it runs,
by an agent that built none of it. Publishing is the owner's act. The
AgentDoc is assembled outside the run's phases, by the platform or by a
documenter where the adopter has one, from the deployed agent's
descriptor and the records the run left, including the conformance
record. The platform that hosts the catalog makes the listing from the
descriptor.

There is no separate process for changing an agent. A change to a
released agent is a run of this process whose request says what should
differ and whose prototype is the version that runs today. The spec is
revised, the build runs again from it, and the deploy phase updates the agent that
already runs under that name.

Five edges point backwards. The owner can send the spec back with
changes, and the spec is revised rather than drafted again. A test that
cannot pass without breaking the spec goes to the owner, who decides
which of the two is wrong. A script the package would ship that cannot
be traced to the build goes back through it. A failed conformance case
sends the build back for its scripts to be revised against the same
suite. And at the deploy approval the owner can say that what
was built is not what was wanted, which sends the run back to the spec.

## The document, with the blanks marked

```
PROCESS: make a new agent             id: <team>/make-a-new-agent   v3
from: ref/dev/make-a-new-agent v3
owner: <who>                          effective: <date>
trigger: a person asks for an agent in words, through
         <your request channel>, with a prototype attached when one
         exists; or asks for a released agent to differ, with the
         version that runs today attached as the prototype
concurrency: runs may overlap - one run per agent at a time
goal: a running agent whose package was made from a spec the owner
      approved, whose scripts pass tests that could not change once the
      scripts were judged against them, the build checked by something
      the agent that did it can't change, and
      whose conformance was checked by an agent that did not build it,
      with every step on the record
phases:
  write-the-spec     - harness: the four answers settled and the request
                       turned into a spec, with every blank the request
                       left named. The four are which kind of agent,
                       one agent or several, whether the organization
                       can stand a product behind every system the
                       design names, and whether the thing already
                       exists; each is the person's from a short list,
                       and two of them can end the run
                       owner: spec-writer          after: trigger
                       automation: assisted
  approve-the-spec   - human: the owner reads the spec, answers what it
                       left open, and changes it or says yes
                       owner: <the agent's owner>
                       after: write-the-spec
                       automation: never
  build-the-agent    - harness: from the approved spec, in any order,
                       all judged together by a check the builder can't
                       change: the architecture record; the agent's own
                       files, accepted by the packer; the suite, a test
                       for every acceptance scenario, shown to fail
                       against an empty stand-in for every script and
                       unchanged once the scripts are first judged
                       against it; and the scripts, in <your settled
                       stack>, passing the suite, with the prototype
                       read when there is one
                       owner: <one agent for all of it, or
                       solution-architect, test-writer and code-writer>
                       after: approve-the-spec
                       automation: <level>
  make-the-package   - harness: the signed Agent Package made from the
                       spec and the delivered scripts and nothing else,
                       carrying the draft Descriptor in
                       agent-descriptor.json and the runtime
                       requirements in agent-runtime-requirements.json
                       owner: package-maker        after: build-the-agent
                       automation: <level>
  approve-the-deploy - human: the owner reads the package's build record
                       and says whether it goes on <your hosts>
                       owner: <the agent's owner>
                       after: make-the-package
                       automation: never
  deploy-the-agent   - harness: the package installed on <your hosts>,
                       or the running agent updated when the name
                       already runs; the deployment manager answers with
                       the agent's name and the signed deployment record
                       owner: deployment-manager   after: approve-the-deploy
                       automation: <level>
  check-conformance  - harness: the test derived from the package's own
                       declarations, run against the installed agent,
                       with each case confirmed, failed or flagged
                       owner: conformance-checker  after: deploy-the-agent
                       automation: <level>
  publish-the-agent  - human: the owner reads the agent's AgentDoc,
                       assembled from the deployed agent's descriptor
                       and the records of the run, and says it may be
                       listed; the listing is made by the platform that
                       hosts <your catalog>, from the descriptor
                       owner: <the agent's owner>
                       after: check-conformance
                       automation: never
handoffs:
  write-the-spec -> approve-the-spec [spec-drafted]: the spec, the four answers
    as the person settled them, and the list of what the request left
    open
  approve-the-spec -> build-the-agent [approved-spec]: the spec as the
    owner left it, with who approved it and when, and the prototype when
    one came with the request
  approve-the-spec -> make-the-package [approved-spec]: the spec as the
    owner left it, which names the scripts the package must ship
  build-the-agent -> make-the-package [scripts]: the architecture record,
    the agent's own files, the suite, every script the agent's files
    name, the record of the check that passed the build, the builder's account, and
    the signed job manifest that came with the delivery
  make-the-package -> approve-the-deploy [package]: the package's
    address, its sha256, and the build record
  approve-the-deploy -> deploy-the-agent [approved-package]: the
    package's address and sha256, with who approved it and when
  deploy-the-agent -> check-conformance [agent]: the agent's name and
    the deployment record
  check-conformance -> publish-the-agent [eval-record]: the signed
    evaluation record, every case confirmed, failed or flagged, and the
    AgentDoc's address
deviations:
  approve-the-spec -> write-the-spec [changes]: the owner names what is
    wrong or answers a blank; the spec is revised, not drafted again
  build-the-agent -> approve-the-spec [conflict]: a test cannot pass
    without breaking what the spec says; the owner decides which of the
    two is wrong, and the suite or the spec is revised
  make-the-package -> build-the-agent [untraced]: a script the package
    would ship cannot be traced to the delivery of build-the-agent; it
    goes back through that phase
  check-conformance -> build-the-agent [failed]: a case the package's
    own declarations promise has failed; the scripts are revised
    against the same suite
  approve-the-deploy -> write-the-spec [wrong-spec]: what was built is
    not what was wanted; the request is restated and the spec redone
bindings:
  roster:  <who holds each role - an agent claiming each of the roles
           above; build-the-agent may be done by one agent taking on
           the solution architect, test writer and code writer roles,
           or by a separate agent for each; no agent that builds also
           checks conformance; and the agent's owner
           (person), who holds the three human phases>
  systems: none of the phases reaches a system of its own; each agent
           brings what its package declares
  data:    the request, the prototype when there is one,
           <your settled stack> <version>
policy:
  a request for an agent this process cannot make, meaning anything but
    a package a harness reads, is said out loud at the spec and never
    built as something else that looks close
  a spec goes to the owner before anything else is built
  the build is checked by something the agent that did it can't change
  the tests are shown to fail before the scripts are judged against
    them, can't change after that, and are never changed to fit a script
  no test is edited to make a script pass, and no script is delivered
    that the suite fails
  only scripts delivered by build-the-agent are packed; a script
    written or changed outside that phase goes back through it
  nothing is deployed without the owner's yes on the package
  a prototype is read as the most exact statement of what was wanted
    and is never shipped as it stands
measures:
  quality gate: no agent is deployed whose conformance check failed,
                or whose package differs from the one the owner approved
  cycle time: <target> from the request to the deployed agent's name
  rounds: revisions before the owner approves the spec, and before the
          conformance check passes
  defects: cases the conformance check failed on the first pass
records:
  spec              - the spec as the owner approved it, the four
                      answers, and who approved it and when
  build             - the architecture record, the agent's own files,
                      the suite and its failure against empty
                      stand-ins, and the check that passed the build
  delivery          - the scripts, the builder's account, the record of
                      every round, and the signed job manifest
  build-record      - the package's address and sha256, and the signed
                      build record
  deploy-decision   - the owner's yes on the package, and when it was
                      given
  deployment-record - the agent's name and the signed deployment record
  evaluation-record - every case confirmed, failed or flagged, signed
                      by the conformance checker
  publish-decision  - the owner's yes and the AgentDoc's address
```

## The records a run leaves

Each phase leaves the record its own kind of work produces. The three
human gates leave the owner's decision with the time it was made, and
the harness phases leave one closing record each. Three of the records
are signed by the agent that made them, as the Common Agent
Specification defines: the build record, the deployment record and the
evaluation record. An AgentDoc is assembled from records like these, so
a stranger deciding whether to use the agent reads the same records this
run left.

The delivery record matters most for the integrity of the run. The
signed job manifest that came with the scripts is what the package
maker reads to trace every script it packs to the build,
and a script it cannot trace is not packed.

The run closes:

```
RUN DONE: <team>/make-a-new-agent v3 · run <n>
outcome: <completed | abandoned>
result: <the agent's name, deployed, checked and listed>
open: <what nobody finished, and who may close it>
```

## The failure edges

- **The request is for an agent this process cannot make.** The spec
  says so out loud, and the run ends there. An agent built as something
  that looks close to what was asked is the failure this rule prevents.
- **Another of the four answers ends the run.** Two of the four answers
  can end a run, and the kind of agent is only one of them. Whichever
  one it is, the run closes at the spec, before any of the build has
  been paid for.
- **The owner sends the spec back.** The spec writer revises what the
  owner named and keeps the rest. A spec drafted again from the start
  loses the answers the owner already gave.
- **A test cannot pass without breaking the spec.** The builder reports
  the conflict and changes neither the test nor the spec. The owner
  decides which is wrong, and that one is revised.
- **The build fails its check.** The builder fixes what the check names,
  in whatever order it likes. The approved spec, and the suite once the
  scripts have been judged against it, stay as they are; changing either
  is the owner's call, which sends the run back to the spec or reopens
  the suite.
- **A script cannot be traced to the build.** The package maker refuses
  to pack it, and the script goes back through build-the-agent. A script changed by hand after delivery is a
  script the suite may never have seen.
- **A conformance case fails.** The scripts are revised against the
  same suite, and the agent is packaged and deployed again. A case
  passed by editing a test has not been passed.
- **What was built is not what was wanted.** The owner says so at the
  deploy approval, and the request is restated and the spec redone.
  Nothing is deployed.
- **The trigger fires for an agent that already has a run open.** One
  agent is made or changed by one run at a time, so the new request
  does not start a second run for the same agent.
- **A run is abandoned.** A run abandoned before the deploy approval has
  installed nothing, because nothing is deployed without the owner's
  yes. A run abandoned after the deploy leaves an agent running, and
  the [retire an agent](./retire-an-agent.md) process is how it is
  taken down.

## Where each phase is specified

| Phase | Where it is specified |
|---|---|
| write-the-spec | [The spec writer](https://agentroles.ai/spec-writer.html) in Agent Roles; [the Agent Package](https://commonagent.net/spec.html#12-how-an-agent-travels-the-agent-package) in the Common Agent Specification |
| build-the-agent | [The solution architect](https://agentroles.ai/solution-architect.html), [the test writer](https://agentroles.ai/test-writer.html) and [the code writer](https://agentroles.ai/code-writer.html) in Agent Roles; [the job manifest](https://commonagent.net/spec.html#5-7-the-job-manifest-and-revisions) in the Common Agent Specification |
| make-the-package | [The package maker](https://agentroles.ai/package-maker.html) in Agent Roles; [the layout](https://commonagent.net/spec.html#12-2-layout) and [the build record](https://commonagent.net/spec.html#8-2-the-build-record) in the Common Agent Specification |
| deploy-the-agent | [The deployment manager](https://agentroles.ai/deployment-manager.html) in Agent Roles; [install and update](https://commonagent.net/spec.html#12-7-publish-install-update-remove) and [the deployment record](https://commonagent.net/spec.html#8-3-the-deployment-record) in the Common Agent Specification |
| check-conformance | [The conformance checker](https://agentroles.ai/conformance-checker.html) in Agent Roles; [the evaluation record](https://commonagent.net/spec.html#8-4-the-evaluation-record) in the Common Agent Specification |
| publish-the-agent | [The documenter](https://agentroles.ai/documenter.html) in Agent Roles; [AgentDoc](https://agentdoc.net/) |

When something goes wrong with the agent once it runs, the process that
records it is [record an incident](./record-an-incident.md). The process
that takes it down is [retire an agent](./retire-an-agent.md).
