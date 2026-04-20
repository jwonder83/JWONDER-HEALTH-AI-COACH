import { hasWorkoutToday, recentWorkouts } from "@/lib/dashboard/insights";
import { buildOptimizedTodayRoutine } from "@/lib/routine/adaptive-routine-engine";
import { formatEstimatedLabel, type TodayRoutinePlan } from "@/lib/routine/today-routine-plan";
import type { OnboardingProfile } from "@/lib/onboarding/types";
import { endOfWeekSunday, rollupPeriod, startOfWeekMonday } from "@/lib/workouts/period-stats";
import {
  getStreakMotivationLine,
  isStreakAtRiskEvening,
  isStreakGentleNudge,
} from "@/lib/workouts/streak-engagement";
import { computeLoggingStreak } from "@/lib/workouts/streak";
import type { WorkoutRow } from "@/types/workout";

export type LocalWeeklyGoal = {
  weeklySessionTarget?: number;
};

export type { TodayRoutinePlan } from "@/lib/routine/today-routine-plan";

export type RecentActivityItem = {
  id: string;
  exerciseName: string;
  detail: string;
  createdAt: string;
};

export type HomeActionViewModel = {
  hydrated: boolean;
  todayWorkoutComplete: boolean;
  /** 주간 목표 대비 진행률(0–100). 목표 미설정 시 null */
  goalProgressPercent: number | null;
  weeklySessionCurrent: number;
  weeklySessionTarget: number | null;
  streakDays: number;
  /** 저녁 시간대·오늘 미기록 시 연속 끊김 직전 알림 */
  streakAtRisk: boolean;
  /** 오전~오후 부드러운 연속 유지 멘트 */
  streakGentleNudge: boolean;
  /** 성취·동기부여 한 줄(카드·배너에 사용) */
  streakMotivationLine: string | null;
  routine: TodayRoutinePlan;
  estimatedDurationLabel: string;
  /** AI 코치 한 줄 — 오늘 행동 유도 우선 */
  coachLine: string;
  recentActivities: RecentActivityItem[];
};

function buildCoachLine(args: {
  todayDone: boolean;
  routineTitle: string;
  streak: number;
  goalProgressPercent: number | null;
}): string {
  if (args.todayDone) {
    if (args.streak >= 3) {
      return `오늘 운동을 완료했어요. ${args.streak}일 연속입니다. 몸은 쉬게 하고 수분을 챙기세요.`;
    }
    return "오늘 운동을 완료했어요. 가벼운 스트레칭으로 마무리하면 회복에 도움이 됩니다.";
  }

  const focus = `오늘은 「${args.routineTitle}」이(가) 예정되어 있습니다.`;
  if (args.goalProgressPercent !== null && args.goalProgressPercent < 40) {
    return `${focus} 이번 주 진행이 아직 여유 있어요—지금 시작하면 리듬을 바로 잡을 수 있어요.`;
  }
  if (args.streak === 0) {
    return `${focus} 첫 세트만 남겨도 연속 기록이 시작돼요.`;
  }
  return `${focus} 지금 시작해 보세요.`;
}

export function buildHomeActionViewModel(
  workouts: WorkoutRow[],
  profile: OnboardingProfile | null,
  goals: LocalWeeklyGoal,
  hydrated: boolean,
  now = new Date(),
): HomeActionViewModel {
  const todayDone = hasWorkoutToday(workouts, now);
  const streak = computeLoggingStreak(workouts, now);
  const streakAtRisk = isStreakAtRiskEvening(workouts, hydrated, now);
  const streakGentleNudge = isStreakGentleNudge(workouts, hydrated, now);
  const streakMotivationLine = getStreakMotivationLine(streak, {
    atRisk: streakAtRisk,
    gentle: streakGentleNudge,
    todayDone,
  });
  const mon = startOfWeekMonday(now);
  const sun = endOfWeekSunday(mon);
  const week = rollupPeriod(workouts, mon, sun);
  const target = goals.weeklySessionTarget && goals.weeklySessionTarget > 0 ? goals.weeklySessionTarget : null;
  const goalPct =
    target !== null ? Math.min(100, Math.round((week.rowCount / target) * 100)) : null;

  const routine = buildOptimizedTodayRoutine(profile, workouts, now);
  const estimatedDurationLabel = formatEstimatedLabel(routine.estimatedMinutesMin, routine.estimatedMinutesMax);
  const coachLine = buildCoachLine({
    todayDone,
    routineTitle: routine.title,
    streak,
    goalProgressPercent: goalPct,
  });

  const recent = recentWorkouts(workouts, 3).map((w) => ({
    id: w.id,
    exerciseName: w.exercise_name.trim(),
    detail: `${Number(w.weight_kg)}kg × ${w.reps} × ${w.sets}`,
    createdAt: w.created_at,
  }));

  return {
    hydrated,
    todayWorkoutComplete: todayDone,
    goalProgressPercent: goalPct,
    weeklySessionCurrent: week.rowCount,
    weeklySessionTarget: target,
    streakDays: streak,
    streakAtRisk,
    streakGentleNudge,
    streakMotivationLine,
    routine,
    estimatedDurationLabel,
    coachLine,
    recentActivities: recent,
  };
}
