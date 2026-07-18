# API Summary — Unit 1: Backend (`sm-be`)

## 엔드포인트 (Step 8)
| Method | Path | 컨트롤러 | 설명 |
|---|---|---|---|
| POST | `/api/rsvp` | `RsvpController` | 참석 의사 접수(검증 후 upsert) |
| GET | `/api/gallery` | `GalleryController` | 갤러리 서명 URL 목록 |
| GET | `/api/instagram/feed` | `InstagramController` | Instagram 피드(최신 N개) |
| GET | `/health`, `/actuator/health` | Actuator | liveness/readiness(+DB) |

## 서비스
- `GalleryService`: 스토리지 나열→정렬→서명 URL, `@Cacheable("gallery")`(5분), 실패 시 빈 목록
- `InstagramService`: `InstagramClient` 프록시 결과 최신 N개 제한, `@Cacheable("instagram")`(10분), 폴백

## DTO
- `RsvpRequest`(Bean Validation), `RsvpResponse`, `GalleryItem`, `InstagramItem`

## 테스트 (생성만)
- `RsvpControllerTest`(@WebMvcTest): 200/400(필드검증/비즈니스검증)
- `InstagramServiceTest`: 폴백/개수 제한
- rate limit 429·보안 헤더는 Step 12(횡단) 테스트에서 검증
