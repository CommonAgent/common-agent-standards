# EXT-12: Systems Health

| | |
|---|---|
| **URI** | `mesh://extensions/systems-health/v1` |
| **Status** | Draft |
| **Version** | 0.1.0-draft |
| **Requires** | AgentMesh core >= 0.3; names systems by the same role vocabulary as the Agent Descriptor's `systems` member and Agent SoW grants (SoW §5.3.1) |

How an agent's own tooling failures become knowledge, at the speed each
audience needs: circuit state at the node for the running instance, a
private health record for the owner and siblings, and typed faults for the
counterparty. Approved 2026-09-01; the three open questions in the review
draft are settled here: the health record gets its own store
(`mesh_systems_health`), `DEPENDENCY_FAULT` is extension-defined and rides
the envelope's open error field rather than growing the core code list, and
the grants ledger build follows this machinery, as its first subscriber.

The behavior an agent and its runtime owe is defined in the Common Agent
Specification §7.4 (https://commonagent.net/spec.html): why four
audiences learn at four speeds, the fault vocabulary and whose move each
fault names, the report door's semantics and its sixty-per-hour limit,
the circuit's states and transitions, the private record's readers and
its no-broadcast default, and what a counterparty is told. That text
governs. This extension binds it to the mesh: the store name, the verb
spellings, the wire shapes, and the grants-ledger sequencing.

## 1. Motivation

The four-audiences rationale is §7.4's opening. This extension exists
because none of the mesh's existing mechanisms serve those speeds, and it
supplies the three mesh pieces: a fault wire shape, circuit state at the
node, and a platform-kept health record.

## 2. The fault vocabulary

The six faults, their meanings, and whose move each names are defined in
§7.4. Their wire spellings: `grant_expired`, `grant_revoked`,
`grant_invalid`, `grant_insufficient`, `rate_limited`, `unreachable`. The
set is open, and an unrecognized value is carried verbatim rather than
dropped.

A fault report on this mesh is `{ "system": <role>, "fault": <value>,
"retry_after": <seconds, OPTIONAL> }`. The system is named by its ROLE,
the same vocabulary as the descriptor's systems member and Agent SoW
grants (SoW §5.3.1).

## 3. The report door

The door's semantics, a verb pair, the sixty-reports-per-agent-per-hour
limit, and the undeclared-system rule, are §7.4's. Its mesh faces:

- a CLI verb, `agentmesh system-fault <role> <fault> [--retry-after N]`,
  and its clearing twin `agentmesh system-ok <role>`, for harnesses that
  are foreign CLIs driven by instructions;
- the same pair on the node's local session API, for attendants;
- an SDK hook, for agents built on the SDK, which SHOULD also report
  automatically where its own MCP client sees an auth or rate-limit
  failure.

Nothing about a report crosses the mesh unless sections 5 and 6 say so.

## 4. Circuit state at the node

The circuit's states (`ok`, `degraded`, `failing`), its transitions, the
half-open retry, and the fast refusal of grant-needing work while a
grant-class fault stands are §7.4's. On this mesh the state is visible in
`agentmesh status`, and it never enters the manifest or the descriptor.

## 5. The health record

The record's semantics, shapes only, two readers, no public broadcast by
default, are §7.4's. On this mesh it lives in its own platform store,
`mesh_systems_health`, following the screening status store's pattern.
The owner's read is the grants ledger, which shows each grant's health
beside its revoke control; sibling instances read the record before
attempting. An operator who wants a public status surface MAY declare a
`systems` state feed carrying the same shapes, and a directory MAY read
it like any feed.

## 6. The counterparty

The directed-never-broadcast rules are §7.4's. On this mesh the typed
fault rides a task's error as `DEPENDENCY_FAULT`, an extension-defined
code in the envelope's open error field, with the section 2 report as its
detail; the progress answer that MAY carry active faults is the worker
interface's progress exchange.

## 7. Non-goals

As §7.4 closes: traces are neither replaced nor fed, no reputation is
written here, and nothing in this extension ever carries a credential, a
vendor name, an endpoint, or an upstream error body.

## Open questions for review

1. Whether the health record rides a new platform store or the screening
   status store's machinery generalized.
2. Whether `DEPENDENCY_FAULT` becomes a protocol error code or stays an
   extension-defined code carried in the envelope's open error field.
3. Whether the grants ledger build (which this record exists to feed)
   starts before or after this draft settles.
