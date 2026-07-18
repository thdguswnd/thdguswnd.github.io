# Logical Components — Unit 2: Frontend (`sm-fe`)

## 1. 핵심 컴포넌트/모듈
| 컴포넌트 | 유형 | 역할 |
|---|---|---|
| `InvitationPage` | 페이지 | 섹션 오케스트레이션, 순서 렌더 |
| `ScrollReveal` | 유틸 컴포넌트/훅 | IntersectionObserver 1회 fade-in |
| `ContentProvider` | 컨텍스트/로더 | invitation.json 로드·타입 검증 제공 |
| `ApiClient` | 모듈 | fetch 래퍼(타임아웃/에러 정규화): submitRsvp/fetchGallery/fetchInstagramFeed |
| `ErrorBoundary` | 컴포넌트 | 렌더 오류 격리 |
| `Skeleton` | 컴포넌트 | 로딩 placeholder |
| `DDayCalculator`/`CalendarModel` | 순수 유틸 | D-Day/캘린더(PBT 대상) |

## 2. 섹션 컴포넌트 (지연 로드 구분)
- 즉시 로드: `HeroSection`, `GreetingSection`, `GroomIntroSection`, `BrideIntroSection`, `TimelineSection`, `CalendarSection`, `DirectionsSection`, `GiftSection`, `RsvpSection`
- 지연 로드(React.lazy): `GallerySection`, `InstagramSection`

## 3. 데이터 훅 (동적 섹션)
| 훅 | 역할 | 폴백 |
|---|---|---|
| `useGallery` | `/api/gallery` 조회, 로딩/에러 상태 | 실패 시 빈 배열 → 섹션 축소 |
| `useInstagramFeed` | `/api/instagram/feed` 조회 | 실패/빈 목록 시 프로필 링크만 |
| `useRsvpSubmit` | `/api/rsvp` 제출, 제출 상태/에러 | 429/오류 메시지 |

## 4. 컴포넌트 상호작용 요약
```
InvitationPage
  └ ContentProvider(invitation.json)
      └ Sections (ScrollReveal 래핑)
          ├ CalendarSection → CalendarModel / DDayCalculator
          ├ DirectionsSection → deep link + webUrl 폴백
          ├ RsvpSection → useRsvpSubmit → ApiClient → POST /api/rsvp
          ├ GallerySection(lazy) → useGallery → GET /api/gallery (Skeleton/폴백)
          └ InstagramSection(lazy) → useInstagramFeed → GET /api/instagram/feed (폴백: 프로필 링크)
  └ ErrorBoundary(최상위)
```

## 5. 검증
- NFR 패턴이 논리 컴포넌트로 매핑됨. tech-stack(React/Vite/Vitest/fast-check)과 정합
