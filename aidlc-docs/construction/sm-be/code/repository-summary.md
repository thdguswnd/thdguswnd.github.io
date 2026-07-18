# Repository Summary — Unit 1: Backend (`sm-be`)

## 생성 파일 (Step 5~6)
- `rsvp/repository/RsvpMapper` (MyBatis @Mapper 인터페이스)
- `rsvp/repository/MyBatisRsvpRepository` (RsvpRepository 구현)
- `src/main/resources/mapper/RsvpMapper.xml` (SQL: findByContact/insert/updateByContact/findAll/anonymizeOlderThan)
- `src/main/resources/db/migration/V1__create_rsvp.sql` (테이블 + 연락처 UNIQUE + created_at 인덱스)
- 테스트: `RsvpRepositoryIntegrationTest` (H2 PostgreSQL 모드 + Flyway), `application-test.yml`

## 설계 반영
- 연락처 UNIQUE 제약으로 upsert 무결성 보장 (BR-RSVP-07)
- `anonymizeOlderThan`: 보존 기간(3개월) 경과 레코드의 PII 익명화 (NFR-S7) — 멱등(이미 익명 제외)
- PostgreSQL/H2 공통 SQL(IDENTITY, 표준 타입)로 이식성 유지
- MyBatis 기본 EnumTypeHandler 로 enum ↔ VARCHAR 매핑

## 비고
- 테스트는 생성만, 실행은 Build and Test 단계에서 수행
