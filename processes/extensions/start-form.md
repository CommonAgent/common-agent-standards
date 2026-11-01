# Extension: start-form

| | |
|---|---|
| **Name** | `agentprocesses.ai/ext/start-form v1` |
| **Extends** | Agent Processes 0.8.0-draft and later (Section 20) |
| **Status** | Draft |
| **Version** | 1 |

How a form asks a person for the items a trigger carries (Section 5.4).
A runtime that starts runs from a screen needs to know what to call each
field, what to say under it, and what kind of answer to take. A person
starting the run from the page does not: they read the `carries:` lines
and hand the run those items however they like.

## 1. The lines

One line per item, in the order the form shows them. Each line starts
with the item's key from the document's `carries:` lines, then any of
these, in any order:

| Part | What it says |
|---|---|
| `label "<words>"` | what the field is called on the form |
| `hint "<words>"` | one sentence under the field |
| `kind <kind>` | `text`, `long-text`, `file`, `link`, `choice` or `date` |
| `choices "<a>" "<b>" ...` | the answers a `choice` field offers |
| `accepts <type> ...` | for a `file` field, the media types it takes |

```
extensions:
  agentprocesses.ai/ext/start-form v1
    topic:  label "What to explore"   kind long-text
            hint "Paste words, a link or a file"
    reader: label "Who it is for"   kind choice
            choices "An investor" "A customer" "Our own team"
```

An item with no line is drawn as a `text` field labelled with its key.

## 2. The rules

- A line MUST name an item the document's `carries:` lines declare. A
  line for an item that does not exist is an error in the document.
- Whether an item is required is said only by its `carries:` line. A
  form MUST NOT make an `optional` item required or a `required` item
  optional, and MUST NOT offer a default the document does not state.
- A form MUST hand the run exactly the items it asked for, under their
  keys. It MUST NOT start the run at any phase but the ones the document
  starts at.
- `choices` limit what the form offers. Where the document's `carries:`
  line allows answers the choices leave out, the form SHOULD let a
  person type one.

## 3. The four tests (Section 20.1)

1. **It does not change the work.** The items, their names and whether
   each is required stay in the `carries:` lines. The form only says how
   to ask for them.
2. **A person running from the page does not need it.** They read the
   `carries:` lines.
3. **It is the same for every run.** Saved answers for common uses are
   not part of this extension. They belong to whatever starts runs.
4. **It is not about finding the process.** The catalog shows none of it.
