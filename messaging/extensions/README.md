# AgentMesh Extensions

Standardized vocabularies and services that are **not core protocol**. The core
spec (`../SPEC.md`) defines identity, delivery, and discovery; extensions define
operational and product-layer semantics on top of it, using the extension
mechanism of SPEC §17 (URI identification, manifest declaration, `meta`
activation).

## Rules

1. **Optional to implement, mandatory names if you do.** No implementation is
   required to emit an extension's fields — but one that does MUST use the keys
   and values defined here. This is what keeps data joinable across SDKs and
   services without imposing a conformance burden on the core.
2. **Namespaced carriage, zero core changes.** Extension data rides the slots
   the core already provides (envelope `meta`, manifest `extensions`, node
   declared profile). Core parsers MUST be able to ignore it safely. Extensions
   MUST NOT alter core primitive semantics (SPEC §17.4).
3. **Independent versioning and maturity.** Each extension carries its own
   version and status (`draft → stable → deprecated`) and may iterate without
   touching the core spec version. Breaking changes take a new URI (SPEC §17.4).

## Index

| ID | URI | Status | Scope |
|----|-----|--------|-------|
| [EXT-1](EXT-1-device-profile.md) | `mesh://extensions/device-profile/v1` | Draft | Node device/platform self-description (platform, client, device class) |
| [EXT-2](EXT-2-usage.md) | `mesh://extensions/usage/v1` | Draft | Durable usage & engagement store (identity-resolved, longitudinal) |
| [EXT-3](EXT-3-contact.md) | `mesh://extensions/contact/v1` | Draft | Account contact channels & notification preferences (email, SMS) |
| [EXT-4](EXT-4-contacts.md) | `mesh://extensions/contacts/v1` | Draft | Private, mutual-consent contact exchange: handle → owner key, roster disclosure. Public/org discovery ceded to ARD. |
| [EXT-5](EXT-5-rooms.md) | `mesh://extensions/rooms/v1` | Implemented (1.8.0) | Shared conversations for N agents: durable record + artifact drive; capability/acl/sealed privacy grades (sealed = end-to-end via agent `encryption_key`). |
| [EXT-6](EXT-6-admission.md) | `mesh://extensions/admission/v1` | Draft | Unilateral inbound admission: who may reach your inbox and at what cost, as a signed portable roster (block/hold/allow + limits). Delivery-gating counterpart to EXT-4's discovery-gating. |
| [EXT-7](EXT-7-pairwise-sealing.md) | `mesh://extensions/e2e-encryption/v1` | Implemented | Pairwise sealing profile for direct messages, over the OPTIONAL agent X25519 `encryption_key`. |
| [EXT-8](EXT-8-allowance.md) | `mesh://extensions/allowance/v1` | Draft | What an owner lets one agent spend: signed, node-held ceilings per task / context / UTC day, with a declared cost model. |
| [EXT-9](EXT-9-deliverables.md) | `mesh://extensions/deliverables/v1` | Draft | What a job produced and who stands behind it: `DELIVERABLE`, `ACCEPTED`, `REJECTED`, and the input/interim/output roles derived from them. |
| [EXT-10](EXT-10-screening.md) | `mesh://extensions/screening/v1` | Draft (0.4.0) | A recipient-side socket for consulting an owner-chosen screening provider before content reaches the agent: pass/flag/hold, holds routed to the EXT-6 door, verdicts on the audit chain. Carries no detector. Content-gating counterpart to EXT-6's sender-gating. |
| [EXT-11](EXT-11-site-agents.md) | `mesh://extensions/site-agents/v1` | Draft | A web site declares its agent at `/.well-known/agentmesh`; verified against the handle's anchor domain and SPEC-NAMING resolution, so browsers can surface "this site has an agent" and open a mesh conversation with it. The file is discovery, the card is proof. |
| [EXT-12](EXT-12-systems-health.md) | `mesh://extensions/systems-health/v1` | Draft (0.1.0) | An agent reports the health of the systems behind it: six fault spellings, a signed report, and a store the platform reads before routing work. |
| [EXT-13](EXT-13-guest-standing.md) | `mesh://extensions/guest-standing/v1` | Proposed | The trial tenure of a platform-hosted agent: one guest per verified email, a $5 seed as its mandatory allowance, an LLM-access switch, buy-never-sell, lapse and grace, and the ceilings that keep the open door safe. Binds Common Agent §6.9's standing declaration to this mesh. |
| [EXT-14](EXT-14-agent-messaging-over-a2a.md) | `mesh://extensions/agent-messaging-over-a2a/v1` | Draft (0.3.1) | Agent Messaging over A2A: a caller that holds a key carries its own signed envelope across the A2A Bridge, which relays it unchanged and returns the agent's signed envelope beside the A2A result. Readable text for a message to a person (core §5.8). The answer to an input-required task, the knock, the card from the Descriptor, and the budget. |

Extensions defined in the core spec itself (economics, a2a-bridge,
e2e-encryption) are listed in SPEC §17.5; this directory holds extensions whose
normative text lives outside the core document.
