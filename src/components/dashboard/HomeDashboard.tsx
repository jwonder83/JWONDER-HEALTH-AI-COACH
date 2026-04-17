"use client";

import { WebCoachingSection } from "@/components/coaching/WebCoachingSection";
import { SiteFillImage } from "@/components/site/SiteFillImage";
import { SectionTitleBlock } from "@/components/ui/SectionTitleBlock";
import { DashboardGoalsCard } from "@/components/dashboard/DashboardGoalsCard";
import { WorkoutForm } from "@/components/workouts/WorkoutForm";
import { WorkoutList } from "@/components/workouts/WorkoutList";
import { createClient } from "@/lib/supabase/client";
import { mapWorkoutRow } from "@/lib/workouts/map-db-row";
import type { SiteSettingsMerged } from "@/types/site-settings";
import type { WorkoutInput, WorkoutRow } from "@/types/workout";
import { useCallback, useEffect, useMemo, useState } from "react";

const cardRing = "ring-1 ring-orange-100/90 shadow-[0_20px_50px_-24px_rgba(233,75,60,0.2)]";

const sectionShell =
  "scroll-mt-36 rounded-[1.75rem] border border-orange-100/80 bg-gradient-to-b from-white/95 via-white/85 to-u-lavender/[0.06] p-6 shadow-[0_14px_44px_-22px_rgba(233,75,60,0.14)] ring-1 ring-white/70 sm:scroll-mt-44 sm:rounded-[2.25rem] sm:p-9";

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
    <div className="pb-28 text-apple-ink">
      <div className="mx-auto max-w-4xl px-5 pt-6 sm:px-8 sm:pt-8">
        {/* 히어로 */}
        <div className={`relative overflow-hidden rounded-[2rem] sm:rounded-[2.25rem] ${cardRing}`}>
          <div className="relative aspect-[16/10] min-h-[220px] w-full sm:aspect-[2.15/1] sm:min-h-[300px]">
            <SiteFillImage
              src={site.images.hero.src}
              alt={site.images.hero.alt}
              priority
              className="object-center saturate-[1.05]"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#2c1810]/92 via-[#2c1810]/45 to-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_95%_75%_at_80%_100%,rgba(233,75,60,0.35),transparent_55%)]"
              aria-hidden
            />
            <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-u-mango/90">{site.copy.mainHero.eyebrow}</p>
              <h1 className="font-display mt-3 max-w-2xl text-[1.875rem] font-bold leading-[1.1] tracking-[-0.03em] text-white sm:text-[2.5rem] sm:leading-[1.06]">
                {site.copy.mainHero.titleLine1}
                <span className="mt-2 block font-semibold text-white/90">{site.copy.mainHero.titleLine2}</span>
              </h1>
              <p className="mt-5 max-w-lg text-[17px] font-medium leading-relaxed tracking-[-0.01em] text-white/78">
                {site.copy.mainHero.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Unsplash 타일 띠 */}
        <div className="mt-8 grid grid-cols-3 gap-2 sm:mt-10 sm:gap-3">
          {dashTiles.map((t, idx) => (
            <div
              key={t.key}
              className={`group relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg ring-2 ring-white/80 sm:rounded-3xl ${
                idx === 0 ? "rotate-[0.5deg]" : idx === 2 ? "-rotate-[0.5deg]" : ""
              }`}
            >
              <SiteFillImage src={t.src} alt={t.alt} className="transition duration-700 ease-out group-hover:scale-[1.04]" />
              <div
                className="absolute inset-0 bg-gradient-to-t from-[#2c1810]/75 via-transparent to-u-lavender/15 opacity-95 transition duration-500 group-hover:from-apple/40"
                aria-hidden
              />
              <span className="font-display absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white drop-shadow-sm sm:text-[11px]">
                {t.caption}
              </span>
            </div>
          ))}
        </div>

        {/* 스티키 내비 — 가독성 우선(큰 글씨·굵게·대비) */}
        <div className="sticky top-4 z-20 mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
          <nav
            aria-label="페이지 섹션"
            className="flex w-full max-w-2xl flex-wrap gap-1 rounded-full border border-orange-100/90 bg-white/70 p-1.5 shadow-inner shadow-orange-100/40 backdrop-blur-sm sm:flex-nowrap"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="min-h-[48px] flex-1 rounded-full bg-white px-3 py-3 text-center text-[15px] font-semibold leading-tight tracking-tight text-apple-ink shadow-sm transition-[color,background-color,transform,box-shadow] duration-200 hover:bg-gradient-to-br hover:from-apple hover:to-[#ff8a7a] hover:text-white hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple/35 focus-visible:ring-offset-2 focus-visible:ring-offset-apple-surface sm:flex-none sm:min-w-[6.75rem] sm:px-5 sm:text-[16px]"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-full border border-orange-100 bg-white px-4 py-2.5 text-[13px] font-semibold text-apple-subtle shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 active:scale-[0.98]"
          >
            전체 삭제
          </button>
        </div>

        <DashboardGoalsCard workouts={workouts} />
      </div>

      <main className="mx-auto max-w-4xl space-y-14 px-5 py-14 sm:space-y-20 sm:px-8 sm:py-20">
        <section id="section-input" className={sectionShell}>
          <SectionTitleBlock
            step="01"
            eyebrow="INPUT"
            title={site.copy.mainNavSectionLabels[0]}
            description={SECTION_HINT_INPUT}
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
              <span className="rounded-full border border-orange-100 bg-u-mint/50 px-3.5 py-1.5 text-[12px] font-semibold tabular-nums text-apple-ink shadow-sm">
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
