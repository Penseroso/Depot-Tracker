# MVP scope

## 포함

- 세마글루티드 sustained-release/depot injectable 전체 간격 범위
- sponsor Program과 technology-watch 분리
- Program 전체 개발 단계와 Study phase·모집 상태·국가·registry 근거·재검증일 분리
- registry 기반 제형 분류와 자유문자 제형 설명
- 제품 목표·입증 기간·플랫폼 잠재력 및 일수 범위
- 검색, 단계, 제형, 목표 간격, record type, 활성 상태 필터
- 개발 단계·제형·제품 목표 간격 시각화
- Program 상세와 연결 Study 표시
- stable Program/Study slug에 연결된 Event
- Program CSV, Study CSV, 통합 JSON snapshot
- strict Zod와 교차-record validator 및 validator regression tests
- stale-record advisory와 GitHub Pages 배포
- 주간 에이전트 조사 → Draft PR → 사람 승인 운영

## 의도적으로 제외

- Arm·Endpoint·Outcome와 결과 수준 임상 모델
- normalized phase 및 phase 필터·집계
- 관리자 편집 UI, 인증, 데이터베이스
- 무검토 자동 main 반영
- 범용 웹 크롤러 또는 원문 저장소
- 대규모 ADR·fixture·projection 체계
- 프로그램 간 선택 비교와 알림 발송

다음 확장 우선순위는 `주간 Draft PR 자동화 → 변경 전후 diff → 비교 선택
→ 검토 후보 큐`다. 자동 수집은 canonical 데이터가 아니라 후보 발견까지만
담당한다.
