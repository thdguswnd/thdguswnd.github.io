# Infrastructure Design Plan — Unit 2: Frontend (`sm-fe`)

Frontend(정적 SPA)의 배포 인프라를 확정합니다. nginx 컨테이너 → GKE, Ingress 라우팅. 각 질문에 권장안(A) 표시.

## 진행 체크리스트
- [x] Functional/NFR Design 분석
- [x] 아래 인프라 질문에 대한 사용자 답변 수집 (전부 권장안 A)
- [x] 답변 모호성 분석 및 필요 시 follow-up (모순 없음)
- [x] `infrastructure-design.md` 생성
- [x] `deployment-architecture.md` 생성
- [x] 검증

---

## 인프라 결정 질문

### Question 1: 정적 서빙 방식
빌드 산출물 서빙은?

A) nginx 컨테이너로 정적 파일 서빙 + SPA fallback(미매칭 경로 → index.html) (권장, Unit 분해 결정과 일관)

B) 오브젝트 스토리지/CDN 정적 호스팅

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2: 프론트-백엔드 라우팅
프론트/백엔드 노출 구성은?

A) 동일 Ingress(호스트)에서 `/api/*`→백엔드, 그 외→프론트엔드(sm-fe). 프론트는 상대경로 `/api` 호출(동일 오리진) (권장)

B) 프론트/백엔드 별도 호스트(서브도메인) + CORS

X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3: API base URL 구성
프론트에서 백엔드 API 주소 지정은?

A) 상대경로 `/api` 사용(동일 오리진). dev 는 Vite 프록시로 localhost:7080 전달 (권장)

B) 빌드 시 절대 URL 환경변수 주입

X) Other (please describe after [Answer]: tag below)

[Answer]: A
