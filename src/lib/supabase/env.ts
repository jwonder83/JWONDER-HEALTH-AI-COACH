export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

/** anon(레거시) 또는 publishable 키 */
export function getSupabaseAnonKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** 서버·클라이언트 공통: 공개 Supabase 키 쌍이 준비됐는지 (Vercel 등 배포 시 필수) */
export function isSupabasePublicEnvConfigured(): boolean {
  const url = getSupabaseUrl()?.trim();
  const key = getSupabaseAnonKey()?.trim();
  return Boolean(url && key);
}
