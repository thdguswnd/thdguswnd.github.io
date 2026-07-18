# Code Generation Plan — Unit 1: Backend (`sm-be`)

이 계획은 Backend unit 코드 생성의 **단일 기준(single source of truth)**입니다. Part 2에서 이 순서를 그대로 실행하며, 각 단계 완료 시 [x] 표시합니다.

## Unit 컨텍스트
- **Unit**: Backend (`sm-be`) — Spring Boot 3.1.x, Gradle, Java 17
- **코드 위치**: `c:\AIDLC_WS_GREEN\sm-be\` (workspace root, greenfield 멀티유닛 모노레포. 문서만 aidlc-docs/)
- **구현 FR**: FR-09(RSVP), FR-10(Gallery), FR-11(Instagram), FR-14(RSVP 축적/보존)
- **의존성**: 외부(PostgreSQL/H2, GCS, Instagram Graph API). 다른 unit(Frontend)은 이 API 계약에 의존(역방향 의존 없음)
- **기술 결정**: MyBatis+Flyway, Caffeine, Bucket4j, Resilience4j, jqwik(PBT Partial), Bean Validation, Micrometer
- **API 계약**: `POST /api/rsvp`, `GET /api/gallery`, `GET /api/instagram/feed`, `GET /health`(Actuator)

---

## 생성 단계 (순차 실행)

### Step 1: 프로젝트 구조 및 빌드 설정 (greenfield)
- [x] `sm-be/build.gradle`, `settings.gradle`, `gradle.properties`(spotless/JDK17 add-exports 포함)
- [x] `gradlew.bat`/`gradlew`/`gradle/wrapper` (Gradle wrapper)
- [x] `src/main/resources/application.yml`(프로파일: `local`(H2)/`gcp`/`azure`), 포트 7080
- [x] 패키지 골격 `com.wedding.invitation` (rsvp/gallery/instagram/platform)

### Step 2: 도메인/비즈니스 로직 생성 (RSVP)
- [x] `rsvp/domain`: `Rsvp`(엔티티), enums `Side`/`Attendance`/`MealOption`
- [x] `rsvp/dto`: `RsvpRequest`(Bean Validation 애노테이션), `RsvpResponse`
- [x] `rsvp/validation`: 휴대폰 형식 Validator, 조건부 규칙(불참 시 인원/식사 null) — BR-RSVP-01~06
- [x] `rsvp/service/RsvpService`: 검증→연락처 정규화→upsert 오케스트레이션 (BR-RSVP-07)
- [x] `common/util`: 연락처 정규화 유틸(순수 함수)

### Step 3: 비즈니스 로직 단위 테스트 (+ PBT)
- [x] `RsvpService`/Validator 예시 기반 테스트
- [x] jqwik PBT: P-01(검증 결정성), P-02(정규화 멱등성), P-03(DTO 직렬화 라운드트립), P-04(불참 정규화), P-05(upsert 불변식)

### Step 4: 비즈니스 로직 요약
- [x] `aidlc-docs/construction/sm-be/code/business-logic-summary.md`

### Step 5: Repository 계층 (MyBatis + Flyway)
- [x] `rsvp/repository/RsvpRepository` + MyBatis Mapper(XML 또는 애노테이션), upsert(연락처 유니크)
- [x] Flyway 마이그레이션 `src/main/resources/db/migration/V1__create_rsvp.sql` (연락처 unique 제약, 인덱스)

### Step 6: Repository 단위 테스트
- [x] H2(PostgreSQL 모드) 기반 저장/조회/upsert 테스트

### Step 7: Repository 요약
- [x] `aidlc-docs/construction/sm-be/code/repository-summary.md`

### Step 8: API 계층 생성
- [x] `rsvp/api/RsvpController` (`POST /api/rsvp`)
- [x] `gallery/api/GalleryController` (`GET /api/gallery`) + `gallery/service/GalleryService`
- [x] `instagram/api/InstagramController` (`GET /api/instagram/feed`) + `instagram/service/InstagramService`
- [x] DTO(`GalleryItem`, `InstagramItem`)

### Step 9: API 계층 단위 테스트
- [x] MockMvc 기반 컨트롤러 테스트(정상/검증실패/429), 서비스 테스트(폴백 포함)

### Step 10: API 계층 요약
- [x] `aidlc-docs/construction/sm-be/code/api-summary.md`

### Step 11: 통합/횡단 컴포넌트 (NFR 반영)
- [x] `platform/storage`: `StorageClient` 인터페이스 + `GcsStorageClient`(서명 URL, TTL 15분) + `GallerySignedUrlCache`(Caffeine 5분)
- [x] `platform/instagram`: `InstagramClient`(Resilience4j TimeLimiter/CircuitBreaker/Retry) + `InstagramFeedCache`(Caffeine 10분) + 폴백
- [x] `platform/security`: `SecurityHeadersFilter`, `CorsConfig`, `RateLimitFilter`(Bucket4j 분당5/시간당30), `GlobalExceptionHandler`
- [x] `platform/secrets`: `SecretsProvider`(추상) + 환경/Secret Manager 구현 스텁
- [x] `platform/health`: Actuator health(liveness/readiness+DB) 설정
- [x] `platform/observability`: 구조적 로깅(PII 마스킹), Micrometer 메트릭
- [x] `rsvp/retention/RsvpRetentionScheduler`(@Scheduled, 예식+3개월 삭제/익명화, 멱등)

### Step 12: 횡단 컴포넌트 테스트
- [x] rate limit 429, 보안 헤더 존재, Instagram 폴백, 보존 배치 멱등성 테스트

### Step 13: DB 마이그레이션 확인
- [x] Flyway 스크립트 검증(로컬 H2 + PostgreSQL 호환 SQL)

### Step 14: 배포 산출물 생성
- [x] `sm-be/Dockerfile`(멀티스테이지, 비루트 유저, 불변 태그 전제)
- [x] `k8s/base/`(Deployment replicas=2, Service, HPA, ConfigMap, health probe)
- [x] `k8s/overlays/gcp/`(GKE Ingress+managed cert, Workload Identity, Cloud SQL 연결)
- [x] `k8s/overlays/azure/`(이식용 스텁: ingress-nginx/cert-manager, Key Vault, Azure PostgreSQL)

### Step 15: 문서 생성
- [x] `sm-be/README.md`(빌드/실행/프로파일), API 문서(엔드포인트 계약)
- [x] `aidlc-docs/construction/sm-be/code/deployment-artifacts-summary.md`

---

## 코드 위치 규칙
- 애플리케이션 코드: `c:\AIDLC_WS_GREEN\sm-be\` 및 `c:\AIDLC_WS_GREEN\k8s\`
- 문서(요약): `aidlc-docs/construction/sm-be/code/`
- 테스트는 생성만 하고 실행은 Build and Test 단계에서 수행

## FR 추적성
| FR | 구현 단계 |
|---|---|
| FR-09 RSVP | Step 2/3/5/8/9 |
| FR-10 Gallery | Step 8/11 |
| FR-11 Instagram | Step 8/11 |
| FR-14 RSVP 축적/보존 | Step 5/11(Scheduler) |
| 보안/회복성/관측성 | Step 11/12/14 |

## 범위 메모
- 총 15 단계. Java/Spring Boot 백엔드 + MyBatis/Flyway + 회복성/보안/관측성 + 배포 산출물.
- RSVP 관리자 조회 UI는 초기 범위 외(FR-14). 하객 사진첩/YouTube 범위 외.
