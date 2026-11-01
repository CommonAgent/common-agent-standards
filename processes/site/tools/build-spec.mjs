// build-spec.mjs: write the generated pages of agentprocesses.ai from the
// Markdown in processes/ of the Common Agent Standards repository.
//
//   node processes/site/tools/build-spec.mjs --out <folder>
//
// It writes, into the output folder:
//   spec.html               processes/SPEC.md, the specification
//   versions.html           processes/CHANGELOG.md, every version and the changelog
//   guide-process.html      processes/process.md, the guide to writing down a process
//   guide-catalog.html      processes/process-catalog.md, the guide to the catalog
//   social-campaign.html    processes/examples/social-campaign.md
//   marketing-catalog.html  processes/examples/marketing-catalog.md
//   onboard-an-agent.html, offboard-an-agent.html, make-a-new-agent.html,
//   record-an-incident.html, retire-an-agent.html
//                           the reference processes in processes/reference/
//
// tools/render-site.sh at the repository root copies the hand-written pages
// (index.html, automation.html, offboarding.html, catalog.html, writing.html,
// 404.html, site.css and the rest) beside them, moves every link
// under the base (/draft/ or /<version>/), checks contrast and publishes. The
// pages are never committed and never edited by hand: the Markdown is the
// source, and this builder is the only thing that turns it into pages.
//
// The text is rendered as written, with three exceptions that change no rule.
// The examples' titles read "Example:" where the Markdown says "Worked
// example:", and the guides' titles start "Guide:", so that they match the
// menu. A relative link to another Markdown
// file of the standard goes to that file's page on this site (or to the file
// on GitHub when it has no page here), and the guides' links to the old
// home of Agent Collab, which moved after the guides were written, go to the
// site it has now.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { SITE, SUITE_REPO, REPO_URL, ENTRY, headLinks, rail, footer, tailScript } from "./chrome.mjs";

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const STANDARD = resolve(HERE, "..");
const REPO = resolve(STANDARD, "..");
const arg = (flag) => { const i = process.argv.indexOf(flag); return i >= 0 ? process.argv[i + 1] : undefined; };
if (!arg("--out")) throw new Error("usage: node processes/site/tools/build-spec.mjs --out <folder>");
const OUT = resolve(arg("--out"));
mkdirSync(OUT, { recursive: true });
const TAG_PREFIX = "processes-v";

const read = (rel) => readFileSync(resolve(STANDARD, rel), "utf8").replace(/\r\n/g, "\n");
const git = (...a) => execFileSync("git", ["-C", REPO, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
// The commit stamp is only true when the Markdown is committed as it stands.
let commit = "";
try { git("diff", "--quiet", "HEAD", "--", "processes"); commit = git("rev-parse", "--short=8", "HEAD"); } catch { /* uncommitted or not a repository */ }

// ── links ───────────────────────────────────────────────────────────────────
// The Markdown files of the standard that have a page on this site.
const PAGE_OF = {
  "SPEC.md": "/spec.html",
  "CHANGELOG.md": "/versions.html#changelog",
  "README.md": "/",
  "process.md": "/guide-process.html",
  "process-catalog.md": "/guide-catalog.html",
  "examples/social-campaign.md": "/social-campaign.html",
  "examples/marketing-catalog.md": "/marketing-catalog.html",
  "reference/onboard-an-agent.md": "/onboard-an-agent.html",
  "reference/offboard-an-agent.md": "/offboard-an-agent.html",
  "reference/make-a-new-agent.md": "/make-a-new-agent.html",
  "reference/record-an-incident.md": "/record-an-incident.html",
  "reference/retire-an-agent.md": "/retire-an-agent.html",
};
// The extensions this standard's authors publish (Section 20.4), each at the
// address its name gives: agentprocesses.ai/ext/<name>/ is the newest
// version, and /ext/<name>/v<n>.html every version. extensions/<name>.md is
// version 1, extensions/<name>-v<n>.md version n.
const EXT_DIR = resolve(STANDARD, "extensions");
const EXTENSIONS = (existsSync(EXT_DIR) ? readdirSync(EXT_DIR) : []).filter((f) => f.endsWith(".md")).map((f) => {
  const m = /^([a-z0-9-]+?)(?:-v(\d+))?\.md$/.exec(f);
  if (!m) throw new Error(`extensions/${f} is not named <name>.md or <name>-v<n>.md`);
  return { src: `extensions/${f}`, name: m[1], version: Number(m[2] ?? 1) };
}).sort((a, b) => a.name.localeCompare(b.name) || a.version - b.version);
for (const e of EXTENSIONS) PAGE_OF[e.src] = `/ext/${e.name}/v${e.version}.html`;
const MOVED = {
  "https://github.com/jeffrschneider/agentcollab": "https://agentcollab.dev/",
  "https://github.com/jeffrschneider/agentprocesses": REPO_URL,
  "https://agentprocesses.ai": "/",
};
function relink(html, source) {
  return html.replace(/href="([^"]+)"/g, (m, href) => {
    const bare = href.replace(/\/$/, "");
    if (MOVED[bare]) return `href="${MOVED[bare]}"`;
    if (/^([a-z]+:|#|\/)/i.test(href)) return m;
    const [path, frag] = href.split("#");
    const target = posix.normalize(posix.join(posix.dirname(source), path));
    if (PAGE_OF[target]) return `href="${PAGE_OF[target]}${frag && !PAGE_OF[target].includes("#") ? `#${frag}` : ""}"`;
    return `href="${SUITE_REPO}/blob/main/processes/${target}${frag ? `#${frag}` : ""}"`;
  });
}

// ── rendering ───────────────────────────────────────────────────────────────
marked.setOptions({ gfm: true, breaks: false });
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const plain = (html) => html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

// Headings get stable ids: a numbered heading is s and its number ("6.3.1 A
// phase that runs another process" is s6-3-1, "13.6a. Naming the records" is
// s13-6a), anything else a slug of its words. The h2s make the table of contents.
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
    return `<h${lvl} id="${id}">${inner}<a class="hl" href="#${id}" aria-label="Link to this section">#</a></h${lvl}>`;
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
  <meta property="og:site_name" content="Agent Processes">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${SITE}/${file}">
  <meta property="og:image" content="${SITE}/brand/png/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Agent Processes. An open format for writing down your organization's recurring work, so agents and people can run it together.">
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
const write = (file, html) => { mkdirSync(dirname(resolve(OUT, file)), { recursive: true }); writeFileSync(resolve(OUT, file), html); console.log(`${file} written: ${(html.length / 1024).toFixed(0)} KB`); };
const source = (rel) => `<a href="${SUITE_REPO}/blob/main/processes/${rel}">processes/${rel}</a>`;
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
    description: `The full text of the Agent Processes specification, version ${VERSION}: the process document, its steps and their order, automation levels, handoffs, records, the reference profile, conformance and versioning.`,
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
      try { git("cat-file", "-e", `${t}:processes/site/tools/build-spec.mjs`); return true; } catch { return false; }
    }).map((t) => t.slice(TAG_PREFIX.length));
  } catch { /* not a repository */ }
  const archive = kept.length
    ? ` A tagged version is also kept at an address of its own: ${kept.map((v) => `<a href="${SITE}/${encodeURIComponent(v)}/">${esc(v)}</a>`).join(", ")}.`
    : "";
  const rows = log.map((e) => `  <tr><td><a href="#${e.id}">${esc(e.ver)}</a></td><td>${esc(e.when)}</td><td>${marked.parseInline(e.text.split(/\.\s/)[0].replace(/\s*\n\s*/g, " ").replace(/\.$/, ""))}</td></tr>`).join("\n");
  const entries = log.map((e) => `<h3 id="${e.id}">${esc(e.ver)} (${esc(e.when)})</h3>\n${marked.parse(e.text)}`).join("\n");
  const body = `<h2 id="versions">Versions<a class="hl" href="#versions" aria-label="Link to this section">#</a></h2>
<p>The specification is published one version at a time. This site carries version ${esc(VERSION)}, dated ${esc(DATE)}, and the specification page names it at the top.</p>
<p>The source of every version is in the <a href="${REPO_URL}">Common Agent Standards repository</a>, where each version is tagged as <span class="mono">${TAG_PREFIX}</span> followed by the version.${archive} The main branch, which can be ahead of the published version, is rendered at <a href="${SITE}/draft/">agentprocesses.ai/draft/</a>.</p>
<table>
  <thead><tr><th>Version</th><th>Date</th><th>What it changed</th></tr></thead>
  <tbody>
${rows}
  </tbody>
</table>
<p>Versions 0.1.0-draft to 0.3.0-draft were written before the standard moved into the Common Agent Standards repository. The opening notes of the <a href="/spec.html">specification</a> say what 0.2.0-draft, 0.3.0-draft and ${esc(VERSION)} each changed.</p>
<h2 id="changelog">Changelog<a class="hl" href="#changelog" aria-label="Link to this section">#</a></h2>
<p>The changelog is part of the standard's source and is reproduced here in full, newest first.</p>
${relink(entries, "CHANGELOG.md")}`;
  write("versions.html", page({
    file: "versions.html", active: "versions",
    title: "Versions and changelog: Agent Processes",
    description: "Every version of the Agent Processes specification, with its date and what it changed.",
    h1: "Versions and changelog",
    canon: stamp("CHANGELOG.md"),
    body,
  }));
}

// ── the guides, the examples and the reference processes ──────────────────────────────────────
const GUIDES = [
  { src: "process.md", file: "guide-process.html", active: "guide-process", h1: "Guide: writing down a process",
    description: "How to write down one process: the trigger, the steps and their order, the automation level of each step, handoffs, bindings, policy, measures and amendments." },
  { src: "process-catalog.md", file: "guide-catalog.html", active: "guide-catalog", h1: "Guide: the process catalog",
    description: "The process catalog: one table per department with a row for each process, and how to use it to decide what to automate first." },
  { src: "examples/social-campaign.md", file: "social-campaign.html", active: "social-campaign",
    description: "A social campaign process written out in full: thirteen steps, the handoffs between them, the automation level of each, and its failure edges." },
  { src: "examples/marketing-catalog.md", file: "marketing-catalog.html", active: "marketing-catalog",
    description: "A marketing department's catalog of eleven processes, the graph of what feeds what, and where the department would start automating." },
  { src: "reference/onboard-an-agent.md", file: "onboard-an-agent.html", active: "onboard-an-agent",
    h1: "Reference process: onboard an agent",
    description: "A reference process for bringing an outside agent into an organization's work: verify it, interview it, sign an NDA where needed, form the engagement, grant a mandate and access, hand over context, and run a trial before go-live." },
  { src: "reference/offboard-an-agent.md", file: "offboard-an-agent.html", active: "offboard-an-agent",
    h1: "Reference process: offboard an agent",
    description: "A reference process for taking an outside agent out of an organization's work: hand over its work, end the engagement, revoke its mandate and access, settle the money, confirm the data, file the outcome and sign an exit record." },
  { src: "reference/make-a-new-agent.md", file: "make-a-new-agent.html", active: "make-a-new-agent",
    h1: "Reference process: make a new agent",
    description: "A reference process for making an agent an organization runs: write a spec the owner approves, write the tests before the scripts, make the package, deploy it on the owner's yes, and have an agent that built none of it check conformance." },
  { src: "reference/record-an-incident.md", file: "record-an-incident.html", active: "record-an-incident",
    h1: "Reference process: record an incident",
    description: "A reference process for an agent that goes quiet or fails: notice it, gather the records, write a timeline that names every fact's source and every gap, and leave the decision to a person." },
  { src: "reference/retire-an-agent.md", file: "retire-an-agent.html", active: "retire-an-agent",
    h1: "Reference process: retire an agent",
    description: "A reference process for taking down an agent an organization runs: tell what depends on it, take down its listing, approve and make the removal, and close its AgentDoc with the date and the reason." },
];
for (const g of GUIDES) {
  const md = read(g.src);
  const t = md.match(/^# (.+)\n/);
  if (!t) throw new Error(`${g.src} does not start with a title`);
  const h1 = g.h1 ?? t[1].trim().replace(/^Worked example:/, "Example:");
  const { html, toc } = anchor(relink(marked.parse(md.slice(t[0].length)), g.src));
  write(g.file, page({
    file: g.file, active: g.active,
    title: `${h1}: Agent Processes`,
    description: g.description,
    h1,
    canon: `${stamp(g.src)} The <a href="/spec.html">specification</a> is the normative text.`,
    toc, body: html,
  }));
}

// ── the extensions ──────────────────────────────────────────────────────────
// Each version of each extension on a page of its own; the newest also at the
// extension's own address, which is what its name in a document points to
// (Section 20.2: the name is the address of the definition without its scheme).
if (EXTENSIONS.length) {
  const names = [...new Set(EXTENSIONS.map((e) => e.name))];
  const read1 = (e) => {
    const md = read(e.src);
    const t = md.match(/^# (.+)\n/);
    if (!t) throw new Error(`${e.src} does not start with a title`);
    // The first paragraph after the table says what the extension is for.
    const lede = md.slice(t[0].length).split(/\n{2,}/).map((p) => p.trim()).find((p) => p && !p.startsWith("|")) ?? "";
    return { ...e, md, title: t[1].trim(), body: md.slice(t[0].length), lede: plain(marked.parseInline(lede.replace(/\s*\n\s*/g, " "))) };
  };
  const all = EXTENSIONS.map(read1);
  const versionsOf = (name) => all.filter((e) => e.name === name);
  const others = (e) => versionsOf(e.name).filter((x) => x !== e);
  const otherLine = (e) => {
    const rest = others(e);
    return rest.length ? ` Other versions: ${rest.map((x) => `<a href="/ext/${x.name}/v${x.version}.html">version ${x.version}</a>`).join(", ")}.` : "";
  };
  const extPage = (e, file, newest) => {
    const { html, toc } = anchor(relink(marked.parse(e.body), e.src));
    return page({
      file, active: "ext",
      title: `${e.title}: Agent Processes`,
      description: e.lede.slice(0, 300),
      h1: e.title,
      metas: `<div class="metas">${chip("name", `agentprocesses.ai/ext/${e.name} v${e.version}`)}${chip("version", String(e.version))}</div>`,
      canon: `${stamp(e.src)}${newest ? ` This is the newest version, at the extension's own address.` : ""}${otherLine(e)} An extension is defined by Section 20 of the <a href="/spec.html#s20">specification</a>.`,
      toc, body: html,
    });
  };
  for (const e of all) write(`ext/${e.name}/v${e.version}.html`, extPage(e, `ext/${e.name}/v${e.version}.html`, false));
  for (const name of names) {
    const newest = versionsOf(name).at(-1);
    write(`ext/${name}/index.html`, extPage(newest, `ext/${name}/`, true));
  }
  const rows = names.map((name) => {
    const v = versionsOf(name);
    const newest = v.at(-1);
    return `  <tr><td><a href="/ext/${name}/"><span class="mono">agentprocesses.ai/ext/${esc(name)}</span></a></td><td>${v.map((x) => `<a href="/ext/${name}/v${x.version}.html">v${x.version}</a>`).join(", ")}</td><td>${esc(newest.lede)}</td></tr>`;
  }).join("\n");
  const body = `<p>An extension is an optional part of a process document, for what only software needs: how a form asks for the trigger's items, what type each handoff is, how one program's output becomes the next program's input. A document carries its extensions in an <span class="mono">extensions:</span> block, the last block of the document, each named by its address and the version of its definition. A runtime that does not know an extension runs the document as if its lines were absent. Section 20 of the <a href="/spec.html#s20">specification</a> says what may be an extension and what must stay in the document.</p>
<p>These are the extensions the specification's authors publish. Each one's name is its address here, and the newest version of its definition is at that address.</p>
<table>
  <thead><tr><th>Name</th><th>Versions</th><th>What it adds</th></tr></thead>
  <tbody>
${rows}
  </tbody>
</table>
<p>Anyone may publish an extension at an address they control (Section 20.2).</p>`;
  write("ext/index.html", page({
    file: "ext/", active: "ext",
    title: "Extensions: Agent Processes",
    description: "The extensions to Agent Processes its authors publish, each at its own address: start-form and typed-handoffs, with every version of each.",
    h1: "Extensions",
    canon: `Rendered from the definitions in <a href="${SUITE_REPO}/tree/main/processes/extensions">processes/extensions</a> in the Common Agent Standards repository${commit ? `, at commit <span class="mono">${commit}</span>` : ""}.`,
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
