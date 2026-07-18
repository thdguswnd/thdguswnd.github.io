# Functional Design Plan — Unit 2: Frontend (`sm-fe`)

Frontend unit의 화면 로직/콘텐츠 데이터 구조를 확정합니다. 프론트엔드는 대부분 표현(presentation) + 순수 유틸(D-Day/캘린더) + 콘텐츠 JSON 구성입니다. (백엔드 API 계약은 Unit 1 에서 확정됨)

## 진행 체크리스트
- [x] unit 컨텍스트 분석 (unit-of-work, FR-01~08/12/13 + FR-09/10/11 UI)
- [x] 아래 설계 질문에 대한 사용자 답변 수집 (Q1~Q5 모두 권장안 A 채택)
- [x] 답변 모호성 분석 및 필요 시 follow-up (모순 없음)
- [x] `business-logic-model.md` 생성 (섹션 렌더링/스크롤/API 연동 흐름)
- [x] `domain-entities.md` 생성 (콘텐츠 JSON 스키마, 순수 유틸 입출력)
- [x] `business-rules.md` 생성 (D-Day/캘린더 규칙 + PBT 대상 속성)
- [x] 검증

> 각 질문에 권장안(A)을 표시했습니다. 그대로 진행하려면 A 를 선택하시면 됩니다.

---

## 설계 결정 질문

### Question 1: D-Day 카운터 표시 형식
예식일(2026-11-15) 기준 D-Day 표시는?

A) `D-100`(남은 일수), 당일 `D-DAY`, 지난 후 `D+N` 표시 (권장)

B) 남은 일수만 숫자로 표시(당일/지난 후 처리 없음)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2: 캘린더(2026년 11월) 강조 방식
달력에서 예식일(15일) 강조는?

A) 15일에 색상 배경 + 하트/마커 강조, 해당 요일 헤더 유지 (권장)

B) 15일에 단순 색상 강조만

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3: 콘텐츠 JSON 스키마 범위
콘텐츠(JSON)에 포함할 데이터 범위는?

A) 전 섹션 콘텐츠를 단일 JSON 으로 관리 — 인사말/신랑·신부·양가 정보/타임라인 항목/오시는 길(주소·좌표·주차·앱링크)/계좌·카카오페이/Instagram 핸들/메인문구 (권장)

B) 최소 필드만(문구·일시·장소)으로 시작, 나머지는 추후 확장

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4: 지도 "오시는 길" 연동 방식
네이버지도/카카오내비/티맵 연동은?

A) 외부 앱 deep link + 웹 폴백 URL 병행(앱 미설치 시 웹으로), 정적 지도 이미지 또는 임베드 (권장)

B) 단순 외부 링크(웹)만

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5: 스크롤 fade-in 동작
스크롤 애니메이션 방식은?

A) 각 섹션이 뷰포트 진입 시 1회 fade-in(IntersectionObserver), 재진입 시 반복 안 함 (권장)

B) 진입/이탈마다 반복 fade

X) Other (please describe after [Answer]: tag below)

[Answer]: 스크롤이 내려가면 아래에서 콘텐츠가 제자리로 올라오는 애니메이션, 스크롤을 올리면 콘텐츠가 다시 아래로 내려가는 애니메이션(화면 끝에 거의 걸렸을 때)
