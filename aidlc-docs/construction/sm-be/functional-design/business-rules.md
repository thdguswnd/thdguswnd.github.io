# Business Rules — Unit 1: Backend (`sm-be`)

## 1. RSVP 검증 규칙
| ID | 규칙 | 근거 |
|---|---|---|
| BR-RSVP-01 | `name` 필수, 트림 후 1~50자, 제어문자/스크립트 제거·거부 | Q1/SECURITY-05 |
| BR-RSVP-02 | `contact` 필수, 한국 휴대폰 형식(예: `010-XXXX-XXXX`). 저장 전 정규화(하이픈 표준화) | Q1=A |
| BR-RSVP-03 | `side` 필수, `{GROOM, BRIDE}` 중 하나 | Q2=A |
| BR-RSVP-04 | `attendance` 필수, `{ATTENDING, NOT_ATTENDING}` 중 하나 | — |
| BR-RSVP-05 | `attendance=ATTENDING`이면 `adultCount` 필수(1~2), `childCount` 0~2, `mealOption` 필수(3택) | Q3 |
| BR-RSVP-06 | `attendance=NOT_ATTENDING`이면 `adultCount/childCount/mealOption`은 무시하고 null로 저장 | Q3 |
| BR-RSVP-07 | **중복 제출: `contact` 기준 upsert** — 동일 연락처 재제출 시 최신값으로 갱신, 레코드는 1건 유지 | Q4=B |
| BR-RSVP-08 | 모든 문자열 입력은 서버 측 길이/형식 검증 및 이스케이프(인젝션/XSS 방지), 파라미터화 쿼리 사용 | SECURITY-05 |
| BR-RSVP-09 | 축하 메시지 필드 미포함 | Q5=B |

## 2. Gallery 규칙
| ID | 규칙 | 근거 |
|---|---|---|
| BR-GAL-01 | 정렬: 파일명(또는 업로드 시각) 기준, 전체 표시 | Q6=A |
| BR-GAL-02 | 서명 URL 유효기간(TTL) = 15분 | Q6=A |
| BR-GAL-03 | 버킷 비공개 유지, 직접 공개 접근 불가 | SECURITY-09 |

## 3. Instagram 규칙
| ID | 규칙 | 근거 |
|---|---|---|
| BR-IG-01 | 최신 9개 게시물 표시 | Q7=A |
| BR-IG-02 | 서버 캐시 TTL = 10분 (만료 시 재조회) | Q7=A |
| BR-IG-03 | 액세스 토큰은 서버 측 관리, 응답/로그에 미노출 | SECURITY-12 |
| BR-IG-04 | 외부 호출 실패/timeout 시 빈 목록 반환(프론트는 프로필 링크로 폴백) | RESILIENCY-10 |

## 4. 공통 정책
| ID | 규칙 | 근거 |
|---|---|---|
| BR-COM-01 | 공개 엔드포인트에 rate limiting 적용 | SECURITY-11, Q4(app design) |
| BR-COM-02 | 오류 응답은 일반화된 메시지, 내부 상세/스택 미노출 | SECURITY-15 |
| BR-COM-03 | 로그에 PII(name/contact)·토큰·계좌정보 미기록 | SECURITY-03 |

## 5. PBT 대상 속성 (Property-Based Testing, Partial 모드)
Backend PBT 대상(순수 로직 + 직렬화) — PBT-02/03/07/08/09 적용 예정:
- **P-01 (검증 결정성)**: 동일 입력에 대해 검증 결과는 항상 동일(결정적). 유효 입력은 항상 통과, 무효 입력은 항상 거부.
- **P-02 (연락처 정규화 멱등성)**: `normalize(normalize(x)) == normalize(x)`
- **P-03 (DTO 직렬화 라운드트립)**: `deserialize(serialize(rsvp)) == rsvp` (PBT-03)
- **P-04 (불참 정규화)**: `attendance=NOT_ATTENDING`이면 입력 인원/식사값과 무관하게 저장 레코드의 해당 필드는 null
- **P-05 (upsert 불변식)**: 동일 `contact`로 N회 제출 후 해당 연락처 레코드 수는 항상 1이며, 값은 마지막 제출과 일치
- **PBT 실행 규칙**: 실패 시 반례(counterexample)와 시드(seed)를 로깅(PBT-08), CI에서 재현 가능하도록 시드 고정 옵션 제공

## 6. 검증 결과
- 모든 RSVP 필드에 검증 규칙 정의됨
- Gallery/Instagram 규칙이 보안·리질리언시 요구와 정합
- PBT 대상 속성이 순수 로직/직렬화 범위로 식별됨 (Partial 모드 부합)
