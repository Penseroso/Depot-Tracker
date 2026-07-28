export function formatDate(date: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(`${date}T00:00:00Z`));
}

export function stageLabel(stage: string) {
  const labels: Record<string, string> = {
    'Registered Phase I/IIa': '등록 1/2a상',
    'Registered Phase I': '등록 1상',
    'IND submitted': 'IND 제출',
    'Human PK pilot': '사람 PK 파일럿',
    Preclinical: '비임상',
    Paused: '보류',
  };
  return labels[stage] ?? stage;
}

export function formatIntervalClaim(claim: IntervalClaim | null) {
  return claim?.description ?? '—';
}

export function formatPayload(payload: string) {
  return payload.charAt(0).toUpperCase() + payload.slice(1);
}

export {
  getProductTargetIntervalBuckets,
  intervalBucketLabels,
} from './interval-buckets.js';
export type { IntervalBucketId } from './interval-buckets.js';

export function confidenceLabel(value: string) {
  return value === 'High' ? '높음' : value === 'Medium' ? '중간' : '낮음';
}
import type { IntervalClaim } from './schema';
