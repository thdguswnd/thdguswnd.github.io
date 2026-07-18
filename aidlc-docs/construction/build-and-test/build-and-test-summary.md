# Build and Test Summary — 모바일 청첩장

## Build Status
| Unit | 빌드 도구 | 상태 | 비고 |
|---|---|---|---|
| sm-be (Backend) | Gradle 8.5 + JDK 17 | ✅ 성공 | wrapper 준비 후 `clean build` BUILD SUCCESSFUL, bootJar 생성(약 33MB) |
| sm-fe (Frontend) | Yarn + Vite | ✅ 성공 | `yarn build` 성공, tsc 통과, 코드 스플리팅 확인 |

> 업데이트: 초기 요약 시점에는 gradle 부재로 백엔드 미실행이었으나, 이후 Gradle wrapper(gradlew.bat + wrapper jar 8.5)를 준비하여 백엔드 빌드/테스트를 실제 실행해 통과함.

- 확인된 도구: JDK 17(Corretto 17.0.19), Node v22.16.0, Yarn 1.22.22 / 미설치: gradle CLI

## Test Execution Summary

### Unit Tests
| Unit | 상태 | 결과 |
|---|---|---|
| sm-be | ✅ 통과 | **27개 테스트 전부 통과** (jqwik PBT P-01~05 + 예시/통합/필터/스케줄러). RsvpControllerTest 를 @WebMvcTest→@SpringBootTest+@AutoConfigureMockMvc 로 수정하여 슬라이스 빈 누락 해결 |
| sm-fe | ✅ 통과 | **6개 파일 / 11개 테스트 전부 통과** (PBT FP-01~04 + RTL 포함) |

## 런타임 검증 (로컬 실제 기동)
- Backend `bootRun`: 포트 7080 기동, Flyway V1 마이그레이션 적용, H2 파일 DB 생성
  - `GET /actuator/health` → UP
  - `GET /api/gallery` → 서명 URL 3건
  - `GET /api/instagram/feed` → mock 9건
  - `POST /api/rsvp`(정상) → success:true / (잘못된 연락처) → HTTP 400
- Frontend `yarn dev`: 포트 5173 기동, index 서빙(HTTP 200), Vite 프록시 `/api/gallery` → 백엔드 정상 전달(HTTP 200)

### Integration Tests
- 지시서 작성 완료(수동 시나리오). 백엔드 기동 필요로 이 환경 자동 실행 안 함.

### Performance Tests
- 지시서 작성 완료. 프론트 초기 청크 ~156KB(gzip ~51KB), 무거운 섹션 지연 청크 분리 확인.

### Security Tests
- 지시서 작성 완료(입력검증/rate limit/보안헤더/시크릿/스토리지/PII).

## 이 환경에서 수행한 검증
- ✅ 프론트: `yarn install` → `yarn test`(11/11 통과) → `yarn build`(성공)
- ✅ 프론트 테스트 실패 1건(IntersectionObserver 미정의) 발견 → `src/test/setup.ts` 스텁 추가로 수정 → 전체 통과
- ✅ 백엔드: IDE 진단(컴파일 에러 없음, 429 상수 오류 1건 수정 완료)
- ⚠️ 백엔드 Gradle 빌드/테스트: 이 환경 gradle 부재로 미실행 → 로컬 실행 필요

## Overall Status
- **Frontend**: 빌드/테스트/런타임 성공
- **Backend**: 빌드/테스트/런타임 성공
- **통합**: 프론트 dev 프록시 → 백엔드 API 정상 연동 확인
- **Ready for Operations**: 예 (로컬 검증 완료). 클라우드 배포는 GCP 리소스 프로비저닝 + 실 콘텐츠/시크릿 필요

## Next Steps
- 실 콘텐츠 입력(`sm-fe/src/content/invitation.json`)
- 외부 연동 실값 배선(Instagram 토큰, GCS 버킷/서명 URL SDK)
- 컨테이너 이미지 빌드 + GKE(overlays/gcp) 배포
