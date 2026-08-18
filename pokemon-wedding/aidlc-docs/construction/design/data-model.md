# Design — 데이터 모델 (src/scripts/data.js)

전역 `window.GAME_DATA` 로 노출. 순수 데이터/설정만 담고 로직은 game.js.

## CHOICES : 이름 선택지
```js
[{ key:'song', label:'송현중' }, { key:'jo', label:'조나영' }]
```

## CHARACTERS : 인물별 콘텐츠 (key로 참조)
| 필드 | 설명 | song | jo |
|---|---|---|---|
| name | 표시 이름 | 송현중 | 조나영 |
| confirmText | 오박사 확인 문구 | LG CNS 인프라 아키텍트… | 크레아 스튜디오 PD… |
| opponentName | 상대(HP박스 이름) | 예비 신부 | 예비 신랑 |
| battleIntro | 배틀 진입 문구 | 야생의 예비 신부가… | 야생의 예비 신랑이… |
| ourName | 아군 포켓몬 이름 | 잉어킹 | 밴드왕 |
| sendOutText | 소환 문구 | 나와라 잉어킹! | 나와라 밴드왕! |
| ourSprite | 아군 스프라이트 키 | magikarp | bandwang |
| opponentSprite | 상대 스프라이트 키 | bride | groom |

> 상대는 "나를 뺀 나머지"라는 컨셉(신랑↔신부).

## MOVES : 기술 4개 (2x2, 순서 = 표시 순서)
| id | label | tbd | 대사(text(us)) |
|---|---|---|---|
| newhome | 신혼집 | false | `{us}의 몸통박치기!` |
| honeymoon | 신혼여행 | false | `{us}의 물대포!` |
| tbd1 | 미정 | true | `{us}는 두근두근 몸을 웅크렸다! (아직 준비 중인 기술)` |
| tbd2 | 미정 | true | `{us}는 힘을 모으고 있다! (아직 준비 중인 기술)` |

- 각 기술 25% 데미지, 1회용(사용 후 비활성).
- **'미정' 교체 가이드**: `label` 과 `text` 만 바꾸고 `tbd:false` 로. id는 유지 권장.

## CONFIG
| 키 | 기본값 | 의미 |
|---|---|---|
| damagePerMove | 25 | 기술당 상대 HP 감소(%) |
| typeSpeedMs | 28 | 타자기 글자 지연(ms) |
| invitationUrl | '../' | 승리 CTA 링크(배포 시 사이트 루트) |

## 스프라이트 (src/scripts/sprites.js)
`window.GAME_SPRITES[key]` = SVG 문자열. 키: `oak, magikarp, bandwang, bride, groom`.
전부 오리지널 도형 기반 오마주 아트(저작권 에셋 미사용).
