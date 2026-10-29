#!/usr/bin/env node
// make-fixtures.mjs: write the generated parts of the security reviewer's
// fixtures, and pack each fixture package as the archive a review is handed.
//
//   node make-fixtures.mjs           write them
//   node make-fixtures.mjs --check   write nothing; exit 1 when anything on disk
//                                    differs from what this would write
//
// The four packages in fixtures/ are Agent Packages (Common Agent Specification
// §12). Their authored files are written by hand: agent-descriptor.json,
// agent-runtime-requirements.json and the skill. This script writes the rest,
// the way a package builder does:
//
//   plugin.json                  the manifest, pointing at the two authored
//                                files by path and SHA-256 (§12.2)
//   net.agentdoc.package/        NOT.md, RECORDS.md and SYSTEMS.md, generated
//                                from the two authored files (§12.5)
//   fixtures/<name>.tar.gz       the package as an archive, under one top
//                                folder named for the package
//   fixtures/SHA256SUMS          the SHA-256 of each archive, which is the
//                                package's digest (§12.6 rule 5)
//
// The archives are packed deterministically, as §12.6 rule 5 says, so running
// this again writes the same bytes on any machine: the entries in byte order of
// their paths, one fixed modification time, no owner or group named, permission
// bits that say only that no file is executable, and one fixed compression
// setting, a gzip stream of stored blocks, which involves no compressor whose
// output could change between versions of Node. Text is read with its line
// endings as LF.
//
// It also checks what the harness relies on: each package keeps the rules of
// §12 that a reader can check from the files alone; the two packages the
// harness changes from carry no address in a script (§12.10, the address
// check); and each changed package differs from the package it comes from in
// exactly one program.
//
// Node 22 or later, nothing else.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(HERE, "fixtures");
const CHECK = process.argv.includes("--check");
// Each fixture folder, and the name its package is published under.
const PACKAGES = { base: "forecast-reader", undeclared: "forecast-reader", model: "forecast-writer", "model-address": "forecast-writer" };
// Each changed package, under the package it is changed from.
const CHANGED = { base: "undeclared", model: "model-address" };
const SCHEMA = "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json";
const MANIFEST_MEMBERS = ["$schema", "name", "version", "description", "author", "homepage", "repository", "license", "keywords", "extensions"];
// 2026-10-29T00:00:00Z, the time written in every archive header.
const MTIME = Date.UTC(2026, 9, 29) / 1000;

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const lf = (bytes) => Buffer.from(bytes.toString("utf8").replace(/\r\n/g, "\n"));
const json = (v) => JSON.stringify(v, null, 2) + "\n";
const problems = [];
const fail = (why) => problems.push(why);

// ── the files of a package ──────────────────────────────────────────────────

/** Every file under a folder, as POSIX paths relative to it, in byte order. */
function filesUnder(root) {
  const out = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.isFile()) out.push(relative(root, full).split(sep).join("/"));
    }
  };
  walk(root);
  return out.sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b)));
}

// ── the generated views, as a package builder writes them ───────────────────

function notMd(desc) {
  const body = ["# Where this agent stops", "", ...desc.refusals.split("\n").filter((l) => l.trim())];
  if (desc.escalates?.length) body.push("", "## What always goes to a person", "", ...desc.escalates.map((e) => `- ${e}`));
  return body.join("\n") + "\n";
}

function recordsMd(desc) {
  const body = ["# The records this agent must leave", "", "This is the contract. The agent leaves the following behind, on", "every run.", ""];
  for (const r of desc.records ?? []) body.push(`- ${r.name}${r.when === "standing" ? " (kept across tasks)" : ""}${r.file ? ` at \`${r.file}\`` : ""}`);
  body.push("", "An agent that leaves less than this does not do this job,", "whatever else it does well.");
  return body.join("\n") + "\n";
}

function systemsMd(desc, req) {
  const kinds = new Map((req.systems ?? []).map((s) => [s.name, s]));
  const body = ["# The systems this agent needs", "",
    "Named by what the work needs rather than by product. The access level",
    "is the most this work needs; a deployment that grants more is granting",
    "more than the job requires.", "",
    "| System | Kind | Access | What the access is for |", "|---|---|---|---|"];
  for (const s of desc.systems ?? []) {
    const k = kinds.get(s.name) ?? {};
    const extra = [];
    if (k.credential) extra.push(`credential \`${k.credential}\``);
    if (k.spends) extra.push(`spends per ${k.spends.unit}`);
    if (s.leaves) extra.push("the caller's material is sent to it");
    const needs = [s.needs, extra.join(", ")].filter(Boolean).join("; ");
    body.push(`| ${s.name} | ${k.kind ?? "directory"} | ${s.access} | ${needs} |`);
  }
  body.push("", "Whoever deploys this agent binds these systems to their own,", "and places any named credential. Nothing here names a product.");
  return body.join("\n") + "\n";
}

// ── the rules of §12 a reader can check from the files ──────────────────────

const ADDRESS = /[a-z][a-z0-9+.-]*:\/\//i;
const EXCEPTED = ["http://www.w3.org/", "https://www.w3.org/", "http://json-schema.org/", "https://json-schema.org/", "http://purl.org/", "http://schemas.openxmlformats.org/", "http://schemas.microsoft.com/"];
const HIDDEN = /[​-‏‪-‮⁠-⁤⁦-⁩﻿]|\udb40[\udc00-\udc7f]/;
const carriesAddress = (v) => typeof v === "string" ? ADDRESS.test(v)
  : Array.isArray(v) ? v.some(carriesAddress)
    : v && typeof v === "object" ? Object.values(v).some(carriesAddress) : false;

function checkPackage(name, files, read, manifest) {
  const desc = JSON.parse(read("agent-descriptor.json"));
  const req = JSON.parse(read("agent-runtime-requirements.json"));
  if (desc.format !== "agent-descriptor-v1") fail(`${name}: the descriptor's format is not agent-descriptor-v1`);
  if (desc.subject) fail(`${name}: a draft Descriptor carries no subject (§12.1)`);
  if (req.format !== "agent-runtime-requirements-v1") fail(`${name}: the runtime requirements' format is not agent-runtime-requirements-v1`);
  for (const k of Object.keys(manifest)) if (!MANIFEST_MEMBERS.includes(k)) fail(`${name}: plugin.json carries ${k}, which the Agent Plugins schema does not allow`);
  if (!/^(?!.*(?:--|\.\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/.test(manifest.name)) fail(`${name}: plugin.json's name does not match the schema's pattern`);
  // Rule 2: every system has exactly one entry on each side, every offering one skill.
  const a = (desc.systems ?? []).map((s) => s.name).sort().join(",");
  const b = (req.systems ?? []).map((s) => s.name).sort().join(",");
  if (a !== b) fail(`${name}: the descriptor names the systems ${a} and the runtime requirements ${b} (§12.4, section 3)`);
  const offerings = (desc.offerings ?? []).map((o) => o.id).sort().join(",");
  const skills = [...new Set(files.filter((f) => /^skills\/[^/]+\/SKILL\.md$/.test(f)).map((f) => f.split("/")[1]))].sort().join(",");
  if (offerings !== skills) fail(`${name}: the offerings ${offerings} and the skills ${skills} differ (§12.6 rule 2)`);
  // Rule 3: no address in the three declarations, but the manifest's own $schema.
  const { $schema, ...rest } = manifest;
  if ($schema !== SCHEMA) fail(`${name}: plugin.json does not declare ${SCHEMA}`);
  if (carriesAddress(rest) || carriesAddress(desc) || carriesAddress(req)) fail(`${name}: a declaration carries an address (§12.6 rule 3)`);
  // 12.4.1: at most one model system, its protocols from the closed list, and no credential or variable named.
  const models = (req.systems ?? []).filter((s) => s.kind === "model");
  if (models.length > 1) fail(`${name}: more than one system has the kind model (§12.4.1)`);
  for (const m of models) {
    if (!Array.isArray(m.protocols) || !m.protocols.length || m.protocols.some((p) => !["anthropic-messages", "openai-chat", "gemini"].includes(p))) fail(`${name}: the model system's protocols are not drawn from §12.4.1's list`);
    if (m.credential || m.env) fail(`${name}: the model system names a credential or a variable (§12.4.1)`);
  }
  // 12.10's address check, for a package the harness changes from: no address literal in a script.
  if (name in CHANGED) {
    for (const f of files.filter((p) => /^skills\/[^/]+\/scripts\//.test(p))) {
      const literals = (read(f).match(/(?:https?|wss?):\/\/[a-z0-9[][^\s"'`)]*|169\.254\.\d{1,3}\.\d{1,3}/gi) ?? [])
        .filter((l) => !EXCEPTED.some((e) => l.toLowerCase().startsWith(e)));
      if (literals.length) fail(`${name}: ${f} carries the address ${literals.join(", ")} (§12.10, the address check)`);
    }
  }
  // Rule 4: nothing commercial.
  if (req.price || desc.price) fail(`${name}: the package carries a price (§12.6 rule 4)`);
  // Rule 8: no hidden characters.
  for (const f of files) if (HIDDEN.test(read(f))) fail(`${name}: ${f} carries a hidden character (§12.6 rule 8)`);
  return { desc, req };
}

// ── the archive: ustar, then gzip made of stored blocks ─────────────────────

function header(path, size) {
  const h = Buffer.alloc(512);
  const put = (s, at, len) => Buffer.from(s).copy(h, at, 0, len);
  let prefix = "";
  let base = path;
  if (Buffer.byteLength(path) > 100) { const cut = path.lastIndexOf("/", 154); prefix = path.slice(0, cut); base = path.slice(cut + 1); }
  put(base, 0, 100);
  put("0000644\0", 100, 8);
  put("0000000\0", 108, 8);
  put("0000000\0", 116, 8);
  put(size.toString(8).padStart(11, "0") + "\0", 124, 12);
  put(MTIME.toString(8).padStart(11, "0") + "\0", 136, 12);
  h.fill(0x20, 148, 156);
  h[156] = "0".charCodeAt(0);
  put("ustar\0", 257, 6);
  put("00", 263, 2);
  put(prefix, 345, 155);
  let sum = 0;
  for (const byte of h) sum += byte;
  put(sum.toString(8).padStart(6, "0") + "\0 ", 148, 8);
  return h;
}

function tar(entries) {
  const blocks = [];
  for (const { path, bytes } of entries) {
    blocks.push(header(path, bytes.length), bytes, Buffer.alloc((512 - (bytes.length % 512)) % 512));
  }
  blocks.push(Buffer.alloc(1024));
  return Buffer.concat(blocks);
}

const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(bytes) {
  let c = 0xffffffff;
  for (const byte of bytes) c = CRC[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** A gzip member (RFC 1952) whose deflate stream is stored blocks (RFC 1951 §3.2.4). */
function gzipStored(data) {
  const parts = [Buffer.from([0x1f, 0x8b, 8, 0, 0, 0, 0, 0, 0, 0xff])];
  const MAX = 65535;
  for (let at = 0; at < data.length || at === 0; at += MAX) {
    const chunk = data.subarray(at, at + MAX);
    const last = at + MAX >= data.length;
    const head = Buffer.alloc(5);
    head[0] = last ? 1 : 0;
    head.writeUInt16LE(chunk.length, 1);
    head.writeUInt16LE(~chunk.length & 0xffff, 3);
    parts.push(head, chunk);
    if (last) break;
  }
  const tail = Buffer.alloc(8);
  tail.writeUInt32LE(crc32(data), 0);
  tail.writeUInt32LE(data.length >>> 0, 4);
  parts.push(tail);
  return Buffer.concat(parts);
}

// ── write, or check ─────────────────────────────────────────────────────────

const writes = new Map();
const want = (path, bytes) => writes.set(path, Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes));

const sums = [];
const packed = {};
for (const [name, published] of Object.entries(PACKAGES)) {
  const root = join(FIXTURES, name);
  if (!existsSync(root) || !statSync(root).isDirectory()) { fail(`fixtures/${name}/ is missing`); continue; }
  const authored = (p) => lf(readFileSync(join(root, p)));
  const desc = JSON.parse(authored("agent-descriptor.json"));
  const req = JSON.parse(authored("agent-runtime-requirements.json"));
  const manifest = {
    $schema: SCHEMA,
    name: published,
    version: desc.agent_version,
    description: desc.summary,
    license: "Apache-2.0",
    extensions: {
      "net.agentdoc.package": {
        descriptor: { path: "agent-descriptor.json", sha256: sha256(authored("agent-descriptor.json")) },
        runtime_requirements: { path: "agent-runtime-requirements.json", sha256: sha256(authored("agent-runtime-requirements.json")) },
        built: true,
        draft: true,
      },
    },
  };
  const generated = {
    "plugin.json": json(manifest),
    "net.agentdoc.package/NOT.md": notMd(desc),
    "net.agentdoc.package/RECORDS.md": recordsMd(desc),
    "net.agentdoc.package/SYSTEMS.md": systemsMd(desc, req),
  };
  for (const [p, text] of Object.entries(generated)) want(join(root, p), text);

  // The package as it will be: the authored files on disk and the generated ones above.
  const onDisk = filesUnder(root).filter((p) => !(p in generated));
  const all = [...new Set([...onDisk, ...Object.keys(generated)])].sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b)));
  const bytesOf = (p) => (p in generated ? Buffer.from(generated[p]) : authored(p));
  checkPackage(name, all, (p) => bytesOf(p).toString("utf8"), manifest);
  packed[name] = new Map(all.map((p) => [p, bytesOf(p)]));

  const archive = gzipStored(tar(all.map((p) => ({ path: `${manifest.name}/${p}`, bytes: bytesOf(p) }))));
  want(join(FIXTURES, `${name}.tar.gz`), archive);
  sums.push(`${sha256(archive)}  ${name}.tar.gz`);
}
want(join(FIXTURES, "SHA256SUMS"), sums.join("\n") + "\n");

// The harness changes one program: each changed package is the package it
// comes from with one file under skills/*/scripts/ changed, and nothing else.
for (const [from, to] of Object.entries(CHANGED)) {
  if (!packed[from] || !packed[to]) continue;
  const paths = new Set([...packed[from].keys(), ...packed[to].keys()]);
  const changed = [...paths].filter((p) => !packed[from].has(p) || !packed[to].has(p) || !packed[from].get(p).equals(packed[to].get(p)));
  if (changed.length !== 1 || !/^skills\/[^/]+\/scripts\/[^/]+$/.test(changed[0])) {
    fail(`fixtures/${to}/ must differ from fixtures/${from}/ in exactly one program; it differs in ${changed.join(", ") || "nothing"}`);
  }
}

if (problems.length) {
  for (const p of problems) console.error(`not conforming: ${p}`);
  process.exit(1);
}

let differ = 0;
for (const [path, bytes] of writes) {
  const same = existsSync(path) && readFileSync(path).equals(bytes);
  const rel = relative(HERE, path).split(sep).join("/");
  if (CHECK) {
    if (!same) { differ++; console.error(`differs from what make-fixtures.mjs writes: ${rel}`); }
  } else if (!same) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, bytes);
    console.log(`wrote ${rel}`);
  }
}
if (CHECK && differ) { console.error(`${differ} file(s) differ. Run node make-fixtures.mjs and commit the result.`); process.exit(1); }
for (const line of sums) console.log(line);
console.log(CHECK ? "The fixtures are as make-fixtures.mjs writes them." : "Done.");
