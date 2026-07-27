---
role: research-workflow
status: active
authority: authoritative
update-boundary: Update only when research execution, completion gates, validation, or reporting requirements change.
---

# Research Workflow

Executable workflow for an initial landscape investigation, a weekly refresh,
or a named-program update. The workflow decides the mode from current operating
data; request wording does not bypass existing-record review.

## 1. Establish the run

1. Read `AGENTS.md` and the three required research authorities.
2. Inspect current asset/event JSON and the schema before searching externally.
3. Decide:
   - **initial investigation** when no relevant record exists;
   - **refresh** when the program or landscape already exists.
4. Confirm that the primary source surfaces required for the task are reachable
   before editing. A blocked source is a blocker, not evidence of absence.
5. Work on a branch and draft PR. Do not write directly to `main`.

## 2. Discover and classify

Search company-centred and asset-centred surfaces, including current company
pipeline/IR/scientific materials, trial registries, regulators, congress
archives, literature indexes, patents, partners, aliases, and development codes
as appropriate.

Every surfaced candidate must finish the run in exactly one disposition:

- **STORED** — in scope, directly supported, representable, and entered or merged
  into current operating data;
- **EXCLUDED** — confirmed outside scope, not an official program, generic/copy,
  academic or platform material without semaglutide-specific relevance, or
  speculative/unidentifiable;
- **DEFERRED** — plausibly in scope but identity, formulation, stage, interval,
  source access, or representability remains unresolved. State the blocker and
  re-entry condition.

Do not use “insufficient evidence” as a catch-all exclusion. Nothing surfaced
may be silently dropped.

## 3. Apply the contract

- Reuse the existing stable `programSlug` for the same real-world program.
- A rename updates display fields; it does not create a new identity.
- Dose cohorts, trial arms, enrolled populations, or planned intervals do not
  create separate program records by themselves.
- Separate product target from platform/patent potential.
- Keep human pilot disclosure, IND status, registered trial status, and actual
  trial initiation as different states.
- Add an event only for a material semantic change.
- Use `DEFERRED_SCHEMA_CASE` in the run report when a source-supported case is
  not representable; update `EDGE_CASES.md` only for a durable class of cases,
  not for a one-off ordinary evidence gap.

## 4. Protect existing records

- Do not delete a confirmed value because a newer source omits it.
- Do not replace stronger evidence with weaker reporting.
- Preserve useful prior sources without adding duplicates.
- Update `latestUpdateDate`, `lastVerifiedAt`, and source `accessedOn` according
  to their separate meanings.
- Do not guess a missing field, source date, program identity, or stage.
- Recheck previously deferred or source-blocked cases; never carry them forward
  untested.

## 5. Completion gate

The run may report **GO** only when all applicable items hold:

1. The current sponsor pipeline/status surfaces and relevant registry/regulatory
   records were reconciled.
2. Asset/code-name reverse searches and non-microsphere searches were performed
   where relevant.
3. Every newly surfaced candidate has STORED, EXCLUDED, or DEFERRED disposition.
4. An independent second discovery pass was performed without starting from the
   first pass's candidate list.
5. Previously deferred or blocked cases were re-searched and updated or
   explicitly reconfirmed.
6. The number of undispositioned candidates is zero.
7. Every changed stage/status/interval is supported by evidence for that exact
   program configuration.
8. Every material change has a corresponding event; pure reverification does
   not.
9. Cross-record validation, Astro/Zod checks, build, and diff checks pass.

Any unresolved applicable item is **NO-GO**. A single DEFERRED case does not
block unrelated valid updates, but it must be reported and, when source access
is the blocker, handed over.

## 6. Validate

After valid source changes run:

```bash
npm run data:validate
npm run data:staleness
npm run check
npm run build
git diff --check
```

`data:staleness` is advisory. It identifies records requiring review but does not
decide their status. Validator/build success cannot inspect external source
content and does not replace the completion gate.

## 7. Report and PR

The draft PR or final run report should state:

- initial investigation or refresh;
- programs traversed, created, changed, or reverified;
- every surfaced candidate's STORED/EXCLUDED/DEFERRED disposition and reason;
- undispositioned candidate count;
- material changes and event records added;
- principal sources and source-access blockers;
- unresolved handover entries created/updated/resolved;
- validation results;
- final **GO** or **NO-GO**.

When there is no material change, do not edit operating JSON merely to create a
commit. Report the surfaces checked, reverification outcome, stale records, and
that no repository change was required.
