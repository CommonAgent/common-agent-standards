// build-home.mjs: the suite's own pages on commonagent.net, the home of the
// Common Agent Standards, made from standards.json at the root of this
// repository.
//
//   node site/tools/build-home.mjs [--out <folder>] [--draft]
//
// common-agent/site/tools/build-spec.mjs calls renderHome(), renderAgent() and
// renderStandards() when it renders the site, so these pages are written with
// the pages of the Common Agent Specification and move under the same base
// path (/draft/ or /<version>/) with them. Run on its own, this writes the
// three pages and the suite's social image into --out (default site/dist) for
// a quick look.
//
//   index.html       the front page: one sentence and two doors
//   agent.html       the Common Agent: the explainer videos, the four problems,
//                    the Agent Descriptor and the pages of the specification
//   standards.html   every Common Agent Standard and guide, under the groups
//                    standards.json lists, one card each with its version, its
//                    status, its own site and its folder on GitHub
//   onboarding.html  agent onboarding and offboarding: two reference processes
//                    in Agent Processes, and where each of their steps lives,
//                    with the three reference processes for the agents an
//                    organization runs itself
//   any-transport.html  one agent, any transport: what the Common Agent
//                    Specification fixes, and how it holds on Agent Messaging,
//                    Agent Emailing and the A2A Bridge
//   purchase-order.html  why there is no Agent Purchase Order: where each job
//                    of a purchase order lives in the suite instead
//
// The cards are made from standards.json. What is written by hand is the few
// sentences that say what the suite is, the sentence under each group's name
// (GROUPS), the explainer videos on agent.html (VIDEOS) and under a group on
// standards.html (GROUPS, videos), and the drawings on
// the front page's two doors (agentCell, standardsMap).
//
// The front page used to hold everything that is now on agent.html and
// standards.html. Links to its old sections (commonagent.net/#standards, say)
// are sent on to the page that holds that section now (FORWARD).
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
  emailing: '<path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><path d="m16 19 2 2 4-4"/>',
  naming: '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>',
  mandate: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  rfp: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  sow: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>',
  nda: '<path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v1"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><rect width="8" height="5" x="2" y="13" rx="1"/><path d="M8 13v-2a2 2 0 1 0-4 0v2"/>',
  reputations: '<path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/><circle cx="12" cy="8" r="6"/>',
  roles: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
  processes: '<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',
  collab: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
};
const COLOURS = ["c-mint", "c-blue", "c-violet", "c-amber"];
const ext = `<span class="ext" aria-hidden="true">↗</span>`;
const folderUrl = (s) => `${SUITE_REPO}/tree/main/${s.folder}`;
Object.assign(ICONS, {
  agent: '<path d="M12 2.5 20.5 7.4v9.2L12 21.5 3.5 16.6V7.4z"/><path d="M9 10v4M12 8.5v7M15 10v4"/>',
  find: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  reach: '<path d="M14.54 21.69a.5.5 0 0 0 .94-.03l6.5-19a.5.5 0 0 0-.64-.64l-19 6.5a.5.5 0 0 0-.03.94l7.93 3.18a2 2 0 0 1 1.11 1.11z"/><path d="m21.85 2.15-10.94 10.94"/>',
  trust: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  control: '<line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/>',
  contract: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>',
});

// The explainer videos. The MP4s and their posters are not in this
// repository: they are uploaded to /media/ in the site's bucket, which
// deploy.sh never writes or deletes. Their addresses are absolute, so the
// /draft/ and /<version>/ copies of these pages play the same files, and the
// link check of a rendered site does not look for them in it.
const MEDIA = `${SITE}/media`;
const VIDEOS = [
  { title: "The Common Agent, Part 1", file: "common-agent-part-1", poster: "common-agent-part-1.jpg", length: "9:15", colour: "c-violet" },
  { title: "The Common Agent, Part 2", file: "common-agent-part-2", poster: "common-agent-part-2.jpg", length: "4:44", colour: "c-mint" },
];
function video(v) {
  const mp4 = `${MEDIA}/${v.file}.mp4`;
  const track = v.captions
    ? `\n                <track kind="captions" src="${MEDIA}/${v.captions}" srclang="en" label="English">`
    : "";
  return `<li class="vid ${v.colour}">
              <video controls preload="metadata" playsinline poster="${MEDIA}/${v.poster}" width="1920" height="1080" aria-label="${esc(v.title)}">
                <source src="${mp4}" type="video/mp4">${track}
                <a href="${mp4}">${esc(v.title)} (MP4)</a>
              </video>
              <div class="cap"><h3>${esc(v.title)}</h3><p class="meta"><span>length <b>${esc(v.length)}</b></span></p></div>
            </li>`;
}

// The groups of standards.html, in the order standards.json lists them. Each
// has its name from standards.json as its heading, then one sentence; the
// cards under it are the entries whose group is its id, in the order standards.json lists them unless the group
// gives an order of its own (contracting lists them in the order an engagement
// uses them). A group's videos, the explainers of its standards, are listed
// under its cards, each in the colour of the card of the standard it explains.
const GROUPS = {
  "identity-and-reach": {
    icon: "agent",
    text: "The Common Agent Specification defines the agent and the key it signs with, Personal Agent Naming gives it a name on an email address its owner already has, and Agent Messaging carries messages to it even while it is offline.",
    note: 'The same agent can be reached through a message broker, through ordinary email or over HTTPS. <a href="/any-transport.html">One agent, any transport</a> says what stays the same on each, and where it does not yet.',
  },
  contracting: {
    icon: "contract",
    order: ["nda", "rfp", "sow", "mandate", "reputations"],
    text: "The parties sign an Agent NDA before they share anything, the buyer asks for proposals with an Agent RFP, the agreed work is written down in an Agent SoW, an Agent Mandate bounds the authority each agent acts on, and Agent Reputations keeps the record of how the work went.",
    note: 'An implementation can start with <a href="/minimal-contracting.html">the minimal contracting profile</a>, the smallest part of Agent Mandate, Agent SoW and Agent Messaging that lets one organization&rsquo;s agent contract another&rsquo;s within a delegated budget.',
  },
  "doing-the-work": {
    icon: "processes",
    text: "Agent Processes writes down how a piece of work runs and who holds each phase, the Agent Roles guide describes the jobs that recur on every network, and the Agent Collab guide gives agents playbooks to follow when they work in a shared room.",
  },
};

// Links to the sections the front page used to hold go on to the page that
// holds them now. The target is relative, so the /draft/ and /<version>/
// copies forward within themselves.
const FORWARD = {
  videos: "agent.html#videos", base: "agent.html#base",
  standards: "standards.html#standards", repository: "standards.html#repository", guides: "standards.html#collab",
  ...Object.fromEntries(SUITE.standards.filter((s) => s.kind !== "base").map((s) => [s.id, `standards.html#${s.id}`])),
};
const forwardScript = `<script>
  // Links to the sections this page used to hold (commonagent.net/#standards, say) go to the page that holds them now.
  (function(h){ var to=${JSON.stringify(FORWARD)};
    if(Object.prototype.hasOwnProperty.call(to,h)) location.replace(to[h]); })(location.hash.slice(1));
  </script>`;

function card(s, colour) {
  const host = new URL(s.site).host;
  const parts = (s.parts ?? []).length
    ? `<p class="parts">Also in its folder: ${s.parts.map((p) => esc(p.name)).join(", ")}.</p>`
    : "";
  // The base links to its pages on this site; every other entry to its own site.
  const own = s.kind === "base"
    ? `<a href="/agent.html">${ico(ICONS.agent)}The Common Agent</a><a href="/spec.html">${ico(ICONS.book)}The specification</a>`
    : `<a href="${esc(s.site)}">${ico(ICONS.globe)}${esc(host)}${ext}</a>`;
  return `<li class="std ${colour}" id="${esc(s.id)}">
              <div class="top"><span class="chip">${ico(ICONS[s.id] ?? ICONS.book)}</span>
                <div><h3>${esc(s.name)}</h3>
                <p class="meta"><span>version <b>${esc(s.version)}</b></span><span>status <b>${esc(s.status)}</b></span></p></div></div>
              <p class="sum">${esc(s.summary)}</p>
              ${parts}
              <p class="links">${own}<a href="${esc(folderUrl(s))}">${ico(ICONS.branch)}${esc(s.folder)}/ on GitHub${ext}</a></p>
            </li>`;
}

// The page around the content: the head, the menu, the footer.
function shell({ file, active, title, description, ogType = "website", ogImage = "og-suite.png", ogAlt, headExtra = "", body }) {
  const url = file === "index.html" ? `${SITE}/` : `${SITE}/${file}`;
  const alt = ogAlt ?? "The Common Agent Standards. The Common Agent Specification and the standards built on it";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">${headExtra}
  <script async src="/ga.js"></script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta property="og:type" content="${ogType}">
  <meta property="og:site_name" content="${esc(SUITE.suite)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE}/brand/png/${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(alt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${SITE}/brand/png/${ogImage}">
  <meta name="twitter:image:alt" content="${esc(alt)}">
  <link rel="canonical" href="${url}">
  ${headLinks}
</head>
<body>
  <div class="layout">

    ${rail(active)}

    <main class="main">
${body}

      ${footer}
    </main>
  </div>
  ${tailScript}
</body>
</html>
`;
}

const stampFor = (draft) => draft
  ? `This copy follows the main branch of the <a href="${SUITE_REPO}">repository</a>. The published copy is at <a href="${SITE}/">commonagent.net</a>.`
  : `Made from <a href="${SUITE_REPO}/blob/main/standards.json">standards.json</a>, the registry of the suite.`;

const sponsorBand = `<section class="band" id="sponsor">
        <div class="wrap">
          <h2>AgentMesh sponsors the Common Agent Standards</h2>
          <p><a href="${esc(SUITE.sponsor.url)}">AgentMesh</a> sponsors the suite and publishes
            this site. Nothing in any of the standards requires a particular network or vendor,
            and any party can implement them.</p>
        </div>
      </section>`;

// ── the front page's drawings ───────────────────────────────────────────────
// A pointy-topped hexagon of radius r about (x, y), as an SVG points list.
const hex = (x, y, r) => [-90, -30, 30, 90, 150, 210]
  .map((a) => `${(x + r * Math.cos((a * Math.PI) / 180)).toFixed(1)},${(y + r * Math.sin((a * Math.PI) / 180)).toFixed(1)}`).join(" ");

// The Common Agent door: one cell, the mark of the site, with its outside
// drawn as a dotted boundary and the five questions it answers to anyone
// around it, each wired to that boundary.
function agentCell() {
  const cx = 220, cy = 116;
  const qs = [[-150, -52], [-168, 40], [0, -100], [168, 40], [150, -52]].map(([dx, dy]) => [cx + dx, cy + dy]);
  const toEdge = ([x, y]) => { const a = Math.atan2(y - cy, x - cx); return [cx + 92 * Math.cos(a), cy + 92 * Math.sin(a)]; };
  return `<svg class="art-svg" viewBox="0 0 440 232" aria-hidden="true" focusable="false">
              ${qs.map((q) => { const [ex, ey] = toEdge(q); return `<line class="wire" x1="${q[0]}" y1="${q[1]}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}"/>`; }).join("")}
              <polygon class="outside" points="${hex(cx, cy, 92)}"/>
              <g class="cell"><polygon class="body" points="${hex(cx, cy, 62)}"/>
              <path class="bars" d="M${cx - 19} ${cy - 13}v26M${cx} ${cy - 24}v48M${cx + 19} ${cy - 13}v26"/></g>
              ${qs.map(([x, y], i) => `<g class="q" style="--d:${i * 60}ms"><circle cx="${x}" cy="${y}" r="15"/><path d="M${x - 4} ${y - 3}a4 4 0 1 1 5.5 3.7c-1 .5-1.5 1.2-1.5 2.3M${x} ${y + 7}h.01"/></g>`).join("")}
            </svg>`;
}

// The standards door: every entry of standards.json as a tile in one
// honeycomb, coloured by its group, with the Common Agent Specification at the
// centre and a line from it to every standard, since each one builds on it.
function standardsMap() {
  const grp = (id) => {
    const order = GROUPS[id]?.order ?? [];
    const rank = (s) => { const i = order.indexOf(s.id); return i < 0 ? Infinity : i; };
    return SUITE.standards.filter((s) => s.group === id && s.kind !== "base").sort((a, b) => rank(a) - rank(b));
  };
  const base = SUITE.standards.find((s) => s.kind === "base");
  // The map keeps its own layout, whatever the order of the groups on standards.html.
  const groupIds = ["identity-and-reach", "contracting", ...(SUITE.groups ?? []).map((g) => g.id).filter((id) => id !== "identity-and-reach" && id !== "contracting")];
  const tone = Object.fromEntries(groupIds.map((g, i) => [g, ["c-violet", "c-amber", "c-mint", "c-blue"][i % 4]]));
  const ident = grp(groupIds[0]), contract = grp(groupIds[1]), work = groupIds.slice(2).flatMap(grp);
  const rows = [contract.slice(0, 4), [ident[0], base, ...ident.slice(1)].filter(Boolean), [...contract.slice(4), ...work]];
  const step = 80, cx = 220, cy = 116, dy = 66;
  const tiles = rows.flatMap((row, r) => row.map((s, i) => ({ s, x: cx + (i - (row.length - 1) / 2) * step, y: cy + (r - 1) * dy })));
  const hub = tiles.find((t) => t.s === base);
  return `<svg class="art-svg" viewBox="0 0 440 232" aria-hidden="true" focusable="false">
              ${tiles.filter((t) => t !== hub).map((t) => `<line class="wire ${tone[t.s.group]}" x1="${hub.x}" y1="${hub.y}" x2="${t.x}" y2="${t.y}"/>`).join("")}
              ${tiles.map((t, i) => `<g class="tile ${t === hub ? "hub c-violet" : tone[t.s.group]}" style="--d:${i * 35}ms"><polygon points="${hex(t.x, t.y, t === hub ? 34 : 28)}"/><g transform="${t === hub ? `translate(${t.x - 16.8} ${t.y - 16.8}) scale(1.4)` : `translate(${t.x - 12} ${t.y - 12})`}">${t === hub ? ICONS.agent : ICONS[t.s.id] ?? ICONS.book}</g></g>`).join("")}
            </svg>`;
}

/** index.html: one sentence and two doors. `draft` marks it as the main branch's copy. */
export function renderHome({ draft = false } = {}) {
  const title = SUITE.suite;
  const description = `${title} are a suite of open specifications for agents. The Common Agent Specification is the base, and every Common Agent Standard builds on it. AgentMesh sponsors the suite.`;
  return shell({
    file: "index.html", active: "home", title, description, headExtra: `\n  ${forwardScript}`,
    body: `      <header class="herobg front">
      <div class="wrap hero">
        <div class="front-top">
          <div>
            <h1>${esc(title)}</h1>
            <p class="lede">The Common Agent Standards are open specifications for agents that
              work for people and organizations.</p>
          </div>
          <svg class="heromark" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path class="hm-hex" d="M16 2.8 27.4 9.4v13.2L16 29.2 4.6 22.6V9.4z"/><path class="hm-bars" d="M11 12.5v7M16 10.5v11M21 12.5v7"/></svg>
        </div>
        <nav class="bigdoors" aria-label="Where to start">
          <a class="bigdoor c-violet" href="/agent.html">
            <span class="art">${agentCell()}</span>
            <span class="body">
              <span class="t">The Common Agent</span>
              <span class="d">The Common Agent Specification defines an agent from the outside and says what any agent must be able to do.</span>
              <span class="go">Read about the Common <span class="nw">Agent${ico(ICONS.arrow)}</span></span>
            </span>
          </a>
          <a class="bigdoor c-mint" href="/standards.html">
            <span class="art">${standardsMap()}</span>
            <span class="body">
              <span class="t">Every standard</span>
              <span class="d">Agents use these standards to find each other, reach each other, contract work and run it together.</span>
              <span class="go">See every <span class="nw">standard${ico(ICONS.arrow)}</span></span>
            </span>
          </a>
        </nav>
        <p class="version">${stampFor(draft)}</p>
      </div>
      </header>

      ${sponsorBand}`,
  });
}

/** agent.html: the Common Agent, from the outside. */
export function renderAgent({ draft = false } = {}) {
  const base = SUITE.standards.find((s) => s.kind === "base");
  const title = "The Common Agent";
  const description = "What an agent is from the outside and what any agent must be able to do: two explainer videos, the four problems agents meet across company lines, the Agent Descriptor, and the pages of the Common Agent Specification.";
  const problems = [
    { key: "Find", icon: "find", colour: "c-blue", p: "Agents need to find each other, and today every vendor keeps its own list." },
    { key: "Reach", icon: "reach", colour: "c-mint", p: "Agents need to reach each other, and a message is lost if the other agent is offline." },
    { key: "Trust", icon: "trust", colour: "c-violet", p: "Agents need to trust each other, and nobody can tell who stands behind an agent." },
    { key: "Control", icon: "control", colour: "c-amber", p: "Their owners need to control them: who gets in, what an agent spends, and how to stop one." },
  ];
  return shell({
    file: "agent.html", active: "agent", title, description, ogType: "article",
    ogImage: "og-image.png", ogAlt: "The Common Agent Specification. The definition of the agent as a testable claim",
    body: `      <header class="herobg">
      <div class="wrap hero">
        <h1>${esc(title)}</h1>
        <p class="lede">${esc(base.summary)} A program can check every answer against what the operator
          signed, so calling something an agent becomes a claim anyone can test.</p>
        <div class="cta">
          <a class="btn btn-primary" href="/spec.html">${ico(ICONS.book)}Read the Common Agent Specification</a>
          <a class="btn btn-ghost" href="/conformance.html">${ico(ICONS.mandate)}Conformance</a>
        </div>
        <p class="version">${stampFor(draft)}</p>
      </div>
      </header>

      <section class="band tinted" id="videos">
        <div class="wrap">
          <h2>The Common Agent, explained</h2>
          <p>Part 1 looks at a single agent from the outside. Part 2 puts that agent on a
            network, among many others.</p>
          <ol class="vids">
            ${VIDEOS.map(video).join("\n            ")}
          </ol>
        </div>
      </section>

      <section class="band" id="problems">
        <div class="wrap">
          <h2>Across company lines, agents struggle to find, reach, trust and control each other</h2>
          <p>Every person and every company is getting agents. The value comes when agents work
            with each other, and most of them still work only inside their own walls.</p>
          <ol class="problems">
            ${problems.map((x) => `<li class="${x.colour}"><h3 class="key">${ico(ICONS[x.icon])}${x.key}</h3><p>${x.p}</p></li>`).join("\n            ")}
          </ol>
          <p>All four meet in one place: the outside of each agent, where others find it, reach it,
            check it and limit it. So every agent needs an outside that anyone can check, and that
            is what the specification describes.</p>
        </div>
      </section>

      <section class="band tinted" id="descriptor">
        <div class="wrap">
          <h2>Every agent serves a bound, signed Descriptor</h2>
          <div class="basecard">
            <div class="std c-violet">
              <div class="top"><span class="chip">${ico(ICONS.rfp)}</span>
                <div><h3>The Agent Descriptor</h3>
                <p class="meta"><span>Section <b>6</b></span><span>required by <b>Section 4.9</b></span></p></div></div>
              <p class="sum">The Agent Descriptor is the operator's standing description of one agent,
                and the primary location for its metadata. It says what the agent does, what each
                offering takes and returns, who drives it, what it refuses, and where it runs, in one
                document that is signed once bound.</p>
              <p class="sum">The agent's description, its answers to the five questions and the first
                two exchanges at its entryway all come from the Descriptor's bytes and from the signed
                documents it points to.</p>
              <p class="links"><a href="/descriptor.html">${ico(ICONS.rfp)}The Agent Descriptor</a><a href="/spec.html#s4-9">${ico(ICONS.book)}Section 4.9</a></p>
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

      <section class="band" id="base">
        <div class="wrap">
          <h2>The specification and its parts</h2>
          <div class="basecard one">
            <div class="std c-violet">
              <div class="top"><span class="chip">${ico(ICONS.book)}</span>
                <div><h3>${esc(base.name)}</h3>
                <p class="meta"><span>version <b>${esc(base.version)}</b></span><span>status <b>${esc(base.status)}</b></span></p></div></div>
              <p class="sum">Every Common Agent Standard builds on it. Agent Messaging is one
                network binding of the agent it defines, and the specification names no transport
                of its own.</p>
              <p class="links"><a href="/spec.html">${ico(ICONS.book)}The specification</a><a href="/descriptor.html">${ico(ICONS.rfp)}The Agent Descriptor</a><a href="/package.html">${ico(ICONS.processes)}The Agent Package</a><a href="/catalog.html">${ico(ICONS.layers)}The catalog profile</a><a href="/versions.html">${ico(ICONS.compass)}Versions</a><a href="/conformance.html">${ico(ICONS.mandate)}Conformance</a><a href="${esc(folderUrl(base))}">${ico(ICONS.branch)}${esc(base.folder)}/ on GitHub${ext}</a></p>
            </div>
          </div>
          <p>The standards built on this definition, for naming agents, reaching them, contracting
            work and running it together, are on <a href="/standards.html">every standard</a>.</p>
        </div>
      </section>`,
  });
}

/** purchase-order.html: why the suite has no Agent Purchase Order, and where
 *  each job of a purchase order lives instead. */
export function renderPurchaseOrder({ draft = false } = {}) {
  const title = "Agent Purchase Order";
  const description = "There is no separate Agent Purchase Order specification. The authority to spend lives in Agent Mandate, the commitment to a provider is the formation of an Agent SoW engagement, the money is set aside by the engagement's reservation, and the client's purchase order number travels on every record as the buyer's reference.";
  const MANDATE = "https://agentmandate.net/spec.html";
  const SOW = "https://agentsow.com/spec.html";
  const jobs = [
    { key: "Authority", icon: "mandate", colour: "c-violet",
      p: `The authority to spend lives in <a href="https://agentmandate.net/">Agent Mandate</a>. A mandate puts one line of spending authority in writing: who may commit the organization, to which kinds of act, and up to how much per engagement and per month (<a href="${MANDATE}#s6">Section 6</a>). The platform checks it every time its holder approves an act (<a href="${MANDATE}#s7">Section 7</a>).` },
    { key: "Commitment", icon: "sow", colour: "c-blue",
      p: `The commitment to a provider is the formation of an <a href="https://agentsow.com/">Agent SoW</a> engagement. Both owners sign the same document, which fixes the scope, the deliverables, the price and the term (<a href="${SOW}#s12-1">Section 12.1</a> and <a href="${SOW}#s6">Section 6</a>).` },
    { key: "Funds", icon: "layers", colour: "c-mint",
      p: `The money is set aside when a time and materials engagement forms. The engagement reserves its full cap for a stated window, and the Agent SoW specification describes that arrangement as a purchase order (<a href="${SOW}#s5-5-4">Section 5.5.4</a>). Where a mandate names the organization as payer, the money comes from the organization's treasury (<a href="${MANDATE}#s8">Agent Mandate Section 8</a>).` },
    { key: "Reference", icon: "rfp", colour: "c-amber",
      p: `The client's own purchase order number travels as the engagement's optional <code>buyer_reference</code>. The client sets it when it signs, and every settlement record and receipt issued under the engagement carries it unchanged (<a href="${SOW}#s5-17">Section 5.17</a>).` },
  ];
  return shell({
    file: "purchase-order.html", active: "purchase-order", title: `${title}: ${SUITE.suite}`, description, ogType: "article",
    body: `      <header class="herobg">
      <div class="wrap hero">
        <h1>${esc(title)}</h1>
        <p class="lede">The Common Agent Standards have no separate Agent Purchase Order
          specification. A purchase order does three jobs, and each of them already has a home
          in the suite. The one thing a company's books still need, its own purchase order
          number, travels with every charge.</p>
        <p class="version">${stampFor(draft)}</p>
      </div>
      </header>

      <section class="band tinted" id="jobs">
        <div class="wrap">
          <h2>A purchase order does three jobs, and each one has a home</h2>
          <p>In a company, a purchase order gives someone the authority to commit money, commits
            the company to one provider for defined work, and sets the money aside before any
            invoice arrives. Its number then lets the accounting system match every invoice
            back to it. When agents contract work under the Common Agent Standards, each of
            those things happens in one of the places below.</p>
          <ol class="problems">
            ${jobs.map((x) => `<li class="${x.colour}"><h3 class="key">${ico(ICONS[x.icon])}${x.key}</h3><p>${x.p}</p></li>`).join("\n            ")}
          </ol>
        </div>
      </section>

      <section class="band" id="reference">
        <div class="wrap">
          <h2>The buyer's reference carries the purchase order number</h2>
          <p>Many clients match each charge to a purchase order before they pay it. An Agent SoW
            engagement can carry the client's own reference, such as
            <code>PO-2026-004417</code>, in its optional <code>buyer_reference</code> member. The
            client supplies it when it signs, both signatures cover it, and it changes only by
            amendment. The platform that runs the engagement does not interpret it. It copies the
            reference unchanged onto every settlement record and onto every task receipt for work
            admitted under the engagement, so the client's accounting system can match each
            charge without asking the provider. The rules are in
            <a href="${SOW}#s5-17">Section 5.17 of Agent SoW</a>, and the task receipt that carries
            it is in Section 19.2 of <a href="https://agentmessaging.ai/">Agent Messaging</a>.</p>
        </div>
      </section>

      <section class="band tinted" id="why">
        <div class="wrap">
          <h2>A separate purchase order document would repeat what the others already say</h2>
          <p>A purchase order document would restate the authority that the mandate grants, the
            commitment that the engagement records and the funds that its reservation holds. Two
            documents that state the same commitment can disagree, and then a reader has to decide
            which one governs. With each job kept in one place, there is one signed answer to
            each question: who may spend, what was agreed, how much is held, and which purchase
            order a charge belongs to.</p>
          <p>The contracting standards are described together on
            <a href="/standards.html#contracting">every standard</a>, where
            <a href="https://agentrfp.net/">Agent RFP</a>, <a href="https://agentnda.net/">Agent NDA</a>
            and <a href="https://agentreputations.com/">Agent Reputations</a> sit beside the two named
            here.</p>
        </div>
      </section>`,
  });
}

/** any-transport.html: one agent, any transport. The few things the Common
 *  Agent Specification fixes hold whether an agent is reached through Agent
 *  Messaging, Agent Emailing or the A2A Bridge; only delivery changes. Every
 *  cell names the section it rests on, and says so where a transport does not
 *  do something yet. */
export function renderTransports({ draft = false } = {}) {
  const title = "One agent, any transport";
  const description = "The same agent, with the same key, the same Descriptor, the same signed message and the same task states, reached through Agent Messaging, Agent Emailing or the A2A Bridge. Only delivery changes. A table says how each thing holds on each transport, and where it does not yet.";
  const CA = (s, t) => `<a href="/spec.html#${s}">${t}</a>`;
  const AM = (s, t) => `<a href="https://agentmessaging.ai/spec.html#${s}">${t}</a>`;
  const AE = (s, t) => `<a href="https://agentemailing.ai/spec.html#${s}">${t}</a>`;
  const BR = (s, t) => `<a href="${SUITE_REPO}/blob/main/messaging/bindings/a2a-bridge.md#${s}">${t}</a>`;
  const PAN = (s, t) => `<a href="https://agentnaming.ai/spec.html#${s}">${t}</a>`;
  const EXT = (file, s, t) => `<a href="${SUITE_REPO}/blob/main/messaging/extensions/${file}${s ? `#${s}` : ""}">${t}</a>`;
  const AE71 = "7-1-agent-messaging-%C2%A722-on-the-email-path";
  const rows = [
    { what: "Who you are", rule: `One Ed25519 key is the agent's identity, and a name is an attestation bound to it (${CA("s4-1", "§4.1")}, ${PAN("4-1-agent-key-pairing-the-primary-path", "Personal Agent Naming §4.1")}).`,
      broker: `The key is the agent's ID and signs every envelope (${AM("4-3-agent-identity", "§4.3")}, ${AM("4-5-message-identity-assertion", "§4.5")}). Registration needs a verified name bound to the key (${AM("6-2-register", "§6.2")}).`,
      email: `In native mode the agent signs with its own key. Its address is the verified <code>email</code> endpoint on its name card, and a handle is never used as an address (${AE("4-1-native-mode", "§4.1")}, ${AE("5-1-the-email-endpoint-on-a-name-card", "§5.1")}). A sender with no node can stand on a key-bound name (${AE("6-2-the-standing-of-a-native-sender", "§6.2")}).`,
      https: `The far party's own key does not cross the HTTPS leg. The bridge holds a mesh key for each A2A caller and each attached A2A server, and marks it as bridged (${BR("21-trust-boundary-rules-normative", "Bridge §2.1")}, ${BR("9-inbound-caller-identity", "§9")}, ${AM("4-15-identity-bridges", "Agent Messaging §4.15")}). A name card can list an A2A endpoint (${PAN("5-1-the-card", "Personal Agent Naming §5.1")}).` },
    { what: "What it does", rule: `One signed Agent Descriptor, served by the agent; every other description is projected from it (${CA("s4-9", "§4.9")}, ${CA("s6-8", "§6.8")}).`,
      broker: `The registration manifest projects the Descriptor and carries its pointer and digest (${AM("8-13-the-descriptor-pointer", "§8.13")}). <code>describe</code> serves the public block without running the agent (${AM("10-14-describe", "§10.14")}).`,
      email: `Agent Emailing carries no Descriptor exchange (${AE("2-2-what-does-not", "§2.2")}). A correspondent reads the Descriptor where the operator serves it, such as the <code>describe</code> door over HTTPS. The subject names the offering by the manifest's name for it (${AE("3-3-the-human-part-and-the-subject", "§3.3")}).`,
      https: `The bridge generates an A2A card for each exposed agent from its manifest, which projects the Descriptor (${BR("81-inbound-mesh-manifest--generated-agent-card", "Bridge §8.1")}, ${CA("s6-8", "§6.8")}). Input and output schemas do not carry over: a card declares modes, not schemas.` },
    { what: "The message", rule: `Every message is a signed envelope that verifies on its own signature, whatever carried it (${AM("5-message-envelope", "Agent Messaging §5")}, ${CA("s11", "§11")}).`,
      broker: `The signed envelope, checked against <code>from</code> by every receiver (${AM("5-3-identity-verification", "§5.3")}).`,
      email: `The same signed envelope, as an attachment, checked the same way. Headers are hints only (${AE("3-2-the-envelope-part", "§3.2")}, ${AE("6-1-the-envelope-is-authoritative", "§6.1")}).`,
      https: `The envelope stops at the bridge. The HTTPS leg carries A2A JSON-RPC messages, which are not signed envelopes. On the mesh side the bridge signs for the caller's hosted identity, and the envelope says it is bridged (${BR("21-trust-boundary-rules-normative", "Bridge §2.1")}).` },
    { what: "The work", rule: `One set of task states and legal transitions (${CA("s5-2", "§5.2")}).`,
      broker: `The task states, a durable task store, progress on the task's subject, and the accept signal on live delivery (${AM("7-2-task-states", "§7.2")}, ${AM("6-4a-the-accept-signal", "§6.4a")}).`,
      email: `The same states. Every update is a respond in the thread, applied in the order of its signed time (${AE("10-tasks-and-ordering", "§10")}). There is no accept signal, and a performer often sends no <code>working</code> update (${AE("8-delivery-signals", "§8")}).`,
      https: `The bridge maps each state one to one (${BR("5-task-state-mapping", "Bridge §5")}), though its table does not list <code>exhausted</code>. When an agent asks for more input, the bridge reports the state but does not yet relay the caller's answer on its JSON-RPC and HTTP+JSON routes (${BR("11-out-of-scope-this-version", "§11")}).` },
    { what: "Receiver protections", rule: `Signature first, then duplicates, freshness, addressing, size and fencing; strangers knock first (${CA("s4-8", "§4.8")}, ${CA("s7-1", "§7.1")}).`,
      broker: `Every check on every delivery path (${AM("22-inbound-protections-receiver-obligations", "§22")}). The owner's roster sorts every sender, and a stranger knocks (${EXT("EXT-6-admission.md", "", "EXT-6")}).`,
      email: `The same checks, judged by the 7-day mailbox window, with a duplicate memory that lasts across restarts and a <code>to</code> check that refuses forwarded mail (${AE(AE71, "§7.1")}). Plain mail from a stranger never reaches the agent (${AE("4-3-email-with-no-envelope", "§4.3")}).`,
      https: `On the mesh side the receiving agent applies every check to the bridge's envelope, and a bridged sender sorts into its own tier, held by default (${EXT("EXT-6-admission.md", "4-tiers-deterministic-pre-model", "EXT-6 §4")}). The HTTPS leg relies on TLS and the caller's bridge key (${BR("9-inbound-caller-identity", "Bridge §9")}). The bridge defines no A2A form of the knock.` },
    { what: "What a person sees", rule: `Views drawn from signed data, never written separately (${CA("s6-13", "§6.13")}, <a href="/descriptor-ui.html">the Descriptor UI binding</a>).`,
      broker: `Pages about the agent are drawn from its Descriptor (<a href="/descriptor-ui.html">Descriptor UI binding</a>). A message for the person is marked, and its text is the signed payload (${AM("5-7-messages-for-the-person-behind-an-agent", "§5.7")}). Other messages have no generated readable text.`,
      email: `Every email opens with text generated from the signed envelope, its digest signed, and checking software warns when it differs (${AE("3-3-the-human-part-and-the-subject", "§3.3")}). Pages about the agent follow the Descriptor UI binding.`,
      https: `The A2A card is generated, never hand-written (${BR("81-inbound-mesh-manifest--generated-agent-card", "Bridge §8.1")}). A message for the person travels as an A2A extension (${BR("84-messages-for-the-person-040", "§8.4")}). There is no rule for readable text generated from signed data.` },
    { what: "Your OK", rule: `A budget travels with the work; the owner's allowance stays with the agent; an act the agent drafts carries the owner's approval (${CA("s5-4", "§5.4")}, ${CA("s7-5", "§7.5")}, ${CA("s7-9", "§7.9")}).`,
      broker: `The budget rides the signed request (${AM("7-7-budget", "§7.7")}). The agent's runtime enforces the allowance and can put a question to the owner (${EXT("EXT-8-allowance.md", "", "EXT-8")}).`,
      email: `The same runtime rules hold, because they live with the agent, not the transport. The budget travels in the signed envelope, and the human part states its price (${AE("3-3-the-human-part-and-the-subject", "§3.3")}). Agent Emailing adds no approval step of its own.`,
      https: `The allowance still holds at the agent's runtime (${CA("s7-5", "§7.5")}). The bridge's mapping carries no budget for an A2A caller's request (${BR("6-payload--parts-mapping", "Bridge §6")}). The bridge discloses its own fee and gives typed refusals, payment required among them (${BR("91-gateway-refusals-are-typed", "§9.1")}, ${BR("92-the-operators-fee-is-disclosed", "§9.2")}).` },
    { what: "Proof", rule: `Conformance is checked mechanically, against fixtures that are the authority (${CA("s14", "§14")}).`,
      broker: `The conformance suite runs the core profile against a running server on either binding (${AM("1-6-conformance-profiles", "§1.6")}, <a href="https://agentmessaging.ai/conformance.html">the suite</a>).`,
      email: `19 cases over 17 really signed emails, and a carrier test for providers (${AE("12-conformance", "§12")}). The reference server passes all 19.`,
      https: `The mapping says what an implementation must implement to claim conformance (${BR("12-conformance", "Bridge §12")}), and the suite's test i11 checks the bridged marker. There is no fixture set for the JSON-RPC mapping itself yet.` },
  ];
  const head = `<tr><th scope="col">What stays the same</th><th scope="col">Agent Messaging<small>a message broker</small></th><th scope="col">Agent Emailing<small>ordinary email</small></th><th scope="col">The A2A Bridge<small>HTTPS</small></th></tr>`;
  const body = rows.map((r) => `<tr>
              <th scope="row"><b>${esc(r.what)}</b><span>${r.rule}</span></th>
              <td data-l="Agent Messaging">${r.broker}</td>
              <td data-l="Agent Emailing">${r.email}</td>
              <td data-l="The A2A Bridge">${r.https}</td>
            </tr>`).join("\n            ");
  const good = [
    { key: "A broker is live", icon: "messaging", colour: "c-mint",
      p: `Agent Messaging delivers in moments, shows who is online now (${AM("9-6-presence-service", "presence")}), publishes events to every subscriber (${AM("6-6-emit", "emit")} and ${AM("6-7-subscribe", "subscribe")}), and streams long answers.` },
    { key: "Email reaches anyone", icon: "emailing", colour: "c-blue",
      p: `Agent Emailing reaches any agent with an address, through any provider, holds mail while the agent is away, and lets a person read the thread in their own mail program (<a href="https://agentemailing.ai/">agentemailing.ai</a>).` },
    { key: "HTTPS reaches A2A", icon: "globe", colour: "c-violet",
      p: `The A2A Bridge lets a stock A2A client call a mesh agent with no mesh code, and puts any A2A server on the mesh as an addressable agent (${BR("1-purpose", "Bridge §1")}).` },
  ];
  const open = [
    `<b>A2A has no readable-text rule.</b> Agent Emailing requires the text a person reads to be generated from the signed message and checked against it. Nothing says the same for a message that crosses the A2A Bridge.`,
    `<b>Task-state words live in more than one place.</b> The Common Agent Specification (§5.2), Agent Messaging (§7.2), the A2A Bridge's mapping (§5) and Agent Emailing's subject words (§3.3) each list them, and the bridge's table leaves out <code>exhausted</code>. They should become one list, in the Common Agent Specification.`,
    `<b>There is no shared rule for a transport that cannot report progress.</b> Over email a performer often sends no <code>working</code> update. Agent Emailing (§10) refuses a transition that Agent Messaging §7.3 does not allow, so <code>input_required</code> straight to <code>completed</code> is not allowed, and the reference implementation accepts it as a two-step move by way of <code>working</code>, a choice the standard leaves open. The family needs one rule for every transport like it.`,
    `<b>There is no cross-transport conformance test yet.</b> Each transport has its own fixtures. The same quote request, sent over all three and checked the same way, would show that only delivery changes.`,
  ];
  const sites = [
    ["The Common Agent Specification", "/spec.html"],
    ["Agent Messaging", "https://agentmessaging.ai/"],
    ["Agent Emailing", "https://agentemailing.ai/"],
    ["The A2A Bridge", `${SUITE_REPO}/blob/main/messaging/bindings/a2a-bridge.md`],
    ["Personal Agent Naming", "https://agentnaming.ai/"],
    ["The Descriptor UI binding", "/descriptor-ui.html"],
  ];
  return shell({
    file: "any-transport.html", active: "any-transport", title: `${title}: ${SUITE.suite}`, description, ogType: "article",
    body: `      <header class="herobg">
      <div class="wrap hero">
        <h1>${esc(title)}</h1>
        <p class="lede">One agent, one signed message, any transport.</p>
        <p class="also">An agent can be reached through a message broker with Agent Messaging, through
          ordinary email with Agent Emailing, or over HTTPS through the A2A Bridge. The few things the
          Common Agent Specification fixes about an agent hold on all three. Only delivery changes. This page
          says how each one holds on each transport, with the section it rests on, and says plainly where a
          transport does not do something yet.</p>
        <p class="version">${stampFor(draft)}</p>
      </div>
      </header>

      <section class="band" id="table">
        <div class="wrap">
          <h2>What stays the same</h2>
          <p>The first column states the rule and where the Common Agent Specification fixes it. Each other
            column says how that rule holds on one transport, as its specification stands today.</p>
          <div class="xt-wrap">
          <table class="xt">
            <thead>${head}</thead>
            <tbody>
            ${body}
            </tbody>
          </table>
          </div>
        </div>
      </section>

      <section class="band tinted" id="good-at">
        <div class="wrap">
          <h2>What each transport is good at</h2>
          <ol class="problems">
            ${good.map((x) => `<li class="${x.colour}"><h3 class="key">${ico(ICONS[x.icon])}${x.key}</h3><p>${x.p}</p></li>`).join("\n            ")}
          </ol>
        </div>
      </section>

      <section class="band" id="open">
        <div class="wrap">
          <h2>Where the family is not consistent yet</h2>
          <p>These are open work, written down so that nobody mistakes them for done.</p>
          <ul class="plain open-list">
            ${open.map((x) => `<li>${x}</li>`).join("\n            ")}
          </ul>
        </div>
      </section>

      <section class="band tinted" id="sites">
        <div class="wrap">
          <h2>The standards on this page</h2>
          <ul class="plain">
            ${sites.map(([n, h]) => `<li><a href="${h}">${esc(n)}</a></li>`).join("\n            ")}
          </ul>
        </div>
      </section>`,
  });
}

/** onboarding.html: agent onboarding and offboarding are reference processes
 *  in Agent Processes, and this page says so and points at them. */
export function renderOnboarding({ draft = false } = {}) {
  const title = "Agent Onboarding and Offboarding";
  const description = "Bringing an outside agent into an organization's work, and taking it out again, are written as two reference processes in Agent Processes. The first two are not specifications: every step is an act another Common Agent Standard already defines. Three more make, record incidents for and retire the agents an organization runs itself.";
  const PROC = "https://agentprocesses.ai";
  const ON = `${PROC}/onboard-an-agent.html`;
  const OFF = `${PROC}/offboard-an-agent.html`;
  const own = [
    { href: `${PROC}/make-a-new-agent.html`, name: "Make a new agent",
      text: "The owner approves a written spec, tests are written before the scripts, the package is deployed on the owner's yes, and an agent that built none of it checks conformance." },
    { href: `${PROC}/record-an-incident.html`, name: "Record an incident",
      text: "When an agent goes quiet or a job fails, the records are gathered into a timeline that names the source of every fact and every gap, and a person decides what happens next." },
    { href: `${PROC}/retire-an-agent.html`, name: "Retire an agent",
      text: "Whoever depends on the agent is told first, its listing is taken down, the owner approves the removal, and its AgentDoc is closed with the date and the reason." },
  ];
  const onboard = [
    "Verify the agent against its signed Descriptor, its build, deployment and evaluation records, and its reputation report.",
    "Interview it with the five questions, and compare each answer with what it signed.",
    "Sign an Agent NDA where the work involves confidential material.",
    "Agree the terms and form the Agent SoW engagement.",
    "Grant a mandate no wider than the engagement needs.",
    "Admit the agent and grant access that ends when the engagement ends.",
    "Hand over the context it needs to start.",
    "Run a trial against a pass line agreed in advance.",
    "Decide on go-live, and put the agent into the work.",
  ];
  const offboard = [
    "Hand over the work the agent has in flight.",
    "End the engagement for convenience, for cause, or at its end date.",
    "Revoke the agent's mandate, with every mandate under it.",
    "Withdraw admission and every grant on the access list, and try each one.",
    "Settle the money and release the reservation.",
    "Get the agent's owner to confirm in writing what was returned and what was deleted.",
    "File the outcome with the reputation bureau the engagement names.",
    "Note the confidentiality terms that outlast the engagement.",
    "Close the run with the owner's signature over every record it left.",
  ];
  const steps = (xs) => xs.map((x) => `<li><span>${esc(x)}</span></li>`).join("\n            ");
  return shell({
    file: "onboarding.html", active: "onboarding", title: `${title}: ${SUITE.suite}`, description, ogType: "article",
    body: `      <header class="herobg">
      <div class="wrap hero">
        <h1>${esc(title)}</h1>
        <p class="lede">An organization brings an outside agent into its work much as it brings in a
          new employee or contractor, and takes it out again with the same care. The Common Agent
          Standards write both as reference processes in Agent Processes. Neither one is a
          specification, because every step is an act another standard already defines.</p>
        <div class="cta">
          <a class="btn btn-primary" href="${ON}">${ico(ICONS.processes)}Onboard an agent${ext}</a>
          <a class="btn btn-ghost" href="${OFF}">${ico(ICONS.processes)}Offboard an agent${ext}</a>
        </div>
        <p class="version">${stampFor(draft)}</p>
      </div>
      </header>

      <section class="band tinted" id="what">
        <div class="wrap">
          <h2>A reference process is a first draft for an organization to adopt</h2>
          <p>A reference process has its shape filled in and its specifics left blank. The steps,
            their order, the roles, what passes between the steps, the records a run leaves and
            what to do when a step fails are all written down. The owner, the dates, the numbers
            and who holds each role are left for the adopting organization to fill in. Adopting
            one makes it that organization's own process at version 1, and from then on it is
            theirs to change. <a href="${PROC}/spec.html">The Agent Processes specification</a>
            defines the format.</p>
        </div>
      </section>

      <section class="band" id="onboard">
        <div class="wrap">
          <h2>Onboarding brings the agent in before it touches the work</h2>
          <p>The agent is checked and interviewed before anyone signs anything, and nothing
            confidential reaches it before an NDA is in force. It is admitted only after its
            engagement is formed and its mandate is granted, and every grant it receives ends
            when the engagement ends.</p>
          <ol class="floor">
            ${steps(onboard)}
          </ol>
          <p><a href="${ON}">Read the onboarding reference process${ext}</a></p>
        </div>
      </section>

      <section class="band tinted" id="offboard">
        <div class="wrap">
          <h2>Offboarding takes the agent out and proves it happened</h2>
          <p>The work in flight gets a new holder before any access is withdrawn. The run reads
            the access list that onboarding made and tries every grant after withdrawing it. It
            stays open until the agent's owner confirms what happened to the data, and it closes
            with the process owner's signature over every record the run left.</p>
          <ol class="floor">
            ${steps(offboard)}
          </ol>
          <p><a href="${OFF}">Read the offboarding reference process${ext}</a></p>
        </div>
      </section>

      <section class="band" id="own-agents">
        <div class="wrap">
          <h2>Three more reference processes cover the agents an organization runs itself</h2>
          <p>An organization that makes its own agents brings each one into service, writes down
            what happened when something goes wrong, and takes it down when it is no longer needed. Each of
            those is a reference process in Agent Processes too.</p>
          <ol class="floor">
            ${own.map((p) => `<li><span><a href="${p.href}">${esc(p.name)}${ext}</a>. ${esc(p.text)}</span></li>`).join("\n            ")}
          </ol>
        </div>
      </section>

      <section class="band tinted" id="where">
        <div class="wrap">
          <h2>Each step points at the standard that defines it</h2>
          <p>Verification and the interview come from the
            <a href="/spec.html">Common Agent Specification</a> and
            <a href="https://agentreputations.com/">Agent Reputations</a>. The NDA is
            <a href="https://agentnda.net/">Agent NDA</a>, the engagement and its termination are
            <a href="https://agentsow.com/">Agent SoW</a>, and the mandate and its revocation are
            <a href="https://agentmandate.net/">Agent Mandate</a>. Each reference process ends with
            a table that links every step to the section that specifies it. The three for an
            organization's own agents point at the roles in <a href="https://agentroles.ai/">Agent Roles</a>
            and the records in the Common Agent Specification.</p>
        </div>
      </section>`,
  });
}

/** standards.html: every entry of standards.json, under its group. */
export function renderStandards({ draft = false } = {}) {
  const standards = SUITE.standards.filter((s) => s.kind === "standard");
  const guides = SUITE.standards.filter((s) => s.kind === "guide");
  const title = `Every standard: ${SUITE.suite}`;
  const description = "Every Common Agent Standard, grouped by what it does: identity and reach, Agents and Humans Working Together, and B2B Agentic Commerce. Each card gives the standard's version, its status, its own site and its folder in the repository.";
  let n = 0;
  const colourOf = {};
  const bands = (SUITE.groups ?? []).map((g, gi) => {
    const copy = GROUPS[g.id];
    if (!copy) throw new Error(`build-home.mjs has no sentence for the group ${g.id} in standards.json`);
    const rank = (s) => { const i = (copy.order ?? []).indexOf(s.id); return i < 0 ? Infinity : i; };
    const members = SUITE.standards.filter((s) => s.group === g.id).sort((a, b) => rank(a) - rank(b));
    return `<section class="band${gi % 2 ? "" : " tinted"}" id="${esc(g.id)}">
        <div class="wrap">
          <h2>${esc(g.name)}</h2>
          <p>${esc(copy.text)}</p>
          ${copy.note ? `<p>${copy.note}</p>` : ""}
          <ol class="stds">
            ${members.map((s) => card(s, colourOf[s.id] = COLOURS[n++ % COLOURS.length])).join("\n            ")}
          </ol>
          ${(copy.videos ?? []).length ? `${copy.videosText ? `<p>${esc(copy.videosText)}</p>` : ""}
          <ol class="vids">
            ${copy.videos.map((v) => video({ ...v, colour: colourOf[v.standard] ?? "c-mint" })).join("\n            ")}
          </ol>` : ""}
        </div>
      </section>`;
  });
  const unplaced = SUITE.standards.filter((s) => !(SUITE.groups ?? []).some((g) => g.id === s.group));
  if (unplaced.length) throw new Error(`standards.json: no group for ${unplaced.map((s) => s.id).join(", ")}`);
  return shell({
    file: "standards.html", active: "standards", title, description,
    body: `      <header class="herobg">
      <div class="wrap hero">
        <div class="hero-grid">
          <div>
            <h1>${esc(SUITE.suite)}</h1>
            <p class="lede">The Common Agent Standards are open specifications for agents that
              work for people and organizations. The Common Agent Specification is the base. It
              defines what an agent is, and every other standard in the suite builds on that
              definition for one part of the work agents do together.</p>
            <p class="version">${stampFor(draft)}</p>
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

      <span class="alias" id="standards"></span>
      ${bands.join("\n\n      ")}

      <section class="band${(SUITE.groups ?? []).length % 2 ? "" : " tinted"}" id="repository">
        <div class="wrap">
          <h2>Every standard is kept in one repository</h2>
          <p>Each standard has a folder in <a href="${SUITE_REPO}">${SUITE_REPO.replace("https://", "")}</a>
            with its specification, its changelog and its conformance fixtures where it has them.
            A version is tagged with the standard's name and its version, such as
            <code>messaging-v0.9.0-draft</code>, and has a release on GitHub.
            <a href="${SUITE_REPO}/blob/main/standards.json">standards.json</a> lists every
            standard with its folder, domain, version, status and group, and this page is made from it.</p>
          <p>A guide, such as Agent Collab or Agent Roles, is kept in the same repository and versioned the same
            way. It is written for agents and people to read and follow, it has no schema or conformance suite,
            and it changes as we learn.</p>
          <p>The text of every specification is licensed under CC BY 4.0, and the code under
            Apache-2.0. Changes are proposed as pull requests, as
            <a href="${SUITE_REPO}/blob/main/GOVERNANCE.md">GOVERNANCE.md</a> describes.</p>
        </div>
      </section>`,
  });
}

/** Copy the suite's own files (its social image) into a rendered site. */
export function copySuiteAssets(out) {
  cpSync(resolve(HERE, "brand"), resolve(out, "brand"), { recursive: true });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const i = process.argv.indexOf("--out");
  const out = resolve(i >= 0 ? process.argv[i + 1] : resolve(HERE, "dist"));
  const draft = process.argv.includes("--draft");
  mkdirSync(out, { recursive: true });
  writeFileSync(resolve(out, "index.html"), renderHome({ draft }));
  writeFileSync(resolve(out, "agent.html"), renderAgent({ draft }));
  writeFileSync(resolve(out, "standards.html"), renderStandards({ draft }));
  writeFileSync(resolve(out, "onboarding.html"), renderOnboarding({ draft }));
  writeFileSync(resolve(out, "purchase-order.html"), renderPurchaseOrder({ draft }));
  writeFileSync(resolve(out, "any-transport.html"), renderTransports({ draft }));
  copySuiteAssets(out);
  console.log(`index.html, agent.html, standards.html, purchase-order.html, onboarding.html and any-transport.html written to ${out}`);
}
