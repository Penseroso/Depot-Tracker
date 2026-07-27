# MVP scope

## 포함

- 경쟁 프로그램 Overview
- 개발 단계·제형군 시각화
- 검색·단계·제형·활성 상태 필터
- 프로그램별 정적 상세 페이지
- 근거 출처, 최근 변화일, 마지막 검증일, 해석 제한
- stable `programSlug`에 연결된 업데이트 이벤트 피드
- CSV·JSON 정적 다운로드
- Zod 개별-record 검증과 Node 교차-record 검증
- stale-record advisory
- GitHub Pages 자동 배포
- 주간 에이전트 조사 → Draft PR → 사람 승인 운영 문서

## 의도적으로 제외

- 관리자 편집 UI
- 사용자 인증
- 데이터베이스
- 무검토 자동 main 반영
- 범용 웹 크롤러 또는 원문 문서 저장소
- 복잡한 임상 Endpoint/Outcome 데이터 모델
- ADR·대규모 fixture·다중 도메인 projection 체계
- 프로그램 간 선택 비교
- 알림·이메일 발송 자체 구현

다음 확장 우선순위는 `주간 Draft PR 자동화 → 변경 전후 diff → 비교 선택 →
검토 후보 큐` 순입니다. 자동 수집은 canonical data가 아니라 candidate
discovery까지만 담당합니다.
