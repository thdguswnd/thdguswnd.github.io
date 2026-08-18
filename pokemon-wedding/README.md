# 포켓몬 결혼 배틀 🎮💍

옛날 **포켓몬스터 레드**풍 UI의 결혼 청첩장 미니게임.
오박사가 이름을 묻고 → 신랑/신부를 고르면 → "야생의 예비 배우자"와 배틀! 4개 기술로 승리하면 청첩장으로 이어진다.

> 기존 모바일 청첩장 `thdguswnd.github.io` 의 하위 페이지 `/pokemon` 으로 붙일 예정.
> **백엔드/DB 없음 · 완전 정적 · 터치 조작 · 가로 화면(3:2)**.

## 빠른 실행
```bash
npx --yes serve pokemon-wedding/src
```
또는 `src/index.html` 을 브라우저로 직접 열기(가로로 넓게). 세로면 "가로로 돌려주세요" 안내가 뜬다.

## 게임 흐름
1. **인트로** — 흰 화면, 오박사가 이름을 물음. 우측 상단 오버랩 선택지: `송현중` / `조나영`.
2. **확인** — 인물별 확인 질문 → `네`(진행) / `아니오`(선택 화면 복귀).
3. **배틀** — "야생의 예비 신부/신랑이 배틀을 신청했다!" → 아군(`잉어킹`/`밴드왕`) 소환.
4. **전투** — 기술 4칸: `신혼집` `신혼여행` `미정` `미정`. 하나씩 쓰면 상대 HP 25%↓ + 해당 기술 비활성.
5. **승리** — 4기술 모두 사용 → HP 0% → 승리 + "청첩장 보러가기".

## 구조
```
src/
├── index.html            # 화면 골격
├── styles/game.css       # 포켓몬 레드풍 UI (가로 3:2, 도트 폰트)
└── scripts/
    ├── data.js           # 캐릭터/대사/기술 데이터 (window.GAME_DATA)
    ├── sprites.js        # 오리지널 SVG 오마주 스프라이트 (window.GAME_SPRITES)
    └── game.js           # 상태 머신 + 렌더 + 터치 입력
aidlc-docs/               # AI-DLC 산출물(의도/요구/설계/계획)
```

## 커스터마이즈 포인트
- **'미정' 항목 교체**: `src/scripts/data.js` 의 `MOVES` 에서 `label`/`text` 수정, `tbd:false`.
- **대사/문구**: `data.js` 의 `CHARACTERS`.
- **연출 속도/데미지**: `data.js` 의 `CONFIG`(`typeSpeedMs`, `damagePerMove`).
- **그림 수정**: `src/scripts/sprites.js`(SVG 문자열).

## 배포(`/pokemon`)
`sm-fe/public/pokemon/` 로 `src/` 를 복사하면 Pages 빌드 시 `/pokemon` 경로로 배포된다.
자세한 절차는 [implementation-plan](aidlc-docs/construction/plans/implementation-plan.md) 참고.

## 저작권
실제 게임 스프라이트/에셋을 사용하지 않고, 도트풍을 흉내 낸 **오리지널 SVG 오마주 아트**만 사용합니다.
