import { hasWorkoutToday } from "@/lib/dashboard/insights";
import type { WorkoutRow } from "@/types/workout";

function localDayKeyFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function localDayKeyFromIso(iso: string): string {
  return localDayKeyFromDate(new Date(iso));
}

/**
 * 어제(로컬 캘린더)에 세트가 없고, 그 이전에 기록이 있었던 경우.
 * (첫 기록만 있는 날·장기 공백 후 첫날은 제외하려면 호출부에서 추가 필터)
 */
export function yesterdayMissedWithPriorHistory(workouts: WorkoutRow[], now = new Date()): boolean {
  if (workouts.length === 0) return false;
  const y = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 12, 0, 0, 0);
  const yKey = localDayKeyFromDate(y);
  if (workouts.some((w) => localDayKeyFromIso(w.created_at) === yKey)) return false;
  const yStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0).getTime();
  if (!workouts.some((w) => new Date(w.created_at).getTime() < yStart)) return false;
  const recentCut = now.getTime() - 45 * 86400000;
  return workouts.some((w) => {
    const t = new Date(w.created_at).getTime();
    return t >= recentCut && t < yStart;
  });
}

/** 오늘 아직 미기록이고, 어제 놓친 뒤의 ‘복귀일’인지 */
export function isRecoveryEaseRoutineDay(workouts: WorkoutRow[], now = new Date()): boolean {
  if (hasWorkoutToday(workouts, now)) return false;
  return yesterdayMissedWithPriorHistory(workouts, now);
}
