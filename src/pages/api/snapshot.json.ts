import type { APIRoute } from 'astro';
import { getEvents, getPrograms, getSummary } from '../../lib/data';

export const GET: APIRoute = () => {
  const programs = getPrograms();
  const events = getEvents();
  const summary = getSummary(programs, events);
  return new Response(JSON.stringify({
    asOf: summary.asOfDate,
    programs,
    events,
  }, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
