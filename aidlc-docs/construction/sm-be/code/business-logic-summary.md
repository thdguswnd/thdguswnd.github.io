# Business Logic Summary — Unit 1: Backend (`sm-be`)

## 생성 파일 (Step 2~3)
- `rsvp/domain/`: `Rsvp`, `Side`, `Attendance`, `MealOption`
- `rsvp/dto/`: `RsvpRequest`(Bean Validation), `RsvpResponse`
- `rsvp/validation/`: `KoreanMobile`, `KoreanMobileValidator`
- `rsvp/service/RsvpService`: `validateAndBuild`(순수 검증/변환) + `register`(upsert 오케스트레이션)
- `common/util/ContactNormalizer`: 연락처 정규화(순수 함수)
- `common/exception/ValidationException`

## 구현된 규칙
- BR-RSVP-01/02: name 필수(≤50), contact 필수+휴대폰 형식
- BR-RSVP-03/04: side/attendance 필수
- BR-RSVP-05/06: 참석 시 adult 1~2, child 0~2, meal 필수 / 불참 시 인원·식사 null
- BR-RSVP-07: 연락처 정규화 후 upsert(1건 유지)

## 테스트 (생성만, 실행은 Build&Test)
- 예시: `RsvpServiceTest`, `ContactNormalizerTest`
- PBT(jqwik): P-01(결정성), P-02(정규화 멱등), P-03(DTO 직렬화 라운드트립), P-04(불참 정규화), P-05(upsert 불변식)
