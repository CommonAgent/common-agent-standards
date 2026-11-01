# Extension: start-form v2

| | |
|---|---|
| **Name** | `agentprocesses.ai/ext/start-form v2` |
| **Extends** | Agent Processes 0.8.0 and later (Section 20) |
| **Status** | Draft |
| **Version** | 2 |

How a form asks a person for the items a trigger carries (Section 5.4).
A runtime that starts runs from a screen needs to know what to call each
field, what to say under it, and what kind of answer to take. A person
starting the run from the page does not: they read the `carries:` lines
and hand the run those items however they like.

Version 2 keeps every line of [version 1](start-form.md) and adds what
a form needs once a person may hand in more than one kind of thing:

- the other forms an item may be handed in (a file where the item is a
  link, pasted words where it is a file), with the first one offered
  first;
- the parts of a document a person fills in as named fields, so nobody
  writes a JSON document by hand;
- an example shown in an empty field, the choice a field opens on, a
  link to a page that helps answer it, several items asked as one field,
  and the items that are the run's sources.

A document written against version 1 means what it meant. A runtime
that knows version 2 reads a version 1 block as version 1.

## 1. The lines

One line per item, in the order the form shows them. Each line starts
with the item's key from the document's `carries:` lines and a colon,
then any of these parts, in any order. A line may go on to the next
line, indented deeper than the key.

| Part | What it says |
|---|---|
| `label "<words>"` | what the field is called on the form |
| `hint "<words>"` | one sentence under the field |
| `example "<words>"` | what the field shows before anything is typed |
| `kind <kind>` | `text`, `long-text`, `number`, `file`, `link`, `choice`, `date`, `parts` or `main-source` (below) |
| `choices "<a>" "<b>" ...` | the answers a `choice` field offers |
| `opens-on "<a>"` | the choice a `choice` field shows selected when the form opens, one of its `choices` |
| `accepts <type> ...` | for a `file` field, the media types it takes |
| `takes <form> ...` | the forms a person may hand the item in, the first offered first: `link`, `file`, `words` or `parts` |
| `asked-with "<words>"` | items with the same words are asked as one field, called by those words |
| `several` | the field takes several files at once |
| `source` | the item is one of the run's sources (below) |
| `left-out` | the form does not ask for the item; a phase of the run makes it |
| `help "<words>" <address>` | a link drawn under the field, to a page that helps answer it |

Words go between double quotes. Inside them, `\"` is a double quote,
`\\` is a backslash and `\n` is a line break.

### 1.1 Parts of a document

An item a person would not write by hand, such as a JSON document, can
be asked for as its parts. Each part is a line under the item's line,
indented deeper than it, starting with `part`, the part's name and a
colon:

| Part | What it says |
|---|---|
| `label "<words>"` | what the part's field is called |
| `kind <kind>` | `text`, `long-text` or `number` |
| `example "<words>"` | what the part's field shows before anything is typed |
| `row <n>` | parts with the same row are asked side by side |
| `from <item key>` | the part is not asked: it is the value of that item |
| `value "<words>"` | the part is not asked: it is always these words |

A part's name is the name of the member it fills in the document the
form puts together. It is written as it is when it is letters, digits,
`_`, `-` and `.`, and between double quotes otherwise. A part's name is
not a key of the process document and names nothing in it.

### 1.2 Sources

An item marked `source` is one place the run's material comes from: a
website, a document, a post. A form asks for at least one of the items
marked `source`. Where it takes two or more, it also asks which one is
the main one, in the field of the item whose line says `kind
main-source`, offering the sources the person gave as its choices.

```
trigger: a person asks for an explainer of a company
         carries: url - the company's website, optional
         carries: document - a document about the company, optional
         carries: subject - the company, required
         carries: main-source - which source the explainer follows, optional
extensions:
  agentprocesses.ai/ext/start-form v2
    url:      label "Website"   kind link   takes link words   source
    document: label "Document"   kind file   takes file link   source
              asked-with "Your sources"   several
    subject:  label "The company"   kind parts
              hint "Who the explainer speaks for."
      part name: label "Company name"   kind text   example "Acme"
      part "said as": label "Said as"   row 1
      part site: from url
    main-source: label "Which one is the main source?"   kind main-source
```

An item with no line is drawn as a `text` field labelled with its key.

## 2. The rules

- A line MUST name an item the document's `carries:` lines declare. A
  line for an item that does not exist is an error in the document. So
  is a `from` that names no item.
- Whether an item is required is said only by its `carries:` line. A
  form MUST NOT make an `optional` item required or a `required` item
  optional. `left-out` MUST NOT be written on a `required` item.
- A form MUST hand the run exactly the items it asked for, under their
  keys. An item asked for as its parts is handed as the one document
  its parts make, never as the parts. An item handed as a file or a
  link where its kind is something else is still that item. A form MUST
  NOT start the run at any phase but the ones the document starts at.
- `opens-on` says what the field shows when the form opens. What the
  person submits is what the run is handed. A run started any other way
  is handed only what it is handed, and a form MUST NOT fill an item the
  person did not submit (Section 5.4: no default the document does not
  state).
- Asking for at least one `source` refuses nothing the document would
  accept: each source item stays `optional` in its `carries:` line, and
  a run started without the form may be handed none of them.
- `choices` limit what the form offers. Where the document's `carries:`
  line allows answers the choices leave out, the form SHOULD let a
  person type one.
- `help` names a page a person reads, never an address the run is
  handed.

## 3. The four tests (Section 20.1)

1. **It does not change the work.** The items, their names and whether
   each is required stay in the `carries:` lines. The form only says how
   to ask for them, and an item asked as parts, as a file or as a link
   reaches the run as the same item.
2. **A person running from the page does not need it.** They read the
   `carries:` lines.
3. **It is the same for every run.** Saved answers for common uses are
   not part of this extension. They belong to whatever starts runs.
4. **It is not about finding the process.** The catalog shows none of it.
