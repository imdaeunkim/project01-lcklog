import { useState } from 'react';
import { supabase } from '../lib/supabase';

// 첫 화면. 로그인해야만 앱 사용 가능
export default function LoginScreen() {
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Google 로그인 페이지로 이동. 로그인 후 지금 주소(로컬 또는 배포 사이트)로 돌아옴
  const handleGoogleLogin = async () => {
    setIsRedirecting(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      console.error('로그인 시작 실패:', error);
      alert('로그인을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.');
      setIsRedirecting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a1428] p-4">
      <div className="w-full max-w-sm rounded-xl border border-[#c8aa6e] bg-[#0a1428] p-8 text-center text-[#f0e6d2] shadow-2xl">
        <span className="mx-auto flex size-12 items-center justify-center rounded-lg bg-[#c8aa6e] text-lg font-black text-[#0a1428]">
          LCK
        </span>
        <h1 className="mt-4 text-2xl font-black text-white">직관 다이어리</h1>
        <p className="mt-1 text-xs text-[#9e9eb1]">나만을 위한 하이라이트 직관 기록</p>

        <button
          onClick={handleGoogleLogin}
          disabled={isRedirecting}
          className="mt-8 w-full rounded-lg bg-[#c8aa6e] py-3 text-sm font-black text-[#0a1428] transition-opacity disabled:opacity-50"
        >
          {isRedirecting ? '이동하는 중…' : 'Google로 시작하기'}
        </button>
      </div>
    </div>
  );
}
