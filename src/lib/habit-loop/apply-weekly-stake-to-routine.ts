import type { WeeklyStakeModel } from "@/lib/dashboard/weekly-stake";
import type { TodayRoutinePlan } from "@/lib/routine/today-routine-plan";

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/**
 * 주간 목표가 밀린 날 — 다음 루틴(오늘 플랜) 예상 시간을 소폭 낮춰 부담을 분산합니다.
 */
export function applyWeeklyStakeToRoutine(plan: TodayRoutinePlan, stake: WeeklyStakeModel | null): TodayRoutinePlan {
  if (!stake || stake.routineTimeFactor >= 0.999) return plan;

  const f = stake.routineTimeFactor;
  let minM = Math.round(plan.estimatedMinutesMin * f);
  let maxM = Math.round(plan.estimatedMinutesMax * f);
  minM = clamp(minM, 12, 120);
  maxM = clamp(maxM, minM + 6, 125);

  const trimPct = Math.round((1 - f) * 100);
  const description =
    `${plan.description}\n\n(주간 목표 밀림) 이번 주 페이스가 뒤처져 있어 오늘 플랜 예상 시간을 약 ${trimPct}% 줄였어요. 내일까지 강도·볼륨을 한 단계 낮춰 분산하는 편이 안전해요.`.trim();
  const recommendationReason = `${plan.recommendationReason} · 주간 목표 밀림 반영.`.trim();

  const liveMessages = [
    `주간 목표가 밀렸어요. 오늘은 예상 시간을 줄이고 리듬만 지키세요.`,
    ...(plan.liveMessages ?? []).slice(0, 2),
  ];

  return {
    ...plan,
    estimatedMinutesMin: minM,
    estimatedMinutesMax: maxM,
    description,
    recommendationReason,
    liveMessages,
  };
}
