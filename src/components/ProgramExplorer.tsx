import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { Search } from 'lucide-react';
import type { DeliveryTechnology, Program } from '../lib/schema';
import {
  formatDate,
  formatIntervalClaim,
  formatPayloadComponents,
  getProductTargetIntervalBuckets,
  intervalBucketLabels,
  stageLabel,
  type IntervalBucketId,
} from '../lib/format';
import { getStageBadgeClass } from '../lib/development-stages.js';
import { UNCONFIRMED_DURATION_MECHANISM, durationMechanisms, getDurationMechanismLabel, getDurationMechanismShortLabel } from '../lib/duration-mechanisms.js';

const FILTER_PARAMS = { stage: 'stage', technology: 'technology', interval: 'interval', mechanism: 'mechanism' } as const;
const defaultUrlFilters = { stage: 'all', technology: 'all', interval: 'all', mechanism: 'all' };

function readFilterParamsFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    stage: params.get(FILTER_PARAMS.stage) ?? 'all',
    technology: params.get(FILTER_PARAMS.technology) ?? 'all',
    interval: params.get(FILTER_PARAMS.interval) ?? 'all',
    mechanism: params.get(FILTER_PARAMS.mechanism) ?? 'all',
  };
}

function recordTypeLabel(value: Program['recordType']) {
  return value === 'sponsor-program' ? 'Sponsor program' : 'Technology watch';
}

type Props = {
  programs: Program[];
  deliveryTechnologies: DeliveryTechnology[];
  companyLinksByProgramCompany: Record<string, { name: string; slug: string }[]>;
  basePath: string;
  asOfDate: string;
  latestEventDateByProgram: Record<string, string | null>;
};

export default function ProgramExplorer({ programs, deliveryTechnologies, companyLinksByProgramCompany, basePath, asOfDate, latestEventDateByProgram }: Props) {
  const [query, setQuery] = useState('');
  const [{ stage, technology, interval, mechanism }, setUrlFilters] = useState(defaultUrlFilters);
  const [hydratedFromUrl, setHydratedFromUrl] = useState(false);
  const setStage = (value: string) => setUrlFilters((current) => ({ ...current, stage: value }));
  const setTechnology = (value: string) => setUrlFilters((current) => ({ ...current, technology: value }));
  const setIntervalFilter = (value: string) => setUrlFilters((current) => ({ ...current, interval: value }));
  const setMechanism = (value: string) => setUrlFilters((current) => ({ ...current, mechanism: value }));
  const [recordType, setRecordType] = useState('all');

  // Applied post-mount (not in the lazy initializer) so the first client render
  // matches the statically pre-rendered markup; avoids a hydration mismatch
  // when this page is loaded with ?stage=/&technology=/&interval= from Overview.
  useEffect(() => {
    setUrlFilters(readFilterParamsFromUrl());
    setHydratedFromUrl(true);
  }, []);

  useEffect(() => {
    if (!hydratedFromUrl) return;
    const params = new URLSearchParams(window.location.search);
    (['stage', 'technology', 'interval', 'mechanism'] as const).forEach((key) => {
      const value = key === 'stage' ? stage : key === 'technology' ? technology : key === 'interval' ? interval : mechanism;
      if (value === 'all') params.delete(FILTER_PARAMS[key]);
      else params.set(FILTER_PARAMS[key], value);
    });
    const search = params.toString();
    const nextUrl = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
    window.history.replaceState(window.history.state, '', nextUrl);
  }, [stage, technology, interval, mechanism, hydratedFromUrl]);

  const technologyById = useMemo(
    () => new Map(deliveryTechnologies.map((item) => [item.id, item])),
    [deliveryTechnologies],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('ko-KR');
    return programs.filter((program) => {
      const haystack = [
        program.company,
        program.programName,
        ...program.payloadComponents,
        program.deliveryTechnology,
        getDurationMechanismLabel(program.durationMechanismId),
        program.productTarget?.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('ko-KR');
      return (
        (!needle || haystack.includes(needle))
        && (stage === 'all' || program.developmentStage === stage)
        && (technology === 'all' || program.deliveryTechnologyId === technology)
        && (interval === 'all' || getProductTargetIntervalBuckets(program.productTarget).includes(interval as IntervalBucketId))
        && (recordType === 'all' || program.recordType === recordType)
        && (mechanism === 'all' || (mechanism === UNCONFIRMED_DURATION_MECHANISM ? program.durationMechanismId === null : program.durationMechanismId === mechanism))
      );
    });
  }, [programs, query, stage, technology, interval, mechanism, recordType]);

  return (
    <section className="filter-shell">
      <div className="filterbar">
        <label style={{ position: 'relative' }}>
          <span className="sr-only">검색</span>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 13, color: '#62706d' }} />
          <input className="control" style={{ paddingLeft: 38 }} value={query} onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)} placeholder="회사, 프로그램, Payload, 제형 검색" />
        </label>
        <select className="control" value={stage} onChange={(event: ChangeEvent<HTMLSelectElement>) => setStage(event.target.value)} aria-label="개발 단계">
          <option value="all">모든 단계</option>
          {[...new Set(programs.map((program) => program.developmentStage))].map((value) => <option key={value} value={value}>{stageLabel(value)}</option>)}
        </select>
        <select className="control" value={technology} onChange={(event: ChangeEvent<HTMLSelectElement>) => setTechnology(event.target.value)} aria-label="전달 기술">
          <option value="all">모든 제형</option>
          {deliveryTechnologies.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
        <select className="control" value={interval} onChange={(event: ChangeEvent<HTMLSelectElement>) => setIntervalFilter(event.target.value)} aria-label="목표 투여 간격">
          <option value="all">모든 목표 간격</option>
          {Object.entries(intervalBucketLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
        <select className="control" value={mechanism} onChange={(event: ChangeEvent<HTMLSelectElement>) => setMechanism(event.target.value)} aria-label="지속기전">
          <option value="all">모든 지속기전</option>
          {durationMechanisms.map((id) => <option key={id} value={id}>{getDurationMechanismLabel(id)}</option>)}
          <option value={UNCONFIRMED_DURATION_MECHANISM}>{getDurationMechanismLabel(null)}</option>
        </select>
        <select className="control" value={recordType} onChange={(event: ChangeEvent<HTMLSelectElement>) => setRecordType(event.target.value)} aria-label="레코드 유형">
          <option value="all">모든 유형</option>
          <option value="sponsor-program">Sponsor program</option>
          <option value="technology-watch">Technology watch</option>
        </select>
      </div>
      <div className="resultbar"><span>{filtered.length}개 항목</span><span>최근 검증일 {formatDate(asOfDate)}</span></div>
      <div className="panel" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
        {filtered.length ? (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead><tr><th>프로그램</th><th>Payload</th><th>제형</th><th>제품 목표</th><th>단계</th><th>상태</th><th className="program-latest-date">최근 변화</th></tr></thead>
              <tbody>
                {filtered.map((program) => {
                  const latestEventDate = latestEventDateByProgram[program.slug];
                  const companyLinks = companyLinksByProgramCompany[program.company] ?? [];
                  return (
                    <tr key={program.slug}>
                      <td>
                        <a className="row-link" href={`${basePath}/programs/${program.slug}/`}><span className="cell-title">{program.programName}</span></a>
                        <span className="cell-sub">
                          {companyLinks.length > 0
                            ? companyLinks.map((company, index) => (
                              <span key={company.slug}>
                                <a className="company-cell-link" href={`${basePath}/companies/${company.slug}/`}>{company.name}</a>
                                {index < companyLinks.length - 1 ? ' / ' : ''}
                              </span>
                            ))
                            : program.company}
                        </span>
                        <span className="record-type-tag">{recordTypeLabel(program.recordType)}</span>
                      </td>
                      <td><span className="cell-title">{formatPayloadComponents(program.payloadComponents)}</span></td>
                      <td><span className="cell-title">{technologyById.get(program.deliveryTechnologyId)?.shortLabel ?? program.deliveryTechnologyId}</span><span className="cell-sub">{program.deliveryTechnology}</span><span className="record-type-tag">{getDurationMechanismShortLabel(program.durationMechanismId)}</span></td>
                      <td>{formatIntervalClaim(program.productTarget)}</td>
                      <td><span className={getStageBadgeClass(program.developmentStage)}>{stageLabel(program.developmentStage)}</span></td>
                      <td><span className="cell-sub" style={{ maxWidth: 260 }}>{program.developmentStatus}</span></td>
                      <td className="program-latest-date">{latestEventDate ? formatDate(latestEventDate) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : <div className="empty">조건에 맞는 프로그램이 없습니다.</div>}
      </div>
    </section>
  );
}
