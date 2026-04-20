"use client";

import { SectionTitleBlock } from "@/components/ui/SectionTitleBlock";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

type Props = { email: string };

export function SettingsForm({ email }: Props) {
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendReset() {
    setMsg(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: origin ? `${origin}/auth/callback?next=/settings` : undefined,
      });
      if (error) {
        setMsg(error.message);
        return;
      }
      setMsg("재설정 링크를 이메일로 보냈습니다. 받은편지함과 스팸함을 확인해 주세요.");
    } catch {
      setMsg("요청을 처리하는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-8 sm:py-14">
      <SectionTitleBlock
        step="AC"
        eyebrow="ACCOUNT"
        title="계정 설정"
        description="로그인된 이메일 확인과 비밀번호 재설정을 안내합니다."
      />

      <div className="mt-2 border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-apple-subtle">이메일</p>
        <p className="mt-2 break-all text-[16px] font-semibold text-apple-ink">{email || "—"}</p>
        <p className="mt-6 text-[13px] leading-relaxed text-apple-subtle">
          비밀번호를 변경하려면 아래 버튼으로 재설정 메일을 요청하세요. 메일의 링크를 연 뒤 새 비밀번호를 입력합니다.
        </p>
        <button
          type="button"
          disabled={loading || !email}
          onClick={() => void sendReset()}
          className="mt-6 w-full border border-black bg-black py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-black disabled:opacity-45"
        >
          {loading ? "발송 중…" : "비밀번호 재설정 메일 요청"}
        </button>
        {msg ? (
          <p
            className={`mt-4 border-2 px-3 py-2 text-[14px] leading-snug ${
              msg.includes("오류") || msg.includes("실패") ? "border-rose-500 bg-rose-50 text-rose-900" : "border-emerald-600 bg-emerald-50 text-emerald-900"
            }`}
          >
            {msg}
          </p>
        ) : null}
      </div>
    </div>
  );
}
