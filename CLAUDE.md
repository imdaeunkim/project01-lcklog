# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 작업 규칙 (반드시 지킬 것)

### 소통
- 항상 한국어로 답한다.
- 사용자는 코드를 이해하면서 개발하는 것을 중요하게 여긴다. 코드를 바꾸면 무엇을, 왜 바꿨는지 쉬운 말로 설명한다.
- 사실과 추측을 구분한다. 확인하지 않은 내용은 확인하지 않았다고 말한다.

### 코드 주석
- 코드 주석은 "~함", "~음", 명사형으로 끝나는 짧은 문장으로 쓴다. "~한다", "~이다" 같은 "~다"체는 쓰지 않는다. (예: `localStorage에 저장. 실패하면 false 반환`, `대표 인덱스가 두 번 줄어듦`)

### 계획 먼저
- 코드나 설정을 수정하기 전에 아래 양식으로 계획을 제시하고, 사용자가 승인한 뒤에 진행한다.
  `목표 / 수정할 파일 / 설계 / 예상 결과(화면·동작) / 검증 방법 / 이번에 안 하는 것`
- 파일을 삭제하기 전에는 반드시 따로 확인을 받는다.

### 세션 운영 (1세션 = 1단계 = 1브랜치 = 1PR)
- 세션을 시작하면 `docs/ROADMAP.md`를 읽고 이번 세션의 단계와 "다음 세션 메모"를 확인한다.
- 해당 단계 범위만 작업한다. 범위 밖 문제를 발견하면 ROADMAP의 "발견한 문제"에 메모만 남긴다.
- 세션을 끝낼 때는 ROADMAP의 체크박스와 "다음 세션 메모"를 갱신하고, 커밋과 push 후 PR을 만든다.
- 새 세션은 main에서 시작하므로, 사용자가 PR을 머지해야 다음 세션이 변경 내용을 볼 수 있다.
- 일정(ROADMAP 날짜)이 바뀌어도 별도 PR을 만들지 않고, 그 세션의 ROADMAP 갱신에 함께 포함한다. PR 설명에는 일정 변경을 적지 않는다.

### Git과 검증
- main/master에 직접 commit하거나 push하지 않는다. 강제 push도 하지 않는다. (`.claude/hooks/guard-git.mjs`가 차단한다)
- 커밋 전에 `npm run build`와 `npm run lint`를 모두 통과해야 한다. (Hook은 commit 직전에 build만 자동 실행한다. lint는 CI가 PR에서 검사한다)
- 사용자가 VS Code에서 직접 수정할 때도 main 동기화 → 새 브랜치 → 커밋·push → PR 순서를 따른다.
- 커밋 메시지는 `feat:` / `fix:` / `docs:` / `chore:` / `refactor:` + 한국어 요약으로 쓴다.
- PR 설명은 `무엇을 바꿨나 / 왜 / 어떻게 확인했나` 3개 섹션으로 쓴다.
- 커밋 메시지와 PR 설명에 Claude 서명 문구(`Co-Authored-By`, `Generated with Claude Code`, 세션 링크 등)를 넣지 않는다 PR 생성 도구가 본문 끝에 서명을 자동으로 붙이면, 생성 직후 PR 본문을 수정해서 지운다.
- 코드를 바꾼 PR은 사용자가 "왜" 섹션을 직접 작성한다. Claude는 초안에 `(사용자 작성)` 자리표시자만 두고, 사용자가 이해하지 못한 부분을 물어보면 설명한다. 설정이나 문서만 바꾼 PR은 Claude 초안 그대로 두어도 된다.

## 프로젝트 개요

LoL(리그 오브 레전드) e-sports, LCK 경기 직관 기록 다이어리("LCK 직관 다이어리"). 직관한 경기의 결과, 세트별 밴픽, 사진, 일기를 기록하고 직관 승률("승요")을 보여준다. 현재는 백엔드 없이 브라우저에서만 동작하는 React 19 + TypeScript + Vite 단일 페이지 앱이다. 이후 Supabase(DB, 소셜 로그인)와 LLM 리포트를 붙일 예정이며, 단계별 계획은 `docs/ROADMAP.md`, DB 설계(테이블, RLS, 환경변수)는 `docs/db-design.md`에 있다. 환경변수 이름은 `.env.example`에 있고, 실제 값은 커밋되지 않는 `.env.local`에 둔다. `VITE_`로 시작하는 변수는 브라우저에 공개되므로 비밀 키(`service_role`, LLM API 키)를 넣지 않는다.

설계 원칙: 원하는 것만 써도 되는 간편한 일기. 일기의 필수 항목은 날짜·경기·일기 내용뿐이고, 비어 있는 선택 항목(장소, POM, 사진, 밴픽)은 기록 화면에 "미지정"이나 빈 칸으로 표시하지 않는다(지금 코드는 아직 표시함, S6에서 반영). UI 문구와 코드 주석은 한국어로 쓴다.

## 명령어

```bash
npm install        # 의존성 설치
npm run dev        # 개발 서버 (Vite)
npm run build      # tsc -b 타입 체크 후 vite build — 타입 오류가 있으면 빌드 실패
npm run lint       # ESLint (flat config, eslint.config.js)
npm run preview    # 빌드 결과물 미리보기
```

테스트 프레임워크는 설정되어 있지 않다. 변경 검증은 `npm run build`(타입 체크 포함)와 `npm run lint`로 한다. `tsconfig.app.json`에 `noUnusedLocals`/`noUnusedParameters`가 켜져 있으므로 사용하지 않는 import나 변수가 있으면 빌드가 실패한다.

## 아키텍처

### 상태와 데이터 흐름
- 모든 상태는 `src/App.tsx`에 있고, 자식 컴포넌트에는 props로 내려준다. 라우터와 전역 상태 라이브러리는 쓰지 않는다.
- 일기 목록(`diaries`)은 `localStorage`의 `lol-diaries-v2` 키에 저장된다(S3에서 형식이 바뀌어 예전 `lol-diaries`는 읽지 않는다). `handleSaveDiary`가 `saveToStorage`로 먼저 저장하고, 성공했을 때만 상태를 바꾼다. `diaries`를 바꾸는 코드를 새로 만들면 `saveToStorage`를 같이 호출한다. 저장된 값이 없을 때만 App.tsx에 하드코딩된 샘플 2건을 쓴다.
- 내 팀(응원팀) `myTeam`은 일기와 따로 `localStorage`의 `lol-my-team` 키에 팀 id로 저장된다. 값이 없으면 App이 `TeamSelectModal`만 렌더링해서 팀 선택을 강제한다. 그 아래의 자식 컴포넌트는 `myTeam: string`을 prop으로 받는다.
- 작성과 수정은 `DiaryFormModal` 하나가 처리한다. `editingDiary`가 `null`이면 신규 작성이고, 객체이면 수정 모드다. App은 모달을 열려 있을 때만 `key={editingDiary?.id ?? 'new'}`로 렌더링하고, 모달은 `useState` 초기값에서 폼을 채운다(useEffect로 채우지 않는다). `App.handleSaveDiary`가 `id`로 기존 항목을 교체하거나 목록 맨 앞에 추가한다.
- `selectedDate`는 `SpectateCalendar`와 `DiaryFeed`가 공유한다. 캘린더에서 날짜를 누르면 피드가 필터링된다.
- 승패와 승률은 저장하지 않고 항상 내 팀 기준으로 계산한다. `src/utils/matchResult.ts`의 `getMyResult(match, myTeam)`(내 팀 경기가 아니면 `null`)과 `getWinStats(diaries, myTeam)`을 모든 화면이 같이 쓴다. 내 팀 경기가 아닌 일기는 승률에서 빠진다. 그래서 내 팀을 바꾸면 승패 아이콘과 승률이 자동으로 다시 계산된다.
- 승패 아이콘은 `ResultBadge` 컴포넌트에서만 그린다.

### Diary 객체 형태 (DiaryFormModal.handleSubmit 기준)
공통 타입은 `src/types/diary.ts`의 `Diary` 인터페이스다. App과 모든 컴포넌트가 이 타입을 쓴다. 필드를 추가하거나 바꿀 때는 `Diary` 타입과 DiaryFormModal의 `handleSubmit`을 함께 고친다.

- `id`: `Date.now()`
- `date`: **`"YYYY.MM.DD"` 문자열**(점 구분). `<input type="date">`는 `YYYY-MM-DD`를 쓰므로 모달이 로드하고 저장할 때 서로 변환한다. 캘린더와 피드의 날짜 비교도 점 구분 형식에 의존한다.
- `match`: `Match` 객체 `{ id, date, teamA, teamB, scoreA, scoreB, format: 1 | 3 | 5 }`. 팀은 `src/data/teams.ts`의 id. 모달에서 고른 경기를 통째로 복사해 저장한다(경기 목록이 바뀌어도 일기는 유지). 승패(`result`) 필드는 없다.
- `location`, `pom`: 비어 있으면 각각 `"미지정 장소"`, `"미지정"`이 저장된다. 수정 모드에서는 모달이 이 값을 다시 빈 문자열로 되돌린다.
- `pickedChampions`: `Record<slotKey, { name, imageUrl }>`. slotKey 형식은 `game{gameIndex}-{blue|red}-{boxIndex}`이고, DiaryFeed가 같은 키로 세트별 밴픽을 그린다. 모달은 `match.format`만큼 세트 칸을 보여주고, 저장할 때 그보다 뒤 세트의 밴픽은 버린다.
- `images`: base64 data URL 배열(최대 5장, 장당 1MB 이하). `representativeIndex`는 대표 이미지 인덱스다. `image`는 대표 이미지이고 구버전 데이터와의 호환용으로 함께 저장된다. 이미지가 localStorage에 그대로 들어가므로 용량 한도(보통 약 5MB)에 주의해야 한다.

### 정적 데이터와 에셋
- `src/data/champions.ts`: 선택 가능한 챔피언 목록(`CHAMPIONS_LIST`, `CHAMPIONS_BY_POSITION`). `npm run gen:champions`가 만드는 파일이라 직접 고치지 않는다.
- `src/data/teams.ts`: LCK 팀 목록(`TEAMS`)과 `getTeamName(id)`.
- `src/data/matches.ts`: `getMatchesByDate(date)`가 그날 경기 목록을 Promise로 돌려준다. 지금은 시연용 샘플 데이터이고, 경기 API를 붙일 때 이 함수 안쪽만 바꾼다. 작성 모달은 날짜가 바뀔 때마다 이 함수를 불러 경기 목록을 채운다(내 팀 경기가 맨 앞).
- `src/assets/positions/*.png`: 포지션 필터 아이콘. DiaryFormModal에서 import한다.

### 스타일
- Tailwind CSS 3을 쓴다(`tailwind.config.js`, `src/index.css`). 대부분의 색은 설정 토큰 대신 `bg-[#0a1428]`, `border-[#c8aa6e]`(LoL 골드) 같은 임의값 클래스로 직접 지정한다. 새 UI를 만들 때도 기존 팔레트를 그대로 따른다.
- `src/App.css`는 어디에서도 import되지 않는다.
- 아이콘은 `lucide-react`를 쓴다. 달력(`SpectateCalendar`)은 직접 구현한 것이다. `react-calendar`는 의존성에 있지만 import하는 곳이 없다.
