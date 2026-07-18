# Business Rules — Unit 2: Frontend (`sm-fe`)

## 1. D-Day 규칙 (Q1=A)
| ID | 규칙 |
|---|---|
| BR-DDAY-01 | `daysUntil` = 예식일 - 오늘 (일 단위, 시간 절삭) |
| BR-DDAY-02 | days > 0 → `D-{days}` |
| BR-DDAY-03 | days == 0 → `D-DAY` |
| BR-DDAY-04 | days < 0 → `D+{abs(days)}` (지난 경우) |

## 2. 캘린더 규칙 (Q2=A)
| ID | 규칙 |
|---|---|
| BR-CAL-01 | 2026년 11월 그리드: 1일의 요일에 맞춰 앞쪽 빈칸, 주당 7칸 |
| BR-CAL-02 | 15일에 색상 배경 + 마커(하트) 강조 |
| BR-CAL-03 | 각 주(week)는 정확히 7개 셀, 월 밖 날짜는 `inMonth=false`/`day=null` |

## 3. 지도/오시는 길 규칙 (Q4=A)
| ID | 규칙 |
|---|---|
| BR-MAP-01 | 네이버지도/카카오내비/티맵 각각 deep link 우선, 실패/미설치 시 webUrl 폴백 |
| BR-MAP-02 | 위치는 정적 지도 이미지(`mapImage`) 기본 노출, 좌표(lat/lng) 있으면 링크 구성 |
| BR-MAP-03 | 주차 안내(`parking`) 텍스트 노출 |

## 4. 스크롤/렌더링 규칙 (Q5=A)
| ID | 규칙 |
|---|---|
| BR-SCROLL-01 | 각 섹션은 뷰포트 진입 시 1회 fade-in(IntersectionObserver), 재진입 시 재실행 안 함 |
| BR-RENDER-01 | 섹션 순서: 히어로→인사말→신랑→신부→타임라인→캘린더→오시는길→RSVP→갤러리→Instagram→마음전하실곳 |
| BR-CONTENT-01 | 모든 콘텐츠는 `invitation.json`에서 로드, 누락 필드는 해당 요소 숨김(graceful) |

## 5. RSVP 폼 규칙 (FR-09 UI)
| ID | 규칙 |
|---|---|
| BR-FORM-01 | 필수: 이름/연락처/신랑·신부측/참석여부. 참석 시 성인(1~2)·식사여부 필수, 소인(0~2) 선택 |
| BR-FORM-02 | 불참 선택 시 인원/식사 입력란 비활성/숨김 |
| BR-FORM-03 | 제출 실패(4xx/네트워크) 시 사용자 메시지, 429 시 잠시 후 재시도 안내 |
| BR-FORM-04 | 백엔드가 최종 검증 주체(프론트 검증은 UX 보조) |

## 6. PBT 대상 속성 (Partial, 프론트는 fast-check)
- FP-01: `formatDday` 결정성 — 동일 days 입력에 동일 문자열
- FP-02: 부호 규칙 — days>0 → "D-" 접두, days<0 → "D+" 접두, 0 → "D-DAY"
- FP-03: `buildMonthGrid` 불변식 — 각 주 7칸, inMonth 셀 수 == 해당 월 일수
- FP-04: API DTO 직렬화/역직렬화 라운드트립(요청 폼)

## 7. 접근성/자동화
- 상호작용 요소(버튼/입력/링크)에 `data-testid` 부여(자동화 친화), 안정적 명명
- 이미지 `alt`, 폼 라벨 등 기본 접근성 준수
