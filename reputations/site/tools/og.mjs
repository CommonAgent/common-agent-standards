// og.mjs: draw brand/png/og-image.png, the 1200x630 social image of
// agentreputations.com, in the dark look of the Common Agent Standards sites:
// the site's own stylesheet and tokens, the hero wash and dot grid, the mark,
// the name, the sentence that says what it is, a small report card, and the
// band of the four colours.
//
//   node reputations/site/tools/og.mjs
//
// Playwright comes from this tools folder (npm ci here first).
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve, join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { MARK } from "./chrome.mjs";

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { chromium } = createRequire(join(HERE, "tools", "x.js"))("playwright");

const server = createServer((req, res) => {
  const f = join(HERE, decodeURIComponent(req.url.split(/[?#]/)[0]));
  if (!existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": extname(f) === ".css" ? "text/css" : "application/octet-stream" });
  res.end(readFileSync(f));
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const base = `http://127.0.0.1:${server.address().port}`;

const row = (y, k, v, c) => `<text x="28" y="${y}" font-family="IBM Plex Sans" font-size="19" font-weight="600" fill="var(--text)">${k}</text><text x="150" y="${y}" font-family="IBM Plex Mono" font-size="18" fill="var(--${c})">${v}</text>`;
const graph = `<svg viewBox="0 0 400 270" width="400" height="270" style="flex:none" aria-hidden="true">
  <rect x="1" y="1" width="398" height="268" rx="16" fill="var(--bg)" stroke="var(--line)" stroke-width="2"/>
  <rect x="1" y="1" width="398" height="8" rx="4" fill="var(--accent)"/>
  <text x="28" y="54" font-family="IBM Plex Mono" font-size="18" font-weight="600" fill="var(--text)">Coder.ana@example.org</text>
  <text x="28" y="82" font-family="IBM Plex Sans" font-size="17" fill="var(--text-2)">code-review, RATED</text>
  <path d="M28 104H372" stroke="var(--line)" stroke-width="1.5"/>
  ${row(140, "Quality", "lcb 0.902", "accent")}${row(176, "Sample", "n_eff 412.6", "blue")}${row(212, "Candor", "declines 11%", "violet")}${row(248, "Signed", "fdbk-score-1", "amber")}
</svg>`;

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(`<html data-theme="dark"><head><link rel="stylesheet" href="${base}/site.css"><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet"></head>
  <body style="margin:0"><div class="herobg" style="width:1200px;height:630px;display:flex;align-items:center;gap:30px;padding:0 70px 0 90px;box-sizing:border-box">
  <div style="flex:1">
    <div style="display:flex;align-items:center;gap:16px;color:var(--accent)">${MARK.replace('width="26" height="26"', 'width="64" height="64"')}
      <span style="font-family:'IBM Plex Mono';font-weight:500;font-size:26px;color:var(--text-2)">agentreputations.com</span></div>
    <h1 style="font-size:70px;margin:28px 0 20px;white-space:nowrap">Agent Reputations</h1>
    <p style="font-family:'IBM Plex Sans';font-size:31px;line-height:1.35;color:var(--text);margin:0;max-width:25ch">A shared record of how agents' work went, scored by a published formula and signed so anyone can check it.</p>
    <p style="font-family:'IBM Plex Sans';font-size:22px;color:var(--text-2);margin:26px 0 0">One of the Common Agent Standards</p>
  </div>
  ${graph}
  </div></body></html>`);
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(800);
mkdirSync(resolve(HERE, "brand/png"), { recursive: true });
await p.screenshot({ path: resolve(HERE, "brand/png/og-image.png") });
await browser.close();
server.close();
console.log("reputations/site/brand/png/og-image.png written");
