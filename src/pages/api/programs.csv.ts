import type { APIRoute } from 'astro';
import { getPrograms } from '../../lib/data';

function escapeCsv(value: unknown) {
  const text = value == null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export const GET: APIRoute = () => {
  const headers = ['company','asset','modality','modalityGroup','targetInterval','route','evidenceStage','regulatoryStatus','registryId','geography','latestUpdateDate','lastVerifiedAt','confidence','active'];
  const rows = getPrograms().map((program) => headers.map((header) => escapeCsv(program[header as keyof typeof program])).join(','));
  return new Response(`\uFEFF${headers.join(',')}\n${rows.join('\n')}`, { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
};
