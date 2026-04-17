/** 배포 환경에서 NEXT_PUBLIC Supabase 키가 없을 때 로그인·가입 화면에 보이는 한 문단 안내 */
export const SUPABASE_VERCEL_DEPLOY_HINT =
  "Supabase 키는 코드로 채워지지 않습니다. Vercel 웹 → 프로젝트 선택 → Settings → Environment Variables에서 Production(및 Preview)에 다음을 직접 추가하세요: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 또는 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. 값은 Supabase → Project Settings → API와 동일하게 붙여 넣은 뒤 Deployments에서 Redeploy 하세요. 같은 Supabase 화면 → Authentication → URL Configuration → Redirect URLs에 https://(실제배포주소)/auth/callback 전체 URL을 추가하세요.";
