import type { DailyStatusBriefing } from "@/lib/dashboard/daily-status-briefing";
import { detectWeakMuscleGap } from "@/lib/routine/adaptive-routine-engine";
import type { WorkoutRow } from "@/types/workout";

export type CoachTrustFields = {
  /** 0이면 UI에서 숨김(비로딩 등) */
  coachTrustConfidencePercent: number;
  /** 루틴 중심 확정 문장 */
  coachDecisionConfirmedLine: string;
  /** 한 줄 근거(사용자 예시: 최근 하체 부족 등) */
  coachTrustPrimaryReason: string;
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/**
 * 규칙 기반 추천 신뢰도(58–94%). 기록 양·최근 패턴·체크인 유무로 가중.
 */
export function computeCoachTrustConfidencePercent(args: {
  workouts: WorkoutRow[];
  briefing: DailyStatusBriefing;
  hasDailyCheckin: boolean;
}): number {
  const { workouts, briefing, hasDailyCheckin } = args;
  let c = 64;
  const n = workouts.length;
  const rows7 = briefing.metrics.sessionRowsLast7;

  if (n >= 60) c += 10;
  else if (n >= 25) c += 8;
  else if (n >= 10) c += 5;
  else if (n < 5) c -= 10;

  if (rows7 >= 24) c += 8;
  else if (rows7 >= 12) c += 5;
  else if (rows7 <= 3) c -= 8;

  if (hasDailyCheckin) c += 5;
  if (briefing.decisionKind === "rest") c -= 5;
  if (briefing.metrics.volumeDeltaPercent !== null) c += 3;
  if (briefing.metrics.consecutiveHighLoadDays >= 2) c += 2;

  return Math.round(clamp(c, 58, 94));
}

export function buildCoachDecisionConfirmedLine(args: {
  todayDone: boolean;
  routineTitle: string;
  decisionKind: DailyStatusBriefing["decisionKind"];
}): string {
  if (args.todayDone) {
    return "오늘 줄은 다 채웠어요.";
  }
  if (args.decisionKind === "rest") {
    return "오늘은 쉬거나 가볍게만 가도 돼요.";
  }
  const t = args.routineTitle.trim();
  return `오늘은 「${t}」 위주로 가면 돼요.`;
}

export function buildCoachTrustPrimaryReason(workouts: WorkoutRow[], now: Date, briefing: DailyStatusBriefing): string {
  const weak = detectWeakMuscleGap(workouts, now);
  if (weak) {
    return `${weak.label} 쪽이 ${weak.sharePct}%밖에 안 돼요`;
  }
  if (briefing.metrics.daysSinceLastWorkout !== null && briefing.metrics.daysSinceLastWorkout >= 2) {
    return `마지막 줄 이후 ${briefing.metrics.daysSinceLastWorkout}일`;
  }
  if (briefing.metrics.consecutiveHighLoadDays >= 2) {
    return `부담 큰 날이 ${briefing.metrics.consecutiveHighLoadDays}일 연속`;
  }
  if (briefing.decisionKind === "intensity_cap") {
    return "피로 보고 세기만 깎았어요";
  }
  if (briefing.decisionKind === "rest") {
    return "쉬는 쪽이 맞아 보여요";
  }
  const line = briefing.reasonLine.trim();
  return line.length > 72 ? `${line.slice(0, 69)}…` : line;
}

export function buildCoachTrustFields(args: {
  hydrated: boolean;
  todayDone: boolean;
  routineTitle: string;
  briefing: DailyStatusBriefing | null;
  hasDailyCheckin: boolean;
  workouts: WorkoutRow[];
  now: Date;
}): CoachTrustFields {
  if (!args.hydrated || !args.briefing) {
    return { coachTrustConfidencePercent: 0, coachDecisionConfirmedLine: "", coachTrustPrimaryReason: "" };
  }
  const { briefing, workouts, now, todayDone, routineTitle, hasDailyCheckin } = args;
  return {
    coachTrustConfidencePercent: computeCoachTrustConfidencePercent({ workouts, briefing, hasDailyCheckin }),
    coachDecisionConfirmedLine: buildCoachDecisionConfirmedLine({
      todayDone,
      routineTitle,
      decisionKind: briefing.decisionKind,
    }),
    coachTrustPrimaryReason: buildCoachTrustPrimaryReason(workouts, now, briefing),
  };
}
