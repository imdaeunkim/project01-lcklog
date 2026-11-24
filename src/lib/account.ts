import { supabase } from './supabase';
import { BUCKET } from './diaries';
import { updateProfile } from './profile';
import type { Profile } from '../types/profile';

const LIST_PAGE_SIZE = 100;

// Storage의 내 폴더({userId}/)를 모두 비움. 실패하면 에러 발생 (다시 시도하면 남은 파일부터 이어서 지움)
async function removeAllMyImages(userId: string): Promise<void> {
  const bucket = supabase.storage.from(BUCKET);
  while (true) {
    // 지운 만큼 목록이 줄어들므로 매번 처음부터 받음
    const { data: files, error: listError } = await bucket.list(userId, { limit: LIST_PAGE_SIZE });
    if (listError) throw listError;
    if (files.length === 0) return;

    const { data: removed, error: removeError } = await bucket.remove(files.map((f) => `${userId}/${f.name}`));
    if (removeError) throw removeError;
    // 권한이 없으면 에러 없이 0개가 지워짐 → 같은 목록을 계속 받지 않도록 멈춤
    if (removed.length === 0) throw new Error('사진 파일을 지울 수 없음 (Storage 삭제 정책 확인 필요)');
  }
}

// 초기화. 내 일기 전체와 사진 전체를 지우고 내 팀을 "팀 없음"으로 되돌림. 닉네임·태그는 유지.
// 바뀐 프로필을 돌려줌
export async function resetMyData(userId: string): Promise<Profile> {
  const { error } = await supabase.from('diaries').delete().eq('user_id', userId);
  if (error) throw error;
  await removeAllMyImages(userId);
  return updateProfile(userId, { myTeam: null });
}

// 회원탈퇴. 사진을 먼저 지우고(계정이 지워지면 내 폴더 권한도 사라짐) DB 함수로 계정 삭제.
// 계정이 지워지면 profiles, diaries는 DB가 함께 지움(on delete cascade). 마지막에 이 브라우저에서 로그아웃
export async function deleteMyAccount(userId: string): Promise<void> {
  await removeAllMyImages(userId);
  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw error;
  // 서버에는 이미 계정이 없으므로 이 브라우저의 로그인 정보만 지움
  await supabase.auth.signOut({ scope: 'local' });
}
