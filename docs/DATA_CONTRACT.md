---
role: data-contract
status: active
authority: authoritative
update-boundary: Update when identity, field meaning, registry semantics, Study/Event links, or editable/generated boundaries change.
---

# Data Contract

The tracker stores obesity/overweight sustained-release, extended-release,
long-acting, and depot injection/implant Programs and a concise material-change
log. It is not limited to monthly-or-longer dosing and is not an exhaustive
clinical-outcome database. The structure supports the full Obesity Depot scope;
the currently stored dataset remains centered on the previously tracked
semaglutide Programs and does not represent a completed full-scope refresh.

## Scope and record classes

Include a named Program or technology-watch item when authoritative evidence
directly supports an obesity or overweight treatment purpose and an explicitly
sustained-release, extended-release, long-acting, or depot injection/implant
form. Weekly Programs qualify only when that depot or sustained-release property
is explicit. Single-agent and combination Programs, sponsor Programs and
technology watches, and preclinical, clinical, regulatory, and paused states are
representable.

Every Program declares an ordered, non-empty `payloadComponents` array and one
`recordType`:

- `sponsor-program` — a sponsor-owned development Program, including a directly
  supported paused Program;
- `technology-watch` — academic or platform evidence that informs the landscape
  without establishing a sponsor Program.

Ordinary weekly aqueous injections, conventional formulations without depot or
sustained-release properties, diabetes-only candidates without confirmed
obesity/overweight intent, generic platforms without direct evidence for a
specific obesity-treatment payload, and oral, nasal, patch, or other
non-injection/non-implant DDS remain excluded.

## Identity and storage

- A filename under `src/data/programs/` is the stable `programSlug` and URL key.
- A filename under `src/data/studies/` is the stable `studySlug`.
- Display-name changes never change either slug.
- Dose cohorts, trial arms, populations, or planned intervals do not create
  separate Programs or Studies.
- Programs are separated by payload combination. Different payloads on the same
  sponsor platform are separate Programs, and single-agent and combination
  Programs are separate.
- Programs remain separate when the same components are used in officially
  distinct development Programs.
- `payloadComponents` order is display order. Do not reorder components merely
  to alter identity or alphabetize them mechanically.
- Existing stable Program slugs remain unchanged by the payload migration.
- Editable canonical data comprises Programs, Studies, Events, and registries
  under `src/data/`. Generated pages and API files under `dist/` are never edited.

For example, semaglutide depot, cagrilintide depot, and cagrilintide +
semaglutide depot are three separate Programs even when a sponsor uses the same
delivery platform.

## Program

Each `src/data/programs/*.json` stores one Program or technology-watch item.

- `company`, `programName`: canonical display names.
- `payloadComponents`: one or more canonical lower-case ingredient identifiers.
  Prefer INN/generic names; if none exists, a public sponsor compound name/code
  is allowed. Exclude brands, formulation, salt, route, and dose. Components
  must be unique, must not contain `+`, and preserve official display order.
- Legacy `payload` is rejected.
- `recordType`: sponsor Program versus technology watch.
- `deliveryTechnologyId`: foreign key to the delivery-technology registry.
- `deliveryTechnology`: source-near free-text formulation description.
- `productTarget`, `demonstratedDuration`, `platformPotential`: separate interval
  claims; none may substitute for another.
- `developmentStage`: overall Program maturity.
- `developmentStatus`: Program-level development status, not Study recruitment.
- `active`, `stageRank`, update dates, interpretation fields, confidence, and
  sources retain their existing meanings.

`human/regulatory` counts Programs whose `developmentStage` is one of
`Registered Phase I/IIa`, `Registered Phase I`, `IND submitted`, or
`Human PK pilot`. It is independent of Study count.

## Delivery-technology registry

`src/data/registries/delivery-technologies.json` is the single authority for
classification, UI labels, and order. Each strict record contains:

```json
{
  "id": "injectable-hydrogel",
  "label": "Injectable hydrogel",
  "shortLabel": "Hydrogel",
  "sortRank": 30
}
```

Registered IDs are `polymer-microparticle`, `in-situ-forming-depot`,
`injectable-hydrogel`, `implant`, `polymer-conjugate`,
`crystal-or-suspension`, and `other`. Consumers must not maintain a parallel
label or ordering table.

## Interval claims

An interval claim is either `null` or a strict object:

```json
{
  "description": "6주 이상",
  "minDays": 42,
  "maxDays": null
}
```

- A `null` claim means the claim is absent or not public.
- A null bound means an open range; both numeric bounds must be positive integers
  and `minDays <= maxDays`.
- Free text is authoritative for display; numeric bounds support filtering only.
- Q4W=28–28, monthly=28–31, Q8W=56–56, two months=56–62,
  Q12W=84–84, three months/quarterly=84–92, four months=112–123,
  and six months=168–184 days.
- Product-target buckets use only the numeric bounds in `productTarget`;
  demonstrated or platform duration never promotes a Program into a
  product-target bucket. A target spanning multiple UI buckets is counted in
  each overlapping bucket. Induction or loading schedules in descriptive text
  do not create buckets; only the encoded maintenance or final product target
  bounds are classified.

## Study

Each strict `src/data/studies/*.json` contains:

- `programSlug`: required Program foreign key;
- `registry`: canonical display name of the official registry;
- `registryId`: source-native identifier assigned by that registry;
- `phase`: exact registry display text, not derived from Program stage;
- `recruitmentStatus`: normalized operational enum;
- `registryStatusRaw`: exact registry wording;
- `countries`: canonical English country-name array; it may be empty when no
  country value exists in the already stored direct registry evidence;
- `registrySource`: the single registry source supporting phase, recruitment
  status, raw registry status, and countries;
- `lastVerifiedAt`: the date this Study was actually rechecked.

Program stage and Study phase/status are independent. Arm, Endpoint, Outcome,
and normalized phase models are intentionally absent.

Study registry identity and duplicate validation use the `registry + registryId`
pair. `registryId` is not globally unique across different registries. Existing
NCT Study slugs remain stable; new non-NCT Studies use a stable registry-prefixed
slug such as `ctis-2024-518040-21-00`. Each Study represents one official
registry record. Cross-registry protocol merging is intentionally deferred as
documented in `docs/EDGE_CASES.md`.

`registry` uses canonical display-name syntax rather than a permanent Zod enum.
The validator maintains the current official name-to-host provenance mapping;
supporting another official registry extends that mapping without redesigning
Study identity.

## Event

Each `src/data/events/*.json` records one material state change.

- `programSlug` is always required.
- `studySlug` is optional and used only when the Event identifies one Study.
- `company` and `programName` preserve reader-facing context.
- category, significance, date, headline, and source retain their prior meanings.

## Export boundary

- `/api/programs.csv`: one Program per row with `payloadComponents` joined using
  ` + ` in stored canonical lower-case order, classification, and all interval
  text/numeric fields.
- `/api/studies.csv`: one Study per row linked by `programSlug`, including its
  `registry`, source-native `registryId`, registry source, and verification date.
- `/api/snapshot.json`: `asOf`, `deliveryTechnologies`, `programs`, `studies`,
  and `events`.
- No legacy `payload`, `asset`, `modalityGroup`, `targetInterval`, or embedded
  Study alias is emitted.
