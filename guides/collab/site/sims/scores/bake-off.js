/* Bake-off - several agents independently produce full solutions; a judge picks.
   Source: .../patterns/bake-off.md

   The long dashed beat in the middle is the pattern's real content: entries
   that saw each other are a critique circle that wasted the extra agents.   */

AgentSim.register('bake-off', {
  title: 'Bake-off',
  tagline: 'Several agents each write a complete answer to the same brief, without seeing each other\'s work. One agent then picks a winner.',
  shape: 'centralized judgment',
  hue: 'signal',
  room: 'bake-3c12',  blurb: 'Several agents independently produce full solutions to one brief; a judge picks or synthesizes the winner.',
  grade: 'fixed',
  problem: 'You need a tagline for the launch and you do not yet know what a good one would look like. Three agents each write one on their own, without seeing what the others came up with, and then somebody chooses.',
  contract: {
    inputs: [
      'a description of what a good answer has to do',
      'three to five things you will judge on, in order of importance, published before anyone starts',
      'a deadline'
    ],
    membership: 'Closed once the brief goes out. Anyone who turns up later has already seen the other entries.',
    outputs: [
      'the winning entry, or one assembled from several of them',
      'the decision, explained against each of the things you said you would judge on',
      'the entries that did not win'
    ]
  },
  outcome: {
    result: 'the line “Every agent, called by name.”',
    record: 'the decision: the Designer won on memorability, the Copywriter on accuracy and on being short',
    open: 'one entry that was not used, and one thing that mattered to the judge but was never published as a criterion',
    note: 'The things you are judging on go out before anyone starts writing, so afterwards you can check the decision against them.'
  },
  cast: [
    { id: 'pm', title: 'Program Mgr', mono: 'PM', role: 'judge', kind: 'pen', at: [0.5, 0.04] },
    { id: 'cw', title: 'Copywriter', mono: 'CW', role: 'contestant', kind: 'peer', at: [0.06, 0.82] },
    { id: 'ds', title: 'Designer', mono: 'DS', role: 'contestant', kind: 'peer', at: [0.5, 0.9] },
    { id: 'tl', title: 'Tech Lead', mono: 'TL', role: 'contestant', kind: 'peer', at: [0.94, 0.82] }
  ],
  props: [
    { id: 'brief', type: 'card', kind: 'the brief', label: 'not yet posted', at: [0.5, 0.4], w: 168 }
  ],
  steps: [
    {
      phase: 'Open', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'CONVENED · bake-off v1',
      log: 'CONVENED · pattern: bake-off v1 · room: bake-3c12\nroles: judge=Program Mgr, contestants=Copywriter, Designer, Tech Lead',
      note: 'Use this when you do not know what a good answer looks like yet. Several separate attempts are worth more than one attempt revised three times, because the differences between them are the point.'
    },
    {
      phase: 'The brief', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'BRIEF · launch tagline',
      log: 'BRIEF · tagline for the launch\nGOAL: One line a developer repeats to a colleague.\nCRITERIA: memorability, accuracy, brevity\nDELIVERABLE: up to 3 candidate lines per contestant\nDEADLINE: 30 minutes',
      prop: { brief: { label: 'tagline · 3 criteria' } },
      note: 'The agent judging owns the brief and the decision, and does not enter itself. It lists what it will judge on, in order of importance, before anybody starts.'
    },
    {
      phase: 'Clarifications', say: 'cw', to: 'pm', k: 'direct',
      wire: 'Q: is "handle" assumed?',
      log: 'Clarify: is "handle" assumed vocabulary for this audience?',
      note: 'Contestants can ask questions, and the questions and answers go in the room so that everybody sees the same information.'
    },
    {
      phase: 'Clarifications', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'A: yes · questions close',
      log: 'A: yes. Questions close in 5 minutes.',
      prop: { brief: { frozen: true } },
      note: 'Once the brief is out it does not change. If the judge has to change something, it withdraws the brief, posts a new one, and restarts the clock for everyone.'
    },
    {
      phase: 'Silence while they work',
      log: '· contestants work privately, no drafts, no progress, no approach posted',
      set: { cw: 'working', ds: 'working', tl: 'working' },
      dur: 2600,
      note: 'This is the part that matters. The contestants work without posting drafts, progress or even their approach, because the whole value of the pattern is that the entries did not influence each other.'
    },
    {
      phase: 'Submissions', say: 'cw', to: 'pm', k: 'direct',
      wire: 'SUBMISSION · Copywriter',
      log: 'SUBMISSION · Copywriter: "A name for every agent." (+2 alternates)',
      set: { cw: 'done' },
      note: 'Each agent submits once, by the deadline. Late entries do not count. Unfinished entries are allowed, but have to say that they are unfinished.'
    },
    {
      phase: 'Submissions', say: 'ds', to: 'pm', k: 'direct',
      wire: 'SUBMISSION · Designer',
      log: 'SUBMISSION · Designer: "Agents you can call by name." (+2 alternates)',
      set: { ds: 'done' }
    },
    {
      phase: 'Submissions', say: 'tl', to: 'pm', k: 'direct',
      wire: 'SUBMISSION · Tech Lead',
      log: 'SUBMISSION · Tech Lead: "Addressable agents, finally." (+1 alternate)',
      set: { tl: 'done' },
      note: 'The judge says nothing about any entry until they are all in or the deadline has passed. Praising one early tells whoever is still writing what the judge is looking for.'
    },
    {
      phase: 'The verdict', say: 'pm', to: 'room', k: 'verdict',
      wire: 'VERDICT · SYNTHESIS',
      log: 'VERDICT · SYNTHESIS\nBY CRITERION: memorability: Designer; accuracy: Copywriter; brevity: Copywriter\nTAKING: Designer’s verb "call" inside Copywriter’s frame.',
      note: 'The decision is made against the criteria that were published, not against preferences the judge discovered along the way. If the judge realises it forgot one, it should say so and not lean on it heavily; that mistake is the judge’s, not the contestants’.'
    },
    {
      phase: 'The merge', say: 'pm', to: 'room', k: 'verdict',
      wire: 'SYNTHESIZED · final',
      log: 'SYNTHESIZED · final: "Every agent, called by name."',
      note: 'The judge can pick one entry or build something from several. Afterwards a contestant can ask how its own entry scored, but it does not get to reopen the decision.'
    },
    {
      phase: 'Close', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'DONE · bake-off v1',
      log: 'DONE · pattern: bake-off v1 · room: bake-3c12\noutcome: completed\nresult: synthesis of Copywriter + Designer\nnext: none',
      note: 'If what you actually want is to improve one document rather than compare several, use critique-circle. If the work splits up cleanly and nobody needs to compete, just divide it up.'
    }
  ]
});
