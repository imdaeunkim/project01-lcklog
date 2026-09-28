# ROADMAP

진행 규칙은 `CLAUDE.md`의 "작업 규칙"을 따른다. 한 세션에서는 한 단계만 진행한다.
목표: 10월 초에 웹 1차 완성과 배포(S0~S3), 이후 S4~S7.

## 현재 단계: S1 (S0 PR 머지 후)

## 다음 세션 메모
- S0에서 `.claude/settings.json`에 `defaultMode: plan`을 넣었다. 새 세션이 플랜 모드로 시작하는지 확인하고 결과를 여기에 적는다.
- S1 lint 에러 현황(S0 시점): 15개 에러, 1개 경고. `any` 사용, effect 안에서 setState 호출, ProfileHeader의 사용하지 않는 대입.
- 사용자가 `src/types/diary.ts`(`Diary` 인터페이스)를 먼저 만들고 App, DiaryFeed, SpectateCalendar, ProfileHeader에 적용했다. S1은 새 파일을 만들지 말고 이 파일을 확장한다. 남은 작업: `result?`가 선택값인 문제, App의 `handleOpenEditModal`/`handleSaveDiary`와 DiaryFormModal Props에 남은 `any`.
- 티어 아이콘(`src/assets/tiers/`)은 144×144px로 축소해 두었다(표시 크기 36px). 새 이미지를 추가할 때도 표시 크기의 4배 이하로 줄여서 넣는다.

---

## S0. 작업 환경 세팅 ✅
- [x] 빌드 에러 수정 (미사용 React import 제거)
- [x] CLAUDE.md 작업 규칙, ROADMAP, Hook(guard-git), CI(빌드)
- [ ] (사용자) PR 머지 → Vercel에 연결해서 배포 URL 확보
- [ ] (사용자, 선택) GitHub에서 main 브랜치 보호 + CI 통과 필수 설정

## S1. 타입 정리와 lint 0
- [ ] `src/types.ts` 생성: `Diary`, `PickedChampions`, `MatchResult` 등
- [ ] 모든 컴포넌트의 `any`와 중복된 Props 타입을 `types.ts`로 교체
- [ ] 나머지 lint 에러 수정 → `npm run lint` 에러 0
- [ ] CI에 `npm run lint` 추가, CLAUDE.md의 "lint는 S1 이후 필수" 문구 갱신
- 완료 조건: build와 lint 모두 통과, 화면 동작 변화 없음

## S2. 버그와 하드코딩 정리
- [ ] BO5 일기를 수정하면 BO3로 표시되는 문제: `matchFormat`을 저장하고 복원
- [ ] App.tsx 샘플 데이터의 `pickedChampions`를 객체 형식으로 수정, 없는 챔피언("Kenia") 제거
- [ ] 캘린더 시작월 고정값(2026년 6월)을 오늘 날짜 기준으로 변경
- [ ] localStorage 저장 실패(용량 초과) 시 알림 표시
- 완료 조건: 수정 모드에서 BO5 밴픽이 유지됨, 용량 초과 시 앱이 멈추지 않음

## S3. 응원팀 기능 (사용자가 직접 작성 → Claude가 리뷰)
- [ ] Diary에 `myTeam`(응원팀) 필드 추가
- [ ] 작성 모달에 응원팀 선택 UI 추가
- [ ] ProfileHeader의 고정값 `mostTeam`을 실제 데이터로 계산
- 완료 조건: 응원팀 기준으로 승요 통계가 표시됨
- **1차 완성 체크포인트 (~10/3): 배포된 로컬 저장 버전**

## S4. Supabase 설계
- [ ] 테이블 설계 문서(`docs/db-design.md`): users, diaries, 컬럼과 타입
- [ ] RLS 정책: 자기 일기만 읽고 쓰기
- [ ] Supabase 프로젝트 생성과 환경변수 설정 (사용자 계정 필요)

## S5. 소셜 로그인
- [ ] Supabase Auth로 Google 로그인(Kakao는 여유가 있으면)
- [ ] 로그인/로그아웃 UI, 비로그인 상태 처리

## S6. 데이터를 DB로 이전
- [ ] 일기 CRUD를 localStorage에서 Supabase로 교체
- [ ] 사진을 base64 대신 Supabase Storage에 업로드
- [ ] 로딩과 에러 상태 UI

## S7. LLM 승요 리포트
- [ ] Edge Function에서 LLM 호출 (API 키는 서버에만 둠)
- [ ] ProfileHeader에 리포트 카드 표시
- [ ] 실패하거나 지연될 때 기본 통계 카드로 대체하는 UI

## 이후 (10월 이후)
- 경기 스코어 API 연동 (공식 공개 API가 없어 비공식 API 조사가 필요)
- 앱 확장

## 발견한 문제 (범위 밖 메모)
- `react-calendar` 의존성을 쓰지 않음, `src/App.css`를 import하는 곳이 없음 → 정리 여부 결정 필요
- DiaryFormModal의 블루/레드 슬롯 코드가 거의 같은 코드로 중복됨 → 컴포넌트로 분리 후보
