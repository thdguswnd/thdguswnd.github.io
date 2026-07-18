# NFR Requirements — Unit 2: Frontend (`sm-fe`)

## 1. Performance
- NFR-FP1: 이미지 lazy loading + 반응형 크기(srcset), 히어로 이미지 우선 로드
- NFR-FP2: 목표 LCP < 2.5s (모바일 4G 기준), 번들 코드 스플리팅으로 초기 로드 최소화
- NFR-FP3: 갤러리/Instagram 등 하단 섹션은 진입 시 로드(지연)

## 2. Compatibility (호환성)
- NFR-FC1: iOS Safari 최신 2개 버전 + Android Chrome 최신 2개 버전(모던 브라우저)
- NFR-FC2: 모바일 반응형(다양한 폭), 레이아웃/비율 유지 (요구사항 NFR-C1/C2)

## 3. Accessibility (접근성)
- NFR-FA1: 시맨틱 HTML, 이미지 alt, 폼 라벨/연관, 충분한 색 대비(경량 수준)
- NFR-FA2: 키보드 포커스 이동 가능(폼/링크)
- 비고: WCAG 전면 준거는 목표 아님(개인 청첩장). 전면 검증은 별도 수동 테스트 필요

## 4. Reliability
- NFR-FR1: 동적 섹션(갤러리/Instagram/RSVP) API 실패 시 graceful degradation(섹션 축소/폴백/에러 메시지)
- NFR-FR2: 콘텐츠 JSON 누락 필드는 해당 요소 숨김

## 5. Security
- NFR-FS1: 시크릿/토큰을 프론트에 두지 않음(Instagram 토큰은 백엔드 관리)
- NFR-FS2: 외부 링크 `rel="noopener noreferrer"`, 입력값 표시 시 XSS 주의(React 기본 이스케이프)
- NFR-FS3: `/api` 호출은 동일 오리진(프록시/Ingress) 경유, CORS 허용 오리진 내

## 6. Maintainability / Testability
- NFR-FM1: PBT(Partial) — fast-check + Vitest (FP-01~04)
- NFR-FM2: 테스트/품질 — Vitest + React Testing Library + ESLint + Prettier
- NFR-FM3: 상호작용 요소에 `data-testid`(자동화 친화)

## 7. 검증
- 성능/호환성/접근성/신뢰성/보안/유지보수 범주에 NFR 정의
- 프론트 특성상 Resiliency 베이스라인 다수 항목은 백엔드/인프라에서 처리(프론트는 폴백 중심). 이 단계 blocking finding 없음
