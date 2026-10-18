// diagram.mjs: draw "How agents work together", the figure in the home page's
// section "Where Agent Processes fits", and write it into index.html between
// the marker comments <!-- figure:coord --> and <!-- /figure:coord -->.
//
//   node processes/site/tools/diagram.mjs
//
// The drawing, its words and its geometry come from the approved still
// (coordination-diagram/build.mjs, 2026-10-18): the same three panels, the same
// shapes in the same places, and the same sentences. Here each panel is its own
// small SVG coloured by the site's tokens, so the figure follows the light and
// dark themes, and the titles and sentences are page text, so they stay
// readable on a phone and the contrast gate can measure them. Process-led
// orchestration, the one this site covers, is highlighted.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const INDEX = resolve(dirname(fileURLToPath(import.meta.url)), "../index.html");
const f = (n) => Number(n.toFixed(1));
const vert = (r, cx, cy) => [0, 1, 2, 3, 4, 5].map((i) => { const a = (Math.PI / 180) * (-90 + 60 * i); return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
const pts = (vs) => vs.map(([x, y]) => `${f(x)},${f(y)}`).join(" ");
const hex = (x, y, r, cls = "d-hex", sw) => `<polygon points="${pts(vert(r, x, y))}" class="${cls}"${sw ? ` style="stroke-width:${sw}"` : ""}/>`;
const R = 34;

function svg(id, viewBox, body) {
  return `<svg viewBox="${viewBox}" aria-hidden="true" focusable="false"><defs><marker id="${id}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1L8 5L1 9" class="d-head"/></marker></defs>${body.replace(/MARK/g, id)}</svg>`;
}
const arrow = (d) => `<path d="${d}" class="d-arr" marker-end="url(#MARK)"/>`;

// 1 · Process-led: a written process at the top; the first two steps run in parallel, then the third
const p1 = (() => {
  const D = [200, 140], A = [110, 250], B = [290, 250], C = [200, 345];
  const doc = `<rect x="${D[0] - 46}" y="${D[1] - 32}" width="92" height="64" rx="10" class="d-card"/><path d="M${D[0] - 26} ${D[1] - 14}h52M${D[0] - 26} ${D[1]}h52M${D[0] - 26} ${D[1] + 14}h34" class="d-ic"/>`;
  return svg("ah-p1", "66 98 268 294", [doc,
    arrow(`M${D[0] - 30} ${D[1] + 34}L${A[0] + 14} ${A[1] - R - 8}`), arrow(`M${D[0] + 30} ${D[1] + 34}L${B[0] - 14} ${B[1] - R - 8}`),
    arrow(`M${A[0] + 28} ${A[1] + 22}L${C[0] - 40} ${C[1] - 27}`), arrow(`M${B[0] - 28} ${B[1] + 22}L${C[0] + 40} ${C[1] - 27}`),
    hex(...A, R), hex(...B, R), hex(...C, R)].join(""));
})();

// 2 · Harness-led: one larger lead cell runs its own loop, hands work to three helpers, and writes a record at the end
const p2 = (() => {
  const L = [130, 215], H = [[330, 125], [330, 215], [330, 305]];
  const loop = `<g transform="translate(${L[0] - 46} ${L[1] - 50})" class="d-loop"><path d="M12 -8A14 14 0 1 0 14 6"/><path d="M4 -14l9 6-6 9"/></g>`;
  return svg("ah-p2", "52 82 318 302", [...H.map(([x, y]) => arrow(`M${L[0] + 52} ${f(L[1] + (y - L[1]) * 0.35)}L${x - R - 10} ${y}`)),
    arrow(`M${L[0]} ${L[1] + 62}V${L[1] + 104}`),
    `<rect x="${L[0] - 62}" y="${L[1] + 112}" width="124" height="50" rx="10" class="d-card"/><text x="${L[0]}" y="${L[1] + 145}" class="d-text" text-anchor="middle">record</text>`,
    hex(...L, 56, "d-hex", 4.2), `<circle cx="${L[0] - 46}" cy="${L[1] - 50}" r="22" class="d-loopbg"/>`, loop,
    ...H.map(([x, y]) => hex(x, y, R))].join(""));
})();

// 3 · Choreography: one event in the centre; three cells each react on their own, with nothing between them
const p3 = (() => {
  const E = [200, 240], CS = [[85, 145], [315, 145], [200, 355]];
  return svg("ah-p3", "38 92 324 316", [`<circle cx="${E[0]}" cy="${E[1]}" r="62" class="d-ring d-r3"/><circle cx="${E[0]}" cy="${E[1]}" r="40" class="d-ring d-r2"/><circle cx="${E[0]}" cy="${E[1]}" r="16" class="d-dot"/>`,
    ...CS.map(([x, y]) => `${hex(x, y, R + 9, "d-react")}${hex(x, y, R)}`)].join(""));
})();

const panel = (cls, title, line, drawing, best, tag = "") => `<div class="way${cls}">
              ${tag}<h3>${title}</h3>
              <p class="line">${line}</p>
              ${drawing}
              <p class="best">${best}</p>
            </div>`;

const figure = `<figure class="coord" aria-labelledby="coord-title">
          <p class="ctitle" id="coord-title">How agents work together</p>
          <div class="coord-grid">
            ${panel(" here", "Process-led orchestration", "A written process leads.", p1, "Best for recurring work that must run the same way every time.", `<span class="here-tag">What Agent Processes covers</span>`)}
            ${panel("", "Harness-led orchestration", "An agent's own loop leads.", p2, "Best for open-ended work where nobody knows the steps yet.")}
            ${panel("", "Choreography", "Nobody leads.", p3, "Best for loosely connected teams that each react to the same news.")}
          </div>
          <p class="mix">They mix: a process can hand one step to a harness, and an event can start either.</p>
        </figure>`;

const s = readFileSync(INDEX, "utf8").replace(/\r\n/g, "\n");
const re = /(<!-- figure:coord -->)[\s\S]*?(<!-- \/figure:coord -->)/;
if (!re.test(s)) throw new Error("index.html: no figure:coord markers");
writeFileSync(INDEX, s.replace(re, () => `<!-- figure:coord -->\n        ${figure}\n        <!-- /figure:coord -->`));
console.log("index.html: figure:coord written");
