/// <reference types="vite/client" />

// .env.local의 환경변수 타입. 이름 오타를 타입 체크로 잡기 위함
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
