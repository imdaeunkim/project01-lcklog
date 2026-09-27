# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

LCK 경기 직관 기록 다이어리("LCK 직관 다이어리"). 백엔드 없이 브라우저에서만 동작하는 React 19 + TypeScript + Vite 단일 페이지 앱이다. UI 문구와 코드 주석은 한국어로 쓴다.

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
- 일기 목록(`diaries`)은 `localStorage`의 `lol-diaries` 키에 저장된다. `useEffect`에서 변경될 때마다 통째로 직렬화한다. 저장된 값이 없을 때만 App.tsx에 하드코딩된 샘플 2건을 쓴다.
- 작성과 수정은 `DiaryFormModal` 하나가 처리한다. `editingDiary`가 `null`이면 신규 작성이고, 객체이면 수정 모드다. `App.handleSaveDiary`가 `id`로 기존 항목을 교체하거나 목록 맨 앞에 추가한다.
- `selectedDate`는 `SpectateCalendar`와 `DiaryFeed`가 공유한다. 캘린더에서 날짜를 누르면 피드가 필터링된다.
- 승률, 전적 같은 통계는 `ProfileHeader`와 `SpectateCalendar`가 `diaries`에서 매번 직접 계산한다. 저장해두는 집계값은 없다.

### Diary 객체 형태 (DiaryFormModal.handleSubmit 기준)
공유 타입 파일은 없다. `diary`는 대부분 `any`로 다루고, 각 컴포넌트가 필요한 필드만 자기 Props 인터페이스에 따로 선언한다. 필드를 추가하거나 바꿀 때는 App.tsx, DiaryFormModal, DiaryFeed, SpectateCalendar, ProfileHeader를 모두 확인해야 한다.

- `id`: `Date.now()`
- `date`: **`"YYYY.MM.DD"` 문자열**(점 구분). `<input type="date">`는 `YYYY-MM-DD`를 쓰므로 모달이 로드하고 저장할 때 서로 변환한다. 캘린더와 피드의 날짜 비교도 점 구분 형식에 의존한다.
- `result`: `"WIN"` | `"LOSE"`
- `score`, `location`, `pom`: 비어 있으면 각각 `"0:0"`, `"미지정 장소"`, `"미지정"`이 저장된다. 수정 모드에서는 모달이 이 값을 다시 빈 문자열로 되돌린다.
- `pickedChampions`: `Record<slotKey, { name, imageUrl }>`. slotKey 형식은 `game{gameIndex}-{blue|red}-{boxIndex}`이고, DiaryFeed가 같은 키로 세트별 밴픽을 그린다.
  - App.tsx의 샘플 데이터는 이 필드가 챔피언 id **배열**이라 형식이 다르다.
- `images`: base64 data URL 배열(최대 5장, 장당 1MB 이하). `representativeIndex`는 대표 이미지 인덱스다. `image`는 대표 이미지이고 구버전 데이터와의 호환용으로 함께 저장된다. 이미지가 localStorage에 그대로 들어가므로 용량 한도(보통 약 5MB)에 주의해야 한다.

### 정적 데이터와 에셋
- `src/data/champions.ts`: 선택 가능한 챔피언 목록(`CHAMPIONS_LIST`). 이미지는 Riot Data Dragon CDN(`ddragon.leagueoflegends.com/cdn/14.3.1/...`)의 URL을 쓴다.
- `src/assets/positions/*.png`: 포지션 필터 아이콘. DiaryFormModal에서 import한다.

### 스타일
- Tailwind CSS 3을 쓴다(`tailwind.config.js`, `src/index.css`). 대부분의 색은 설정 토큰 대신 `bg-[#0a1428]`, `border-[#c8aa6e]`(LoL 골드) 같은 임의값 클래스로 직접 지정한다. 새 UI를 만들 때도 기존 팔레트를 그대로 따른다.
- `src/App.css`는 어디에서도 import되지 않는다.
- 아이콘은 `lucide-react`를 쓴다. 달력(`SpectateCalendar`)은 직접 구현한 것이다. `react-calendar`는 의존성에 있지만 import하는 곳이 없다.
