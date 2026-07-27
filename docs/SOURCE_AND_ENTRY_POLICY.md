---
role: source-and-entry-policy
status: active
authority: authoritative
update-boundary: Update when source authority, stage/status entry, date, conflict, or provenance semantics change.
---

# Source and Entry Policy

There is no single global source hierarchy. Use the source that most directly
and authoritatively supports the specific field or claim. Recency matters only
after relevance and authority.

## Field-specific source policy

### Current sponsor intent and program status

Prefer current company pipeline pages, investor/R&D presentations, regulatory
filings, earnings materials, and official company releases.

### Preclinical and IND-enabling stage

Direct company pipeline, scientific presentation, conference disclosure, or
peer-reviewed nonclinical evidence may support these stages. A trial registry is
not required before clinical entry.

### Registered Phase I–III and trial operational status

Prefer the applicable public trial registry, supplemented by official
trial-initiation or first-patient-dosed announcements. A planned future phase or
recruitment announcement does not override a registry that still reports `Not
yet recruiting`; preserve the difference in `regulatoryStatus` and `caveat`.

A registry record can establish a trial's phase/status but does not by itself
prove that every dose, cohort, or study configuration is a separate program.

### Regulatory milestones

Treat `IND submitted`, `IND cleared/approved`, and first patient dosed as
separate facts. Do not promote `IND submitted` to Phase I without separate
evidence that clinical activity has begun or is officially current.

Prefer regulator records or official sponsor disclosures that directly identify
the filing, jurisdiction, authority, and date.

### Formulation, platform, and target interval

Prefer company scientific/platform materials, conference presentations, and
peer-reviewed publications. Patents are supporting evidence only:

- a patent does not prove active development;
- a patent's broad interval range does not establish the current product target;
- platform potential must remain separate from demonstrated product performance.

### Human PK, safety, and clinical results

Default result-source priority:

1. peer-reviewed publication;
2. registry-posted results;
3. official scientific presentation or poster;
4. conference abstract;
5. official company topline release.

Direct support for the exact reported value overrides this default order. Store
only directly reported claims. Do not calculate, visually transcribe, infer,
redistribute, or broaden results beyond the supported population, timepoint,
analysis unit, or comparison.

A human PK/safety disclosure may support `Human PK pilot`; it does not establish
registered clinical or IND status unless a separate authoritative source does.

### Partnerships and rights

Prefer regulatory filings and official announcements from the participating
companies. Secondary reporting may aid discovery but must not override a primary
transaction source.

## Discovery versus confirmation

- Search results, industry news, databases, and secondary articles may discover
  candidates.
- Core fields must be confirmed using claim-appropriate direct sources.
- A search-result snippet is never a reviewed source.
- A search that returns nothing is not proof of non-disclosure.
- A source that cannot be reached is not proof that a program or result does not
  exist.

## Source access and fallback

For a material claim, distinguish:

- `FULL_SOURCE_REVIEWED` — required scope opened and read;
- `PARTIAL_SOURCE_REVIEWED` — only part of the required scope reviewed;
- `SOURCE_IDENTIFIED_NOT_ACCESSED` — source known but blocked;
- `SOURCE_NOT_LOCATED` — no candidate source located at that tier.

These are run/report terms, not operating-data fields. Persist a handover only
when a blocked source leaves a material claim unresolved.

A lower-priority source may stand in for a blocked source only for the exact
claim it directly supports. For result claims, equivalence must match endpoint,
timepoint, analysis unit/comparison, population, and estimand. Otherwise retain
only the independently supported claim and leave the remainder unresolved.

## Conflict handling

- Prefer direct claim support over broad source prestige.
- Prefer stronger evidence over weaker paraphrase.
- Retain useful conflicting sources.
- Do not invent a resolution.
- Do not delete a confirmed value because a newer source merely omits it.
- Do not classify a program as discontinued, paused, or inactive without direct
  evidence for that program's own formulation/scope.
- Use `caveat`, defer the update, or record a handover when authority and recency
  cannot resolve the conflict.

## Date and metadata effects

- Change `latestUpdateDate` only when a material stored fact changes or a new
  material event is added.
- Change `lastVerifiedAt` only when the record is actually rechecked.
- Change a source's `accessedOn` only when that source is reopened in the run.
- Do not refresh dates mechanically across records that were not reviewed.
