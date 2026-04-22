"use client";

import { buildDailyStatusBriefing } from "@/lib/dashboard/daily-status-briefing";
import { loadLocalGoals } from "@/lib/dashboard/local-goals";
import type { DailyCloseReportKind } from "@/lib/habit-loop/daily-closing-report";
import { buildClosingReportPlanFeedbackUi } from "@/lib/plan-feedback/closing-report-plan-feedback";
import { volumeForRow } from "@/lib/workouts/period-stats";
import { computeLoggingStreakMerged } from "@/lib/workouts/streak";
import type { WorkoutRow } from "@/types/workout";
import Link from "next/link";
import { useMemo } from "react";

function localDayKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayRows(workouts: WorkoutRow[], now: Date): WorkoutRow[] {
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return workouts.filter((w) => localDayKey(w.created_at) === key);
}

type Props = {
  open: boolean;
  kind: DailyCloseReportKind;
  workouts: WorkoutRow[];
  onDismiss: () => void;
};

const scrim =
  "fixed inset-0 z-[110] flex items-end justify-center bg-[rgba(15,23,42,0.45)] p-4 pb-8 sm:items-center sm:p-6 sm:pb-6 dark:bg-black/50";

const panel =
  "w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.14)] sm:p-8 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.5)]";

const innerBlock = "rounded-xl border border-neutral-200 bg-neutral-50/90 px-4 py-3.5 dark:border-zinc-700 dark:bg-zinc-900/60";

export function DailyClosingReportModal({ open, kind, workouts, onDismiss }: Props) {
  const now = useMemo(() => new Date(), []);
  const todayList = useMemo(() => todayRows(workouts, now), [workouts, now]);
  const streak = useMemo(() => computeLoggingStreakMerged(workouts, now), [workouts, now]);
  const briefing = useMemo(() => buildDailyStatusBriefing(workouts, now), [workouts, now]);

  const completionPct = useMemo(() => {
    if (kind !== "completed") return 0;
    const targetSets = 4;
    const n = todayList.length;
    return Math.min(100, Math.round((n / targetSets) * 100));
  }, [kind, todayList.length]);

  const planFeedbackUi = useMemo(() => {
    const g = loadLocalGoals();
    const hasWeekly = !!(g.weeklySessionTarget && g.weeklySessionTarget > 0);
    return buildClosingReportPlanFeedbackUi(kind, todayList.length, hasWeekly);
  }, [kind, todayList.length, open]);

  const planFeedbackShell =
    planFeedbackUi.tone === "success"
      ? "border-emerald-200/90 bg-emerald-50/95 text-emerald-950 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-50"
      : planFeedbackUi.tone === "fail"
        ? "border-rose-200/90 bg-rose-50/95 text-rose-950 dark:border-rose-800/50 dark:bg-rose-950/40 dark:text-rose-50"
        : "border-amber-200/90 bg-amber-50/95 text-amber-950 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-50";

  const volumeToday = useMemo(() => {
    const v = todayList.reduce((a, w) => a + volumeForRow(w), 0);
    return Math.round(v * 10) / 10;
  }, [todayList]);

  const growthLine = useMemo(() => {
    const p = briefing.metrics.volumeDeltaPercent;
    if (p === null || kind !== "completed") return null;
    if (Math.abs(p) < 3) return null;
    const sign = p > 0 ? "+" : "";
    return `지난주 동일 7일 대비 볼륨 ${sign}${p}%`;
  }, [briefing.metrics.volumeDeltaPercent, kind]);

  if (!open) return null;

  const title = kind === "completed" ? "오늘 마감 리포트" : "오늘 하루 정리";
  const aiEval =
    kind === "completed"
      ? `오늘 목표를 약 ${completionPct}% 달성했습니다.${todayList.length ? ` 세트 ${todayList.length}건을 기록했어요.` : ""}`
      : "오늘은 세트 기록이 없었습니다. 괜찮아요 — 리듬만 다시 잡으면 됩니다.";

  const nextLine =
    kind === "completed"
      ? streak >= 3
        ? `${streak}일 연속입니다. 내일은 강도를 유지하거나 5%만 올려도 충분해요.`
        : "내일은 오늘과 비슷한 강도로 이어가 보세요."
      : "내일은 20분 가벼운 루틴으로 다시 시작하세요.";

  return (
    <div className={scrim} role="dialog" aria-modal="true" aria-labelledby="close-report-title">
      <div className={panel}>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-700/90 dark:text-violet-300/90">루프 마감</p>
        <h2
          id="close-report-title"
          className="font-display mt-2 text-[1.65rem] font-bold tracking-[-0.03em] text-apple-ink sm:text-[1.85rem] dark:text-zinc-100"
        >
          {title}
        </h2>

        <div className="mt-6 space-y-3">
          <div className={innerBlock}>
            <p className="text-[10px] font-bold uppercase tracking-wide text-apple-subtle dark:text-zinc-500">수행 결과</p>
            <p className="mt-1 text-[15px] font-semibold leading-snug text-apple-ink dark:text-zinc-100">
              {kind === "completed"
                ? `완료 · 수행률 약 ${completionPct}% · 볼륨 합 ${volumeToday}`
                : "미완료 · 수행률 0%"}
            </p>
          </div>
          <div className={`rounded-xl border px-4 py-3.5 ${planFeedbackShell}`}>
            <p className="text-[10px] font-bold uppercase tracking-wide opacity-80">다음 계획 반영</p>
            <p className="mt-1 text-[15px] font-bold leading-snug">{planFeedbackUi.headline}</p>
            <p className="mt-1 text-[14px] font-semibold leading-relaxed opacity-95">{planFeedbackUi.effectLine}</p>
            <p className="mt-2 text-[11px] font-medium leading-snug opacity-80">
              닫기 시 위 내용이 저장되어 내일 권장 강도·주간 목표에 반영됩니다.
            </p>
          </div>
          <div className={innerBlock}>
            <p className="text-[10px] font-bold uppercase tracking-wide text-apple-subtle dark:text-zinc-500">AI 평가</p>
            <p className="mt-1 text-[15px] font-medium leading-relaxed text-apple-ink dark:text-zinc-200">{aiEval}</p>
          </div>
          {growthLine ? (
            <p className="rounded-xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-[14px] font-bold text-amber-950 dark:border-amber-800/50 dark:bg-amber-950/35 dark:text-amber-100">
              {growthLine} 성장 🔥
            </p>
          ) : null}
          <div className={innerBlock}>
            <p className="text-[10px] font-bold uppercase tracking-wide text-apple-subtle dark:text-zinc-500">다음 행동</p>
            <p className="mt-1 text-[15px] font-semibold leading-snug text-emerald-800 dark:text-emerald-300">{nextLine}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          {kind === "missed_evening" ? (
            <Link
              href="/workout"
              onClick={onDismiss}
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-black px-6 text-[14px] font-bold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              빠른 루틴 시작
            </Link>
          ) : null}
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-neutral-200 bg-white px-6 text-[14px] font-bold text-apple-ink transition hover:border-black dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-400"
          >
            닫기
          </button>
        </div>
        <p className="mt-4 text-center text-[11px] text-apple-subtle dark:text-zinc-500">오늘은 한 번만 뜹니다. 내일 아침 다시 체크인해요.</p>
      </div>
    </div>
  );
}
