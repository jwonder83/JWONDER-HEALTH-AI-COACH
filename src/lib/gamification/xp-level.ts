import type { WorkoutInput } from "@/types/workout";

/** 한 세트 저장 시 기본 XP (상한·하한 적용 전) */
export function computeWorkoutXp(input: WorkoutInput, isPr: boolean): number {
  const sets = Math.max(1, Math.round(Number(input.sets)));
  const reps = Math.max(1, Math.round(Number(input.reps)));
  let xp = 14;
  xp += Math.round(sets * 5 + reps * 0.35);
  xp += input.success ? 12 : 5;
  if (isPr) xp += 42;
  return Math.max(10, Math.min(200, xp));
}

/** 레벨 L에서 L+1로 가기 위해 필요한 XP */
export function xpToAdvanceFromLevel(level: number): number {
  const L = Math.max(1, Math.floor(level));
  return Math.round(72 + L * 36 + L * L * 0.12);
}

export type LevelProgress = {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progressPct: number;
};

/** 총 XP → 현재 레벨·다음 레벨까지 진행률 */
export function computeLevelProgress(totalXp: number): LevelProgress {
  const safe = Math.max(0, Math.floor(totalXp));
  let level = 1;
  let pool = safe;
  for (let guard = 0; guard < 500; guard++) {
    const need = xpToAdvanceFromLevel(level);
    if (pool < need) {
      return {
        level,
        xpIntoLevel: pool,
        xpForNextLevel: need,
        progressPct: need <= 0 ? 0 : Math.min(100, Math.round((pool / need) * 1000) / 10),
      };
    }
    pool -= need;
    level += 1;
  }
  return { level: 500, xpIntoLevel: 0, xpForNextLevel: 1_000_000, progressPct: 100 };
}
