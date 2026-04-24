"use client";

import { SectionTitleBlock } from "@/components/ui/SectionTitleBlock";
import { createClient } from "@/lib/supabase/client";
import type { SiteSettingsPageCopy } from "@/types/site-settings";
import { useState } from "react";

type Props = { email: string; copy: SiteSettingsPageCopy };

export function SettingsForm({ email, copy }: Props) {
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
      setMsg(copy.msgResetSent);
    } catch {
      setMsg(copy.msgGenericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-8 sm:py-14">
      <SectionTitleBlock
        step={copy.sectionStep}
        eyebrow={copy.sectionEyebrow}
        title={copy.title}
        description={copy.description}
      />

      <div className="mt-2 border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-apple-subtle">{copy.emailHeading}</p>
        <p className="mt-2 break-all text-[16px] font-semibold text-apple-ink">{email || "—"}</p>
        <p className="mt-6 text-[13px] leading-relaxed text-apple-subtle">{copy.passwordHelp}</p>
        <button
          type="button"
          disabled={loading || !email}
          onClick={() => void sendReset()}
          className="mt-6 w-full border border-black bg-black py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-black disabled:opacity-45"
        >
          {loading ? copy.btnSending : copy.btnRequestReset}
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
