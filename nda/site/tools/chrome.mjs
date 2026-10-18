// chrome.mjs: the parts every page of agentnda.net shares: the head links, the
// theme bootstrap, the left menu, the footer and the closing script.
// tools/build-spec.mjs uses it for the pages it writes; `node tools/chrome.mjs`
// rewrites the same parts of the hand-written pages (listed in PAGES below)
// between their marker comments, so a menu change is made here once. The
// layout follows agentprocesses.ai, agentmessaging.ai and commonagent.net.
//
// The menu lists the other standards in standards.json under "The Common
// Agent Standards", with the family page at commonagent.net first. Agent Work
// Patterns is left out because it is being retired.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SITE = "https://agentnda.net";
export const SUITE_REPO = "https://github.com/CommonAgent/common-agent-standards";
export const REPO_URL = `${SUITE_REPO}/tree/main/nda`;
export const FAMILY = "https://commonagent.net/";
const LEFT_OUT = new Set(["nda", "work-patterns"]);

const REGISTRY = resolve(dirname(fileURLToPath(import.meta.url)), "../../../standards.json");
export const SUITE = JSON.parse(readFileSync(REGISTRY, "utf8"));
export const ENTRY = SUITE.standards.find((s) => s.id === "nda");

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

// The mark is the favicon's: a document with its corner folded, a blue line
// and an amber line for the only two grades an NDA clause may carry, evidence
// and recorded, and a seal for the signatures.
export const MARK = `<svg class="mark" viewBox="0 0 32 32" width="26" height="26" aria-hidden="true" focusable="false"><path d="M9 3.5h10l6 6V26a2.5 2.5 0 0 1-2.5 2.5H9A2.5 2.5 0 0 1 6.5 26V6A2.5 2.5 0 0 1 9 3.5z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M19 3.5V9.5h6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M11 14h10" stroke="var(--blue)" stroke-width="2.4" stroke-linecap="round"/><path d="M11 19h5" stroke="var(--amber)" stroke-width="2.4" stroke-linecap="round"/><circle cx="20.5" cy="22.5" r="2.6" fill="var(--violet)"/></svg>`;

const chev = `<svg class="chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ext = `<span class="ext" aria-hidden="true">↗</span>`;

export function rail(active) {
  const a = (href, label, key, external) =>
    `<a href="${href}"${key && key === active ? ' class="on" aria-current="page"' : ""}>${label}${external ? ext : ""}</a>`;
  const others = SUITE.standards.filter((s) => !LEFT_OUT.has(s.id))
    .map((s) => a(s.site, s.name, "", true)).join("\n          ");
  return `<aside class="rail" id="rail">
      <div class="railhead">
        <a class="brand" href="/" aria-label="Agent NDA, home">${MARK}<span class="wm">Agent <b>NDA</b></span></a>
        <button class="iconbtn" id="theme" type="button" aria-label="Switch colour theme"><span class="to-dark"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 9.6A5.6 5.6 0 0 1 6.4 2.5a5.6 5.6 0 1 0 7.1 7.1z" fill="currentColor"/></svg></span><span class="to-light"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3.2" fill="currentColor"/><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M8 1v1.8M8 13.2V15M1 8h1.8M13.2 8H15M3 3l1.3 1.3M11.7 11.7L13 13M3 13l1.3-1.3M11.7 4.3L13 3"/></g></svg></span><span class="to-dark">Dark</span><span class="to-light">Light</span></button>
        <button class="iconbtn menubtn" id="menu" type="button" aria-expanded="false" aria-controls="rail"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>Menu</button>
      </div>
      <nav aria-label="Agent NDA">
        <details class="sec" open>
          <summary>Agent NDA${chev}</summary>
          <div class="items">
          ${a("/", "What it is", "home")}
          ${a("/clauses.html", "What an Agent NDA says", "clauses")}
          ${a("/gated.html", "Gated RFPs", "gated")}
          ${a("/parties.html", "Many parties", "parties")}
          ${a("/example.html", "An example", "example")}
          ${a("/questions.html", "Questions and answers", "questions")}
          </div>
        </details>
        <details class="sec" open>
          <summary>Reference${chev}</summary>
          <div class="items">
          ${a("/spec.html", "Specification", "spec")}
          ${a("/versions.html", "Versions", "versions")}
          ${a(`${REPO_URL}/conformance`, "Conformance fixtures", "", true)}
          ${a(REPO_URL, "The source on GitHub", "", true)}
          </div>
        </details>
        <details class="sec suite" open>
          <summary>The Common Agent Standards${chev}</summary>
          <div class="items">
          ${a(FAMILY, "Every standard", "", true)}
          ${others}
          </div>
        </details>
      </nav>
      <div class="foot">Agent NDA is one of the <a href="${FAMILY}">Common Agent Standards</a>.</div>
    </aside>`;
}

export const footer = `<footer class="sitefoot">
        <div class="wrap">
          <a href="/">Agent NDA</a>
          <a href="/clauses.html">What an Agent NDA says</a>
          <a href="/gated.html">Gated RFPs</a>
          <a href="/parties.html">Many parties</a>
          <a href="/example.html">An example</a>
          <a href="/questions.html">Questions and answers</a>
          <a href="/spec.html">Specification</a>
          <a href="/versions.html">Versions</a>
          <a href="${REPO_URL}">The source on GitHub</a>
          <a href="${FAMILY}">The Common Agent Standards</a>
          <span class="sponsor">Sponsored by <a href="${SUITE.sponsor.url}">${SUITE.sponsor.name}</a></span>
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
const PAGES = {
  "index.html": "home", "clauses.html": "clauses", "gated.html": "gated", "parties.html": "parties",
  "example.html": "example",
  "questions.html": "questions", "404.html": "",
}
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
