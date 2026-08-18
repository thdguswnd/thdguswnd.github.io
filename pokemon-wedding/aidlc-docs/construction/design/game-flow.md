# Design — 게임 흐름 (상태 머신 + 연출)

## 장면(DOM Scene)
`intro`(오박사~확인) / `battle`(전투). 세부 단계는 대화 메시지 큐 + 콜백 + 타이머로 표현.

## 상세 전이

### 1) 인트로(오박사)
```
startIntro()
  배경(민트+지평선+발판) + 오박사 이미지(assets/oak.png, 없으면 SVG) fade-in
  showMessages(INTRO_LINES)   // "안녕!" … "그럼 먼저 주인공들에 대해 알아보자꾸나!"
  → afterIntroLines(): 오박사 fade-out(배경 유지) → 620ms 후 askGender()
```

### 2) 신랑/신부 선택 + 확인
```
askGender(): showMessages(["너는 신랑인가? 그게 아니면 신부인가?"]) → renderGenderChoices()
  선택창(우상 오버랩): 송현중(신랑) / 조나영(신부)  ← 각 클릭
onChooseGender(key):
  선택 캐릭터 front 이미지 fade-in (song/jo-front) + showMessages([confirmText]) → renderYesNo()
  네  → startBattleTransition()
  아니오 → 캐릭터 fade-out → 안내 후 askGender()로 복귀
```

### 3) 배틀 전환 연출 (게임 원작 오마주)
```
startBattleTransition():
  대화창/선택창 숨김
  ① #fx-flash: 회색 화면 2회 깜빡임(grayBlink)              ~520ms
  ② #fx-black: box-shadow inset spread 0→80vmax, 바깥→안쪽 블랙아웃(closeIn) ~470ms
  ③ 검은 상태에서 setupBattleField() + setScene('battle')
     #scene-battle.opening: clip-path inset(50%→0), 가운데 가로선→위아래 오픈 ~520ms
     (다음 틱에 #fx-black 제거 → 오픈 노출)
  ④ 배경 .battle-bg: 파란 가로 스트릭이 우→좌 스크롤(streak) — 자리 잡으면 .settled 로 제거(정적)
  ⑤ slideInTrainers(): 상대(좌상→우상), 나(우하→좌하) translateX 슬라이드 ~620ms
```

### (개편) 확인 → 배틀 → Q&A → 도망 → 엔딩
- 확인 '네' 후 `postConfirm`(오박사 반응) 재생 → 배틀 전환
- 배틀은 **포켓몬 없이 트레이너끼리**: 인트로 "{상대}에게 궁금한 걸 물어보자!" → 양쪽 HP박스 + 명령 바
- 질문 선택 시: 내(좌하) 돌진+ask → 상대(우상) 돌진+answer(여러 줄) → HP 감소 → 명령 바 복귀
- `도망친다`: 나 왼쪽 퇴장 + "질문을 그만두고 도망쳤다!" → `toEnding()`
- `toEnding()`: 흰 화면 fade → 신랑(송현중)·신부(조나영) frontImg 가운데로 모임 → ENDING_LINES → `showEndMenu()`(재시작/종료 팝업)
  - 재시작=`location.reload()`, 종료=`window.close()`→실패 시 `invitationUrl`

### 배틀 상세 (포켓몬 없음, 트레이너 Q&A)
```
afterTrainersIn():
  el.battleBg.add('settled')   // 자리 잡으면 움직이는 스트릭 제거(정적 배경)
  showMessages([battleIntro])  // "{상대}에게 궁금한 걸 물어보자!"
  → 양쪽 HP박스 표시(상대=우상, 나=좌하) + openMoveMenu()

명령 바(스샷1): 좌 #cmd-prompt(프롬프트), 우 #move-menu 2x2 보기
  신혼집 어디야? / 신혼여행 어디가? / 밴드왕이 뭐야? / 도망친다

onUseMove(질문):
  내 캐릭터(좌하) lunge → 상대 체력 감소 → showMessages([ask])
  → 상대 캐릭터(우상) lunge → 내 체력 감소 → showMessages(answer[])
  → hpPct('song')<=0 ? songDown() : openMoveMenu()

체력(인물 기준): 송현중 1/3씩(3대=0), 조나영 1/6씩(6대=0)
  · 질문 시 상대 감소, 대답 시 나 감소  → 질문 3개면 송현중이 0
```

### 종료/엔딩
```
songDown():  // 송현중 체력 0 (질문 3개 완료)
  송현중을 표시 중인 영역이 아래로 사라짐(translateY 120% + opacity 0)
  showMessages(["준비된 질문이 끝났다!"]) → toEnding()

fleeSequence():  // 도망친다
  나(좌하) 왼쪽으로 사라짐 + showMessages(["질문을 그만두고 도망쳤다!"]) → toEnding()

toEnding():
  #fx-white fade-in → setScene('ending')
  → 신랑(송현중 front, 좌)·신부(조나영 front, 우)를 화면 밖→가운데로 모음
  → showMessages(ENDING_LINES)  // "나머지 이야기는…보고싶었습니다!" / "결혼식날 뵙겠습니다. 감사합니다!"
  → showEndMenu(): 대화창 오른쪽 위 가로 팝업 [다시 시작][끝내기]
     · 다시 시작 = location.reload(), 끝내기 = window.close()
```
- 엔딩 커플 이미지는 CHARACTERS.song/jo 의 frontImg 재사용(assets 있으면 사진, 없으면 SVG).

## 입력 모델
- 진행: **대화창 내부 클릭**(타이핑 중이면 즉시 완성, 아니면 다음).
- 선택: 신랑/신부·네/아니오·기술 항목 클릭.
- `state.busy`로 재생 중 중복 입력 방지.

## 조사(은/는·을/를) 처리
- `data.js`의 `josa(word, 받침O, 받침X)`로 이름 끝 받침을 판정해 자동 선택.

## 연출 타이머(대략)
flash 520 → black 470 → open 520 → slide 620 (ms). 공격 lunge 300/shake 450.
