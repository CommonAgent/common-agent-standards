# Extension: typed-handoffs v2

| | |
|---|---|
| **Name** | `agentprocesses.ai/ext/typed-handoffs v2` |
| **Extends** | Agent Processes 0.8.0 and later (Section 20) |
| **Status** | Draft |
| **Version** | 2 |

What type each handoff is, how a runtime converts one that does not fit
the phase that receives it, and how a program builds one of its inputs
from what crossed. When one program hands a phase's output to another,
both need to agree on its form: a JSON document, a PDF, a list of links.
And when the receiving program takes named inputs, something has to say
which input is made from which part of the handoff. A person reading the
handoff line knows what crosses from the words and needs none of it.

Version 2 keeps the three lines of [version 1](typed-handoffs.md) and
adds a fourth, `map`, which says how one named input of the receiving
phase's program is built from a handoff or a trigger item: from where in
it, in what way, and through which conversions first. A runtime that
has a mapping does not need to ask a model to work the input out on
every run. A document written against version 1 means what it meant.

## 1. The lines

Four kinds of line, each referring to the document by key.

A handoff's type, written like the handoff line, with media types in
place of the words:

```
    plan-the-angles -> write-the-cards: application/json
```

A trigger item's types, by the item's key:

```
    topic: text/plain, application/pdf, text/uri-list
```

A conversion, where a handoff's type is not one the receiving phase
reads:

```
    convert plan-the-angles -> write-the-cards:
      application/json to text/markdown by the runtime's converter
```

The words after `by` name what converts it: the runtime itself, a named
system from the document's bindings, or an agent from its roster.

A mapping, which builds one input of the receiving phase's program:

```
    map <from> -> <to> [<input>]: from <key> path <path> as <way> title "<words>" via <step>, <step>
```

| Part | What it says |
|---|---|
| `<from>` | the phase the handoff leaves, or `trigger` for a trigger item |
| `<to>` | the phase whose program takes the input |
| `[<input>]` | the input the mapping fills, by the name the receiving phase's holder declares for it |
| `from <key>` | the handoff key, or the trigger item's key, whose content the input is built from |
| `path <path>` | where in that content, when it is a JSON document: member names and list positions joined by dots, such as `pages.0.url`; with no path, the whole of it |
| `as <way>` | how the input is built: `value` (the content, or the part at the path, as it is), `text` (its words), `page` (a one-page reading of the address it holds), `address` (an address where it can be fetched) or `file` (the file itself); `value` when absent |
| `title "<words>"` | the title the built input carries, where the way makes one |
| `via <step>, ...` | conversions the content goes through first, in order, each `<agent>/<offering>`: an agent from the roster and the offering it runs |

`from <key>` is the only part a mapping must have. `path` goes only with
`as value`. Words go between double quotes, with `\"` for a double quote
and `\\` for a backslash.

```
extensions:
  agentprocesses.ai/ext/typed-handoffs v2
    read-the-page -> plan-the-lenses: application/json
    map read-the-page -> plan-the-lenses [source]: from site-read path pages.0 as value
    map trigger -> watch-the-video [video]: from video-address as address
    map write-the-script -> narrate [script]: from script as file via text-maker.acme/markdown-to-text
```

## 2. The rules

- A typed line MUST name a handoff or an item the document declares. A
  `map` line MUST name a handoff from `<from>` to `<to>` whose key is
  the one after `from`, or, from `trigger`, an item the trigger carries
  that `<to>` takes in.
- A conversion MUST keep everything the handoff line says crosses.
  Where it cannot, the runtime MUST NOT pass a partial result on as if
  it were the handoff: it stops the phase that receives it and records
  why, the way any handoff that does not exist is treated (Section 8.4).
- A mapping builds one input for the receiving phase's program. It does
  not narrow the handoff: the receiving phase is handed everything that
  crossed, as it would be without the mapping.
- A runtime that cannot apply a mapping on a run (the content is not
  there, the path finds nothing, a `via` agent is not one the run may
  use) MUST NOT build the input some other way and say it was mapped.
  It does what it would do with no `map` line, and the run record SHOULD
  say which mapping it could not apply and why.
- A conversion or a mapping done by an agent or a system is part of the
  run. The run record SHOULD name each one, what did it, and the types
  or the input on either side.
- A type MUST NOT narrow what the handoff line says crosses. Where the
  words say "the brief and any supporting files", a type that admits
  only one file is wrong, and the words govern.

## 3. The four tests (Section 20.1)

1. **It does not change the work.** What crosses is said by the handoff
   line, and a conversion must keep all of it. A mapping only says how a
   program builds one of its inputs from what crossed; the phase is
   handed the same thing either way.
2. **A person running from the page does not need it.** The handoff
   line's words are enough for a person, who reads what crossed and
   takes what they need from it.
3. **It is the same for every run.** Types and mappings belong to the
   process, not to one run.
4. **It is not about finding the process.** The catalog shows none of it.
