// build-spec.mjs: write the generated pages and files of agentroles.ai from
// roles/ in the Common Agent Standards repository.
//
//   node roles/site/tools/build-spec.mjs --out <folder>
//
// It writes, into the output folder:
//   spec.html                   roles/SPEC.md, the specification
//   versions.html               every version, from the change notes at the end
//                               of SPEC.md and roles/CHANGELOG.md
//   directory.html              every role and interface, read through
//                               tools/registry.mjs from SPEC.md and interfaces/
//   interfaces/index.html       the interface definitions, from interfaces/index.json
//   interfaces/*.json           roles/interfaces/, copied unchanged
//   checks/catalog-check.mjs    roles/conformance/catalog-check.mjs, copied
//                               unchanged, at the address §33 gives for it
//   SPEC.md                     roles/SPEC.md, at the address the old site served it
//
// tools/render-site.sh at the repository root copies the hand-written pages
// (index.html, the role and interface pages, 404.html, site.css and the rest)
// beside them, moves every link under the base (/draft/ or /<version>/),
// checks contrast and publishes. The generated pages are never committed and
// never edited by hand.
//
// The specification is rendered as written, with two additions that change
// no rule. A reference to a section of this specification ("§12", "§14.3")
// becomes a link to that section, except in the change notes, whose section
// numbers are those of earlier versions, and except where the reference is
// to another document ("Agent SoW §2", "its §5.10"). And each role's chapter
// and each interface's section opens with a link to its page on this site.
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { SITE, SUITE_REPO, REPO_URL, ENTRY, headLinks, rail, footer, tailScript, pill } from "./chrome.mjs";
import { FAMILIES, ROLES, INTERFACES, INTERFACE_INDEX, sections, specAnchor } from "./registry.mjs";

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const STANDARD = resolve(HERE, "..");
const REPO = resolve(STANDARD, "..");
const arg = (flag) => { const i = process.argv.indexOf(flag); return i >= 0 ? process.argv[i + 1] : undefined; };
if (!arg("--out")) throw new Error("usage: node roles/site/tools/build-spec.mjs --out <folder>");
const OUT = resolve(arg("--out"));
mkdirSync(OUT, { recursive: true });
const TAG_PREFIX = "roles-v";

const read = (rel) => readFileSync(resolve(STANDARD, rel), "utf8").replace(/\r\n/g, "\n");
const git = (...a) => execFileSync("git", ["-C", REPO, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
let commit = "";
try { git("diff", "--quiet", "HEAD", "--", "roles"); commit = git("rev-parse", "--short=8", "HEAD"); } catch { /* uncommitted or not a repository */ }

marked.setOptions({ gfm: true, breaks: false });
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const plain = (html) => html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const hl = (id) => `<a class="hl" href="#${id}" aria-label="Link to this section">#</a>`;

// Headings get stable ids: a numbered heading is s and its number ("14.3
// Primary and required interfaces" is s14-3), anything else a slug of its
// words. The h2s make the table of contents.
function anchor(html) {
  const seen = new Map();
  const toc = [];
  const out = html.replace(/<h([2-4])>([\s\S]*?)<\/h\1>/g, (m, lvl, inner) => {
    const words = plain(inner).trim();
    const num = words.match(/^(\d+(?:\.\d+)*)\.?\s/);
    let id = num ? `s${num[1].replace(/\./g, "-")}` : words.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
    const n = seen.get(id) ?? 0;
    seen.set(id, n + 1);
    if (n) id = `${id}-${n}`;
    if (lvl === "2") toc.push({ id, text: words });
    return `<h${lvl} id="${id}">${inner}${hl(id)}</h${lvl}>`;
  });
  return { html: out, toc };
}

// "§12", "§14.3" in running text (never inside a link, code or a heading)
// become links, when the section exists and the reference is to this
// specification.
function linkSections(html, ids) {
  let depth = 0;
  return html.split(/(<[^>]+>)/).map((part) => {
    if (part.startsWith("<")) {
      if (/^<(a|code|pre|h[1-6])[\s>]/.test(part)) depth++;
      else if (/^<\/(a|code|pre|h[1-6])>/.test(part)) depth--;
      return part;
    }
    if (depth > 0) return part;
    return part.replace(/(.{0,26})§(\d+(?:\.\d+)*)/g, (m, before, num) => {
      if (/(Agent SoW|Agent Mandate|Specification|specification|\bits|AgentDoc)[^§]*$/.test(before)) return m;
      const id = `s${num.replace(/\./g, "-")}`;
      return ids.has(id) ? `${before}<a href="#${id}">§${num}</a>` : m;
    });
  }).join("");
}

function page({ file, active, title, description, h1, kicker = "", metas = "", canon = "", toc = [], body, type = "article" }) {
  const tocHtml = toc.length > 2 ? `<nav class="toc" aria-label="Sections">\n            ${toc.map((t) => `<a href="#${t.id}">${esc(t.text)}</a>`).join("\n            ")}\n          </nav>` : "";
  const url = `${SITE}/${file.replace(/index\.html$/, "")}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script async src="/ga.js"></script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="Agent Roles">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE}/brand/png/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Agent Roles. Recurring jobs and recurring exchanges for agents, published as contracts.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${SITE}/brand/png/og-image.png">
  <link rel="canonical" href="${url}">
  ${headLinks}
</head>
<body>
  <div class="layout">

    ${rail(active)}

    <main class="main" id="top">

      <div class="wrap spec-hero">
        ${kicker ? `<p class="kicker">${esc(kicker)}</p>` : ""}
        <h1>${esc(h1)}</h1>
        ${metas}
        ${canon ? `<p class="canon">${canon}</p>` : ""}
        ${tocHtml}
      </div>

      <div class="wrap spec">
${body}
      </div>

      ${footer}

    </main>
  </div>
  ${tailScript}
</body>
</html>
`;
}
const write = (file, html) => { mkdirSync(dirname(resolve(OUT, file)), { recursive: true }); writeFileSync(resolve(OUT, file), html); console.log(`${file} written: ${(html.length / 1024).toFixed(0)} KB`); };
const copy = (from, to) => { mkdirSync(dirname(resolve(OUT, to)), { recursive: true }); copyFileSync(resolve(STANDARD, from), resolve(OUT, to)); console.log(`${to} copied from roles/${from}`); };
const source = (rel) => `<a href="${SUITE_REPO}/blob/main/roles/${rel}">roles/${rel}</a>`;
const stamp = (rel) => `Rendered from ${source(rel)} in the Common Agent Standards repository${commit ? `, at commit <span class="mono">${commit}</span>` : ""}.`;
const chip = (k, v) => `<span>${k} <b>${esc(v)}</b></span>`;

// ── the specification ───────────────────────────────────────────────────────
const md = read("SPEC.md");
const head = md.match(/^# (.+)\n+\*\*Version:\*\*\s*(.+)\n\*\*Status:\*\*\s*(.+)\n\*\*Date:\*\*\s*(.+)\n/);
if (!head) throw new Error("SPEC.md does not start with the title and the Version, Status and Date lines");
const [, TITLE, VERSION, STATUS, DATE] = head.map((s) => s.trim());
if (VERSION !== ENTRY.version) throw new Error(`SPEC.md carries ${VERSION} and standards.json says ${ENTRY.version}`);
const rest = md.slice(head[0].length);

// The change notes after the last rule: one italic paragraph per change,
// "*<version> (<date>): <what it changed>*".
const cut = rest.lastIndexOf("\n---\n");
const NOTES = [...rest.slice(cut).matchAll(/^\*(\d+\.\d+(?:\.\d+)?(?:-[a-z]+)?) \(([^)]*)\): ([\s\S]*?)\*\n(?=\n|(?![\s\S]))/gm)]
  .map(([, ver, when, text]) => ({ ver, when, text: text.replace(/\s*\n\s*/g, " ") }));
if (!NOTES.some((e) => e.ver === VERSION)) throw new Error(`the change notes of SPEC.md have no entry for ${VERSION}`);
const noteId = new Map();
NOTES.forEach((e) => { const base = `v${e.ver.replace(/[^a-z0-9]+/gi, "-")}`; const n = noteId.get(base) ?? 0; noteId.set(base, n + 1); e.id = n ? `${base}-${n + 1}` : base; });

{
  let { html, toc } = anchor(marked.parse(rest.slice(0, cut)));
  const ids = new Set([...html.matchAll(/ id="(s[\d-]+)"/g)].map((m) => m[1]));
  html = linkSections(html, ids);
  // Each entry's chapter or section opens with a link to its page.
  for (const e of [...ROLES, ...INTERFACES]) {
    const id = `s${e.section.replace(/\./g, "-")}`;
    const re = new RegExp(`(<h[23] id="${id}">[\\s\\S]*?</h[23]>)`);
    if (!re.test(html)) throw new Error(`spec.html has no heading ${id} for ${e.slug}`);
    html = html.replace(re, `$1\n<p class="seepage">The page for ${e.kind === "role" ? "this role" : "this interface"}: <a href="/${e.slug}.html">${esc(e.title)}</a>.</p>`);
  }
  let notes = marked.parse(rest.slice(cut));
  let i = 0;
  notes = notes.replace(/<p><em>(\d[^ ]*) \(/g, (m, v) => `<p id="${NOTES[i++]?.id ?? ""}"><em>${v} (`);
  if (i !== NOTES.length) throw new Error(`the change notes rendered ${i} paragraphs and ${NOTES.length} were read`);
  html += `\n<h2 id="change-notes">Change notes${hl("change-notes")}</h2>\n<p>The notes below close SPEC.md. Their section numbers are the numbers of the version each note describes.</p>\n${notes.replace(/^<hr>\s*/, "")}`;
  toc.push({ id: "change-notes", text: "Change notes" });
  write("spec.html", page({
    file: "spec.html", active: "spec",
    title: `${TITLE} ${VERSION}`,
    description: `The full text of the Agent Roles specification, version ${VERSION}: what a role defines, the three families, each role and interface, conformance testing and signature tags.`,
    h1: TITLE,
    metas: `<div class="metas">${chip("version", VERSION)}${chip("status", STATUS)}${chip("date", DATE)}</div>`,
    canon: `${stamp("SPEC.md")} Every version and what it changed are on <a href="/versions.html">Versions and changelog</a>.`,
    toc, body: html,
  }));
}

// ── versions and changelog ──────────────────────────────────────────────────
{
  const log = [];
  for (const block of read("CHANGELOG.md").split(/^(?=## )/m)) {
    const m = block.match(/^## (\S+) \(([^)]*)\)\n+([\s\S]*?)\s*$/);
    if (m) log.push({ ver: m[1], when: m[2], text: m[3], id: `c${m[1].replace(/[^a-z0-9]+/gi, "-")}` });
  }
  if (!log.some((e) => e.ver === VERSION)) throw new Error(`CHANGELOG.md has no entry for ${VERSION}`);
  let kept = [];
  try {
    kept = git("tag", "-l", `${TAG_PREFIX}*`).split("\n").filter(Boolean).filter((t) => {
      try { git("cat-file", "-e", `${t}:roles/site/tools/build-spec.mjs`); return true; } catch { return false; }
    }).map((t) => t.slice(TAG_PREFIX.length));
  } catch { /* not a repository */ }
  const archive = kept.length
    ? ` A tagged version is also kept at an address of its own: ${kept.map((v) => `<a href="${SITE}/${encodeURIComponent(v)}/">${esc(v)}</a>`).join(", ")}.`
    : "";
  const tagged = new Set(log.map((e) => e.ver));
  // Newest first: by version, then by the order the notes give, which puts a
  // later note of the same version first.
  const num = (v) => v.replace(/-.*/, "").split(".").map(Number);
  const cmp = (a, b) => { const x = num(a.ver), y = num(b.ver); for (let k = 0; k < 3; k++) if ((x[k] ?? 0) !== (y[k] ?? 0)) return (y[k] ?? 0) - (x[k] ?? 0); return 0; };
  const rows = NOTES.map((e, k) => ({ ...e, k })).sort((a, b) => cmp(a, b) || (b.when > a.when ? 1 : b.when < a.when ? -1 : a.k - b.k))
    .map((e) => `  <tr><td class="ver"><a href="/spec.html#${e.id}">${esc(e.ver)}</a></td><td class="ver">${esc(e.when)}</td><td>${marked.parseInline(e.text.split(/(?<=\.)\s/)[0].replace(/\.$/, ""))}</td><td>${tagged.has(e.ver) ? `<span class="mono">${TAG_PREFIX}${esc(e.ver)}</span>` : "before the move"}</td></tr>`).join("\n");
  const entries = log.map((e) => `<h3 id="${e.id}">${esc(e.ver)} (${esc(e.when)})</h3>\n${marked.parse(e.text)}`).join("\n");
  const body = `<h2 id="versions">Versions${hl("versions")}</h2>
<p>The specification is published one version at a time. This site carries version ${esc(VERSION)}, dated ${esc(DATE)}, and the specification page names it at the top.</p>
<p>The source of every version is in the <a href="${REPO_URL}">Common Agent Standards repository</a>, where each version is tagged as <span class="mono">${TAG_PREFIX}</span> followed by the version.${archive} The main branch, which can be ahead of the published version, is rendered at <a href="${SITE}/draft/">agentroles.ai/draft/</a>.</p>
<p>The table lists every note at the end of the specification, newest first, with the first sentence of each. Each link goes to the whole note. Several notes can share a version, because early versions were amended in place.</p>
<div class="tablebox"><table class="t">
  <thead><tr><th>Version</th><th>Date</th><th>What it changed</th><th>Tag</th></tr></thead>
  <tbody>
${rows}
  </tbody>
</table></div>
<p>Versions before ${esc(log[log.length - 1].ver)} were written in the repository of agentroles.ai, before the standard moved into the Common Agent Standards repository.</p>
<h2 id="changelog">Changelog${hl("changelog")}</h2>
<p>The changelog of the folder records the versions tagged in the Common Agent Standards repository. It is part of the standard's source and is reproduced here in full, newest first.</p>
${entries}`;
  write("versions.html", page({
    file: "versions.html", active: "versions",
    title: "Versions and changelog: Agent Roles",
    description: "Every version of the Agent Roles specification, with its date and what it changed.",
    h1: "Versions and changelog",
    canon: `${stamp("CHANGELOG.md")} The table is read from the change notes at the end of ${source("SPEC.md")}.`,
    body,
  }));
}

// ── the directory ───────────────────────────────────────────────────────────
{
  const row = (e, nameCol) => `  <tr><td class="name"><a href="/${e.slug}.html">${esc(e.title)}</a> ${pill(e.anchoring)}</td><td><code>${esc(nameCol)}</code></td><td>${esc(e.summary)}</td><td class="ver">${esc(e.version)}</td></tr>`;
  const table = (list, head) => `<div class="tablebox"><table class="t">
  <thead><tr><th>${head}</th><th>${head === "Role" ? "Offering name" : "Name"}</th><th>What it does</th><th>Version</th></tr></thead>
  <tbody>
${list.map((e) => row(e, e.offering)).join("\n")}
  </tbody>
</table></div>`;
  const words = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
  const count = (n) => words[n] ?? String(n);
  const aliases = ROLES.filter((r) => r.alias);
  const body = `<h2 id="roles">The roles${hl("roles")}</h2>
<p>The registry publishes ${ROLES.length} roles in ${count(FAMILIES.length)} families, grouped by what each acts on. A family is a way of reading the registry and says nothing about rank. Each role carries one of two labels: <span class="pill anchored">mesh-anchored</span> when it can do its job only on a platform that holds the records, grants or clearing it reads, and <span class="pill portable">portable</span> when it conforms anywhere. <a href="/conformance.html">How conformance is checked</a> says more about the labels.</p>
<p>${aliases.map((r, i) => `${i ? r.name : r.title} was published as ${r.alias.replace(/^role-/, "the ").replace(/-/g, " ")}`).join(", and ")}. Both old offering names stay reserved as aliases, so an agent that offers either name still holds the role.</p>
<div class="dir">
${FAMILIES.map((f) => `<h3 id="${f.name.toLowerCase().replace(/ /g, "-")}">${esc(f.name)}: ${esc(f.actsOn)}${hl(f.name.toLowerCase().replace(/ /g, "-"))}</h3>\n${table(f.roles, "Role")}`).join("\n")}
</div>
<p>A role is added when a job recurs often enough to deserve a contract: an artifact in, an artifact out, and a check the holder does not control. <a href="/spec.html#s3-2">Section 3.2 of the specification</a> states the rule.</p>
<h2 id="interfaces">The interfaces${hl("interfaces")}</h2>
<p>The registry publishes ${count(INTERFACES.length)} interfaces. The worker and the manager face each other, because an interface with only one side published is half a contract. The entryway runs before any relationship exists. The deployer, the builder and the evaluator are the primary interfaces of the deployment manager, the package maker and the conformance checker. Revisable work lets a delivered job be changed without being redone. The lifecycle lets an agent's owner or the operator of its mesh pause, resume or stop it.</p>
${table(INTERFACES, "Interface")}
<p>The package maker, the deployment manager and the conformance checker form a loop. The package maker turns a description into a package, the deployment manager stands that package up as a running agent, and the conformance checker checks that what is running does the job the package describes. The process runner is the first role whose job spans several agents.</p>
<p>Software reads the interfaces from their <a href="/interfaces/">definition files</a>.</p>`;
  write("directory.html", page({
    file: "directory.html", active: "directory",
    title: "Every role and interface: Agent Roles",
    description: `Every role and interface in the Agent Roles registry, with what each one does, its name, its anchoring and its version: ${ROLES.length} roles in ${FAMILIES.length} families, and ${INTERFACES.length} interfaces.`,
    h1: "Every role and interface",
    canon: `This page is built from ${source("SPEC.md")} and ${source("interfaces/index.json")}, so it lists what the specification publishes.`,
    toc: [], body,
  }));
}

// ── the interface definitions ───────────────────────────────────────────────
{
  for (const f of readdirSync(resolve(STANDARD, "interfaces")).filter((f) => f.endsWith(".json"))) copy(`interfaces/${f}`, `interfaces/${f}`);
  const rows = INTERFACES.map((x) => `  <tr><td><code>${esc(x.name)}</code></td><td>${esc(x.version)}</td><td><a href="/${x.file}">${esc(x.file.replace("interfaces/", ""))}</a></td><td><a href="/${x.slug}.html">${esc(x.title.replace(/^The/, "the"))}</a></td></tr>`).join("\n");
  const body = `<p>Each interface has a JSON file that lists its exchanges, copied from the specification. Programs read the JSON files, and people read the pages. If a file and the specification ever disagree, the specification is right.</p>
<div class="tablebox"><table class="t">
  <thead><tr><th>Interface</th><th>Version</th><th>For a program</th><th>For a person</th></tr></thead>
  <tbody>
${rows}
  </tbody>
</table></div>
<p>The whole set is one file, <a href="/interfaces/index.json">index.json</a>. A definition changes only by replacement, and a consumer that fetched one cites it by its digest.</p>`;
  write("interfaces/index.html", page({
    file: "interfaces/index.html", active: "interfaces/index",
    title: "Interface definitions: Agent Roles",
    description: "The machine-readable definition of each Agent Roles interface: the exchanges an implementer answers and what each answer carries.",
    h1: "Interface definitions",
    canon: `The files are ${source("interfaces/")}, copied unchanged.`,
    body,
  }));
}

// ── the conformance check and the Markdown ──────────────────────────────────
copy("conformance/catalog-check.mjs", "checks/catalog-check.mjs");
copy("SPEC.md", "SPEC.md");

// ── the home page's version line ────────────────────────────────────────────
{
  const p = resolve(OUT, "index.html");
  if (existsSync(p)) {
    const s = readFileSync(p, "utf8");
    const re = /(<!-- spec:version -->)[\s\S]*?(<!-- \/spec:version -->)/;
    if (!re.test(s)) throw new Error("index.html: no spec:version markers");
    writeFileSync(p, s.replace(re, () => `<!-- spec:version -->The specification is at version ${esc(VERSION)}, dated ${esc(DATE)}.<!-- /spec:version -->`));
    console.log("index.html: spec:version filled");
  }
}

console.log(`${TITLE} ${VERSION} (${DATE})${commit ? `, commit ${commit}` : ", no commit stamp"}; written to ${OUT}`);
