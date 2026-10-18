/* Layered passes - everyone touches the whole artifact, one concern per pass.
   Source: .../patterns/layered-passes.md   Relay ADDS; passes REWORK.        */

AgentSim.register('layered-passes', {
  title: 'Layered passes',
  tagline: 'Each agent goes over the whole document in turn, and each one only fixes a single kind of problem.',
  shape: 'sequential',
  hue: 'verify',
  room: 'layers-4a90',  blurb: 'Everyone touches the whole artifact, in sequential passes each focused on one concern: draft, develop, polish.',
  grade: 'fixed-per-round',
  problem: 'A report has been drafted, but it is badly organised, its numbers have no sources, and the writing style changes part-way through. Trying to fix all three at once usually means none of them get fixed properly.',
  contract: {
    inputs: [
      'the draft, at a known version',
      'a list of the passes in order, each one fixing a single kind of problem'
    ],
    membership: 'A new agent can only take a pass that has not started yet.',
    outputs: [
      'the document at its final version',
      'a note from each pass saying what it changed',
      'notes about problems one pass spotted but left for a later one'
    ]
  },
  outcome: {
    result: 'the report at version c90d11, after three passes',
    record: 'one problem flagged during the first pass and fixed during the second',
    open: 'nothing',
    note: 'Each pass fixes only the one thing it was given. If it notices anything else, it leaves a note for whichever pass is responsible for that instead of fixing it itself.'
  },
  cast: [
    { id: 'pm', title: 'Program Mgr', mono: 'PM', role: 'convener', kind: 'chair', at: [0.5, 0.03] },
    { id: 'tl', title: 'Tech Lead', mono: 'TL', role: 'pass 1 · structure', kind: 'peer', at: [0.05, 0.86] },
    { id: 'an', title: 'Analyst', mono: 'AN', role: 'pass 2 · content', kind: 'peer', at: [0.5, 0.86] },
    { id: 'ed', title: 'Editor', mono: 'ED', role: 'pass 3 · style', kind: 'peer', at: [0.95, 0.86] }
  ],
  props: [
    { id: 'art', type: 'artifact', kind: 'artifact', label: 'the whole artifact', version: '91acf0', at: [0.5, 0.44], w: 152 }
  ],
  steps: [
    {
      phase: 'Open', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'SEQUENCE · base @ 91acf0',
      log: 'SEQUENCE: structure:Tech Lead, content:Analyst, style:Editor · base @ 91acf0',
      note: 'The document already exists in rough form and needs improving in stages. Each stage covers the whole thing but fixes only one kind of problem. A few sharp stages beat a lot of vague ones.'
    },
    {
      phase: 'Pass 1 · structure', say: 'tl', to: 'art', k: 'pen',
      wire: 'PASS 1 BEGIN · structure',
      log: 'PASS 1 BEGIN · structure · Tech Lead · base @ 91acf0',
      set: { tl: 'floor' },
      note: 'For the length of your stage you are the only agent editing, and you are editing the whole document, for one kind of problem only.'
    },
    {
      phase: 'Pass 1 · structure', say: 'tl', to: 'room', k: 'direct',
      wire: 'FLAG · for content',
      log: 'FLAG · for content · section 3 · claims 40% with no source',
      note: 'This is the rule that makes it work. Fix anything your stage covers and leave everything else alone, including obvious mistakes. Write them down instead. Fixing a typo during the structure stage feels free and costs that stage its focus.'
    },
    {
      phase: 'Pass 1 · structure', say: 'tl', to: 'art', k: 'pen',
      wire: 'PASS 1 DONE · @ a2210b',
      log: 'PASS 1 DONE · structure · @ a2210b\nCHANGED: merged sections 2 and 4; promoted the risks list\nFLAGS RAISED: 1\nFLAGS RESOLVED: none incoming',
      set: { tl: 'done' }, bump: { art: 'a2210b' },
      note: 'Each stage closes by saying what it changed, what it noticed and left, and which earlier notes it dealt with.'
    },
    {
      phase: 'Pass 2 · content', say: 'an', to: 'art', k: 'pen',
      wire: 'PASS 2 BEGIN · content',
      log: 'PASS 2 BEGIN · content · Analyst · base @ a2210b',
      set: { an: 'floor' },
      note: 'Different agents are good at different things. The next stage starts from the version the last one produced, and that version is stated out loud.'
    },
    {
      phase: 'Pass 2 · content', say: 'an', to: 'art', k: 'pen',
      wire: 'PASS 2 DONE · @ b7f3c4',
      log: 'PASS 2 DONE · content · @ b7f3c4\nCHANGED: sourced or cut every number; expanded the risks\nFLAGS RAISED: 0\nFLAGS RESOLVED: the 40% claim (cut; unsourceable)',
      set: { an: 'done' }, bump: { art: 'b7f3c4' },
      note: 'The problem flagged during the first stage gets fixed by the stage that covers it. That is exactly what writing it down was for.'
    },
    {
      phase: 'Pass 3 · style', say: 'ed', to: 'art', k: 'pen',
      wire: 'PASS 3 BEGIN · style',
      log: 'PASS 3 BEGIN · style · Editor · base @ b7f3c4',
      set: { ed: 'floor' },
      note: 'For prose the stages are usually structure, then content, then style, then accuracy. For code, architecture, then implementation, then naming, then tests. If you cannot name a stage in a word or two, it is not a stage yet.'
    },
    {
      phase: 'Pass 3 · style', say: 'ed', to: 'art', k: 'pen',
      wire: 'PASS 3 DONE · @ c90d11',
      log: 'PASS 3 DONE · style · @ c90d11\nCHANGED: one voice throughout; sentence length variance up\nFLAGS RAISED: 0\nFLAGS RESOLVED: none incoming',
      set: { ed: 'done' }, bump: { art: 'c90d11' },
      note: 'Between your stages you say nothing. If you disagree with what another stage did, that goes in a note or nowhere.'
    },
    {
      phase: 'The flag sweep', say: 'pm', to: 'room', k: 'verdict',
      wire: 'SWEEP: no survivors',
      log: 'SWEEP: no surviving flags.',
      note: 'At the end the convener goes through anything that was noticed but never fixed, and either assigns it or drops it with a reason. Nothing is left to rot quietly.'
    },
    {
      phase: 'Close', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'DONE · layered-passes v1',
      log: 'DONE · pattern: layered-passes v1 · room: layers-4a90\noutcome: completed\nresult: @ c90d11\nnext: none',
      note: 'Two things kill this. Stages that bleed into each other, so everyone fixes everything and the last agent inherits a moving target. And too many vague stages, which is a queue rather than a process.'
    }
  ]
});
