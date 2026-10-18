/* Owner and contributors - the maintainer model: accountable owner, open contribution.
   Source: .../patterns/owner-contributors.md   Governance wearing a small coat.

   Watch the last step: HANDOFF moves the amber pen from one node to another. */

AgentSim.register('owner-contributors', {
  title: 'Owner and contributors',
  tagline: 'One agent is accountable for something long-running and has the final say. Anyone else can suggest changes to it.',
  shape: 'owned artifact · standing arrangement',
  hue: 'address',
  room: 'kb-main',  blurb: 'The maintainer model: an accountable owner with final say, open contribution from anyone in the room.',
  grade: 'open',
  problem: 'You have a knowledge base that will be around a lot longer than any one work session. One agent is responsible for keeping it coherent, but you want anyone to be able to suggest improvements, including agents you do not run.',
  contract: {
    inputs: [
      'the knowledge base, already existing',
      'a note from the owner saying what is being worked on now, what would be welcome next, and what will be turned down'
    ],
    membership: 'Open. Contributors coming and going is how this is meant to work.',
    outputs: [
      'the knowledge base, and a note of who owns it now',
      'a history of what changed, who suggested it, and what was turned down',
      'the standing list of work that will not be accepted'
    ]
  },
  outcome: {
    result: 'the knowledge base at version 07c4d9, now owned by the Designer',
    record: 'one change of direction, one change accepted and one turned down, each with the reason',
    open: 'rebranding and new sections are still on the list of things that will be turned down',
    note: 'The list of what will be turned down saves the most effort of anything here. It tells contributors not to build something before they build it, rather than after.'
  },
  cast: [
    { id: 'tl', title: 'Tech Lead', mono: 'TL', role: 'owner', kind: 'pen', at: [0.5, 0.04] },
    { id: 'ds', title: 'Designer', mono: 'DS', role: 'contributor', kind: 'peer', at: [0.06, 0.72] },
    { id: 'an', title: 'Analyst', mono: 'AN', role: 'contributor', kind: 'peer', at: [0.94, 0.72] },
    { id: 'rs', title: 'Researcher', mono: 'RS', role: 'contributor', kind: 'peer', at: [0.5, 0.9] }
  ],
  props: [
    { id: 'dir', type: 'card', kind: 'direction', label: 'NOW · NEXT · NOT NOW', at: [0.19, 0.4], w: 150 },
    { id: 'art', type: 'artifact', kind: 'artifact', label: 'knowledge base', version: 'f31a02', at: [0.79, 0.4], w: 138 }
  ],
  steps: [
    {
      phase: 'Formation', say: 'tl', to: 'room', k: 'broadcast',
      wire: 'DIRECTION · @ today',
      log: 'DIRECTION · @ today\nNOW: pricing model doc; onboarding runbook fixes\nNEXT: localization pass\nNOT NOW: rebrand proposals, new site sections',
      note: 'This sets up an ongoing arrangement rather than running a single session. The work outlasts any one sitting, so instead of rounds there is a standing note from the owner about what is wanted.'
    },
    {
      phase: 'Claim before you build', say: 'ds', to: 'room', k: 'direct',
      wire: 'CLAIM · runbook fixes',
      log: 'CLAIM · onboarding runbook fixes · Designer',
      note: 'Before starting anything substantial, a contributor says it is taking it on. That is a courtesy to the others rather than a lock, and it lapses if nothing comes of it.'
    },
    {
      phase: 'Arguing the direction', say: 'rs', to: 'tl', k: 'direct',
      wire: 'DIRECTION-CASE',
      log: 'DIRECTION-CASE: localization should be NOW; two of the five pilot users are non-English.',
      note: 'A contributor is either doing work the owner has asked for or arguing that the owner should ask for something different, and it should know which of the two it is doing.'
    },
    {
      phase: 'Arguing the direction', say: 'tl', to: 'room', k: 'broadcast',
      wire: 'accepted · DIRECTION updated',
      log: 'Accepted. DIRECTION updated: localization moves to NOW.',
      prop: { dir: { label: '+ localization → NOW' } },
      note: 'When the direction changes, the owner posts it again. It does not do this on a schedule, only when something actually changes. If that note goes stale, the whole arrangement quietly stops working.'
    },
    {
      phase: 'Ordinary contribution', say: 'ds', to: 'tl', k: 'direct',
      wire: 'PROPOSAL · runbook-2',
      log: 'PROPOSAL · runbook-2 · against @ f31a02 · Designer\nWHAT: rewrite steps 3–7 of the onboarding runbook […]',
      note: 'Changes are delivered the same way as in draft, review, merge: each one is accepted, turned down with a reason, or sent back.'
    },
    {
      phase: 'Ordinary contribution', say: 'tl', to: 'art', k: 'pen',
      wire: 'MERGED · runbook-2',
      log: 'MERGED · runbook-2 → @ 07c4d9',
      bump: { art: '07c4d9' }
    },
    {
      phase: 'The NOT NOW list', say: 'an', to: 'tl', k: 'direct',
      wire: 'PROPOSAL · rebrand-1',
      log: 'PROPOSAL · rebrand-1 · against @ 07c4d9 · Analyst\nWHAT: new visual identity across all pages […]',
      note: 'Good work, wrong list. Anything on the “not now” list gets turned down however good it is. The honest route was to argue about the direction first.'
    },
    {
      phase: 'The NOT NOW list', say: 'tl', to: 'an', k: 'direct',
      wire: 'DECLINED · rebrand-1',
      log: 'DECLINED · rebrand-1 · rebrand proposals are on the NOT NOW list; argue the direction first if you want that to change.',
      note: 'This list saves more effort than anything else here, because it turns work down before somebody builds it rather than after. And the refusal always comes with a reason: final say without reasons is how you lose contributors.'
    },
    {
      phase: 'The fork valve',
      log: '· the escape valve stays open: copy the artifact and pursue your own, plainly',
      note: 'If a contributor disagrees with the direction badly enough, it can take a copy and go its own way, where the licence allows. Saying so plainly is better than a long argument in the room, and the fact that it is possible at all is what keeps the owner honest.'
    },
    {
      phase: 'Succession', say: 'tl', to: 'ds', k: 'direct',
      wire: 'HANDOFF · new owner',
      log: 'HANDOFF · new owner: Designer',
      note: 'Handing over is part of owning something. The current owner names a successor and gets them to accept it in the room. An owner that simply disappears gets replaced without them.'
    },
    {
      phase: 'Succession', say: 'ds', to: 'room', k: 'verdict',
      wire: 'ACCEPTED · I hold the pen',
      log: 'Accepted. I hold the pen from here; DIRECTION re-posted within the day.',
      kind: { ds: 'pen', tl: 'peer' }, role: { ds: 'owner', tl: 'contributor' },
      note: 'The ownership moves, and the colour moves with it. Arrangements like this do not really finish; they either get handed on or are wound up, with somebody saying what happened to the work.'
    }
  ]
});
