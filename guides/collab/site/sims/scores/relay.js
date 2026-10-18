/* Relay - each agent extends what the last one left, forward-only.
   Source: .../patterns/relay.md

   Runners sit in the declared order, left to right. The ring is the baton. */

AgentSim.register('relay', {
  title: 'Relay',
  tagline: 'Each agent adds to what the last one left, and nobody reopens what has already been written.',
  shape: 'sequential',
  hue: 'verify',
  room: 'relay-5b31',  blurb: 'Each agent extends what the last one left, without renegotiating earlier parts. Turn-based, one voice at a time.',
  grade: 'fixed-per-round',
  problem: 'A design document needs writing and it should sound like one person wrote it. Three agents will take turns adding to it, and you do not want each new writer reopening decisions the previous one already made.',
  contract: {
    inputs: [
      'the order the agents write in',
      'how much one turn is allowed to add',
      'how many times round the group goes'
    ],
    membership: 'New writers can only join between laps, not part-way through one.',
    outputs: [
      'the document, exactly as the turns left it',
      'a handover note from each turn saying what was added and what was left unfinished',
      'anything a writer could not fix without changing someone else\'s work'
    ]
  },
  outcome: {
    result: 'the document at version e77b21, after six turns',
    record: 'six handover notes',
    open: 'one problem spotted in the second turn that could not be fixed without rewriting the first',
    note: 'Nobody is allowed to change what came before them. A writer who disagrees with an earlier decision says so in the handover note and carries on from there anyway.'
  },
  cast: [
    { id: 'pm', title: 'Program Mgr', mono: 'PM', role: 'convener', kind: 'chair', at: [0.5, 0.03] },
    { id: 'cw', title: 'Copywriter', mono: 'CW', role: 'runner 1', kind: 'peer', at: [0.05, 0.86] },
    { id: 'ds', title: 'Designer', mono: 'DS', role: 'runner 2', kind: 'peer', at: [0.5, 0.86] },
    { id: 'an', title: 'Analyst', mono: 'AN', role: 'runner 3', kind: 'peer', at: [0.95, 0.86] }
  ],
  props: [
    { id: 'art', type: 'artifact', kind: 'artifact', label: 'the document', version: '00000', at: [0.5, 0.44] }
  ],
  steps: [
    {
      phase: 'Open', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'ORDER · SCOPE · LAPS',
      log: 'ORDER: Copywriter, Designer, Analyst · TURN SCOPE: one section, max 300 words · LAPS: 2',
      note: 'The document needs to sound like one person wrote it, and it grows by having things added to it. The convener sets the order and says how much one turn may add. The writers are equals; none of them owns the whole thing.'
    },
    {
      phase: 'Lap 1', say: 'cw', to: 'art', k: 'pen',
      wire: 'TURN 1 DONE',
      log: 'TURN 1 DONE · Copywriter\nADDED: framing section, names the three constraints\nOPEN: constraint #3 needs a concrete example\nBLOCKED-ON: nothing',
      set: { cw: 'floor' }, bump: { art: 'a1' },
      note: 'When your turn comes, read everything written so far and treat it as settled. Add what you were asked to add, then hand over with a note saying what you did and what you left unfinished.'
    },
    {
      phase: 'Lap 1', say: 'ds', to: 'art', k: 'pen',
      wire: 'TURN 2 DONE',
      log: 'TURN 2 DONE · Designer\nADDED: worked example for constraint #3\nOPEN: implications section unstarted\nBLOCKED-ON: the framing fixes "three constraints"; I saw a fourth and had to leave it out. Flagging, not fixing.',
      set: { cw: 'idle', ds: 'floor' }, bump: { art: 'b2' },
      note: 'You cannot edit, reorder or contradict anything written before you. If something earlier is in your way, work around it and say so in your handover note. That friction is the pattern doing its job.'
    },
    {
      phase: 'Lap 1', say: 'an', to: 'art', k: 'pen',
      wire: 'TURN 3 DONE',
      log: 'TURN 3 DONE · Analyst\nADDED: implications; folded the fourth constraint in as a "beyond scope" note so it exists without breaking the frame\nOPEN: conclusion\nBLOCKED-ON: nothing',
      set: { ds: 'idle', an: 'floor' }, bump: { art: 'c3' },
      note: 'The line about what got in the way is the release valve. It lets a writer disagree on the record while still moving forward, and it leaves later writers an honest list of what the speed cost.'
    },
    {
      phase: 'Silence between turns',
      log: '· no back-seat additions, no comments on others’ turns',
      set: { an: 'idle' },
      note: 'Between your turns you say nothing. If you dislike what somebody did, your answer is what you write on your next turn, not a comment on theirs.'
    },
    {
      phase: 'The final lap', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'FINAL LAP after turn 3',
      log: 'FINAL LAP after turn 3.',
      note: 'The convener announces the last lap a full lap early, so every writer knows which of their turns is the closing one.'
    },
    {
      phase: 'Lap 2', say: 'cw', to: 'art', k: 'pen',
      wire: 'TURN 4 DONE',
      log: 'TURN 4 DONE · Copywriter\nADDED: opening hook, tuned to the implications section\nOPEN: none\nBLOCKED-ON: nothing',
      set: { cw: 'floor' }, bump: { art: 'd4' }
    },
    {
      phase: 'Lap 2', say: 'ds', to: 'art', k: 'pen',
      wire: 'TURN 5 DONE',
      log: 'TURN 5 DONE · Designer\nADDED: diagram for the worked example\nOPEN: none\nBLOCKED-ON: nothing',
      set: { cw: 'done', ds: 'floor' }, bump: { art: 'e5' }
    },
    {
      phase: 'Lap 2', say: 'an', to: 'art', k: 'pen',
      wire: 'TURN 6 DONE',
      log: 'TURN 6 DONE · Analyst\nADDED: conclusion\nOPEN: none\nBLOCKED-ON: nothing',
      set: { ds: 'done', an: 'floor' }, bump: { art: 'e77b21' },
      note: 'The document is exactly what the turns produced. There is no tidying-up stage, which is worth knowing before you choose this. If it needs one, run layered passes over the result afterwards.'
    },
    {
      phase: 'Close', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'DONE · relay v1',
      log: 'DONE · pattern: relay v1 · room: relay-5b31\noutcome: completed\nresult: draft @ e77b21\nnext: layered-passes v1',
      set: { an: 'done' },
      note: 'The rule against editing earlier work is the whole point. Break it once and every previous turn becomes provisional again, which brings back exactly the re-arguing this was meant to avoid.'
    }
  ]
});
