import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getProductTargetIntervalBuckets,
  intervalBucketLabels,
} from '../src/lib/interval-buckets.js';

test('interval bucket labels expose only the simplified product-target buckets', () => {
  assert.deepEqual(Object.values(intervalBucketLabels), [
    '주 1회 이하',
    '2주',
    '월 1회',
    '2~3개월',
    '4~6개월',
    '6개월 초과',
    '미상/해당 없음',
  ]);
});

test('Q4W and calendar-month targets share the monthly bucket', () => {
  assert.deepEqual(
    getProductTargetIntervalBuckets({ description: 'Q4W', minDays: 28, maxDays: 28 }),
    ['monthly'],
  );
  assert.deepEqual(
    getProductTargetIntervalBuckets({ description: '월 1회', minDays: 28, maxDays: 31 }),
    ['monthly'],
  );
});

test('a target spanning multiple intervals belongs to every overlapping bucket', () => {
  assert.deepEqual(
    getProductTargetIntervalBuckets({ description: '1~3개월', minDays: 28, maxDays: 92 }),
    ['monthly', 'two-to-three-months'],
  );
  assert.deepEqual(
    getProductTargetIntervalBuckets({ description: '6개월~1년', minDays: 182, maxDays: 365 }),
    ['four-to-six-months', 'longer'],
  );
});

test('open ranges include every overlapping bucket', () => {
  assert.deepEqual(
    getProductTargetIntervalBuckets({ description: '4개월 이상', minDays: 112, maxDays: null }),
    ['four-to-six-months', 'longer'],
  );
});

test('missing product targets use only the unspecified bucket', () => {
  assert.deepEqual(getProductTargetIntervalBuckets(null), ['unspecified']);
  assert.deepEqual(
    getProductTargetIntervalBuckets({ description: '미상', minDays: null, maxDays: null }),
    ['unspecified'],
  );
});

test('induction wording does not add an interval outside the encoded maintenance target', () => {
  assert.deepEqual(
    getProductTargetIntervalBuckets({
      description: '격주 유도 용량 2회 후 월 1회 유지',
      minDays: 28,
      maxDays: 31,
    }),
    ['monthly'],
  );
});
