---
role: research-workflow
status: active
authority: authoritative
update-boundary: Update only when research execution, completion gates, validation, or reporting requirements change.
---

# Research Workflow

## 1. Establish the run

1. Read `AGENTS.md` and the required authorities.
2. Inspect the stored Program roster, aliases, linked Studies and Events,
   delivery-technology registry, media-source registry, and schema before research.
3. Declare one primary track and its bounded scope:
   - `event scan`: high-frequency or periodic media and press-release monitoring
     across registered Core media and sponsor sources within a declared time window
     or overlap, creating append-only Events and synchronizing directly implicated
     Program current-state fields;
   - `program refresh`: one or more named, already stored Programs, or the full
     stored Program roster (deep reconciliation of sponsor pipeline tables and
     official clinical/regulatory registries);
   - `program discovery`: candidates not currently stored, within a declared
     company, technology, evidence source, time window, or full-landscape scope;
   - `patent coverage audit`: one or more named, already stored Programs, or the
     full stored Program roster.
4. Record the starting Program roster. In refresh/discovery work, existing
   records route to refresh and absent candidates route to discovery. Patent
   audit remains stored-roster work and hands absent candidates to discovery.
   Event scan surfaces recent R&D developments, adds material Events, and routes
   absent candidate mentions to discovery and registry discrepancies to refresh.
5. Confirm that the direct sources required by the selected track are reachable
   or can be handled without an unsupported change.
6. Work on a branch; never write directly to `main`. Use a draft PR as the
   run-review surface by default. When the operator explicitly requests
   commit/push without a PR, use the accepted baseline-commit manifest defined
   in `docs/PATENT_AUDIT.md` for patent-audit results and handoffs.

`named-program refresh` is retained only as a plain-language description of a
single-Program `program refresh`; it is no longer a separate run mode.
`full landscape refresh` is retired as an atomic mode and replaced by the
combined run in section 10.

## 2. Track A: event scan

### Purpose and entry

Use `event scan` for high-frequency or periodic media monitoring to capture
material developments (clinical trial starts/readouts, regulatory milestones,
deals, platform updates, and R&D status changes) without running a heavy,
full-roster registry audit across all stored Programs. Entry is a declared
review date (`asOf`), an active time window, and the registered Core media surface.

### Required evidence surface and search matrix

Review the registered Core media in `src/data/registries/media-sources.json`
(domestic: 데일리팜, 바이오스펙테이터, 히트뉴스, 메디파나, 약업신문, 의학신문;
international: Fierce Biotech, BioPharma Dive, Endpoints News, STAT) and official
sponsor press-release / newsroom listings.

1. **Discovery window & overlap**:
   - Set the new `asOf` to the actual review date.
   - For routine periodic scans, search from two calendar days before the prior
     stored `asOf` (or prior event checkpoint) through the new `asOf`, inclusive.
     This `asOf - 2 days` overlap absorbs publication delays, timezones, and
     indexing lag.
   - For an initial scan, gaps of 30+ days, or recovering blocked sources, search
     the full 30-day window.
2. **Query matrix**:
   - Combine stored company names, program names, public compound codes, and
     aliases with sustained-release / depot terms (`장기지속형`, `서방형`, `디포`,
     `depot`, `microsphere`, `hydrogel`, `implant`, `extended-release`,
     `long-acting`, `Q4W`, `Q3M`, `Q6M`).
   - Reverse-search newly surfaced obesity/incretin candidate disclosures.

### Access verification and permitted fallbacks

Do not classify a media source from one connector, parser, or HTTP failure. Before
recording an access issue or omitting coverage, distinguish the publication's
response from a local tool failure and try at least two permitted routes:

1. **Browser-assisted review**: retry the official article or publication index
   with an actual Chrome engine, with JavaScript, cookies, redirects, and normal
   page rendering enabled;
2. **Official RSS & sitemap discovery**: inspect the publication's official RSS feed,
   news sitemap, or `/sitemap.xml` for candidate discovery and direct article URLs; and
3. **Legitimate free access**: use documented public APIs or legitimate free accounts
   only within published access limits.

TLS trust-store errors, connector `Internal Error` responses, parsing failures,
and responses that change only with the connector's user agent are tool or route
failures, not proof that the publication is unavailable.

Record each Core source in the session manifest as:
- `reviewed`: the source-native listings and relevant sections were fully checked
  through the interval;
- `partially-accessible`: candidates were discovered via RSS/sitemap or listings,
  but supporting article content could not be fully opened;
- `blocked`: neither the official surface nor permitted fallbacks yielded usable
  discovery or article content.

#### Known official fallback routes

| Source | Permitted fallback route | Boundary |
| --- | --- | --- |
| HitNews (히트뉴스) | official sitemap (`/sitemap.xml`) and normal browser article pages | no public article API is verified |
| Bosa (의학신문) | official sitemap (`/sitemap.xml`) and normal browser article pages | no public article API is verified |
| Yakup (약업신문) | retry the direct official article page with browser engine | connector failure is not an access restriction |
| Endpoints / Reuters | official RSS / news-sitemap as discovery lead | cross-check candidate against registered Core source |

Never evade a paywall, CAPTCHA, robots policy, or publisher access control; do not
rotate or impersonate user agents, disable TLS verification, or persist full article
bodies in the repository.

### Materiality filter (News to Event gate)

Apply strict materiality criteria before creating an Event:

- Exclude: General stock price fluctuations, market commentary, routine
  executive appointments, broad public health policy discussions, and promotional
  or repetitive non-technical marketing articles.
- Include:
  - `Clinical`: First-in-human / phase initiation, cohort dosing, enrollment
    milestones, clinical hold or resumption.
  - `Data`: Topline or interim efficacy/PK/PD/safety readouts, conference
    abstract presentations, peer-reviewed publications.
  - `Regulatory`: IND/CTA submission, clearance, ethics committee (HREC/IRB)
    approvals, fast-track/orphan designations, marketing approval.
  - `Partnership`: License in/out agreements, co-development deals, option
    exercises.
  - `Platform`: New delivery formulation or platform application directly
    supporting an obesity/overweight payload.
  - `Status`: Strategic pipeline prioritization, program pause, or
    discontinuation.

### Bounded Program synchronization

When an Event alters a stored Program's current development maturity (e.g. Phase 1
initiation, IND clearance, clinical hold) or operational status:
- Update the corresponding Program's `developmentStage`, `developmentStatus`,
  or `readout` in the same PR, following the historical no-loss rule in section 8.
- Update the Program's `lastVerifiedAt` to the review date.
- Do not perform full registry re-checks for unrelated Programs outside the event scope.

### Event scan completion gate

An event scan is GO only when:

1. the declared Core media sources and time window were traversed;
2. surfaced items were filtered through the materiality gate;
3. new material changes were recorded as append-only `Event` files with direct,
   accessible primary/media sources;
4. directly implicated Program current-state fields were synchronized without
   historical fact loss;
5. absent candidates were routed as `DISCOVERY_HANDOFF` and registry discrepancies
   as `REFRESH_HANDOFF`;
6. Event and common validation gates pass.

## 3. Track B: program refresh

### Purpose and entry

Use `program refresh` when the requested subject is already stored. Its purpose
is to reconcile the latest status and evidence for the declared Program set,
not to search the landscape for new Programs. Entry is one or more stable
Program slugs or the explicit full stored roster.

### Required evidence surface

For every in-scope Program, check:

- stored aliases, codes, current sources, linked Studies, and material Events;
- current sponsor pipeline/status pages and, when relevant, releases, filings,
  investor/R&D materials, and partner statements;
- every linked official registry record, plus regulator records when a
  regulatory milestone is asserted;
- publications, congress material, and patents only where they support a stored
  or newly encountered material claim.

Recheck unresolved deferred claims and source-access handovers only when their
Program is in the declared refresh scope. A full-roster refresh includes every
active unresolved handover tied to a stored Program. An independent discovery
coverage pass is not required; complete coverage of the required surfaces for
each in-scope Program is required.

Refresh findings are claim outcomes (`UPDATED`, `UNCHANGED`, or claim-level
`DEFERRED`), not candidate dispositions. Do not relabel an already stored
Program as `STORED`, `EXCLUDED`, or `DEFERRED`. If direct evidence shows that a
stored record no longer meets scope, handle removal or reclassification as a
supported refresh change; never silently delete it as a discovery exclusion.

### Refresh completion gate

A refresh is GO only when:

1. the declared Program set and required evidence surfaces were traversed;
2. sponsor status and all linked registry/regulatory records were reconciled;
3. every changed classification, interval, stage, or Study fact has direct
   support;
4. in-scope unresolved claims and blocked sources were preserved with a
   re-entry condition or source-access handover where necessary;
5. every crossover finding was resolved under section 6;
6. every newly confirmed sponsor, developer, or disclosed partner was resolved
   to an existing public Company or created once with direct official support,
   the Program display company maps to every directly confirmed participant,
   and a newly created Company received its one-time official Platform
   inventory;
7. Event and common validation gates pass.

## 4. Track C: program discovery

### Purpose and entry

Use `program discovery` when the objective is to find and classify Obesity
Depot candidates absent from the starting Program roster. Entry requires a
declared discovery boundary. General revalidation of existing Programs is not
part of this track.

### Required evidence surface

Within the declared boundary, search:

- company pipelines, Program names/codes, payload and formulation aliases;
- official registries and regulator sources;
- sponsor releases, filings, R&D/investor materials, and partner disclosures;
- peer-reviewed literature, congress material, patents, and relevant
  delivery-technology/platform sources.

Apply the scope in the Data Contract across all intervals; do not limit
discovery to monthly-or-longer products. Search results and secondary sources
may surface a candidate but cannot alone qualify canonical fields.

Every surfaced absent candidate must end as:

- `STORED`: direct evidence satisfies scope, identity, and entry requirements,
  and a new Program record passes validation;
- `EXCLUDED`: direct evidence establishes an exclusion rule; record the reason;
- `DEFERRED`: inclusion, identity, or a required direct source remains
  unresolved; record the missing evidence and re-entry condition.

Lack of evidence is not a catch-all exclusion. The undispositioned candidate
count must be zero. A second, independent coverage pass is mandatory within the
declared discovery boundary and must vary the query, source class, or
investigator path rather than repeat the first pass.

Recheck prior deferred candidates only when they fall inside the declared
discovery boundary. Full-landscape discovery rechecks all recorded candidate
deferrals and relevant unresolved source handovers. Before storing, compare
company, aliases, payload combination, and delivery platform against the
starting roster to prevent duplicate Program creation.

When a candidate becomes `STORED`, resolve every directly identified sponsor,
developer, and disclosed partner against `src/data/companies/`. Reuse existing
Company slugs. Create a missing Company record once, with its official homepage
and pipeline links when directly available, and map the Program display company
to every participating Company page. Do not create Company records for
search-result mentions or unresolved counterparties; retain non-company labels
in the internal `other` bucket. Routine later runs must reuse the stable
Company record rather than recreate it.

When a public Company record is first created, make one bounded pass over the
company's official technology pages and store every directly named Platform
with a supported current Company relationship. Patent evidence is optional at
this point. Later Program runs do not repeat this platform inventory unless the
official Company reference materially changes.

### Discovery completion gate

A discovery run is GO only when:

1. the declared boundary and required evidence surfaces were searched;
2. the independent coverage pass is complete;
3. every surfaced absent candidate is `STORED`, `EXCLUDED`, or `DEFERRED`, with
   zero undispositioned candidates;
4. every stored candidate has direct support for scope, identity, payload,
   record type, and delivery technology, and is not a duplicate;
5. every deferred candidate has missing evidence and a re-entry condition;
6. every crossover finding was resolved under section 6;
7. every stored Program's directly confirmed sponsor, developer, and disclosed
   partner was resolved to a public Company mapping, and each newly created
   Company completed its one-time official Platform inventory;
8. Event and common validation gates pass.

## 5. Track D: patent coverage audit

### Purpose and entry

Use `patent coverage audit` to assess patent-source coverage for a declared set
of already stored Programs and its bounded Platform queue. It is neither a
general current-state refresh nor a patent-bounded discovery run. Program entry
is one or more stable Program slugs or the explicit full stored roster. The
bounded Platform queue does not create a fourth track. The initial
landscape-wide audit uses the full stored roster and the Platform queue defined
in `docs/PATENT_AUDIT.md`; later audits may use that authority's delta scope.

### Required evidence surface

Follow `docs/PATENT_AUDIT.md`, the sole authority for the search matrix, family
deduplication, document and legal-status distinctions, Program-versus-platform
attribution, evidence thresholds, and periodic minimum rechecks. For every
in-scope Program, report one audit outcome:

- `PATENT_LINKED`: at least one family is attributable under that authority,
  with representative public patent source links stored or reconfirmed;
- `NO_LINK_FOUND`: the required search surface was completed without an
  attributable family; this is a search result, not proof that no patent
  exists;
- `ATTRIBUTION_DEFERRED`: a potentially relevant family was found but Program
  identity, rights chain, scope, or source access prevents reliable linkage.

Report the bounded Platform queue separately with the corresponding
`PATENT_LINKED`, `NO_LINK_FOUND`, or `ATTRIBUTION_DEFERRED` outcome. A Platform
outcome is not a Program outcome, and `NO_LINK_FOUND` is never a patent-absence
claim. Platform outcomes do not affect the `PATENT-LINKED PROGRAMS` KPI.

Patent audit never creates a Company page. For an existing Company, it updates
representative platform-level patent evidence and directly supported rights
details on the matching Platform reference. Those updates surface through the
existing Company page and remain separate from `Program.sources` and the
`PATENT-LINKED PROGRAMS` KPI. A patent finding naming an absent or unresolved
company or platform identity remains a handoff until the official reference is
established.

An absent candidate encountered in patent searching is always a
`DISCOVERY_HANDOFF` unless the run explicitly adds a bounded `program
discovery` track. Patent evidence alone does not create a Program or assign a
discovery disposition.

### Patent audit completion gate

A patent audit is GO only when:

1. every Program in the declared audit roster and every Platform in the
   bounded queue has one separately reported audit outcome, with zero unaudited
   Programs and zero unaudited queued Platforms;
2. the required identifier, payload, platform, sponsor, and assignee search
   paths were traversed and family duplicates were collapsed;
3. application, publication, grant, and jurisdiction-specific legal status
   were not conflated;
4. every stored patent link meets the Program-attribution threshold, while
   platform-only findings remain platform-level and update only an existing
   Company's Platform reference;
5. no patent alone was used to assert active development, `productTarget`,
   development stage/status, or a new Program;
6. every absent candidate and unresolved stored-Program attribution was routed
   under section 6;
7. the patent-specific and common validation gates pass.

## 6. Bounded crossover and handoff

Never ignore a material fact merely because it belongs to another track.
Keep crossover bounded:

- During event scan, route an absent candidate as `DISCOVERY_HANDOFF` and an
  inconsistent registry detail as `REFRESH_HANDOFF`. Bounded crossover may update
  only the directly implicated Program's current state when supported by direct
  primary evidence.
- During refresh, capture an absent candidate's minimum identity, why it may be
  in scope, and best source as `DISCOVERY_HANDOFF` in the run report or draft
  PR. Do not expand into landscape search or assign a candidate disposition
  unless the run explicitly adds a bounded discovery track.
- During discovery, route a material fact about a stored Program as
  `REFRESH_HANDOFF`. A bounded crossover may update only that Program, its
  linked Study, and directly implicated Event after completing the refresh
  evidence surface and refresh gate for that Program.
- During patent audit, route any non-patent current-state fact about a stored
  Program as `REFRESH_HANDOFF`; do not broaden the audit into sponsor or
  registry reconciliation. Route an absent candidate as `DISCOVERY_HANDOFF`
  with only the minimum evidence required by `docs/PATENT_AUDIT.md`.
- Route a pure Platform, rights-holder, or Company-Platform relationship
  finding that is not yet canonical through the patent-audit baseline
  commit's durable handoff section. Do not use the internal `other` Company
  bucket as a Platform ledger.
- A handoff is not a source-access handover. Create
  `docs/source-access-handover/<programSlug>.md` only when source access leaves a
  material claim unresolved for a stable stored or newly stored Program under
  that template. An absent candidate without a stable Program identity remains
  a `DEFERRED` discovery disposition in the run report.
- List every handoff and bounded crossover in the run report. An unrecorded
  material crossover is NO-GO; a recorded handoff may remain for a later run
  when it is outside the authorized scope.

## 7. Apply the contract

- Reuse stable Program and Study slugs.
- Declare ordered `payloadComponents`, `recordType`, and a registered
  delivery-technology ID. Classify `durationMechanismId` from the same
  evidence or store `null`; never guess it from the payload alone (see
  `docs/DATA_CONTRACT.md` "Duration mechanism").
- Keep payload combinations as separate Programs and never alphabetize
  `payloadComponents` mechanically.
- Preserve free-text delivery technology alongside its controlled ID.
- Separate product target, demonstrated duration, and platform potential.
- Apply calendar and QnW conversions exactly as defined in the Data Contract.
- Keep Program stage/status separate from Study phase/recruitment.
- Store each Study as one official `registry` plus its source-native
  `registryId`; do not assume NCT identifiers.
- Add `studySlug` to an Event only when the Event identifies that Study.
- Use `DEFERRED_SCHEMA_CASE` when directly supported evidence is not representable.

## 8. Protect existing records

Do not replace stronger evidence with weaker reporting, guess an identity,
classification, interval, stage, phase, country, or status, or mechanically
refresh dates.

Create an Event only for a source-dated material change that alters reader
understanding of a stored Program or Study: development or operational status,
stage, regulatory milestone, material human/preclinical data, product interval
or formulation, partnership, or continuation/hold. Discovery date, initial
classification, source reverification, and unchanged facts are not Events.
When a newly stored Program has a directly supported material milestone, use
the milestone date rather than inventing a discovery Event. Do not duplicate an
existing Event.

### Append-only Events

Treat Event as an append-only material-change record, per the Data Contract.
Record a new material change as a new Event file. Never rewrite an existing
Event's `headline` or `summary` to match the Program's current state, and
never let a later-stage Event replace or shorten an earlier result Event. Edit
an existing Event only to fix a typo, a broken link, an error against its own
direct source, or to add previously missing source-supported context, and
report the Event slug and reason in the run report. Delete an existing Event
only when direct evidence shows a duplicate, an error, or a non-event, and
report the slug and reason. A validator cannot fully enforce append-only
behavior against prior Git history; this workflow and the PR completion gate
are the enforcement point, so every Event edit or deletion must be reported.

### Historical no-loss before overwriting current-state fields

Before overwriting a Program's or linked Study's current-state field
(`developmentStage`, `developmentStatus`, `readout`, `productTarget`,
`differentiator`, `caveat`, Study `phase`, or Study recruitment/operational
status), compare the old and
new values. If the old value carried a material historical fact — a prior
clinical or nonclinical result, a prior stage or operational status, a prior
product target or dosing interval, a regulatory milestone, a
partnership/license/hold/discontinuation/restart, or an interpretation limit
that was material at the time — confirm it is already preserved in an Event
before overwriting. If no sufficient Event exists, create a source-dated Event
or extend an existing under-specified Event within its own direct sources
first; never backfill an unsupported historical fact from memory or inference.
A result Event's `summary` must retain enough of the study/stage, disclosure
timing, evaluated subject and design context, key efficacy/PK/PD/safety
findings, comparator/baseline, key figures and timepoints, and interpretation
limits that the result's contemporaneous meaning survives after the Program's
current fields move on. A later stage-entry Event never replaces or
generalizes an earlier result Event; both remain as separate records.

## 9. Common completion gate and validation

Any track is GO only when its track gate passes and:

1. all edits follow the Data Contract and Source and Entry Policy;
2. material changes have Events and pure reverification does not;
3. no unsupported change, silent candidate drop, or unrecorded crossover
   remains;
4. strict schema, cross-record validation, workflow regression tests, Astro
   checks, build, and diff checks pass;
5. no Program or Study current-state overwrite dropped a material historical
   fact that is not preserved in an Event, no later-stage Event replaced or
   shortened an earlier result Event, and every Event edit or deletion is
   reported with its slug and reason (historical no-loss gate).

A source blocker is NO-GO only when it prevents a required decision or the
requested update. If the supported state can be preserved and the blocker is
recorded with a re-entry condition, the run may still be GO. Any failed track
gate, undispositioned discovery candidate, unresolved duplicate identity,
unrepresentable required fact, or failed validation is NO-GO.

```bash
npm run data:validate
npm run data:test
npm run data:staleness
npm run check
npm run build
git diff --check
```

Staleness is advisory. Validation cannot replace source review.

## 10. Full landscape combination

A full-landscape refresh-and-discovery operation is a run plan, not a fourth
research track:

1. run `program refresh` across the full starting roster and all active
   Program-linked source handovers;
2. freeze the refreshed roster and aliases as the discovery collision baseline;
3. run full-scope `program discovery`, including its independent coverage pass
   and all recorded candidate deferrals;
4. resolve discovery facts about stored Programs through bounded refresh
   crossover or explicit handoff;
5. run the common validation once over the combined diff and report GO only
   when both included track gates pass.

This order reduces duplicate discovery and prevents stale aliases from creating
new Program identities. A newly `STORED` candidate completes the discovery gate
and does not require a redundant full refresh in the same run.

Event scan and patent audit are not implied by this combination. Add them as
explicit additional tracks when media monitoring or patent coverage is in scope,
using the refreshed roster as its audit baseline and routing its findings through
section 6.

## 11. Report

Report the primary track and boundary; traversed and changed Programs/Studies;
event scan window and surfaced events when applicable;
discovery dispositions and undispositioned count when applicable; independent
coverage status when applicable; patent audit baseline, outcomes, family count,
and unaudited count when applicable; crossover handoffs; material Events;
deferred and source-blocked claims; validation results; and final GO/NO-GO.
When nothing changed, do not edit canonical data solely to create a commit.
Patent-audit runs may still require a baseline commit manifest when commit/push
is the explicitly selected durable run surface.
