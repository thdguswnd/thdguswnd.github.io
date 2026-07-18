# Code Summary — Unit 2: Frontend (`sm-fe`)

## 생성 파일 (9단계)
- **빌드/설정**: package.json, tsconfig.json, vite.config.ts, index.html, .eslintrc.cjs, .prettierrc, src/main.tsx, src/styles/global.css, src/test/setup.ts
- **콘텐츠**: src/content/{types.ts, invitation.json, ContentProvider.tsx}
- **순수 유틸(PBT)**: src/lib/{dday.ts, calendar.ts} + __tests__(fast-check FP-01~03)
- **API/훅**: src/lib/{apiClient.ts, types.ts}, src/hooks/{useGallery, useInstagramFeed, useRsvpSubmit}, rsvp-serialization.test(FP-04)
- **공통 컴포넌트**: ScrollReveal, ErrorBoundary, Skeleton, SectionContainer
- **섹션 11종**: Hero/Greeting/GroomIntro/BrideIntro/Timeline/Calendar/Directions/Rsvp/Gallery(lazy)/Instagram(lazy)/Gift + App.tsx
- **테스트(RTL)**: CalendarSection, RsvpSection, InstagramSection
- **배포**: sm-fe/Dockerfile(node→nginx), nginx.conf(SPA fallback), k8s/base/sm-fe-{deployment,service}.yaml + kustomization 갱신
- **문서**: sm-fe/README.md

## FR 매핑
- FR-01~08,12,13: 섹션 컴포넌트 + invitation.json
- FR-07: CalendarSection(캘린더+D-Day, calendar/dday 유틸)
- FR-09: RsvpSection + useRsvpSubmit + apiClient(POST /api/rsvp)
- FR-10/11: Gallery/Instagram 섹션 + 훅(GET /api/gallery, /api/instagram/feed), 폴백

## NFR 반영
- 성능: lazy 섹션(Gallery/Instagram) + Suspense/Skeleton, 이미지 loading="lazy"
- 폴백: 섹션별 graceful degradation + 최상위 ErrorBoundary
- 접근성: alt/라벨/시맨틱, data-testid(자동화)
- 보안: 시크릿 미보관, 외부 링크 noopener, 상대경로 /api

## 비고
- 테스트는 생성만, 실행은 Build and Test 단계
- Yarn wrapper/lock 은 최초 `yarn install` 시 생성
