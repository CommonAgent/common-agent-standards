#!/usr/bin/env node
// check-profiles.mjs: every profile in profiles/ names things that exist.
//
//   node tools/check-profiles.mjs
//
// For every profiles/*.json: the document it names exists and carries the
// profile's version; every standard it names is in standards.json at the
// version the profile states; every required, partial and excluded section is
// a heading of that standard's specification, and no section is both required
// and excluded; every vector file exists, every group's path resolves inside
// it, and every case named under 'only' or 'except', and every index under
// 'indexes', is in the list the path names; every excluded vector file exists
// and is not also required; and the document mentions every vector file the
// profile names. Exits 1 on any disagreement.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(REPO, p), "utf8").replace(/\r\n/g, "\n");
const reg = JSON.parse(read("standards.json"));
const bad = [];
const nameOf = (c) => c?.name ?? c?.case ?? c?.act ?? c?.id;
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const files = existsSync(join(REPO, "profiles")) ? readdirSync(join(REPO, "profiles")).filter((f) => f.endsWith(".json")) : [];
for (const f of files) {
  const at = `profiles/${f}:`;
  const p = JSON.parse(read(`profiles/${f}`));
  if (!p.document || !existsSync(join(REPO, p.document))) { bad.push(`${at} the document ${p.document} does not exist`); continue; }
  const doc = read(p.document);
  if (!doc.includes(`**Version:** ${p.version}`)) bad.push(`${at} ${p.document} does not carry the version ${p.version}`);
  for (const a of p.assumes ?? []) if (!reg.standards.some((s) => s.id === a.standard)) bad.push(`${at} assumes an unknown standard ${a.standard}`);
  for (const l of p.left_out ?? []) if (!reg.standards.some((s) => s.id === l.id)) bad.push(`${at} leaves out an unknown standard ${l.id}`);
  for (const s of p.standards) {
    const sat = `${at} ${s.id}:`;
    const entry = reg.standards.find((x) => x.id === s.id);
    if (!entry) { bad.push(`${sat} not in standards.json`); continue; }
    if (entry.version !== s.version) bad.push(`${sat} the profile applies to ${s.version}, and standards.json has ${entry.version}`);
    const spec = read(entry.spec);
    const heading = (n) => new RegExp(`^#{2,4} ${esc(n)}\\.? `, "m").test(spec);
    for (const n of [...s.required_sections, ...s.excluded_sections, ...(s.partial_sections ?? []).map((x) => x.section)])
      if (!heading(n)) bad.push(`${sat} section ${n} is not a heading of ${entry.spec}`);
    for (const n of s.required_sections) if (s.excluded_sections.includes(n)) bad.push(`${sat} section ${n} is both required and excluded`);
    for (const x of s.partial_sections ?? []) if (!s.required_sections.includes(x.section)) bad.push(`${sat} the partial section ${x.section} is not required`);
    for (const v of s.vectors) {
      if (!existsSync(join(REPO, v.file))) { bad.push(`${sat} ${v.file} does not exist`); continue; }
      if (!doc.includes(basename(v.file))) bad.push(`${sat} ${p.document} does not mention ${basename(v.file)}`);
      if ((s.excluded_vectors ?? []).includes(v.file)) bad.push(`${sat} ${v.file} is both required and excluded`);
      const data = JSON.parse(read(v.file));
      for (const g of v.groups) {
        const node = g.path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), data);
        if (node === undefined) { bad.push(`${sat} ${v.file} has no ${g.path}`); continue; }
        const picks = [g.all ? "all" : null, g.only ? "only" : null, g.except ? "except" : null, g.indexes ? "indexes" : null].filter(Boolean);
        if (picks.length !== 1) { bad.push(`${sat} ${v.file} ${g.path}: name exactly one of all, only, except and indexes`); continue; }
        if (g.all) continue;
        if (!Array.isArray(node)) { bad.push(`${sat} ${v.file} ${g.path} is not a list`); continue; }
        if (g.indexes) { for (const i of g.indexes) if (!Number.isInteger(i) || i < 0 || i >= node.length) bad.push(`${sat} ${v.file} ${g.path} has no entry ${i}`); continue; }
        const names = new Set(node.map(nameOf));
        for (const n of g.only ?? g.except) if (!names.has(n)) bad.push(`${sat} ${v.file} ${g.path} has no case "${n}"`);
      }
    }
    for (const x of s.excluded_vectors ?? []) if (!existsSync(join(REPO, x))) bad.push(`${sat} the excluded ${x} does not exist`);
  }
}
for (const b of bad) console.error(b);
if (bad.length) process.exit(1);
console.log(`profiles: ${files.length} profile${files.length === 1 ? "" : "s"} name only sections, files and cases that exist`);
