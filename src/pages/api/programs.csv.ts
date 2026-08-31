import type { APIRoute } from 'astro';
import { getPrograms } from '../../lib/data';
import type { IntervalClaim } from '../../lib/schema';

function escapeCsv(value: unknown) {
  const text = value == null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function intervalCells(claim: IntervalClaim | null) {
  return [claim?.description ?? '', claim?.minDays ?? '', claim?.maxDays ?? ''];
}

export const GET: APIRoute = () => {
  const headers = [
    'programSlug',
    'company',
    'programName',
    'payloadComponents',
    'recordType',
    'deliveryTechnologyId',
    'deliveryTechnology',
    'durationMechanismId',
    'productTarget',
    'productTargetMinDays',
    'productTargetMaxDays',
    'route',
    'developmentStage',
    'developmentStatus',
    'lastVerifiedAt',
    'confidence',
    'active',
  ];
  const rows = getPrograms().map((program) => [
    program.slug,
    program.company,
    program.programName,
    program.payloadComponents.join(' + '),
    program.recordType,
    program.deliveryTechnologyId,
    program.deliveryTechnology,
    program.durationMechanismId,
    ...intervalCells(program.productTarget),
    program.route,
    program.developmentStage,
    program.developmentStatus,
    program.lastVerifiedAt,
    program.confidence,
    program.active,
  ].map(escapeCsv).join(','));
  return new Response(`\uFEFF${headers.join(',')}\n${rows.join('\n')}`, { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
};
