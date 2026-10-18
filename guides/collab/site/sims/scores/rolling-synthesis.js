/* Rolling synthesis - many submit raw material; one integrator merges it.
   Source: .../patterns/rolling-synthesis.md                                  */

AgentSim.register('rolling-synthesis', {
  title: 'Rolling synthesis',
  tagline: 'Several agents send in raw notes and one agent turns all of it into a single piece of writing.',
  shape: 'centralized judgment',
  hue: 'signal',
  room: 'pilot-88',  blurb: 'Many agents submit raw material; one integrator\'s whole craft is the merge into a coherent artifact.',
  grade: 'open',
  problem: 'A pilot has just finished. Three agents each saw part of what happened, in logs, support tickets and screenshots, and none of them saw all of it. You want one written summary that reads as though one person wrote it.',
  contract: {
    inputs: [
      'a subject, and a description of what sort of material you want',
      'agents willing to send rough notes rather than tidy summaries'
    ],
    membership: 'Open. More agents sending material is better; only the writer is fixed.',
    outputs: [
      'one written summary in a single voice',
      'a note of which part came from which agent',
      'anything nobody was able to answer'
    ]
  },
  outcome: {
    result: 'the second version of the summary, built from what three agents sent in',
    record: 'each claim attributed to the agent it came from, and one misquote that was corrected',
    open: 'nothing. Everything that was missing got answered.',
    note: 'The other agents send raw notes and one agent does all the writing. That split is what stops the result reading like it was written by a committee.'
  },
  cast: [
    { id: 'ed', title: 'Editor', mono: 'ED', role: 'integrator', kind: 'pen', at: [0.5, 0.04] },
    { id: 'an', title: 'Analyst', mono: 'AN', role: 'source', kind: 'peer', at: [0.05, 0.74] },
    { id: 'rs', title: 'Researcher', mono: 'RS', role: 'source', kind: 'peer', at: [0.5, 0.9] },
    { id: 'ds', title: 'Designer', mono: 'DS', role: 'source', kind: 'peer', at: [0.95, 0.74] }
  ],
  props: [
    { id: 'art', type: 'artifact', kind: 'the synthesis', label: 'pilot findings', version: 'none yet', at: [0.5, 0.4], w: 148 }
  ],
  steps: [
    {
      phase: 'The call', say: 'ed', to: 'room', k: 'broadcast',
      wire: 'CALL · what did we learn?',
      log: 'CALL · what did we learn from the pilot?\nNEED: user quotes, failure incidents, feature requests, anything with a timestamp\nFORM: raw fragments fine, links fine, RAW IS FINE\nBY: synthesis cut in 2 hours',
      note: 'Use this when the information is spread across several agents and none of them has the whole picture, but the write-up still needs to sound like one person wrote it.'
    },
    {
      phase: 'Material flows in', say: 'an', to: 'ed', k: 'direct',
      wire: 'MATERIAL · Analyst',
      log: 'MATERIAL · Analyst: 14 session logs, 3 rage-quits around the pairing step, quotes attached […]',
      note: 'The other agents send material; they do not write the summary. Fragments, half-formed thoughts, links and things that contradict each other are all fine. Tidying up is the writer’s job.'
    },
    {
      phase: 'Material flows in', say: 'rs', to: 'ed', k: 'direct',
      wire: 'MATERIAL · Researcher',
      log: 'MATERIAL · Researcher: billing confusion twice; one "this is magic" moment at first reply […]'
    },
    {
      phase: 'Material flows in', say: 'ds', to: 'ed', k: 'direct',
      wire: 'MATERIAL · Designer',
      log: 'MATERIAL · Designer: pairing screen has no error state; screenshots attached […]',
      note: 'The thing to watch for is agents sending in polished summaries instead of raw notes. When that happens the writer stops writing and starts stapling, so remind them that rough is fine.'
    },
    {
      phase: 'The first cut', say: 'ed', to: 'art', k: 'pen',
      wire: 'SYNTHESIS 1',
      log: 'SYNTHESIS 1: […] one narrative across all three sources, attributing the rage-quit data to Analyst.',
      bump: { art: 'synthesis 1' },
      note: 'The writer can cut, reorder and reframe whatever it likes, but it cannot quietly contradict what it was sent. Where two agents disagree, the summary either says so or picks one and explains why.'
    },
    {
      phase: 'Gaps are the next call', say: 'ed', to: 'room', k: 'broadcast',
      wire: 'GAPS:',
      log: 'GAPS: no data on time-to-first-success; the rage-quit cause is unconfirmed, UI or docs?',
      note: 'After each version, the writer says what is still missing. A specific gap gets much better material back than a vague request for more.'
    },
    {
      phase: 'Aimed material', say: 'an', to: 'ed', k: 'direct',
      wire: 'MATERIAL · Analyst',
      log: 'MATERIAL · Analyst: rage-quits correlate with the pairing code expiring; median time-to-first-success 11m.',
      note: 'The second round of material answers those gaps rather than repeating the first round. If the same gaps keep coming back, either the agents have nothing more or the wrong agents were asked, and the writer should say which.'
    },
    {
      phase: 'Fidelity, not taste', say: 'rs', to: 'ed', k: 'direct',
      wire: 'CORRECTION · synthesis 1',
      log: 'CORRECTION · Researcher · synthesis 1 misstates my material: it says "billing broke" vs what I said, "users misread the billing copy".',
      note: 'An agent can object if its material was misrepresented, but not if it merely disagrees with the editing. The writer has to fix or explain a genuine misquote before finishing.'
    },
    {
      phase: 'The second cut', say: 'ed', to: 'art', k: 'pen',
      wire: 'SYNTHESIS 2',
      log: 'SYNTHESIS 2: […] billing wording corrected; pairing-code expiry named as the rage-quit cause. GAPS: none blocking.',
      bump: { art: 'synthesis 2' },
      note: 'The other thing to watch for is the writer circulating drafts for approval. That turns this into a review cycle, and the writer having the final say over the wording is the entire reason this produces one voice.'
    },
    {
      phase: 'Close', say: 'ed', to: 'room', k: 'verdict',
      wire: 'FINAL · synthesis 2',
      log: 'FINAL · synthesis 2\n\nDONE · pattern: rolling-synthesis v1 · room: pilot-88\noutcome: completed · result: synthesis 2, gaps declared · next: none',
      set: { an: 'done', rs: 'done', ds: 'done' },
      note: 'The summary is finished when the gaps are closed, or when the ones that are left are written into it as things nobody could answer.'
    }
  ]
});
