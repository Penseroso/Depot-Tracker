type EventSource = { label: string; url: string; sourceType: string; accessedOn: string };

type OrderableEvent = {
  programSlug: string;
  date: string;
  significance: 'High' | 'Medium' | 'Low';
  slug: string;
  sources?: readonly EventSource[];
};

type OrderableProgram = {
  slug: string;
  stageRank: number;
  company: string;
  programName: string;
};

export function compareEvents(a: OrderableEvent, b: OrderableEvent): number;
export function sortEvents<T extends OrderableEvent>(events: readonly T[]): T[];
export function getEventsForProgram<T extends OrderableEvent>(programSlug: string, events: readonly T[]): T[];
export function getLatestEventForProgram<T extends OrderableEvent>(programSlug: string, events: readonly T[]): T | null;
export function getPrimarySource(event: { sources: readonly EventSource[] }): EventSource | null;
export function getAdditionalSourceCount(event: { sources: readonly EventSource[] }): number;
export function compareProgramsByActivity<T extends OrderableProgram>(
  a: T,
  b: T,
  latestEventDateBySlug: Map<string, string>,
): number;
