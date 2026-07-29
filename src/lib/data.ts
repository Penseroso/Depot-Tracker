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
import {
  compareEvents,
  compareProgramsByDevelopmentStage,
  getEventsForProgram as filterEventsForProgram,
  getLatestEventForProgram as pickLatestEventForProgram,
} from './event-order.js';
import {
  getActiveProgramCount,
  getPatentLinkedRatio,
  getTrialRegistrationCount,
} from './program-stats.js';

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
  const events = getEvents();
  const latestEventDateBySlug = new Map<string, string>();
  for (const event of events) {
    if (!latestEventDateBySlug.has(event.programSlug)) {
      latestEventDateBySlug.set(event.programSlug, event.date);
    }
  }
  return Object.entries(programModules)
    .map(([path, data]) => ({ ...programSchema.parse(data), slug: slugFromPath(path) }))
    .sort((a, b) => compareProgramsByDevelopmentStage(a, b, latestEventDateBySlug));
}

export function getStudies(): Study[] {
  return Object.entries(studyModules)
    .map(([path, data]) => ({ ...studySchema.parse(data), slug: slugFromPath(path) }))
    .sort((a, b) => a.registry.localeCompare(b.registry) || a.registryId.localeCompare(b.registryId));
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
    .sort(compareEvents);
}

export function getEventsForProgram(programSlug: string, events = getEvents()): TrackerEvent[] {
  return filterEventsForProgram(programSlug, events);
}

export function getLatestEventForProgram(programSlug: string, events = getEvents()): TrackerEvent | null {
  return pickLatestEventForProgram(programSlug, events);
}

export function getProgram(slug: string) {
  return getPrograms().find((program) => program.slug === slug);
}

export function getSummary(programs = getPrograms(), events = getEvents(), studies = getStudies()) {
  const patentLinked = getPatentLinkedRatio(programs);
  return {
    total: programs.length,
    active: getActiveProgramCount(programs),
    trialRegistrations: getTrialRegistrationCount(studies),
    patentLinkedPrograms: patentLinked.linked,
    patentLinkedPercent: patentLinked.percent,
    latestEventDate: events[0]?.date ?? null,
    asOfDate: [
      ...programs.map((program) => program.lastVerifiedAt),
      ...studies.map((study) => study.lastVerifiedAt),
    ].sort().at(-1) ?? null,
  };
}

export { stageOrder } from './development-stages.js';
