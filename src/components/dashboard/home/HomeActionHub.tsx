"use client";

import { DailyStatusBriefingCard } from "@/components/dashboard/home/DailyStatusBriefingCard";
import { WorkoutActionSuggestionsCard } from "@/components/dashboard/home/WorkoutActionSuggestionsCard";
import { StreakRiskBanner } from "@/components/gamification/StreakRiskBanner";
import { NoWorkoutCoachIntervention } from "@/components/dashboard/home/NoWorkoutCoachIntervention";
import { RecentActivitySummaryCard } from "@/components/dashboard/home/RecentActivitySummaryCard";
import { TodayRoutinePlanCard } from "@/components/dashboard/home/TodayRoutinePlanCard";
import { TodayStatusCard } from "@/components/dashboard/home/TodayStatusCard";
import { TodayWorkoutHeroCard } from "@/components/dashboard/home/TodayWorkoutHeroCard";
import { UserWorkoutStateRibbon } from "@/components/dashboard/home/UserWorkoutStateRibbon";
import { useHomeActionViewModel } from "@/components/dashboard/home/use-home-action-view-model";
import { useTodayRoutineConfirmation } from "@/components/dashboard/home/use-today-routine-confirmation";
import type { UserWorkoutUiState } from "@/lib/dashboard/user-workout-ui-state";
import type { SiteExperienceConfig } from "@/types/site-settings";
import type { WorkoutRow } from "@/types/workout";

const grid = "mt-6 flex flex-col gap-4 sm:mt-8 sm:gap-5";

type Props = {
  workouts: WorkoutRow[];
  hydrated: boolean;
  userWorkoutUiState: UserWorkoutUiState;
  experience: SiteExperienceConfig;
};

/** 홈 상단 — 오늘 운동 시작을 최우선으로 하는 카드 묶음 */
export function HomeActionHub({ workouts, hydrated, userWorkoutUiState, experience }: Props) {
  const model = useHomeActionViewModel({ workouts, hydrated, experience });
  const routineFlow = useTodayRoutineConfirmation({
    routine: model.routine,
    todayWorkoutComplete: model.todayWorkoutComplete,
  });

  return (
    <div className={grid} data-user-workout-state={userWorkoutUiState}>
      <UserWorkoutStateRibbon state={userWorkoutUiState} />
      <StreakRiskBanner visible={model.streakAtRisk} streakDays={model.streakDays} />
      <TodayStatusCard model={model} uiState={userWorkoutUiState} />
      <DailyStatusBriefingCard briefing={model.dailyBriefing} hydrated={model.hydrated} />
      <WorkoutActionSuggestionsCard
        suggestions={model.actionSuggestions}
        hydrated={model.hydrated}
        hasAnyWorkoutRow={workouts.length > 0}
      />
      {model.hydrated && !model.todayWorkoutComplete && userWorkoutUiState !== "active" ? (
        <NoWorkoutCoachIntervention
          estimatedDurationLabel={model.estimatedDurationLabel}
          routineTitle={model.routine.title}
          planConfirmed={routineFlow.status === "confirmed" || routineFlow.status === "completed"}
          coachLine={model.coachLine}
          coachLineReason={model.coachLineReason}
          streakDays={model.streakDays}
          interventionHours={{
            morningEndHour: experience.interventionMorningEndHour,
            afternoonEndHour: experience.interventionAfternoonEndHour,
            eveningEndHour: experience.interventionEveningEndHour,
          }}
        />
      ) : null}
      <TodayRoutinePlanCard
        model={model}
        status={routineFlow.status}
        onConfirm={routineFlow.confirm}
        onRequestPlanChange={routineFlow.requestPlanChange}
      />
      <TodayWorkoutHeroCard
        model={model}
        routineFlowStatus={routineFlow.status}
        workoutSectionId="today-workout"
        userWorkoutUiState={userWorkoutUiState}
      />
      <RecentActivitySummaryCard items={model.recentActivities} hydrated={model.hydrated} />
    </div>
  );
}
