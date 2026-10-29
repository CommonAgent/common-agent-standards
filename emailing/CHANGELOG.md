# Changelog

Versions of Agent Emailing tagged in this repository, newest first. A version is
tagged as `emailing-v` followed by the version, and the text in this folder at
that tag is the text of that version.

## 0.3.0 (2026-10-29)

Fixes gaps found building the Agent Emailing Server, the reference implementation. One line per fix:

- **Carrier interface (§11.4).** An inbound message may carry its `text` and `html` parts, and a carrier may offer `webhook(req)` for pushed mail and `onStatus(handler)` for pushed bounces. A carrier that gives no raw message must give the text. The carrier test (§12.3) takes the text from either.
- **Subjects (§3.3).** The sender sets each email's subject itself and must not use a carrier's reply shortcut that rewrites it. Case e20.
- **Duplicate memory (§7.1).** The memory covers 7 days and is bounded. When it is full with every entry still inside the window, new agent email is held rather than an entry forgotten. This rests on Agent Messaging §22.2 allowing it. Case e24.
- **Plain email through a bridge (§4.2).** The bridge signs a `request` on the agent's default offering, `message` when none is named, with the body as `payload.text`, the subject, each attachment as a `payload.files` entry, and an `id` derived from the email's own `Message-ID`, so a redelivered email is caught as a duplicate. Cases e21 and e22.
- **A refused reverse lookup (§6.2).** When the registrar refuses the lookup and no vouch exists, the email is treated as a knock, not blocked as anonymous. Cases e25 and e26.
- **Bounces (§3.5, §8).** A sender matches a bounce by the envelope `id`, from the returned envelope part or the new `Agent-Messaging-Id` hint header, before the `Message-ID`, which some carriers replace. Cases e15 and e23.
- **Too large (§7.2).** An oversized envelope is refused at the size check, but its `CONTEXT_TOO_LARGE` answer goes only to a sender admission lets in. Cases e27 and e28.
- **Knocks (§7.4).** A knock by email is answered with a signed `respond` in the same thread, the same for every outcome. Cases e29 and e30.
- **Attached emails (§3.1).** Only the outer email's own parts are searched for the envelope and its files. An email attached inside it does not count. Cases e31 and e32.
- **The price of a respond (§3.3).** The amount a respond reports is `payload.price`, a money object (Agent Messaging §19.3), and the human part states it. Case e04.
- **Task states over email** are not in this version. They wait on the shared rule Agent Messaging is adding.

The fixtures are regenerated: every agent email now carries the `Agent-Messaging-Id` header, the done respond carries its price, and fixtures 18 to 25 are new. `cases.json` is version 3, with thirty-two cases.

## 0.2.6 (2026-10-29)

Editorial, with no normative change. Section 3.3 says that it applies Agent Messaging §5.8, the rule for readable text generated from a signed message that Agent Messaging 0.9.17-draft adds, and that `human_text` is that section's digest under this standard's own name. The A2A Bridge applies the same rule to A2A. Agent Messaging references move to version 0.9.17. No requirement, member, attribute or section number changes.

## 0.2.5 (2026-10-29)

No change to the text of the specification. This version publishes agentemailing.ai with a short article, Why agents should email in one signed format (/article-why-agent-emailing.html): one sentence of lede, the problem in three cards, what Agent Emailing gives in five, the quote thread with its badges, one line of proof and a button to Get started. A version of this specification is what publishes the site's root, so a page of the site is published with a patch version. No requirement, member, attribute or section number changes.

## 0.2.4 (2026-10-29)

No change to the text of the specification. This version publishes agentemailing.ai with the menu's On GitHub link pointing to the reference implementation, the Agent Emailing Server (https://github.com/Agent-Emailing/agent-emailing-server). The footer still links the specification's source. The interop results page is removed.

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
