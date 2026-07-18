# Unit Test Execution — 모바일 청첩장

## Unit 1 — Backend (`sm-be`)
```powershell
.\gradlew.bat test
```
- 대상: `RsvpServiceTest`, `ContactNormalizerTest`, `RsvpRepositoryIntegrationTest`(H2+Flyway), 필터/스케줄러 테스트
- PBT(jqwik): `RsvpPropertyTest`(P-01,P-04), `ContactNormalizerTest`(P-02), `RsvpSerializationPropertyTest`(P-03), upsert 불변식(P-05)
- 리포트: `build/reports/tests/test/index.html`
- ⚠️ 현재 환경 gradle 부재로 미실행. 로컬에서 실행 필요

## Unit 2 — Frontend (`sm-fe`) — ✅ 실행 완료
```powershell
yarn test
```
- **결과: 6개 테스트 파일, 11개 테스트 전부 통과**
- PBT(fast-check): dday(FP-01/02), calendar(FP-03), rsvp-serialization(FP-04)
- RTL: CalendarSection(15일 강조/D-Day), RsvpSection(참석/불참 토글), InstagramSection(폴백)
- 참고: jsdom 에 IntersectionObserver 가 없어 `src/test/setup.ts` 에 테스트용 스텁 추가(수정 완료)

## 실패 시 대응
1. 리포트/콘솔에서 실패 케이스 확인
2. PBT 실패 시 반례(counterexample)/시드 확인하여 재현
3. 코드 수정 후 재실행
