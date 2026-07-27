---
role: research-workflow
status: active
authority: authoritative
update-boundary: Update only when research execution, completion gates, validation, or reporting requirements change.
---

# Research Workflow

## 1. Establish the run

1. Read `AGENTS.md` and the required authorities.
2. Inspect Program, Study, Event, registry, and schema data before research.
3. Select one run mode:
   - `named-program refresh` for one identified Program and its bounded evidence
     surface;
   - `full landscape refresh` for a landscape-wide refresh or initial landscape
     investigation.
4. Treat an absent Program surfaced during a full landscape run as investigation
   and an existing Program as refresh.
5. Confirm that required direct sources are reachable before editing.
6. Work on a branch and draft PR; never write directly to `main`.

## 2. Discover and classify

For a `named-program refresh`, reconcile the target Program, its linked Studies,
relevant aliases, sponsor sources, registry/regulatory sources, and candidates
surfaced within that bounded search.

For a `full landscape refresh`, search company and Program names/codes,
semaglutide depot/sustained-release technologies of every interval, registries,
regulators, literature, congresses, patents, and partners as relevant. The scope
is not limited to monthly-or-longer products. Complete an independent coverage
pass and recheck prior deferred cases.

Every candidate ends as `STORED`, `EXCLUDED`, or `DEFERRED`. Nothing surfaced is
silently dropped, and lack of evidence is not a catch-all exclusion.

## 3. Apply the contract

- Reuse stable Program and Study slugs.
- Declare `payload`, `recordType`, and a registered delivery-technology ID.
- Preserve free-text delivery technology alongside its controlled ID.
- Separate product target, demonstrated duration, and platform potential.
- Apply calendar and QnW conversions exactly as defined in the Data Contract.
- Keep Program stage/status separate from Study phase/recruitment.
- Add `studySlug` to an Event only when the Event identifies that Study.
- Use `DEFERRED_SCHEMA_CASE` when directly supported evidence is not representable.

## 4. Protect existing records

Do not replace stronger evidence with weaker reporting, guess an identity,
classification, interval, stage, phase, country, or status, or mechanically
refresh dates. Recheck deferred/source-blocked cases within the selected run
scope; a full landscape refresh includes all prior deferred cases.

## 5. Completion gate

A run is GO only when the common gate passes:

1. sponsor status and applicable registry/regulatory records are reconciled;
2. the aliases and evidence surfaces required by the selected run mode were
   searched;
3. every surfaced candidate has a disposition and the undispositioned candidate
   count is zero;
4. every changed classification, interval, stage, or Study fact has direct support;
5. material changes have Events and pure reverification does not;
6. strict schema, cross-record validation, validator regression tests, Astro
   checks, build, and diff checks pass.

A `full landscape refresh` is GO only when the common gate passes and:

1. all relevant delivery technologies and intervals were searched;
2. an independent second discovery pass is complete;
3. prior deferred cases were rechecked.

## 6. Validate

```bash
npm run data:validate
npm run data:test
npm run data:staleness
npm run check
npm run build
git diff --check
```

Staleness is advisory. Validation cannot replace source review.

## 7. Report

Report investigation/refresh mode, traversed and changed Programs/Studies,
candidate dispositions, undispositioned count, material Events, source blockers,
validation results, and final GO/NO-GO. When nothing changed, do not edit data
solely to create a commit.
