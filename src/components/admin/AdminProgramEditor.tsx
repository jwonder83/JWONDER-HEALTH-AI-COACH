"use client";

import type { ProgramGuideSettings, SiteSettingsMerged } from "@/types/site-settings";
import Link from "next/link";
import { useCallback, useState } from "react";

type Props = { initialSettings: SiteSettingsMerged };

export function AdminProgramEditor({ initialSettings }: Props) {
  const [settings, setSettings] = useState<SiteSettingsMerged>(() => structuredClone(initialSettings));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const setProgram = useCallback((patch: Partial<ProgramGuideSettings>) => {
    setSettings((s) => ({ ...s, program: { ...s.program, ...patch } }));
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
      setMsg("반영했습니다. 프로그램 페이지를 새로고침하면 적용됩니다.");
    } catch {
      setMsg("네트워크 오류로 반영하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  const p = settings.program;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[1.75rem] font-bold tracking-[-0.02em] text-apple-ink">프로그램 안내</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-apple-subtle">
            헤더 메뉴 레이블·페이지 제목·리드·내장 가이드(표·영상) 표시 여부·마크다운(상·하)을 수정합니다. 마크다운은 GFM(목록·표·링크 등)을 지원합니다.
          </p>
        </div>
        <Link
          href="/admin"
          className="shrink-0 rounded-full border border-orange-100/90 bg-white px-4 py-2 text-[13px] font-semibold text-apple-subtle shadow-sm transition hover:border-apple/25 hover:text-apple-ink"
        >
          관리자 개요
        </Link>
      </header>

      {msg ? (
        <p
          className={`mb-6 rounded-xl border px-4 py-3 text-[14px] ${
            msg.includes("실패") || msg.includes("오류") || msg.includes("못했")
              ? "border-rose-200 bg-rose-50 text-rose-900"
              : "border-emerald-200 bg-emerald-50 text-emerald-900"
          }`}
        >
          {msg}
        </p>
      ) : null}

      <div className="space-y-6 rounded-2xl border border-orange-100/90 bg-white/90 p-5 shadow-sm sm:p-6">
        <label className="block text-[12px] font-medium text-apple-subtle">
          헤더 메뉴 레이블 (짧게)
          <input
            className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
            value={p.navLabel}
            onChange={(e) => setProgram({ navLabel: e.target.value })}
          />
        </label>
        <label className="block text-[12px] font-medium text-apple-subtle">
          홈·도움말 등 링크 문구
          <input
            className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
            value={p.promoLinkLabel}
            onChange={(e) => setProgram({ promoLinkLabel: e.target.value })}
          />
        </label>
        <label className="block text-[12px] font-medium text-apple-subtle">
          페이지 eyebrow (영문 대문자 등)
          <input
            className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
            value={p.pageEyebrow}
            onChange={(e) => setProgram({ pageEyebrow: e.target.value })}
          />
        </label>
        <label className="block text-[12px] font-medium text-apple-subtle">
          페이지 제목 (H1)
          <input
            className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
            value={p.pageTitle}
            onChange={(e) => setProgram({ pageTitle: e.target.value })}
          />
        </label>
        <label className="block text-[12px] font-medium text-apple-subtle">
          페이지 리드 (줄바꿈 가능)
          <textarea
            rows={4}
            className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
            value={p.pageLead}
            onChange={(e) => setProgram({ pageLead: e.target.value })}
          />
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-orange-100/80 bg-u-lavender/15 px-3 py-3">
          <input
            type="checkbox"
            className="mt-1 size-4 rounded border-orange-200 text-apple focus:ring-apple/30"
            checked={p.showBuiltInSections}
            onChange={(e) => setProgram({ showBuiltInSections: e.target.checked })}
          />
          <span>
            <span className="text-[14px] font-semibold text-apple-ink">내장 가이드 표시</span>
            <span className="mt-0.5 block text-[12px] leading-relaxed text-apple-subtle">
              표·유튜브 임베드가 포함된 기본 클리닉 본문입니다. 끄면 마크다운 영역만으로 구성할 수 있습니다.
            </span>
          </span>
        </label>

        <label className="block text-[12px] font-medium text-apple-subtle">
          상단 마크다운 (내장 본문 위)
          <textarea
            rows={8}
            className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 font-mono text-[13px] leading-snug text-apple-ink"
            value={p.prefixMarkdown}
            onChange={(e) => setProgram({ prefixMarkdown: e.target.value })}
            placeholder="예: 공지, 링크 모음, 이번 달 훈련 포커스…"
          />
        </label>
        <label className="block text-[12px] font-medium text-apple-subtle">
          하단 마크다운 (내장 본문 아래)
          <textarea
            rows={10}
            className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 font-mono text-[13px] leading-snug text-apple-ink"
            value={p.appendixMarkdown}
            onChange={(e) => setProgram({ appendixMarkdown: e.target.value })}
            placeholder="예: 팀 내부 규정, 추가 참고 링크…"
          />
        </label>
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={() => void onSave()}
        className="mt-8 w-full rounded-full bg-gradient-to-br from-apple to-[#ff8a7a] py-3.5 text-[15px] font-bold text-white shadow-lg transition hover:brightness-105 disabled:opacity-45"
      >
        {saving ? "수정 중…" : "수정"}
      </button>
    </div>
  );
}
