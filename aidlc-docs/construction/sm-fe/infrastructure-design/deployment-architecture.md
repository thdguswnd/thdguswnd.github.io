# Deployment Architecture — Unit 2: Frontend (`sm-fe`)

**[2026-07-18 변경] Azure(AKS) 우선.** GCP(GKE)는 이전 타깃으로 유지.

## 1. 토폴로지 (백엔드와 동일 클러스터/Ingress)
```
하객 브라우저 → HTTPS → ingress-nginx (cert-manager TLS)
   ├ /api/*  → sm-be Service (백엔드)
   └ /       → sm-fe Service (nginx 정적)
sm-fe (nginx 컨테이너, replicas 2) : Vite build(dist) 서빙 + SPA fallback
```

## 2. 컴퓨트 / 스케일링
- AKS, `sm-fe` Deployment replicas=2, RollingUpdate
- nginx 컨테이너(포트 80), 리소스 request/limit 소규모 설정
- liveness/readiness: `/` (정적 200) 확인

## 3. 빌드/배포
- 빌드: `yarn install && yarn build` → `dist`
- 이미지: nginx 베이스에 `dist` 복사(멀티스테이지 Dockerfile) → ACR(불변 태그)
- 배포: Kustomize base + azure(primary)/gcp(migration) 오버레이 (백엔드와 동일 방식), Rolling Update

## 4. 라우팅 상세
- Ingress path: `/api`(Prefix)→sm-be:80, `/`(Prefix)→sm-fe:80
- 프론트는 상대경로 `/api` 호출 → 동일 오리진(CORS 부담 없음)

## 5. Kustomize (프론트)
```
k8s/
  base/          # (백엔드와 공유 루트) sm-fe Deployment/Service 포함
  overlays/azure # (primary) ingress-nginx 라우팅(/ → sm-fe)
  overlays/gcp   # (migration) GKE Ingress 라우팅(/ → sm-fe)
```
> Ingress 는 백엔드 인프라 산출물의 `k8s/overlays/*/ingress.yaml`에 `/`→sm-fe 라우팅으로 정의됨. sm-fe 의 Deployment/Service 매니페스트는 `k8s/base`에 포함됨.

## 6. 검증
- 단일 Ingress 라우팅(ingress-nginx), 멀티존 replicas 2, 무중단 배포. 백엔드와 정합
