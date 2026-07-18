# Unit of Work — FR Map — 모바일 청첩장

User Stories 단계는 생략되었으므로, 요구사항(FR) ↔ unit 매핑으로 대체합니다. 모든 FR이 unit에 할당되었는지 검증합니다.

## FR → Unit 매핑
| FR | 설명 | Unit 1 (Backend) | Unit 2 (Frontend) |
|---|---|---|---|
| FR-01 | 히어로(메인 사진 + 제목) | — | ✅ |
| FR-02 | 스크롤 fade-in | — | ✅ |
| FR-03 | 인사말 + 신랑신부/양가 부모님 | — | ✅ |
| FR-04 | 신랑 소개 | — | ✅ |
| FR-05 | 신부 소개 | — | ✅ |
| FR-06 | 타임라인 | — | ✅ |
| FR-07 | 캘린더 + D-Day | — | ✅ (DDayCalculator/CalendarModel) |
| FR-08 | 오시는 길(지도 deep link/주차) | — | ✅ |
| FR-09 | RSVP 폼 → API → DB | ✅ (RSVP 모듈) | ✅ (RsvpSection UI) |
| FR-10 | 갤러리(서명 URL) | ✅ (Gallery 모듈) | ✅ (GallerySection UI) |
| FR-11 | Instagram 피드(프록시) | ✅ (Instagram 모듈) | ✅ (InstagramSection UI) |
| FR-12 | 마음 전하실 곳(계좌/카카오페이) | — | ✅ |
| FR-13 | 콘텐츠 관리(JSON) | — | ✅ (ContentProvider) |
| FR-14 | RSVP 데이터 축적(관리자 화면 없음) | ✅ (RsvpRepository) | — |

## 검증 결과
- ✅ 모든 FR(FR-01~FR-14)이 최소 1개 unit에 할당됨
- ✅ 백엔드 의존 FR(09/10/11/14)은 Backend unit에 API/영속화로 매핑
- ✅ 순수 UI/정적 FR은 Frontend unit에 매핑
- ✅ 초기 범위 외(하객 사진첩, YouTube, 관리자 조회 UI)는 매핑 제외 확인

## 비고 (NFR/확장 반영 위치)
- Security/Resiliency 횡단 규칙은 주로 Backend unit(필터·health·백업)과 배포(Infrastructure Design)에 반영
- PBT(Partial) 대상: Frontend의 `DDayCalculator`/`CalendarModel`(순수 함수), 양 unit의 DTO 직렬화, Backend RSVP 검증 — 상세는 per-unit Functional Design
