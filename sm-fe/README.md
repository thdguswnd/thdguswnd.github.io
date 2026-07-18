# sm-fe — 모바일 청첩장 프론트엔드

React 18 + TypeScript + Vite 기반 단일 페이지 청첩장. 세로 스크롤 + fade-in, RSVP/갤러리/Instagram 연동.

## 요구 사항
- Node.js 20+, Yarn

## 개발 / 빌드 (Windows PowerShell)
```powershell
# 의존성 설치
yarn install

# 개발 서버 (http://localhost:5173, /api → localhost:7080 프록시)
yarn dev

# 프로덕션 빌드 (dist/)
yarn build

# 테스트 / 린트 / 포맷
yarn test
yarn lint
yarn format
```

## 구조
```
src/
  content/     # invitation.json + 타입 + ContentProvider
  lib/         # dday, calendar(순수 유틸/PBT), apiClient, types
  hooks/       # useGallery, useInstagramFeed, useRsvpSubmit
  components/   # ScrollReveal, ErrorBoundary, Skeleton, SectionContainer
  sections/    # 11개 섹션 컴포넌트
```

## 콘텐츠 수정
- `src/content/invitation.json` 을 편집하여 문구·인물·일시·장소·계좌·지도 링크 등을 변경(재배포 필요)

## API 연동
- 상대경로 `/api` 호출 (동일 오리진). dev 는 Vite 프록시로 백엔드(7080) 전달, 운영은 Ingress 라우팅
- 갤러리(`/api/gallery`), Instagram(`/api/instagram/feed`), RSVP(`/api/rsvp`)
- 실패 시 폴백: 갤러리 섹션 숨김, Instagram 프로필 링크, RSVP 오류 메시지(429 재시도 안내)

## 배포
- `Dockerfile`(node build → nginx), `nginx.conf`(SPA fallback + 정적 캐시)
- K8s: `../k8s/base`(sm-fe Deployment/Service) + Ingress 라우팅(`/`→sm-fe)

## 테스트
- Vitest + React Testing Library, fast-check(PBT: D-Day/캘린더/폼 직렬화)
