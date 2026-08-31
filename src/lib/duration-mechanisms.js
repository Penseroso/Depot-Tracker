// URL/select sentinel for programs with durationMechanismId === null (evidence insufficient).
// Not one of the five canonical mechanism ids; used only by UI filters/charts.
export const UNCONFIRMED_DURATION_MECHANISM = 'unconfirmed';

export const durationMechanisms = [
  'formulation-depot',
  'implant-device',
  'molecular-half-life-extension',
  'prodrug-conjugate-release',
  'hybrid',
];

const mechanismLabels = {
  'formulation-depot': '제형 기반 depot',
  'implant-device': '이식형 디바이스',
  'molecular-half-life-extension': '분자 반감기 연장',
  'prodrug-conjugate-release': '프로드럭/절단형 방출',
  hybrid: '복합 기전',
};

const mechanismShortLabels = {
  'formulation-depot': 'Depot 제형',
  'implant-device': 'Implant',
  'molecular-half-life-extension': '분자 설계',
  'prodrug-conjugate-release': '프로드럭',
  hybrid: '복합',
};

export function getDurationMechanismLabel(id) {
  if (id == null) return '미확인';
  return mechanismLabels[id] ?? id;
}

export function getDurationMechanismShortLabel(id) {
  if (id == null) return '미확인';
  return mechanismShortLabels[id] ?? id;
}
