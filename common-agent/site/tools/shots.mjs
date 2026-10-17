// shots.mjs: serve the site folder locally and take screenshots of every page
// at desktop and phone width, light and dark; with --og, also draw
// brand/png/og-image.png. Usage: node tools/shots.mjs <out folder> [--og]
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, mkdirSync } from "node:fs";
import { resolve, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(process.argv[2] ?? join(ROOT, "shots"));
mkdirSync(OUT, { recursive: true });
const T = { ".html": "text/html", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".js": "text/javascript" };
const server = createServer((req, res) => {
  let p = decodeURIComponent(req.url.split(/[?#]/)[0]); if (p.endsWith("/")) p += "index.html";
  const f = join(ROOT, p);
  if (!existsSync(f) || !statSync(f).isFile()) { res.writeHead(404, { "content-type": "text/html" }); res.end(readFileSync(join(ROOT, "404.html"))); return; }
  res.writeHead(200, { "content-type": T[extname(f)] || "application/octet-stream" }); res.end(readFileSync(f));
});
await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
if (process.argv.includes("--og")) {
  const p = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await p.goto(base + "/");
  await p.setContent(`<html><head><link rel="stylesheet" href="${base}/site.css"><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=IBM+Plex+Sans:wght@400;500&display=swap" rel="stylesheet"></head>
  <body style="margin:0"><div class="herobg" style="width:1200px;height:630px;display:flex;flex-direction:column;justify-content:center;padding:0 90px;box-sizing:border-box">
  <div style="display:flex;align-items:center;gap:18px;color:var(--accent)"><svg viewBox="0 0 32 32" width="72" height="72"><path d="M16 2.8 27.4 9.4v13.2L16 29.2 4.6 22.6V9.4z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M11 12.5v7M16 10.5v11M21 12.5v7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
  <span style="font-family:'IBM Plex Sans';font-weight:500;font-size:28px;color:var(--text-2)">commonagent.net</span></div>
  <h1 style="font-size:76px;margin:30px 0 18px;max-width:15ch">The Common Agent Specification</h1>
  <p style="font-family:'IBM Plex Sans';font-size:32px;color:var(--text-2);margin:0;max-width:40ch">The definition of the agent as a testable claim.</p></div></body></html>`);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  await p.screenshot({ path: join(ROOT, "brand/png/og-image.png") });
  await p.close();
  console.log("brand/png/og-image.png written");
}
const pages = (process.env.PAGES ?? "index.html,spec.html,descriptor.html,package.html,versions.html,conformance.html,404.html").split(",");
for (const [label, vw, vh, full] of [["desktop", 1440, 900, false], ["phone", 390, 844, false]]) {
  for (const theme of ["light", "dark"]) {
    const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: label === "phone" ? 2 : 1, isMobile: label === "phone", hasTouch: label === "phone" });
    for (const pg of pages) {
      const p = await ctx.newPage();
      await p.goto(`${base}/${pg}${theme === "dark" ? "#dark" : ""}`, { waitUntil: "networkidle" });
      await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
      const sw = await p.evaluate(() => document.documentElement.scrollWidth);
      if (sw > vw) console.log(`WARNING ${pg} ${label}: page is ${sw}px wide at ${vw}px`);
      await p.screenshot({ path: join(OUT, `${pg.replace(".html", "")}-${label}-${theme}.png`), fullPage: full });
      await p.close();
    }
    await ctx.close();
  }
}
await browser.close(); server.close();
console.log(`screenshots in ${OUT}`);
