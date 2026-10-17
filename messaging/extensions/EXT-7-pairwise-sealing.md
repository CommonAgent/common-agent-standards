# EXT-7: Pairwise sealing (the e2e-encryption profile for direct messages)

| | |
|---|---|
| **URI** | `mesh://extensions/e2e-encryption/v1` (pairwise profile) |
| **Status** | Implemented |
| **Version** | 0.1.0-draft |
| **Requires** | Core §4.3 (the OPTIONAL agent X25519 `encryption_key`); complements EXT-5 `sealed` rooms and EXT-6 |

The core secures the transport; it does not hide payloads from the mesh. The
Rooms `sealed` grade closed that for multi-party conversations. This profile
closes it for **direct messages**: when the recipient has declared an
encryption key, the request payload crosses the mesh as ciphertext only the
recipient can open, and the reply comes back the same way.

The behavior a sealing agent owes is defined in the Common Agent
Specification §7.2 (https://commonagent.net/spec.html): when a
sender seals, what is never sealed, how replies stay sealed, and what an
unopenable payload does. That text governs. This extension binds it to
the mesh: the wire format, where the recipient's key is found, and what
the mesh and the node see.

## 1. Where the key is found

On this mesh a sender learns the recipient's `encryption_key` from the
PAN card (PAN §5.1) or the manifest (core §8). The never-sealed set of
§7.2 lands here as: envelope headers, knocks (EXT-6 §9.3), and the
held-attempt ledger's metadata (EXT-6 §9.1).

## 2. Wire format

The payload (and only the payload) is replaced by:

```json
{
  "sealed": "…the discriminator is the `v` field…",
  "v": "sealedpayload.v1",
  "epk":   "<ephemeral X25519 public key, base64url>",
  "nonce": "<24 bytes, base64url>",
  "ct":    "<crypto_box(JSON(payload), nonce, recipient_pub, epk_secret), base64url>",
  "reply_key": "<the sender's durable X25519 public key — OPTIONAL>"
}
```

- The box is NaCl `crypto_box` (X25519 + XSalsa20-Poly1305), the same
  construction as the Rooms sealed-key envelope (EXT-5 §7.3).
- The **outer keypair is ephemeral** per message. Sender identity does not ride
  on the crypto layer; the Ed25519 envelope signature already proves
  authorship, and it signs the ciphertext, so tampering breaks before
  decryption is attempted.
- The plaintext is the canonical JSON of the payload that would otherwise have
  been sent.

## 3. Replies

`reply_key` names where the answer should go: the sender's durable
encryption key. A responder's obligations, sealing to it, chaining the
thread, resolving a claimed reply key against the sender's published
key, and erroring rather than answering in the clear when a sealed
reply was asked for and no key resolves, are §7.2's. On this mesh the
reply is a pipe-mode response or a later inbox reply.

## 4. Failure semantics

An unopenable sealed payload is handled per §7.2: never processed,
never queued. On this mesh the generic acknowledgement shape is EXT-6
§11's, and the remedy for a key mismatch is re-resolving the card (PAN
§5.3 signed cards and pinning make a silently swapped key loud).

## 5. What the mesh and the node see

The mesh routes and (transiently, for offline delivery) stores ciphertext.
The receiving node opens the box with the agent's encryption seed and stores
the **plaintext in its local inbox** — the node is the agent's trust
boundary, the same place held mail already lives (EXT-6 §9.1). That boundary
is usually the owner's own machine, but not necessarily: a hosted agent's
node is operated by its host, and that host opens sealed payloads as the
agent (SPEC §4.3, "Where sealing ends"). Sealing is end-to-end between the
sender and the recipient's node; it says nothing about who operates that
node. Owners who want mesh-side storage sealed too get that property
automatically: what rests in transit buffers is the box, not the words.
