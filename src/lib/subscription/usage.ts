import { startOfWeekMonday } from "@/lib/workouts/period-stats";

type UsageBucket = {
  aiByDay: Record<string, number>;
  routineByWeek: Record<string, number>;
};

function usageKey(userId: string): string {
  return `jws-usage-v1:${userId}`;
}

function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function weekKey(d = new Date()): string {
  const mon = startOfWeekMonday(d);
  return mon.toISOString().slice(0, 10);
}

function loadUsage(userId: string): UsageBucket {
  if (typeof window === "undefined") return { aiByDay: {}, routineByWeek: {} };
  try {
    const raw = window.localStorage.getItem(usageKey(userId));
    if (!raw) return { aiByDay: {}, routineByWeek: {} };
    const o = JSON.parse(raw) as Partial<UsageBucket>;
    return {
      aiByDay: o.aiByDay && typeof o.aiByDay === "object" ? o.aiByDay : {},
      routineByWeek: o.routineByWeek && typeof o.routineByWeek === "object" ? o.routineByWeek : {},
    };
  } catch {
    return { aiByDay: {}, routineByWeek: {} };
  }
}

function saveUsage(userId: string, u: UsageBucket): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(usageKey(userId), JSON.stringify(u));
  } catch {
    /* ignore */
  }
}

const FREE_AI_PER_DAY = 1;
const FREE_ROUTINE_PER_WEEK = 2;

/** 무료: 하루 1회 AI 코칭 가능 여부(아직 호출 전이면 true) */
export function canUseFreeAiCoaching(userId: string, now = new Date()): boolean {
  const u = loadUsage(userId);
  const k = todayKey(now);
  return (u.aiByDay[k] ?? 0) < FREE_AI_PER_DAY;
}

export function recordAiCoachingUse(userId: string, now = new Date()): void {
  const u = loadUsage(userId);
  const k = todayKey(now);
  u.aiByDay[k] = (u.aiByDay[k] ?? 0) + 1;
  saveUsage(userId, u);
}

/** 무료: 주 2회 루틴 생성(주간 마크다운 등) */
export function canUseFreeRoutineGeneration(userId: string, now = new Date()): boolean {
  const u = loadUsage(userId);
  const k = weekKey(now);
  return (u.routineByWeek[k] ?? 0) < FREE_ROUTINE_PER_WEEK;
}

export function recordRoutineGeneration(userId: string, now = new Date()): void {
  const u = loadUsage(userId);
  const k = weekKey(now);
  u.routineByWeek[k] = (u.routineByWeek[k] ?? 0) + 1;
  saveUsage(userId, u);
}
