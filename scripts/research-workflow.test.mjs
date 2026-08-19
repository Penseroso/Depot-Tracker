import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('agent entry point routes all four canonical tracks separately', async () => {
  const agents = await read('AGENTS.md');

  assert.match(agents, /Event scan \(media & PR scan across Core sources\)/);
  assert.match(agents, /Program refresh \(one named Program or the stored roster\)/);
  assert.match(agents, /Program discovery \(candidates not currently stored\)/);
  assert.match(agents, /Patent coverage audit \(named\/stored Programs plus the bounded Platform queue\)/);
  assert.match(agents, /docs\/PATENT_AUDIT\.md/);
  assert.doesNotMatch(agents, /Weekly landscape refresh or named-program research/);
});

test('research workflow defines all track gates and bounded crossover', async () => {
  const workflow = await read('docs/RESEARCH_WORKFLOW.md');

  for (const required of [
    '## 2. Track A: event scan',
    '### Event scan completion gate',
    '## 3. Track B: program refresh',
    '### Refresh completion gate',
    '## 4. Track C: program discovery',
    '### Discovery completion gate',
    '## 5. Track D: patent coverage audit',
    '### Patent audit completion gate',
    '## 6. Bounded crossover and handoff',
    '`DISCOVERY_HANDOFF`',
    '`REFRESH_HANDOFF`',
    '## 10. Full landscape combination',
  ]) {
    assert.ok(workflow.includes(required), `missing workflow contract: ${required}`);
  }

  assert.match(workflow, /asOf - 2 days/i);
  assert.match(workflow, /media-sources\.json/i);
  assert.match(workflow, /Access verification and permitted fallbacks/i);
  assert.match(workflow, /Browser-assisted review/i);
  assert.match(workflow, /Known official fallback routes/i);
  assert.match(workflow, /HitNews/i);
  assert.match(workflow, /Yakup/i);
  assert.match(workflow, /undispositioned candidate\s+count must be zero/i);
  assert.match(workflow, /independent coverage pass is mandatory/i);
  assert.match(workflow, /full-landscape refresh-and-discovery operation is a run plan/i);
  assert.match(workflow, /zero unaudited\s+Programs/i);
  assert.match(workflow, /Create a missing Company record once/i);
  assert.match(workflow, /make one bounded pass over the\s+company's official technology pages/i);
  assert.match(workflow, /Patent evidence is optional at\s+this point/i);
  assert.match(workflow, /Patent audit never creates a Company page/i);
  assert.match(workflow, /updates\s+representative platform-level patent evidence/i);
  assert.match(workflow, /remain separate from `Program\.sources` and the\s+`PATENT-LINKED PROGRAMS` KPI/i);
  assert.match(workflow, /newly confirmed sponsor, developer, or disclosed partner/i);
  assert.match(workflow, /bounded Platform queue does not create a/i);
  assert.match(workflow, /Do not use the internal `other` Company\s+bucket as a Platform ledger/i);
});

test('patent audit authority defines search, attribution, refresh, and claim limits', async () => {
  const patentAudit = await read('docs/PATENT_AUDIT.md');

  for (const required of [
    '## 2. Search matrix',
    '## 3. Families and document status',
    '## 4. Attribution',
    '## 5. Claim limits and discovery handoff',
    '## 7. Periodic minimum refresh',
    '`PATENT_LINKED`',
    '`NO_LINK_FOUND`',
    '`ATTRIBUTION_DEFERRED`',
    '`DISCOVERY_HANDOFF`',
  ]) {
    assert.ok(patentAudit.includes(required), `missing patent audit contract: ${required}`);
  }

  assert.match(patentAudit, /Patent evidence alone never creates\s+a sponsor Program/i);
  assert.match(patentAudit, /patent audit never creates `src\/data\/companies\/` records/i);
  assert.match(patentAudit, /never copy platform-level patent evidence into `Program\.sources`/i);
  assert.match(patentAudit, /KPI, not an audit-completeness or\s+portfolio KPI/i);
  assert.match(patentAudit, /every Platform whose `patentEvidence` array is empty/i);
  assert.match(patentAudit, /accepted\s+patent-audit baseline commit reachable from `main`/i);
  assert.match(patentAudit, /full Program-roster and\s+full bounded-Platform-queue audit/i);
  assert.match(patentAudit, /`PLATFORM_RIGHTS_HANDOFF`/);
  assert.match(patentAudit, /aggregator-only\s+display must remain explicitly unconfirmed/i);
  assert.match(patentAudit, /Platform results\s+must not be merged into Program outcomes or KPI reporting/i);
});

test('Company and Platform static references define revalidation and validator boundaries', async () => {
  const contract = await read('docs/DATA_CONTRACT.md');

  assert.match(contract, /reverified at least once every 12 months/i);
  assert.match(contract, /currentAssignee.*representative patent record/is);
  assert.match(contract, /aggregator-only\s+labels are discovery aids/i);
  assert.match(contract, /never use `other` as a Platform\s+ledger/i);
});

test('pull request gate reports track, boundary, crossover, and GO status', async () => {
  const template = await read('.github/pull_request_template.md');

  for (const required of [
    'Primary track:',
    'Boundary:',
    'Combined full-landscape run:',
    'Independent coverage pass:',
    'Audit baseline / as-of:',
    'Bounded Platform queue:',
    'Platforms by outcome:',
    'Unaudited Programs:',
    'Unaudited queued Platforms:',
    'Discovery handoffs from patent audit:',
    'Platform/rights handoffs from patent audit:',
    'Discovery handoffs from refresh:',
    'Refresh handoffs from discovery:',
    'Track gate(s) passed:',
  ]) {
    assert.ok(template.includes(required), `missing PR gate: ${required}`);
  }
});
