// og.mjs: draw brand/png/og-image.png, the 1200x630 social image of
// agentcollab.dev, in the dark look of the Common Agent Standards sites: the
// site's own stylesheet and tokens, the hero wash, the mark, the name, the
// sentence that says what it is, and three agents posting to one shared record.
//
//   node guides/collab/site/tools/og.mjs
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

const agent = (y, label, c) => `<g><circle cx="60" cy="${y}" r="26" fill="var(--bg)" stroke="var(--${c})" stroke-width="3"/><text x="60" y="${y + 6}" text-anchor="middle" font-family="IBM Plex Mono" font-size="16" font-weight="600" fill="var(--text)">${label}</text><path d="M90 ${y} C130 ${y} 140 150 176 150" fill="none" stroke="var(--text-3)" stroke-width="2" stroke-linecap="round"/></g>`;
const entry = (y, text, c) => `<g><rect x="196" y="${y}" width="200" height="40" rx="8" fill="var(--bg)" stroke="var(--line)" stroke-width="1.5"/><rect x="196" y="${y}" width="6" height="40" rx="3" fill="var(--${c})"/><text x="214" y="${y + 26}" font-family="IBM Plex Mono" font-size="15" font-weight="600" fill="var(--text)">${text}</text></g>`;
const graph = `<svg viewBox="0 0 420 300" width="380" height="271" style="flex:none" aria-hidden="true">
  ${agent(50, "A", "violet")}${agent(150, "B", "blue")}${agent(250, "C", "amber")}
  <rect x="180" y="20" width="232" height="260" rx="14" fill="var(--surface)" stroke="var(--text-3)" stroke-width="2"/>
  ${entry(40, "CONVENED", "violet")}${entry(92, "DRAFT 1", "blue")}${entry(144, "CRITIQUE", "amber")}${entry(196, "DONE", "violet")}
</svg>`;

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(`<html data-theme="dark"><head><link rel="stylesheet" href="${base}/site.css"><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet"></head>
  <body style="margin:0"><div class="herobg" style="width:1200px;height:630px;display:flex;align-items:center;gap:30px;padding:0 70px 0 90px;box-sizing:border-box">
  <div style="flex:1">
    <div style="display:flex;align-items:center;gap:16px;color:var(--accent)">${MARK.replace('width="26" height="26"', 'width="64" height="64"')}
      <span style="font-family:'IBM Plex Mono';font-weight:500;font-size:26px;color:var(--text-2)">agentcollab.dev</span></div>
    <h1 style="font-size:74px;margin:28px 0 20px;white-space:nowrap">Agent Collab</h1>
    <p style="font-family:'IBM Plex Sans';font-size:31px;line-height:1.35;color:var(--text);margin:0;max-width:25ch">A library of playbooks that agents read so they can work together.</p>
    <p style="font-family:'IBM Plex Sans';font-size:22px;color:var(--text-2);margin:26px 0 0">A guide kept with the Common Agent Standards</p>
  </div>
  ${graph}
  </div></body></html>`);
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(800);
mkdirSync(resolve(HERE, "brand/png"), { recursive: true });
await p.screenshot({ path: resolve(HERE, "brand/png/og-image.png") });
await browser.close();
server.close();
console.log("guides/collab/site/brand/png/og-image.png written");
