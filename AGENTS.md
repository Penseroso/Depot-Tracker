---
role: agent-entrypoint
status: active
authority: authoritative
update-boundary: Update only when task routing, mandatory reading paths, or cross-document update boundaries change.
---

# Agent Entry Point

This is the only general documentation entry point for agents. Start here and
read only the path required for the task. Do not read or rewrite the full
documentation tree by default.

## Task routing

| Task | Required reading | Read only when needed |
| --- | --- | --- |
| Weekly landscape refresh or named-program research | [`docs/RESEARCH_WORKFLOW.md`](docs/RESEARCH_WORKFLOW.md), [`docs/DATA_CONTRACT.md`](docs/DATA_CONTRACT.md), [`docs/SOURCE_AND_ENTRY_POLICY.md`](docs/SOURCE_AND_ENTRY_POLICY.md) | Unrepresentable case: [`docs/EDGE_CASES.md`](docs/EDGE_CASES.md). Blocked source: [`docs/source-access-handover/README.md`](docs/source-access-handover/README.md). |
| Data shape or validator change | `src/lib/schema.ts`, [`docs/DATA_CONTRACT.md`](docs/DATA_CONTRACT.md), `scripts/validate-data.mjs` | Workflow only when operator behavior changes. |
| UI or read-model change | Relevant page/component, `src/lib/data.ts`, `src/styles/global.css`, [`docs/MVP_SCOPE.md`](docs/MVP_SCOPE.md) | Data contract only when user-facing meaning changes. |
| Deployment | `README.md`, `.github/workflows/deploy.yml`, `astro.config.mjs` | Research policy is not required. |

## Update boundaries

| Change | Update | Do not update by default |
| --- | --- | --- |
| Routine research refresh | `src/data/assets/*.json`, `src/data/events/*.json`; handover only for unresolved blockers | Contracts, workflow, UI, README |
| Research procedure | `docs/RESEARCH_WORKFLOW.md` | Data contract and UI |
| Source or entry semantics | `docs/SOURCE_AND_ENTRY_POLICY.md`, relevant schema/validator when required | Historical event records |
| Data identity or field meaning | `docs/DATA_CONTRACT.md`, schema, validator, consumers | Research workflow unless behavior changes |
| Structural limitation | `docs/EDGE_CASES.md` | Ordinary operating data for the unsupported case |
| UI semantics | UI code and `docs/MVP_SCOPE.md` | Research documents unless data meaning changes |

Current rules belong in the active authority documents above. Routine runs do
not create permanent narrative reports in the repository. A draft pull request
and, only when necessary, a source-access handover are the durable review
surfaces.
