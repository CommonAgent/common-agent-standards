# EXT-8: Owner Allowance

| | |
|---|---|
| **URI** | `mesh://extensions/allowance/v1` |
| **Status** | Draft |
| **Version** | 0.1.0 |
| **Requires** | AgentMesh core ≥ 0.2 (§7.7 budget, §19.3 money axis, §5.3 canonicalization); document conventions follow EXT-6 (owner-signed, domain-tagged, node-held) |

What an owner will let their own agent spend. This extension defines the
**allowance**: a signed, node-held spending policy an owner sets on their own
agent — the owner-side complement to the core budget (§7.7), enforced by the
agent's own node through the budget's refusal-with-estimate mechanism.

The behavior an allowance-enforcing agent owes is defined in the Common
Agent Specification §7.5 (https://commonagent.net/spec.html): what
an allowance is and how it differs from a budget, the document's
semantics, fail-closed verification, enforcement and metering
arithmetic, the exhaustion behaviors, and visibility without
enforcement. That text governs. This extension binds it to the mesh:
the document's JSON layout and signed bytes, the metering formula and
refusal spelling the fixture pins, the store-and-sync posture, and the
event subject.

## 1. The document (the artifact)

An allowance is a single JSON document per agent, **signed by the owner key**
and held at the agent's node — the admission roster's sibling (EXT-6 §3): same
authority model (owner policy, core §4.9), same signing convention, same
portability. The bytes `sig` covers are the ASCII prefix
`agentmesh-allowance-v1` followed by exactly one newline (0x0A), then the
canonical JSON (SPEC §5.3) of the document excluding `sig`. The prefix exists
only inside the signed bytes — it never appears in the document itself — and
`sig` is base64url, the SDK-object encoding. `conformance/allowance.json`
pins the prefix with really-signed vectors.

```json
{
  "v": 1,
  "agent": "UAGENT…",
  "owner_key": "UOWNER…",
  "cost_model": { "per_1k_tokens_micro": 1500, "currency": "USD" },
  "ceilings": [
    { "scope": "task", "amount_micro": 500000 },
    { "scope": "context", "context_id": "meetup-s1-e4", "amount_micro": 3000000 },
    { "scope": "day", "amount_micro": 10000000 }
  ],
  "on_exhausted": "refuse",
  "updated_at": "<RFC-3339 UTC>",
  "sig": "<owner-key signature over the tagged signed bytes: `agentmesh-allowance-v1` + LF + the canonical document, sig excluded>"
}
```

- `v` — the document format version, the integer `1`.
- `agent` — the agent key this allowance governs. One document per agent.
- `owner_key` — the signer. A node MUST verify `sig` against `owner_key`
  before enforcing, and MUST NOT treat a document that fails verification as
  absent: a node configured with an allowance that does not verify treats
  every ceiling as exhausted (the `on_exhausted` behaviour applies) until a
  valid document replaces it. This is Common Agent §7.5's fail-closed rule,
  spelled for the node.
- `cost_model` — the owner's **declared** conversion from the agent's tokens
  to money (Common Agent §7.5 says why a token rate is legitimate here and
  nowhere on the wire). `per_1k_tokens_micro` is integer micro-units of
  `currency` per 1,000 tokens.
- `ceilings` — one or more ceilings, each `{ scope, amount_micro }` with
  `scope` one of `task` | `context` | `day` (a closed enum). An optional
  `task_id` or `context_id` narrows a ceiling to that one task or context
  ("$3.00 at this event"); absent, a `task` ceiling applies to each Task and
  a `context` ceiling to each context individually. `day` means the UTC
  calendar day of the metering instant.
- `on_exhausted` — `"refuse"` or `"ask_owner"` (§2).
- `updated_at` — RFC-3339. The document is replaced whole; the latest
  `updated_at` under a valid signature is the policy.

Money follows §19.3's rules by reference: `amount_micro` and
`per_1k_tokens_micro` are non-negative integer micro-units (1,000,000
micro-units = one currency unit), `currency` is an ISO 4217 code, and no
floating point ever touches money.

## 2. Node obligations (how agents become capable)

The enforcement rules (metering, refusal at admission, every applicable
ceiling at once with the smallest remaining amount binding, and the two
exhaustion behaviours) are Common Agent §7.5's. Their mesh spellings,
each pinned in the fixture:

- **The metering formula**:
  `cost_micro = floor(tokens × per_1k_tokens_micro / 1000)`, integer
  arithmetic, floor pinned in the fixture so two nodes never disagree by a
  micro-unit. Metered spend is accounted to the Task, to the Task's
  `context_id`, and to the UTC day.
- **The refusal** is §7.7's refusal-with-estimate: `BUDGET_INSUFFICIENT`,
  with `details.estimate` carrying the node's price for the work. On the
  wire an allowance-broke refusal is indistinguishable from a budget-broke
  one.
- **Ceiling precedence**: the binding ceiling is whichever applicable
  ceiling has the smallest remaining amount, pinned in the fixture.
- **The spend report** rides the `cost` field of the terminal `respond`
  (§19.3) — informative, not verified, exactly as the budget's spend report
  is.
- **`"ask_owner"`** surfaces the held question through the node's owner
  channel, the same surface EXT-6 review uses.

Deadlines are §7.7's concern, not this document's: an allowance has no time
axis, and a node never refuses on time on the allowance's behalf.

## 3. Platform visibility (facilitation, not enforcement)

Visibility without enforcement is Common Agent §7.5's rule: the platform
makes the honor system observable and never blocks. Its mesh plumbing:

- Services SHOULD serve **per-context spend rollups** computed from §19.2
  metering receipts, scoped to the requesting owner's agents.
- An owner MAY register the signed allowance with the platform (the same
  store-and-sync posture as the EXT-6 roster). A **registered** allowance
  whose agent's reported spend crosses a ceiling SHOULD be flagged on
  `mesh.event.agent.allowance_exceeded` — operator-visible, and eligible as
  the EXT-3 notification class `allowance`.

## 4. Conformance

`conformance/allowance.json` is the authority: the document shape (valid and
invalid cases), the really-signed vectors under the `agentmesh-allowance-v1`
tag, the floor-rounded metering arithmetic, smallest-remaining ceiling
precedence, the refusal shape, and both exhaustion behaviours. When a test
against it fails, fix the implementation; when the fixture itself is believed
wrong, change it only with a spec change alongside.

## 5. Out of scope

Settlement and payment, cross-agent allowances, and external mandate
mapping are out of scope, for the reasons Common Agent §7.5 states. The
one mesh-specific note: adjacent payment specifications express portable
spending authority as signed, revocable mandates (SPEC.md §1.3: AP2 is
the authority for that model on fiat rails), and an allowance document
MAY someday carry an optional reference to such a mandate in the
BRIDGE-A2A pattern. Reserved here so the field, if it comes, is an
addition; nothing verifies or enforces external mandates today.
