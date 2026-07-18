# Deployment Artifacts Summary — Unit 1: Backend (`sm-be`)

## 생성 산출물 (Step 13~15)
- `sm-be/Dockerfile` — 멀티스테이지 빌드, JRE 17, 비루트 사용자(uid 1001), 포트 7080
- `sm-be/.dockerignore`
- `k8s/base/` — `deployment.yaml`(replicas 2, RollingUpdate maxUnavailable 0, topology spread by zone, liveness/readiness probe, 리소스 request/limit), `service.yaml`(ClusterIP), `configmap.yaml`, `hpa.yaml`(2~4, CPU 70%), `kustomization.yaml`
- `k8s/overlays/azure/` — **(primary, 2026-07-18~)** `ingress.yaml`(ingress-nginx + cert-manager), `deployment-patch.yaml`(azure 프로파일 + Key Vault 시크릿), `secretproviderclass.yaml`(Key Vault CSI), `kustomization.yaml`(ACR 이미지, 불변 태그). 배포 절차는 `build-and-test/aks-deployment-runbook.md`
- `k8s/overlays/gcp/` — **(migration 타깃)** `ingress.yaml`(GKE Ingress, /api→sm-be, /→sm-fe), `managed-certificate.yaml`, `deployment-patch.yaml`(Workload Identity SA + Secret 주입 env, gcp 프로파일), `kustomization.yaml`(Artifact Registry 이미지, 불변 태그)
- `sm-be/README.md` — 빌드/실행/프로파일/API 문서

## DB 마이그레이션 확인 (Step 13)
- `V1__create_rsvp.sql` (Flyway): rsvp 테이블, contact UNIQUE, created_at 인덱스, IDENTITY PK
- PostgreSQL/H2(PostgreSQL 모드) 공통 SQL로 이식성 유지. 기동 시 Flyway 자동 적용

## 배포/회복성 반영
- Rolling Update(무중단) + `kubectl rollout undo` 롤백
- 멀티존 분산(topologySpreadConstraints), health probe 기반 자동 교체
- 불변 이미지 태그(커밋 SHA), `latest` 금지 (SECURITY-13)
- 시크릿은 K8s Secret/CSI(Secret Manager·Key Vault)로 주입, ConfigMap 평문 금지

## 이식성 경계 (Azure → GCP)
- 애플리케이션 이미지/`k8s/base` 공통. provider-specific(Ingress, 인증서, 시크릿 주입, 프로파일)은 오버레이에서만 정의
- `StorageClient`/`SecretsProvider` 추상화 + 표준 PostgreSQL 로 코드 변경 최소화
- **스토리지 구현**: `AzureBlobStorageClient`(`@Profile("azure")`, Workload Identity user-delegation SAS) = 현행. `CloudStorageClient`(`@Profile("gcp")`)는 GCS 서명 URL 골격(이전 시 구현). `LocalStorageClient`(local/test).
