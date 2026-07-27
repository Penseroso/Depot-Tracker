---
role: edge-cases
status: active
authority: authoritative
update-boundary: Update only for durable representational limits and explicit re-entry triggers.
---

# Edge Cases

These are durable interpretation or representation limits. Ordinary missing
evidence belongs in the run report or source-access handover, not here.

## Patent interval versus product target

**Limit:** patents may claim monthly through multi-month release while the
current sponsor program targets only monthly dosing.

**Current handling:** store the supported current target in `targetInterval` and
place broader patent/platform potential in `differentiator` or `caveat`.

**Re-entry trigger:** direct sponsor or clinical evidence establishing a new
product target.

## Human pilot without public IND or registered trial

**Limit:** an abstract may disclose human PK/safety while public regulatory or
registry status remains unclear.

**Current handling:** use `Human PK pilot`; do not promote to IND or registered
clinical stage.

**Re-entry trigger:** direct regulator, registry, or sponsor evidence of the
specific milestone.

## Academic technology versus sponsor program

**Limit:** semaglutide-specific animal data may be highly relevant but not an
active company development program.

**Current handling:** retain as a technology-watch item, identify the academic
owner, and state productization limits in `caveat`.

**Re-entry trigger:** licensing, company formation, IND-enabling activity, or
other direct sponsor-development evidence.

## Same molecule, distinct depot configuration

**Limit:** one semaglutide molecule may be developed in multiple sponsor-tracked
routes or formulation platforms.

**Current handling:** create a separate program only when official evidence
independently establishes a distinct development configuration. Trial-arm or
dose differences alone remain one program.

**Re-entry trigger:** sponsor-level evidence that resolves whether the
configuration is independently tracked.

## Unreported versus inaccessible

**Limit:** blocked supplements, paywalls, bot blocks, or inaccessible registries
cannot establish that no result or program exists.

**Current handling:** preserve the current supported state, report the access
blocker, and create/update a source-access handover when material.

**Re-entry trigger:** source access or an equivalent direct source supporting
the affected claim.

## Derived PK or chart-transcribed values

**Limit:** the compact tracker does not carry a full clinical evidence model for
population, estimand, comparison, and endpoint provenance.

**Current handling:** store only directly reported headline claims appropriate
for the program summary. Do not derive values, read values from charts, or
combine sources to create an undisclosed estimate.

**Re-entry trigger:** a future evidence schema that can preserve the required
analysis context and result-level provenance.
