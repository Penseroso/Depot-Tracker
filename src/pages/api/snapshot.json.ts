import type { APIRoute } from 'astro';
import { getCompanies, getDeliveryTechnologies, getEvents, getPlatforms, getPrograms, getStudies, getSummary } from '../../lib/data';

export const GET: APIRoute = () => {
  const programs = getPrograms();
  const studies = getStudies();
  const events = getEvents();
  const deliveryTechnologies = getDeliveryTechnologies();
  const companies = getCompanies();
  const platforms = getPlatforms();
  const summary = getSummary(programs, events, studies);
  return new Response(JSON.stringify({
    asOf: summary.asOfDate,
    deliveryTechnologies,
    companies,
    platforms,
    programs,
    studies,
    events,
  }, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
