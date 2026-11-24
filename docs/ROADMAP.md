# ROADMAP

진행 규칙은 `CLAUDE.md`의 "작업 규칙"을 따른다. 한 세션에서는 한 단계만 진행한다.
목표: 1차 완성과 배포(S0~S3) ~10/17, 최종 완성(S4~S7) ~10/23.
- 일정 기준(10/17 조정): S2가 10/16에 끝나 일정을 다시 잡음. 10/17에 S3·S4, 10/18은 휴식, 10/23은 예비일.
- 일정 기준(10/19 조정): S4가 10/19로 밀려 S5~S7을 하루씩 미룸. 예비일(10/23)을 S7에 씀. 최종 완성 목표 10/23은 그대로.
- 일정 기준(11/16 조정): S5를 10/20에 시작해 11/16에 끝냄. S5 범위가 커져 단계를 하나 늘림(S6 프로필 수정, S7 DB 이전, S8 LLM 리포트). 최종 완성(S8)은 11/20.
- 일정 기준(11/24 조정): S6을 11/18에 시작해 11/24에 끝냄(중간에 Supabase 일시정지 복구). S7은 11/25~11/26, S8은 11/27.

## 현재 단계: S7

## 다음 세션 메모
- S6(11/18 시작, 11/24 완료). 프로필 수정.
  - `UserMenu` → "프로필 수정" → `ProfileEditModal`. 닉네임#태그와 팀(팀 없음 포함) 변경. 저장은 `updateProfile`(`src/lib/profile.ts`)이 바뀐 항목만 보냄. 성공하면 App이 프로필 상태를 교체 → 승률 등이 바로 다시 계산됨.
  - 에러 문구: `23505` → 중복 안내, 90일 제한은 code `P0001` + message `nickname_change_too_soon`(SQL Editor에서 확인)으로 옴 → message에 이 글자가 있는지로 판단.
  - 제한 기간 중에는 모달이 닉네임·태그 칸을 잠그고 `getNicknameUnlockDate`로 다음 변경 가능 날짜를 보여줌.
  - 닉네임 최대 16자 → **12자**(사용자 결정). DB 제약 `profiles_nickname_check` 변경 SQL 실행 완료(`docs/db-design.md` 10번). 헤더는 닉네임 한 줄 고정, 넘치면 `…`.
  - `TeamSelectModal.tsx` 삭제(사용자 승인).
  - **주의:** 트리거 때문에 SQL Editor에서도 `nickname_changed_at`을 직접 지울 수 없음. 시험하다 잠기면 트리거를 잠깐 끄는 SQL 사용(`docs/db-design.md` 10-4).
  - Supabase가 또 일시정지됨(11/16 복구 → 11/24 다시 정지, 약 1주 미사용). 세션 시작 때 접속부터 확인.
  - **미확인:** 앱 화면에서 중복(`23505`) 안내 문구(두 번째 계정 필요). 잠금 해제 SQL 실행 후 트리거가 다시 켜졌는지(`tgenabled = 'O'`)는 결과를 따로 보지 않음.
- S5(10/20 시작, 11/16 완료). 로그인 필수, 게스트 없음(사용자 결정).
  - 흐름: 로그인 확인 → `LoginScreen`(Google) → `loadOrCreateProfile`(`src/lib/profile.ts`) → 메인. 처음 로그인하면 무작위 `닉네임#태그` + 팀 없음으로 `profiles` 행을 앱이 insert(트리거 아님).
  - 프로필 타입은 `src/types/profile.ts`. `myTeam`은 `string | null`이고 null이면 "팀 없음" → 승률·티어·캘린더 통계·"내 팀 경기만" 필터를 숨김. `getMyResult`/`getWinStats`가 null을 처리함.
  - DB: `profiles`에 `nickname`, `tag`, `nickname_changed_at` 추가(SQL 실행 완료, `docs/db-design.md` 9번). `닉네임#태그` 중복 금지(대소문자 무시), 닉네임 변경은 90일에 한 번(첫 변경은 자유). 둘 다 DB가 막음. 사용자가 SQL Editor로 90일 제한 확인함.
  - **S6에서 할 것:** 프로필 수정 모달(닉네임#태그, 팀 변경). 중복이면 에러 코드 `23505`, 90일 제한이면 `nickname_change_too_soon` 에러가 옴 → 안내 문구로 바꿔 보여줄 것. 남은 날짜는 `nicknameChangedAt`으로 계산해 미리 안내. 팀 고르는 부분은 `TeamSelectModal.tsx`(지금 안 쓰임)를 재사용하거나 정리.
  - `UserMenu`(오른쪽 위 메뉴)에 지금은 로그아웃만 있음. S6에서 "프로필 수정", S7에서 "초기화", "회원탈퇴" 추가.
  - 로그인 사용자의 일기는 아직 localStorage(`lol-diaries-v2`)라서, 같은 브라우저에서는 계정이 달라도 같은 일기가 보임. S7에서 DB로 옮기며 해결.
  - 샘플 일기를 없앰. 일기가 없으면 피드에 빈 상태 안내.
  - Supabase 무료 플랜은 오래 안 쓰면 프로젝트가 일시정지됨(11/16에 "Resume project"로 복구). 주소 조회가 안 되면 대시보드부터 확인.
  - Google OAuth는 "테스트 중" 상태라 Google Cloud의 테스트 사용자만 로그인 가능. 공개 배포 전에 게시(Publish) 필요.
  - **미확인:** RLS(두 계정이 서로의 `profiles` 행을 못 보는지)는 사용자가 나중에 확인하기로 함. Vercel 배포 사이트에서의 로그인도 아직 확인 안 함.
- S4(10/19) 완료. DB 설계는 `docs/db-design.md`에 있다.
  - Supabase 프로젝트는 만들어졌고 SQL(테이블·GRANT·RLS·트리거)도 실행됨. `.env.local`과 Vercel에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` 등록 완료(Vercel은 Config 타입). 대시보드 키 이름은 anon이 아니라 publishable.
  - 프로젝트 Security 설정: Data API 켬, "Automatically expose new tables" 끔, automatic RLS 켬. 그래서 새 테이블은 GRANT를 직접 해야 하고, 남는 `REFERENCES/TRIGGER/TRUNCATE`는 회수해야 한다(문서 8번).
  - S5에서 할 확인: 로그인한 사용자끼리 서로의 일기가 안 보이는지(RLS) 실제로 시험.
  - 테이블은 `profiles`(내 팀 `my_team`)와 `diaries` 두 개. 팀·경기 테이블은 두지 않음(이유는 문서 3번).
  - `match`는 jsonb로 통째로 저장. 선택 항목은 비면 `location`/`pom`은 null, `image_paths`/`picked_champions`는 빈 값.
  - **설계 원칙: 원하는 것만 써도 되는 간편한 일기.** 필수는 날짜·경기·일기 내용뿐. 비어 있는 선택 항목은 화면에 표시하지 않는다(S6에서 반영).
  - 환경변수 이름은 `.env.example`에 있다. 실제 값은 `.env.local`(커밋 안 됨)과 Vercel에 둔다.
  - S5에서 정할 것: 가입 시 `profiles` 행을 만드는 방법(트리거 vs 앱에서 upsert, 문서 8번).
- S3(10/17) 완료. 데이터 구조가 크게 바뀌었다 (자세한 내용은 CLAUDE.md "아키텍처").
  - 내 팀은 일기 필드가 아니라 사용자 설정값(localStorage `lol-my-team`). **S4 DB 설계 시 users 테이블에 내 팀 컬럼이 필요하다.**
  - Diary의 `match`는 `Match` 객체(`teamA/teamB/scoreA/scoreB/format`), `result`·`score`·`matchFormat` 필드는 없어졌다. 승패와 승률은 `getMyResult`/`getWinStats`로 매번 계산한다.
  - 경기 목록은 `getMatchesByDate`(지금은 샘플 데이터, Promise 반환). 일기는 고른 경기를 복사해서 저장한다.
  - 저장 키가 `lol-diaries-v2`로 바뀌어 예전 일기는 보이지 않는다(사용자 결정, 변환 안 함).
- S2(10/14~10/16) 완료. S2 중에 "챔피언 전체 목록" 작업이 추가됐다(사용자 결정).
  - `src/data/champions.ts`는 `npm run gen:champions`(`scripts/generate-champions.mjs`)가 만드는 파일이다. 직접 고치지 않는다.
  - 이름·이미지는 Data Dragon 최신 버전, 포지션은 Meraki Analytics(커뮤니티 데이터)에서 받는다. Meraki 포지션 순서는 알파벳순이라 주 포지션을 알 수 없다.
  - 클라이언트와 다른 포지션은 `scripts/champion-position-overrides.json`에 `{ "챔피언id": ["TOP"] }` 형식으로 적고 스크립트를 다시 실행한다.
- 저장 방식이 바뀌었다: App의 `useEffect` 저장을 없애고, `handleSaveDiary`가 localStorage 저장에 성공했을 때만 상태를 바꾼다. 일기를 삭제하는 기능 등 `diaries`를 바꾸는 코드를 새로 만들면 `saveToStorage`를 같이 호출해야 한다.
- `Diary.matchFormat`(3 | 5)이 추가됐다. 예전 일기는 값이 없어서 밴픽 키(`game3-`, `game4-`)로 추정한다.
- S0에서 넣은 `defaultMode: plan` 확인 결과: S2 세션은 플랜 모드가 아니라 auto 모드로 시작했다(설정이 적용되지 않은 것으로 보임, 원인은 미확인).
- S1(10/7) 완료: lint 에러 0, CI에 lint 추가. 이제 build와 lint 모두 필수.
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

## S2. 버그와 하드코딩 정리 (10/8 → 실제 10/14~10/16) ✅
- [x] BO5 일기를 수정하면 BO3로 표시되는 문제: `matchFormat`을 저장하고 복원
- [x] App.tsx 샘플 데이터의 `pickedChampions`를 객체 형식으로 수정, 없는 챔피언("Kenia") 제거
- [x] 캘린더 시작월 고정값(2026년 6월)을 오늘 날짜 기준으로 변경
- [x] localStorage 저장 실패(용량 초과) 시 알림 표시
- [x] (추가, 사용자 결정) 챔피언 전체 목록(173명)을 API로 받아 생성하는 스크립트, 포지션별로 나눈 `champions.ts`, 포지션 수작업 수정(overrides). 포지션은 클라이언트 스크린샷(10/16)과 비교해 59명을 overrides로 맞춤
- [x] (추가) 사진 버그 B 수정: 대표 사진보다 앞의 사진을 지우면 대표 표시가 2칸 밀리던 문제
- 완료 조건: 수정 모드에서 BO5 밴픽이 유지됨, 용량 초과 시 앱이 멈추지 않음
- 브라우저 확인(사용자, 10/14): 샘플 밴픽, 캘린더 시작월, BO5 복원, 용량 초과 알림, 포지션 필터, 사진 버그 B

## S3. 응원팀(내 팀) 기능 (10/17) (핵심 로직은 사용자 작성, UI는 Claude 작성 → 서로 리뷰) ✅
- [x] 앱 시작 시 내 팀 선택 강제(`TeamSelectModal`), localStorage `lol-my-team`에 저장
- [x] `Match` 타입, Diary의 `match`/`score`/`result`를 `match: Match`로 교체, 저장 키 `lol-diaries-v2` (예전 데이터는 변환하지 않음)
- [x] 샘플 경기 데이터와 `getMatchesByDate(date)` (API 연동 시 이 함수만 교체)
- [x] `getMyResult`로 승패 계산. 내 팀 경기가 아니면 아이콘 없음, 승률에서 제외
- [x] 작성 모달: 날짜 → 그날 경기 목록(내 팀 경기 먼저) → 경기 선택 시 스코어·승패 아이콘 자동 표시
- [x] 승패 아이콘은 `ResultBadge` 한 곳에서 그림(지금은 W/L 배지)
- [x] 피드: 스코어 옆 승패 아이콘, "내 팀 경기만" 필터 / 캘린더: 승패 표시와 통계를 계산 함수로 교체
- [x] ProfileHeader: 내 팀 표시, 내 팀 기준 승률, 승률 옆 `?` 도움말(마우스를 올리면 말풍선)
- 완료 조건: 내 팀 기준으로 승패 아이콘과 승요 통계가 표시됨
- 브라우저 확인(사용자, 10/17): 팀 선택 강제, 경기 목록·자동 스코어·승패 아이콘, 필터, 수정 모드, 승률
- **1차 완성 체크포인트 (~10/17): 배포된 로컬 저장 버전** (S3 PR 머지 후 배포 URL 확인)
- 배포 확인 완료(사용자, 10/17): 배포 사이트에서 팀 선택 화면 표시

## S4. Supabase 설계 (10/17 → 실제 10/19)
- [x] 테이블 설계 문서(`docs/db-design.md`): `profiles`(ROADMAP의 users), diaries, 컬럼과 타입
- [x] RLS 정책: 자기 일기만 읽고 쓰기 (SQL은 문서 5번)
- [x] Supabase 프로젝트 생성(Seoul), SQL 실행, 환경변수 설정(`.env.local`, Vercel 3개 환경 모두) (사용자, 10/19)
- [x] (추가) `.gitignore`에 `.env` 추가, `.env.example` 견본 파일
- [x] (추가) 권한 점검: "expose"를 꺼도 남아 있던 `REFERENCES/TRIGGER/TRUNCATE` 회수, 확인 쿼리 문서화(문서 7번)
- 확인(10/19): 비로그인 REST 조회 → 401 `permission denied`, 확인 쿼리로 GRANT·RLS·정책 7개·트리거 확인
- 결정(사용자): 팀 테이블 없음, `match`는 jsonb, 비어 있는 선택 항목은 null/빈 값으로 저장하고 화면에 표시하지 않음

## S5. 소셜 로그인 (10/20 → 실제 10/20, 11/16) ✅ (범위 확장: 로그인 필수, 닉네임#태그 프로필, 팀 없음)
- [x] Supabase Auth로 Google 로그인 (Kakao는 "이후"로)
- [x] 로그인 화면(`LoginScreen`), 오른쪽 위 메뉴(`UserMenu`)의 로그아웃. 로그인하지 않으면 앱 사용 불가(게스트 없음, 사용자 결정)
- [x] `profiles` 행 생성: 처음 로그인할 때 앱이 무작위 `닉네임#태그` + 팀 없음으로 insert. 겹치면 다시 뽑음
- [x] `profiles`에 `nickname`, `tag`, `nickname_changed_at` 추가, `닉네임#태그` 중복 금지, 90일 변경 제한 트리거 (SQL 실행: 사용자, 11/16)
- [x] 내 팀을 `profiles.my_team`으로 이전(`lol-my-team` 제거). null = 팀 없음 → 승률·티어·통계·내 팀 필터 숨김
- [x] 샘플 일기 제거, 일기가 없을 때 빈 상태 안내
- 브라우저 확인(사용자, 11/16): Google 로그인, 무작위 닉네임 표시, 새로고침 유지, 로그아웃 후 재로그인 시 같은 닉네임, 행 삭제 후 재생성
- DB 확인(사용자, 11/16): 첫 닉네임 변경 성공, 두 번째 변경은 `nickname_change_too_soon`으로 거부
- [ ] (나중에 사용자) RLS: 두 계정이 서로의 `profiles` 행을 못 보는지

## S6. 프로필 수정 (11/18 ~ 11/24) ✅
- [x] `UserMenu`에 "프로필 수정" → 모달에서 닉네임#태그와 팀(팀 없음 포함) 변경
- [x] 중복(`23505`), 90일 제한(`nickname_change_too_soon`) 에러를 안내 문구로 표시. 다음 변경 가능 날짜를 미리 안내 (중복 안내는 화면에서 미확인)
- [x] `TeamSelectModal.tsx` 정리(삭제)
- [x] (추가) 긴 닉네임에서 헤더가 깨지는 문제 → 닉네임 최대 12자(DB 제약 변경) + 헤더 한 줄 고정
- 브라우저 확인(사용자, 11/24): 팀 변경 시 승률·모스트 팀 반영, 닉네임 변경 후 잠금 표시, 모달 입력칸, 헤더 배치

## S7. 데이터를 DB로 이전 (11/25 ~ 11/26)
- [ ] 일기 CRUD를 localStorage에서 Supabase로 교체
- [ ] 사진을 base64 대신 Supabase Storage에 업로드
- [ ] 로딩과 에러 상태 UI
- [ ] 비어 있는 선택 항목(장소, POM, 사진, 밴픽)은 피드와 캘린더에 표시하지 않음. "미지정" 글자, 회색 대체 이미지, "밴픽 정보 없음" 안내를 없앰. `location`/`pom`은 `"미지정"` 대신 null 저장. 사진 없는 카드 배치는 화면을 보며 결정
- [ ] `UserMenu`에 "초기화"(내 일기만 모두 삭제, 프로필은 유지)와 "회원탈퇴"(본인 계정만 지우는 DB 함수 + rpc 추천. 사진 Storage도 함께 삭제)
- [ ] RLS 확인: 두 계정이 서로의 일기를 못 보는지

## S8. LLM 승요 리포트 (11/27)
- [ ] Edge Function에서 LLM 호출 (API 키는 서버에만 둠)
- [ ] ProfileHeader에 리포트 카드 표시
- [ ] 실패하거나 지연될 때 기본 통계 카드로 대체하는 UI
- **최종 완성 체크포인트 (~11/27)**

## 이후 (10월 이후)
- 경기 스코어 API 연동 (공식 공개 API가 없어 비공식 API 조사가 필요). 연동 시 `src/data/matches.ts`의 `getMatchesByDate`만 교체
- API에 없는 경기를 위한 "직접 입력" 대체 칸 (API 연동 후 결정)
- Kakao 로그인 (이메일이 없는 사용자 허용 여부는 이때 결정)
- 닉네임 변경권 구매(90일 제한 해제). 결제 확인은 반드시 서버(Edge Function)에서
- 승패 아이콘을 팀 마스코트·로고로 교체 (`ResultBadge`만 수정)
- 경기 API나 팀 로고를 붙일 때 `teams`/`matches` 테이블 검토 (일기는 `match_id`로 연결, `docs/db-design.md` 3번)
- Prettier + prettier-plugin-tailwindcss 도입 (Tailwind 클래스 순서 자동 정렬. 처음 적용할 때 전체 diff가 큼)
- 앱 확장

## 발견한 문제 (범위 밖 메모)
- 빌드 결과 JS가 500kB를 넘는다는 경고(S5에서 확인, 그 전부터 있었는지는 미확인). 지금은 동작에 문제없음 → 필요하면 코드 분할 검토
- (다음 작업 후보, 사용자 요청) 챔피언 픽 모달: 한 세트에서 이미 고른 챔피언은 다른 칸에서 회색으로 비활성화
- 챔피언이 173명이 되어 선택 창 스크롤이 길다 → 이름 검색창 후보
- (S3에서 해결) BO5에서 4·5세트를 채운 뒤 BO3로 바꿔 저장하면 4·5세트 데이터가 남는 문제 → 저장 시 `match.format`보다 뒤 세트의 밴픽을 버림
- 경기 API 연동 시: 아직 안 끝난 경기가 `0:0`으로 오면 `getMyResult`가 `LOSE`로 계산함 → 경기 상태(종료 여부) 확인 필요
- `?` 도움말 말풍선은 hover 방식이라 모바일에서는 안 보일 수 있음(미확인) → 모바일 대응 시 클릭으로 여닫는 방식 검토
- 캘린더 승요 지수와 ProfileHeader 승률은 같은 함수지만, 캘린더는 전체 기간 기준이라 "이번 달" 통계는 아님
- (S2 확인 결과: 재현 안 됨) 사진을 지웠다가 같은 사진을 다시 고르면 추가되지 않을 수 있다고 추정했으나, 사용자 브라우저에서는 정상 추가됨. 브라우저에 따라 다를 수 있음
- (S2에서 수정함) 사진 버그 B: `handleDeleteImage`의 updater 안에서 다른 state를 바꿔서, StrictMode에서 대표 인덱스가 2칸 밀림
- App.tsx의 `lck-root`, `font-heading` 클래스는 Tailwind 기본 클래스도 아니고 정의된 곳도 없어 효과가 없음 → 삭제하거나 폰트 설정 추가 필요
- 캘린더가 `diaries.find`로 날짜당 일기 1개만 표시함 → 같은 날 일기가 2개 이상이면 하나만 보임
- `react-calendar` 의존성을 쓰지 않음, `src/App.css`를 import하는 곳이 없음 → 정리 여부 결정 필요
- DiaryFormModal의 블루/레드 슬롯 코드가 거의 같은 코드로 중복됨 → 컴포넌트로 분리 후보
- 티어 아이콘이 LoL 공식 랭크 엠블럼으로 보임 → 배포/공개 전에 Riot의 팬 프로젝트 에셋 사용 조건(고지 문구 등) 확인 필요
