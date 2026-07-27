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

export const intervalBucketLabels = {
  'weekly-or-shorter': '주 1회 이하',
  biweekly: '2주',
  monthly: '월 1회',
  bimonthly: '2개월',
  quarterly: '분기',
  'four-month': '4개월',
  'six-month': '6개월',
  longer: '6개월 초과',
  range: '범위형',
  unspecified: '미상/해당 없음',
} as const;

export type IntervalBucketId = keyof typeof intervalBucketLabels;

function bucketForDay(days: number): IntervalBucketId {
  if (days <= 7) return 'weekly-or-shorter';
  if (days <= 14) return 'biweekly';
  if (days <= 31) return 'monthly';
  if (days <= 62) return 'bimonthly';
  if (days <= 92) return 'quarterly';
  if (days <= 123) return 'four-month';
  if (days <= 184) return 'six-month';
  return 'longer';
}

export function getIntervalBucket(claim: IntervalClaim | null): IntervalBucketId {
  if (!claim || claim.minDays == null && claim.maxDays == null) return 'unspecified';
  if (claim.minDays == null || claim.maxDays == null) return 'range';
  const minBucket = bucketForDay(claim.minDays);
  const maxBucket = bucketForDay(claim.maxDays);
  return minBucket === maxBucket ? minBucket : 'range';
}

export function confidenceLabel(value: string) {
  return value === 'High' ? '높음' : value === 'Medium' ? '중간' : '낮음';
}
import type { IntervalClaim } from './schema';
