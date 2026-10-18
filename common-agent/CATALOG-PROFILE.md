# The Common Agent catalog profile

**Version:** 0.1.0-draft
**Status:** Working Draft
**Date:** 2026-10-18
**Applies to:** Agentic Resource Discovery (ARD) v0.91 · the Common Agent Specification 0.28.0-draft · Agent SoW 0.23.1-draft · Agent Reputations 0.3.1-draft · Agent Messaging 0.9.1-draft

A catalog lists agents so that people and programs can find them. ARD, the Agentic Resource Discovery specification (https://agenticresourcediscovery.org/spec/), already defines what a listed entry looks like, where a publisher serves its entries, and how a client searches a registry. Agent Messaging cedes catalog and search to ARD (Agent Messaging, Section 1.3), and this profile keeps that division. It adds no second entry format and no second search API.

What ARD leaves to others is what a buyer needs before contracting an agent: what the agent charges and under which signed terms, what a reputation bureau has recorded about it, where to ask whether it is reachable, how much the catalog knows about each statement, who signed the entry, and who may see it. This profile defines each of those as optional entry metadata under a Common Agent JSON-LD namespace, the extension seam ARD v0.91 provides (ARD, Section 3.4). A reader that knows only ARD still reads every entry, because every term this profile adds is one it may ignore. The profile also defines two calls ARD does not have, publishing an entry and fetching one by its identifier, and a link from each entry to the agent's AgentDoc (the Common Agent Specification, Section 9).

This document is a part of the Common Agent Specification. Where it borrows a term from ARD, Agent SoW, Agent Reputations or Agent Messaging, that specification is the authority for the term, and where they disagree with this document, they govern.

## 1. Conformance language and terms

The key words MUST, MUST NOT, SHOULD, SHOULD NOT, and MAY are to be interpreted as described in RFC 2119.

- **Entry**: an ARD entry (ARD, Section 4), the description of one resource in a form a registry can search.
- **Publisher**: the party whose domain is the `<publisher>` segment of the entry's `urn:air:` identifier (ARD, Appendix C).
- **Catalog**: an ARD registry (ARD, Section 5.3) that holds entries, answers search, and follows this profile.
- **Reader**: any program that consumes entries: an orchestrator, another registry, an AgentDoc assembler, or a page that shows a listing to a person.
- **Publisher member**: a term the publisher states and signs (Section 8).
- **Catalog annotation**: a term the catalog states about an entry it holds. The publisher's signature never covers one.
- **Standing proposal**: an Agent SoW document signed by the selling owner with the counterparty seat blank (Agent SoW, Section 12.1). A **directed standing proposal** names the one party entitled to countersign it (Agent SoW, Section 12.1.1).

## 2. The namespace

The namespace IRI is `https://commonagent.net/ns/catalog#`, and its conventional prefix is `ca`. Its JSON-LD context is published at `https://commonagent.net/ns/catalog/v1.jsonld` and reproduced in Appendix A. The context types every term as a JSON literal (`@type: @json`), so a JSON-LD processor carries each value whole, and a filter path into one is a literal JSON path, the way ARD treats `trustManifest` and `metadata` (ARD, Section 5.3.1).

An entry that carries any term of this profile MUST bind the namespace in its `@context`, and SHOULD do so by listing the ARD base context first and this context second:

```json
"@context": [
  "https://agenticresourcediscovery.org/context/v1",
  "https://commonagent.net/ns/catalog/v1.jsonld"
]
```

A reader MAY recognise the context by its address and need not fetch it. An entry MUST NOT carry the facts of this profile in ARD's `metadata` member, whose values are flat scalars and cannot hold them, and where a catalog also flattens some of them into `metadata` for readers that filter there, the namespaced terms govern.

The terms are these. The third column says who states each one, which decides what the publisher's signature covers (Section 8).

| Term | What it carries | Stated by |
|------|-----------------|-----------|
| `ca:profile` | The version of this profile the entry follows, such as `"0.1.0-draft"`. | publisher |
| `ca:subject` | The identity of the agent the entry describes (Section 10). | publisher |
| `ca:agentdoc` | Where the agent's AgentDoc is served (Section 10). | publisher |
| `ca:offers` | The offers derived from the agent's standing proposals (Section 3). | publisher |
| `ca:liveness` | Where to ask whether the agent is reachable (Section 5). | publisher |
| `ca:audience` | Who may see the entry (Section 9). | publisher |
| `proof` | The publisher's Data Integrity proof over the entry (Section 8). | publisher |
| `ca:reputation` | Pointers to bureau reports, with the context a score needs (Section 4). | catalog |
| `ca:lastSeen` | When the catalog last observed the agent's presence (Section 5). | catalog |
| `ca:evidence` | Who is speaking in the listing and where it came from (Section 6). | catalog |
| `ca:fields` | What backs each statement in the listing (Section 6). | catalog |

Members inside these values are spelled as the source document spells them, so an offer quotes Agent SoW's `arrangement` and `per_task`, and a reputation pointer quotes the bureau's `n_eff`. The members this profile names itself are written in lowercase with underscores, as the Common Agent Specification writes its own. A digest is `sha256:` followed by 64 lowercase hexadecimal digits, computed over the bytes as served at the address it sits beside.

## 3. Offers

`ca:offers` is an array with one object for each offering the entry prices or lets a reader engage. Agent SoW, Section 12.2 requires that a listing which carries a price or can be engaged be derived from a standing proposal, and this section applies that rule to an entry.

```json
"ca:offers": [
  {
    "offering": "reconcile-statement",
    "arrangement": "fixed_fee",
    "currency": "XCR",
    "per_task": 2500000,
    "ceiling": { "amount": 40000000, "period": "month" },
    "display": "2.50 XCR per task, at most 40.00 XCR a month",
    "proposal": {
      "id": "sp-granite-reconcile",
      "version": 3,
      "url": "https://books.stonework.example/terms/reconcile-statement/v3.json",
      "digest": "sha256:5f0c…"
    },
    "terms": { "url": "https://books.stonework.example/terms/sku-reconcile-v3", "digest": "sha256:9a41…" }
  }
]
```

- `offering` is the offering's identifier as the agent's Descriptor (the Common Agent Specification, Section 6.2) and the standing proposal both name it. It is REQUIRED.
- `arrangement` is the price model: the pricing arrangement of the proposal's price clause, one of `fixed_fee`, `time_and_materials` and `no_charge` (Agent SoW, Section 5.5). It is REQUIRED.
- Under `fixed_fee`, `currency` and `per_task` quote the rate for this offering, in integer micro-units, and `ceiling` quotes the clause's ceiling where it has one.
- Under `time_and_materials`, `currency`, `schedule` and `cap` quote the clause. Each line of `schedule` carries its `meter`, `per`, `unit` and `per_unit` as the clause writes them, and `cap` is REQUIRED.
- Under `no_charge`, the offer carries the arrangement and no amounts.
- `display` is one sentence for people, derived from the members above. Under `time_and_materials` it MUST state the cap.
- `proposal` names the standing proposal by `id` and `version`, where the signed document is served (`url`), and its `digest`. It is REQUIRED.
- `terms` names the agent's own advertised terms for the offering, where it advertises any (the Common Agent Specification, Section 7.6), by `url` and `digest`.
- `mismatch` is `true` when those advertised terms state a price the standing proposal does not.

The rules that govern an offer:

1. **Every offer comes from a signed standing proposal.** Each structured member of an offer MUST be quoted from the proposal's clauses, and an offer MUST NOT carry a claim no clause backs. A catalog MUST verify the proposal's signature, and that its digest matches the bytes served at `proposal.url`, before it lists the offer, and MUST NOT list an offer whose proposal names an offering the agent does not publish (Agent SoW, Section 12.1).
2. **A directed standing proposal yields no public offer.** An offer derived from a proposal that names a counterparty (`offered_to`) MUST NOT appear on an entry whose audience is `public` or `unlisted` (Section 9). A catalog MUST check for `offered_to` before it lists an offer.
3. **The signed rate is the price shown.** Where `mismatch` is `true`, a catalog MUST show the proposal's rate and the mismatch, and SHOULD refuse to list the entry publicly until the two agree.
4. **No charge is stated as such.** A free offering that can be engaged is listed with `arrangement` set to `no_charge`, and a reader MUST show that arrangement. An absent price and a price of zero are different statements.
5. **Silence states nothing about price.** An entry with no `ca:offers` has stated no price and no engage action. A reader MUST NOT present it as free.
6. **The offer goes stale with its proposal.** When the proposal at `proposal.url` changes, its digest moves, and a reader that finds a different digest MUST treat the offer as out of date until the entry is republished.

## 4. Reputation

`ca:reputation` is an array of pointers to reports issued by reputation bureaus (Agent Reputations, Section 8). A pointer is a copy of the figures a report states, together with every figure that Agent Reputations, Section 8.2 requires beside a score, and where to fetch the signed report itself.

```json
"ca:reputation": [
  {
    "bureau": "https://bureau.example",
    "report": "https://bureau.example/v1/reputation/Granite.books%40stonework.example",
    "capability": "reconcile-statement",
    "enrollment": "RATED",
    "lcb": 0.902,
    "n_eff": 412.6,
    "attester_anchors": 63,
    "top_anchor_share": 0.09,
    "value_judgment_share": 0.12,
    "formula_version": "fdbk-score-1",
    "issued_at": "2026-10-18T09:40:00Z",
    "display": "0.90 lower bound, from 412.6 effective interactions and 63 attesters (largest share 9%)"
  }
]
```

1. **The lower bound travels with its context.** A pointer that carries `lcb` MUST also carry `enrollment`, `n_eff`, `attester_anchors` and `top_anchor_share`, and MUST carry `value_judgment_share` whenever the report states one. A pointer MUST NOT carry the report's `mean`. A capability the bureau has not scored carries its `enrollment` and no `lcb`, so that a subject with no score is never shown with a score of zero.
2. **The catalog verified the report.** A catalog MUST verify the bureau's signature on a report before it copies figures from it (Agent Reputations, Section 8.1), and MUST carry `bureau` and `report` so that a reader can fetch the signed report and check the copy.
3. **Every display shows the context.** A catalog or reader that shows a figure from a pointer MUST show, beside it, the enrollment state, the effective sample size, the attester count and the largest attester share, and the value judgment share where the pointer carries one, with the bureau's name. `display` is written so that it already contains them, and a renderer SHOULD use it.
4. **Reputation does not rank on its own.** A catalog MUST NOT order search results by a reputation pointer alone, and MUST NOT fold one into ARD's relevance `score`, which measures relevance only (ARD, Section 5.3.2). A catalog that uses reputation as one input to ordering MUST say so where it documents its ordering.
5. **The pointer is the catalog's.** `ca:reputation` is a catalog annotation. A catalog MUST ignore a `ca:reputation` that arrives in a published entry and write its own.

## 5. Liveness

Presence changes from minute to minute, and an entry describes something durable. Agent Messaging keeps the two in separate stores for that reason (Agent Messaging, Sections 8.4 and 9.5), and this profile keeps them apart in the entry too. The publisher states where to ask, the catalog may state when it last saw an answer, and neither is a statement about now.

`ca:liveness` is the publisher's pointer to a presence source. Its `ask` member lists the ways to ask, in the publisher's order of preference:

```json
"ca:liveness": {
  "ask": [
    { "via": "agent-messaging", "agent": "did:key:z6MkhQ…", "registry": "https://mesh.stonework.example" },
    { "via": "https", "url": "https://books.stonework.example/presence" }
  ]
}
```

- `via: "agent-messaging"` names the agent's key and the registry it is registered with. A reader asks with `get_presence` (Agent Messaging, Section 9.6).
- `via: "https"` names an address that answers `GET` with `{ "status", "checked_at" }`, where `status` is one of Agent Messaging's presence values, `online`, `busy`, `degraded` and `offline`.

`ca:lastSeen` is a catalog annotation: `{ "at", "status", "via", "observed_by" }`, the moment the catalog last read a presence answer for the agent, the answer, how it asked, and who asked.

1. A catalog MUST NOT write a presence status into a publisher member, and MUST NOT present `ca:lastSeen` as current presence.
2. A catalog that joins presence into a search response at query time MUST carry the moment it read it, and MUST answer `unknown` when it could not ask or nobody answered. `unknown` and `offline` are different answers.
3. A catalog MUST NOT withdraw, hide or demote an entry because its agent is offline. Being registered and being reachable are separate facts (Agent Messaging, Section 9.5).
4. A reader MUST ask a presence source in `ca:liveness` before it relies on the agent being reachable.
5. An entry for something with no address of its own, such as a skill archive, a document or an Agent Package, MUST NOT carry `ca:liveness` or `ca:lastSeen`.

## 6. Evidence and provenance

A listing tells a reader what somebody said. Two catalog annotations tell the reader how much the catalog knows about who said it and about each statement in it. Neither is a quality signal, and neither may be set by the publisher: a catalog MUST ignore either term when it arrives in a published entry and write its own.

`ca:evidence` labels the whole listing:

```json
"ca:evidence": {
  "speaker": "verified",
  "provenance": "publisher",
  "source": "https://books.stonework.example/.well-known/ard.json",
  "source_seen_at": "2026-10-18T09:00:00Z"
}
```

- `speaker` says how much the catalog knows about who is speaking: `self-declared` (the catalog took the publisher's word, including for who they are), `verified` (the catalog checked the speaker's identity, for example by verifying the entry's proof), or `attested` (a third party made a checkable claim about the subject, carried in `trustManifest.attestations`). It says nothing about whether what was said is true.
- `provenance` says whose act the listing is: `publisher` (read from a document the publisher serves itself), `claimed` (written by a party that proved control of the publisher's domain), `index` (mirrored from a third party's registry), or `catalog` (written or indexed by the catalog itself).
- `source` is where the catalog read the listing, and `source_seen_at` is when it last read it.

`ca:fields` labels each statement. Its keys are term paths in the entry, such as `description`, `capabilities` or `ca:offers`, and each value is `{ "state", "at", "how", "source" }`. `state` is one of `declared` (stated and unchecked), `checked` (the catalog checked it, for example by verifying a signed document or asking the agent), `attested` (a third party signed it), and `computed` (the catalog derived it from other facts). `how` says in a sentence what was done, and `source` names the document or observation.

1. A key that is absent from `ca:fields` means the statement is not on the listing at all. A renderer MUST NOT show an absent key as `declared`.
2. A renderer that shows a listing MUST show `speaker` and `provenance` with it, and SHOULD show a statement's `state` beside the statement.
3. A catalog MUST NOT raise `speaker` or a field's `state` on the publisher's request, and MUST NOT offer a way to do so.

## 7. Publishing and fetching an entry

ARD defines search and leaves out how an entry reaches a registry and how a client fetches one complete entry by its identifier (ARD, Section 5.3.2). This profile defines both, at the registry's base URL (ARD, Section 5.3), and they are also proposed to ARD for adoption. The error codes are ARD's (ARD, Appendix B), with `409 CONFLICT` and `410 GONE` added.

**Fetch.** `GET {base}/entries/{identifier}`, with the identifier percent-encoded, answers with the complete entry: every publisher member exactly as published, the publisher's `proof`, and the catalog's annotations.

- An entry whose audience does not include the caller answers `404 NOT_FOUND`, the same answer as an identifier the catalog does not hold.
- An `unlisted` entry answers to anyone who names its identifier.
- A withdrawn or removed entry answers `410 GONE` with `{ "identifier", "withdrawn_at" }`, and `reason` where the catalog removed it.

**Publish.** `PUT {base}/entries/{identifier}`, with the entry as the body, creates or replaces the entry and answers `201` or `200` with the stored entry.

- The entry MUST carry a publisher proof that verifies (Section 8), and the identifier in the path MUST equal the entry's `identifier`. A proof that fails, or a key that does not belong to the identifier's publisher, answers `403 PERMISSION_DENIED`.
- The entry MUST carry `updatedAt`. An entry whose `updatedAt` is not later than the stored one answers `409 CONFLICT`, so that an old signed entry cannot be replayed over a newer one.
- For an entry whose audience is `organization` or `account`, the call MUST also be authenticated, and the catalog binds the audience to the authenticated account and its organization. For `public` and `unlisted`, the proof is sufficient authority.
- The catalog MUST check every offer against its standing proposal (Section 3) before it lists the entry, and answers `400 INVALID_ARGUMENT`, naming the offer, when one fails.

**Withdraw.** `DELETE {base}/entries/{identifier}`, with the body `{ "identifier", "withdrawn_at", "proof" }`, signed as an entry is signed, withdraws the entry. The catalog stops returning it in search and in its manifest, and answers a later fetch with `410 GONE`.

## 8. Signed entries and the signed manifest

ARD leaves the signing procedure to the trust framework an entry declares in `trustManifest.trustSchema` (ARD, Section 4.5.2). This profile is that framework for the entries that follow it. An entry signed under this profile declares it so:

```json
"trustManifest": {
  "identity": "did:web:books.stonework.example",
  "identityType": "did",
  "trustSchema": {
    "identifier": "https://commonagent.net/catalog.html",
    "version": "0.1.0-draft",
    "governanceUri": "https://commonagent.net/catalog.html",
    "verificationMethods": ["eddsa-jcs-2022"]
  }
}
```

**The identity.** `trustManifest.identity` MUST be `did:web:` followed by the identifier's publisher domain, which is how this profile meets ARD's publisher authority binding (ARD, Section 4.5.1): the DID document the publisher serves at `https://<publisher>/.well-known/did.json` lists the keys that may sign for the domain, under `assertionMethod`. An agent's own Ed25519 identity key (the Common Agent Specification, Section 4.1) is written as a `did:key`. A `did:key` carries no domain, so it cannot be `trustManifest.identity` by itself, and it signs an entry only where the publisher's DID document lists it under `assertionMethod`. That is how an agent signs its own entry under its operator's domain.

**The entry proof.** A publisher signs an entry with a W3C Data Integrity proof (https://www.w3.org/TR/vc-data-integrity/) using the `eddsa-jcs-2022` cryptosuite (https://www.w3.org/TR/vc-di-eddsa/), carried in the entry's `proof` member, with `proofPurpose` set to `assertionMethod` and `verificationMethod` naming a key the publisher's DID document lists. The proof covers the entry with these members removed: `proof` itself, the catalog annotations (`ca:reputation`, `ca:lastSeen`, `ca:evidence`, `ca:fields`), and the members ARD adds to a search result (`score` and `source`). The entry's `@context` is copied into the proof configuration, as the cryptosuite requires. `trustManifest.signature` is not used by this profile.

1. A catalog MUST verify the proof of every entry that carries one before it labels the speaker `verified`, and MUST carry a proof that fails as failed, with `speaker` left at `self-declared`.
2. A catalog MUST NOT add, change or remove a publisher member of an entry that carries a proof. It adds catalog annotations only. A catalog that writes an entry for an agent whose publisher signs nothing, such as an entry built from a crawled card, writes it without a publisher proof and labels it with `provenance` set to `catalog` or `index`.
3. A reader that verifies a proof removes the members listed above before verifying, and a reader that finds a catalog annotation inside the signed bytes MUST treat it as the publisher's statement about itself, which is worth no more than any other.

**The manifest proof.** A catalog that publishes a manifest of its entries at `/.well-known/ard.json` (ARD, Section 5.1) signs it with its own key, under its own `did:web` identity, with the same cryptosuite over the whole manifest as served. The proof is served beside the manifest, as the document `{ "about": "<manifest address>", "proof": { … } }`, at an address the manifest response names in a `Link` header with `rel="proof"`. A catalog MAY also embed the proof as a top-level `proof` member of `ard.json`, which ARD v0.91 permits. A catalog that also serves the predecessor manifest at `/.well-known/ai-catalog.json` MUST serve that one's proof only beside it, because the predecessor schema admits no top-level member it does not define. The proof's `created` SHOULD be the latest `updatedAt` among the entries, so that an unchanged manifest keeps an unchanged proof and conditional requests keep working. The manifest proof covers the catalog's annotations in it, which is what makes them checkable as the catalog's word wherever a copy travels.

## 9. Audience

`ca:audience` says who may see an entry. It takes one of four values:

- `public`: anyone may find the entry by search, read it in the catalog's manifest, and fetch it.
- `organization`: only authenticated members of the publisher's organization may find and fetch it.
- `account`: only the publishing account may find and fetch it.
- `unlisted`: anyone who names the identifier may fetch the entry, and no search returns it and no manifest lists it.

1. **An entry is not public until somebody says so.** An entry published through the publish call (Section 7) without `ca:audience` is `account`. Widening the audience is always an act of the publisher.
2. **Serving publicly is saying so.** An entry the catalog reads from a document its publisher serves to anyone, such as a public `ard.json` or in-page markup, is `public` unless the entry states otherwise, because serving it to anyone is the publisher's act of publishing.
3. **A catalog keeps the audience.** A catalog MUST NOT return an entry in search, list it in a manifest, return it through federation, or show it on a page to anyone outside its audience. It MUST NOT pass an entry to another registry with a wider audience than the entry states.
4. **A directed offer stays private.** An offer from a directed standing proposal never appears on a `public` or `unlisted` entry (Section 3, rule 2).

## 10. The link to the AgentDoc

An entry describes a listing, and the agent's AgentDoc assembles everything checkable about the agent itself, each part with its source (the Common Agent Specification, Section 9). An entry for an agent SHOULD carry both of these members:

- `ca:subject`: the agent's identity key, written as a `did:key`.
- `ca:agentdoc`: `{ "url", "page" }`, where `url` serves the AgentDoc as JSON and `page` serves its human rendering (the Common Agent Specification, Sections 9.2 and 9.8).

1. The AgentDoc's `subject.id` MUST denote the same key as `ca:subject`.
2. An entry for an Agent Package MAY link the package AgentDoc, which has no subject (the Common Agent Specification, Section 13.4), and then MUST NOT carry `ca:subject`.
3. An AgentDoc assembler MAY list the entry as a source of kind `listing` (the Common Agent Specification, Section 9.4). It fills `sells` from the standing proposals themselves, and treats the entry's offers as a projection of them.
4. Where the entry and the AgentDoc disagree, for example where an offer quotes a rate the AgentDoc's `sells` does not, a reader MUST report the disagreement and MUST NOT merge the two.

## 11. Conformance

**A catalog** that follows this profile MUST:

1. serve every entry it holds as a valid ARD v0.91 entry, so that a reader which ignores this profile's terms reads each one;
2. derive every offer from a standing proposal whose signature and digest it verified, and keep directed offers off `public` and `unlisted` entries (Section 3);
3. copy reputation figures only from a report whose signature it verified, with all of the context Section 4 requires, and keep reputation out of ARD's relevance score and from ordering results alone;
4. keep presence out of publisher members, carry `ca:lastSeen` only as an observation with its moment, and never withdraw or demote an entry for being offline (Section 5);
5. write `ca:evidence` and `ca:fields` itself, and never on the publisher's request (Section 6);
6. answer the fetch call, and the publish call where it accepts entries, as Section 7 defines them;
7. verify every entry proof it receives, change no publisher member of a signed entry, and sign its manifest (Section 8);
8. enforce `ca:audience` in search, in its manifest, in federation and on its pages, and treat an entry published without one as `account` (Section 9).

**A reader** that follows this profile MUST:

1. read an entry's ARD terms whether or not it understands this profile's terms, and ignore any `ca:` term it does not recognise;
2. treat an entry with no `ca:offers` as having stated no price (Section 3, rule 5), and show `no_charge` where an offer states it;
3. show a reputation figure only with its context (Section 4, rule 3);
4. ask a presence source before relying on an agent being reachable, and never read `ca:lastSeen` as current (Section 5);
5. remove the catalog annotations and ARD's result members before verifying an entry proof (Section 8), and verify a manifest proof against the catalog's own DID document;
6. report a disagreement between an entry and the AgentDoc it links to, and keep the two apart (Section 10).

**A publisher** that follows this profile signs its entries as Section 8 says, states `ca:audience` on every entry it publishes, and derives every offer from its own signed standing proposal.

## 12. Example

An entry for one agent, as its publisher signs it and as a catalog serves it from the fetch call, with the catalog's annotations added after the publisher's members. Keys and digests are shortened.

```json
{
  "@context": [
    "https://agenticresourcediscovery.org/context/v1",
    "https://commonagent.net/ns/catalog/v1.jsonld"
  ],
  "identifier": "urn:air:books.stonework.example:agent:granite",
  "displayName": "Granite",
  "type": "application/a2a-agent-card+json",
  "url": "https://books.stonework.example/.well-known/agent-card.json",
  "description": "Reconciles a month of bank statements against the ledger and flags the exceptions.",
  "capabilities": ["reconcile-statement", "flag-exceptions"],
  "representativeQueries": [
    "reconcile our March bank statement against the ledger",
    "find the transactions that do not match the books"
  ],
  "version": "3.2.0",
  "updatedAt": "2026-10-18T08:30:00Z",
  "trustManifest": {
    "identity": "did:web:books.stonework.example",
    "identityType": "did",
    "trustSchema": {
      "identifier": "https://commonagent.net/catalog.html",
      "version": "0.1.0-draft",
      "governanceUri": "https://commonagent.net/catalog.html",
      "verificationMethods": ["eddsa-jcs-2022"]
    }
  },
  "ca:profile": "0.1.0-draft",
  "ca:subject": "did:key:z6MkhQ…",
  "ca:agentdoc": {
    "url": "https://books.stonework.example/.well-known/agentdoc.json",
    "page": "https://books.stonework.example/.well-known/agentdoc"
  },
  "ca:audience": "public",
  "ca:offers": [
    {
      "offering": "reconcile-statement",
      "arrangement": "fixed_fee",
      "currency": "XCR",
      "per_task": 2500000,
      "display": "2.50 XCR per task",
      "proposal": {
        "id": "sp-granite-reconcile",
        "version": 3,
        "url": "https://books.stonework.example/terms/reconcile-statement/v3.json",
        "digest": "sha256:5f0c…"
      }
    }
  ],
  "ca:liveness": {
    "ask": [ { "via": "https", "url": "https://books.stonework.example/presence" } ]
  },
  "proof": {
    "type": "DataIntegrityProof",
    "cryptosuite": "eddsa-jcs-2022",
    "created": "2026-10-18T08:30:00Z",
    "verificationMethod": "did:web:books.stonework.example#key-1",
    "proofPurpose": "assertionMethod",
    "proofValue": "z3hF…"
  },
  "ca:evidence": {
    "speaker": "verified",
    "provenance": "publisher",
    "source": "https://books.stonework.example/.well-known/ard.json",
    "source_seen_at": "2026-10-18T09:00:00Z"
  },
  "ca:fields": {
    "description": { "state": "declared" },
    "ca:offers": { "state": "checked", "at": "2026-10-18T09:00:00Z", "how": "The standing proposal's signature and digest were verified.", "source": "https://books.stonework.example/terms/reconcile-statement/v3.json" }
  },
  "ca:reputation": [
    {
      "bureau": "https://bureau.example",
      "report": "https://bureau.example/v1/reputation/granite",
      "capability": "reconcile-statement",
      "enrollment": "RATED",
      "lcb": 0.902,
      "n_eff": 412.6,
      "attester_anchors": 63,
      "top_anchor_share": 0.09,
      "issued_at": "2026-10-18T09:40:00Z",
      "display": "0.90 lower bound, from 412.6 effective interactions and 63 attesters (largest share 9%)"
    }
  ],
  "ca:lastSeen": { "at": "2026-10-18T09:41:12Z", "status": "online", "via": "https", "observed_by": "did:web:catalog.example" }
}
```

A reader that knows only ARD sees an A2A agent with a name, a card address, two capabilities and two representative queries, and carries the rest unread. A reader that follows this profile also learns that the price comes from version 3 of a signed standing proposal, that a bureau's lower bound rests on about four hundred effective interactions from 63 attesters, where to ask whether the agent is up, that the catalog verified who published the entry, and where to read the agent's AgentDoc.

## 13. Relation to ARD, A2A Agent Cards and MCP server cards

**ARD.** Every entry that follows this profile is an ARD entry, and a catalog that follows it is an ARD registry: `POST /search` is unchanged, `POST /explore` and federation are as ARD defines them, and a filter on a `ca:` term works by ARD's own rule for namespaced terms (ARD, Section 5.3.1). The profile uses three seams ARD provides: namespaced terms through `@context`, the trust framework named in `trustSchema`, and the top-level members of a manifest, which ARD leaves to the transport. The publish, fetch and withdraw calls of Section 7 fill a gap ARD names itself, and they are proposed to ARD so that they can move there.

**A2A Agent Cards.** An entry of type `application/a2a-agent-card+json` points at the agent's card with `url`, and this profile adds nothing to the card. A card that carries the A2A Terms extension (Agent SoW, A2A Terms extension) commits to a standing proposal by digest, and that proposal is the one an offer names, so the two MUST agree, and a reader that finds them disagreeing reports it. A card that carries the A2A Reputation extension points at the same bureau reports that `ca:reputation` copies.

**MCP server cards.** An entry of type `application/mcp-server-card+json` points at an MCP server card, or a record in the MCP registry's `server.json` form, and this profile adds nothing to it. An MCP server that is sold carries `ca:offers` like any other entry, derived from a standing proposal. A server that runs only as a local package has no address, and its entry carries no liveness (Section 5, rule 5).

**DIDs.** The profile uses `did:web` for publishers and catalogs and `did:key` for agents' own keys, as Section 8 describes, and needs no other DID method.

## Appendix A: the JSON-LD context

Served at `https://commonagent.net/ns/catalog/v1.jsonld`.

```json
{
  "@context": {
    "@version": 1.1,
    "ca": "https://commonagent.net/ns/catalog#",
    "ca:profile": { "@id": "ca:profile" },
    "ca:subject": { "@id": "ca:subject", "@type": "@id" },
    "ca:agentdoc": { "@id": "ca:agentdoc", "@type": "@json" },
    "ca:offers": { "@id": "ca:offers", "@type": "@json" },
    "ca:liveness": { "@id": "ca:liveness", "@type": "@json" },
    "ca:audience": { "@id": "ca:audience" },
    "ca:reputation": { "@id": "ca:reputation", "@type": "@json" },
    "ca:lastSeen": { "@id": "ca:lastSeen", "@type": "@json" },
    "ca:evidence": { "@id": "ca:evidence", "@type": "@json" },
    "ca:fields": { "@id": "ca:fields", "@type": "@json" },
    "proof": { "@id": "https://w3id.org/security#proof", "@type": "@json" }
  }
}
```
