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

Exclude RNA-based candidates when the sustained effect arises from RNA
silencing or target turnover and no explicit depot, sustained-release
formulation, implant, or long-acting delivery technology is directly coupled
to the product design. A long dosing interval alone does not qualify. A
conjugate, lipidation, implant, microsphere, in-situ depot, or other directly
supported long-acting delivery or half-life-extension technology remains in
scope when it is part of the product design rather than only a consequence of
the pharmacodynamic mechanism.

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
- Editable canonical data comprises Programs, Studies, Events, registries, and
  low-frequency Company/Platform references under `src/data/`. Generated pages
  and API files under `dist/` are never edited.

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
- `productTarget`: the sponsor or registered product's target dosing interval,
  a strict interval claim (see `## Interval claims`). Program stores only this
  one interval claim; it does not store a separate demonstrated-duration or
  platform-potential interval. A directly observed exposure/release duration
  or a broader platform/patent potential that is not the Program's current
  product target belongs in prose (`readout`, `differentiator`, `caveat`, or a
  supporting Event), not in a stored interval field, and must not be presented
  as if it were the confirmed product target.
- `developmentStage`: canonical overall Program maturity across the full
  lifecycle. Allowed values are `Discovery`, `Preclinical`, `IND-enabling`,
  `IND submitted`, `IND cleared`, `Human PK pilot`, `Registered Phase I`,
  `Registered Phase I/II`, `Registered Phase I/IIa`, `Registered Phase II`,
  `Registered Phase II/III`, `Registered Phase III`, `Regulatory review`,
  `Approved`, `Registered Phase IV`, `Paused`, and `Discontinued`.
  `Registered Phase ...` requires a linked official Study at that phase.
  `Regulatory review` means a marketing application has been submitted and is
  under review; `Approved` means a regulator has granted marketing
  authorization. `Paused` and `Discontinued` are terminal operational
  classifications retained in this field for compatibility, while
  `developmentStatus` preserves the source-near detail.
- `developmentStatus`: Program-level development status, not Study recruitment.
- `active`, `stageRank`, interpretation fields, confidence, and sources retain
  their existing meanings.
- `lastVerifiedAt`: the date this Program was actually rechecked, not the date
  of its most recent material change.

Program is a current-state snapshot. It does not store a narrative `latestUpdate`
or a `latestUpdateDate`; legacy `latestUpdate`/`latestUpdateDate` fields are
rejected. A Program's most recent material change is always derived from its
most recent linked Event (see `## Event` below), never stored redundantly on
the Program itself. A Program consumer must treat `lastVerifiedAt` and the
latest linked Event date as distinct facts and must not present one as the
other.

The Overview page's three KPIs are derived aggregates, not stored fields, and
every consumer must compute them through the shared helpers in
`src/lib/program-stats.js` rather than reimplementing the rule:

- `PROGRAMS`: the total Program count, with the count of Programs whose
  `active` is `true` as a secondary figure.
- `TRIAL REGISTRATIONS`: the total Study record count across every supported
  registry (currently ClinicalTrials.gov and CTIS). This is a registration
  count, not a deduplicated-trial count; the same underlying protocol
  registered in two registries counts twice, consistent with the Study model
  in `## Study` below.
- `PATENT-LINKED PROGRAMS`: the count of Programs with at least one linked
  `sources[].sourceType === 'patent'` record, counting each Program once
  regardless of how many patents it links, with its share of the total
  Program count as a secondary figure. This measures stored representative
  links, not completed patent-audit coverage, patent-family count, portfolio
  breadth, ownership, enforceability, or legal status.

Platform-level patent evidence is stored only under `src/data/platforms/`.
It must not be copied into `Program.sources`, does not establish a Program
relationship, and does not contribute to `PATENT-LINKED PROGRAMS`.

## Company and Platform static references

`src/data/companies/*.json` and `src/data/platforms/*.json` are low-frequency
reference data, not a third Program research track. A Company record stores its
display name, official homepage and pipeline URLs, exact
`programCompanyNames`, and `lastVerifiedAt`. Its Program list is always derived
by exact match against existing `Program.company` values; Program records do
not gain a Company foreign key solely for this UI.

A Platform record is eligible only when an official source directly identifies
the platform and representative patent evidence supports the same company and
technology. It stores the canonical name, aliases, official URL, one or more
Company-Platform relationships, representative patent-family evidence, and a
verification date. `relationships[].relationship` is `ownership`, `license`,
or `access`; `status` is `current` or `former`. Multiple relationships may
represent joint development or licensing, while a former ownership relation
preserves a past rights holder. `rightsHolderName` preserves the legal entity
named in the evidence even when it differs from the display Company.

The validator requires every relationship to resolve to a stored Company,
requires at least one current relationship, and rejects reuse of a
platform-level patent URL in any `Program.sources`. Candidate platform
findings whose official identifier, current rights holder, or relationship is
unresolved remain in patent-audit handoff only; they are not canonical data.

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
- Discrete alternatives such as Q4W, Q8W, and Q12W, or weekly and monthly,
  must never be encoded as one continuous numeric range. Store only the single
  interval directly supported as the current primary or registered product
  target; preserve other evaluated schedules in `readout` or `caveat`.
- A combination whose components use different schedules does not have one
  Program interval claim. Set `productTarget` to `null` and preserve each
  component schedule in prose unless a directly supported fixed combination
  product interval exists.
- Product-target buckets use only the numeric bounds in `productTarget`. A
  target spanning multiple UI buckets is counted in each overlapping bucket.
  Induction or loading schedules in descriptive text do not create buckets;
  only the encoded maintenance or final product target bounds are classified.

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

The current Study model has one `programSlug`. When one registry record
evaluates more than one separately stored Program, store the Study once, link
it to the most directly represented Program, do not clone or alter the
registry identity, and mark the additional Program relationship as
`DEFERRED_SCHEMA_CASE` as documented in `docs/EDGE_CASES.md`.

`registry` uses canonical display-name syntax rather than a permanent Zod enum.
The validator maintains the current official name-to-host provenance mapping;
supporting another official registry extends that mapping without redesigning
Study identity.

## Event

Program stores current state; Event accumulates every material change that
happened in the real world for that Program, in append-only order. The most
recent Program-facing "what changed" text and date are always derived from the
Program's most recent Event, never duplicated onto the Program record.

Each `src/data/events/*.json` records one material state change.

- `programSlug` is always required.
- `studySlug` is optional and used only when the Event identifies one Study.
- `company` and `programName` preserve reader-facing context.
- `category`, `significance`, `date`, and `headline` retain their prior
  meanings. `headline` is a concise title for the change.
- `summary`: one to three sentences describing what changed and the
  contemporaneous interpretation. Do not repeat a source's label or URL inside
  `summary`; the source itself is stored in `sources`.
- `sources`: a non-empty array of Source objects, ordered from the source that
  most directly supports the Event first. Legacy singular `source` is rejected.

### What creates an Event

Accumulate an Event for: a clinical-trial registration, start, completion, or
material operational-status change; a development-stage change; a material
clinical or nonclinical result; a regulatory milestone; a development hold,
discontinuation, or restart; a material change to dosing interval or
formulation target; a partnership, license, or rights reversion; or a
sponsor-stated entry into the next development stage or continuation.

Do not create an Event for: an unchanged reverification; a change to only a
source's `accessedOn`; a change to only `lastVerifiedAt`; a wording or UI
copy edit; reconfirming an already-stored fact with a better source; the date
an investigator discovered or stored a new candidate; or routine
classification housekeeping.

### Append-only discipline

Event is an append-only material-change record.

- Record a new material change as a new Event file; never overwrite an
  existing Event's `headline` or `summary` to match the Program's current
  state.
- A later development-stage Event never replaces, shortens, or restates an
  earlier result Event. Both remain as separate, independently readable
  records — see the worked example below.
- Edit an existing Event only to fix a typo, a broken link, an error that
  conflicts with its own direct source, or to add previously missing
  source-supported context; report every such edit and its reason.
- Delete an existing Event only when direct evidence shows it is a duplicate,
  an error, or an event that did not actually occur; report every deletion
  and its reason.

### Historical no-loss when updating Program current-state fields

Before overwriting a Program's (or its linked Study's) current-state field —
`developmentStage`, `developmentStatus`, `readout`, `productTarget`,
`differentiator`, `caveat`, or a linked Study's `phase`/recruitment or
operational status — confirm that any
material historical fact the old value carried (a prior result, a prior
stage/status, a prior product target or dosing interval, a regulatory
milestone, a partnership/hold/discontinuation/restart, or a caveat that was
material at the time) is already preserved in an Event. If it is not, create a
source-dated Event, or extend an existing under-specified Event within the
scope of its own direct sources, before the overwrite. A result Event's
`summary` must preserve enough of the study/stage, disclosure timing, what was
evaluated, key efficacy/PK/PD/safety findings, comparator/baseline, key
figures and timepoints, and interpretation limits (sponsor-reported, topline,
exploratory, small-study, etc.) that a reader can reconstruct the result's
contemporaneous meaning purely from the Event after the Program's current
`readout`/`developmentStatus` has moved on. A state-change Event should record
both the prior and the new state when the prior state is available, not only
the new state.

**Worked example.** A Program completes Phase 2, discloses topline results,
and later enters Phase 3:

- The Phase 2 result Event is kept unchanged, with its figures, comparator,
  and interpretation limits intact.
- Phase 3 entry is recorded as a new, separate Event.
- `developmentStage`/`developmentStatus` update to the Phase 3 current state;
  `readout` may update to the current evidence snapshot.
- The Phase 3 Event does not replace, shorten, or generalize the Phase 2
  result Event.

## Export boundary

- `/api/programs.csv`: one Program per row with `payloadComponents` joined using
  ` + ` in stored canonical lower-case order, classification, and all interval
  text/numeric fields.
- `/api/studies.csv`: one Study per row linked by `programSlug`, including its
  `registry`, source-native `registryId`, registry source, and verification date.
- `/api/snapshot.json`: `asOf`, `deliveryTechnologies`, `companies`,
  `platforms`, `programs`, `studies`, and `events`, with each Event's full
  `sources` array retained (never reduced to only the latest Event or a single
  primary source). `asOf` reflects Program and Study verification dates; it is
  not the latest Event date or the static-reference verification date.
- No legacy `payload`, `asset`, `modalityGroup`, `targetInterval`, embedded
  Study alias, Program `latestUpdate`/`latestUpdateDate`, or singular Event
  `source` is emitted.
