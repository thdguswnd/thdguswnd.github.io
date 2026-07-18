# Tech Stack Decisions — Unit 2: Frontend (`sm-fe`)

## 1. 핵심 스택 (확정)
| 영역 | 선택 | 비고 |
|---|---|---|
| 언어 | TypeScript | 타입 안전 |
| UI 라이브러리 | React 18 | |
| 빌드/개발 | Vite | dev 프록시 `/api` → 백엔드(localhost:7080) |
| 패키지 매니저 | Yarn | 워크스페이스 규칙 |
| 배포 | nginx 컨테이너(정적 서빙) → GKE | 이식성 일관 |

## 2. 이번 단계 확정 세부
| 영역 | 선택 | 근거 |
|---|---|---|
| 스크롤 애니메이션 | IntersectionObserver(1회 fade-in) | Q5(FD) |
| 이미지 최적화 | lazy loading + srcset + 코드 스플리팅 | Q1 |
| 상태 관리 | 로컬 상태 + fetch 훅(전역 스토어 미도입) | 소규모 |
| HTTP | fetch 기반 `ApiClient`(타임아웃/에러 정규화) | |
| 테스트 | Vitest + React Testing Library | Q5 |
| PBT | fast-check(Partial) | Q4, PBT-09 |
| 린트/포맷 | ESLint + Prettier | Q5 |
| 라우팅 | 단일 페이지(라우터 불필요) | 세로 스크롤 단일 페이지 |

## 3. 콘텐츠/설정
- `src/content/invitation.json` + TypeScript 타입(`InvitationContent`)
- 지도 앱 링크(deep link + webUrl)는 콘텐츠 JSON 에 포함

## 4. 브라우저 타깃
- browserslist: 최신 iOS Safari 2버전, 최신 Android Chrome 2버전(모던). 별도 폴리필 최소

## 5. 근거 요약
정적 콘텐츠 중심 단일 페이지에 맞춰 경량 구성(전역 스토어/라우터 미도입). 성능은 이미지 최적화·코드 스플리팅으로, 품질은 Vitest/RTL/ESLint/Prettier + fast-check(PBT Partial)로 확보.
