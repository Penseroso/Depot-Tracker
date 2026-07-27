---
role: source-and-entry-policy
status: active
authority: authoritative
update-boundary: Update when source authority, classification, interval, Program stage, Study status, date, conflict, or provenance semantics change.
---

# Source and Entry Policy

Use the source that most directly and authoritatively supports each field.
Recency matters only after relevance and authority.

## Program intent, class, and status

Prefer current sponsor pipeline pages, filings, investor/R&D materials, and
official releases for sponsor intent, `recordType`, Program stage, activity, and
development status. Academic evidence alone supports `technology-watch`, not a
sponsor Program. Omission alone never proves inactivity.

## Study facts

Use the applicable public registry for `registryId`, `phase`,
`recruitmentStatus`, `registryStatusRaw`, and `countries`, and store that
registry as the Study's single `registrySource`.

- Preserve exact registry phase and status text.
- Normalize recruitment status without discarding `registryStatusRaw`.
- Store canonical English Study-country names.
- Do not derive Study country from Program regional context.
- A planned phase or sponsor announcement does not override current registry
  operation.

## Delivery technology

Prefer sponsor scientific/platform material, conference evidence, and
peer-reviewed publications. Store the source-near formulation description in
`deliveryTechnology`, then author the closest registered
`deliveryTechnologyId`. Use `other` only when direct evidence is insufficient
for a more specific registered category; never infer from a product name alone.

## Interval claims

Keep these authorities and meanings separate:

- `productTarget`: sponsor or registered product intent;
- `demonstratedDuration`: directly observed exposure/release duration;
- `platformPotential`: broader platform, patent, or design potential.

Patents may support platform potential but do not establish product target or
active development. Preserve the supported free text and add numeric bounds
using the Data Contract conversion table. Q4W/Q8W/Q12W must remain distinct from
calendar month/quarter expressions.

## Human evidence and milestones

Human PK/safety disclosure may support `Human PK pilot` without an IND or
registered Study. Keep IND submitted, clearance, first patient dosed, Program
stage, and Study recruitment as separate facts.

For results, prefer peer-reviewed publications, registry results, official
scientific presentations, conference abstracts, then official topline releases.
Store only directly reported claims; do not calculate or transcribe unreported
values.

## Discovery, source access, and conflict

Search results and secondary reporting may discover candidates but do not
confirm canonical fields. Source-access run terms remain:

- `FULL_SOURCE_REVIEWED`
- `PARTIAL_SOURCE_REVIEWED`
- `SOURCE_IDENTIFIED_NOT_ACCESSED`
- `SOURCE_NOT_LOCATED`

These terms are not Study fields; raw registry operation belongs in
`registryStatusRaw`.

Do not invent conflict resolutions, delete a stronger confirmed value because a
new source omits it, or classify a Program inactive without direct evidence.
Use caveats, defer the update, or create a source-access handover when required.

## Dates

- `latestUpdateDate` changes only for a material stored fact or Event.
- `lastVerifiedAt` changes only when that Program or Study is actually rechecked.
- `sources[].accessedOn` changes only when that source is reopened.
- `registrySource.accessedOn` changes only when the Study registry source is
  reopened.
- Study operational changes require a material Event when they change the
  reader's understanding.
