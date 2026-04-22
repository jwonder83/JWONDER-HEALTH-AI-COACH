"use client";

import { buildDailyStatusBriefing } from "@/lib/dashboard/daily-status-briefing";
import type { DailyCloseReportKind } from "@/lib/habit-loop/daily-closing-report";
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

const shell =
  "fixed inset-0 z-[110] flex items-end justify-center bg-black/55 p-4 pb-8 sm:items-center sm:p-6 sm:pb-6";

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
    <div className={shell} role="dialog" aria-modal="true" aria-labelledby="close-report-title">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900 to-slate-950 p-6 text-white shadow-2xl sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300/90">루프 마감</p>
        <h2 id="close-report-title" className="font-display mt-2 text-2xl font-bold tracking-[-0.03em]">
          {title}
        </h2>

        <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-white/50">수행 결과</p>
            <p className="mt-1 text-[15px] font-semibold leading-snug">
              {kind === "completed"
                ? `완료 · 수행률 약 ${completionPct}% · 볼륨 합 ${volumeToday}`
                : "미완료 · 수행률 0%"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-white/50">AI 평가</p>
            <p className="mt-1 text-[15px] font-medium leading-relaxed text-white/90">{aiEval}</p>
          </div>
          {growthLine ? (
            <p className="text-[14px] font-bold text-amber-300">
              {growthLine} 성장 🔥
            </p>
          ) : null}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-white/50">다음 행동</p>
            <p className="mt-1 text-[15px] font-semibold leading-snug text-emerald-200/95">{nextLine}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          {kind === "missed_evening" ? (
            <Link
              href="/workout"
              onClick={onDismiss}
              className="inline-flex min-h-[50px] items-center justify-center rounded-2xl bg-emerald-400 px-6 text-[14px] font-bold text-slate-950 transition hover:bg-emerald-300"
            >
              빠른 루틴 시작
            </Link>
          ) : null}
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex min-h-[50px] items-center justify-center rounded-2xl border border-white/25 px-6 text-[14px] font-bold text-white hover:bg-white/10"
          >
            닫기
          </button>
        </div>
        <p className="mt-4 text-center text-[10px] text-white/40">오늘은 한 번만 뜹니다. 내일 아침 다시 체크인해요.</p>
      </div>
    </div>
  );
}
