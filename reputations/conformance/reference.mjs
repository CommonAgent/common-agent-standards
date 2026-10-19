#!/usr/bin/env node
// reference.mjs: the reference implementation of the scoring formula
// fdbk-score-1 (Agent Reputations §7) and of report signing (§8.1), and the
// check that it reproduces the test vectors beside it.
//
//   node reputations/conformance/reference.mjs           check the vector files
//   node reputations/conformance/reference.mjs --write   recompute the expected
//                                                        values and write them
//
// It uses nothing outside Node.js itself (node:crypto, node:fs), so an
// implementer can read it beside the specification and run it anywhere Node 18
// or later runs. The vector files are the normative part: an implementation
// in any language conforms when it reproduces them, and this script is one
// implementation that does. The check exits 1 on any disagreement.
//
// The test key in fdbk-report-v1.json is published with its private part so
// that anyone can reproduce the signature byte for byte. It is a test key and
// nothing else: a bureau that signs with it signs for everybody.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, createPrivateKey, createPublicKey, sign, verify } from "node:crypto";

const HERE = dirname(fileURLToPath(import.meta.url));
const SCORE_FILE = join(HERE, "fdbk-score-1.json");
const REPORT_FILE = join(HERE, "fdbk-report-v1.json");
const HEADS_FILE = join(HERE, "fdbk-heads-v1.json");
const CASEFOLD_FILE = join(HERE, "casefolding-15.1.0.json");

// ── §5, §7: the formula ─────────────────────────────────────────────────────
// The quality value of each outcome code that enters a pool (§5). Every code
// that is not here never enters one.
export const VALUES = {
  OK: 1.0, OK_CORRECTED: 0.6, FAILED: 0.15, FAILED_SILENT: 0.0, CONTRACT: 0.0,
  VALUE_OK: 1.0, VALUE_POOR: 0.0,
};
const VALUE_JUDGMENTS = new Set(["VALUE_OK", "VALUE_POOR"]);
// The codes on which there was no work to judge (§6.2 rule 5).
const NO_WORK = new Set(["DECLINED", "REFUSED", "REFUSED_UNSTATED", "UNAVAILABLE", "STOPPED"]);
const DAY_MS = 86_400_000;

// The pool of §7.1 for one (subject, capability) pair, from ledger events.
// Each event is { seq, action, interaction_id, ... }:
//   fact      { ended_at, derived_outcome }        a reporter's fact (§4.2)
//   attested  { outcome, excluded? }               an attestation (§6.1, §6.6)
//   probed    { ended_at, result: PASS | FAIL }    a probe result (§4.3)
//   anything else (stopped, nda_claimed, nda_resolved, ...) never enters a pool.
// An attestation is rejected without a fact for its interaction (§6.2 rule 1),
// on an interaction with no work (rule 5), or when it names NDA_BREACH (rule
// 6). A later attestation for one interaction is an amendment and only the
// final one scores (rule 3). An excluded attestation (§6.4) does not score,
// and the derived outcome then stands (§7.1). Every event's age runs from the
// ended_at of the interaction it scores to the evaluation instant (§7.2).
export function pool(events, { evaluatedAt, halfLifeDays, kValue }) {
  const now = Date.parse(evaluatedAt);
  const facts = new Map();
  const attestations = new Map();
  const out = [];
  const sorted = [...events].sort((x, y) => x.seq - y.seq);
  for (const e of sorted) if (e.action === "fact") facts.set(e.interaction_id, e);
  for (const e of sorted) {
    if (e.action !== "attested") continue;
    const f = facts.get(e.interaction_id);
    if (!f || NO_WORK.has(f.derived_outcome) || e.outcome === "NDA_BREACH" || e.excluded) continue;
    attestations.set(e.interaction_id, e);
  }
  const weight = (endedAt, code) => {
    const age = (now - Date.parse(endedAt)) / DAY_MS;
    return (VALUE_JUDGMENTS.has(code) ? kValue : 1) * 2 ** (-age / halfLifeDays);
  };
  for (const e of sorted) {
    if (e.action === "fact") {
      const a = attestations.get(e.interaction_id);
      const outcome = a ? a.outcome : e.derived_outcome;
      if (!(outcome in VALUES)) continue;
      out.push({ interaction_id: e.interaction_id, outcome, from: a ? "attested" : "fact", v: VALUES[outcome], w: weight(e.ended_at, outcome) });
    } else if (e.action === "probed") {
      out.push({ interaction_id: e.interaction_id, outcome: e.result, from: "probed", v: e.result === "PASS" ? 1 : 0, w: weight(e.ended_at, e.result) });
    }
  }
  return out;
}

// §7.3, §7.4, §7.5. prior is { a0, b0 }, the uniform prior { 1, 1 } unless a
// portfolio prior is in effect. n_eff counts direct evidence only.
export function score(entries, { prior = { a0: 1, b0: 1 }, unprovenBelow = 20, z = 1.2816 } = {}) {
  let a = prior.a0, b = prior.b0;
  for (const { v, w } of entries) { a += w * v; b += w * (1 - v); }
  const mean = a / (a + b);
  const sd = Math.sqrt((a * b) / ((a + b) ** 2 * (a + b + 1)));
  const lcb = Math.max(0, mean - z * sd);
  const n_eff = a + b - prior.a0 - prior.b0;
  return { a, b, mean, sd, lcb, n_eff, state: n_eff < unprovenBelow ? "UNPROVEN" : "RATED" };
}

// ── §8.1: signing ───────────────────────────────────────────────────────────
// JCS (RFC 8785). For the values JSON can carry, ECMAScript's JSON.stringify
// already writes strings and numbers the way JCS requires; what it does not do
// is sort members, which JCS sorts by the UTF-16 code units of their names, the
// order Array.prototype.sort gives strings.
export function jcs(value) {
  if (value === null || typeof value !== "object") {
    if (typeof value === "number" && !Number.isFinite(value)) throw new Error("JCS has no form for a number that is not finite");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(jcs).join(",")}]`;
  return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${jcs(value[k])}`).join(",")}}`;
}
export const signedBytes = (tag, object) => Buffer.from(`${tag}\n${jcs(object)}`, "utf8");

const PKCS8_ED25519 = Buffer.from("302e020100300506032b657004220420", "hex");
export function keyFromSeed(seedHex) {
  const privateKey = createPrivateKey({ key: Buffer.concat([PKCS8_ED25519, Buffer.from(seedHex, "hex")]), format: "der", type: "pkcs8" });
  const raw = createPublicKey(privateKey).export({ format: "der", type: "spki" }).subarray(-32);
  const key = raw.toString("base64");
  return { privateKey, key, kid: kidOf(key) };
}
export const kidOf = (key) => createHash("sha256").update(key, "ascii").digest("hex").slice(0, 12);
const publicKeyOf = (key) => createPublicKey({ key: Buffer.concat([Buffer.from("302a300506032b6570032100", "hex"), Buffer.from(key, "base64")]), format: "der", type: "spki" });

// The steps of §8.1.3 that need no network: the envelope, the key against the
// pinned key set, the signature, the time window, and the answer.
export function verifyReport(envelope, { tag, member, keySet, bureau, now, graceSeconds = 60 }) {
  const obj = envelope?.[member];
  for (const k of [member, "bureau_key", "bureau_kid", "bureau_sig"]) if (envelope?.[k] == null) return `the envelope has no ${k}`;
  if (obj.bureau !== bureau) return "the report names another bureau";
  const entry = keySet.key_set.find((k) => k.kid === envelope.bureau_kid);
  if (!entry || entry.key !== envelope.bureau_key || entry.use !== "fdbk-report-signing" || !["current", "retired"].includes(entry.status)) return "the key is not in the pinned key set";
  if (!verify(null, signedBytes(tag, obj), publicKeyOf(entry.key), Buffer.from(envelope.bureau_sig, "base64"))) return "the signature does not verify";
  const t = Date.parse(now), g = graceSeconds * 1000;
  if (Date.parse(obj.expires_at) + g < t) return "the report has expired";
  if (Date.parse(obj.issued_at) - g > t) return "the report was issued in the future";
  return "ok";
}

// ── §4.1.1: the commitment over every subject's log ────────────────────────
// A sparse Merkle tree of height 256. Each subject has one slot, at the
// SHA-256 of its lowercased name. A slot holds the subject's head, or the
// tombstone of an erased subject, or nothing. An empty subtree of height h has
// the digest EMPTY[h]: 32 zero bytes at height 0, and SHA-256 over 0x01 and two
// copies of EMPTY[h - 1] above. A filled slot's digest is SHA-256 over 0x00 and
// the JCS of what it holds. A node is SHA-256 over 0x01, its left child and its
// right child. Bit 0 of a key, its first byte's highest bit, chooses the side
// at the root.
const H = (...parts) => { const h = createHash("sha256"); for (const x of parts) h.update(x); return h.digest(); };
const ONE = Buffer.from([1]);
export const EMPTY = [Buffer.alloc(32)];
for (let i = 1; i <= 256; i++) EMPTY.push(H(ONE, EMPTY[i - 1], EMPTY[i - 1]));
// A subject's slot key: SHA-256 over the UTF-8 of the subject after NFC,
// Unicode full case folding (the C and F entries of CaseFolding.txt, Unicode
// 15.1.0, in casefolding-15.1.0.json), and NFC again.
const FOLD = JSON.parse(readFileSync(CASEFOLD_FILE, "utf8")).fold;
export function foldSubject(subject) {
  let out = "";
  for (const ch of subject.normalize("NFC")) {
    const hex = ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");
    out += FOLD[hex] ? String.fromCodePoint(...FOLD[hex].split(" ").map((h) => parseInt(h, 16))) : ch;
  }
  return out.normalize("NFC");
}
export const subjectKey = (subject) => createHash("sha256").update(foldSubject(subject), "utf8").digest();
const bitOf = (key, i) => (key[i >> 3] >> (7 - (i & 7))) & 1;

/** What a slot holds, as the JCS object its digest is taken over. */
export function slotBody(slot) {
  if (slot.erased_at) return { erased_at: slot.erased_at, key: slot.key };
  return { ...(slot.after_erasure ? { after_erasure: slot.after_erasure } : {}), head_hash: slot.head_hash, key: slot.key, seq: slot.seq, subject: slot.subject };
}
export const slotDigest = (slot) => H(Buffer.from([0]), Buffer.from(jcs(slotBody(slot)), "utf8"));

/** The slots of a commitment: one per subject, a head or a tombstone. Two entries for one subject are refused. */
export function slotsOf(heads, tombstones = []) {
  const slots = new Map();
  const put = (slot) => {
    if (slots.has(slot.key)) throw new Error(`two entries for the slot ${slot.key}`);
    slots.set(slot.key, slot);
  };
  for (const h of heads) put({ ...h, key: subjectKey(h.subject).toString("hex") });
  for (const t of tombstones) put({ key: t.key, erased_at: t.erased_at });
  return slots;
}

function subtree(entries, depth) {
  if (!entries.length) return EMPTY[256 - depth];
  if (depth === 256) return slotDigest(entries[0]);
  const keyBits = (e) => bitOf(Buffer.from(e.key, "hex"), depth);
  return H(ONE, subtree(entries.filter((e) => keyBits(e) === 0), depth + 1), subtree(entries.filter((e) => keyBits(e) === 1), depth + 1));
}
export const smtRoot = (slots) => subtree([...slots.values()], 0).toString("hex");

/** The proof for one slot: the digest of each sibling from the slot up to the root, or null where the sibling is an empty subtree. */
export function smtProof(slots, keyHex) {
  const key = Buffer.from(keyHex, "hex");
  const topDown = [];
  let entries = [...slots.values()];
  for (let depth = 0; depth < 256; depth++) {
    const b = bitOf(key, depth);
    const same = entries.filter((e) => bitOf(Buffer.from(e.key, "hex"), depth) === b);
    const other = entries.filter((e) => bitOf(Buffer.from(e.key, "hex"), depth) !== b);
    topDown.push(other.length ? subtree(other, depth + 1).toString("hex") : null);
    entries = same;
  }
  return topDown.reverse();
}

/** Fold a proof from a slot up to a root: the slot's digest, or an empty slot for an absence. */
export function rootFromProof(keyHex, slot, siblings) {
  const key = Buffer.from(keyHex, "hex");
  let cur = slot ? slotDigest(slot) : EMPTY[0];
  for (let h = 0; h < 256; h++) {
    const sib = siblings[h] === null ? EMPTY[h] : Buffer.from(siblings[h], "hex");
    cur = bitOf(key, 255 - h) ? H(ONE, sib, cur) : H(ONE, cur, sib);
  }
  return cur.toString("hex");
}

export const HEADS_TAG = "fdbk-heads-v1";
/** `prev` of the next commitment: SHA-256 over this commitment's signed bytes, in hex. */
export const commitmentHash = (commitment) => createHash("sha256").update(signedBytes(HEADS_TAG, commitment)).digest("hex");

/** Every tombstone in a commitment is dated no later than the commitment. */
export function erasuresDated(commitment, tombstones) {
  for (const t of tombstones) if (Date.parse(t.erased_at) > Date.parse(commitment.issued_at)) return `the erasure of ${t.key.slice(0, 12)}… is dated after the commitment`;
  return "ok";
}

// A witness co-signs a commitment only when it extends the last one the
// witness co-signed for that bureau: the first, with seq 1 and no prev, or the
// next seq whose prev is the hash of the last. So a witness never co-signs two
// commitments with one seq. It signs, under the tag fdbk-heads-cosign-v1, the
// JCS of the bureau, the seq and the commitment's hash.
export const COSIGN_TAG = "fdbk-heads-cosign-v1";
export const cosignedObject = (commitment) => ({ bureau: commitment.bureau, commitment: commitmentHash(commitment), seq: commitment.seq });
export function witnessCosigns(last, commitment) {
  if (!last) return commitment.seq === 1 && commitment.prev === null ? "ok" : "the witness co-signs a bureau's first commitment first";
  if (commitment.bureau !== last.bureau) return "another bureau";
  if (commitment.seq !== last.seq + 1 || commitment.prev !== commitmentHash(last)) return "it does not extend the last commitment the witness co-signed";
  return "ok";
}

/** A commitment follows another: the next sequence number, and `prev` naming the previous one's signed bytes. */
export function followsFrom(prev, next) {
  if (next.seq !== prev.seq + 1) return `the sequence number is ${next.seq}, after ${prev.seq}`;
  if (next.prev !== commitmentHash(prev)) return "prev does not name the previous commitment";
  return "ok";
}

/**
 * Every slot of the earlier commitment carried forward: a head stays or moves
 * up its own log (the same seq and hash, or a higher seq) unless a tombstone
 * replaces it; a tombstone stays, or gives way to a head that names the
 * erasure in `after_erasure`; no slot simply empties.
 */
export function carriesForward(prevSlots, slots) {
  for (const [key, was] of prevSlots) {
    const now = slots.get(key);
    if (!now) return `the slot ${key.slice(0, 12)}… emptied without a tombstone`;
    if (was.erased_at) {
      if (now.erased_at ? now.erased_at !== was.erased_at : now.after_erasure !== was.erased_at) return `the erased slot ${key.slice(0, 12)}… came back without naming its erasure`;
      continue;
    }
    if (now.erased_at) continue;
    if ((now.after_erasure ?? null) !== (was.after_erasure ?? null)) return `the slot ${key.slice(0, 12)}… changed its erasure`;
    if (now.seq < was.seq) return `the head of ${was.subject} went back from ${was.seq} to ${now.seq}`;
    if (now.seq === was.seq && now.head_hash !== was.head_hash) return `the head of ${was.subject} at ${was.seq} changed its hash`;
  }
  return "ok";
}

// ── the check ───────────────────────────────────────────────────────────────
const WRITE = process.argv.includes("--write");
const bad = [];
const close = (x, y, tol) => typeof x === "number" && typeof y === "number" && Math.abs(x - y) <= tol;

{
  const file = JSON.parse(readFileSync(SCORE_FILE, "utf8"));
  const c = file.constants;
  const now = Date.parse(file.evaluated_at);
  for (const vec of file.vectors) {
    for (const e of vec.events) {
      const at = e.ended_at;
      if (at && e.age_days !== undefined && Math.abs((now - Date.parse(at)) / DAY_MS - e.age_days) > 1e-9) bad.push(`${vec.name}: event ${e.seq} says age_days ${e.age_days} and its ended_at says otherwise`);
    }
    const p = pool(vec.events, { evaluatedAt: file.evaluated_at, halfLifeDays: c.half_life_days, kValue: c.k_value });
    const got = score(p, { prior: vec.prior ?? undefined, unprovenBelow: c.unproven_below, z: c.z });
    if (WRITE) { vec.expect = { ...got, pool: p.map(({ interaction_id, outcome, v, w }) => ({ interaction_id, outcome, v, w })) }; continue; }
    const want = vec.expect;
    for (const k of ["a", "b", "mean", "sd", "lcb", "n_eff"]) if (!close(got[k], want[k], file.tolerance)) bad.push(`${vec.name}: ${k} is ${got[k]}, the vector says ${want[k]}`);
    if (got.state !== want.state) bad.push(`${vec.name}: the state is ${got.state}, the vector says ${want.state}`);
    if (p.length !== want.pool.length) bad.push(`${vec.name}: the pool holds ${p.length} events, the vector says ${want.pool.length}`);
    else p.forEach((x, i) => {
      const y = want.pool[i];
      if (x.interaction_id !== y.interaction_id || x.outcome !== y.outcome || !close(x.v, y.v, 0) || !close(x.w, y.w, file.tolerance)) bad.push(`${vec.name}: pool entry ${i} is ${JSON.stringify(x)}, the vector says ${JSON.stringify(y)}`);
    });
  }
  if (WRITE) writeFileSync(SCORE_FILE, `${JSON.stringify(file, null, 2)}\n`);
  else console.log(`fdbk-score-1: ${file.vectors.length} vectors checked`);
}

{
  const file = JSON.parse(readFileSync(REPORT_FILE, "utf8"));
  const { privateKey, key, kid } = keyFromSeed(file.test_key.seed_hex);
  if (WRITE) Object.assign(file.test_key, { public_key: key, kid });
  if (file.test_key.public_key !== key) bad.push(`test key: the seed gives the public key ${key}, the vector says ${file.test_key.public_key}`);
  if (file.test_key.kid !== kid) bad.push(`test key: the key id is ${kid}, the vector says ${file.test_key.kid}`);
  if (WRITE) file.key_set.key_set[0] = { ...file.key_set.key_set[0], kid, key }, file.key_set.keys[0] = key;
  for (const c of file.jcs) {
    const got = jcs(JSON.parse(c.input));
    if (WRITE) c.canonical = got;
    else if (got !== c.canonical) bad.push(`jcs ${c.name}: ${got}, the vector says ${c.canonical}`);
  }
  for (const v of file.signed) {
    const bytes = signedBytes(v.tag, v.envelope[v.member]);
    const sig = sign(null, bytes, privateKey).toString("base64");
    const sha = createHash("sha256").update(bytes).digest("hex");
    if (WRITE) {
      Object.assign(v, { signed_bytes: bytes.toString("utf8"), signed_bytes_sha256: sha });
      Object.assign(v.envelope, { bureau_key: key, bureau_kid: kid, bureau_sig: sig });
      continue;
    }
    if (bytes.toString("utf8") !== v.signed_bytes) bad.push(`${v.name}: the signed bytes differ from the vector's`);
    if (sha !== v.signed_bytes_sha256) bad.push(`${v.name}: the SHA-256 of the signed bytes is ${sha}, the vector says ${v.signed_bytes_sha256}`);
    if (sig !== v.envelope.bureau_sig) bad.push(`${v.name}: the signature is ${sig}, the vector says ${v.envelope.bureau_sig}`);
    const res = verifyReport(v.envelope, { tag: v.tag, member: v.member, keySet: file.key_set, bureau: file.key_set.bureau, now: file.verified_at });
    if (res !== "ok") bad.push(`${v.name}: verification says ${res}`);
  }
  if (WRITE) writeFileSync(REPORT_FILE, `${JSON.stringify(file, null, 2)}\n`);
  else {
    // The cases that must fail start from a signed vector and change one thing.
    for (const f of file.must_fail) {
      const base = file.signed.find((v) => v.name === f.from);
      const env = structuredClone(base.envelope);
      let tag = base.tag, now = file.verified_at;
      for (const [path, value] of Object.entries(f.set ?? {})) {
        const parts = path.split(".");
        let o = env;
        for (const p of parts.slice(0, -1)) o = o[p];
        if (value === null) delete o[parts.at(-1)]; else o[parts.at(-1)] = value;
      }
      if (f.tag) tag = f.tag;
      if (f.verified_at) now = f.verified_at;
      const res = verifyReport(env, { tag, member: base.member, keySet: file.key_set, bureau: file.key_set.bureau, now });
      if (res === "ok") bad.push(`must fail ${f.name}: it verified`);
      else if (f.reason && res !== f.reason) bad.push(`must fail ${f.name}: it failed with "${res}", the vector says "${f.reason}"`);
    }
    console.log(`fdbk-report-v1: ${file.jcs.length} canonical forms, ${file.signed.length} signed reports and ${file.must_fail.length} reports that must fail checked`);
  }
}

{
  const file = JSON.parse(readFileSync(HEADS_FILE, "utf8"));
  const report = JSON.parse(readFileSync(REPORT_FILE, "utf8"));
  const { privateKey, key, kid } = keyFromSeed(report.test_key.seed_hex);
  const witness = keyFromSeed(file.test_witness.seed_hex);
  if (WRITE) Object.assign(file.test_witness, { public_key: witness.key, kid: witness.kid });
  else if (file.test_witness.public_key !== witness.key) bad.push("heads: the witness seed gives another key");
  for (const k of file.slot_keys) {
    const ka = subjectKey(k.a).toString("hex"), kb = subjectKey(k.b).toString("hex");
    if (WRITE) { k.folded = foldSubject(k.a); k.key = ka; continue; }
    if (ka !== kb) bad.push(`slot key ${k.a} / ${k.b}: they take different slots`);
    if (ka !== k.key || foldSubject(k.a) !== k.folded) bad.push(`slot key ${k.a}: differs from the vector`);
  }
  const byName = Object.fromEntries(file.commitments.map((c) => [c.name, c]));
  let prev = null;
  let lastCosigned = null;
  for (const c of file.commitments) {
    const slots = slotsOf(c.heads, c.tombstones);
    const root = smtRoot(slots);
    const commitment = { ...c.envelope.heads, seq: c.envelope.heads.seq, prev: prev ? commitmentHash(prev.envelope.heads) : null, root, subjects: c.heads.length, tombstones: c.tombstones.length };
    const bytes = signedBytes(HEADS_TAG, commitment);
    const sig = sign(null, bytes, privateKey).toString("base64");
    const cosignBytes = signedBytes(COSIGN_TAG, cosignedObject(commitment));
    const cosig = sign(null, cosignBytes, witness.privateKey).toString("base64");
    if (WRITE) {
      c.slots = [...slots.values()].sort((x, y) => x.key.localeCompare(y.key)).map((x) => ({ key: x.key, digest: slotDigest(x).toString("hex") }));
      c.envelope = { heads: commitment, bureau_key: key, bureau_kid: kid, bureau_sig: sig };
      c.signed_bytes = bytes.toString("utf8");
      c.signed_bytes_sha256 = createHash("sha256").update(bytes).digest("hex");
      c.cosignature = { witness: file.key_set.witnesses[0].id, key: witness.key, kid: witness.kid, signed_bytes: cosignBytes.toString("utf8"), sig: cosig };
    } else {
      if (root !== c.envelope.heads.root) bad.push(`${c.name}: the root is ${root}, the vector says ${c.envelope.heads.root}`);
      if (bytes.toString("utf8") !== c.signed_bytes) bad.push(`${c.name}: the signed bytes differ from the vector's`);
      if (sig !== c.envelope.bureau_sig) bad.push(`${c.name}: the signature is ${sig}, the vector says ${c.envelope.bureau_sig}`);
      if (!verify(null, bytes, publicKeyOf(key), Buffer.from(c.envelope.bureau_sig, "base64"))) bad.push(`${c.name}: the commitment does not verify`);
      if (erasuresDated(commitment, c.tombstones) !== "ok") bad.push(`${c.name}: ${erasuresDated(commitment, c.tombstones)}`);
      const named = file.key_set.witnesses.find((w) => w.id === c.cosignature.witness && w.key === c.cosignature.key);
      if (!named || !verify(null, cosignBytes, publicKeyOf(c.cosignature.key), Buffer.from(c.cosignature.sig, "base64"))) bad.push(`${c.name}: the co-signature of a named witness does not verify`);
      if (witnessCosigns(lastCosigned, commitment) !== "ok") bad.push(`${c.name}: the witness would refuse it: ${witnessCosigns(lastCosigned, commitment)}`);
      if (prev) {
        const f = followsFrom(prev.envelope.heads, c.envelope.heads);
        if (f !== "ok") bad.push(`${c.name}: ${f}`);
        const x = carriesForward(slotsOf(prev.heads, prev.tombstones), slots);
        if (x !== "ok") bad.push(`${c.name}: ${x}`);
      }
    }
    prev = c;
    lastCosigned = commitment;
  }
  if (WRITE) file.empty_root = EMPTY[256].toString("hex");
  else if (EMPTY[256].toString("hex") !== file.empty_root) bad.push("heads: the root of no slots differs from the vector's");
  for (const p of file.proofs) {
    const c = byName[p.commitment];
    const slots = slotsOf(c.heads, c.tombstones);
    const keyHex = p.key ?? subjectKey(p.subject).toString("hex");
    const siblings = smtProof(slots, keyHex);
    if (WRITE) { p.key = keyHex; p.siblings = siblings; continue; }
    if (JSON.stringify(siblings) !== JSON.stringify(p.siblings)) bad.push(`proof ${p.name}: the siblings differ from the vector's`);
    const slot = p.kind === "absent" ? null : slots.get(keyHex);
    if (rootFromProof(keyHex, slot, p.siblings) !== c.envelope.heads.root) bad.push(`proof ${p.name}: it does not reach the root of ${c.name}`);
  }
  if (WRITE) writeFileSync(HEADS_FILE, `${JSON.stringify(file, null, 2)}\n`);
  else {
    for (const f of file.must_fail) {
      let res = "ok";
      if (f.check === "proof") {
        const c = byName[f.commitment];
        const p = file.proofs.find((x) => x.name === f.proof);
        const slot = f.slot === null ? null : { ...f.slot, key: p.key };
        res = rootFromProof(p.key, slot, p.siblings) === c.envelope.heads.root ? "ok" : "the proof does not reach the root";
      } else if (f.check === "build") {
        try { slotsOf(f.heads, f.tombstones ?? []); } catch (e) { res = e.message; }
      } else if (f.check === "chain") {
        const next = { ...byName[f.commitment].envelope.heads, ...(f.set ?? {}) };
        res = followsFrom(byName[f.after].envelope.heads, next);
      } else if (f.check === "extension") {
        const base = byName[f.after];
        res = carriesForward(slotsOf(base.heads, base.tombstones), slotsOf(f.heads, f.tombstones ?? []));
      } else if (f.check === "erasure") {
        res = erasuresDated({ ...byName[f.commitment].envelope.heads }, f.tombstones);
      } else if (f.check === "witness") {
        const next = { ...byName[f.commitment].envelope.heads, ...(f.set ?? {}) };
        res = witnessCosigns(byName[f.after].envelope.heads, next);
      }
      if (res === "ok") bad.push(`must fail ${f.name}: it passed`);
    }
    console.log(`fdbk-heads-v1: ${file.slot_keys.length} slot keys, ${file.commitments.length} commitments with their co-signatures, ${file.proofs.length} proofs and ${file.must_fail.length} cases that must fail checked`);
  }
}

if (WRITE) { console.log("expected values written"); process.exit(0); }
for (const b of bad) console.log(`MISMATCH ${b}`);
if (bad.length) process.exit(1);
