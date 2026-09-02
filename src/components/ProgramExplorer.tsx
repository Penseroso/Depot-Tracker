import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react';
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
import { getStageBadgeClass, stageOrder } from '../lib/development-stages.js';
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

type SortColumnId = 'company' | 'program' | 'payload' | 'technology' | 'interval' | 'stage' | 'latestChange';
type SortDirection = 'ascending' | 'descending';
type SortState = { columnId: SortColumnId; direction: SortDirection } | null;

const sortColumnLabels: Record<SortColumnId, string> = {
  company: '기업',
  program: '프로그램',
  payload: 'Payload',
  technology: '제형',
  interval: '목표 간격',
  stage: '개발 단계',
  latestChange: '최근 변화',
};

const alphabeticalCollator = new Intl.Collator('ko-KR', {
  sensitivity: 'base',
  numeric: true,
});

const stageRankMap = new Map(stageOrder.map((stage, index) => [stage, index]));

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
  const [sort, setSort] = useState<SortState>(null);

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

  const toggleSort = (columnId: SortColumnId) => {
    setSort((current) => {
      if (!current || current.columnId !== columnId) {
        return { columnId, direction: 'ascending' };
      }
      if (current.direction === 'ascending') {
        return { columnId, direction: 'descending' };
      }
      return null;
    });
  };

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

  const displayedPrograms = useMemo(() => {
    if (!sort) return filtered;

    const direction = sort.direction === 'ascending' ? 1 : -1;

    return [...filtered].sort((a, b) => {
      switch (sort.columnId) {
        case 'company': {
          const diff = alphabeticalCollator.compare(a.company, b.company);
          if (diff !== 0) return diff * direction;
          return alphabeticalCollator.compare(a.programName, b.programName);
        }
        case 'program': {
          const diff = alphabeticalCollator.compare(a.programName, b.programName);
          if (diff !== 0) return diff * direction;
          return alphabeticalCollator.compare(a.company, b.company);
        }
        case 'payload': {
          const valA = formatPayloadComponents(a.payloadComponents);
          const valB = formatPayloadComponents(b.payloadComponents);
          const diff = alphabeticalCollator.compare(valA, valB);
          if (diff !== 0) return diff * direction;
          return alphabeticalCollator.compare(a.programName, b.programName);
        }
        case 'technology': {
          const valA = technologyById.get(a.deliveryTechnologyId)?.shortLabel ?? a.deliveryTechnology;
          const valB = technologyById.get(b.deliveryTechnologyId)?.shortLabel ?? b.deliveryTechnology;
          const diff = alphabeticalCollator.compare(valA, valB);
          if (diff !== 0) return diff * direction;
          return alphabeticalCollator.compare(a.programName, b.programName);
        }
        case 'interval': {
          const valA = formatIntervalClaim(a.productTarget);
          const valB = formatIntervalClaim(b.productTarget);
          const diff = alphabeticalCollator.compare(valA, valB);
          if (diff !== 0) return diff * direction;
          return alphabeticalCollator.compare(a.programName, b.programName);
        }
        case 'stage': {
          const rankA = stageRankMap.get(a.developmentStage) ?? 999;
          const rankB = stageRankMap.get(b.developmentStage) ?? 999;
          if (rankA !== rankB) return (rankA - rankB) * direction;
          return alphabeticalCollator.compare(a.programName, b.programName);
        }
        case 'latestChange': {
          const dateA = latestEventDateByProgram[a.slug] ?? '';
          const dateB = latestEventDateByProgram[b.slug] ?? '';
          if (!dateA && dateB) return 1;
          if (dateA && !dateB) return -1;
          const diff = dateA.localeCompare(dateB);
          if (diff !== 0) return diff * direction;
          return alphabeticalCollator.compare(a.programName, b.programName);
        }
      }
    });
  }, [filtered, sort, technologyById, latestEventDateByProgram]);

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
      <div className="resultbar">
        <div className="resultbar-left">
          <span>{displayedPrograms.length}개 항목</span>
          {sort && (
            <span className="sort-indicator">
              · {sortColumnLabels[sort.columnId]} {sort.direction === 'ascending' ? '오름차순' : '내림차순'}
              <button type="button" className="sort-reset-btn" onClick={() => setSort(null)}>
                기본 순서로 리셋
              </button>
            </span>
          )}
        </div>
        <span>최근 검증일 {formatDate(asOfDate)}</span>
      </div>
      <div className="panel" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
        {displayedPrograms.length ? (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 160, padding: 0 }}>
                    <button
                      type="button"
                      className={`table-sort-btn ${sort?.columnId === 'company' ? 'table-sort-active' : ''}`}
                      onClick={() => toggleSort('company')}
                      aria-sort={sort?.columnId === 'company' ? sort.direction : undefined}
                      aria-label={`기업순 정렬 ${sort?.columnId === 'company' ? (sort.direction === 'ascending' ? '내림차순 전환' : '정렬 해제') : '오름차순'}`}
                    >
                      <span>기업</span>
                      <span className="sort-icon-wrap">
                        {sort?.columnId === 'company' ? (
                          sort.direction === 'ascending' ? <ArrowUp size={14} className="sort-icon-active" /> : <ArrowDown size={14} className="sort-icon-active" />
                        ) : (
                          <ArrowUpDown size={13} className="sort-icon-idle" />
                        )}
                      </span>
                    </button>
                  </th>
                  <th style={{ minWidth: 190, padding: 0 }}>
                    <button
                      type="button"
                      className={`table-sort-btn ${sort?.columnId === 'program' ? 'table-sort-active' : ''}`}
                      onClick={() => toggleSort('program')}
                      aria-sort={sort?.columnId === 'program' ? sort.direction : undefined}
                      aria-label={`프로그램순 정렬 ${sort?.columnId === 'program' ? (sort.direction === 'ascending' ? '내림차순 전환' : '정렬 해제') : '오름차순'}`}
                    >
                      <span>프로그램</span>
                      <span className="sort-icon-wrap">
                        {sort?.columnId === 'program' ? (
                          sort.direction === 'ascending' ? <ArrowUp size={14} className="sort-icon-active" /> : <ArrowDown size={14} className="sort-icon-active" />
                        ) : (
                          <ArrowUpDown size={13} className="sort-icon-idle" />
                        )}
                      </span>
                    </button>
                  </th>
                  <th style={{ minWidth: 150, padding: 0 }}>
                    <button
                      type="button"
                      className={`table-sort-btn ${sort?.columnId === 'payload' ? 'table-sort-active' : ''}`}
                      onClick={() => toggleSort('payload')}
                      aria-sort={sort?.columnId === 'payload' ? sort.direction : undefined}
                      aria-label={`Payload순 정렬 ${sort?.columnId === 'payload' ? (sort.direction === 'ascending' ? '내림차순 전환' : '정렬 해제') : '오름차순'}`}
                    >
                      <span>Payload</span>
                      <span className="sort-icon-wrap">
                        {sort?.columnId === 'payload' ? (
                          sort.direction === 'ascending' ? <ArrowUp size={14} className="sort-icon-active" /> : <ArrowDown size={14} className="sort-icon-active" />
                        ) : (
                          <ArrowUpDown size={13} className="sort-icon-idle" />
                        )}
                      </span>
                    </button>
                  </th>
                  <th style={{ minWidth: 180, padding: 0 }}>
                    <button
                      type="button"
                      className={`table-sort-btn ${sort?.columnId === 'technology' ? 'table-sort-active' : ''}`}
                      onClick={() => toggleSort('technology')}
                      aria-sort={sort?.columnId === 'technology' ? sort.direction : undefined}
                      aria-label={`제형순 정렬 ${sort?.columnId === 'technology' ? (sort.direction === 'ascending' ? '내림차순 전환' : '정렬 해제') : '오름차순'}`}
                    >
                      <span>제형</span>
                      <span className="sort-icon-wrap">
                        {sort?.columnId === 'technology' ? (
                          sort.direction === 'ascending' ? <ArrowUp size={14} className="sort-icon-active" /> : <ArrowDown size={14} className="sort-icon-active" />
                        ) : (
                          <ArrowUpDown size={13} className="sort-icon-idle" />
                        )}
                      </span>
                    </button>
                  </th>
                  <th style={{ minWidth: 130, padding: 0 }}>
                    <button
                      type="button"
                      className={`table-sort-btn ${sort?.columnId === 'interval' ? 'table-sort-active' : ''}`}
                      onClick={() => toggleSort('interval')}
                      aria-sort={sort?.columnId === 'interval' ? sort.direction : undefined}
                      aria-label={`목표 간격순 정렬 ${sort?.columnId === 'interval' ? (sort.direction === 'ascending' ? '내림차순 전환' : '정렬 해제') : '오름차순'}`}
                    >
                      <span>목표 간격</span>
                      <span className="sort-icon-wrap">
                        {sort?.columnId === 'interval' ? (
                          sort.direction === 'ascending' ? <ArrowUp size={14} className="sort-icon-active" /> : <ArrowDown size={14} className="sort-icon-active" />
                        ) : (
                          <ArrowUpDown size={13} className="sort-icon-idle" />
                        )}
                      </span>
                    </button>
                  </th>
                  <th style={{ minWidth: 110, padding: 0 }}>
                    <button
                      type="button"
                      className={`table-sort-btn ${sort?.columnId === 'stage' ? 'table-sort-active' : ''}`}
                      onClick={() => toggleSort('stage')}
                      aria-sort={sort?.columnId === 'stage' ? sort.direction : undefined}
                      aria-label={`개발 단계순 정렬 ${sort?.columnId === 'stage' ? (sort.direction === 'ascending' ? '내림차순 전환' : '정렬 해제') : '오름차순'}`}
                    >
                      <span>단계</span>
                      <span className="sort-icon-wrap">
                        {sort?.columnId === 'stage' ? (
                          sort.direction === 'ascending' ? <ArrowUp size={14} className="sort-icon-active" /> : <ArrowDown size={14} className="sort-icon-active" />
                        ) : (
                          <ArrowUpDown size={13} className="sort-icon-idle" />
                        )}
                      </span>
                    </button>
                  </th>
                  <th className="program-latest-date" style={{ minWidth: 110, padding: 0 }}>
                    <button
                      type="button"
                      className={`table-sort-btn ${sort?.columnId === 'latestChange' ? 'table-sort-active' : ''}`}
                      onClick={() => toggleSort('latestChange')}
                      aria-sort={sort?.columnId === 'latestChange' ? sort.direction : undefined}
                      aria-label={`최근 변화순 정렬 ${sort?.columnId === 'latestChange' ? (sort.direction === 'ascending' ? '내림차순 전환' : '정렬 해제') : '오름차순'}`}
                    >
                      <span>최근 변화</span>
                      <span className="sort-icon-wrap">
                        {sort?.columnId === 'latestChange' ? (
                          sort.direction === 'ascending' ? <ArrowUp size={14} className="sort-icon-active" /> : <ArrowDown size={14} className="sort-icon-active" />
                        ) : (
                          <ArrowUpDown size={13} className="sort-icon-idle" />
                        )}
                      </span>
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedPrograms.map((program) => {
                  const latestEventDate = latestEventDateByProgram[program.slug];
                  const companyLinks = companyLinksByProgramCompany[program.company] ?? [];
                  return (
                    <tr key={program.slug}>
                      <td>
                        <div className="cell-company-wrap">
                          {companyLinks.length > 0 ? (
                            companyLinks.map((company, index) => (
                              <span key={company.slug}>
                                <a className="company-link" href={`${basePath}/companies/${company.slug}/`}>
                                  {company.name}
                                </a>
                                {index < companyLinks.length - 1 ? ' / ' : ''}
                              </span>
                            ))
                          ) : (
                            <span className="company-plain">{program.company}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <a className="row-link" href={`${basePath}/programs/${program.slug}/`}>
                          <span className="cell-title">{program.programName}</span>
                        </a>
                        <span className="record-type-tag">{recordTypeLabel(program.recordType)}</span>
                      </td>
                      <td><span className="cell-payload">{formatPayloadComponents(program.payloadComponents)}</span></td>
                      <td>
                        <span className="cell-tech-name">{technologyById.get(program.deliveryTechnologyId)?.shortLabel ?? program.deliveryTechnologyId}</span>
                        <span className="cell-sub">{program.deliveryTechnology}</span>
                        <span className="mechanism-tag">{getDurationMechanismShortLabel(program.durationMechanismId)}</span>
                      </td>
                      <td><span className="cell-target">{formatIntervalClaim(program.productTarget)}</span></td>
                      <td><span className={getStageBadgeClass(program.developmentStage)}>{stageLabel(program.developmentStage)}</span></td>
                      <td className="program-latest-date"><span className="cell-date">{latestEventDate ? formatDate(latestEventDate) : '—'}</span></td>
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
