# Application Design Plan — 모바일 청첩장

Application Design은 **상위 수준 컴포넌트 식별과 서비스 계층 설계**에 집중합니다. (상세 비즈니스 로직은 이후 Functional Design에서 다룸)

## 설계 진행 체크리스트
- [x] 요구사항/기술 스택 컨텍스트 분석
- [x] 아래 설계 질문에 대한 사용자 답변 수집
- [x] 답변의 모호성 분석 및 필요 시 follow-up (Q1/Q3 위임→권장 적용, 모순 없음)
- [x] `components.md` 생성 (컴포넌트 정의 및 상위 책임)
- [x] `component-methods.md` 생성 (메서드 시그니처, 입출력)
- [x] `services.md` 생성 (서비스 정의 및 오케스트레이션 패턴)
- [x] `component-dependency.md` 생성 (의존성 관계 및 통신 패턴, 데이터 흐름)
- [x] `application-design.md` 통합 문서 생성
- [x] 설계 완전성/일관성 검증

---

## 설계 결정 질문

아래 질문은 이 애플리케이션의 컴포넌트/서비스 구조를 확정하기 위한 것입니다. 각 `[Answer]:` 태그 뒤에 letter를 입력해 주세요.

### Question 1: 프로젝트(리포지토리) 구조
워크스페이스 환경 규칙(steering)에는 프론트엔드 `sm-fe`와 백엔드 `sm-be`가 언급되어 있습니다. 이 청첩장 프로젝트의 구조는?

A) 모노레포 — 루트 아래 `sm-fe`(React+Vite 프론트엔드) + `sm-be`(Spring Boot 백엔드) 두 디렉터리 (steering 관례 따름)

B) 프론트엔드/백엔드를 별도 최상위 폴더(예: `frontend`, `backend`)로 직관적 명명

X) Other (please describe after [Answer]: tag below)

[Answer]: 요구사항(01_Discovery자료.md) 파일의 내용을 바탕으로 권장(Recommend)

### Question 2: 갤러리 이미지 접근 방식
갤러리 사진은 오브젝트 스토리지에 저장됩니다. 보안 베이스라인(SECURITY-09: 스토리지 공개 접근 차단)을 고려한 접근 방식은?

A) 백엔드가 서명 URL(signed URL)을 발급하고 프론트엔드가 이를 통해 로드 (버킷 비공개 유지, 권장)

B) 갤러리 전용 버킷을 읽기 공개로 두고 CDN 경유로 직접 로드 (공개 정책을 문서화, 성능 우선)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3: Instagram 연동 배치
Instagram 공식 API 연동 시 액세스 토큰을 어디서 관리하나요?

A) 백엔드 프록시 — 토큰/시크릿은 서버에서 관리하고, 프론트엔드는 백엔드 엔드포인트로 피드 조회 (SECURITY-12 준수, 권장)

B) 프론트엔드 직접 호출 — 클라이언트에서 Instagram API 직접 호출

X) Other (please describe after [Answer]: tag below)

[Answer]: 요구사항(01_Discovery자료.md) 파일의 내용을 바탕으로 권장(Recommend)

### Question 4: RSVP 남용 방지 수준
공개 RSVP 제출 엔드포인트(SECURITY-11: rate limiting 필요)의 남용 방지 수준은?

A) Rate limiting/throttling만 적용 (단순, 개인 프로젝트에 적합)

B) Rate limiting + CAPTCHA(예: reCAPTCHA) 병행 (봇 제출 강력 차단)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 5: 프론트엔드 콘텐츠 구성 방식
콘텐츠(문구·일시·장소·신랑신부 정보·계좌 등)를 코드/설정에 직접 입력(요구사항 Q5=A)하기로 했습니다. 구체적 형식은?

A) 프론트엔드 내 단일 설정 모듈(TypeScript 객체) 하나로 관리 (타입 안전, 단순)

B) JSON 설정 파일로 분리 관리 (비개발자도 편집 용이)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 6: 아키텍처 스타일
전체 아키텍처 스타일을 확정합니다.

A) SPA(React) + REST API(Spring Boot) — 프론트엔드가 백엔드 REST 엔드포인트(RSVP/갤러리/Instagram) 호출 (권장)

B) 프론트엔드 중심 + 최소 서버리스 함수 — 상시 백엔드 없이 필요한 API만 함수로

X) Other (please describe after [Answer]: tag below)

[Answer]: A
