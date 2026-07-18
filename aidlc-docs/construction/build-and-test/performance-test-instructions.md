# Performance Test Instructions — 모바일 청첩장

## 목적
NFR 성능 목표 검증. 소규모(개인 청첩장) 특성상 경량 부하 확인 위주.

## 성능 목표 (NFR)
- 백엔드 일반 API(RSVP/Gallery) p95 < 500ms
- Instagram(캐시 미스) p95 < 1.5s, 캐시 히트 < 300ms
- 프론트 LCP < 2.5s (모바일 4G)

## 백엔드 부하 테스트 (예: k6)
```powershell
# 예시 스크립트로 RSVP/gallery 엔드포인트 부하
k6 run perf/rsvp-load.js
```
- 시나리오: 동시 사용자 수십 명 수준(예상 규모), 5분 지속
- 확인: p95 응답시간, 에러율, rate limit(429) 동작

## 프론트 성능 (Lighthouse)
```powershell
# 프로덕션 빌드 프리뷰 후 Lighthouse(Chrome) 모바일 측정
yarn build; yarn preview
```
- 확인: LCP, 번들 크기(코드 스플리팅으로 초기 로드 축소), 이미지 lazy load

## 참고 (현재 빌드 산출물)
- 프론트 초기 청크 index ~156KB(gzip ~51KB), Gallery/Instagram 은 별도 지연 청크로 분리됨(초기 로드 제외)

## 최적화 시
1. 병목 식별(응답시간/번들/이미지)
2. 캐시 TTL·쿼리·이미지 크기 조정
3. 재측정
