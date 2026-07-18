# NFR Design Patterns — Unit 2: Frontend (`sm-fe`)

## 1. Resilience(폴백) 패턴
| 패턴 | 적용 | 근거 |
|---|---|---|
| 섹션별 폴백 | 갤러리/Instagram/RSVP 실패 시 해당 섹션만 축소/대체 메시지 | Q1=A, NFR-FR1 |
| ErrorBoundary | 최상위에서 예기치 못한 렌더 오류 격리(전체 백지화 방지) | Q1=A |
| Instagram 폴백 | 피드 빈 목록 시 프로필 링크 버튼만 노출 | BR-IG/FR-11 |
| 타임아웃/에러 정규화 | `ApiClient`에서 fetch 타임아웃 + 에러 표준화 | NFR-FR1 |

## 2. Performance 패턴
| 패턴 | 적용 | 근거 |
|---|---|---|
| 코드 스플리팅 | 하단 무거운 섹션(갤러리/Instagram) `React.lazy` 지연 로드, 상단 즉시 | Q3=A |
| 이미지 최적화 | lazy loading(loading="lazy") + srcset 반응형 + 히어로 우선 | NFR-FP1/2 |
| 스켈레톤 로딩 | 갤러리/Instagram 로딩 중 placeholder, RSVP 버튼 로딩 상태 | Q2=A |

## 3. UX/접근성 패턴
| 패턴 | 적용 |
|---|---|
| 1회 fade-in | IntersectionObserver 기반 `ScrollReveal` |
| 접근성 | 시맨틱 태그, alt, 폼 라벨, 포커스, 색 대비 |
| 자동화 친화 | 상호작용 요소 `data-testid` |

## 4. 보안 패턴
- 외부 링크 `rel="noopener noreferrer"`, target="_blank"
- 시크릿 미보관(백엔드 위임), `/api` 동일 오리진 호출
- React 기본 이스케이프로 XSS 방어(위험한 innerHTML 미사용)

## 5. 검증
- 폴백/성능/UX/보안 패턴 매핑 완료. 이 단계 blocking finding 없음
