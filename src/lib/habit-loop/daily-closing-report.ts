import { localDayKey } from "@/lib/habit-loop/daily-checkin";

const LS_PREFIX = "jws_daily_close_report_v1";

export type DailyCloseReportKind = "completed" | "missed_evening";

function key(userId: string, dayKey: string, kind: DailyCloseReportKind): string {
  return `${LS_PREFIX}:${userId}:${dayKey}:${kind}`;
}

export function wasDailyCloseReportShown(userId: string, kind: DailyCloseReportKind, now = new Date()): boolean {
  if (typeof window === "undefined" || !userId) return false;
  return window.localStorage.getItem(key(userId, localDayKey(now), kind)) === "1";
}

export function markDailyCloseReportShown(userId: string, kind: DailyCloseReportKind, now = new Date()): void {
  if (typeof window === "undefined" || !userId) return;
  window.localStorage.setItem(key(userId, localDayKey(now), kind), "1");
}

export const DAILY_CLOSE_REPORT_CHANGED_EVENT = "jws-daily-close-report-changed";
