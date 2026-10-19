// build-spec.mjs: write the generated pages and files of agentroles.ai from
// roles/ in the Common Agent Standards repository.
//
//   node roles/site/tools/build-spec.mjs --out <folder>
//
// It writes, into the output folder:
//   directory.html              every role and interface, read through
//                               tools/registry.mjs from ROLES.md and interfaces/
//   interfaces/index.html       the interface definitions, from interfaces/index.json
//   interfaces/*.json           roles/interfaces/, copied unchanged
//   checks/catalog-check.mjs    roles/conformance/catalog-check.mjs, copied
//                               unchanged, at the address §33 gives for it
//   SPEC.md                     a short note at the address the old site served
//                               the specification at, pointing to the directory
//
// Agent Roles is a guide of working descriptions, so the site has no
// specification page and no versions page. ROLES.md is the source the
// directory, the menu and the head of each role page are read from, and the
// menu links to it on GitHub.
//
// tools/render-site.sh at the repository root copies the hand-written pages
// (index.html, the role and interface pages, 404.html, site.css and the rest)
// beside them, moves every link under the base (/draft/ or /<version>/),
// checks contrast and publishes. The generated pages are never committed and
// never edited by hand.
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE, SUITE_REPO, REPO_URL, ENTRY, headLinks, rail, footer, tailScript, pill } from "./chrome.mjs";
import { FAMILIES, ROLES, INTERFACES, SOURCE } from "./registry.mjs";

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const STANDARD = resolve(HERE, "..");
const REPO = resolve(STANDARD, "..");
const arg = (flag) => { const i = process.argv.indexOf(flag); return i >= 0 ? process.argv[i + 1] : undefined; };
if (!arg("--out")) throw new Error("usage: node roles/site/tools/build-spec.mjs --out <folder>");
const OUT = resolve(arg("--out"));
mkdirSync(OUT, { recursive: true });

const read = (rel) => readFileSync(resolve(STANDARD, rel), "utf8").replace(/\r\n/g, "\n");
const git = (...a) => execFileSync("git", ["-C", REPO, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
let commit = "";
try { git("diff", "--quiet", "HEAD", "--", "roles"); commit = git("rev-parse", "--short=8", "HEAD"); } catch { /* uncommitted or not a repository */ }

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const plain = (html) => html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const hl = (id) => `<a class="hl" href="#${id}" aria-label="Link to this section">#</a>`;

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
  <meta property="og:image:alt" content="Agent Roles. Working descriptions of the jobs and exchanges that recur wherever agents work.">
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

// ── the guide ───────────────────────────────────────────────────────────────
const md = read("ROLES.md");
const head = md.match(/^# (.+)\n+\*\*Version:\*\*\s*(.+)\n\*\*Status:\*\*\s*(.+)\n\*\*Date:\*\*\s*(.+)\n/);
if (!head) throw new Error("ROLES.md does not start with the title and the Version, Status and Date lines");
const [, TITLE, VERSION, , DATE] = head.map((s) => s.trim());
if (VERSION !== ENTRY.version) throw new Error(`ROLES.md carries ${VERSION} and standards.json says ${ENTRY.version}`);

// ── the directory ───────────────────────────────────────────────────────────
{
  const row = (e, nameCol) => `  <tr><td class="name"><a href="/${e.slug}.html">${esc(e.title)}</a> ${pill(e.anchoring)}</td><td><code>${esc(nameCol)}</code></td><td>${esc(e.summary)}</td></tr>`;
  const table = (list, head) => `<div class="tablebox"><table class="t">
  <thead><tr><th>${head}</th><th>${head === "Role" ? "Offering name" : "Name"}</th><th>What it does</th></tr></thead>
  <tbody>
${list.map((e) => row(e, e.offering)).join("\n")}
  </tbody>
</table></div>`;
  const words = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
  const count = (n) => words[n] ?? String(n);
  const aliases = ROLES.filter((r) => r.alias);
  const body = `<h2 id="roles">The roles${hl("roles")}</h2>
<p>Agent Roles describes ${ROLES.length} roles in ${count(FAMILIES.length)} families, grouped by what each acts on. A family is a way of finding a role and says nothing about rank. The descriptions are working ones and will change as we learn. Each role carries one of two labels: <span class="pill anchored">mesh-anchored</span> when it can do its job only on a platform that holds the records, grants or clearing it reads, and <span class="pill portable">portable</span> when it conforms anywhere. <a href="/conformance.html">How a holder is checked</a> says more about the labels.</p>
<p>${aliases.map((r, i) => `${i ? r.name : r.title} was published as ${r.alias.replace(/^role-/, "the ").replace(/-/g, " ")}`).join(", and ")}. Both old offering names stay reserved as aliases, so an agent that offers either name still holds the role.</p>
<div class="dir">
${FAMILIES.map((f) => `<h3 id="${f.name.toLowerCase().replace(/ /g, "-")}">${esc(f.name)}: ${esc(f.actsOn)}${hl(f.name.toLowerCase().replace(/ /g, "-"))}</h3>\n${table(f.roles, "Role")}`).join("\n")}
</div>
<p>A job gets a role when it recurs often enough to be worth describing: an artifact in, an artifact out, and a check the holder does not control. <a href="${SOURCE}#32-what-earns-a-page">Section 3.2 of ROLES.md</a> states the rule.</p>
<h2 id="interfaces">The interfaces${hl("interfaces")}</h2>
<p>Agent Roles describes ${count(INTERFACES.length)} interfaces. The worker and the manager face each other, because an interface with only one side published is half a contract. The entryway runs before any relationship exists. The deployer, the builder and the evaluator are the primary interfaces of the deployment manager, the package maker and the conformance checker. Revisable work lets a delivered job be changed without being redone. The lifecycle lets an agent's owner or the operator of its mesh pause, resume or stop it.</p>
${table(INTERFACES, "Interface")}
<p>The package maker, the deployment manager and the conformance checker form a loop. The package maker turns a description into a package, the deployment manager stands that package up as a running agent, and the conformance checker checks that what is running does the job the package describes. The process runner is the first role whose job spans several agents.</p>
<p>Software reads the interfaces from their <a href="/interfaces/">definition files</a>.</p>`;
  write("directory.html", page({
    file: "directory.html", active: "directory",
    title: "Every role and interface: Agent Roles",
    description: `Every role and interface Agent Roles describes, with what each one does, its name and its anchoring: ${ROLES.length} roles in ${FAMILIES.length} families, and ${INTERFACES.length} interfaces.`,
    h1: "Every role and interface",
    canon: `This page is built from ${source("ROLES.md")} and ${source("interfaces/index.json")}, so it lists every role and interface they describe.`,
    toc: [], body,
  }));
}

// ── the interface definitions ───────────────────────────────────────────────
{
  for (const f of readdirSync(resolve(STANDARD, "interfaces")).filter((f) => f.endsWith(".json"))) copy(`interfaces/${f}`, `interfaces/${f}`);
  const rows = INTERFACES.map((x) => `  <tr><td><code>${esc(x.name)}</code></td><td>${esc(x.version)}</td><td><a href="/${x.file}">${esc(x.file.replace("interfaces/", ""))}</a></td><td><a href="/${x.slug}.html">${esc(x.title.replace(/^The/, "the"))}</a></td></tr>`).join("\n");
  const body = `<p>Each interface has a JSON file that lists its exchanges, copied from ROLES.md. Programs read the JSON files, and people read the pages. If a file and ROLES.md ever disagree, follow ROLES.md.</p>
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
    description: "The machine-readable definition of each interface Agent Roles describes: the exchanges an implementer answers and what each answer carries.",
    h1: "Interface definitions",
    canon: `The files are ${source("interfaces/")}, copied unchanged.`,
    body,
  }));
}

// ── the conformance check and the Markdown ──────────────────────────────────
copy("conformance/catalog-check.mjs", "checks/catalog-check.mjs");
// The old site served the specification at /SPEC.md. A bucket cannot
// redirect a Markdown file, so the address keeps a short note in its place.
writeFileSync(resolve(OUT, "SPEC.md"), `# Agent Roles has moved\n\nAgent Roles is a guide of working descriptions, and this file is no longer published here.\n\n- Every role and interface: ${SITE}/directory.html\n- The descriptions, ROLES.md: ${SOURCE}\n`);
console.log("SPEC.md written: a note that points to the directory");

// ── the home page's version line ────────────────────────────────────────────
{
  const p = resolve(OUT, "index.html");
  if (existsSync(p)) {
    const s = readFileSync(p, "utf8");
    const re = /(<!-- spec:version -->)[\s\S]*?(<!-- \/spec:version -->)/;
    if (!re.test(s)) throw new Error("index.html: no spec:version markers");
    writeFileSync(p, s.replace(re, () => `<!-- spec:version -->This is version ${esc(VERSION)} of the descriptions, dated ${esc(DATE)}.<!-- /spec:version -->`));
    console.log("index.html: spec:version filled");
  }
}

console.log(`${TITLE} ${VERSION} (${DATE})${commit ? `, commit ${commit}` : ", no commit stamp"}; written to ${OUT}`);
