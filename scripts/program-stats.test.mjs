import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getActiveProgramCount,
  getPatentLinkedProgramCount,
  getPatentLinkedRatio,
  getTrialRegistrationCount,
} from '../src/lib/program-stats.js';

function program(overrides) {
  return {
    active: true,
    sources: [],
    ...overrides,
  };
}

test('getActiveProgramCount counts only active Programs', () => {
  const programs = [program({ active: true }), program({ active: false }), program({ active: true })];
  assert.equal(getActiveProgramCount(programs), 2);
  assert.equal(programs.length, 3);
});

test('getTrialRegistrationCount counts every Study record across all registries', () => {
  const studies = [
    { registry: 'ClinicalTrials.gov' },
    { registry: 'ClinicalTrials.gov' },
    { registry: 'CTIS' },
  ];
  assert.equal(getTrialRegistrationCount(studies), 3);
});

test('a Program with multiple linked Patents is counted once', () => {
  const programs = [
    program({
      sources: [
        { sourceType: 'patent' },
        { sourceType: 'patent' },
        { sourceType: 'company' },
      ],
    }),
  ];
  assert.equal(getPatentLinkedProgramCount(programs), 1);
});

test('a Program with no linked Patent is not counted', () => {
  const programs = [
    program({ sources: [{ sourceType: 'company' }, { sourceType: 'registry' }] }),
  ];
  assert.equal(getPatentLinkedProgramCount(programs), 0);
});

test('getPatentLinkedRatio computes the share of Programs with a linked Patent', () => {
  const programs = [
    program({ sources: [{ sourceType: 'patent' }] }),
    program({ sources: [{ sourceType: 'patent' }, { sourceType: 'company' }] }),
    program({ sources: [{ sourceType: 'company' }] }),
    program({ sources: [] }),
  ];
  assert.deepEqual(getPatentLinkedRatio(programs), { linked: 2, total: 4, percent: 50 });
});

test('getPatentLinkedRatio handles an empty Program set without dividing by zero', () => {
  assert.deepEqual(getPatentLinkedRatio([]), { linked: 0, total: 0, percent: 0 });
});
