# Worked example: a marketing department's catalog

Eleven processes, one row each. This is what a department has after the
first pass: enough to see what exists, who owns it, and where the
dependencies are. One row, `mkt/social-campaign`, is written out in full
in [social-campaign.md](./social-campaign.md).

| id | name | owner | trigger | cadence | automation | status |
|---|---|---|---|---|---|---|
| mkt/campaign-planning | campaign planning | VP Marketing | the quarter opens | 4 a year | assisted | running |
| mkt/competitor-review | strategic competitor review | Product Marketing | monthly, or a competitor announcement | ~16 a year | supervised | running |
| mkt/social-campaign | social campaign | Head of Social | a campaign brief is approved | ~40 a quarter | never | running |
| mkt/email-campaign | email campaign | Lifecycle Marketing | a campaign brief is approved | ~20 a quarter | never | running |
| mkt/website-update | website update | Web Lead | a change request is filed | ~30 a quarter | supervised | running |
| mkt/lead-routing | inbound lead routing | Demand Gen | a form is submitted | ~400 a week | autonomous | running |
| mkt/claims-register | claims register upkeep | Product Marketing | a new claim is proposed | ~10 a quarter | never | running |
| mkt/brand-review | brand guideline review | Brand Lead | twice a year, or on request | 2 a year | assisted | running |
| mkt/event | trade show and event | Events Lead | an event is committed to | ~6 a year | manual | documented |
| mkt/agency-brief | agency brief and review | Head of Social | work is sent to an agency | ~8 a quarter | manual | documented |
| mkt/quarterly-readout | quarterly readout | VP Marketing | the quarter closes | 4 a year | supervised | running |

Two rows say `documented` rather than `running`, which means the process
is written down but nobody has run it against the document yet. It is
worth showing that state rather than hiding it. Writing a process down is
the first step, and a catalog that claims a process is running before it
has run is one people stop believing.

## The dependency graph

```
mkt/competitor-review ─┬─> mkt/campaign-planning ─┬─> mkt/social-campaign ─┐
                       │                          ├─> mkt/email-campaign ──┤
                       ├─> mkt/social-campaign    └─> mkt/event ───────────┤
                       ├─> mkt/email-campaign                              │
                       ├─> mkt/website-update                              │
                       ├─> mkt/brand-review                                │
                       └─> mkt/quarterly-readout <─────────────────────────┘

mkt/claims-register ───┬─> mkt/social-campaign
                       ├─> mkt/email-campaign
                       └─> mkt/website-update

mkt/lead-routing ──────> mkt/quarterly-readout
mkt/agency-brief ──────> mkt/social-campaign
```

## What the graph says

**Two processes have a lot of other work depending on them.** The
competitor review feeds six others, and the claims register feeds three
of the four that write anything a customer will read. Neither runs very
often: the competitor review sixteen times a year, the claims register
ten times a quarter. If you ranked this catalog by how often each process
runs, both would come near the bottom, and both are still worth
automating early.

**The high-volume work is somewhere else.** Lead routing runs four
hundred times a week, more than everything else in the catalog put
together. It is already autonomous, which is what usually happens to the
busiest process in a department, whether or not anyone planned it.

**Two processes wait on the same person.** Social and email campaigns
both report `never`, and in both cases it is the same legal approval done
by the same reviewer, which puts one person in the path of sixty runs a
quarter. The catalog cannot automate that away. What it does tell you is
that the thing to fix here is how that review is staffed, rather than the
automation level.

**Every process feeds something else.** That is either a good sign or a
sign that the first pass missed the work that stands on its own. Since
events and agency briefing are still `documented` rather than `running`,
it is worth checking which.

## Where this department would start

The order that falls out of the graph does not start with the process
that runs most often:

1. **mkt/claims-register.** Three processes wait on it, and every one of
   them has a policy rule that cannot be satisfied without it. It is also
   the cheapest to improve, because it runs ten times a quarter and
   currently produces a spreadsheet.
2. **mkt/competitor-review.** Six dependents. Today it is supervised and
   takes a fortnight; most of that fortnight is gathering, which is
   exactly what a work board does well.
3. **mkt/website-update.** Thirty runs a quarter, already supervised, and
   no `never` phase in it. This is the first process in the catalog that
   could plausibly reach autonomous end to end.

Lead routing is left alone deliberately. It is already autonomous and
running four hundred times a week, which means any change to it is a
change to the highest-throughput thing in the department, and the catalog
gives no reason to touch it.

## What the first pass got wrong

Worth recording, because every department's first pass gets something
wrong:

- `mkt/social-campaign` and `mkt/email-campaign` were originally one row
  called "campaign execution". They have the same trigger but different
  owners and different channels, so they are two.
- "Content production" was a row until it turned out to have no trigger
  of its own. It is the `produce` phase of three other processes, not a
  process.
- `mkt/agency-brief` was missed entirely on the first pass, because it is
  the only process in the department that mostly happens in email.
