import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { developmentStages } from '../src/lib/development-stages.js';

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const canonicalRegistryNamePattern = /^[A-Z0-9][A-Za-z0-9]*(?:[ .-][A-Za-z0-9]+)*$/;
const officialRegistryHosts = new Map([
  ['ClinicalTrials.gov', new Set(['clinicaltrials.gov', 'www.clinicaltrials.gov'])],
  ['CTIS', new Set(['euclinicaltrials.eu', 'www.euclinicaltrials.eu'])],
]);
const recruitmentStatuses = new Set([
  'not-yet-recruiting',
  'recruiting',
  'enrolling-by-invitation',
  'active-not-recruiting',
  'suspended',
  'terminated',
  'withdrawn',
  'completed',
  'unknown',
]);
const recordTypes = new Set(['sponsor-program', 'technology-watch']);
const companyPlatformRelationships = new Set(['ownership', 'license', 'access']);
const relationshipStatuses = new Set(['current', 'former']);
const allowedDevelopmentStages = new Set(developmentStages);
const legacyProgramKeys = [
  'asset',
  'modality',
  'modalityGroup',
  'targetInterval',
  'evidenceStage',
  'regulatoryStatus',
  'payload',
  'registryId',
  'geography',
  'programRegionContext',
  'latestUpdate',
  'latestUpdateDate',
  'demonstratedDuration',
  'platformPotential',
];
const legacyEventKeys = ['asset', 'source'];

const isDate = (value) =>
  typeof value === 'string'
  && datePattern.test(value)
  && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

const isUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

async function readJsonDir(dir, errors) {
  const names = (await readdir(dir)).filter((name) => name.endsWith('.json')).sort();
  return Promise.all(names.map(async (name) => {
    const file = path.join(dir, name);
    try {
      return { name, slug: name.replace(/\.json$/, ''), data: JSON.parse(await readFile(file, 'utf8')) };
    } catch (error) {
      errors.push(`${name}: invalid JSON (${error.message})`);
      return { name, slug: name.replace(/\.json$/, ''), data: null };
    }
  }));
}

function requireString(record, field, file, errors) {
  if (typeof record?.[field] !== 'string' || !record[field].trim()) {
    errors.push(`${file}: ${field} must be a non-empty string`);
  }
}

function rejectLegacyKeys(record, keys, file, errors) {
  for (const key of keys) {
    if (Object.hasOwn(record ?? {}, key)) errors.push(`${file}: legacy field ${key} is not allowed`);
  }
}

function rejectMiddleDot(record, field, file, errors) {
  const value = record?.[field];
  if (typeof value === 'string' && value.includes('·')) {
    errors.push(`${file}: ${field} must not contain a middle dot (·); use a comma, 또는, 및, or | instead`);
  }
}

function validateSource(source, label, errors) {
  requireString(source, 'label', label, errors);
  requireString(source, 'sourceType', label, errors);
  if (!isUrl(source?.url)) errors.push(`${label}: url must be http(s)`);
  if (!isDate(source?.accessedOn)) errors.push(`${label}: accessedOn must be YYYY-MM-DD`);
}

function validateIntervalClaim(claim, field, file, errors) {
  if (claim === null) return;
  if (!claim || typeof claim !== 'object' || Array.isArray(claim)) {
    errors.push(`${file}: ${field} must be an object or null`);
    return;
  }
  for (const key of Object.keys(claim)) {
    if (!['description', 'minDays', 'maxDays'].includes(key)) {
      errors.push(`${file}: ${field} has unknown key ${key}`);
    }
  }
  requireString(claim, 'description', `${file}: ${field}`, errors);
  for (const key of ['minDays', 'maxDays']) {
    const value = claim[key];
    if (value !== null && (!Number.isInteger(value) || value < 1)) {
      errors.push(`${file}: ${field}.${key} must be a positive integer or null`);
    }
  }
  if (Number.isInteger(claim.minDays) && Number.isInteger(claim.maxDays) && claim.minDays > claim.maxDays) {
    errors.push(`${file}: ${field}.minDays cannot be greater than maxDays`);
  }
}

function validatePayloadComponents(components, file, errors) {
  if (!Array.isArray(components) || components.length === 0) {
    errors.push(`${file}: payloadComponents must be a non-empty array`);
    return;
  }
  const seen = new Set();
  for (const component of components) {
    if (typeof component !== 'string' || !component) {
      errors.push(`${file}: payloadComponents must contain non-empty strings`);
      continue;
    }
    if (component !== component.trim()) {
      errors.push(`${file}: payload component must not have surrounding whitespace (${component})`);
    }
    if (component !== component.toLowerCase()) {
      errors.push(`${file}: payload component must be lower-case (${component})`);
    }
    if (component.includes('+')) {
      errors.push(`${file}: payload component must not contain + (${component})`);
    }
    if (seen.has(component)) errors.push(`${file}: duplicate payload component ${component}`);
    seen.add(component);
  }
}

function validateRegistrySource(registry, source, file, errors) {
  const allowedHosts = officialRegistryHosts.get(registry);
  if (!canonicalRegistryNamePattern.test(registry ?? '') || !allowedHosts) {
    errors.push(`${file}: registry must use a supported canonical official name (${registry})`);
    return;
  }
  if (!isUrl(source?.url)) return;
  const hostname = new URL(source.url).hostname.toLowerCase();
  if (!allowedHosts.has(hostname)) {
    errors.push(`${file}: registrySource URL is not an official ${registry} source`);
  }
}

export function validateDatasetRecords({
  programs,
  studies,
  events,
  deliveryTechnologies,
  companies = [],
  platforms = [],
}) {
  const errors = [];
  const technologyIds = new Set();
  const technologyLabels = new Set();
  const technologyShortLabels = new Set();
  const technologySortRanks = new Set();

  if (!Array.isArray(deliveryTechnologies)) {
    errors.push('delivery-technologies.json: registry must be an array');
  } else {
    deliveryTechnologies.forEach((technology, index) => {
      const label = `delivery-technologies.json[${index}]`;
      for (const field of ['id', 'label', 'shortLabel']) requireString(technology, field, label, errors);
      if (!slugPattern.test(technology?.id ?? '')) errors.push(`${label}: id must be a lowercase slug`);
      if (!Number.isInteger(technology?.sortRank) || technology.sortRank < 0) {
        errors.push(`${label}: sortRank must be a non-negative integer`);
      }
      for (const key of Object.keys(technology ?? {})) {
        if (!['id', 'label', 'shortLabel', 'sortRank'].includes(key)) errors.push(`${label}: unknown key ${key}`);
      }
      if (technologyIds.has(technology.id)) errors.push(`${label}: duplicate id ${technology.id}`);
      if (technologyLabels.has(technology.label)) errors.push(`${label}: duplicate label ${technology.label}`);
      if (technologyShortLabels.has(technology.shortLabel)) errors.push(`${label}: duplicate shortLabel ${technology.shortLabel}`);
      if (technologySortRanks.has(technology.sortRank)) errors.push(`${label}: duplicate sortRank ${technology.sortRank}`);
      technologyIds.add(technology.id);
      technologyLabels.add(technology.label);
      technologyShortLabels.add(technology.shortLabel);
      technologySortRanks.add(technology.sortRank);
    });
  }

  const programMap = new Map();
  const programSourceUrls = new Set();
  const storedProgramCompanyNames = new Set();
  const sponsorProgramCompanyNames = new Set();
  for (const { name, slug, data } of programs) {
    if (!data) continue;
    if (!slugPattern.test(slug)) errors.push(`${name}: program slug must be a lowercase slug`);
    if (programMap.has(slug)) errors.push(`${name}: duplicate program slug ${slug}`);
    programMap.set(slug, data);
    storedProgramCompanyNames.add(data.company);
    if (data.recordType === 'sponsor-program') sponsorProgramCompanyNames.add(data.company);
    rejectLegacyKeys(data, legacyProgramKeys, name, errors);

    for (const field of [
      'company',
      'programName',
      'recordType',
      'deliveryTechnologyId',
      'deliveryTechnology',
      'route',
      'developmentStage',
      'developmentStatus',
      'readout',
      'differentiator',
      'caveat',
      'confidence',
    ]) requireString(data, field, name, errors);
    for (const field of ['developmentStatus', 'readout', 'differentiator', 'caveat']) {
      rejectMiddleDot(data, field, name, errors);
    }

    validatePayloadComponents(data.payloadComponents, name, errors);
    if (!recordTypes.has(data.recordType)) errors.push(`${name}: recordType is not allowed (${data.recordType})`);
    if (!allowedDevelopmentStages.has(data.developmentStage)) {
      errors.push(`${name}: developmentStage is not allowed (${data.developmentStage})`);
    }
    if (!technologyIds.has(data.deliveryTechnologyId)) {
      errors.push(`${name}: deliveryTechnologyId is not registered (${data.deliveryTechnologyId})`);
    }
    for (const field of ['productTarget']) {
      if (!Object.hasOwn(data, field)) errors.push(`${name}: ${field} is required`);
      else validateIntervalClaim(data[field], field, name, errors);
    }
    if (!isDate(data.lastVerifiedAt)) errors.push(`${name}: lastVerifiedAt must be YYYY-MM-DD`);
    if (typeof data.active !== 'boolean') errors.push(`${name}: active must be boolean`);
    if (!Number.isInteger(data.stageRank) || data.stageRank < 0 || data.stageRank > 100) {
      errors.push(`${name}: stageRank must be an integer 0-100`);
    }
    if (!Array.isArray(data.sources) || data.sources.length === 0) {
      errors.push(`${name}: sources must contain at least one source`);
    } else {
      const urls = new Set();
      data.sources.forEach((source, index) => {
        validateSource(source, `${name} source[${index}]`, errors);
        programSourceUrls.add(source.url);
        if (urls.has(source.url)) errors.push(`${name}: duplicate source URL ${source.url}`);
        urls.add(source.url);
        if (isDate(source.accessedOn) && isDate(data.lastVerifiedAt) && source.accessedOn > data.lastVerifiedAt) {
          errors.push(`${name}: source accessedOn cannot be after lastVerifiedAt`);
        }
      });
    }
  }

  const companyMap = new Map();
  const mappedProgramCompanyNames = new Map();
  for (const { name, slug, data } of companies) {
    if (!data) continue;
    if (!slugPattern.test(slug)) errors.push(`${name}: company slug must be a lowercase slug`);
    if (companyMap.has(slug)) errors.push(`${name}: duplicate company slug ${slug}`);
    companyMap.set(slug, data);
    for (const key of Object.keys(data)) {
      if (!['name', 'visibility', 'homepageUrl', 'pipelineUrl', 'programCompanyNames', 'lastVerifiedAt'].includes(key)) {
        errors.push(`${name}: unknown key ${key}`);
      }
    }
    requireString(data, 'name', name, errors);
    requireString(data, 'visibility', name, errors);
    if (!['public', 'internal'].includes(data.visibility)) {
      errors.push(`${name}: visibility must be public or internal`);
    }
    if (data.visibility === 'public') {
      if (data.homepageUrl !== null && !isUrl(data.homepageUrl)) {
        errors.push(`${name}: public Company homepageUrl must be http(s) or null`);
      }
      if (data.pipelineUrl !== null && !isUrl(data.pipelineUrl)) {
        errors.push(`${name}: public Company pipelineUrl must be http(s) or null`);
      }
    } else if (data.homepageUrl !== null || data.pipelineUrl !== null) {
      errors.push(`${name}: internal Company homepageUrl and pipelineUrl must be null`);
    }
    if (!isDate(data.lastVerifiedAt)) errors.push(`${name}: lastVerifiedAt must be YYYY-MM-DD`);
    if (!Array.isArray(data.programCompanyNames) || data.programCompanyNames.length === 0) {
      errors.push(`${name}: programCompanyNames must be a non-empty array`);
    } else {
      const localNames = new Set();
      for (const companyName of data.programCompanyNames) {
        if (typeof companyName !== 'string' || !companyName.trim()) {
          errors.push(`${name}: programCompanyNames must contain non-empty strings`);
          continue;
        }
        if (localNames.has(companyName)) errors.push(`${name}: duplicate programCompanyName ${companyName}`);
        localNames.add(companyName);
        if (!storedProgramCompanyNames.has(companyName)) {
          errors.push(`${name}: programCompanyName does not match a stored Program company (${companyName})`);
        }
        const mappedSlugs = mappedProgramCompanyNames.get(companyName) ?? [];
        mappedSlugs.push(slug);
        mappedProgramCompanyNames.set(companyName, mappedSlugs);
      }
    }
  }

  for (const companyName of storedProgramCompanyNames) {
    if (!mappedProgramCompanyNames.has(companyName)) {
      errors.push(`Program company must map to a Company or the internal other bucket (${companyName})`);
    } else if (sponsorProgramCompanyNames.has(companyName)
      && !mappedProgramCompanyNames.get(companyName).some((slug) => companyMap.get(slug)?.visibility === 'public')) {
      errors.push(`Sponsor Program company must map to at least one public Company page (${companyName})`);
    }
  }

  const platformSlugs = new Set();
  for (const { name, slug, data } of platforms) {
    if (!data) continue;
    if (!slugPattern.test(slug)) errors.push(`${name}: platform slug must be a lowercase slug`);
    if (platformSlugs.has(slug)) errors.push(`${name}: duplicate platform slug ${slug}`);
    platformSlugs.add(slug);
    for (const key of Object.keys(data)) {
      if (!['name', 'aliases', 'officialUrl', 'relationships', 'patentEvidence', 'lastVerifiedAt'].includes(key)) {
        errors.push(`${name}: unknown key ${key}`);
      }
    }
    requireString(data, 'name', name, errors);
    if (!isUrl(data.officialUrl)) errors.push(`${name}: officialUrl must be http(s)`);
    if (!isDate(data.lastVerifiedAt)) errors.push(`${name}: lastVerifiedAt must be YYYY-MM-DD`);
    if (!Array.isArray(data.aliases)) {
      errors.push(`${name}: aliases must be an array`);
    } else if (new Set(data.aliases).size !== data.aliases.length) {
      errors.push(`${name}: aliases must be unique`);
    }

    if (!Array.isArray(data.relationships) || data.relationships.length === 0) {
      errors.push(`${name}: relationships must contain at least one relationship`);
    } else {
      const relationshipKeys = new Set();
      let hasCurrentRelationship = false;
      data.relationships.forEach((relationship, index) => {
        const label = `${name} relationship[${index}]`;
        for (const key of Object.keys(relationship ?? {})) {
          if (!['companySlug', 'relationship', 'status', 'rightsHolderName', 'basis', 'source'].includes(key)) {
            errors.push(`${label}: unknown key ${key}`);
          }
        }
        for (const field of ['companySlug', 'relationship', 'status', 'rightsHolderName', 'basis']) {
          requireString(relationship, field, label, errors);
        }
        if (!companyMap.has(relationship.companySlug)) {
          errors.push(`${label}: missing Company reference ${relationship.companySlug}`);
        } else if (companyMap.get(relationship.companySlug).visibility !== 'public') {
          errors.push(`${label}: Platform relationship must reference a public Company`);
        }
        if (!companyPlatformRelationships.has(relationship.relationship)) {
          errors.push(`${label}: relationship is not allowed (${relationship.relationship})`);
        }
        if (!relationshipStatuses.has(relationship.status)) {
          errors.push(`${label}: status is not allowed (${relationship.status})`);
        }
        if (relationship.status === 'current') hasCurrentRelationship = true;
        const identity = `${relationship.companySlug}\u0000${relationship.relationship}\u0000${relationship.status}`;
        if (relationshipKeys.has(identity)) errors.push(`${label}: duplicate Company-Platform relationship`);
        relationshipKeys.add(identity);
        validateSource(relationship.source, `${label} source`, errors);
        if (isDate(relationship.source?.accessedOn) && isDate(data.lastVerifiedAt)
          && relationship.source.accessedOn > data.lastVerifiedAt) {
          errors.push(`${label}: source accessedOn cannot be after lastVerifiedAt`);
        }
      });
      if (!hasCurrentRelationship) errors.push(`${name}: at least one current relationship is required`);
    }

    if (!Array.isArray(data.patentEvidence) || data.patentEvidence.length === 0) {
      errors.push(`${name}: patentEvidence must contain at least one representative family`);
    } else {
      const evidenceUrls = new Set();
      data.patentEvidence.forEach((evidence, index) => {
        const label = `${name} patentEvidence[${index}]`;
        for (const key of Object.keys(evidence ?? {})) {
          if (![
            'familyId',
            'publicationNumber',
            'grantNumber',
            'earliestPriority',
            'currentAssignee',
            'jurisdiction',
            'legalStatus',
            'url',
            'accessedOn',
          ].includes(key)) errors.push(`${label}: unknown key ${key}`);
        }
        for (const field of [
          'familyId',
          'publicationNumber',
          'currentAssignee',
          'jurisdiction',
          'legalStatus',
        ]) requireString(evidence, field, label, errors);
        if (evidence.grantNumber !== null) requireString(evidence, 'grantNumber', label, errors);
        if (!isDate(evidence.earliestPriority)) errors.push(`${label}: earliestPriority must be YYYY-MM-DD`);
        if (!isDate(evidence.accessedOn)) errors.push(`${label}: accessedOn must be YYYY-MM-DD`);
        if (!isUrl(evidence.url)) errors.push(`${label}: url must be http(s)`);
        if (evidenceUrls.has(evidence.url)) errors.push(`${name}: duplicate patent evidence URL ${evidence.url}`);
        evidenceUrls.add(evidence.url);
        if (programSourceUrls.has(evidence.url)) {
          errors.push(`${name}: platform-level patent evidence must not be linked from Program.sources (${evidence.url})`);
        }
        if (isDate(evidence.accessedOn) && isDate(data.lastVerifiedAt)
          && evidence.accessedOn > data.lastVerifiedAt) {
          errors.push(`${label}: accessedOn cannot be after lastVerifiedAt`);
        }
      });
    }
  }

  const studyMap = new Map();
  const studyProgramSlugs = new Set();
  const registryIdentities = new Set();
  for (const { name, slug, data } of studies) {
    if (!data) continue;
    if (!slugPattern.test(slug)) errors.push(`${name}: study slug must be a lowercase slug`);
    if (studyMap.has(slug)) errors.push(`${name}: duplicate study slug ${slug}`);
    studyMap.set(slug, data);
    studyProgramSlugs.add(data.programSlug);
    for (const field of ['programSlug', 'registry', 'registryId', 'phase', 'recruitmentStatus', 'registryStatusRaw']) {
      requireString(data, field, name, errors);
    }
    if (!programMap.has(data.programSlug)) errors.push(`${name}: missing Program reference ${data.programSlug}`);
    if (data.registry !== data.registry?.trim()) errors.push(`${name}: registry must not have surrounding whitespace`);
    if (data.registryId !== data.registryId?.trim()) errors.push(`${name}: registryId must not have surrounding whitespace`);
    const registryIdentity = `${data.registry}\u0000${data.registryId}`;
    if (registryIdentities.has(registryIdentity)) {
      errors.push(`${name}: duplicate registry identity ${data.registry} / ${data.registryId}`);
    }
    registryIdentities.add(registryIdentity);
    if (!recruitmentStatuses.has(data.recruitmentStatus)) {
      errors.push(`${name}: recruitmentStatus is not allowed (${data.recruitmentStatus})`);
    }
    if (!isDate(data.lastVerifiedAt)) errors.push(`${name}: lastVerifiedAt must be YYYY-MM-DD`);
    validateSource(data.registrySource, `${name} registrySource`, errors);
    if (data.registrySource?.sourceType !== 'registry') {
      errors.push(`${name}: registrySource.sourceType must be registry`);
    }
    validateRegistrySource(data.registry, data.registrySource, name, errors);
    if (isDate(data.registrySource?.accessedOn) && isDate(data.lastVerifiedAt)
      && data.registrySource.accessedOn > data.lastVerifiedAt) {
      errors.push(`${name}: registrySource.accessedOn cannot be after lastVerifiedAt`);
    }
    if (!Array.isArray(data.countries)) {
      errors.push(`${name}: countries must be an array`);
    } else {
      const countries = new Set();
      for (const country of data.countries) {
        if (typeof country !== 'string' || !country.trim()) errors.push(`${name}: countries must contain non-empty strings`);
        if (country !== country?.trim()) errors.push(`${name}: country names must not have surrounding whitespace`);
        if (countries.has(country)) errors.push(`${name}: duplicate country ${country}`);
        countries.add(country);
      }
    }
  }

  for (const [slug, program] of programMap) {
    if (program.developmentStage?.startsWith('Registered Phase ') && !studyProgramSlugs.has(slug)) {
      errors.push(`${slug}: registered developmentStage requires a linked official Study`);
    }
  }

  const seenEventIdentities = new Set();
  for (const { name, data } of events) {
    if (!data) continue;
    rejectLegacyKeys(data, legacyEventKeys, name, errors);
    for (const field of ['programSlug', 'company', 'programName', 'category', 'headline', 'summary', 'significance']) {
      requireString(data, field, name, errors);
    }
    for (const field of ['headline', 'summary']) {
      rejectMiddleDot(data, field, name, errors);
    }
    if (!programMap.has(data.programSlug)) errors.push(`${name}: missing Program reference ${data.programSlug}`);
    if (data.studySlug !== undefined) {
      requireString(data, 'studySlug', name, errors);
      const study = studyMap.get(data.studySlug);
      if (!study) errors.push(`${name}: missing Study reference ${data.studySlug}`);
      else if (study.programSlug !== data.programSlug) {
        errors.push(`${name}: Study ${data.studySlug} belongs to another Program`);
      }
    }
    if (!isDate(data.date)) errors.push(`${name}: date must be YYYY-MM-DD`);
    if (!Array.isArray(data.sources) || data.sources.length === 0) {
      errors.push(`${name}: sources must contain at least one source`);
    } else {
      data.sources.forEach((source, index) => {
        validateSource(source, `${name} sources[${index}]`, errors);
        if (isDate(data.date) && isDate(source?.accessedOn) && data.date > source.accessedOn) {
          errors.push(`${name}: event date cannot be after sources[${index}] accessedOn`);
        }
      });
    }
    if (isDate(data.date) && typeof data.headline === 'string') {
      const identity = `${data.programSlug} ${data.date} ${data.headline}`;
      if (seenEventIdentities.has(identity)) {
        errors.push(`${name}: duplicate Event for the same Program, date, and headline`);
      }
      seenEventIdentities.add(identity);
    }
  }

  return {
    errors,
    counts: {
      programs: programs.length,
      studies: studies.length,
      events: events.length,
      deliveryTechnologies: Array.isArray(deliveryTechnologies) ? deliveryTechnologies.length : 0,
      companies: companies.length,
      platforms: platforms.length,
    },
  };
}

export async function validateDataset(root) {
  const errors = [];
  const [programs, studies, events, deliveryTechnologies, companies, platforms] = await Promise.all([
    readJsonDir(path.join(root, 'src/data/programs'), errors),
    readJsonDir(path.join(root, 'src/data/studies'), errors),
    readJsonDir(path.join(root, 'src/data/events'), errors),
    readFile(path.join(root, 'src/data/registries/delivery-technologies.json'), 'utf8')
      .then((text) => JSON.parse(text))
      .catch((error) => {
        errors.push(`delivery-technologies.json: invalid JSON (${error.message})`);
        return [];
      }),
    readJsonDir(path.join(root, 'src/data/companies'), errors),
    readJsonDir(path.join(root, 'src/data/platforms'), errors),
  ]);
  const result = validateDatasetRecords({
    programs,
    studies,
    events,
    deliveryTechnologies,
    companies,
    platforms,
  });
  return { ...result, errors: [...errors, ...result.errors] };
}
