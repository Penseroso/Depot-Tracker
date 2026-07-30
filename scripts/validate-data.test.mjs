import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateDataset, validateDatasetRecords } from './validation-core.mjs';
import { developmentStages } from '../src/lib/development-stages.js';

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
        route: 'Subcutaneous injection',
        developmentStage: 'Preclinical',
        developmentStatus: 'Preclinical',
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
    companies: [{
      name: 'fixture-co.json',
      slug: 'fixture-co',
      data: {
        name: 'Fixture Co',
        visibility: 'public',
        homepageUrl: 'https://example.com/',
        pipelineUrl: 'https://example.com/pipeline',
        programCompanyNames: ['Fixture Co'],
        lastVerifiedAt: '2026-07-27',
      },
    }],
    platforms: [{
      name: 'fixture-platform.json',
      slug: 'fixture-platform',
      data: {
        name: 'Fixture Platform',
        aliases: ['Fixture delivery platform'],
        officialUrl: 'https://example.com/platform',
        relationships: [{
          companySlug: 'fixture-co',
          relationship: 'ownership',
          status: 'current',
          rightsHolderName: 'Fixture Co',
          basis: 'Fixture Co identifies and owns the fixture platform.',
          source,
        }],
        patentEvidence: [{
          familyId: 'WO2026000001',
          publicationNumber: 'WO2026000001A1',
          grantNumber: null,
          earliestPriority: '2025-01-01',
          currentAssignee: 'Fixture Co',
          jurisdiction: 'WO (PCT)',
          legalStatus: 'Pending',
          url: 'https://patents.example.com/WO2026000001A1',
          accessedOn: '2026-07-27',
        }],
        lastVerifiedAt: '2026-07-27',
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
        summary: 'Fixture summary describing the material change and its interpretation.',
        significance: 'High',
        sources: [source],
      },
    }],
  };
}

test('single-component payload and ClinicalTrials.gov Study pass', () => {
  assert.deepEqual(validateDatasetRecords(createValidDataset()).errors, []);
});

test('platform patent evidence cannot be reused as Program patent evidence', () => {
  const data = createValidDataset();
  data.programs[0].data.sources.push({
    ...source,
    sourceType: 'patent',
    url: data.platforms[0].data.patentEvidence[0].url,
  });
  assert.match(
    validateDatasetRecords(data).errors.join('\n'),
    /platform-level patent evidence must not be linked from Program\.sources/,
  );
});

test('officially verified Platform may be stored before patent evidence is found', () => {
  const data = createValidDataset();
  data.platforms[0].data.patentEvidence = [];
  assert.deepEqual(validateDatasetRecords(data).errors, []);
});

test('duplicate familyId within one Platform fails', () => {
  const data = createValidDataset();
  data.platforms[0].data.patentEvidence.push({
    ...structuredClone(data.platforms[0].data.patentEvidence[0]),
    url: 'https://patents.example.com/WO2026000001A1-alt',
  });
  assert.match(
    validateDatasetRecords(data).errors.join('\n'),
    /duplicate patent familyId WO2026000001/,
  );
});

test('one family assigned to multiple Platforms requires attribution review', () => {
  const data = createValidDataset();
  data.platforms.push(structuredClone(data.platforms[0]));
  data.platforms[1].name = 'second-platform.json';
  data.platforms[1].slug = 'second-platform';
  data.platforms[1].data.name = 'Second Platform';
  assert.match(
    validateDatasetRecords(data).errors.join('\n'),
    /assigned to multiple Platforms.*cross-Platform attribution review is required/,
  );
});

test('one partnership Program company may map to multiple Company pages', () => {
  const data = createValidDataset();
  data.companies.push(structuredClone(data.companies[0]));
  data.companies[1].name = 'partner-company.json';
  data.companies[1].slug = 'partner-company';
  data.companies[1].data.name = 'Partner Company';
  assert.deepEqual(validateDatasetRecords(data).errors, []);
});

test('public Company promotion cannot leave the same Program company in other', () => {
  const data = createValidDataset();
  data.companies.push(structuredClone(data.companies[0]));
  data.companies[1].name = 'other.json';
  data.companies[1].slug = 'other';
  data.companies[1].data.name = 'Other';
  data.companies[1].data.visibility = 'internal';
  data.companies[1].data.homepageUrl = null;
  data.companies[1].data.pipelineUrl = null;
  assert.match(
    validateDatasetRecords(data).errors.join('\n'),
    /must not remain in the internal other bucket/,
  );
});

test('joint Program company must map every named participant publicly', () => {
  const data = createValidDataset();
  data.programs[0].data.company = 'Fixture Co / Partner Co';
  data.companies[0].data.programCompanyNames = ['Fixture Co / Partner Co'];
  assert.match(
    validateDatasetRecords(data).errors.join('\n'),
    /Joint Program company must map every named participant/,
  );
});

test('every stored Program company must map to a public Company or internal other bucket', () => {
  const data = createValidDataset();
  data.companies[0].data.programCompanyNames = ['Different Co'];
  const errors = validateDatasetRecords(data).errors.join('\n');
  assert.match(errors, /Program company must map to a Company or the internal other bucket/);
});

test('sponsor Program cannot map only to the internal other bucket', () => {
  const data = createValidDataset();
  data.companies[0].data.visibility = 'internal';
  data.companies[0].data.homepageUrl = null;
  data.companies[0].data.pipelineUrl = null;
  assert.match(
    validateDatasetRecords(data).errors.join('\n'),
    /Sponsor Program company must map to at least one public Company page/,
  );
});

test('every canonical development stage passes validation', () => {
  for (const stage of developmentStages) {
    const data = createValidDataset();
    data.programs[0].data.developmentStage = stage;
    assert.deepEqual(validateDatasetRecords(data).errors, [], stage);
  }
});

test('unknown development stage fails validation', () => {
  const data = createValidDataset();
  data.programs[0].data.developmentStage = 'Phase 5';
  assert.match(validateDatasetRecords(data).errors.join('\n'), /developmentStage is not allowed/);
});

test('registered development stage requires a linked official Study', () => {
  const data = createValidDataset();
  data.programs[0].data.developmentStage = 'Registered Phase III';
  data.studies = [];
  data.events[0].data.studySlug = undefined;
  assert.match(
    validateDatasetRecords(data).errors.join('\n'),
    /registered developmentStage requires a linked official Study/,
  );
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

test('multi-source Event passes', () => {
  const data = createValidDataset();
  data.events[0].data.sources = [
    source,
    { ...source, label: 'Second source', url: 'https://example.com/second' },
  ];
  assert.deepEqual(validateDatasetRecords(data).errors, []);
});

test('empty Event sources array fails', () => {
  const data = createValidDataset();
  data.events[0].data.sources = [];
  assert.match(validateDatasetRecords(data).errors.join('\n'), /sources must contain at least one source/);
});

test('legacy Event source field fails', () => {
  const data = createValidDataset();
  data.events[0].data.source = source;
  assert.match(validateDatasetRecords(data).errors.join('\n'), /legacy field source/);
});

test('Event missing summary fails', () => {
  const data = createValidDataset();
  delete data.events[0].data.summary;
  assert.match(validateDatasetRecords(data).errors.join('\n'), /summary must be a non-empty string/);
});

test('duplicate Event for the same Program, date, and headline fails', () => {
  const data = createValidDataset();
  const duplicate = structuredClone(data.events[0]);
  duplicate.name = '2026-07-27-fixture-duplicate.json';
  duplicate.slug = '2026-07-27-fixture-duplicate';
  data.events.push(duplicate);
  assert.match(validateDatasetRecords(data).errors.join('\n'), /duplicate Event for the same Program, date, and headline/);
});

test('legacy Program latestUpdate and latestUpdateDate fields fail', () => {
  const data = createValidDataset();
  data.programs[0].data.latestUpdate = 'Legacy narrative';
  data.programs[0].data.latestUpdateDate = '2026-07-27';
  const errors = validateDatasetRecords(data).errors.join('\n');
  assert.match(errors, /legacy field latestUpdate\b/);
  assert.match(errors, /legacy field latestUpdateDate/);
});

test('Program detail page does not render demonstratedDuration or platformPotential', async () => {
  const source = await readFile('src/pages/programs/[slug].astro', 'utf8');
  assert.doesNotMatch(source, /demonstratedDuration/);
  assert.doesNotMatch(source, /platformPotential/);
});

test('legacy Program demonstratedDuration field fails', () => {
  const data = createValidDataset();
  data.programs[0].data.demonstratedDuration = null;
  assert.match(validateDatasetRecords(data).errors.join('\n'), /legacy field demonstratedDuration/);
});

test('legacy Program platformPotential field fails', () => {
  const data = createValidDataset();
  data.programs[0].data.platformPotential = { description: '분기 1회', minDays: 84, maxDays: 92 };
  assert.match(validateDatasetRecords(data).errors.join('\n'), /legacy field platformPotential/);
});

test('middle dot in Program caveat fails', () => {
  const data = createValidDataset();
  data.programs[0].data.caveat = '정식 임상 등록·IND 상태 미공개.';
  assert.match(validateDatasetRecords(data).errors.join('\n'), /caveat must not contain a middle dot/);
});

test('middle dot in Program readout, differentiator, or developmentStatus fails', () => {
  const readoutData = createValidDataset();
  readoutData.programs[0].data.readout = '지연 흡수·연장 노출 확인.';
  assert.match(validateDatasetRecords(readoutData).errors.join('\n'), /readout must not contain a middle dot/);

  const differentiatorData = createValidDataset();
  differentiatorData.programs[0].data.differentiator = 'PLGA microsphere·저 burst 지향';
  assert.match(validateDatasetRecords(differentiatorData).errors.join('\n'), /differentiator must not contain a middle dot/);

  const statusData = createValidDataset();
  statusData.programs[0].data.developmentStatus = 'IND 준비·제출 전';
  assert.match(validateDatasetRecords(statusData).errors.join('\n'), /developmentStatus must not contain a middle dot/);
});

test('middle dot in Event headline or summary fails', () => {
  const headlineData = createValidDataset();
  headlineData.events[0].data.headline = 'PK·안전성 pilot 공개';
  assert.match(validateDatasetRecords(headlineData).errors.join('\n'), /headline must not contain a middle dot/);

  const summaryData = createValidDataset();
  summaryData.events[0].data.summary = '안전성·내약성 자료 공개.';
  assert.match(validateDatasetRecords(summaryData).errors.join('\n'), /summary must not contain a middle dot/);
});

test('no stored Program or Event prose field contains a middle dot in the canonical dataset', async () => {
  const validation = await validateDataset(process.cwd());
  assert.deepEqual(validation.errors, []);
});

test('CAM2056 readout preserves the demonstratedDuration fact removed from the Program', async () => {
  const program = await readFile('src/data/programs/camurus-cam2056.json', 'utf8').then(JSON.parse);
  assert.doesNotMatch(JSON.stringify(program), /demonstratedDuration|platformPotential/);
  assert.match(program.readout, /Day 85/);
  assert.match(program.readout, /80명/);
  assert.match(program.readout, /반복 투여 PK\/PD/);
});

test('vivani NPM-139 readout already preserves the demonstratedDuration fact removed from the Program', async () => {
  const program = await readFile('src/data/programs/vivani-npm139.json', 'utf8').then(JSON.parse);
  assert.doesNotMatch(JSON.stringify(program), /demonstratedDuration|platformPotential/);
  assert.match(program.readout, /1년간/);
  assert.match(program.readout, /20% 이상 sham-adjusted/);
});

test('prolynx PLX-821 demonstratedDuration and platformPotential facts remain findable in an existing Event and differentiator', async () => {
  const [program, event] = await Promise.all([
    readFile('src/data/programs/prolynx-plx821.json', 'utf8').then(JSON.parse),
    readFile('src/data/events/2025-12-11-prolynx.json', 'utf8').then(JSON.parse),
  ]);
  assert.doesNotMatch(JSON.stringify(program), /demonstratedDuration|platformPotential/);
  assert.match(event.summary, /36일 반감기/);
  assert.match(event.summary, /20% 체중감소/);
  assert.match(program.differentiator, /분기 1회 프로그램을 동시에 추구/);
});

test('stanford PNP hydrogel demonstratedDuration and platformPotential facts remain findable in caveat', async () => {
  const program = await readFile('src/data/programs/stanford-pnp-hydrogel.json', 'utf8').then(JSON.parse);
  assert.doesNotMatch(JSON.stringify(program), /demonstratedDuration|platformPotential/);
  assert.match(program.caveat, /6주 이상/);
  assert.match(program.caveat, /4개월은 human-oriented 설계 개념/);
});

test('lezepione caveat preserves the platformPotential design-target fact without a stored interval field', async () => {
  const program = await readFile('src/data/programs/lezepione-lez001.json', 'utf8').then(JSON.parse);
  assert.doesNotMatch(JSON.stringify(program), /demonstratedDuration|platformPotential/);
  assert.equal(program.productTarget, null);
  assert.match(program.caveat, /목표 투여 간격은 비공식/);
  assert.match(program.caveat, /in vitro 방출 프로파일/);
});

test('CAM2056 latest Event and Phase 1b result Event both exist and are ordered by date', async () => {
  const [phase2bPrep, phase1bResult, program, validation] = await Promise.all([
    readFile('src/data/events/2026-07-15-camurus-phase2b-preparation.json', 'utf8').then(JSON.parse),
    readFile('src/data/events/2025-11-10-camurus-cam2056.json', 'utf8').then(JSON.parse),
    readFile('src/data/programs/camurus-cam2056.json', 'utf8').then(JSON.parse),
    validateDataset(process.cwd()),
  ]);
  assert.equal(phase2bPrep.programSlug, 'camurus-cam2056');
  assert.equal(phase1bResult.programSlug, 'camurus-cam2056');
  assert.ok(phase2bPrep.date > phase1bResult.date, 'Phase 2b preparation Event must be dated after the Phase 1b result Event');
  assert.doesNotMatch(JSON.stringify(program), /latestUpdate/);
  assert.deepEqual(validation.errors, []);
});

test('CAM2056 Phase 1b result Event preserves topline figures and interpretation limits after Phase 2b preparation Event exists', async () => {
  const phase1bResult = await readFile('src/data/events/2025-11-10-camurus-cam2056.json', 'utf8').then(JSON.parse);
  assert.match(phase1bResult.summary, /9\.3%/);
  assert.match(phase1bResult.summary, /5\.2%/);
  assert.match(phase1bResult.summary, /p=0\.008/);
  assert.match(phase1bResult.summary, /확정적 비교우월성으로 해석할 수 없다/);
  assert.ok(phase1bResult.sources.length >= 1);
});

test('backfilled migration Events preserve material facts removed from Program latestUpdate', async () => {
  const [inventageEvent, inventageProgram, prolynxEvent, prolynxProgram] = await Promise.all([
    readFile('src/data/events/2026-06-01-inventage.json', 'utf8').then(JSON.parse),
    readFile('src/data/programs/inventage-ivl3021.json', 'utf8').then(JSON.parse),
    readFile('src/data/events/2025-12-11-prolynx.json', 'utf8').then(JSON.parse),
    readFile('src/data/programs/prolynx-plx821.json', 'utf8').then(JSON.parse),
  ]);
  assert.doesNotMatch(JSON.stringify(inventageProgram), /latestUpdate/);
  assert.match(inventageEvent.summary, /DIO\)? rat/);
  assert.equal(inventageEvent.programSlug, 'inventage-ivl3021');

  assert.doesNotMatch(JSON.stringify(prolynxProgram), /latestUpdate/);
  assert.match(prolynxEvent.summary, /Series A/);
  assert.match(prolynxEvent.summary, /7000만 달러/);
  assert.equal(prolynxEvent.programSlug, 'prolynx-plx821');
});
