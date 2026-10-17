// build-spec.mjs: render the site of the Common Agent Specification from this
// repository: SPEC.md, the normative text, and CHANGELOG.md, every version.
//
//   node site/tools/build-spec.mjs [--out <folder>] [--base /<path>/] [--ref <branch or tag>]
//                                  [--draft] [--expect-version <version>]
//                                  [--spec <file>] [--changelog <file>]
//
// It copies the hand-written pages (index.html, conformance.html, 404.html,
// site.css, favicon.svg, brand/) into the output folder (default site/dist)
// and writes beside them:
//   spec.html         the whole specification
//   descriptor.html   Section 6, the Agent Descriptor, as a page of its own
//   package.html      Section 12, the Agent Package, as a page of its own
//   versions.html     every version and the changelog
// and fills two marked regions of the copied pages: the version line on
// index.html and the text of Section 14 on conformance.html. Nothing in the
// repository is rewritten, so a build leaves the working tree clean.
//
// --base puts the site under a path: the main branch is rendered at /draft/ and
// each tag at /<version>/, while the root carries the version most recently
// tagged. Every link that starts with "/" is moved under the base, and so is
// the canonical address. --draft marks every page noindex and says on it that
// the published version is at the root. --expect-version refuses to build when
// SPEC.md carries another version (a tag v0.26.0-draft must hold 0.26.0-draft).
//
// ANCHORS. Links into the specification were made against the pages this site
// replaces (dev.agentmesh.ai/common-agent.html, agentdoc.net/descriptor-spec.html
// and agentdoc.net/package-spec.html), and the redirects from those addresses
// keep the fragment. So every id those pages carried is emitted here too:
// s1 to s15, appendix-a and changelog on the full text; s5-job-manifest and
// s12-terms to s12-conformance as aliases there; the standalone names (kinds,
// rules, layout, install-file and the rest) on the chapter pages. An id that
// stops being emitted is a link somebody holds that stops working.
import { readFileSync, writeFileSync, cpSync, mkdirSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { SITE, REPO_URL, headLinks, rail, footer, tailScript } from "./chrome.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REPO = resolve(ROOT, "..");
const arg = (flag) => { const i = process.argv.indexOf(flag); return i >= 0 ? process.argv[i + 1] : undefined; };
const MD = resolve(arg("--spec") ?? resolve(REPO, "SPEC.md"));
const CHANGES = resolve(arg("--changelog") ?? resolve(REPO, "CHANGELOG.md"));
const OUT = resolve(arg("--out") ?? resolve(ROOT, "dist"));
const BASE = `/${(arg("--base") ?? "/").replace(/^\/+|\/+$/g, "")}/`.replace(/^\/\/$/, "/");
const REF = arg("--ref") ?? "";
const DRAFT = process.argv.includes("--draft");
const STATIC = ["index.html", "conformance.html", "404.html", "site.css", "favicon.svg", "brand"];

let md = readFileSync(MD, "utf8").replace(/\r\n/g, "\n");

// The commit stamp is only true when the page is rendered from a checkout
// whose SPEC.md and CHANGELOG.md are committed.
const git = (...a) => execFileSync("git", ["-C", REPO, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
let commit = "";
if (!arg("--spec") && !arg("--changelog")) {
  try {
    git("diff", "--quiet", "HEAD", "--", "SPEC.md", "CHANGELOG.md");
    commit = git("rev-parse", "--short=8", "HEAD");
  } catch { /* uncommitted or not a repository: no stamp */ }
}
// The versions that have a tag, and so a copy of the site at /<version>/.
let tagged = [];
try { tagged = git("tag", "-l", "v*").split("\n").filter(Boolean).map((t) => t.slice(1)); } catch { /* not a repository */ }

// ── the header block ────────────────────────────────────────────────────────
const head = md.match(/^# (.+)\n+\*\*Version:\*\*\s*(.+)\n\*\*Status:\*\*\s*(.+)\n/);
if (!head) throw new Error(`${MD} does not start with the title, Version and Status lines`);
const TITLE = head[1].trim();
const VERSION = head[2].trim();
if (arg("--expect-version") && arg("--expect-version") !== VERSION) {
  throw new Error(`SPEC.md carries version ${VERSION}, and this build expects ${arg("--expect-version")}`);
}
// The status chip, as on agentmessaging.ai: the Status line's words up to the first comma.
const STATUS = head[3].split(/[,.]/)[0].trim();
md = md.slice(head[0].length);

// ── sections ────────────────────────────────────────────────────────────────
const parts = md.split(/^(?=## )/m);
const preamble = parts.shift();
const sections = parts.map((s) => {
  const title = s.match(/^## (.+)/)[1].trim();
  return { title, id: h2Id(title), md: s };
});
const section = (id) => {
  const s = sections.find((x) => x.id === id);
  if (!s) throw new Error(`no section ${id} in ${MD}`);
  return s;
};

function h2Id(title) {
  const n = title.match(/^(\d+)\./);
  if (n) return `s${n[1]}`;
  if (/^Appendix A/i.test(title)) return "appendix-a";
  if (/^Changelog/i.test(title)) return "changelog";
  return slug(title);
}
function slug(t) {
  return t.toLowerCase().replace(/&amp;/g, "and").replace(/<[^>]+>/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── the changelog ───────────────────────────────────────────────────────────
// CHANGELOG.md holds one "## <version> (<when>)" heading per entry, newest
// first, each followed by the entry's text.
const log = [];
{
  const seen = new Map();
  for (const block of readFileSync(CHANGES, "utf8").replace(/\r\n/g, "\n").split(/^(?=## )/m)) {
    const m = block.match(/^## (\S+) \(([^)]*)\)\n+([\s\S]*?)\s*$/);
    if (!m) continue;
    const [, ver, when] = m;
    const text = m[3].replace(/\s*\n\s*/g, " ");
    const n = (seen.get(ver) ?? 0) + 1;
    seen.set(ver, n);
    const date = (when.match(/\d{4}-\d{2}-\d{2}/) ?? [""])[0];
    const headline = text.split(/\.\s/)[0].replace(/\.$/, "");
    log.push({ ver, when, date, text, headline, id: `v${ver.replace(/[^a-z0-9]+/gi, "-")}${n > 1 ? `-${n}` : ""}` });
  }
}
if (!log.length) throw new Error(`${CHANGES} has no entries`);
const current = log.find((e) => e.ver === VERSION);
if (!current) throw new Error(`the changelog has no entry for ${VERSION}`);
const DATE = current.date;

// ── rendering ───────────────────────────────────────────────────────────────
marked.setOptions({ gfm: true, breaks: false });
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const text = (html) => html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

/**
 * Render markdown and anchor its headings the way agentmessaging.ai's
 * tools/build-spec.mjs does: the id is the heading's own slug ("## 4. The
 * floor" is #4-the-floor, "### 4.3 The five questions" is
 * #4-3-the-five-questions), so the two specifications' anchors read alike.
 * The ids the replaced pages carried are kept as aliases beside each
 * heading: s<number> for every numbered heading, appendix-a and changelog,
 * and whatever `ids(level, number, title)` returns as { aliases }.
 */
function amSlug(inner) {
  return inner.replace(/<[^>]+>/g, "").toLowerCase()
    .replace(/&amp;/g, "and").replace(/[^\w\s.§-]/g, "")
    .replace(/\./g, "-").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
function render(src, ids = () => null) {
  let html = marked.parse(src);
  const slugCount = new Map();
  const toc = [];
  html = html.replace(/<h([2-4])>([\s\S]*?)<\/h\1>/g, (m, lvl, inner) => {
    const title = text(inner);
    const num = (title.match(/^(\d+(?:\.\d+)*)\.?\s/) ?? [])[1];
    const given = ids(+lvl, num, title);
    let id = amSlug(inner);
    const n = slugCount.get(id) ?? 0;
    slugCount.set(id, n + 1);
    if (n) id = `${id}-${n}`;
    const legacy = lvl === "2" ? h2Id(title) : num ? `s${num.replace(/\./g, "-")}` : null;
    const aliases = [...new Set([legacy, ...(given?.aliases ?? [])])].filter((a) => a && a !== id);
    toc.push({ lvl: +lvl, id, title: inner });
    return `${aliases.map((a) => `<span class="alias" id="${a}"></span>`).join("")}<h${lvl} id="${id}">${inner}<a class="hl" href="#${id}">#</a></h${lvl}>`;
  });
  return { html, toc };
}

// Links the rendering adds where the specification names an outside standard
// or role without linking it. A find that stops matching is reported, so a
// change of wording does not quietly lose a link.
const LINKS = [
  ["a portable format of its own, the Agent Plugin,", 'a portable format of its own, the <a href="https://agent-plugins.org">Agent Plugin</a>,'],
  ["and Agent Skills defines a skill folder", 'and <a href="https://agentskills.io">Agent Skills</a> defines a skill folder'],
  ["an agent holding the deployment manager role of the roles registry", 'an agent holding the <a href="https://agentroles.ai/deployment-manager.html">deployment manager</a> role of the roles registry'],
];
function addLinks(html, page) {
  for (const [find, replace] of LINKS) {
    const n = html.split(find).length - 1;
    if (n !== 1) { console.warn(`${page}: link not added (${n} matches): ${find}`); continue; }
    html = html.replace(find, replace);
  }
  return html;
}

const GENERATED = new Date().toISOString().slice(0, 10);
const refText = !REF ? "" : /^v\d/.test(REF) ? `, tag <span class="mono">${esc(REF)}</span>` : `, branch <span class="mono">${esc(REF)}</span>`;
const stamp = `Rendered ${GENERATED} from <span class="mono">SPEC.md</span> in the <a href="${REPO_URL}">specification's repository</a>${refText}${commit ? `, commit <span class="mono">${commit}</span>` : ""}.`
  + (DRAFT ? ` This copy follows the main branch, which can be ahead of the published version at <a href="${SITE}/">commonagent.net</a>.` : "");
const metas = `<div class="metas">
          <span>version <b>${esc(VERSION)}</b></span>
          <span>status <b>${esc(STATUS)}</b></span>
          <span>date <b>${DATE}</b></span>
        </div>`;

function page({ file, active, title, description, ogTitle, eyebrow, h1, sub, extraHero = "", toc, body }) {
  const url = file === "index.html" ? `${SITE}/` : `${SITE}/${file}`;
  const tocHtml = toc && toc.length
    ? `<nav class="toc" aria-label="Sections">\n            ${toc.map((t) => `<a href="#${t.id}">${t.title}</a>`).join("\n            ")}\n        </nav>`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="The Common Agent Specification">
  <meta property="og:title" content="${esc(ogTitle ?? title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE}/brand/png/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="The Common Agent Specification. The definition of the agent as a testable claim">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${SITE}/brand/png/og-image.png">
  <link rel="canonical" href="${url}">
  ${headLinks}
</head>
<body>
  <div class="layout">

    ${rail(active)}

    <main class="main">

      <div class="wrap spec-hero">
        <span class="eyebrow">${eyebrow}</span>
        <h1>${h1}</h1>
        ${sub ? `<p class="sub">${sub}</p>` : ""}
        ${metas}
        ${extraHero}
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

mkdirSync(OUT, { recursive: true });
for (const f of STATIC) cpSync(resolve(ROOT, f), resolve(OUT, f), { recursive: true });
const write = (file, html) => { writeFileSync(resolve(OUT, file), html); console.log(`${file}: ${(html.length / 1024).toFixed(0)} KB`); };

// ── spec.html: the whole text ───────────────────────────────────────────────
{
  const SPEC_ALIASES = {
    "5.7": ["s5-job-manifest"],
    "12.1": ["s12-terms"], "12.2": ["s12-layout"], "12.3": ["s12-descriptor"], "12.4": ["s12-install-file"],
    "12.5": ["s12-skills"], "12.6": ["s12-rules"], "12.7": ["s12-lifecycle"], "12.8": ["s12-provenance"],
    "12.9": ["s12-out"], "12.10": ["s12-conformance"],
  };
  const { html: pre } = render(preamble);
  // The changelog is on versions.html; the full text keeps a short pointer
  // under its heading so #changelog still lands somewhere useful.
  const bodySections = sections.map((s) => s.id === "changelog"
    ? `## Changelog\n\nEvery version and what it changed is on [Versions and changelog](/versions.html).\n`
    : s.md).join("\n");
  let { html, toc } = render(bodySections, (lvl, num) => (num && SPEC_ALIASES[num] && lvl === 3 ? { aliases: SPEC_ALIASES[num] } : null));
  const NOTES = {
    s6: 'This chapter also has a page of its own: <a href="/descriptor.html">The Agent Descriptor</a>.',
    s9: 'The AgentDoc has a site of its own, with its tools and examples, at <a href="https://agentdoc.net/">agentdoc.net</a>.',
    s12: 'This chapter also has a page of its own: <a href="/package.html">The Agent Package</a>.',
  };
  for (const [id, note] of Object.entries(NOTES)) {
    const re = new RegExp(`(<span class="alias" id="${id}"></span><h2 [\\s\\S]*?</h2>)`);
    if (!re.test(html)) throw new Error(`spec.html: no heading ${id}`);
    html = html.replace(re, `$1\n<p class="chapnote">${note}</p>`);
  }
  html = addLinks(pre + html, "spec.html");
  write("spec.html", page({
    file: "spec.html", active: "spec",
    title: `${TITLE} ${VERSION}`,
    ogTitle: TITLE,
    description: "The full text of the Common Agent Specification: the floor every agent meets, the work it does, the Agent Descriptor, the capabilities, the signed records others issue, the AgentDoc, the twenty-one attributes, the Agent Package and the agent repository.",
    eyebrow: "The specification",
    h1: esc(TITLE),
    sub: "The definition of the agent as a testable claim. Every clause can be checked by a program or a signature.",
    extraHero: `<p class="canon">${stamp}${DRAFT ? "" : " This page is the normative text."}</p>`,
    toc: toc.filter((t) => t.lvl === 2),
    body: html,
  }));
}

// ── the chapter pages ───────────────────────────────────────────────────────
function chapter({ file, active, id, num, name, sub, description, ids, introAliases = [], extra = "", tail = "", links = false }) {
  const s = section(id);
  const intro = introAliases.map((a) => `<span class="alias" id="${a}"></span>`).join("");
  let { html, toc } = render(s.md.replace(/^## .+\n/, ""), ids);
  html = extra ? extra(html) : html;
  html = links ? addLinks(intro + html, file) : intro + html;
  write(file, page({
    file, active,
    title: `${name}: Section ${num} of the Common Agent Specification`,
    description,
    eyebrow: `Section ${num} of the specification`,
    h1: name,
    sub,
    extraHero: `<p class="canon">This page renders Section ${num} of the <a href="/spec.html#s${num}">Common Agent Specification</a> ${esc(VERSION)}. Where the two differ, the full specification governs. Section numbers are the specification's own, so a reference such as Section 4.1 is in the <a href="/spec.html">full text</a>. ${stamp}</p>`,
    toc: toc.filter((t) => t.lvl === 3),
    body: html + tail,
  }));
}

// Section 6. The standalone Descriptor page numbered these 3 to 9; its ids are
// kept as the ids here, with the specification's numbering as aliases.
const DESCRIPTOR_IDS = { "6.1": "primary", "6.2": "document", "6.3": "kinds", "6.4": "rules", "6.5": "versioning",
  "6.6": "signature", "6.7": "serving", "6.8": "consumers", "6.9": "declaration-set", "6.10": "doctrine" };
chapter({
  file: "descriptor.html", active: "descriptor", id: "s6", num: 6, name: "The Agent Descriptor",
  sub: "The operator's standing description of one agent, and the primary location for its metadata.",
  description: "The Agent Descriptor, Section 6 of the Common Agent Specification: the members, the kind vocabulary, the four rules, versioning and the digest, the signature, serving and discovery, and the projections that consume it.",
  ids: (lvl, num) => (lvl === 3 && DESCRIPTOR_IDS[num] ? { aliases: [DESCRIPTOR_IDS[num]] } : null),
  introAliases: ["motivation", "terms"],
  // The standalone page's Conformance section is the specification's
  // "Checking a Descriptor" paragraph.
  extra: (html) => {
    const at = "<p><strong>Checking a Descriptor</strong>";
    if (!html.includes(at)) { console.warn("descriptor.html: no 'Checking a Descriptor' paragraph for #conformance"); return html; }
    return html.replace(at, `<span class="alias" id="conformance"></span>${at}`);
  },
  tail: `\n<p class="chapnote">The AgentDoc is assembled from an agent's Descriptor and the records others sign about it. It is Section 9 of the <a href="/spec.html#s9">specification</a> and has a site of its own at <a href="https://agentdoc.net/">agentdoc.net</a>.</p>`,
});

// Section 12. The standalone package page used these ids for 1 to 10.
const PACKAGE_IDS = { "12.1": "terms", "12.2": "layout", "12.3": "descriptor", "12.4": "install-file", "12.5": "skills",
  "12.6": "rules", "12.7": "lifecycle", "12.8": "provenance", "12.9": "out", "12.10": "conformance" };
chapter({
  file: "package.html", active: "package", id: "s12", num: 12, name: "The Agent Package", links: true,
  sub: "How an agent travels from a description to a running agent with an identity: what a package contains, how it is published to a depot and installed from one, and how a verifier checks that the agent answering is the package that was built.",
  description: "The Agent Package, Section 12 of the Common Agent Specification: the layout, the draft Descriptor, the install file, skills, the rules, publish and install, provenance, and conformance.",
  ids: (lvl, num) => (lvl === 3 && PACKAGE_IDS[num] ? { aliases: [PACKAGE_IDS[num]] } : null),
  tail: `\n<p class="chapnote">Where an agent is kept before it is packaged, and how somebody comes to run a copy of their own, is Section 13 of the <a href="/spec.html#s13">specification</a>, the agent repository.</p>`,
});

// ── versions.html ───────────────────────────────────────────────────────────
{
  const kept = log.filter((e, i) => tagged.includes(e.ver) && log.findIndex((x) => x.ver === e.ver) === i);
  const archive = (kept.length ? ` A tagged version is also kept at an address of its own: ${kept.map((e) => `<a href="${SITE}/${encodeURIComponent(e.ver)}/">${esc(e.ver)}</a>`).join(", ")}.` : "")
    + ` The main branch, which can be ahead of the published version, is rendered at <a href="${SITE}/draft/">commonagent.net/draft/</a>.`;
  const rows = log.map((e) => `  <tr><td><a href="#${e.id}">${esc(e.ver)}</a></td><td>${e.date}</td><td>${marked.parseInline(e.headline)}</td></tr>`).join("\n");
  const entries = log.map((e) => `  <li id="${e.id}"><span class="ver">${esc(e.ver)} (${esc(e.when)})</span>${marked.parseInline(e.text)}</li>`).join("\n");
  const body = `<h2 id="versions">Versions<a class="hl" href="#versions" aria-label="Link to this section">#</a></h2>
<p>The specification is published one version at a time. This site carries ${esc(VERSION)}, dated ${DATE}, and every page of the specification names that version at the top. The table lists each version with the date in its changelog entry and the first words of that entry.</p>
<p>The source of every version is in the <a href="${REPO_URL}">specification's repository</a>, where each version from 0.26.0-draft on is tagged as <span class="mono">v</span> followed by the version.${archive}</p>
<table class="versions">
  <tr><th>Version</th><th>Date</th><th>What it changed</th></tr>
${rows}
</table>
<h2 id="changelog">Changelog<a class="hl" href="#changelog" aria-label="Link to this section">#</a></h2>
<p>The changelog is part of the specification's source and is reproduced here in full, newest first.</p>
<ol class="log">
${entries}
</ol>`;
  write("versions.html", page({
    file: "versions.html", active: "versions",
    title: "Versions and changelog: the Common Agent Specification",
    description: "Every version of the Common Agent Specification, with its date and what it changed.",
    eyebrow: "Versions and changelog",
    h1: "Versions and changelog",
    sub: "Each version of the Common Agent Specification, the date it carries, and what it changed.",
    extraHero: `<p class="canon">${stamp}</p>`,
    body,
  }));
}

// ── the marked regions of the hand-written pages ────────────────────────────
function fill(file, name, html) {
  const p = resolve(OUT, file);
  const s = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
  const re = new RegExp(`(<!-- spec:${name} -->)[\\s\\S]*?(<!-- /spec:${name} -->)`);
  if (!re.test(s)) throw new Error(`${file}: no spec:${name} markers`);
  writeFileSync(p, s.replace(re, () => `<!-- spec:${name} -->${html}<!-- /spec:${name} -->`));
  console.log(`${file}: spec:${name} filled`);
}
fill("index.html", "version", DRAFT
  ? `This copy follows the main branch of the <a href="${REPO_URL}">specification's repository</a>, at version <a href="/versions.html">${esc(VERSION)}</a>. The published version is at <a href="${SITE}/">commonagent.net</a>.`
  : `The version on this site is <a href="/versions.html">${esc(VERSION)}</a>, dated ${DATE}.`);
{
  const s14 = section("s14").md.replace(/^## .+\n/, "");
  fill("conformance.html", "s14", `\n${marked.parse(s14)}`);
}
// ── the base path and the draft mark ────────────────────────────────────────
// Links that start with "/" (and not "//") move under the base, and so do the
// canonical address and og:url. Absolute links to the site, such as the one to
// the published version, are left alone.
for (const f of readdirSync(OUT).filter((f) => f.endsWith(".html"))) {
  const p = join(OUT, f);
  let s = readFileSync(p, "utf8");
  if (BASE !== "/") {
    s = s.replace(/(\s(?:href|src)=")\/(?!\/)/g, `$1${BASE}`)
      .replace(/(<link rel="canonical" href="|<meta property="og:url" content=")https:\/\/commonagent\.net\//g, `$1${SITE}${BASE}`);
  }
  if (DRAFT && !/<meta name="robots"/.test(s)) {
    s = s.replace(/(<meta name="viewport"[^>]*>)/, `$1\n  <meta name="robots" content="noindex">`);
  }
  writeFileSync(p, s);
}
console.log(`${TITLE} ${VERSION} (${DATE})${REF ? `, ${REF}` : ""}${commit ? `, commit ${commit}` : ", no commit stamp"}; ${sections.length} sections, ${log.length} changelog entries; written to ${OUT} for ${BASE}`);
