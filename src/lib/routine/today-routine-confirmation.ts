import type { TodayRoutinePlan } from "@/lib/routine/today-routine-plan";

/** 오늘 루틴 UX 플로우 */
export type RoutineFlowStatus = "suggested" | "confirmed" | "completed";

export const ROUTINE_CONFIRMATION_LS_KEY = "jws_today_routine_flow_v1";

export type PersistedRoutineFlow = {
  dateKey: string;
  routineKey: string;
  status: RoutineFlowStatus;
};

export function dateKeyFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function routineKeyFromPlan(plan: TodayRoutinePlan): string {
  return `${plan.title}|${plan.estimatedMinutesMin}|${plan.estimatedMinutesMax}`;
}

export function readPersistedRoutineFlow(): PersistedRoutineFlow | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ROUTINE_CONFIRMATION_LS_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<PersistedRoutineFlow>;
    if (typeof p.dateKey !== "string" || typeof p.routineKey !== "string") return null;
    if (p.status !== "suggested" && p.status !== "confirmed" && p.status !== "completed") return null;
    return { dateKey: p.dateKey, routineKey: p.routineKey, status: p.status };
  } catch {
    return null;
  }
}

export function writePersistedRoutineFlow(next: PersistedRoutineFlow): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ROUTINE_CONFIRMATION_LS_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
}

/**
 * 날짜·루틴 지문이 바뀌면 suggested.
 * 오늘 기록이 있으면 completed.
 * 기록이 없는데 LS만 completed인 경우(데이터 삭제 등) suggested로 복구.
 */
export function resolveInitialRoutineStatus(
  persisted: PersistedRoutineFlow | null,
  dateKey: string,
  routineKey: string,
  todayWorkoutComplete: boolean,
): RoutineFlowStatus {
  if (todayWorkoutComplete) return "completed";
  if (!persisted || persisted.dateKey !== dateKey || persisted.routineKey !== routineKey) return "suggested";
  if (persisted.status === "completed") return "suggested";
  return persisted.status;
}
