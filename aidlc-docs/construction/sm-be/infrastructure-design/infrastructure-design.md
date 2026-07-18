# Infrastructure Design — Unit 1: Backend (`sm-be`)

논리 컴포넌트를 실제 인프라 서비스로 매핑합니다. **[2026-07-18 변경] Azure(AKS) 우선 배포**, GCP(GKE) 이전 가능 유지. 애플리케이션 이미지는 provider 불변, provider-specific 요소는 Kustomize 오버레이/Spring profile 로 격리.

## 1. 논리 → 물리 서비스 매핑 (Azure 우선)
| 논리 컴포넌트 | Azure 서비스 | 비고 |
|---|---|---|
| 백엔드 런타임 | **AKS** (Azure Kubernetes Service) | 관리형 K8s, node pool 기반 |
| 백엔드 인스턴스 | Deployment, replicas=2 (multi-zone) | NFR-SC2, 최소 이중화(가용영역 분산) |
| 운영 DB | **Azure Database for PostgreSQL — Flexible Server** (Zone-redundant HA) | multi-zone HA + 자동 백업 + PITR |
| 개발 DB | H2 (PostgreSQL 호환, 로컬) | Flyway 동일 마이그레이션 |
| 오브젝트 스토리지 | **Azure Blob Storage** (비공개 컨테이너, 클러스터와 동일 리전) | SAS 서명 URL 접근, 익명 접근 차단 |
| 인그레스/TLS | **ingress-nginx + cert-manager**(Let's Encrypt) 또는 Application Gateway Ingress Controller(AGIC) | `/api` → 백엔드 Service |
| 시크릿 | **Azure Key Vault** (+ Secrets Store CSI Driver) | `SecretsProvider` 경유, Workload Identity(AKS Managed Identity)로 접근 |
| 캐시(Instagram/서명URL) | Pod 내 Caffeine | 별도 인프라 없음 |
| Rate limiting | Pod 내 Bucket4j | 별도 인프라 없음 |
| 데이터 보존 배치 | `RsvpRetentionScheduler`(앱 내 @Scheduled) | 3개월 후 삭제/익명화 |
| 관측성 | **Azure Monitor + Container Insights**, Micrometer(Prometheus 엔드포인트) | 기본 알림 포함 |
| 이미지 레지스트리 | **Azure Container Registry(ACR)** | 불변 태그(커밋 SHA), `latest` 금지 |

## 2. 환경 구성
- **로컬 개발**: Spring profile `local` + H2 + 로컬 스토리지/모킹. `.\gradlew.bat bootRun`
- **운영(prod)**: AKS + Azure Database for PostgreSQL + Blob Storage + Key Vault (profile `azure`)
- dev/prod 별도 클러스터 미구성(개인 프로젝트 단순화). 필요 시 추후 분리.

## 3. 네트워킹
- ingress-nginx(외부 LoadBalancer) → 백엔드 `Service`(ClusterIP) → Pod
- cert-manager 로 TLS 인증서 발급/갱신(Let's Encrypt cluster-issuer)
- 프론트엔드(`sm-fe`, nginx 컨테이너)와 동일 클러스터. Ingress 라우팅: `/api/*` → 백엔드, 그 외 → 프론트엔드
- CORS: 프론트 오리진만 허용

## 4. 보안 인프라
- Key Vault + AKS Workload Identity(파드→시크릿, 키 파일 없이 접근) — Secrets Store CSI Driver 로 마운트/동기화
- Blob 컨테이너 비공개(익명 접근 차단, 퍼블릭 액세스 레벨 None), 백엔드만 SAS 발급
- Azure Database for PostgreSQL: 프라이빗 액세스(VNet 통합) 권장, 저장 암호화(기본), TLS 연결 강제
- 전 구간 TLS, 보안 헤더/CORS(앱 레벨)

## 5. 백업 / DR
- Azure Database for PostgreSQL 자동 백업 + PITR 활성화 (RESILIENCY-12)
- 단일 리전 multi-zone(Zone-redundant HA)로 zone 장애 대응. 교차 리전 DR 불필요(요구사항 확정)
- Blob: 이미지는 원본 보관(운영 백업 대상 아님, 재업로드 가능)

## 6. GCP(GKE) 이전(migration) 경로
이식성 유지를 위해 GCP 대응 요소를 아래로 문서화한다(현재는 이전 타깃, `k8s/overlays/gcp` 로 보존).

| 항목 | Azure(현행) | GCP 대응 | 이전 조치 |
|---|---|---|---|
| 컨테이너 오케스트레이션 | AKS | GKE Autopilot | 동일 이미지/표준 매니페스트 재사용 |
| DB | Azure Database for PostgreSQL | Cloud SQL(PostgreSQL) | 표준 PostgreSQL, dump/restore + 연결 설정 교체 |
| 오브젝트 스토리지 | Azure Blob Storage | GCS | `StorageClient` 구현 교체(SAS↔서명 URL) |
| 시크릿 | Azure Key Vault | Secret Manager | `SecretsProvider` 교체 |
| 인그레스/TLS | ingress-nginx + cert-manager / AGIC | GKE Ingress + managed cert | 오버레이 교체 |
| 워크로드 인증 | AKS Managed Identity | Workload Identity | 오버레이/설정 교체 |
| 모니터링 | Azure Monitor | Cloud Monitoring | Micrometer 레지스트리 교체 |

**이식성 보강(반영):**
1. **DB 연결 외부화** — 데이터소스 URL/자격증명을 Spring profile(`azure`/`gcp`) + 시크릿으로 분리. 이미지 재빌드 없이 전환.
2. **Kustomize base + 오버레이** — `k8s/base`(공통 Deployment/Service) + `k8s/overlays/azure`(primary), `k8s/overlays/gcp`(migration). 이전 시 오버레이만 교체.
3. **이식성 경계 문서화** — provider-specific 지점(Ingress, DB 연결, 워크로드 인증, SAS/서명 URL)을 위 표로 명시. 애플리케이션 코드는 추상화 계층 뒤에서 불변 유지.

## 7. 검증
- 모든 논리 컴포넌트가 Azure 인프라 서비스로 매핑됨
- Security/Resiliency 요구(비공개 스토리지, HA, 백업, 시크릿)와 정합
- GCP 이전 경로 명시. 표준 PostgreSQL·추상화 계층으로 락인 최소화
