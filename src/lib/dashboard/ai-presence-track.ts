import type { UserWorkoutUiState } from "@/lib/dashboard/user-workout-ui-state";
import type { WorkoutRow } from "@/types/workout";

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function localDayKeyFromIso(iso: string): string {
  try {
    const d = new Date(iso);
    return dayKey(d);
  } catch {
    return "";
  }
}

function hasWorkoutOnDay(workouts: WorkoutRow[], d: Date): boolean {
  const k = dayKey(d);
  return workouts.some((w) => localDayKeyFromIso(w.created_at) === k);
}

/**
 * 오늘부터 과거로 거슬러 올라가며, 연속된 “운동 없는” 캘린더 일 수.
 * 오늘 세트가 있으면 0.
 */
export function countConsecutiveMissDays(workouts: WorkoutRow[], now = new Date()): number {
  if (workouts.length === 0) return 0;
  let count = 0;
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
  for (let i = 0; i < 45; i++) {
    if (hasWorkoutOnDay(workouts, d)) break;
    count++;
    d.setDate(d.getDate() - 1);
  }
  return Math.min(count, 30);
}

export type AiPresenceTone = "success" | "warning" | "neutral";

export type AiPresenceModel = {
  tone: AiPresenceTone;
  /** 메인 상태 한 줄 (연속 / 미운동) */
  headline: string;
  /** 주간 요약 — 목표 없으면 null */
  weeklyLine: string | null;
  /** 목표까지 남은 횟수 — 없으면 null */
  weeklyRemainLine: string | null;
  /** AI 코치 한 줄 */
  coachLine: string;
  streakDays: number;
  missDays: number;
};

export function buildAiPresenceModel(args: {
  workouts: WorkoutRow[];
  hydrated: boolean;
  now: Date;
  weeklySessionTarget: number | null;
  weeklySessionCurrent: number;
  streakMerged: number;
  userWorkoutUiState: UserWorkoutUiState;
  todayWorkoutComplete: boolean;
}): AiPresenceModel | null {
  if (!args.hydrated) return null;

  const { workouts, now, weeklySessionTarget: target, weeklySessionCurrent: cur, streakMerged, userWorkoutUiState, todayWorkoutComplete } = args;

  const miss = countConsecutiveMissDays(workouts, now);

  let headline: string;
  if (workouts.length === 0) {
    headline = "아직 추적할 기록이 없어요";
  } else if (miss >= 2) {
    headline = `${miss}일 미운동`;
  } else if (miss === 1 && !todayWorkoutComplete) {
    headline = "오늘 아직 미운동";
  } else if (streakMerged >= 2) {
    headline = `${streakMerged}일 연속 운동 중`;
  } else if (streakMerged === 1 && todayWorkoutComplete) {
    headline = "연속 1일 — 내일 이어가면 2일차";
  } else {
    headline = "오늘 한 세트로 리듬 시작";
  }

  const weeklyLine =
    target !== null && target > 0 ? `이번 주 ${Math.min(cur, target)}/${target} 완료` : null;
  const weeklyRemainLine =
    target !== null && target > 0
      ? cur >= target
        ? "주간 목표 달성"
        : `목표까지 ${target - cur}회 남음`
      : null;

  let tone: AiPresenceTone = "neutral";
  let coachLine = "오늘 상태를 보고 있어요. 체크인 후 플랜만 따라가도 돼요.";

  const behindWeekly =
    target !== null &&
    target > 0 &&
    !todayWorkoutComplete &&
    cur < Math.max(1, Math.ceil((target * (((now.getDay() + 6) % 7) + 1)) / 7) - 1);

  if (workouts.length === 0) {
    coachLine = "첫 세트를 남기면 AI가 연속·주간 리듬을 자동으로 추적해요.";
  } else if (miss >= 2 || userWorkoutUiState === "missed") {
    tone = "warning";
    coachLine = "공백이 길어지면 회복 비용이 커져요. 지금 짧게라도 세트를 남겨 주세요.";
  } else if (behindWeekly) {
    tone = "warning";
    coachLine = "이번 주 페이스가 뒤처져 있어요. 오늘 한 건만으로도 궤도를 되찾을 수 있어요.";
  } else if (todayWorkoutComplete && streakMerged >= 3) {
    tone = "success";
    coachLine = "연속 리듬이 안정적이에요. 내일도 같은 밀도만 유지해도 충분해요.";
  } else if (todayWorkoutComplete) {
    tone = "success";
    coachLine = "오늘 목표에 반영됐어요. 수분·스트레칭으로 마무리하면 더 좋아요.";
  } else if (streakMerged >= 2) {
    tone = "success";
    coachLine = "연속 기록이 이어지고 있어요. 오늘도 한 세트만 지키면 손해 없이 갑니다.";
  }

  return {
    tone,
    headline,
    weeklyLine,
    weeklyRemainLine,
    coachLine,
    streakDays: streakMerged,
    missDays: miss,
  };
}
