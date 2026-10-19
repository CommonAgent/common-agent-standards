// chrome.mjs: the parts every page of agentcollab.dev shares: the head links,
// the theme bootstrap, the left menu, the footer and the closing script.
// tools/build-spec.mjs uses it for the pages it writes; `node tools/chrome.mjs`
// rewrites the same parts of the hand-written pages (listed in PAGES below)
// between their marker comments, so a menu change is made here once. The
// layout follows agentprocesses.ai, agentmessaging.ai and commonagent.net.
//
// The menu lists every other entry in standards.json under "The Common Agent
// Standards", with the family page at commonagent.net first.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SITE = "https://agentcollab.dev";
export const SUITE_REPO = "https://github.com/CommonAgent/common-agent-standards";
export const REPO_URL = `${SUITE_REPO}/tree/main/guides/collab`;
export const FAMILY = "https://commonagent.net/";
export const SPONSOR = "https://agentmesh.ai/";

const REGISTRY = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../standards.json");
export const SUITE = JSON.parse(readFileSync(REGISTRY, "utf8"));
export const ENTRY = SUITE.standards.find((s) => s.id === "collab");

// The documents of the guide, in the order of the library table. `file` is the
// page each one gets; `mode` is live or asynchronous for a pattern, and empty
// for a frame, which every pattern uses.
export const FRAMES = [
  { src: "convening.md", file: "convening.html", name: "Convening", shape: "pre-pattern: run this first", frame: "a frame for every pattern" },
  { src: "floor.md", file: "floor.html", name: "The floor", shape: "floor modes and how they are enforced", frame: "a frame for live patterns" },
  { src: "lobby.md", file: "lobby.html", name: "The lobby", shape: "gathering a scheduled meeting", frame: "a frame for live patterns" },
  { src: "membership.md", file: "membership.html", name: "Membership", shape: "whether the cast may change", frame: "a frame for every pattern" },
];
export const PATTERNS = [
  { src: "patterns/briefing.md", file: "briefing.html", name: "Briefing", shape: "meeting: one speaks, all listen", membership: "open", mode: "live" },
  { src: "patterns/roll-call.md", file: "roll-call.html", name: "Roll call", shape: "meeting: each speaks once", membership: "open", mode: "live" },
  { src: "patterns/debrief.md", file: "debrief.html", name: "Debrief", shape: "meeting: the retrospective after the work", membership: "fixed", mode: "live" },
  { src: "patterns/critique-circle.md", file: "critique-circle.html", name: "Critique circle", shape: "distributed judgment", membership: "fixed-per-round", mode: "asynchronous" },
  { src: "patterns/bake-off.md", file: "bake-off.html", name: "Bake-off", shape: "centralized judgment", membership: "fixed", mode: "asynchronous" },
  { src: "patterns/assessment.md", file: "assessment.html", name: "Assessment", shape: "centralized judgment where everyone can pass", membership: "fixed", mode: "asynchronous" },
  { src: "patterns/approval.md", file: "approval.html", name: "Approval", shape: "distributed judgment: sign-off", membership: "fixed", mode: "asynchronous" },
  { src: "patterns/draft-review-merge.md", file: "draft-review-merge.html", name: "Draft, review, merge", shape: "owned artifact", membership: "open", mode: "asynchronous" },
  { src: "patterns/owner-contributors.md", file: "owner-contributors.html", name: "Owner and contributors", shape: "owned artifact", membership: "open", mode: "asynchronous" },
  { src: "patterns/rolling-synthesis.md", file: "rolling-synthesis.html", name: "Rolling synthesis", shape: "centralized judgment", membership: "open", mode: "asynchronous" },
  { src: "patterns/relay.md", file: "relay.html", name: "Relay", shape: "sequential", membership: "fixed-per-round", mode: "asynchronous" },
  { src: "patterns/layered-passes.md", file: "layered-passes.html", name: "Layered passes", shape: "sequential", membership: "fixed-per-round", mode: "asynchronous" },
  { src: "patterns/spec-then-build.md", file: "spec-then-build.html", name: "Spec, then build", shape: "low trust", membership: "fixed", mode: "asynchronous" },
  { src: "patterns/work-board.md", file: "work-board.html", name: "Work board", shape: "pulled work: claims and leases", membership: "open", mode: "asynchronous" },
];

export const headLinks = `<link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/site.css">
  <script>
  (function(){ var t=null; try{ t=localStorage.getItem('dev-theme'); }catch(e){}
    if(location.hash==='#dark') t='dark'; if(location.hash==='#light') t='light';
    if(t==='dark') document.documentElement.setAttribute('data-theme','dark'); })();
  </script>`;

// The mark: three agents posting to one shared record, drawn as an ordered
// list of entries.
export const MARK = `<svg class="mark" viewBox="0 0 32 32" width="26" height="26" aria-hidden="true" focusable="false"><circle cx="5" cy="6" r="3" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="5" cy="16" r="3" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="5" cy="26" r="3" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M8.2 6.6 14 10M8.4 16H14M8.2 25.4 14 22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><rect x="14.5" y="4" width="15" height="24" rx="3" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M18.5 10h7M18.5 16h7M18.5 22h4.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;

const chev = `<svg class="chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ext = `<span class="ext" aria-hidden="true">↗</span>`;

export function rail(active) {
  const a = (href, label, key, external) =>
    `<a href="${href}"${key && key === active ? ' class="on" aria-current="page"' : ""}>${label}${external ? ext : ""}</a>`;
  const key = (d) => d.file.replace(/\.html$/, "");
  const list = (docs) => docs.map((d) => a(`/${d.file}`, d.name, key(d))).join("\n          ");
  const others = SUITE.standards.filter((s) => s.id !== "collab")
    .map((s) => a(s.site, s.name, "", true)).join("\n          ");
  const sec = (title, items, open = true, cls = "sec") => `<details class="${cls}"${open ? " open" : ""}>
          <summary>${title}${chev}</summary>
          <div class="items">
          ${items}
          </div>
        </details>`;
  return `<aside class="rail" id="rail">
      <div class="railhead">
        <a class="brand" href="/" aria-label="Agent Collab, home">${MARK}<span class="wm">Agent <b>Collab</b></span></a>
        <button class="iconbtn" id="theme" type="button" aria-label="Switch colour theme"><span class="to-dark"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 9.6A5.6 5.6 0 0 1 6.4 2.5a5.6 5.6 0 1 0 7.1 7.1z" fill="currentColor"/></svg></span><span class="to-light"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3.2" fill="currentColor"/><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M8 1v1.8M8 13.2V15M1 8h1.8M13.2 8H15M3 3l1.3 1.3M11.7 11.7L13 13M3 13l1.3-1.3M11.7 4.3L13 3"/></g></svg></span><span class="to-dark">Dark</span><span class="to-light">Light</span></button>
        <button class="iconbtn menubtn" id="menu" type="button" aria-expanded="false" aria-controls="rail"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>Menu</button>
      </div>
      <nav aria-label="Agent Collab">
        ${sec("Agent Collab", [a("/", "What it is", "home"), a("/choosing.html", "Choosing a pattern", "choosing"), a("/library.html", "Reading the library", "library")].join("\n          "))}
        ${sec("Frames", list(FRAMES))}
        ${sec("Live patterns", list(PATTERNS.filter((p) => p.mode === "live")))}
        ${sec("Asynchronous patterns", list(PATTERNS.filter((p) => p.mode === "asynchronous")))}
        ${sec("Reference", [a("/versions.html", "Versions and changelog", "versions"), a(REPO_URL, "The source on GitHub", "", true)].join("\n          "))}
        ${sec("The Common Agent Standards", [a(`${FAMILY}standards.html`, "Every standard", "", true), others].join("\n          "), true, "sec suite")}
      </nav>
      <div class="foot">Agent Collab is a guide kept with the <a href="${FAMILY}">Common Agent Standards</a>.</div>
    </aside>`;
}

export const footer = `<footer class="sitefoot">
        <div class="wrap">
          <a href="/">Agent Collab</a>
          <a href="/choosing.html">Choosing a pattern</a>
          <a href="/library.html">Reading the library</a>
          <a href="/convening.html">Convening</a>
          <a href="/versions.html">Versions and changelog</a>
          <a href="${REPO_URL}">The source on GitHub</a>
          <a href="${FAMILY}">The Common Agent Standards</a>
          <span class="sponsor">Sponsored by <a href="${SPONSOR}">AgentMesh</a></span>
        </div>
      </footer>`;

export const tailScript = `<script>
  (function(){ var r=document.documentElement;
    document.getElementById('theme').addEventListener('click', function(){
      var dark = r.getAttribute('data-theme')!=='dark';
      if(dark) r.setAttribute('data-theme','dark'); else r.removeAttribute('data-theme');
      try{ localStorage.setItem('dev-theme', dark?'dark':'light'); }catch(e){} });
    var rail=document.getElementById('rail'), mb=document.getElementById('menu');
    mb.addEventListener('click', function(){ var o=rail.classList.toggle('open'); mb.setAttribute('aria-expanded', o?'true':'false'); });
  })();
  </script>`;

// The library table, written into the home page between <!-- table:library -->
// and <!-- /table:library --> so it always matches the menu.
export function libraryTable() {
  const row = (d, kind) => `<tr><td><a href="/${d.file}">${d.name}</a></td><td>${kind}</td><td>${d.shape}</td><td>${d.membership ? `<code>${d.membership}</code>` : "any"}</td></tr>`;
  return `<div class="tablebox">
            <table class="t library">
              <thead><tr><th>Document</th><th>Live or asynchronous</th><th>Shape</th><th>Membership</th></tr></thead>
              <tbody>
              ${FRAMES.map((d) => row(d, d.frame)).join("\n              ")}
              ${PATTERNS.map((d) => row(d, d.mode)).join("\n              ")}
              </tbody>
            </table>
          </div>`;
}

// Rewrite the marked regions of the hand-written pages.
const PAGES = { "index.html": "home", "choosing.html": "choosing", "404.html": "" };
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  for (const [file, key] of Object.entries(PAGES)) {
    const p = resolve(ROOT, file);
    let s = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
    const parts = { head: headLinks, rail: rail(key), footer, script: tailScript };
    if (file === "index.html") parts.library = libraryTable();
    for (const [name, html] of Object.entries(parts)) {
      const tag = name === "library" ? "table" : "chrome";
      const label = name === "library" ? "library" : name;
      const re = new RegExp(`(<!-- ${tag}:${label} -->)[\\s\\S]*?(<!-- /${tag}:${label} -->)`);
      if (!re.test(s)) throw new Error(`${file}: no ${tag}:${label} markers`);
      s = s.replace(re, () => `<!-- ${tag}:${label} -->\n  ${html}\n  <!-- /${tag}:${label} -->`);
    }
    writeFileSync(p, s);
    console.log(`${file}: chrome written`);
  }
}
