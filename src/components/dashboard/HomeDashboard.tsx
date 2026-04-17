"use client";

import { WebCoachingSection } from "@/components/coaching/WebCoachingSection";
import { SiteFillImage } from "@/components/site/SiteFillImage";
import { SectionTitleBlock } from "@/components/ui/SectionTitleBlock";
import { DashboardGoalsCard } from "@/components/dashboard/DashboardGoalsCard";
import { WorkoutForm } from "@/components/workouts/WorkoutForm";
import { WorkoutList } from "@/components/workouts/WorkoutList";
import { createClient } from "@/lib/supabase/client";
import { mapWorkoutRow } from "@/lib/workouts/map-db-row";
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

const cardRing = "border border-neutral-200 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.08)]";

const sectionShell =
  "scroll-mt-36 border border-neutral-200 bg-white p-6 shadow-sm sm:scroll-mt-44 sm:p-9";

const SECTION_HINT_INPUT = "필드를 채우고 저장하면 바로 아래 목록에 반영됩니다.";
const SECTION_HINT_LIST = "날짜·종목 기준으로 기록을 확인하고 한 건씩 지울 수 있어요.";

type Props = {
  userId: string;
  site: SiteSettingsMerged;
};

export function HomeDashboard({ userId, site }: Props) {
  const [workouts, setWorkouts] = useState<WorkoutRow[]>([]);
  const [hydrated, setHydrated] = useState(false);

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

  const todayLabel = useMemo(() => {
    return new Intl.DateTimeFormat("ko-KR", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(new Date());
  }, []);

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

  async function saveWorkout(input: WorkoutInput): Promise<{ error?: string }> {
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
    return {};
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
  }

  return (
    <div className="relative pb-28 text-apple-ink">
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
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/70">{site.copy.mainHero.eyebrow}</p>
              <p className="mt-2 text-[12px] font-medium text-white/55 sm:text-[13px]">{todayLabel}</p>
              <h1 className="font-display mt-3 max-w-2xl text-[1.875rem] font-bold leading-[1.1] tracking-[-0.03em] text-white sm:text-[2.5rem] sm:leading-[1.06]">
                {site.copy.mainHero.titleLine1}
                <span className="mt-2 block font-semibold text-white/90">{site.copy.mainHero.titleLine2}</span>
              </h1>
              <p className="mt-4 max-w-lg text-[16px] font-medium leading-relaxed tracking-[-0.01em] text-white/78 sm:mt-5 sm:text-[17px]">
                {site.copy.mainHero.subtitle}
              </p>
              <div className="pointer-events-auto mt-6 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
                <a
                  href="#section-input"
                  className="inline-flex items-center justify-center border border-white bg-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-transparent hover:text-white active:scale-[0.98] sm:py-3 sm:text-[12px]"
                >
                  바로 기록하기
                </a>
                <Link
                  href="/records"
                  className="inline-flex items-center justify-center border border-white/50 bg-transparent px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-black active:scale-[0.98] sm:py-3 sm:text-[12px]"
                >
                  통계·보내기
                </Link>
                <Link
                  href="/program"
                  className="inline-flex items-center justify-center border border-white/50 bg-transparent px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-black active:scale-[0.98] sm:py-3 sm:text-[12px]"
                >
                  {site.program.navLabel}
                </Link>
              </div>
            </div>
          </div>
        </div>

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
              <span className="font-display absolute bottom-3 left-3 text-[10px] font-medium uppercase tracking-[0.2em] text-white sm:text-[11px]">
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
              label: "누적 기록",
              value: hydrated ? `${workouts.length}` : "—",
              unit: "건",
              sub: "저장된 세트 행",
            },
            {
              k: "week",
              label: "이번 주",
              value: hydrated ? `${weekRollup.rowCount}` : "—",
              unit: "건",
              sub: "월~일 기준",
            },
            {
              k: "vol",
              label: "이번 주 볼륨",
              value: hydrated ? `${Math.round(weekRollup.volume * 10) / 10}` : "—",
              unit: "합",
              sub: weekRollup.topExercise ? `많이 남긴 종목: ${weekRollup.topExercise}` : "종목별 kg×회×세트 합산",
            },
          ].map((s) => (
            <div
              key={s.k}
              className="border border-neutral-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-apple-subtle">{s.label}</p>
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
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-apple-subtle">바로 가기</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="#section-input"
              className="group flex gap-3 border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-black sm:p-5"
            >
              <span className="flex size-11 shrink-0 items-center justify-center border border-neutral-200 bg-neutral-50 text-apple-ink">
                <IconPencil className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="font-display text-[15px] font-semibold text-apple-ink group-hover:opacity-70">운동 기록</span>
                <span className="mt-1 block text-[12px] leading-snug text-apple-subtle">세트를 남기고 목록에서 바로 확인</span>
              </span>
            </Link>
            <Link
              href="/records"
              className="group flex gap-3 border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-black sm:p-5"
            >
              <span className="flex size-11 shrink-0 items-center justify-center border border-neutral-200 bg-neutral-50 text-apple-ink">
                <IconChart className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="font-display text-[15px] font-semibold text-apple-ink group-hover:opacity-70">통계·보내기</span>
                <span className="mt-1 block text-[12px] leading-snug text-apple-subtle">기간별 요약과 CSV보내기</span>
              </span>
            </Link>
            <Link
              href="/program"
              className="group flex gap-3 border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-black sm:p-5"
            >
              <span className="flex size-11 shrink-0 items-center justify-center border border-neutral-200 bg-neutral-50 text-apple-ink">
                <IconBook className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="font-display text-[15px] font-semibold text-apple-ink group-hover:opacity-70">{site.program.navLabel}</span>
                <span className="mt-1 block text-[12px] leading-snug text-apple-subtle">{site.program.promoLinkLabel}</span>
              </span>
            </Link>
            <Link
              href="/help"
              className="group flex gap-3 border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-black sm:p-5"
            >
              <span className="flex size-11 shrink-0 items-center justify-center border border-neutral-200 bg-neutral-50 text-apple-ink">
                <IconLifeBuoy className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="font-display text-[15px] font-semibold text-apple-ink group-hover:opacity-70">도움말</span>
                <span className="mt-1 block text-[12px] leading-snug text-apple-subtle">FAQ와 문의 안내</span>
              </span>
            </Link>
          </div>
        </div>

        {hydrated && workouts.length === 0 ? (
          <div className="mt-8 flex flex-col gap-3 border border-dashed border-neutral-300 bg-neutral-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
            <div>
              <p className="font-display text-[15px] font-semibold text-apple-ink">아직 저장된 기록이 없어요</p>
              <p className="mt-1 text-[13px] leading-relaxed text-apple-subtle">첫 세트를 남기면 여기와 통계에 바로 쌓입니다.</p>
            </div>
            <a
              href="#section-input"
              className="inline-flex shrink-0 items-center justify-center border border-black bg-black px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-black active:scale-[0.98]"
            >
              기록 입력으로 이동
            </a>
          </div>
        ) : null}

        {/* 스티키 내비 — 가독성 우선(큰 글씨·굵게·대비) */}
        <div className="sticky top-4 z-20 mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
          <nav
            aria-label="페이지 섹션"
            className="flex w-full max-w-2xl flex-wrap divide-neutral-200 border border-neutral-200 bg-white sm:flex-nowrap sm:divide-x"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="min-h-[48px] flex-1 bg-white px-3 py-3 text-center text-[13px] font-medium uppercase tracking-[0.12em] text-apple-ink transition hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 sm:flex-none sm:min-w-[6.75rem] sm:px-5 sm:text-[12px]"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            onClick={handleClear}
            className="border border-neutral-300 bg-white px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-apple-subtle transition hover:border-black hover:text-black active:scale-[0.98]"
          >
            전체 삭제
          </button>
        </div>

        <DashboardGoalsCard workouts={workouts} />
      </div>

      <main className="mx-auto max-w-5xl space-y-14 px-5 py-14 sm:space-y-20 sm:px-8 sm:py-20">
        <section id="section-input" className={sectionShell}>
          <SectionTitleBlock
            step="01"
            eyebrow="INPUT"
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
                에서 루틴·워밍업·RPE 팁을 볼 수 있어요.
              </>
            }
          />
          <WorkoutForm
            onSaved={() => void refresh()}
            saveWorkout={saveWorkout}
            copy={site.copy.workoutForm}
            omitCardHeader
          />
        </section>

        <section id="section-list" className={sectionShell}>
          <SectionTitleBlock
            step="02"
            eyebrow="LIST"
            title={site.copy.mainNavSectionLabels[1]}
            description={SECTION_HINT_LIST}
            right={
              <span className="border border-neutral-200 bg-neutral-50 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-apple-ink tabular-nums">
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

        <section id="section-coach" className={sectionShell}>
          <SectionTitleBlock
            step="03"
            eyebrow="COACH"
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
    </div>
  );
}
