-- 연락처를 선택 입력으로 변경(NOT NULL 해제) + 개인정보 동의 컬럼 추가.
-- PostgreSQL / H2(PostgreSQL 호환 모드) 공통 문법.
ALTER TABLE rsvp ALTER COLUMN contact DROP NOT NULL;
ALTER TABLE rsvp ADD COLUMN privacy_consent BOOLEAN;
