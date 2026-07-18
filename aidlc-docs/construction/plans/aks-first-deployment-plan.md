# AKS 우선 배포 전환 계획 (Infrastructure Design 재개)

## 배경
- **결정 변경**: 기존 "GCP(GKE) 우선 + Azure 이식성" → **"Azure(AKS) 우선 배포 + GCP(GKE) 이전 가능 유지"**
- **현재 자산 상태**:
  - `k8s/base` (공통 Deployment/Service/HPA/ConfigMap, sm-be·sm-fe 포함) — 재사용
  - `k8s/overlays/azure` — 존재하나 **"스텁"** 상태(주석에 명시). ingress-nginx + cert-manager, azure 프로파일, Key Vault 언급 수준
  - `k8s/overlays/gcp` — 상대적으로 완성(managed-certificate 포함) → **이전(migration) 타깃으로 유지**
  - `application.yml` — `azure` 프로파일 **이미 존재**(datasource=env, storage=`azure-blob`)
  - `CloudStorageClient` — gcp/azure 공용 **골격**(실제 SAS/서명 URL 발급은 `TODO(prod)`)

## 이 작업으로 하는 것 / 안 하는 것
- ✅ **하는 것**: 배포 산출물(매니페스트·문서·런북)을 AKS 우선으로 정비 = "배포 준비"
- ❌ **안 하는 것(이 환경에서 불가)**: 실제 Azure 리소스 생성 및 `kubectl apply`/`az` 실행 — Azure 구독·자격증명·클러스터가 필요하므로 **런북을 제공**하고 실행은 사용자 로컬/Azure 환경에서 진행
- ⚠️ **git 커밋 없음**: 원격이 clone 베이스라 커밋/푸시하지 않음(Q2=B)

---

## 실행 단계 (승인 후 진행)

### 1. 문서 방향 전환 (Infrastructure Design)
- [x] `construction/sm-be/infrastructure-design/deployment-architecture.md` — 토폴로지/설명을 **Azure 우선**으로 재작성(AKS, Azure Database for PostgreSQL Flexible Server, Blob Storage, Key Vault, App Gateway/ingress-nginx). GCP는 "이전 경로" 섹션으로 이동
- [x] `construction/sm-be/infrastructure-design/infrastructure-design.md` — provider 매핑 표 Azure 우선으로 갱신
- [x] `construction/sm-fe/infrastructure-design/deployment-architecture.md` — Ingress/토폴로지 서술을 AKS(ingress-nginx) 기준으로 갱신
- [x] `construction/sm-be/nfr-design/` 등에서 GCP-우선 언급 있으면 정합성 확인·보정

### 2. Azure 오버레이 배포 준비 완성 (k8s)
- [x] `k8s/overlays/azure/kustomization.yaml` — 이미지 레지스트리(ACR) 플레이스홀더/네이밍 정리, 라벨/네임스페이스 확인
- [x] `k8s/overlays/azure/` — **Key Vault CSI `SecretProviderClass`** 추가(또는 `kubectl create secret` 수동 절차 문서화) — 시크릿 주입 경로 확정
- [x] `k8s/overlays/azure/ingress.yaml` — host/TLS/cert-manager(cluster-issuer) 값 확정 및 sm-fe·sm-be 라우팅 검증
- [x] `k8s/base` 와의 정합성(HPA/probe/리소스) 재확인, `kustomize build overlays/azure` dry 검증(가능 범위)
- [x] `k8s/overlays/gcp` 는 손대지 않고 "이전 타깃"으로 유지(주석만 정비)

### 3. AKS 배포 런북 작성
- [x] `construction/build-and-test/aks-deployment-runbook.md` 신규 작성:
  - 사전 준비(az CLI 로그인, 리소스 그룹)
  - ACR 생성 + 이미지 빌드/푸시(sm-be, sm-fe, 커밋 SHA 태그)
  - AKS 클러스터 생성(+ ingress-nginx, cert-manager 설치)
  - Azure Database for PostgreSQL Flexible Server 생성 + 네트워크/방화벽 + Flyway 자동 마이그레이션
  - Storage account + Blob 컨테이너(비공개) 생성
  - Key Vault + 시크릿 등록(db-url/username/password, blob-container, instagram-token) + CSI 연결
  - `kubectl apply -k k8s/overlays/azure` + DNS/인증서 확인
  - 검증(health/gallery/instagram/rsvp), 롤백 절차

### 4. (선택) 프로덕션 통합 지점 표시
- [x] `CloudStorageClient` 의 Azure Blob **SAS 서명 URL** 실제 구현은 별도 통합 작업으로 표기(azure-storage-blob SDK 의존성 추가 필요). 이번 배포 준비 범위에서는 골격 유지 + 런북에 "실 연동 TODO"로 명시
  - 실제 SDK 구현까지 원하면 이 단계를 코드 변경으로 승격(별도 승인)

### 5. 상태 동기화
- [x] `aidlc-state.md` Stage Progress 에 "Infrastructure Design (AKS-first 재작업)" 및 "AKS 배포 런북" 항목 반영
- [x] `audit.md` 진행/승인 기록

---

## 승인 질문

## Question 1
위 계획대로 AKS 우선 배포 준비를 진행할까요?

A) 승인 — 계획대로 1~3, 5단계 진행(4는 골격 유지 + TODO 표기) *(Recommend)*

B) 승인하되 4단계(Azure Blob SAS 실제 SDK 구현)까지 포함 — 코드 변경 포함

C) 계획 수정 요청 (아래 [Answer]: 뒤에 수정 내용 기술)

D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## 실행 결과 (2026-07-18 완료)
- 문서 전환: sm-be/sm-fe infrastructure-design (deployment-architecture.md, infrastructure-design.md) Azure 우선 재작성, deployment-artifacts-summary.md azure=primary 반영
- Azure 오버레이 완성: kustomization(sm-be+sm-fe 이미지), deployment-patch(Workload Identity + CSI 볼륨), serviceaccount.yaml(신규), secretproviderclass.yaml(신규, Key Vault CSI), ingress.yaml(ingressClassName)
- 런북: `construction/build-and-test/aks-deployment-runbook.md` 신규 (0~11 단계 + GCP 이전)
- 4단계(Blob SAS 실제 SDK): 골격 유지, 런북 §11 에 프로덕션 TODO 로 표기
- 미실행: 실제 Azure 배포(구독/자격증명 필요) — 런북대로 사용자 환경에서 진행. git 커밋 없음(Q2=B).
