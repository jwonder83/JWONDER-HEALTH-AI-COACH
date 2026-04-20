import { rowVolume } from "@/lib/dashboard/insights";
import { inferPrimaryMuscleGroup, muscleGroupLabel, type MuscleGroupId } from "@/lib/workouts/exercise-muscle-group";
import type { WorkoutRow } from "@/types/workout";

export type WorkoutRowInsight = {
  volume: number;
  /** 해당 시점 이전 동일 종목 기록 대비 볼륨 PR */
  isVolumePr: boolean;
  muscleGroup: MuscleGroupId;
  muscleLabel: string;
  /** 시간상 바로 이전의 같은 종목 기록(없으면 null) */
  previousSameExercise: WorkoutRow | null;
  /** 직전 대비 볼륨 변화율(%) — 직전 기록 없으면 null */
  volumeDeltaPct: number | null;
  /** 직전 대비 중량 변화율(%) */
  weightDeltaPct: number | null;
};

function normExercise(name: string): string {
  return name.trim().toLowerCase();
}

function roundPct(x: number): number {
  return Math.round(x * 10) / 10;
}

/**
 * 각 기록 행에 대해 PR 여부·직전 동일 종목 대비 변화율을 계산합니다.
 * 시간 오름차순으로 스캔해 “그때 그때” 기준 PR을 복원합니다.
 */
export function computeWorkoutRowInsights(workouts: WorkoutRow[]): Map<string, WorkoutRowInsight> {
  const asc = [...workouts].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const maxVolBefore = new Map<string, number>();
  const lastSame = new Map<string, WorkoutRow>();
  const out = new Map<string, WorkoutRowInsight>();

  for (const w of asc) {
    const k = normExercise(w.exercise_name);
    const prev = k ? lastSame.get(k) ?? null : null;
    const v = rowVolume(w);
    const prevMax = k ? maxVolBefore.get(k) ?? 0 : 0;
    const isVolumePr = k.length > 0 && v > prevMax;

    let volumeDeltaPct: number | null = null;
    let weightDeltaPct: number | null = null;
    if (prev) {
      const pv = rowVolume(prev);
      if (pv > 0) volumeDeltaPct = roundPct(((v - pv) / pv) * 100);
      const pw = Number(prev.weight_kg);
      const cw = Number(w.weight_kg);
      if (pw > 0) weightDeltaPct = roundPct(((cw - pw) / pw) * 100);
    }

    const muscleGroup = inferPrimaryMuscleGroup(w.exercise_name);
    out.set(w.id, {
      volume: Math.round(v * 10) / 10,
      isVolumePr,
      muscleGroup,
      muscleLabel: muscleGroupLabel(muscleGroup),
      previousSameExercise: prev,
      volumeDeltaPct,
      weightDeltaPct,
    });

    if (k) {
      maxVolBefore.set(k, Math.max(prevMax, v));
      lastSame.set(k, w);
    }
  }

  return out;
}

export function countVolumePrs(workouts: WorkoutRow[], insights: Map<string, WorkoutRowInsight>): number {
  let n = 0;
  for (const w of workouts) {
    if (insights.get(w.id)?.isVolumePr) n++;
  }
  return n;
}

export function totalVolume(workouts: WorkoutRow[]): number {
  let s = 0;
  for (const w of workouts) s += rowVolume(w);
  return Math.round(s * 10) / 10;
}
