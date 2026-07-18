# Tech Stack Decisions — Unit 1: Backend (`sm-be`)

## 1. 핵심 스택 (요구사항 단계 확정)
| 영역 | 선택 | 비고 |
|---|---|---|
| 언어/런타임 | Java 17 | Spring Boot 3.1.x 요구 |
| 프레임워크 | Spring Boot 3.1.x | REST API |
| 빌드 | Gradle (`gradlew.bat`) | steering 관례 |
| DB(운영) | PostgreSQL | |
| DB(개발) | H2 (PostgreSQL 호환 모드) | steering 관례 |
| 컨테이너/오케스트레이션 | Docker + Kubernetes(GKE→AKS) | 이식성 |

## 2. 이번 단계에서 확정한 세부 결정
| 영역 | 선택 | 근거 |
|---|---|---|
| 데이터 접근 | **MyBatis** + **Flyway** 마이그레이션 | Q5(위임)→권장 A, steering 관례(useGeneratedKeys 등) |
| Instagram 캐시 | **Caffeine 인메모리 캐시**(TTL 10분) | Q6(위임)→권장 A, 소규모·짧은 TTL이라 인스턴스별 독립 캐시 허용 |
| 인스턴스 확장 | 백엔드 **2 인스턴스**(multi-zone) | Q6=A, 최소 이중화 |
| Rate limiting | 애플리케이션 레벨 rate limiter(예: Bucket4j) — IP당 분당 5/시간당 30 | Q3=A, SECURITY-11 |
| 회복성 패턴 | Resilience4j(timeout, 필요 시 circuit breaker/retry) | RESILIENCY-10 |
| 시크릿 관리 | 클라우드 시크릿 매니저/환경 변수(GCP Secret Manager → Azure Key Vault) | SECURITY-12 |
| 오브젝트 스토리지 SDK | GCS SDK(초기) — `StorageClient` 추상화 뒤에 배치, Azure Blob SDK 이식 | Q7(app design) |
| 관측성 | 구조적 로깅 + Micrometer 메트릭 + Cloud Monitoring/Logging(GCP)→Azure Monitor | Q7=A + Cloud Native |
| 검증 | Bean Validation(Jakarta Validation) + 커스텀 검증 | BR-RSVP-01~06 |
| 테스트 | JUnit5 + PBT 라이브러리(jqwik 권장) — Partial 모드 | PBT-09 |

## 3. PBT 프레임워크 선정 (PBT-09)
- **jqwik** (JUnit5 통합, Java property-based testing)
- 적용 대상(Partial): RSVP 검증 결정성, 연락처 정규화 멱등성, DTO 직렬화 라운드트립, 불참 정규화, upsert 불변식 (business-rules.md P-01~P-05)
- 실패 시 시드/반례 로깅, CI 재현용 시드 고정 옵션 (PBT-08)

## 4. 이식성 노트 (GCP → Azure)
- 스토리지: `StorageClient` 인터페이스로 GCS↔Azure Blob 교체
- 시크릿: 추상 `SecretsProvider`로 Secret Manager↔Key Vault 교체
- 모니터링: Micrometer 레지스트리 교체(Cloud Monitoring↔Azure Monitor)
- DB: PostgreSQL 유지(양 클라우드 관리형 제공)

## 5. 근거 요약
소규모 개인 청첩장 특성상 과도한 인프라(공유 캐시 등)를 피하고, steering 관례(MyBatis/Flyway/H2)와 클라우드 이식성(추상화 계층), 보안·회복성 베이스라인을 만족하는 경량 구성으로 결정.
