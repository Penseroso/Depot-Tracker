# MVP scope

## 포함

- 비만·과체중 치료 목적이 직접 확인된 sustained-release/depot 주사·삽입 제형
- 주 1회라도 depot 또는 sustained-release 특성이 명시된 제형
- microsphere, microparticle, injectable/in-situ depot, hydrogel, implant,
  crystal/suspension, polymer conjugate 및 기타 장기지속형 주사·삽입 기술
- 단일 및 복합 payload를 `payloadComponents` 배열로 저장
- sponsor Program과 technology-watch 분리
- Program 전체 개발 단계와 여러 공식 registry의 Study phase·모집 상태·국가·registry 근거·재검증일 분리
- registry 기반 제형 분류와 자유문자 제형 설명
- 목표 투여 간격(`productTarget`) 및 일수 범위; 입증된 노출·방출 기간이나
  플랫폼 잠재력은 별도 필드가 아니라 readout·Event·caveat 등 근거 문맥에 보존
- 회사·Program·Payload·제형 검색과 단계, 제형, record type 필터
- 개발 단계·제형·제품 목표 간격 시각화
- Program 상세와 연결 Study, Patent 표시
- stable Program/Study slug에 연결된 Event
- Program CSV, Study CSV, 통합 JSON snapshot
- strict Zod와 교차-record validator 및 validator regression tests
- stale-record advisory와 GitHub Pages 배포
- 주간 에이전트 조사 → Draft PR → 사람 승인 운영

## UI 표기 규칙

- 가운뎃점(`·`)은 렌더링되는 모든 화면 텍스트에서 금지한다. UI가 직접
  구성하는 구분자(날짜와 category를 잇는 줄, KPI 보조 문구 등)뿐 아니라
  Program·Study·Event의 저장 텍스트(headline, summary, readout,
  differentiator, caveat, developmentStatus 등)에서도 사용하지 않는다.
  열거는 쉼표로, 대안/양자택일은 "또는"으로, 병렬 개념 연결은 "및"으로
  쓰고, 여러 데이터 필드를 한 줄에 이어 붙이는 UI 구분자는 사이트 전역에서
  이미 쓰는 `|`를 쓴다(예: 홈 히어로 eyebrow, feed-meta). 재발을 막기
  위해 `scripts/validation-core.mjs`가 지정된 Program/Event 텍스트
  필드에서 `·`를 기계적으로 거부한다(`npm run data:validate` 실패).
  이 규칙은 렌더링되는 제품 화면과 그 화면이 그대로 노출하는 저장 텍스트에
  적용되며, 내부 문서(`docs/*.md`)의 낱말 결합용 가운뎃점에는 적용하지
  않는다.
- `confidence`는 High/Medium/Low 세 단계뿐이라 배지로 노출해도 의미가
  잘 전달되지 않는다. Program detail 헤더에는 표시하지 않는다. 데이터
  필드와 CSV/JSON export는 그대로 유지하며, 이 규칙은 UI 노출 여부에만
  적용된다.
- 홈의 Priority watchlist와 Program register는 개발 단계가 후기인
  Program부터 기본 정렬한다. 같은 개발 단계에서는 최근 Event 날짜,
  회사명, Program명 순으로 정렬한다.
- 내부 `Registered Phase` 단계명은 registry 등록으로 단계가 확인됐다는
  provenance를 보존하지만, 화면에는 `등록` 없이 `1상`, `1/2상`, `3상`
  같은 간결한 개발 단계 라벨로 표시한다.

## 의도적으로 제외

- Arm·Endpoint·Outcome와 결과 수준 임상 모델
- normalized phase 및 phase 필터·집계
- 관리자 편집 UI, 인증, 데이터베이스
- 무검토 자동 main 반영
- 범용 웹 크롤러 또는 원문 저장소
- 대규모 ADR·fixture·projection 체계
- 프로그램 간 선택 비교와 알림 발송

## 현재 데이터 경계

현재 저장 데이터는 기존 semaglutide 중심이며, Obesity Depot 전체 후보
조사가 완료된 상태를 의미하지 않습니다.

일반 주 1회 수용액 주사제, depot 또는 sustained-release 특성이 없는
통상 제형, 비만·과체중 목적이 확인되지 않은 당뇨 전용 후보, 특정
비만 치료 payload의 직접 근거가 없는 범용 플랫폼, 비주사·비삽입 DDS는
추적 범위에서 제외합니다.

다음 확장 우선순위는 `주간 Draft PR 자동화 → 변경 전후 diff → 비교 선택
→ 검토 후보 큐`다. 자동 수집은 canonical 데이터가 아니라 후보 발견까지만
담당한다.
