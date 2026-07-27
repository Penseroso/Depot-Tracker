import { useMemo, useState, type ChangeEvent } from 'react';
import { Search } from 'lucide-react';
import type { Program } from '../lib/schema';
import { confidenceLabel, formatDate, modalityLabel, stageLabel } from '../lib/format';

function stageClass(stage: string) {
  if (stage.includes('Registered')) return 'badge badge-clinical';
  if (stage === 'IND submitted') return 'badge badge-ind';
  if (stage === 'Human PK pilot') return 'badge badge-human';
  if (stage === 'Paused') return 'badge badge-paused';
  return 'badge badge-preclinical';
}

export default function ProgramExplorer({ programs, basePath, asOfDate }: { programs: Program[]; basePath: string; asOfDate: string }) {
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState('all');
  const [modality, setModality] = useState('all');
  const [activity, setActivity] = useState('active');

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('ko-KR');
    return programs.filter((program) => {
      const haystack = [program.company, program.asset, program.modality, program.targetInterval, program.geography]
        .join(' ')
        .toLocaleLowerCase('ko-KR');
      return (
        (!needle || haystack.includes(needle)) &&
        (stage === 'all' || program.evidenceStage === stage) &&
        (modality === 'all' || program.modalityGroup === modality) &&
        (activity === 'all' || (activity === 'active' ? program.active : !program.active))
      );
    });
  }, [programs, query, stage, modality, activity]);

  return (
    <section className="filter-shell">
      <div className="filterbar">
        <label style={{ position: 'relative' }}>
          <span className="sr-only">검색</span>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 13, color: '#62706d' }} />
          <input className="control" style={{ paddingLeft: 38 }} value={query} onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)} placeholder="회사, 프로그램, 플랫폼 검색" />
        </label>
        <select className="control" value={stage} onChange={(event: ChangeEvent<HTMLSelectElement>) => setStage(event.target.value)} aria-label="개발 단계">
          <option value="all">모든 단계</option>
          {[...new Set(programs.map((program) => program.evidenceStage))].map((value) => <option key={value} value={value}>{stageLabel(value)}</option>)}
        </select>
        <select className="control" value={modality} onChange={(event: ChangeEvent<HTMLSelectElement>) => setModality(event.target.value)} aria-label="제형군">
          <option value="all">모든 제형군</option>
          <option value="microsphere">미립구</option>
          <option value="other depot">비미립구</option>
        </select>
        <select className="control" value={activity} onChange={(event: ChangeEvent<HTMLSelectElement>) => setActivity(event.target.value)} aria-label="활성 상태">
          <option value="active">활성 프로그램</option>
          <option value="all">전체</option>
          <option value="inactive">보류·비활성</option>
        </select>
      </div>
      <div className="resultbar"><span>{filtered.length}개 항목</span><span>검증 기준일 {formatDate(asOfDate)}</span></div>
      <div className="panel" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
        {filtered.length ? (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead><tr><th>프로그램</th><th>제형</th><th>간격</th><th>단계</th><th>상태</th><th>업데이트</th><th>신뢰도</th></tr></thead>
              <tbody>
                {filtered.map((program) => (
                  <tr key={program.slug}>
                    <td><a className="row-link" href={`${basePath}/programs/${program.slug}/`}><span className="cell-title">{program.asset}</span><span className="cell-sub">{program.company}</span></a></td>
                    <td><span className="cell-title">{modalityLabel(program.modalityGroup)}</span><span className="cell-sub">{program.modality}</span></td>
                    <td>{program.targetInterval}</td>
                    <td><span className={stageClass(program.evidenceStage)}>{stageLabel(program.evidenceStage)}</span></td>
                    <td><span className="cell-sub" style={{ maxWidth: 260 }}>{program.regulatoryStatus}</span></td>
                    <td>{formatDate(program.latestUpdateDate)}</td>
                    <td><span className={`badge badge-confidence-${program.confidence.toLowerCase()}`}>{confidenceLabel(program.confidence)}</span></td>
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
