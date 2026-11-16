import { useState } from 'react';
import { CircleUserRound, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/profile';

interface UserMenuProps {
  profile: Profile;
}

// 상단 바 오른쪽 메뉴. 지금은 로그아웃만 있음 (프로필 수정은 S6, 초기화·회원탈퇴는 S7에서 추가)
export default function UserMenu({ profile }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 로그아웃하면 App의 onAuthStateChange가 감지해서 로그인 화면으로 전환
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center rounded-full p-1 text-[#f0e6d2] transition-colors hover:bg-[#121c2c]"
        title="내 메뉴"
      >
        <CircleUserRound className="size-6" />
      </button>

      {isOpen && (
        <>
          {/* 메뉴 바깥을 누르면 닫히도록 화면 전체를 덮는 투명 버튼 */}
          <button className="fixed inset-0 z-20 cursor-default" onClick={() => setIsOpen(false)} aria-label="메뉴 닫기" />
          <div className="absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-lg border border-[#c8aa6e] bg-[#0a1428] shadow-2xl">
            <div className="border-b border-[#1e2837] px-4 py-3">
              <p className="truncate text-sm font-black text-white">{profile.nickname}</p>
              <p className="text-xs font-bold text-[#616c7f]">#{profile.tag}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-bold text-[#f0e6d2] transition-colors hover:bg-[#121c2c]"
            >
              <LogOut className="size-4" />
              로그아웃
            </button>
          </div>
        </>
      )}
    </div>
  );
}
