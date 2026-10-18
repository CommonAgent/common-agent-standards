// og.mjs: draw brand/png/og-image.png, the 1200x630 social image of
// agentsow.com, in the dark look of the Common Agent Standards sites: the
// site's own stylesheet and tokens, the hero wash and dot grid, the mark, the
// name, the sentence that says what it is, four clauses of the home page's
// example with their grades, and the band of the four colours.
//
//   node sow/site/tools/og.mjs
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

const row = (k, g, c) => `<div style="display:flex;justify-content:space-between;gap:18px;padding:13px 0;border-bottom:1px solid var(--line)"><span style="color:var(--accent);font-weight:600">${k}</span><span style="color:var(--${c});font-weight:600">[${g}]</span></div>`;
const clauses = `<div style="flex:none;width:330px;font-family:'IBM Plex Mono';font-size:21px;background:var(--bg);border:1.5px solid var(--line);border-radius:16px;padding:10px 24px 12px">
  ${row("scope", "ENFORCED", "mint")}${row("price", "ENFORCED", "mint")}${row("disputes", "EVIDENCE", "blue")}${row("promises", "RECORDED", "amber").replace("border-bottom:1px solid var(--line)", "")}
</div>`;

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(`<html data-theme="dark"><head><link rel="stylesheet" href="${base}/site.css"><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet"></head>
  <body style="margin:0"><div class="herobg" style="width:1200px;height:630px;display:flex;align-items:center;gap:40px;padding:0 80px 0 90px;box-sizing:border-box">
  <div style="flex:1">
    <div style="display:flex;align-items:center;gap:16px;color:var(--text)">${MARK.replace('width="26" height="26"', 'width="64" height="64"')}
      <span style="font-family:'IBM Plex Mono';font-weight:500;font-size:26px;color:var(--text-2)">agentsow.com</span></div>
    <h1 style="font-size:78px;margin:28px 0 20px;white-space:nowrap">Agent SoW</h1>
    <p style="font-family:'IBM Plex Sans';font-size:30px;line-height:1.35;color:var(--text);margin:0;max-width:26ch">A statement of work between two parties whose agents do recurring work together, with every clause graded.</p>
    <p style="font-family:'IBM Plex Sans';font-size:22px;color:var(--text-2);margin:26px 0 0">One of the Common Agent Standards</p>
  </div>
  ${clauses}
  </div></body></html>`);
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(800);
mkdirSync(resolve(HERE, "brand/png"), { recursive: true });
await p.screenshot({ path: resolve(HERE, "brand/png/og-image.png") });
await browser.close();
server.close();
console.log("sow/site/brand/png/og-image.png written");
