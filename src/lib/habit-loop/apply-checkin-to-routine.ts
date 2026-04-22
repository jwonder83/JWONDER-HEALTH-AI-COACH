import type { DailyCheckinRecord } from "@/lib/habit-loop/daily-checkin";
import type { TodayRoutinePlan } from "@/lib/routine/today-routine-plan";

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/**
 * 체크인 시간 예산에 맞춰 예상 시간대를 스케일하고, 컨디션에 맞는 코멘트를 덧붙입니다.
 */
export function applyDailyCheckinToRoutinePlan(plan: TodayRoutinePlan, checkin: DailyCheckinRecord | null): TodayRoutinePlan {
  if (!checkin) return plan;

  const target = checkin.timeMinutes;
  const mid = (plan.estimatedMinutesMin + plan.estimatedMinutesMax) / 2;
  const factor = clamp(target / Math.max(mid, 14), 0.52, 1.22);

  let minM = Math.round(plan.estimatedMinutesMin * factor);
  let maxM = Math.round(plan.estimatedMinutesMax * factor);
  minM = clamp(minM, 12, target + 8);
  maxM = clamp(maxM, minM + 6, target + 22);

  let description = plan.description;
  if (checkin.condition === "bad") {
    description += `\n\n(체크인) 컨디션 낮음 — RPE·중량을 한 단계 낮추고 ${target}분 안에 끝내는 편이 좋아요.`;
  } else if (checkin.condition === "good") {
    description += `\n\n(체크인) 컨디션 좋음 — 오늘은 약 ${target}분 예산으로 리듬을 탈 수 있어요.`;
  } else {
    description += `\n\n(체크인) 컨디션 보통 — 약 ${target}분 안에서 메인 세트 위주로 구성해 두었어요.`;
  }

  const recommendationReason = `${plan.recommendationReason} · 체크인: 가능 시간 ${target}분 반영.`.trim();

  return {
    ...plan,
    estimatedMinutesMin: minM,
    estimatedMinutesMax: maxM,
    description,
    recommendationReason,
  };
}
