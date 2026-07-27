import type { APIRoute } from 'astro';
import { getDeliveryTechnologies, getEvents, getPrograms, getStudies, getSummary } from '../../lib/data';

export const GET: APIRoute = () => {
  const programs = getPrograms();
  const studies = getStudies();
  const events = getEvents();
  const deliveryTechnologies = getDeliveryTechnologies();
  const summary = getSummary(programs, events, studies);
  return new Response(JSON.stringify({
    asOf: summary.asOfDate,
    deliveryTechnologies,
    programs,
    studies,
    events,
  }, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
