// og.mjs: draw site/brand/png/og-suite.png, the 1200x630 social image of the
// Common Agent Standards, in the style of the Common Agent Specification's own
// image (common-agent/site/tools/shots.mjs --og): the hero wash and dot grid
// from site.css, the hexagon mark, the name, one line, and the band of the four
// colours. The standards' names come from standards.json.
//
//   node site/tools/og.mjs
//
// Playwright comes from common-agent/site/tools (npm ci there first).
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve, join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REPO = resolve(HERE, "..");
const CA_SITE = resolve(REPO, "common-agent/site");
const { chromium } = createRequire(join(CA_SITE, "tools", "x.js"))("playwright");
const suite = JSON.parse(readFileSync(resolve(REPO, "standards.json"), "utf8"));
const names = suite.standards.filter((s) => s.kind === "standard").map((s) => s.name);

const server = createServer((req, res) => {
  const f = join(CA_SITE, decodeURIComponent(req.url.split(/[?#]/)[0]));
  if (!existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": extname(f) === ".css" ? "text/css" : "application/octet-stream" });
  res.end(readFileSync(f));
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1200, height: 630 } });
const pills = names.map((n) => `<span style="font-family:'IBM Plex Sans';font-weight:500;font-size:19px;color:var(--text-2);border:1px solid var(--line);background:var(--bg);border-radius:100px;padding:5px 14px;white-space:nowrap">${n}</span>`).join("");
await p.setContent(`<html><head><link rel="stylesheet" href="${base}/site.css"><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=IBM+Plex+Sans:wght@400;500&display=swap" rel="stylesheet"></head>
  <body style="margin:0"><div class="herobg" style="width:1200px;height:630px;display:flex;flex-direction:column;justify-content:center;padding:0 90px;box-sizing:border-box">
  <div style="display:flex;align-items:center;gap:18px;color:var(--accent)"><svg viewBox="0 0 32 32" width="72" height="72"><path d="M16 2.8 27.4 9.4v13.2L16 29.2 4.6 22.6V9.4z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M11 12.5v7M16 10.5v11M21 12.5v7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
  <span style="font-family:'IBM Plex Sans';font-weight:500;font-size:28px;color:var(--text-2)">commonagent.net</span></div>
  <h1 style="font-size:76px;margin:30px 0 18px;max-width:15ch">The Common Agent Standards</h1>
  <p style="font-family:'IBM Plex Sans';font-size:30px;color:var(--text-2);margin:0;max-width:1020px">The Common Agent Specification and the standards built on it.</p>
  <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:34px;max-width:1020px">${pills}</div></div></body></html>`);
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(800);
mkdirSync(resolve(HERE, "brand/png"), { recursive: true });
await p.screenshot({ path: resolve(HERE, "brand/png/og-suite.png") });
await browser.close();
server.close();
console.log("site/brand/png/og-suite.png written");
