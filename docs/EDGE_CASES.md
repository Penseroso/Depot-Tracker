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

**Limit:** payload-specific obesity-depot animal evidence may inform feasibility
without a sponsor development Program.

**Handling:** store it as `technology-watch` and keep product target null unless
direct product intent exists.

**Re-entry:** licensing, company formation, or sponsor-development evidence.

## Inaccessible versus unreported evidence

Blocked sources do not prove nonexistence. Preserve supported state and use a
source-access handover when a material claim remains unresolved.

## Result-level evidence without Arm/Endpoint/Outcome provenance

The compact Study model lacks Arm/Endpoint/Outcome provenance. Store only direct
headline claims and never derive or transcribe unsupported values.

## The same protocol registered in multiple registries

**Limit:** each Study currently represents one official `registry + registryId`.
The model does not merge or deduplicate the same clinical protocol when it is
registered in more than one official registry. Overview registered-Study counts
therefore count stored Study records, not deduplicated protocols.

**Handling:** do not merge records heuristically. If a cross-registry duplicate
protocol is identified, report it as `DEFERRED_SCHEMA_CASE` and retain each
source-native registry record until a protocol-level identity model exists.
The current dataset has no identified cross-registry duplicate based on its
stored Program and Study linkages.

**Re-entry:** add a protocol-level identity and explicit cross-registry linkage
only when a confirmed duplicate appears and the product requires deduplicated
Study counts or unified protocol presentation.
