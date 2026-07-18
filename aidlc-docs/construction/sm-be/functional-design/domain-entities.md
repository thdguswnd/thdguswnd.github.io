# Domain Entities — Unit 1: Backend (`sm-be`)

기술 비종속 도메인 모델. Backend에서 상태를 갖는 도메인은 **RSVP** 뿐이며, Gallery/Instagram은 외부 소스 프록시(도메인 상태 없음)입니다.

## 1. RSVP (참석 의사) 엔티티
| 필드 | 타입 | 필수 | 제약 | 비고 |
|---|---|---|---|---|
| `id` | Identifier | 시스템 | 자동 생성 | PK |
| `name` | String | ✅ | 1~50자, 트림, 제어문자 불가 | 하객 이름 |
| `contact` | String(휴대폰) | ✅ | 한국 휴대폰 형식(010-XXXX-XXXX) | **upsert 키** (Q4=B) |
| `side` | Enum | ✅ | `GROOM`(신랑측) / `BRIDE`(신부측) | Q2=A |
| `attendance` | Enum | ✅ | `ATTENDING`(참석) / `NOT_ATTENDING`(불참) | |
| `adultCount` | Integer | 조건부 | 1~2 | ATTENDING일 때만 유효 (Q3) |
| `childCount` | Integer | 조건부 | 0~2 (소인 6~12세) | ATTENDING일 때만 유효 (Q3) |
| `mealOption` | Enum | 조건부 | `WILL_EAT`(식사함)/`WILL_NOT_EAT`(안함)/`UNDECIDED`(미정) | ATTENDING일 때만 유효 (Q3) |
| `createdAt` | Timestamp | 시스템 | 최초 생성 시각 | |
| `updatedAt` | Timestamp | 시스템 | 최종 갱신 시각 | upsert 시 갱신 |

### 열거형 정의
- `Side`: `GROOM`, `BRIDE`
- `Attendance`: `ATTENDING`, `NOT_ATTENDING`
- `MealOption`: `WILL_EAT`, `WILL_NOT_EAT`, `UNDECIDED`

### 인원 규칙 (Q3 = A + 사용자 수정)
- `adultCount`(성인): 참석 시 필수, 1~2
- `childCount`(소인, 6~12세): 참석 시 선택, 0~2 (0 = 동반 소인 없음)
- 총 인원 = `adultCount` + `childCount`
- `NOT_ATTENDING`(불참) 시: `adultCount`/`childCount`/`mealOption`은 저장하지 않음(null)
- **가정(확인 필요)**: 소인 "1~2"는 동반이 있을 때의 범위로 해석하여 하한을 0으로 두었습니다(동반 없음 허용). 최소 1을 강제해야 하면 알려주세요.

## 2. 값 객체 / 프록시 데이터 (상태 없음)
### GalleryItem (프록시 응답 형태)
| 필드 | 타입 | 비고 |
|---|---|---|
| `signedUrl` | URL | 만료형 서명 URL (TTL 15분, Q6=A) |
| `objectKey` | String | 스토리지 객체 키(정렬용, 내부) |
| `order` | Integer | 파일명/업로드 시각 기준 정렬 순서 |

### InstagramItem (프록시 응답 형태)
| 필드 | 타입 | 비고 |
|---|---|---|
| `mediaUrl` | URL | 미디어(이미지/썸네일) URL |
| `permalink` | URL | 클릭 시 이동할 Instagram 게시물 링크 |
| `caption` | String | 선택, 캡션(길이 제한하여 표시) |

## 3. 영속화 대상
- **영속화**: RSVP 엔티티만 (PostgreSQL/H2, Flyway 스키마 — 세부 매핑은 Code Generation)
- **비영속화**: GalleryItem, InstagramItem (요청 시 생성/조회, 캐시만 사용)
