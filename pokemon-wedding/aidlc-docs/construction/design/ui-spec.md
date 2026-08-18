# Design — UI 스펙 (포켓몬 레드풍)

## 레이아웃 원칙
- **가로 3:2** 화면(`#screen`)을 뷰포트에 맞춰 중앙 레터박스.
  - `width: min(100vw, 150vh); height: min(66.667vw, 100vh);`
- 내부 요소 크기는 `%` 와 화면 높이 기준 `font-size: clamp(11px, 3.4vh, 26px)` 로 스케일.
- 세로 모드(`@media (orientation: portrait)`)면 `#rotate-hint` 표시, 게임 숨김.

## 색/테마 (CSS 변수, 클래식 포켓몬 오마주)
- 종이 배경 `--pk-paper #f8f8f8`, 잉크 `--pk-ink #202020`
- 대화창 테두리 진파랑 `--pk-border-dark #283593` + 연파랑 `--pk-border-light #7986cb`
- 선택 커서 레드 `--pk-select #e23b3b`
- HP 게이지: 초록/노랑/빨강(잔량 50%↓ 노랑, 25%↓ 빨강)

## 컴포넌트
### 하단 대화창 `.dialog-box`
- 하단 고정, 흰 바탕 + 이중 파랑 테두리(inset box-shadow), 우하단 깜빡이는 ▼.
- 클릭(터치)으로 진행. `white-space: pre-line` 로 `\n` 줄바꿈.

### 선택지 창 `.choice-box` (인트로)
- 대화창 **우측 위에 오버랩**(`right/bottom`, `z-index:5`).
- 각 항목 좌측에 다이아몬드형 레드 커서가 hover/active 시 팝업.

### 네/아니오 `.yesno-box`
- 확인 단계에서 우측 위 미니 창.

### 배틀 요소
- 상대 스프라이트 `.enemy-area`(우상단), 아군 `.ally-area`(좌하단).
- HP 박스 `.hp-box.enemy`(좌상단), `.hp-box.ally`(우하단, 항상 100%).
- 공격 애니메이션: `.lunge`(돌진), `.shake`(피격 흔들림).

### 기술 메뉴 `.move-menu`
- 하단 대화창 위치에 2x2 그리드로 오버레이(`z-index:6`).
- 사용한 기술은 `.disabled`(회색 + 취소선, 클릭 불가).

## 폰트
- `@import` 로 Galmuri(도트 한글) 로드, 폴백 monospace.
- 픽셀 느낌 위해 `image-rendering: pixelated`(스프라이트/화면).

## 입력 UX
- `touch-action: manipulation`, `user-select:none`, tap highlight 제거로 게임기 느낌.
- 모든 상호작용은 큰 터치 타깃(항목 전체가 클릭 영역).
