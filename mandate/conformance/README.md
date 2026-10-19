# Conformance fixtures

A fixture is a file of test cases an implementation must agree with. When an
implementation disagrees with a fixture, the implementation is what changes,
and a fixture changes only together with a change to the specification. Every
case can be checked without a network, and each fixture holds cases that must
be accepted beside cases that must be refused.

| Fixture | What it pins | Sections |
|---------|--------------|----------|
| [mandate-documents.json](mandate-documents.json) | How an identifier is derived from a version-1 charter or mandate; that a document whose identifier does not re-derive is still accepted when its signature verifies; the signed bytes and real signatures of a charter, a root-issued mandate and a sub-mandate, and two signatures that must not verify; and which documents a registry refuses by their shape, including the `nda` and `write` powers, `scope.nda_categories`, and the holder key a mandate holding `nda` carries. | 4, 5.3, 6 rules 2, 4 and 8 |
| [mandate-checks.json](mandate-checks.json) | Which chains verify from the documents alone and, for those that do not, what fails; the five checks at approval, with the number of the one that fails; and the check for an Agent NDA, including that a ceiling and an offering scope place no limit on the `nda` power and that the check is made with the signing key. | 6 rules 1, 3 and 7, 7 and 7.2 |
| [mandate-ids.json](mandate-ids.json) | Holding an identifier: a reservation or an earlier filing refuses a charter for another domain under it, a reservation lapses, and a mandate's identifier is held for the organization its first filing names. | 4 and 5 rule 1 |
| [mandate-proxy.json](mandate-proxy.json) | Which power a mutating act through a resource proxy needs, and the grants whose `writes` does not validate. | 6 rule 4 and 7.1 |

The documents in `mandate-documents.json` and `mandate-checks.json` are signed
with test keys derived from published seeds: each key's seed is the SHA-256 of
its label, and the labels, seeds and public keys are in
`mandate-documents.json`. They are test keys by design, so anyone can sign with
them, and Ed25519 is deterministic, so any implementation holding the seeds
produces the same signatures. The signatures are base64url; a reader also
accepts padded base64. In `mandate-checks.json` each case names its documents
from the file's `documents`, and `at` is the moment the chain is verified or
the act was approved or signed.
