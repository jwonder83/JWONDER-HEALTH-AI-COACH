import { buildDailyStatusBriefing, type DailyStatusBriefing } from "@/lib/dashboard/daily-status-briefing";
import { buildWorkoutActionSuggestions, type WorkoutActionSuggestion } from "@/lib/dashboard/workout-action-suggestions";
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
export type { DailyStatusBriefing, FatigueLevel } from "@/lib/dashboard/daily-status-briefing";
export type { WorkoutActionSuggestion, WorkoutActionSuggestionKind } from "@/lib/dashboard/workout-action-suggestions";

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
  /** coachLine 근거(데이터·규칙 요약) */
  coachLineReason: string;
  recentActivities: RecentActivityItem[];
  /** 하루 상태 브리핑(피로도·추천 강도). 서버/로컬 데이터 로드 전에는 null */
  dailyBriefing: DailyStatusBriefing | null;
  /** 정체·부위 부족 → 실행 제안(로드 전에는 빈 배열) */
  actionSuggestions: WorkoutActionSuggestion[];
};

function buildCoachLine(args: {
  todayDone: boolean;
  routineTitle: string;
  streak: number;
  goalProgressPercent: number | null;
}): string {
  if (args.todayDone) {
    if (args.streak >= 3) {
      return `오늘도 해냈네요. ${args.streak}일 연속이에요. 물 한 모금이랑 가벼운 스트칭 정도만 챙겨요.`;
    }
    return "오늘 세션 클리어. 몸 풀어주는 스트칭 한 번이면 딱이에요.";
  }

  const focus = `오늘 픽은 「${args.routineTitle}」이에요.`;
  if (args.goalProgressPercent !== null && args.goalProgressPercent < 40) {
    return `${focus} 이번 주는 아직 여유 타임—지금 한 세트만 박아도 분위기 타요.`;
  }
  if (args.streak === 0) {
    return `${focus} 첫 세트만 남겨도 연속 기록 스위치 켜져요.`;
  }
  return `${focus} 지금 들어가면 딱이에요. 루틴은 이미 깔려 있어요.`;
}

function rowsLastNDays(workouts: WorkoutRow[], now: Date, days: number): number {
  const cut = now.getTime() - days * 86400000;
  return workouts.filter((w) => new Date(w.created_at).getTime() >= cut).length;
}

function buildCoachLineReason(args: {
  todayDone: boolean;
  streak: number;
  goalProgressPercent: number | null;
  weeklySessionCurrent: number;
  weeklySessionTarget: number | null;
  workouts: WorkoutRow[];
  now: Date;
}): string {
  if (args.todayDone) {
    return "오늘 날짜로 저장된 세트가 있어서 완료로 띄웠어요.";
  }
  const mon = startOfWeekMonday(args.now);
  const sun = endOfWeekSunday(mon);
  const thisWeek = rollupPeriod(args.workouts, mon, sun);
  const prevMon = new Date(mon);
  prevMon.setDate(prevMon.getDate() - 7);
  const prevSun = endOfWeekSunday(prevMon);
  const lastWeek = rollupPeriod(args.workouts, prevMon, prevSun);
  const last7 = rowsLastNDays(args.workouts, args.now, 7);
  const bits: string[] = [
    `이번 주 세트 ${thisWeek.rowCount}개`,
    `최근 7일 세트 ${last7}개`,
    args.streak > 0 ? `연속 ${args.streak}일째` : "연속은 아직 0일(어제까지 끊김 or 기록 없음)",
  ];
  if (lastWeek.volume > 40) {
    const p = Math.round(((thisWeek.volume - lastWeek.volume) / lastWeek.volume) * 1000) / 10;
    if (p <= -12) {
      bits.push(`지난주보다 볼륨 합이 약 ${p}% ↓라 살짝 쉬어가라는 톤 섞었어요`);
    } else {
      bits.push(`지난주 대비 볼륨 합 약 ${p}%`);
    }
  }
  if (args.goalProgressPercent !== null && args.weeklySessionTarget != null) {
    bits.push(`주간 목표 ${args.weeklySessionTarget}세션 중 ${args.weeklySessionCurrent}번째(${args.goalProgressPercent}%)`);
  }
  return bits.join(" · ") + ".";
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
  const coachLineReason = buildCoachLineReason({
    todayDone,
    streak,
    goalProgressPercent: goalPct,
    weeklySessionCurrent: week.rowCount,
    weeklySessionTarget: target,
    workouts,
    now,
  });

  const recent = recentWorkouts(workouts, 3).map((w) => ({
    id: w.id,
    exerciseName: w.exercise_name.trim(),
    detail: `${Number(w.weight_kg)}kg × ${w.reps} × ${w.sets}`,
    createdAt: w.created_at,
  }));

  const dailyBriefing = hydrated ? buildDailyStatusBriefing(workouts, now) : null;
  const actionSuggestions = hydrated ? buildWorkoutActionSuggestions(workouts, now) : [];

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
    coachLineReason,
    recentActivities: recent,
    dailyBriefing,
    actionSuggestions,
  };
}
