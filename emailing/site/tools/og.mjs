// og.mjs: draw brand/png/og-image.png, the 1200x630 social card of
// agentemailing.ai, from tools/og.html, in the style of the Agent Messaging
// card, with the site's emblem (brand/emblem.svg) put in place of the
// <!-- emblem --> marker, so the card and the site always show the same mark.
//
//   node emailing/site/tools/og.mjs
//
// Playwright comes from this tools folder (npm ci here first).
import { createRequire } from "node:module";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { chromium } = createRequire(join(HERE, "tools", "x.js"))("playwright");

const emblem = readFileSync(resolve(HERE, "brand/emblem.svg"), "utf8").trim();
const html = readFileSync(resolve(HERE, "tools/og.html"), "utf8").replace("<!-- emblem -->", emblem);

const browser = await chromium.launch();
const p = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(html, { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(500);
mkdirSync(resolve(HERE, "brand/png"), { recursive: true });
await p.locator(".card").screenshot({ path: resolve(HERE, "brand/png/og-image.png") });
await browser.close();
console.log("emailing/site/brand/png/og-image.png written");
