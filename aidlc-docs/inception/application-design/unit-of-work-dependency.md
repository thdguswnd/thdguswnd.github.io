# Unit of Work Dependency — 모바일 청첩장

## 1. 의존성 매트릭스
| Unit | 의존 대상 | 유형 | 방향/비고 |
|---|---|---|---|
| Unit 2 (Frontend `sm-fe`) | Unit 1 (Backend `sm-be`) | 런타임 REST(HTTPS/JSON) | 프론트 → 백엔드 API 호출 |
| Unit 2 (Frontend) | 지도 앱(외부) | 클라이언트 deep link | 백엔드 무관 |
| Unit 1 (Backend) | PostgreSQL/H2(외부) | JDBC | RSVP 영속화 |
| Unit 1 (Backend) | Object Storage(외부, GCS/Azure) | `StorageClient` | 갤러리 서명 URL |
| Unit 1 (Backend) | Instagram Graph API(외부) | HTTP(+timeout) | 피드 프록시 |

- **Unit 간 결합**: Frontend → Backend 단방향(REST 계약). 역방향 의존 없음.
- **빌드 타임 의존**: 없음(별도 빌드). 계약(API 스펙)만 공유.

## 2. 구현/설계 순서 (Q3=A)
```
1) Unit 1 — Backend (sm-be)   : API 계약·데이터 모델 먼저 확정
2) Unit 2 — Frontend (sm-fe)  : 확정된 API에 연동
```
- **Critical Path**: Backend의 RSVP/Gallery/Instagram API 계약이 Frontend 연동을 언블록.
- **병렬화 여지**: Frontend 정적 섹션(Hero/Greeting/소개/타임라인/캘린더/오시는 길/Gift)은 API 무관이므로 Backend와 병행 개발 가능. API 연동 섹션(RSVP/Gallery/Instagram)만 Backend 계약에 의존.

## 3. 통합/테스트 체크포인트
- Backend 완료 시: API 단위/통합 테스트 (RSVP 저장, 서명 URL, Instagram 프록시 폴백)
- Frontend 연동 시: API 계약 기준 통합 테스트 (Vite dev 프록시 `/api` → 백엔드)
- 전체: E2E 스모크 (제출 → 저장 확인, 갤러리/피드 로드, 폴백 동작)

## 4. 텍스트 의존성 그래프
```
[Frontend sm-fe] --REST--> [Backend sm-be] --+--> [PostgreSQL/H2]
                                             +--> [Object Storage (GCS/Azure)]
                                             +--> [Instagram Graph API]
[Frontend sm-fe] --deep link--> [Map Apps]
```
