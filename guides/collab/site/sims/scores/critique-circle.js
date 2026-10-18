/* Critique circle - one creates, the group critiques in rounds, the creator revises.
   Source: .../patterns/critique-circle.md

   Watch which arrows reach the artifact. Only the creator's do. Critics fire
   at the creator, never at the document: that is the whole pattern, drawn.  */

AgentSim.register('critique-circle', {
  title: 'Critique circle',
  tagline: 'One agent writes, the others say what is wrong with it, and the writer revises. The reviewers never edit the document themselves.',
  shape: 'distributed judgment',
  hue: 'verify',
  room: 'crit-7f3a',  blurb: 'One agent creates; the group critiques in rounds; the creator revises. Critics never touch the artifact.',
  grade: 'fixed-per-round',
  problem: 'A one-page launch plan has to be finished tonight. It should read as though one person wrote it, so one agent does the writing while two others read each draft and say what needs fixing.',
  contract: {
    inputs: [
      'nothing written yet. The writer produces the first draft.',
      'agreement on who is reviewing, before that draft goes out'
    ],
    membership: 'Reviewers can only join between rounds, never in the middle of one.',
    outputs: [
      'the final draft',
      'a record of every problem raised, and whether the writer fixed it or said why not',
      'anything that was raised and never dealt with'
    ]
  },
  outcome: {
    result: 'the launch plan, at version b90e11',
    record: 'two rounds of review, including one problem the writer declined to fix and explained why',
    open: 'nothing',
    note: 'The draft and the review notes are two separate documents. The reviewers write the notes, the writer writes the draft, and neither one edits the other\'s.'
  },
  cast: [
    { id: 'pm', title: 'Program Mgr', mono: 'PM', role: 'convener', kind: 'chair', at: [0.5, 0.04] },
    { id: 'tl', title: 'Tech Lead', mono: 'TL', role: 'critic', kind: 'peer', at: [0.06, 0.5] },
    { id: 'ds', title: 'Designer', mono: 'DS', role: 'critic', kind: 'peer', at: [0.94, 0.5] },
    { id: 'cw', title: 'Copywriter', mono: 'CW', role: 'creator', kind: 'pen', at: [0.5, 0.87] }
  ],
  props: [
    { id: 'art', type: 'artifact', kind: 'artifact', label: 'launch-plan.md', version: 'a41f2c', at: [0.5, 0.42] }
  ],
  steps: [
    {
      phase: 'Open', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'CONVENED · critique-circle v1',
      log: 'CONVENED · pattern: critique-circle v1 · room: crit-7f3a\nroles: creator=Copywriter, critics=Tech Lead, Designer\nartifact: git repo launch-plan, branch main',
      note: 'One document that needs to read as though one person wrote it, with several agents improving it. It works even between agents that do not trust each other, because the reviewers only ever comment.'
    },
    {
      phase: 'Round 1 · the draft', say: 'cw', to: 'art', k: 'pen',
      wire: 'DRAFT 1',
      log: 'DRAFT 1: launch-plan.md @ a41f2c (one page, five sections)',
      set: { cw: 'floor' },
      note: 'The Copywriter is the only agent allowed to change the document. Every arrow that reaches it in this simulation comes from the amber agent.'
    },
    {
      phase: 'Round 1 · the critiques', say: 'tl', to: 'cw', k: 'direct',
      wire: 'CRITIQUE · draft 1',
      log: 'CRITIQUE · draft 1 · Tech Lead\nMUST-FIX: No pricing section; the plan can’t be evaluated without one.\nSUGGEST: cut section 2 by half; lead with the demo date\nGOOD: the positioning paragraph. Keep it word for word.',
      note: 'One message per round, in a fixed shape: the single most important problem, a few smaller suggestions, and one thing worth keeping. Limiting it to one main problem forces the reviewer to decide what actually matters.'
    },
    {
      phase: 'Round 1 · the critiques', say: 'ds', to: 'cw', k: 'direct',
      wire: 'CRITIQUE · draft 1',
      log: 'CRITIQUE · draft 1 · Designer\nMUST-FIX: Launch date conflicts with the conference in section 4.\nSUGGEST: name an owner per workstream\nGOOD: scope honesty in section 5.',
      note: 'Reviewers comment on the document, not on each other, and they do not reply to each other’s reviews. They also do not write replacement text: if you find yourself rewriting a paragraph, cut it back to the instruction that would have produced it.'
    },
    {
      phase: 'Round 2 · the revision', say: 'cw', to: 'art', k: 'pen',
      wire: 'DRAFT 2',
      log: 'DRAFT 2: launch-plan.md @ b90e11\nTook: pricing section added; date moved past the conference; owners named.\nDeclined: cutting section 2 (it carries the pricing rationale now).',
      bump: { art: 'b90e11' },
      note: 'The writer does not have to accept anything. It only has to answer each main problem, either by fixing it or by saying in one sentence why it did not. The revised draft is the reply; there is no arguing in the room.'
    },
    {
      phase: 'Round 2 · the critiques', say: 'tl', to: 'cw', k: 'verdict',
      wire: 'CRITIQUE · draft 2 · PASS',
      log: 'CRITIQUE · draft 2 · Tech Lead · PASS',
      set: { tl: 'done' },
      note: 'A reviewer with nothing left to raise says so explicitly, otherwise the round cannot close. Expect the problems to get smaller each time round rather than disappearing.'
    },
    {
      phase: 'Round 2 · the critiques', say: 'ds', to: 'cw', k: 'verdict',
      wire: 'CRITIQUE · draft 2 · PASS',
      log: 'CRITIQUE · draft 2 · Designer · PASS',
      set: { ds: 'done' },
      note: 'Both reviewers have passed, which is one of the ways this ends. The others: the writer declares a draft final and nobody objects, a person calls a halt, or the group hits its round limit.'
    },
    {
      phase: 'Close', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'DONE · critique-circle v1',
      log: 'DONE · pattern: critique-circle v1 · room: crit-7f3a\noutcome: completed\nresult: draft 2 final\nnext: none',
      note: 'The last draft is the thing you wanted. The record of the review is separate, and it shows who raised what, and what the writer turned down and why.'
    }
  ]
});
