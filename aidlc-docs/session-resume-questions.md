# 세션 이어가기 — 다음 작업 선택 질문

기존 AI-DLC 프로젝트(**모바일 청첩장**)를 이어갑니다. 아래 질문에 `[Answer]:` 태그 뒤에 알파벳으로 답변해 주세요. 마땅한 선택지가 없으면 마지막 "Other"를 고르고 뒤에 설명을 적어 주세요.

## 현재 상태 요약
- **Project**: 모바일 청첩장 (Mobile Wedding Invitation) — Greenfield
- **Current Phase**: CONSTRUCTION 완료 → OPERATIONS(placeholder)
- **Last Completed**: Build and Test 승인 완료 + 로컬 실제 구축/검증(백엔드 bootRun·프론트 dev·통합 프록시 연동 전부 성공, BE 27/FE 11 테스트 통과)
- **미해결/후속 항목**: 실 콘텐츠 입력, 외부 연동 실값 배선(Instagram 토큰·GCS SDK), 컨테이너 이미지 빌드 + GKE 배포, git 커밋(현재 전부 untracked)

---

## Question 1
오늘 무엇을 진행할까요?

A) 클라우드 배포 준비 — 컨테이너 이미지 빌드 + GKE(k8s overlays/gcp) 배포 절차 진행 *(Recommend — 남은 워크플로우의 자연스러운 다음 단계)*

B) 실 콘텐츠/외부 연동 배선 — invitation.json 실데이터, Instagram 토큰·GCS 버킷/서명 URL SDK 실값 연결

C) 산출물·코드 형상 정리 — 현재 untracked 상태의 aidlc-docs/sm-be/sm-fe/k8s를 git 커밋하고 README.md(현재 BMS 잔재) 정정

D) 이전 단계 검토/재실행 — 특정 stage(Functional Design, NFR, Code Generation 등) 산출물을 다시 검토하거나 수정

E) 새 요구사항 추가 — 보류 항목(YouTube 영상, 하객 사진첩 업로드 등) 등 신규 기능을 워크플로우에 반영

F) Other (please describe after [Answer]: tag below)

[Answer]: A, 하지만 계획이 바뀌었어. AKS로 먼저 배포하고, 추후에 GKS로 이전할 수 있도록 해줘

## Question 2
(Question 1에서 A 또는 C를 골랐을 때만) 현재 미커밋 상태의 산출물/코드를 git에 먼저 커밋할까요?

A) 예 — 다음 작업 전에 현재 상태를 커밋해 기준점을 확보 *(Recommend)*

B) 아니요 — 커밋 없이 작업을 진행

C) Other (please describe after [Answer]: tag below)

[Answer]: B
