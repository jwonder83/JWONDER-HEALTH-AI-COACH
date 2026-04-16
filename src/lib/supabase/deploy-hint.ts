/** 배포 환경에서 NEXT_PUBLIC Supabase 키가 없을 때 로그인·가입 화면에 보이는 한 문단 안내 */
export const SUPABASE_VERCEL_DEPLOY_HINT =
  "Vercel Settings → Environment Variables에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY(또는 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)를 Supabase API 화면과 동일하게 넣은 뒤 Redeploy하세요. Supabase Authentication → URL Configuration → Redirect URLs에는 https://배포도메인/auth/callback 처럼 스킴·호스트를 포함한 전체 URL을 추가하세요.";
