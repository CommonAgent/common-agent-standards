// build-spec.mjs: write the generated pages of agentsow.com from the Markdown
// in sow/ of the Common Agent Standards repository.
//
//   node sow/site/tools/build-spec.mjs --out <folder>
//
// It writes, into the output folder:
//   spec.html                sow/SPEC.md, the specification
//   spec-a2a-terms.html      sow/SPEC-A2A-TERMS.md, the A2A Terms extension
//   spec-a2a-interview.html  sow/SPEC-A2A-INTERVIEW.md, the A2A Interview extension
//   extensions/a2a-terms/v1/index.html, extensions/a2a-interview/v1/index.html
//                            the pages at the two extensions' URIs
//   versions.html            every version, from the changelog of SPEC.md and
//                            sow/CHANGELOG.md
//
// tools/render-site.sh at the repository root copies the hand-written pages
// (index.html, clauses.html, pricing.html, signing.html, lifecycle.html,
// example.html, example-changes.html, internal.html, catalog.html, 404.html,
// site.css and the rest) beside them, moves every link under the base
// (/draft/ or /<version>/), checks contrast and publishes. The generated pages
// are never committed and never edited by hand: the Markdown is the source,
// and this builder is the only thing that turns it into pages.
//
// The text is rendered as written, with three exceptions that change no rule.
// A relative link to another Markdown file of the standard goes to that file's
// page on this site (or to the file on GitHub when it has no page here). The
// address the specification gives for the Common Agent Specification,
// agentdoc.net, goes to commonagent.net/spec.html, where that specification
// is published now. And each heading that had a named anchor on the earlier,
// hand-copied spec.html (#price, #standing, #review and the rest) keeps that
// name beside its numbered one, so links made to the old pages still land.
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
if (!arg("--out")) throw new Error("usage: node sow/site/tools/build-spec.mjs --out <folder>");
const OUT = resolve(arg("--out"));
mkdirSync(OUT, { recursive: true });
const TAG_PREFIX = "sow-v";

const read = (rel) => readFileSync(resolve(STANDARD, rel), "utf8").replace(/\r\n/g, "\n");
const git = (...a) => execFileSync("git", ["-C", REPO, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
// The commit stamp is only true when the Markdown is committed as it stands.
let commit = "";
try { git("diff", "--quiet", "HEAD", "--", "sow"); commit = git("rev-parse", "--short=8", "HEAD"); } catch { /* uncommitted or not a repository */ }

// ── links ───────────────────────────────────────────────────────────────────
// The Markdown files of the standard that have a page on this site.
const PAGE_OF = {
  "SPEC.md": "/spec.html",
  "SPEC-A2A-TERMS.md": "/spec-a2a-terms.html",
  "SPEC-A2A-INTERVIEW.md": "/spec-a2a-interview.html",
  "CHANGELOG.md": "/versions.html#changelog",
  "README.md": "/",
};
const MOVED = {
  "https://agentdoc.net": "https://commonagent.net/spec.html",
};
function relink(html, source) {
  return html.replace(/<a href="([^"]+)">([^<]*)<\/a>/g, (m, href, text) => {
    const bare = href.replace(/\/$/, "");
    if (MOVED[bare]) return `<a href="${MOVED[bare]}">${text.replace(/\/$/, "") === bare ? MOVED[bare] : text}</a>`;
    if (/^([a-z]+:|#|\/)/i.test(href)) return m;
    const [path, frag] = href.split("#");
    const target = posix.normalize(posix.join(posix.dirname(source), path));
    if (PAGE_OF[target]) return `<a href="${PAGE_OF[target]}${frag && !PAGE_OF[target].includes("#") ? `#${frag}` : ""}">${text}</a>`;
    return `<a href="${SUITE_REPO}/blob/main/sow/${target}${frag ? `#${frag}` : ""}">${text}</a>`;
  });
}

// The named anchors of the earlier spec.html, by the section they named.
const OLD_ANCHORS = {
  s1: "motivation", s2: "terms", s3: "gradient", s4: "document", "s4-1-1": "minting", s5: "clauses",
  "s5-3-1": "grants", "s5-4-1": "rights", "s5-4-2": "acceptance", "s5-4-3": "revisions", "s5-5": "price",
  "s5-5-2": "time-and-materials", "s5-5-3": "cap", "s5-5-4": "reservation", "s5-5-5": "reaching-the-cap",
  "s5-5-6": "pass-through", "s5-5-7": "no-charge", "s5-5-8": "operator-fee", "s5-12": "reporting",
  "s5-13": "liability", "s5-14": "floors", "s5-15": "subcontracting", s6: "signatures",
  "s6-1": "approval-authority", "s6-2": "organizational-authority", s7: "lifecycle", "s7-2": "working-lifecycle",
  s8: "asymmetry", s9: "precedence", s10: "security", s11: "related", s12: "standing", "s12-1-1": "directed",
  s13: "validation", s14: "problems", s15: "review",
};

// ── rendering ───────────────────────────────────────────────────────────────
marked.setOptions({ gfm: true, breaks: false });
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const plain = (html) => html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const verId = (v) => `v${v.replace(/[^a-z0-9]+/gi, "-")}`;

// Headings get stable ids: a numbered heading is s and its number ("5.5.2
// Time and materials" is s5-5-2), anything else a slug of its words. The h2s
// make the table of contents. With aliases, a heading also carries the name
// the earlier page gave it.
function anchor(html, aliases = {}) {
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
    const alias = !n && aliases[id] ? `<span class="alias" id="${aliases[id]}"></span>` : "";
    return `<h${lvl} id="${id}">${alias}${inner}<a class="hl" href="#${id}" aria-label="Link to this section">#</a></h${lvl}>`;
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
  <meta property="og:site_name" content="Agent SoW">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${SITE}/${file}">
  <meta property="og:image" content="${SITE}/brand/png/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Agent SoW. A statement of work between two parties whose agents do recurring work together, with every clause graded.">
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
const source = (rel) => `<a href="${SUITE_REPO}/blob/main/sow/${rel}">sow/${rel}</a>`;
const stamp = (rel) => `Rendered from ${source(rel)} in the Common Agent Standards repository${commit ? `, at commit <span class="mono">${commit}</span>` : ""}.`;
const chip = (k, v) => `<span>${k} <b>${esc(v)}</b></span>`;

// Every document here opens with its title and the Version, Status and Date lines.
function header(rel) {
  const md = read(rel);
  const head = md.match(/^# (.+)\n+\*\*Version:\*\*\s*(.+)\n\*\*Status:\*\*\s*(.+)\n\*\*Date:\*\*\s*(.+)\n/);
  if (!head) throw new Error(`${rel} does not start with the title and the Version, Status and Date lines`);
  const [, title, version, status, date] = head.map((s) => s.trim());
  return { md, rest: md.slice(head[0].length), title, version, status, date };
}

// ── the specification ───────────────────────────────────────────────────────
const spec = header("SPEC.md");
const { title: TITLE, version: VERSION, date: DATE } = spec;
if (VERSION !== ENTRY.version) throw new Error(`SPEC.md carries ${VERSION} and standards.json says ${ENTRY.version}`);

// The changelog at the end of SPEC.md: one paragraph per version that opens
// "**<version>** (<date>). <what it changed>."
const SPEC_LOG = [...spec.rest.split(/^## Changelog\s*$/m)[1]?.matchAll(/^\*\*(\d[^*]*)\*\* \(([^)]*)\)\.\s+([^\n]*(?:\n(?!\n)[^\n]*)*)/gm) ?? []]
  .map(([, ver, when, text]) => ({ ver, when, text: text.replace(/\s*\n\s*/g, " ") }));
if (!SPEC_LOG.some((e) => e.ver === VERSION)) throw new Error(`the changelog of SPEC.md has no entry for ${VERSION}`);

{
  let { html, toc } = anchor(relink(marked.parse(spec.rest), "SPEC.md"), OLD_ANCHORS);
  // Each version's paragraph in the changelog gets an id, so versions.html can link to it.
  html = html.replace(/<p><strong>(\d[^<]*)<\/strong> \(/g, (m, v) => `<p id="${verId(v)}"><strong>${v}</strong> (`);
  write("spec.html", page({
    file: "spec.html", active: "spec",
    title: `${TITLE} ${VERSION}`,
    description: `The full text of the Agent SoW specification, version ${VERSION}: the enforcement gradient, the document model, the clauses, signatures and approval authority, the lifecycle, standing proposals, validation, input problems and review.`,
    h1: TITLE,
    metas: `<div class="metas">${chip("version", VERSION)}${chip("status", spec.status)}${chip("date", DATE)}</div>`,
    canon: `${stamp("SPEC.md")} Every version and what it changed are on <a href="/versions.html">Versions and changelog</a>.`,
    toc, body: html,
  }));
}

// ── the A2A extensions ──────────────────────────────────────────────────────
const EXTENSIONS = [
  { src: "SPEC-A2A-TERMS.md", file: "spec-a2a-terms.html", active: "spec-a2a-terms",
    description: "The A2A Terms extension: an entry in an A2A Agent Card that says where the agent's signed standing proposal lives and commits to it by digest.",
    name: "The A2A Terms extension", slug: "a2a-terms",
    about: "An A2A agent puts it in its Agent Card to say where its signed Agent SoW standing proposals live, and commits to each one by digest, so a client learns on what terms the agent works before it sends a request and can check that the terms it fetched are the ones the card meant.",
    where: "The address is the <code>uri</code> of an entry in the card's <code>capabilities.extensions</code>.",
    versioned: "the shape of this entry and the rule for verifying the proposals it commits to",
    covers: "It says what the entry holds, how a client fetches a proposal and checks its digest, and what a client may and may not conclude from the terms it finds." },
  { src: "SPEC-A2A-INTERVIEW.md", file: "spec-a2a-interview.html", active: "spec-a2a-interview",
    description: "The A2A Interview extension: five questions any client may put to an agent, each answered by projecting the agent's declared documents.",
    name: "The A2A Interview extension", slug: "a2a-interview",
    about: "An A2A agent puts it in its Agent Card to offer five questions any client may ask it, about its identity, capabilities, usage, terms and refusals, each answered by copying a value from a document the agent declared, so a client can compare what the agent says with what it signed.",
    where: "The address is the <code>uri</code> of an entry in the card's <code>capabilities.extensions</code>, and an interviewer that wants the five methods lists it in the <code>A2A-Extensions</code> header of its request.",
    versioned: "the methods, the shape of their answers and the shape of their refusals",
    covers: "It says how a client activates the extension, what each of the five methods returns, how an answer names the document and member it was copied from, and how a refusal is shaped." },
];
for (const x of EXTENSIONS) {
  const d = header(x.src);
  const part = (ENTRY.parts ?? []).find((p) => p.path === `sow/${x.src}`);
  if (!part) throw new Error(`standards.json lists no part for sow/${x.src}`);
  if (part.version !== d.version) throw new Error(`${x.src} carries ${d.version} and standards.json says ${part.version}`);
  const { html, toc } = anchor(relink(marked.parse(d.rest), x.src));
  write(x.file, page({
    file: x.file, active: x.active,
    title: `${d.title} ${d.version}`,
    description: x.description,
    h1: d.title,
    metas: `<div class="metas">${chip("version", d.version)}${chip("status", d.status)}${chip("date", d.date)}</div>`,
    canon: `${stamp(x.src)} It extends the <a href="/spec.html">Agent SoW specification</a>, which is the authority for every term it borrows.`,
    toc, body: html,
  }));
}

// ── the pages at the extensions' URIs ───────────────────────────────────────
// Each extension is named in Agent Cards by a URI under
// https://agentsow.com/extensions/. A client matches that string and never
// needs to fetch it, but people paste it into a browser, so each address
// serves a page about its extension. The page is <path>/index.html, and the
// bucket answers the URI itself with a redirect to it.
for (const x of EXTENSIONS) {
  const d = header(x.src);
  const want = `${SITE}/extensions/${x.slug}/v1`;
  const uri = d.rest.match(/## 2\. Extension URI\s+```\n(\S+)\n```/)?.[1];
  if (uri !== want) throw new Error(`${x.src}: section 2 names the URI ${uri}, and this builder writes the page for ${want}`);
  const declaration = d.rest.match(/## 3\. [^\n]+[\s\S]*?```json\n([\s\S]*?)```/)?.[1];
  if (!declaration) throw new Error(`${x.src}: section 3 has no JSON declaration`);
  const file = `extensions/${x.slug}/v1/index.html`;
  mkdirSync(resolve(OUT, `extensions/${x.slug}/v1`), { recursive: true });
  const body = `<p>This address is the identifier of ${x.name.replace(/^The /, "the ")} of Agent SoW. ${x.about}</p>
<h2 id="declared">An agent names this address in its Agent Card<a class="hl" href="#declared" aria-label="Link to this section">#</a></h2>
<p>${x.where} A client matches it as an exact string and does not need to fetch it, so a card is read the same way whether or not this page can be reached. The entry looks like this:</p>
<pre><code class="language-json">${esc(declaration)}</code></pre>
<p>The address ends in <span class="mono">v1</span> for ${x.versioned}. A revision of the text that keeps them keeps this address, and a revision that changes them takes a new address.</p>
<h2 id="text">The full text of the extension defines every rule<a class="hl" href="#text" aria-label="Link to this section">#</a></h2>
<p><a href="/${x.file}">${esc(x.name)}</a> is at version ${esc(d.version)}, dated ${esc(d.date)}. ${x.covers} The <a href="/spec.html">Agent SoW specification</a> is the authority for every term it borrows.</p>`;
  write(file, page({
    file, active: x.active,
    title: x.name,
    description: `The identifier of ${x.name.replace(/^The /, "the ")}, ${uri}: what an Agent Card that names it says, and where the full text of the extension is.`,
    h1: x.name,
    canon: stamp(x.src),
    body,
  }));
}

// ── versions and changelog ──────────────────────────────────────────────────
{
  const log = [];
  for (const block of read("CHANGELOG.md").split(/^(?=## )/m)) {
    const m = block.match(/^## (\S+) \(([^)]*)\)\n+([\s\S]*?)\s*$/);
    if (m) log.push({ ver: m[1], when: m[2], text: m[3], id: verId(m[1]) });
  }
  if (!log.some((e) => e.ver === VERSION)) throw new Error(`CHANGELOG.md has no entry for ${VERSION}`);
  // A version has its own copy of the site at /<version>/ once its tag holds
  // this site, because that is when the workflow can publish it.
  let kept = [];
  try {
    kept = git("tag", "-l", `${TAG_PREFIX}*`).split("\n").filter(Boolean).filter((t) => {
      try { git("cat-file", "-e", `${t}:sow/site/tools/build-spec.mjs`); return true; } catch { return false; }
    }).map((t) => t.slice(TAG_PREFIX.length));
  } catch { /* not a repository */ }
  const archive = kept.length
    ? ` A tagged version is also kept at an address of its own: ${kept.map((v) => `<a href="${SITE}/${encodeURIComponent(v)}/">${esc(v)}</a>`).join(", ")}.`
    : "";
  const tagged = new Set(log.map((e) => e.ver));
  const rows = SPEC_LOG.map((e) => `  <tr><td><a href="/spec.html#${verId(e.ver)}">${esc(e.ver)}</a></td><td>${esc(e.when)}</td><td>${marked.parseInline(e.text.replace(/\.$/, ""))}</td><td>${tagged.has(e.ver) ? `<span class="mono">${TAG_PREFIX}${esc(e.ver)}</span>` : "before the move"}</td></tr>`).join("\n");
  const entries = log.map((e) => `<h3 id="${e.id}">${esc(e.ver)} (${esc(e.when)})</h3>\n${marked.parse(e.text)}`).join("\n");
  const body = `<h2 id="versions">Versions<a class="hl" href="#versions" aria-label="Link to this section">#</a></h2>
<p>The specification is published one version at a time. This site carries version ${esc(VERSION)}, dated ${esc(DATE)}, and the specification page names it at the top.</p>
<p>The source of every version is in the <a href="${REPO_URL}">Common Agent Standards repository</a>, where each version is tagged as <span class="mono">${TAG_PREFIX}</span> followed by the version.${archive} The main branch, which can be ahead of the published version, is rendered at <a href="${SITE}/draft/">agentsow.com/draft/</a>.</p>
<p>The table lists every version the changelog at the end of the specification names. Each link goes to that version's entry, which says what it changed and whether earlier documents stay valid.</p>
<table>
  <thead><tr><th>Version</th><th>Date</th><th>What it changed</th><th>Tag</th></tr></thead>
  <tbody>
${rows}
  </tbody>
</table>
<p>Versions before ${esc(log[log.length - 1].ver)} were written in the repository of agentsow.com, before the standard moved into the Common Agent Standards repository.</p>
<h2 id="changelog">Changelog<a class="hl" href="#changelog" aria-label="Link to this section">#</a></h2>
<p>The changelog of the folder records the versions tagged in the Common Agent Standards repository. It is part of the standard's source and is reproduced here in full, newest first.</p>
${relink(entries, "CHANGELOG.md")}`;
  write("versions.html", page({
    file: "versions.html", active: "versions",
    title: "Versions and changelog: Agent SoW",
    description: "Every version of the Agent SoW specification, with its date and what it changed.",
    h1: "Versions and changelog",
    canon: `${stamp("CHANGELOG.md")} The table is read from the changelog at the end of ${source("SPEC.md")}.`,
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
