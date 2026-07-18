# A안 — 완전 정적 + Google Sheets 전환 계획 & 경량 개인정보 안내

> 작성 배경: 예식 전 약 3~4개월간 무료로 운영하기 위해, 백엔드(`sm-be`)와 DB(PostgreSQL)를 제거하고
> **순수 정적 사이트 + Google Sheets(RSVP 저장)** 구성으로 전환한다.
> 본 문서의 개인정보 관련 서술은 법률 자문이 아니라 개인 프로젝트 수준의 실무적 판단이다.

## 1. 결정 요약 (A안)

| 항목 | 결정 |
|---|---|
| 아키텍처 | **완전 정적 SPA** (백엔드/DB 없음) |
| RSVP 저장 | **Google Sheets** (Google Apps Script 웹앱 엔드포인트) |
| 수집 항목 | 이름 + 참석여부 + 인원(대인/어린이) + 식사여부. **전화번호(연락처) 미수집** |
| 개인정보 동의 | 딱딱한 체크박스 제거 → **부드러운 파기 안내 문구**로 대체 |
| 갤러리 사진 | 정적 URL(로컬 번들 또는 Blob Storage: **Blob 레벨 익명 + 무작위 파일명**) |
| Instagram | **제거**(라이브 피드 불필요) |
| 백엔드/DB/백엔드 k8s | **배포하지 않음.** 코드는 디렉토리에 그대로 보존(삭제하지 않음) |
| 배포 | 정적 호스팅(Cloudflare Pages / GitHub Pages / Vercel / Firebase Hosting) → 사실상 상시 무료 |

## 2. 목표 아키텍처

```
[방문자 브라우저]
   │  (정적 자산: HTML/JS/CSS, invitation.json, 사진)
   ▼
[정적 호스팅 CDN]                      [Google Sheets]
   ─ 청첩장 SPA 렌더                       ▲
   ─ D-Day/캘린더: 브라우저 계산            │ POST(이름/참석/인원/식사)
   ─ 갤러리: 정적 이미지 URL                │
   ─ RSVP 제출 ───────────────────────────┘  (Apps Script 웹앱 URL)
```

- 서버 사이드 상시 실행 컴포넌트가 **없다** → 유휴 비용 0.
- 유일한 외부 쓰기 대상은 Google Sheets(Apps Script 웹앱).

## 3. 구성요소별 처리 방식

### 3.1 RSVP (유일한 실제 변경 지점)
- 현재: `RsvpSection` → `useRsvpSubmit` → `apiClient.submitRsvp` → `POST /api/rsvp`(백엔드)
- 전환: `apiClient.submitRsvp`가 **Google Apps Script 웹앱 URL**로 POST.
  - Apps Script는 CORS preflight를 피하기 위해 `Content-Type: text/plain`(또는 `mode: 'no-cors'`) 방식이 일반적. 구현 시 응답 처리(성공 메시지) 방식도 이에 맞춰 조정.
- 수집 항목에서 **연락처(전화번호) 제거**, **동의 체크박스 제거**.

### 3.2 갤러리 (코드 변경 불필요)
- `GallerySection`은 이미 `useContent()`로 `invitation.json`의 `gallery.images[].src`를 읽는 **정적 구조**.
- 사진 제공 방식(택1):
  - (a) **FE 정적 자산 번들**(`public/` 등)에 포함 → 별도 스토리지 불필요, 가장 단순.
  - (b) **Blob Storage**에 업로드 + `src`를 그 URL로. 이때 **Blob 레벨 익명 읽기 + 무작위(GUID) 파일명**으로 두면 목록 열람 불가 + URL 추측 불가 → 백엔드 없이 실용적 비공개.
- `apiClient.fetchGallery`는 미사용 죽은 코드 → 정리(선택).

### 3.3 Instagram (제거)
- App에 섹션이 렌더되지 않으며 `apiClient.fetchInstagramFeed`는 죽은 코드. 관련 타입/메서드 정리(선택).

### 3.4 D-Day / 캘린더 (변경 불필요)
- `dday.ts` / `calendar.ts`에서 브라우저 계산. 서버 불필요.

## 4. 필요한 코드 변경 목록

### Frontend (`sm-fe`)
1. `src/lib/apiClient.ts` — `submitRsvp` 엔드포인트를 Apps Script URL로 교체(절대경로, CORS 대응). `fetchGallery`/`fetchInstagramFeed` 제거(선택).
2. `src/sections/RsvpSection.tsx` — 연락처 입력 필드/state/payload 제거, 동의 체크박스 블록 제거 → 파기 안내 문구 추가, `canSubmit`/`guardMessage`에서 동의 조건 제거.
3. `src/hooks/useRsvpSubmit.ts` — 429 분기 정리(선택).
4. `src/lib/types.ts` — `RsvpRequest`에서 `contact`, `privacyConsent` 제거. `GalleryItem`/`InstagramItem` 정리(선택).
5. `invitation.json` — `gallery.images[].src`에 최종 사진 URL 반영.

### 배포/인프라
6. nginx `/api` 프록시 제거 → 순수 정적 서빙 + SPA fallback. 또는 정적 호스팅으로 이전.
7. `sm-be`(Spring Boot), PostgreSQL, 백엔드 k8s 매니페스트 → **배포 대상에서 제외.** 코드/문서는 디렉토리에 보존.

## 5. 배포 방식 (상시 무료 후보)
- **Cloudflare Pages / GitHub Pages / Vercel / Firebase Hosting** 중 택1.
- `yarn build` 산출물(정적 자산)을 업로드/연결. 커스텀 도메인·HTTPS 기본 제공.
- 결혼식 종료 후 언제든 내려도 무방(정적이라 상태 없음).

## 6. 경량 개인정보 안내 (체크박스 대체)

### 6.1 판단 근거 (요지)
- 순수 개인 경조사의 일회성 하객 명단은 **"업무를 목적으로" 하는 처리로 보기 어려워**(개인정보보호법 제2조 제5호 개인정보처리자 정의), 개인정보처리자에 해당하지 않을 가능성이 높다 → 동의 취득·처리방침 공개 등 의무 규정이 적용되지 않을 여지가 크다.
  - ※ "제58조(적용의 일부 제외)의 사적·가정 목적 예외"라는 근거는 부정확하다. 현행 제58조는 국가안전보장·언론·종교단체·정당의 고유목적만 열거하며, 사적·가정 목적 예외 조항은 없다(GDPR household exemption과의 혼동).
- 전화번호를 수집하지 않고 이름만 받으므로 민감도·리스크가 낮다.

### 6.2 안내 문구(권장)
> "입력하신 이름은 식사·참석 인원 확인 목적으로만 사용되며, **예식 종료 후 한 달 이내에 모두 삭제**됩니다."

- "안전하게"처럼 실제로 하지 않는 조치를 암시하는 표현은 배제하고, 실제 이행할 내용("모두 삭제")만 적는다.

### 6.3 이행해야 할 운영 사항
- 위 문구는 **지켜야 할 약속**이다. 예식 종료 후 실제로 **Google Sheets의 데이터를 삭제**한다(예: 예식 후 4주 이내).
- 데이터가 Google(국외 서버)에 저장된다는 점을 인지한다(개인 경조사 수준에서 실무상 문제 소지는 낮음).

## 7. 미배포로 남기는 것 (보존)
- `sm-be/`(백엔드), PostgreSQL 관련 설정, 백엔드/DB k8s 매니페스트, 관련 aidlc-docs 산출물은 **삭제하지 않고 디렉토리에 그대로 둔다.** 향후 확장(관리자 조회 화면 등) 시 재사용 가능.
