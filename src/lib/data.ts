import {
  deliveryTechnologySchema,
  eventSchema,
  programSchema,
  studySchema,
  type DeliveryTechnology,
  type Program,
  type Study,
  type TrackerEvent,
} from './schema';

const programModules = import.meta.glob('../data/programs/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

const studyModules = import.meta.glob('../data/studies/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

const eventModules = import.meta.glob('../data/events/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

const deliveryTechnologyModules = import.meta.glob('../data/registries/delivery-technologies.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

function slugFromPath(path: string) {
  return path.split('/').at(-1)?.replace(/\.json$/, '') ?? path;
}

export function getPrograms(): Program[] {
  return Object.entries(programModules)
    .map(([path, data]) => ({ ...programSchema.parse(data), slug: slugFromPath(path) }))
    .sort((a, b) => b.stageRank - a.stageRank || b.latestUpdateDate.localeCompare(a.latestUpdateDate));
}

export function getStudies(): Study[] {
  return Object.entries(studyModules)
    .map(([path, data]) => ({ ...studySchema.parse(data), slug: slugFromPath(path) }))
    .sort((a, b) => a.registryId.localeCompare(b.registryId));
}

export function getStudiesForProgram(programSlug: string, studies = getStudies()) {
  return studies.filter((study) => study.programSlug === programSlug);
}

export function getDeliveryTechnologies(): DeliveryTechnology[] {
  const data = Object.values(deliveryTechnologyModules)[0];
  return deliveryTechnologySchema.array().parse(data).sort((a, b) => a.sortRank - b.sortRank);
}

export function getEvents(): TrackerEvent[] {
  return Object.entries(eventModules)
    .map(([path, data]) => ({ ...eventSchema.parse(data), slug: slugFromPath(path) }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getProgram(slug: string) {
  return getPrograms().find((program) => program.slug === slug);
}

export function getSummary(programs = getPrograms(), events = getEvents(), studies = getStudies()) {
  const active = programs.filter((program) => program.active);
  return {
    total: programs.length,
    active: active.length,
    clinicalOrHuman: programs.filter((program) =>
      ['Registered Phase I/IIa', 'Registered Phase I', 'IND submitted', 'Human PK pilot'].includes(program.developmentStage),
    ).length,
    registeredStudies: studies.length,
    latestEventDate: events[0]?.date ?? null,
    asOfDate: [
      ...programs.map((program) => program.lastVerifiedAt),
      ...studies.map((study) => study.lastVerifiedAt),
    ].sort().at(-1) ?? null,
  };
}

export const stageOrder = [
  'Registered Phase I/IIa',
  'Registered Phase I',
  'IND submitted',
  'Human PK pilot',
  'Preclinical',
  'Paused',
] as const;
