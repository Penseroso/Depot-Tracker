import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('agent entry point routes refresh and discovery separately', async () => {
  const agents = await read('AGENTS.md');

  assert.match(agents, /Program refresh \(one named Program or the stored roster\)/);
  assert.match(agents, /Program discovery \(candidates not currently stored\)/);
  assert.doesNotMatch(agents, /Weekly landscape refresh or named-program research/);
});

test('research workflow defines both track gates and bounded crossover', async () => {
  const workflow = await read('docs/RESEARCH_WORKFLOW.md');

  for (const required of [
    '## 2. Track A: program refresh',
    '### Refresh completion gate',
    '## 3. Track B: program discovery',
    '### Discovery completion gate',
    '## 4. Bounded crossover and handoff',
    '`DISCOVERY_HANDOFF`',
    '`REFRESH_HANDOFF`',
    '## 8. Full landscape combination',
  ]) {
    assert.ok(workflow.includes(required), `missing workflow contract: ${required}`);
  }

  assert.match(workflow, /undispositioned candidate\s+count must be zero/i);
  assert.match(workflow, /independent coverage pass is mandatory/i);
  assert.match(workflow, /full-landscape operation is a run plan, not a third research track/i);
});

test('pull request gate reports track, boundary, crossover, and GO status', async () => {
  const template = await read('.github/pull_request_template.md');

  for (const required of [
    'Primary track:',
    'Boundary:',
    'Combined full-landscape run:',
    'Independent coverage pass:',
    'Discovery handoffs from refresh:',
    'Refresh handoffs from discovery:',
    'Track gate(s) passed:',
  ]) {
    assert.ok(template.includes(required), `missing PR gate: ${required}`);
  }
});
