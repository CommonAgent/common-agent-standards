# Agent Emailing conformance

The fixtures and cases of [SPEC.md](../SPEC.md) §12.

- [cases.json](cases.json): the thirty-two cases, the inputs a case may give, the test keys, and the
  canonical form of the four envelopes of the example thread.
- [cards.json](cards.json): the test name cards, signed by a test registrar as
  Personal Agent Naming §5.3 describes.
- [fixtures/](fixtures/): twenty-five email files. Every envelope and every name
  card in them is really signed with published test keys, which control
  nothing.
- [check-fixtures.mjs](check-fixtures.mjs): a small reference receiver that
  runs every case.
- [check-vector.mjs](check-vector.mjs): shows that the signing code reproduces
  Agent Messaging's own signed test vector byte for byte.
- [make-fixtures.mjs](make-fixtures.mjs): writes the fixtures, the cards and
  the cases. Ed25519 is deterministic, so running it again produces the same
  bytes.
- [lib.mjs](lib.mjs) and [mail.mjs](mail.mjs): the key encoding, canonical
  JSON, signing, MIME reading, the human part and the name card checks the
  scripts share.

Run them with Node.js 20 or later. They need nothing else installed.

```
node emailing/conformance/check-vector.mjs
node emailing/conformance/check-fixtures.mjs
```

The fixtures are the authority. When an implementation disagrees with them,
the implementation changes.
