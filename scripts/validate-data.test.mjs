import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateDataset, validateDatasetRecords } from './validation-core.mjs';

const source = {
  label: 'Regression test source',
  url: 'https://example.com/source',
  sourceType: 'company',
  accessedOn: '2026-07-27',
};

function createValidDataset() {
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
        payloadComponents: ['semaglutide'],
        recordType: 'sponsor-program',
        deliveryTechnologyId: 'polymer-microparticle',
        deliveryTechnology: 'PLGA microparticle',
        productTarget: { description: '월 1회', minDays: 28, maxDays: 31 },
        demonstratedDuration: null,
        platformPotential: null,
        route: 'Subcutaneous injection',
        developmentStage: 'Preclinical',
        developmentStatus: 'Preclinical',
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
        registry: 'ClinicalTrials.gov',
        registryId: 'NCT00000001',
        phase: 'Phase 1',
        recruitmentStatus: 'not-yet-recruiting',
        registryStatusRaw: 'Not yet recruiting',
        countries: ['Australia'],
        registrySource: {
          ...source,
          label: 'ClinicalTrials.gov NCT00000001',
          url: 'https://clinicaltrials.gov/study/NCT00000001',
          sourceType: 'registry',
        },
        lastVerifiedAt: '2026-07-27',
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

test('single-component payload and ClinicalTrials.gov Study pass', () => {
  assert.deepEqual(validateDatasetRecords(createValidDataset()).errors, []);
});

test('combination payload passes without reordering components', () => {
  const data = createValidDataset();
  data.programs[0].data.payloadComponents = ['cagrilintide', 'semaglutide'];
  assert.deepEqual(validateDatasetRecords(data).errors, []);
  assert.deepEqual(data.programs[0].data.payloadComponents, ['cagrilintide', 'semaglutide']);
});

test('upper-case payload component fails', () => {
  const data = createValidDataset();
  data.programs[0].data.payloadComponents = ['Semaglutide'];
  assert.match(validateDatasetRecords(data).errors.join('\n'), /must be lower-case/);
});

test('duplicate payload component fails', () => {
  const data = createValidDataset();
  data.programs[0].data.payloadComponents = ['semaglutide', 'semaglutide'];
  assert.match(validateDatasetRecords(data).errors.join('\n'), /duplicate payload component/);
});

test('empty payload component array fails', () => {
  const data = createValidDataset();
  data.programs[0].data.payloadComponents = [];
  assert.match(validateDatasetRecords(data).errors.join('\n'), /must be a non-empty array/);
});

test('payload component whitespace and + separator fail', () => {
  const data = createValidDataset();
  data.programs[0].data.payloadComponents = [' semaglutide', 'cagrilintide+semaglutide'];
  const errors = validateDatasetRecords(data).errors.join('\n');
  assert.match(errors, /must not have surrounding whitespace/);
  assert.match(errors, /must not contain \+/);
});

test('legacy payload field fails', () => {
  const data = createValidDataset();
  data.programs[0].data.payload = 'semaglutide';
  assert.match(validateDatasetRecords(data).errors.join('\n'), /legacy field payload/);
});

test('CTIS Study passes', () => {
  const data = createValidDataset();
  data.studies[0].slug = 'ctis-2024-518040-21-00';
  data.studies[0].name = 'ctis-2024-518040-21-00.json';
  data.studies[0].data.registry = 'CTIS';
  data.studies[0].data.registryId = '2024-518040-21-00';
  data.studies[0].data.registrySource = {
    ...data.studies[0].data.registrySource,
    label: 'EMA CTIS 2024-518040-21-00',
    url: 'https://euclinicaltrials.eu/ctis-public/view/2024-518040-21-00',
  };
  data.events[0].data.studySlug = 'ctis-2024-518040-21-00';
  assert.deepEqual(validateDatasetRecords(data).errors, []);
});

test('duplicate registry and registryId pair fails', () => {
  const data = createValidDataset();
  data.studies.push(structuredClone(data.studies[0]));
  data.studies[1].name = 'duplicate-study.json';
  data.studies[1].slug = 'duplicate-study';
  assert.match(validateDatasetRecords(data).errors.join('\n'), /duplicate registry identity/);
});

test('same registryId string in different registries does not conflict', () => {
  const data = createValidDataset();
  const second = structuredClone(data.studies[0]);
  second.name = 'ctis-shared-id.json';
  second.slug = 'ctis-shared-id';
  second.data.registry = 'CTIS';
  second.data.registrySource = {
    ...second.data.registrySource,
    label: 'CTIS shared ID',
    url: 'https://euclinicaltrials.eu/ctis-public/view/NCT00000001',
  };
  data.studies.push(second);
  assert.deepEqual(validateDatasetRecords(data).errors, []);
});

test('unregistered delivery technology fails', () => {
  const data = createValidDataset();
  data.programs[0].data.deliveryTechnologyId = 'missing-technology';
  assert.match(validateDatasetRecords(data).errors.join('\n'), /is not registered/);
});

test('reversed interval range fails', () => {
  const data = createValidDataset();
  data.programs[0].data.productTarget = { description: 'bad range', minDays: 31, maxDays: 28 };
  assert.match(validateDatasetRecords(data).errors.join('\n'), /minDays cannot be greater/);
});

test('Study referencing a missing Program fails', () => {
  const data = createValidDataset();
  data.studies[0].data.programSlug = 'missing-program';
  assert.match(validateDatasetRecords(data).errors.join('\n'), /missing Program reference/);
});

test('Event referencing a missing Study fails', () => {
  const data = createValidDataset();
  data.events[0].data.studySlug = 'missing-study';
  assert.match(validateDatasetRecords(data).errors.join('\n'), /missing Study reference/);
});

test('legacy Program key fails', () => {
  const data = createValidDataset();
  data.programs[0].data.asset = 'Legacy name';
  assert.match(validateDatasetRecords(data).errors.join('\n'), /legacy field asset/);
});

test('removed Program region context fails', () => {
  const data = createValidDataset();
  data.programs[0].data.programRegionContext = 'South Korea';
  assert.match(validateDatasetRecords(data).errors.join('\n'), /legacy field programRegionContext/);
});

test('Study registry provenance must use a registry source', () => {
  const data = createValidDataset();
  data.studies[0].data.registrySource.sourceType = 'company';
  assert.match(validateDatasetRecords(data).errors.join('\n'), /sourceType must be registry/);
});

test('Study registry must use a supported canonical official name and host', () => {
  const data = createValidDataset();
  data.studies[0].data.registry = 'Clinical trials registry';
  assert.match(validateDatasetRecords(data).errors.join('\n'), /supported canonical official name/);

  const hostMismatch = createValidDataset();
  hostMismatch.studies[0].data.registrySource.url = 'https://example.com/NCT00000001';
  assert.match(validateDatasetRecords(hostMismatch).errors.join('\n'), /not an official ClinicalTrials.gov source/);
});

test('CAM2056 CTIS Study is linked to its Program in the canonical dataset', async () => {
  const [study, program, validation] = await Promise.all([
    readFile('src/data/studies/ctis-2024-518040-21-00.json', 'utf8').then(JSON.parse),
    readFile('src/data/programs/camurus-cam2056.json', 'utf8').then(JSON.parse),
    validateDataset(process.cwd()),
  ]);
  assert.equal(study.programSlug, 'camurus-cam2056');
  assert.equal(study.registry, 'CTIS');
  assert.equal(study.registryId, '2024-518040-21-00');
  assert.equal(program.developmentStage, 'Registered Phase I');
  assert.deepEqual(validation.errors, []);
});
