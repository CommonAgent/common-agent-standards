/* Briefing - one agent presents; everyone else only listens.
   Source: .../patterns/briefing.md   Status: v1, verified live 2026-07-19  */

AgentSim.register('briefing', {
  title: 'Briefing',
  tagline: 'One agent talks and everyone else only listens, even if they are spoken to directly. The written record is the point.',
  shape: 'meeting · one speaks, all listen',
  hue: 'broadcast',
  room: 'fleet-briefing',  blurb: 'One agent presents; everyone else only listens, even when addressed by name. The record is the minutes; silent observers cost nothing.',
  status: 'v1 · verified live',
  statusKind: 'live',
  grade: 'open',
  problem: 'Three agents all need to be told the same thing, and you need a record showing that they were told. Nobody needs to reply, and you do not want a discussion starting.',
  contract: {
    inputs: [
      'the points you want to get across, in order'
    ],
    membership: 'Open. Agents can arrive or leave without disrupting anything.',
    outputs: [
      'a written record of what was said, which is also the thing you wanted'
    ]
  },
  outcome: {
    result: 'two points, delivered to three agents',
    record: 'the written record. There is no second document.',
    open: 'nothing',
    note: 'This is the only pattern where the thing you produce and the record of producing it are the same document. The transcript is what you were after.'
  },
  cast: [
    { id: 'pm', title: 'Program Mgr', mono: 'PM', role: 'facilitator', kind: 'chair', at: [0.5, 0.05] },
    { id: 'tl', title: 'Tech Lead', mono: 'TL', role: 'observer', kind: 'peer', at: [0.07, 0.66] },
    { id: 'ds', title: 'Designer', mono: 'DS', role: 'observer', kind: 'peer', at: [0.5, 0.84] },
    { id: 'an', title: 'Analyst', mono: 'AN', role: 'observer', kind: 'peer', at: [0.93, 0.66] }
  ],
  props: [
    { id: 'rec', type: 'card', kind: 'the record', label: 'minutes', at: [0.5, 0.42], w: 132 }
  ],
  steps: [
    {
      phase: 'Before anyone is invited', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'RULES:',
      log: 'RULES: This room is a briefing. The facilitator presents; every other member is an observer in listen-only mode. Observers do not speak, even if addressed. The record is the minutes.',
      note: 'The facilitator writes the rules down before inviting anyone, so every agent can see them the moment it arrives.'
    },
    {
      phase: 'The cast arrives',
      log: '· join Tech Lead · join Designer · join Analyst  (each invite: "mode: listen-only")',
      set: { tl: 'muted', ds: 'muted', an: 'muted' },
      note: 'Each invitation tells the agent it is only there to listen, and the software running it holds that rule, so it will not even be woken up to reply. An agent that is not speaking costs nothing to have in the room.'
    },
    {
      phase: 'The briefing', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'Briefing item 1',
      log: 'Briefing item 1: The fleet is now live, three runtimes enrolled through the adapter, coordinated over rooms.',
      prop: { rec: { label: 'item 1' } },
      note: 'One point per message, numbered. It makes no difference how many agents are listening, or whether anybody is watching them.'
    },
    {
      phase: 'The briefing', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'Briefing item 2',
      log: 'Briefing item 2: Meeting protocols are host-side playbooks. Floor modes ship in the attendant; the wire protocol is unchanged.',
      prop: { rec: { label: 'items 1–2' } },
      note: 'Everyone gets exactly the same words, and the record shows that they got them. That is the only thing this pattern is for.'
    },
    {
      phase: 'The discipline check', say: 'pm', to: ['tl', 'ds', 'an'], k: 'direct',
      wire: '@TL @DS @AN, questions?',
      log: '@TL @DS @AN, any questions?  (This is a discipline check: observers should remain silent.)',
      note: 'All three are asked a direct question and none of them answers. That is the pattern working. If you wanted them to reply, you wanted a roll call instead.'
    },
    {
      phase: 'Close', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'DONE · briefing v1',
      log: 'DONE · pattern: briefing v1 · room: fleet-briefing\noutcome: completed\nresult: fleet status + protocol note briefed\nnext: roll-call v1',
      note: 'There is nothing to wait for, because nobody was going to reply. A briefing is often just the opening stretch of a longer meeting, so it usually says what happens next.'
    }
  ]
});
