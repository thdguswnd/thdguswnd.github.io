# AI-DLC State Tracking

## Project Information
- **Project Name**: 포켓몬 결혼 배틀 (Pokémon Wedding Battle) — 청첩장 서브 미니게임
- **Project Type**: Greenfield (정적 웹, 단일 페이지 미니게임)
- **Start Date**: 2026-08-10
- **Current Phase**: CONSTRUCTION
- **Current Stage**: v1 구현 완료 + 로컬 기능 검증 완료. 배포(/pokemon) 연결 대기.

## Scope Summary
- 옛날 포켓몬스터 레드풍 UI의 결혼 청첩장 미니게임.
- 흐름: 오박사 이름 묻기(선택: 송현중/조나영) → 확인 → 배틀 → 4기술로 승리.
- 조작은 전부 터치/클릭. DB/백엔드 없음(순수 정적).
- 최종 목표: 기존 청첩장 사이트 `thdguswnd.github.io` 의 하위 경로 `/pokemon`.

## Workspace State
- **Location**: `C:\AIDLC_WS_GREEN\pokemon-wedding\` (기존 프로젝트와 분리된 별도 디렉토리)
- **Docs**: `aidlc-docs/` 만
- **Application Code**: `src/` (index.html + styles/ + scripts/)
- **Programming Languages**: HTML/CSS/Vanilla JS (ES5 호환, 비-모듈 클래식 스크립트)
- **Build System**: 없음(빌드 불필요, 파일 그대로 서빙)

## Execution Plan Summary
- **Stages Executed**: Inception(Intent, Requirements) → Construction(Design, Implementation, Local Verification)
- **Stages Skipped**: NFR Design / Infra Design(정적 파일이라 불필요), Reverse Engineering(greenfield)

## Verification Log (v1, 2026-08-10)
- 부팅/로드: GAME_DATA·GAME_SPRITES 로드, 오박사 SVG 렌더 OK
- 인트로: 3개 대사 후 선택지(송현중/조나영) 노출 OK
- 확인: 각 인물별 확인 문구 정확 / '아니오' → 선택 화면 복귀 OK
- 배틀(송현중): 상대=예비 신부, 아군=잉어킹, 기술=신혼집/신혼여행/미정/미정 OK
- 배틀(조나영): 상대=예비 신랑, 아군=밴드왕(거북 대포 포함) OK
- 전투: HP 100→75→50→25→0 (기술당 25%), 사용 기술 비활성화, 4기술 후 승리 + CTA OK
- 폰트: Galmuri11(jsdelivr) 로드 OK, 오프라인 monospace 폴백

## Open Items / Next
- [ ] `/pokemon` 배포 연결: `src/` 를 `sm-fe/public/pokemon/` 로 복사(문서: construction/plans/implementation-plan.md)
- [ ] '미정' 2칸을 실제 항목으로 교체(예: 예물/스드메 등) — data.js MOVES 수정
- [ ] (선택) 사운드, 승리 연출, 뒷모습 아군 스프라이트 등 디테일 개선
