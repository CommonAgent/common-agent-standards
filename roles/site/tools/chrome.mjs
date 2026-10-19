// chrome.mjs: the parts every page of agentroles.ai shares: the head links,
// the theme bootstrap, the left menu, the footer and the closing script, and
// the head of each role and interface page.
// tools/build-spec.mjs uses it for the pages it writes; `node tools/chrome.mjs`
// rewrites the same parts of the hand-written pages between their marker
// comments, so a menu change is made here once. The layout follows
// agentsow.com, agentprocesses.ai and commonagent.net.
//
// The roles and interfaces in the menu, and the head of each of their pages
// (family, offering name, anchoring, version, the sections that define it),
// come from tools/registry.mjs, which reads them from roles/SPEC.md and
// roles/interfaces/. The menu ends with every other standard in
// standards.json under "The Common Agent Standards", with the family page at
// commonagent.net first.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { FAMILIES, INTERFACES, ROLES, ENTRIES, sections, specAnchor } from "./registry.mjs";

export const SITE = "https://agentroles.ai";
export const SUITE_REPO = "https://github.com/CommonAgent/common-agent-standards";
export const REPO_URL = `${SUITE_REPO}/tree/main/roles`;
export const FAMILY = "https://commonagent.net/";

const REGISTRY = resolve(dirname(fileURLToPath(import.meta.url)), "../../../standards.json");
export const SUITE = JSON.parse(readFileSync(REGISTRY, "utf8"));
export const ENTRY = SUITE.standards.find((s) => s.id === "roles");

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

// The mark is the old favicon's: a person, a head over shoulders, for the
// holder of a role.
export const MARK = `<svg class="mark" viewBox="0 0 32 32" width="26" height="26" aria-hidden="true" focusable="false"><rect x="3.5" y="3.5" width="25" height="25" rx="6" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="16" cy="12.6" r="4.2" fill="none" stroke="currentColor" stroke-width="2.3"/><path d="M8.8 24.4c1.8-3.9 4.4-5.6 7.2-5.6s5.4 1.7 7.2 5.6" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/></svg>`;

const chev = `<svg class="chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ext = `<span class="ext" aria-hidden="true">↗</span>`;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function rail(active) {
  const a = (href, label, key, external) =>
    `<a href="${href}"${key && key === active ? ' class="on" aria-current="page"' : ""}>${label}${external ? ext : ""}</a>`;
  const sec = (title, links, open) => `<details class="sec"${open ? " open" : ""}>
          <summary>${title}${chev}</summary>
          <div class="items">
          ${links.join("\n          ")}
          </div>
        </details>`;
  const has = (list) => list.some((e) => e.slug === active);
  const others = SUITE.standards.filter((s) => s.id !== "roles")
    .map((s) => a(s.site, s.name, "", true));
  return `<aside class="rail" id="rail">
      <div class="railhead">
        <a class="brand" href="/" aria-label="Agent Roles, home">${MARK}<span class="wm">Agent <b>Roles</b></span></a>
        <button class="iconbtn" id="theme" type="button" aria-label="Switch colour theme"><span class="to-dark"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 9.6A5.6 5.6 0 0 1 6.4 2.5a5.6 5.6 0 1 0 7.1 7.1z" fill="currentColor"/></svg></span><span class="to-light"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3.2" fill="currentColor"/><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M8 1v1.8M8 13.2V15M1 8h1.8M13.2 8H15M3 3l1.3 1.3M11.7 11.7L13 13M3 13l1.3-1.3M11.7 4.3L13 3"/></g></svg></span><span class="to-dark">Dark</span><span class="to-light">Light</span></button>
        <button class="iconbtn menubtn" id="menu" type="button" aria-expanded="false" aria-controls="rail"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>Menu</button>
      </div>
      <nav aria-label="Agent Roles">
        ${sec("Agent Roles", [
          a("/", "What it is", "home"),
          a("/roles.html", "What a role is", "roles"),
          a("/interfaces.html", "What an interface is", "interfaces"),
          a("/conformance.html", "How conformance is checked", "conformance"),
          a("/directory.html", "Every role and interface", "directory"),
        ], true)}
        ${FAMILIES.map((f, i) => sec(f.name, f.roles.map((r) => a(`/${r.slug}.html`, r.title, r.slug)), i === 0 || has(f.roles))).join("\n        ")}
        ${sec("Interfaces", INTERFACES.map((x) => a(`/${x.slug}.html`, x.title, x.slug)), has(INTERFACES))}
        ${sec("Reference", [
          a("/spec.html", "The specification", "spec"),
          a("/versions.html", "Versions and changelog", "versions"),
          a("/interfaces/", "Interface definitions", "interfaces/index"),
          a(`${REPO_URL}/conformance`, "Conformance checks", "", true),
          a(REPO_URL, "The source on GitHub", "", true),
        ], true)}
        ${sec("The Common Agent Standards", [a(`${FAMILY}standards.html`, "Every standard", "", true), ...others], true).replace('class="sec"', 'class="sec suite"')}
      </nav>
      <div class="foot">Agent Roles is one of the <a href="${FAMILY}">Common Agent Standards</a>.</div>
    </aside>`;
}

export const footer = `<footer class="sitefoot">
        <div class="wrap">
          <a href="/">Agent Roles</a>
          <a href="/roles.html">What a role is</a>
          <a href="/interfaces.html">What an interface is</a>
          <a href="/directory.html">Every role and interface</a>
          <a href="/spec.html">The specification</a>
          <a href="/versions.html">Versions and changelog</a>
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

export const pill = (anchoring) => `<span class="pill ${anchoring === "mesh-anchored" ? "anchored" : "portable"}">${anchoring}</span>`;

// The head of a role's or an interface's page: the name, then chips for the
// family, the offering or interface name, the version, the date and the
// anchoring, then the sections of the specification that define it.
export function entryHead(e) {
  const chip = (k, v) => `<span>${k} <b>${esc(v)}</b></span>`;
  const link = (sec) => `<a href="${specAnchor(sec)}">§${sec}</a>`;
  let chips, canon;
  if (e.kind === "role") {
    const primary = INTERFACES.find((x) => x.primaryOf === e);
    chips = [chip("family", e.family), chip("offering name", e.offering), e.alias ? chip("alias", e.alias) : "", chip("version", e.version), chip("date", e.date), pill(e.anchoring)];
    const where = e.last !== e.section ? `${link(e.section)} to ${link(e.last)}` : link(e.section);
    canon = `The specification defines this role in ${where}.${primary ? ` Its primary interface is <a href="/${primary.slug}.html">${primary.title.replace(/^The/, "the")}</a>.` : ""}`;
  } else {
    chips = [chip("name", e.name), chip("version", e.version), chip("date", e.date), pill(e.anchoring)];
    canon = `The specification defines this interface in ${link(e.section)}${e.primaryOf ? `, as the primary interface of <a href="/${e.primaryOf.slug}.html">${e.primaryOf.name}</a>` : ""}. Software reads its definition from <a href="/${e.file}">${e.file.replace("interfaces/", "")}</a>.`;
  }
  return `<h1>${esc(e.title)}</h1>
        <div class="metas">${chips.filter(Boolean).join("")}</div>
        <p class="canon">${canon}</p>`;
}

// The three families as cards, for the home page.
export function familiesHtml() {
  const words = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  const n = (k) => (k < words.length ? words[k] : String(k));
  return `<div class="cards three">
          ${FAMILIES.map((f) => `<div class="card family">
            <h3>${esc(f.name)}</h3>
            <p>They act on ${esc(f.actsOn)}. <span class="count">${n(f.roles.length)} ${f.roles.length === 1 ? "role" : "roles"}</span></p>
            <ul class="roles">${f.roles.map((r) => `<li><a href="/${r.slug}.html">${esc(r.title.replace(/^The /, ""))}</a></li>`).join("")}</ul>
          </div>`).join("\n          ")}
          </div>`;
}

// Rewrite the marked regions of the hand-written pages: every page in
// roles/site with chrome markers. A redirect stub has none and is left alone.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const files = readdirSync(ROOT).filter((f) => f.endsWith(".html"));
  for (const file of files.sort()) {
    const p = resolve(ROOT, file);
    let s = readFileSync(p, "utf8").replace(/\r\n/g, "\n");
    if (!s.includes("<!-- chrome:rail -->")) { console.log(`${file}: no chrome (a redirect)`); continue; }
    const key = file === "index.html" ? "home" : file === "404.html" ? "" : file.replace(/\.html$/, "");
    const entry = ENTRIES.find((e) => `${e.slug}.html` === file);
    const parts = { head: headLinks, rail: rail(key), footer, script: tailScript };
    if (entry) parts.entry = entryHead(entry);
    if (s.includes("<!-- registry:families -->")) {
      s = s.replace(/(<!-- registry:families -->)[\s\S]*?(<!-- \/registry:families -->)/, () => `<!-- registry:families -->\n          ${familiesHtml()}\n          <!-- /registry:families -->`);
    }
    for (const [name, html] of Object.entries(parts)) {
      const re = new RegExp(`(<!-- chrome:${name} -->)[\\s\\S]*?(<!-- /chrome:${name} -->)`);
      if (!re.test(s)) throw new Error(`${file}: no chrome:${name} markers`);
      s = s.replace(re, () => `<!-- chrome:${name} -->\n  ${html}\n  <!-- /chrome:${name} -->`);
    }
    writeFileSync(p, s);
    console.log(`${file}: chrome written`);
  }
}
