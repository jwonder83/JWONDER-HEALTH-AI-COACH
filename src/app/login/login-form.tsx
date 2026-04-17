"use client";

import { AuthSplitShell } from "@/components/auth/AuthSplitShell";
import { SUPABASE_VERCEL_DEPLOY_HINT } from "@/lib/supabase/deploy-hint";
import { createClient } from "@/lib/supabase/client";
import type { SiteSettingsMerged } from "@/types/site-settings";
import Link from "next/link";
import { useId, useState } from "react";

const fieldClass =
  "mt-2 w-full rounded-2xl border border-orange-100/90 bg-white px-3.5 py-3.5 text-[17px] tracking-tight text-apple-ink shadow-sm transition placeholder:text-apple-subtle hover:border-apple/20 focus:border-apple/45 focus:outline-none focus:ring-4 focus:ring-apple/15";

function isSafeInternalPath(path: string | null | undefined): path is string {
  if (!path || typeof path !== "string") return false;
  const t = path.trim();
  return t.startsWith("/") && !t.startsWith("//") && !t.includes("://");
}

type Props = {
  site: SiteSettingsMerged;
  postLoginRedirect?: string | null;
  /** /login?error=… 쿼리(서버에서 전달) */
  urlError?: string;
  /** 서버에서 NEXT_PUBLIC Supabase 쌍 검사 결과 */
  supabaseEnvReady: boolean;
};

export function LoginForm({ site, postLoginRedirect, urlError, supabaseEnvReady }: Props) {
  const err = urlError;
  const fid = useId();
  const idEmail = `${fid}-email`;
  const idPassword = `${fid}-password`;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /** 긴 Vercel·Supabase 설정 안내: 공개 env가 서버에 없을 때만 */
  const showDeployHint = !supabaseEnvReady;
  /** env는 있는데 앱 레이아웃에서 다른 오류가 난 경우 */
  const showServerError = err === "server";
  /** 예전 링크(?error=config)만 있고 env는 이미 맞춰진 경우 등 */
  const showConfigOther = err === "config" && supabaseEnvReady;

  const errorHint =
    err === "auth"
      ? "인증에 실패했습니다. 다시 시도해 주세요."
      : err === "config"
        ? "이전에 설정 오류로 이동된 링크일 수 있습니다. 주소의 ?error=… 를 지우고 다시 시도해 보세요."
        : err === "server"
          ? "앱을 불러오는 중 오류가 났습니다. 잠시 후 다시 시도하거나 Vercel·Supabase 상태를 확인해 주세요."
          : err === "no_code"
            ? "인증 코드가 없습니다."
            : null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMsg(error.message);
        setLoading(false);
        return;
      }
      await supabase.auth.getSession();
      const candidate = postLoginRedirect?.trim() || "";
      const safe = isSafeInternalPath(candidate) ? candidate : "/";
      // 전체 이동: 새 탭·클라이언트 로그인 직후에도 세션 쿠키가 서버에 반영되도록 함
      window.location.assign(safe);
    } catch {
      setMsg("로그인 처리 중 오류가 났습니다. 환경 변수를 확인해 주세요.");
      setLoading(false);
    }
  }

  return (
    <>
      <Link
        href="/admin"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-4 top-4 z-50 rounded-full border border-orange-100 bg-white/95 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-apple shadow-md backdrop-blur-md transition hover:bg-apple/10 sm:right-6 sm:top-5"
      >
        ADMIN
      </Link>
      <main id="main-content" tabIndex={-1} className="outline-none">
    <AuthSplitShell
      panelImage={site.images.authPanel}
      eyebrow={site.copy.loginPanel.eyebrow}
      panelTitle={site.copy.loginPanel.title}
      panelDescription={site.copy.loginPanel.description}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-apple">{site.copy.loginCard.eyebrow}</p>
      <h1 className="font-display mt-3 text-[1.75rem] font-bold tracking-[-0.03em] text-apple-ink sm:text-[1.875rem]">{site.copy.loginCard.title}</h1>
      <p className="mt-3 text-[17px] font-normal leading-[1.45] tracking-[-0.012em] text-apple-subtle">{site.copy.loginCard.subtitle}</p>

      {showDeployHint ? (
        <p className="mt-6 rounded-lg border border-amber-200/90 bg-amber-50/90 px-3.5 py-2.5 text-[13px] leading-snug text-amber-950">
          {SUPABASE_VERCEL_DEPLOY_HINT}
        </p>
      ) : null}

      {!showDeployHint && (showServerError || showConfigOther) && errorHint ? (
        <p className="mt-6 rounded-xl border border-rose-200/90 bg-rose-50/95 px-4 py-3 text-[14px] leading-snug text-rose-800 shadow-sm">
          {errorHint}
        </p>
      ) : null}

      {!showDeployHint && !showServerError && !showConfigOther && (msg || (errorHint && err !== "config")) ? (
        <p className="mt-6 rounded-xl border border-rose-200/90 bg-rose-50/95 px-4 py-3 text-[14px] leading-snug text-rose-800 shadow-sm">
          {msg ?? errorHint}
        </p>
      ) : null}

      {showDeployHint && msg ? (
        <p className="mt-4 rounded-xl border border-rose-200/90 bg-rose-50/95 px-4 py-3 text-[14px] leading-snug text-rose-800 shadow-sm">{msg}</p>
      ) : null}

      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        <label htmlFor={idEmail} className="block text-[13px] font-medium text-apple-subtle">
          이메일
          <input
            id={idEmail}
            name="email"
            className={fieldClass}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label htmlFor={idPassword} className="block text-[13px] font-medium text-apple-subtle">
          비밀번호
          <input
            id={idPassword}
            name="password"
            className={fieldClass}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gradient-to-br from-apple to-[#ff8a7a] py-3.5 text-[15px] font-bold text-white shadow-[0_2px_0_rgba(255,255,255,0.35)_inset,0_12px_32px_-8px_rgba(233,75,60,0.4)] transition hover:brightness-105 active:scale-[0.99] disabled:opacity-45"
        >
          {loading ? "처리 중…" : "로그인"}
        </button>
      </form>

      <p className="mt-8 text-center text-[14px] text-apple-subtle">
        계정이 없나요?{" "}
        <Link
          href="/signup"
          className="font-semibold text-apple-muted underline decoration-apple/25 underline-offset-[5px] hover:text-apple"
        >
          회원가입
        </Link>
      </p>
    </AuthSplitShell>
      </main>
    </>
  );
}
