# Plan — 구현 & 배포 계획

## 파일 구조
```
pokemon-wedding/
├── README.md
├── aidlc-docs/                      # AI-DLC 산출물(문서 전용)
│   ├── aidlc-state.md
│   ├── inception/{intent,requirements}.md
│   └── construction/
│       ├── design/{game-flow,ui-spec,data-model}.md
│       └── plans/implementation-plan.md
└── src/                             # 실제 구현(정적)
    ├── index.html
    ├── styles/game.css
    └── scripts/{data,sprites,game}.js
```

## 로컬 실행
- 가장 간단: `src/index.html` 을 브라우저로 직접 열기(클래식 스크립트라 `file://` 도 동작).
- 폰트/캐시까지 실제 환경으로 보려면 정적 서버:
```bash
npx --yes serve pokemon-wedding/src
```
- 데스크톱에선 창을 가로로 넓게(세로면 회전 안내가 뜬다).

## 배포 계획 — thdguswnd.github.io/pokemon
현재 GitHub Actions(`.github/workflows/deploy.yml`)는 **`sm-fe/dist` 만** Pages로 업로드한다.
Vite 는 `sm-fe/public/` 를 `dist/` 로 그대로 복사하므로, 게임을 `public/pokemon/` 에 두면
빌드 시 `dist/pokemon/` 로 배포되어 `/pokemon` 경로로 서빙된다.

### 연결 절차(추후 배포 시점에 1회)
1. `pokemon-wedding/src/` 전체를 `sm-fe/public/pokemon/` 로 복사.
   ```bash
   mkdir -p sm-fe/public/pokemon
   cp -r pokemon-wedding/src/* sm-fe/public/pokemon/
   ```
2. `data.js` 의 `CONFIG.invitationUrl` 확인: `/pokemon/` 기준 상대경로 `'../'` → 사이트 루트(청첩장). 그대로 OK.
3. 커밋 & main 푸시 → Actions가 빌드/배포 → `https://thdguswnd.github.io/pokemon/` 확인.
4. (선택) 청첩장 본문(sm-fe)에서 `/pokemon` 로 가는 이스터에그 링크/버튼 추가.

> 대안: `pokemon-wedding/src` 를 소스 오브 트루스로 두고, 배포 시 복사(위 1번)만 반복.
> 복사 동기화가 번거로우면 심볼릭 링크 또는 간단한 복사 스크립트로 자동화 가능.

## 향후 디벨롭 여지 (Backlog)
- '미정' 2칸 → 실제 항목 확정(예물/스드메/청첩장 등). `data.js MOVES` 만 수정.
- 사운드(공격/승리 효과음), 승리 팡파레.
- 아군 뒷모습 스프라이트(레드 정통 배틀 구도).
- 상대 등장/도입 연출 강화, 텍스트 스킵 버튼.
