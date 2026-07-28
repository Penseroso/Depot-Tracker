import test from 'node:test';
import assert from 'node:assert/strict';
import {
  compareProgramsByActivity,
  getAdditionalSourceCount,
  getEventsForProgram,
  getLatestEventForProgram,
  getPrimarySource,
  sortEvents,
} from '../src/lib/event-order.js';

function event(overrides) {
  return {
    programSlug: 'fixture-program',
    date: '2026-01-01',
    significance: 'Medium',
    slug: 'fixture-event',
    ...overrides,
  };
}

test('getEventsForProgram returns only that Program\'s events in date-descending order', () => {
  const events = sortEvents([
    event({ slug: 'a', date: '2026-01-01' }),
    event({ slug: 'b', date: '2026-03-01' }),
    event({ programSlug: 'other-program', slug: 'c', date: '2026-06-01' }),
    event({ slug: 'd', date: '2026-02-01' }),
  ]);
  const forProgram = getEventsForProgram('fixture-program', events);
  assert.deepEqual(forProgram.map((item) => item.slug), ['b', 'd', 'a']);
});

test('getLatestEventForProgram returns the most recent event', () => {
  const events = sortEvents([
    event({ slug: 'a', date: '2026-01-01' }),
    event({ slug: 'b', date: '2026-03-01' }),
  ]);
  assert.equal(getLatestEventForProgram('fixture-program', events)?.slug, 'b');
});

test('getLatestEventForProgram returns null when the Program has no events', () => {
  const events = sortEvents([event({ programSlug: 'other-program' })]);
  assert.equal(getLatestEventForProgram('fixture-program', events), null);
});

test('getEventsForProgram returns an empty array when the Program has no events', () => {
  const events = sortEvents([event({ programSlug: 'other-program' })]);
  assert.deepEqual(getEventsForProgram('fixture-program', events), []);
});

test('same-date events sort by significance then slug ascending', () => {
  const events = sortEvents([
    event({ slug: 'z-low', date: '2026-01-01', significance: 'Low' }),
    event({ slug: 'a-high', date: '2026-01-01', significance: 'High' }),
    event({ slug: 'm-medium-2', date: '2026-01-01', significance: 'Medium' }),
    event({ slug: 'b-medium-1', date: '2026-01-01', significance: 'Medium' }),
  ]);
  assert.deepEqual(events.map((item) => item.slug), ['a-high', 'b-medium-1', 'm-medium-2', 'z-low']);
});

test('compareProgramsByActivity ranks by latest event date, then stageRank, then name', () => {
  const programs = [
    { slug: 'no-event-high-stage', stageRank: 90, company: 'Zeta', programName: 'Z' },
    { slug: 'recent-event', stageRank: 10, company: 'Alpha', programName: 'A' },
    { slug: 'older-event', stageRank: 50, company: 'Beta', programName: 'B' },
  ];
  const latestEventDateBySlug = new Map([
    ['recent-event', '2026-07-01'],
    ['older-event', '2026-01-01'],
  ]);
  const sorted = [...programs].sort((a, b) => compareProgramsByActivity(a, b, latestEventDateBySlug));
  assert.deepEqual(sorted.map((item) => item.slug), ['recent-event', 'older-event', 'no-event-high-stage']);
});

test('Update Feed selects sources[0] as the primary link and counts the remainder', () => {
  const withOneSource = event({ sources: [{ label: 'Primary', url: 'https://example.com/a' }] });
  const withThreeSources = event({
    sources: [
      { label: 'Primary', url: 'https://example.com/a' },
      { label: 'Secondary', url: 'https://example.com/b' },
      { label: 'Tertiary', url: 'https://example.com/c' },
    ],
  });
  assert.equal(getPrimarySource(withOneSource)?.url, 'https://example.com/a');
  assert.equal(getAdditionalSourceCount(withOneSource), 0);
  assert.equal(getPrimarySource(withThreeSources)?.url, 'https://example.com/a');
  assert.equal(getAdditionalSourceCount(withThreeSources), 2);
});
