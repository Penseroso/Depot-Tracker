export function getActiveProgramCount(programs) {
  return programs.filter((program) => program.active).length;
}

export function getTrialRegistrationCount(studies) {
  return studies.length;
}

export function isPatentLinked(program) {
  return program.sources.some((source) => source.sourceType === 'patent');
}

export function getPatentLinkedProgramCount(programs) {
  return programs.filter(isPatentLinked).length;
}

export function getPatentLinkedRatio(programs) {
  const total = programs.length;
  const linked = getPatentLinkedProgramCount(programs);
  const percent = total === 0 ? 0 : Math.round((linked / total) * 100);
  return { linked, total, percent };
}
