# Changelog

Versions of Agent RFP tagged in this repository, newest first. A version is
tagged as `rfp-v` followed by the version, and the text in this folder at
that tag is the text of that version. Its history comes from the repository of agentrfp.net.

## 0.12.0-draft (2026-10-25)

An act an agent drafted. The body of an act on a posting, the award among
them, may carry `proposed`, the marker of the Common Agent Specification
0.37.0-draft §7.9, where an agent drafted the act and its signer approved
it. The draft bytes are the act's signed bytes computed without the marker,
the marker does not change who signs the act, and a board refuses an act
whose marker fails and records no drafted act its signer has not signed
(§6). §8 rule 3 says the poster's signature over a drafted award approves
exactly the bytes the agent drafted. The minor version moves because a board
built against 0.11.0-draft records acts without reading the marker, and
could record one this version refuses.

## 0.11.0-draft (2026-10-19)

A gated posting's body ref no longer names the posting. The example in
§5.11.1 gave `gate.body.ref` as a URL containing the posting's own
identifier, but the ref sits inside the bytes the identifier is derived
from (§4.1), so no posting could carry that ref and still have the
identifier §4.1 derives. A `ref` in the gate MUST NOT contain the posting's
identifier, a board SHOULD address a body by its digest, which is known
before the posting is assembled, and the example now does. A board MUST
refuse to host a gated posting whose body ref contains its `id`; that new
refusal is why the minor version moves. `conformance/rfp-posting.json` adds
the cases.

## 0.10.0-draft (2026-10-19)

The board's instant of receipt. Check 1 of §5.11.3 relied on the recipient's
own `signed_at` for the offer's expiry and withdrawal, so a recipient could
accept after the offer expired or was withdrawn, write an earlier time, and
still be released the body. A board now records the instant it receives each
completed agreement, checks expiry, withdrawal and each organization's
mandate against that instant as well, and names it in the release record as
`received_at`. A withdrawal takes effect at the later of its `at` and the
instant the board received it. The board resolves the recipient's owner
against the registry at receipt, where the recipient seat names no
organization. It releases to an unconfirmed owner only where the poster's
offer says `"owners": "any"`, never to one the registry contradicts, and
the release record names the owner as it resolved it. The definition of the
offer bytes in §5.11.1
names both members that are set to `null`, `parties.recipient` and
`disclosure.recipient`. Check 1 also
reads the acceptance checks of Agent NDA 0.2.0-draft, under which each
signature covers its own record and a seat's signature counts only when made
with the key the seat allows. The example release record carries the new
agreement digest of the Agent NDA example, whose recipient seat now carries
`owner_key`. The minor version moves because a board built against
0.9.1-draft does not record the instant of receipt, which this version
requires. A sealed body carries a REQUIRED random `nonce` of at least 16 bytes (§5.11.2), because the body's digest is public and much of a body can be guessed; without it anyone could confirm a guessed body offline against the digest. A new fixture, `conformance/rfp-sealed-body.json`, pins the bytes, the digest and the nonce rule.

## 0.9.1-draft (2026-10-18)

Editorial, with no normative change. Agent Roles is a guide of working descriptions, so §5.2.1 says that an agent-shaped posting names a role described in Agent Roles, where it said a published role from the Agent Roles registry. The `registry` member of `role` keeps its name. No requirement, field, example or section number changes.

## 0.9.0-draft (2026-10-18)

Gated postings, in new §5.11. A posting may keep a summary public and seal the
rest of the need, the budget, the term, the award intentions and the handling
requirements in a separate document, the sealed body, named in the signed
posting by the digest of its exact bytes. The posting names the poster's Agent
NDA open offer by digest, and a board releases the body to a provider only after
that provider has accepted the offer. The release is board-enforced, a board
records every release and shows the body to nobody else, and what the provider
does with the body afterwards is recorded under the agreement. A response should
name the agreement in the `nda` member of Agent SoW 0.24.0-draft. Postings
without a gate are unchanged.

## 0.8.1-draft (2026-10-18)

Editorial, with no normative change. The specification names no platform, em
dashes become plain punctuation, and the italics of the 0.5.0-draft version note
are closed paragraph by paragraph. No requirement, field, example, or section
number changes.

## 0.8.0-draft (2026-08-29)

The first version tagged in the Common Agent Standards repository, as
`rfp-v0.8.0-draft`. Earlier changes are recorded in the history of this folder.
