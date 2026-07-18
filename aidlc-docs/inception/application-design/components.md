# Components — 모바일 청첩장

상위 수준 컴포넌트 식별 및 책임 정의. 아키텍처: **SPA(React+Vite) + REST API(Spring Boot)**, 모노레포(`sm-fe` / `sm-be`).

## 1. 프론트엔드 컴포넌트 (`sm-fe`, React 18 + TypeScript + Vite)

### 1.1 페이지/오케스트레이션
| 컴포넌트 | 책임 |
|---|---|
| `InvitationPage` | 최상위 컨테이너. 전체 섹션을 요구사항 순서대로 세로 배치하고 스크롤 흐름을 오케스트레이션 |
| `ScrollReveal` | 스크롤 진입 시 콘텐츠 fade-in (IntersectionObserver 기반 재사용 컴포넌트/훅) |
| `SectionContainer` | 각 섹션 공통 레이아웃/여백/애니메이션 래퍼 |

### 1.2 섹션 컴포넌트 (요구사항 표시 순서)
| 컴포넌트 | 대응 FR | 책임 |
|---|---|---|
| `HeroSection` | FR-01 | 메인 사진 배경 + 제목 문구 오버레이(별도 레이어) |
| `GreetingSection` | FR-03 | 인사말 + 신랑·신부 및 양가 부모님 정보 |
| `GroomIntroSection` | FR-04 | 신랑 사진·소개 |
| `BrideIntroSection` | FR-05 | 신부 사진·소개 |
| `TimelineSection` | FR-06 | 두 사람의 타임라인 |
| `CalendarSection` | FR-07 | 2026년 11월 달력, 15일 강조, D-Day 카운터 |
| `DirectionsSection` | FR-08 | 주소·지도, 네이버지도/카카오내비/티맵 deep link, 주차 안내 |
| `RsvpSection` | FR-09 | 참석 의사 폼(이름·연락처·참석여부·인원·식사여부) 제출 |
| `GallerySection` | FR-10 | 서명 URL로 갤러리 이미지 표시 |
| `InstagramSection` | FR-11 | 백엔드 프록시로 피드 로드, 클릭 시 Instagram 이동 |
| `GiftSection` | FR-12 | 신랑측/신부측 계좌번호·카카오페이 링크 |

### 1.3 공통/유틸리티
| 컴포넌트 | 책임 |
|---|---|
| `content config (JSON)` | 청첩장 콘텐츠(문구·일시·장소·인물·계좌 등)를 JSON 파일로 관리 (FR-13, Q5=B) |
| `ContentProvider` | JSON 콘텐츠를 로드/파싱하고 타입 검증하여 컴포넌트에 제공 |
| `DDayCalculator` | 예식일 기준 D-Day 계산 (순수 함수, PBT 대상) |
| `CalendarModel` | 월 달력 그리드 생성·강조일 계산 (순수 함수, PBT 대상) |
| `ApiClient` | 백엔드 REST 호출 래퍼 (RSVP/Gallery/Instagram), 타임아웃·에러 처리 |

## 2. 백엔드 컴포넌트 (`sm-be`, Spring Boot 3.1.x)

### 2.1 API/컨트롤러 (REST)
| 컴포넌트 | 책임 |
|---|---|
| `RsvpController` | `POST /api/rsvp` — 참석 의사 접수 |
| `GalleryController` | `GET /api/gallery` — 갤러리 이미지 서명 URL 목록 반환 |
| `InstagramController` | `GET /api/instagram/feed` — Instagram 피드 프록시 |
| `HealthController` | `GET /health` — shallow + deep(DB 연결) health check (RESILIENCY-06) |

### 2.2 서비스/도메인
| 컴포넌트 | 책임 |
|---|---|
| `RsvpService` | RSVP 입력 검증 → 영속화 오케스트레이션 |
| `GalleryService` | 스토리지 객체 목록 조회 → 서명 URL 발급 |
| `InstagramService` | 서버 측 토큰으로 Instagram Graph API 호출 → 응답 변환/캐시 |
| `RsvpRepository` | RSVP 데이터 영속화(PostgreSQL/H2, Flyway 스키마) |

### 2.3 인프라/횡단 관심사
| 컴포넌트 | 책임 |
|---|---|
| `StorageClient` (interface) | 오브젝트 스토리지 추상화. 구현: `GcsStorageClient`(초기), `AzureBlobStorageClient`(이식) |
| `RateLimitFilter` | 공개 엔드포인트 rate limiting (SECURITY-11, Q4=A) |
| `SecurityHeadersFilter` | 보안 응답 헤더 주입 (SECURITY-04) |
| `CorsConfig` | 허용 오리진 제한 CORS 설정 (SECURITY-08) |
| `GlobalExceptionHandler` | 통합 예외 처리, 사용자 대면 일반 메시지 (SECURITY-15) |
| `SecretsProvider` | Instagram 토큰 등 시크릿을 환경/시크릿 매니저에서 로드 (SECURITY-12) |

## 3. 외부 시스템 (연동 대상)
| 외부 시스템 | 용도 |
|---|---|
| Object Storage (GCP Cloud Storage / Azure Blob) | 갤러리·정적 이미지 저장 |
| Instagram Graph API | 피드 조회 |
| 지도 앱(네이버지도/카카오내비/티맵) | deep link (클라이언트에서 직접 이동, 백엔드 무관) |
