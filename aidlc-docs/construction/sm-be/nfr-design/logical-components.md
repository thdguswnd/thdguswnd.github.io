# Logical Components — Unit 1: Backend (`sm-be`)

NFR 패턴을 구현하는 논리 컴포넌트(기술 매핑 포함). 물리 배포 매핑은 Infrastructure Design에서.

## 1. 캐시 컴포넌트
| 컴포넌트 | 기술 | 용도 | TTL |
|---|---|---|---|
| `InstagramFeedCache` | Caffeine | Instagram 피드 응답 캐시 | 10분 |
| `GallerySignedUrlCache` | Caffeine | 갤러리 서명 URL 목록 캐시 | 5분 |
- 인스턴스별 독립(공유 저장소 없음). 소규모·짧은 TTL이라 정합성 영향 미미.

## 2. Rate Limiting 컴포넌트
| 컴포넌트 | 기술 | 정책 |
|---|---|---|
| `RateLimitFilter` | Bucket4j(인메모리) | 공개 엔드포인트 IP당 분당 5 / 시간당 30 |
- 인스턴스별 카운터(2 인스턴스 → 실효 한도 증가 허용, Q4=A). 초과 시 HTTP 429.

## 3. 회복성 컴포넌트
| 컴포넌트 | 기술 | 역할 |
|---|---|---|
| `InstagramClient` | Resilience4j (TimeLimiter + CircuitBreaker + Retry) | Instagram 호출 보호, 실패 시 폴백 |
| `StorageClient` | SDK + timeout | 스토리지 호출 timeout, 오류 시 갤러리 축소 |
| `GlobalExceptionHandler` | Spring `@ControllerAdvice` | 일반화 오류 응답(fail-closed) |
| `HealthController` | Spring Actuator | liveness/readiness(+DB) |

## 4. 보안 컴포넌트
| 컴포넌트 | 기술 | 역할 |
|---|---|---|
| `SecurityHeadersFilter` | Servlet Filter | CSP/HSTS/X-Frame-Options 등 |
| `CorsConfig` | Spring CORS | 허용 오리진 제한 |
| `SecretsProvider` | GCP Secret Manager / Azure Key Vault(추상화) | Instagram 토큰 등 |
| Validation | Bean Validation(jakarta) + 커스텀 Validator | RSVP 입력 검증 |

## 5. 데이터 보존 컴포넌트 (Privacy)
| 컴포넌트 | 기술 | 역할 |
|---|---|---|
| `RsvpRetentionScheduler` | Spring `@Scheduled`(일 1회) | 예식일+3개월 경과 RSVP 삭제 또는 익명화(name/contact 제거) |
- 다중 인스턴스 중복 실행 방지: 단순 DB 조건부 업데이트(멱등)로 처리하거나 단일 인스턴스 스케줄 지정(운영 노트). 소규모라 멱등 삭제로 충분.

## 6. 관측성 컴포넌트
| 컴포넌트 | 기술 | 역할 |
|---|---|---|
| 구조적 로깅 | SLF4J/Logback JSON | PII 마스킹, 요청 상관관계 ID |
| 메트릭 | Micrometer | 요청수/에러율/지연, 캐시 히트율 |
| 모니터링 연동 | Cloud Monitoring/Logging(GCP)→Azure Monitor | Cloud Native 관측성 |

## 7. 컴포넌트 상호작용 요약
```
요청 → [RateLimitFilter] → [SecurityHeadersFilter/Cors] → Controller
   RSVP    → RsvpService → (Validation) → RsvpRepository(MyBatis) → DB
   Gallery → GalleryService → [GallerySignedUrlCache] → StorageClient → Object Storage
   Instagram → InstagramService → [InstagramFeedCache] → InstagramClient(Resilience4j) → Graph API
배치: RsvpRetentionScheduler → RsvpRepository (만료 삭제/익명화)
예외: 전 구간 → GlobalExceptionHandler
관측: 전 구간 → 로깅/메트릭 → Cloud Monitoring
```

## 8. 검증
- 모든 NFR 패턴이 논리 컴포넌트로 매핑됨
- 기술 선택이 tech-stack-decisions.md와 정합(MyBatis/Caffeine/Bucket4j/Resilience4j/Micrometer)
