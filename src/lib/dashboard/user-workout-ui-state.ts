/**
 * 홈·헤더 등에서 쓰는 “오늘 운동과 앱의 관계” UI 상태.
 * 운동 세션 화면의 phase(idle/active/done)와 이름이 겹치므로 여기서는 `completed`/`missed`로 구분합니다.
 */
export type UserWorkoutUiState = "idle" | "active" | "completed" | "missed";

/** 로컬 시각 기준, 이 시각 이후이면 오늘 미이행으로 간주 */
export const MISSED_DAY_HOUR_LOCAL = 22;

export type ResolveUserWorkoutUiStateInput = {
  /** 오늘 날짜에 세트 기록이 하나라도 있는지 */
  todayWorkoutComplete: boolean;
  /** 운동 세션 화면에서 세트 진행 중(탭 단위 sessionStorage) */
  workoutSessionActive: boolean;
  now: Date;
  /** 기본 22 — 더 빠르게 missed를 쓰고 싶으면 낮춤 */
  missedHourThreshold?: number;
};

export function resolveUserWorkoutUiState(input: ResolveUserWorkoutUiStateInput): UserWorkoutUiState {
  if (input.todayWorkoutComplete) return "completed";
  if (input.workoutSessionActive) return "active";
  const th = input.missedHourThreshold ?? MISSED_DAY_HOUR_LOCAL;
  if (input.now.getHours() >= th) return "missed";
  return "idle";
}
