#!/usr/bin/env node
// Checks AgentDocs (SPEC.md Chapter 9) against the static checks of Section
// 9.10, with node alone, and checks the cases in conformance/agentdoc/ against
// what each case expects.
//
//   node common-agent/conformance/lib/check-agentdoc.mjs              every case in conformance/agentdoc/
//   node common-agent/conformance/lib/check-agentdoc.mjs <file|dir>   one case, one folder, or a bare AgentDoc
//
// A case is { "name", "note", "agentdoc", "expect": { "ok", "fail": [rule ids] } }.
// The checker runs every static rule over the case's AgentDoc, and the case
// agrees when `ok` matches and the set of rules that failed is exactly
// `expect.fail`. A file that is an AgentDoc itself (it carries "agentdoc": "v1")
// is checked and its findings printed. Exits 1 when any case disagrees with its
// `expect` or any bare AgentDoc fails, and 2 when a file cannot be read.
//
// The rule ids are the ones the @common-agent/agentdoc package's check
// reports. Two rules of Section 9.10 need the sources themselves and are not
// here: `source-digest` (each listed source can be fetched and matches its
// digest) and `fact-in-source` (each fact in a section is in one of the
// section's cited sources). The twelve static rules, as this checker reads them:
//
//   sources-exist              every id in a section's `from` is the `id` of an
//                              entry in `sources`.
//   section-has-source         every member of `sections` is an object whose
//                              `from` is a non-empty array.
//   no-summary-grade           no key anywhere in the document is a summary
//                              grade: score, rating, grade, badge, badges,
//                              tier, rank, stars, trust, trust_label,
//                              trust_level or trust_mark, or a key ending in
//                              _score, _rating, _grade, _badge, _tier, _rank
//                              or _stars (case does not matter).
//   visibility-supports-claim  a member presented as enforced is an object
//                              under `sections` carrying "enforced": true. It
//                              is supported where `sections.shape.visibility`
//                              is `verifiable`, and where it is `observed` only
//                              inside `sections.access` (what happens at the
//                              door). At `opaque`, or with no visibility, no
//                              member is presented as enforced (9.5.1).
//   decided-by-rule            every object carrying "enforced": true carries
//                              "decided_by": "rule" (9.5 and 6.11: only what a
//                              rule decides may be shown as enforced).
//   sells-scope                every entry of `sections.sells.offerings`
//                              carries `scope`, a non-empty string.
//   open-offering-members      an offering whose scope is `open-with-focus`
//                              carries `focus`, `workspace` (an array),
//                              `authority` (an array), `ceilings`, and at least
//                              one output (`outputs`, or `deliverables.per_task`);
//                              one whose scope is `open-ended` carries
//                              `authority` and `ceilings`; both carry ceilings
//                              `job_seconds` and `cost_per_job`, `spend_per_job`
//                              where the authority holds `spends-money`, and
//                              `messages_per_job` where it holds
//                              `sends-messages` (6.11).
//   open-ended-no-claim        an `open-ended` offering carries none of `does`,
//                              `focus`, `role`, `can_do`, `capabilities`,
//                              `skills` or `examples`.
//   assembled-at               `assembled_at` is a non-empty string.
//   fetched-at                 every source carries `fetched_at`, or, for an
//                              `observation`, `at` (9.4).
//   not-stated-complete        each of these is present in its place or named
//                              in `not_stated`: the twelve sections of 9.5;
//                              `identity.acts_for` where `identity` is present;
//                              `shape.visibility` where `shape` is present
//                              (9.5.1, rule 2); `access.schemes` and
//                              `access.admission` where `access` is present;
//                              and `asked.<name>` for an interface with no
//                              exchanges. A package AgentDoc also names
//                              `subject`, `standing`, `access`, `handling`,
//                              `shape.visibility` and `sells.offerings.price`
//                              (13.4, rule 2). An entry names a path when it is
//                              the path or the start of it ("shape" names
//                              "shape.visibility").
//   no-default                 no path in `not_stated` has a value. A path is
//                              read in `sections`, then at the document's top
//                              level, one dotted member at a time; at an
//                              array, the rest of the path is read in each
//                              element.
//
// A package AgentDoc (13.4) carries `package` in place of `subject` and is
// fixed to the package rather than to a moment, so `assembled-at` and
// `fetched-at` are not applied to it. This file is test code that states the
// static checks once in a checkable form; an implementation implements the
// specification and reads the cases in its own tests.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

export const RULES = [
  "sources-exist", "section-has-source", "no-summary-grade", "visibility-supports-claim",
  "decided-by-rule", "sells-scope", "open-offering-members", "open-ended-no-claim",
  "assembled-at", "fetched-at", "not-stated-complete", "no-default",
];
const SECTIONS = ["identity", "shape", "asked", "role", "sells", "access", "refuses", "reaches", "leaves", "configs", "handling", "standing"];
const PACKAGE_NAMES = ["subject", "standing", "access", "handling", "shape.visibility", "sells.offerings.price"];
const GRADE_KEYS = new Set(["score", "rating", "grade", "badge", "badges", "tier", "rank", "stars", "trust", "trust_label", "trust_level", "trust_mark"]);
const GRADE_ENDINGS = ["_score", "_rating", "_grade", "_badge", "_tier", "_rank", "_stars"];
const CLAIM_KEYS = ["does", "focus", "role", "can_do", "capabilities", "skills", "examples"];

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isStr = (v) => typeof v === "string" && v.length > 0;

/** Every object under `value`, with its path, the root included. */
function* objects(value, path) {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) yield* objects(value[i], `${path}[${i}]`);
  } else if (isObj(value)) {
    yield [value, path];
    for (const [k, v] of Object.entries(value)) yield* objects(v, `${path}.${k}`);
  }
}

/** The value at a dotted path, reading each element of an array on the way. */
function valueAt(root, parts) {
  if (!parts.length) return root;
  if (Array.isArray(root)) {
    for (const el of root) {
      const v = valueAt(el, parts);
      if (v !== undefined) return v;
    }
    return undefined;
  }
  if (!isObj(root) || !Object.prototype.hasOwnProperty.call(root, parts[0])) return undefined;
  return valueAt(root[parts[0]], parts.slice(1));
}

/** The static findings for one AgentDoc, as { rule, path, message, level }. */
export function checkAgentDoc(doc) {
  const findings = [];
  const add = (rule, path, message) => findings.push({ rule, path, message, level: "fail" });
  if (!isObj(doc)) { add("section-has-source", "", "the document is not a JSON object"); return findings; }

  const isPackage = doc.package !== undefined;
  const sources = Array.isArray(doc.sources) ? doc.sources : [];
  const sourceIds = new Set(sources.filter(isObj).map((s) => s.id));
  const sections = isObj(doc.sections) ? doc.sections : {};
  const notStated = Array.isArray(doc.not_stated) ? doc.not_stated.filter((p) => typeof p === "string") : [];
  const named = (path) => notStated.some((e) => path === e || path.startsWith(`${e}.`));

  // sources-exist and section-has-source
  for (const [name, s] of Object.entries(sections)) {
    if (!isObj(s) || !Array.isArray(s.from) || s.from.length === 0) {
      add("section-has-source", `sections.${name}.from`, `the ${name} section names no source`);
      continue;
    }
    for (const id of s.from) {
      if (!sourceIds.has(id)) add("sources-exist", `sections.${name}.from`, `the ${name} section cites ${JSON.stringify(id)}, which is not among the sources`);
    }
  }

  // no-summary-grade
  for (const [o, path] of objects(doc, "")) {
    for (const k of Object.keys(o)) {
      const key = k.toLowerCase();
      if (GRADE_KEYS.has(key) || GRADE_ENDINGS.some((e) => key.endsWith(e))) {
        add("no-summary-grade", `${path}.${k}`.replace(/^\./, ""), `${k} is a summary grade, and an AgentDoc carries none`);
      }
    }
  }

  // visibility-supports-claim and decided-by-rule
  const visibility = isObj(sections.shape) ? sections.shape.visibility : undefined;
  for (const [o, path] of objects(sections, "sections")) {
    if (o.enforced !== true) continue;
    const atDoor = path === "sections.access" || path.startsWith("sections.access.") || path.startsWith("sections.access[");
    const supported = visibility === "verifiable" || (visibility === "observed" && atDoor);
    if (!supported) {
      add("visibility-supports-claim", path, `${path} is presented as enforced, and visibility ${visibility === undefined ? "absent" : JSON.stringify(visibility)} does not support that${visibility === "observed" ? " away from the door" : ""}`);
    }
    if (o.decided_by !== "rule") {
      add("decided-by-rule", path, `${path} is presented as enforced, and what decides it is ${o.decided_by === undefined ? "not stated" : JSON.stringify(o.decided_by)}, not a rule`);
    }
  }

  // sells-scope, open-offering-members, open-ended-no-claim
  const offerings = isObj(sections.sells) && Array.isArray(sections.sells.offerings) ? sections.sells.offerings : [];
  offerings.forEach((o, i) => {
    const at = `sections.sells.offerings[${i}]`;
    if (!isObj(o)) { add("sells-scope", at, "the offering is not an object"); return; }
    if (!isStr(o.scope)) { add("sells-scope", at, `offering ${o.name ?? o.id ?? i} carries no scope`); return; }
    const open = o.scope === "open-with-focus" || o.scope === "open-ended";
    if (!open) return;
    const lacks = [];
    if (o.scope === "open-with-focus") {
      if (!isStr(o.focus)) lacks.push("focus");
      if (!Array.isArray(o.workspace)) lacks.push("workspace");
      const outs = (Array.isArray(o.outputs) && o.outputs.length > 0) || (isObj(o.deliverables) && Array.isArray(o.deliverables.per_task) && o.deliverables.per_task.length > 0);
      if (!outs) lacks.push("an output");
    }
    if (!Array.isArray(o.authority)) lacks.push("authority");
    if (!isObj(o.ceilings)) lacks.push("ceilings");
    else {
      for (const c of ["job_seconds", "cost_per_job"]) if (o.ceilings[c] === undefined) lacks.push(`ceilings.${c}`);
      const authority = Array.isArray(o.authority) ? o.authority : [];
      if (authority.includes("spends-money") && o.ceilings.spend_per_job === undefined) lacks.push("ceilings.spend_per_job");
      if (authority.includes("sends-messages") && o.ceilings.messages_per_job === undefined) lacks.push("ceilings.messages_per_job");
    }
    for (const l of lacks) add("open-offering-members", at, `the ${o.scope} offering ${o.name ?? o.id ?? i} lacks ${l}`);
    if (o.scope === "open-ended") {
      for (const k of CLAIM_KEYS) {
        if (o[k] !== undefined) add("open-ended-no-claim", `${at}.${k}`, `the open-ended offering ${o.name ?? o.id ?? i} carries ${k}, a statement of what it can do`);
      }
    }
  });

  // assembled-at and fetched-at (not applied to a package AgentDoc)
  if (!isPackage) {
    if (!isStr(doc.assembled_at)) add("assembled-at", "assembled_at", "the document does not say when it was assembled");
    sources.forEach((s, i) => {
      const ok = isObj(s) && (isStr(s.fetched_at) || (s.kind === "observation" && isStr(s.at)));
      if (!ok) add("fetched-at", `sources[${i}]`, `source ${isObj(s) ? (s.id ?? i) : i} does not say when it was fetched`);
    });
  }

  // not-stated-complete
  const need = (path, present) => {
    if (!present && !named(path)) add("not-stated-complete", "not_stated", `${path} is absent and not named in not_stated`);
  };
  for (const name of SECTIONS) need(name, sections[name] !== undefined);
  if (sections.identity !== undefined) need("identity.acts_for", isObj(sections.identity) && sections.identity.acts_for !== undefined);
  if (sections.shape !== undefined) need("shape.visibility", visibility !== undefined);
  if (sections.access !== undefined) {
    need("access.schemes", isObj(sections.access) && sections.access.schemes !== undefined);
    need("access.admission", isObj(sections.access) && sections.access.admission !== undefined);
  }
  const interfaces = isObj(sections.asked) && Array.isArray(sections.asked.interfaces) ? sections.asked.interfaces : [];
  for (const iface of interfaces) {
    if (isObj(iface) && isStr(iface.name)) need(`asked.${iface.name}`, Array.isArray(iface.exchanges) && iface.exchanges.length > 0);
  }
  if (isPackage) for (const path of PACKAGE_NAMES) need(path, false);

  // no-default
  for (const entry of notStated) {
    const parts = entry.split(".");
    const inSections = valueAt(sections, parts);
    const v = inSections !== undefined ? inSections : valueAt(doc, parts);
    if (v !== undefined) add("no-default", `not_stated: ${entry}`, `${entry} is named in not_stated and given a value anyway`);
  }

  return findings;
}

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    console.log(`ERROR ${file}: ${e.message}`);
    process.exit(2);
  }
}

const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

/** Checks one file. Returns true when it agrees (a case) or passes (a bare AgentDoc). */
function checkFile(file) {
  const j = readJson(file);
  const label = basename(file);
  if (j && j.agentdoc === "v1") {
    const findings = checkAgentDoc(j);
    for (const f of findings) console.log(`  ${f.rule}  ${f.path}: ${f.message}`);
    console.log(`${findings.length ? "FAIL" : "ok  "} ${label}: ${findings.length ? `${findings.length} findings` : "every static check passes"}`);
    return findings.length === 0;
  }
  if (!j || !j.agentdoc || !j.expect || typeof j.expect.ok !== "boolean" || !Array.isArray(j.expect.fail)) {
    console.log(`FAIL ${label}: not a case ({ name, note, agentdoc, expect: { ok, fail } }) and not an AgentDoc`);
    return false;
  }
  const unknown = j.expect.fail.filter((r) => !RULES.includes(r));
  const findings = checkAgentDoc(j.agentdoc);
  const failed = [...new Set(findings.filter((f) => f.level === "fail").map((f) => f.rule))].sort();
  const ok = failed.length === 0;
  const want = [...new Set(j.expect.fail)].sort();
  const agrees = !unknown.length && ok === j.expect.ok && sameSet(failed, want) && (j.expect.ok ? want.length === 0 : want.length > 0);
  if (agrees) {
    console.log(`ok   ${label}: ${ok ? "passes" : `fails ${failed.join(", ")}`}, as expected`);
  } else {
    console.log(`FAIL ${label}: expected ${j.expect.ok ? "a pass" : `failures ${want.join(", ")}`}, got ${ok ? "a pass" : `failures ${failed.join(", ")}`}${unknown.length ? `; unknown rule ids ${unknown.join(", ")}` : ""}`);
    for (const f of findings) console.log(`       ${f.rule}  ${f.path}: ${f.message}`);
  }
  return agrees;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const target = resolve(process.argv[2] ?? join(HERE, "..", "agentdoc"));
  if (!existsSync(target)) { console.log(`ERROR ${target} does not exist`); process.exit(2); }
  const files = statSync(target).isDirectory()
    ? readdirSync(target).filter((f) => f.endsWith(".json")).sort().map((f) => join(target, f))
    : [target];
  if (!files.length) { console.log(`ERROR no .json files in ${target}`); process.exit(2); }
  let bad = 0;
  for (const f of files) if (!checkFile(f)) bad++;
  if (files.length > 1) console.log(`${files.length - bad} of ${files.length} files as expected`);
  if (bad) process.exit(1);
}
