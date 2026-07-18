# Business Logic Model — Unit 1: Backend (`sm-be`)

각 모듈의 처리 흐름(기술 비종속). 시퀀스는 논리 흐름이며 구체 구현은 Code Generation에서 확정합니다.

## 1. RSVP 접수 흐름 (FR-09, FR-14)
```
[요청] POST /api/rsvp (name, contact, side, attendance, adultCount?, childCount?, mealOption?)
  1. RateLimitFilter 통과 여부 확인 (초과 시 429)
  2. 서버 측 검증 (BR-RSVP-01~06, 08)
       - 필수/형식/열거형/조건부 규칙
       - attendance=NOT_ATTENDING → 인원/식사 필드 null 처리
  3. contact 정규화
  4. upsert (BR-RSVP-07): contact로 기존 레코드 조회
       - 존재 → 최신값으로 갱신 (updatedAt 갱신)
       - 없음 → 신규 insert (createdAt/updatedAt 설정)
  5. 접수 확인 응답 반환 (성공 여부, 메시지) — 실시간 알림 없음(Q8=B)
[예외] 검증 실패 → 400 (일반화 메시지), 서버 오류 → 500 (상세 비노출)
```

## 2. 갤러리 조회 흐름 (FR-10)
```
[요청] GET /api/gallery
  1. GalleryService가 StorageClient.listObjects(prefix)로 객체 나열
  2. 파일명/업로드 시각 기준 정렬 (BR-GAL-01)
  3. 각 객체에 대해 StorageClient.generateSignedUrl(key, TTL=15m) (BR-GAL-02)
  4. GalleryItem 목록 반환 (버킷은 비공개 유지, BR-GAL-03)
[예외] 스토리지 오류 → 빈 목록 또는 503, 프론트는 갤러리 섹션 축소
```

## 3. Instagram 피드 흐름 (FR-11)
```
[요청] GET /api/instagram/feed
  1. 캐시 확인 (TTL 10분, BR-IG-02)
       - 유효 캐시 존재 → 캐시 반환
       - 없음/만료 → 다음 단계
  2. SecretsProvider에서 토큰 로드 (BR-IG-03)
  3. Instagram Graph API 호출 (timeout 설정, BR-IG-04)
  4. 최신 9개로 제한 (BR-IG-01), InstagramItem으로 변환
  5. 캐시에 저장 후 반환
[예외] 호출 실패/timeout → 빈 목록 반환(폴백), 프론트는 프로필 링크만 노출
```

## 4. Health 체크 흐름 (RESILIENCY-06)
```
[요청] GET /health
  1. 프로세스 상태 확인 (liveness)
  2. DB 연결 확인 (readiness, deep check)
  3. 상태 반환 (UP / DOWN + 구성요소별 상태)
```

## 5. 상태/트랜잭션 노트
- RSVP insert/upsert는 단일 트랜잭션 경계
- Gallery/Instagram은 무상태(외부 소스 조회), Instagram만 인메모리 캐시 보유
- 캐시는 단일 인스턴스 인메모리 기준(다중 인스턴스 시 정합성은 NFR/Infra Design에서 검토)
