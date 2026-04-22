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
    return "오늘 세션은 완료 상태입니다 (확정)";
  }
  if (args.decisionKind === "rest") {
    return "오늘은 회복·가벼운 활동을 우선하세요 (확정)";
  }
  const t = args.routineTitle.trim();
  return `오늘은 「${t}」 루틴을 진행하세요 (확정)`;
}

export function buildCoachTrustPrimaryReason(workouts: WorkoutRow[], now: Date, briefing: DailyStatusBriefing): string {
  const weak = detectWeakMuscleGap(workouts, now);
  if (weak) {
    return `최근 ${weak.label} 볼륨 비중 부족(약 ${weak.sharePct}%)`;
  }
  if (briefing.metrics.daysSinceLastWorkout !== null && briefing.metrics.daysSinceLastWorkout >= 2) {
    return `마지막 기록 후 ${briefing.metrics.daysSinceLastWorkout}일 경과`;
  }
  if (briefing.metrics.consecutiveHighLoadDays >= 2) {
    return `연속 고부하 ${briefing.metrics.consecutiveHighLoadDays}일`;
  }
  if (briefing.decisionKind === "intensity_cap") {
    return "피로도 기준으로 강도 상한 적용";
  }
  if (briefing.decisionKind === "rest") {
    return "부하·휴식 밸런스상 휴식 권장";
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
