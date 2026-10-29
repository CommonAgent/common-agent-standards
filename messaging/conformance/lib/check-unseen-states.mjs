#!/usr/bin/env node
// check-unseen-states.mjs: a reference reading of Agent Messaging §7.3.1,
// run against every case of ../unseen-states.json.
//
//   node messaging/conformance/lib/check-unseen-states.mjs
//
// A view of a Task fills a gap only through `submitted` and `working`: an
// update applies when a legal path (§7.3) from the last state seen reaches it
// through those states and no other. Exits 1 on any case the reading
// disagrees with.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// §7.3, the legal transitions.
export const TRANSITIONS = {
  submitted: ["working", "canceled", "exhausted", "rejected"],
  working: ["completed", "failed", "input_required", "auth_required", "canceled", "exhausted"],
  input_required: ["working", "canceled", "exhausted"],
  auth_required: ["working", "canceled", "exhausted"],
  completed: [],
  failed: [],
  canceled: [],
  rejected: [],
  exhausted: [],
};
const FILLABLE = new Set(["submitted", "working"]);

/**
 * Whether a view whose last seen state is `last` (null for none) applies an
 * update in `update`, and which states it takes as passed through.
 */
export function applyUnseen(last, update) {
  if (!(update in TRANSITIONS)) return { applies: false };
  if (last === null) {
    if (update === "submitted") return { applies: true, passed_through: [] };
    return pathFrom("submitted", update, ["submitted"]);
  }
  if (!(last in TRANSITIONS)) return { applies: false };
  return pathFrom(last, update, []);
}

/** Shortest path from `from` to `to` whose inner states are all fillable. */
function pathFrom(from, to, prefix) {
  const queue = [[from, prefix]];
  const seen = new Set();
  while (queue.length) {
    const [state, passed] = queue.shift();
    for (const next of TRANSITIONS[state]) {
      if (next === to) return { applies: true, passed_through: passed };
      if (FILLABLE.has(next) && !seen.has(next)) {
        seen.add(next);
        queue.push([next, [...passed, next]]);
      }
    }
  }
  return { applies: false };
}

const here = dirname(fileURLToPath(import.meta.url));
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const fx = JSON.parse(readFileSync(join(here, "..", "unseen-states.json"), "utf8"));
  let bad = 0;
  for (const c of fx.cases) {
    const got = applyUnseen(c.last, c.update);
    const ok = got.applies === c.applies && (!c.applies || JSON.stringify(got.passed_through) === JSON.stringify(c.passed_through));
    if (!ok) {
      bad++;
      console.log(`FAIL  ${c.name}: expected ${JSON.stringify({ applies: c.applies, passed_through: c.passed_through })}, got ${JSON.stringify(got)}`);
    }
  }
  console.log(`unseen-states: ${fx.cases.length - bad} of ${fx.cases.length} cases agree with the reference reading`);
  process.exit(bad ? 1 : 0);
}
