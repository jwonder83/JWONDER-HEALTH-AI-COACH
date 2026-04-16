"use client";

import { AuthSplitShell } from "@/components/auth/AuthSplitShell";
import { createClient } from "@/lib/supabase/client";
import type { SiteSettingsMerged } from "@/types/site-settings";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const fieldClass =
  "mt-2 w-full rounded-2xl border border-orange-100/90 bg-white px-3.5 py-3.5 text-[17px] tracking-tight text-apple-ink shadow-sm transition placeholder:text-apple-subtle hover:border-apple/20 focus:border-apple/45 focus:outline-none focus:ring-4 focus:ring-apple/15";

type Props = { site: SiteSettingsMerged };

export function SignupForm({ site }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setOk(false);
    setLoading(true);
    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: origin ? `${origin}/auth/callback` : undefined,
        },
      });
      if (error) {
        setMsg(error.message);
        setLoading(false);
        return;
      }
      setOk(true);
      setLoading(false);
    } catch {
      setMsg("가입 처리 중 오류가 났습니다. 환경 변수를 확인해 주세요.");
      setLoading(false);
    }
  }

  return (
    <AuthSplitShell
      panelImage={site.images.authPanel}
      eyebrow={site.copy.signupPanel.eyebrow}
      panelTitle={site.copy.signupPanel.title}
      panelDescription={site.copy.signupPanel.description}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-apple">{site.copy.signupCard.eyebrow}</p>
      <h1 className="font-display mt-3 text-[1.75rem] font-bold tracking-[-0.03em] text-apple-ink sm:text-[1.875rem]">{site.copy.signupCard.title}</h1>
      <p className="mt-3 text-[17px] font-normal leading-[1.45] tracking-[-0.012em] text-apple-subtle">{site.copy.signupCard.subtitle}</p>

      {msg && (
        <p className="mt-6 rounded-xl border border-rose-200/90 bg-rose-50/95 px-4 py-3 text-[14px] text-rose-800 shadow-sm">{msg}</p>
      )}
      {ok && !msg && (
        <p className="mt-6 rounded-xl border border-emerald-200/90 bg-emerald-50/95 px-4 py-3 text-[14px] leading-snug text-emerald-900 shadow-sm">
          가입 요청이 완료되었습니다. 이메일을 확인하거나 바로{" "}
          <button type="button" className="font-semibold underline" onClick={() => router.push("/login")}>
            로그인
          </button>
          해 보세요.
        </p>
      )}

      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        <label className="block text-[13px] font-medium text-apple-subtle">
          이메일
          <input
            className={fieldClass}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block text-[13px] font-medium text-apple-subtle">
          비밀번호 (6자 이상 권장)
          <input
            className={fieldClass}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>
        <button
          type="submit"
          disabled={loading || ok}
          className="w-full rounded-full bg-gradient-to-br from-apple to-[#ff8a7a] py-3.5 text-[15px] font-bold text-white shadow-[0_2px_0_rgba(255,255,255,0.35)_inset,0_12px_32px_-8px_rgba(233,75,60,0.4)] transition hover:brightness-105 active:scale-[0.99] disabled:opacity-45"
        >
          {loading ? "처리 중…" : "가입하기"}
        </button>
      </form>

      <p className="mt-8 text-center text-[14px] text-apple-subtle">
        이미 계정이 있나요?{" "}
        <Link
          href="/login"
          className="font-semibold text-apple-muted underline decoration-apple/25 underline-offset-[5px] hover:text-apple"
        >
          로그인
        </Link>
      </p>
    </AuthSplitShell>
  );
}
