# Semaglutide Depot Tracker — Astro MVP

세마글루티드 장기지속형 제형의 임상·규제·제형 개발 현황을 추적하는
**배포 가능한 정적 경쟁정보 트래커**입니다. 서버·DB 없이 운영하되,
에이전트가 조사하고 사람이 Draft PR을 검토하는 주간 갱신 흐름을
지원합니다.

## 기술 구조

- **Astro**: 페이지와 프로그램 상세 화면 정적 생성
- **React islands**: 검색·필터와 차트에만 선택적으로 사용
- **TypeScript + Zod**: 개별 JSON 형식을 빌드 시 검증
- **Node validation scripts**: Program–Study–Event 연결, registry, 기간, 날짜, URL 교차 검증
- **Tailwind CSS + CSS variables**: 디자인 토큰과 반응형 UI
- **Recharts**: 개발 단계·제형군 시각화
- **GitHub Pages**: `main` merge 후 자동 배포

## 운영 문서

에이전트는 반드시 [`AGENTS.md`](AGENTS.md)에서 시작합니다. 활성 규칙의
단일 권위는 [`docs/README.md`](docs/README.md)에 정리되어 있습니다.

```text
AGENTS.md
  -> docs/RESEARCH_WORKFLOW.md
  -> docs/DATA_CONTRACT.md
  -> docs/SOURCE_AND_ENTRY_POLICY.md
  -> docs/EDGE_CASES.md              # 필요할 때만
  -> docs/source-access-handover/    # blocked source가 있을 때만
```

Obesity Landscape의 운영 원칙 가운데 이 경량 트래커에 필요한 부분만
차용했습니다: 필드별 출처 권위, 안정적 ID와 가변 상태 분리,
STORED/EXCLUDED/DEFERRED 후보 처리, 독립 재검색, GO/NO-GO 완료 게이트,
blocked-source handover. 다중 도메인, ADR, 대규모 fixture·projection 구조는
의도적으로 제외했습니다.

## 화면

- `/` — 핵심 지표, 단계·제형·제품 목표 간격 시각화, priority watchlist, 최근 변경
- `/programs/` — 검색·다중 필터가 가능한 프로그램 레지스터
- `/programs/[slug]/` — 프로그램별 근거·차별점·해석 제한 상세
- `/updates/` — 프로그램에 연결된 material-change 피드
- `/methodology/` — 단계·제형·출처·갱신 판단 기준
- `/api/programs.csv`, `/api/studies.csv`, `/api/snapshot.json` — 정적 다운로드 endpoint

## 실행과 검증

```bash
npm install
npm run dev
```

전체 검증 및 정적 빌드:

```bash
npm run data:validate
npm run data:test
npm run data:staleness
npm run check
npm run build
```

- `data:validate`: strict 데이터·registry·Program/Study/Event 연결을 실패 조건으로 검사
- `data:test`: 소규모 validator regression tests로 핵심 차단 규칙을 회귀 검사
- `data:staleness`: 기본 90일 초과 미검증 레코드를 보고하는 advisory
- `check`: 데이터 검증 + Astro 타입/콘텐츠 검사
- `build`: 데이터 검증 + Astro 검사 + 정적 빌드

다른 stale 기준을 사용하려면:

```bash
STALE_DAYS=45 npm run data:staleness
```

## 데이터 갱신

- 프로그램: `src/data/programs/*.json`
- Study: `src/data/studies/*.json`
- 제형 registry: `src/data/registries/delivery-technologies.json`
- 이벤트: `src/data/events/*.json`
- 형식: `src/lib/schema.ts`
- 교차 검증: `scripts/validate-data.mjs`

핵심 날짜는 분리합니다.

- `latestUpdateDate`: 최근 material change 날짜
- `lastVerifiedAt`: 해당 Program 또는 Study를 실제로 다시 확인한 날짜
- `sources[].accessedOn`: 해당 출처를 실제로 연 날짜
- `registrySource.accessedOn`: Study의 registry 출처를 실제로 연 날짜

의미가 바뀌지 않은 재검증은 event를 만들지 않습니다. 의미 있는 단계,
운영 상태, 투여 간격, 제형, 사람 자료, 파트너십, 지속 여부 변화만 event로
기록합니다.

## 권장 전체 landscape 갱신 운영

```text
Scheduled agent research
  -> existing JSON과 외부 직접 출처 비교
  -> 모든 후보를 STORED / EXCLUDED / DEFERRED로 분류
  -> 독립 coverage pass
  -> 필요한 JSON과 event만 수정
  -> validation + build
  -> Draft PR
  -> 사람 승인·merge
  -> GitHub Pages 자동 배포
```

에이전트가 `main`에 직접 쓰거나, 검색 결과만으로 중단·임상 진입을
확정하거나, 변경이 없는데 날짜만 일괄 갱신해서는 안 됩니다. PR에는
`.github/pull_request_template.md`의 GO/NO-GO 체크를 사용합니다.

## GitHub Pages 배포

1. 저장소 루트에 프로젝트를 push합니다.
2. **Settings → Pages → Source → GitHub Actions**를 선택합니다.
3. `main` push 시 `.github/workflows/deploy.yml`이 데이터 검증, stale 보고,
   Astro build, Pages 배포를 실행합니다.

프로젝트 저장소와 `<username>.github.io` 저장소의 base path 차이는 workflow가
자동 처리합니다.

## 디자인 미리보기

`design-preview/index.html`은 패키지 설치 없이 볼 수 있는 독립형 화면
미리보기입니다. 실제 배포 소스와 데이터 기준은 `src/`입니다.
