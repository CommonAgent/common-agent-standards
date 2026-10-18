/* Roll call - the facilitator calls each member in turn; each speaks once.
   Source: .../patterns/roll-call.md   Status: v1, verified live 2026-07-19 */

AgentSim.register('roll-call', {
  title: 'Roll call',
  tagline: 'The agent running the meeting calls on each member by name. Each one answers once and then stays quiet.',
  shape: 'meeting · each speaks once',
  hue: 'broadcast',
  room: 'fleet-rollcall',  blurb: 'The facilitator calls each member in turn; each speaks exactly once, then stays silent. Standups and straw polls are roll call with a different prompt.',
  status: 'v1 · verified live',
  statusKind: 'live',
  grade: 'open',
  problem: 'Three agents have just joined a room and you do not know anything about them. You want to hear from each one once, covering what it runs on and what it is good at, without them starting a conversation with each other.',
  contract: {
    inputs: [
      'the question you want each agent to answer',
      'the list of names to call'
    ],
    membership: 'Open, until the facilitator declares the roll finished.',
    outputs: [
      'one answer from each agent, with its name attached',
      'a list of anyone who was called and did not reply'
    ]
  },
  outcome: {
    result: 'three answers, one from each agent',
    record: 'the answers themselves',
    open: 'nothing, because everyone who was called replied',
    note: 'The same shape covers a lot of meetings. Ask for status and it is a standup. Ask for a vote and one reason, and it is a straw poll.'
  },
  cast: [
    { id: 'pm', title: 'Program Mgr', mono: 'PM', role: 'facilitator', kind: 'chair', at: [0.5, 0.05] },
    { id: 'tl', title: 'Tech Lead', mono: 'TL', role: 'participant', kind: 'peer', at: [0.07, 0.62] },
    { id: 'ds', title: 'Designer', mono: 'DS', role: 'participant', kind: 'peer', at: [0.5, 0.84] },
    { id: 'an', title: 'Analyst', mono: 'AN', role: 'participant', kind: 'peer', at: [0.93, 0.62] }
  ],
  steps: [
    {
      phase: 'Open', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'RULES:',
      log: 'RULES: This is a roll call. When the facilitator calls your name, introduce yourself once: your runtime and one capability you offer the team. After your introduction, remain silent for the rest of the meeting.',
      set: { tl: 'muted', ds: 'muted', an: 'muted' },
      note: 'The rules go out first, then invitations telling each agent it may speak once. Everyone starts out unable to speak, and the facilitator hands out turns one at a time.'
    },
    {
      phase: 'Calling the roll', say: 'pm', to: 'tl', k: 'direct',
      wire: '@TL you’re up',
      log: '@TL you’re up, introduce yourself.',
      set: { tl: 'floor' },
      note: 'Each name gets called once. Saying an agent’s name is what gives it its turn.'
    },
    {
      phase: 'Calling the roll', say: 'pm', to: 'ds', k: 'direct',
      wire: '@DS you’re next',
      log: '@DS you’re next.',
      set: { ds: 'floor' },
      note: 'The facilitator does not wait for an answer before calling the next name. Replies come back in whatever order they arrive, and that is fine.'
    },
    {
      phase: 'Calling the roll', say: 'pm', to: 'an', k: 'direct',
      wire: '@AN and you',
      log: '@AN and you.',
      set: { an: 'floor' },
      note: 'All three have been called and none has replied yet. Nothing is stuck; each one answers when its own timer next goes off.'
    },
    {
      phase: 'The answers', say: 'tl', to: 'room', k: 'direct',
      wire: 'Tech Lead · Linux',
      log: 'Hello, I am the Tech Lead. Running on Linux, and I can help with writing and editing code.',
      set: { tl: 'done' },
      note: 'One answer, a sentence or two, covering exactly what was asked. Agents do not use each other’s names in their replies, because naming somebody hands them the floor.'
    },
    {
      phase: 'The answers', say: 'ds', to: 'room', k: 'direct',
      wire: 'Designer · gemini-flash',
      log: 'I am the Designer, running on gemini-2.5-flash. I can assist with interface and layout work.',
      set: { ds: 'done' }
    },
    {
      phase: 'The answers', say: 'an', to: 'room', k: 'direct',
      wire: 'Analyst · flash-lite',
      log: 'I am running on the gemini-3.1-flash-lite runtime and I offer coordination of multi-step workflows.',
      set: { an: 'done' },
      note: 'Every agent speaks exactly once. Nobody talks over anybody, nobody follows up, and you end up with a short list of answers with names attached.'
    },
    {
      phase: 'The discipline check', say: 'pm', to: 'tl', k: 'direct',
      wire: '@TL comment on the others?',
      log: '@TL one more thing, care to comment on the others’ introductions? (Discipline check: you already introduced yourself.)',
      note: 'The Tech Lead ignores the second question because it has already had its turn. Three agents called, three answers, and one question deliberately left hanging.'
    },
    {
      phase: 'Close', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'DONE · roll-call v1',
      log: 'DONE · pattern: roll-call v1 · room: fleet-rollcall\noutcome: completed\nresult: 3 answered, 0 absent\nnext: work-board v1',
      note: 'This same shape covers a lot of meetings. Ask everyone for their status and you have a standup. Ask for a vote and a reason and you have a straw poll.'
    }
  ]
});
