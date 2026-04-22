import { loadPlanIntensityBias } from "@/lib/plan-feedback/closing-report-plan-feedback";
import { volumeForRow } from "@/lib/workouts/period-stats";
import type { WorkoutRow } from "@/types/workout";

export type FatigueLevel = "low" | "medium" | "high";

/** 오늘 행동 결정 유형 */
export type BriefingDecisionKind = "rest" | "intensity_cap" | "standard";

export type DailyStatusBriefing = {
  fatigue: FatigueLevel;
  /** 0–100, 게이지·그라데이션용 */
  fatigueScore: number;
  recommendedIntensityPercent: number;
  /** 규칙 기반 결정 유형 */
  decisionKind: BriefingDecisionKind;
  /** 피로·빈도·볼륨을 한 줄로 요약(상태 분석) */
  statusSummary: string;
  /** 결정형 한 줄(강도·휴식 등 실행 지시) */
  aiMessage: string;
  /** 규칙 기반 해석 — 왜 이렇게 결정했는지(자연어) */
  interpretationLine: string;
  /** 숫자·기간 근거 한 줄 */
  reasonLine: string;
  metrics: {
    activeDaysLast7: number;
    restDaysLast7: number;
    volumeLast7: number;
    volumePrev7: number;
    volumeDeltaPercent: number | null;
    sessionRowsLast7: number;
    daysSinceLastWorkout: number | null;
    /** 어제부터 거슬러 올라가며 연속된 "고부하" 일수 */
    consecutiveHighLoadDays: number;
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

/** 일일 세트 수·볼륨으로 '고부하' 여부(연속일 판별용) — 기본값은 사이트 설정과 동일 */
export type DailyBriefingLoadThresholds = {
  highLoadDayMinRows: number;
  highLoadDayMinVolume: number;
};

const DEFAULT_LOAD_THRESHOLDS: DailyBriefingLoadThresholds = {
  highLoadDayMinRows: 7,
  highLoadDayMinVolume: 900,
};

function normalizeLoadThresholds(input?: Partial<DailyBriefingLoadThresholds> | null): DailyBriefingLoadThresholds {
  if (!input) return DEFAULT_LOAD_THRESHOLDS;
  const rows =
    typeof input.highLoadDayMinRows === "number" && Number.isFinite(input.highLoadDayMinRows)
      ? Math.min(60, Math.max(1, Math.round(input.highLoadDayMinRows)))
      : DEFAULT_LOAD_THRESHOLDS.highLoadDayMinRows;
  const vol =
    typeof input.highLoadDayMinVolume === "number" && Number.isFinite(input.highLoadDayMinVolume)
      ? Math.min(50000, Math.max(100, Math.round(input.highLoadDayMinVolume)))
      : DEFAULT_LOAD_THRESHOLDS.highLoadDayMinVolume;
  return { highLoadDayMinRows: rows, highLoadDayMinVolume: vol };
}

function volumeAndRowsForDayOffset(workouts: WorkoutRow[], now: Date, dayOffset: number): { vol: number; rows: number } {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOffset, 12, 0, 0, 0);
  const key = dayKeyFromDate(d);
  let vol = 0;
  let rows = 0;
  for (const w of workouts) {
    if (localDayKey(w.created_at) === key) {
      vol += volumeForRow(w);
      rows += 1;
    }
  }
  return { vol: Math.round(vol * 10) / 10, rows };
}

function isHighLoadDay(vol: number, rows: number, t: DailyBriefingLoadThresholds): boolean {
  if (rows === 0) return false;
  return rows >= t.highLoadDayMinRows || vol >= t.highLoadDayMinVolume;
}

/** 어제(1)부터 연속으로 고부하인 캘린더 일 수 */
function countConsecutiveHighLoadDaysBeforeToday(workouts: WorkoutRow[], now: Date, t: DailyBriefingLoadThresholds): number {
  let c = 0;
  for (let i = 1; i <= 10; i++) {
    const { vol, rows } = volumeAndRowsForDayOffset(workouts, now, i);
    if (rows === 0) break;
    if (isHighLoadDay(vol, rows, t)) c += 1;
    else break;
  }
  return c;
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
  if (m.consecutiveHighLoadDays > 0) {
    parts.push(`어제 기준 연속 고부하 ${m.consecutiveHighLoadDays}일`);
  }
  if (m.daysSinceLastWorkout !== null) {
    parts.push(`마지막 운동 후 ${m.daysSinceLastWorkout}일`);
  }
  if (m.volumeDeltaPercent !== null) {
    const p = m.volumeDeltaPercent;
    const sign = p > 0 ? "+" : "";
    parts.push(`전주 동기간 대비 볼륨 ${sign}${p}%`);
  }
  return `${parts.join(" · ")}입니다.`;
}

function buildStatusSummary(fatigue: FatigueLevel, m: DailyStatusBriefing["metrics"]): string {
  const fatigueWord = fatigue === "high" ? "피로 높음" : fatigue === "medium" ? "피로 중간" : "피로 낮음";
  return `${fatigueWord} · 최근 7일 중 ${m.activeDaysLast7}일 운동 · 7일 볼륨 합 약 ${Math.round(m.volumeLast7).toLocaleString("ko-KR")}`;
}

function buildInterpretationLine(
  fatigue: FatigueLevel,
  m: DailyStatusBriefing["metrics"],
  restDayRecommended: boolean,
  volumeDeltaPercent: number | null,
): string {
  if (restDayRecommended) {
    return m.consecutiveHighLoadDays >= 4
      ? `최근 ${m.consecutiveHighLoadDays}일 연속으로 일일 세트·볼륨이 고강도 구간이었습니다.`
      : "최근 3일 연속 고강도 운동을 수행했습니다.";
  }
  const bits: string[] = [];
  if (m.consecutiveHighLoadDays >= 2 && fatigue === "high") {
    bits.push(`어제까지 ${m.consecutiveHighLoadDays}일 연속 고부하가 이어졌습니다`);
  }
  if (volumeDeltaPercent !== null && volumeDeltaPercent >= 12) {
    bits.push(`전주 대비 7일 볼륨이 약 ${volumeDeltaPercent}% 올랐습니다`);
  }
  if (m.activeDaysLast7 >= 5 && fatigue !== "low") {
    bits.push(`최근 7일 중 ${m.activeDaysLast7}일에 운동했습니다`);
  }
  if (bits.length === 0) {
    if (fatigue === "high") return "누적 피로 신호가 높게 잡혔습니다.";
    if (fatigue === "medium") return "피로·빈도는 무난한 구간입니다.";
    return "회복 여력이 충분해 보입니다.";
  }
  return `${bits.join(" · ")}.`;
}

function buildAiMessage(
  level: FatigueLevel,
  pct: number,
  m: DailyStatusBriefing["metrics"],
  volDeltaPct: number | null,
  restDayRecommended: boolean,
): string {
  if (restDayRecommended) {
    return "오늘은 휴식하세요.";
  }
  if (level === "high") {
    return `오늘은 강도를 ${pct}%로 낮추세요.`;
  }
  if (level === "medium") {
    return `오늘 중량·횟수는 평소의 ${pct}%에 맞추세요.`;
  }
  if (m.daysSinceLastWorkout !== null && m.daysSinceLastWorkout >= 2) {
    return `오늘 중량·횟수는 평소의 ${pct}%까지 쓰세요.`;
  }
  return `오늘 중량·횟수는 평소의 ${pct}%로 진행하세요.`;
}

/**
 * 최근 7일·전주 볼륨·연속 고부하 일수·활동/휴식일·마지막 운동 경과로 피로도·목표 강도·휴식 여부를 규칙 기반 산출합니다.
 * 고부하 일: 일 세트 수·일 볼륨 합이 임계값을 넘는 날(기본 7세트 / 900 볼륨 합).
 */
export function buildDailyStatusBriefing(
  workouts: WorkoutRow[],
  now = new Date(),
  loadThresholds?: Partial<DailyBriefingLoadThresholds> | null,
): DailyStatusBriefing {
  const loadT = normalizeLoadThresholds(loadThresholds);
  const activeDaysLast7 = activeDaysInCalendarWindow(workouts, now, 7);
  const restDaysLast7 = 7 - activeDaysLast7;
  const volumeLast7 = volumeInCalendarWindow(workouts, now, 0, 7);
  const volumePrev7 = volumeInCalendarWindow(workouts, now, 7, 7);
  const sessionRowsLast7 = sessionRowsInCalendarWindow(workouts, now, 0, 7);
  const daysSinceLastWorkout = computeDaysSinceLastWorkout(workouts, now);

  if (workouts.length === 0) {
    const emptyMetrics: DailyStatusBriefing["metrics"] = {
      activeDaysLast7: 0,
      restDaysLast7: 7,
      volumeLast7: 0,
      volumePrev7: 0,
      volumeDeltaPercent: null,
      sessionRowsLast7: 0,
      daysSinceLastWorkout: null,
      consecutiveHighLoadDays: 0,
    };
    const biasEmpty = loadPlanIntensityBias();
    const recEmpty = clamp(Math.round(100 + biasEmpty), 5, 100);
    return {
      fatigue: "low",
      fatigueScore: 12,
      recommendedIntensityPercent: recEmpty,
      decisionKind: "standard",
      statusSummary: "저장된 운동 기록이 없습니다.",
      aiMessage: "첫 세트를 기록해 보세요.",
      interpretationLine: "세트·볼륨 데이터가 없어 피로도는 ‘낮음’으로 가정했습니다.",
      reasonLine: "피로·강도 산출에 사용할 데이터가 없어 기본값(피로 낮음, 권장 강도 100%)으로 표시합니다.",
      metrics: emptyMetrics,
    };
  }

  const consecutiveHighLoadDays = countConsecutiveHighLoadDaysBeforeToday(workouts, now, loadT);

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

  if (consecutiveHighLoadDays >= 2) {
    score += Math.min(16, consecutiveHighLoadDays * 4);
  }

  score = clamp(Math.round(score), 8, 96);
  const fatigue = mapScoreToLevel(score);

  const restDayRecommended = consecutiveHighLoadDays >= 3 && fatigue === "high";
  const bias = loadPlanIntensityBias();
  let recommendedIntensityPercent = restDayRecommended ? 0 : intensityForLevel(fatigue);
  if (!restDayRecommended) {
    recommendedIntensityPercent = clamp(Math.round(recommendedIntensityPercent + bias), 5, 100);
  }

  const decisionKind: BriefingDecisionKind = restDayRecommended
    ? "rest"
    : fatigue === "high"
      ? "intensity_cap"
      : "standard";

  const metrics: DailyStatusBriefing["metrics"] = {
    activeDaysLast7,
    restDaysLast7,
    volumeLast7,
    volumePrev7,
    volumeDeltaPercent,
    sessionRowsLast7,
    daysSinceLastWorkout,
    consecutiveHighLoadDays,
  };

  const statusSummary = buildStatusSummary(fatigue, metrics);
  const interpretationLine = buildInterpretationLine(fatigue, metrics, restDayRecommended, volumeDeltaPercent);
  const reasonLine = buildReasonLine(metrics);
  const aiMessage = buildAiMessage(
    fatigue,
    recommendedIntensityPercent,
    metrics,
    volumeDeltaPercent,
    restDayRecommended,
  );

  return {
    fatigue,
    fatigueScore: score,
    recommendedIntensityPercent,
    decisionKind,
    statusSummary,
    aiMessage,
    interpretationLine,
    reasonLine,
    metrics,
  };
}
