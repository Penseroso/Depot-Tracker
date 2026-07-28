type SourceLike = { sourceType: string };
type ProgramLike = { active: boolean; sources: readonly SourceLike[] };
type StudyLike = Record<string, unknown>;

export function getActiveProgramCount(programs: readonly ProgramLike[]): number;
export function getTrialRegistrationCount(studies: readonly StudyLike[]): number;
export function isPatentLinked(program: ProgramLike): boolean;
export function getPatentLinkedProgramCount(programs: readonly ProgramLike[]): number;
export function getPatentLinkedRatio(programs: readonly ProgramLike[]): {
  linked: number;
  total: number;
  percent: number;
};
