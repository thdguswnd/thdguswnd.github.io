# NFR Design Patterns — Unit 1: Backend (`sm-be`)

NFR 요구사항을 구체적 설계 패턴으로 매핑합니다.

## 1. Resilience 패턴
| 패턴 | 적용 | 근거 |
|---|---|---|
| Timeout | 모든 외부 호출(Instagram, 스토리지)에 연결/읽기 timeout | NFR-R1, RESILIENCY-10 |
| Circuit Breaker | Instagram 호출에 Resilience4j 회로차단 — 반복 실패 시 개방하여 빠른 폴백 | Q1=A |
| Retry (제한적) | Instagram 호출 1회 재시도(지수 backoff 짧게) | Q1=A |
| Fallback | Instagram 실패/개방 시 빈 목록 반환 → 프론트 프로필 링크 폴백 | BR-IG-04 |
| Fail-closed 예외 처리 | `GlobalExceptionHandler`로 일반화 응답, 내부 상세 비노출 | SECURITY-15 |
| Health Probe | liveness/readiness(+DB) 분리, 비정상 인스턴스 자동 교체 | NFR-A4, RESILIENCY-06 |

## 2. Scalability 패턴
| 패턴 | 적용 | 근거 |
|---|---|---|
| Stateless 서비스 | Gallery/Instagram 무상태 → 수평 확장 자유 | NFR-SC3 |
| 다중 인스턴스 | 백엔드 2 인스턴스(multi-zone) | NFR-SC2 |
| 로컬 캐시 | Caffeine 인메모리(인스턴스별) — 공유 저장소 미도입(소규모) | Q4/Q6 |

## 3. Performance 패턴
| 패턴 | 적용 | 근거 |
|---|---|---|
| 응답 캐싱(Instagram) | Caffeine, TTL 10분 | BR-IG-02, NFR-P3 |
| 서명 URL 단기 캐싱(Gallery) | Caffeine, TTL 5분 (서명 URL 자체 TTL 15분보다 짧게) — list/sign 호출 절감 | Q6=A |
| DB 커넥션 풀 | HikariCP 기본, 소규모에 맞춘 풀 사이즈 | NFR-P1 |
| 페이로드 최소화 | DTO에 필요한 필드만 노출 | NFR-P1 |

## 4. Security 패턴
| 패턴 | 적용 | 근거 |
|---|---|---|
| Rate Limiting | Bucket4j 인스턴스별 인메모리, IP당 분당 5/시간당 30 (인스턴스별 독립 허용) | Q4=A, NFR-S1 |
| Input Validation | Bean Validation + 커스텀 검증(휴대폰 형식 등), 파라미터화 쿼리 | NFR-S3 |
| Security Headers/CORS | `SecurityHeadersFilter` + 오리진 제한 CORS | NFR-S4 |
| Secrets 관리 | `SecretsProvider`(Secret Manager/Key Vault) | NFR-S5 |
| Private Storage + Signed URL | 버킷 비공개, 만료형 URL | NFR-S6 |
| PII 최소 보존 | 3개월 후 삭제/익명화 스케줄 배치 | Q5=A, NFR-S7 |
| 로그 마스킹 | PII/토큰/계좌 미기록 | NFR-S8 |

## 5. 배포 / 롤백 패턴 (RESILIENCY-04)
- **배포**: Kubernetes Rolling Update (무중단, maxUnavailable/maxSurge 설정)
- **롤백**: `kubectl rollout undo`로 직전 리비전 복귀
- **이미지 태그**: 불변 태그(커밋 SHA 등), `latest` 금지 (SECURITY-13)
- **변경 관리**: 로컬 Git 버전 관리 + 배포(경량, 개인 프로젝트) — requirements 결정 준수

## 6. 회복성 테스트 패턴 (RESILIENCY-14)
- 경량: 단위/통합 테스트에서 외부 실패 시나리오(timeout/5xx/네트워크 오류) 모킹 → 폴백·회로차단 동작 검증 (Q3=A)
- 대상: Instagram 폴백, 스토리지 오류 시 갤러리 축소, rate limit 초과 시 429
- 부하/카오스 테스트는 범위 외(추후)

## 7. 검증
- Resilience/Scalability/Performance/Security 전 범주 패턴 매핑 완료
- RESILIENCY-04/14 사용자 결정 반영. 이 단계 blocking finding 없음
