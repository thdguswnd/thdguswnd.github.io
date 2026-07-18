# BMS (Book Management System)

도서를 분류(Category)별로 등록·조회·관리하는 도서 관리 시스템입니다. Spring Boot 기반 백엔드 API 서버(`sm-be`)와 React 기반 프론트엔드(`sm-fe`)로 구성된 멀티 레포 워크스페이스입니다.

## 저장소

```
<공개 저장소 URL을 입력하세요>
```

## 워크스페이스 구조

```
.
├── input-docs/        # 요구사항정의서, 화면구성, 데이터정의, 기술스택 등 입력 문서
├── sm-be/             # 백엔드 (Spring Boot API 서버)
├── sm-fe/             # 프론트엔드 (React + TypeScript)
└── aidlc-docs/        # AI-DLC 산출물 (워크플로우 진행 시 생성)
```

> 현재 워크스페이스에는 `input-docs/`(입력 문서)와 `.kiro/`(워크스페이스 설정)만 존재하며, `sm-be`/`sm-fe`는 AI-DLC 워크플로우 진행에 따라 생성됩니다.

## 기술 스택

### Backend (`sm-be`)

| 구분 | 기술 |
|------|------|
| Language | Java 17 |
| Framework | Spring Boot 3.1 (spring-boot-starter-web, validation) |
| Persistence | MyBatis (Mapper XML) |
| Migration | Flyway |
| Database | H2 (embedded, file mode, PostgreSQL 호환 모드) |
| Build | Gradle |

### Frontend (`sm-fe`)

| 구분 | 기술 |
|------|------|
| Language | TypeScript |
| Framework | React 18 |
| Build | Vite |
| Grid | AG Grid |
| Routing | React Router |
| HTTP | axios |

## 데이터 모델

- **categories**: 도서 분류 (`id`, `name`(unique), `description`, `created_at`)
- **books**: 도서 (`id`, `title`, `author`, `isbn`, `category_id`(FK), `publish_year`, `description`, `created_at`)

도서는 반드시 하나의 분류에 속하며(다대일), 최초 기동 시 Flyway 마이그레이션으로 스키마와 샘플 데이터(분류·도서 일부)가 생성됩니다.

> 데이터 모델은 `input-docs/03_데이터정의.md`의 요구사항을 기준으로 한 것이며, 구체적인 컬럼 제약·삭제 정책·샘플 데이터 건수 등 세부 사항은 AI-DLC 워크플로우 진행 과정에서 확정됩니다.

## 실행 방법 (Windows / PowerShell)

### 사전 요구사항

- JDK 17 (`JAVA_HOME`이 17을 가리키는지 확인)
- Node.js 및 Yarn

### Backend 실행

```powershell
# sm-be 디렉터리에서 실행
.\gradlew.bat bootRun
```

기동 후 `http://localhost:7080`에서 동작합니다. H2 콘솔은 `http://localhost:7080/h2-console`에서 접근할 수 있습니다.

빌드/테스트:

```powershell
.\gradlew.bat clean build
.\gradlew.bat test
```

### Frontend 실행

```powershell
# sm-fe 디렉터리에서 실행
yarn install
yarn dev
```

개발 서버는 `http://localhost:5173`에서 실행되며, `/api` 요청은 백엔드(`http://localhost:7080`)로 프록시됩니다.

프로덕션 빌드:

```powershell
yarn build
```

## 개발 워크플로우

이 워크스페이스는 AI-DLC(AI Development Life Cycle) 워크플로우를 따릅니다. 요구사항·설계·구현 산출물은 `aidlc-docs/` 하위에 관리되며, 워크스페이스 설정은 `.kiro/`에서 관리됩니다.
