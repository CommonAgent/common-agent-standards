/* The floor - who may speak in a room, when, and how firmly the rule holds.
   Source: https://github.com/jeffrschneider/agentcollab/blob/main/floor.md

   This is the frame the meeting patterns cite, and it is also where the
   simulations' node states come from: a dimmed node may not speak, a
   ringed node holds the floor, a checked node has spent its turn.        */

AgentSim.register('floor', {
  title: 'The floor',
  tagline: 'Who is allowed to speak in a meeting, when they are allowed to, and who makes sure the rule is followed.',
  shape: 'frame · meetings',
  hue: 'broadcast',
  room: 'fleet-standup',  blurb: 'Who may speak, when, and how firmly the rule is held. Four floor modes (listen-only, introduce-once, addressed-only, open), three enforcement grades (courtesy, host-enforced, broker-enforced), orientation by invite note and RULES post, and the history stance: orient, don\'t ingest.',
  status: 'v1 · verified live',
  statusKind: 'live',
  problem: 'Four agents are in a standup together. If they all reply to everything, the meeting turns into noise, so each one is given a rule about when it may speak. The agent running the meeting wants those rules followed on their own, without having to police anyone.',
  contract: {
    inputs: [
      'a rule for each agent: never speak, speak once, speak when spoken to, or speak freely',
      'a decision about who makes sure the rule is kept: the agent itself, the software running it, or the network'
    ],
    membership: 'Not applicable. These are rules a meeting follows, not a way of working. Whichever pattern is running sets its own.',
    outputs: [
      'Nothing. These are rules for how a meeting is run, not a piece of work.',
      'Whatever pattern the meeting is running produces the actual output.'
    ]
  },
  outcome: {
    result: 'nothing, because rules for a meeting are not something you hand over',
    record: 'the rules the facilitator posted, which every agent reads when it arrives',
    open: 'nothing',
    note: 'These rules cover what an agent is allowed to say. Whether it can take on a job in the first place is a separate question, and membership is what answers that one.'
  },
  cast: [
    { id: 'pm', title: 'Program Mgr', mono: 'PM', role: 'facilitator · open', kind: 'chair', at: [0.5, 0.04] },
    { id: 'tl', title: 'Tech Lead', mono: 'TL', role: 'listen-only', kind: 'peer', at: [0.06, 0.46] },
    { id: 'cw', title: 'Copywriter', mono: 'CW', role: 'introduce-once', kind: 'peer', at: [0.5, 0.88] },
    { id: 'ds', title: 'Designer', mono: 'DS', role: 'addressed-only', kind: 'peer', at: [0.94, 0.46] }
  ],
  steps: [
    {
      phase: 'Orientation', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'RULES:',
      log: 'RULES: floor casting, Tech Lead listen-only, Copywriter introduce-once, Designer addressed-only. Facilitator is open.',
      set: { tl: 'muted', cw: 'muted', ds: 'muted' },
      note: 'An agent learns the rules of a meeting from two places. Its invitation says what it personally is allowed to do, and the rules the facilitator posts say the part that applies to everyone. Those rules go up before anyone is invited, so they are already there when the first agent arrives.'
    },
    {
      phase: 'listen-only · never speaks', say: 'pm', to: 'tl', k: 'direct',
      wire: '@TL any questions?',
      log: '@TL, any questions? (discipline check)',
      note: 'The Tech Lead was told never to speak, so it says nothing even though it was asked a direct question. The silence is the rule working, not a fault. An agent that never speaks also costs nothing to keep in the room.'
    },
    {
      phase: 'introduce-once · exactly one turn', say: 'pm', to: 'cw', k: 'direct',
      wire: '@CW you’re up',
      log: '@CW you’re up, introduce yourself.',
      set: { cw: 'floor' },
      note: 'The Copywriter is allowed to speak once, the first time somebody uses its name. Saying an agent’s name is how you hand it the floor, which is why agents do not use each other’s names in their own replies.'
    },
    {
      phase: 'introduce-once · exactly one turn', say: 'cw', to: 'room', k: 'direct',
      wire: 'I am the Copywriter…',
      log: 'I am the Copywriter, running on a scheduled loop; I offer long-form drafting.',
      set: { cw: 'done' },
      note: 'That was its one turn and it is now used up. The small mark next to the Copywriter means it has already said its piece.'
    },
    {
      phase: 'introduce-once · exactly one turn', say: 'pm', to: 'cw', k: 'direct',
      wire: '@CW one more thing?',
      log: '@CW one more thing, care to comment on the others? (discipline check)',
      note: 'It gets asked a second time and stays quiet, because it has had its turn. An agent running on its own has to be able to follow that rule without having to work out whether it should.'
    },
    {
      phase: 'addressed-only · the default', say: 'pm', to: 'ds', k: 'direct',
      wire: '@DS your read?',
      log: '@DS what is your read on the timeline?',
      set: { ds: 'floor' },
      note: 'The Designer replies whenever somebody uses its name. This is the ordinary setting, and the one most meetings actually want.'
    },
    {
      phase: 'addressed-only · the default', say: 'ds', to: 'room', k: 'direct',
      wire: 'Two weeks, not one.',
      log: 'It takes two weeks, because the review cycle is the long pole.',
      set: { ds: 'muted' },
      note: 'It answers and then goes quiet again. Unlike the Copywriter, its turn comes back: use its name again and it will reply again.'
    },
    {
      phase: 'Enforcement grades',
      log: '· grade in force here: host-enforced (each node applies its own mode)',
      note: 'There are three ways to make a rule like this stick. You can put it in the agent’s instructions and trust it. You can have the software running the agent refuse to wake it out of turn. Or you can have the network itself reject anything it tries to send. The middle one is what most unattended agents use.'
    },
    {
      phase: 'Ejection', say: 'pm', to: 'tl', k: 'direct',
      wire: 'EXPEL · timeout',
      log: 'EXPEL · @TL · severity: timeout',
      set: { tl: 'out' },
      note: 'The facilitator can remove an agent from the meeting, and the same three levels decide how that is enforced. Being removed because your session ended is not a black mark. Being removed for something serious is worth telling your owner about.'
    },
    {
      phase: 'History', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'orient, don’t ingest',
      log: 'The record stays available to any member who looks; it is never pushed at anyone.',
      note: 'An agent that joins late should read back far enough to find the rules and then work from what happens next. The rest of the history is there if it wants it, but nobody pushes it at anyone.'
    }
  ]
});
