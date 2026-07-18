# Build Instructions — 모바일 청첩장

## 공통 사전 요구
- OS: Windows + PowerShell (본 워크스페이스 기준)
- 인코딩(세션 1회): `chcp 65001 > $null; [Console]::OutputEncoding = [System.Text.Encoding]::UTF8`

---

## Unit 1 — Backend (`sm-be`)

### Prerequisites
- **JDK 17** (확인됨: Corretto 17.0.19). `java -version` 로 확인
- **Gradle**: 프로젝트에 `gradlew.bat` 스크립트는 있으나 **wrapper jar 이 아직 없음**. 아래 중 하나로 준비:
  - 시스템에 Gradle 설치 후: `gradle wrapper --gradle-version 8.5` (wrapper jar 생성)
  - 또는 시스템 Gradle 로 직접 빌드

### Build
```powershell
# sm-be 디렉터리에서
# (wrapper 준비된 경우)
.\gradlew.bat clean build

# (시스템 gradle 사용 시)
gradle clean build
```
- `build` 는 `spotlessApply` 에 의존(코드 포맷). JDK 17 add-exports 는 `gradle.properties` 에 이미 설정됨.

### 산출물
- `build/libs/sm-be-0.0.1-SNAPSHOT.jar` (bootJar)

### 실행 (로컬, H2)
```powershell
.\gradlew.bat bootRun   # http://localhost:7080, 프로파일 local
```

### 컨테이너 빌드
```powershell
docker build -t sm-be:local .\sm-be
```

### 검증 상태(현재 환경)
- IDE 진단: 컴파일 에러 없음(경고만: Bucket4j deprecation, null-safety 힌트)
- ⚠️ 전체 Gradle 빌드/테스트는 이 환경에 gradle CLI/wrapper jar 부재로 **미실행**. 위 절차로 로컬 실행 필요

---

## Unit 2 — Frontend (`sm-fe`)

### Prerequisites
- **Node.js 20+** (확인됨: v22.16.0), **Yarn** (확인됨: 1.22.22)

### Build
```powershell
# sm-fe 디렉터리에서
yarn install
yarn build   # tsc 타입체크 + vite 프로덕션 빌드
```

### 산출물
- `dist/` (index.html + assets, 코드 스플리팅된 청크 포함)

### 개발 서버
```powershell
yarn dev   # http://localhost:5173, /api → localhost:7080 프록시
```

### 컨테이너 빌드
```powershell
docker build -t sm-fe:local .\sm-fe
```

### 검증 상태(현재 환경) — ✅ 실행 완료
- `yarn install` 성공
- `yarn build` 성공 (tsc 통과, vite 빌드 성공, Gallery/Instagram 청크 분리 확인)

## Troubleshooting
- **google-java-format 모듈 접근 오류(JDK16+)**: `gradle.properties` 의 add-exports 설정 확인(이미 포함)
- **Vite 프록시 404**: 백엔드(7080) 미기동 시 발생. 백엔드 먼저 기동
