// og.mjs: draw brand/png/og-image.png, the 1200x630 social image of
// agentprocesses.ai, in the dark look of the Common Agent Standards sites: the
// site's own stylesheet and tokens, the hero wash and dot grid, the mark, the
// name, the sentence that says what it is, a small process drawn as steps that
// run side by side, and the band of the four colours.
//
//   node processes/site/tools/og.mjs
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

const node = (x, y, w, label, c) => `<g><rect x="${x}" y="${y}" width="${w}" height="46" rx="10" fill="var(--bg)" stroke="var(--line)" stroke-width="1.5"/><rect x="${x}" y="${y}" width="6" height="46" rx="3" fill="var(--${c})"/><text x="${x + 20}" y="${y + 29}" font-family="IBM Plex Mono" font-size="17" font-weight="600" fill="var(--text)">${label}</text></g>`;
const graph = `<svg viewBox="0 0 420 300" width="360" height="257" style="flex:none" aria-hidden="true">
  <g fill="none" stroke="var(--text-3)" stroke-width="2" stroke-linecap="round">
    <path d="M70 150 C110 150 110 47 150 47M70 150H150M70 150 C110 150 110 253 150 253"/>
    <path d="M336 47 C360 47 360 150 372 150M336 150H372M336 253 C360 253 360 150 372 150"/>
  </g>
  <circle cx="52" cy="150" r="18" fill="none" stroke="var(--text-3)" stroke-width="3"/>
  ${node(150, 24, 186, "revoke-access", "blue")}${node(150, 127, 186, "final-pay", "blue")}${node(150, 230, 186, "equipment", "amber")}
  <circle cx="390" cy="150" r="20" fill="var(--violet)"/>
</svg>`;

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(`<html data-theme="dark"><head><link rel="stylesheet" href="${base}/site.css"><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet"></head>
  <body style="margin:0"><div class="herobg" style="width:1200px;height:630px;display:flex;align-items:center;gap:30px;padding:0 70px 0 90px;box-sizing:border-box">
  <div style="flex:1">
    <div style="display:flex;align-items:center;gap:16px;color:var(--accent)">${MARK.replace('width="26" height="26"', 'width="64" height="64"')}
      <span style="font-family:'IBM Plex Mono';font-weight:500;font-size:26px;color:var(--text-2)">agentprocesses.ai</span></div>
    <h1 style="font-size:74px;margin:28px 0 20px;white-space:nowrap">Agent Processes</h1>
    <p style="font-family:'IBM Plex Sans';font-size:31px;line-height:1.35;color:var(--text);margin:0;max-width:25ch">An open format for writing down your organization's recurring work, so agents and people can run it together.</p>
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
console.log("processes/site/brand/png/og-image.png written");
