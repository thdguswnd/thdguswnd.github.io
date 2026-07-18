# Integration Test Instructions — 모바일 청첩장

## 목적
Frontend(`sm-fe`) ↔ Backend(`sm-be`) REST 계약 및 백엔드 ↔ 외부(DB/스토리지/Instagram) 상호작용 검증.

## 테스트 시나리오

### 시나리오 1: 프론트 → 백엔드 RSVP 제출 (FR-09)
- 설정: 백엔드 기동(local, H2), 프론트 dev 서버(프록시 /api→7080)
- 절차: 청첩장 RSVP 폼 작성 → 제출 → `POST /api/rsvp` 200, DB 저장 확인. 동일 연락처 재제출 → upsert(1건 유지)
- 기대: 접수 성공 메시지, `rsvp` 테이블 레코드 확인

### 시나리오 2: 갤러리 조회 (FR-10)
- 절차: 갤러리 섹션 진입 → `GET /api/gallery` → 서명 URL 목록 렌더(local 은 LocalStorageClient 샘플)
- 기대: 이미지 그리드 표시, 실패 시 섹션 숨김(폴백)

### 시나리오 3: Instagram 프록시 (FR-11)
- 절차: `GET /api/instagram/feed`(local 은 MockInstagramClient) → 피드 렌더. 빈 목록/오류 시 프로필 링크 폴백
- 기대: 피드 표시 또는 폴백 링크

### 시나리오 4: Rate limit (SECURITY-11)
- 절차: `POST /api/rsvp` 를 IP당 분당 5회 초과 호출 → 429 응답
- 기대: 초과분 429 + 프론트 재시도 안내 메시지

## 환경 기동
```powershell
# 1) 백엔드 (터미널 A)
cd sm-be; .\gradlew.bat bootRun

# 2) 프론트 (터미널 B)
cd sm-fe; yarn dev
# 브라우저 http://localhost:5173
```

## 자동화(선택)
- 컨테이너 통합: `docker build` 후 `k8s`(Kustomize)로 로컬 클러스터(kind/minikube) 배포하여 Ingress 라우팅(/api, /) 검증

## 정리
```powershell
# 백엔드/프론트 프로세스 종료 (Ctrl+C)
# H2 데이터 초기화 필요 시
Remove-Item -Recurse -Force .\sm-be\data\*.mv.db -ErrorAction SilentlyContinue
```
