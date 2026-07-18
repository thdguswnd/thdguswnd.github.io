# Code Generation Plan — Unit 2: Frontend (`sm-fe`)

이 계획은 Frontend unit 코드 생성의 단일 기준입니다. Part 2에서 순서대로 실행하며 완료 시 [x] 표시.

## Unit 컨텍스트
- **Unit**: Frontend (`sm-fe`) — React 18 + TypeScript + Vite + Yarn
- **코드 위치**: `c:\AIDLC_WS_GREEN\sm-fe\` (문서 요약은 aidlc-docs/)
- **구현 FR**: FR-01~08(정적 섹션), FR-12/13, FR-09/10/11 UI
- **API 계약**: `POST /api/rsvp`, `GET /api/gallery`, `GET /api/instagram/feed` (Unit 1)
- **기술**: 단일 페이지, 상대경로 `/api`, Vitest + RTL + fast-check(PBT), ESLint/Prettier

> 상태: 전 단계(Step 1~9) 생성 완료 [x]

## 생성 단계 (순차 실행)

### Step 1: 프로젝트 구조 및 빌드 설정
- [ ] `sm-fe/package.json`(React18/Vite/TS/Vitest/RTL/fast-check/ESLint/Prettier), `vite.config.ts`(dev 프록시 /api→7080), `tsconfig.json`, `index.html`, `.eslintrc`/`.prettierrc`
- [ ] `src/main.tsx`, `src/App.tsx`, 전역 스타일

### Step 2: 콘텐츠 & 타입
- [ ] `src/content/invitation.json`(샘플 콘텐츠), `src/content/types.ts`(InvitationContent), `src/content/ContentProvider.tsx`

### Step 3: 순수 유틸 + PBT
- [ ] `src/lib/dday.ts`(DDayCalculator), `src/lib/calendar.ts`(CalendarModel)
- [ ] `src/lib/__tests__` fast-check PBT(FP-01~03) + 예시

### Step 4: API 클라이언트 & 훅
- [ ] `src/lib/apiClient.ts`(fetch 래퍼, 타임아웃/에러), `src/lib/types.ts`(API DTO)
- [ ] `src/hooks/useGallery.ts`, `useInstagramFeed.ts`, `useRsvpSubmit.ts`
- [ ] 폼 DTO 직렬화 PBT(FP-04)

### Step 5: 공통 컴포넌트
- [ ] `ScrollReveal`, `ErrorBoundary`, `Skeleton`, `SectionContainer`

### Step 6: 섹션 컴포넌트 (11종)
- [ ] Hero/Greeting/GroomIntro/BrideIntro/Timeline/Calendar/Directions/Rsvp/Gallery(lazy)/Instagram(lazy)/Gift
- [ ] `data-testid` 부여, D-Day/캘린더 연동, deep link + 웹 폴백

### Step 7: 컴포넌트 테스트 (RTL)
- [ ] Calendar/D-Day, RsvpSection(검증/제출), Gallery/Instagram 폴백 렌더 테스트

### Step 8: 배포 산출물
- [ ] `sm-fe/Dockerfile`(멀티스테이지: node build → nginx), `sm-fe/nginx.conf`(SPA fallback, 정적 캐시)
- [ ] `k8s/base` 에 `sm-fe-deployment.yaml`, `sm-fe-service.yaml` 추가 + kustomization 갱신

### Step 9: 문서
- [ ] `sm-fe/README.md`, `aidlc-docs/construction/sm-fe/code/` 요약(컴포넌트/배포)

## 코드 위치 규칙
- 애플리케이션 코드: `c:\AIDLC_WS_GREEN\sm-fe\`, 매니페스트: `c:\AIDLC_WS_GREEN\k8s\`
- 테스트 생성만, 실행은 Build and Test 단계

## FR 추적성
| FR | 단계 |
|---|---|
| FR-01~08,12,13 | Step 6 (+2 콘텐츠) |
| FR-07 캘린더/D-Day | Step 3/6 |
| FR-09 RSVP UI | Step 4/6/7 |
| FR-10/11 갤러리·Instagram UI | Step 4/6/7 |

## 범위 메모
- 총 9단계. 정적 SPA + 순수 유틸 + API 연동 + 배포.
- 하객 사진첩/YouTube 범위 외.
