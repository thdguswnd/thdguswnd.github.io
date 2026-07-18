# Security Test Instructions — 모바일 청첩장

Security Baseline(적용) 검증. 개인 프로젝트 규모에 맞춘 경량 점검.

## 1. 의존성 취약점 스캔
```powershell
# 백엔드 (예: OWASP dependency-check 플러그인 또는 gradle 의존성 점검)
.\gradlew.bat dependencies
# 프론트
cd sm-fe; yarn npm audit   # 또는 yarn audit (v1)
```

## 2. 입력 검증 (SECURITY-05)
- RSVP: 필수/형식(휴대폰)/범위(성인 1~2, 소인 0~2) 위반 요청 → 400
- 인젝션 시도 문자열 → 파라미터화 쿼리로 무해화 확인

## 3. Rate Limiting (SECURITY-11)
- `POST /api/rsvp` 분당 5회 초과 → 429

## 4. 보안 헤더 (SECURITY-04)
```powershell
curl -I http://localhost:7080/api/gallery
```
- 확인: `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `Strict-Transport-Security`

## 5. 시크릿 관리 (SECURITY-12)
- Instagram 토큰이 코드/응답/로그에 노출되지 않는지 확인(환경변수/Secret Manager 주입)

## 6. 스토리지 비공개 (SECURITY-09)
- 갤러리 버킷 직접 접근 차단, 서명 URL 로만 접근되는지 확인(운영 GCS)

## 7. 개인정보 (NFR-S7)
- RSVP 이름/연락처 로그 미기록 확인, 예식+3개월 후 익명화 배치 동작 확인

## 참고
- 전면 침투 테스트/WCAG 준거는 범위 외(개인 프로젝트). 운영 전환 시 별도 점검 권장
