# Domain Entities — Unit 2: Frontend (`sm-fe`)

Frontend 의 "도메인"은 (1) 콘텐츠 JSON 스키마와 (2) 순수 유틸(D-Day/캘린더)의 입출력이다. 서버 상태는 없으며 백엔드 API 응답(GalleryItem/InstagramItem)은 Unit 1 계약을 따른다.

## 1. 콘텐츠 JSON 스키마 (단일 파일, Q3=A)
`src/content/invitation.json` (타입: `InvitationContent`)

```
InvitationContent {
  main: { heroImage: string, title: string, subtitle?: string }
  greeting: {
    message: string,
    groom: { name: string, parents: { father?: string, mother?: string } },
    bride: { name: string, parents: { father?: string, mother?: string } }
  }
  groomIntro: { image?: string, name: string, description: string }
  brideIntro: { image?: string, name: string, description: string }
  timeline: Array<{ date: string, title: string, description?: string }>
  calendar: { weddingDate: string /* 2026-11-15 */, ceremonyTime?: string }
  directions: {
    venueName: string, address: string, lat?: number, lng?: number,
    parking?: string,
    mapImage?: string,
    appLinks: {
      naver?: { deepLink: string, webUrl: string },
      kakaoNavi?: { deepLink: string, webUrl: string },
      tmap?: { deepLink: string, webUrl: string }
    }
  }
  gift: {
    groomAccounts: Array<{ holder: string, bank: string, number: string, kakaoPayUrl?: string }>,
    brideAccounts: Array<{ holder: string, bank: string, number: string, kakaoPayUrl?: string }>
  }
  instagram: { handle: string, profileUrl: string }
}
```
- 갤러리 이미지는 백엔드 `/api/gallery`(서명 URL)에서 동적 로드 → JSON 에 미포함
- Instagram 피드는 백엔드 `/api/instagram/feed`에서 로드, `profileUrl`은 폴백/클릭 이동용

## 2. 순수 유틸 입출력 (PBT 대상)
### DDayCalculator (TypeScript, 순수)
- `daysUntil(weddingDate: Date, today: Date): number` — 남은 일수(음수면 지난 것)
- `formatDday(days: number): string` — `D-100` / `D-DAY`(0) / `D+3`(지남) (Q1=A)

### CalendarModel (TypeScript, 순수)
- `buildMonthGrid(year: number, month: number): CalendarCell[][]` — 주 단위 7칸 그리드
- `isWeddingDay(cell: CalendarCell, weddingDate: Date): boolean` — 15일 강조 판단 (Q2=A)
- `CalendarCell { day: number | null, inMonth: boolean }`

## 3. API 응답 타입(참조, Unit 1 계약)
- `GalleryItem { signedUrl: string, order: number }`
- `InstagramItem { mediaUrl: string, permalink: string, caption?: string }`
- `RsvpRequest { name, contact, side, attendance, adultCount?, childCount?, mealOption? }`
