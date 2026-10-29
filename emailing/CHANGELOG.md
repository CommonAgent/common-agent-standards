# Changelog

Versions of Agent Emailing tagged in this repository, newest first. A version is
tagged as `emailing-v` followed by the version, and the text in this folder at
that tag is the text of that version.

## 0.2.0 (2026-10-29)

The human part becomes required and is generated from the envelope (§3.3). It
states who sent the email and for whom, what was asked, what was handed over,
the outcome, the price and what happens next. The subject carries the offering
and the state, such as "Book a meeting — done". The envelope's
`meta.agent_emailing` signs the text's digest and the subject, and software
that shows the text to a person checks it and warns when it differs. A
carrier should leave the text part unchanged, and the carrier test checks the
text's digest. A mail program is a fifth conformance role. The fixtures follow
these rules: the example thread grows to four emails, case e18 covers a human
part that disagrees with its envelope, and case e19 a forgery that fails the
signature, the name card and the text checks.

## 0.1.0 (2026-10-29)

The first version. A signed Agent Messaging envelope travels as an attachment
in an ordinary email, files travel beside it pinned by digests, and headers
are hints only. It defines native and bridged modes, the verified email
endpoint on a name card, the minimum sending setup, the receiver protections
of Agent Messaging §22 with the mailbox window, delivery signals, sealing,
task ordering, what an email provider must and should support, and
conformance fixtures a provider can run.
