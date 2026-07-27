---
role: edge-cases
status: active
authority: authoritative
update-boundary: Update only for durable representational limits and explicit re-entry triggers.
---

# Edge Cases

## Product target versus demonstrated or platform duration

**Limit:** patents, animal exposure, and platform concepts may support longer
durations than the current product target.

**Handling:** store each claim independently. Only `productTarget` drives the
product interval filter/chart.

**Re-entry:** direct sponsor or registry evidence changes the product target.

## QnW versus calendar expressions

**Limit:** Q4W is exactly 28 days, while monthly can span 28–31 days.

**Handling:** preserve source text and use the Data Contract conversion table;
never collapse Q4W/Q8W/Q12W into calendar month/quarter values.

**Re-entry:** a source supplies a more exact schedule.

## Open range versus absent claim

**Limit:** “6 weeks or longer” is not the same as no public duration.

**Handling:** use an object with a null open bound for the former and a null
claim for the latter.

**Re-entry:** evidence closes the range or establishes the absent claim.

## Program region versus Study country

**Limit:** development base, nonclinical location, and licensing territory are
not Study-country facts.

**Handling:** retain the former in `programRegionContext`; only registry-derived
English country names enter Study `countries`.

**Re-entry:** registry location data changes.

## Human pilot without a registered Study

**Limit:** human PK/safety may exist without a public registry or confirmed IND.

**Handling:** keep the Program at `Human PK pilot` and create no Study.

**Re-entry:** a registry or direct regulatory source establishes the Study.

## Academic technology versus sponsor Program

**Limit:** semaglutide-specific animal evidence may inform feasibility without a
sponsor development Program.

**Handling:** store it as `technology-watch` and keep product target null unless
direct product intent exists.

**Re-entry:** licensing, company formation, or sponsor-development evidence.

## Inaccessible or unreported evidence

Blocked sources do not prove nonexistence. Preserve supported state and use a
source-access handover when a material claim remains unresolved.

## Derived PK or chart-transcribed values

The compact Study model lacks Arm/Endpoint/Outcome provenance. Store only direct
headline claims and never derive or transcribe unsupported values.
