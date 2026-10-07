# S1 학습 노트: React 기본 개념과 코드 흐름 (2026-10-07)

S1(타입 정리와 lint 0) 작업 중에 나온 질문과 답변을 정리했다. 예시 코드는 모두 이 프로젝트(LCK 직관 다이어리)에서 가져왔다.
관련 PR: #5

---

## 목차
1. [TypeScript: `any`와 유니온 타입](#1-typescript-any와-유니온-타입)
2. [`undefined`와 `null`, 그리고 `?`](#2-undefined와-null-그리고-)
3. [`?.` / `??` / `||` / `? :` 연산자](#3--------연산자)
4. [props](#4-props)
5. [useState](#5-usestate)
6. [리렌더링: 화면은 언제 다시 그려지나](#6-리렌더링-화면은-언제-다시-그려지나)
7. [useEffect](#7-useeffect)
8. [useEffect를 지운 이유 (전/후 코드 비교)](#8-useeffect를-지운-이유-전후-코드-비교)
9. [key와 컴포넌트 새로 만들기](#9-key와-컴포넌트-새로-만들기)
10. [함수를 props로 넘기기와 클로저](#10-함수를-props로-넘기기와-클로저)
11. [제어 컴포넌트와 `trim()`](#11-제어-컴포넌트와-trim)
12. [이미지 업로드: FileReader, base64, 용량](#12-이미지-업로드-filereader-base64-용량)
13. [`map`과 `_`](#13-map과-_)
14. [Tailwind CSS](#14-tailwind-css)
15. [flex 레이아웃](#15-flex-레이아웃)
16. [relative / absolute / fixed](#16-relative--absolute--fixed)
17. [앱 전체 데이터 흐름](#17-앱-전체-데이터-흐름)

---

## 1. TypeScript: `any`와 유니온 타입

**Q. `result`를 `'WIN' | 'LOSE'`로 바꾼 의미는? 어차피 select로만 고르는데.**

```ts
// 전
result?: string;          // 없어도 되고, 아무 글자나 가능
// 후
result: 'WIN' | 'LOSE';   // 필수, 두 값만 가능 (유니온 타입)
```

- 화면에서는 select로만 고르니 차이가 거의 없다. 바뀐 건 **"이 필드에는 이 두 값만 들어간다"를 코드에 명시**한 것이다.
- 오타(`d.result === "Win"`)를 빌드 단계에서 잡고, 에디터 자동완성이 된다.
- 나중에 API로 경기 결과를 가져올 때 더 쓸모 있다. API 응답 형식이 `"W"`/`"L"`이면 변환 코드를 쓰지 않는 한 빌드가 실패하므로 **변환을 강제**해 준다.

**`any`는?** "타입 검사를 하지 마"라는 뜻이다. 실수를 놓치기 쉬워서 lint(`no-explicit-any`)가 막는다. 실제 타입으로 바꾸자 숨어 있던 문제 두 개가 드러났다(아래 2번).

---

## 2. `undefined`와 `null`, 그리고 `?`

| | 의미 | 언제 생기나 |
|---|---|---|
| `undefined` | 값이 아직 없음 | 없는 속성을 읽을 때, 아무것도 넣지 않았을 때 (기본값) |
| `null` | 일부러 비워 둠 | 개발자가 직접 `null`을 써야만 생김 |

```ts
image?: string;   // ? = "이 속성은 없어도 된다" → 실제 타입은 string | undefined (null은 포함 안 됨)
```

- 모달이 `image: ... || null`로 저장하고 있었는데 타입은 null을 허용하지 않았다 → `|| undefined`로 수정.
- `JSON.stringify`는 값이 `undefined`인 속성을 빼고 저장한다.
- `<img src>`는 `string | undefined`만 받는다. 데이터에 `url: null`이 있어서 `src={pos.url ?? undefined}`로 바꿔 넘겼다.

---

## 3. `?.` / `??` / `||` / `? :` 연산자

| 문법 | 이름 | 동작 |
|---|---|---|
| `a?.b` | 옵셔널 체이닝 | `a`가 null/undefined면 에러 없이 `undefined`, 아니면 `a.b` |
| `a ?? b` | null 병합 | `a`가 null/undefined면 `b`, 아니면 `a` |
| `a \|\| b` | 논리 OR | `a`가 **falsy**(`''`, `0`, `false`, null, undefined)면 `b` |
| `조건 ? x : y` | 삼항 연산자 | 참이면 `x`, 거짓이면 `y` (if/else 한 줄) |
| `image?: string` | (타입) 선택 속성 | "없어도 됨" |

```tsx
editingDiary?.id ?? 'new'
// 수정 모드: editingDiary.id (숫자)
// 신규 작성: editingDiary가 null → ?.가 undefined → ??가 'new'
```

**`??` vs `||`**: 0이 정상값일 때 차이가 난다.
```ts
0 || 5   // 5
0 ?? 5   // 0
```
→ 대표 이미지 인덱스는 0(첫 사진)이 정상값이라 `representativeIndex ?? 0`을 쓴다.

**세 경우로 갈리는 예시**
```tsx
editingDiary?.images || (editingDiary?.image ? [editingDiary.image] : [])
```
1. 사진 배열 `images`가 있으면 → 그 배열
2. 없고 구버전 한 장짜리 `image`가 있으면 → `[image]`로 감싸서
3. 둘 다 없으면 → `[]`

---

## 4. props

**Q. props가 뭐야?**

**부모 컴포넌트가 자식에게 넘겨주는 값.** 함수의 인자와 같다. HTML 속성처럼 생겼다.

```tsx
// 부모 (App): 넘겨줌
<DiaryFormModal onClose={handleCloseModal} onSave={handleSaveDiary} editingDiary={editingDiary} />

// 자식: 받아서 씀
export default function DiaryFormModal({ onClose, onSave, editingDiary }: DiaryFormModalProps) { ... }
```

- 데이터(`editingDiary`)뿐 아니라 **함수**(`onSave`, `onClose`)도 넘길 수 있다.
- 자식은 부모의 state를 직접 못 바꾼다. 부모가 넘겨준 함수를 불러서 "바꿔줘"라고 요청한다.

| | props | state |
|---|---|---|
| 누가 정하나 | 부모가 넘겨줌 | 컴포넌트 자신 |
| 바꿀 수 있나 | 자식은 못 바꿈 (읽기 전용) | `setXxx`로 바꿈 |

`<button onClick={...}>`의 `onClick`도 props다. 직접 만든 컴포넌트냐 브라우저 기본 태그냐의 차이뿐이다. `onClick`은 선택 사항이고, 없으면 눌러도 아무 일도 없다.

---

## 5. useState

```tsx
const [match, setMatch] = useState('T1 vs DK');
```
- `match`: 지금 값 / `setMatch`: 바꾸는 함수 / 괄호 안: **처음 만들어질 때 한 번만 쓰이는 초기값**
- `setMatch`를 부르면 컴포넌트가 다시 그려진다.
- `useState(() => {...})`처럼 함수를 넣으면 처음 한 번만 실행된다. localStorage 읽기처럼 무거운 계산에 쓴다.

**`prev =>` 형태 (함수형 업데이트)**: "직전 값을 기준으로 바꿔라"
```tsx
setCurrentYearMonth(prev => ({ ...prev, month: prev.month + 1 }));
setUploadedImages(prev => [...prev, newImage]);
```
비동기 콜백이 여러 번 실행될 때(사진 여러 장 업로드) 특히 중요하다. `[...uploadedImages, x]`로 쓰면 모두 옛 배열을 기준으로 해서 마지막 한 장만 남는다.

---

## 6. 리렌더링: 화면은 언제 다시 그려지나

**Q. 화면을 다시 그리는 건 값이 바뀔 때야?**

두 가지 경우다.
1. **자기 state가 다른 값으로 바뀔 때** (`setXxx`). 같은 값이면 건너뛴다.
2. **부모가 다시 그려질 때**: 자식도 기본적으로 전부 다시 그려진다(props가 같아도).

일반 변수(`let count = 0; count = 1;`)는 바꿔도 React가 모른다. 화면에 보일 값은 state로 만들어야 한다.

**객체/배열은 "새것인지"로 판단한다**
```tsx
setDiaries([diaryData, ...diaries]);   // ✅ 새 배열 → 다시 그림
diaries.push(diaryData); setDiaries(diaries);  // ❌ 같은 배열 → 바뀐 걸 모름
```

**다시 그린다 ≠ DOM 전체를 새로 만든다.** 컴포넌트 함수를 다시 실행해 결과를 계산하고, 이전과 달라진 부분만 실제 화면에 반영한다.

---

## 7. useEffect

**Q. useEffect는 언제 동작하고, 왜 있어?**

**화면을 그린 "뒤에" 실행할 코드.**
```tsx
useEffect(() => {
  localStorage.setItem('lol-diaries', JSON.stringify(diaries));
}, [diaries]);   // 의존성 배열
```
- 실행 시점: ① 처음 화면에 나타난 직후 ② 의존성 배열의 값이 바뀌어 다시 그린 직후
- 이 앱에서: 일기 추가/수정(→ `setDiaries`로 새 배열) 때 실행. 모달 열기나 날짜 클릭으로 App이 다시 그려져도 `diaries`가 그대로면 실행 안 됨.

**Q. 그럼 useEffect는 화면을 바꾸는 게 아니라 정보를 동기화하는 용도야?**

맞다. **React state를 React 바깥(localStorage, 서버, 타이머, 브라우저 이벤트)과 맞추는 용도.**
```
① React → 바깥: diaries 바뀜 → localStorage 저장 (지금 App)
② 바깥 → React: 앱 시작 → 서버에 요청 → 응답 오면 setDiaries (S6 Supabase에서 쓸 패턴)
```
※ localStorage는 서버가 아니라 **브라우저 안의 저장 공간**이다. 다른 기기/브라우저에서는 안 보인다.

**기준: props와 state만으로 계산할 수 있으면 useEffect를 쓰지 않는다. 바깥과 맞춰야 할 때만 쓴다.**
참고: https://react.dev/learn/you-might-not-need-an-effect

---

## 8. useEffect를 지운 이유 (전/후 코드 비교)

**Q. 동기화 용도 말고 다른 useEffect를 지운 이유는? 과투자라서?**

과투자라기보다 **맞지 않는 도구라 생기는 문제**가 있어서다.

1. **틀린 화면이 한 번 그려진다**: useEffect는 그린 뒤에 실행되므로 `렌더링(틀린 값) → effect에서 setState → 렌더링(맞는 값)` 순서가 된다.
2. **빠뜨리기 쉽다**: 이전 모달 코드는 state 10개는 되돌렸지만 `matchFormat`(BO3/5)과 `selectedPosition`을 빠뜨려서 이전 선택이 남았다.
3. **흐름이 단순해진다**: 값이 정해지는 곳이 두 군데 → 한 군데.

### 모달: 전
```tsx
const [date, setDate] = useState('2026-06-18');
const [match, setMatch] = useState('T1 vs DK');
// ...

useEffect(() => {
  if (isOpen) {
    if (editingDiary) {
      setDate(editingDiary.date.replace(/\./g, '-'));
      setMatch(editingDiary.match);
      // ... 10개
    } else {
      setDate(오늘);
      setMatch('T1 vs DK');
      // ... 10개
    }
  }
}, [isOpen, editingDiary]);

if (!isOpen) return null;   // 안 보이지만 컴포넌트와 state는 살아 있음
```
```tsx
// App
<DiaryFormModal isOpen={isModalOpen} ... />
```

### 모달: 후
```tsx
const [date, setDate] = useState(() => editingDiary ? editingDiary.date.replace(/\./g, '-') : getTodayInputDate());
const [match, setMatch] = useState(editingDiary?.match ?? 'T1 vs DK');
// useEffect 없음
```
```tsx
// App: 열려 있을 때만 만들고, 닫으면 없앤다
{isModalOpen && <DiaryFormModal key={editingDiary?.id ?? 'new'} ... />}
```

| | 전 | 후 |
|---|---|---|
| 닫혀 있을 때 | 컴포넌트와 state가 살아 있음 | 컴포넌트 자체가 없음 |
| 열 때 | 살아 있던 state를 하나씩 덮어씀 | 새로 만들며 초기값을 정함 |
| 되돌리기를 빠뜨리면 | 이전 값이 남음 | 빠뜨릴 수 없음 |

### 피드: 전
```tsx
const [expandedId, setExpandedId] = useState(1);   // 샘플 id에 고정
useEffect(() => {
  setExpandedId(filteredDiaries[0]?.id ?? null);
}, [selectedDate, diaries]);
```

### 피드: 후 (렌더링 중에 이전 값과 비교)
```tsx
const [expandedId, setExpandedId] = useState(filteredDiaries[0]?.id ?? null);
const [prevSelectedDate, setPrevSelectedDate] = useState(selectedDate);
const [prevDiaries, setPrevDiaries] = useState(diaries);
if (prevSelectedDate !== selectedDate || prevDiaries !== diaries) {
  setPrevSelectedDate(selectedDate);
  setPrevDiaries(diaries);
  setExpandedId(filteredDiaries[0]?.id ?? null);
}
```
렌더링 중 setState지만 조건이 있어서 무한 반복되지 않는다. 한 번 실행되면 prev가 지금 값과 같아진다. React 문서의 "props가 바뀔 때 state 조정하기" 패턴이다. 코드는 길어졌지만 틀린 화면이 그려지지 않는다.

---

## 9. key와 컴포넌트 새로 만들기

**Q. `'new'`라는 이름이 따로 있는 거야?**

아니다. **임의로 정한 문자열**이다. 신규 작성일 때는 id가 없어서 대신 넣을 값이 필요했고, id는 숫자라 문자열 `'new'`와 겹치지 않는다.

- **key가 바뀌면** React는 컴포넌트를 다시 그리는 게 아니라 **버리고 새로 만든다** → `useState` 초기값이 다시 적용된다.
- 원래 key는 `map`으로 반복한 요소들을 구분하는 이름표로 쓴다.
- 이 앱에서는 모달을 닫으면 사라지고, 열린 동안 다른 일기를 고를 수 없어서 key가 없어도 동작은 같다. 나중을 위한 **안전장치**로 남겼다.

---

## 10. 함수를 props로 넘기기와 클로저

**Q. `onOpenModal={() => setIsModalOpen(true)}`는 true를 넘기는 거야?**

아니다. **"부르면 true로 바꿔 주는 함수"를 넘긴다.**

```tsx
onOpenModal={setIsModalOpen}              // 함수 자체를 넘김 (실행 안 함)
onOpenModal={setIsModalOpen(true)}        // ❌ 지금 바로 실행, 결과(undefined)를 넘김
onOpenModal={() => setIsModalOpen(true)}  // ✅ 실행할 함수를 만들어 넘김
```

**Q. onOpenModal을 부르지 않았는데 왜 바로 실행돼?**

JSX의 `{ }` 안은 **그 줄이 그려지는 순간 계산된다.** 그리고 `()`가 붙으면 "지금 실행"이다. App이 그려질 때 App이 직접 `setIsModalOpen(true)`를 실행 → state 변경 → 다시 그림 → 또 실행… → "Too many re-renders" 에러.
비유: `f()`는 지금 전화 걸기, `() => f()`는 전화번호 메모를 건네기.

**왜 `onSelectDate={setSelectedDate}`는 감싸지 않나?** 값을 **누가 정하느냐**의 차이.
- 날짜는 자식(캘린더)이 정한다 → setter를 그대로 넘기고 자식이 `onSelectDate("2026.06.14")`로 부름
- 모달 열기는 항상 true → 값을 미리 채운 함수를 넘기고 자식은 `onOpenModal()`만 부름

**Q. 피드에서 버튼을 눌렀는데 어떻게 모달이 열려? (feed → app → modal)**

값이 피드에서 모달로 **이동하지 않는다.** 바뀌는 건 App의 state 하나다.
```
① [Feed] 버튼 클릭 → onOpenModal()
② 이 함수는 App이 만든 것 → App의 isModalOpen: false → true
③ React가 App을 다시 그림
④ {isModalOpen && <DiaryFormModal />} 가 true → 모달이 그려짐
```
②에서 피드 안에서 실행했는데 App의 state가 바뀌는 이유: **함수는 자기가 만들어진 곳의 변수를 기억한다(클로저).**

**Q. 버튼은 왜 피드 안에 있었어?** → S1에서 App으로 옮김

`fixed bottom-8 right-8`은 브라우저 화면 기준이라 어느 컴포넌트에 있든 같은 자리에 보인다. App이 화면 구성 요소를 모아 두는 곳이고, 버튼이 하는 일이 App의 state를 바꾸는 것뿐이라 App으로 옮겼다. `onOpenModal` prop이 필요 없어졌다.

---

## 11. 제어 컴포넌트와 `trim()`

**Q. `content`가 뭐야?** → 일기 본문 state.

```tsx
const [content, setContent] = useState(editingDiary?.content ?? '');

<textarea
  value={content}                               // 칸에 보이는 글 = state
  onChange={(e) => setContent(e.target.value)}  // 입력할 때마다 state 변경
/>
```
`value` + `onChange`로 입력칸을 state와 묶는 방식을 **제어 컴포넌트**라고 한다.
`e` = 이벤트 정보, `e.target` = 이벤트가 일어난 요소, `.value` = 지금 적힌 글.

**Q. `content.trim()`의 역할은?**

문자열 **앞뒤 공백(스페이스, 줄바꿈, 탭)을 잘라낸** 새 문자열을 돌려준다.
```js
"  재밌었다  ".trim()  // "재밌었다"
"   ".trim()          // ""
```
```tsx
if (!content.trim()) { alert("오늘의 직관 일기를 작성해 주세요!"); return; }
```
빈 문자열 `""`은 falsy라 `!""`는 true. → 공백만 쓰고 저장하는 걸 막는다. `trim()`은 검사에만 쓰고 저장은 원본 그대로 한다.

---

## 12. 이미지 업로드: FileReader, base64, 용량

**숨겨진 input + ref**
```tsx
<input type="file" ref={fileInputRef} accept="image/*" multiple onChange={handleImageChange} />  // 숨김
<button onClick={() => fileInputRef.current?.click()}>사진 추가</button>                         // 보이는 버튼
```
`useRef`는 화면 요소를 직접 가리키는 손잡이다. 기본 파일 입력칸은 꾸미기 어려워서 숨기고 예쁜 버튼이 대신 클릭한다.

**handleImageChange 흐름**
1. `e.target.files`: 고른 파일 목록(FileList) → `Array.from`으로 진짜 배열로
2. `기존 장수 + 이번 장수 > 5`면 전부 거절 (`return`으로 함수 종료)
3. 파일마다 `file.size > 1 * 1024 * 1024`(1MB, 바이트 단위)면 그 파일만 건너뜀 (`forEach` 안의 `return`은 다음 파일로)
4. `FileReader.readAsDataURL(file)`: 파일을 `"data:image/png;base64,..."` 문자열로 변환
5. 읽기는 비동기 → `onloadend`에 "다 읽으면 실행할 함수"를 등록 → `setUploadedImages(prev => [...prev, 결과])`

**왜 base64 문자열?** localStorage는 문자열만 저장할 수 있고, data URL은 `<img src>`에 바로 넣을 수 있다.

**용량 문제**: localStorage는 보통 약 5MB. base64는 원본보다 약 1.33배 커서 1MB × 5장이면 약 6.7MB로 한도 초과 가능. → S2에서 저장 실패 알림, S6에서 Supabase Storage에 올리고 URL만 저장하는 방식으로 해결 예정.

---

## 13. `map`과 `_`

**`map`은 배열의 칸마다 같은 작업을 해서 새 배열을 만든다.**
```js
[1, 2, 3].map((n) => n * 10)   // [10, 20, 30]
```
JSX에서는 태그 배열을 만들고, React가 순서대로 그린다.
```tsx
[1, 2, 3, 4, 5].map((box) => <button key={box}>{box}</button>)   // 박스 5개
```

`map`은 콜백에 **(값, 순서번호)** 순으로 넘긴다.
```tsx
Array.from({ length: matchFormat }).map((_, gameIdx) => ...)
```
- `Array.from({ length: 3 })`: 칸만 있고 내용은 빈 배열 → "3번 반복" 용도. `matchFormat`이 5면 5줄 → **BO 토글을 바꾸면 줄 수가 바로 바뀌는 이유**
- 순서번호만 필요한데 두 번째 자리라 첫 자리를 건너뛸 수 없다 → **"안 쓰는 값"이라는 관례로 `_`** 를 쓴다. 특별 문법이 아니라 밑줄 한 글자 변수명이다.
- `(gameIdx) => ...`로 쓰면 첫 번째 값(undefined)이 들어가서 틀린다.

---

## 14. Tailwind CSS

**Q. JSX 태그 안에 넣는 스타일들을 Tailwind라고 해?**

- `className="..."`: JSX 속성 이름 (HTML의 `class`. JS 예약어라 `className`)
- 그 안의 `flex`, `p-4`, `bg-[#0a1428]`: **Tailwind CSS 클래스**

| 클래스 | CSS |
|---|---|
| `p-4` | `padding: 1rem` |
| `rounded-full` | `border-radius: 9999px` |
| `fixed bottom-8 right-8` | `position: fixed; bottom: 2rem; right: 2rem` |
| `font-black` | `font-weight: 900` |

- `[ ]` 임의값: `bg-[#0a1428]`, `min-h-[70px]`
- `:` 조건부: `hover:`, `focus:`, `md:`(768px 이상), `lg:`(1024px 이상)
- 빌드 시 코드에서 **실제로 쓰인 클래스만** CSS로 만든다.
- className 안이라고 다 Tailwind는 아니다. 이 프로젝트의 `lck-root`, `font-heading`은 정의된 곳이 없어 효과가 없다.
- VS Code 확장 **Tailwind CSS IntelliSense**를 쓰면 마우스를 올렸을 때 실제 CSS가 보인다.

**조건부 className (BO3/BO5 토글)**
```tsx
<div className="flex bg-[#f3f4f6] rounded-lg p-1">
  <button onClick={() => setMatchFormat(3)}
    className={`text-xs ... ${matchFormat === 3 ? 'bg-white shadow-sm' : 'text-[#6b7280]'}`}>BO3</button>
  ...
</div>
```
회색 캡슐 안에서 선택된 버튼만 흰 배경과 그림자를 받는다 → 토글처럼 보인다. `` `...${ }` ``는 템플릿 문자열이다.

---

## 15. flex 레이아웃

**Q. flex는 큰 태그랑 안쪽 애들이 항상 달고 있나?**

**flex는 부모에만 단다.** 그러면 바로 아래 자식들이 가로로 나란히 선다. 자식이 여기저기 flex를 단 것처럼 보이는 건, 그 자식이 **또 다른 요소들의 부모**이기도 해서다.

```
<div flex justify-between>                    ① 블루묶음 / GAME / 레드묶음을 양끝으로
 ├ <div flex gap-1.5>                          ② 박스 5개를 가로로
 │   └ <button flex items-center justify-center>  ③ 버튼 안 아이콘을 정중앙에
 ├ <div>GAME 1</div>                          (안에 배치할 게 없으니 flex 없음)
 └ <div flex gap-1.5>
```

| 클래스 (모두 부모에) | 뜻 |
|---|---|
| `flex` | 자식을 가로로 |
| `flex-col` | 세로로 쌓기 |
| `gap-3` | 자식 사이 간격 |
| `justify-between` | 진행 방향 양끝 + 사이 벌림 |
| `justify-center` / `items-center` | 진행 방향 / 반대 방향 가운데 |

`flex items-center justify-center` = 정중앙 (모달 카드를 화면 가운데 놓는 방법).

---

## 16. relative / absolute / fixed

**Q. relative가 기준점이라 모달 위에 그려진 거야? absolute는 무슨 의미야?**

- `relative`는 모달 전체가 아니라 **박스 하나를 감싼 작은 div**에 있다.
- `absolute`: **문서 흐름에서 빠져서**(자리를 차지하지 않고 다른 요소를 밀지 않음) `top/bottom/left/right` 좌표로 떠 있다.
- 좌표의 기준은 **`relative`(또는 absolute/fixed)가 달린 가장 가까운 조상**이다.

```tsx
<div className="relative">                     {/* 기준점 */}
  <button className="w-10 h-10">□</button>     {/* 박스 높이 2.5rem */}
  {isCurrentlyActive && (
    <div className="absolute bottom-12 left-0 z-30">챔피언 선택창</div>  {/* 기준 아래에서 3rem 위 → 박스 바로 위 */}
  )}
</div>
```
`relative`가 없으면 기준이 더 바깥(모달 카드)으로 넘어가서 어느 박스를 눌러도 엉뚱한 같은 자리에 뜬다.

| | 기준 | 스크롤하면 |
|---|---|---|
| `absolute` | 가장 가까운 relative 조상 | 기준과 함께 움직임 |
| `fixed` | 브라우저 화면 | 고정 |

---

## 17. 앱 전체 데이터 흐름

```
              ┌────────── localStorage ◀── useEffect가 저장 (diaries 바뀔 때마다)
              │ (처음 한 번 읽음)
              ▼
     ┌──────── App state ────────┐
     │ diaries, selectedDate,    │
     │ currentYearMonth,         │
     │ isModalOpen, editingDiary │
     └───────────────────────────┘
       │ props (보여줄 데이터)    ▲ 함수 호출 (바꿔달라는 요청)
       ▼                         │
  ProfileHeader  ── 계산만 함
  Calendar       ── onSelectDate, setCurrentYearMonth
  DiaryFeed      ── onSelectDate, onEdit
  DiaryFormModal ── onSave, onClose
```
**데이터는 위에서 아래로(props), 변경 요청은 아래에서 위로(함수 호출).**

### 장면 A. 앱 시작
`useState(() => ...)`에서 localStorage를 읽고(없으면 샘플) → 자식에게 diaries 전달 → 승률·캘린더·피드 계산 → 그린 뒤 useEffect가 저장

### 장면 B. 새 일기 작성
+ 버튼 → `setIsModalOpen(true)` → `<DiaryFormModal key="new">` 생성(초기값 = 기본값) → 입력은 모달 state만 바뀜 → 저장 → `handleSubmit`이 Diary 객체 생성 → `onSave(newDiary)` → App `setDiaries([newDiary, ...diaries])` → 모달 사라짐, 자식 전부 다시 계산 → 피드가 새 일기 펼침 → useEffect 저장

### 장면 C. 수정
피드 "수정" → `onEdit(diary)` → App `setEditingDiary(diary)` + 열기 → `<DiaryFormModal key={diary.id}>`(초기값 = 기존 값, 날짜 형식 변환) → 저장 시 id 유지 → `diaries.map(d => d.id === id ? newDiary : d)`
신규/수정은 `editingDiary`가 null인지 하나로 갈린다.

### 장면 D. 캘린더 날짜 클릭
`"2026.06.14"` 문자열 생성 → `onSelectDate` → App `selectedDate` 변경 → 캘린더는 금색 테두리, 피드는 필터링 + 첫 카드 펼침
캘린더와 피드는 서로 모르지만 **App의 같은 state를 보기 때문에** 연결된다.

### 장면 E. 달 이동
`onSelectDate(null)` + `setCurrentYearMonth(prev => ...)` → 캘린더가 새 달의 일수·시작 요일 계산
