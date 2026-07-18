# sm-be — 모바일 청첩장 백엔드

Spring Boot 3.1.x + MyBatis + Flyway 기반 REST API. RSVP 접수, 갤러리 서명 URL, Instagram 피드 프록시를 제공합니다.

## 요구 사항
- JDK 17 (JAVA_HOME 이 17 인지 확인)
- Gradle (wrapper 사용 권장)

> wrapper jar 이 없으면 최초 1회 `gradle wrapper --gradle-version 8.5` 로 생성하세요.

## 프로파일
- `local` (기본): H2 파일 DB(PostgreSQL 호환 모드), Instagram Mock, 로컬 스토리지 스텁
- `gcp`: Cloud SQL(PostgreSQL) + GCS + 실제 Instagram API
- `azure`: Azure Database for PostgreSQL + Blob + 실제 Instagram API

## 빌드 / 실행 (Windows PowerShell)
```powershell
# UTF-8 (세션 1회)
chcp 65001 > $null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 빌드 (spotlessApply 포함)
.\gradlew.bat clean build

# 테스트
.\gradlew.bat test

# 실행 (기본 local 프로파일, http://localhost:7080)
.\gradlew.bat bootRun
```

## API
| Method | Path | 설명 |
|---|---|---|
| POST | `/api/rsvp` | 참석 의사 접수 (이름·연락처·신랑/신부측·참석여부·성인/소인 인원·식사여부) |
| GET | `/api/gallery` | 갤러리 서명 URL 목록 |
| GET | `/api/instagram/feed` | Instagram 피드(최신 9개) |
| GET | `/actuator/health` | health (liveness/readiness) |

### RSVP 요청 예시
```json
{
  "name": "홍길동",
  "contact": "010-1234-5678",
  "side": "GROOM",
  "attendance": "ATTENDING",
  "adultCount": 2,
  "childCount": 0,
  "mealOption": "WILL_EAT"
}
```
- 불참(`NOT_ATTENDING`) 시 인원/식사 필드는 무시되어 저장되지 않습니다.
- 동일 연락처 재제출 시 최신값으로 갱신(upsert)됩니다.

## 보안 / 회복성
- 공개 RSVP 엔드포인트 rate limit (IP당 분당 5 / 시간당 30)
- 보안 헤더(CSP/HSTS 등), 오리진 제한 CORS
- Instagram 외부 호출 timeout + Circuit Breaker + 폴백(빈 목록)
- 시크릿(Instagram 토큰 등)은 환경 변수/Secret Manager 로 주입 (하드코딩 금지)

## 개인정보 보존
- RSVP 의 이름/연락처는 예식일 + 3개월 경과 시 자동 익명화 (일 1회 배치)

## 배포
- 컨테이너: `Dockerfile` (멀티스테이지, 비루트)
- K8s: `../k8s/base` + `../k8s/overlays/{gcp,azure}` (Kustomize)
- 초기 GCP(GKE Autopilot + Cloud SQL + GCS), Azure(AKS) 이식성은 오버레이 교체로 대응
