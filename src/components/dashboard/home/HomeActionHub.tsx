"use client";

import { StreakRiskBanner } from "@/components/gamification/StreakRiskBanner";
import { RecentActivitySummaryCard } from "@/components/dashboard/home/RecentActivitySummaryCard";
import { TodayStatusCard } from "@/components/dashboard/home/TodayStatusCard";
import { TodayWorkoutHeroCard } from "@/components/dashboard/home/TodayWorkoutHeroCard";
import { useHomeActionViewModel } from "@/components/dashboard/home/use-home-action-view-model";
import type { WorkoutRow } from "@/types/workout";

const grid = "mt-6 flex flex-col gap-4 sm:mt-8 sm:gap-5";

type Props = {
  workouts: WorkoutRow[];
  hydrated: boolean;
};

/** 홈 상단 — 오늘 운동 시작을 최우선으로 하는 카드 묶음 */
export function HomeActionHub({ workouts, hydrated }: Props) {
  const model = useHomeActionViewModel({ workouts, hydrated });

  return (
    <div className={grid}>
      <StreakRiskBanner visible={model.streakAtRisk} streakDays={model.streakDays} />
      <TodayStatusCard model={model} />
      <TodayWorkoutHeroCard model={model} workoutSectionId="today-workout" />
      <RecentActivitySummaryCard items={model.recentActivities} hydrated={model.hydrated} />
    </div>
  );
}
