# EXT-2: Usage & Engagement Store

| | |
|---|---|
| **URI** | `mesh://extensions/usage/v1` |
| **Status** | Draft |
| **Version** | 0.3.0 (adds `mesh.usage.peers`, the per-counterparty view over core §13.5 meter events) |
| **Requires** | AgentMesh core ≥ 0.2; EXT-1 recommended |

A platform service that turns ephemeral protocol state (pseudonymous keys, 60s
presence, bounded activity ring) into **durable, identity-resolved,
longitudinal usage data**. Acceptance test: *"Sam is running a node on his Mac
laptop in Philadelphia; last used yesterday; 40 messages."*

This is an **operator/product service**, not a protocol change: it consumes
streams the core already emits and exposes new read subjects.

## 1. Entities & grain

Usage is aggregated along three keys, each resolvable to a human when possible:

| Entity | Meaning | Identity resolution |
|--------|---------|---------------------|
| `account` | A person/org ("Sam") — the primary engagement unit | AccountStore (`displayName`, email) |
| `node` | A host (laptop, server, browser) | via owning account when mapped |
| `agent` | A registered capability | manifest `owner` → account |

Grain: a rolling **per-entity summary** plus **daily rollups** for trend.

## 2. Ingest (all inputs already flow)

| Source | Subject / place | Yields |
|--------|-----------------|--------|
| Activity tap | `mesh.agent.*.inbox\|outbox` | message counts, skills, status, latency |
| Heartbeats | `mesh.heartbeat.>` | node last-seen history |
| Registry events | `mesh.event.registry.*` | agent lifecycle |
| Credential issuance | API gateway (connect IP, honoring `X-Forwarded-For`) | IP for geo enrichment |
| Device profile | EXT-1 declared attributes | platform / client / device_class |

Ingest MUST be async/batched off the hot path; the tap never blocks delivery.

## 3. Identity resolution

Map pubkeys → account: agent/node key → app credential or manifest `owner` →
account → display name. Unmapped keys (guest/sandbox) MUST remain pseudonymous
and be labeled as such — never guessed.

## 4. Geo enrichment

Connect IP → **coarse** geo (city/region/country) resolved once at first-seen
and cached per IP. An offline database is RECOMMENDED over external lookup
APIs (no per-connect network calls; no third-party data leakage). Store no
raw IPs in usage records beyond the enrichment cache.

## 5. Aggregates

Per entity: `messages_in`, `messages_out`, `first_seen`, `last_active`,
`active_days`, `error_rate`, `distinct_skills`, `distinct_peers`, plus EXT-1
device fields and coarse geo. Daily buckets for trend.

## 6. Storage (reference binding)

- Raw events → JetStream stream `MESH_USAGE` (bounded retention, default 30–90d)
- Summaries/rollups → KV (`mesh_usage_summary`, `mesh_usage_daily`), keyed by entity

Analytics are **best-effort, not authoritative**: they may lag or sample under
load; registry/presence/task stores remain the sources of truth. Not a billing
ledger of record (though the natural feeder for one).

## 7. Read subjects and authorization

| Subject | Semantics |
|---------|-----------|
| `mesh.activity.list` | Recent exchanges: sender, recipient, skill, status, latency, truncated input preview. Filters: sender, recipient, key set, limit |
| `mesh.usage.list` | Per-agent message totals, every agent on the mesh in one answer |
| `mesh.usage.summary` | Mesh-wide aggregate: today's totals, a per-day series, today's top talkers |
| `mesh.usage.today` | Today's counters for the given agent ids |
| `mesh.usage.peers` | Both directions for ONE agent over a lookback window (default 30d): who it served and whose agents it consumed, from the per-counterparty daily rollup of core §13.5 meter events. Cardinality-capped: past 200 distinct counterparties per provider-day the tail reads as `~other` |

`mesh.usage.get.{entity}` — one entity's summary plus its daily timeline — is
**reserved and not served**. The daily rollups of §5 are stored per agent per
day, but no read subject exposes more than today's row.

### 7.1 Authorization

Reads MUST be authorized **per caller** from the verified envelope `from`, and
every answer MUST be signed with the service's own key. An unsigned reply from
a literal service name is indistinguishable from a third party's, and every
conforming consumer drops it.

Exactly three authorizations exist:

- **A party to the exchange** — the caller's key is the sender or the
  recipient of the entry.
- **The owner of a party** — the owner key that groups an account's agents
  (core §8.6), resolved by registry lookup. Lookups MUST be cached and capped
  per query; an id left unresolved is simply not disclosed.
- **A configured reader** — an operator-listed key entitled to the mesh-wide
  views. An **empty list means nobody holds that view**: the operator console
  stays blank until its key is listed, which is the right default for a
  service that hands out other agents' request content.

Per-entry views (`mesh.activity.list`, `mesh.usage.today`) MUST **filter** to
what the caller is entitled to rather than refuse. `mesh.usage.peers` is
per-entity but MUST be **refused** (`UNAUTHORIZED`) to a caller that is not
the agent, its owner, or a configured reader: it names the agents on the
other side of every exchange, and a subset of somebody else's counterparty
graph is still somebody else's counterparty graph. Aggregate views
(`mesh.usage.list`, `mesh.usage.summary`) MUST be refused to a non-reader with
`UNAUTHORIZED`, and the refusal SHOULD name the per-entity alternative.
Filtering an aggregate is not an option: a total is either the mesh's or it is
a different question.

An implementation MUST NOT delegate any of this to an API gateway. Every
subject is reachable directly by any credential on the mesh, so a gateway
check does nothing for a caller that publishes to the subject itself.

## 8. Privacy & governance (normative, not optional)

This extension joins real identity + location + behavior over time — PII.

- Geo MUST be coarse (city at finest); raw IPs MUST NOT appear in usage records.
- Person-level history MUST have an explicit retention limit and a purge path
  (account deletion purges usage records).
- Pseudonymous entities stay pseudonymous.
- A consent/opt-out decision MUST be made before person-level history is
  persisted in production. (Open: default-in with disclosure vs. opt-in.)

## 9. Open decisions

1. Reliability of key→account linkage under the app-credential model.
2. Retention window for person-level usage.
3. Scope: operator observability only, or also product analytics (WeBrowse/Feedback).
4. Geo source: bundled offline DB vs. external service.

## 10. Build order

1. Persist + aggregate the activity tap (highest value, lowest risk)
2. Identity resolution
3. Geo enrichment
4. Engagement screen in the operator console

Steps 2–3 are gated on the §8 consent decision.
