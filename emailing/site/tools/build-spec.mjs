// build-spec.mjs: write the generated parts of agentemailing.ai from emailing/
// in the Common Agent Standards repository.
//
//   node emailing/site/tools/build-spec.mjs --out <folder>
//
// It writes, into the output folder:
//   spec.html        emailing/SPEC.md, the specification
//   versions.html    emailing/CHANGELOG.md, every version and the changelog
//   conformance/     the fixtures, the cases, the test name cards and the checker
// and it fills, in the hand-written pages tools/render-site.sh has already
// copied there:
//   index.html       the line that names the version
//   example.html     the mail views, the badge legend, the emails as sent and
//                    the decoded envelopes, all built from the fixtures
//
// tools/render-site.sh at the repository root copies the hand-written pages
// (index.html, example.html, providers.html, 404.html, site.css and the rest)
// into the output folder first, then runs this, then moves every root-relative
// link under the base (/draft/ or /<version>/), marks the draft noindex, writes
// the sitemap, checks contrast and publishes.
//
// Every badge on the example page is earned when the page is built: the
// builder verifies each fixture's signature, name card, text and files, shows
// each badge in the state its check reached, and stops if a fixture does not
// reach the state the page describes (tools/example.mjs).
import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { SITE, SUITE_REPO, REPO_URL, ENTRY, headLinks, social, rail, footer, tailScript } from "./chrome.mjs";
import { exampleSections } from "./example.mjs";

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const STANDARD = resolve(HERE, "..");
const REPO = resolve(STANDARD, "..");
const arg = (flag) => { const i = process.argv.indexOf(flag); return i >= 0 ? process.argv[i + 1] : undefined; };
if (!arg("--out")) throw new Error("usage: node emailing/site/tools/build-spec.mjs --out <folder>");
const OUT = resolve(arg("--out"));
mkdirSync(OUT, { recursive: true });
const TAG_PREFIX = "emailing-v";

const read = (rel) => readFileSync(resolve(STANDARD, rel), "utf8").replace(/\r\n/g, "\n");
const git = (...a) => execFileSync("git", ["-C", REPO, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
let commit = "";
try { git("diff", "--quiet", "HEAD", "--", "emailing"); commit = git("rev-parse", "--short=8", "HEAD"); } catch { /* uncommitted or not a repository */ }

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
marked.setOptions({ gfm: true, breaks: false });
const write = (file, html) => { writeFileSync(resolve(OUT, file), html); console.log(`${file} written: ${(html.length / 1024).toFixed(0)} KB`); };
const source = (rel) => `<a href="${SUITE_REPO}/blob/main/emailing/${rel}">emailing/${rel}</a>`;
const stamp = (rel) => `Rendered from ${source(rel)} in the Common Agent Standards repository${commit ? `, at commit <span class="mono">${commit}</span>` : ""}.`;

// Headings get the ids the earlier copy of the site gave them ("3.3. The human
// part and the subject" is 3-3-the-human-part-and-the-subject), and the h2s
// make the table of contents.
function anchor(html) {
  const seen = new Map();
  const toc = [];
  const out = html.replace(/<h([1-4])>([\s\S]*?)<\/h\1>/g, (m, lvl, inner) => {
    const text = inner.replace(/<[^>]+>/g, "");
    let slug = text.toLowerCase().replace(/&amp;/g, "and").replace(/[^\w\s.§-]/g, "")
      .replace(/\./g, "-").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const n = seen.get(slug) ?? 0;
    seen.set(slug, n + 1);
    if (n) slug = `${slug}-${n}`;
    if (lvl === "2") toc.push({ slug, text });
    return `<h${lvl} id="${slug}">${inner}<a class="hl" href="#${slug}" aria-label="Link to this section">#</a></h${lvl}>`;
  });
  return { html: out.replace(/<table>/g, '<div class="tablewrap"><table>').replace(/<\/table>/g, "</table></div>"), toc };
}

const PAGE_STYLE = `<style>
    html{ scroll-behavior:smooth; scroll-padding-top:20px; }
    .spec-hero{ padding-top:64px; padding-bottom:30px; border-bottom:1px solid var(--line); }
    .spec-hero h1{ font-size:clamp(2.2rem,4.2vw,3rem); margin:0 0 12px; }
    .spec-hero .sub{ color:var(--text-2); font-size:1.15rem; max-width:62ch; margin:0 0 6px; }
    .metas{ display:flex; gap:10px; flex-wrap:wrap; margin:16px 0 0; }
    .metas span{ font-size:.9rem; color:var(--text-2); border:1px solid var(--line);
      border-radius:100px; padding:4px 12px; background:var(--surface); }
    .metas span b{ color:var(--accent); font-weight:700; }
    .canon{ margin-top:16px; font-size:.95rem; color:var(--text-3); max-width:78ch; }
    .canon a{ color:var(--accent); }
    .toc{ margin:26px 0 0; border:1px solid var(--line); border-radius:12px; background:var(--surface);
      padding:16px 18px; columns:2; column-gap:28px; }
    .toc a{ display:block; font-size:.95rem; color:var(--text-2); text-decoration:none; padding:3px 0; break-inside:avoid; }
    .toc a:hover{ color:var(--accent); text-decoration:underline; }
    .spec{ padding-top:10px; padding-bottom:70px; }
    .spec h2{ font-size:1.75rem; margin:54px 0 14px; padding-top:22px; border-top:1px solid var(--line); }
    .spec h3{ font-size:1.25rem; margin:34px 0 10px; }
    .spec h4{ font-family:var(--disp); font-weight:600; font-size:1.05rem; margin:26px 0 8px; color:var(--text); }
    .spec .hl{ opacity:0; margin-left:8px; font-family:var(--wire); font-size:.8em; color:var(--accent); text-decoration:none; }
    .spec h2:hover .hl, .spec h3:hover .hl, .spec h4:hover .hl, .spec .hl:focus{ opacity:1; }
    .spec p, .spec li{ color:var(--text-2); max-width:76ch; }
    .spec a{ color:var(--accent); overflow-wrap:anywhere; }
    .spec strong{ color:var(--text); font-weight:600; }
    .spec code{ font-family:var(--wire); font-size:.86em; color:var(--accent); background:var(--accent-tint);
      border-radius:5px; padding:1px 5px; overflow-wrap:anywhere; }
    .spec pre{ background:var(--surface); border:1px solid var(--line); border-radius:12px;
      padding:16px 18px; overflow-x:auto; line-height:1.7; }
    .spec pre code{ background:none; padding:0; color:var(--text); font-size:.85rem; overflow-wrap:normal; }
    .spec blockquote{ margin:18px 0; border:1px solid var(--line); border-left:4px solid var(--accent);
      border-radius:10px; background:var(--surface); padding:12px 18px; }
    .spec .tablewrap{ margin:18px 0; overflow-x:auto; border:1px solid var(--line); border-radius:10px; }
    .spec table{ border-collapse:collapse; width:100%; }
    .spec th{ font-size:.85rem; font-weight:700; color:var(--text); text-align:left; padding:10px 14px;
      background:var(--surface); border-bottom:1px solid var(--line); }
    .spec td{ padding:9px 14px; border-bottom:1px solid var(--line); font-size:.95rem; color:var(--text-2); vertical-align:top; }
    .spec tr:last-child td{ border-bottom:0; }
    .spec td:first-child{ color:var(--text); }
    .spec hr{ border:0; border-top:1px solid var(--line); margin:40px 0; }
    @media (max-width:900px){ .toc{ columns:1; } .spec-hero{ padding-top:40px; } }
    @media (max-width:700px){
      .spec h2{ font-size:1.45rem; margin-top:40px; }
      .spec h3{ font-size:1.12rem; }
      .spec pre{ padding:12px 14px; overflow-x:visible; }
      .spec pre code{ font-size:.76rem; white-space:pre-wrap; overflow-wrap:anywhere; word-break:break-word; }
      .spec .tablewrap{ overflow-x:visible; }
      .spec th, .spec td{ padding:8px 9px; font-size:.86rem; overflow-wrap:anywhere; }
    }
  </style>`;

function page({ file, active, title, description, eyebrow, h1, sub = "", metas = "", canon = "", toc = [], body }) {
  const tocHtml = toc.length > 2 ? `<nav class="toc" aria-label="Sections">\n            ${toc.map((t) => `<a href="#${t.slug}">${t.text}</a>`).join("\n            ")}\n        </nav>` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script async src="/ga.js"></script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  ${social({ path: file, title, description })}
  ${headLinks}
  ${PAGE_STYLE}
</head>
<body>
  <div class="layout">

    ${rail(active)}

    <main class="main">

      <div class="wrap spec-hero">
        <span class="eyebrow">${esc(eyebrow)}</span>
        <h1>${esc(h1)}</h1>
        ${sub ? `<p class="sub">${esc(sub)}</p>` : ""}
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

// ── the specification ───────────────────────────────────────────────────────
const md = read("SPEC.md");
const head = md.match(/^# (.+)\n+(?:([^*\n][^\n]*)\n+)?\*\*Version:\*\*[\s\S]*?\*\*Date:\*\*.*\n/);
if (!head) throw new Error("SPEC.md does not start with the title and the Version, Status and Date lines");
const TITLE = head[1].trim();
const SUBTITLE = (head[2] ?? "").trim();
const VERSION = (head[0].match(/\*\*Version:\*\*\s*(.+)/) ?? [])[1].trim();
const DATE = (head[0].match(/\*\*Date:\*\*\s*(.+)/) ?? [])[1].trim();
if (VERSION !== ENTRY.version) throw new Error(`SPEC.md carries ${VERSION} and standards.json says ${ENTRY.version}`);
const chip = (k, v) => `<span>${k} <b>${esc(v)}</b></span>`;
{
  const { html, toc } = anchor(marked.parse(md.slice(head[0].length)));
  write("spec.html", page({
    file: "spec.html", active: "spec",
    title: `${TITLE}: the specification`,
    description: `${TITLE}: ${SUBTITLE}. The full text, version ${VERSION}.`,
    eyebrow: "The specification", h1: TITLE, sub: SUBTITLE,
    metas: `<div class="metas">${chip("version", VERSION)}${chip("date", DATE)}</div>`,
    canon: `${stamp("SPEC.md")} The fixtures it cites are in <a href="/conformance/cases.json">conformance/</a>, and <a href="/providers.html#test">the providers page</a> explains how to run them. Every version is on <a href="/versions.html">Versions and changelog</a>.`,
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
  let kept = [];
  try {
    kept = git("tag", "-l", `${TAG_PREFIX}*`).split("\n").filter(Boolean).map((t) => t.slice(TAG_PREFIX.length));
  } catch { /* not a repository */ }
  const archive = kept.length
    ? ` A tagged version is also kept at an address of its own: ${kept.map((v) => `<a href="${SITE}/${encodeURIComponent(v)}/">${esc(v)}</a>`).join(", ")}.`
    : "";
  const rows = log.map((e) => `  <tr><td><a href="#${e.id}">${esc(e.ver)}</a></td><td>${esc(e.when)}</td><td>${marked.parseInline(e.text.split(/\.\s/)[0].replace(/\s*\n\s*/g, " ").replace(/\.$/, ""))}</td></tr>`).join("\n");
  const entries = log.map((e) => `<h3 id="${e.id}">${esc(e.ver)} (${esc(e.when)})</h3>\n${marked.parse(e.text)}`).join("\n");
  const body = `<h2 id="versions">Versions<a class="hl" href="#versions" aria-label="Link to this section">#</a></h2>
<p>The specification is published one version at a time. This site carries version ${esc(VERSION)}, dated ${esc(DATE)}, and the specification page names it at the top.</p>
<p>The source of every version is in the <a href="${REPO_URL}">Common Agent Standards repository</a>, where each version is tagged as <span class="mono">${TAG_PREFIX}</span> followed by the version.${archive} The main branch, which can be ahead of the published version, is rendered at <a href="${SITE}/draft/">agentemailing.ai/draft/</a>.</p>
<div class="tablewrap"><table>
  <thead><tr><th>Version</th><th>Date</th><th>What it changed</th></tr></thead>
  <tbody>
${rows}
  </tbody>
</table></div>
<h2 id="changelog">Changelog<a class="hl" href="#changelog" aria-label="Link to this section">#</a></h2>
<p>The changelog is part of the standard's source and is reproduced here in full, newest first.</p>
${entries}`;
  write("versions.html", page({
    file: "versions.html", active: "versions",
    title: "Versions and changelog: Agent Emailing",
    description: "Every version of the Agent Emailing specification, with its date and what it changed.",
    eyebrow: "Versions", h1: "Versions and changelog",
    canon: stamp("CHANGELOG.md"),
    body,
  }));
}

// ── the conformance folder, so the fixtures can be downloaded from the site ─
{
  const from = resolve(STANDARD, "conformance");
  cpSync(from, resolve(OUT, "conformance"), { recursive: true });
  console.log(`conformance/ copied: ${readdirSync(resolve(from, "fixtures")).length} fixtures`);
}

// ── the hand-written pages' generated parts ─────────────────────────────────
const fill = (file, fn) => {
  const p = resolve(OUT, file);
  if (!existsSync(p)) return;
  writeFileSync(p, fn(readFileSync(p, "utf8").replace(/\r\n/g, "\n")));
  console.log(`${file}: filled`);
};

fill("index.html", (s) => {
  const re = /(<!-- spec:version -->)[\s\S]*?(<!-- \/spec:version -->)/;
  if (!re.test(s)) throw new Error("index.html: no spec:version markers");
  return s.replace(re, () => `<!-- spec:version -->Agent Emailing ${esc(VERSION)}<!-- /spec:version -->`);
});

fill("example.html", (s) => {
  const EXAMPLE = exampleSections(STANDARD);
  const cases = JSON.parse(read("conformance/cases.json"));
  const cards = read("conformance/cards.json");
  function emlHtml(name) {
    const raw = read(`conformance/fixtures/${name}`);
    let inHeaders = true, b64 = false;
    const out = raw.split("\n").map((line) => {
      const e = esc(line);
      if (line.startsWith("--=_")) { b64 = false; inHeaders = false; return `<span class="bd">${e}</span>`; }
      if (inHeaders && line === "") { inHeaders = false; return ""; }
      if (/^[A-Za-z-]+:/.test(line) && (inHeaders || !b64)) {
        if (line.toLowerCase().startsWith("content-transfer-encoding: base64")) b64 = "next";
        const i = line.indexOf(":");
        return `<span class="${/^Agent-/i.test(line) ? "hint" : "hd"}">${esc(line.slice(0, i))}</span>${esc(line.slice(i))}`;
      }
      if (b64 === "next" && line === "") { b64 = true; return ""; }
      if (b64 === true && /^[A-Za-z0-9+/=]+$/.test(line)) return `<span class="b64">${e}</span>`;
      return e;
    });
    return `<pre class="eml" aria-label="The email ${esc(name)}, as sent">${out.join("\n")}</pre>`;
  }
  const need = (m, what) => { if (!m) throw new Error(`example.html: ${what} is not in the fixtures`); return m; };
  return s
    .replace(/<!-- example:(\w+) -->/g, (m, part) => need(EXAMPLE[part], `the section ${part}`))
    .replace(/<!-- cards -->/g, () => `<pre class="json" aria-label="The test name cards">${esc(cards)}</pre>`)
    .replace(/<!-- eml:([\w.-]+) -->/g, (m, name) => emlHtml(name))
    .replace(/<!-- envelope:(\w+) -->/g, (m, which) => `<pre class="json" aria-label="The ${which} envelope, decoded">${esc(JSON.stringify(need(cases.envelopes[which], `the envelope ${which}`).envelope, null, 2))}</pre>`)
    .replace(/<!-- key:(\w+) -->/g, (m, who) => esc(need(cases.identities[who], `the key ${who}`)));
});

console.log(`${TITLE} ${VERSION} (${DATE})${commit ? `, commit ${commit}` : ", no commit stamp"}; written to ${OUT}`);
