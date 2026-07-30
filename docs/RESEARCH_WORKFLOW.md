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
   delivery-technology registry, and schema before research.
3. Declare one primary track and its bounded scope:
   - `program refresh`: one or more named, already stored Programs, or the full
     stored Program roster;
   - `program discovery`: candidates not currently stored, within a declared
     company, technology, evidence source, time window, or full-landscape scope;
   - `patent coverage audit`: one or more named, already stored Programs, or the
     full stored Program roster.
4. Record the starting Program roster. In refresh/discovery work, existing
   records route to refresh and absent candidates route to discovery. Patent
   audit remains stored-roster work and hands absent candidates to discovery.
5. Confirm that the direct sources required by the selected track are reachable
   or can be handled without an unsupported change.
6. Work on a branch and draft PR; never write directly to `main`.

`named-program refresh` is retained only as a plain-language description of a
single-Program `program refresh`; it is no longer a separate run mode.
`full landscape refresh` is retired as an atomic mode and replaced by the
combined run in section 9.

## 2. Track A: program refresh

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
5. every crossover finding was resolved under section 5;
6. Event and common validation gates pass.

## 3. Track B: program discovery

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

### Discovery completion gate

A discovery run is GO only when:

1. the declared boundary and required evidence surfaces were searched;
2. the independent coverage pass is complete;
3. every surfaced absent candidate is `STORED`, `EXCLUDED`, or `DEFERRED`, with
   zero undispositioned candidates;
4. every stored candidate has direct support for scope, identity, payload,
   record type, and delivery technology, and is not a duplicate;
5. every deferred candidate has missing evidence and a re-entry condition;
6. every crossover finding was resolved under section 5;
7. Event and common validation gates pass.

## 4. Track C: patent coverage audit

### Purpose and entry

Use `patent coverage audit` to assess patent-source coverage for a declared set
of already stored Programs. It is neither a general current-state refresh nor
a patent-bounded discovery run. Entry is one or more stable Program slugs or
the explicit full stored roster. The initial landscape-wide audit uses the full
stored roster; later audits may use the delta scope defined in
`docs/PATENT_AUDIT.md`.

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

Patent audit never creates a Company page. For an existing Company, it may
create or update only directly supported Platform relationships and
representative platform-level patent evidence. Those updates surface through
the existing Company page and remain separate from `Program.sources` and the
`PATENT-LINKED PROGRAMS` KPI. A patent finding naming an absent or unresolved
company identity remains a handoff until Program research establishes the
Company record.

An absent candidate encountered in patent searching is always a
`DISCOVERY_HANDOFF` unless the run explicitly adds a bounded `program
discovery` track. Patent evidence alone does not create a Program or assign a
discovery disposition.

### Patent audit completion gate

A patent audit is GO only when:

1. every Program in the declared audit roster has one reported audit outcome,
   with zero unaudited Programs;
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
   under section 5;
7. the patent-specific and common validation gates pass.

## 5. Bounded crossover and handoff

Never ignore a material fact merely because it belongs to another track.
Keep crossover bounded:

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
- A handoff is not a source-access handover. Create
  `docs/source-access-handover/<programSlug>.md` only when source access leaves a
  material claim unresolved for a stable stored or newly stored Program under
  that template. An absent candidate without a stable Program identity remains
  a `DEFERRED` discovery disposition in the run report.
- List every handoff and bounded crossover in the run report. An unrecorded
  material crossover is NO-GO; a recorded handoff may remain for a later run
  when it is outside the authorized scope.

## 6. Apply the contract

- Reuse stable Program and Study slugs.
- Declare ordered `payloadComponents`, `recordType`, and a registered
  delivery-technology ID.
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

## 7. Protect existing records

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

## 8. Common completion gate and validation

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

## 9. Full landscape combination

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

Patent audit is not implied by this combination. Add it as an explicit third
track when patent coverage is in scope, using the refreshed roster as its audit
baseline and routing its findings through section 5.

## 10. Report

Report the primary track and boundary; traversed and changed Programs/Studies;
discovery dispositions and undispositioned count when applicable; independent
coverage status when applicable; patent audit baseline, outcomes, family count,
and unaudited count when applicable; crossover handoffs; material Events;
deferred and source-blocked claims; validation results; and final GO/NO-GO.
When nothing changed, do not edit data solely to create a commit.
