# Application Design (통합) — 모바일 청첩장

본 문서는 `components.md`, `component-methods.md`, `services.md`, `component-dependency.md`를 통합 요약합니다. 상세 비즈니스 로직/스키마/검증 규칙은 Functional Design(per-unit)에서 확정합니다.

## 1. 설계 결정 요약
| 항목 | 결정 | 근거 |
|---|---|---|
| 아키텍처 스타일 | SPA(React+Vite) + REST API(Spring Boot) | Q6=A |
| 리포지토리 구조 | 모노레포 — `sm-fe` + `sm-be` | Q1(위임)→권장 A, steering 관례 |
| 갤러리 이미지 접근 | 백엔드 발급 서명 URL, 버킷 비공개 | Q2=A, SECURITY-09 |
| Instagram 연동 | 백엔드 프록시(토큰 서버 관리) | Q3(위임)→권장 A, SECURITY-12 |
| RSVP 남용 방지 | Rate limiting만 (CAPTCHA 확장 여지) | Q4=A, SECURITY-11 |
| 콘텐츠 구성 | JSON 설정 파일 | Q5=B, FR-13 |
| 스토리지 이식성 | `StorageClient` 추상화(GCS↔Azure) | 요구사항 Q7=A |

## 2. 시스템 개요
- **프론트엔드(`sm-fe`)**: 세로 스크롤 + fade-in 단일 페이지. 섹션 11종을 요구사항 순서로 렌더링. 콘텐츠는 JSON 설정에서 로드. RSVP/갤러리/Instagram은 백엔드 REST 호출.
- **백엔드(`sm-be`)**: 세 개 얇은 도메인 서비스(RSVP, Gallery, Instagram) + Health + 보안/횡단 필터. RSVP만 DB 상태 보유, 나머지는 외부 소스 프록시(무상태).
- **외부**: Object Storage(GCS/Azure), Instagram Graph API, 지도 앱 deep link.

## 3. 컴포넌트 요약
- 프론트: `InvitationPage`, `ScrollReveal`, 섹션 11종(Hero/Greeting/Groom/Bride/Timeline/Calendar/Directions/Rsvp/Gallery/Instagram/Gift), `ContentProvider`, `DDayCalculator`, `CalendarModel`, `ApiClient`
- 백엔드: `RsvpController/Service/Repository`, `GalleryController/Service`, `InstagramController/Service`, `HealthController`, `StorageClient`(+GCS/Azure 구현), 보안 필터군, `SecretsProvider`, `GlobalExceptionHandler`
- 자세한 목록: `components.md`

## 4. 서비스/오케스트레이션
- RSVP: 수신 → 검증 → 영속화 → 확인 응답
- Gallery: 객체 나열 → 서명 URL 발급 → 반환
- Instagram: 토큰 로드 → Graph API 호출(timeout) → 변환/캐시 → 실패 시 폴백
- 상세: `services.md`

## 5. 의존성/데이터 흐름
- 프론트 → REST → 백엔드 컨트롤러 → 서비스 → (DB / 스토리지 / Instagram)
- 지도: 프론트에서 deep link 직접 이동
- 다이어그램/매트릭스: `component-dependency.md`

## 6. 확장 규칙 반영(설계 수준)
- **Security**: 서명 URL(비공개 스토리지), 서버 측 토큰, rate limiting, 보안 헤더/CORS, 통합 예외 처리, 입력 검증 지점 식별
- **Resiliency**: Health check, 외부 호출 timeout + graceful degradation, 무상태 서비스(확장 용이), RSVP DB 백업 대상 식별 — 세부 패턴/파라미터는 NFR Design에서 확정
- **PBT(Partial)**: 순수 함수 후보(`DDayCalculator`, `CalendarModel`)와 DTO 직렬화, RSVP 검증을 PBT 대상으로 식별 — PBT-01 상세는 Functional Design에서

## 7. 다음 단계로 이관되는 항목
- RSVP 데이터 스키마·검증 규칙 상세 (Functional Design)
- 기술 스택 세부/PBT 프레임워크 선정 (NFR Requirements)
- 보안·리질리언시 패턴 파라미터화 (NFR Design)
- 인프라 매핑(GKE/K8s, Cloud Storage, DB, multi-zone) (Infrastructure Design)
