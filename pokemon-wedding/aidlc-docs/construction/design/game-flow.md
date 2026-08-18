# Design — 게임 흐름 (상태 머신)

## 상태(Scene) 개요
```
INTRO ──(이름 선택)──▶ CONFIRM ──(네)──▶ BATTLE_INTRO ──▶ BATTLE ──(HP 0%)──▶ VICTORY
  ▲                       │
  └────────(아니오)────────┘
```

구현상 `state.scene` 은 `intro | confirm | battle` 3개의 DOM 장면으로 단순화되고,
CONFIRM/BATTLE_INTRO/BATTLE/VICTORY 의 세부 단계는 **대화 메시지 큐 + 콜백**으로 표현된다.

## 상세 전이

### 1) INTRO
- `startIntro()`: 오박사 SVG 렌더 → `showMessages([환영, 소개, 이름질문], renderChoices)`
- `renderChoices()`: 선택지 창(`#choice-box`)에 송현중/조나영 표시(우측 상단 오버랩).

### 2) CONFIRM
- `onChooseName(key)`: 선택 저장(`state.charKey`) → `showMessages([확인문구], renderYesNo)`
- `renderYesNo()`: `네`→`goBattle()`, `아니오`→안내 후 `renderChoices()`(복귀).

### 3) BATTLE_INTRO (goBattle 내부 체인)
```
setScene('battle')
showMessages([battleIntro])            // "야생의 …가 배틀을 신청했다!"
  → 상대 HP박스 표시
  → showMessages([sendOutText])        // "나와라 …!"
     → 아군 스프라이트 등장(lunge) + 아군 HP박스 표시
     → showMessages(['어떻게 할까?']) → openMoveMenu()
```

### 4) BATTLE (턴 루프)
```
openMoveMenu()                          // 2x2, 사용한 기술 disabled
onUseMove(i):
  usedMoves[id]=true; 메뉴 숨김
  showMessages([기술 대사])
    → 아군 lunge(300ms) → 상대 shake + enemyHp -= 25% → updateEnemyHp()
    → afterMove()
afterMove():
  if enemyHp<=0 → victory()
  else showMessages(['효과가 굉장했다!']) → openMoveMenu()
```

### 5) VICTORY
```
상대 스프라이트 페이드아웃/낙하
showMessages([쓰러졌다, 승리, 축하]) → 대화창에 "청첩장 보러가기" CTA 삽입
```

## 입력 모델
- **모든 진행은 `#dialog-box` 클릭(터치)**: 타이핑 중이면 즉시 완성, 아니면 다음 메시지/콜백.
- 선택지/기술/네·아니오는 각 항목 클릭.
- `state.busy` 로 메시지 재생 중 중복 입력을 방지.

## 타이밍 상수(data.js CONFIG)
- `typeSpeedMs` = 28 (타자기 글자 지연)
- `damagePerMove` = 25 (기술당 HP 감소%)
- 연출 타이머: lunge 300~350ms, shake 400~450ms (game.js 하드코딩)
