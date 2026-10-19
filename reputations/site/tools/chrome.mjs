// chrome.mjs: the parts every page of agentreputations.com shares: the head
// links, the theme bootstrap, the left menu, the footer and the closing script.
// tools/build-spec.mjs uses it for the pages it writes; `node tools/chrome.mjs`
// rewrites the same parts of the hand-written pages (listed in PAGES below)
// between their marker comments, so a menu change is made here once. The
// layout follows agentprocesses.ai, agentmessaging.ai and commonagent.net.
//
// The menu lists every other standard in standards.json under "The Common
// Agent Standards", with the family page at commonagent.net first. Agent Work
// Patterns is left out of the menu because it is being retired.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SITE = "https://agentreputations.com";
export const SUITE_REPO = "https://github.com/CommonAgent/common-agent-standards";
export const REPO_URL = `${SUITE_REPO}/tree/main/reputations`;
export const FAMILY = "https://commonagent.net/";
export const SPONSOR = "https://agentmesh.ai/";

const REGISTRY = resolve(dirname(fileURLToPath(import.meta.url)), "../../../standards.json");
export const SUITE = JSON.parse(readFileSync(REGISTRY, "utf8"));
export const ENTRY = SUITE.standards.find((s) => s.id === "reputations");
const LEFT_OUT = new Set(["reputations", "work-patterns"]);

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

// The mark: a record that grows. Three bars, each taller than the last, and
// the newest one filled.
export const MARK = `<svg class="mark" viewBox="0 0 32 32" width="26" height="26" aria-hidden="true" focusable="false"><rect x="4" y="18" width="6" height="10" rx="1.5" fill="none" stroke="currentColor" stroke-width="2.2"/><rect x="13" y="11" width="6" height="17" rx="1.5" fill="none" stroke="currentColor" stroke-width="2.2"/><rect x="22" y="4" width="6" height="24" rx="1.5" fill="currentColor"/></svg>`;

const chev = `<svg class="chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ext = `<span class="ext" aria-hidden="true">↗</span>`;

export function rail(active) {
  const a = (href, label, key, external) =>
    `<a href="${href}"${key && key === active ? ' class="on" aria-current="page"' : ""}>${label}${external ? ext : ""}</a>`;
  const others = SUITE.standards.filter((s) => !LEFT_OUT.has(s.id))
    .map((s) => a(s.site, s.name, "", true)).join("\n          ");
  return `<aside class="rail" id="rail">
      <div class="railhead">
        <a class="brand" href="/" aria-label="Agent Reputations, home">${MARK}<span class="wm">Agent <b>Reputations</b></span></a>
        <button class="iconbtn" id="theme" type="button" aria-label="Switch colour theme"><span class="to-dark"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 9.6A5.6 5.6 0 0 1 6.4 2.5a5.6 5.6 0 1 0 7.1 7.1z" fill="currentColor"/></svg></span><span class="to-light"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3.2" fill="currentColor"/><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M8 1v1.8M8 13.2V15M1 8h1.8M13.2 8H15M3 3l1.3 1.3M11.7 11.7L13 13M3 13l1.3-1.3M11.7 4.3L13 3"/></g></svg></span><span class="to-dark">Dark</span><span class="to-light">Light</span></button>
        <button class="iconbtn menubtn" id="menu" type="button" aria-expanded="false" aria-controls="rail"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>Menu</button>
      </div>
      <nav aria-label="Agent Reputations">
        <details class="sec" open>
          <summary>Agent Reputations${chev}</summary>
          <div class="items">
          ${a("/", "What it is", "home")}
          ${a("/why.html", "Why reputation", "why")}
          ${a("/evidence.html", "Evidence", "evidence")}
          ${a("/scores.html", "How scores work", "scores")}
          ${a("/trust.html", "Trust and gaming", "trust")}
          ${a("/developers.html", "For developers", "developers")}
          </div>
        </details>
        <details class="sec" open>
          <summary>Reference${chev}</summary>
          <div class="items">
          ${a("/spec.html", "The specification", "spec")}
          ${a("/spec-a2a-reputation.html", "The A2A Reputation extension", "spec-a2a-reputation")}
          ${a("/versions.html", "Versions and changelog", "versions")}
          ${a(REPO_URL, "The source on GitHub", "", true)}
          </div>
        </details>
        <details class="sec suite" open>
          <summary>The Common Agent Standards${chev}</summary>
          <div class="items">
          ${a(`${FAMILY}standards.html`, "Every standard", "", true)}
          ${others}
          </div>
        </details>
      </nav>
      <div class="foot">Agent Reputations is one of the <a href="${FAMILY}">Common Agent Standards</a>.</div>
    </aside>`;
}

export const footer = `<footer class="sitefoot">
        <div class="wrap">
          <a href="/">Agent Reputations</a>
          <a href="/why.html">Why reputation</a>
          <a href="/evidence.html">Evidence</a>
          <a href="/scores.html">How scores work</a>
          <a href="/trust.html">Trust and gaming</a>
          <a href="/developers.html">For developers</a>
          <a href="/spec.html">The specification</a>
          <a href="/versions.html">Versions and changelog</a>
          <a href="${REPO_URL}">The source on GitHub</a>
          <a href="${FAMILY}">The Common Agent Standards</a>
          <span>Sponsored by <a href="${SPONSOR}">AgentMesh</a></span>
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

// Rewrite the marked regions of the hand-written pages.
const PAGES = { "index.html": "home", "why.html": "why", "evidence.html": "evidence", "scores.html": "scores", "trust.html": "trust", "developers.html": "developers", "404.html": "" };
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  for (const [file, key] of Object.entries(PAGES)) {
    const p = resolve(ROOT, file);
    let s = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
    const parts = { head: headLinks, rail: rail(key), footer, script: tailScript };
    for (const [name, html] of Object.entries(parts)) {
      const re = new RegExp(`(<!-- chrome:${name} -->)[\\s\\S]*?(<!-- /chrome:${name} -->)`);
      if (!re.test(s)) throw new Error(`${file}: no chrome:${name} markers`);
      s = s.replace(re, () => `<!-- chrome:${name} -->\n  ${html}\n  <!-- /chrome:${name} -->`);
    }
    writeFileSync(p, s);
    console.log(`${file}: chrome written`);
  }
}
