export const COACH_MODE_LS_KEY = "jws-coach-mode-enabled";

export function loadCoachModeEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const v = localStorage.getItem(COACH_MODE_LS_KEY);
    if (v === null) return true;
    return v === "1" || v === "true";
  } catch {
    return true;
  }
}

export function persistCoachModeEnabled(on: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COACH_MODE_LS_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
}
