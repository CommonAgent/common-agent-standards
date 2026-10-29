#!/usr/bin/env node
// The same checks, over the quote story as each transport carried it.
//
//   node messaging/conformance/cross-transport/check.mjs results/<run>-*.json
//
// Each transcript is what one transport's run of story.mjs wrote: the four
// signed envelopes as the receiving side got them, the states the buyer's
// view of the task saw in order, and what the buyer did with the forged
// quote. The checks below are the same for every transport, which is the
// point: only delivery changes. Node alone, nothing installed; signatures are
// checked with ../lib/envelope-vectors.mjs and the buyer's view with
// ../lib/check-unseen-states.mjs (Agent Messaging §7.3.1).
//
// Exits 1 when any check fails on any transcript.
import { readFileSync } from "node:fs";
import { verifyEnvelope } from "../lib/envelope-vectors.mjs";
import { applyUnseen } from "../lib/check-unseen-states.mjs";
import { OFFERING, BUDGET_CEILING, FILES, sha256hex } from "./story.mjs";

/** Every file entry an envelope names, wherever its shape puts it. */
function filesOf(env) {
  const out = [];
  const p = env.payload ?? {};
  for (const list of [p.files, p.output?.files]) if (Array.isArray(list)) out.push(...list);
  for (const a of env.artifacts ?? []) for (const part of a.parts ?? []) if (part && (part.name || part.digest)) out.push(part);
  return out;
}
const hasFile = (env, f) => filesOf(env).some((x) => x.name === f.name && String(x.digest ?? "").replace(/^sha256:/, "") === sha256hex(f.bytes));
const said = (env) => JSON.stringify(env.payload ?? {}) + JSON.stringify(env.artifacts ?? []);

export function checkTranscript(t) {
  const [ask, needs, answer, done] = t.messages ?? [];
  const B = t.parties?.buyer, S = t.parties?.supplier;
  const checks = [];
  const c = (name, ok, why) => checks.push({ check: name, pass: !!ok, ...(ok ? {} : { why }) });

  c("four messages, each verifying on its own signature", t.messages?.length === 4 && t.messages.every((e) => verifyEnvelope(e)), "a message is missing or does not verify");
  c("1. the request: buyer to supplier, the offering, the parts list by digest, a 500.00 USD budget",
    ask?.type === "request" && ask.from === B && ask.to === S && ask.payload?.offering === OFFERING && hasFile(ask, FILES.request) &&
      ask.budget?.revision === 0 && ask.budget?.cost_ceiling?.amount_micro === BUDGET_CEILING.amount_micro && ask.budget?.cost_ceiling?.currency === BUDGET_CEILING.currency,
    "the request is not the story's request");
  const T = needs?.task_id;
  c("2. needs your input: the supplier pauses a task and asks about split delivery",
    needs?.type === "respond" && needs.from === S && needs.to === B && needs.in_reply_to === ask?.id && !!T &&
      needs.payload?.status === "input_required" && /split delivery/i.test(said(needs)),
    "the second message is not the supplier's question on a task");
  c("3. the answer: the buyer answers on the same task",
    answer?.type === "request" && answer.from === B && answer.to === S && answer.task_id === T && /true|yes/i.test(JSON.stringify(answer.payload ?? {})),
    "the third message is not the buyer's answer on the task");
  c("4. done: the quote on the same task, 412.50 USD, the PDF by digest",
    // Bound to the task: it carries the task id, or it answers the request
    // that named the task (an SDK answers a resume with a bare reply and
    // records the outcome on the task's own update subject, Agent Messaging §7.3).
    done?.type === "respond" && done.from === S && done.to === B && (done.task_id === T || (done.in_reply_to === answer?.id && answer?.task_id === T)) && done.payload?.status === "completed" &&
      /412\.50 USD/.test(said(done)) && hasFile(done, FILES.done),
    "the fourth message is not the quote");
  let last = null;
  let viewOk = Array.isArray(t.buyer_view) && t.buyer_view.length > 0;
  for (const s of t.buyer_view ?? []) {
    if (s === last) continue;
    const r = applyUnseen(last, s);
    if (!r.applies) { viewOk = false; break; }
    last = s;
  }
  c("the buyer's view of the task is legal under §7.3.1 and ends completed", viewOk && last === "completed", `view: ${JSON.stringify(t.buyer_view)}`);
  c("the forged quote does not verify, and the buyer refused it",
    t.forged?.envelope && !verifyEnvelope(t.forged.envelope) && t.forged.refused === true && /4125\.00 USD/.test(said(t.forged.envelope)),
    "the forged quote verified, or the buyer took it");
  return checks;
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/").split("/").pop())) {
  const files = process.argv.slice(2);
  if (!files.length) {
    console.error("usage: check.mjs <transcript.json> ...");
    process.exit(2);
  }
  let failed = 0;
  const rows = [];
  for (const f of files) {
    const t = JSON.parse(readFileSync(f, "utf8"));
    const checks = checkTranscript(t);
    rows.push({ transport: t.transport, checks });
    for (const k of checks) if (!k.pass) failed++;
  }
  const names = rows[0].checks.map((k) => k.check);
  for (const [i, name] of names.entries()) {
    console.log(`${name}\n    ${rows.map((r) => `${r.transport}: ${r.checks[i].pass ? "pass" : `FAIL (${r.checks[i].why})`}`).join("    ")}`);
  }
  console.log(failed ? `${failed} check(s) failed` : `every check passed on ${rows.map((r) => r.transport).join(", ")}`);
  process.exit(failed ? 1 : 0);
}
