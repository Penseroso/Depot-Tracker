export const developmentStages: readonly [
  'Discovery',
  'Preclinical',
  'IND-enabling',
  'IND submitted',
  'IND cleared',
  'Human PK pilot',
  'Registered Phase I',
  'Registered Phase I/II',
  'Registered Phase I/IIa',
  'Registered Phase II',
  'Registered Phase II/III',
  'Registered Phase III',
  'Regulatory review',
  'Approved',
  'Registered Phase IV',
  'Paused',
  'Discontinued',
];

export type DevelopmentStage = typeof developmentStages[number];
export const stageOrder: readonly DevelopmentStage[];
export function getStageLabel(stage: string): string;
export function getStageBadgeClass(stage: string): string;
