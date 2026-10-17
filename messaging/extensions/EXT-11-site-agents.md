# EXT-11: Site Agents

| | |
|---|---|
| **URI** | `mesh://extensions/site-agents/v1` |
| **Status** | Draft |
| **Version** | 0.1.0 |
| **Requires** | AgentMesh core >= 0.3, SPEC-NAMING >= 0.9 |

A web site declares the agent that answers for it. A browser (or any client)
that finds the declaration and verifies it can tell its user "this site has an
agent" and open a conversation with that agent on mesh rails: verified
identity on both ends, tasks, terms, and budgets, instead of an anonymous web
chat widget. The naming spec already provides everything except the
declaration itself: handles are anchored at a domain's addresses, a domain
speaking for its own handles is the final resolution authority
(SPEC-NAMING 5.2, 5.5), and resolution returns a signed card binding the
handle to an agent key. This extension defines only the missing piece: where
a site says which agent is its own.

## 1. The site agent file

A site declares its agents at:

```
https://<host>/.well-known/agentmesh
```

served as `application/json`, at most 16 KB:

```json
{
  "v": 1,
  "agents": [
    {
      "handle": "Support.hello@acme.com",
      "purpose": "Answers questions about Acme products and documentation"
    }
  ]
}
```

- `v` (REQUIRED): the number `1`. Consumers MUST ignore files with a version
  they do not implement.
- `agents` (REQUIRED): ordered; the first entry is the site's primary agent.
  Consumers MAY surface only the first entry.
- `handle` (REQUIRED): a PAN handle (SPEC-NAMING 2). The anchor domain -- the
  part after the `@` -- is what verification checks against the serving host.
- `purpose` (OPTIONAL): plain text, at most 200 characters, shown to humans
  deciding whether to start the conversation. No markup.

Unknown keys MUST be ignored. Sites SHOULD serve ordinary HTTP cache headers;
the file is public, static, and cheap.

## 2. Verification

The file is **discovery**; the card is **proof**. A consumer MUST treat an
entry as the site's agent only when both hold:

1. **Anchor match.** The handle's anchor domain equals the serving host, or
   the serving host is a subdomain of it, compared on whole labels
   (`docs.acme.com` may declare a handle anchored `@acme.com`;
   `acme.com.evil.example` may not). The comparison is case-insensitive and
   ignores the port.
2. **Resolution.** The handle resolves per SPEC-NAMING 5.5 -- the anchor
   domain's own WebFinger where it serves one, else the registrar of record --
   to a card binding the handle to an agent key. Cards fetched from anywhere
   other than the consumer's own configured registrar over TLS MUST carry a
   verifying registrar signature (SPEC-NAMING 5.3). A resolution conflict is
   surfaced as a warning, never silently settled (SPEC-NAMING 5.5).

An entry failing either check MUST NOT be presented as the site's agent --
there is no "unverified" presentation tier. A site cannot claim an agent it
does not anchor, and a handle cannot claim a site it is not anchored at; both
directions fail the anchor match.

## 3. Consumer behavior

- Fetch the file only from the site being visited: discovery leaks nothing to
  third parties, and the resolution lookup happens only after a claim exists.
- Verify every entry presented, not only the first: each entry's anchor match
  and resolution stand alone, and a verified entry never vouches for the ones
  after it. A consumer that surfaces several MUST bound how many it resolves
  (the reference consumer admits four) and drop the rest, so a file inside the
  size limit cannot turn one page load into an unbounded burst of lookups.
- Use a short fetch timeout and cache results: at least an hour for a missing
  or invalid file, up to a day for a verified one. Re-verify no more often
  than daily; re-resolution is what picks up a re-keyed or released handle.
- The conversation itself is ordinary mesh traffic to the resolved agent id;
  this extension ends at discovery and verification.

### 3.1 Page context on the conversation

A browser opening a conversation from a page SHOULD attach that page to each
chat request as:

```json
"input": { "message": "<the visitor's text>", "page": { "url": "https://<host>/<path>" } }
```

`page.url` is sender-asserted context, exactly as untrusted as the message
text -- but unlike the message, most SDK injection fencing does not frame it.
Consumers MUST therefore hold it to a strict gate before any use: http(s)
scheme, no whitespace or control characters, bounded length; drop it whole
otherwise. The URL is the entire contract: free-text companions such as a
page title are deliberately excluded, because prose outside the fence is an
injection channel, and a title adds little a fetched page would not.

For the browser this costs nothing in privacy: the chip exists only on the
declaring site, so the attached URL is always one of the site's own pages.

## 4. Out of scope in v1

- **Cross-domain delegation.** A site pointing at a handle anchored at a
  different domain needs an attestation story before it can be verified;
  until then it simply fails the anchor match.
- **Per-path or per-audience agents.** One declaration per host.
- **Non-HTTPS sites.** The chain starts at a TLS fetch from the domain being
  claimed; there is no honest way to begin it over plain HTTP.
