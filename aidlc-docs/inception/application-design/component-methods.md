# Component Methods — 모바일 청첩장

메서드 시그니처와 입출력 수준(상위)만 정의합니다. **상세 비즈니스 규칙/검증 로직은 Functional Design(per-unit)에서 확정**합니다. 시그니처는 언어 관례상 예시이며 구현 시 조정될 수 있습니다.

## 1. 프론트엔드 (TypeScript)

### ContentProvider
- `loadContent(): InvitationContent` — JSON 콘텐츠 로드·파싱·타입 검증 후 반환
- `InvitationContent` 타입: 인물/일시/장소/문구/계좌/갤러리 메타/Instagram 핸들 등 포함

### DDayCalculator (순수 함수, PBT 대상)
- `daysUntil(weddingDate: Date, today: Date): number` — D-Day(잔여 일수) 계산
- `formatDday(days: number): string` — 표시 문자열(D-지정, D-Day) 변환

### CalendarModel (순수 함수, PBT 대상)
- `buildMonthGrid(year: number, month: number): CalendarCell[][]` — 월 달력 그리드 생성
- `isHighlighted(cell: CalendarCell, weddingDate: Date): boolean` — 강조일(예식일) 여부

### ApiClient
- `submitRsvp(payload: RsvpRequest): Promise<RsvpResponse>` — RSVP 제출
- `fetchGallery(): Promise<GalleryItem[]>` — 갤러리 서명 URL 목록 조회
- `fetchInstagramFeed(): Promise<InstagramItem[]>` — Instagram 피드 조회
- 공통: 요청 타임아웃, 실패 시 에러 정규화(graceful degradation 지원)

### RsvpSection
- `handleSubmit(form: RsvpFormState): void` — 클라이언트 1차 검증 후 `ApiClient.submitRsvp` 호출
- `validate(form: RsvpFormState): ValidationResult` — 필수값/형식 클라이언트 검증

## 2. 백엔드 (Java / Spring Boot)

### RsvpController
- `ResponseEntity<RsvpResponse> submit(@Valid @RequestBody RsvpRequest req)` — `POST /api/rsvp`

### RsvpService
- `RsvpResult register(RsvpRequest req)` — 서버 측 검증 → `RsvpRepository` 저장 → 결과 반환
- `void validate(RsvpRequest req)` — 서버 측 입력 검증(타입/길이/형식, SECURITY-05)

### RsvpRepository
- `long save(RsvpEntity entity)` — RSVP 레코드 영속화, 생성 ID 반환
- `List<RsvpEntity> findAll()` — (추후 관리자 조회용, 초기엔 미노출)

### GalleryController
- `ResponseEntity<List<GalleryItem>> list()` — `GET /api/gallery`

### GalleryService
- `List<GalleryItem> listImages()` — 스토리지 객체 나열 → 서명 URL 발급하여 반환

### InstagramController
- `ResponseEntity<List<InstagramItem>> feed()` — `GET /api/instagram/feed`

### InstagramService
- `List<InstagramItem> getFeed()` — 서버 토큰으로 Graph API 호출 → 변환 → (캐시) 반환
- 외부 호출 timeout + 실패 시 빈 목록/폴백(graceful degradation, RESILIENCY-10)

### HealthController
- `ResponseEntity<HealthStatus> health()` — 프로세스 상태 + DB 연결 확인

### StorageClient (interface)
- `List<StorageObject> listObjects(String prefix)` — 객체 나열
- `URI generateSignedUrl(String objectKey, Duration ttl)` — 서명 URL 발급
- 구현: `GcsStorageClient`, `AzureBlobStorageClient`

### SecretsProvider
- `String getInstagramToken()` — 환경/시크릿 매니저에서 토큰 로드 (하드코딩 금지)

## 3. 주요 DTO / 데이터 형태 (상위)
- `RsvpRequest`: name, contact, attendance(참석/불참), headcount, mealOption
- `RsvpResponse`: 접수 확인(성공 여부, 메시지)
- `GalleryItem`: signedUrl, width/height 또는 thumbnail 메타
- `InstagramItem`: mediaUrl, permalink, caption(선택)

> 상세 필드 제약(길이·형식·필수 여부)과 검증 규칙, DB 스키마는 Functional Design에서 확정합니다.
