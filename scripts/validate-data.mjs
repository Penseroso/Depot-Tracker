import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const assetDir = path.join(root, 'src/data/assets');
const eventDir = path.join(root, 'src/data/events');
const errors = [];

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const isDate = (value) => typeof value === 'string' && datePattern.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
const isUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

async function readJsonDir(dir) {
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

function requireString(record, field, file) {
  if (typeof record?.[field] !== 'string' || !record[field].trim()) errors.push(`${file}: ${field} must be a non-empty string`);
}

function validateSource(source, label) {
  requireString(source, 'label', label);
  requireString(source, 'sourceType', label);
  if (!isUrl(source?.url)) errors.push(`${label}: url must be http(s)`);
  if (!isDate(source?.accessedOn)) errors.push(`${label}: accessedOn must be YYYY-MM-DD`);
}

const assets = await readJsonDir(assetDir);
const events = await readJsonDir(eventDir);
const assetMap = new Map();

for (const { name, slug, data } of assets) {
  if (!data) continue;
  if (assetMap.has(slug)) errors.push(`${name}: duplicate program slug ${slug}`);
  assetMap.set(slug, data);

  for (const field of ['company', 'asset', 'modality', 'modalityGroup', 'targetInterval', 'route', 'evidenceStage', 'regulatoryStatus', 'geography', 'latestUpdate', 'readout', 'differentiator', 'caveat', 'confidence']) {
    requireString(data, field, name);
  }
  if (!isDate(data.latestUpdateDate)) errors.push(`${name}: latestUpdateDate must be YYYY-MM-DD`);
  if (!isDate(data.lastVerifiedAt)) errors.push(`${name}: lastVerifiedAt must be YYYY-MM-DD`);
  if (isDate(data.latestUpdateDate) && isDate(data.lastVerifiedAt) && data.latestUpdateDate > data.lastVerifiedAt) {
    errors.push(`${name}: latestUpdateDate cannot be after lastVerifiedAt`);
  }
  if (typeof data.active !== 'boolean') errors.push(`${name}: active must be boolean`);
  if (!Number.isInteger(data.stageRank) || data.stageRank < 0 || data.stageRank > 100) errors.push(`${name}: stageRank must be an integer 0-100`);
  if (!Array.isArray(data.sources) || data.sources.length === 0) {
    errors.push(`${name}: sources must contain at least one source`);
  } else {
    const urls = new Set();
    data.sources.forEach((source, index) => {
      validateSource(source, `${name} source[${index}]`);
      if (urls.has(source.url)) errors.push(`${name}: duplicate source URL ${source.url}`);
      urls.add(source.url);
      if (isDate(source.accessedOn) && isDate(data.lastVerifiedAt) && source.accessedOn > data.lastVerifiedAt) {
        errors.push(`${name}: source accessedOn cannot be after lastVerifiedAt`);
      }
    });
  }
}

const latestEventByProgram = new Map();
for (const { name, data } of events) {
  if (!data) continue;
  for (const field of ['programSlug', 'company', 'asset', 'category', 'headline', 'significance']) requireString(data, field, name);
  if (!assetMap.has(data.programSlug)) errors.push(`${name}: programSlug does not match an asset file (${data.programSlug})`);
  if (!isDate(data.date)) errors.push(`${name}: date must be YYYY-MM-DD`);
  validateSource(data.source, `${name} source`);
  if (isDate(data.date) && isDate(data.source?.accessedOn) && data.date > data.source.accessedOn) {
    errors.push(`${name}: event date cannot be after source accessedOn`);
  }
  const prior = latestEventByProgram.get(data.programSlug);
  if (!prior || data.date > prior) latestEventByProgram.set(data.programSlug, data.date);
}

for (const [slug, latestEvent] of latestEventByProgram) {
  const program = assetMap.get(slug);
  if (program && isDate(program.latestUpdateDate) && latestEvent > program.latestUpdateDate) {
    errors.push(`${slug}: latestUpdateDate ${program.latestUpdateDate} is older than latest event ${latestEvent}`);
  }
}

if (errors.length) {
  console.error(`Data validation failed with ${errors.length} issue(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Data validation passed: ${assets.length} programs, ${events.length} events.`);
