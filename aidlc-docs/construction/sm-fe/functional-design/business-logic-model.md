# Business Logic Model — Unit 2: Frontend (`sm-fe`)

## 1. 페이지 로드 흐름
```
1. InvitationPage 마운트
2. ContentProvider 가 invitation.json 로드/파싱(타입 검증)
3. 섹션들을 순서대로 렌더 (콘텐츠 주입)
4. ScrollReveal(IntersectionObserver)로 각 섹션 진입 시 1회 fade-in
5. 동적 섹션은 마운트 시 백엔드 API 호출:
   - GallerySection → GET /api/gallery
   - InstagramSection → GET /api/instagram/feed
```

## 2. 캘린더/D-Day 흐름
```
CalendarSection:
  - CalendarModel.buildMonthGrid(2026, 11) → 주 단위 그리드 렌더
  - 15일 셀 강조(색상+마커)
  - DDayCalculator.daysUntil(weddingDate, now) → formatDday → 카운터 표시
```

## 3. RSVP 제출 흐름 (FR-09 UI)
```
RsvpSection:
  1. 폼 입력(이름/연락처/측/참석여부[/성인·소인·식사])
  2. 참석/불참에 따라 인원·식사 입력 토글
  3. 클라이언트 1차 검증(UX) → ApiClient.submitRsvp(POST /api/rsvp)
  4. 성공: 접수 완료 메시지 / 실패: 오류 메시지(429 시 재시도 안내)
```

## 4. 갤러리 흐름 (FR-10 UI)
```
GallerySection:
  - ApiClient.fetchGallery() → GalleryItem[](서명 URL)
  - 그리드/캐러셀로 표시, 실패 시 섹션 축소(빈 목록)
```

## 5. Instagram 흐름 (FR-11 UI)
```
InstagramSection:
  - ApiClient.fetchInstagramFeed() → InstagramItem[]
  - 피드 썸네일 표시, 클릭 시 permalink 로 이동
  - 빈 목록(폴백) 시 프로필 링크 버튼만 노출
```

## 6. 오시는 길 흐름 (FR-08 UI)
```
DirectionsSection:
  - 정적 지도 이미지 + 주소/주차 안내
  - 네이버/카카오내비/티맵 버튼: deep link 시도 → 미설치 시 webUrl 폴백
```

## 7. 상태 관리
- 대부분 정적 콘텐츠(무상태). 동적 상태는 3곳: 갤러리 목록, Instagram 피드, RSVP 폼 상태
- 전역 상태 관리 라이브러리 불필요(로컬 컴포넌트 상태 + fetch). 필요 시 경량 훅으로 캡슐화
