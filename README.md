# 모바일 청첩장 (Mobile Wedding Invitation)

iOS·Android 모바일 브라우저에서 세로 스크롤 + fade-in 방식으로 동작하는 **단일 페이지 청첩장**입니다.
백엔드/DB 없이 동작하는 **완전 정적 사이트**이며, 참석 의사(RSVP)는 **Google Apps Script → Google Sheets**로 저장합니다.

**배포:** https://thdguswnd.github.io (GitHub Pages / GitHub Actions 자동 배포)

## 구성

```
.
├── sm-fe/                 # 프론트엔드 (React 18 + TypeScript + Vite) — 실제 배포 대상
│   ├── src/sections/      #   섹션 컴포넌트(히어로/인사말/타임라인/캘린더/오시는길/RSVP/갤러리/마음전하실곳)
│   ├── src/content/       #   invitation.json (사진·문구·일시·장소 등 콘텐츠)
│   └── public/local-assets/  #   사진 등 정적 자산(갤러리·타임라인·메인)
├── .github/workflows/     # GitHub Pages 배포 워크플로우
├── aidlc-docs/            # AI-DLC 산출물(설계 문서). 배포와 무관
└── sm-be/, k8s/           # (미배포) 초기 백엔드/쿠버네티스 산출물 — 보존용
```

## 기술 스택 (배포 대상)

| 구분 | 기술 |
|------|------|
| Language | TypeScript |
| Framework | React 18 |
| Build | Vite |
| RSVP 저장 | Google Apps Script Web App → Google Sheets |
| 갤러리 이미지 | 정적 번들 (`public/local-assets/`) |
| 호스팅 | GitHub Pages (GitHub Actions 배포) |

## 로컬 실행

```bash
cd sm-fe
yarn install
yarn dev        # http://localhost:5173
yarn build      # 프로덕션 빌드 (dist/)
yarn test       # 테스트
```

## 배포

`main` 브랜치에 push하면 [.github/workflows/deploy.yml](.github/workflows/deploy.yml)이 `sm-fe`를 빌드해
GitHub Pages로 자동 배포합니다. (저장소 Settings → Pages → Source = **GitHub Actions**)

## 콘텐츠 수정

- 문구·일시·장소·계좌 등: `sm-fe/src/content/invitation.json`
- 사진: `sm-fe/public/local-assets/` 내 파일 교체
- 수정 후 push하면 자동 재배포됩니다.

## 개인정보 처리

참석 의사 폼은 **이름만** 수집하며(전화번호 미수집), 수집한 이름은 식사·참석 인원 확인 목적으로만
사용되고 **예식 종료 후 한 달 이내 삭제**합니다. 상세: [aidlc-docs/static-google-sheets-migration.md](aidlc-docs/static-google-sheets-migration.md)
