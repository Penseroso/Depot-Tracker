---
role: operating-docs-index
status: active
authority: authoritative
update-boundary: Update when document ownership, scope, or the operating layout changes.
---

# Operating documentation

This tracker intentionally keeps a small operating surface. Each rule has one
authoritative home; other documents should link to it rather than restating it.

| Topic | Authority |
| --- | --- |
| Agent task routing and update boundaries | [`../AGENTS.md`](../AGENTS.md) |
| Dataset identity, mutable state, fields, dates, events | [`DATA_CONTRACT.md`](DATA_CONTRACT.md) |
| Field-specific source authority and entry thresholds | [`SOURCE_AND_ENTRY_POLICY.md`](SOURCE_AND_ENTRY_POLICY.md) |
| Research execution, completion gate, validation, reporting | [`RESEARCH_WORKFLOW.md`](RESEARCH_WORKFLOW.md) |
| Current representational limits and re-entry triggers | [`EDGE_CASES.md`](EDGE_CASES.md) |
| Unresolved source-access handover | [`source-access-handover/README.md`](source-access-handover/README.md) |
| Product scope and intentionally excluded features | [`MVP_SCOPE.md`](MVP_SCOPE.md) |

## Operating data flow

```text
Human-edited canonical JSON
src/data/programs/*.json
src/data/studies/*.json
src/data/events/*.json
src/data/registries/*.json
  -> npm run data:validate
  -> Astro/Zod loading and npm run build
  -> static pages + CSV/JSON endpoints
  -> GitHub Pages
```

`src/data/` is authoritative operating data. `dist/` is a deterministic build
output and must not be edited by hand or committed as a source of truth.
