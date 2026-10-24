// registry.mjs: the roles and interfaces Agent Roles describes, read from the
// guide's own files, for the menu, the head of each role and interface page,
// and the directory.
//
//   roles       from roles/ROLES.md: the families and the section of each role
//               (§3.1), each role's offering name and anchoring (its chapter,
//               or the list of anchorings in §3 for the roles published
//               before chapters carried an Anchoring line)
//   interfaces  from roles/interfaces/index.json and the definition file of
//               each interface, with its section found in roles/ROLES.md
//
// What ROLES.md does not say is kept here, by page: the date of the page's
// last change, and the one-paragraph summary the directory shows. Everything
// is checked against ROLES.md when this module loads, so a role added to §3.1
// without a page, a page whose offering name differs from its chapter, or an
// interface with no section stops the build.
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SITE_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const STANDARD = resolve(SITE_DIR, "..");
const SPEC = readFileSync(resolve(STANDARD, "ROLES.md"), "utf8").replace(/\r\n/g, "\n");
const fail = (msg) => { throw new Error(`registry: ${msg}`); };

// The chapters of SPEC.md, by number.
const CHAPTERS = new Map();
for (const m of SPEC.matchAll(/^## (\d+)\. (.+)\n([\s\S]*?)(?=^## |\n---\n|(?![\s\S]))/gm)) CHAPTERS.set(m[1], { title: m[2].trim(), text: m[3] });

// Where a role's file name is not its name with hyphens. The front desk kept
// the offering name it was published with, role-frontdesk.
const SLUG = { "the front desk": "frontdesk" };

// The page of each entry: the date of its last change, as the pages of
// agentroles.ai carried it when the site moved into this repository, and what
// the entry does, for the directory.
export const PAGES = {
  bookkeeper: { date: "2026-08-07",
    summary: "Answers four questions about an account's money from the signed records: what came in, what went out, the balance, and what is promised and still unsettled. It reads under a grant, holds no mandate and cannot spend. It is checked by recomputing its sums." },
  frontdesk: { date: "2026-08-07",
    summary: "Answers questions about the operator's own platform from its public documentation: what it is, how to join, how things work and where the documentation lives. It holds no grant, states no amounts and takes no actions. It is checked by what it refuses." },
  arbiter: { date: "2026-08-10",
    summary: "Decides how a disputed amount divides, and nothing else. It rules only from evidence it verified, under authority the parties' own signatures granted, and its independence is checked. Its verdict is a signed document whose split sums exactly. It is checked by its preconditions and refusals." },
  matchmaker: { date: "2026-08-13",
    summary: "Finds other agents. One agent describes work it needs done, and the matchmaker returns a few candidate agents in order, each with a reason and a note of what could not be established about it. It never counts missing information against an agent. It recommends and cannot contract or spend. It is checked by its refusals and invariants." },
  facilitator: { date: "2026-08-24",
    summary: "Runs a conversation among several agents and never judges the work. It calls the phase, keeps the plan against the agenda, and writes both into the record as signed messages. It is a member of the conversation, its calls are advisory, and the conversation goes on without it. It is checked by its refusals and invariants." },
  "solution-architect": { date: "2026-10-24",
    summary: "Settles what an agent stands on before its design is written: the systems it reaches, named in plain system words, the product bound to each system in each environment, the other agents and services it depends on, what its inside is made of, its limits on cost, speed, data and trust, and every decision with its reason. The organization's own choices win, and a platform default fills the rest. It designs nothing. Its record is checked at Package, where its systems become the runtime requirements, and at Deploy, where its bindings are placed." },
  "spec-writer": { date: "2026-10-24",
    summary: "Turns what somebody wants, said in words, into the statement of the job: what the agent does, refuses, needs, records and costs, with the questions it could not answer beside it. It never invents a name, a price or access to a system. Its check is the package maker, which refuses a statement that is wrong." },
  "solution-planner": { date: "2026-10-24",
    summary: "Turns what somebody wants done into a plan for a solution, which is several agents doing one job together. It writes down what done means before it plans any step, marks every line of the requirements as written, assumed or asked, and leaves the choice of agent for each step to the catalog." },
  "impact-analyst": { date: "2026-10-05",
    summary: "Works out what a change to an agent or a solution touches before anything is built: every dependent, and for each one whether the change is compatible, breaking or a change of behavior. It files a debt in the ledger for each dependent the change may break. It calls no model, changes nothing it reports on and approves nothing. It is checked by fixed cases whose answers are known." },
  catalog: { date: "2026-10-06",
    summary: "Answers each step of a plan with an agent or a solution already listed that fits, or with \"build one\" and the reason nothing listed fits. It answers only from what is listed, checks each fit against what is declared, and contracts and starts nothing. It is checked by fixed cases whose answers are known." },
  "test-writer": { date: "2026-09-14",
    summary: "Writes the test suite from the statement of the job before any script exists, and never writes the scripts. The suite must fail against empty stand-ins, and once the scripts exist, each is removed in turn and the suite must notice. It never changes a script." },
  "code-writer": { date: "2026-09-14",
    summary: "Writes the scripts the statement names, in the settled stack, and passes a suite it did not write. The model writes the code, and every check is outside the model: the suite, each script blanked in turn, the package maker and a fence of digests, run on the host outside the work. Any prototype is rewritten from the start before anything is packed." },
  "code-critic": { date: "2026-10-05",
    summary: "Reads a change to a package and hands back findings, each naming a file and a line, for a person to decide on. It reads the scripts and any change to what the package declares. It changes nothing and gives no overall grade." },
  "security-reviewer": { date: "2026-10-05",
    summary: "Before an agent is installed, writes down what it may reach and why, what it may spend, what it must never do, and what was accepted knowingly. It refuses a package whose programs reach a system it does not declare, or whose owner set no spending limit. It grants nothing and changes nothing." },
  "package-maker": { date: "2026-10-24",
    summary: "Turns a description of a needed agent into a package and its digest. The package holds the declaration, the parts it names and a manifest. The package names the agent's skills, the systems it needs and its obligations. It asks for what it must not invent, which is what the agent refuses and the records it must leave, and refuses to emit a package without them. Every package is a draft, because nobody has run it. It is checked by its refusals and its records." },
  "deployment-manager": { date: "2026-10-24",
    summary: "Turns a package into a running agent, on instruction only. It stands the package up on a named host and harness, gives it an identity, places its credentials and sets its ceilings before it starts, settles who may call it and whether a person attends it, checks it and grades the check as smoke or conformance. It updates, rolls back and reconfigures a running agent, and removes it cleanly. A request names the secrets the deployment needs and carries none of their values. It is checked by its records and refusals." },
  "conformance-checker": { date: "2026-09-14",
    summary: "Derives a conformance test from a package's own declarations and runs it against the deployed agent: each refusal must be declined, each escalation routed to a person, and each required record left behind. It checks only what can be checked and never grades quality. It fails closed, observes and never fixes, and signs a verdict tied to the exact package. It is checked by whether its verdicts match a known truth." },
  "agent-critic": { date: "2026-09-14",
    summary: "Judges the work itself against a standard that somebody other than the maker set beforehand, and hands back graded findings with the cases behind each grade. It changes nothing. It is checked by agreement with a person on a sample." },
  documenter: { date: "2026-10-05",
    summary: "Assembles and signs an agent's AgentDoc from the records that already exist, names every record it read, and shows where a source said nothing. It writes nothing of its own and calls no model. It is checked line by line against its records." },
  "doc-writer": { date: "2026-09-14",
    summary: "Writes the documentation for whoever has to use or maintain a package, from the package and its records, and says where there was nothing to write from. It changes nothing it documents. Its check is the weakest in the registry, and it was published last for that reason." },
  publisher: { date: "2026-09-14",
    summary: "Puts finished files at an address the person who asked can open, under one bound folder. It reads every byte first and reads the address back before saying it is done. It takes down what it published, and only that, under the same authority and with the same record." },
  watcher: { date: "2026-09-14",
    summary: "Reports from the platform's own records who answered, who went quiet, and what each agent spent against its declared ceiling. Silence counts as a failure. It wakes no model and produces no number the records do not carry." },
  "incident-recorder": { date: "2026-09-14",
    summary: "Writes the timeline of what happened when an agent went quiet or failed, with what is known and what is not. It restarts nothing, changes nothing, and does not say what caused it." },
  "process-runner": { date: "2026-09-14",
    summary: "Runs a process document as written. It sends each phase to the agent that holds it, stops at every gate for the owner, records who did what and when, and delivers the account and the run record. It raises no level, starts nothing early, invents no answer and commits no money beyond its instruction." },

  worker: { date: "2026-08-29",
    summary: "An agent that can be given a piece of work by something that knows nothing about it. Seven exchanges: whether it is free, what a job would take, whether it will take it, how it is going, what came of it, what it is blocked on, and stop. It says what work costs it, and what the work is sold for stays outside its answers. It defines no document." },
  manager: { date: "2026-08-29",
    summary: "What a worker can rely on from whatever is directing it. Terms already agreed above flow down with the job, raised blocks are answered or refused, cancellation reaches the worker, and what was committed on an owner's behalf is stated in full. It defines no document." },
  entryway: { date: "2026-08-30",
    summary: "What a stranger may ask before anybody has agreed to anything. Four exchanges: what are you, will you let me talk to you, are you accepting new callers, and where do I stand. A request to be admitted carries no work, and what the agent says about itself on the way in is a description and binds nothing. It defines no document." },
  deployer: { date: "2026-10-24",
    summary: "The exchanges for putting an agent package on a host and changing it while it runs: deploy this, what is deployed, how did it go, update it, roll it back, reconfigure it, and remove it. A deploy request names the secrets it needs and carries none of their values, and reports state what kind of check was run. It is the primary interface of the deployment manager. It defines no document." },
  builder: { date: "2026-08-31",
    summary: "The exchanges for turning a description of a needed agent into a package: build this, what did you build, and revise it. A description missing its refusals or its records is refused with the missing part named, and every answer about a package says it is a draft. It is the primary interface of the package maker. It defines no document." },
  evaluator: { date: "2026-08-31",
    summary: "The exchanges for checking a deployed agent against its package: evaluate this, what is the test, and what did you find. The test can be read before it runs, and a verdict never grades quality. It is the primary interface of the conformance checker. It defines no document." },
  "revisable-work": { date: "2026-09-08",
    summary: "A delivered piece of work can be changed without being redone. Every completion carries a signed job manifest naming each delivered piece with its digest, a quote says what redoing named steps would cost now, and a revision redoes those steps and reuses every piece it did not redo, at the same reference and digest. Reuse is computed from digests. It defines no document of its own." },
  lifecycle: { date: "2026-09-28",
    summary: "An agent can be asked to pause, resume and stop, and it does what it is asked, including work it was doing off the mesh. Four exchanges: pause, resume, stop, and are you running. Only the agent's owner and the operator of its mesh may ask, and a pause the operator placed is lifted only by the operator. It defines no document." },
};

// ── the roles, from §3.1 ────────────────────────────────────────────────────
const s31 = SPEC.match(/^### 3\.1 Three families\n([\s\S]*?)(?=^### )/m)?.[1] ?? fail("ROLES.md has no §3.1 Three families");
const anchorList = SPEC.match(/Current\s+anchorings:([^.]*)\./)?.[1].replace(/\s+/g, " ") ?? "";
const earlyAnchoring = new Map();
for (const part of anchorList.split(";")) {
  const m = part.match(/(.*) (?:is|are) (mesh-anchored|portable)/);
  if (m) for (const n of m[1].split(/,\s*(?:and\s+)?|\s+and\s+/)) if (n.trim()) earlyAnchoring.set(n.trim(), m[2]);
}

export const FAMILIES = [];
for (const m of s31.matchAll(/^- \*\*(.+?)\*\* act on ([^:]+):([\s\S]*?)(?=^- \*\*|(?![\s\S]))/gm)) {
  const family = { name: m[1], actsOn: m[2].replace(/\s+/g, " ").trim(), roles: [] };
  for (const r of m[3].replace(/\s+/g, " ").matchAll(/(the [a-z ]+?) \(§(\d+)\)/g)) {
    const [, name, section] = r;
    const ch = CHAPTERS.get(section) ?? fail(`§3.1 names ${name} at §${section}, which ROLES.md does not have`);
    if (ch.title.toLowerCase() !== `role: ${name}`) fail(`§${section} is "${ch.title}", and §3.1 says it is ${name}`);
    const slug = SLUG[name] ?? name.replace(/^the /, "").replace(/ /g, "-");
    const stated = ch.text.match(/offering name\**:?\**:?\s*`(role-[a-z-]+)`/i)?.[1];
    const offering = `role-${slug}`;
    if (stated && stated !== offering) fail(`§${section} gives the offering name ${stated}, and the page is ${slug}.html`);
    const anchoring = ch.text.match(/^\*\*Anchoring:\*\*\s*(mesh-anchored|portable)/m)?.[1] ?? earlyAnchoring.get(name)
      ?? fail(`ROLES.md gives no anchoring for ${name}`);
    const alias = ch.text.match(/\(alias: `(role-[a-z-]+)`/)?.[1];
    // A role's chapter, and the chapters after it that are still about it
    // (§5 The bookkeeper statement, §6 Conformance testing: the bookkeeper).
    let last = Number(section);
    while (CHAPTERS.get(String(last + 1)) && !/^(Role|Interface|Withdrawn):|^Interfaces$|^Out of scope|^Signature tags/.test(CHAPTERS.get(String(last + 1)).title)
      && CHAPTERS.get(String(last + 1)).title.includes(name.replace(/^the /, ""))) last++;
    family.roles.push({ kind: "role", name, title: name.replace(/^the/, "The"), slug, offering, anchoring, alias, section, last: String(last), family: family.name });
  }
  FAMILIES.push(family);
}
export const ROLES = FAMILIES.flatMap((f) => f.roles);
if (ROLES.length < 20) fail(`only ${ROLES.length} roles were read from §3.1`);
for (const [n, ch] of CHAPTERS) {
  if (/^Role: /.test(ch.title) && !ROLES.some((r) => r.section === n)) fail(`§${n} (${ch.title}) is not listed in §3.1`);
}

// ── the interfaces, from interfaces/ ────────────────────────────────────────
const INDEX = JSON.parse(readFileSync(resolve(STANDARD, "interfaces/index.json"), "utf8"));
export const INTERFACE_INDEX = INDEX;
export const INTERFACES = INDEX.interfaces.map((e) => {
  const file = `interfaces/${e.name}.json`;
  const def = JSON.parse(readFileSync(resolve(STANDARD, file), "utf8"));
  if (def.interface !== e.name) fail(`${file} names ${def.interface}`);
  const slug = new URL(def.definition).pathname.replace(/^\//, "").replace(/\.html$/, "");
  // Its own chapter ("Standard interface name `interface-worker`"), or the
  // subsection of a role that publishes it ("the deployer (`interface-deployer`").
  let section = null, primaryOf = null;
  for (const [n, ch] of CHAPTERS) {
    if (/^Interface: /.test(ch.title) && ch.text.includes(`Standard interface name \`${e.name}\``)) section = n;
  }
  if (!section) {
    for (const [n, ch] of CHAPTERS) {
      const sub = ch.text.match(new RegExp(`^### (${n}\\.\\d+) [^\\n]*\\n+[^#]*?\\(\`${e.name}\``, "m"));
      if (sub) { section = sub[1]; primaryOf = ROLES.find((r) => r.section === n) ?? fail(`${e.name} is published in §${n}, which is not a role`); }
    }
  }
  if (!section) fail(`ROLES.md has no section for ${e.name}`);
  const anchoring = /^\d+$/.test(section) ? (CHAPTERS.get(section).text.match(/Standard interface name `[^`]+`\. (Portable|Mesh-anchored)/)?.[1].toLowerCase() ?? "portable") : "portable";
  return { kind: "interface", name: e.name, title: def.title, slug, file, summaryJson: def.summary, version: e.version, section, primaryOf, anchoring, offering: e.name };
});

export const ENTRIES = [...ROLES, ...INTERFACES];
for (const e of ENTRIES) {
  if (!PAGES[e.slug]) fail(`no date or summary is kept for ${e.slug}.html`);
  if (!existsSync(resolve(SITE_DIR, `${e.slug}.html`))) fail(`${e.slug}.html is missing from roles/site`);
  Object.assign(e, PAGES[e.slug]);
}
for (const k of Object.keys(PAGES)) if (!ENTRIES.some((e) => e.slug === k)) fail(`a date is kept for ${k}.html, which is no entry of the registry`);

// The address of a section of ROLES.md on GitHub, by its heading.
export const SOURCE = "https://github.com/CommonAgent/common-agent-standards/blob/main/roles/ROLES.md";
const HEADINGS = new Map([...SPEC.matchAll(/^#{2,3} (\d+(?:\.\d+)?)\.? (.+)$/gm)].map((m) => [m[1], `${m[1]} ${m[2]}`]));
export const sourceAnchor = (sec) => {
  const h = HEADINGS.get(sec) ?? fail(`ROLES.md has no heading ${sec}`);
  return `${SOURCE}#${h.toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/ /g, "-")}`;
};
