import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDatasetRecords } from './validation-core.mjs';

const source = {
  label: 'Fixture source',
  url: 'https://example.com/source',
  sourceType: 'company',
  accessedOn: '2026-07-27',
};

function fixture() {
  return {
    deliveryTechnologies: [{
      id: 'polymer-microparticle',
      label: 'Polymer microparticle',
      shortLabel: 'Microparticle',
      sortRank: 10,
    }],
    programs: [{
      name: 'fixture-program.json',
      slug: 'fixture-program',
      data: {
        company: 'Fixture Co',
        programName: 'Fixture Program',
        payload: 'semaglutide',
        recordType: 'sponsor-program',
        deliveryTechnologyId: 'polymer-microparticle',
        deliveryTechnology: 'PLGA microparticle',
        productTarget: { description: '월 1회', minDays: 28, maxDays: 31 },
        demonstratedDuration: null,
        platformPotential: null,
        route: 'Subcutaneous injection',
        developmentStage: 'Preclinical',
        developmentStatus: 'Preclinical',
        programRegionContext: 'South Korea',
        latestUpdate: 'Fixture update',
        latestUpdateDate: '2026-07-27',
        lastVerifiedAt: '2026-07-27',
        readout: 'Fixture readout',
        differentiator: 'Fixture differentiator',
        caveat: 'Fixture caveat',
        confidence: 'High',
        active: true,
        stageRank: 20,
        sources: [source],
      },
    }],
    studies: [{
      name: 'nct00000001.json',
      slug: 'nct00000001',
      data: {
        programSlug: 'fixture-program',
        registryId: 'NCT00000001',
        phase: 'Phase 1',
        recruitmentStatus: 'not-yet-recruiting',
        registryStatusRaw: 'Not yet recruiting',
        countries: ['Australia'],
      },
    }],
    events: [{
      name: '2026-07-27-fixture.json',
      slug: '2026-07-27-fixture',
      data: {
        programSlug: 'fixture-program',
        studySlug: 'nct00000001',
        date: '2026-07-27',
        company: 'Fixture Co',
        programName: 'Fixture Program',
        category: 'Clinical',
        headline: 'Fixture event',
        significance: 'High',
        source,
      },
    }],
  };
}

test('valid fixture passes', () => {
  assert.deepEqual(validateDatasetRecords(fixture()).errors, []);
});

test('unregistered delivery technology fails', () => {
  const data = fixture();
  data.programs[0].data.deliveryTechnologyId = 'missing-technology';
  assert.match(validateDatasetRecords(data).errors.join('\n'), /is not registered/);
});

test('reversed interval range fails', () => {
  const data = fixture();
  data.programs[0].data.productTarget = { description: 'bad range', minDays: 31, maxDays: 28 };
  assert.match(validateDatasetRecords(data).errors.join('\n'), /minDays cannot be greater/);
});

test('Study referencing a missing Program fails', () => {
  const data = fixture();
  data.studies[0].data.programSlug = 'missing-program';
  assert.match(validateDatasetRecords(data).errors.join('\n'), /missing Program reference/);
});

test('Event referencing a missing Study fails', () => {
  const data = fixture();
  data.events[0].data.studySlug = 'missing-study';
  assert.match(validateDatasetRecords(data).errors.join('\n'), /missing Study reference/);
});

test('legacy Program key fails', () => {
  const data = fixture();
  data.programs[0].data.asset = 'Legacy name';
  assert.match(validateDatasetRecords(data).errors.join('\n'), /legacy field asset/);
});
