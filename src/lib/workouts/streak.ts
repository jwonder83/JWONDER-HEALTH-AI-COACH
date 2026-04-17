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
