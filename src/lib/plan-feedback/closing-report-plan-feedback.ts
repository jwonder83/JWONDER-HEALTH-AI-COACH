import type { DailyCloseReportKind } from "@/lib/habit-loop/daily-closing-report";
import { loadLocalGoals, saveLocalGoals } from "@/lib/dashboard/local-goals";
import type { WorkoutRow } from "@/types/workout";

export const PLAN_FEEDBACK_CHANGED_EVENT = "jws-plan-feedback-changed";

const LS_BIAS = "jws_plan_outcome_bias_v1";

const TARGET_SETS_FOR_DAY = 4;

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export function loadPlanIntensityBias(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(LS_BIAS);
    if (!raw) return 0;
    const p = JSON.parse(raw) as { intensityBiasPercent?: number };
    return typeof p.intensityBiasPercent === "number" && Number.isFinite(p.intensityBiasPercent) ? p.intensityBiasPercent : 0;
  } catch {
    return 0;
  }
}

function savePlanIntensityBias(next: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_BIAS, JSON.stringify({ intensityBiasPercent: next }));
    window.dispatchEvent(new Event(PLAN_FEEDBACK_CHANGED_EVENT));
  } catch {
    /* ignore */
  }
}

export type ClosingFeedbackDeltas = {
  intensityDelta: number;
  /** null이면 주간 목표 변경 없음 */
  weeklySessionFactor: number | null;
};

export function computeClosingFeedbackDeltas(kind: DailyCloseReportKind, todayRowCount: number): ClosingFeedbackDeltas {
  if (kind === "missed_evening") {
    return { intensityDelta: -10, weeklySessionFactor: 0.88 };
  }
  const pct = Math.min(100, Math.round((todayRowCount / TARGET_SETS_FOR_DAY) * 100));
  if (pct >= 85) return { intensityDelta: 5, weeklySessionFactor: null };
  if (pct >= 40) return { intensityDelta: 3, weeklySessionFactor: null };
  return { intensityDelta: -8, weeklySessionFactor: null };
}

export type ClosingReportPlanFeedbackUi = {
  completionPercent: number;
  tone: "success" | "warn" | "fail";
  headline: string;
  effectLine: string;
  weeklyAdjusted: boolean;
};

export function buildClosingReportPlanFeedbackUi(
  kind: DailyCloseReportKind,
  todayRowCount: number,
  hasWeeklySessionGoal: boolean,
): ClosingReportPlanFeedbackUi {
  const pct =
    kind === "completed" ? Math.min(100, Math.round((todayRowCount / TARGET_SETS_FOR_DAY) * 100)) : 0;
  const deltas = computeClosingFeedbackDeltas(kind, todayRowCount);

  if (kind === "missed_evening") {
    const weeklyPart = hasWeeklySessionGoal ? "이번 주 목표는 12%쯤 줄였고, " : "";
    return {
      completionPercent: 0,
      tone: "fail",
      headline: "오늘은 쉬었네요",
      effectLine: `→ ${weeklyPart}내일 세기는 10% 정도 낮춰 둘게요.`,
      weeklyAdjusted: hasWeeklySessionGoal,
    };
  }

  if (deltas.intensityDelta > 0) {
    return {
      completionPercent: pct,
      tone: pct >= 85 ? "success" : "warn",
      headline: `오늘 수행률 ${pct}%`,
      effectLine: `→ 내일 세기는 ${deltas.intensityDelta}% 정도 올려 둘게요.`,
      weeklyAdjusted: false,
    };
  }

  return {
    completionPercent: pct,
    tone: "warn",
    headline: `오늘 수행률 ${pct}%`,
    effectLine: `→ 내일 세기는 ${Math.abs(deltas.intensityDelta)}% 정도 낮출게요.`,
    weeklyAdjusted: false,
  };
}

function todayRowCount(workouts: WorkoutRow[], now: Date): number {
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const dayKey = (iso: string) => {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  return workouts.filter((w) => dayKey(w.created_at) === key).length;
}

/**
 * 마감 리포트 닫을 때 호출 — 누적 강도 보정·(실패 시) 주간 세션 목표 축소.
 */
export function applyClosingReportFeedback(args: {
  kind: DailyCloseReportKind;
  workouts: WorkoutRow[];
  now: Date;
}): void {
  if (typeof window === "undefined") return;
  const n = todayRowCount(args.workouts, args.now);
  const deltas = computeClosingFeedbackDeltas(args.kind, n);

  if (deltas.weeklySessionFactor !== null) {
    const g = loadLocalGoals();
    if (g.weeklySessionTarget && g.weeklySessionTarget > 0) {
      const next = Math.max(2, Math.round(g.weeklySessionTarget * deltas.weeklySessionFactor));
      if (next !== g.weeklySessionTarget) {
        saveLocalGoals({ ...g, weeklySessionTarget: next });
        window.dispatchEvent(new Event("jws-goals-changed"));
      }
    }
  }

  const prev = loadPlanIntensityBias();
  const next = clamp(prev + deltas.intensityDelta, -30, 20);
  savePlanIntensityBias(next);
}
