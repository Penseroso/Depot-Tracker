---
role: edge-cases
status: active
authority: authoritative
update-boundary: Update only for durable representational limits and explicit re-entry triggers.
---

# Edge Cases

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

## Inaccessible versus unreported evidence

Blocked sources do not prove nonexistence. Preserve supported state and use a
source-access handover when a material claim remains unresolved.

## Result-level evidence without Arm/Endpoint/Outcome provenance

The compact Study model lacks Arm/Endpoint/Outcome provenance. Store only direct
headline claims and never derive or transcribe unsupported values.
