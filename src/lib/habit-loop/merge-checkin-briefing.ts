import type { DailyCheckinRecord } from "@/lib/habit-loop/daily-checkin";
import type { BriefingDecisionKind, DailyStatusBriefing, FatigueLevel } from "@/lib/dashboard/daily-status-briefing";
import { loadPlanIntensityBias } from "@/lib/plan-feedback/closing-report-plan-feedback";

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function mapScoreToLevel(score: number): FatigueLevel {
  if (score < 38) return "low";
  if (score < 62) return "medium";
  return "high";
}

function intensityForLevel(level: FatigueLevel): number {
  if (level === "high") return 70;
  if (level === "medium") return 85;
  return 100;
}

/**
 * 체크인 컨디션을 피로 점수·권장 강도에 합성합니다(데이터 기반 브리핑을 덮어쓰지 않고 보정).
 */
export function mergeDailyCheckinIntoBriefing(base: DailyStatusBriefing, checkin: DailyCheckinRecord): DailyStatusBriefing {
  if (base.decisionKind === "rest") {
    return {
      ...base,
      statusSummary: `오늘 체크인: 컨디션 ${checkin.condition === "good" ? "좋음" : checkin.condition === "normal" ? "보통" : "나쁨"} · ${base.statusSummary}`,
      interpretationLine: `${base.interpretationLine} (체크인) 오늘은 회복 우선이 데이터상 더 안전해 보여요.`,
    };
  }

  let score = base.fatigueScore;
  if (checkin.condition === "bad") score = clamp(score + 14, 8, 96);
  else if (checkin.condition === "good") score = clamp(score - 12, 8, 96);
  else score = clamp(score + 2, 8, 96);

  const fatigue = mapScoreToLevel(score);
  let recommendedIntensityPercent = intensityForLevel(fatigue);

  if (checkin.condition === "bad") recommendedIntensityPercent = Math.max(55, recommendedIntensityPercent - 12);
  if (checkin.condition === "good") recommendedIntensityPercent = Math.min(100, recommendedIntensityPercent + 5);

  recommendedIntensityPercent = clamp(recommendedIntensityPercent, 0, 100);
  if (recommendedIntensityPercent > 0) {
    const bias = loadPlanIntensityBias();
    recommendedIntensityPercent = clamp(Math.round(recommendedIntensityPercent + bias), 5, 100);
  }

  const decisionKind: BriefingDecisionKind =
    recommendedIntensityPercent <= 0 ? "rest" : fatigue === "high" ? "intensity_cap" : "standard";

  const condWord = checkin.condition === "good" ? "좋음" : checkin.condition === "normal" ? "보통" : "나쁨";
  const statusSummary = `오늘 체크인 컨디션: ${condWord} · ${base.statusSummary}`;

  const aiMessage =
    decisionKind === "rest"
      ? "오늘은 그냥 쉬어도 돼요."
      : fatigue === "high"
        ? `오늘은 평소보다 ${recommendedIntensityPercent}%만 써도 돼요.`
        : fatigue === "medium"
          ? `오늘은 평소의 ${recommendedIntensityPercent}%쯤으로 맞춰 보세요.`
          : `오늘은 평소의 ${recommendedIntensityPercent}% 정도로 가 볼까요.`;

  const interpretationLine =
    checkin.condition === "bad"
      ? `${base.interpretationLine} 체크인에서 컨디션 나쁨이라 세기를 조금 더 깎았어요.`
      : checkin.condition === "good"
        ? `${base.interpretationLine} 체크인에서 컨디션 좋다고 해서 세기 여유를 조금 열어 뒀어요.`
        : `${base.interpretationLine} 체크인은 보통으로 넣었어요.`;

  return {
    ...base,
    fatigue,
    fatigueScore: Math.round(score),
    recommendedIntensityPercent,
    decisionKind,
    statusSummary,
    aiMessage,
    interpretationLine,
    reasonLine: `${base.reasonLine} · 오늘 체크인: ${condWord}, 가능 시간 약 ${checkin.timeMinutes}분.`,
  };
}
