import { z } from 'zod';

export const sourceSchema = z.object({
  label: z.string().min(1),
  url: z.url(),
  sourceType: z.enum(['registry', 'regulator', 'company', 'publication', 'conference', 'patent', 'filing', 'secondary', 'other']),
  accessedOn: z.iso.date(),
}).strict();

export const intervalClaimSchema = z.object({
  description: z.string().min(1),
  minDays: z.number().int().positive().nullable(),
  maxDays: z.number().int().positive().nullable(),
}).strict().refine(
  ({ minDays, maxDays }) => minDays == null || maxDays == null || minDays <= maxDays,
  { message: 'minDays cannot be greater than maxDays' },
);

export const deliveryTechnologySchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  label: z.string().min(1),
  shortLabel: z.string().min(1),
  sortRank: z.number().int().min(0),
}).strict();

export const programSchema = z.object({
  company: z.string().min(1),
  programName: z.string().min(1),
  payload: z.literal('semaglutide'),
  recordType: z.enum(['sponsor-program', 'technology-watch']),
  deliveryTechnologyId: deliveryTechnologySchema.shape.id,
  deliveryTechnology: z.string().min(1),
  productTarget: intervalClaimSchema.nullable(),
  demonstratedDuration: intervalClaimSchema.nullable(),
  platformPotential: intervalClaimSchema.nullable(),
  route: z.string().min(1),
  developmentStage: z.enum([
    'Registered Phase I/IIa',
    'Registered Phase I',
    'IND submitted',
    'Human PK pilot',
    'Preclinical',
    'Paused',
  ]),
  developmentStatus: z.string().min(1),
  programRegionContext: z.string().min(1),
  latestUpdate: z.string().min(1),
  latestUpdateDate: z.iso.date(),
  lastVerifiedAt: z.iso.date(),
  readout: z.string().min(1),
  differentiator: z.string().min(1),
  caveat: z.string().min(1),
  confidence: z.enum(['High', 'Medium', 'Low']),
  active: z.boolean(),
  stageRank: z.number().int().min(0).max(100),
  sources: z.array(sourceSchema).min(1),
}).strict();

export const recruitmentStatusSchema = z.enum([
  'not-yet-recruiting',
  'recruiting',
  'enrolling-by-invitation',
  'active-not-recruiting',
  'suspended',
  'terminated',
  'withdrawn',
  'completed',
  'unknown',
]);

const registrySourceSchema = sourceSchema.extend({
  sourceType: z.literal('registry'),
});

export const studySchema = z.object({
  programSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  registryId: z.string().regex(/^NCT\d{8}$/),
  phase: z.string().min(1),
  recruitmentStatus: recruitmentStatusSchema,
  registryStatusRaw: z.string().min(1),
  countries: z.array(z.string().min(1)).min(1),
  registrySource: registrySourceSchema,
  lastVerifiedAt: z.iso.date(),
}).strict();

export const eventSchema = z.object({
  programSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  studySlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  date: z.iso.date(),
  company: z.string().min(1),
  programName: z.string().min(1),
  category: z.enum(['Clinical', 'Regulatory', 'Data', 'Partnership', 'Platform', 'Status']),
  headline: z.string().min(1),
  significance: z.enum(['High', 'Medium', 'Low']),
  source: sourceSchema,
}).strict();

export type Source = z.infer<typeof sourceSchema>;
export type IntervalClaim = z.infer<typeof intervalClaimSchema>;
export type DeliveryTechnology = z.infer<typeof deliveryTechnologySchema>;
export type ProgramRecord = z.infer<typeof programSchema>;
export type StudyRecord = z.infer<typeof studySchema>;
export type EventRecord = z.infer<typeof eventSchema>;
export type Program = ProgramRecord & { slug: string };
export type Study = StudyRecord & { slug: string };
export type TrackerEvent = EventRecord & { slug: string };
