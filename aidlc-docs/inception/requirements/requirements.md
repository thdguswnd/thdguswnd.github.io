# 요구사항 정의서 — 모바일 청첩장 (Mobile Wedding Invitation)

## 1. Intent Analysis 요약
- **User Request**: Discovery 자료를 입력으로 모바일 청첩장 웹 서비스를 신규 개발
- **Request Type**: New Project (Greenfield)
- **Scope**: Multiple Components (정적 콘텐츠 페이지 + RSVP 백엔드/DB + 외부 연동)
- **Complexity**: Moderate
- **Project Nature**: 개인 프로젝트, 예식일 전후 트래픽이 집중되는 단기 이벤트성 서비스

## 2. 입력 자료
- `input-docs/01_Discovery자료.md` (요구사항 정의서, 킥오프 회의록)
- `input-docs/02_화면구성/` (향후 HTML/CSS 화면 구성 산출물 예정)

## 3. 기능 요구사항 (Functional Requirements)

모바일 웹에서 아래로 스크롤하며 콘텐츠를 확인하는 단일 페이지(single-page, 세로 스크롤) 구조. 스크롤 시 다음 콘텐츠가 fade-in 된다.

| ID | 요구사항 | 설명 |
|---|---|---|
| FR-01 | 히어로(첫 화면) | 메인 사진을 배경으로 두고 제목(문구)을 별도 레이어로 오버레이 |
| FR-02 | 스크롤 인터랙션 | 스크롤을 내리면 각 섹션 콘텐츠가 fade-in 되는 애니메이션 |
| FR-03 | 본문/인사말 | "저희 결혼합니다" 메시지 + 신랑·신부 및 양가 부모님 정보 |
| FR-04 | 신랑 소개 | 신랑 사진 및 소개 |
| FR-05 | 신부 소개 | 신부 사진 및 소개 |
| FR-06 | 타임라인 | 두 사람의 타임라인/스토리 |
| FR-07 | 캘린더 & D-Day | 2026년 11월 달력 표시, 15일 강조, 결혼식 D-Day 카운터 |
| FR-08 | 오시는 길 | 주소 + 지도 + 외부 앱 링크(네이버지도, 카카오내비, 티맵) + 주차 안내 |
| FR-09 | 참석 의사(RSVP) | 폼 입력(이름, 연락처, 참석여부, 인원, 식사여부) → 백엔드 API → DB 저장 |
| FR-10 | 갤러리 | 오브젝트 스토리지(Cloud Storage)에 저장된 사진을 갤러리 형식으로 표시 |
| FR-11 | Instagram | 공식 API로 피드를 불러와 표시, 피드 클릭 시 Instagram 화면으로 이동 |
| FR-12 | 마음 전하실 곳 | 신랑측/신부측 계좌번호 및 카카오페이 링크 |
| FR-13 | 콘텐츠 관리 | 콘텐츠(사진·문구·일시·장소·계좌 등)를 코드/설정 파일에 직접 입력(단일 청첩장, 변경 시 재배포) |
| FR-14 | RSVP 데이터 축적 | 제출 데이터는 DB에 축적. 초기 버전은 관리자 화면 없음(조회는 추후 버전) |

### 섹션 표시 순서 (Discovery 기준)
히어로(메인 사진 + 제목) → 본문(인사말 + 신랑·신부/양가 부모님) → 신랑 소개 → 신부 소개 → 타임라인 → 캘린더(D-Day) → 오시는 길 → 참석 의사(RSVP) → 갤러리 → Instagram → 마음 전하실 곳

## 4. 비기능 요구사항 (Non-Functional Requirements)

### 4.1 호환성 / 사용성
- NFR-C1: iOS(Safari) 및 Android(Chrome) 모바일 브라우저에서 레이아웃·비율이 깨지지 않고 동일하게 출력
- NFR-C2: 모바일 반응형 디자인 (다양한 화면 폭 대응)

### 4.2 성능
- NFR-P1: 모바일 네트워크 환경에서 빠른 초기 로딩 (이미지 최적화, lazy loading)
- NFR-P2: 예식일 전후 트래픽 집중 시에도 안정적 응답

### 4.3 보안 (Security Baseline 적용 — 전체 SECURITY 규칙 blocking)
- NFR-S1 (SECURITY-01): DB·오브젝트 스토리지 암호화(at rest), 모든 통신 TLS 1.2+ (in transit)
- NFR-S2 (SECURITY-05): RSVP 등 모든 API 입력 검증(타입/길이/형식), 파라미터화 쿼리로 인젝션 방지
- NFR-S3 (SECURITY-04): HTML 응답에 보안 헤더(CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy) 적용
- NFR-S4 (SECURITY-11): 공개 RSVP 엔드포인트에 rate limiting/throttling 적용(스팸·남용 방지)
- NFR-S5 (SECURITY-12/09): 시크릿(Instagram 토큰 등)은 코드/설정에 하드코딩 금지, 시크릿 매니저/환경 변수로 관리. 기본 크리덴셜 금지
- NFR-S6 (SECURITY-09): Cloud Storage 공개 접근 차단(갤러리는 서명 URL 또는 제한된 공개 정책 등 문서화된 방식으로 노출)
- NFR-S7 (SECURITY-03/14): 구조적 로깅(중앙 집중), 로그에 PII(이름·연락처)·계좌정보·토큰 미기록. 개인 프로젝트 규모에 맞춘 최소 보존
- NFR-S8 (개인정보): RSVP 수집 항목(이름·연락처)과 계좌/연락처 노출에 대한 개인정보 취급 고려
- NFR-S10 (SECURITY-10/13): 의존성 버전 고정(lock 파일), 프로덕션 이미지에 `latest` 태그 금지, 외부 CDN 스크립트에 SRI 적용

### 4.4 리질리언시 (Resiliency Baseline 적용 — 전체 RESILIENCY 규칙 blocking)
- NFR-R1 (RESILIENCY-01/02): 워크로드 criticality = 이벤트성(예식일 집중). 가용성 목표는 단일 리전 multi-zone 수준
- NFR-R2 (RESILIENCY-08): **단일 리전 + multi-zone** 토폴로지. 교차 리전 DR 불필요 (follow-up Q1=E)
- NFR-R3 (RESILIENCY-06): 백엔드 health check 엔드포인트 제공(가능 시 DB 연결 확인 포함)
- NFR-R4 (RESILIENCY-10): 외부 호출(Instagram API, 스토리지)에 명시적 timeout 설정, 실패 시 graceful degradation(예: Instagram 장애 시 프로필 링크만 노출)
- NFR-R5 (RESILIENCY-12): RSVP 데이터(DB) 자동 백업 구성, 백업 암호화, 보존 정책 정의(개인 프로젝트 규모에 맞춤)
- NFR-R6 (RESILIENCY-03): 변경 관리 = 경량. 개인 프로젝트로 로컬 Git 버전 관리 + 수동/스크립트 배포로 충분 (follow-up Q2=B)
- NFR-R7 (RESILIENCY-15): 장애 대응 = 경량 IR + COE 프로세스 제안 (follow-up Q3=B)

### 4.5 테스트 용이성 (Property-Based Testing — Partial 모드)
- NFR-T1: PBT Partial 적용(PBT-02/03/07/08/09). 대상 후보: RSVP 입력 검증 규칙, D-Day/캘린더 날짜 계산, API DTO 직렬화 라운드트립
- NFR-T2: PBT는 예시 기반 테스트를 대체하지 않고 보완

## 5. 기술 제약 및 스택 (Technical Constraints)
> 1차 Q6 위임에 따라 Discovery 자료 + 워크스페이스 환경 규칙을 종합해 도출, follow-up Q4=A로 확정.

- **프론트엔드**: React 18 + TypeScript + Vite
- **백엔드(RSVP API)**: Spring Boot 3.1.x + Gradle (컨테이너화)
- **데이터베이스**: PostgreSQL(운영) / H2 PostgreSQL 호환 모드(개발), Flyway 마이그레이션
- **오브젝트 스토리지**: GCP Cloud Storage(초기), 스토리지 접근을 추상화하여 Azure Blob Storage로 교체 가능
- **배포/인프라**: Docker 컨테이너 + Kubernetes. 초기 GKE(GCP), 추후 AKS(Azure) 이식성 확보 (follow-up Q7=A)
- **외부 연동**:
  - Instagram Basic Display/Graph API (토큰·시크릿은 백엔드 관리)
  - 지도: 네이버지도/카카오내비/티맵 deep link(외부 앱 링크)

## 6. 초기 버전 범위 외 (Out of Scope)
- 하객 사진첩(하객이 사진/동영상 업로드) — 추후 버전 검토 (Q1=B)
- YouTube 동영상 삽입/자동 재생 — 추후 버전 검토 (Q2=B)
- RSVP 관리자 조회 화면 — 초기엔 데이터 축적만, 조회 UI는 추후 (Q3=B, FR-14)

## 7. 가정 (Assumptions)
- 단일 예식(신랑·신부 1쌍)용 청첩장이며 콘텐츠는 배포 시점에 확정되어 코드/설정에 포함된다.
- 예식일은 2026년 11월 15일 (캘린더/D-Day 기준).
- RSVP 제출 시 신랑/신부에게 별도 실시간 알림은 불필요하다 (Q8=B).
- 개인 프로젝트 규모로, 조직 차원의 변경 관리/장애 대응/DR 체계는 경량 수준으로 적용한다.

## 8. 핵심 결정 요약 (Key Decisions)
| 항목 | 결정 | 근거 |
|---|---|---|
| DR/가용성 | 단일 리전 + multi-zone, 교차 리전 DR 불필요 | Q1=E, 단기 이벤트성 |
| 변경 관리 | 경량(로컬 Git + 수동 배포) | Q2=B, 개인 프로젝트 |
| 장애 대응 | 경량 IR + COE 제안 | Q3=B |
| 클라우드/스토리지 | GCP(GKE + Cloud Storage), Azure 이식성 | Q7=A |
| 기술 스택 | React+Vite / Spring Boot / PostgreSQL·H2 / Docker+K8s | Q4=A |
| PBT | Partial | Q5=A |
| Security 확장 | 적용(blocking) | opt-in=Yes |
| Resiliency 확장 | 적용(blocking) | opt-in=Yes |

## 9. 요구사항 핵심 요약
모바일 브라우저(iOS/Android)에서 세로 스크롤 + fade-in 방식으로 동작하는 단일 페이지 청첩장. 정적 콘텐츠(사진·소개·일시·장소·계좌) 중심에, RSVP 폼만 백엔드 API + DB로 처리한다. 사진은 오브젝트 스토리지에서, Instagram 피드는 공식 API로 로드한다. GCP(GKE) 컨테이너 배포를 기준으로 Azure 이식성을 확보하며, Security·Resiliency 베이스라인을 적용하되 개인 프로젝트 규모에 맞춰 단일 리전 multi-zone·경량 운영 프로세스를 채택한다. 하객 사진첩과 YouTube는 초기 범위에서 제외한다.
