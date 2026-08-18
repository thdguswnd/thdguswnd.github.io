# 포켓몬 결혼 배틀 🎮💍

옛날 **포켓몬스터 레드**풍 UI의 결혼 청첩장 미니게임.
오박사가 이름을 묻고 → 신랑/신부를 고르면 → "야생의 예비 배우자"와 배틀! 4개 기술로 승리하면 청첩장으로 이어진다.

> 기존 모바일 청첩장 `thdguswnd.github.io` 의 하위 페이지 `/pokemon` 으로 붙일 예정.
> **백엔드/DB 없음 · 완전 정적 · 터치 조작 · 가로 화면(3:2)**.

## 빠른 실행
```bash
npx --yes serve pokemon-wedding/src
```
또는 `src/index.html` 을 브라우저로 직접 열기. 세로로 들어도 화면이 자동으로 가로로 회전해 보이므로(회전잠금 사용자 포함), 폰을 옆으로 들기만 하면 된다.

## 게임 흐름
1. **인트로** — 오박사가 맞이하고 신랑/신부를 물음. 선택지: `송현중(신랑)` / `조나영(신부)`.
2. **확인** — 인물별 확인 질문 → `네`(오박사 반응 후 진행) / `아니오`(선택 화면 복귀).
3. **배틀** — 포켓몬 없이 두 사람(트레이너)끼리. `{상대}에게 궁금한 걸 물어보자!`
4. **Q&A** — 보기: `신혼집 어디야?` `신혼여행 어디가?` `밴드왕이 뭐야?` `도망친다`.
   내가 물으면(공격) 상대가 답한다(반격). 송현중 체력은 1/3씩, 조나영은 1/6씩 감소.
5. **엔딩** — 질문 3개로 송현중 체력이 0이 되면 → 신랑·신부가 나란히 → 마무리 인사 → `다시 시작 / 끝내기`.

> 자세한 최신 스펙은 [WORKLOG.md](WORKLOG.md) 참고.

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
