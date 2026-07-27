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
    'payload',
    'recordType',
    'deliveryTechnologyId',
    'deliveryTechnology',
    'productTarget',
    'productTargetMinDays',
    'productTargetMaxDays',
    'demonstratedDuration',
    'demonstratedDurationMinDays',
    'demonstratedDurationMaxDays',
    'platformPotential',
    'platformPotentialMinDays',
    'platformPotentialMaxDays',
    'route',
    'developmentStage',
    'developmentStatus',
    'programRegionContext',
    'latestUpdateDate',
    'lastVerifiedAt',
    'confidence',
    'active',
  ];
  const rows = getPrograms().map((program) => [
    program.slug,
    program.company,
    program.programName,
    program.payload,
    program.recordType,
    program.deliveryTechnologyId,
    program.deliveryTechnology,
    ...intervalCells(program.productTarget),
    ...intervalCells(program.demonstratedDuration),
    ...intervalCells(program.platformPotential),
    program.route,
    program.developmentStage,
    program.developmentStatus,
    program.programRegionContext,
    program.latestUpdateDate,
    program.lastVerifiedAt,
    program.confidence,
    program.active,
  ].map(escapeCsv).join(','));
  return new Response(`\uFEFF${headers.join(',')}\n${rows.join('\n')}`, { headers: { 'Content-Type': 'text/csv; charset=utf-8' } });
};
