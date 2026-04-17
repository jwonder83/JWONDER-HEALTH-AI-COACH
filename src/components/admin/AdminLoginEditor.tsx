"use client";

import { CardFields, ImageFields, PanelFields } from "@/components/admin/AdminSiteEditor";
import type { LoginFormCopyConfig, SiteSettingsMerged } from "@/types/site-settings";
import Link from "next/link";
import { useCallback, useState } from "react";

const loginFormFields: { key: keyof LoginFormCopyConfig; label: string }[] = [
  { key: "emailLabel", label: "이메일 필드 라벨" },
  { key: "passwordLabel", label: "비밀번호 필드 라벨" },
  { key: "submitLabel", label: "제출 버튼 (대기)" },
  { key: "submittingLabel", label: "제출 버튼 (진행 중)" },
  { key: "noAccountPrompt", label: "하단 안내 (예: 계정이 없나요?)" },
  { key: "signupLinkLabel", label: "회원가입 링크 텍스트" },
];

type Props = { initialSettings: SiteSettingsMerged };

export function AdminLoginEditor({ initialSettings }: Props) {
  const [settings, setSettings] = useState<SiteSettingsMerged>(() => structuredClone(initialSettings));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const setCopy = useCallback((patch: Partial<SiteSettingsMerged["copy"]>) => {
    setSettings((s) => ({ ...s, copy: { ...s.copy, ...patch } }));
  }, []);

  async function onSave() {
    setMsg(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const body = (await res.json()) as { error?: string; settings?: SiteSettingsMerged };
      if (!res.ok) {
        setMsg(body.error ?? "반영에 실패했습니다.");
        return;
      }
      if (body.settings) {
        setSettings(structuredClone(body.settings));
      }
      setMsg("반영했습니다. 로그인 화면을 새로고침하면 적용됩니다.");
    } catch {
      setMsg("네트워크 오류로 반영하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  const lf = settings.copy.loginForm;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[1.75rem] font-bold tracking-[-0.02em] text-apple-ink">로그인 화면</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-apple-subtle">
            좌측 패널 이미지는 회원가입 화면과 동일합니다. 패널·카드 문구와 폼 라벨을 한곳에서 수정할 수 있습니다.
          </p>
        </div>
        <Link
          href="/admin"
          className="shrink-0 rounded-full border border-neutral-200 bg-white px-4 py-2 text-[13px] font-semibold text-apple-subtle shadow-sm transition hover:border-black hover:text-apple-ink"
        >
          관리자 개요
        </Link>
      </header>

      <ImageFields
        slot="authPanel"
        label="로그인·회원가입 패널 배경"
        value={settings.images.authPanel}
        onChange={(next) => setSettings((s) => ({ ...s, images: { ...s.images, authPanel: next } }))}
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <PanelFields title="좌측 패널 (데스크톱·모바일 상단)" value={settings.copy.loginPanel} onChange={(v) => setCopy({ loginPanel: v })} />
        <CardFields title="우측 카드 (제목 영역)" value={settings.copy.loginCard} onChange={(v) => setCopy({ loginCard: v })} />
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-[15px] font-semibold text-apple-ink">폼 라벨·버튼·하단 링크</h2>
        <div className="grid gap-3 rounded-2xl border border-black/[0.06] bg-white/85 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:grid-cols-2">
          {loginFormFields.map(({ key, label }) => (
            <label key={key} className="block text-[12px] font-medium text-apple-subtle sm:col-span-2">
              {label}
              <input
                className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                value={lf[key]}
                onChange={(e) => setCopy({ loginForm: { ...lf, [key]: e.target.value } })}
              />
            </label>
          ))}
        </div>
      </section>

      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-8">
        <button
          type="button"
          disabled={saving}
          onClick={() => void onSave()}
          className="rounded-full border border-black bg-black px-6 py-2.5 text-[13px] font-semibold text-white transition hover:bg-white hover:text-black disabled:opacity-45"
        >
          {saving ? "저장 중…" : "수정 반영"}
        </button>
        {msg ? <p className="text-[13px] text-apple-subtle">{msg}</p> : null}
      </div>
    </div>
  );
}
