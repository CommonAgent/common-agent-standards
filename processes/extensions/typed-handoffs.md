# Extension: typed-handoffs

| | |
|---|---|
| **Name** | `agentprocesses.ai/ext/typed-handoffs v1` |
| **Extends** | Agent Processes 0.8.0-draft and later (Section 20) |
| **Status** | Draft |
| **Version** | 1 |

What type each handoff is, and how a runtime converts one that does not
fit the phase that receives it. When one program hands a phase's output
to another, both need to agree on its form: a JSON document, a PDF, a
list of links. A person reading the handoff line knows what crosses from
the words and does not need a type.

## 1. The lines

Three kinds of line, each referring to the document by key.

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

## 2. The rules

- A typed line MUST name a handoff or an item the document declares.
- A conversion MUST keep everything the handoff line says crosses.
  Where it cannot, the runtime MUST NOT pass a partial result on as if
  it were the handoff: it stops the phase that receives it and records
  why, the way any handoff that does not exist is treated (Section 8.4).
- A conversion done by an agent or a system is part of the run. The run
  record SHOULD name each conversion, what did it, and the types on
  either side.
- A type MUST NOT narrow what the handoff line says crosses. Where the
  words say "the brief and any supporting files", a type that admits
  only one file is wrong, and the words govern.

## 3. The four tests (Section 20.1)

1. **It does not change the work.** What crosses is said by the handoff
   line, and a conversion must keep all of it.
2. **A person running from the page does not need it.** The handoff
   line's words are enough for a person.
3. **It is the same for every run.** Types belong to the process, not to
   one run.
4. **It is not about finding the process.** The catalog shows none of it.
