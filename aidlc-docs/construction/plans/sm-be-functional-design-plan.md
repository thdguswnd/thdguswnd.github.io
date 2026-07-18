# Functional Design Plan — Unit 1: Backend (`sm-be`)

Backend unit의 상세 비즈니스 로직/도메인 모델/검증 규칙을 확정합니다. 기술 비종속(순수 비즈니스 관점). 인프라 관심사는 이후 NFR/Infrastructure Design에서 다룹니다.

## 진행 체크리스트
- [x] unit 컨텍스트 분석 (unit-of-work, FR-09/10/11/14)
- [x] 아래 설계 질문에 대한 사용자 답변 수집
- [x] 답변 모호성 분석 및 필요 시 follow-up (Q3 인원 분리 반영, 소인 하한 가정 명시)
- [x] `business-logic-model.md` 생성 (RSVP/Gallery/Instagram 처리 흐름)
- [x] `domain-entities.md` 생성 (RSVP 엔티티/값 객체, 필드·타입·제약)
- [x] `business-rules.md` 생성 (검증 규칙, 제약, 정책 + PBT 대상 속성 식별)
- [x] 설계 완전성/일관성 검증

---

## 설계 결정 질문

### Question 1: RSVP 연락처(contact) 필수 여부/형식
참석 의사 폼의 연락처 항목은?

A) 필수 + 한국 휴대폰 형식 검증(예: 010-XXXX-XXXX)

B) 선택 입력(빈 값 허용), 입력 시 형식 검증

C) 필수이나 자유 형식(형식 검증 없음)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2: 신랑측/신부측 구분 필드
RSVP에 하객이 신랑측/신부측을 선택하는 필드를 추가할까요? (Discovery 원안에는 없음)

A) 추가 — 신랑측/신부측 선택 필드 포함

B) 미추가 — 원안 필드(이름·연락처·참석여부·인원·식사여부)만

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3: 인원(headcount) 및 식사여부 규칙
인원과 식사여부의 처리 규칙은?

A) 인원: 1~10 정수, 식사여부: 식사함/식사안함/미정 3택. 불참 선택 시 인원/식사여부는 미적용(무시)

B) 인원: 자유 정수(하한 1), 식사여부: 예/아니오 2택. 불참 시에도 값 유지

X) Other (please describe after [Answer]: tag below)

[Answer]: A + 인원 1~2 정수 / 소인(6~12세) 1~2 정수), 나머지는 A 조건 그대로

### Question 4: 중복 제출 처리
같은 사람이 여러 번 제출할 경우 처리는?

A) 그대로 모두 축적(모든 제출을 별도 레코드로 저장) — 단순

B) 연락처 기준 최신값으로 갱신(upsert) — 중복 방지

C) 축적하되, 짧은 시간 내 동일 내용 재제출만 무시(중복 클릭 방지)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 5: 축하 메시지 필드
RSVP에 "축하 한마디"(자유 텍스트) 필드를 포함할까요?

A) 포함 — 선택 입력(최대 길이 제한)

B) 미포함 — 원안 필드만

X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 6: 갤러리 이미지 정렬/개수 및 서명 URL 유효기간
갤러리 표시 규칙은?

A) 파일명(또는 업로드 시각) 기준 정렬, 전체 표시, 서명 URL 유효기간 15분

B) 지정한 순서(메타데이터/설정) 기준 정렬, 개수 제한, 서명 URL 유효기간 60분

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7: Instagram 피드 표시 개수 및 캐시
Instagram 피드 처리는?

A) 최신 9개 표시, 서버 캐시 TTL 10분 (API 호출 절감)

B) 최신 12개 표시, 캐시 없음(매 요청 조회)

X) Other (please describe after [Answer]: tag below)

[Answer]: A
