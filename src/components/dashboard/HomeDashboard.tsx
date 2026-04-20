"use client";

import { WebCoachingSection } from "@/components/coaching/WebCoachingSection";
import { HomeActionHub } from "@/components/dashboard/home/HomeActionHub";
import { OnboardingBanner } from "@/components/dashboard/OnboardingBanner";
import { DashboardGoalsCard } from "@/components/dashboard/DashboardGoalsCard";
import { navSegmentBar, navSegmentItem, navToolbarButton } from "@/components/nav/menu-styles";
import { SiteFillImage } from "@/components/site/SiteFillImage";
import { SectionTitleBlock } from "@/components/ui/SectionTitleBlock";
import { Toast } from "@/components/ui/Toast";
import { WorkoutForm } from "@/components/workouts/WorkoutForm";
import { WorkoutList } from "@/components/workouts/WorkoutList";
import { createClient } from "@/lib/supabase/client";
import { mapWorkoutRow } from "@/lib/workouts/map-db-row";
import { notifyWorkoutsMutated } from "@/lib/workouts/workouts-events";
import { isNewVolumePr, volumeFromNumbers } from "@/lib/dashboard/insights";
import { endOfWeekSunday, rollupPeriod, startOfWeekMonday } from "@/lib/workouts/period-stats";
import type { SiteSettingsMerged } from "@/types/site-settings";
import type { WorkoutInput, WorkoutRow } from "@/types/workout";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

function IconPencil({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path d="M4 19V5M4 19h16M8 17V9M12 17v-5M16 17v-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconBook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinejoin="round" />
    </svg>
  );
}

function IconLifeBuoy({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <path d="M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24" strokeLinecap="round" />
    </svg>
  );
}

const cardRing =
  "border border-neutral-200 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.08)] dark:border-zinc-800 dark:shadow-[0_20px_50px_-24px_rgba(0,0,0,0.4)]";

const sectionShell =
  "scroll-mt-36 border border-neutral-200 bg-white p-6 shadow-sm sm:scroll-mt-44 sm:p-9 dark:border-zinc-800 dark:bg-zinc-950";

const SECTION_HINT_INPUT = "저장하면 바로 아래 목록에 반영돼요.";
const SECTION_HINT_LIST = "날짜·종목별로 보고, 필요하면 한 건씩 지울 수 있어요.";

type Props = {
  userId: string;
  site: SiteSettingsMerged;
};

export function HomeDashboard({ userId, site }: Props) {
  const [workouts, setWorkouts] = useState<WorkoutRow[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "default" | "achievement" } | null>(null);

  const navItems = useMemo(
    () =>
      [
        { href: "#section-input", label: site.copy.mainNavSectionLabels[0] },
        { href: "#section-list", label: site.copy.mainNavSectionLabels[1] },
        { href: "#section-coach", label: site.copy.mainNavSectionLabels[2] },
      ] as const,
    [site.copy.mainNavSectionLabels],
  );

  const dashTiles = useMemo(
    () =>
      [
        { key: "t1", ...site.images.dashTile1, caption: site.copy.mainDashTileCaptions[0] },
        { key: "t2", ...site.images.dashTile2, caption: site.copy.mainDashTileCaptions[1] },
        { key: "t3", ...site.images.dashTile3, caption: site.copy.mainDashTileCaptions[2] },
      ] as const,
    [site.images, site.copy.mainDashTileCaptions],
  );

  const weekBounds = useMemo(() => {
    const mon = startOfWeekMonday();
    return { mon, sun: endOfWeekSunday(mon) };
  }, []);

  const weekRollup = useMemo(
    () => rollupPeriod(workouts, weekBounds.mon, weekBounds.sun),
    [workouts, weekBounds.mon, weekBounds.sun],
  );

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setWorkouts([]);
      setHydrated(true);
      return;
    }
    setWorkouts((data ?? []).map((r) => mapWorkoutRow(r as Record<string, unknown>)));
    setHydrated(true);
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function saveWorkout(input: WorkoutInput): Promise<{ error?: string; pr?: boolean }> {
    const vol = volumeFromNumbers(input.weight_kg, input.reps, input.sets);
    const pr = isNewVolumePr(workouts, input.exercise_name.trim(), vol);
    const supabase = createClient();
    const { error } = await supabase.from("workouts").insert({
      user_id: userId,
      exercise_name: input.exercise_name.trim(),
      weight_kg: input.weight_kg,
      reps: input.reps,
      sets: input.sets,
      success: input.success,
    });
    if (error) {
      return { error: error.message };
    }
    await refresh();
    notifyWorkoutsMutated();
    return { pr };
  }

  async function handleClear() {
    if (typeof window === "undefined") return;
    if (!window.confirm("계정에 저장된 모든 운동 기록을 삭제할까요? 이 작업은 되돌릴 수 없습니다.")) return;
    const supabase = createClient();
    const { error } = await supabase.from("workouts").delete().eq("user_id", userId);
    if (error) {
      window.alert(error.message);
      return;
    }
    await refresh();
    notifyWorkoutsMutated();
  }

  async function handleDeleteOne(id: string) {
    if (typeof window === "undefined") return;
    if (!window.confirm("이 기록만 삭제할까요?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("workouts").delete().eq("id", id).eq("user_id", userId);
    if (error) {
      window.alert(error.message);
      return;
    }
    await refresh();
    notifyWorkoutsMutated();
  }

  return (
    <div className="relative pb-28 text-apple-ink dark:text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_70%_at_50%_0%,rgba(0,0,0,0.04),transparent_50%)]"
        aria-hidden
      />
      <div className="mx-auto max-w-5xl px-5 pt-6 sm:px-8 sm:pt-8">
        {/* 히어로 */}
        <div className={`relative overflow-hidden sm:rounded-sm ${cardRing}`}>
          <div className="relative aspect-[16/10] min-h-[240px] w-full sm:aspect-[2.15/1] sm:min-h-[320px]">
            <SiteFillImage
              src={site.images.hero.src}
              alt={site.images.hero.alt}
              priority
              className="object-center grayscale-[0.25] contrast-[1.02]"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
              aria-hidden
            />
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12">
              <p className="text-[11px] font-medium tracking-[-0.01em] text-white/75">{site.copy.mainHero.eyebrow}</p>
              <h1 className="font-display mt-3 max-w-2xl text-[1.875rem] font-bold leading-[1.1] tracking-[-0.03em] text-white sm:text-[2.5rem] sm:leading-[1.06]">
                {site.copy.mainHero.titleLine1}
                <span className="mt-2 block font-semibold text-white/90">{site.copy.mainHero.titleLine2}</span>
              </h1>
              <p className="mt-4 max-w-lg text-[15px] font-medium leading-snug tracking-[-0.01em] text-white/80 sm:mt-5 sm:text-[16px]">
                {site.copy.mainHero.subtitle}
              </p>
              <div className="pointer-events-auto mt-6 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
                <Link
                  href="/workout"
                  className="inline-flex items-center justify-center rounded-lg border border-white bg-white px-5 py-2.5 text-[13px] font-semibold tracking-[-0.02em] text-black transition hover:bg-white/90 active:scale-[0.98] sm:py-3 sm:text-[14px]"
                >
                  세트 남기기
                </Link>
                <Link
                  href="/program"
                  className="inline-flex items-center justify-center rounded-lg border border-white/45 bg-white/10 px-5 py-2.5 text-[13px] font-medium tracking-[-0.02em] text-white backdrop-blur-sm transition hover:bg-white hover:text-black active:scale-[0.98] sm:py-3 sm:text-[14px]"
                >
                  {site.program.navLabel}
                </Link>
                <Link
                  href="/performance"
                  className="inline-flex items-center justify-center rounded-lg border border-white/45 bg-white/10 px-5 py-2.5 text-[13px] font-medium tracking-[-0.02em] text-white backdrop-blur-sm transition hover:bg-white hover:text-black active:scale-[0.98] sm:py-3 sm:text-[14px]"
                >
                  성과 보기
                </Link>
              </div>
            </div>
          </div>
        </div>

        <HomeActionHub workouts={workouts} hydrated={hydrated} />

        <OnboardingBanner />

        {/* Unsplash 타일 띠 */}
        <div className="mt-8 grid grid-cols-3 gap-2 sm:mt-10 sm:gap-3">
          {dashTiles.map((t) => (
            <div
              key={t.key}
              className="group relative aspect-[4/3] overflow-hidden border border-neutral-200 shadow-sm"
            >
              <SiteFillImage src={t.src} alt={t.alt} className="transition duration-700 ease-out group-hover:scale-[1.02] grayscale-[0.2]" />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-90 transition duration-500 group-hover:from-black/80"
                aria-hidden
              />
              <span className="absolute bottom-3 left-3 text-[11px] font-semibold tracking-[-0.01em] text-white sm:text-[12px]">
                {t.caption}
              </span>
            </div>
          ))}
        </div>

        {/* 한눈에 요약 */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4">
          {[
            {
              k: "total",
              label: "전체",
              value: hydrated ? `${workouts.length}` : "—",
              unit: "건",
              sub: "세트 행",
            },
            {
              k: "week",
              label: "이번 주",
              value: hydrated ? `${weekRollup.rowCount}` : "—",
              unit: "건",
              sub: "월~일",
            },
            {
              k: "vol",
              label: "주간 볼륨",
              value: hydrated ? `${Math.round(weekRollup.volume * 10) / 10}` : "—",
              unit: "합",
              sub: weekRollup.topExercise ? `1위 ${weekRollup.topExercise}` : "kg×회×세트",
            },
          ].map((s) => (
            <div
              key={s.k}
              className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <p className="text-[11px] font-medium tracking-[-0.01em] text-apple-subtle">{s.label}</p>
              <p className="font-display mt-2 text-[1.35rem] font-bold tabular-nums text-apple-ink sm:text-[1.5rem]">
                {s.value}
                <span className="ml-1 text-[13px] font-semibold text-apple-subtle sm:text-[14px]">{s.unit}</span>
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-apple-subtle sm:text-[12px]">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* 빠른 이동 카드 */}
        <div className="mt-8 sm:mt-10">
          <p className="text-[12px] font-medium tracking-[-0.01em] text-apple-subtle">바로가기</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="#section-input"
              className="group flex gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-black sm:p-5"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-apple-ink">
                <IconPencil className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="text-[15px] font-semibold tracking-[-0.02em] text-apple-ink group-hover:opacity-70">오늘 세트 남기기</span>
                <span className="mt-1 block text-[12px] leading-snug text-apple-subtle">저장하면 목록에 바로 떠요</span>
              </span>
            </Link>
            <Link
              href="/program"
              className="group flex gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-black sm:p-5"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-apple-ink">
                <IconBook className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="text-[15px] font-semibold tracking-[-0.02em] text-apple-ink group-hover:opacity-70">{site.program.navLabel}</span>
                <span className="mt-1 block text-[12px] leading-snug text-apple-subtle">{site.program.promoLinkLabel}</span>
              </span>
            </Link>
            <Link
              href="/performance"
              className="group flex gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-black sm:p-5"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-apple-ink">
                <IconChart className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="text-[15px] font-semibold tracking-[-0.02em] text-apple-ink group-hover:opacity-70">성과 보기</span>
                <span className="mt-1 block text-[12px] leading-snug text-apple-subtle">그래프랑 CSV 다운로드</span>
              </span>
            </Link>
            <Link
              href="/help"
              className="group flex gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-black sm:p-5"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-apple-ink">
                <IconLifeBuoy className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="text-[15px] font-semibold tracking-[-0.02em] text-apple-ink group-hover:opacity-70">도움말</span>
                <span className="mt-1 block text-[12px] leading-snug text-apple-subtle">FAQ랑 문의 안내</span>
              </span>
            </Link>
          </div>
        </div>

        {hydrated && workouts.length === 0 ? (
          <div className="mt-8 flex flex-col gap-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
            <div>
              <p className="text-[15px] font-semibold tracking-[-0.02em] text-apple-ink">아직 기록이 없어요</p>
              <p className="mt-1 text-[13px] leading-snug text-apple-subtle">첫 세트부터 쌓아볼까요?</p>
            </div>
            <Link
              href="/workout"
              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-black bg-black px-5 py-2.5 text-[13px] font-semibold tracking-[-0.02em] text-white transition hover:bg-neutral-800 active:scale-[0.98]"
            >
              세트 남기기
            </Link>
          </div>
        ) : null}

        {/* 스티키 내비 — 가독성 우선(큰 글씨·굵게·대비) */}
        <div className="sticky top-4 z-20 mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="페이지 섹션" className={navSegmentBar}>
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className={navSegmentItem}>
                {item.label}
              </a>
            ))}
          </nav>
          <button type="button" onClick={handleClear} className={`${navToolbarButton} active:scale-[0.98]`}>
            전체 지우기
          </button>
        </div>

        <DashboardGoalsCard workouts={workouts} />
      </div>

      <main className="mx-auto max-w-5xl space-y-14 px-5 py-14 sm:space-y-20 sm:px-8 sm:py-20">
        <section id="section-input" className={`${sectionShell} rounded-xl`}>
          <SectionTitleBlock
            step="01"
            eyebrow="입력"
            title={site.copy.mainNavSectionLabels[0]}
            description={
              <>
                {SECTION_HINT_INPUT}{" "}
                <Link
                  href="/program"
                  className="font-semibold text-apple-ink underline decoration-neutral-400 underline-offset-[4px] hover:opacity-60"
                >
                  {site.program.promoLinkLabel}
                </Link>
              </>
            }
          />
          <WorkoutForm
            onSaved={(r) => {
              if (r?.pr) {
                setToast({ message: "새 PR이에요! 이 종목 볼륨 최고 기록을 갱신했어요.", variant: "achievement" });
              }
            }}
            saveWorkout={saveWorkout}
            copy={site.copy.workoutForm}
            omitCardHeader
            allWorkouts={workouts}
          />
        </section>

        <section id="section-list" className={`${sectionShell} rounded-xl`}>
          <SectionTitleBlock
            step="02"
            eyebrow="기록"
            title={site.copy.mainNavSectionLabels[1]}
            description={SECTION_HINT_LIST}
            right={
              <span className="rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-1.5 text-[12px] font-medium tracking-[-0.01em] text-apple-ink tabular-nums">
                {hydrated ? `${workouts.length}건` : "—"}
              </span>
            }
          />
          <WorkoutList
            items={workouts}
            loading={!hydrated}
            listEmptyImage={site.images.listEmpty}
            listEmptyTitle={site.copy.listEmptyTitle}
            listEmptySubtitle={site.copy.listEmptySubtitle}
            onDeleteItem={(id) => void handleDeleteOne(id)}
          />
        </section>

        <section id="section-coach" className={`${sectionShell} rounded-xl`}>
          <SectionTitleBlock
            step="03"
            eyebrow="코치"
            title={site.copy.mainNavSectionLabels[2]}
            description={site.copy.webCoachingHint}
          />
          <WebCoachingSection
            userId={userId}
            workoutsSnapshot={workouts}
            coachingImage={site.images.coaching}
            eyebrow={site.copy.webCoachingEyebrow}
            title={site.copy.webCoachingTitle}
            description={site.copy.webCoachingHint}
            buttonLabel={site.copy.webCoachingButtonLabel}
            historyTitle={site.copy.coachingHistoryTitle}
            omitInnerTitle
          />
        </section>
      </main>

      <Toast message={toast?.message ?? null} variant={toast?.variant ?? "default"} onDismiss={() => setToast(null)} durationMs={toast?.variant === "achievement" ? 5200 : 4200} />
    </div>
  );
}
