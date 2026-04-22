import type { BriefingDecisionKind, DailyStatusBriefing } from "@/lib/dashboard/daily-status-briefing";
import { isRecoveryEaseRoutineDay } from "@/lib/dashboard/recovery-workout-ux";
import type { WorkoutRow } from "@/types/workout";

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * 어제부터 과거로 거슬러 올라가며 연속된 "세트 없음" 캘린더 일 수(오늘 제외).
 * 복귀일 하루 운동 미완료 → 다음날 난이도 스케일의 분모로 사용.
 */
export function countConsecutiveMissedCalendarDaysBeforeToday(workouts: WorkoutRow[], now = new Date()): number {
  const keys = new Set(workouts.map((w) => localDateKey(new Date(w.created_at))));
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 12, 0, 0, 0);
  let count = 0;
  for (let i = 0; i < 14; i++) {
    if (keys.has(localDateKey(d))) break;
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}

/**
 * 예상 운동 시간 스케일 (1 = 유지). 미완료가 길수록 0.70까지(약 30% 단축).
 */
export function getFailureReboundTimeMultiplier(consecutiveMissedDays: number): number {
  const d = Math.max(1, Math.min(5, consecutiveMissedDays));
  const table = { 1: 0.86, 2: 0.8, 3: 0.76, 4: 0.72, 5: 0.7 } as const;
  return table[d as keyof typeof table] ?? 0.7;
}

/**
 * 권장 강도(% 평소)에 곱할 계수. 약 10~30% 낮춤.
 */
export function getFailureReboundIntensityMultiplier(consecutiveMissedDays: number): number {
  const d = Math.max(1, Math.min(5, consecutiveMissedDays));
  const table = { 1: 0.9, 2: 0.82, 3: 0.76, 4: 0.72, 5: 0.7 } as const;
  return table[d as keyof typeof table] ?? 0.7;
}

export type FailureReboundModel = {
  consecutiveMissedDays: number;
  timeMultiplier: number;
  intensityMultiplier: number;
  timeReductionPercent: number;
  intensityReductionPercent: number;
  headlineLine: string;
  actionLine: string;
  detailLine: string;
};

export function buildFailureReboundModel(workouts: WorkoutRow[], now = new Date()): FailureReboundModel | null {
  if (!isRecoveryEaseRoutineDay(workouts, now)) return null;

  const consecutiveMissedDays = countConsecutiveMissedCalendarDaysBeforeToday(workouts, now);
  const timeMultiplier = getFailureReboundTimeMultiplier(consecutiveMissedDays);
  const intensityMultiplier = getFailureReboundIntensityMultiplier(consecutiveMissedDays);
  const timeReductionPercent = Math.round((1 - timeMultiplier) * 100);
  const intensityReductionPercent = Math.round((1 - intensityMultiplier) * 100);

  const headlineLine = "어제 운동을 놓쳤습니다.";
  const actionLine = "→ 오늘은 가벼운 루틴으로 조정했습니다.";
  const detailLine = `예상 시간 약 ${timeReductionPercent}%·권장 강도 약 ${intensityReductionPercent}% 낮췄어요. 오늘 한 세트면 연속 흐름을 완화 규칙으로 이을 수 있어요.`;

  return {
    consecutiveMissedDays,
    timeMultiplier,
    intensityMultiplier,
    timeReductionPercent,
    intensityReductionPercent,
    headlineLine,
    actionLine,
    detailLine,
  };
}

/**
 * 하루 미완료 복귀일 브리핑에 권장 강도·메시지를 합성합니다. (체크인 merge 이후 호출 권장)
 */
export function applyFailureReboundToDailyBriefing(
  briefing: DailyStatusBriefing,
  workouts: WorkoutRow[],
  now = new Date(),
  /** `undefined`이면 내부에서 계산, `null`이면 복귀 미적용 */
  rebound?: FailureReboundModel | null,
): DailyStatusBriefing {
  const model = rebound === undefined ? buildFailureReboundModel(workouts, now) : rebound;
  if (!model) return briefing;

  if (briefing.decisionKind === "rest") {
    return {
      ...briefing,
      statusSummary: `${model.headlineLine} ${model.actionLine} ${briefing.statusSummary}`.trim(),
      interpretationLine: `${model.detailLine} ${briefing.interpretationLine}`,
    };
  }

  const rawPct = Math.round(briefing.recommendedIntensityPercent * model.intensityMultiplier);
  const recommendedIntensityPercent = Math.max(50, Math.min(100, rawPct));

  let decisionKind: BriefingDecisionKind = briefing.decisionKind;
  if (recommendedIntensityPercent < 100 && briefing.decisionKind === "standard") {
    decisionKind = "intensity_cap";
  }

  const aiMessage =
    decisionKind === "intensity_cap" || briefing.fatigue === "high"
      ? `오늘은 강도를 ${recommendedIntensityPercent}%로 낮추세요.`
      : `오늘 중량·횟수는 평소의 ${recommendedIntensityPercent}%에 맞추세요.`;

  return {
    ...briefing,
    recommendedIntensityPercent,
    decisionKind,
    statusSummary: `${model.headlineLine} ${model.actionLine} ${briefing.statusSummary}`.trim(),
    interpretationLine: `${model.detailLine} ${briefing.interpretationLine}`,
    aiMessage,
    reasonLine: `${briefing.reasonLine} · 복귀 자동 조정: 미완료 ${model.consecutiveMissedDays}일 반영.`,
  };
}

/** 루틴 엔진용: 복귀일 시간 스케일만 (강도는 브리핑에서 안내). */
export function getRecoveryEaseTimeMultiplier(workouts: WorkoutRow[], now = new Date()): number {
  if (!isRecoveryEaseRoutineDay(workouts, now)) return 1;
  const n = countConsecutiveMissedCalendarDaysBeforeToday(workouts, now);
  return getFailureReboundTimeMultiplier(Math.max(1, n));
}
