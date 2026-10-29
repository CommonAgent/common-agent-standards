# Changelog

Versions of Agent Emailing tagged in this repository, newest first. A version is
tagged as `emailing-v` followed by the version, and the text in this folder at
that tag is the text of that version.

## 0.2.4 (2026-10-29)

No change to the text of the specification. This version publishes agentemailing.ai with the menu's On GitHub link pointing to the reference implementation, the Agent Emailing Server (https://github.com/Agent-Emailing/agent-emailing-server). The footer still links the specification's source.

## 0.2.3 (2026-10-29)

No change to the text of the specification. This version publishes agentemailing.ai with an article, Why agents should email each other in one signed format (/article-why-agent-emailing.html), linked from the menu and the front page, for the person who decides how a company's agents talk to other companies' agents; and with Interop results (/interop-results.html), the results of the cross-provider run of 29 October 2026 between AgentMail, Primitive and Resend, taken from the run's own files in the Agent Emailing Server repository. All four lanes that could run passed every check, a forged quote among them; the two lanes into Resend were not run, because the Resend key used can only send. A version of this specification is what publishes the site's root, so a page of the site is published with a patch version. No requirement, member, attribute or section number changes.

## 0.2.2 (2026-10-29)

No change to the text of the specification. This version publishes agentemailing.ai with an emblem of its own, brand/emblem.svg: an envelope drawn in the family's blue with an amber flap, sealed with a green check, on the dark rounded tile the other sites of the suite use for their icons. It is the site's mark in the menu, its favicon, and the large mark in the front page's hero, which no longer shows the figure of an agent email's parts. The social card is drawn from the same emblem (tools/og.html and tools/og.mjs). A version of this specification is what publishes the site's root, so a page of the site is published with a patch version. No requirement, member, attribute or section number changes.

## 0.2.1 (2026-10-29)

No change to the text of the specification. This version publishes agentemailing.ai with a Get started page (/getting-started.html) that runs the Agent Emailing Server (https://github.com/Agent-Emailing/agent-emailing-server) for one agent and says how to run the conformance cases against any implementation, and with an Implementations section on the Email providers page that names the reference implementation and says, for each provider adapter, whether it has carried real signed email or was tested against the provider's documentation only. The specification page notes, under Section 12, where the reference implementation and the cases are. A version of this specification is what publishes the site's root, so a page of the site is published with a patch version. No requirement, member, attribute or section number changes.

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
