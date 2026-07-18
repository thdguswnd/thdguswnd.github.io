# Code Generation 계획 — Azure Blob SAS 실제 구현 (Unit 1: Backend)

## 목표
`CloudStorageClient` 골격을 대체해, Azure Blob Storage 에 대한 **user-delegation SAS**(키리스, Workload Identity 기반) 실제 발급 및 객체 나열을 구현한다.

## 설계 결정
- **AzureBlobStorageClient** 신설 (`@Profile("azure")`) — Azure SDK 사용, `DefaultAzureCredential`(Workload Identity) + user-delegation key 로 SAS 발급(계정 키 미사용).
- 기존 **CloudStorageClient** 는 `@Profile("gcp")` 로 축소(향후 GCS 서명 URL 구현용 골격 유지).
- profile 별 StorageClient 빈이 정확히 하나만 활성화되도록 보장(local/test→Local, gcp→Cloud(골격), azure→AzureBlob).

## 변경 목록
- [x] `sm-be/build.gradle` — `com.azure:azure-sdk-bom` + `azure-storage-blob` + `azure-identity` 의존성 추가
- [x] `platform/storage/AzureBlobStorageClient.java` (신규) — listObjectKeys(prefix), generateSignedUrl(user-delegation SAS, HTTPS-only, TTL)
- [x] `platform/storage/CloudStorageClient.java` — `@Profile("azure","gcp")` → `@Profile("gcp")` 로 축소, 주석 정리
- [x] `config/WeddingProperties.java` — `Storage.account`(스토리지 계정명) 필드 추가
- [x] `sm-be/src/main/resources/application.yml` — azure 프로파일에 `wedding.storage.account: ${AZURE_STORAGE_ACCOUNT}` 추가
- [x] `k8s/overlays/azure/deployment-patch.yaml` — `AZURE_STORAGE_ACCOUNT` env(secret: storage-account) 추가
- [x] `k8s/overlays/azure/secretproviderclass.yaml` — `storage-account` object 추가
- [x] `aks-deployment-runbook.md` — Key Vault `storage-account` 시크릿 + "Storage Blob Delegator" 역할 부여 추가, §11 TODO 해소 반영
- [x] 인프라/요약 문서 — Blob SAS 실제 구현 반영
- [x] 빌드/테스트 검증(`gradlew.bat clean build`) — 기존 테스트 회귀 없음 확인

## 테스트 범위
- Azure 실계정 연동 테스트는 이 환경에서 불가(라이브 계정 필요). 컴파일/기존 테스트 회귀 없음까지 검증.
- 런타임 SAS 검증은 런북 §9(배포 후 `/api/gallery`)로 위임.

## 실행 결과 (2026-07-18 완료)
- `gradlew.bat clean build` **BUILD SUCCESSFUL** — Azure SDK(azure-storage-blob, azure-identity, BOM 1.2.28) 해석/컴파일 성공, 기존 테스트 전부 통과(회귀 없음), spotless 통과.
- 신규: `AzureBlobStorageClient`(@Profile azure, DefaultAzureCredential + user-delegation SAS, HTTPS-only, 읽기 전용).
- 변경: `CloudStorageClient` → @Profile("gcp") 축소, `WeddingProperties.Storage.account` 추가, application.yml azure `account`, azure 오버레이(deployment-patch env + secretproviderclass object: storage-account), 런북(storage-account 시크릿 + Storage Blob Delegator 역할, §11 TODO 해소).
- 런타임 SAS 검증: 실제 Azure 계정 필요 → 런북 §9 로 위임.
