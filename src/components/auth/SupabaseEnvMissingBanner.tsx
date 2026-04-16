/** Vercel 등 배포 환경에서 NEXT_PUBLIC Supabase 변수 누락 시 안내 */
export function SupabaseEnvMissingBanner() {
  return (
    <div className="rounded-xl border border-amber-200/90 bg-amber-50/95 px-4 py-3 text-left text-[13px] leading-relaxed text-amber-950 shadow-sm">
      <p className="font-semibold text-amber-900">Supabase 환경 변수가 서버에 없습니다</p>
      <p className="mt-2 text-amber-900/90">
        <strong className="font-semibold">Vercel</strong> → 프로젝트 → <strong className="font-semibold">Settings → Environment Variables</strong>에 아래를
        등록하세요. (Production·Preview 모두 필요하면 각각 추가)
      </p>
      <ul className="mt-2 list-inside list-disc space-y-1 font-mono text-[12px] text-amber-900/85">
        <li>
          <code className="rounded bg-white/80 px-1">NEXT_PUBLIC_SUPABASE_URL</code> — Supabase 대시보드 → Project Settings → API → Project URL
        </li>
        <li>
          <code className="rounded bg-white/80 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> 또는{" "}
          <code className="rounded bg-white/80 px-1">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> — 같은 화면의 anon / publishable 키
        </li>
      </ul>
      <p className="mt-2 text-amber-900/90">
        저장한 뒤 반드시 <strong className="font-semibold">Deployments → 해당 배포의 Redeploy</strong>를 실행하세요.{" "}
        <code className="rounded bg-white/80 px-1">NEXT_PUBLIC_*</code> 값은 빌드 시점에 번들에 포함됩니다.
      </p>
      <p className="mt-2 text-amber-900/90">
        로그인·가입 후 리다이렉트를 쓰려면 Supabase → <strong className="font-semibold">Authentication → URL Configuration</strong>에{" "}
        <code className="rounded bg-white/80 px-1">https://(배포도메인)/auth/callback</code> 을 Redirect URLs에 넣으세요.
      </p>
    </div>
  );
}
