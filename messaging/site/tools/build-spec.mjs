// build-spec.mjs: render spec.html from the canonical Agent Messaging SPEC.md.
// Usage: node messaging/site/tools/build-spec.mjs [--spec <SPEC.md>] [--out <folder>]
// Default source: messaging/SPEC.md in the Common Agent Standards repository.
// Default output: messaging/site/spec.html. tools/render-site.sh renders the
// whole site into a staging folder with --out.
// Regenerate whenever the spec changes; spec.html is a committed artifact and is
// never hand-edited. This builder moved here from dev.agentmesh.ai on
// 2026-10-11, when the specification was renamed Agent Messaging and given this
// site; dev.agentmesh.ai/spec.html is now a redirect stub. Do not add a second
// builder anywhere else.
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const STANDARD = resolve(ROOT, "..");
const arg = (flag) => { const i = process.argv.indexOf(flag); return i >= 0 ? process.argv[i + 1] : undefined; };
const explicit = arg("--spec");
const SRC = explicit ?? resolve(STANDARD, "SPEC.md");
const OUT = resolve(arg("--out") ?? ROOT);
import { REPO_URL, headLinks, rail, footer, tailScript } from "./chrome.mjs";

let md, commit = "";
try {
  md = readFileSync(SRC, "utf8");
  // The commit stamp is only true when the page is rendered from this
  // repository's own checkout. A file named on the command line may be
  // anything, so it gets no stamp rather than a misleading one.
  if (!explicit) {
    try {
      commit = execSync(`git -C "${STANDARD}" rev-parse --short HEAD`, { encoding: "utf8" }).trim();
    } catch { /* no local repo info */ }
  }
} catch {
  throw new Error(`cannot read ${SRC}`);
}

md = md.replace(/\r\n/g, "\n");

// The header block: "# Agent Messaging 0.5", an optional one-line subtitle, then
// the Version, Status and Date lines. The page hero renders all of it, so it is
// dropped from the body. Everything after the Date line, the naming note
// included, stays in the body.
const head = md.match(/^# (.+)\n+(?:([^*\n][^\n]*)\n+)?\*\*Version:\*\*[\s\S]*?\*\*Date:\*\*.*\n/);
if (!head) throw new Error("SPEC.md does not start with the expected title and Version/Status/Date block");
const title = head[1].trim();
const subtitle = (head[2] ?? "").trim();
const meta = {};
for (const [k, re] of Object.entries({
  version: /\*\*Version:\*\*\s*(.+)/,
  status: /\*\*Status:\*\*\s*(.+)/,
  date: /\*\*Date:\*\*\s*(.+)/,
})) meta[k] = (head[0].match(re) ?? [, "?"])[1].trim();

const mdBody = md.slice(head[0].length);
marked.setOptions({ gfm: true, breaks: false });
let body = marked.parse(mdBody);

// Anchor the headings ourselves (stable slugs; marked no longer ships ids).
// These slugs are the same ones dev.agentmesh.ai/spec.html used, so links with
// a section fragment keep working through the redirect stub there.
// Ids a heading used to have, kept beside it so links made to them still land.
const ALIASES = {
  "13-6-security-events-and-quarantine-notices": ["13-6-security-events-and-quarantine-notices-proposed"],
};
const slugCount = new Map();
const toc = [];
body = body.replace(/<h([1-4])>([\s\S]*?)<\/h\1>/g, (m, lvl, inner) => {
  const text = inner.replace(/<[^>]+>/g, "");
  let slug = text.toLowerCase()
    .replace(/&amp;/g, "and").replace(/[^\w\s.§-]/g, "")
    .replace(/\./g, "-").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const n = slugCount.get(slug) ?? 0;
  slugCount.set(slug, n + 1);
  if (n) slug = `${slug}-${n}`;
  if (lvl === "2") toc.push({ slug, text });
  const aliases = (ALIASES[slug] ?? []).map((a) => `<span class="alias" id="${a}"></span>`).join("");
  return `${aliases}<h${lvl} id="${slug}">${inner}<a class="hl" href="#${slug}">#</a></h${lvl}>`;
});

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const tocHtml = toc.map(t => `<a href="#${t.slug}">${t.text}</a>`).join("\n            ");
const generated = new Date().toISOString().slice(0, 10);
const description = `${title}: ${subtitle || "the specification"}. The full text, rendered from SPEC.md. The Agent Messaging Server is the reference implementation.`;

const page = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script async src="/ga.js"></script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}: the specification</title>
  <meta name="description" content="${esc(description)}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Agent Messaging">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="https://agentmessaging.ai/spec.html">
  <meta property="og:image" content="https://agentmessaging.ai/brand/png/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Agent Messaging. Inboxes, publish and subscribe, and presence for agents">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="https://agentmessaging.ai/brand/png/og-image.png">
  <link rel="canonical" href="https://agentmessaging.ai/spec.html">
  ${headLinks}
  <style>
    html{ scroll-behavior:smooth; scroll-padding-top:20px; }
    .spec-hero{ padding-top:64px; padding-bottom:30px; border-bottom:1px solid var(--line); }
    .spec-hero h1{ font-size:clamp(2.2rem,4.2vw,3rem); margin:0 0 12px; }
    .spec-hero .sub{ color:var(--text-2); font-size:1.15rem; max-width:62ch; margin:0 0 6px; }
    .metas{ display:flex; gap:10px; flex-wrap:wrap; margin:16px 0 0; }
    .metas span{ font-size:.9rem; color:var(--text-2); border:1px solid var(--line);
      border-radius:100px; padding:4px 12px; background:var(--surface); }
    .metas span b{ color:var(--accent); font-weight:700; }
    .canon{ margin-top:16px; font-size:.95rem; color:var(--text-3); max-width:78ch; }
    .toc{ margin:26px 0 0; border:1px solid var(--line); border-radius:12px; background:var(--surface);
      padding:16px 18px; columns:2; column-gap:28px; }
    .toc a{ display:block; font-size:.95rem; color:var(--text-2); text-decoration:none; padding:3px 0; break-inside:avoid; }
    .toc a:hover{ color:var(--accent); text-decoration:underline; }
    .spec{ padding:10px 0 70px; }
    .spec h1{ display:none; }
    .spec .alias{ display:block; height:0; }
    .spec h2{ font-size:1.75rem; margin:54px 0 14px; padding-top:22px; border-top:1px solid var(--line); }
    .spec h3{ font-size:1.25rem; margin:34px 0 10px; }
    .spec h4{ font-family:var(--disp); font-weight:600; font-size:1.05rem; margin:26px 0 8px; color:var(--text); }
    .spec .hl{ opacity:0; margin-left:8px; font-family:var(--wire); font-size:.8em; color:var(--accent); text-decoration:none; }
    .spec h2:hover .hl, .spec h3:hover .hl, .spec h4:hover .hl, .spec .hl:focus{ opacity:1; }
    .spec p, .spec li{ color:var(--text-2); max-width:76ch; }
    .spec strong{ color:var(--text); font-weight:600; }
    .spec code{ font-family:var(--wire); font-size:.86em; color:var(--accent); background:var(--accent-tint);
      border-radius:5px; padding:1px 5px; overflow-wrap:anywhere; }
    .spec pre{ background:var(--surface); border:1px solid var(--line); border-radius:12px;
      padding:16px 18px; overflow-x:auto; line-height:1.7; }
    .spec pre code{ background:none; padding:0; color:var(--text); font-size:.85rem; overflow-wrap:normal; }
    .spec blockquote{ margin:18px 0; border:1px solid var(--line); border-left:4px solid var(--accent);
      border-radius:10px; background:var(--surface); padding:12px 18px; }
    .spec blockquote p{ margin:6px 0; }
    .spec table{ border-collapse:collapse; margin:18px 0; display:block; overflow-x:auto;
      border:1px solid var(--line); border-radius:10px; }
    .spec th{ font-size:.85rem; font-weight:700; color:var(--text); text-align:left; padding:10px 14px;
      background:var(--surface); border-bottom:1px solid var(--line); white-space:nowrap; }
    .spec td{ padding:9px 14px; border-bottom:1px solid var(--line); font-size:.95rem; color:var(--text-2); vertical-align:top; }
    .spec tr:last-child td{ border-bottom:0; }
    .spec td:first-child{ color:var(--text); }
    .spec hr{ border:0; border-top:1px solid var(--line); margin:40px 0; }
    @media (max-width:900px){ .toc{ columns:1; } .spec-hero{ padding-top:40px; } }
    @media (max-width:700px){
      .spec h2{ font-size:1.45rem; margin-top:40px; }
      .spec h3{ font-size:1.12rem; }
      .spec pre{ padding:12px 14px; }
      .spec pre code{ font-size:.78rem; }
    }
  </style>
</head>
<body>
  <div class="layout">

    ${rail("spec")}

    <main class="main">

      <div class="wrap spec-hero">
        <span class="eyebrow">The specification</span>
        <h1>${esc(title)}</h1>
        <div class="metas">
          <span>version <b>${meta.version}</b></span>
          <span>status <b>${meta.status}</b></span>
          <span>date <b>${meta.date}</b></span>
        </div>
        <p class="canon">Rendered ${generated}${commit ? ` from commit <span class="mono">${commit}</span>` : ""}.
          The canonical source is SPEC.md, published with the conformance suite at
          <a href="${REPO_URL}">${REPO_URL}</a>
          (the <span class="mono">conformance/</span> fixtures this specification cites live there).</p>
        <nav class="toc" aria-label="Sections">
            ${tocHtml}
        </nav>
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

writeFileSync(resolve(OUT, "spec.html"), page);
console.log(`spec.html written: ${(page.length / 1024).toFixed(0)} KB, ${toc.length} sections, ${title}, ${meta.version} (${meta.date})${commit ? ", commit " + commit : ""}`);
