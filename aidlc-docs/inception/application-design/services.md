# Services — 모바일 청첩장

서비스 정의와 오케스트레이션 패턴. 백엔드는 세 개의 얇은 도메인 서비스로 구성되며, 프론트엔드는 정적 콘텐츠 렌더링 + 이 서비스들의 REST 호출로 동작합니다.

## 1. RSVP Service
- **책임**: 참석 의사 접수 처리 (FR-09)
- **오케스트레이션**:
  1. `RsvpController`가 요청 수신 (rate limiting 필터 통과 — SECURITY-11)
  2. `RsvpService.validate()` 서버 측 입력 검증 (SECURITY-05)
  3. `RsvpRepository.save()`로 DB 영속화 (파라미터화 쿼리)
  4. 접수 확인 응답 반환 (실시간 알림 없음 — 요구사항 Q8=B)
- **경계**: 조회(관리자 화면)는 초기 범위 외. 데이터 축적만 (FR-14)

## 2. Gallery Service
- **책임**: 갤러리 이미지 제공 (FR-10)
- **오케스트레이션**:
  1. `GalleryController`가 요청 수신
  2. `GalleryService.listImages()`가 `StorageClient.listObjects()`로 객체 나열
  3. 각 객체에 대해 `StorageClient.generateSignedUrl()`로 만료형 서명 URL 발급 (버킷 비공개 유지 — SECURITY-09, Q2=A)
  4. 서명 URL 목록 반환
- **경계**: 이미지 업로드는 초기 범위 외(하객 사진첩 제외). 읽기 전용

## 3. Instagram Service
- **책임**: Instagram 피드 프록시 (FR-11)
- **오케스트레이션**:
  1. `InstagramController`가 요청 수신
  2. `InstagramService`가 `SecretsProvider`에서 토큰 로드 (서버 측 관리 — SECURITY-12, Q3=A)
  3. Instagram Graph API 호출 (timeout 설정 — RESILIENCY-10)
  4. 응답을 `InstagramItem`으로 변환, 짧은 TTL 캐시(선택)
  5. 실패 시 빈 목록 반환하여 프론트가 프로필 링크만 노출(graceful degradation)
- **경계**: 읽기 전용 프록시. 쓰기/게시 없음

## 4. 횡단 관심사 (전 서비스 공통)
- **보안 헤더**: `SecurityHeadersFilter`가 모든 HTML/응답에 CSP/HSTS 등 주입 (SECURITY-04)
- **CORS**: 허용 오리진만 (SECURITY-08)
- **예외 처리**: `GlobalExceptionHandler`가 일반화된 오류 응답 (SECURITY-15, fail closed)
- **로깅**: 구조적 로깅, PII/토큰 미기록 (SECURITY-03)
- **Health**: `HealthController` (RESILIENCY-06)

## 5. 오케스트레이션 스타일
- 동기 요청/응답(REST/JSON). 메시지 큐·이벤트 기반 비동기는 초기 범위 외.
- 각 서비스는 상태를 공유하지 않으며, RSVP만 DB 상태를 가짐. 갤러리·Instagram은 외부 소스 프록시(무상태).
