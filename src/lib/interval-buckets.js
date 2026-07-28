export const intervalBucketLabels = Object.freeze({
  'weekly-or-shorter': '주 1회 이하',
  biweekly: '2주',
  monthly: '월 1회',
  'two-to-three-months': '2~3개월',
  'four-to-six-months': '4~6개월',
  longer: '6개월 초과',
  unspecified: '미상/해당 없음',
});

const boundedBuckets = [
  { id: 'weekly-or-shorter', minDays: 1, maxDays: 7 },
  { id: 'biweekly', minDays: 8, maxDays: 14 },
  { id: 'monthly', minDays: 15, maxDays: 31 },
  { id: 'two-to-three-months', minDays: 32, maxDays: 92 },
  { id: 'four-to-six-months', minDays: 93, maxDays: 184 },
  { id: 'longer', minDays: 185, maxDays: Number.POSITIVE_INFINITY },
];

export function getProductTargetIntervalBuckets(claim) {
  if (!claim || claim.minDays == null && claim.maxDays == null) return ['unspecified'];

  const rangeMin = claim.minDays ?? 1;
  const rangeMax = claim.maxDays ?? Number.POSITIVE_INFINITY;

  return boundedBuckets
    .filter((bucket) => rangeMin <= bucket.maxDays && rangeMax >= bucket.minDays)
    .map((bucket) => bucket.id);
}
