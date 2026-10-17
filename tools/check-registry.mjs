#!/usr/bin/env node
// check-registry.mjs: standards.json agrees with the folders it describes.
//
//   node tools/check-registry.mjs
//
// For every entry: the folder, the specification, CHANGELOG.md and the builder
// (when one is named) exist; the version is the one the specification's own
// version line carries (for a library whose documents each carry
// "Version: v1", every one of them must agree); the tag is the id, "-v" and
// the version; the changelog has an entry for the version; and every listed
// part names its version in its first lines. Exits 1 on any disagreement.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const reg = JSON.parse(readFileSync(join(REPO, "standards.json"), "utf8"));
const bad = [];
const ids = new Set();
const read = (p) => readFileSync(join(REPO, p), "utf8").replace(/\r\n/g, "\n");
const mdUnder = (d) => readdirSync(join(REPO, d)).flatMap((f) => {
  const p = `${d}/${f}`;
  if (statSync(join(REPO, p)).isDirectory()) return f === "site" || f === "conformance" ? [] : mdUnder(p);
  return f.endsWith(".md") && !/^(README|CHANGELOG)\.md$/.test(f) ? [p] : [];
});

for (const s of reg.standards) {
  const at = `${s.id}:`;
  if (ids.has(s.id)) bad.push(`${at} the id is used twice`);
  ids.add(s.id);
  for (const k of ["name", "kind", "folder", "spec", "domain", "site", "version", "status", "tag", "summary"]) {
    if (!s[k]) bad.push(`${at} has no ${k}`);
  }
  if (!["base", "standard", "guide"].includes(s.kind)) bad.push(`${at} kind is ${s.kind}`);
  if (!existsSync(join(REPO, s.folder))) { bad.push(`${at} no folder ${s.folder}`); continue; }
  for (const f of [s.spec, `${s.folder}/CHANGELOG.md`, `${s.folder}/README.md`, s.builder].filter(Boolean)) {
    if (!existsSync(join(REPO, f))) bad.push(`${at} no file ${f}`);
  }
  const want = `${s.id}-v${s.version.replace(/^v/, "")}`;
  if (s.tag !== want) bad.push(`${at} tag ${s.tag} is not ${want}`);
  if (new URL(s.site).host.replace(/^www\./, "") !== s.domain) bad.push(`${at} site ${s.site} is not on ${s.domain}`);

  // the version line
  const spec = existsSync(join(REPO, s.spec)) ? read(s.spec) : "";
  const line = spec.match(/^\*\*Version:\*\*\s*([^\s·]+)/m)?.[1];
  if (line) {
    if (line !== s.version) bad.push(`${at} ${s.spec} says ${line}, standards.json says ${s.version}`);
  } else {
    const found = mdUnder(s.folder).map((f) => [f, read(f).match(/^Version:\s*(v\d+)\b/m)?.[1]]).filter(([, v]) => v);
    if (!found.length) bad.push(`${at} no version line in ${s.spec} or the documents beside it`);
    for (const [f, v] of found) if (v !== s.version) bad.push(`${at} ${f} says ${v}, standards.json says ${s.version}`);
  }
  // the changelog
  const log = existsSync(join(REPO, s.folder, "CHANGELOG.md")) ? read(`${s.folder}/CHANGELOG.md`) : "";
  if (!log.includes(`## ${s.version} (`)) bad.push(`${at} CHANGELOG.md has no entry "## ${s.version} (...)"`);
  // the parts
  for (const p of s.parts ?? []) {
    if (!existsSync(join(REPO, p.path))) { bad.push(`${at} no file ${p.path}`); continue; }
    const head = read(p.path).split("\n").slice(0, 16).join("\n");
    const spaced = p.version.replace(/-draft$/, " draft");
    if (!head.includes(p.version) && !head.includes(spaced)) bad.push(`${at} ${p.path} does not say version ${p.version} in its first lines`);
  }
}
if (reg.standards.filter((s) => s.kind === "base").length !== 1) bad.push("there must be exactly one base");

for (const b of bad) console.log(`MISMATCH ${b}`);
if (bad.length) process.exit(1);
console.log(`standards.json: ${reg.standards.length} entries agree with their folders`);
