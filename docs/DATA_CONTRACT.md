---
role: data-contract
status: active
authority: authoritative
update-boundary: Update when identity, field meaning, registry semantics, Study/Event links, or editable/generated boundaries change.
---

# Data Contract

The tracker stores the current semaglutide sustained-release/depot injectable
landscape and a concise material-change log. It is not limited to monthly-or-
longer dosing and is not an exhaustive clinical-outcome database.

## Scope and record classes

Include a named semaglutide sustained-release/depot injectable Program or a
semaglutide-specific technology-watch item when authoritative evidence supports
an active sponsor program, regulatory or human activity, nonclinical depot
evidence, or a materially relevant academic/platform technology.

Every Program declares `payload: "semaglutide"` and one `recordType`:

- `sponsor-program` — a sponsor-owned development Program, including a directly
  supported paused Program;
- `technology-watch` — academic or platform evidence that informs the landscape
  without establishing a sponsor Program.

Generic copies, unrelated GLP-1 products, unsupported rumors, and platform claims
without semaglutide-specific evidence remain excluded.

## Identity and storage

- A filename under `src/data/programs/` is the stable `programSlug` and URL key.
- A filename under `src/data/studies/` is the stable `studySlug`.
- Display-name changes never change either slug.
- Dose cohorts, trial arms, populations, or planned intervals do not create
  separate Programs or Studies.
- Editable canonical data comprises Programs, Studies, Events, and registries
  under `src/data/`. Generated pages and API files under `dist/` are never edited.

## Program

Each `src/data/programs/*.json` stores one Program or technology-watch item.

- `company`, `programName`: canonical display names.
- `payload`: explicit payload; currently only `semaglutide`.
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
- Product-target buckets use only `productTarget`; demonstrated or platform
  duration never promotes a Program into a product-target bucket.

## Study

Each strict `src/data/studies/*.json` contains:

- `programSlug`: required Program foreign key;
- `registryId`: direct NCT identifier;
- `phase`: exact registry display text, not derived from Program stage;
- `recruitmentStatus`: normalized operational enum;
- `registryStatusRaw`: exact registry wording;
- `countries`: canonical English country-name array;
- `registrySource`: the single registry source supporting phase, recruitment
  status, raw registry status, and countries;
- `lastVerifiedAt`: the date this Study was actually rechecked.

Program stage and Study phase/status are independent. Arm, Endpoint, Outcome,
and normalized phase models are intentionally absent.

## Event

Each `src/data/events/*.json` records one material state change.

- `programSlug` is always required.
- `studySlug` is optional and used only when the Event identifies one Study.
- `company` and `programName` preserve reader-facing context.
- category, significance, date, headline, and source retain their prior meanings.

## Export boundary

- `/api/programs.csv`: one Program per row with classification and all interval
  text/numeric fields.
- `/api/studies.csv`: one Study per row linked by `programSlug`, including its
  registry source and verification date.
- `/api/snapshot.json`: `asOf`, `deliveryTechnologies`, `programs`, `studies`,
  and `events`.
- No legacy `asset`, `modalityGroup`, `targetInterval`, or embedded Study alias
  is emitted.
