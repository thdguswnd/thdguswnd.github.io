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

## MOVES (배틀 명령 바 우측 2x2, 각 25% 데미지, 1회용, 질문형)
| id | label | 대사(us=내 포켓몬) |
|---|---|---|
| newhome | 신혼집 어디야? | `{us}은/는 "신혼집 어디야?" 라고 캐물었다!` |
| honeymoon | 신혼여행 언제가? | `{us}은/는 "신혼여행 언제가?" 라고 캐물었다!` |
| tbd1 | 미정 | `{us}은/는 아직 못 정한 걸 물었다... (준비 중인 질문)` |
| tbd2 | 미정 | `{us}은/는 아직 못 정한 걸 물었다... (준비 중인 질문)` |

## CONFIG
`damagePerMove:25`, `typeSpeedMs:28`, `invitationUrl:'../'`

## josa(word, 받침O, 받침X)
이름 끝 음절 받침 유무로 은/는·을/를 자동 선택. GAME_DATA.josa 로도 노출(game.js 사용).

## 스프라이트(sprites.js) — 오리지널 SVG 폴백
`oak, magikarp, bandwang, trainerMaleFront/Back, trainerFemaleFront/Back` (+ bride/groom).
실제 게임 스프라이트는 미포함 — assets/*.png 로 사용자가 제공(assets/README.md).
