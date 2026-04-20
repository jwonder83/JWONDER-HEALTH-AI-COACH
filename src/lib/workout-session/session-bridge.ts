/** 같은 탭에서 운동 진행 여부를 홈 등과 공유 */
export const WORKOUT_SESSION_STORAGE_KEY = "jws_workout_session_active";

export const WORKOUT_SESSION_CHANGE_EVENT = "jws-workout-session-change";

export function writeWorkoutSessionActive(active: boolean): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(WORKOUT_SESSION_STORAGE_KEY, active ? "1" : "0");
    window.dispatchEvent(new Event(WORKOUT_SESSION_CHANGE_EVENT));
  } catch {
    /* private mode 등 */
  }
}

export function readWorkoutSessionActive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(WORKOUT_SESSION_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}
