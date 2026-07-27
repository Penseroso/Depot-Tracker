import type { APIRoute } from 'astro';
import { getStudies } from '../../lib/data';

function escapeCsv(value: unknown) {
  const text = value == null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export const GET: APIRoute = () => {
  const headers = ['studySlug', 'programSlug', 'registryId', 'phase', 'recruitmentStatus', 'registryStatusRaw', 'countries'];
  const rows = getStudies().map((study) => [
    study.slug,
    study.programSlug,
    study.registryId,
    study.phase,
    study.recruitmentStatus,
    study.registryStatusRaw,
    study.countries.join('; '),
  ].map(escapeCsv).join(','));
  return new Response(`\uFEFF${headers.join(',')}\n${rows.join('\n')}`, { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
};
