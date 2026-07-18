---
inclusion: always
---

# 셸 실행 환경 규칙

이 워크스페이스는 **Windows + PowerShell** 환경을 기준으로 한다.
**단, 현재 OS(시스템 컨텍스트)가 Windows가 아니면(macOS 등) 해당 OS의 표준 셸 문법(bash/zsh)을 사용한다.**
아래 규칙은 **Windows(PowerShell) 기준 참고 명세**이며, Windows에서 명령을 생성/실행할 때 그대로 적용한다.

## 1. 명령 문법 매핑 (bash → PowerShell)

| 목적 | 금지 (bash) | 사용 (PowerShell) |
|------|------------|------------------|
| Gradle 실행 | `./gradlew <task>` | `.\gradlew.bat <task>` |
| 명령 연결 | `cmd1 && cmd2` | `cmd1 ; cmd2` |
| 환경변수 설정 | `export FOO=bar` | `$env:FOO = "bar"` |
| 파일 삭제 | `rm -rf dir` | `Remove-Item -Recurse -Force dir` |
| 디렉터리 생성 | `mkdir -p dir` | `New-Item -ItemType Directory -Path dir` |
| 파일 내용 보기 | `cat file` | `Get-Content file` |
| 출력 버리기 | `> /dev/null` | `> $null` |

> 가이드라인: `&&`는 Windows PowerShell 5.1에서 동작하지 않으므로 항상 `;`로 대체한다.
> (이 매핑은 Windows에서 적용한다. macOS 등에서는 왼쪽의 표준 bash/zsh 문법을 그대로 사용한다.)

## 2. 한글/UTF-8 출력 (세션 시작 시 1회 실행)

PowerShell 콘솔 기본 인코딩 때문에 Gradle/Spring/Flyway 로그의 한글이 깨진다.
새 터미널 세션을 시작하면 먼저 아래를 실행한다.

```powershell
chcp 65001 > $null
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:JAVA_TOOL_OPTIONS = "-Dfile.encoding=UTF-8"
```

## 3. Gradle 빌드/실행

- 빌드: `.\gradlew.bat clean build`
- 포맷 적용: `.\gradlew.bat spotlessApply`
- 테스트: `.\gradlew.bat test`
- `gradlew.bat`(확장자 포함)을 반드시 사용한다. `gradlew`(확장자 없음)는 bash 스크립트이므로 PowerShell에서 직접 실행하지 않는다.

### bootRun (장시간 실행 프로세스)

`bootRun`은 종료되지 않고 계속 실행되는 블로킹 프로세스다.
**포그라운드로 실행하면 이후 작업이 멈추므로** 백그라운드 프로세스로 기동하고 로그는 별도로 확인한다.

```powershell
.\gradlew.bat bootRun
```

실행 후 `http://localhost:7080` 에서 동작한다.

## 4. Spotless / Google Java Format + JDK 17 빌드 오류 대응

`build` 태스크는 `spotlessApply`에 의존한다(build.gradle). JDK 16+ 환경에서
google-java-format이 `com.sun.tools.javac` 내부 모듈에 접근하려다
`module jdk.compiler does not export ...` 오류로 빌드가 실패할 수 있다.

이 오류가 발생하면 프로젝트 루트의 `gradle.properties`에 아래를 추가한다.

```properties
org.gradle.jvmargs=--add-exports jdk.compiler/com.sun.tools.javac.api=ALL-UNNAMED \
  --add-exports jdk.compiler/com.sun.tools.javac.file=ALL-UNNAMED \
  --add-exports jdk.compiler/com.sun.tools.javac.parser=ALL-UNNAMED \
  --add-exports jdk.compiler/com.sun.tools.javac.tree=ALL-UNNAMED \
  --add-exports jdk.compiler/com.sun.tools.javac.util=ALL-UNNAMED
```

## 5. JDK 확인 / 지정

```powershell
java -version
# 특정 JDK를 강제할 때
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
```

`JAVA_HOME`이 17이 아니면 Spring Boot 3.1.x 빌드가 실패하므로 먼저 확인한다.

## 6. 데이터베이스 (H2 내장)

DB는 백엔드(`sm-be`)에 **내장된 H2**(파일 모드, PostgreSQL 호환 모드)를 사용한다.
별도 DB 서버나 Docker 컨테이너 기동이 필요 없으며, 스키마/샘플 데이터는 Flyway 마이그레이션으로 관리된다.

- 백엔드 기동(`.\gradlew.bat bootRun`) 시 H2가 함께 올라온다. 별도 설치/기동 불필요.
- H2 데이터 파일은 백엔드 설정 경로에 생성된다. DB를 초기화하려면 해당 데이터 파일을 삭제 후 재기동한다.

```powershell
# 예) H2 파일 데이터 초기화 (경로는 application.yml 설정에 맞게 조정)
Remove-Item -Recurse -Force .\sm-be\data\*.mv.db -ErrorAction SilentlyContinue
```

> H2는 PostgreSQL 호환 모드로 동작하므로 SQL 형식은 운영 DB(PostgreSQL)와 맞춘다.

## 7. 프론트엔드 (Yarn + Vite)

프론트엔드(`sm-fe`)는 **Yarn + Vite**(React 18 + TypeScript)로 빌드/실행한다.
Vite dev 프록시가 `/api` 요청을 백엔드(`http://localhost:7080`)로 전달한다.

```powershell
# 의존성 설치 (sm-fe 디렉터리에서)
yarn install

# 개발 서버 기동 (장시간 실행 프로세스 — 백그라운드로 기동)
yarn dev

# 프로덕션 빌드
yarn build
```

- `yarn dev`는 종료되지 않는 블로킹 프로세스이므로 백그라운드 프로세스로 기동하고 로그는 별도로 확인한다.
- Vite dev 서버는 기본 포트 `5173`에서 동작한다.

### 포트 점유 확인 (5173 / 7080)

```powershell
Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
Get-NetTCPConnection -LocalPort 7080 -ErrorAction SilentlyContinue
```

## 8. 실행 정책 (ExecutionPolicy)

스크립트 실행이 차단되면 현재 세션에 한해 해제한다(시스템 전역 변경 금지).

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

## 9. 경로 표기

- 경로 구분자는 `\`(역슬래시)를 사용한다. 예: `src\main\java`
- 상대 실행 파일은 `.\` 접두사를 붙인다. 예: `.\gradlew.bat`
