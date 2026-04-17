"use client";

import type {
  ImageSlot,
  SiteCopyConfig,
  SiteImagesConfig,
  SiteSettingsMerged,
  WorkoutFormCopyConfig,
} from "@/types/site-settings";
import Link from "next/link";
import { useCallback, useState } from "react";

const imageLabels: Record<keyof SiteImagesConfig, string> = {
  hero: "메인 히어로",
  authPanel: "로그인·회원가입 패널",
  dashTile1: "대시 타일 1",
  dashTile2: "대시 타일 2",
  dashTile3: "대시 타일 3",
  coaching: "AI 코칭 영역",
  listEmpty: "목록 비었을 때",
};

function ImageFields({
  slot,
  label,
  value,
  onChange,
}: {
  slot: keyof SiteImagesConfig;
  label: string;
  value: ImageSlot;
  onChange: (next: ImageSlot) => void;
}) {
  const [upMsg, setUpMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUpMsg(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("slot", slot);
      fd.set("file", file);
      const res = await fetch("/api/admin/site-image", { method: "POST", body: fd });
      const body = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setUpMsg(body.error ?? "업로드에 실패했습니다.");
        return;
      }
      if (body.url) {
        const baseName = file.name.replace(/\.[^.]+$/, "").trim();
        onChange({
          src: body.url,
          alt: value.alt.trim() || baseName || "사이트 이미지",
        });
        setUpMsg("업로드되었습니다. 아래에서 수정을 눌러 반영하세요.");
      }
    } catch {
      setUpMsg("네트워크 오류로 업로드하지 못했습니다.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <fieldset className="rounded-2xl border border-orange-100/90 bg-white/90 p-4 shadow-[0_8px_28px_-12px_rgba(233,75,60,0.1)]">
      <legend className="px-1 text-[13px] font-semibold text-apple-ink">{label}</legend>

      <div className="mt-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-orange-200/80 bg-gradient-to-r from-apple/12 to-u-lavender/30 px-3 py-2 text-[13px] font-semibold text-apple-muted transition hover:from-apple/18 hover:to-u-lavender/40 disabled:cursor-not-allowed disabled:opacity-50">
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" disabled={uploading} onChange={(e) => void onPickFile(e)} />
          {uploading ? "업로드 중…" : "파일에서 이미지 선택"}
        </label>
        <p className="mt-1.5 text-[11px] text-apple-subtle">Supabase Storage 버킷 site-assets (JPEG·PNG·WebP·GIF, 최대 5MB)</p>
      </div>

      {upMsg ? (
        <p
          className={`mt-2 rounded-lg border px-2.5 py-2 text-[12px] leading-snug ${
            upMsg.includes("실패") || upMsg.includes("오류") || upMsg.includes("못했")
              ? "border-rose-200 bg-rose-50 text-rose-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-900"
          }`}
        >
          {upMsg}
        </p>
      ) : null}

      {value.src ? (
        <div className="mt-3 overflow-hidden rounded-lg border border-black/[0.06] bg-zinc-50/80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value.src} alt="" className="mx-auto max-h-36 w-full object-contain" />
        </div>
      ) : null}

      <label className="mt-3 block text-[12px] font-medium text-apple-subtle">
        이미지 URL (직접 입력·수정)
        <input
          className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
          value={value.src}
          onChange={(e) => onChange({ ...value, src: e.target.value })}
        />
      </label>
      <label className="mt-3 block text-[12px] font-medium text-apple-subtle">
        alt 텍스트
        <input
          className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
          value={value.alt}
          onChange={(e) => onChange({ ...value, alt: e.target.value })}
        />
      </label>
    </fieldset>
  );
}

function PanelFields({
  title,
  value,
  onChange,
}: {
  title: string;
  value: SiteCopyConfig["loginPanel"];
  onChange: (next: SiteCopyConfig["loginPanel"]) => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-black/[0.06] bg-white/85 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <p className="text-[13px] font-semibold text-apple-ink">{title}</p>
      <label className="block text-[12px] font-medium text-apple-subtle">
        eyebrow
        <input
          className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px]"
          value={value.eyebrow}
          onChange={(e) => onChange({ ...value, eyebrow: e.target.value })}
        />
      </label>
      <label className="block text-[12px] font-medium text-apple-subtle">
        title
        <input
          className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
        />
      </label>
      <label className="block text-[12px] font-medium text-apple-subtle">
        description
        <textarea
          rows={3}
          className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
        />
      </label>
    </div>
  );
}

function CardFields({
  title,
  value,
  onChange,
}: {
  title: string;
  value: SiteCopyConfig["loginCard"];
  onChange: (next: SiteCopyConfig["loginCard"]) => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-black/[0.06] bg-white/85 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <p className="text-[13px] font-semibold text-apple-ink">{title}</p>
      <label className="block text-[12px] font-medium text-apple-subtle">
        eyebrow
        <input
          className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px]"
          value={value.eyebrow}
          onChange={(e) => onChange({ ...value, eyebrow: e.target.value })}
        />
      </label>
      <label className="block text-[12px] font-medium text-apple-subtle">
        title
        <input
          className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
        />
      </label>
      <label className="block text-[12px] font-medium text-apple-subtle">
        subtitle
        <input
          className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
          value={value.subtitle}
          onChange={(e) => onChange({ ...value, subtitle: e.target.value })}
        />
      </label>
    </div>
  );
}

type Props = { initialSettings: SiteSettingsMerged };

export function AdminSiteEditor({ initialSettings }: Props) {
  const [settings, setSettings] = useState<SiteSettingsMerged>(() => structuredClone(initialSettings));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const setImage = useCallback((key: keyof SiteImagesConfig, slot: ImageSlot) => {
    setSettings((s) => ({ ...s, images: { ...s.images, [key]: slot } }));
  }, []);

  const setCopy = useCallback((patch: Partial<SiteCopyConfig>) => {
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
      setMsg("반영했습니다. 메인 화면을 새로고침하면 적용됩니다.");
    } catch {
      setMsg("네트워크 오류로 반영하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  const caps = settings.copy.mainDashTileCaptions;
  const navLabs = settings.copy.mainNavSectionLabels;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[1.75rem] font-bold tracking-[-0.02em] text-apple-ink">사이트 문구·이미지</h1>
          <p className="mt-2 text-[14px] leading-relaxed text-apple-subtle">
            이미지는 파일로 Supabase Storage에 올리거나 URL을 직접 입력할 수 있습니다. 상단 관리자 메뉴의 「프로그램」에서 운동 가이드 문구를 따로 수정할
            수 있습니다.
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

        <section className="mb-10">
          <h2 className="mb-4 text-[15px] font-semibold text-apple-ink">이미지</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {(Object.keys(imageLabels) as (keyof SiteImagesConfig)[]).map((key) => (
              <ImageFields
                key={key}
                slot={key}
                label={imageLabels[key]}
                value={settings.images[key]}
                onChange={(next) => setImage(key, next)}
              />
            ))}
          </div>
        </section>

        <section className="mb-10 space-y-6">
          <h2 className="text-[15px] font-semibold text-apple-ink">메타·앱 타이틀</h2>
          <label className="block rounded-2xl border border-black/[0.06] bg-white/85 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <span className="text-[12px] font-medium text-apple-subtle">브라우저 탭 제목 (appTitle)</span>
            <input
              className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
              value={settings.copy.appTitle}
              onChange={(e) => setCopy({ appTitle: e.target.value })}
            />
          </label>
          <label className="block rounded-2xl border border-black/[0.06] bg-white/85 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <span className="text-[12px] font-medium text-apple-subtle">메타 description</span>
            <textarea
              rows={2}
              className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
              value={settings.copy.appDescription}
              onChange={(e) => setCopy({ appDescription: e.target.value })}
            />
          </label>
        </section>

        <section className="mb-10 space-y-4">
          <h2 className="text-[15px] font-semibold text-apple-ink">메인 히어로</h2>
          <div className="grid gap-3 rounded-2xl border border-black/[0.06] bg-white/85 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:grid-cols-2">
            <label className="block text-[12px] font-medium text-apple-subtle sm:col-span-2">
              eyebrow
              <input
                className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                value={settings.copy.mainHero.eyebrow}
                onChange={(e) => setCopy({ mainHero: { ...settings.copy.mainHero, eyebrow: e.target.value } })}
              />
            </label>
            <label className="block text-[12px] font-medium text-apple-subtle">
              title 줄 1
              <input
                className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                value={settings.copy.mainHero.titleLine1}
                onChange={(e) => setCopy({ mainHero: { ...settings.copy.mainHero, titleLine1: e.target.value } })}
              />
            </label>
            <label className="block text-[12px] font-medium text-apple-subtle">
              title 줄 2
              <input
                className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                value={settings.copy.mainHero.titleLine2}
                onChange={(e) => setCopy({ mainHero: { ...settings.copy.mainHero, titleLine2: e.target.value } })}
              />
            </label>
            <label className="block text-[12px] font-medium text-apple-subtle sm:col-span-2">
              부제 (subtitle)
              <textarea
                rows={2}
                className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                value={settings.copy.mainHero.subtitle}
                onChange={(e) => setCopy({ mainHero: { ...settings.copy.mainHero, subtitle: e.target.value } })}
              />
            </label>
          </div>
        </section>

        <section className="mb-10 space-y-4">
          <h2 className="text-[15px] font-semibold text-apple-ink">운동 입력 폼</h2>
          <div className="grid gap-3 rounded-2xl border border-black/[0.06] bg-white/85 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:grid-cols-2">
            {(
              [
                ["eyebrow", "상단 라벨 (예: New)"],
                ["title", "제목"],
                ["subtitle", "설명"],
                ["exerciseLabel", "운동명 라벨"],
                ["exercisePlaceholder", "운동명 placeholder"],
                ["weightLabel", "중량 라벨"],
                ["repsLabel", "반복 라벨"],
                ["setsLabel", "세트 라벨"],
                ["outcomeGroupLabel", "세트 결과 제목"],
                ["outcomeAriaLabel", "성공/실패 그룹 접근성 라벨"],
                ["successLabel", "성공 버튼"],
                ["failLabel", "실패 버튼"],
                ["saveButtonLabel", "저장 버튼"],
                ["savingButtonLabel", "저장 중 문구"],
                ["savedToast", "저장 완료 토스트"],
              ] as const satisfies ReadonlyArray<[keyof WorkoutFormCopyConfig, string]>
            ).map(([key, label]) => (
              <label key={key} className="block text-[12px] font-medium text-apple-subtle sm:col-span-2">
                {label}
                {key === "subtitle" ? (
                  <textarea
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                    value={settings.copy.workoutForm[key]}
                    onChange={(e) =>
                      setCopy({
                        workoutForm: { ...settings.copy.workoutForm, [key]: e.target.value },
                      })
                    }
                  />
                ) : (
                  <input
                    className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                    value={settings.copy.workoutForm[key]}
                    onChange={(e) =>
                      setCopy({
                        workoutForm: { ...settings.copy.workoutForm, [key]: e.target.value },
                      })
                    }
                  />
                )}
              </label>
            ))}
          </div>
        </section>

        <section className="mb-10 space-y-4">
          <h2 className="text-[15px] font-semibold text-apple-ink">스티키 내비·타일 캡션</h2>
          <div className="grid gap-3 rounded-2xl border border-black/[0.06] bg-white/85 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <label key={`nav-${i}`} className="block text-[12px] font-medium text-apple-subtle">
                내비 {i + 1} (#section-{i === 0 ? "input" : i === 1 ? "list" : "coach"})
                <input
                  className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                  value={navLabs[i]}
                  onChange={(e) => {
                    const next: [string, string, string] = [...navLabs] as [string, string, string];
                    next[i] = e.target.value;
                    setCopy({ mainNavSectionLabels: next });
                  }}
                />
              </label>
            ))}
          </div>
          <div className="grid gap-3 rounded-2xl border border-black/[0.06] bg-white/85 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <label key={i} className="block text-[12px] font-medium text-apple-subtle">
                타일 캡션 {i + 1}
                <input
                  className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                  value={caps[i]}
                  onChange={(e) => {
                    const next: [string, string, string] = [...caps] as [string, string, string];
                    next[i] = e.target.value;
                    setCopy({ mainDashTileCaptions: next });
                  }}
                />
              </label>
            ))}
          </div>
        </section>

        <section className="mb-10 grid gap-4 sm:grid-cols-2">
          <PanelFields title="로그인 좌측 패널" value={settings.copy.loginPanel} onChange={(v) => setCopy({ loginPanel: v })} />
          <PanelFields title="회원가입 좌측 패널" value={settings.copy.signupPanel} onChange={(v) => setCopy({ signupPanel: v })} />
          <CardFields title="로그인 카드" value={settings.copy.loginCard} onChange={(v) => setCopy({ loginCard: v })} />
          <CardFields title="회원가입 카드" value={settings.copy.signupCard} onChange={(v) => setCopy({ signupCard: v })} />
        </section>

        <section className="mb-10 space-y-4">
          <h2 className="text-[15px] font-semibold text-apple-ink">AI 코칭 블록</h2>
          <div className="grid gap-3 rounded-2xl border border-black/[0.06] bg-white/85 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <label className="block text-[12px] font-medium text-apple-subtle">
              eyebrow
              <input
                className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                value={settings.copy.webCoachingEyebrow}
                onChange={(e) => setCopy({ webCoachingEyebrow: e.target.value })}
              />
            </label>
            <label className="block text-[12px] font-medium text-apple-subtle">
              제목
              <input
                className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                value={settings.copy.webCoachingTitle}
                onChange={(e) => setCopy({ webCoachingTitle: e.target.value })}
              />
            </label>
            <label className="block text-[12px] font-medium text-apple-subtle">
              본문 설명
              <textarea
                rows={4}
                className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                value={settings.copy.webCoachingHint}
                onChange={(e) => setCopy({ webCoachingHint: e.target.value })}
              />
            </label>
            <label className="block text-[12px] font-medium text-apple-subtle">
              버튼 문구
              <input
                className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                value={settings.copy.webCoachingButtonLabel}
                onChange={(e) => setCopy({ webCoachingButtonLabel: e.target.value })}
              />
            </label>
          </div>
        </section>

        <section className="mb-10 space-y-4">
          <h2 className="text-[15px] font-semibold text-apple-ink">목록 비었을 때 문구</h2>
          <div className="grid gap-3 rounded-2xl border border-black/[0.06] bg-white/85 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:grid-cols-2">
            <label className="block text-[12px] font-medium text-apple-subtle">
              제목
              <input
                className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                value={settings.copy.listEmptyTitle}
                onChange={(e) => setCopy({ listEmptyTitle: e.target.value })}
              />
            </label>
            <label className="block text-[12px] font-medium text-apple-subtle">
              부제
              <input
                className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                value={settings.copy.listEmptySubtitle}
                onChange={(e) => setCopy({ listEmptySubtitle: e.target.value })}
              />
            </label>
          </div>
        </section>

        <section className="mb-10 space-y-4">
          <h2 className="text-[15px] font-semibold text-apple-ink">도움말 (/help)</h2>
          <div className="grid gap-3 rounded-2xl border border-black/[0.06] bg-white/85 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <label className="block text-[12px] font-medium text-apple-subtle">
              페이지 제목
              <input
                className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                value={settings.copy.helpCenter.pageTitle}
                onChange={(e) =>
                  setCopy({ helpCenter: { ...settings.copy.helpCenter, pageTitle: e.target.value } })
                }
              />
            </label>
            <label className="block text-[12px] font-medium text-apple-subtle">
              소개 문단
              <textarea
                rows={3}
                className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                value={settings.copy.helpCenter.intro}
                onChange={(e) => setCopy({ helpCenter: { ...settings.copy.helpCenter, intro: e.target.value } })}
              />
            </label>
            <label className="block text-[12px] font-medium text-apple-subtle">
              연락 안내 (한 줄)
              <input
                className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                value={settings.copy.helpCenter.contactLine}
                onChange={(e) =>
                  setCopy({ helpCenter: { ...settings.copy.helpCenter, contactLine: e.target.value } })
                }
              />
            </label>
            <label className="block text-[12px] font-medium text-apple-subtle">
              FAQ 섹션 제목
              <input
                className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                value={settings.copy.helpCenter.faqSectionTitle}
                onChange={(e) =>
                  setCopy({ helpCenter: { ...settings.copy.helpCenter, faqSectionTitle: e.target.value } })
                }
              />
            </label>
            <p className="text-[12px] font-medium text-apple-subtle">FAQ 항목 (질문 / 답변)</p>
            <div className="grid gap-3">
              {settings.copy.helpCenter.faqItems.map((item, i) => (
                <div key={i} className="rounded-xl border border-black/[0.08] bg-white p-3">
                  <label className="block text-[11px] font-medium text-apple-subtle">
                    질문 {i + 1}
                    <input
                      className="mt-1 w-full rounded border border-black/[0.08] px-2 py-1.5 text-[14px] text-apple-ink"
                      value={item.question}
                      onChange={(e) => {
                        const hc = settings.copy.helpCenter;
                        const faqItems = hc.faqItems.map((it, j) =>
                          j === i ? { ...it, question: e.target.value } : it,
                        );
                        setCopy({ helpCenter: { ...hc, faqItems } });
                      }}
                    />
                  </label>
                  <label className="mt-2 block text-[11px] font-medium text-apple-subtle">
                    답변 {i + 1}
                    <textarea
                      rows={2}
                      className="mt-1 w-full rounded border border-black/[0.08] px-2 py-1.5 text-[14px] text-apple-ink"
                      value={item.answer}
                      onChange={(e) => {
                        const hc = settings.copy.helpCenter;
                        const faqItems = hc.faqItems.map((it, j) =>
                          j === i ? { ...it, answer: e.target.value } : it,
                        );
                        setCopy({ helpCenter: { ...hc, faqItems } });
                      }}
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-10 space-y-4">
          <h2 className="text-[15px] font-semibold text-apple-ink">약관 (/legal/terms, /legal/privacy)</h2>
          <div className="grid gap-3 rounded-2xl border border-black/[0.06] bg-white/85 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:grid-cols-2">
            <label className="block text-[12px] font-medium text-apple-subtle sm:col-span-2">
              이용약관 제목
              <input
                className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                value={settings.copy.legalPages.termsTitle}
                onChange={(e) =>
                  setCopy({ legalPages: { ...settings.copy.legalPages, termsTitle: e.target.value } })
                }
              />
            </label>
            <label className="block text-[12px] font-medium text-apple-subtle sm:col-span-2">
              이용약관 본문 (빈 줄로 문단 구분)
              <textarea
                rows={8}
                className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                value={settings.copy.legalPages.termsBody}
                onChange={(e) => setCopy({ legalPages: { ...settings.copy.legalPages, termsBody: e.target.value } })}
              />
            </label>
            <label className="block text-[12px] font-medium text-apple-subtle sm:col-span-2">
              개인정보 제목
              <input
                className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                value={settings.copy.legalPages.privacyTitle}
                onChange={(e) =>
                  setCopy({ legalPages: { ...settings.copy.legalPages, privacyTitle: e.target.value } })
                }
              />
            </label>
            <label className="block text-[12px] font-medium text-apple-subtle sm:col-span-2">
              개인정보 본문 (빈 줄로 문단 구분)
              <textarea
                rows={8}
                className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                value={settings.copy.legalPages.privacyBody}
                onChange={(e) =>
                  setCopy({ legalPages: { ...settings.copy.legalPages, privacyBody: e.target.value } })
                }
              />
            </label>
          </div>
        </section>

        <section className="mb-10 space-y-4">
          <h2 className="text-[15px] font-semibold text-apple-ink">AI 코칭 히스토리 블록</h2>
          <label className="block rounded-2xl border border-black/[0.06] bg-white/85 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <span className="text-[12px] font-medium text-apple-subtle">메인 화면에서 최근 코칭 목록 위에 붙는 제목</span>
            <input
              className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
              value={settings.copy.coachingHistoryTitle}
              onChange={(e) => setCopy({ coachingHistoryTitle: e.target.value })}
            />
          </label>
        </section>

        <section className="mb-10 space-y-4">
          <h2 className="text-[15px] font-semibold text-apple-ink">하단 푸터</h2>
          <p className="text-[13px] leading-relaxed text-apple-subtle">
            로그인 후 레이아웃 하단 카드에 표시됩니다. 링크는 <code className="rounded bg-orange-100/50 px-1">/경로</code> 또는{" "}
            <code className="rounded bg-orange-100/50 px-1">https://…</code> 만 허용됩니다.
          </p>
          <div className="grid gap-3 rounded-2xl border border-black/[0.06] bg-white/85 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <label className="block text-[12px] font-medium text-apple-subtle">
              상단 강조 한 줄 (기존 앱 타이틀과 별도로 둘 수 있음)
              <input
                className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                value={settings.copy.footer.primaryLine}
                onChange={(e) => setCopy({ footer: { ...settings.copy.footer, primaryLine: e.target.value } })}
              />
            </label>
            <label className="block text-[12px] font-medium text-apple-subtle">
              부가 한 줄 (비우면 숨김)
              <input
                className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                value={settings.copy.footer.secondaryLine}
                onChange={(e) => setCopy({ footer: { ...settings.copy.footer, secondaryLine: e.target.value } })}
              />
            </label>
            <label className="block text-[12px] font-medium text-apple-subtle">
              저작권·하단 문구 (<code className="rounded bg-orange-100/50 px-1">{"{year}"}</code> → 현재 연도)
              <input
                className="mt-1 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-[14px] text-apple-ink"
                value={settings.copy.footer.copyrightLine}
                onChange={(e) => setCopy({ footer: { ...settings.copy.footer, copyrightLine: e.target.value } })}
              />
            </label>
            <p className="text-[12px] font-medium text-apple-subtle">링크 행 (순서대로, 최대 12개)</p>
            <div className="grid gap-2">
              {settings.copy.footer.links.map((item, i) => (
                <div key={i} className="flex flex-wrap items-end gap-2 rounded-xl border border-black/[0.08] bg-white p-3">
                  <label className="min-w-[8rem] flex-1 text-[11px] font-medium text-apple-subtle">
                    라벨
                    <input
                      className="mt-1 w-full rounded border border-black/[0.08] px-2 py-1.5 text-[14px] text-apple-ink"
                      value={item.label}
                      onChange={(e) => {
                        const ft = settings.copy.footer;
                        const links = ft.links.map((it, j) => (j === i ? { ...it, label: e.target.value } : it));
                        setCopy({ footer: { ...ft, links } });
                      }}
                    />
                  </label>
                  <label className="min-w-[10rem] flex-[2] text-[11px] font-medium text-apple-subtle">
                    URL
                    <input
                      className="mt-1 w-full rounded border border-black/[0.08] px-2 py-1.5 text-[14px] text-apple-ink"
                      value={item.href}
                      onChange={(e) => {
                        const ft = settings.copy.footer;
                        const links = ft.links.map((it, j) => (j === i ? { ...it, href: e.target.value } : it));
                        setCopy({ footer: { ...ft, links } });
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    disabled={settings.copy.footer.links.length <= 1}
                    className="rounded-lg border border-orange-100 px-3 py-2 text-[12px] font-semibold text-apple-subtle transition hover:bg-rose-50 hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => {
                      const ft = settings.copy.footer;
                      if (ft.links.length <= 1) return;
                      setCopy({ footer: { ...ft, links: ft.links.filter((_, j) => j !== i) } });
                    }}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              disabled={settings.copy.footer.links.length >= 12}
              className="rounded-lg border border-orange-200/80 bg-u-mint/30 px-3 py-2 text-[12px] font-semibold text-apple-ink transition hover:bg-u-mint/50 disabled:opacity-40"
              onClick={() => {
                const ft = settings.copy.footer;
                setCopy({ footer: { ...ft, links: [...ft.links, { label: "새 링크", href: "/" }] } });
              }}
            >
              링크 추가
            </button>
          </div>
        </section>

        <button
          type="button"
          disabled={saving}
          onClick={() => void onSave()}
          className="w-full rounded-full bg-gradient-to-br from-apple to-[#ff8a7a] py-3.5 text-[15px] font-bold text-white shadow-lg transition hover:brightness-105 disabled:opacity-45"
        >
          {saving ? "수정 중…" : "수정"}
        </button>
    </div>
  );
}
