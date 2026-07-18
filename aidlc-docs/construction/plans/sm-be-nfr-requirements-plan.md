# NFR Requirements Plan — Unit 1: Backend (`sm-be`)

Backend unit의 비기능 요구사항과 기술 스택 세부를 확정합니다. (요구사항 단계에서 확정된 항목: 단일 리전 multi-zone, Security/Resiliency 베이스라인, React+Vite/Spring Boot/PostgreSQL·H2/Docker+K8s, PBT Partial — 재질문하지 않음)

## 진행 체크리스트
- [x] Functional Design 분석 (RSVP/Gallery/Instagram)
- [x] 아래 NFR/기술 질문에 대한 사용자 답변 수집
- [x] 답변 모호성 분석 및 필요 시 follow-up (Q5/Q6 위임→권장 적용, 모순 없음)
- [x] `nfr-requirements.md` 생성
- [x] `tech-stack-decisions.md` 생성
- [x] 검증

---

## NFR / 기술 결정 질문

### Question 1: 예상 부하 / 규모 (Scalability)
청첩장의 예상 트래픽 규모는? (rate limit·용량 산정 기준)

A) 소규모 — 총 하객 수백 명, 예식 전후 동시 접속 수십 명 수준 (개인 청첩장 일반)

B) 중규모 — 수천 명 열람, 순간 동시 접속 수백 명 가능

X) Other (please describe after [Answer]: tag below)

[Answer]: A, 총 하객 약 200명, 청첩장 배포를 주 1~2회로 분산해서 동시 접속 낮을 것으로 예상

### Question 2: 성능 목표 (Performance)
백엔드 API 응답 시간 목표는?

A) 일반 API(RSVP/Gallery) p95 < 500ms, Instagram(캐시 미스 시 외부 호출) p95 < 1.5s

B) 더 엄격 — 일반 API p95 < 200ms

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3: RSVP 엔드포인트 Rate Limit 임계값 (Security)
공개 RSVP 제출의 rate limit 수준은? (SECURITY-11)

A) IP당 분당 5회, 시간당 30회 (일반적 남용 방지)

B) IP당 분당 10회, 시간당 60회 (여유롭게)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4: RSVP 데이터 보존 정책 (Security/Privacy)
개인정보(이름·연락처)를 포함한 RSVP 데이터의 보존 기간은?

A) 예식일 이후 일정 기간(예: 3개월) 뒤 삭제/익명화 (개인정보 최소 보존)

B) 수동 삭제 시점까지 보존 (명시적 만료 없음)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5: 영속화 기술 (Tech Stack 세부)
Backend 데이터 접근 계층 기술은? (워크스페이스 steering은 MyBatis + Flyway를 언급)

A) MyBatis + Flyway (steering 관례 따름)

B) Spring Data JPA + Flyway

X) Other (please describe after [Answer]: tag below)

[Answer]: 요구사항(01_Discovery자료.md) 파일의 내용을 바탕으로 권장(Recommend)

### Question 6: Instagram 캐시 구현 / 인스턴스 확장
Instagram 캐시와 백엔드 인스턴스 확장 방식은? (multi-zone 가용성 관련)

A) 인메모리 캐시(예: Caffeine) + 백엔드 2 인스턴스(multi-zone). 캐시는 인스턴스별 독립(짧은 TTL이라 허용)

B) 공유 캐시(예: Redis) + 다중 인스턴스 (정합성 우선, 인프라 추가)

X) Other (please describe after [Answer]: tag below)

[Answer]: 요구사항(01_Discovery자료.md) 파일의 내용을 바탕으로 권장(Recommend)

### Question 7: 관측성 수준 (Maintainability/Reliability)
로깅/모니터링 수준은? (개인 프로젝트 규모)

A) 경량 — 구조적 로깅 + health check + 기본 메트릭(요청수/에러율/지연). 별도 APM 없음

B) 확장 — 위 + 외부 APM/대시보드(예: Cloud Monitoring) 연동

X) Other (please describe after [Answer]: tag below)

[Answer]: A + Cloud Native(GCP/Azure)
