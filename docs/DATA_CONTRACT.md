---
role: data-contract
status: active
authority: authoritative
update-boundary: Update when identity, field meaning, event semantics, or editable/generated boundaries change.
---

# Data Contract

The tracker stores the current competitive state and a concise material-change
log. It is not a document archive, exhaustive clinical-evidence database, or
news feed.

## Scope

Include a named semaglutide sustained-release injectable program or a directly
relevant technology-watch item when official or authoritative evidence supports
at least one of the following:

- an active sponsor development program;
- regulatory or registered clinical activity;
- human PK/safety disclosure that is clearly attributable to the formulation;
- a nonclinical depot platform with semaglutide-specific evidence;
- an academic technology that materially informs non-microsphere feasibility.

Generic copies, unsupported rumors, unrelated GLP-1 products, and platform
claims without semaglutide-specific evidence are excluded. Patent-only concepts
may be retained only as supporting context for an independently confirmed
program, not as proof of active development.

## Stable identity and mutable state

- The filename under `src/data/assets/` is the stable `programSlug` and URL key.
- A rename changes displayed company/asset text, not the stable slug.
- Stage, regulatory status, activity, confidence, update text, and dates are
  mutable state and never define identity.
- A materially distinct sponsor-tracked formulation or route may justify a new
  program record. A dose cohort, trial arm, enrolled population, or planned
  interval alone does not.
- Academic technology-watch items remain separate from company pipeline items.

## Program record

Each `src/data/assets/*.json` represents one tracked program or technology-watch
item.

Key fields:

- `company`, `asset`: current canonical display names.
- `modality`, `modalityGroup`: formulation description and broad comparison
  group (`microsphere` or `other depot`).
- `targetInterval`: the currently supported product target. Platform or patent
  potential must be qualified in `differentiator` or `caveat`.
- `evidenceStage`: maturity of public evidence, not an inferred development
  ambition.
- `regulatoryStatus`: current registry/regulatory operational state in plain
  language.
- `registryId`: direct trial identifier where applicable; otherwise `null`.
- `latestUpdateDate`: date of the latest material event represented in the
  current record.
- `lastVerifiedAt`: date on which the current record was actually rechecked.
- `latestUpdate`: concise current-state delta or last material development.
- `readout`: decision-relevant current interpretation.
- `differentiator`: formulation/platform distinction.
- `caveat`: required limit against over-interpretation.
- `confidence`: confidence in the stored current interpretation, not a score of
  scientific quality.
- `active`: current tracker status. Omission from a new pipeline deck alone is
  not enough to set `false`.
- `stageRank`: presentation-only sorting metadata. It is not a scientific or
  regulatory claim and must not substitute for `evidenceStage`.
- `sources`: directly reviewed sources with URL, source class, and access date.

`latestUpdateDate` and `lastVerifiedAt` are intentionally different. A record
may be reverified today with no new event; in that case only `lastVerifiedAt`
and the reopened sources' `accessedOn` change.

## Event record

Each `src/data/events/*.json` records one material state change, not one article.

- `programSlug` links the event to stable program identity.
- `date` is the event or disclosure date supported by the cited source.
- `company` and `asset` preserve reader-facing context at the time of entry.
- `category`: `Clinical`, `Regulatory`, `Data`, `Partnership`, `Platform`, or
  `Status`.
- `headline` states what changed.
- `significance` is editorial prioritization.
- `source` is the direct source for that event.

Create an event when a change would alter a reader's understanding of stage,
operational state, formulation, interval, human evidence, partnership, or
continuation. Routine reverification without semantic change does not create an
event.

## Source records

A source record proves only the claims it directly supports. Co-location in a
program's `sources` array is not proof for every field in that program. Source
authority is field-specific under
[`SOURCE_AND_ENTRY_POLICY.md`](SOURCE_AND_ENTRY_POLICY.md).

## Editable and generated boundaries

- Editable: `src/data/assets/*.json`, `src/data/events/*.json`.
- Generated: `dist/`, static pages, `/api/programs.csv`, `/api/snapshot.json`.
- Never hand-edit `dist/` or treat a generated endpoint as independent evidence.
