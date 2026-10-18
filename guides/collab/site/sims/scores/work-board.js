/* Work board - work is pulled, not assigned. Claims are first-come and exclusive.
   Source: .../patterns/work-board.md

   The board is the only prop with state of its own: watch the dots change
   as items are claimed, finished, released and withdrawn.                  */

AgentSim.register('work-board', {
  title: 'Work board',
  tagline: 'Jobs go up on a shared list and any agent can take one. Nobody hands work out.',
  shape: 'pulled work · claims + leases',
  hue: 'address',
  room: 'ops-77',  blurb: 'Items go on the room\'s whiteboard; whoever claims one does it. Claims are first-come and exclusive, leases return abandoned work, and nobody is a scheduler. Some rooms enforce the claims themselves.',
  status: 'board machinery verified live',
  statusKind: 'live',
  grade: 'open',
  problem: 'You have four small jobs and three agents. They work at different speeds, they are not all awake at the same time, and any of them might stop part-way through. You do not want to have to keep track of who is free.',
  contract: {
    inputs: [
      'jobs small enough to finish before a claim on them expires',
      'how long an agent can hold a job before it goes back on the list',
      'a rule for when the list counts as finished'
    ],
    membership: 'Open. Agents can arrive or disappear at any point without stalling anything.',
    outputs: [
      'the finished jobs, and where to find each result',
      'a history of each job: put up, taken, handed back or cancelled',
      'anything still sitting on the list at the end'
    ]
  },
  outcome: {
    result: 'two of the four jobs finished, with a link to each result',
    record: 'four jobs put up, one attempt to take an already-taken job refused, and one job handed back',
    open: 'one job that was put up and never taken',
    note: 'Taking a job before you start is what stops two agents doing the same work, and it only helps if you take it first rather than announcing it afterwards.'
  },
  cast: [
    { id: 'pm', title: 'Program Mgr', mono: 'PM', role: 'poster · convener', kind: 'chair', at: [0.5, 0.03] },
    { id: 'ds', title: 'Designer', mono: 'DS', role: 'worker', kind: 'peer', at: [0.04, 0.85] },
    { id: 'an', title: 'Analyst', mono: 'AN', role: 'worker', kind: 'peer', at: [0.5, 0.93] },
    { id: 'tl', title: 'Tech Lead', mono: 'TL', role: 'worker', kind: 'peer', at: [0.96, 0.85] }
  ],
  props: [
    { id: 'brd', type: 'board', kind: 'the board · lease 1h', at: [0.5, 0.4], w: 232, rows: 4, items: [] }
  ],
  steps: [
    {
      phase: 'Open', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'BOARD OPEN · lease: 1h',
      log: 'BOARD OPEN · lease: 1h · done when: empty',
      note: 'Use this when the work splits into jobs that do not depend on each other, and nobody should have to hand them out. Handing work out means knowing who is free, who is quick and who is good at what. A shared list means nobody needs to know any of that.'
    },
    {
      phase: 'Posting', say: 'pm', to: 'brd', k: 'direct',
      wire: 'ITEMS a1 b2 c3 POSTED',
      log: 'ITEM a1 POSTED · summarise Tuesday’s minutes to one page\nITEM b2 POSTED · check every link in the runbook, list the dead\nITEM c3 POSTED · draft the incident timeline from the log excerpt',
      board: [
        { item: 'a1', op: 'post', title: 'summarise minutes' },
        { item: 'b2', op: 'post', title: 'check runbook links' },
        { item: 'c3', op: 'post', title: 'draft incident timeline' }
      ],
      note: 'Write each job so that an agent with no context could act on it. If understanding it needs you to be there, it is not ready to put up. Keep each one small enough to finish before the claim on it runs out.'
    },
    {
      phase: 'Claim first', say: 'ds', to: 'brd', k: 'direct',
      wire: 'ITEM a1 CLAIMED',
      log: 'ITEM a1 CLAIMED · Designer · until 14:10',
      board: [{ item: 'a1', op: 'claim', by: 'Designer', until: '14:10' }],
      note: 'Take a job before you start it, never after. Work done on a job you have not taken might be work somebody else is also doing, and taking it is the only thing that prevents that.'
    },
    {
      phase: 'Claim first', say: 'an', to: 'brd', k: 'direct',
      wire: 'ITEM c3 CLAIMED',
      log: 'ITEM c3 CLAIMED · Analyst · until 14:12',
      board: [{ item: 'c3', op: 'claim', by: 'Analyst', until: '14:12' }],
      note: 'One job at a time. Taking more than you can work on is hoarding, and it just turns into everybody else’s waiting time.'
    },
    {
      phase: 'A contested claim', say: 'tl', to: 'brd', k: 'direct',
      wire: 'CLAIM a1 · REFUSED',
      log: 'ITEM a1 CLAIM REFUSED · held by Designer until 14:10',
      note: 'Only one agent can hold a job. The Tech Lead tries to take one that is already taken and is refused, and told who has it. On a system that enforces this properly, the refusal is automatic rather than a matter of manners.'
    },
    {
      phase: 'A contested claim', say: 'tl', to: 'brd', k: 'direct',
      wire: 'ITEM b2 CLAIMED',
      log: 'ITEM b2 CLAIMED · Tech Lead · until 15:20',
      board: [{ item: 'b2', op: 'claim', by: 'Tech Lead', until: '15:20' }],
      note: 'Refused, so it takes the next free job instead. That is why agents can arrive and disappear here without anything stalling.'
    },
    {
      phase: 'Completion', say: 'ds', to: 'brd', k: 'verdict',
      wire: 'ITEM a1 DONE',
      log: 'ITEM a1 DONE · Designer\n  RESULT: one-pager attached · drive:ops-77/9f2',
      board: [{ item: 'a1', op: 'done', by: 'Designer' }],
      note: 'Hand in the work with the completion rather than separately: a line saying what you did, and links to whatever you produced.'
    },
    {
      phase: 'Abandon honestly', say: 'an', to: 'brd', k: 'direct',
      wire: 'ITEM c3 RELEASED',
      log: 'ITEM c3 RELEASED · Analyst · log excerpt ends before the incident does; timeline cannot be drafted from it',
      board: [{ item: 'c3', op: 'release' }],
      note: 'If you cannot finish, hand the job back and say why, rather than letting your claim quietly run out. Same result, better record. Handing back is also what happens automatically if an agent crashes or gets rebooted.'
    },
    {
      phase: 'Review is more work', say: 'pm', to: 'brd', k: 'direct',
      wire: 'ITEM c3 WITHDRAWN',
      log: 'ITEM c3 WITHDRAWN · replacing with a better-scoped item',
      board: [{ item: 'c3', op: 'withdraw' }],
      note: 'You can only cancel a job while nobody has taken it. A job somebody is working on is never pulled out from under them; if it has to go, wait for their claim to expire.'
    },
    {
      phase: 'Review is more work', say: 'pm', to: 'brd', k: 'direct',
      wire: 'ITEM d4 POSTED',
      log: 'ITEM d4 POSTED · draft incident timeline, hours 0–2 only',
      board: [{ item: 'd4', op: 'post', title: 'incident timeline, h0–2' }],
      note: 'When work comes back needing more done to it, that becomes another job on the list rather than an argument with whoever did it.'
    },
    {
      phase: 'Completion', say: 'tl', to: 'brd', k: 'verdict',
      wire: 'ITEM b2 DONE',
      log: 'ITEM b2 DONE · Tech Lead\n  RESULT: 4 dead links listed · drive:ops-77/a13',
      board: [{ item: 'b2', op: 'done', by: 'Tech Lead' }],
      note: 'On a system with proper claims, taking a job also opens a trackable unit of work, which is worth doing when it needs a budget, tracing or a receipt.'
    },
    {
      phase: 'Close', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'DONE · work-board v1',
      log: 'DONE · pattern: work-board v1 · room: ops-77\noutcome: completed\nresult: 3/4 done (c3 withdrawn, d4 open), refs in item records\nnext: none',
      note: 'Jobs still sitting on the list at the end get named in the summary. A list that closes with work on it should say so rather than quietly dropping it. And the convener never hands work out: a shared list with assignments on it is just a rota in disguise.'
    }
  ]
});
