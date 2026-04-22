/**
 * 데일리 체크인 — 하루 1회, 습관 루프의 강제 시작점(웹·WebView 공통).
 * DB `user_profile` 대신 로컬 스냅샷과 동기: `recomputeUserMemoryProfile`의 `fatigue_level`에 반영합니다.
 */

export type DailyCheckinCondition = "good" | "normal" | "bad";

/** 사용자가 선택한 오늘 가능 시간(분) */
export type DailyCheckinTimeBudget = 20 | 40 | 60;

export type DailyCheckinRecord = {
  /** 로컬 캘린더 yyyy-mm-dd */
  dayKey: string;
  condition: DailyCheckinCondition;
  timeMinutes: DailyCheckinTimeBudget;
  submittedAt: string;
};

const LS_PREFIX = "jws_daily_checkin_v1";

export const DAILY_CHECKIN_CHANGED_EVENT = "jws-daily-checkin-changed";

export function localDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function storageKey(userId: string, dayKey: string): string {
  return `${LS_PREFIX}:${userId}:${dayKey}`;
}

export function loadDailyCheckin(userId: string, now = new Date()): DailyCheckinRecord | null {
  if (typeof window === "undefined" || !userId) return null;
  const key = storageKey(userId, localDayKey(now));
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<DailyCheckinRecord>;
    if (!p || typeof p !== "object") return null;
    if (p.dayKey !== localDayKey(now)) return null;
    if (p.condition !== "good" && p.condition !== "normal" && p.condition !== "bad") return null;
    if (p.timeMinutes !== 20 && p.timeMinutes !== 40 && p.timeMinutes !== 60) return null;
    return {
      dayKey: p.dayKey,
      condition: p.condition,
      timeMinutes: p.timeMinutes,
      submittedAt: typeof p.submittedAt === "string" ? p.submittedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function saveDailyCheckin(userId: string, payload: Omit<DailyCheckinRecord, "dayKey" | "submittedAt"> & { now?: Date }): DailyCheckinRecord {
  const now = payload.now ?? new Date();
  const dayKey = localDayKey(now);
  const rec: DailyCheckinRecord = {
    dayKey,
    condition: payload.condition,
    timeMinutes: payload.timeMinutes,
    submittedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey(userId, dayKey), JSON.stringify(rec));
    window.dispatchEvent(new CustomEvent(DAILY_CHECKIN_CHANGED_EVENT, { detail: { userId } }));
  }
  return rec;
}

/** `UserMemoryProfile.fatigue_level` 블렌딩용 0–100 스칼라 */
export function conditionToFatigueSignal(condition: DailyCheckinCondition): number {
  if (condition === "good") return 22;
  if (condition === "normal") return 42;
  return 72;
}

export function conditionLabelKo(condition: DailyCheckinCondition): string {
  if (condition === "good") return "좋음";
  if (condition === "normal") return "보통";
  return "나쁨";
}
