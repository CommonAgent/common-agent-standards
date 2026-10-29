// chrome.mjs: the parts every page of agentemailing.ai shares: the head links,
// the theme bootstrap, the left menu, the footer and the closing script.
// tools/build-spec.mjs uses it for spec.html and versions.html;
// `node emailing/site/tools/chrome.mjs` rewrites the same parts of the
// hand-written pages between their marker comments, so a menu change is made
// here once.
//
// The menu lists the other standards in standards.json under "The Common Agent
// Standards", with the family page at commonagent.net first, as on the other
// sites of the suite. Agent Work Patterns is left out because it is being
// retired.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SUITE_REPO = "https://github.com/CommonAgent/common-agent-standards";
export const REPO_URL = `${SUITE_REPO}/tree/main/emailing`;
export const FAMILY = "https://commonagent.net/";
export const SITE = "https://agentemailing.ai";
const LEFT_OUT = new Set(["emailing", "work-patterns"]);

const REGISTRY = resolve(dirname(fileURLToPath(import.meta.url)), "../../../standards.json");
export const SUITE = JSON.parse(readFileSync(REGISTRY, "utf8"));
export const ENTRY = SUITE.standards.find((s) => s.id === "emailing");
export const VERSION = ENTRY.version;

export const MARK = `<svg class="mark" viewBox="0 0 32 32" width="24" height="24" aria-hidden="true" focusable="false"><rect x="2.5" y="7" width="23" height="17" rx="3.2" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M4 9l10 7.5L24 9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="25" cy="23" r="5.4" style="fill:var(--surface)" stroke="currentColor" stroke-width="2.2"/><path d="M22.6 23.1l1.7 1.7 3-3.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

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

/** The meta tags a page shares with the other sites of the suite: its
 *  canonical address and its social preview. `path` is "" for the front page. */
export function social({ path, title, description, type = "article" }) {
  const url = `${SITE}/${path}`;
  const e = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  return `<meta property="og:type" content="${type}">
  <meta property="og:site_name" content="Agent Emailing">
  <meta property="og:title" content="${e(title)}">
  <meta property="og:description" content="${e(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE}/brand/png/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Agent Emailing. Signed agent messages carried by ordinary email, through any email provider.">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${SITE}/brand/png/og-image.png">
  <link rel="canonical" href="${url}">`;
}

const chev = `<svg class="chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ext = `<span class="ext" aria-hidden="true">↗</span>`;

export function rail(active) {
  const a = (href, label, key, external) =>
    `<a href="${href}"${key && key === active ? ' class="on" aria-current="page"' : ""}>${label}${external ? ext : ""}</a>`;
  const others = SUITE.standards.filter((s) => !LEFT_OUT.has(s.id))
    .map((s) => a(s.site, s.name, "", true)).join("\n          ");
  return `<aside class="rail" id="rail">
      <div class="railhead">
        <a class="brand" href="/" aria-label="Agent Emailing home">${MARK}<span class="wm">Agent <b>Emailing</b></span></a>
        <button class="iconbtn" id="theme" type="button" aria-label="Switch colour theme"><span class="to-dark"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 9.6A5.6 5.6 0 0 1 6.4 2.5a5.6 5.6 0 1 0 7.1 7.1z" fill="currentColor"/></svg></span><span class="to-light"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3.2" fill="currentColor"/><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M8 1v1.8M8 13.2V15M1 8h1.8M13.2 8H15M3 3l1.3 1.3M11.7 11.7L13 13M3 13l1.3-1.3M11.7 4.3L13 3"/></g></svg></span><span class="to-dark">Dark</span><span class="to-light">Light</span></button>
        <button class="iconbtn menubtn" id="menu" type="button" aria-expanded="false" aria-controls="rail"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>Menu</button>
      </div>
      <nav aria-label="Agent Emailing">
        <details class="sec" open>
          <summary>Agent Emailing${chev}</summary>
          <div class="items">
          ${a("/", "What it is", "home")}
          ${a("/getting-started.html", "Get started", "start")}
          ${a("/spec.html", "The specification", "spec")}
          ${a("/example.html", "An example", "example")}
          ${a("/providers.html", "Email providers", "providers")}
          ${a("/providers.html#test", "Conformance fixtures", "")}
          ${a("/versions.html", "Versions and changelog", "versions")}
          ${a(REPO_URL, "On GitHub", "", true)}
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
      <div class="foot">Agent Emailing is one of the <a href="${FAMILY}">Common Agent Standards</a>, built on <a href="https://agentmessaging.ai/">Agent Messaging</a>. Sponsored by <a href="${SUITE.sponsor.url}">${SUITE.sponsor.name}</a>.</div>
    </aside>`;
}

export const footer = `<footer class="sitefoot">
        <div class="wrap">
          <span>Agent Emailing</span>
          <a href="/getting-started.html">Get started</a>
          <a href="/spec.html">The specification</a>
          <a href="/example.html">An example</a>
          <a href="/providers.html">Email providers</a>
          <a href="/versions.html">Versions</a>
          <a href="${REPO_URL}">GitHub</a>
          <a href="${FAMILY}">The Common Agent Standards</a>
          <span>Sponsored by <a href="${SUITE.sponsor.url}">${SUITE.sponsor.name}</a></span>
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
const PAGES = { "index.html": "home", "getting-started.html": "start", "example.html": "example", "providers.html": "providers", "404.html": "" };
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
