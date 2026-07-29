export const developmentStages = [
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

export const stageOrder = [
  'Registered Phase IV',
  'Approved',
  'Regulatory review',
  'Registered Phase III',
  'Registered Phase II/III',
  'Registered Phase II',
  'Registered Phase I/IIa',
  'Registered Phase I/II',
  'Registered Phase I',
  'Human PK pilot',
  'IND cleared',
  'IND submitted',
  'IND-enabling',
  'Preclinical',
  'Discovery',
  'Paused',
  'Discontinued',
];

const stageLabels = {
  Discovery: '후보 탐색',
  Preclinical: '비임상',
  'IND-enabling': 'IND 준비',
  'IND submitted': 'IND 제출',
  'IND cleared': 'IND 승인',
  'Human PK pilot': '사람 PK 파일럿',
  'Registered Phase I': '등록 1상',
  'Registered Phase I/II': '등록 1/2상',
  'Registered Phase I/IIa': '등록 1/2a상',
  'Registered Phase II': '등록 2상',
  'Registered Phase II/III': '등록 2/3상',
  'Registered Phase III': '등록 3상',
  'Regulatory review': '허가 심사',
  Approved: '승인',
  'Registered Phase IV': '등록 4상',
  Paused: '보류',
  Discontinued: '중단',
};

export function getStageLabel(stage) {
  return stageLabels[stage] ?? stage;
}

export function getStageBadgeClass(stage) {
  if (stage === 'Paused' || stage === 'Discontinued') return 'badge badge-paused';
  if (stage === 'Human PK pilot') return 'badge badge-human';
  if (stage.startsWith('IND ')) return 'badge badge-ind';
  if (
    stage.startsWith('Registered Phase ')
    || stage === 'Regulatory review'
    || stage === 'Approved'
  ) return 'badge badge-clinical';
  return 'badge badge-preclinical';
}
