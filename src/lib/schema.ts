import { z } from 'zod';

export const sourceSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
  sourceType: z.enum(['registry', 'regulator', 'company', 'publication', 'conference', 'patent', 'filing', 'secondary', 'other']),
  accessedOn: z.iso.date(),
});

export const programSchema = z.object({
  company: z.string().min(1),
  asset: z.string().min(1),
  modality: z.string().min(1),
  modalityGroup: z.enum(['microsphere', 'other depot']),
  targetInterval: z.string().min(1),
  route: z.string().min(1),
  evidenceStage: z.enum([
    'Registered Phase I/IIa',
    'Registered Phase I',
    'IND submitted',
    'Human PK pilot',
    'Preclinical',
    'Paused',
  ]),
  regulatoryStatus: z.string().min(1),
  registryId: z.string().nullable(),
  geography: z.string().min(1),
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
});

export const eventSchema = z.object({
  programSlug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  date: z.iso.date(),
  company: z.string().min(1),
  asset: z.string().min(1),
  category: z.enum(['Clinical', 'Regulatory', 'Data', 'Partnership', 'Platform', 'Status']),
  headline: z.string().min(1),
  significance: z.enum(['High', 'Medium', 'Low']),
  source: sourceSchema,
});

export type Source = z.infer<typeof sourceSchema>;
export type ProgramRecord = z.infer<typeof programSchema>;
export type EventRecord = z.infer<typeof eventSchema>;
export type Program = ProgramRecord & { slug: string };
export type TrackerEvent = EventRecord & { slug: string };
