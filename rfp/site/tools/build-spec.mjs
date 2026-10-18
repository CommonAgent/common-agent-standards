// build-spec.mjs: write the generated pages of agentrfp.net from the Markdown
// in rfp/ of the Common Agent Standards repository.
//
//   node rfp/site/tools/build-spec.mjs --out <folder>
//
// It writes, into the output folder:
//   spec.html      rfp/SPEC.md, the specification
//   versions.html  rfp/CHANGELOG.md, every version and the changelog
//
// tools/render-site.sh at the repository root copies the hand-written pages
// (index.html, posting.html, responses.html, example.html, example-award.html,
// 404.html, site.css and the rest) beside them, moves every link under the
// base (/draft/ or /<version>/), checks contrast and publishes. The pages are
// never committed and never edited by hand: the Markdown is the source, and
// this builder is the only thing that turns it into pages.
//
// The text is rendered as written. A relative link to another Markdown file
// goes to that file's page on this site, or to the file on GitHub when it has
// no page here. The specification's headings also keep the anchors the old
// hand-copied spec.html used (#posting-need and the rest), so links made to
// the old page still land on the right section.
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
if (!arg("--out")) throw new Error("usage: node rfp/site/tools/build-spec.mjs --out <folder>");
const OUT = resolve(arg("--out"));
mkdirSync(OUT, { recursive: true });
const TAG_PREFIX = "rfp-v";

const read = (rel) => readFileSync(resolve(STANDARD, rel), "utf8").replace(/\r\n/g, "\n");
const git = (...a) => execFileSync("git", ["-C", REPO, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
// The commit stamp is only true when the Markdown is committed as it stands.
let commit = "";
try { git("diff", "--quiet", "HEAD", "--", "rfp"); commit = git("rev-parse", "--short=8", "HEAD"); } catch { /* uncommitted or not a repository */ }

// ── links ───────────────────────────────────────────────────────────────────
// The Markdown files of the standard that have a page on this site.
const PAGE_OF = {
  "SPEC.md": "/spec.html",
  "CHANGELOG.md": "/versions.html#changelog",
  "README.md": "/",
};
const MOVED = {
  "https://agentrfp.net": "/",
};
function relink(html, source) {
  return html.replace(/href="([^"]+)"/g, (m, href) => {
    const bare = href.replace(/\/$/, "");
    if (MOVED[bare]) return `href="${MOVED[bare]}"`;
    if (/^([a-z]+:|#|\/)/i.test(href)) return m;
    const [path, frag] = href.split("#");
    const target = posix.normalize(posix.join(posix.dirname(source), path));
    if (PAGE_OF[target]) return `href="${PAGE_OF[target]}${frag && !PAGE_OF[target].includes("#") ? `#${frag}` : ""}"`;
    return `href="${SUITE_REPO}/blob/main/rfp/${target}${frag ? `#${frag}` : ""}"`;
  });
}

// ── rendering ───────────────────────────────────────────────────────────────
marked.setOptions({ gfm: true, breaks: false });
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const plain = (html) => html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

// The anchors of the old hand-copied spec.html, by section number.
const OLD_ID = { "1": "motivation", "2": "terms", "3": "gradient", "4": "document", "4.1": "document-identity",
  "4.1.1": "minting", "4.2": "document-replacement", "4.3": "document-language", "4.4": "document-shape",
  "5": "posting", "5.1": "posting-poster", "5.2": "posting-need", "5.2.1": "agent-shaped", "5.2.2": "performer",
  "5.3": "posting-budget", "5.4": "posting-term", "5.5": "posting-expiry", "5.6": "posting-visibility",
  "5.7": "posting-award", "5.8": "posting-respond", "5.9": "posting-resolution", "5.9.1": "first-come",
  "5.10": "posting-handling", "6": "signatures", "7": "responses", "7.1": "surface", "7.2": "agent-responses",
  "8": "award", "9": "lifecycle", "10": "sow", "11": "security", "12": "precedence", "13": "future" };

// Headings get stable ids: a numbered heading is s and its number ("5.2.1
// Agent-shaped postings" is s5-2-1), anything else a slug of its words. The
// h2s make the table of contents.
function anchor(html) {
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
    const old = num && OLD_ID[num[1]] ? `<span class="alias" id="${OLD_ID[num[1]]}"></span>` : "";
    return `${old}<h${lvl} id="${id}">${inner}<a class="hl" href="#${id}" aria-label="Link to this section">#</a></h${lvl}>`;
  });
  return { html: out, toc };
}

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
  <meta property="og:site_name" content="Agent RFP">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${SITE}/${file}">
  <meta property="og:image" content="${SITE}/brand/png/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Agent RFP. A signed, structured request for proposal, written for software agents.">
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
const source = (rel) => `<a href="${SUITE_REPO}/blob/main/rfp/${rel}">rfp/${rel}</a>`;
const stamp = (rel) => `Rendered from ${source(rel)} in the Common Agent Standards repository${commit ? `, at commit <span class="mono">${commit}</span>` : ""}.`;

// ── the specification ───────────────────────────────────────────────────────
const specMd = read("SPEC.md");
const head = specMd.match(/^# (.+)\n+\*\*Version:\*\*\s*(.+)\n\*\*Status:\*\*\s*(.+)\n\*\*Date:\*\*\s*(.+)\n/);
if (!head) throw new Error("SPEC.md does not start with the title and the Version, Status and Date lines");
const [, TITLE, VERSION, STATUS, DATE] = head.map((s) => s.trim());
if (VERSION !== ENTRY.version) throw new Error(`SPEC.md carries ${VERSION} and standards.json says ${ENTRY.version}`);

const chip = (k, v) => `<span>${k} <b>${esc(v)}</b></span>`;
{
  const { html, toc } = anchor(relink(marked.parse(specMd.slice(head[0].length)), "SPEC.md"));
  write("spec.html", page({
    file: "spec.html", active: "spec",
    title: `${TITLE} ${VERSION}`,
    description: `The full text of the Agent RFP specification, version ${VERSION}: the posting, its fields and grades, signatures, responses as Agent SoW proposals, the award and formation, the lifecycle and security.`,
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
    if (m) log.push({ ver: m[1], when: m[2], text: m[3], id: `v${m[1].replace(/[^a-z0-9]+/gi, "-")}` });
  }
  if (!log.some((e) => e.ver === VERSION)) throw new Error(`CHANGELOG.md has no entry for ${VERSION}`);
  // A version has its own copy of the site at /<version>/ once its tag holds
  // this site, because that is when the workflow can publish it.
  let kept = [];
  try {
    kept = git("tag", "-l", `${TAG_PREFIX}*`).split("\n").filter(Boolean).filter((t) => {
      try { git("cat-file", "-e", `${t}:rfp/site/tools/build-spec.mjs`); return true; } catch { return false; }
    }).map((t) => t.slice(TAG_PREFIX.length));
  } catch { /* not a repository */ }
  const archive = kept.length
    ? ` A tagged version is also kept at an address of its own: ${kept.map((v) => `<a href="${SITE}/${encodeURIComponent(v)}/">${esc(v)}</a>`).join(", ")}.`
    : "";
  const rows = log.map((e) => `  <tr><td><a href="#${e.id}">${esc(e.ver)}</a></td><td>${esc(e.when)}</td><td>${marked.parseInline(e.text.split(/\.\s/)[0].replace(/\s*\n\s*/g, " ").replace(/\.$/, ""))}</td></tr>`).join("\n");
  const entries = log.map((e) => `<h3 id="${e.id}">${esc(e.ver)} (${esc(e.when)})</h3>\n${marked.parse(e.text)}`).join("\n");
  const body = `<h2 id="versions">Versions<a class="hl" href="#versions" aria-label="Link to this section">#</a></h2>
<p>The specification is published one version at a time. This site carries version ${esc(VERSION)}, dated ${esc(DATE)}, and the specification page names it at the top.</p>
<p>The source of every version is in the <a href="${REPO_URL}">Common Agent Standards repository</a>, where each version is tagged as <span class="mono">${TAG_PREFIX}</span> followed by the version.${archive} The main branch, which can be ahead of the published version, is rendered at <a href="${SITE}/draft/">agentrfp.net/draft/</a>.</p>
<table>
  <thead><tr><th>Version</th><th>Date</th><th>What it changed</th></tr></thead>
  <tbody>
${rows}
  </tbody>
</table>
<p>Versions 0.1.0-draft to 0.7.0-draft were written before the standard moved into the Common Agent Standards repository. The notes at the end of the <a href="/spec.html">specification</a> say what each of them changed, and what ${esc(VERSION)} changed.</p>
<h2 id="changelog">Changelog<a class="hl" href="#changelog" aria-label="Link to this section">#</a></h2>
<p>The changelog is part of the standard's source and is reproduced here in full, newest first.</p>
${relink(entries, "CHANGELOG.md")}`;
  write("versions.html", page({
    file: "versions.html", active: "versions",
    title: "Versions and changelog: Agent RFP",
    description: "Every version of the Agent RFP specification, with its date and what it changed.",
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

console.log(`${TITLE} ${VERSION} (${DATE})${commit ? `, commit ${commit}` : ", no commit stamp"}; written to ${OUT}`);
