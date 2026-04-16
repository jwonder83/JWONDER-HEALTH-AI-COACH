/** Vercel 등 배포 환경에서 NEXT_PUBLIC Supabase 변수 누락 시 안내 */
export function SupabaseEnvMissingBanner() {
  return (
    <div className="rounded-xl border border-amber-200/90 bg-amber-50/95 px-4 py-3 text-left text-[13px] leading-relaxed text-amber-950 shadow-sm">
      <p className="font-semibold text-amber-900">Supabase 공개 환경 변수를 찾을 수 없습니다</p>
      <p className="mt-1.5 text-amber-900/90">
        Vercel <span className="font-medium">Settings → Environment Variables</span>에{" "}
        <code className="rounded bg-white/80 px-1 font-mono text-[12px]">NEXT_PUBLIC_SUPABASE_URL</code> 과{" "}
        <code className="rounded bg-white/80 px-1 font-mono text-[12px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
        (또는 <code className="rounded bg-white/80 px-1 font-mono text-[12px]">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>)를
        넣은 뒤 <strong className="font-semibold">Redeploy</strong>하세요.
      </p>

      <details className="mt-3 rounded-lg border border-amber-200/70 bg-white/50 px-3 py-2 text-[12px] text-amber-900/90">
        <summary className="cursor-pointer font-medium text-amber-900 select-none">자세한 단계</summary>
        <ul className="mt-2 list-inside list-disc space-y-1.5 font-mono text-[11px] text-amber-900/85">
          <li>
            값은 Supabase → <strong className="font-sans">Project Settings → API</strong> 의 Project URL / anon(또는 publishable) 키와
            동일하게 붙여 넣습니다.
          </li>
          <li>Preview에서도 쓰려면 Preview 환경에도 같은 이름으로 추가합니다.</li>
          <li>
            <code className="rounded bg-white/80 px-1">NEXT_PUBLIC_*</code> 는 빌드에 포함되므로 변수를 바꾼 뒤에는 반드시 다시 배포합니다.
          </li>
          <li>
            이메일 링크·OAuth 리다이렉트: Supabase → <strong className="font-sans">Authentication → URL Configuration</strong> → Redirect
            URLs에 <code className="rounded bg-white/80 px-1">https://(배포도메인)/auth/callback</code> 을 추가합니다.
          </li>
        </ul>
      </details>
    </div>
  );
}
