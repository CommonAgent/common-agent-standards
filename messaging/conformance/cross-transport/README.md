# One quote, three transports

The Common Agent Specification says an agent keeps its key, its Descriptor,
its signed messages and its task states whatever carries them, and that only
delivery changes. This test shows it. The same quote request runs over a
message broker (Agent Messaging), over email (Agent Emailing) and over HTTPS
(the A2A Bridge), and the same checks pass on all three.

## The story

The use case is the Agent Emailing Server's interop test, unchanged
([tools/interop.mjs](https://github.com/Agent-Emailing/agent-emailing-server/blob/main/tools/interop.mjs)).
A buyer's purchasing agent at example.org asks a supplier's sales agent at
example.com for a quote:

1. a request, with a parts list as CSV and a budget of up to 500.00 USD;
2. the supplier pauses the task: two items have a 3-week lead time, is a
   split delivery fine?
3. the buyer answers on the same task: yes;
4. the supplier finishes the task with the quote as a PDF, 412.50 USD, and
   the delivery dates.

Then a forged quote: the fourth message with its price raised to 4125.00 USD
after it was signed. The buyer must refuse it.

[story.mjs](story.mjs) holds the parts list, the PDF, the words and the
budget, so every transport sends the same bytes.

## The checks

[check.mjs](check.mjs) reads one transcript per transport and runs the same
seven checks on each:

1. the four messages each verify on their own signature;
2. the request goes from the buyer to the supplier, on the quote offering,
   with the parts list by digest and the 500.00 USD budget;
3. the supplier's second message pauses a task in `input_required` and asks
   about split delivery;
4. the buyer's answer goes on the same task;
5. the fourth message completes the task, says 412.50 USD and carries the
   PDF by digest;
6. the buyer's view of the task is legal under Agent Messaging §7.3.1 (a view
   may miss `working`) and ends `completed`;
7. the forged quote does not verify, and the buyer refused it.

It needs node and nothing else. Signatures are checked with
[../lib/envelope-vectors.mjs](../lib/envelope-vectors.mjs), the buyer's view
with [../lib/check-unseen-states.mjs](../lib/check-unseen-states.mjs).

## The transports

Each transport runs where it lives and writes its transcript:

- **Email:** [lane-email.mjs](lane-email.mjs) runs two Agent Emailing Servers
  on its loopback network, where mail is rendered to raw MIME and parsed
  again as a real carrier carries it.
  `node lane-email.mjs --aes <a built agent-emailing-server checkout>`.
- **Broker and HTTPS:** [lane-broker-a2a.ts](lane-broker-a2a.ts) runs on a
  mesh host from an Agent Messaging Server release (0.4.6 or later), against
  one throwaway supplier agent. Over the broker the buyer is a key that signs
  its own envelopes and publishes them through a node. Over HTTPS it carries
  its own signed envelopes through the A2A Bridge (EXT-14).

## Results

[results/](results/) holds the transcripts of each run. The run of
29 October 2026 used AgentMesh's dev mesh and its A2A gateway (the Agent
Messaging Server 0.4.6) for the broker and HTTPS, and the Agent Emailing
Server at commit 7123bbf on its loopback network for email. Every check
passed on all three:

```
node check.mjs results/2026-10-29-broker.json results/2026-10-29-email.json results/2026-10-29-a2a.json
```

One difference showed, and the check accepts both forms because both bind the
answer to the task. Over email the supplier's fourth message carries the
task's id. Over the broker and HTTPS, the Agent Messaging Server's SDK answers
the buyer's follow-up request with a reply bound by `in_reply_to` to the
request that named the task, and records the outcome on the task's own update
subject (Agent Messaging §7.3).
