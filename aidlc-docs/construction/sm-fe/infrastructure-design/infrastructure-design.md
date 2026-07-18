# Infrastructure Design — Unit 2: Frontend (`sm-fe`)

**[2026-07-18 변경] Azure(AKS) 우선.** 정적 SPA를 nginx 컨테이너로 AKS에 배포. 백엔드와 동일 Ingress에서 라우팅. GCP(GKE)는 이전 타깃으로 유지.

## 1. 논리 → 물리 서비스 매핑 (Azure 우선)
| 논리 | Azure 서비스 | 비고 |
|---|---|---|
| 정적 서빙 | nginx 컨테이너 on AKS | Vite build 산출물(`dist`) 서빙, SPA fallback → index.html |
| 인스턴스 | Deployment replicas=2 | 가용성 |
| 노출/라우팅 | 백엔드와 동일 ingress-nginx | `/api/*`→sm-be, 그 외→sm-fe |
| TLS | cert-manager(Let's Encrypt) | 백엔드 인프라와 공유 |
| API 호출 | 상대경로 `/api` (동일 오리진) | dev 는 Vite 프록시 → localhost:7080 |

## 2. nginx 구성 요점
- 정적 파일 gzip/캐시 헤더(정적 자산 장기 캐시, index.html 은 no-cache)
- SPA fallback: `try_files $uri /index.html`
- `/api` 는 Ingress에서 백엔드로 라우팅되므로 nginx는 정적만 담당

## 3. 환경 구성
- 로컬 개발: `yarn dev`(Vite, 포트 5173) + `/api` 프록시 → localhost:7080
- 운영: nginx 컨테이너(포트 80) on AKS

## 4. GCP(GKE) 이전 경로
- 동일 이미지/매니페스트. Ingress/cert 만 오버레이 교체(백엔드와 동일 패턴, `overlays/gcp`)
- 대안: 정적 호스팅(Azure Static Web Apps/Blob+CDN ↔ Cloud Storage/CDN)으로 전환 가능(추후 비용 최적화 옵션)

## 5. 검증
- 정적 서빙/라우팅/TLS/이식성 매핑 완료. 백엔드 인프라와 일관. 이 단계 blocking finding 없음
