import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// 환경변수가 없으면 원인을 바로 알 수 있게 에러 발생 (값 위치는 .env.example 참고)
if (!url || !key) {
  throw new Error('VITE_SUPABASE_URL 또는 VITE_SUPABASE_PUBLISHABLE_KEY가 없음. .env.local을 확인할 것');
}

// 앱 전체에서 같이 쓰는 클라이언트 하나. 로그인 정보는 localStorage에 자동 저장됨
export const supabase = createClient(url, key);
