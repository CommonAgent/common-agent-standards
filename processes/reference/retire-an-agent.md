# Reference process: Retire an Agent

`ref/dev/retire-an-agent v1`

An organization has decided that one of the agents it runs should stop,
and this process takes the agent down the way a service is
decommissioned: the people who depend on it are told first, and nothing
is removed until it can no longer be found. The owner names the agent,
the reason, and whoever depends on it. The agent's listing is taken out
of the catalog, so nobody finds it and sends it work. The owner reads
what will be removed and says yes, the deployment manager removes it
and names anything it could not remove, and the agent's AgentDoc is
closed with the date and the reason. The run closes when the agent
answers nobody, no listing says it does, and its AgentDoc says when it
was retired and why.

This is a reference process. It is a first draft for an organization to
adopt and argue with, and it is not running anywhere. Its owner, its
dates, its targets and its roster are blank, and the adopting
organization fills them in. It has been written and has not been run
yet. The process is written from the side of the organization that runs the agent.

Every phase in this version is a person's. The
[deployment manager](https://agentroles.ai/deployment-manager.html) in
Agent Roles defines removal as one of its acts, and the
[documenter](https://agentroles.ai/documenter.html) defines the
AgentDoc. This version still keeps both acts with the owner, because a
holder of either role may not be able to take a removal or a closing
from a process run, and no role in Agent Roles holds the act of taking
down a listing. An adopter whose holders
can take those instructions gives `remove-the-agent` to the deployment
manager and `close-the-doc` to the documenter, by an amendment, and
keeps the owner's yes before the removal.

## The activities

| # | Activity | What happens | Agents |
|---|---|---|---|
| 1 | Say What Goes | the agent, the reason, and who must be told first | agent's owner (person) |
| 2 | Retract the Listing | the agent's listing taken out of the catalog | agent's owner (person) |
| 3 | Approve the Removal | the owner reads what will be removed and says yes | agent's owner (person) |
| 4 | Remove the Agent | the deployment manager instructed to remove it all | agent's owner (person) · [deployment manager](https://agentroles.ai/deployment-manager.html) |
| 5 | Close the AgentDoc | the AgentDoc marked retired, with date and reason | agent's owner (person) |

## What the graph says

The graph is a single line, and its order is the point of it. The
listing comes down before anything is removed, so that nobody finds the
agent and sends it work in the time between the decision and the
removal. The people who depend on the agent are named at the start and
told before the listing goes, so nothing that relies on it learns of
the retirement by failing.

The owner's yes comes after the listing is gone and before the
removal, so the owner reads what will be removed while the agent still
exists and can still be put back. The removal is then the deployment
manager's act on the owner's instruction, and it ends with a record
that names what was removed and anything that was not. The AgentDoc is
closed last, from that record, and it is never deleted. A reader who
finds the agent's name later learns that it was retired, when, and why.

Two edges point backwards. At the approval the owner can decide that
the agent stays, which puts the listing back and closes the run with
nothing removed. And when the deployment manager names something it
could not remove, the run returns to the approval, where the owner
decides whether that is acceptable or names a person to finish it.

## The document, with the blanks marked

```
PROCESS: retire an agent              id: <team>/retire-an-agent   v1
from: ref/dev/retire-an-agent v1
owner: <who>                          effective: <date>
trigger: the owner asks for a released agent to be retired, naming the
         agent and the reason
concurrency: runs may overlap - one run per agent at a time
goal: an agent that answers nobody, holds no listing that says it does,
      and whose AgentDoc says when it was retired and why, with every
      step on the record
phases:
  say-what-goes       - human: the owner names the agent, says why it is
                        retired, names what depends on it, and tells
                        each of them first
                        owner: <the agent's owner>   after: trigger
                        automation: never
  retract-the-listing - human: the owner takes the agent's listing out
                        of <your catalog>, so nobody finds it and asks;
                        the platform that hosts the catalog makes and
                        removes listings from the deployed agent's
                        descriptor
                        owner: <the agent's owner>
                        after: say-what-goes
                        automation: <level>
  approve-the-removal - human: the owner reads what will be removed,
                        everything the deployment record says was
                        installed, and says yes
                        owner: <the agent's owner>
                        after: retract-the-listing
                        automation: never
  remove-the-agent    - human: the owner instructs the deployment
                        manager to remove the agent, which removes
                        everything the deployment installed and names
                        anything it could not remove; the run waits for
                        the removal record
                        owner: <the agent's owner>
                        after: approve-the-removal
                        automation: <level>
  close-the-doc       - human: the owner marks the agent's AgentDoc as
                        retired, with the date and the reason
                        owner: <the agent's owner>
                        after: remove-the-agent
                        automation: <level>
handoffs:
  say-what-goes -> retract-the-listing [notice]: the agent's name, the
    reason, and who was told
  retract-the-listing -> approve-the-removal [unlisted]: the listing as
    it was, and when it was taken down
  approve-the-removal -> remove-the-agent [approved-removal]: the
    agent's name, with who approved the removal and when
  remove-the-agent -> close-the-doc [removed]: the deployment manager's
    removal record, naming what was removed and anything that was not
deviations:
  approve-the-removal -> say-what-goes [keep]: the owner decides the
    agent stays; the listing goes back and the run closes with nothing
    removed
  remove-the-agent -> approve-the-removal [left-behind]: the deployment
    manager could not remove something it names; the owner decides
    whether that is acceptable or names a person to finish it
bindings:
  roster:  <who holds each role - the agent's owner (person) for every
           phase, and an agent claiming the deployment manager for the
           removal it is instructed to make; when the deployment manager
           can take a run's instruction to remove and a documenter can
           close an AgentDoc, remove-the-agent and close-the-doc become
           theirs by amendment>
  systems: none of the phases reaches a system of its own
  data:    the agent's name, its listing, its deployment record and its
           AgentDoc
policy:
  nothing is removed before the listing is gone, so nobody sends work
    to an agent that is about to vanish
  nothing is removed without the owner's yes
  the AgentDoc is never deleted; it is closed with the date and the
    reason
  the agent's name stays claimed; a retired name is not given to
    another agent
measures:
  cycle time: <target> from the request to the closed AgentDoc
  left behind: things the deployment manager could not remove
records:
  notice           - the agent's name, the reason, and who was told
  unlisted         - the listing as it was, and when it was taken down
  removal-decision - the owner's yes to the removal, or the decision to
                     keep the agent and the reason, and when
  removal-record   - the deployment manager's signed record of what was
                     removed and anything that was not
  closed-doc       - the AgentDoc as closed, with the date and the reason
```

## The records a run leaves

Each phase leaves the record its own kind of work produces, and two
records matter after the run. The removal record is the deployment
manager's signed statement of what it removed, and it names anything it
could not remove, because a removal that leaves a live credential behind
is the failure an owner cannot otherwise see. The closed AgentDoc is
what a stranger finds when they look the agent up later, and it says
that the agent was retired, when, and why.

The run closes:

```
RUN DONE: <team>/retire-an-agent v1 · run <n>
outcome: <completed | abandoned>
result: <the agent removed, unlisted, and its AgentDoc closed>
open: <what nobody finished, and who may close it>
```

## The failure edges

- **The owner decides the agent stays.** The listing goes back, and the
  run closes with nothing removed. The record keeps the reason the
  retirement was asked for and the reason it was stopped.
- **The deployment manager cannot remove something.** It names what was
  left, and the run returns to the approval. The owner accepts what was
  left, with the reason on the record, or names a person to finish it.
  A removal reported as complete with something left behind is a
  statement that is not true.
- **The trigger fires for an agent that already has a run open.** One
  agent is retired by one run at a time, so the second request does not
  start a run of its own.
- **A run is abandoned.** A run abandoned after the listing came down
  leaves an agent that still runs and that nobody can find. The record
  says how far the run got, so the owner can put the listing back or
  finish the removal.

## Where each phase is specified

| Phase | Where it is specified |
|---|---|
| remove-the-agent | [The deployment manager](https://agentroles.ai/deployment-manager.html) in Agent Roles; [remove](https://commonagent.net/spec.html#12-7-publish-install-update-remove) and [the deployment record](https://commonagent.net/spec.html#8-3-the-deployment-record) in the Common Agent Specification |
| close-the-doc | [The documenter](https://agentroles.ai/documenter.html) in Agent Roles; [AgentDoc](https://agentdoc.net/) |

The process that made the agent is
[make a new agent](./make-a-new-agent.md).
