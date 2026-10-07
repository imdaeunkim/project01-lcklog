# ROADMAP

진행 규칙은 `CLAUDE.md`의 "작업 규칙"을 따른다. 한 세션에서는 한 단계만 진행한다.
목표: 1차 완성과 배포(S0~S3) ~10/10, 최종 완성(S4~S7) ~10/17.
- 일정 기준(10/7 조정): 거의 매일 반나절 이상 개발. 10/9는 개발 불가, 10/11은 저녁에만 가능할 수 있음. 10/17은 예비일.

## 현재 단계: S2

## 다음 세션 메모
- **S2 시작 시 사용자에게 알릴 것**: "발견한 문제"의 사진 업로드 의심 버그 2건(`S2에서 사용자와 함께 확인` 표시)을 브라우저에서 같이 재현해 보기로 함
- S0에서 `.claude/settings.json`에 `defaultMode: plan`을 넣었다. 새 세션이 플랜 모드로 시작하는지 확인하고 결과를 여기에 적는다.
- S1(10/7) 완료: lint 에러 0, CI에 lint 추가. 이제 build와 lint 모두 필수.
- S1 브라우저 확인(작성, 수정, 다른 일기 수정, 캘린더 필터, 승률·티어, + 버튼)은 사용자가 완료함(10/7).
- S1에서 모달을 열 때마다 새로 만들도록 바꿨다(App의 `isModalOpen &&` + `key`). 그래서 모달을 열면 `matchFormat`이 항상 BO3로 시작한다. S2의 BO5 복원은 `useState` 초기값에서 `editingDiary`의 저장값을 읽도록 하면 된다.
- 10/7 종료 시 일정 조정: S2를 10/8로 옮김. 10/8에 S2를 끝내고 시간이 남으면 같은 날 S3도 진행(S2 PR 머지 후 새 세션). S3가 남으면 10/10에 S4와 함께 진행.
- 티어 아이콘(`src/assets/tiers/`)은 144×144px로 축소해 두었다(표시 크기 36px). 새 이미지를 추가할 때도 표시 크기의 4배 이하로 줄여서 넣는다.

---

## S0. 작업 환경 세팅 ✅
- [x] 빌드 에러 수정 (미사용 React import 제거)
- [x] CLAUDE.md 작업 규칙, ROADMAP, Hook(guard-git), CI(빌드)
- [x] PR 머지 (PR #1)
- [x] (사용자) Vercel 연결 (PR #2에서 Vercel 체크 확인)
- [x] (사용자) 배포 URL이 실제로 열리는지 확인
- [x] (사용자, S0 이후 추가 작업) 공통 타입 `src/types/diary.ts`, 티어 이미지, 디자인 정리 (PR #2)
- [x] (사용자, 선택) GitHub에서 main 브랜치 보호 + CI 통과 필수 설정 (Ruleset `main-protection`, 9/28)

## S1. 타입 정리와 lint 0 (10/7) ✅ (범위 축소: 타입 파일은 PR #2에서 생성됨)
- [x] `src/types/diary.ts` 생성, App/DiaryFeed/SpectateCalendar/ProfileHeader에 적용 (사용자, PR #2)
- [x] `Diary.result`를 선택값(`result?: string`)에서 `'WIN' | 'LOSE'` 필수값으로 변경
- [x] 남은 `any` 7개 제거
- [x] 나머지 lint 에러 수정 → `npm run lint` 에러 0
- [x] CI에 `npm run lint` 추가, CLAUDE.md의 "lint는 S1 완료 후부터 필수" 문구 갱신
- [x] (추가, 사용자 결정) 새 일기 작성 "+" 버튼을 DiaryFeed에서 App으로 이동, `onOpenModal` prop 제거
- 완료 조건: build와 lint 모두 통과, 화면 동작 변화 없음
- 예상: 2~3시간

## S2. 버그와 하드코딩 정리 (10/8)
- [ ] BO5 일기를 수정하면 BO3로 표시되는 문제: `matchFormat`을 저장하고 복원
- [ ] App.tsx 샘플 데이터의 `pickedChampions`를 객체 형식으로 수정, 없는 챔피언("Kenia") 제거
- [ ] 캘린더 시작월 고정값(2026년 6월)을 오늘 날짜 기준으로 변경
- [ ] localStorage 저장 실패(용량 초과) 시 알림 표시
- 완료 조건: 수정 모드에서 BO5 밴픽이 유지됨, 용량 초과 시 앱이 멈추지 않음

## S3. 응원팀 기능 (10/8 S2 후 여유가 있으면, 아니면 10/10 오전) (사용자가 직접 작성 → Claude가 리뷰)
- [ ] Diary에 `myTeam`(응원팀) 필드 추가
- [ ] 작성 모달에 응원팀 선택 UI 추가
- [ ] ProfileHeader의 고정값 `mostTeam`을 실제 데이터로 계산
- 완료 조건: 응원팀 기준으로 승요 통계가 표시됨
- **1차 완성 체크포인트 (~10/10): 배포된 로컬 저장 버전**

## S4. Supabase 설계 (10/10)
- [ ] 테이블 설계 문서(`docs/db-design.md`): users, diaries, 컬럼과 타입
- [ ] RLS 정책: 자기 일기만 읽고 쓰기
- [ ] Supabase 프로젝트 생성과 환경변수 설정 (사용자 계정 필요)

## S5. 소셜 로그인 (10/11 ~ 10/12, 11일은 저녁만 가능할 수 있음)
- [ ] Supabase Auth로 Google 로그인(Kakao는 여유가 있으면)
- [ ] 로그인/로그아웃 UI, 비로그인 상태 처리

## S6. 데이터를 DB로 이전 (10/13 ~ 10/14)
- [ ] 일기 CRUD를 localStorage에서 Supabase로 교체
- [ ] 사진을 base64 대신 Supabase Storage에 업로드
- [ ] 로딩과 에러 상태 UI

## S7. LLM 승요 리포트 (10/15 ~ 10/16)
- [ ] Edge Function에서 LLM 호출 (API 키는 서버에만 둠)
- [ ] ProfileHeader에 리포트 카드 표시
- [ ] 실패하거나 지연될 때 기본 통계 카드로 대체하는 UI

## 예비일 (10/17)
- 밀린 일정 흡수. **최종 완성 체크포인트 (~10/17)**

## 이후 (10월 이후)
- 경기 스코어 API 연동 (공식 공개 API가 없어 비공식 API 조사가 필요)
- 앱 확장

## 발견한 문제 (범위 밖 메모)
- (S2에서 사용자와 함께 확인) DiaryFormModal 사진 업로드: 같은 사진을 지웠다가 다시 고르면 추가되지 않을 수 있음. `handleImageChange`가 처리 후 input 값을 비우지 않아 `onChange`가 다시 실행되지 않는 것으로 추정(미확인)
- (S2에서 사용자와 함께 확인) DiaryFormModal `handleDeleteImage`: `setUploadedImages(prev => ...)` 안에서 `setRepresentativeIndex`를 호출함. 개발 모드(StrictMode)는 updater 함수를 두 번 실행하므로, 대표 사진보다 앞의 사진을 지우면 대표 인덱스가 2칸 밀릴 수 있음(미확인, 배포 빌드는 영향 없을 것으로 추정)
- App.tsx의 `lck-root`, `font-heading` 클래스는 Tailwind 기본 클래스도 아니고 정의된 곳도 없어 효과가 없음 → 삭제하거나 폰트 설정 추가 필요
- 캘린더가 `diaries.find`로 날짜당 일기 1개만 표시함 → 같은 날 일기가 2개 이상이면 하나만 보임
- `react-calendar` 의존성을 쓰지 않음, `src/App.css`를 import하는 곳이 없음 → 정리 여부 결정 필요
- DiaryFormModal의 블루/레드 슬롯 코드가 거의 같은 코드로 중복됨 → 컴포넌트로 분리 후보
- 티어 아이콘이 LoL 공식 랭크 엠블럼으로 보임 → 배포/공개 전에 Riot의 팬 프로젝트 에셋 사용 조건(고지 문구 등) 확인 필요
