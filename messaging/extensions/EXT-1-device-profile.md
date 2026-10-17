# EXT-1: Device Profile

| | |
|---|---|
| **URI** | `mesh://extensions/device-profile/v1` |
| **Status** | Draft |
| **Version** | 0.1.0 |
| **Requires** | AgentMesh core ≥ 0.2 |

Standardized keys by which a **node** self-describes the device it runs on.
Descriptive, self-declared, no PII. Completes the operational picture — *"a Mac
laptop, sdk-typescript 0.2.0"* — for fleet composition, targeted debugging, and
upgrade adoption.

## 1. Fields

All fields are OPTIONAL. If emitted, they MUST use these keys and values.

| Key | Type | Values | Notes |
|-----|------|--------|-------|
| `platform` | string | `darwin` \| `win32` \| `linux` \| `android` \| `ios` \| `browser` | OS family, Node.js `process.platform` convention; `browser` for in-browser nodes (WeBrowse) |
| `os_version` | string | free-form | e.g. `"14.5"`, `"11 Pro 26200"`. Advisory. |
| `client` | string | `{sdk-name}/{semver}` | e.g. `sdk-typescript/0.2.0`, `sdk-rust/0.1.3` |
| `device_class` | string | `laptop` \| `desktop` \| `server` \| `mobile` \| `browser` \| `embedded` | Coarse form factor; drives expectations the same way `availability_class` does |

## 2. Carriage

Fields are **node-declared profile attributes** (SPEC §9.7), carried exactly
like `availability_class`: in the node's declared profile at register time
(`manifest.node.profile`), and stored in the registry's node profile store.
Receivers MUST ignore unknown profile keys.

Like all declared attributes they are advisory and self-reported — a node can
lie about being a laptop. Nothing security-relevant may depend on them
(trust decisions use the operator-attested `trust_tier`/`role` only).

```json
"node": {
  "id": "UBPLAH…GASC",
  "attestation": { "…": "…" },
  "profile": {
    "availability_class": "intermittent",
    "platform": "darwin",
    "os_version": "14.5",
    "client": "sdk-typescript/0.2.0",
    "device_class": "laptop"
  }
}
```

Agents MAY declare support via the manifest `extensions` array (SPEC §17.2)
with this extension's URI; because the fields are purely additive profile
keys, declaration is not required for the fields to be meaningful.

## 3. Consumers

- **Registry** — stores and joins into discovery like other declared attributes;
  MAY expose in node inventory reads (`mesh.registry.nodes.list`).
- **Usage store (EXT-2)** — denormalizes device fields onto node/account usage
  records.
- **Operator console** — fleet composition, per-platform error correlation.

## 4. SDK guidance

SDKs SHOULD populate `platform` and `client` automatically (both are knowable
without user input) and accept `device_class`/`os_version` from the embedding
application. SDKs MUST NOT collect anything beyond these fields under this
extension.
