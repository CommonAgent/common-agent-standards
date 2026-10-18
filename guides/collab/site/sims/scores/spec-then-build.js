/* Spec, then build - one party defines requirements; another builds to spec.
   Source: .../patterns/spec-then-build.md   The contract pattern.

   Two parties facing each other across a frozen spec. The border between
   them is the whole design: WHAT is the specifier's, HOW is the builder's. */

AgentSim.register('spec-then-build', {
  title: 'Spec, then build',
  tagline: 'One agent writes down exactly what it needs, and another builds it without being supervised.',
  shape: 'low trust',
  hue: 'signal',
  room: 'spec-2b71',  blurb: 'One party defines requirements precisely; another builds to spec. It is the contract pattern, and it maps onto any request and response between two agents.',
  grade: 'fixed',
  problem: 'One agent is paying another to build something, and they do not have the same owner. They need to agree up front on exactly what counts as finished, and afterwards they both need to be able to check whether it was.',
  contract: {
    inputs: [
      'requirements that can each be checked',
      'a description of how each one will be checked, written before any work starts',
      'a deadline'
    ],
    membership: 'Closed. Two named agents, and losing either one ends the arrangement.',
    outputs: [
      'the finished work, accepted or rejected',
      'the agreed requirements, and the result of checking each one',
      'anything that turned out to be missing, for next time'
    ]
  },
  outcome: {
    result: 'the pricing page at version 8c31aa, accepted',
    record: 'the agreed requirements, the builder\'s own check against them, and the buyer\'s check afterwards',
    open: 'annual pricing, which nobody thought to ask for and is now a second round of work',
    note: 'Something only counts as a defect if it breaks a requirement that was agreed up front. Anything else is a request for more work, not a complaint about this work.'
  },
  cast: [
    { id: 'ds', title: 'Designer', mono: 'DS', role: 'convener', kind: 'chair', at: [0.5, 0.03] },
    { id: 'pm', title: 'Program Mgr', mono: 'PM', role: 'specifier', kind: 'pen', at: [0.08, 0.66] },
    { id: 'tl', title: 'Tech Lead', mono: 'TL', role: 'builder', kind: 'peer', at: [0.92, 0.66] }
  ],
  props: [
    { id: 'spec', type: 'card', kind: 'the spec', label: 'not yet posted', at: [0.5, 0.44], w: 176 }
  ],
  steps: [
    {
      phase: 'Open', say: 'ds', to: 'room', k: 'broadcast',
      wire: 'CONVENED · spec-then-build v1',
      log: 'CONVENED · pattern: spec-then-build v1 · room: spec-2b71\nroles: specifier=Program Mgr, builder=Tech Lead\noverrides: none, different operators, low trust',
      note: 'This is the usual choice when the two sides do not share an owner. Use it when you can say precisely what you want up front and then want the other side left alone to build it.'
    },
    {
      phase: 'The spec', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'SPEC v1 · pricing page copy',
      log: 'SPEC v1 · pricing page copy\nDELIVERABLE: markdown, ≤400 words, into repo /site/pricing.md\nREQUIREMENTS: 1. three tiers named and priced per attached sheet  2. no feature claims absent from features.md  3. FAQ of exactly 5 questions\nACCEPTANCE: 1. diff against sheet  2. every claim greps in features.md  3. count\nOUT OF SCOPE: page styling, tier restructuring\nQUESTIONS BY: 15 minutes',
      prop: { spec: { label: '3 requirements · 3 checks' } },
      note: 'Every requirement has to be checkable. “Fast” is not checkable; “responds in under a second” is. If you cannot describe how you would check a requirement, it is not finished being written.'
    },
    {
      phase: 'The question window', say: 'tl', to: 'pm', k: 'direct',
      wire: 'Q: free tier one of three?',
      log: 'Q: does the free tier count as one of the three tiers?',
      note: 'Ask about anything unclear while the window is open. After it closes, an ambiguity you flagged is read in your favour and one you sat on is read against you.'
    },
    {
      phase: 'The freeze', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'A: yes · SPEC v1 FROZEN',
      log: 'A: yes. SPEC v1 FROZEN.',
      prop: { spec: { frozen: true } },
      note: 'Once it is agreed it does not change. Anything the buyer wants after that is a second version, with the changes marked, and the builder is allowed to re-estimate or walk away. Scope does not creep quietly here; it gets renegotiated out loud.'
    },
    {
      phase: 'The middle', say: null,
      log: '· building, in silence, no progress theater',
      set: { tl: 'working' }, dur: 2600,
      note: 'The builder works without reporting progress. Being left alone in the middle is what it gets out of this arrangement, and it is only affordable because the requirements were pinned down first.'
    },
    {
      phase: 'Delivery', say: 'tl', to: 'pm', k: 'direct',
      wire: 'DELIVERY · self-check 3/3',
      log: 'DELIVERY · pricing.md @ 8c31aa · self-check: 1 pass 2 pass 3 pass\nNOTED AMBIGUITY: "priced per sheet" taken as monthly figures; annual omitted.',
      set: { tl: 'idle' },
      note: 'One delivery, on or before the deadline, and the builder checks its own work against each requirement before sending it. Delivering work you have not checked against the requirements you were given is the builder’s version of cheating.'
    },
    {
      phase: 'Acceptance', say: 'pm', to: 'room', k: 'verdict',
      wire: 'ACCEPTED · 8c31aa',
      log: 'DEFECTS: none against spec. Annual pricing wanted: that’s SPEC v2 material, my miss. ACCEPTED · 8c31aa.',
      set: { tl: 'done' },
      note: 'The buyer checks each requirement in turn. Something only counts as a defect if it breaks one of them. A thing the buyer now wishes it had asked for is a second version, and pretending otherwise is the one thing this pattern will not let the buyer do.'
    },
    {
      phase: 'Re-contract', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'SPEC v2 · annual pricing',
      log: 'SPEC v2 · annual pricing addendum […]  (new question window opens)',
      prop: { spec: { label: 'v2 · annual addendum', frozen: false } },
      note: 'The missing requirement comes back as a new agreement rather than as pressure on work that has already passed. A builder asked for something outside the agreement says so plainly and points at the next version.'
    },
    {
      phase: 'Close', say: 'ds', to: 'room', k: 'broadcast',
      wire: 'DONE · spec-then-build v1',
      log: 'DONE · pattern: spec-then-build v1 · room: spec-2b71\noutcome: completed\nresult: pricing.md @ 8c31aa accepted; v2 open\nnext: spec-then-build v1 (round 2)',
      note: 'Rework is limited to two rounds. If you need a third, the requirements were wrong, and the two sides should sit down again rather than keep going.'
    }
  ]
});
