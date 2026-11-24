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

// 닉네임 변경 제한 기간 (DB 트리거 guard_nickname_change와 같은 값)
export const NICKNAME_LOCK_DAYS = 90;

// 다음 닉네임 변경 가능 시각. 첫 변경 전(null)이거나 이미 지났으면 null
export function getNicknameUnlockDate(profile: Profile, now = new Date()): Date | null {
  if (!profile.nicknameChangedAt) return null;
  const unlock = new Date(profile.nicknameChangedAt);
  unlock.setDate(unlock.getDate() + NICKNAME_LOCK_DAYS);
  return unlock > now ? unlock : null;
}

// 화면에서 보여줄 수 있는 문구를 가진 에러
export class ProfileUpdateError extends Error {}

export interface ProfileChanges {
  nickname?: string;
  tag?: string;
  myTeam?: string | null;
}

// 내 프로필 수정. 넘긴 항목만 DB에 보냄. 실패하면 안내 문구를 담은 ProfileUpdateError 발생
export async function updateProfile(userId: string, changes: ProfileChanges): Promise<Profile> {
  const row: Partial<ProfileRow> = {};
  if (changes.nickname !== undefined) row.nickname = changes.nickname;
  if (changes.tag !== undefined) row.tag = changes.tag;
  if (changes.myTeam !== undefined) row.my_team = changes.myTeam;

  const { data, error } = await supabase
    .from('profiles')
    .update(row)
    .eq('id', userId)
    .select(COLUMNS)
    .single<ProfileRow>();

  if (error) {
    console.error('프로필 수정 실패:', error);
    if (error.code === UNIQUE_VIOLATION) {
      throw new ProfileUpdateError('이미 다른 사람이 쓰고 있는 닉네임#태그예요. 다른 이름이나 태그를 골라 주세요.');
    }
    // 트리거가 raise exception으로 보낸 문구는 message에 그대로 들어옴
    if (error.message.includes('nickname_change_too_soon')) {
      throw new ProfileUpdateError(`닉네임은 ${NICKNAME_LOCK_DAYS}일에 한 번만 바꿀 수 있어요.`);
    }
    throw new ProfileUpdateError('프로필을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.');
  }
  return toProfile(data);
}
