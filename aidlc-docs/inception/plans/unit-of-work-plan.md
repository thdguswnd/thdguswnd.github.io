# Unit of Work Plan — 모바일 청첩장

시스템을 개발 가능한 작업 단위(unit of work)로 분해하기 위한 계획입니다. Application Design 산출물(컴포넌트/서비스/의존성)을 기반으로 합니다.

## 분해 진행 체크리스트
- [x] 설계 컨텍스트 분석(components/services/dependency)
- [x] 아래 분해 질문에 대한 사용자 답변 수집
- [x] 답변 모호성 분석 및 필요 시 follow-up (Q2 위임→권장 A 적용, 모순 없음)
- [x] `unit-of-work.md` 생성 (unit 정의·책임 + greenfield 코드 조직 전략)
- [x] `unit-of-work-dependency.md` 생성 (unit 간 의존성 매트릭스)
- [x] `unit-of-work-story-map.md` 생성 (요구사항 FR ↔ unit 매핑; User Stories 미실행이므로 FR 기준)
- [x] unit 경계·의존성 검증, 모든 FR이 unit에 할당되었는지 확인

---

## AI 권장 분해안 (참고)
Application Design(모노레포 `sm-fe`/`sm-be`, SPA+REST)을 근거로 한 권장안:
- **Unit 1 — Frontend (`sm-fe`)**: 청첩장 SPA(섹션 11종 + 콘텐츠 JSON + 순수 유틸 + ApiClient). 독립 배포되는 정적 웹.
- **Unit 2 — Backend (`sm-be`)**: 단일 배포 Spring Boot 서비스. 내부 논리 모듈 3개(RSVP / Gallery / Instagram) + 보안·Health 횡단 관심사.

즉 **독립 배포 서비스(Service) 2개**, 백엔드 내부는 논리 **모듈(Module)** 3개.

---

## 분해 결정 질문

### Question 1: Unit 분해 granularity
시스템을 어떤 단위로 분해할까요?

A) 2개 unit — Frontend(`sm-fe`) + Backend(`sm-be`, RSVP/Gallery/Instagram은 내부 모듈) (권장, 개인 프로젝트 규모에 적합)

B) 4개 unit — Frontend + RSVP 서비스 + Gallery 서비스 + Instagram 서비스로 각각 독립 배포(마이크로서비스)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2: 프론트엔드 배포 형태
Frontend(`sm-fe`) unit의 배포 형태는?

A) 컨테이너(nginx 등)로 정적 빌드 산출물 서빙, GKE에 배포 (백엔드와 동일 클러스터, 이식성 일관)

B) 오브젝트 스토리지/CDN 정적 호스팅 (컨테이너 없이 정적 배포)

X) Other (please describe after [Answer]: tag below)

[Answer]: 요구사항(01_Discovery자료.md) 파일의 내용을 바탕으로 권장(Recommend)

### Question 3: 구현/개발 순서
per-unit 설계 및 코드 생성을 진행할 순서는?

A) Backend(`sm-be`) 먼저 → Frontend(`sm-fe`) (API 계약 먼저 확정 후 프론트 연동, 권장)

B) Frontend(`sm-fe`) 먼저 → Backend(`sm-be`)

X) Other (please describe after [Answer]: tag below)

[Answer]: A
