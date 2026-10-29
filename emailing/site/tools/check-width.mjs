// check-width.mjs: open every page at 390 px wide, in light and dark, with the
// phone menu open and closed, and fail if anything scrolls sideways: the page
// itself, or any box inside it that scrolls horizontally.
//
//   PLAYWRIGHT_FROM=<a folder with playwright installed> node tools/check-width.mjs [--root dist]
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, extname, resolve } from "node:path";

const { chromium } = createRequire(join(process.env.PLAYWRIGHT_FROM || import.meta.dirname, "x.js"))("playwright");
const args = process.argv.slice(2);
const root = resolve(args.includes("--root") ? args[args.indexOf("--root") + 1] : "dist");
const pages = readdirSync(root).filter((f) => f.endsWith(".html"));
const TYPES = { ".html": "text/html", ".css": "text/css", ".svg": "image/svg+xml", ".json": "application/json", ".md": "text/markdown", ".mjs": "text/javascript", ".eml": "message/rfc822" };

const server = createServer((req, res) => {
  let p = join(root, decodeURIComponent(req.url.split("?")[0]));
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, "index.html");
  if (!existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": TYPES[extname(p)] ?? "application/octet-stream" });
  res.end(readFileSync(p));
}).listen(0);
const base = `http://127.0.0.1:${server.address().port}/`;

const browser = await chromium.launch();
let failures = 0;
for (const theme of ["light", "dark"]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  for (const file of pages) {
    for (const menu of [false, true]) {
      await page.goto(`${base}${file}#${theme}`, { waitUntil: "networkidle" });
      if (menu) await page.click("#menu");
      const bad = await page.evaluate(() => {
        const out = [];
        const doc = document.documentElement;
        if (doc.scrollWidth > window.innerWidth + 1) out.push(`page is ${doc.scrollWidth}px wide`);
        for (const el of document.querySelectorAll("body *")) {
          const cs = getComputedStyle(el);
          if (cs.display === "none" || cs.visibility === "hidden") continue;
          if (/(auto|scroll)/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 1)
            out.push(`<${el.tagName.toLowerCase()} class="${el.className}"> scrolls ${el.scrollWidth - el.clientWidth}px`);
          const r = el.getBoundingClientRect();
          if (r.width && r.right > window.innerWidth + 1 && !el.closest("[style*='overflow']"))
            out.push(`<${el.tagName.toLowerCase()} class="${el.className}"> ends at ${Math.round(r.right)}px`);
        }
        return [...new Set(out)].slice(0, 8);
      });
      if (bad.length) { failures++; console.log(`FAIL ${file} [${theme}${menu ? ", menu open" : ""}]\n  ${bad.join("\n  ")}`); }
    }
  }
  await ctx.close();
}
await browser.close();
server.close();
console.log(failures ? `${failures} page view(s) scroll sideways at 390px` : `width check: ${pages.length} pages x light/dark x menu open/closed at 390px, nothing scrolls sideways`);
process.exit(failures ? 1 : 0);
