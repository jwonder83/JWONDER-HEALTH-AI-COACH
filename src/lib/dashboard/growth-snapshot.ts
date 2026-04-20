import { rowVolume } from "@/lib/dashboard/insights";
import { rollupPeriod, startOfMonth } from "@/lib/workouts/period-stats";
import type { LocalGoals } from "@/lib/dashboard/local-goals";
import type { WorkoutRow } from "@/types/workout";

function startOfPreviousMonth(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
}

function endOfPreviousMonth(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
}

/** 기간 내 첫 PR(종목별 볼륨 신기록) 횟수 — 시간순 스캔 */
export function countVolumePrsInRange(workouts: WorkoutRow[], rangeStart: Date, rangeEnd: Date): number {
  const sorted = [...workouts].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const maxByExercise = new Map<string, number>();
  let prs = 0;
  const rs = rangeStart.getTime();
  const re = rangeEnd.getTime();
  for (const w of sorted) {
    const t = new Date(w.created_at).getTime();
    const k = w.exercise_name.trim().toLowerCase();
    if (!k) continue;
    const vol = rowVolume(w);
    const prev = maxByExercise.get(k) ?? 0;
    if (vol > prev) {
      if (t >= rs && t <= re) prs++;
      maxByExercise.set(k, vol);
    }
  }
  return prs;
}

function firstWorkoutDate(workouts: WorkoutRow[]): Date | null {
  if (workouts.length === 0) return null;
  let minT = Infinity;
  for (const w of workouts) {
    const t = new Date(w.created_at).getTime();
    if (t < minT) minT = t;
  }
  return new Date(minT);
}

export type GrowthSnapshot = {
  longTermTitle: string;
  longProgressPercent: number;
  volumeMonthComparePct: number | null;
  prCountThisMonth: number;
  thisMonthVolume: number;
  thisMonthRows: number;
  summaryLines: string[];
};

/**
 * 장기 목표 진행률(기간 내 실제 세트 수 / 기대 세트 수) + 월간 볼륨·PR 요약.
 */
export function buildGrowthSnapshot(workouts: WorkoutRow[], now: Date, goals: LocalGoals): GrowthSnapshot {
  const m = goals.longTermMonths;
  const months: 1 | 3 | 6 = m === 1 ? 1 : m === 6 ? 6 : 3;
  const weekly = goals.weeklySessionTarget && goals.weeklySessionTarget > 0 ? goals.weeklySessionTarget : 3;
  const expectedRows = Math.max(8, Math.round(months * 4.33 * weekly));

  let windowStart: Date;
  if (goals.longTermStartedAt) {
    windowStart = new Date(goals.longTermStartedAt);
    windowStart.setHours(0, 0, 0, 0);
  } else {
    windowStart = firstWorkoutDate(workouts) ?? new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  }
  const windowEnd = new Date(windowStart);
  windowEnd.setMonth(windowEnd.getMonth() + months);
  const capEnd = Math.min(now.getTime(), windowEnd.getTime());

  const rowsInWindow = workouts.filter((w) => {
    const t = new Date(w.created_at).getTime();
    return t >= windowStart.getTime() && t <= capEnd;
  }).length;

  const longProgressPercent = Math.min(100, Math.round((rowsInWindow / expectedRows) * 100));

  const m0 = startOfMonth(now);
  const thisPartial = rollupPeriod(workouts, m0, now);
  const prevFull = rollupPeriod(workouts, startOfPreviousMonth(now), endOfPreviousMonth(now));

  let volumeMonthComparePct: number | null = null;
  if (prevFull.volume > 8) {
    volumeMonthComparePct = Math.round(((thisPartial.volume - prevFull.volume) / prevFull.volume) * 1000) / 10;
  } else if (thisPartial.volume > 0) {
    volumeMonthComparePct = null;
  }

  const prCountThisMonth = countVolumePrsInRange(workouts, m0, now);

  const title =
    goals.longTermLabel?.trim() ||
    (goals.longTermMonths ? `${months}개월 목표` : `기록 기반 · ${months}개월 추적`);

  const summaryLines: string[] = [];
  if (volumeMonthComparePct != null) {
    const sign = volumeMonthComparePct >= 0 ? "+" : "";
    summaryLines.push(`이번 달(진행 중) 총 볼륨, 지난달 대비 ${sign}${volumeMonthComparePct}%`);
  } else if (thisPartial.volume > 0 && prevFull.volume <= 8) {
    summaryLines.push("이번 달 볼륨이 쌓이기 시작했어요. 지난달과 비교할 만큼 데이터가 더 필요해요.");
  }
  if (prCountThisMonth > 0) {
    summaryLines.push(`PR ${prCountThisMonth}회 달성`);
  }
  if (summaryLines.length === 0 && workouts.length > 0) {
    summaryLines.push("기록을 이어가면 월간 볼륨·PR 추이가 여기 모여요.");
  }

  return {
    longTermTitle: title,
    longProgressPercent: workouts.length === 0 ? 0 : longProgressPercent,
    volumeMonthComparePct,
    prCountThisMonth,
    thisMonthVolume: thisPartial.volume,
    thisMonthRows: thisPartial.rowCount,
    summaryLines,
  };
}
