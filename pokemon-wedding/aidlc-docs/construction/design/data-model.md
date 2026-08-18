# Design — 데이터 모델 (src/scripts/data.js)

전역 `window.GAME_DATA`. 순수 데이터/설정. 그림은 sprites.js(SVG 폴백) + assets/*.png.

## 인트로/질문
- `INTRO_LINES` : 오박사 대사 배열(마지막 "그럼 먼저 주인공들에 대해 알아보자꾸나!" 뒤 fade-out).
- `GENDER_QUESTION` : "너는 신랑인가? 그게 아니면 신부인가?"
- `CHOICES` : `[{key:'song',label:'송현중(신랑)'},{key:'jo',label:'조나영(신부)'}]`
- `OAK_IMG` : `{asset:'assets/oak.png', svg:'oak'}`

## CHARACTERS[key]
| 필드 | song | jo |
|---|---|---|
| name / gender | 송현중 / 신랑 | 조나영 / 신부 |
| opponentKey | jo | song |
| confirmText | LG CNS 인프라 아키텍트… | 크레아 스튜디오 PD… |
| opponentName / opponentGender | 조나영 / 신부 | 송현중 / 신랑 |
| battleIntro | 신부 조나영(이)가 승부를 걸어왔다! | 신랑 송현중(이)가 승부를 걸어왔다! |
| pokemon | charmander | bandwang |
| sendOutText | 나와라 파이리! | 나와라 밴드왕! |
| frontImg / backImg | song-front / song-back | jo-front / jo-back |
| oppImg | jo-front | song-front |

- frontImg: 확인 화면(정면). backImg: 배틀에서 내 트레이너 뒷모습(좌하). oppImg: 상대 트레이너 정면(우상).
- 각 이미지 슬롯 = `{asset, svg}` (asset 없거나 로드 실패 → svg 폴백).

## POKEMON[key]  (트레이너가 내보낸 뒤 필드에 등장)
| key | name | backImg(내 쪽·좌하) | frontImg(상대 쪽·우상) |
|---|---|---|---|
| charmander | 파이리 | charmander-back / svg:charmander | charmander-front / svg:charmander |
| bandwang | 밴드왕 | bandwang-back / svg:bandwang | bandwang-front / svg:bandwang |

- 내 포켓몬 = `POKEMON[CHARACTERS[myKey].pokemon]` (backImg 사용).
- 상대 포켓몬 = `POKEMON[CHARACTERS[myKey].opponentKey → pokemon]` (frontImg 사용).
- 매핑: 송현중=파이리, 조나영=밴드왕(거북왕). 상대는 상대편 포켓몬.

## BATTLE_PROMPT
배틀 명령 바 좌측 패널 문구 = `'무엇을 물어볼까?'` (원작 "What will X do?" 자리).

## MOVES (배틀 명령 바 우측 2x2, 질문형 Q&A)
- 각 질문: `ask(me)` = 선택한 사람이 물음(내 공격, 좌하 돌진), `answer(opp)` = 안 선택한 사람이 대답(반격, 우상 돌진, **배열=여러 줄**)
- 질문 1회당 상대 궁금증(HP) 감소: 100→67→33→0 (`round(100*(3-asked)/3)`), 사용한 질문은 disabled
- `flee`(도망친다)는 언제나 선택 가능 → 배틀 종료(엔딩)

| id | label | 내용 |
|---|---|---|
| newhome | 신혼집 어디야? | ask: {me}은/는 신혼집 어디 구했는지 물어봤다 / answer: {opp} 강서구 9호선 가양역 근처 |
| honeymoon | 신혼여행 어디가? | ask: {me}은/는 신혼여행 어디 가는지 / answer(2줄): 방송 끝나고 내년 3~4월 + 오키나와 |
| bandwang | 밴드왕이 뭐야? | ask: {me}은/는 밴드왕이 뭐냐고 / answer(4줄): SBS 한일 밴드 오디션 방송 소개 + 많관부! |
| flee | 도망친다 | 나(좌하) 왼쪽 퇴장 + "질문을 그만두고 도망쳤다!" → 엔딩 |

## 인트로/확인 대사
- `INTRO_LINES`: "안녕!" → 환영 → "그럼 먼저 주인공들에 대해 알아보자꾸나!" (오박사 자기소개 줄 없음)
- `CHARACTERS[k].confirmText`: 송현중=마곡 LG CNS 인프라 아키텍트 / 조나영=홍대 크레아 스튜디오 PD
- `CHARACTERS[k].postConfirm`: '네' 선택 후 오박사 반응(배열)
- `CHARACTERS[k].battleIntro`: "{상대}에게 궁금한 걸 물어보자!"

## ENDING_LINES (배틀 다음 화면)
["자세한 얘기는 만나서 들려드릴게요!", "결혼식날 뵙겠습니다. 감사합니다!"] → 재시작/종료 팝업

## CONFIG
`damagePerMove:25`, `typeSpeedMs:28`, `invitationUrl:'../'`

## josa(word, 받침O, 받침X)
이름 끝 음절 받침 유무로 은/는·을/를 자동 선택. GAME_DATA.josa 로도 노출(game.js 사용).

## 스프라이트(sprites.js) — 오리지널 SVG 폴백
`oak, magikarp, bandwang, trainerMaleFront/Back, trainerFemaleFront/Back` (+ bride/groom).
실제 게임 스프라이트는 미포함 — assets/*.png 로 사용자가 제공(assets/README.md).
