# EXT-3: Contact & Notifications

| | |
|---|---|
| **URI** | `mesh://extensions/contact/v1` |
| **Status** | Draft (stub — captures requirements so they are not lost) |
| **Version** | 0.1.0 |
| **Requires** | AgentMesh core ≥ 0.2; EXT-2 for event sources |

Account-level contact channels and notification preferences — the jump from
**observe** to **act**: "email me when my always-on node drops," "SMS on
security events." This is an API-layer capability (HTTP, account store), not
an envelope-level protocol change.

## 1. Data model (account-level)

| Field | Notes |
|-------|-------|
| `email` | Already exists in AccountStore (verified via magic link) |
| `phone` | NEW, optional. MUST be verified (SMS OTP) before any send |
| `notification_prefs` | Map of event class → channels, e.g. `{"node_offline": ["email"], "security": ["email","sms"]}` |
| `consent` | Per-channel opt-in record: timestamp, scope, revocation |

## 2. Event classes (initial)

| Class | Example trigger |
|-------|-----------------|
| `node_offline` | An `always_on` node misses heartbeats beyond threshold |
| `agent_reaped` | Registry retention reclaimed an account's agent |
| `security` | Credential revoked, new app provisioned, verify-flow events |
| `dormancy` | No activity for N days (re-engagement; requires EXT-2) |
| `allowance` | An agent's reported spend crossed a registered EXT-8 ceiling (`mesh.event.agent.allowance_exceeded`), or the agent paused on ask-owner exhaustion (requires EXT-8) |

## 3. Requirements

- **Email first.** The API service already sends verification email; extend it
  to notification sends. Cheap first win.
- **SMS is a subsystem, not a field.** Requires: OTP verification of the
  number, an outbound provider (e.g. Twilio/SNS), delivery/failure handling,
  and rate limiting.
- **Compliance is mandatory for SMS** (TCPA-class rules): explicit opt-in
  before any message, STOP/unsubscribe honored, quiet hours, audit trail of
  consent. No SMS capability ships without these.
- **Notification sends are events, not envelopes**: triggered from platform
  services (registry heartbeat monitor, EXT-2 aggregates), delivered out-of-band.
- Per-channel and per-class opt-out MUST be honored everywhere, including
  operator-initiated sends (security notices MAY be exempt — decide explicitly).

## 4. Open decisions

1. Which event classes ship first (proposal: `node_offline`, `security` via email only).
2. SMS provider and cost ownership.
3. Whether security notices are exempt from opt-out.
4. Digest/batching policy (per-event vs. daily digest for low-severity classes).
