#!/usr/bin/env node
// check-unseen-states.mjs: reference readings of Agent Messaging §7.3.1 and of
// the binding A2A over Agent Messaging §5 (wire 0.4.0),
// run against every case of ../unseen-states.json.
//
//   node messaging/conformance/lib/check-unseen-states.mjs
//
// Wire 0.4.0: a view takes an update in any A2A state unless the last state
// it saw is terminal, and fills no gap, because A2A gives no transition
// table. Wire 0.3.0, kept for the transition window: a view fills a gap only
// through `submitted` and `working`, so an update applies when a legal path
// (Agent Messaging 0.9 §7.3) from the last state seen reaches it through those
// states and no other. Exits 1 on any case a reading disagrees with.
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

// Wire version 0.4.0 (bindings/a2a.md §5): A2A's states, and a terminal Task
// does not move again. A2A gives no transition table, so no gap is filled.
export const A2A_TERMINAL = new Set(["TASK_STATE_COMPLETED", "TASK_STATE_FAILED", "TASK_STATE_CANCELED", "TASK_STATE_REJECTED"]);
export const A2A_STATES = new Set([...A2A_TERMINAL, "TASK_STATE_SUBMITTED", "TASK_STATE_WORKING", "TASK_STATE_INPUT_REQUIRED", "TASK_STATE_AUTH_REQUIRED"]);
export function applyA2A(last, update) {
  if (!A2A_STATES.has(update)) return { applies: false };
  if (last !== null && (!A2A_STATES.has(last) || A2A_TERMINAL.has(last))) return { applies: false };
  return { applies: true };
}

const here = dirname(fileURLToPath(import.meta.url));
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const fx = JSON.parse(readFileSync(join(here, "..", "unseen-states.json"), "utf8"));
  let bad = 0;
  const v04 = fx.wire_0_4_0?.cases ?? [];
  if (!v04.length) { bad++; console.log("FAIL  no wire_0_4_0 cases"); }
  for (const c of v04) {
    const got = applyA2A(c.last, c.update);
    if (got.applies !== c.applies) { bad++; console.log(`FAIL  0.4.0 / ${c.name}: expected applies ${c.applies}, got ${got.applies}`); }
  }
  for (const c of fx.cases) {
    const got = applyUnseen(c.last, c.update);
    const ok = got.applies === c.applies && (!c.applies || JSON.stringify(got.passed_through) === JSON.stringify(c.passed_through));
    if (!ok) {
      bad++;
      console.log(`FAIL  0.3.0 / ${c.name}: expected ${JSON.stringify({ applies: c.applies, passed_through: c.passed_through })}, got ${JSON.stringify(got)}`);
    }
  }
  const total = v04.length + fx.cases.length;
  console.log(`unseen-states: ${total - bad} of ${total} cases agree with the reference readings (${v04.length} for wire 0.4.0, ${fx.cases.length} for 0.3.0 in the transition window)`);
  process.exit(bad ? 1 : 0);
}
