# DB 설계 (Supabase)

S4에서 만든 설계 문서다. 일기 데이터를 localStorage에서 Supabase(PostgreSQL)로 옮기기 위한 테이블, 컬럼, 보안 규칙(RLS)을 정한다.
실제 앱 연결은 S5(로그인), S6(데이터 이전)에서 한다.

## 1. 설계 원칙: 원하는 것만 써도 되는 간편한 일기

- 필수 항목은 **날짜, 경기, 일기 내용** 세 가지뿐이다.
- 나머지(장소, POM, 사진, 밴픽)는 선택 항목이다. 쓰지 않으면 비어 있는 값으로 저장하고, **기록을 보는 화면(피드, 캘린더)에는 표시하지 않는다.**
  - "미지정" 같은 글자, 회색 대체 이미지, "밴픽 정보 없음" 안내를 보여주지 않는다. 사용자가 빈칸을 채워야 한다는 부담을 느끼지 않게 하기 위해서다.
  - 작성 모달의 입력 칸은 그대로 보여준다.
  - 화면 변경은 S6에서 한다. 사진이 없는 카드의 배치는 S6에서 화면을 보면서 정한다.
- 비어 있는 값은 이렇게 맞춘다.
  - 글자 하나짜리 항목(`location`, `pom`): `null`
  - 여러 개를 담는 항목(`image_paths`, `picked_champions`): 빈 배열 `{}` / 빈 객체 `{}`
  - 이유: 목록은 "0개"가 자연스러운 빈 상태다. 빈 값으로 두면 앱에서 null 검사 없이 `length`나 `Object.keys`로 바로 셀 수 있다.
- 승패와 승률은 지금처럼 저장하지 않고 앱에서 계산한다(`getMyResult`, `getWinStats`). 내 팀을 바꾸면 자동으로 다시 계산된다.

## 2. 테이블

Supabase에는 로그인 정보를 담는 `auth.users` 테이블이 이미 있다. 앱이 쓰는 사용자 정보는 `profiles`에 따로 두고 `auth.users`와 1:1로 연결한다(Supabase에서 흔히 쓰는 방식).

### profiles: 사용자 설정

| 컬럼 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `id` | uuid, PK | O | `auth.users.id`와 같은 값. 계정이 지워지면 함께 지워짐 |
| `my_team` | text | | 내 팀(응원팀) id. 지금의 localStorage `lol-my-team`. null이면 앱이 팀 선택 모달을 띄움 |
| `created_at` | timestamptz | O | 가입 시각, 기본값 `now()` |

### diaries: 일기

| 컬럼 | 타입 | 필수 | 지금 `Diary` 필드 | 설명 |
|---|---|---|---|---|
| `id` | bigint, 자동 증가 PK | O | `id` | 지금은 `Date.now()`. DB에서는 DB가 번호를 매기므로 앱은 작성할 때 `id`를 보내지 않음 |
| `user_id` | uuid | O | (없음) | 작성자. 기본값 `auth.uid()`(로그인한 사용자) |
| `date` | date | O | `date` | 직관 날짜. 앱은 `"YYYY.MM.DD"`, DB는 날짜 타입(`YYYY-MM-DD`). S6에서 변환 함수 추가 |
| `match` | jsonb | O | `match` | 고른 경기(`Match` 객체)를 통째로 복사해 저장. 아래 3-2 참고 |
| `content` | text | O | `content` | 일기 내용. 빈 글자 불가 |
| `location` | text | | `location` | 장소. 비면 null (지금은 `"미지정 장소"`를 저장함) |
| `pom` | text | | `pom` | POM. 비면 null (지금은 `"미지정"`을 저장함) |
| `picked_champions` | jsonb | O | `pickedChampions` | 밴픽. 키 형식 `game{세트}-{blue\|red}-{칸}` 그대로. 비면 `{}` |
| `image_paths` | text[] | O | `images` | 사진. S6에서 base64 대신 Supabase Storage 파일 경로를 저장. 비면 `{}` |
| `representative_index` | int | O | `representativeIndex` | 대표 사진 순서. 기본값 0 |
| `created_at` | timestamptz | O | (없음) | 작성 시각 |
| `updated_at` | timestamptz | O | (없음) | 마지막 수정 시각. 수정하면 트리거가 자동으로 갱신 |

- 구버전 호환용 `image` 필드는 만들지 않는다. 대표 사진은 `image_paths[representative_index]`로 알 수 있다.
- `(user_id, date)` 인덱스를 둔다. "내 일기를 날짜순으로" 불러오는 조회가 가장 많기 때문이다.

## 3. 설계 결정과 이유

### 3-1. 팀 테이블을 두지 않음

- 팀 10개는 `src/data/teams.ts`에 코드로 둔다. 쓰는 곳은 팀 선택 모달(`TEAMS`)과 ProfileHeader의 팀 이름 표시(`getTeamName`) 두 곳뿐이다.
- LCK 팀은 1년에 한 번 정도 바뀌므로 코드 수정과 배포로 충분하다. DB 테이블로 두면 앱을 켤 때마다 팀 목록을 한 번 더 불러와야 하고 읽기 정책도 따로 필요하다.
- 잘못된 팀 id는 앱 코드(TypeScript 타입, 팀 선택 모달)가 막는다.
- **다시 검토할 시점:** 경기 API를 붙이거나 팀 로고·마스코트를 넣을 때. 그때 `teams`, `matches` 테이블을 함께 만드는 것이 자연스럽다.

### 3-2. 경기(`match`)를 jsonb로 저장

`team_a`, `score_a`처럼 컬럼으로 나누는 방법과 비교했다. S4 시점 코드에서 `match`를 쓰는 곳은 모두 앱 안에서 처리한다.

| 위치 | 쓰는 방법 |
|---|---|
| `DiaryFeed` | `teamA vs teamB`, 스코어, 승패 배지 |
| `SpectateCalendar` | 상대팀, 내 기준 스코어 |
| `utils/matchResult.ts` | 승패·승률 계산 (팀과 스코어가 함께 필요) |

컬럼으로 나눴을 때 쓸모가 생길 만한 경우도 따져봤다.
- "내 팀 경기만" 필터, 승률: 일기를 모두 불러와 앱에서 계산한다. 개인 일기라 많아야 수십~수백 건이라 충분하다.
- S7 LLM 리포트: Edge Function이 내 일기를 읽어 AI에 넘기므로 저장 형식과 무관하다.
- 상대팀별 승률 같은 DB 집계: PostgreSQL은 `match->>'teamA'`처럼 jsonb 안의 값도 조회·집계할 수 있다.
- 같은 경기를 본 다른 사용자 찾기(소셜 기능): `match->>'id'`로 가능하다. 다만 이런 기능이 생기면 `matches` 테이블을 만들고 `match_id`로 연결하는 구조가 더 맞다.

컬럼 방식의 장점은 DB가 값을 검사해준다는 점이다(예: `format`은 1·3·5만). jsonb는 모양을 검사하지 않는다. 하지만 일기는 이 앱만 저장하고, 앱의 `Match` 타입이 이미 모양을 막아준다.

**결론:** 지금 기능과 S5~S7 계획 중 컬럼이 꼭 필요한 곳이 없다. jsonb로 저장하면 "고른 경기를 복사해 저장한다"는 지금 방식과 같고 앱 코드도 거의 그대로 둘 수 있다. `matches` 테이블을 만들 때 다시 검토한다.

### 3-3. 비어 있는 항목은 null 또는 빈 값

1번 설계 원칙 참고. 지금 앱은 `"미지정 장소"`, `"미지정"`이라는 글자를 저장하고 수정 모드에서 다시 지운다. DB에는 값이 없다는 뜻 그대로 null을 저장하고, 화면에서는 아예 표시하지 않는다.

## 4. 접근 권한(GRANT)과 RLS(행 단위 보안) 정책

보안을 두 겹으로 둔다.
1. **GRANT(테이블 단위):** 이 테이블을 만질 수 있는지. 로그인한 사용자(`authenticated`)에게만 연다.
2. **RLS(행 단위):** 그중 어느 행을 만질 수 있는지. 자기 데이터만 허용한다.

프로젝트를 만들 때 Security 설정은 이렇게 했다.
- Enable Data API: 켬. 앱(`supabase-js`)이 DB를 부르는 통로다.
- Automatically expose new tables: **끔**(Supabase 권장). 새 테이블에 권한이 자동으로 열리지 않으므로 5번 SQL에서 GRANT로 직접 연다.
- Enable automatic RLS: 켬. 새 테이블에 RLS를 자동으로 켜는 안전장치다(5번 SQL에서도 직접 켠다).

- Supabase는 브라우저에서 바로 DB를 부른다. 이때 쓰는 키(publishable 키, 예전 이름은 anon 키)는 프론트엔드 코드에 들어가 누구나 볼 수 있다.
- 그래서 "누가 어떤 행을 볼 수 있는지"를 DB가 직접 검사해야 한다. 이것이 RLS다.
- RLS를 켜고 정책이 없으면 기본값은 **전부 거부**다. 아래 정책으로 필요한 것만 허용한다.

| 테이블 | 조회 | 작성 | 수정 | 삭제 |
|---|---|---|---|---|
| `profiles` | 내 행만 (`id = auth.uid()`) | 내 행만 | 내 행만 | 허용 안 함 (계정 삭제 시 자동 삭제) |
| `diaries` | 내 일기만 (`user_id = auth.uid()`) | 내 것으로만 | 내 일기만 | 내 일기만 |

- 정책은 로그인한 사용자(`authenticated`)에게만 준다. 로그인하지 않은 사용자(`anon`)는 아무것도 못 한다.
- `service_role` 키는 RLS를 무시하는 관리자 키다. 프론트엔드 코드, GitHub, Vercel 환경변수 어디에도 넣지 않는다.

## 5. 실행할 SQL

Supabase 대시보드 → SQL Editor에 붙여 넣고 한 번 실행한다.

```sql
-- 사용자 설정. auth.users와 1:1, 계정 삭제 시 함께 삭제됨
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  my_team text,
  created_at timestamptz not null default now()
);

-- 일기. 필수는 date, match, content뿐. 선택 항목은 null 또는 빈 값
create table public.diaries (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null,
  match jsonb not null check (jsonb_typeof(match) = 'object'),
  content text not null check (char_length(content) > 0),
  location text,
  pom text,
  picked_champions jsonb not null default '{}'::jsonb,
  image_paths text[] not null default '{}',
  representative_index int not null default 0 check (representative_index >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 내 일기를 날짜순으로 불러오는 조회용
create index diaries_user_id_date_idx on public.diaries (user_id, date desc);

-- 수정할 때 updated_at 자동 갱신
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger diaries_set_updated_at
  before update on public.diaries
  for each row execute function public.set_updated_at();

-- 테이블 접근 권한. 로그인한 사용자(authenticated)에게만 부여, anon에는 부여 안 함
-- (프로젝트 생성 시 "Automatically expose new tables"를 꺼서 직접 부여해야 함)
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.diaries to authenticated;

-- 기본으로 남는 권한 회수. "expose"를 꺼도 REFERENCES, TRIGGER, TRUNCATE는 남아 있었음(10/19 확인)
-- TRUNCATE는 RLS를 무시하고 테이블 전체를 지울 수 있어 특히 회수 필요
revoke references, trigger, truncate on public.profiles, public.diaries from anon, authenticated;

-- RLS 켜기. 정책이 없으면 전부 거부됨
alter table public.profiles enable row level security;
alter table public.diaries enable row level security;

-- profiles: 로그인한 사용자가 자기 행만 조회·작성·수정
create policy "profiles: 내 행 조회" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "profiles: 내 행 작성" on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

create policy "profiles: 내 행 수정" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- diaries: 로그인한 사용자가 자기 일기만 조회·작성·수정·삭제
create policy "diaries: 내 일기 조회" on public.diaries
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "diaries: 내 일기 작성" on public.diaries
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "diaries: 내 일기 수정" on public.diaries
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "diaries: 내 일기 삭제" on public.diaries
  for delete to authenticated
  using ((select auth.uid()) = user_id);
```

- `auth.uid()`를 `(select auth.uid())`로 감싼 것은 Supabase 권장 방식이다. 행마다 다시 계산하지 않고 한 번만 계산한다.
- 수정 정책에 `with check`도 둔 것은 내 일기의 `user_id`를 남의 id로 바꾸는 것을 막기 위해서다.

## 6. 환경변수

| 이름 | 값을 찾는 곳 | 공개돼도 되나 |
|---|---|---|
| `VITE_SUPABASE_URL` | 대시보드 → Project Settings → API (또는 Connect) 의 Project URL | O |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | 같은 화면의 publishable 키(`sb_publishable_...`) | O (GRANT와 RLS가 지켜줌) |

- 로컬: 프로젝트 루트에 `.env.local`을 만들고 값을 적는다. `.gitignore`가 막아서 커밋되지 않는다. 이름 견본은 `.env.example`에 있다.
- 배포: Vercel → 프로젝트 Settings → Environment Variables에 같은 두 값을 등록한다.
- Vite는 `VITE_`로 시작하는 변수만 브라우저 코드에 넣는다. 그래서 `VITE_`가 붙은 변수에는 공개돼도 되는 값만 둔다.
- 이 프로젝트 대시보드에는 publishable 키로 표시된다(10/19 확인). 예전 Supabase 자료의 anon 키와 같은 역할이다.
- 같은 화면의 secret 키(또는 예전 이름 service_role 키)는 RLS를 무시하는 관리자 키다. 어디에도 넣지 않는다.

## 7. 검증 방법 (사용자)

1. SQL Editor에서 아래 확인 쿼리를 실행한다(읽기만 함).
   - `grant`: `diaries | authenticated: DELETE, INSERT, SELECT, UPDATE`, `profiles | authenticated: INSERT, SELECT, UPDATE` 두 줄만. `anon` 줄은 없어야 함
   - `rls`: 두 테이블 모두 `true`
   - `policy`: 7줄(profiles 3, diaries 4)
   - `trigger`: `diaries_set_updated_at`

   ```sql
   select 'grant' as kind, table_name as tbl,
          grantee || ': ' || string_agg(privilege_type, ', ' order by privilege_type) as detail
   from information_schema.role_table_grants
   where table_schema = 'public' and grantee in ('anon', 'authenticated')
   group by table_name, grantee
   union all
   select 'rls', tablename, rowsecurity::text
   from pg_tables where schemaname = 'public'
   union all
   select 'policy', tablename, policyname || ' (' || cmd || ')'
   from pg_policies where schemaname = 'public'
   union all
   select 'trigger', event_object_table, trigger_name
   from information_schema.triggers where trigger_schema = 'public'
   order by 1, 2, 3;
   ```
2. 로그인하지 않은 상태에서 일기 조회가 막히는지 확인한다.
   - SQL Editor는 관리자 권한으로 실행되어 RLS를 무시하므로, 이 확인에는 쓸 수 없다.
   - PowerShell에서 아래 명령을 실행한다. HTTP 401과 `permission denied for table diaries`가 나오면 정상이다(anon에는 GRANT가 없어 테이블 단계에서 막힘. 10/19 확인).

   ```powershell
   $url = "https://<프로젝트>.supabase.co"
   $key = "<publishable 키>"
   Invoke-RestMethod "$url/rest/v1/diaries?select=*" -Headers @{ apikey = $key; Authorization = "Bearer $key" }
   ```

   - 확실히 하려면 SQL Editor에서 시험용 일기를 한 줄 넣고(이때 `user_id`는 Authentication 화면에서 만든 시험 사용자 id) 같은 명령을 다시 실행한다. 여전히 401이면 로그인하지 않은 사용자는 데이터가 있어도 볼 수 없는 것이다. 로그인한 사용자끼리 서로의 일기가 안 보이는지(RLS)는 S5에서 로그인을 붙인 뒤 확인한다. 확인 후 시험 데이터는 지운다.
3. `git status`에 `.env.local`이 나오지 않는지 확인한다.

## 8. 다음 단계로 넘기는 것

- **S5:** 가입할 때 `profiles` 행을 만드는 방법을 정한다.
  - 후보 A: `auth.users`에 행이 생길 때 DB 트리거가 `profiles` 행을 자동으로 만든다. 앱 코드가 단순해진다.
  - 후보 B: 앱에서 처음 팀을 고를 때 `profiles`에 upsert한다. 트리거가 없어 구조를 이해하기 쉽다.
- **S6:**
  - 일기 CRUD를 Supabase로 교체한다. 날짜 형식 변환(`YYYY.MM.DD` ↔ `YYYY-MM-DD`), 컬럼 이름 변환(`picked_champions` ↔ `pickedChampions`)을 둔다.
  - `Diary` 타입에서 `location`, `pom`을 `string | null`로 바꾸고, `"미지정"` 저장을 없앤다.
  - 비어 있는 선택 항목(장소, POM, 사진, 밴픽)을 화면에 표시하지 않는다.
  - 사진용 Storage 버킷과 정책을 만든다(자기 폴더만 올리고 읽기).
- **이후:** 경기 API, 팀 로고를 붙일 때 `teams`, `matches` 테이블을 검토한다.
- **새 테이블을 만들 때마다:** GRANT로 필요한 권한만 열고, 기본으로 남는 `REFERENCES`, `TRIGGER`, `TRUNCATE`를 회수한 뒤 7번 확인 쿼리로 점검한다.
