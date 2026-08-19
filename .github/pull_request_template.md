## Run scope

- Primary track: <!-- event scan / program refresh / program discovery / patent coverage audit -->
- Boundary: <!-- declared event review window, named stored Program(s), full stored roster, or discovery boundary -->
- Combined full-landscape run: <!-- yes / no -->
- Programs traversed:
- Material changes:

## Discovery disposition

| Candidate | Disposition | Reason / re-entry condition |
| --- | --- | --- |
|  | STORED / EXCLUDED / DEFERRED |  |

- Undispositioned candidates: <!-- must be 0 for discovery GO; N/A otherwise -->
- Independent coverage pass: <!-- complete / incomplete / N/A outside discovery -->

## Patent audit

- Audit baseline / as-of:
- Programs by outcome: <!-- PATENT_LINKED / NO_LINK_FOUND / ATTRIBUTION_DEFERRED -->
- Bounded Platform queue:
- Platforms by outcome: <!-- PATENT_LINKED / NO_LINK_FOUND / ATTRIBUTION_DEFERRED; separate from Program outcomes -->
- Attributable families:
- Unaudited Programs: <!-- must be 0 for patent audit GO; N/A otherwise -->
- Unaudited queued Platforms: <!-- must be 0 for patent audit GO; N/A otherwise -->
- Periodic minimum refresh completed: <!-- yes / no / N/A -->

## Crossover

- Discovery handoffs from event scan:
- Refresh handoffs from event scan:
- Discovery handoffs from refresh:
- Discovery handoffs from patent audit:
- Platform/rights handoffs from patent audit:
- Refresh handoffs from discovery:
- Refresh handoffs from patent audit:
- Bounded crossovers completed:

## Event integrity

- New Events added:
- Existing Events edited (slug + reason): <!-- typo/link fix, direct-source error, or added missing context only -->
- Existing Events deleted (slug + reason): <!-- duplicate, error, or non-event, with direct evidence -->
- Historical no-loss gate: <!-- pass / fail — no material historical fact dropped from an overwritten Program/Study field without a preserving Event -->


## Source access

- Principal sources:
- Blocked or partial sources:
- Handover created/updated/resolved: <!-- none or path -->

## Validation

- [ ] `npm run data:validate`
- [ ] `npm run data:test`
- [ ] `npm run data:staleness`
- [ ] `npm run check`
- [ ] `npm run build`
- [ ] `git diff --check`

## Completion

- Status: **GO / NO-GO**
- Track gate(s) passed: <!-- refresh / discovery / patent audit / included tracks -->
- Remaining blocker, if NO-GO:
