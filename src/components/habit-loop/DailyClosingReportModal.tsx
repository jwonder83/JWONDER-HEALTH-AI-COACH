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

  const title = kind === "completed" ? "오늘 마무리" : "오늘 정리";
  const aiEval =
    kind === "completed"
      ? `오늘은 대략 ${completionPct}% 정도 채웠어요.${todayList.length ? ` 세트 ${todayList.length}줄 적었네요.` : ""}`
      : "오늘은 줄이 없었네요. 괜찮아요, 내일 다시 맞추면 돼요.";

  const nextLine =
    kind === "completed"
      ? streak >= 3
        ? `${streak}일째 이어가고 있어요. 내일은 오늘이랑 비슷하게만 가도 돼요.`
        : "내일도 오늘이랑 비슷한 세기로 가 볼까요."
      : "내일은 20분만 가볍게 돌아와도 좋아요.";

  return (
    <div className={scrim} role="dialog" aria-modal="true" aria-labelledby="close-report-title">
      <div className={panel}>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-700/90 dark:text-violet-300/90">하루 마감</p>
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
              닫으면 위 내용이 저장돼서 내일 세기랑 주간 목표에 반영돼요.
            </p>
          </div>
          <div className={innerBlock}>
            <p className="text-[10px] font-bold uppercase tracking-wide text-apple-subtle dark:text-zinc-500">짧은 평</p>
            <p className="mt-1 text-[15px] font-medium leading-relaxed text-apple-ink dark:text-zinc-200">{aiEval}</p>
          </div>
          {growthLine ? (
            <p className="rounded-xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-[14px] font-bold text-amber-950 dark:border-amber-800/50 dark:bg-amber-950/35 dark:text-amber-100">
              {growthLine} (지난주보다 올랐어요)
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
              운동 화면 열기
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
        <p className="mt-4 text-center text-[11px] text-apple-subtle dark:text-zinc-500">오늘은 이거 한 번만 떠요. 내일 아침에 또 체크인해 주세요.</p>
      </div>
    </div>
  );
}
