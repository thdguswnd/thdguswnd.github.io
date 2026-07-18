# NFR Requirements — Unit 1: Backend (`sm-be`)

## 1. Scalability (확장성)
- 규모: 소규모 — 총 하객 약 200명, 청첩장 배포를 주 1~2회로 분산하여 순간 동시 접속 낮음 (Q1=A)
- NFR-SC1: 동시 접속 수십 명 수준을 여유 있게 처리. 과도한 사전 확장 불필요
- NFR-SC2: multi-zone 가용성을 위해 백엔드 2 인스턴스 운영(최소 이중화)
- NFR-SC3: Gallery/Instagram은 무상태 → 필요 시 수평 확장 용이

## 2. Performance (성능)
- NFR-P1: 일반 API(RSVP, Gallery) 응답 p95 < 500ms (Q2=A)
- NFR-P2: Instagram 피드 — 캐시 히트 시 p95 < 300ms, 캐시 미스(외부 호출 포함) p95 < 1.5s
- NFR-P3: Instagram 서버 캐시 TTL 10분으로 외부 호출·지연 최소화 (BR-IG-02)

## 3. Availability (가용성)
- NFR-A1: 단일 리전 + multi-zone (요구사항 확정, 교차 리전 DR 불필요)
- NFR-A2: 백엔드 2 인스턴스로 단일 zone 장애 시에도 서비스 지속
- NFR-A3: DB는 관리형(또는 multi-zone) 구성으로 가용성 확보 (Infrastructure Design에서 구체화)
- NFR-A4: Health check(liveness/readiness)로 비정상 인스턴스 자동 교체 유도 (RESILIENCY-06)

## 4. Security (보안) — Security Baseline 적용
- NFR-S1: RSVP 등 공개 엔드포인트 rate limit = IP당 분당 5회, 시간당 30회 (Q3=A, SECURITY-11)
- NFR-S2: 전송 구간 TLS, 저장 구간(DB·스토리지) 암호화 (SECURITY-01)
- NFR-S3: 서버 측 입력 검증·파라미터화 쿼리 (SECURITY-05, BR-RSVP-08)
- NFR-S4: 보안 응답 헤더(CSP/HSTS 등), 오리진 제한 CORS (SECURITY-04/08)
- NFR-S5: 시크릿(Instagram 토큰 등)은 시크릿 매니저/환경 변수로 관리, 하드코딩 금지 (SECURITY-12)
- NFR-S6: 스토리지 버킷 비공개 + 서명 URL (SECURITY-09)
- **NFR-S7 (데이터 보존)**: RSVP 개인정보(이름·연락처)는 예식일 이후 3개월 뒤 삭제 또는 익명화 (Q4=A, 개인정보 최소 보존). 보존/삭제 작업은 스케줄 배치 또는 수동 운영 절차로 문서화
- NFR-S8: 로그에 PII/토큰/계좌정보 미기록 (SECURITY-03)

## 5. Reliability (신뢰성)
- NFR-R1: 외부 호출(Instagram, 스토리지)에 timeout 설정, 실패 시 graceful degradation (RESILIENCY-10)
- NFR-R2: Instagram 실패 시 빈 목록 폴백 → 프론트는 프로필 링크 노출 (BR-IG-04)
- NFR-R3: 통합 예외 처리, 사용자 대면 일반화 메시지, fail-closed (SECURITY-15)
- NFR-R4: RSVP DB 자동 백업, 백업 암호화, 보존 정책 정의 (RESILIENCY-12)

## 6. Maintainability / Observability (유지보수/관측성)
- NFR-M1: 경량 관측성 — 구조적 로깅 + health check + 기본 메트릭(요청수/에러율/지연) (Q7=A)
- NFR-M2: Cloud Native 모니터링 연동 — GCP Cloud Monitoring/Logging(초기), Azure Monitor 이식 (Q7=A 보강). 별도 상용 APM 미도입
- NFR-M3: PBT(Partial) + 예시 기반 테스트로 회귀 방지, PBT 실패 시 시드/반례 로깅 (PBT-08)

## 7. 확정된 상위 결정 참조 (재확인)
- 단일 리전 multi-zone, 경량 변경관리/장애대응(개인 프로젝트), GCP→Azure 이식성, PBT Partial — requirements.md Key Decisions 참조

## 8. 검증
- Scalability/Performance/Availability/Security/Reliability/Maintainability 전 범주에 NFR 정의됨
- Security/Resiliency 베이스라인 규칙과 정합. 이 단계 blocking finding 없음
