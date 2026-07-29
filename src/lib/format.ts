import { getStageLabel } from './development-stages.js';

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(`${date}T00:00:00Z`));
}

export function stageLabel(stage: string) {
  return getStageLabel(stage);
}

export function formatIntervalClaim(claim: IntervalClaim | null) {
  return claim?.description ?? '—';
}

export function splitClauses(text: string): string[] {
  return text
    .split(/(?<=[.?!])\s+(?=\S)/)
    .map((clause) => clause.trim())
    .filter(Boolean);
}

export {
  getProductTargetIntervalBuckets,
  intervalBucketLabels,
} from './interval-buckets.js';
export type { IntervalBucketId } from './interval-buckets.js';
export { formatPayloadComponents } from './payload-format.js';

import type { IntervalClaim } from './schema';
