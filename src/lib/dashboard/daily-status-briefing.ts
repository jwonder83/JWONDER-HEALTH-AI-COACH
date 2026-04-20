import { volumeForRow } from "@/lib/workouts/period-stats";
import type { WorkoutRow } from "@/types/workout";

export type FatigueLevel = "low" | "medium" | "high";

export type DailyStatusBriefing = {
  fatigue: FatigueLevel;
  /** 0–100, 게이지·그라데이션용 */
  fatigueScore: number;
  recommendedIntensityPercent: number;
  /** 코치 톤 한 줄 */
  aiMessage: string;
  /** 데이터 → 해석 요약(신뢰·투명성) */
  reasonLine: string;
  metrics: {
    activeDaysLast7: number;
    restDaysLast7: number;
    volumeLast7: number;
    volumePrev7: number;
    volumeDeltaPercent: number | null;
    sessionRowsLast7: number;
    daysSinceLastWorkout: number | null;
  };
};

function localDayKey(iso: string): string {
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return "";
  }
}

function dayKeyFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function activeDaysInCalendarWindow(workouts: WorkoutRow[], now: Date, days: number): number {
  let c = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = dayKeyFromDate(d);
    if (workouts.some((w) => localDayKey(w.created_at) === key)) c += 1;
  }
  return c;
}

function volumeInCalendarWindow(workouts: WorkoutRow[], now: Date, startOffset: number, length: number): number {
  let v = 0;
  for (let i = startOffset; i < startOffset + length; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = dayKeyFromDate(d);
    for (const w of workouts) {
      if (localDayKey(w.created_at) === key) v += volumeForRow(w);
    }
  }
  return Math.round(v * 10) / 10;
}

function sessionRowsInCalendarWindow(workouts: WorkoutRow[], now: Date, startOffset: number, length: number): number {
  let n = 0;
  for (let i = startOffset; i < startOffset + length; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = dayKeyFromDate(d);
    for (const w of workouts) {
      if (localDayKey(w.created_at) === key) n += 1;
    }
  }
  return n;
}

function computeDaysSinceLastWorkout(workouts: WorkoutRow[], now: Date): number | null {
  if (workouts.length === 0) return null;
  const sorted = [...workouts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const last = new Date(sorted[0].created_at);
  const a = new Date(last.getFullYear(), last.getMonth(), last.getDate());
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function mapScoreToLevel(score: number): FatigueLevel {
  if (score < 38) return "low";
  if (score < 62) return "medium";
  return "high";
}

function intensityForLevel(level: FatigueLevel): number {
  if (level === "high") return 70;
  if (level === "medium") return 85;
  return 100;
}

function buildReasonLine(m: DailyStatusBriefing["metrics"]): string {
  const parts: string[] = [];
  parts.push(`최근 7일 중 ${m.activeDaysLast7}일 활동 · 휴식 ${m.restDaysLast7}일`);
  parts.push(`7일 볼륨 합 약 ${Math.round(m.volumeLast7).toLocaleString("ko-KR")}`);
  if (m.daysSinceLastWorkout !== null) {
    parts.push(`마지막 운동 후 ${m.daysSinceLastWorkout}일`);
  }
  if (m.volumeDeltaPercent !== null) {
    const p = m.volumeDeltaPercent;
    const sign = p > 0 ? "+" : "";
    parts.push(`전주 동기간 대비 볼륨 ${sign}${p}%`);
  }
  return parts.join(" · ") + ".";
}

function buildAiMessage(
  level: FatigueLevel,
  pct: number,
  m: DailyStatusBriefing["metrics"],
  volDeltaPct: number | null,
): string {
  if (level === "high") {
    const tail =
      volDeltaPct !== null && volDeltaPct >= 8
        ? ` 최근 볼륨이 좀 올라간 편이라 오늘은 살짝 빼고 가는 게 몸이 편해요.`
        : m.activeDaysLast7 >= 5
          ? ` 일주일에 운동한 날이 많았어요. 오늘은 ${pct}% 느낌으로 가볍게 가요.`
          : "";
    return `오늘 컨디션은 피로 좀 있는 편이에요. 강도 ${pct}% 정도로만 가져가 볼까요?${tail}`;
  }
  if (level === "medium") {
    return `피로는 무난한 편이에요. 오늘은 ${pct}% 느낌으로만 맞춰도 충분해요.`;
  }
  if (m.daysSinceLastWorkout !== null && m.daysSinceLastWorkout >= 2) {
    return `쉬는 타이밍 잘 잡았어요. 오늘은 ${pct}%로 밀어도 괜찮아 보여요.`;
  }
  return `지금은 부담 크게 없는 구간이에요. ${pct}%로 가볍게 밀어도 돼요.`;
}

/**
 * 최근 7일·전주 볼륨, 활동/휴식일, 마지막 운동 경과를 바탕으로 피로도·추천 강도를 규칙 기반으로 산출합니다.
 */
export function buildDailyStatusBriefing(workouts: WorkoutRow[], now = new Date()): DailyStatusBriefing {
  const activeDaysLast7 = activeDaysInCalendarWindow(workouts, now, 7);
  const restDaysLast7 = 7 - activeDaysLast7;
  const volumeLast7 = volumeInCalendarWindow(workouts, now, 0, 7);
  const volumePrev7 = volumeInCalendarWindow(workouts, now, 7, 7);
  const sessionRowsLast7 = sessionRowsInCalendarWindow(workouts, now, 0, 7);
  const daysSinceLastWorkout = computeDaysSinceLastWorkout(workouts, now);

  if (workouts.length === 0) {
    return {
      fatigue: "low",
      fatigueScore: 12,
      recommendedIntensityPercent: 100,
      aiMessage:
        "아직 기록이 없어서 오늘 피로·강도 브리핑은 대기 중이에요. 한 세트만 남겨도 바로 채워져요.",
      reasonLine: "데이터 없음 → 기본으로 피로 낮음·강도 100% 보여 드렸어요.",
      metrics: {
        activeDaysLast7: 0,
        restDaysLast7: 7,
        volumeLast7: 0,
        volumePrev7: 0,
        volumeDeltaPercent: null,
        sessionRowsLast7: 0,
        daysSinceLastWorkout: null,
      },
    };
  }

  let score = 28;
  if (activeDaysLast7 >= 6) score += 28;
  else if (activeDaysLast7 === 5) score += 22;
  else if (activeDaysLast7 === 4) score += 14;
  else if (activeDaysLast7 === 3) score += 8;

  const volFloor = 400;
  let volumeDeltaPercent: number | null = null;
  if (volumePrev7 >= volFloor) {
    volumeDeltaPercent = Math.round(((volumeLast7 - volumePrev7) / volumePrev7) * 100);
    if (volumeDeltaPercent >= 22) score += 24;
    else if (volumeDeltaPercent >= 12) score += 16;
    else if (volumeDeltaPercent >= 5) score += 8;
    else if (volumeDeltaPercent <= -18) score -= 12;
  } else if (volumePrev7 < volFloor && volumeLast7 >= volFloor * 1.2) {
    score += 10;
  }

  if (restDaysLast7 >= 4) score -= 14;
  else if (restDaysLast7 >= 3) score -= 8;

  if (daysSinceLastWorkout !== null) {
    if (daysSinceLastWorkout >= 3) score -= 18;
    else if (daysSinceLastWorkout >= 2) score -= 12;
    else if (daysSinceLastWorkout === 0 && activeDaysLast7 >= 5) score += 6;
  }

  if (sessionRowsLast7 >= 42) score += 10;
  else if (sessionRowsLast7 >= 28) score += 5;

  score = clamp(Math.round(score), 8, 96);
  const fatigue = mapScoreToLevel(score);
  const recommendedIntensityPercent = intensityForLevel(fatigue);

  const metrics: DailyStatusBriefing["metrics"] = {
    activeDaysLast7,
    restDaysLast7,
    volumeLast7,
    volumePrev7,
    volumeDeltaPercent,
    sessionRowsLast7,
    daysSinceLastWorkout,
  };

  const reasonLine = buildReasonLine(metrics);
  const aiMessage = buildAiMessage(fatigue, recommendedIntensityPercent, metrics, volumeDeltaPercent);

  return {
    fatigue,
    fatigueScore: score,
    recommendedIntensityPercent,
    aiMessage,
    reasonLine,
    metrics,
  };
}
