# NFR Requirements Plan — Unit 2: Frontend (`sm-fe`)

Frontend unit 의 비기능 요구사항과 기술 세부를 확정합니다. (이미 확정: React 18 + TS + Vite, nginx 컨테이너 GKE 배포, iOS/Android 호환, PBT Partial — 재질문 제외). 각 질문에 권장안(A)을 표시했습니다.

## 진행 체크리스트
- [x] Functional Design 분석
- [x] 아래 NFR/기술 질문에 대한 사용자 답변 수집 (전부 권장안 A)
- [x] 답변 모호성 분석 및 필요 시 follow-up (모순 없음)
- [x] `nfr-requirements.md` 생성
- [x] `tech-stack-decisions.md` 생성
- [x] 검증

---

## NFR / 기술 결정 질문

### Question 1: 성능 목표 / 이미지 최적화
모바일 로딩 성능 방식은?

A) 이미지 lazy loading + 반응형 크기 + 히어로 우선 로드, 목표 LCP < 2.5s(모바일 4G 기준) (권장)

B) 기본 로딩만(별도 최적화 없음)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2: 브라우저 지원 범위
지원 대상 브라우저는?

A) iOS Safari 최신 2개 버전 + Android Chrome 최신 2개 버전(모던 브라우저) (권장)

B) 구형 브라우저 포함 폭넓은 지원(폴리필 추가)

X) Other (please describe after [Answer]: tag below)

[Answer]: A + 삼성 모바일 브라우저

### Question 3: 접근성 수준
접근성 목표는?

A) 기본 시맨틱 HTML + 이미지 alt + 폼 라벨 + 색 대비 준수(경량, 개인 청첩장 적합) (권장)

B) WCAG 2.1 AA 준거 목표(전면 검증)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4: 프론트엔드 PBT 도구/수준
Property-Based Testing(Partial) 도구는?

A) fast-check + Vitest — D-Day 포맷/캘린더 그리드/폼 DTO 라운드트립 대상 (권장)

B) 예시 기반 테스트만(프론트 PBT 생략)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5: 테스트/품질 도구
프론트엔드 테스트/품질 스택은?

A) Vitest + React Testing Library + ESLint + Prettier (권장)

B) 최소 구성(빌드만, 테스트 생략)

X) Other (please describe after [Answer]: tag below)

[Answer]: A
