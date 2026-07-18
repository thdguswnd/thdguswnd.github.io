# Requirements 검증 질문 — 모바일 청첩장

Discovery 자료(`input-docs/01_Discovery자료.md`)를 분석한 결과, 요구사항을 확정하기 위해 아래 항목의 명확화가 필요합니다.
각 질문의 `[Answer]:` 태그 뒤에 해당하는 letter(A, B, C ...)를 입력해 주세요. 보기 중 맞는 것이 없으면 마지막 `X) Other`를 선택하고 설명을 적어 주세요.

---

## Question 1: 초기 버전 범위 - 하객 사진첩(업로드) 기능
Discovery의 "보류/미정 사항"에 하객이 사진/동영상을 업로드해 Blob Storage에 저장하는 "하객 사진첩" 기능이 언급되어 있습니다. 초기 버전에 포함할까요?

A) 초기 버전에 포함 (하객이 사진/동영상을 업로드하여 저장)

B) 초기 버전에서 제외 (추후 버전에서 검토)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 2: 초기 버전 범위 - YouTube 동영상
Discovery에서 YouTube 영상 삽입(가능 시 자동 재생, 불가 시 재생 버튼)이 "확정은 아니지만 업로드 방안만 확인" 대상으로 언급되었습니다. 초기 버전에 포함할까요?

A) 초기 버전에 포함 (YouTube 영상 삽입, 자동 재생 시도 + 폴백 재생 버튼)

B) 초기 버전에서 제외 (추후 버전에서 검토)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 3: RSVP(참석 의사) 제출 데이터의 저장 및 확인 방식
참석 의사 전달 폼(이름, 연락처, 참석여부, 인원, 식사여부)으로 제출된 데이터를 어떻게 저장/확인하나요? 이 항목은 정적 페이지 외에 백엔드(서버 + 데이터 저장소)가 필요한지를 결정합니다.

A) 백엔드 API + 데이터베이스에 저장하고, 신랑/신부가 조회할 수 있는 관리자 화면 제공

B) 백엔드 API + 데이터베이스에 저장 (관리자 화면 없이 데이터만 축적, 조회는 추후)

C) 외부 서비스(예: Google Forms, 스프레드시트 등) 연동으로 대체

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 4: Instagram 피드 연동 방식
Instagram 피드를 불러와 출력하고 클릭 시 Instagram으로 이동하는 기능의 구현 방식입니다. (공식 API는 앱 등록/토큰이 필요합니다.)

A) Instagram 공식 API(Basic Display/Graph API) 연동으로 최신 피드 자동 로드

B) 게시물 링크/이미지를 수동으로 등록해 노출 (API 미사용, 단순 링크 이동)

C) 초기 버전에서는 Instagram 프로필로 이동하는 링크/버튼만 제공

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 5: 콘텐츠 관리 방식
청첩장에 들어가는 콘텐츠(신랑/신부 사진·소개, 예식 일시/장소, 문구, 계좌번호, 갤러리 사진 등)를 어떻게 관리하나요?

A) 코드/설정 파일에 직접 입력 (단일 청첩장, 변경 시 재배포)

B) 관리자 화면 또는 설정 데이터로 관리 (재배포 없이 콘텐츠 수정 가능)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 6: 기술 스택 (프론트엔드/백엔드)
이 워크스페이스의 환경 규칙(steering)에는 React 18 + TypeScript + Vite(프론트) 및 Spring Boot + Gradle(백엔드) 스택이 기술되어 있습니다. 모바일 청첩장에 적용할 스택은?

A) 워크스페이스 규칙을 따름 — 프론트: React + TypeScript + Vite, 백엔드(RSVP 등 필요 시): Spring Boot

B) 프론트엔드 단독(React + Vite) 중심 — 백엔드가 필요한 부분(RSVP)만 최소한의 서버/서버리스로 구성

C) 정적 사이트 + 서버리스(예: Cloud Functions) 조합 — 별도 상시 백엔드 없음

X) Other (please describe after [Answer]: tag below)

[Answer]: 요구사항(01_Discovery자료.md) 파일의 내용을 바탕으로, '04_기술스택.md'에 정의

---

## Question 7: 클라우드 및 스토리지
Discovery에 "GKS(GCP) 위에 구성, 추후 AKS(Azure)로 이전 가능", "정적 파일은 Blob Storage 저장"이 언급되었습니다. 초기 배포/스토리지 대상을 명확히 해 주세요. (Blob Storage는 Azure 용어, GCP의 대응 서비스는 Cloud Storage입니다.)

A) 초기: GCP(GKE + Cloud Storage) 기준으로 구성, 컨테이너화하여 추후 Azure(AKS + Blob Storage) 이식성 확보

B) 초기: Azure(AKS + Blob Storage) 기준으로 구성

C) 클라우드 종속을 최소화한 컨테이너 구성 후, 스토리지는 환경 설정으로 교체 가능하게 추상화

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 8: RSVP 및 "마음 전하실 곳" 관련 알림/보안
참석 의사 제출 시 신랑/신부에게 알림(예: 이메일/메시지)이 필요한가요? 또한 계좌번호/연락처 등 개인정보 노출 관련 고려가 필요합니다.

A) RSVP 제출 시 알림 필요 (알림 채널은 설계 단계에서 구체화)

B) 알림 불필요 — 관리자 화면/데이터 조회로 충분

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question: Security Extensions
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)

B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question: Resiliency Extensions
Should the resiliency baseline be applied to this project?

**요약**: 이 확장을 켜면 AWS Well-Architected(신뢰성 기둥) 기반의 설계 단계 모범사례(내결함성, 고가용성, 관측성, 복구성 등)를 요구사항/설계/코드에 반영합니다. 다만 이것이 운영 준비 완료나 가용성/RTO/RPO를 보장하지는 않으며, 좋은 출발점(첫 초안)으로 활용됩니다.

A) Yes — 리질리언시 베이스라인을 설계 단계 모범사례로 적용 (비즈니스 크리티컬 워크로드 권장)

B) No — 리질리언시 베이스라인 생략 (PoC, 프로토타입, 빠른 반복이 중요한 실험적 프로젝트에 적합)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — 모든 PBT 규칙을 blocking 제약으로 적용 (비즈니스 로직, 데이터 변환, 직렬화, 상태 저장 컴포넌트가 있는 프로젝트에 권장)

B) Partial — 순수 함수와 직렬화 라운드트립에 대해서만 PBT 적용 (알고리즘 복잡도가 제한적인 프로젝트에 적합)

C) No — 모든 PBT 규칙 생략 (단순 CRUD, UI 전용 프로젝트, 비즈니스 로직이 적은 얇은 통합 계층에 적합)

X) Other (please describe after [Answer]: tag below)

[Answer]: 요구사항(01_Discovery자료.md) 파일의 내용을 바탕으로 권장(Recommend)
