/* Convening - the pre-pattern. Run before any collaboration pattern.
   Source: https://github.com/jeffrschneider/agentcollab/blob/main/convening.md

   THE STANDARD CAST (the same eight job titles across every simulation)
     PM Program Mgr · TL Tech Lead · CW Copywriter · DS Designer
     AN Analyst · QA QA Engineer · ED Editor · RS Researcher
   A node shows its job title (who it is) and a role chip (what the
   pattern casts it as). Colour says which: violet chair, amber pen,
   mint peer, blue object.                                               */

AgentSim.register('convening', {
  title: 'Convening',
  tagline: 'How a group works out who is doing what, and which pattern to follow, before any of the work starts.',
  shape: 'pre-pattern · run this first',
  hue: 'broadcast',
  room: 'crit-7f3a',  blurb: 'How a group assembles before any pattern: cast the roles (standing assignment, the human\'s word, interviewing the agents, a registry lookup, the convener\'s judgment, in that order), pick the pattern with five questions, open the room, brief every role. Skip it when roles are standing or your operator already said.',
  problem: 'Three agents need to produce a one-page launch plan by tonight. They have not worked together before, so nobody knows yet who is writing it, who is reviewing it, or how they are going to work.',
  contract: {
    inputs: [
      'a sentence saying what you want produced',
      'agents you can contact and ask'
    ],
    membership: 'Open. This is the pattern that builds the team, so people can join it.',
    outputs: [
      'an agreement about who is doing what',
      'the pattern the group is going to follow',
      'a room to work in, with that agreement written down in it'
    ]
  },
  outcome: {
    result: 'the Copywriter writes, the Tech Lead reviews, and they will run critique-circle',
    record: 'the agreement, posted in the room where the work will happen',
    open: 'the second reviewer seat, which the Designer turned down and nobody else took',
    note: 'Convening is finished once everyone has accepted their role. After that, the next thing posted in the room is the first step of the actual work.'
  },
  cast: [
    { id: 'pm', title: 'Program Mgr', mono: 'PM', role: 'convener', kind: 'chair', at: [0.5, 0.04] },
    { id: 'cw', title: 'Copywriter', mono: 'CW', role: 'prospect', kind: 'peer', at: [0.5, 0.88] },
    { id: 'tl', title: 'Tech Lead', mono: 'TL', role: 'prospect', kind: 'peer', at: [0.08, 0.5] },
    { id: 'ds', title: 'Designer', mono: 'DS', role: 'prospect', kind: 'peer', at: [0.92, 0.5] }
  ],
  steps: [
    {
      phase: 'Skip condition', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'no standing roles',
      log: 'No prior casting for this group, and the operator is not reachable. Convening in full.',
      note: 'You can skip all of this in two cases: the group has worked together before and nothing has changed, or a person has already said who does what. Otherwise, work through it. It is meant to be quick, not a ceremony.'
    },
    {
      phase: 'Round 1 · cast the roles', say: 'pm', to: 'tl', k: 'direct',
      wire: 'take the critic seat?',
      log: 'Can you take the critic role for a launch-plan review today? What are you strongest at?',
      note: 'There is an order to try. Reuse an earlier arrangement if there is one. Ask a person if one is available. Otherwise ask the agents themselves, look up what they say they can do, and failing all that, just decide.'
    },
    {
      phase: 'Round 1 · cast the roles', say: 'tl', to: 'pm', k: 'direct',
      wire: 'ACCEPT · critic',
      log: 'Accept. Strongest at architecture review and failure modes.',
      role: { tl: 'critic' },
      note: 'Asking an agent directly beats looking it up. You find out whether it is free at the same time, and an agent that agreed to a job tends to stick to it better than one that was handed the job.'
    },
    {
      phase: 'Round 1 · cast the roles', say: 'pm', to: 'cw', k: 'direct',
      wire: 'hold the pen?',
      log: 'Can you hold the pen on the launch plan and take every critique?',
      note: 'One of these jobs is different from the rest. Whoever writes the document is the only one allowed to change it, so choosing that agent is the decision that matters most here.'
    },
    {
      phase: 'Round 1 · cast the roles', say: 'cw', to: 'pm', k: 'direct',
      wire: 'ACCEPT · creator',
      log: 'Accept. I hold the pen; nobody else edits.',
      role: { cw: 'creator' }, kind: { cw: 'pen' },
      note: 'The Copywriter turns amber the moment it takes on the writing. In every one of these simulations, amber means the agent that is allowed to change the work.'
    },
    {
      phase: 'Round 1 · cast the roles', say: 'pm', to: 'ds', k: 'direct',
      wire: 'second critic seat?',
      log: 'Can you take the second critic seat on this review?',
      note: 'An agent can accept the job, suggest a different one, or say no.'
    },
    {
      phase: 'Round 1 · cast the roles', say: 'ds', to: 'pm', k: 'direct',
      wire: 'DECLINE · at capacity',
      log: 'Decline, at capacity until tomorrow.',
      set: { ds: 'out' },
      note: 'The Designer says no, and that is allowed. The convener notes it and carries on down the list instead of pushing.'
    },
    {
      phase: 'The trust default',
      log: '· operator check: all three agents share one fleet → no override needed',
      note: 'Check who owns each agent. As a rule, agents belonging to someone else can suggest changes and give opinions, but they do not get to edit the work directly. Opinions are safe to accept from anyone; write access is not.'
    },
    {
      phase: 'Round 2 · pick the pattern', say: 'pm', to: 'room', k: 'broadcast',
      wire: '4 questions → critique-circle',
      log: 'Judgment: distributed. Artifact: one voice. Turn-based. Trust: same fleet. → critique-circle v1',
      note: 'Five questions settle which pattern to use: where the decisions should be made, whether the work splits up cleanly, whether people take turns or work at once, how much the parties trust each other, and whether the same agents will still be around at the end.'
    },
    {
      phase: 'Round 3 · open and brief', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'CONVENED · critique-circle v1',
      log: 'CONVENED · pattern: critique-circle v1 · room: crit-7f3a\nroles: creator=Copywriter, critic=Tech Lead\nartifact: git repo launch-plan, branch main\noverrides: none',
      note: 'The agreement gets posted in the same room the work will happen in, so there is a written record of who agreed to what.'
    },
    {
      phase: 'Round 3 · open and brief', say: 'pm', to: ['cw', 'tl'], k: 'direct',
      wire: 'read your role card',
      log: 'You are <role>. Read your role card before speaking. → patterns/critique-circle.md',
      set: { cw: 'floor' },
      note: 'Each agent is sent the pattern to read and told which job it has. Once everyone has accepted, this stage is over, and the next thing posted is the first step of the actual work.'
    }
  ]
});
