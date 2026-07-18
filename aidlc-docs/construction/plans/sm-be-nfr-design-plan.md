# NFR Design Plan — Unit 1: Backend (`sm-be`)

NFR 요구사항을 설계 패턴과 논리 컴포넌트로 구체화합니다. 일부 질문은 Resiliency 확장이 이 단계에서 요구하는 사용자 결정(RESILIENCY-04 배포/롤백, RESILIENCY-14 회복성 테스트)입니다.

## 진행 체크리스트
- [x] NFR 요구사항 분석
- [x] 아래 설계 질문에 대한 사용자 답변 수집
- [x] 답변 모호성 분석 및 필요 시 follow-up (Q6 위임→권장 A 적용, 모순 없음)
- [x] `nfr-design-patterns.md` 생성 (resilience/scalability/performance/security 패턴)
- [x] `logical-components.md` 생성 (캐시/rate limiter/circuit breaker/스케줄러 등)
- [x] 검증

---

## 설계 결정 질문

### Question 1: 외부 호출(Instagram) 회복성 패턴 (Resilience)
Instagram Graph API 호출의 회복성 패턴은? (Resilience4j)

A) Timeout + Circuit Breaker + 짧은 재시도(1회) — 반복 실패 시 회로 개방 후 폴백(빈 목록) (권장)

B) Timeout만 — 실패 시 즉시 폴백(빈 목록)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2: 배포 / 롤백 방식 (RESILIENCY-04)
Kubernetes 배포·롤백 전략은? (개인 프로젝트, 로컬 Git 버전 관리 전제)

A) K8s Rolling Update + `kubectl rollout undo`로 롤백 (무중단, K8s 기본, 권장)

B) Recreate(전체 교체) + 이미지 태그 되돌려 재배포 (단순, 짧은 다운타임 허용)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3: 회복성 테스트 수준 (RESILIENCY-14)
회복성 검증은 어느 수준까지?

A) 경량 — 단위/통합 테스트에서 외부 실패(timeout/에러) 시 폴백 동작 검증 (개인 프로젝트 적합, 권장)

B) 확장 — 위 + 부하/카오스 테스트(장애 주입)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4: Rate Limit 카운터 저장 방식 (Security/Scalability)
백엔드 2 인스턴스 환경에서 rate limit 카운터를 어떻게 관리할까요? (인스턴스별 인메모리면 실효 한도가 인스턴스 수만큼 커짐)

A) 인스턴스별 인메모리(Bucket4j 로컬) — 단순, 소규모라 실효 한도 증가 허용 (권장)

B) 공유 저장소(Redis 등) 기반 분산 rate limit — 정확한 전역 한도(인프라 추가)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5: 데이터 보존(3개월) 실행 방식 (Security/Privacy)
RSVP 개인정보 3개월 후 삭제/익명화(NFR-S7)를 어떻게 실행할까요?

A) 애플리케이션 내 스케줄 배치(예: 일 1회)로 만료 레코드 자동 삭제/익명화 (권장)

B) 수동 운영 스크립트로 주기적 실행 (자동화 없음)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6: 성능 패턴 — 갤러리 서명 URL (Performance)
갤러리 조회 성능 최적화는?

A) 서명 URL을 짧게 캐시(예: 5분)하여 스토리지 list/sign 호출 절감 (TTL 15분보다 짧게 유지)

B) 매 요청마다 새로 나열·서명 (캐시 없음, 항상 최신)

X) Other (please describe after [Answer]: tag below)

[Answer]: 요구사항(01_Discovery자료.md) 파일의 내용을 바탕으로 권장(Recommend)
