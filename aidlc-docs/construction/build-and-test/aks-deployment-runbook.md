# AKS 배포 런북 — 모바일 청첩장 (Azure 우선)

Azure(AKS)에 `sm-be`(백엔드) + `sm-fe`(프론트엔드)를 배포하는 실행 절차. GCP 이전은 `k8s/overlays/gcp` + profile `gcp` 로 동일 패턴 적용.

> **주의**: 이 워크스페이스는 실제 Azure 리소스에 배포하지 않는다(구독/자격증명 필요). 아래는 사용자 Azure 환경에서 실행하는 절차이며, 모든 `<...>` 플레이스홀더를 실제 값으로 치환한다.

## 0. 변수 정의 (예시)
```bash
export RG=wedding-rg                 # 리소스 그룹
export LOC=koreacentral               # 리전
export ACR=weddingacr$RANDOM          # ACR 이름(전역 고유, 소문자/숫자)
export AKS=wedding-aks                # AKS 클러스터
export KV=wedding-kv-$RANDOM          # Key Vault(전역 고유)
export PG=wedding-pg-$RANDOM          # PostgreSQL Flexible Server(전역 고유)
export PG_ADMIN=wedadmin
export PG_DB=wedding
export STG=weddingstg$RANDOM          # Storage account(전역 고유, 소문자/숫자)
export BLOB_CONTAINER=gallery
export DOMAIN=wedding.example.com
export TAG=$(git rev-parse --short HEAD)   # 불변 이미지 태그(커밋 SHA)
```

## 1. 사전 준비
```bash
az login
az account set --subscription "<SUBSCRIPTION_ID>"
az group create -n $RG -l $LOC
```

## 2. ACR 생성 + 이미지 빌드/푸시
```bash
az acr create -g $RG -n $ACR --sku Basic
az acr login -n $ACR

# 백엔드: gradle 로 부트 jar 빌드 후 이미지 빌드
(cd sm-be && ./gradlew clean build -x test)      # Windows: .\gradlew.bat clean build
docker build -t $ACR.azurecr.io/wedding/sm-be:$TAG ./sm-be
docker push $ACR.azurecr.io/wedding/sm-be:$TAG

# 프론트엔드: 멀티스테이지 Dockerfile 내부에서 yarn build 수행
docker build -t $ACR.azurecr.io/wedding/sm-fe:$TAG ./sm-fe
docker push $ACR.azurecr.io/wedding/sm-fe:$TAG
```
> ACR 빌드로 대체 가능: `az acr build -r $ACR -t wedding/sm-be:$TAG ./sm-be`

## 3. AKS 클러스터 생성 (Workload Identity + OIDC + Key Vault CSI)
```bash
az aks create -g $RG -n $AKS \
  --node-count 2 \
  --zones 1 2 \
  --enable-oidc-issuer \
  --enable-workload-identity \
  --enable-addons azure-keyvault-secrets-provider \
  --attach-acr $ACR \
  --generate-ssh-keys

az aks get-credentials -g $RG -n $AKS
kubectl create namespace wedding
```

## 4. Azure Database for PostgreSQL (Flexible Server, HA)
```bash
az postgres flexible-server create -g $RG -n $PG \
  -l $LOC --tier GeneralPurpose --sku-name Standard_D2ds_v4 \
  --high-availability ZoneRedundant \
  --admin-user $PG_ADMIN --admin-password "<STRONG_PASSWORD>" \
  --version 16 --storage-size 32
az postgres flexible-server db create -g $RG -s $PG -d $PG_DB
# 접근 정책: 프라이빗(VNet) 권장. 임시 테스트 시에만 방화벽 규칙 추가.
```
- 연결 URL 형식: `jdbc:postgresql://$PG.postgres.database.azure.com:5432/$PG_DB?sslmode=require`
- Flyway 가 기동 시 `V1`, `V2` 마이그레이션을 자동 적용한다.

## 5. Storage Account + 비공개 Blob 컨테이너
```bash
az storage account create -g $RG -n $STG -l $LOC --sku Standard_LRS --allow-blob-public-access false
az storage container create --account-name $STG -n $BLOB_CONTAINER --public-access off
# 갤러리 이미지 업로드(예):
# az storage blob upload-batch --account-name $STG -d $BLOB_CONTAINER -s ./photos
```

## 6. Key Vault + 시크릿 + Workload Identity 연결
```bash
az keyvault create -g $RG -n $KV -l $LOC --enable-rbac-authorization false

# 시크릿 등록 (SecretProviderClass 의 objectName 과 일치)
az keyvault secret set --vault-name $KV -n db-url \
  --value "jdbc:postgresql://$PG.postgres.database.azure.com:5432/$PG_DB?sslmode=require"
az keyvault secret set --vault-name $KV -n db-username --value "$PG_ADMIN"
az keyvault secret set --vault-name $KV -n db-password --value "<STRONG_PASSWORD>"
az keyvault secret set --vault-name $KV -n blob-container --value "$BLOB_CONTAINER"
az keyvault secret set --vault-name $KV -n storage-account --value "$STG"
az keyvault secret set --vault-name $KV -n instagram-token --value "<INSTAGRAM_GRAPH_API_TOKEN>"

# 사용자 할당 매니지드 ID + federated credential(SA=wedding/sm-be)
export UAMI=wedding-uami
az identity create -g $RG -n $UAMI
export UAMI_CLIENT_ID=$(az identity show -g $RG -n $UAMI --query clientId -o tsv)
export TENANT_ID=$(az account show --query tenantId -o tsv)
export OIDC=$(az aks show -g $RG -n $AKS --query oidcIssuerProfile.issuerUrl -o tsv)

az identity federated-credential create -g $RG --identity-name $UAMI \
  -n wedding-fedcred --issuer "$OIDC" \
  --subject system:serviceaccount:wedding:sm-be --audience api://AzureADTokenExchange

# Key Vault 접근 권한(비-RBAC vault: access policy)
az keyvault set-policy -n $KV --secret-permissions get list --spn $UAMI_CLIENT_ID
# Blob 읽기 + user-delegation SAS 발급 권한 (AzureBlobStorageClient 요구)
export STG_ID=$(az storage account show -g $RG -n $STG --query id -o tsv)
az role assignment create --assignee $UAMI_CLIENT_ID \
  --role "Storage Blob Data Reader" --scope $STG_ID
az role assignment create --assignee $UAMI_CLIENT_ID \
  --role "Storage Blob Delegator" --scope $STG_ID
```

## 7. 매니페스트 값 치환 후 배포
`k8s/overlays/azure/` 의 플레이스홀더를 치환한다:
- `kustomization.yaml`: `<ACR_NAME>` → `$ACR`, `REPLACE_WITH_COMMIT_SHA` → `$TAG`
- `serviceaccount.yaml`: `<MANAGED_IDENTITY_CLIENT_ID>` → `$UAMI_CLIENT_ID`, `<AZURE_TENANT_ID>` → `$TENANT_ID`
- `secretproviderclass.yaml`: `<MANAGED_IDENTITY_CLIENT_ID>`, `<KEYVAULT_NAME>`($KV), `<AZURE_TENANT_ID>`
- `ingress.yaml`: `<wedding.example.com>` → `$DOMAIN`

```bash
# 빌드 검증(적용 전 dry-render)
kubectl kustomize k8s/overlays/azure | less

# ingress-nginx / cert-manager 설치(최초 1회)
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx && helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx -n ingress-nginx --create-namespace
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml
# letsencrypt-prod ClusterIssuer 생성(이메일/HTTP01 solver 포함) — 별도 매니페스트

# 배포
kubectl apply -k k8s/overlays/azure
kubectl -n wedding rollout status deploy/sm-be
kubectl -n wedding rollout status deploy/sm-fe
```

> **시크릿 동기화 참고**: `sm-be-secrets` 는 파드가 CSI 볼륨을 마운트할 때 SecretProviderClass 가 생성한다. 최초 기동 시 secretKeyRef 해석 레이스가 발생하면 파드가 재시도한다. 회피용 수동 생성(대안):
> ```bash
> kubectl -n wedding create secret generic sm-be-secrets \
>   --from-literal=db-url="..." --from-literal=db-username="$PG_ADMIN" \
>   --from-literal=db-password="..." --from-literal=blob-container="$BLOB_CONTAINER" \
>   --from-literal=instagram-token="..."
> ```

## 8. DNS / 인증서
- ingress-nginx 외부 IP 확인: `kubectl -n ingress-nginx get svc`
- DNS A 레코드: `$DOMAIN` → 외부 IP
- cert-manager 가 Let's Encrypt 인증서를 자동 발급(`kubectl -n wedding get certificate`)

## 9. 검증
```bash
curl -sk https://$DOMAIN/actuator/health          # UP
curl -sk https://$DOMAIN/api/gallery              # 서명(SAS) URL 목록
curl -sk https://$DOMAIN/api/instagram/feed       # 피드
curl -sk -X POST https://$DOMAIN/api/rsvp -H 'Content-Type: application/json' \
  -d '{"name":"홍길동","contact":"010-1234-5678","attending":true,"partySize":2,"mealOption":"YES"}'
curl -sk https://$DOMAIN/                          # SPA index
```

## 10. 롤백
```bash
kubectl -n wedding rollout undo deploy/sm-be
kubectl -n wedding rollout undo deploy/sm-fe
```

## 11. 미해결 프로덕션 통합 (TODO)
- **Azure Blob SAS 실제 발급**: ✅ 구현 완료 — `AzureBlobStorageClient`(`@Profile("azure")`)가 Workload Identity 로
  user-delegation SAS(읽기 전용, HTTPS 전용, TTL=`wedding.gallery.signed-url-ttl-minutes`)를 발급하고 `listBlobs` 로 객체를 나열한다.
  요구 RBAC: 매니지드 ID 에 "Storage Blob Data Reader" + "Storage Blob Delegator"(위 6단계에서 부여). Key Vault `storage-account` 시크릿 필요.
- **Instagram Graph API**: 실제 장기 토큰 발급/갱신 필요(현재 mock=false 이나 토큰 시크릿 주입 전제).
- **관측성**: Azure Monitor / Container Insights 활성화 및 알림 규칙 구성.

## GCP(GKE) 이전 시
- profile `gcp` + `kubectl apply -k k8s/overlays/gcp` 로 동일 패턴 적용.
- 교체 지점: Ingress(managed cert), DB(Cloud SQL), 시크릿(Secret Manager), 워크로드 인증(Workload Identity), 스토리지 SAS→서명 URL.
