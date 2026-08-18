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

## Verification Log (v2, 2026-08-18 — 원작 오마주 리워크)
- 인트로: 오박사 fade-in/out(배경 유지), INTRO_LINES 순차 OK
- 신랑/신부 선택: 송현중(신랑)/조나영(신부) 선택창 + 인물별 확인 대사 + 캐릭터 fade-in / '아니오' 복귀 OK
- 배틀 전환: 회색 2회 깜빡임 → 바깥→안쪽 블랙아웃 → 가운데 가로선 오픈 → 스트릭 스크롤 → 트레이너 좌상/우하 슬라이드 OK
- 배틀 인트로: "신부 조나영(이)가 승부를 걸어왔다!" / 상대·내 포켓몬 순차 등장, 조사 자동(은/는·을/를) OK
- 매핑: 송현중→내 잉어킹(좌하)/상대 밴드왕(우상), 조나영→내 밴드왕/상대 잉어킹 OK
- 전투: HP 100→75→50→25→0, 기술 대사 포켓몬명 정상, 사용 기술 비활성, 승리+CTA OK
- 이미지: assets/*.png 없으면 SVG 폴백(404→폴백) 정상. JS 에러 없음.
- 회귀: fade/전환을 setTimeout 기반으로(비표시 탭에서도 안정), 가로 3:2 + 세로 90° 회전 유지

## Verification Log (v3, 2026-08-18 — 전투 UI/보기/포켓몬 조정)
- 전투 하단을 스샷1처럼 2패널로: 좌 프롬프트 "무엇을 물어볼까?" + 우 2x2 보기
- 보기 = 신혼집 어디야? / 신혼여행 언제가? / 미정 / 미정 (오버플로 없음 확인)
- 송현중 포켓몬을 잉어킹 → 파이리(charmander)로 교체 (조나영=밴드왕 유지)
- 매핑 재확인: 송현중일 때 나=파이리(back)/상대=밴드왕(front)
- 전투: HP 100→75→50→25 감소 + 질문 대사 조사 정상("파이리는") 확인
- 이미지: charmander-front/back, bandwang-front/back 슬롯 + SVG 폴백

## Verification Log (v4, 2026-08-18 — 엔딩 연출)
- 승리 시 상대 포켓몬 아래로 사라짐 + "궁금증이 조금은 해소되었다!"(쓰러졌다 대체) 확인
- 트레이너 복귀("좋은 질문이었어!") → 양옆 퇴장 → #fx-white 화이트 페이드 확인
- 엔딩 씬: 신랑(송현중)·신부(조나영) frontImg 를 양쪽에서 가운데로 모아 나란히(translateX 0) 확인
- 마무리: "결혼식날 뵙겠습니다. 감사합니다!" → "송현중 ♥ 조나영" → CTA 확인
- 전체 자동 플레이 endState: enemyHp 0%, ending 씬, 커플 스프라이트 2개, CTA OK
- node --check 로 data/sprites/game.js 문법 무오류

## Open Items / Next
- [ ] `/pokemon` 배포 연결: `src/` 를 `sm-fe/public/pokemon/` 로 복사(문서: construction/plans/implementation-plan.md)
- [ ] '미정' 2칸을 실제 항목으로 교체(예: 예물/스드메 등) — data.js MOVES 수정
- [ ] (선택) 사운드, 승리 연출, 뒷모습 아군 스프라이트 등 디테일 개선
