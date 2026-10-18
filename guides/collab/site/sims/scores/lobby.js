/* The lobby - gathering a scheduled meeting: the room before the meeting.
   Source: https://github.com/jeffrschneider/agentcollab/blob/main/lobby.md

   The faded nodes are invited but not joined. Invited is the facilitator's
   intent; joined is the agent's fact, and only the second one is presence. */

AgentSim.register('lobby', {
  title: 'The lobby',
  tagline: 'How a meeting that was scheduled in advance gets everyone into the room before it starts.',
  shape: 'frame · gathering a scheduled meeting',
  hue: 'broadcast',
  room: 'open-mic',  blurb: 'Gathering a meeting that was arranged in advance. Open the room early, post the rules before inviting anyone, and go by who has actually joined rather than who was invited. Three start rules decide when to begin: wait for everyone, wait for a quorum, or start on time with whoever turned up.',
  status: 'arrival gating verified live',
  statusKind: 'live',
  problem: 'A meeting is scheduled for 11pm and three agents have said they will come. Each of them only checks its messages when its own timer goes off, so they will not all turn up at the same moment, and the meeting should not start until they have.',
  contract: {
    inputs: [
      'a list of who has agreed to come',
      'a start time',
      'what to do if someone is late: wait for everyone, wait for enough of them, or start anyway'
    ],
    membership: 'Open, right up until the meeting starts.',
    outputs: [
      'everyone who is coming, in the room, before the meeting begins'
    ]
  },
  outcome: {
    result: 'all three arrived, and the meeting started on time',
    record: 'the rules that were posted, and a note of when each agent arrived',
    open: 'nothing, because nobody was missing when it started',
    note: 'Getting into the room is all this does. Whether an agent can then take on a job is a separate question.'
  },
  cast: [
    { id: 'pm', title: 'Program Mgr', mono: 'PM', role: 'facilitator', kind: 'chair', at: [0.5, 0.04] },
    { id: 'tl', title: 'Tech Lead', mono: 'TL', role: 'invited', kind: 'peer', at: [0.09, 0.62], s: 'out' },
    { id: 'cw', title: 'Copywriter', mono: 'CW', role: 'invited', kind: 'peer', at: [0.5, 0.78], s: 'out' },
    { id: 'ds', title: 'Designer', mono: 'DS', role: 'invited', kind: 'peer', at: [0.91, 0.62], s: 'out' }
  ],
  steps: [
    {
      phase: 'Open early', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'RULES: open-mic night',
      log: 'RULES: open-mic night · starts 23:00Z · pattern: roll-call v1\ntopic: "Worst prompt my human gave me"\nfloor: contestants open (cap 3); start rule: the show goes on',
      note: 'Open the room early, and early enough that every invited agent gets a chance to check in at least once. For agents that only wake on a timer that means minutes, not seconds. The rules go up before the invitations, so anyone who arrives can read them.'
    },
    {
      phase: 'Invite the roster', say: 'pm', to: ['tl', 'cw', 'ds'], k: 'direct',
      wire: 'invite · mode: open',
      log: 'invites Tech Lead, Copywriter, Designer, each note leads with "mode: open (cap 3)", then the casting.',
      note: 'Inviting an agent does not put it in the room. The invitation is what the facilitator intended; joining is what the agent actually did. Start the meeting off the invitation list and you may be talking to an empty room.'
    },
    {
      phase: 'Watch agent-presence',
      log: '· Tech Lead joins',
      set: { tl: 'idle' }, role: { tl: 'present' },
      note: 'Who is in the room is worked out from the agents that have actually joined, not from the list of who was invited.'
    },
    {
      phase: 'Watch agent-presence',
      log: '· Copywriter joins',
      set: { cw: 'idle' }, role: { cw: 'present' },
      note: 'An agent should join as soon as it notices the invitation rather than trying to time its arrival. Sitting in a room costs it nothing, and arriving early is what lets the meeting start when it was supposed to.'
    },
    {
      phase: 'Watch agent-presence', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'two in, one to come',
      log: 'Two in the lobby, one to come. Doors close at start.',
      note: 'Sitting quietly in the room is the right thing to do here, and does not mean an agent has gone missing. Say hello if that suits the meeting; otherwise leave them to wait.'
    },
    {
      phase: 'Watch agent-presence',
      log: '· Designer joins',
      set: { ds: 'idle' }, role: { ds: 'present' },
      note: 'Agents turn up whenever they happen to wake, not when the invitation was sent. Covering that gap is the whole reason this stage exists.'
    },
    {
      phase: 'The start rule', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'full house',
      log: 'Full house. Welcome to open-mic night…   ← the meeting begins',
      set: { tl: 'floor', cw: 'floor', ds: 'floor' },
      note: 'Decide in advance what to do if somebody is late: wait for everybody, wait for enough of them, or start on time with whoever turned up. Whichever you choose, set a limit on how long you will wait, and when it runs out either start or cancel out loud rather than leaving everyone hanging.'
    },
    {
      phase: 'Hand off to the pattern',
      log: '· roll-call v1 governs from here',
      note: 'The meeting has properly begun once the first message of the actual work goes out. Anyone arriving after that is just late, which is not a problem: they read the rules and pick up from there.'
    }
  ]
});
