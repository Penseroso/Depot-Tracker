import { useMemo, useState, type ChangeEvent } from 'react';
import { Search } from 'lucide-react';
import type { DeliveryTechnology, Program, Study } from '../lib/schema';
import {
  formatDate,
  formatIntervalClaim,
  getIntervalBucket,
  intervalBucketLabels,
  stageLabel,
} from '../lib/format';

function stageClass(stage: string) {
  if (stage.includes('Registered')) return 'badge badge-clinical';
  if (stage === 'IND submitted') return 'badge badge-ind';
  if (stage === 'Human PK pilot') return 'badge badge-human';
  if (stage === 'Paused') return 'badge badge-paused';
  return 'badge badge-preclinical';
}

function recordTypeLabel(value: Program['recordType']) {
  return value === 'sponsor-program' ? 'Sponsor program' : 'Technology watch';
}

type Props = {
  programs: Program[];
  studies: Study[];
  deliveryTechnologies: DeliveryTechnology[];
  basePath: string;
  asOfDate: string;
};

export default function ProgramExplorer({ programs, studies, deliveryTechnologies, basePath, asOfDate }: Props) {
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState('all');
  const [technology, setTechnology] = useState('all');
  const [interval, setInterval] = useState('all');
  const [recordType, setRecordType] = useState('all');
  const [activity, setActivity] = useState('active');

  const studiesByProgram = useMemo(() => {
    const map = new Map<string, Study[]>();
    studies.forEach((study) => map.set(study.programSlug, [...(map.get(study.programSlug) ?? []), study]));
    return map;
  }, [studies]);

  const technologyById = useMemo(
    () => new Map(deliveryTechnologies.map((item) => [item.id, item])),
    [deliveryTechnologies],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('ko-KR');
    return programs.filter((program) => {
      const linkedStudies = studiesByProgram.get(program.slug) ?? [];
      const haystack = [
        program.company,
        program.programName,
        program.deliveryTechnology,
        program.productTarget?.description,
        program.demonstratedDuration?.description,
        program.platformPotential?.description,
        ...linkedStudies.flatMap((study) => study.countries),
      ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('ko-KR');
      return (
        (!needle || haystack.includes(needle))
        && (stage === 'all' || program.developmentStage === stage)
        && (technology === 'all' || program.deliveryTechnologyId === technology)
        && (interval === 'all' || getIntervalBucket(program.productTarget) === interval)
        && (recordType === 'all' || program.recordType === recordType)
        && (activity === 'all' || (activity === 'active' ? program.active : !program.active))
      );
    });
  }, [programs, studiesByProgram, query, stage, technology, interval, recordType, activity]);

  return (
    <section className="filter-shell">
      <div className="filterbar">
        <label style={{ position: 'relative' }}>
          <span className="sr-only">검색</span>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 13, color: '#62706d' }} />
          <input className="control" style={{ paddingLeft: 38 }} value={query} onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)} placeholder="회사, 프로그램, 제형, 지역 검색" />
        </label>
        <select className="control" value={stage} onChange={(event: ChangeEvent<HTMLSelectElement>) => setStage(event.target.value)} aria-label="개발 단계">
          <option value="all">모든 단계</option>
          {[...new Set(programs.map((program) => program.developmentStage))].map((value) => <option key={value} value={value}>{stageLabel(value)}</option>)}
        </select>
        <select className="control" value={technology} onChange={(event: ChangeEvent<HTMLSelectElement>) => setTechnology(event.target.value)} aria-label="전달 기술">
          <option value="all">모든 제형</option>
          {deliveryTechnologies.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
        <select className="control" value={interval} onChange={(event: ChangeEvent<HTMLSelectElement>) => setInterval(event.target.value)} aria-label="투여 간격">
          <option value="all">모든 간격</option>
          {Object.entries(intervalBucketLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select className="control" value={recordType} onChange={(event: ChangeEvent<HTMLSelectElement>) => setRecordType(event.target.value)} aria-label="레코드 유형">
          <option value="all">모든 유형</option>
          <option value="sponsor-program">Sponsor program</option>
          <option value="technology-watch">Technology watch</option>
        </select>
        <select className="control" value={activity} onChange={(event: ChangeEvent<HTMLSelectElement>) => setActivity(event.target.value)} aria-label="활성 상태">
          <option value="active">활성 프로그램</option>
          <option value="all">전체</option>
          <option value="inactive">보류, 비활성</option>
        </select>
      </div>
      <div className="resultbar"><span>{filtered.length}개 항목</span><span>검증 기준일 {formatDate(asOfDate)}</span></div>
      <div className="panel" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
        {filtered.length ? (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead><tr><th>프로그램</th><th>유형</th><th>제형</th><th>제품 목표</th><th>단계</th><th>상태</th><th>업데이트</th></tr></thead>
              <tbody>
                {filtered.map((program) => (
                  <tr key={program.slug}>
                    <td><a className="row-link" href={`${basePath}/programs/${program.slug}/`}><span className="cell-title">{program.programName}</span><span className="cell-sub">{program.company}</span></a></td>
                    <td><span className="cell-sub">{recordTypeLabel(program.recordType)}</span></td>
                    <td><span className="cell-title">{technologyById.get(program.deliveryTechnologyId)?.shortLabel ?? program.deliveryTechnologyId}</span><span className="cell-sub">{program.deliveryTechnology}</span></td>
                    <td>{formatIntervalClaim(program.productTarget)}</td>
                    <td><span className={stageClass(program.developmentStage)}>{stageLabel(program.developmentStage)}</span></td>
                    <td><span className="cell-sub" style={{ maxWidth: 260 }}>{program.developmentStatus}</span></td>
                    <td>{formatDate(program.latestUpdateDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="empty">조건에 맞는 프로그램이 없습니다.</div>}
      </div>
    </section>
  );
}
