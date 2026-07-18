# Requirements 추가 확인 질문 (Follow-up) — 모바일 청첩장

1차 답변을 반영한 결과, 아래 항목의 확정이 추가로 필요합니다.

- **Q1~Q3**: Resiliency 확장(opt-in: Yes)이 "요구사항 확정 전에 사용자에게 반드시 확인"하도록 규정한 결정 사항입니다. (AI가 임의로 정할 수 없습니다.)
- **Q4~Q5**: 1차 답변에서 "Discovery 자료를 바탕으로 AI가 권장/정의"로 위임하신 항목에 대한 제 권장안 확인입니다. (그대로 승인 또는 수정 가능)

각 `[Answer]:` 태그 뒤에 letter를 입력해 주세요.

---

## Question 1: RTO/RPO 목표 및 재해 복구(DR) 전략
Recovery Time Objective(RTO, 최대 허용 다운타임)와 Recovery Point Objective(RPO, 최대 허용 데이터 손실 범위) 목표는 무엇인가요? 이 답변이 DR 전략과 인프라 이중화 수준을 결정합니다. (참고: 청첩장은 예식일 전후 트래픽이 집중되는 단기 이벤트성 서비스입니다.)

A) RPO/RTO: 수 시간 — Backup & Restore 전략. 최저 비용($). 데이터만 백업, 서비스는 미배포. 장애 시 IaC로 재배포 + 백업 복원. 비핵심 워크로드에 적합.

B) RPO/RTO: 수십 분 — Pilot Light 전략. 비용 $$. 데이터는 live, 서비스는 idle 상태로 배포되어 있다가 failover 시 확장.

C) RPO/RTO: 수 분 — Warm Standby 전략. 비용 $$$. 데이터 live, 서비스가 축소 용량으로 상시 가동, failover 시 확장. 비즈니스 크리티컬 애플리케이션에 적합.

D) RPO/RTO: 실시간에 가까움 — Multi-site Active/Active 전략. 최고 비용($$$$). 여러 리전에서 동시 가동. 무중단 미션 크리티컬 요구에 적합.

E) N/A — 단일 리전 배포로 충분, 교차 리전 DR 불필요. 한 리전 내 multi-zone 가용성에 의존.

X) Other (please describe after [Answer]: tag below)

[Answer]: E

---

## Question 2: 변경 관리(Change Management) 프로세스
이 워크로드의 프로덕션 변경은 어떻게 관리해야 하나요? AI-DLC는 새 프로세스를 만들기보다 답변에 맞춰 설계를 정합니다.

A) 기존 조직의 변경 관리 프로세스 사용 — 이름/도구를 알려주세요(예: ServiceNow, Jira Change, 내부 CAB). 해당 프로세스에 맞춰 배포 산출물을 구성.

B) 아직 공식 프로세스 없음 — AI-DLC가 경량 변경 관리 프로세스(변경 기록 + 승인 + 롤백 노트)를 제안하도록.

C) N/A — 이 워크로드는 공식 변경 관리 면제(예: 개인/내부 도구). 면제 사유를 문서화.

X) Other (please describe after [Answer]: tag below)

[Answer]: B + 개인 프로젝트로 로컬에서 버전 관리하고 배포하는 것으로 충분

---

## Question 3: 장애 대응(Incident Response) 프로세스
이 워크로드의 프로덕션 장애는 어떻게 처리하나요?

A) 기존 조직의 장애 대응 프로세스 사용 — 참조(예: PagerDuty runbook, 내부 IR/온콜)를 알려주세요. 알림/runbook을 여기에 맞춰 정렬.

B) 공식 프로세스 없음 — AI-DLC가 경량 장애 대응 및 COE(Correction of Errors) 프로세스를 제안하도록.

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question 4: 기술 스택 (AI 권장안 확인)
1차 Q6에서 "Discovery 자료를 바탕으로 04_기술스택.md에 정의"로 위임하셨습니다. Discovery 자료와 워크스페이스 환경 규칙(steering)을 종합한 제 권장 스택은 다음과 같습니다.

**권장 기술 스택**
- **프론트엔드**: React 18 + TypeScript + Vite (모바일 반응형, 스크롤 fade-in 애니메이션, iOS/Android 브라우저 호환)
- **백엔드(RSVP API)**: Spring Boot 3.1.x + Gradle (컨테이너화하여 GKE 배포, AKS 이식)
- **데이터베이스**: PostgreSQL (운영) / H2 PostgreSQL 호환 모드 (개발), Flyway 마이그레이션
- **오브젝트 스토리지**: GCP Cloud Storage (초기), 스토리지 접근을 추상화해 Azure Blob Storage로 교체 가능
- **Instagram 연동**: Basic Display/Graph API — 토큰/시크릿은 백엔드에서 관리(클라이언트 노출 방지)
- **외부 지도 연동**: 네이버지도/카카오내비/티맵 deep link(외부 앱 링크)
- **배포**: Docker 컨테이너 + Kubernetes (GKE → AKS 이식성 확보)

이 권장 스택을 채택할까요?

A) 권장 스택을 그대로 채택

B) 일부 수정하여 채택 (수정 내용을 아래 [Answer]: 뒤에 기술)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 5: Property-Based Testing 적용 수준 (AI 권장안 확인)
opt-in에서 "요구사항 바탕 권장"으로 위임하셨습니다. 이 프로젝트는 콘텐츠 중심이나 RSVP 입력 검증, D-Day/캘린더 날짜 계산, API DTO 직렬화 등 일부 속성 기반 테스트 가치가 있는 로직이 있습니다. 제 권장은 **Partial**입니다.

A) Partial (권장) — 순수 함수/직렬화 라운드트립 중심으로 PBT 적용 (PBT-02/03/07/08/09 enforce)

B) Yes — 모든 PBT 규칙을 blocking으로 전면 적용

C) No — PBT 생략

X) Other (please describe after [Answer]: tag below)

[Answer]: A
