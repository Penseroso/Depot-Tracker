export const intervalBucketLabels: Readonly<{
  'weekly-or-shorter': '주 1회 이하';
  biweekly: '2주';
  monthly: '월 1회';
  'two-to-three-months': '2~3개월';
  'four-to-six-months': '4~6개월';
  longer: '6개월 초과';
  unspecified: '미상/해당 없음';
}>;

export type IntervalBucketId = keyof typeof intervalBucketLabels;

export function getProductTargetIntervalBuckets(
  claim: { minDays: number | null; maxDays: number | null } | null,
): IntervalBucketId[];
