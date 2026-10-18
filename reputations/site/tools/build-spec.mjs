// build-spec.mjs: write the generated pages of agentreputations.com from the
// Markdown in reputations/ of the Common Agent Standards repository.
//
//   node reputations/site/tools/build-spec.mjs --out <folder>
//
// It writes, into the output folder:
//   spec.html                 reputations/SPEC.md, the specification
//   spec-a2a-reputation.html  reputations/SPEC-A2A-REPUTATION.md, the A2A Reputation extension
//   versions.html             reputations/CHANGELOG.md, every version and the changelog
//
// tools/render-site.sh at the repository root copies the hand-written pages
// (index.html, why.html, evidence.html, scores.html, trust.html,
// developers.html, 404.html, site.css and the rest) beside them, moves every
// link under the base (/draft/ or /<version>/), checks contrast and
// publishes. The pages are never committed and never edited by hand: the
// Markdown is the source, and this builder is the only thing that turns it
// into pages.
//
// The text is rendered as written, with one exception that changes no rule.
// The bold lines under each document's title (Version, Date, Status and, in
// SPEC.md, Canonical source and Family) are its header: the version, the
// status and the date are shown as chips at the top of the page, the status
// up to its first semicolon, and the page says which file in this repository
// it was rendered from in place of the canonical-source and family lines.
// A relative link to another Markdown file of the standard goes to that
// file's page on this site, or to the file on GitHub when it has no page here.
// The sections of both documents keep, beside their numbered ids (s4,
// s4-4), the ids the hand-copied pages of the old site gave them
// (#4-evidence-and-the-ledger and the rest), so links made to the old pages
// still land.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { SITE, SUITE_REPO, REPO_URL, ENTRY, headLinks, rail, footer, tailScript } from "./chrome.mjs";

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const STANDARD = resolve(HERE, "..");
const REPO = resolve(STANDARD, "..");
const arg = (flag) => { const i = process.argv.indexOf(flag); return i >= 0 ? process.argv[i + 1] : undefined; };
if (!arg("--out")) throw new Error("usage: node reputations/site/tools/build-spec.mjs --out <folder>");
const OUT = resolve(arg("--out"));
mkdirSync(OUT, { recursive: true });
const TAG_PREFIX = "reputations-v";

const read = (rel) => readFileSync(resolve(STANDARD, rel), "utf8").replace(/\r\n/g, "\n");
const git = (...a) => execFileSync("git", ["-C", REPO, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
// The commit stamp is only true when the Markdown is committed as it stands.
let commit = "";
try { git("diff", "--quiet", "HEAD", "--", "reputations"); commit = git("rev-parse", "--short=8", "HEAD"); } catch { /* uncommitted or not a repository */ }

// ── links ───────────────────────────────────────────────────────────────────
// The Markdown files of the standard that have a page on this site.
const PAGE_OF = {
  "SPEC.md": "/spec.html",
  "SPEC-A2A-REPUTATION.md": "/spec-a2a-reputation.html",
  "CHANGELOG.md": "/versions.html#changelog",
  "README.md": "/",
};
function relink(html, source) {
  return html.replace(/href="([^"]+)"/g, (m, href) => {
    if (/^https:\/\/agentreputations\.com\/?$/.test(href)) return `href="/"`;
    if (/^([a-z]+:|#|\/)/i.test(href)) return m;
    const [path, frag] = href.split("#");
    const target = posix.normalize(posix.join(posix.dirname(source), path));
    if (PAGE_OF[target]) return `href="${PAGE_OF[target]}${frag && !PAGE_OF[target].includes("#") ? `#${frag}` : ""}"`;
    if (target.startsWith("../")) return `href="${SUITE_REPO}/blob/main/${target.slice(3)}${frag ? `#${frag}` : ""}"`;
    return `href="${SUITE_REPO}/blob/main/reputations/${target}${frag ? `#${frag}` : ""}"`;
  });
}

// ── rendering ───────────────────────────────────────────────────────────────
marked.setOptions({ gfm: true, breaks: false });
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const plain = (html) => html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

// The ids the old hand-copied spec.html and spec-a2a-reputation.html gave
// the sections. A2A's Changelog heading kept the id it had.
const OLD_SPEC_IDS = { s1: "1-terminology", s2: "2-layering", s3: "3-enrollment", "s3-1": "3-1-states", "s3-2": "3-2-enrolling", "s3-3": "3-3-withdrawing",
  s4: "4-evidence-and-the-ledger", "s4-1": "4-1-the-ledger", "s4-2": "4-2-facts", "s4-3": "4-3-probes", "s4-4": "4-4-engagements-as-an-evidence-source", "s4-5": "4-5-attribution",
  s5: "5-outcomes", s6: "6-attestations", "s6-1": "6-1-form", "s6-2": "6-2-eligibility", "s6-3": "6-3-conflicts", "s6-4": "6-4-exclusions", "s6-5": "6-5-evaluators-are-subjects-too", "s6-6": "6-6-value-judgments",
  s7: "7-scoring", "s7-1": "7-1-the-pool", "s7-2": "7-2-decay", "s7-3": "7-3-the-posterior", "s7-4": "7-4-unproven", "s7-5": "7-5-priors-from-the-portfolio", "s7-6": "7-6-the-weight-of-a-value-judgment",
  s8: "8-reports", "s8-1": "8-1-the-report", "s8-2": "8-2-mandatory-context", "s8-3": "8-3-facts-only-reports", "s8-4": "8-4-verification-levels",
  s9: "9-promises", s10: "10-bureau-obligations", s11: "11-trust-model", s12: "12-security-considerations", "s12-1": "12-1-attacks-and-where-they-break", "s12-2": "12-2-what-this-spec-refuses-to-do",
  s13: "13-out-of-scope", s14: "14-reference-implementation" };
const OLD_A2A_IDS = { s1: "1-terminology", s2: "2-extension-uri", s3: "3-the-declaration", s4: "4-why-no-report", s5: "5-verification",
  s6: "6-reading-the-report", s7: "7-honesty-rules", s8: "8-security-considerations", s9: "9-out-of-scope", s10: "10-relationship" };
// Headings get stable ids: a numbered heading is s and its number ("4.4.
// Engagements as an evidence source" is s4-4), anything else a slug of its
// words. The h2s make the table of contents.
function anchor(html, old = {}) {
  const seen = new Map();
  const toc = [];
  const out = html.replace(/<h([2-4])>([\s\S]*?)<\/h\1>/g, (m, lvl, inner) => {
    const words = plain(inner).trim();
    const num = words.match(/^(\d+(?:\.\d+[a-z]?)*)\.?\s/);
    let id = num ? `s${num[1].replace(/\./g, "-")}`
      : words.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
    const n = seen.get(id) ?? 0;
    seen.set(id, n + 1);
    if (n) id = `${id}-${n}`;
    if (lvl === "2") toc.push({ id, text: words });
    const alias = old[id] ? `<span class="alias" id="${old[id]}"></span>` : "";
    return `${alias}<h${lvl} id="${id}">${inner}<a class="hl" href="#${id}" aria-label="Link to this section">#</a></h${lvl}>`;
  });
  return { html: out, toc };
}

const OG_ALT = "Agent Reputations. An open standard for recording how agents' work went, scoring that record by a published formula, and serving it as a signed report anyone can check.";
function page({ file, active, title, description, h1, metas = "", canon = "", toc = [], body, type = "article" }) {
  const tocHtml = toc.length > 2 ? `<nav class="toc" aria-label="Sections">\n            ${toc.map((t) => `<a href="#${t.id}">${esc(t.text)}</a>`).join("\n            ")}\n          </nav>` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script async src="/ga.js"></script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="Agent Reputations">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${SITE}/${file}">
  <meta property="og:image" content="${SITE}/brand/png/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(OG_ALT)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${SITE}/brand/png/og-image.png">
  <link rel="canonical" href="${SITE}/${file}">
  ${headLinks}
</head>
<body>
  <div class="layout">

    ${rail(active)}

    <main class="main" id="top">

      <div class="wrap spec-hero">
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
const write = (file, html) => { writeFileSync(resolve(OUT, file), html); console.log(`${file} written: ${(html.length / 1024).toFixed(0)} KB`); };
const source = (rel) => `<a href="${SUITE_REPO}/blob/main/reputations/${rel}">reputations/${rel}</a>`;
const stamp = (rel) => `Rendered from ${source(rel)} in the Common Agent Standards repository${commit ? `, at commit <span class="mono">${commit}</span>` : ""}.`;
const chip = (k, v) => `<span>${k} <b>${esc(v)}</b></span>`;

// A document starts with "# Title" and a block of "**Key:** value" lines.
function header(rel) {
  const md = read(rel);
  const m = md.match(/^# (.+)\n+((?:\*\*[^*\n]+:\*\*[^\n]*\n)+)/);
  if (!m) throw new Error(`${rel} does not start with the title and its bold header lines`);
  const fields = Object.fromEntries([...m[2].matchAll(/^\*\*([^*:]+):\*\*\s*(.*)$/gm)].map(([, k, v]) => [k.trim().toLowerCase(), v.trim()]));
  for (const k of ["version", "status", "date"]) if (!fields[k]) throw new Error(`${rel} has no ${k} line`);
  return { title: m[1].trim(), fields, rest: md.slice(m[0].length) };
}
const metasOf = (f) => `<div class="metas">${chip("version", f.version)}${chip("status", f.status.split(";")[0].trim())}${chip("date", f.date)}</div>`;

// ── the specification ───────────────────────────────────────────────────────
const SPEC = header("SPEC.md");
const VERSION = SPEC.fields.version, DATE = SPEC.fields.date;
if (VERSION !== ENTRY.version) throw new Error(`SPEC.md carries ${VERSION} and standards.json says ${ENTRY.version}`);
{
  const { html, toc } = anchor(relink(marked.parse(SPEC.rest), "SPEC.md"), OLD_SPEC_IDS);
  write("spec.html", page({
    file: "spec.html", active: "spec",
    title: `${SPEC.title} ${VERSION}`,
    description: `The full text of the Agent Reputations specification, version ${VERSION}: enrollment, evidence and the ledger, outcomes, attestations, scoring, reports, promises, the obligations of a bureau and its trust model.`,
    h1: SPEC.title,
    metas: metasOf(SPEC.fields),
    canon: `${stamp("SPEC.md")} Every version and what it changed are on <a href="/versions.html">Versions and changelog</a>.`,
    toc, body: html,
  }));
}

// ── the A2A Reputation extension ────────────────────────────────────────────
{
  const rel = "SPEC-A2A-REPUTATION.md";
  const A2A = header(rel);
  const part = (ENTRY.parts ?? []).find((p) => p.path === `reputations/${rel}`);
  if (part && part.version !== A2A.fields.version) throw new Error(`${rel} carries ${A2A.fields.version} and standards.json says ${part.version}`);
  const { html, toc } = anchor(relink(marked.parse(A2A.rest), rel), OLD_A2A_IDS);
  write("spec-a2a-reputation.html", page({
    file: "spec-a2a-reputation.html", active: "spec-a2a-reputation",
    title: `${A2A.title} ${A2A.fields.version}`,
    description: `The A2A Reputation extension, version ${A2A.fields.version}: a data-only entry in an A2A Agent Card that names the bureaus holding an agent's record and the identifier each one knows it by.`,
    h1: A2A.title,
    metas: metasOf(A2A.fields),
    canon: `${stamp(rel)} The <a href="/spec.html">specification</a> defines every term this extension borrows.`,
    toc, body: html,
  }));
}

// ── versions and changelog ──────────────────────────────────────────────────
{
  const log = [];
  for (const block of read("CHANGELOG.md").split(/^(?=## )/m)) {
    const m = block.match(/^## (\S+) \(([^)]*)\)\n+([\s\S]*?)\s*$/);
    if (m) log.push({ ver: m[1], when: m[2], text: m[3], id: `v${m[1].replace(/[^a-z0-9]+/gi, "-")}` });
  }
  if (!log.some((e) => e.ver === VERSION)) throw new Error(`CHANGELOG.md has no entry for ${VERSION}`);
  // A version has its own copy of the site at /<version>/ once its tag holds
  // this site, because that is when the workflow can publish it.
  let kept = [];
  try {
    kept = git("tag", "-l", `${TAG_PREFIX}*`).split("\n").filter(Boolean).filter((t) => {
      try { git("cat-file", "-e", `${t}:reputations/site/tools/build-spec.mjs`); return true; } catch { return false; }
    }).map((t) => t.slice(TAG_PREFIX.length));
  } catch { /* not a repository */ }
  const archive = kept.length
    ? ` A tagged version is also kept at an address of its own: ${kept.map((v) => `<a href="${SITE}/${encodeURIComponent(v)}/">${esc(v)}</a>`).join(", ")}.`
    : "";
  const rows = log.map((e) => `  <tr><td><a href="#${e.id}">${esc(e.ver)}</a></td><td>${esc(e.when)}</td><td>${marked.parseInline(e.text.split(/\.\s/)[0].replace(/\s*\n\s*/g, " ").replace(/\.$/, ""))}</td></tr>`).join("\n");
  const entries = log.map((e) => `<h3 id="${e.id}">${esc(e.ver)} (${esc(e.when)})</h3>\n${marked.parse(e.text)}`).join("\n");
  const body = `<h2 id="versions">Versions<a class="hl" href="#versions" aria-label="Link to this section">#</a></h2>
<p>The specification is published one version at a time. This site carries version ${esc(VERSION)}, dated ${esc(DATE)}, and the specification page names it at the top.</p>
<p>The source of every version is in the <a href="${REPO_URL}">Common Agent Standards repository</a>, where each version is tagged as <span class="mono">${TAG_PREFIX}</span> followed by the version.${archive} The main branch, which can be ahead of the published version, is rendered at <a href="${SITE}/draft/">agentreputations.com/draft/</a>.</p>
<table>
  <thead><tr><th>Version</th><th>Date</th><th>What it changed</th></tr></thead>
  <tbody>
${rows}
  </tbody>
</table>
<p>Versions 0.1-draft and 0.2-draft were written before the standard moved into the Common Agent Standards repository. The closing notes of the <a href="/spec.html">specification</a> say what 0.1-draft, 0.2-draft and ${esc(VERSION)} each changed.</p>
<h2 id="changelog">Changelog<a class="hl" href="#changelog" aria-label="Link to this section">#</a></h2>
<p>The changelog is part of the standard's source and is reproduced here in full, newest first.</p>
${relink(entries, "CHANGELOG.md")}`;
  write("versions.html", page({
    file: "versions.html", active: "versions",
    title: "Versions and changelog: Agent Reputations",
    description: "Every version of the Agent Reputations specification, with its date and what it changed.",
    h1: "Versions and changelog",
    canon: stamp("CHANGELOG.md"),
    body,
  }));
}

// ── the home page's version line ────────────────────────────────────────────
// index.html is hand-written; render-site.sh copies it into the output folder
// before this runs, and the line naming the version is filled here from SPEC.md.
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

console.log(`${SPEC.title} ${VERSION} (${DATE})${commit ? `, commit ${commit}` : ", no commit stamp"}; written to ${OUT}`);
