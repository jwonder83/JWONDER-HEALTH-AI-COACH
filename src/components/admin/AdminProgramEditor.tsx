"use client";

import type {
  ProgramBuiltinImages,
  ProgramBuiltinVideos,
  ProgramGuideSettings,
  ProgramSectionTitles,
  SiteSettingsMerged,
} from "@/types/site-settings";
import Link from "next/link";
import { useCallback, useState } from "react";

const PROGRAM_IMAGE_SLOTS: { key: keyof ProgramBuiltinImages; label: string }[] = [
  { key: "hero", label: "히어로(상단 큰 이미지)" },
  { key: "barbell", label: "스플릿 섹션" },
  { key: "plates", label: "볼륨 랜드마크" },
  { key: "calm", label: "델로드·회복" },
  { key: "athlete", label: "운동 순서" },
  { key: "stretch", label: "워밍업" },
  { key: "kettle", label: "RPE" },
  { key: "rack", label: "대체 종목" },
];

const PROGRAM_VIDEO_SLOTS: { key: keyof ProgramBuiltinVideos; label: string }[] = [
  { key: "framework", label: "원칙·과학" },
  { key: "split", label: "스플릿·주기" },
  { key: "volumeMain", label: "볼륨(메인)" },
  { key: "deload", label: "델로드" },
  { key: "warmupMain", label: "워밍업" },
  { key: "cooldown", label: "쿨다운" },
  { key: "rpe", label: "RPE·RIR" },
  { key: "squat", label: "스쿼트(체크리스트)" },
  { key: "deadlift", label: "데드리프트" },
  { key: "bench", label: "벤치" },
];

const PROGRAM_SECTION_TITLE_SLOTS: { key: keyof ProgramSectionTitles; label: string }[] = [
  { key: "framework", label: "원칙·과학" },
  { key: "split", label: "스플릿·주기" },
  { key: "volume", label: "볼륨 랜드마크" },
  { key: "deload", label: "델로드" },
  { key: "order", label: "운동 순서" },
  { key: "warmup", label: "워밍업·쿨다운" },
  { key: "rpe", label: "RPE·RIR" },
  { key: "alternatives", label: "대체 종목" },
  { key: "checklist", label: "종목별 큐·영상" },
  { key: "micro", label: "마이크로 목표" },
  { key: "stats", label: "통계" },
  { key: "safety", label: "안전" },
];

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
            헤더 메뉴·페이지 제목·리드·내장 가이드(목차명·섹션 제목·이미지·유튜브)·마크다운(상·하)을 수정합니다. 마크다운은 GFM(목록·표·링크 등)을 지원합니다.
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
      </div>

      <div className="mt-6 space-y-8 rounded-2xl border border-orange-100/90 bg-white/90 p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="font-display text-[1.1rem] font-bold text-apple-ink">내장 가이드 — 목차·제목·이미지·동영상</h2>
          <p className="mt-1 text-[12px] leading-relaxed text-apple-subtle">
            본문 각 섹션의 메뉴(목차) 문구, H2 제목, 삽입 이미지(URL)·대체 텍스트, 유튜브 영상 ID·표시 제목을 바꿀 수 있습니다. 목차 항목 개수는 유지됩니다. 앵커
            연동을 위해 목차의 <code className="rounded bg-black/[0.06] px-1">id</code> 값은 바꾸지 마세요.
          </p>
        </div>

        <div>
          <p className="text-[12px] font-semibold text-apple-ink">목차 메뉴명</p>
          <ul className="mt-3 space-y-3">
            {p.toc.map((item, i) => (
              <li key={item.id} className="flex flex-wrap items-center gap-2 gap-y-2">
                <span className="w-28 shrink-0 font-mono text-[11px] text-apple-subtle">{item.id}</span>
                <input
                  className="min-w-0 flex-1 rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                  value={item.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    setSettings((s) => ({
                      ...s,
                      program: {
                        ...s.program,
                        toc: s.program.toc.map((t, j) => (j === i ? { ...t, label } : t)),
                      },
                    }));
                  }}
                />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[12px] font-semibold text-apple-ink">섹션 제목 (H2)</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {PROGRAM_SECTION_TITLE_SLOTS.map(({ key, label }) => (
              <label key={key} className="block text-[11px] font-medium text-apple-subtle">
                {label}
                <input
                  className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                  value={p.sectionTitles[key]}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSettings((s) => ({
                      ...s,
                      program: {
                        ...s.program,
                        sectionTitles: { ...s.program.sectionTitles, [key]: v },
                      },
                    }));
                  }}
                />
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[12px] font-semibold text-apple-ink">내장 이미지 (URL · alt)</p>
          <div className="mt-3 space-y-4">
            {PROGRAM_IMAGE_SLOTS.map(({ key, label }) => (
              <div key={key} className="rounded-xl border border-orange-100/80 bg-u-lavender/10 p-3">
                <p className="text-[11px] font-semibold text-apple-ink">{label}</p>
                <label className="mt-2 block text-[11px] font-medium text-apple-subtle">
                  이미지 URL
                  <input
                    className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 font-mono text-[12px] text-apple-ink"
                    value={p.builtinImages[key].src}
                    onChange={(e) => {
                      const src = e.target.value;
                      setSettings((s) => ({
                        ...s,
                        program: {
                          ...s.program,
                          builtinImages: {
                            ...s.program.builtinImages,
                            [key]: { ...s.program.builtinImages[key], src },
                          },
                        },
                      }));
                    }}
                  />
                </label>
                <label className="mt-2 block text-[11px] font-medium text-apple-subtle">
                  대체 텍스트 (alt)
                  <input
                    className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                    value={p.builtinImages[key].alt}
                    onChange={(e) => {
                      const alt = e.target.value;
                      setSettings((s) => ({
                        ...s,
                        program: {
                          ...s.program,
                          builtinImages: {
                            ...s.program.builtinImages,
                            [key]: { ...s.program.builtinImages[key], alt },
                          },
                        },
                      }));
                    }}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[12px] font-semibold text-apple-ink">내장 동영상 (YouTube)</p>
          <p className="mt-1 text-[11px] text-apple-subtle">
            영상 ID는 주소창의 <code className="rounded bg-black/[0.06] px-1">watch?v=</code> 뒤 값만 넣으면 됩니다.
          </p>
          <div className="mt-3 space-y-4">
            {PROGRAM_VIDEO_SLOTS.map(({ key, label }) => (
              <div key={key} className="rounded-xl border border-orange-100/80 bg-u-mango/15 p-3">
                <p className="text-[11px] font-semibold text-apple-ink">{label}</p>
                <label className="mt-2 block text-[11px] font-medium text-apple-subtle">
                  videoId
                  <input
                    className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 font-mono text-[13px] text-apple-ink"
                    value={p.builtinVideos[key].videoId}
                    onChange={(e) => {
                      const videoId = e.target.value;
                      setSettings((s) => ({
                        ...s,
                        program: {
                          ...s.program,
                          builtinVideos: {
                            ...s.program.builtinVideos,
                            [key]: { ...s.program.builtinVideos[key], videoId },
                          },
                        },
                      }));
                    }}
                  />
                </label>
                <label className="mt-2 block text-[11px] font-medium text-apple-subtle">
                  임베드 제목 (접근성·캡션)
                  <input
                    className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                    value={p.builtinVideos[key].title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setSettings((s) => ({
                        ...s,
                        program: {
                          ...s.program,
                          builtinVideos: {
                            ...s.program.builtinVideos,
                            [key]: { ...s.program.builtinVideos[key], title },
                          },
                        },
                      }));
                    }}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-emerald-100/90 bg-emerald-50/40 p-4">
          <p className="text-[12px] font-semibold text-apple-ink">볼륨 랜드마크 — 심화 영상(외부 링크)</p>
          <p className="mt-1 text-[11px] leading-relaxed text-apple-subtle">
            내장 임베드 아래에 새 탭으로 열리는 링크 한 줄입니다. URL을 비우면 이 줄은 표시되지 않습니다. <code className="rounded bg-black/[0.06] px-1">https://</code> 또는
            사이트 내부 <code className="rounded bg-black/[0.06] px-1">/경로</code>만 허용됩니다.
          </p>
          <label className="mt-3 block text-[11px] font-medium text-apple-subtle">
            앞 문구
            <input
              className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
              value={p.volumeExternalLink.lead}
              onChange={(e) => {
                const lead = e.target.value;
                setSettings((s) => ({
                  ...s,
                  program: {
                    ...s.program,
                    volumeExternalLink: { ...s.program.volumeExternalLink, lead },
                  },
                }));
              }}
            />
          </label>
          <label className="mt-2 block text-[11px] font-medium text-apple-subtle">
            링크 제목(표시 문구)
            <input
              className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
              value={p.volumeExternalLink.anchorLabel}
              onChange={(e) => {
                const anchorLabel = e.target.value;
                setSettings((s) => ({
                  ...s,
                  program: {
                    ...s.program,
                    volumeExternalLink: { ...s.program.volumeExternalLink, anchorLabel },
                  },
                }));
              }}
            />
          </label>
          <label className="mt-2 block text-[11px] font-medium text-apple-subtle">
            URL
            <input
              className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 font-mono text-[12px] text-apple-ink"
              value={p.volumeExternalLink.href}
              onChange={(e) => {
                const href = e.target.value;
                setSettings((s) => ({
                  ...s,
                  program: {
                    ...s.program,
                    volumeExternalLink: { ...s.program.volumeExternalLink, href },
                  },
                }));
              }}
              placeholder="https://…"
            />
          </label>
        </div>
      </div>

      <div className="mt-6 space-y-6 rounded-2xl border border-orange-100/90 bg-white/90 p-5 shadow-sm sm:p-6">
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
