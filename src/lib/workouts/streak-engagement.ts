import { hasWorkoutToday } from "@/lib/dashboard/insights";
import type { WorkoutRow } from "@/types/workout";
import { computeLoggingStreak } from "@/lib/workouts/streak";

/** 연속 일수 뱃지 구간 */
export const STREAK_MILESTONE_DAYS = [3, 7, 30] as const;

export type MilestoneBadgeState = {
  days: (typeof STREAK_MILESTONE_DAYS)[number];
  unlocked: boolean;
  label: string;
};

export function getStreakMilestoneBadges(streak: number): MilestoneBadgeState[] {
  return STREAK_MILESTONE_DAYS.map((d) => ({
    days: d,
    unlocked: streak >= d,
    label: `${d}일`,
  }));
}

/** 다음 뱃지까지 남은 일수 (없으면 null = 30일 달성) */
export function getNextMilestoneRemaining(streak: number): { next: number; remaining: number } | null {
  const next = STREAK_MILESTONE_DAYS.find((m) => streak < m);
  if (next === undefined) return null;
  return { next, remaining: next - streak };
}

/**
 * 연속이 곧 끊길 수 있는 저녁 시간대 알림.
 * (오늘 미기록 + 이미 쌓인 연속이 있을 때, 당일 기록 마감 전 동기부여)
 */
export function isStreakAtRiskEvening(workouts: WorkoutRow[], hydrated: boolean, now = new Date()): boolean {
  if (!hydrated || workouts.length === 0) return false;
  if (hasWorkoutToday(workouts, now)) return false;
  const streak = computeLoggingStreak(workouts, now);
  if (streak < 1) return false;
  const hour = now.getHours();
  return hour >= 17;
}

/** 오전~오후 부드러운 연속 유지 멘트 표시 여부 */
export function isStreakGentleNudge(workouts: WorkoutRow[], hydrated: boolean, now = new Date()): boolean {
  if (!hydrated || workouts.length === 0) return false;
  if (hasWorkoutToday(workouts, now)) return false;
  const streak = computeLoggingStreak(workouts, now);
  if (streak < 2) return false;
  const hour = now.getHours();
  return hour < 17;
}

export function getStreakMotivationLine(
  streak: number,
  opts: { atRisk: boolean; gentle: boolean; todayDone: boolean },
): string | null {
  if (opts.todayDone) {
    if (streak >= 30) return `대단해요. ${streak}일 연속! 오늘도 한 걸음 더 쌓았어요.`;
    if (streak >= 7) return `멋져요. ${streak}일 연속이에요. 꾸준함이 빛나고 있어요.`;
    if (streak >= 3) return `오늘도 연결했어요. ${streak}일째—리듬이 살아 있어요.`;
    return "오늘 기록, 잘 마무리했어요. 내일도 이어가 봐요.";
  }
  if (opts.atRisk) {
    return `오늘 안에 한 세트만 남겨도 연속 ${streak}일이 이어져요. 지금이 가장 좋은 타이밍이에요.`;
  }
  if (opts.gentle && streak >= 2) {
    return `${streak}일 연속 중이에요. 오늘도 가볍게 이어가 볼까요?`;
  }
  return null;
}
