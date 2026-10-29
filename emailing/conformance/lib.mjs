// lib.mjs: the few pieces the fixture generator needs, written against node's
// crypto and nothing else.
//
// - NKey encoding of Ed25519 keys and seeds (the "U..." agent IDs and "SU..."
//   seeds that Agent Messaging's own conformance fixtures use).
// - Canonical JSON (RFC 8785) for the values the fixtures contain: strings,
//   integers, booleans, null, arrays and objects. JavaScript's JSON.stringify
//   already escapes strings the way RFC 8785 does, and its default sort is the
//   UTF-16 code unit order RFC 8785 requires.
// - Signing and verifying an Agent Messaging envelope (SPEC.md §5.3): Ed25519
//   over "agentmesh-envelope-v1\n" + the canonical envelope without `sig`,
//   encoded base64url.
import { createHash, createPrivateKey, createPublicKey, sign, verify } from "node:crypto";

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function b32encode(bytes) {
  let bits = 0, value = 0, out = "";
  for (const b of bytes) {
    value = (value << 8) | b; bits += 8;
    while (bits >= 5) { out += B32[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

function b32decode(s) {
  let bits = 0, value = 0; const out = [];
  for (const ch of s) {
    const i = B32.indexOf(ch);
    if (i < 0) throw new Error(`not base32: ${ch}`);
    value = (value << 5) | i; bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(out);
}

// CRC-16/XMODEM, which NKeys append little-endian.
function crc16(bytes) {
  let crc = 0;
  for (const b of bytes) {
    crc ^= b << 8;
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc;
}

const PREFIX_USER = 20 << 3; // "U"
const PREFIX_SEED = 18 << 3; // "S"

function withCrc(bytes) {
  const c = crc16(bytes);
  return Buffer.concat([bytes, Buffer.from([c & 0xff, c >> 8])]);
}

export function encodeSeed(raw32) {
  const head = Buffer.from([PREFIX_SEED | (PREFIX_USER >> 5), (PREFIX_USER & 31) << 3]);
  return b32encode(withCrc(Buffer.concat([head, raw32])));
}

export function decodeSeed(seed) {
  const b = b32decode(seed);
  const body = b.subarray(0, b.length - 2);
  const c = crc16(body);
  if (b[b.length - 2] !== (c & 0xff) || b[b.length - 1] !== c >> 8) throw new Error("seed checksum");
  return body.subarray(2, 34);
}

const PKCS8 = Buffer.from("302e020100300506032b657004220420", "hex");
const SPKI = Buffer.from("302a300506032b6570032100", "hex");

export function keypairFromSeed(seed) {
  const raw = decodeSeed(seed);
  const priv = createPrivateKey({ key: Buffer.concat([PKCS8, raw]), format: "der", type: "pkcs8" });
  const spki = createPublicKey(priv).export({ format: "der", type: "spki" });
  const pub = spki.subarray(spki.length - 32);
  const id = b32encode(withCrc(Buffer.concat([Buffer.from([PREFIX_USER]), pub])));
  return { seed, priv, pub, id };
}

export function publicKeyFromId(id) {
  const b = b32decode(id);
  return createPublicKey({ key: Buffer.concat([SPKI, b.subarray(1, 33)]), format: "der", type: "spki" });
}

export function canonical(v) {
  if (v === null || typeof v === "boolean" || typeof v === "string") return JSON.stringify(v);
  if (typeof v === "number") {
    if (!Number.isFinite(v)) throw new Error("not a JSON number");
    return JSON.stringify(v);
  }
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  const keys = Object.keys(v).filter((k) => v[k] !== undefined).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonical(v[k])}`).join(",")}}`;
}

export const ENVELOPE_TAG = "agentmesh-envelope-v1\n";

export function signedBytes(env) {
  const { sig, ...rest } = env;
  return Buffer.from(ENVELOPE_TAG + canonical(rest), "utf8");
}

export function signEnvelope(env, kp) {
  const { sig, ...rest } = env;
  return { ...rest, sig: sign(null, signedBytes(rest), kp.priv).toString("base64url") };
}

export function verifyEnvelope(env) {
  if (typeof env.sig !== "string" || typeof env.from !== "string") return false;
  try {
    return verify(null, signedBytes(env), publicKeyFromId(env.from), Buffer.from(env.sig, "base64url"));
  } catch { return false; }
}

export const sha256hex = (bytes) => createHash("sha256").update(bytes).digest("hex");
