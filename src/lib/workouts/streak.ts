import { hasWorkoutToday } from "@/lib/dashboard/insights";
import { yesterdayMissedWithPriorHistory } from "@/lib/dashboard/recovery-workout-ux";
import type { WorkoutRow } from "@/types/workout";

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * 오늘 또는 어제에 기록이 있으면 그날부터, 없으면 0.
 * 해당 앵커일부터 과거로 하루씩 거슬러 올라가며 연속으로 기록이 있는 캘린더 일 수.
 */
export function computeLoggingStreak(workouts: WorkoutRow[], now = new Date()): number {
  const keys = new Set(workouts.map((w) => localDateKey(new Date(w.created_at))));
  if (keys.size === 0) return 0;

  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
  let key = localDateKey(d);
  if (!keys.has(key)) {
    d.setDate(d.getDate() - 1);
    key = localDateKey(d);
    if (!keys.has(key)) return 0;
  }

  let streak = 0;
  while (keys.has(localDateKey(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

/**
 * 캘린더 연속 일수에 **하루 공백 1회**까지 허용(복귀·유지 UX).
 * 오늘 기록 후 어제를 비운 경우에도 이어 세는 데 사용합니다.
 */
export function computeLoggingStreakWithGapGrace(workouts: WorkoutRow[], now = new Date()): number {
  const keys = new Set(workouts.map((w) => localDateKey(new Date(w.created_at))));
  if (keys.size === 0) return 0;

  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
  let key = localDateKey(d);
  if (!keys.has(key)) {
    d.setDate(d.getDate() - 1);
    key = localDateKey(d);
    if (!keys.has(key)) return 0;
  }

  let streak = 0;
  let gapsUsed = 0;
  while (true) {
    if (keys.has(localDateKey(d))) {
      streak++;
      d.setDate(d.getDate() - 1);
      continue;
    }
    if (gapsUsed < 1) {
      gapsUsed++;
      d.setDate(d.getDate() - 1);
      continue;
    }
    break;
  }
  return streak;
}

/**
 * 홈·동기부여용: 단일 공백 grace + (오늘 미기록이고 어제만 비었을 때) 직전 연속 일수 캐리오버.
 */
export function computeLoggingStreakMerged(workouts: WorkoutRow[], now = new Date()): number {
  const grace = computeLoggingStreakWithGapGrace(workouts, now);
  if (hasWorkoutToday(workouts, now)) return grace;
  if (!yesterdayMissedWithPriorHistory(workouts, now)) return grace;
  const asOf = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 18, 0, 0, 0);
  const carry = computeLoggingStreak(workouts, asOf);
  return Math.max(grace, carry);
}
