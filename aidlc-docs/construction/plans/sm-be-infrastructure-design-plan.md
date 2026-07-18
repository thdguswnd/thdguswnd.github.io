# Infrastructure Design Plan — Unit 1: Backend (`sm-be`)

논리 컴포넌트(캐시/rate limiter/스케줄러/DB/스토리지 등)를 실제 인프라 서비스로 매핑합니다. 초기 GCP 기준, Azure 이식성 유지.

## 진행 체크리스트
- [x] Functional/NFR Design 분석
- [x] 아래 인프라 질문에 대한 사용자 답변 수집 (Q1~Q6 모두 권장안 A 채택)
- [x] 답변 모호성 분석 및 필요 시 follow-up (이식성 보강 3종 반영)
- [x] `infrastructure-design.md` 생성 (서비스 매핑)
- [x] `deployment-architecture.md` 생성 (배포 토폴로지)
- [x] 검증

---

## 인프라 결정 질문

### Question 1: GKE 클러스터 모드 (Compute)
백엔드를 실행할 GKE 모드는?

A) GKE Autopilot — 노드 관리 자동화, 운영 부담 최소 (개인 프로젝트 권장)

B) GKE Standard — 노드 풀 직접 관리(세밀한 제어)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2: PostgreSQL 호스팅 (Storage/DB)
운영 DB(PostgreSQL) 호스팅 방식은?

A) Cloud SQL for PostgreSQL(관리형) + multi-zone HA + 자동 백업 (권장)

B) 클러스터 내 자체 호스팅 PostgreSQL (비용↓, 운영·가용성 부담↑)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3: 환경 분리 (Deployment Environment)
환경 구성은?

A) 로컬 개발(H2) + 단일 운영(GKE, Cloud SQL) — 개인 프로젝트에 단순 (권장)

B) dev + prod 분리(각 클러스터/DB)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4: 인그레스 / TLS (Networking)
외부 노출 및 TLS는?

A) GKE Ingress(HTTPS LB) + Google-managed 인증서, `/api`는 백엔드로 라우팅 (권장)

B) 별도 API Gateway 제품 도입

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5: 알림 (Monitoring/Alerting)
운영 알림 수준은?

A) 기본 알림 — 가용성(health) 다운, 에러율 급증 시 알림(이메일 등) (권장)

B) 알림 없음 — 대시보드 확인만

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 6: 오브젝트 스토리지 구성 (Storage)
갤러리 이미지용 스토리지 구성은?

A) 단일 비공개 GCS 버킷(리전=클러스터와 동일), 서명 URL 접근, 버전 관리 off (권장)

B) 버킷 + CDN(Cloud CDN) 결합 (성능↑, 단 비공개+서명URL 정책과 조합 검토 필요)

X) Other (please describe after [Answer]: tag below)

[Answer]: A
