import test from 'node:test';
import assert from 'node:assert/strict';
import {
  developmentStages,
  getStageBadgeClass,
  getStageLabel,
  stageOrder,
} from '../src/lib/development-stages.js';

test('stage order covers every canonical development stage exactly once', () => {
  assert.equal(new Set(developmentStages).size, developmentStages.length);
  assert.equal(new Set(stageOrder).size, stageOrder.length);
  assert.deepEqual(new Set(stageOrder), new Set(developmentStages));
});

test('all canonical stages have display labels', () => {
  for (const stage of developmentStages) {
    assert.notEqual(getStageLabel(stage), stage, stage);
  }
});

test('stage badges cover lifecycle and terminal states', () => {
  assert.equal(getStageBadgeClass('Discovery'), 'badge badge-preclinical');
  assert.equal(getStageBadgeClass('IND cleared'), 'badge badge-ind');
  assert.equal(getStageBadgeClass('Registered Phase III'), 'badge badge-clinical');
  assert.equal(getStageBadgeClass('Regulatory review'), 'badge badge-clinical');
  assert.equal(getStageBadgeClass('Approved'), 'badge badge-clinical');
  assert.equal(getStageBadgeClass('Discontinued'), 'badge badge-paused');
});
