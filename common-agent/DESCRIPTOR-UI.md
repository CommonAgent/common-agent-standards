# The Descriptor to user interface binding

**Version:** 0.1.0
**Status:** Published
**Date:** 2026-10-29
**Applies to:** the Common Agent Specification 0.38.0 · MCP Apps 2026-01-26, for comparison only (Section 9.7)

**Optional.** This binding is not required for conformance to the Common Agent Specification: a renderer that does not follow it still conforms to the specification. A renderer that claims this binding meets Section 10. It reads the members the specification defines in Section 6, including the optional members of Sections 6.13 and 6.14.

An agent's Descriptor (the Common Agent Specification, Section 6) is written once, by its operator, and every other document about the agent is derived from it or points into it. A page that shows an agent to a person is one more such document. Today each page is written by hand, or drawn from whatever members a particular renderer happens to read, and two pages for one agent say different things, which is the drift Section 6.1 exists to end. This binding says which members of a Descriptor drive which parts of a rendered page, what a page shows when a member is absent, and how an agent may supply a view of its own without leaving those rules.

It is written as the specification's other bindings are. A network binding projects the Descriptor into its registration format; the A2A card is generated from it (Section 6.8). This binding projects the same document into a page a person reads and uses. Like every projection, a page is derived and never edited on its own, and where a page and the Descriptor disagree, the Descriptor governs.

The binding has three parts. The **descriptive panel** says what the agent is: what it does, what it costs, what it needs from you, what it hands back, when it asks you, what it will not do, and its limits. The **runtime view** is how a person uses it: a conversation for an offering that works as one, and for an offering that is prepared and then run, its inputs, then its settings, then a run, then progress, then questions and replies, then outputs. The **output lifecycle** is what happens to a delivered output afterwards: draft, then accepted, then published. Together they make the **projection**, the page every renderer can draw from members alone, and the floor every renderer MUST support. Above the floor, an agent MAY supply **views**, JavaScript that draws one of its outputs or the preparation of one of its offerings inside a frame the host owns (Section 9).

Across the three parts, a page groups where an agent's work comes from under the same three headings: **Setup**, what the agent is connected to; **Library**, the organization's shared material and defaults it reads; and **This job**, what is given to it for this run (Section 5.4).

## 1. Conformance language and terms

The key words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are to be interpreted as described in RFC 2119. Section numbers without a document name are the Common Agent Specification's.

- **Renderer**: a program that draws a page about an agent from its Descriptor: a catalog page, the page an owner manages an agent from, a process editor's step, a personal assistant's card.
- **Host**: the party whose page a renderer draws on, which holds the person's session and every control that acts.
- **Projection**: the page drawn from the Descriptor's members alone, as Sections 3 to 8 say. It is the floor.
- **View**: an agent's own JavaScript, declared in `views[]` (Section 6.13.6), that draws one output or the preparation of one offering.
- **Frame**: the sandboxed region of the host's page a view runs in (Section 9.3).
- **Bridge**: the only channel between a view and its host (Section 9.4).
- **Piece**: one artifact a job delivered, as the job manifest names it (Section 5.7).

## 2. The rules a page keeps

The specification's rules bind a page as they bind every consumer of a Descriptor, and four of them shape this binding.

1. **Primary, and others bind** (Section 6.1). A page is a projection. Every fact it shows about the agent comes from the Descriptor or from a document the Descriptor points to, and a page MUST NOT carry a fact about the agent that was typed into the page itself. An operator who wants a page to say something changes the Descriptor, and every page changes with it.
2. **Silence is honest** (Sections 6.4, 6.10 and 9.6). An absent member means not stated. A page MUST NOT fill a gap with a default that favours the agent: no price is not free, no `escalates` is not "never asks you", and no `will_not` is not "refuses nothing". Where a part of the panel has nothing to draw from, the page says the agent has not said, as visibly as it shows what was said (Section 9.8).
3. **Shapes, never bindings** (Section 6.10, rule 2). A page shows media types, names, regions and vocabularies. It never shows, and never asks a person for, a credential, an install setting, or an address that is the agent's own, and it never puts one in a view's hands.
4. **Evidence never enters** (Section 6.4, rule 4). The Descriptor states, and records check. A page MAY show records others signed about the agent, such as an evaluation record, beside the projection, but MUST mark them as another column (Section 3) with who signed them, and MUST NOT present a declared member as verified, enforced or tested. Nothing from a record enters a view (Section 6.13.6).

## 3. The projection

A renderer MUST be able to draw, for any Descriptor that passes the check of Section 6.8, the descriptive panel of Section 4, the runtime view of Section 5 for each offering a person may start, the output lifecycle of Section 6, and the hand-offs of Section 7, using only the Descriptor's members, the documents it points to, and the job records and manifests of the person's own jobs, and, for Setup and Library (Section 5.4), the deployment record and the standing assets the layers hold. A renderer MAY lay these out as it likes, in its own design, and MAY leave a part out of a page that has no use for it, such as the runtime view on a page that only lists agents. What it MUST NOT do is show a part drawn from something other than these sources, or show an absent member as a value.

A Descriptor that carries none of the members of Section 6.13 still has a projection: a page drawn from `does`, the offerings, their inputs and outputs, `refusals`, `escalates`, `limits`, the ceilings and the declared settings. The members of Section 6.13 make that page better; they are not what makes it possible.

## 4. The descriptive panel

The panel says what the agent is, before anybody uses it. Each part is drawn from the members in the table, in the order given, and a renderer uses the first that is present.

| Part | Drawn from | When none is present |
|------|------------|----------------------|
| The agent's name | `name`; else the first label of `subject.handle`; else the first offering's `name`. | — |
| What it does | `summary`; else `does`. Each offering's `does` under its offering. An open offering's scope, in words (Section 9.5). | `does` is required, so there is always a sentence. |
| What it costs | The price document `price_ref` points to; each offering's trial (Section 7.7), `revisions` and `ceilings.cost_per_job`; and `how.cost` on its jobs and steps (Section 12.3), shown as what running it can spend, never as a price. | "It has not said what it costs." A page MUST NOT show it as free. |
| What it needs from you | The inputs of each offering whose `given_by` is `person` or `either`; where no input carries `given_by`, every input. Each with its `about`, whether it is required, its `one_of` group, written as "at least one of", and `max_bytes`. Inputs whose `given_by` is `agent`, folded under their own heading as pieces another agent hands over. External inputs that carry `grant`, and credential needs, shown apart from the inputs a person simply sends (Section 9.8, a grant is not a file). | An offering whose `inputs[]` is empty needs nothing, which is a statement. |
| What it is connected to | `systems[]`, each with its `name`, `access` and `needs`, under Setup (Section 5.4). | "It has not said what it is connected to." |
| What it reads from your library | `can_use[]`, each entry with its kind, `reads`, `does`, whether it is `required`, and `without`, under Library (Section 5.4). | "It has not said whether it reads anything from a library." An empty `can_use` is a statement: it reads nothing from one. |
| What it hands back | Each offering's outputs, those without `working: true` first, each with its `about` and `presentation`; the working outputs folded beneath them, never dropped (Section 6.2). | An offering whose `outputs[]` is empty hands nothing back, which is a statement. |
| When it asks you | `escalates[]`; each step whose `how.control` is `person`; and, where a job can stop for an answer, that it can. | "It has not said when it asks you." A page MUST NOT say it never asks. |
| What it won't do | `will_not[]`; else `refusals`, one line each. For an open offering, its scope and focus in words, and for an `open-ended` one the plain statement that it makes no claim about what it can do (Section 9.5). | "It has not said what it won't do." |
| Limits | `limits`, each offering's `ceilings` and each input's `max_bytes`, each limit with what holds the agent to it: a limit decided by `rule` MAY be shown as enforced, one decided by `model` is shown as a limit the model is asked to keep, and one without `decided_by` as a limit whose enforcement is not stated (Section 9.5). | "It has not stated its limits." |
| Technical details | `subject.id`, `subject.handle`, `agent_version`, the Descriptor's digest and whether its signature verified, `acts_for` and `interaction` in words, and the data-use declaration where one is pointed to. | Each absent member is named as not stated. |

A part of the panel is sentences for a person. A renderer SHOULD show long prose clamped, with the rest a step away, and MUST NOT shorten a member so that it says something the whole does not. Where `summary` is absent and `does` runs past one sentence, the page shows the first sentence and the rest behind a step, and the defect is the Descriptor's (Section 6.13.1).

## 5. The runtime view

### 5.1 Which view

An offering whose `works_as` is `conversation` is drawn as a conversation (Section 5.2). An offering whose `works_as` is `job` is drawn as a prepared job (Section 5.3). Where `works_as` is absent, a renderer MAY draw the chat offering of Section 4.6, whose only input is of kind `text` and whose outputs are text, as a conversation, and draws every other offering as a prepared job. A renderer MUST NOT choose the view from `interaction`, which says whether a person attends the agent, or from `acts_for`, which says whom it represents (Section 6.2).

A page offers a person the offerings whose `started_by` includes `person`. An offering whose `started_by` is only `agent` is shown in the panel, as a step other agents run, and is not offered to a person to start; where `started_by` is absent, the offering is offered like any other.

### 5.2 A conversation

A conversation is a thread of messages to one offering, in one context (Section 5.6), each answered. The renderer sends each message to the offering by its id, keeps the context id the first answer returned, and shows the agent's words as the agent sent them. A file a person attaches travels as Section 4.7.1 says, named after the input it fills. A refusal is shown as a refusal with its reason and who decided it (Section 4.7), never as a message the person should answer. A help desk's chat offering is the usual case.

### 5.3 A prepared job

A prepared job is drawn in six parts, in this order.

1. **Inputs.** One field for each input of the offering that a person gives (Section 4, What it needs from you), drawn by its kind and its presentation: a `url` as an address, `text` as words, `identifier` as a short name, a media type or `document` as a file, with the picker a presentation names (Section 8). An input whose `given_by` is `agent` is a file to load, or a piece handed over from another job (Section 7), and never a box for words. A `one_of` group is drawn once, as "at least one of", and lets a person give more than one of its members. Required inputs are marked. The run context's declared `fields` are drawn as fields of their own (Section 6.13.2). A renderer MUST NOT drop a required input from the form for any reason, including that its name is also the name of an output. Where the offering declares an `example` (Section 6.13.8), the renderer MAY offer to fill the form from it, and shows its `good_result` beside the form. The values it fills are the person's to change, and the job they send is theirs.
2. **Settings.** The offering's declared settings (Section 6.2, Run configs), drawn from the Descriptor alone, with their `label`, `about` and `value_labels` where present. A person who does not own the agent is shown only the settings with `job_may_set: true`. Each setting is drawn with the control its members call for, in this order: a setting with `allowed` is a picker among its values, shown by their `value_labels`; one with `allowed` and `multiple: true` is a multi-select; a numeric setting is a number field, or a slider where `range` gives both `min` and `max`, bounded by its `range` and stepping by its `step`; and a yes or no is a toggle. A free text field is used only where none of these applies, and never for a setting that declares `allowed`. A rule is shown as a limit, with the values the layers above leave open (Section 5.8). A value a layer above has locked is shown as a value that cannot be changed, with who locked it. The `model` setting shows which of its allowed models are tested and which are not (Section 9.5, configs). The author's named run configs are offered as starting points. The values that come from the layers above this run are shown under Library, and the values the person sets for this run under This job (Section 5.4). Install settings never appear, and a renderer MUST NOT ask a person for a credential, a key or an account identifier anywhere in a prepared job; an external input's grant is made through the grant of Section 6.2, apart from the form.
3. **A run.** The renderer sends one request naming the offering, with each input as Section 4.7.1 says: a file named after the input it fills, a member of that name in a structured request, and words as words. It MUST NOT fold an input into another input's text, or prefix a person's words with the input's name where the agent reads the words themselves. A form that holds only files is a complete request. A renderer refuses to send a form that leaves a required input or a `one_of` group empty, or a `required` entry of `can_use` with no version (Section 5.4), and says which.
4. **Progress.** The job's state (Section 5.2) in words; the offering's declared `steps[]` as stages, marking a stage current only where a task update says so; and the time the job may take at most, where a ceiling or the job record states one. A renderer MUST NOT show a percentage, a stage or a time that no update or declaration gave it.
5. **Questions and replies.** A job in `input_required` or `auth_required` is waiting for an answer. The renderer shows what the agent asked, and sends the person's reply on the same task, never as a new job. A job whose deliverable is missing and whose agent spoke last is shown as waiting for an answer, even where its record says it was delivered (Section 6), so a question is not lost behind a working piece. A refusal is not a question: a task that is `rejected` or `failed`, or an answer of `INPUT_NOT_UNDERSTOOD`, `SCOPE_REFUSED` or `RUN_CONFIG_REFUSED`, is shown with its reason, and the renderer offers to change the inputs and run again, never a reply box.
6. **Outputs.** The pieces the job delivered, the deliverables first and the working pieces folded beneath them, each drawn by its presentation or by its view (Section 9), with the agent's own words beside them whatever else the message carried, and with the standing asset versions its run record cites (Section 6.14.5). Each output carries its place in the lifecycle of Section 6.

### 5.4 Setup, Library and This job

A page groups what it shows about where an agent's work comes from under three headings, with these names and in this order: **Setup**, **Library** and **This job** (Section 6.14.1). The headings are the same on every page about the agent, whether it is the descriptive panel, a prepared job or the record of a job, so a person learns them once.

| Heading | Drawn from | Shown to | What the page does with it |
|---------|------------|----------|----------------------------|
| **Setup** | `systems[]`, each with its `name`, `access` and `needs`. For the agent's owner, also the install settings of the runtime requirements, by name, and whether each system and setting is bound, from the deployment record (Section 8.3). | Everyone sees the systems. Only the owner, on the page they manage the agent from, sees the install settings and what is bound. | It shows what the agent is connected to and whether it is ready. It never shows a value, and never asks for one in a prepared job (Section 2, rule 3). Where Setup is not complete, a prepared job says that the agent is not ready and who can finish it, and does not send the job. |
| **Library** | Each `can_use` entry: the kind's name where the renderer knows the schema, and otherwise the schema URL, with its `reads`, `does`, `required` and `without`. For a prepared job, also the version of each kind the job will be handed, with its `name`, its layer, and who approved it and when; and the values of the declared settings that come from the layers above this run (the author's, the solution author's, the organization's, the team's and the person's saved values), with any lock. | Everyone who prepares a job, and the owner. | It shows the library as it stands, and a prepared job does not edit it. A page MAY link to where each version is kept, for the person who keeps it. Where no version of a kind will be handed, the page shows the entry's `without`. Where that entry is `required`, it says the job cannot run without one, and does not send the job (Section 5.3, part 3). |
| **This job** | The inputs a person gives (Section 5.3, part 1), the settings this run sets (Section 5.3, part 2), and any version of a standing asset handed for this job only. | The person preparing the job. | It is the form a person fills. Nothing from Setup is ever a field here. |

Where a Descriptor has no `can_use`, the Library heading says that the agent has not said whether it reads anything from a library, and shows the settings alone. Where `can_use` is an empty list, it says that the agent reads nothing from a library. The record of a job shows the same three headings with what the job ran with: Setup as it was when the job ran, the Library versions its run record cites (Section 6.14.5), and This job's inputs and settings.

Where the requester is not the agent's owner, the Library a requester sees is their own, and the operator's standards are shown as the operator's (Section 6.14.6). A page MUST NOT show a requester another organization's standing assets, beyond the kind and the layer a record cites.

## 6. The output lifecycle

A delivered output has three states on a page, and a person moves it from one to the next.

| State | Means | How it is reached |
|-------|-------|-------------------|
| `draft` | Delivered, awaiting the person's review. | The job completed and every output that is not a working piece arrived. |
| `accepted` | Final. The person has reviewed it and taken it as the result. | The person accepts it. Where an engagement governs the work, accepting is the acceptance its terms define (Agent SoW). |
| `published` | Reachable beyond the people allowed to see the work, at an address of its own. | A separate act by the person, after acceptance. |

The rules that go with it:

1. **Delivered means the deliverable arrived.** A job is shown as delivered, and its outputs as `draft`, only when every output the offering declares without `working: true` for each task has arrived. A job that returned working pieces and words and not its deliverable is shown as answered without its deliverable (Section 5.3, part 5).
2. **Accepting is the person's.** No agent, view or default accepts an output. A revision of a delivered output (Section 5.7) is a new job whose outputs start as `draft`, and the earlier job stays as it was.
3. **Publishing is a separate act.** Acceptance never publishes, and no agent or view publishes. A host publishes only when the person asks, serves what is published only at its own address and only while it stays published (Section 5.3), and lets the person withdraw it.
4. **The states are the host's records, not the agent's declarations.** Who accepted or published an output, and when, is something that happened, so it never enters the Descriptor (Section 6.4, rule 4). A host keeps it with the job and shows it there.
5. **Working pieces follow their deliverable.** A working piece is never accepted or published on its own. It is kept with the job, as the specification keeps it, so a reader can check the deliverable against where it came from.

## 7. Hand-offs between agents

A page that delivers an output MAY offer to hand it to another agent's input, and a page that prepares a job MAY offer a piece from an earlier job. The match is made by kind, from the two Descriptors, and nothing else, with these rules.

1. **Exact first.** An output fits an input exactly when their media types are equal, a vendor type included. These are offered as agents that take this, ranked first where the input's name equals the output's.
2. **Possible second.** An output fits an input possibly when the input is of the value kind `text` and the output is a `text/*` type; when the input is of kind `document` with no `accepts`, or with an `accepts` that lists the output's type; or when one side is a structured type with a suffix, such as `+json`, and the other is the generic type of that suffix. These are offered apart, as agents that might take this, never mixed with the exact ones.
3. **Never by guess.** A renderer MUST NOT offer an input whose `given_by` is `person` as a hand-off target, and MUST NOT offer a match it made from names, descriptions or anything but kinds.
4. **The whole hand-off.** Where the receiving offering needs more than one piece, a hand-off MAY carry several pieces, from one job or from several, each to the input it fills. Each piece travels as a file named after the input it fills (Section 4.7.1).
5. **Out loud.** A hand-off that cannot be placed, because the receiving page has no input of that kind, the piece cannot be fetched, or the input is already given, is reported to the person on the receiving page, naming the piece and the reason, and the piece is kept for them. A hand-off MUST NOT fail without a word.

Section 6.13.7 says why kinds must be precise: these rules are only as good as the kinds both agents declare.

## 8. Presentation

A presentation (Section 6.13.5) lets a renderer bring its own viewer for an output, or its own picker for an input. A renderer that has a viewer for a presentation, and can read the bytes in the way it names, MAY use it. A renderer that has none, or cannot read the bytes, shows the piece as its kind would be shown: text as text, a known media type in the way the person's own system shows it, and anything else as a file to save. For inputs, a renderer MAY offer a picker suited to the presentation, such as a recorder for `audio`, an image picker for `media` or a folder picker for `package`, and MUST also accept a file of the input's kind in its place.

## 9. Views

### 9.1 When a view is used

Where the Descriptor declares a view for an output or an offering (Section 6.13.6), and the renderer can show views, it MAY draw that output, or that offering's inputs, with the view instead of the projection. The projection stays one step away while the view is shown, so a person can always see the plain page. A renderer that cannot show views, or chooses not to, draws the projection, and loses nothing it is owed.

### 9.2 Getting the bytes

A renderer gets a view's bytes from the package the host installed, else from the depot by the package's digest (Section 12.7), and asks the agent only where neither has them. An agent that declares views and whose package no public depot serves MUST answer a view request, carrying a view's `digest`, with that view's exact bytes; any other agent that declares views MAY. The request is answered like entryway exchange 2 (Section 4.4): from the package's bytes, by the node or platform on the agent's behalf, without invoking the agent's model, tools or memory, and with the same rate limits. Whatever the source, a renderer uses the bytes only when their SHA-256 equals the declared `digest`, and otherwise draws the projection. A view's bytes are never fetched from an address the Descriptor names, because it names none.

### 9.3 The frame

The host runs a view in a frame it owns, sandboxed as follows.

1. **Its own origin.** The frame runs at an opaque origin, or an origin of its own, and never the host's: it cannot read the host's page, storage or cookies, and the host's page cannot be scripted from it.
2. **No network.** The frame's content security policy allows inline scripts and styles, images, media and fonts from `data:` and `blob:` only, and nothing else: no connection, no frame, no form submission, no base address, no navigation of the page above it, and no new window. A view cannot declare an exception. A view that needs a resource carries it inside its one file.
3. **No credentials.** The host hands a view no session, token, key or credential of any kind, and no reference to bytes held outside the message (Section 5.3), because between agents a reference is the capability to read. It hands the bytes themselves.
4. **No device permissions.** The frame is granted no camera, microphone, location, clipboard or other device permission. A view that wants a file saved or text copied asks the host (Section 9.4), and the host does it.
5. **Only what it draws.** A view for an output is handed that output and the Descriptor; a view for an offering is handed the offering's declared inputs and the values the person has entered so far. A host MUST NOT hand a view another job's data, the person's identity, or any record or rating about the agent.
6. **The host's controls stay outside.** Every control that acts, such as running the job, replying, accepting, publishing, handing off or saving, is drawn by the host outside the frame. The host SHOULD mark the frame as drawn by the agent, so a person can tell the agent's pixels from the host's, and a view MUST NOT imitate a control of the host's.

### 9.4 The bridge

A view and its host talk only by messages posted between the frame and the page, framed as JSON-RPC 2.0, as MCP Apps frames them (Section 9.7). Data goes in; requests come out. Each method is in the lists below and no other: a host ignores a message that is not, and MAY treat it as a failure (Section 9.6).

From the host to the view:

| Method | Carries |
|--------|---------|
| `view/initialize` (request) | The bridge version, `descriptor-view-v1`; the view's `id` and `for`; the design tokens (Section 9.5); the color scheme, `light` or `dark`; the locale; and the width the frame has. The view answers with the requests it will make, which MUST be within its declared `requests`. |
| `view/data` (notification) | For an output view: the piece's name, media type, bytes (as text for a text type, and base64 otherwise), its `about`, and its lifecycle state (Section 6). For an offering view: the offering's declared inputs and the values entered so far. Sent after initialization and again whenever what it carries changes. |
| `view/host-changed` (notification) | New design tokens, color scheme or width. |
| `view/teardown` (request) | That the host is about to remove the frame. The view answers when it is done. |

From the view to the host. A view makes `view/resize`, `view/propose-inputs`, `view/save-file` and `view/copy-text` only where its `requests` lists `resize`, `propose-inputs`, `save-file` or `copy-text`; `view/ready` and `view/report-failure` need no declaration:

| Method | Asks the host to |
|--------|------------------|
| `view/ready` (notification) | Show the frame; the view has drawn. Every view sends it. |
| `view/resize` | Give the frame a height, in pixels, which the host MAY bound. |
| `view/propose-inputs` | Fill its own form with values for the offering's declared inputs, for the person to review. An offering view only. The host shows the values in its own form and runs nothing; the person runs the job with the host's control. |
| `view/save-file` | Offer the person a file to save, with its name, media type and bytes. |
| `view/copy-text` | Copy words to the person's clipboard, once the person agrees. |
| `view/report-failure` (notification) | Draw the projection instead; the view cannot draw what it was handed, with a message for the operator. Every view may send it. |

A view MUST NOT be able to start a job, send a message to any agent, reply to a question, accept or publish an output, hand off a piece, spend, or reach the network, and the bridge defines no method that would let it. Those are the person's, through the host.

### 9.5 Design tokens

The host owns the frame's look. It hands the view a fixed set of design tokens, as CSS custom properties with these names: `--ca-color-background`, `--ca-color-surface`, `--ca-color-text`, `--ca-color-text-muted`, `--ca-color-accent`, `--ca-color-border`, `--ca-color-danger`, `--ca-font-body`, `--ca-font-mono`, `--ca-font-size`, `--ca-radius`, and `--ca-space`. A view SHOULD draw with them, so it looks like the page around it in either color scheme, and MUST carry a fallback value for each it uses, because a host MAY send any subset. A view MUST NOT load a font, a style sheet or an image from anywhere (Section 9.3).

### 9.6 Falling back

The host draws the projection in place of the view, and tells the person the plain page is shown, when any of these happens: the bytes cannot be got or do not hash to the digest; the view has not sent `view/ready` within five seconds of loading; it reports a failure; it throws an error the frame can see; it sends a message outside the bridge, or a request it did not declare; or the person asks for the plain page. A view that fails is not retried in the same page until the person asks. A host SHOULD tell the agent's operator, through whatever it already uses to report a fault in a package, that a view failed and why, and MUST NOT tell anyone else.

### 9.7 Alignment with MCP Apps

MCP Apps, the Model Context Protocol's extension for user interfaces (`io.modelcontextprotocol/ui`, version 2026-01-26), solves a neighbouring problem: a tool on a server returns an interface the host draws in a sandboxed frame. This binding follows it where the problems are the same, so a host can support both with one frame and one channel, and differs where an agent's views have to keep the Descriptor's rules.

| | MCP Apps | This binding |
|-|----------|--------------|
| What a view is tied to | A tool, through `_meta.ui.resourceUri`. | An output, or the preparation of an offering, through `views[]`. |
| How it is found | A `ui://` resource the host reads from the server when it is needed. | A file in the agent's package, referenced by its digest, and served by the agent only by that digest. No address. |
| Its format | One HTML document, `text/html;profile=mcp-app`. | One self-contained HTML file. |
| The frame | A sandbox on an origin other than the host's. | The same. |
| The channel | JSON-RPC 2.0 over posted messages. | The same, with its own methods under `view/`. |
| The network | Closed unless the resource declares `connectDomains`; outside scripts, styles and images through `resourceDomains`. | Closed, with no way to declare an exception. Everything the view needs is inside its file. |
| Device permissions | Camera, microphone, location and clipboard writing may be asked for. | None; saving and copying go through the host. |
| Calling back | The view may call the server's tools, send a message into the conversation, ask the host to open a link, and update what the model sees. | The view may only propose inputs, ask for a file to be saved or text copied, and resize. It acts on nothing. |
| Theming | The host may pass CSS variables and fonts in its context. | The host passes a fixed set of design tokens, and the view carries fallbacks for each. |
| Display | Inline, full screen or picture in picture, as the view and host agree. | The host decides; the view may ask only for a height. |
| Without a view | The tool still returns text content. | The projection from the Descriptor, always. |

The differences follow from three rules. A Descriptor carries shapes and never bindings, so a view cannot be an address, and is named by the digest of bytes that travelled in the package. An agent is engaged by parties who did not install it and cannot vet its code, so its view gets no network and no way to act, which is what keeps it safe to draw for a stranger. And a page is a projection with a floor, so a view is never the only way to see an output. An operator who also serves an MCP App MAY ship the same drawing code in both, behind each one's own methods.

## 10. Conformance

A renderer conforms to this binding when it draws the projection of Sections 3 to 8 for every Descriptor that passes Section 6.8; shows each absent member as not stated and never as a value; never asks a person for a credential or an install setting; draws a prepared job's inputs, settings, run, progress, questions and outputs as Section 5.3 says, sending inputs as Section 4.7.1 says; tells a refusal from a question; shows a job as delivered only when its deliverable arrived; groups where the work comes from as Setup, Library and This job, as Section 5.4 says; leaves accepting and publishing to the person; makes hand-offs by kind only and reports one it cannot place; and, where it shows views, which is optional, runs them only in a frame that meets Section 9.3, speaks only the bridge of Section 9.4, checks every view's digest, and falls back as Section 9.6 says. An agent conforms when every view it declares is in its package with a matching digest, names no address from which anything would be loaded, uses only the requests it declares, and is served by digest as Section 9.2 says.

A conformance fixture for this binding would pin Descriptors with and without the members of Section 6.13, the projection each must yield in terms a program can check (which parts are present, which say not stated, which inputs are fields and which are pieces), a set of hand-off pairs with the matches each must and must not yield, and views that must load and views that must fall back. None is drafted yet.

## 11. Out of scope

How a page looks, which is the renderer's; how a host keeps accepted and published outputs, and the address it publishes at; how a person signs in; how a keeper stores, edits and approves standing assets (Section 6.14.2); the grant flow of an external input, which Section 6.2 defines; how a process editor draws a process, beyond the hand-off rules of Section 7; and views for anything other than an output or the preparation of an offering, such as a view of a conversation, which a later version may add.
