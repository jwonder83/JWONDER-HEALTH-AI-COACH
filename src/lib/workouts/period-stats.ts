import type { WorkoutRow } from "@/types/workout";

export function volumeForRow(w: WorkoutRow): number {
  return Number(w.weight_kg) * w.reps * w.sets;
}

/** 이번 주 월요일 00:00 (로컬) */
export function startOfWeekMonday(d = new Date()): Date {
  const x = new Date(d);
  const wd = x.getDay();
  const mondayOffset = wd === 0 ? -6 : 1 - wd;
  x.setDate(x.getDate() + mondayOffset);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfWeekSunday(monday: Date): Date {
  const x = new Date(monday);
  x.setDate(x.getDate() + 6);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function startOfMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

export function endOfMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function rollupPeriod(
  rows: WorkoutRow[],
  start: Date,
  end: Date,
): { volume: number; topExercise: string | null; rowCount: number } {
  const s = start.getTime();
  const e = end.getTime();
  const inRange = rows.filter((r) => {
    const t = new Date(r.created_at).getTime();
    return t >= s && t <= e;
  });
  let volume = 0;
  const counts = new Map<string, number>();
  for (const w of inRange) {
    volume += volumeForRow(w);
    const name = w.exercise_name.trim() || "기타";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  let topExercise: string | null = null;
  let max = 0;
  for (const [k, v] of counts) {
    if (v > max) {
      max = v;
      topExercise = k;
    }
  }
  return { volume, topExercise: max > 0 ? topExercise : null, rowCount: inRange.length };
}
