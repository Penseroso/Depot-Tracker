import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPayloadComponents } from '../src/lib/payload-format.js';

test('payload formatter capitalizes each component and joins with +', () => {
  assert.equal(formatPayloadComponents(['semaglutide']), 'Semaglutide');
  assert.equal(
    formatPayloadComponents(['cagrilintide', 'semaglutide']),
    'Cagrilintide + Semaglutide',
  );
});
