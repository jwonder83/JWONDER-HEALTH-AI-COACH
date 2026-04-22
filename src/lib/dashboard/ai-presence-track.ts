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
    headline = "아직 줄이 없어요";
  } else if (miss >= 2) {
    headline = `${miss}일째 쉼`;
  } else if (miss === 1 && !todayWorkoutComplete) {
    headline = "오늘은 아직 안 썼어요";
  } else if (streakMerged >= 2) {
    headline = `${streakMerged}일째 이어가는 중`;
  } else if (streakMerged === 1 && todayWorkoutComplete) {
    headline = "하루 채움 — 내일도 하면 이틀째";
  } else {
    headline = "오늘 한 줄로 시작";
  }

  const weeklyLine =
    target !== null && target > 0 ? `이번 주 ${Math.min(cur, target)}/${target}` : null;
  const weeklyRemainLine =
    target !== null && target > 0
      ? cur >= target
        ? "이번 주 목표 채움"
        : `아직 ${target - cur}번 남음`
      : null;

  let tone: AiPresenceTone = "neutral";
  let coachLine = "오늘은 체크인만 해도 반이에요. 플랜대로 가면 돼요.";

  const behindWeekly =
    target !== null &&
    target > 0 &&
    !todayWorkoutComplete &&
    cur < Math.max(1, Math.ceil((target * (((now.getDay() + 6) % 7) + 1)) / 7) - 1);

  if (workouts.length === 0) {
    coachLine = "첫 줄만 적어 보면 여기서 쭉 이어져요.";
  } else if (miss >= 2 || userWorkoutUiState === "missed") {
    tone = "warning";
    coachLine = "너무 오래 비우면 다시 시작이 힘들어져요. 짧게라도 한 줄 남겨 볼까요.";
  } else if (behindWeekly) {
    tone = "warning";
    coachLine = "이번 주는 조금 뒤처졌어요. 오늘 하나만 넣어도 괜찮아져요.";
  } else if (todayWorkoutComplete && streakMerged >= 3) {
    tone = "success";
    coachLine = "요즘 잘 이어가고 있어요. 내일도 비슷하게만 가도 돼요.";
  } else if (todayWorkoutComplete) {
    tone = "success";
    coachLine = "오늘 줄은 올라갔어요. 물 한잔이랑 스트레칭만 해도 좋아요.";
  } else if (streakMerged >= 2) {
    tone = "success";
    coachLine = "연속으로 잘 오고 있어요. 오늘도 한 줄만 채우면 그대로 가요.";
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
