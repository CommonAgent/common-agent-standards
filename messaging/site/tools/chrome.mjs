// chrome.mjs: the parts every page of agentmessaging.ai shares: the head links,
// the theme bootstrap, the left menu, the footer and the closing script.
// tools/build-spec.mjs uses it for spec.html; `node tools/chrome.mjs` rewrites
// the same parts of the hand-written pages between their marker comments, so a
// menu change is made here once.
//
// The menu lists the other standards in standards.json under "The Common
// Agent Standards", with the family page at commonagent.net first, as on
// agentsow.com and the other sites of the suite. Agent Work Patterns is left
// out because it is being retired.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_URL = "https://github.com/CommonAgent/common-agent-standards/tree/main/messaging";
export const FAMILY = "https://commonagent.net/";
const LEFT_OUT = new Set(["messaging", "work-patterns"]);

const REGISTRY = resolve(dirname(fileURLToPath(import.meta.url)), "../../../standards.json");
export const SUITE = JSON.parse(readFileSync(REGISTRY, "utf8"));

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

const chev = `<svg class="chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ext = `<span class="ext" aria-hidden="true">↗</span>`;

export function rail(active) {
  const a = (href, label, key, external) =>
    `<a href="${href}"${key && key === active ?' class="on" aria-current="page"' : ""}>${label}${external ? ext : ""}</a>`;
  const others = SUITE.standards.filter((s) => !LEFT_OUT.has(s.id))
    .map((s) => a(s.site, s.name, "", true)).join("\n          ");
  return `<aside class="rail" id="rail">
      <div class="railhead">
        <a class="brand" href="/" aria-label="Agent Messaging home"><svg class="mark" viewBox="0 0 32 32" width="24" height="24" aria-hidden="true" focusable="false"><rect x="3" y="7" width="26" height="18" rx="3.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M4.5 9l11.5 8.5L27.5 9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg><span class="wm">Agent <b>Messaging</b></span></a>
        <button class="iconbtn" id="theme" type="button" aria-label="Switch colour theme"><span class="to-dark"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 9.6A5.6 5.6 0 0 1 6.4 2.5a5.6 5.6 0 1 0 7.1 7.1z" fill="currentColor"/></svg></span><span class="to-light"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3.2" fill="currentColor"/><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M8 1v1.8M8 13.2V15M1 8h1.8M13.2 8H15M3 3l1.3 1.3M11.7 11.7L13 13M3 13l1.3-1.3M11.7 4.3L13 3"/></g></svg></span><span class="to-dark">Dark</span><span class="to-light">Light</span></button>
        <button class="iconbtn menubtn" id="menu" type="button" aria-expanded="false" aria-controls="rail"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>Menu</button>
      </div>
      <nav aria-label="Agent Messaging">
        <details class="sec" open>
          <summary>Agent Messaging${chev}</summary>
          <div class="items">
          ${a("/", "What it is", "home")}
          ${a("/spec.html", "The specification", "spec")}
          ${a("/nats.html", "On NATS", "nats")}
          ${a("/rabbitmq.html", "On RabbitMQ", "rabbitmq")}
          ${a("/bindings.html", "Bindings", "bindings")}
          ${a("/conformance.html", "Conformance suite", "conformance")}
          ${a("/identity.html", "Bring your own identity", "identity")}
          ${a(REPO_URL, "On GitHub", "", true)}
          </div>
        </details>
        <details class="sec" open>
          <summary>Run it${chev}</summary>
          <div class="items">
          ${a("/run.html", "Start in five minutes", "run")}
          ${a("/run-broker.html", "Choosing a broker", "run-broker")}
          ${a("/run-agents.html", "Enrolling agents", "run-agents")}
          ${a("/run-admin.html", "The admin CLI", "run-admin")}
          ${a("/run-operate.html", "Upgrades and backups", "run-operate")}
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
      <div class="foot">Agent Messaging is one of the <a href="${FAMILY}">Common Agent Standards</a>. The reference implementation is the <a href="https://github.com/agent-messaging/agent-messaging-server">Agent Messaging Server</a>.</div>
    </aside>`;
}

export const footer = `<footer class="sitefoot">
        <div class="wrap">
          <span>Agent Messaging</span>
          <a href="/spec.html">The specification</a>
          <a href="/nats.html">On NATS</a>
          <a href="/rabbitmq.html">On RabbitMQ</a>
          <a href="/bindings.html">Bindings</a>
          <a href="/conformance.html">Conformance suite</a>
          <a href="/identity.html">Bring your own identity</a>
          <a href="/run.html">Run it</a>
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
const PAGES = { "index.html": "home", "nats.html": "nats", "rabbitmq.html": "rabbitmq", "bindings.html": "bindings", "conformance.html": "conformance", "identity.html": "identity", "run.html": "run", "run-broker.html": "run-broker", "run-agents.html": "run-agents", "run-admin.html": "run-admin", "run-operate.html": "run-operate", "404.html": "" };
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  for (const [file, key] of Object.entries(PAGES)) {
    const p = resolve(ROOT, file);
    let s = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
    const parts = { head: headLinks, rail: rail(key), footer, script: tailScript };
    for (const [name, html] of Object.entries(parts)) {
      const re = new RegExp(`(<!-- chrome:${name} -->)[\\s\\S]*?(<!-- /chrome:${name} -->)`);
      if (!re.test(s)) throw new Error(`${file}: no chrome:${name} markers`);
      s = s.replace(re, `$1\n  ${html}\n  $2`);
    }
    writeFileSync(p, s);
    console.log(`${file}: chrome written`);
  }
}
