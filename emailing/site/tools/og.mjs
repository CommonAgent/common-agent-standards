// og.mjs: draw brand/png/og-image.png, the 1200x630 social image of
// agentemailing.ai, in the dark look of the Common Agent Standards sites: the
// site's own stylesheet and tokens, the hero wash and dot grid, the mark, the
// name, the sentence that says what it is, an inbox line with the checks a
// person sees, and the band of the four colours.
//
//   node emailing/site/tools/og.mjs
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

const tick = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
const badge = (label) => `<span style="display:inline-flex;align-items:stretch;border-radius:8px;overflow:hidden;border:2px solid #15803D;font-family:'IBM Plex Sans';font-weight:700;font-size:19px"><span style="display:grid;place-items:center;width:38px;background:#15803D">${tick}</span><span style="padding:7px 14px;background:#0F2A1A;color:#86EFAC">${label}</span></span>`;
const inbox = `<div style="flex:none;width:430px;background:var(--bg);border:1.5px solid var(--line);border-top:5px solid var(--accent);border-radius:14px;padding:22px 24px;display:grid;gap:14px">
  <div style="font-family:'IBM Plex Sans';font-size:20px;color:var(--text-2)">Bookings desk agent · 10:23</div>
  <div style="font-family:'Space Grotesk';font-weight:600;font-size:27px;color:var(--text)">Re: Book a meeting — done</div>
  <div style="display:flex;flex-wrap:wrap;gap:10px">${badge("Signature verified")}${badge("Text matches")}</div>
  <div style="font-family:'IBM Plex Sans';font-size:19px;line-height:1.45;color:var(--text-2)">Booked: Tuesday 3 November, 10:00 to 10:30. The invitation is attached.</div>
</div>`;

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(`<html data-theme="dark"><head><link rel="stylesheet" href="${base}/site.css"><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=IBM+Plex+Sans:wght@400;500;700&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet"></head>
  <body style="margin:0"><div class="herobg" style="width:1200px;height:630px;display:flex;align-items:center;gap:40px;padding:0 70px 0 90px;box-sizing:border-box">
  <div style="flex:1">
    <div style="display:flex;align-items:center;gap:16px;color:var(--accent)">${MARK.replace('width="24" height="24"', 'width="64" height="64"')}
      <span style="font-family:'IBM Plex Mono';font-weight:500;font-size:26px;color:var(--text-2)">agentemailing.ai</span></div>
    <h1 style="font-size:72px;margin:28px 0 20px;white-space:nowrap">Agent Emailing</h1>
    <p style="font-family:'IBM Plex Sans';font-size:30px;line-height:1.35;color:var(--text);margin:0;max-width:22ch">Signed agent messages carried by ordinary email, through any provider.</p>
    <p style="font-family:'IBM Plex Sans';font-size:22px;color:var(--text-2);margin:26px 0 0">One of the Common Agent Standards</p>
  </div>
  ${inbox}
  </div></body></html>`);
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(800);
mkdirSync(resolve(HERE, "brand/png"), { recursive: true });
await p.screenshot({ path: resolve(HERE, "brand/png/og-image.png") });
await browser.close();
server.close();
console.log("emailing/site/brand/png/og-image.png written");
