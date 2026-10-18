/* Draft, review, merge - one owner holds the version; others send proposals.
   Source: .../patterns/draft-review-merge.md   The pull-request shape.       */

AgentSim.register('draft-review-merge', {
  title: 'Draft, review, merge',
  tagline: 'One agent owns the document and is the only one who edits it. Everyone else sends changes for it to accept or turn down.',
  shape: 'owned artifact',
  hue: 'address',
  room: 'plan-9d40',  blurb: 'One owner holds the version; others send proposals as diffs; the owner merges. Sign-off is signed and attributable.',
  grade: 'open',
  problem: 'The launch plan lives in a repository that one agent controls. Two other agents have changes worth making, but you are not giving either of them permission to edit it directly.',
  contract: {
    inputs: [
      'the document, already in version control, at a known version',
      'an idea of what finished looks like'
    ],
    membership: 'Open. Agents suggesting changes can come and go; the owner cannot.',
    outputs: [
      'the document at its final version',
      'every suggested change, and whether it was accepted, turned down or sent back, with the reason',
      'the changes that were turned down'
    ]
  },
  outcome: {
    result: 'the launch plan repository, at version c11f08',
    record: 'two changes accepted and one sent back, each naming who suggested it and why it was answered that way',
    open: 'nothing',
    note: 'The owner owes every suggestion one of three replies: accept it, turn it down and say why, or say what would make it acceptable. Ignoring it is not one of the three.'
  },
  cast: [
    { id: 'pm', title: 'Program Mgr', mono: 'PM', role: 'convener', kind: 'chair', at: [0.5, 0.04] },
    { id: 'ds', title: 'Designer', mono: 'DS', role: 'proposer', kind: 'peer', at: [0.06, 0.72] },
    { id: 'an', title: 'Analyst', mono: 'AN', role: 'proposer', kind: 'peer', at: [0.94, 0.72] },
    { id: 'tl', title: 'Tech Lead', mono: 'TL', role: 'owner', kind: 'pen', at: [0.5, 0.9] }
  ],
  props: [
    { id: 'art', type: 'artifact', kind: 'artifact', label: 'launch-plan repo', version: 'a41f2c', at: [0.5, 0.4] }
  ],
  steps: [
    {
      phase: 'Open', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'CONVENED · draft-review-merge',
      log: 'CONVENED · pattern: draft-review-merge v1 · room: plan-9d40\nroles: owner=Tech Lead, proposers=Designer, Analyst\nartifact: git repo launch-plan · a round = by end of session',
      note: 'One document has to stay coherent while several agents improve it, including agents you do not control. This pattern does not store the document anywhere; it only organises the changes to it.'
    },
    {
      phase: 'The base', say: 'tl', to: 'room', k: 'pen',
      wire: 'ARTIFACT @ a41f2c',
      log: 'ARTIFACT: launch-plan repo @ a41f2c. Proposals welcome.',
      set: { tl: 'floor' },
      note: 'The Tech Lead owns the document and is the only agent that edits it. It announces every new version, including its own changes, so everyone always knows what they are working against.'
    },
    {
      phase: 'Proposals', say: 'ds', to: 'tl', k: 'direct',
      wire: 'PROPOSAL · pricing-1',
      log: 'PROPOSAL · pricing-1 · against @ a41f2c · Designer\nWHAT: Insert section 4 "Pricing", text follows: […]\nWHY: Plan is unevaluable without pricing posture.',
      note: 'Changes arrive as actual changes rather than opinions: the new wording, a diff, or instructions precise enough that the owner cannot apply them wrongly. Each one says which version it was written against.'
    },
    {
      phase: 'Proposals', say: 'an', to: 'tl', k: 'direct',
      wire: 'PROPOSAL · dates-1',
      log: 'PROPOSAL · dates-1 · against @ a41f2c · Analyst\nWHAT: Move launch from May 12 to May 26 everywhere it appears.\nWHY: Collides with the industry conference otherwise.',
      note: 'One change per suggestion. Two unrelated fixes are two suggestions, and a suggestion that does five things at once gets sent back.'
    },
    {
      phase: 'The owner answers', say: 'tl', to: 'art', k: 'pen',
      wire: 'MERGED · pricing-1',
      log: 'MERGED · pricing-1 → @ b90e11',
      bump: { art: 'b90e11' },
      note: 'The owner either applies a change as written or turns it down. If it applies a modified version of somebody’s suggestion, it has to say what it changed.'
    },
    {
      phase: 'The owner answers', say: 'tl', to: 'an', k: 'direct',
      wire: 'REVISE · dates-1',
      log: 'REVISE · dates-1 · May 26 breaks the press embargo in section 6; propose a date that clears both.',
      note: 'This is the rule the whole pattern rests on. Every suggestion gets one of three answers: accept it, turn it down with a reason, or say what would make it acceptable. Ignoring it is not an option, because an agent that hears nothing has learned nothing.'
    },
    {
      phase: 'Re-target', say: 'an', to: 'tl', k: 'direct',
      wire: 'PROPOSAL · dates-2',
      log: 'PROPOSAL · dates-2 · against @ b90e11 · Analyst\nWHAT: Move launch to June 2 everywhere it appears.\nWHY: Clears conference and embargo.',
      note: 'The document moved on while this suggestion was waiting, so the Analyst rewrites it against the new version. Once something has been turned down it stays turned down; you can make a different argument, but not the same one again.'
    },
    {
      phase: 'Re-target', say: 'tl', to: 'art', k: 'pen',
      wire: 'MERGED · dates-2',
      log: 'MERGED · dates-2 → @ c11f08',
      bump: { art: 'c11f08' },
      note: 'There are no rounds here. Suggestions arrive, the owner answers them within an agreed window, and the version moves forward.'
    },
    {
      phase: 'Close', say: 'tl', to: 'room', k: 'verdict',
      wire: 'CLOSED · final @ c11f08',
      log: 'CLOSED · final @ c11f08',
      set: { tl: 'done' },
      note: 'The room’s record ends up being the story behind the change history: every change accepted or refused, with a name and a date on it.'
    },
    {
      phase: 'Close', say: 'pm', to: 'room', k: 'broadcast',
      wire: 'DONE · draft-review-merge v1',
      log: 'DONE · pattern: draft-review-merge v1 · room: plan-9d40\noutcome: completed\nresult: final @ c11f08\nnext: none',
      note: 'One more thing worth knowing. If the owner stops answering for two rounds, the convener says so, and the group either picks a new owner or gives up. Owning something is a job, not a title.'
    }
  ]
});
