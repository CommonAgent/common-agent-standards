// build-spec.mjs: write the generated pages of agentcollab.dev from the
// Markdown in guides/collab/ of the Common Agent Standards repository.
//
//   node guides/collab/site/tools/build-spec.mjs --out <folder>
//
// It writes, into the output folder:
//   library.html        guides/collab/README.md, how an agent reads the library
//   versions.html       guides/collab/CHANGELOG.md, every version and the changelog
//   <frame>.html        convening.md, floor.md, lobby.md and membership.md
//   <pattern>.html      each playbook in guides/collab/patterns/
//
// A pattern that has a simulation in site/sims/scores/ shows it on its page.
// tools/render-site.sh at the repository root copies the hand-written pages
// (index.html, choosing.html, 404.html, site.css, sims/ and the rest) beside
// them, moves every link under the base (/draft/ or /<version>/), checks
// contrast and publishes. The pages are never committed and never edited by
// hand: the Markdown is the source, and this builder is the only thing that
// turns it into pages.
//
// The text is rendered as written, with one exception that changes no rule: a
// relative link to another Markdown file of the guide goes to that file's page
// on this site (or to the file on GitHub when it has no page here).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { SITE, SUITE_REPO, REPO_URL, ENTRY, FRAMES, PATTERNS, headLinks, rail, footer, tailScript, libraryTable } from "./chrome.mjs";

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const GUIDE = resolve(HERE, "..");
const REPO = resolve(GUIDE, "../..");
const arg = (flag) => { const i = process.argv.indexOf(flag); return i >= 0 ? process.argv[i + 1] : undefined; };
if (!arg("--out")) throw new Error("usage: node guides/collab/site/tools/build-spec.mjs --out <folder>");
const OUT = resolve(arg("--out"));
mkdirSync(OUT, { recursive: true });
const TAG_PREFIX = "collab-v";

const read = (rel) => readFileSync(resolve(GUIDE, rel), "utf8").replace(/\r\n/g, "\n");
const git = (...a) => execFileSync("git", ["-C", REPO, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
let commit = "";
try { git("diff", "--quiet", "HEAD", "--", "guides/collab"); commit = git("rev-parse", "--short=8", "HEAD"); } catch { /* uncommitted or not a repository */ }

// ── links ───────────────────────────────────────────────────────────────────
const PAGE_OF = {
  "README.md": "/library.html",
  "CHANGELOG.md": "/versions.html#changelog",
  "patterns": "/#library",
  ...Object.fromEntries([...FRAMES, ...PATTERNS].map((d) => [d.src, `/${d.file}`])),
};
const MOVED = {
  "https://github.com/jeffrschneider/agentcollab": "/",
  "https://agentcollab.dev": "/",
};
function relink(html, source) {
  return html.replace(/href="([^"]+)"/g, (m, href) => {
    const bare = href.replace(/\/$/, "");
    if (MOVED[bare]) return `href="${MOVED[bare]}"`;
    if (/^([a-z]+:|#|\/)/i.test(href)) return m;
    const [path, frag] = href.split("#");
    const target = posix.normalize(posix.join(posix.dirname(source), path)).replace(/\/$/, "");
    if (PAGE_OF[target]) return `href="${PAGE_OF[target]}${frag && !PAGE_OF[target].includes("#") ? `#${frag}` : ""}"`;
    return `href="${SUITE_REPO}/blob/main/guides/collab/${target}${frag ? `#${frag}` : ""}"`;
  });
}

// ── rendering ───────────────────────────────────────────────────────────────
marked.setOptions({ gfm: true, breaks: false });
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const plain = (html) => html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

function anchor(html) {
  const seen = new Map();
  const toc = [];
  const out = html.replace(/<h([2-4])>([\s\S]*?)<\/h\1>/g, (m, lvl, inner) => {
    const words = plain(inner).trim();
    let id = words.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
    const n = seen.get(id) ?? 0;
    seen.set(id, n + 1);
    if (n) id = `${id}-${n}`;
    if (lvl === "2") toc.push({ id, text: words });
    return `<h${lvl} id="${id}">${inner}<a class="hl" href="#${id}" aria-label="Link to this section">#</a></h${lvl}>`;
  });
  return { html: out, toc };
}

function page({ file, active, title, description, h1, metas = "", canon = "", toc = [], before = "", body, tail = "", extraHead = "" }) {
  const tocHtml = toc.length > 2 ? `<nav class="toc" aria-label="Sections">\n            ${toc.map((t) => `<a href="#${t.id}">${esc(t.text)}</a>`).join("\n            ")}\n          </nav>` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script async src="/ga.js"></script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Agent Collab">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${SITE}/${file}">
  <meta property="og:image" content="${SITE}/brand/png/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Agent Collab. Playbooks that agents read so they can work together.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${SITE}/brand/png/og-image.png">
  <link rel="canonical" href="${SITE}/${file}">
  ${headLinks}${extraHead}
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
${before}
      <div class="wrap spec">
${body}
      </div>

      ${footer}

    </main>
  </div>
  ${tailScript}${tail}
</body>
</html>
`;
}
const write = (file, html) => { writeFileSync(resolve(OUT, file), html); console.log(`${file} written: ${(html.length / 1024).toFixed(0)} KB`); };
const source = (rel) => `<a href="${SUITE_REPO}/blob/main/guides/collab/${rel}">guides/collab/${rel}</a>`;
const stamp = (rel) => `Rendered from ${source(rel)} in the Common Agent Standards repository${commit ? `, at commit <span class="mono">${commit}</span>` : ""}.`;
const chip = (k, v) => `<span>${k} <b>${esc(v)}</b></span>`;

// ── the guide's version ─────────────────────────────────────────────────────
const readme = read("README.md");
const VERSION = readme.match(/^\*\*Version:\*\*\s*([^\s·]+)/m)?.[1];
const DATE = readme.match(/^\*\*Version:\*\*.*?(\d{4}-\d{2}-\d{2})/m)?.[1] ?? "";
if (VERSION !== ENTRY.version) throw new Error(`README.md carries ${VERSION} and standards.json says ${ENTRY.version}`);

// ── the library (README) ────────────────────────────────────────────────────
{
  const t = readme.match(/^# (.+)\n/);
  const { html, toc } = anchor(relink(marked.parse(readme.slice(t[0].length)), "README.md"));
  write("library.html", page({
    file: "library.html", active: "library",
    title: "Reading the library: Agent Collab",
    description: "How an agent uses Agent Collab: run convening, fetch the pattern, follow its role card, and close with the DONE record.",
    h1: "Reading the library",
    metas: `<div class="metas">${chip("version", VERSION)}${DATE ? chip("date", DATE) : ""}</div>`,
    canon: stamp("README.md"),
    toc, body: html,
  }));
}

// ── the frames and the patterns ─────────────────────────────────────────────
const SIM_INIT = `
  <script src="/sims/sim.js"></script>
  <script src="/sims/scores/NAME.js"></script>
  <script>
  (function(){ document.querySelectorAll('[data-sim]').forEach(function(el){ el.classList.remove('ph'); el.textContent=''; AgentSim.mount(el, el.dataset.sim); }); })();
  </script>`;
for (const d of [...FRAMES, ...PATTERNS]) {
  const md = read(d.src);
  const t = md.match(/^# (.+)\n/);
  if (!t) throw new Error(`${d.src} does not start with a title`);
  const own = md.match(/^Version:\s*(v\d+)/m)?.[1] ?? "";
  const { html, toc } = anchor(relink(marked.parse(md.slice(t[0].length)), d.src));
  const name = d.file.replace(/\.html$/, "");
  const hasSim = existsSync(resolve(HERE, "sims/scores", `${name}.js`));
  const before = hasSim ? `
      <section class="wrap simband" aria-labelledby="sim-title">
        <h2 id="sim-title">One run, played step by step</h2>
        <p>The simulation starts from a sample problem and plays the messages of this playbook one at a time. It shows who may speak, which agent can change the work, and what passes between them.</p>
        <div class="ph" data-sim="${name}">${esc(d.name)}</div>
      </section>` : "";
  const kind = d.mode ? `${d.mode} pattern` : "frame";
  write(d.file, page({
    file: d.file, active: name,
    title: `${t[1].trim()}: Agent Collab`,
    description: `${t[1].trim()}, a ${kind} of Agent Collab: ${d.shape}. The playbook an agent reads before it takes part.`,
    h1: t[1].trim(),
    metas: `<div class="metas">${chip("kind", kind)}${d.membership ? chip("membership", d.membership) : ""}${own ? chip("playbook", own) : ""}</div>`,
    canon: `${stamp(d.src)} The page is the playbook, written for the agent reading it.`,
    toc, before, body: html,
    extraHead: hasSim ? `\n  <link rel="stylesheet" href="/sims/sim.css">` : "",
    tail: hasSim ? SIM_INIT.replace("NAME", name) : "",
  }));
}

// ── versions and changelog ──────────────────────────────────────────────────
{
  const log = [];
  for (const block of read("CHANGELOG.md").split(/^(?=## )/m)) {
    const m = block.match(/^## (\S+) \(([^)]*)\)\n+([\s\S]*?)\s*$/);
    if (m) log.push({ ver: m[1], when: m[2], text: m[3], id: `v${m[1].replace(/^v/, "").replace(/[^a-z0-9]+/gi, "-")}` });
  }
  if (!log.some((e) => e.ver === VERSION)) throw new Error(`CHANGELOG.md has no entry for ${VERSION}`);
  let kept = [];
  try {
    kept = git("tag", "-l", `${TAG_PREFIX}*`).split("\n").filter(Boolean).filter((t) => {
      try { git("cat-file", "-e", `${t}:guides/collab/site/tools/build-spec.mjs`); return true; } catch { return false; }
    }).map((t) => t.slice(TAG_PREFIX.length));
  } catch { /* not a repository */ }
  const archive = kept.length
    ? ` A tagged version is also kept at an address of its own: ${kept.map((v) => `<a href="${SITE}/${encodeURIComponent(v)}/">${esc(v)}</a>`).join(", ")}.`
    : "";
  const rows = log.map((e) => `  <tr><td><a href="#${e.id}">${esc(e.ver)}</a></td><td>${esc(e.when)}</td><td>${marked.parseInline(e.text.split(/\.\s/)[0].replace(/^- /, "").replace(/\s*\n\s*/g, " ").replace(/\.$/, ""))}</td></tr>`).join("\n");
  const entries = log.map((e) => `<h3 id="${e.id}">${esc(e.ver)} (${esc(e.when)})</h3>\n${marked.parse(e.text)}`).join("\n");
  const body = `<h2 id="versions">Versions<a class="hl" href="#versions" aria-label="Link to this section">#</a></h2>
<p>The guide is published one version at a time, and each playbook also carries a version of its own, which an agent names when it opens a pattern. This site carries version ${esc(VERSION)} of the guide${DATE ? `, dated ${esc(DATE)}` : ""}.</p>
<p>The source of every version is in the <a href="${REPO_URL}">Common Agent Standards repository</a>, where each version is tagged as <span class="mono">${TAG_PREFIX}</span> followed by the version.${archive} The main branch, which can be ahead of the published version, is rendered at <a href="${SITE}/draft/">agentcollab.dev/draft/</a>.</p>
<table>
  <thead><tr><th>Version</th><th>Date</th><th>What it changed</th></tr></thead>
  <tbody>
${rows}
  </tbody>
</table>
<h2 id="changelog">Changelog<a class="hl" href="#changelog" aria-label="Link to this section">#</a></h2>
<p>The changelog is part of the guide's source and is reproduced here in full, newest first.</p>
${relink(entries, "CHANGELOG.md")}`;
  write("versions.html", page({
    file: "versions.html", active: "versions",
    title: "Versions and changelog: Agent Collab",
    description: "Every version of the Agent Collab guide, with its date and what it changed.",
    h1: "Versions and changelog",
    canon: stamp("CHANGELOG.md"),
    body,
  }));
}

// ── the home page's version line and library table ─────────────────────────
{
  const p = resolve(OUT, "index.html");
  if (existsSync(p)) {
    let s = readFileSync(p, "utf8");
    const re = /(<!-- spec:version -->)[\s\S]*?(<!-- \/spec:version -->)/;
    if (!re.test(s)) throw new Error("index.html: no spec:version markers");
    s = s.replace(re, () => `<!-- spec:version -->The guide is at version ${esc(VERSION)}${DATE ? `, dated ${esc(DATE)}` : ""}.<!-- /spec:version -->`);
    const tr = /(<!-- table:library -->)[\s\S]*?(<!-- \/table:library -->)/;
    if (!tr.test(s)) throw new Error("index.html: no table:library markers");
    s = s.replace(tr, () => `<!-- table:library -->\n  ${libraryTable()}\n  <!-- /table:library -->`);
    writeFileSync(p, s);
    console.log("index.html: spec:version and table:library filled");
  }
}

console.log(`Agent Collab ${VERSION}${commit ? `, commit ${commit}` : ", no commit stamp"}; written to ${OUT}`);
