# AI-DLC State Tracking

## Project Information
- **Project Name**: 모바일 청첩장 (Mobile Wedding Invitation)
- **Project Type**: Greenfield
- **Start Date**: 2026-07-17T11:26:55Z
- **Current Phase**: CONSTRUCTION (재개)
- **Current Stage**: Infrastructure Design (AKS-first 재작업 완료) + AKS 배포 런북 작성 완료. 실제 Azure 배포는 사용자 환경 대기.
- **Unit 1 (Backend)**: 전체 완료(승인)
- **Units**: Unit 1 = Backend (sm-be), Unit 2 = Frontend (sm-fe). 구현 순서: Backend → Frontend

## Execution Plan Summary
- **Stages to Execute**: Application Design, Units Generation, (per-unit) Functional Design, NFR Requirements, NFR Design, Infrastructure Design, Code Generation, Build and Test
- **Stages to Skip**: Reverse Engineering(greenfield), User Stories(사용자 선택)
- **Risk Level**: Medium

## Workspace State
- **Existing Code**: No
- **Programming Languages**: (없음)
- **Build System**: (없음)
- **Project Structure**: Empty (입력 자료만 존재)
- **Reverse Engineering Needed**: No
- **Workspace Root**: c:\AIDLC_WS_GREEN

## Input Materials
- input-docs/01_Discovery자료.md (요구사항 정의서 - 모바일 청첩장)
- input-docs/02_화면구성/ (비어 있음 - 향후 HTML/CSS 화면 구성 예정)

## Code Location Rules
- **Application Code**: Workspace root (NEVER in aidlc-docs/)
- **Documentation**: aidlc-docs/ only
- **Structure patterns**: See code-generation.md Critical Rules

## Extension Configuration
| Extension | Enabled | Mode | Decided At |
|---|---|---|---|
| Security Baseline | Yes | Blocking (all rules) | Requirements Analysis |
| Resiliency Baseline | Yes | Blocking (all rules) | Requirements Analysis |
| Property-Based Testing | Yes | Partial (PBT-02/03/07/08/09 enforce) | Requirements Analysis |

- Security Baseline: opt-in 답변 A(Yes) → 전체 SECURITY 규칙 blocking 적용
- Resiliency Baseline: opt-in 답변 A(Yes) → 전체 RESILIENCY 규칙 blocking 적용. RESILIENCY-02/03/15 사용자 결정 질문을 Requirements 단계에서 진행(follow-up questions).
- Property-Based Testing: 사용자 확인 A(Partial) → Partial 모드 확정(PBT-02/03/07/08/09 enforce, 그 외 advisory).

## Key Decisions (Requirements)
- **RTO/RPO & DR (RESILIENCY-02/08)**: 단일 리전 + multi-zone, 교차 리전 DR 불필요 (follow-up Q1=E). 이벤트성 단기 서비스 특성 반영.
- **Change Management (RESILIENCY-03)**: 개인 프로젝트 — 경량(로컬 Git 버전 관리 + 수동 배포)로 충분 (follow-up Q2=B).
- **Incident Response (RESILIENCY-15)**: 공식 프로세스 없음 — 경량 IR + COE 제안 (follow-up Q3=B).
- **Cloud/Storage (Q7)**: ~~GCP(GKE + Cloud Storage) 초기, Azure(AKS + Blob) 이식성 확보~~ → **[2026-07-18 변경] Azure(AKS + Blob Storage) 우선 배포, GCP(GKE + Cloud Storage) 이전 가능 유지**. 스토리지 추상화(StorageClient)로 provider 격리, Kustomize base + overlays/{azure(primary), gcp(migration)}.
- **Tech Stack (Q4/Q6)**: React 18 + TS + Vite / Spring Boot 3.1.x + Gradle / PostgreSQL(운영)·H2(개발) + Flyway / Docker + K8s.
- **PBT (Q5)**: Partial.

## Stage Progress
- [x] INCEPTION - Workspace Detection (Greenfield 판정)
- [x] INCEPTION - Requirements Analysis (승인 완료)
- [x] INCEPTION - User Stories (SKIPPED — 사용자 선택)
- [x] INCEPTION - Workflow Planning (execution-plan.md 작성, 승인 대기)
- [x] INCEPTION - Application Design (승인 완료)
- [x] INCEPTION - Units Generation (2 units 확정, 승인 완료)
- **--- CONSTRUCTION Phase ---**
- [x] Unit 1 (Backend) - Functional Design (산출물 생성 완료, 승인 대기)
- [x] Unit 1 (Backend) - NFR Requirements (승인 완료)
- [x] Unit 1 (Backend) - NFR Design (승인 완료)
- [x] Unit 1 (Backend) - Infrastructure Design (완료, 승인 대기)
- [ ] Unit 1 (Backend) - NFR Design
- [ ] Unit 1 (Backend) - Infrastructure Design
- [x] Unit 1 (Backend) - Code Generation (승인 완료)
- **--- Unit 2 (Frontend) per-unit 루프 예정 ---**
- [x] Unit 2 (Frontend) - Functional Design (완료, 승인 대기)
- [x] Unit 2 (Frontend) - NFR Requirements / NFR Design / Infrastructure Design (완료)
- [x] Unit 2 (Frontend) - Code Generation (Part 1+2 완료, 승인 대기)
- [x] Build and Test (승인 완료. 프론트 빌드+테스트 11/11 통과, 백엔드 로컬 gradle 실행 대기)
- [x] Infrastructure Design 재작업 (AKS-first 전환, 양 unit 문서 + azure 오버레이 완성 + AKS 배포 런북) — 2026-07-18
- [x] Code Generation (Azure Blob SAS 실제 구현): AzureBlobStorageClient(user-delegation SAS, 키리스). build BUILD SUCCESSFUL, 회귀 없음 — 2026-07-18
- [~] OPERATIONS - Operations (placeholder). 실제 AKS 배포: aks-deployment-runbook.md 대로 사용자 Azure 환경에서 진행 예정.
- [ ] CONSTRUCTION - (per-unit) Functional Design (EXECUTE)
- [ ] CONSTRUCTION - (per-unit) NFR Requirements (EXECUTE)
- [ ] CONSTRUCTION - (per-unit) NFR Design (EXECUTE)
- [ ] CONSTRUCTION - (per-unit) Infrastructure Design (EXECUTE)
- [ ] CONSTRUCTION - Code Generation (EXECUTE)
- [ ] CONSTRUCTION - Build and Test (EXECUTE)
