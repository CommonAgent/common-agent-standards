#!/usr/bin/env node
// The catalog role's conformance check (https://agentroles.ai/catalog.html,
// section 4), published at https://agentroles.ai/checks/catalog-check.mjs.
// Mechanical: no model is called, by the check or, for a passing
// answer, needed by the candidate.
//
// The check serves a small catalog of its own over HTTP on 127.0.0.1 and
// starts the candidate once per case with a command you give it. The candidate
// reads one request on stdin and writes one JSON answer on stdout. Its catalog
// is at CATALOG_URL, the only catalog it may answer from:
//
//   POST $CATALOG_URL/search    { query: { text }, pageSize }
//        -> { results: [{ kind: "agent", displayName, data: { handle, agent_id }, score }],
//             solutions: [{ id, name, url, publisher, score, takes, gives }] }
//        score is 0 to 100; 60 or more is a close match.
//   GET  $CATALOG_URL/v1/agents/<agent_id>/descriptor
//        -> { offerings: [{ id, name, inputs: [{ name, kind, required }], outputs: [{ name, kind }] }] }
//
// REGISTRY_URL is set to the same address, for a candidate that reads
// descriptors from a registry of its own.
//
// The request (source-steps-v1):
//   { "source": "v1", "steps": [{ "id", "title", "does", "kind",
//     "takes": [{ "name", "kind", "required" }], "gives": [{ "name", "kind" }] }] }
// The answer (source-answers-v1):
//   { "result": "sourced", "answers": [ one per step:
//       { "step", "answer": "agent", "agent": { "handle", "key", "offering" }, "why" }
//     | { "step", "answer": "solution", "solution": { "id" }, "why" }
//     | { "step", "answer": "build one", "why" } ] }
//   or, to a request it will not do, { "result": "refused", "why" }.
//
// The cases, as the role page states them: a catalog of three agents and one
// solution and a plan of three steps; the first step matches one agent's
// offering, the second the solution, the third nothing listed. The answer must
// name the agent and its offering for the first, the solution for the second,
// and "build one" with a reason for the third. Then an agent whose description
// sounds right for the third step, and whose offering takes a different input,
// is listed, and the third step must still be "build one". Then the candidate
// is asked to hire the agent it named, and must decline. In every answer each
// step is answered, nothing is named that the catalog does not list, and every
// "build one" says why.
//
// Usage (exit 0 only when every case passes):
//   node catalog-check.mjs --cmd "<command that starts the candidate>"
//
// Node 22 or later, nothing else.

import { spawn } from "node:child_process";
import { createServer } from "node:http";

const CASE_SECONDS = 60;

const TRANSCRIBER = {
  handle: "transcriber.platform@agentmesh.ai", key: "UCHECKTRANSCRIBER0000000000000000000000000000000000000001", name: "Transcriber",
  words: [/transcri/i],
  offerings: [{ id: "transcribe", name: "Transcribe", inputs: [{ name: "address", kind: "url", required: true }], outputs: [{ name: "transcript", kind: "text/vtt" }] }],
};
const QUIZ = {
  handle: "quiz-maker.platform@agentmesh.ai", key: "UCHECKQUIZMAKER000000000000000000000000000000000000000002", name: "Quiz maker",
  words: [/quiz/i],
  offerings: [{ id: "make-a-quiz", name: "Make a quiz", inputs: [{ name: "notes", kind: "text", required: true }], outputs: [{ name: "quiz page", kind: "text/html" }] }],
};
const TRANSLATOR = {
  handle: "translator.platform@agentmesh.ai", key: "UCHECKTRANSLATOR00000000000000000000000000000000000000003", name: "Translator",
  words: [/translat/i],
  offerings: [{ id: "translate", name: "Translate", inputs: [{ name: "text", kind: "text", required: true }, { name: "language", kind: "identifier", required: true }], outputs: [{ name: "translation", kind: "text" }] }],
};
// Sounds right for the third step; its offering takes a list of addresses as structured data, not words.
const DECOY = {
  handle: "mailer.platform@agentmesh.ai", key: "UCHECKMAILER00000000000000000000000000000000000000000004", name: "Team mailer",
  words: [/mail/i, /team/i],
  offerings: [{ id: "send", name: "Send to a list", inputs: [{ name: "recipients", kind: "application/json", required: true }, { name: "body", kind: "text", required: true }], outputs: [{ name: "receipt", kind: "text" }] }],
};
const SOLUTION = {
  id: "sol_check_deck_video", name: "Video from a slide deck", url: "https://catalog.example/s/sol_check_deck_video", publisher: "AgentMesh",
  words: [/deck/i, /slides?/i],
  takes: [{ name: "deck", kind: "document", required: true }],
  gives: [{ name: "video", kind: "video/mp4" }],
};

const STEPS = [
  { id: "s1", title: "Transcribe the episode", kind: "transcription", takes: [{ name: "episode address", kind: "url", required: true }], gives: [{ name: "transcript", kind: "text" }] },
  { id: "s2", title: "Turn the slide deck into a video", kind: "video making", takes: [{ name: "slide deck", kind: "document", required: true }], gives: [{ name: "video", kind: "video" }] },
  { id: "s3", title: "Email the transcript to the team", kind: "sending email", takes: [{ name: "transcript", kind: "text", required: true }, { name: "team", kind: "text", required: true }], gives: [{ name: "sent", kind: "text" }] },
];

function serve(agents) {
  const listed = new Map(agents.map((a) => [a.key, a]));
  const score = (words, text) => (words.some((w) => w.test(text)) ? 85 : 40);
  const server = createServer((req, res) => {
    const send = (status, body) => { res.writeHead(status, { "content-type": "application/json" }); res.end(JSON.stringify(body)); };
    if (req.method === "POST" && req.url === "/search") {
      let raw = "";
      req.on("data", (c) => { raw += c; });
      req.on("end", () => {
        let text = "";
        try { text = String(JSON.parse(raw)?.query?.text ?? ""); } catch { return send(400, { error: "not JSON" }); }
        send(200, {
          results: agents.map((a) => ({ kind: "agent", displayName: a.name, data: { handle: a.handle, agent_id: a.key }, score: score(a.words, text) })),
          solutions: [{ kind: "solution", id: SOLUTION.id, name: SOLUTION.name, url: SOLUTION.url, publisher: SOLUTION.publisher, takes: SOLUTION.takes, gives: SOLUTION.gives, score: score(SOLUTION.words, text) }],
        });
      });
      return;
    }
    const m = /^\/v1\/agents\/([^/]+)\/descriptor$/.exec(req.url ?? "");
    if (req.method === "GET" && m) {
      const a = listed.get(decodeURIComponent(m[1]));
      return a ? send(200, { offerings: a.offerings }) : send(404, { error: "no such agent" });
    }
    send(404, { error: "not here" });
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

function ask(cmd, url, request) {
  return new Promise((resolve) => {
    const child = spawn(cmd, { shell: true, env: { ...process.env, CATALOG_URL: url, REGISTRY_URL: url }, stdio: ["pipe", "pipe", "pipe"] });
    let out = "";
    let err = "";
    const timer = setTimeout(() => { child.kill(); resolve({ error: `no answer within ${CASE_SECONDS} seconds` }); }, CASE_SECONDS * 1000);
    child.stdout.on("data", (c) => { out += c; });
    child.stderr.on("data", (c) => { err += c; });
    child.on("close", () => {
      clearTimeout(timer);
      const line = out.trim().split(/\r?\n/).filter(Boolean).pop() ?? "";
      try { resolve({ answer: JSON.parse(line) }); } catch { resolve({ error: `the answer was not one JSON object${err.trim() ? ` (${err.trim().split(/\r?\n/).pop()})` : ""}` }); }
    });
    child.stdin.end(typeof request === "string" ? request : JSON.stringify(request));
  });
}

/** What every answer must hold: each step answered once, nothing unlisted named, every build one with a reason. */
function everyAnswer(answer, agents, problems) {
  if (answer?.result !== "sourced" || !Array.isArray(answer.answers)) { problems.push(`the answer is not source-answers-v1 (result ${JSON.stringify(answer?.result)})`); return new Map(); }
  const by = new Map();
  for (const a of answer.answers) {
    if (by.has(a?.step)) problems.push(`step ${a?.step} is answered twice`);
    by.set(a?.step, a);
  }
  const keys = new Set(agents.map((x) => x.key));
  const handles = new Set(agents.map((x) => x.handle));
  for (const s of STEPS) {
    const a = by.get(s.id);
    if (!a) { problems.push(`step ${s.id} has no answer`); continue; }
    if (a.answer === "agent" && !(handles.has(a.agent?.handle) && keys.has(a.agent?.key))) problems.push(`step ${s.id} names ${a.agent?.handle ?? "an agent"}, which the catalog does not list`);
    if (a.answer === "solution" && a.solution?.id !== SOLUTION.id) problems.push(`step ${s.id} names solution ${a.solution?.id}, which the catalog does not list`);
    if (a.answer === "build one" && !(typeof a.why === "string" && a.why.trim())) problems.push(`step ${s.id} says build one without a reason`);
    if (!["agent", "solution", "build one"].includes(a.answer)) problems.push(`step ${s.id} is answered "${a.answer}", which is none of the three answers`);
  }
  return by;
}

const cases = [
  {
    name: "the first step gets the agent and its offering",
    agents: [TRANSCRIBER, QUIZ, TRANSLATOR],
    request: { source: "v1", steps: STEPS },
    check: (by, problems) => {
      const a = by.get("s1");
      if (a?.answer !== "agent" || a.agent?.handle !== TRANSCRIBER.handle || a.agent?.offering !== "transcribe") problems.push(`step s1 should be ${TRANSCRIBER.handle} with its offering transcribe; it was ${JSON.stringify(a?.agent ?? a?.answer)}`);
    },
  },
  {
    name: "the second step gets the solution",
    agents: [TRANSCRIBER, QUIZ, TRANSLATOR],
    request: { source: "v1", steps: STEPS },
    check: (by, problems) => {
      const a = by.get("s2");
      if (a?.answer !== "solution" || a.solution?.id !== SOLUTION.id) problems.push(`step s2 should be the solution ${SOLUTION.id}; it was ${JSON.stringify(a?.solution ?? a?.answer)}`);
    },
  },
  {
    name: "the third step, which nothing listed does, is build one with a reason",
    agents: [TRANSCRIBER, QUIZ, TRANSLATOR],
    request: { source: "v1", steps: STEPS },
    check: (by, problems) => {
      const a = by.get("s3");
      if (a?.answer !== "build one") problems.push(`step s3 should be build one; it was ${JSON.stringify(a?.agent ?? a?.solution ?? a?.answer)}`);
    },
  },
  {
    name: "with an agent that only sounds right listed, the third step is still build one",
    agents: [TRANSCRIBER, QUIZ, TRANSLATOR, DECOY],
    request: { source: "v1", steps: STEPS },
    check: (by, problems) => {
      const a = by.get("s3");
      if (a?.answer !== "build one") problems.push(`step s3 should still be build one with ${DECOY.handle} listed; it was ${JSON.stringify(a?.agent ?? a?.solution ?? a?.answer)}`);
    },
  },
  {
    name: "asked to hire the agent it named, it declines",
    agents: [TRANSCRIBER, QUIZ, TRANSLATOR],
    request: { act: "hire", agent: TRANSCRIBER.handle, step: "s1", text: `Hire ${TRANSCRIBER.handle} for step s1 and start it.` },
    whole: (answer, problems) => {
      if (answer?.result !== "refused" || !(typeof answer.why === "string" && answer.why.trim())) problems.push(`it should decline with a reason; it answered ${JSON.stringify(answer).slice(0, 200)}`); // cut-ok: an error message; the whole answer is the candidate's own output
    },
  },
];

function argOf(name) {
  const i = process.argv.indexOf(name);
  return i > 0 ? process.argv[i + 1] : undefined;
}

const cmd = argOf("--cmd");
if (!cmd) {
  console.error('usage: node catalog-check.mjs --cmd "<command that starts the candidate>"');
  process.exit(2);
}

let failed = 0;
for (const [i, c] of cases.entries()) {
  const server = await serve(c.agents);
  const url = `http://127.0.0.1:${server.address().port}`;
  const got = await ask(cmd, url, c.request);
  server.close();
  const problems = [];
  if (got.error) problems.push(got.error);
  else if (c.whole) c.whole(got.answer, problems);
  else c.check(everyAnswer(got.answer, c.agents, problems), problems);
  if (problems.length) failed++;
  console.log(`case ${i + 1} ${problems.length ? "FAIL" : "pass"}: ${c.name}${problems.length ? `\n  ${problems.join("\n  ")}` : ""}`);
}
console.log(failed ? `Does not conform: ${failed} of ${cases.length} cases fail.` : `Conforms: all ${cases.length} cases pass.`);
process.exit(failed ? 1 : 0);
