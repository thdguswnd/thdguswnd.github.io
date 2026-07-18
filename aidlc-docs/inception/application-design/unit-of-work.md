# Unit of Work — 모바일 청첩장

시스템을 **독립 배포 서비스(Service) 2개**로 분해합니다 (Q1=A). 구현 순서는 **Backend → Frontend** (Q3=A).

## Unit 1 — Backend (`sm-be`)
- **유형**: 독립 배포 서비스 (Spring Boot 3.1.x, 컨테이너)
- **책임**: RSVP 접수/영속화, 갤러리 서명 URL 제공, Instagram 피드 프록시, Health, 보안·횡단 관심사
- **내부 논리 모듈(Module)**:
  - **RSVP 모듈**: `RsvpController` / `RsvpService` / `RsvpRepository` (+ DB, Flyway 스키마)
  - **Gallery 모듈**: `GalleryController` / `GalleryService` / `StorageClient`(GCS·Azure 구현)
  - **Instagram 모듈**: `InstagramController` / `InstagramService` / `SecretsProvider`
  - **Platform/횡단**: `HealthController`, `RateLimitFilter`, `SecurityHeadersFilter`, `CorsConfig`, `GlobalExceptionHandler`
- **대응 FR**: FR-09, FR-10, FR-11 (일부), 그리고 전 API의 보안/헬스 기반
- **배포**: Docker 컨테이너 → GKE(초기), AKS 이식
- **상태 보유**: RSVP DB (백업 대상, RESILIENCY-12)

## Unit 2 — Frontend (`sm-fe`)
- **유형**: 독립 배포 서비스 (React 18 + TypeScript + Vite, 정적 빌드)
- **책임**: 세로 스크롤 + fade-in 청첩장 SPA. 전 섹션 렌더링, 콘텐츠 JSON 로드, 백엔드 REST 호출, 지도 deep link
- **주요 구성**: `InvitationPage`, 섹션 11종, `ScrollReveal`, `ContentProvider`+콘텐츠 JSON, `DDayCalculator`, `CalendarModel`, `ApiClient`
- **대응 FR**: FR-01~FR-08, FR-12, FR-13, 그리고 FR-09/10/11의 UI
- **배포**: 정적 빌드 산출물을 nginx 컨테이너로 서빙 → GKE 배포 (Q2 권장 A, 이식성 일관). *대안(비용 최적화): Cloud Storage/CDN 정적 호스팅 — 추후 전환 가능*

## 코드 조직 전략 (Greenfield)
모노레포 루트 구조:
```
c:\AIDLC_WS_GREEN\
  sm-be\        # Backend (Spring Boot, Gradle)
    src\main\java\...        # RSVP / Gallery / Instagram / platform
    src\main\resources\
      db\migration\          # Flyway 마이그레이션
      application.yml
    Dockerfile
    build.gradle
  sm-fe\        # Frontend (React + Vite)
    src\
      sections\              # 섹션 컴포넌트 11종
      lib\                   # ApiClient, DDayCalculator, CalendarModel
      content\               # 콘텐츠 JSON + 타입
    Dockerfile               # nginx 정적 서빙
    package.json
  k8s\          # (Infrastructure Design에서 구체화) 배포 매니페스트
```
> 최종 디렉터리/빌드 세부는 code-generation.md 패턴에 따라 Code Generation 단계에서 확정.

## Unit 경계 검증
- 모든 FR이 unit에 할당됨 (아래 story-map 참조)
- 두 unit은 REST 계약으로만 결합 → 독립 개발/배포 가능
- 상태(DB)는 Backend에만 존재 → 경계 명확
