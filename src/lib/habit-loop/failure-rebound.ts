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

  const headlineLine = "어제는 비었네요.";
  const actionLine = "→ 오늘은 가볍게 짜 뒀어요.";
  const detailLine = `시간은 대충 ${timeReductionPercent}% 줄였고, 세기는 ${intensityReductionPercent}% 정도 낮춰 뒀어요. 오늘 한 줄만 넣어도 이어져요.`;

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
      ? `오늘은 평소보다 ${recommendedIntensityPercent}%만 써도 돼요.`
      : `오늘은 평소의 ${recommendedIntensityPercent}%쯤으로 맞춰 보세요.`;

  return {
    ...briefing,
    recommendedIntensityPercent,
    decisionKind,
    statusSummary: `${model.headlineLine} ${model.actionLine} ${briefing.statusSummary}`.trim(),
    interpretationLine: `${model.detailLine} ${briefing.interpretationLine}`,
    aiMessage,
    reasonLine: `${briefing.reasonLine} · 어제 비운 날 ${model.consecutiveMissedDays}일 반영해서 살짝 낮췄어요.`,
  };
}

/** 루틴 엔진용: 복귀일 시간 스케일만 (강도는 브리핑에서 안내). */
export function getRecoveryEaseTimeMultiplier(workouts: WorkoutRow[], now = new Date()): number {
  if (!isRecoveryEaseRoutineDay(workouts, now)) return 1;
  const n = countConsecutiveMissedCalendarDaysBeforeToday(workouts, now);
  return getFailureReboundTimeMultiplier(Math.max(1, n));
}
