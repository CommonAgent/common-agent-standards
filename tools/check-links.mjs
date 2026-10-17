#!/usr/bin/env node
// check-links.mjs: the links in the standards and in their rendered sites.
//
//   node tools/check-links.mjs [folder ...]          the Markdown in these folders (default: every tracked .md file)
//   node tools/check-links.mjs --site <rendered>     the pages of a rendered site
//   add --external                                   also fetch every http(s) link once
//
// A relative link in a Markdown file must name a file or folder of this
// repository. A link in a rendered page that starts with "/" or is relative
// must name a file in the rendered folder ("/x/" means "/x/index.html").
// Fragments are not checked. With --external, every distinct http(s) address
// is requested once (HEAD, then GET when HEAD is refused); an address that
// answers 404 or 410 fails the check, and anything else that is not a success
// (a timeout, 403, 429, a 5xx) is listed as a warning, because a site that is
// down for a minute is not a broken link. Addresses at example domains, on
// localhost and with template placeholders are skipped.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const external = args.includes("--external");
const siteAt = args.indexOf("--site");
const site = siteAt >= 0 ? resolve(args[siteAt + 1]) : null;
const folders = args.filter((a, i) => !a.startsWith("--") && !(siteAt >= 0 && i === siteAt + 1));

const failures = [];
const urls = new Map(); // url -> first place it was seen

const SKIP_HOST = /(^|\.)(example\.(com|org|net)|[a-z0-9-]+\.example|localhost|127\.0\.0\.1|0\.0\.0\.0|host\.docker\.internal|b\.co|x\.co|acme\.com)$/i;
function noteUrl(u, where) {
  if (/[<>{}$`]|\.\.\.|\*/.test(u)) return;
  let host;
  try { host = new URL(u).hostname; } catch { return; }
  if (SKIP_HOST.test(host) || !host.includes(".")) return;
  if (!urls.has(u)) urls.set(u, where);
}

// ── Markdown ────────────────────────────────────────────────────────────────
function markdownFiles() {
  const all = execFileSync("git", ["-C", REPO, "ls-files", "*.md"], { encoding: "utf8" }).split("\n").filter(Boolean);
  if (!folders.length) return all;
  return all.filter((f) => folders.some((d) => f === d || f.startsWith(d.replace(/\/?$/, "/"))));
}
if (!site) {
  const files = markdownFiles();
  let links = 0;
  for (const f of files) {
    const text = readFileSync(join(REPO, f), "utf8")
      .replace(/```[\s\S]*?```/g, "")      // code blocks are examples, not links
      .replace(/`[^`\n]*`/g, "");          // and so is inline code
    const found = [...text.matchAll(/\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)].map((m) => m[1])
      .concat([...text.matchAll(/<a\s[^>]*href="([^"]+)"/g)].map((m) => m[1]))
      .concat([...text.matchAll(/(?<![("<\w])(https?:\/\/[^\s)<>\]"'`]+)/g)].map((m) => m[1].replace(/[.,;:]+$/, "")));
    for (const target of found) {
      links++;
      if (/^https?:\/\//.test(target)) { noteUrl(target, f); continue; }
      if (/^(mailto:|#|tel:|data:)/.test(target) || /[<>{}$*]/.test(target)) continue;
      const path = decodeURIComponent(target.split("#")[0].split("?")[0]);
      if (!path) continue;
      const abs = path.startsWith("/") ? join(REPO, path) : join(REPO, dirname(f), path);
      if (!existsSync(abs)) failures.push(`${f}: no such file ${target}`);
    }
  }
  console.log(`${files.length} Markdown files, ${links} links`);
}

// ── a rendered site ─────────────────────────────────────────────────────────
if (site) {
  const walk = (d) => readdirSync(d).flatMap((f) => statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]);
  const pages = walk(site).filter((f) => f.endsWith(".html"));
  let links = 0;
  for (const p of pages) {
    const html = readFileSync(p, "utf8").replace(/<script[\s\S]*?<\/script>/g, "");
    for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
      const target = m[1].replace(/&amp;/g, "&");
      links++;
      if (/^https?:\/\//.test(target)) { noteUrl(target, relative(site, p)); continue; }
      if (/^(mailto:|#|tel:|data:|javascript:)|^\/\//.test(target)) continue;
      let path = decodeURIComponent(target.split("#")[0].split("?")[0]);
      if (!path) continue;
      let abs = path.startsWith("/") ? join(site, path) : join(dirname(p), path);
      if (path.endsWith("/")) abs = join(abs, "index.html");
      if (!existsSync(abs)) failures.push(`${relative(site, p)}: no such file ${target}`);
    }
  }
  console.log(`${pages.length} pages, ${links} links`);
}

// ── addresses outside ───────────────────────────────────────────────────────
const warnings = [];
if (external) {
  const list = [...urls.keys()];
  const ask = async (u, method) => {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 20000);
    try { return (await fetch(u, { method, redirect: "follow", signal: ctl.signal, headers: { "user-agent": "common-agent-standards-link-check" } })).status; }
    catch (e) { return `error (${e.name === "AbortError" ? "timeout" : e.cause?.code ?? e.message})`; }
    finally { clearTimeout(t); }
  };
  let i = 0;
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (i < list.length) {
      const u = list[i++];
      let s = await ask(u, "HEAD");
      if (s !== 200 && !(typeof s === "number" && s >= 200 && s < 400)) s = await ask(u, "GET");
      if (s === 404 || s === 410) failures.push(`${urls.get(u)}: ${u} answers ${s}`);
      else if (!(typeof s === "number" && s >= 200 && s < 400)) warnings.push(`${urls.get(u)}: ${u} answers ${s}`);
    }
  }));
  console.log(`${list.length} outside addresses requested`);
}

for (const w of warnings) console.log(`warning: ${w}`);
for (const f of failures) console.log(`BROKEN: ${f}`);
if (failures.length) { console.log(`${failures.length} broken link(s)`); process.exit(1); }
console.log("links: none broken");
