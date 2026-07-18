# NFR Design Plan — Unit 2: Frontend (`sm-fe`)

Frontend NFR 을 설계 패턴/논리 컴포넌트로 구체화합니다. (프론트는 폴백/성능 중심) 각 질문에 권장안(A) 표시.

## 진행 체크리스트
- [x] NFR 요구사항 분석
- [x] 아래 설계 질문에 대한 사용자 답변 수집 (전부 권장안 A)
- [x] 답변 모호성 분석 및 필요 시 follow-up (모순 없음)
- [x] `nfr-design-patterns.md` 생성
- [x] `logical-components.md` 생성
- [x] 검증

---

## 설계 결정 질문

### Question 1: API 오류/폴백 UI 패턴
동적 섹션(갤러리/Instagram/RSVP) 오류 처리는?

A) 섹션별 개별 폴백(해당 섹션만 축소/대체 메시지) + 최상위 ErrorBoundary로 예기치 못한 렌더 오류 방어 (권장)

B) 전역 에러 화면 하나로 처리

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2: 로딩 상태 표시
데이터 로딩 중 표시는?

A) 갤러리/Instagram은 스켈레톤(placeholder), RSVP 제출은 버튼 로딩 상태 (권장)

B) 단순 스피너 하나

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3: 코드 스플리팅 경계
번들 최적화(코드 스플리팅) 방식은?

A) 하단 무거운 섹션(갤러리/Instagram)을 지연 로드(lazy import), 히어로/인사말 등 상단은 즉시 (권장)

B) 스플리팅 없이 단일 번들

X) Other (please describe after [Answer]: tag below)

[Answer]: A
