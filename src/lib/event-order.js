import { stageOrder } from './development-stages.js';

const significanceRank = { High: 0, Medium: 1, Low: 2 };
const developmentStageRank = new Map(stageOrder.map((stage, index) => [stage, index]));

export function compareEvents(a, b) {
  return (
    b.date.localeCompare(a.date)
    || significanceRank[a.significance] - significanceRank[b.significance]
    || a.slug.localeCompare(b.slug)
  );
}

export function sortEvents(events) {
  return [...events].sort(compareEvents);
}

export function getEventsForProgram(programSlug, events) {
  return events.filter((event) => event.programSlug === programSlug);
}

export function getLatestEventForProgram(programSlug, events) {
  return getEventsForProgram(programSlug, events)[0] ?? null;
}

export function getPrimarySource(event) {
  return event.sources[0] ?? null;
}

export function getAdditionalSourceCount(event) {
  return Math.max(event.sources.length - 1, 0);
}

export function compareProgramsByDevelopmentStage(a, b, latestEventDateBySlug) {
  const aDate = latestEventDateBySlug.get(a.slug) ?? '';
  const bDate = latestEventDateBySlug.get(b.slug) ?? '';
  return (
    (developmentStageRank.get(a.developmentStage) ?? stageOrder.length)
      - (developmentStageRank.get(b.developmentStage) ?? stageOrder.length)
    || bDate.localeCompare(aDate)
    || a.company.localeCompare(b.company)
    || a.programName.localeCompare(b.programName)
  );
}
