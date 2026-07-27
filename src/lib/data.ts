import { eventSchema, programSchema, type Program, type TrackerEvent } from './schema';

const programModules = import.meta.glob('../data/assets/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

const eventModules = import.meta.glob('../data/events/*.json', {
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

export function getEvents(): TrackerEvent[] {
  return Object.entries(eventModules)
    .map(([path, data]) => ({ ...eventSchema.parse(data), slug: slugFromPath(path) }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getProgram(slug: string) {
  return getPrograms().find((program) => program.slug === slug);
}

export function getSummary(programs = getPrograms(), events = getEvents()) {
  const active = programs.filter((program) => program.active);
  return {
    total: programs.length,
    active: active.length,
    clinicalOrHuman: programs.filter((program) =>
      ['Registered Phase I/IIa', 'Registered Phase I', 'IND submitted', 'Human PK pilot'].includes(program.evidenceStage),
    ).length,
    nonMicrosphere: active.filter((program) => program.modalityGroup === 'other depot').length,
    latestEventDate: events[0]?.date ?? null,
    asOfDate: programs.map((program) => program.lastVerifiedAt).sort().at(-1) ?? null,
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
