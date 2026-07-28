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

Store payloads as ordered `payloadComponents`. Prefer an INN or generic name;
when none exists, use the public sponsor compound name/code. Store canonical
lower-case component identifiers without brands, formulation, salt, route, or
dose. Preserve the sponsor's component order and keep single-agent and
combination Programs separate.

## Study facts

Use the applicable official registry for `registry`, `registryId`, `phase`,
`recruitmentStatus`, `registryStatusRaw`, and `countries`, and store that
registry as the Study's single `registrySource`.

- Preserve the registry's canonical display name and source-native ID.
- Treat `registry + registryId` as the registry identity.
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

Program stores exactly one interval claim, `productTarget`: sponsor or
registered product intent for this specific payload/Program. Preserve the
supported free text and add numeric bounds using the Data Contract conversion
table. Q4W/Q8W/Q12W must remain distinct from calendar month/quarter
expressions.

A directly observed exposure/release duration (human PK, nonclinical release,
or efficacy/exposure through a given timepoint) or a broader platform, patent,
or design potential is never stored as its own interval field. Record it in
`readout` (a demonstrated result relevant to the current evidence snapshot),
in the `summary` of the Event that reported it, or in `caveat`/`differentiator`
(a platform-level or unconfirmed claim), keeping the finding, its evidence
level, and its timepoint attached to the prose so the distinction from the
current product target survives. Patents may support a platform-level
duration claim but do not establish `productTarget` or active development for
a specific payload; never present a platform generalization as if it were
directly demonstrated for the current payload/Program.

## Program and Event prose style

This style applies to Program `readout` ("Evidence summary"), `differentiator`
("Formulation rationale"), `caveat` ("Interpretation limits"), and Event
`headline`/`summary` (Latest development and Development timeline) — every
field the Program detail page renders as running prose. These read as a quick
status scan, not a defensive essay.

- Write short state-form phrases (개조식), not full narrative sentences.
  Do not force every phrase to end in the same mechanical form (e.g. all
  `~함`) — vary the ending naturally (확인됨, 미확인, 공개 전, 보류, 아님,
  예정, 등) the way a status line would read.
- Keep every material fact the field currently carries; shorten the wording,
  not the substance. Advisory meta-commentary ("do not assume X", "should be
  tracked with priority Y") may be compressed into the underlying state fact
  it implies, since the compact phrasing itself communicates that the fact is
  unconfirmed rather than asserted.
- Never use a middle dot (`·`) to join or separate items — see the UI
  notation rule in `docs/MVP_SCOPE.md`. Use a comma for enumeration, "또는"
  for alternatives, "및" for parallel concepts.
- `ClauseText` (`src/components/ClauseText.astro`, backed by
  `splitClauses` in `src/lib/format.ts`) renders these fields on the
  Program detail page: it splits the text on sentence-ending punctuation
  (`.`/`?`/`!`) followed by whitespace, renders it as a bulleted list when
  that produces two or more clauses, and as a single plain sentence when it
  does not. Write each distinct fact as its own sentence so it lands as its
  own bullet; do not artificially split a field that is genuinely one fact
  into multiple sentences just to force a bullet, and do not run multiple
  distinct facts into one sentence to avoid one.

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

- Program has no `latestUpdateDate`. A Program's most recent material change
  date is always the `date` of its most recent linked Event, never a
  separately stored Program field.
- `lastVerifiedAt` changes only when that Program or Study is actually
  rechecked; it must never be presented as a change date.
- `sources[].accessedOn` changes only when that source is reopened.
- `registrySource.accessedOn` changes only when the Study registry source is
  reopened.
- An Event's `date` is the date the material change happened or was
  disclosed, not the date it was entered into the tracker.
- Study operational changes require a material Event when they change the
  reader's understanding. A reverification that finds no change updates only
  `lastVerifiedAt`/`accessedOn` and creates no Event.
