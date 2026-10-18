// build-home.mjs: the front page of commonagent.net, the home of the Common
// Agent Standards, made from standards.json at the root of this repository.
//
//   node site/tools/build-home.mjs [--out <folder>] [--draft]
//
// common-agent/site/tools/build-spec.mjs calls renderHome() when it renders the
// site, so the page is written with the pages of the Common Agent Specification
// and moves under the same base path (/draft/ or /<version>/) with them. Run on
// its own, this writes index.html and the suite's social image into --out
// (default site/dist) for a quick look.
//
// The page leads with the Common Agent Specification, the base, then gives a
// card per Common Agent Standard and per guide: its version, its status, its
// own site and its folder on GitHub. Nothing on it is written by hand except
// the few sentences below that say what the suite is, and the two explainer
// videos just below the hero (VIDEOS).
import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE, SUITE, SUITE_REPO, headLinks, rail, footer, tailScript } from "../../common-agent/site/tools/chrome.mjs";

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const ico = (paths) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths}</svg>`;
const ICONS = {
  book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  layers: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  branch: '<line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  question: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  compass: '<path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/><circle cx="12" cy="12" r="10"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  play: '<path d="m10 8 6 4-6 4Z"/><circle cx="12" cy="12" r="10"/>',
  // one per standard, from the Lucide set the rest of the site uses
  messaging: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  naming: '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>',
  mandate: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  rfp: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  sow: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>',
  reputations: '<path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/><circle cx="12" cy="8" r="6"/>',
  roles: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
  processes: '<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',
  collab: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
};
const COLOURS = ["c-mint", "c-blue", "c-violet", "c-amber"];
const ext = `<span class="ext" aria-hidden="true">↗</span>`;
const folderUrl = (s) => `${SUITE_REPO}/tree/main/${s.folder}`;

// The explainer videos, side by side just below the hero. The MP4s and their
// posters are not in this repository: they are uploaded to /media/ in the
// site's bucket, which deploy.sh never writes or deletes. Their addresses are
// absolute, so the /draft/ and /<version>/ copies of this page play the same
// files, and the link check of a rendered site does not look for them in it.
const MEDIA = `${SITE}/media`;
const VIDEOS = [
  { title: "The Common Agent, Part 1", file: "common-agent-part-1", length: "9:15", colour: "c-violet" },
  { title: "The Common Agent, Part 2", file: "common-agent-part-2", length: "4:44", colour: "c-mint" },
];
function video(v) {
  const mp4 = `${MEDIA}/${v.file}.mp4`;
  return `<li class="vid ${v.colour}">
              <video controls preload="metadata" playsinline poster="${MEDIA}/${v.file}.jpg" width="1920" height="1080" aria-label="${esc(v.title)}">
                <source src="${mp4}" type="video/mp4">
                <a href="${mp4}">${esc(v.title)} (MP4)</a>
              </video>
              <div class="cap"><h3>${esc(v.title)}</h3><p class="meta"><span>length <b>${esc(v.length)}</b></span></p></div>
            </li>`;
}

function card(s, i) {
  const colour = COLOURS[i % COLOURS.length];
  const host = new URL(s.site).host;
  const parts = (s.parts ?? []).length
    ? `<p class="parts">Also in its folder: ${s.parts.map((p) => esc(p.name)).join(", ")}.</p>`
    : "";
  return `<li class="std ${colour}" id="${esc(s.id)}">
              <div class="top"><span class="chip">${ico(ICONS[s.id] ?? ICONS.layers)}</span>
                <div><h3>${esc(s.name)}</h3>
                <p class="meta"><span>version <b>${esc(s.version)}</b></span><span>status <b>${esc(s.status)}</b></span></p></div></div>
              <p class="sum">${esc(s.summary)}</p>
              ${parts}
              <p class="links"><a href="${esc(s.site)}">${ico(ICONS.globe)}${esc(host)}${ext}</a><a href="${esc(folderUrl(s))}">${ico(ICONS.branch)}${esc(s.folder)}/ on GitHub${ext}</a></p>
            </li>`;
}

/** The page. `draft` marks it as the main branch's copy. */
export function renderHome({ draft = false } = {}) {
  const base = SUITE.standards.find((s) => s.kind === "base");
  const standards = SUITE.standards.filter((s) => s.kind === "standard");
  const guides = SUITE.standards.filter((s) => s.kind === "guide");
  const title = SUITE.suite;
  const description = `${title} are a suite of open specifications for agents. The Common Agent Specification is the base, and every Common Agent Standard builds on it. AgentMesh sponsors the suite.`;
  const stamp = draft
    ? `This copy follows the main branch of the <a href="${SUITE_REPO}">repository</a>. The published copy is at <a href="${SITE}/">commonagent.net</a>.`
    : `Made from <a href="${SUITE_REPO}/blob/main/standards.json">standards.json</a>, the registry of the suite.`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script async src="/ga.js"></script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(title)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${SITE}/">
  <meta property="og:image" content="${SITE}/brand/png/og-suite.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="The Common Agent Standards. The Common Agent Specification and the standards built on it">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${SITE}/brand/png/og-suite.png">
  <meta name="twitter:image:alt" content="The Common Agent Standards. The Common Agent Specification and the standards built on it">
  <link rel="canonical" href="${SITE}/">
  ${headLinks}
</head>
<body>
  <div class="layout">

    ${rail("home")}

    <main class="main">
      <header class="herobg">
      <div class="wrap hero">
        <div class="hero-grid">
          <div>
            <span class="eyebrow">${ico(ICONS.layers)}A suite of open standards for agents</span>
            <h1>${esc(title)}</h1>
            <p class="lede">The Common Agent Standards are open specifications for agents that
              work for people and organizations. The Common Agent Specification is the base. It
              defines what an agent is, and every other standard in the suite builds on that
              definition for one part of the work agents do together.</p>
            <div class="cta">
              <a class="btn btn-primary" href="/spec.html">${ico(ICONS.book)}Read the Common Agent Specification</a>
              <a class="btn btn-ghost" href="#standards">${ico(ICONS.layers)}Every standard</a>
            </div>
            <p class="version">${stamp}</p>
          </div>
          <div class="quick">
            <div class="bar">${ico(ICONS.compass)}What the suite holds</div>
            <ol class="steps suite-count">
              <li><span><b>The Common Agent Specification</b>, the base: what an agent is.</span></li>
              <li><span><b>${standards.length} Common Agent Standards</b>, each for one part of the work.</span></li>
              <li><span><b>${guides.length === 1 ? "One guide" : `${guides.length} guides`}</b>, written for agents to read and follow.</span></li>
            </ol>
            <p class="note">Every one of them is in <a href="${SUITE_REPO}">one repository</a>, with its
              version, its changelog and its own site.</p>
          </div>
        </div>
      </div>
      </header>

      <section class="band tinted" id="videos">
        <div class="wrap">
          <p class="kicker">${ico(ICONS.play)}Two short videos</p>
          <h2>The Common Agent, explained</h2>
          <p>Part 1 looks at a single agent from the outside. Part 2 puts that agent on a
            network, among many others.</p>
          <ol class="vids">
            ${VIDEOS.map(video).join("\n            ")}
          </ol>
        </div>
      </section>

      <section class="band" id="base">
        <div class="wrap">
          <p class="kicker">${ico(ICONS.book)}The base</p>
          <h2>${esc(base.name)}</h2>
          <p>${esc(base.summary)} A program can check every answer against what the operator
            signed, so calling something an agent becomes a claim anyone can test.</p>
          <div class="basecard">
            <div class="std c-violet">
              <div class="top"><span class="chip">${ico(ICONS.book)}</span>
                <div><h3>${esc(base.name)}</h3>
                <p class="meta"><span>version <b>${esc(base.version)}</b></span><span>status <b>${esc(base.status)}</b></span></p></div></div>
              <p class="sum">Every Common Agent Standard builds on it. Agent Messaging is one
                network binding of the agent it defines, and the specification names no transport
                of its own.</p>
              <p class="links"><a href="/spec.html">${ico(ICONS.book)}The specification</a><a href="/descriptor.html">${ico(ICONS.rfp)}The Agent Descriptor</a><a href="/package.html">${ico(ICONS.processes)}The Agent Package</a><a href="/catalog.html">${ico(ICONS.layers)}The catalog profile</a><a href="/versions.html">${ico(ICONS.compass)}Versions</a><a href="/conformance.html">${ico(ICONS.mandate)}Conformance</a><a href="${esc(folderUrl(base))}">${ico(ICONS.branch)}${esc(base.folder)}/ on GitHub${ext}</a></p>
            </div>
            <div class="quick">
              <div class="bar">${ico(ICONS.question)}The five questions every agent answers</div>
              <div class="note">
                <ol class="steps">
                  <li>Who are you?</li>
                  <li>What do you do?</li>
                  <li>How are you used?</li>
                  <li>On what terms?</li>
                  <li>What do you refuse?</li>
                </ol>
              </div>
              <p class="note">Each answer comes from bytes the operator declared and signed
                (<a href="/spec.html#s4-3">Section 4.3</a>).</p>
            </div>
          </div>
        </div>
      </section>

      <section class="band tinted" id="standards">
        <div class="wrap">
          <p class="kicker">${ico(ICONS.layers)}The Common Agent Standards</p>
          <h2>Each standard covers one part of the work</h2>
          <p>A name and a way to reach an agent come first. Authority to act comes next, and
            then the documents two parties exchange to agree on work and to record how it went.
            Those documents are for services. If you are buying or selling products, use
            an agent commerce protocol such as the <a href="https://www.agenticcommerce.dev/">Agentic Commerce Protocol</a>
            or the <a href="https://ucp.dev/">Universal Commerce Protocol</a>.
            Roles and processes describe the jobs agents hold and how a piece of work runs.
            Each card gives the standard's version and status, its own site, and its folder in
            the repository.</p>
          <ol class="stds">
            ${standards.map(card).join("\n            ")}
          </ol>
        </div>
      </section>

      <section class="band" id="guides">
        <div class="wrap">
          <p class="kicker">${ico(ICONS.collab)}Guides</p>
          <h2>Guides sit beside the standards</h2>
          <p>A guide is kept in the same repository and versioned the same way. It is written
            for agents to read and follow, and it has no schema or conformance suite.</p>
          <ol class="stds">
            ${guides.map((g, i) => card(g, i + 1)).join("\n            ")}
          </ol>
        </div>
      </section>

      <section class="band tinted" id="repository">
        <div class="wrap">
          <p class="kicker">${ico(ICONS.branch)}One repository</p>
          <h2>Every standard is kept in one repository</h2>
          <p>Each standard has a folder in <a href="${SUITE_REPO}">${SUITE_REPO.replace("https://", "")}</a>
            with its specification, its changelog and its conformance fixtures where it has them.
            A version is tagged with the standard's name and its version, such as
            <code>messaging-v0.9.0-draft</code>, and has a release on GitHub.
            <a href="${SUITE_REPO}/blob/main/standards.json">standards.json</a> lists every
            standard with its folder, domain, version and status, and this page is made from it.</p>
          <p>The text of every specification is licensed under CC BY 4.0, and the code under
            Apache-2.0. Changes are proposed as pull requests, as
            <a href="${SUITE_REPO}/blob/main/GOVERNANCE.md">GOVERNANCE.md</a> describes.</p>
        </div>
      </section>

      <section class="band" id="sponsor">
        <div class="wrap">
          <p class="kicker">${ico(ICONS.heart)}Sponsor</p>
          <h2>AgentMesh sponsors the Common Agent Standards</h2>
          <p><a href="${esc(SUITE.sponsor.url)}">AgentMesh</a> sponsors the suite and publishes
            this site. Nothing in any of the standards requires a particular network or vendor,
            and any party can implement them.</p>
        </div>
      </section>

      ${footer}
    </main>
  </div>
  ${tailScript}
</body>
</html>
`;
}

/** Copy the suite's own files (its social image) into a rendered site. */
export function copySuiteAssets(out) {
  cpSync(resolve(HERE, "brand"), resolve(out, "brand"), { recursive: true });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf("--out");
  const out = resolve(i >= 0 ? process.argv[i + 1] : resolve(HERE, "dist"));
  mkdirSync(out, { recursive: true });
  writeFileSync(resolve(out, "index.html"), renderHome({ draft: process.argv.includes("--draft") }));
  copySuiteAssets(out);
  console.log(`index.html written to ${out}`);
}
