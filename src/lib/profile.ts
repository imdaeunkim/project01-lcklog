import { supabase } from './supabase';
import type { Profile } from '../types/profile';
import { createRandomNickname } from '../utils/randomNickname';

// DB profiles 행에서 읽어오는 컬럼 (DB는 snake_case)
const COLUMNS = 'nickname, tag, my_team, nickname_changed_at';
interface ProfileRow {
  nickname: string;
  tag: string;
  my_team: string | null;
  nickname_changed_at: string | null;
}

// 고유 제약 위반 에러 코드 (PostgreSQL). 같은 id 또는 같은 닉네임#태그가 이미 있음
const UNIQUE_VIOLATION = '23505';
const MAX_CREATE_TRIES = 5;

function toProfile(row: ProfileRow): Profile {
  return {
    nickname: row.nickname,
    tag: row.tag,
    myTeam: row.my_team,
    nicknameChangedAt: row.nickname_changed_at,
  };
}

// 내 프로필 조회. 행이 없으면 null
async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select(COLUMNS).eq('id', userId).maybeSingle<ProfileRow>();
  if (error) throw error;
  return data ? toProfile(data) : null;
}

// 내 프로필을 불러옴. 처음 로그인이라 행이 없으면 무작위 닉네임 + 팀 없음으로 생성
export async function loadOrCreateProfile(userId: string): Promise<Profile> {
  const existing = await fetchProfile(userId);
  if (existing) return existing;

  for (let i = 0; i < MAX_CREATE_TRIES; i++) {
    const { nickname, tag } = createRandomNickname();
    const { data, error } = await supabase
      .from('profiles')
      .insert({ id: userId, nickname, tag })
      .select(COLUMNS)
      .single<ProfileRow>();
    if (!error) return toProfile(data);
    if (error.code !== UNIQUE_VIOLATION) throw error;

    // 중복 에러: 다른 요청이 내 행을 먼저 만들었으면(StrictMode에서 두 번 실행 등) 그 행을 사용.
    // 행이 없으면 닉네임이 겹친 것이므로 새 이름으로 다시 시도
    const created = await fetchProfile(userId);
    if (created) return created;
  }
  throw new Error('무작위 닉네임 생성에 계속 실패함');
}
