#!/usr/bin/env node
// Checks conformance/descriptor-floor.json (SPEC.md 4.9, the bound, signed
// Descriptor every agent serves, with 6.2's minimal Descriptor and 6.6's
// signature) against itself and against the rules, with node alone.
//
//   node common-agent/conformance/lib/check-descriptor-floor.mjs
//
// What it checks:
//
//   1. The fixture's seed is its subject's key.
//   2. Every valid Descriptor meets the floor under the reference rule below,
//      and its descriptor-statement-v1 signature really verifies.
//   3. Every invalid Descriptor fails the reference rule.
//   4. Exactly the entryway answers marked as conforming carry a document.
//
// Keys are spelled as Agent Messaging spells them, so the key and signing
// helpers are that binding's fixture helpers. The reference rule is test code
// that states 4.9 once in a checkable form; an implementation implements the
// specification and reads this fixture in its own tests.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { verify as edVerify } from "node:crypto";
import { canonical, idFromSeed, publicKeyFromId } from "../../../messaging/conformance/lib/envelope-vectors.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const fixture = JSON.parse(readFileSync(join(HERE, "..", "descriptor-floor.json"), "utf8"));
const ACTS_FOR = ["person", "organization", "anyone"];
const fail = [];

/** Whether a served Descriptor meets the floor of Section 4.9. Returns a reason, or "" when it does. */
function floorProblem(d) {
  if (!d || typeof d !== "object") return "not a document";
  if (d.format !== "agent-descriptor-v1") return "format";
  if (typeof d.agent_version !== "string" || !d.agent_version) return "agent_version";
  if (typeof d.does !== "string" || !d.does) return "does";
  if (!d.subject || typeof d.subject.id !== "string") return "subject";
  if (!ACTS_FOR.includes(d.acts_for)) return "acts_for";
  if (d.organization_name !== undefined && d.acts_for !== "organization") return "organization_name";
  if (!Array.isArray(d.offerings)) return "offerings";
  for (const o of d.offerings) {
    for (const k of fixture.offering_members) if (o?.[k] === undefined) return `offering ${o?.id ?? "?"} has no ${k}`;
    if (!Array.isArray(o.inputs) || !Array.isArray(o.outputs)) return `offering ${o.id} inputs or outputs`;
  }
  if (Object.prototype.hasOwnProperty.call(d, "shape")) return "shape";
  const sig = (d.signatures ?? []).find((s) => s.tag === fixture.tag);
  if (!sig) return "signature";
  if (sig.by !== d.subject.id) return "signer";
  const { signatures: _s, ...rest } = d;
  let ok = false;
  try {
    ok = edVerify(null, Buffer.from(`${fixture.tag}\n${canonical(rest)}`, "utf8"), publicKeyFromId(sig.by), Buffer.from(sig.sig, "base64"));
  } catch { ok = false; }
  return ok ? "" : "signature does not verify";
}

if (idFromSeed(fixture.identities.seed) !== fixture.identities.subject) fail.push("the seed is not the subject's key");

const { valid, invalid } = fixture.descriptors;
if (!valid.length || !invalid.length) fail.push("every section must have cases");
for (const c of valid) { const p = floorProblem(c.descriptor); if (p) fail.push(`valid ${c.case}: ${p}`); }
for (const c of invalid) if (!floorProblem(c.descriptor)) fail.push(`invalid ${c.case} meets the floor`);

const entry = fixture.entryway.cases;
for (const c of entry) {
  const carries = typeof c.answer?.descriptor === "string" && !/without subject/.test(c.answer.descriptor);
  if (carries !== c.conforms) fail.push(`entryway ${c.case}`);
}

for (const f of fail) console.log(`FAIL ${f}`);
if (fail.length) process.exit(1);
console.log(`descriptor-floor.json: ${valid.length} valid and ${invalid.length} invalid Descriptors, ${entry.length} entryway answers, all as the fixture says`);
