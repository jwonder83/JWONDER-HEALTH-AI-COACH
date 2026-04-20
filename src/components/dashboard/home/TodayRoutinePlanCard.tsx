"use client";

import { useMemo } from "react";
import type { HomeActionViewModel } from "@/lib/dashboard/home-action-state";
import { buildExerciseListFromPlan, sumExerciseMinutes } from "@/lib/routine/today-routine-exercises";
import { formatEstimatedLabel } from "@/lib/routine/today-routine-plan";
import type { RoutineFlowStatus } from "@/lib/routine/today-routine-confirmation";

type Props = {
  model: Pick<HomeActionViewModel, "routine" | "todayWorkoutComplete" | "estimatedDurationLabel">;
  status: RoutineFlowStatus;
  onConfirm: () => void;
};

function StatusBadge({ status }: { status: RoutineFlowStatus }) {
  if (status === "suggested") {
    return (
      <span className="inline-flex items-center rounded-full border border-neutral-300 bg-neutral-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-apple-subtle dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        AI 픽
      </span>
    );
  }
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-500/50 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-200">
        오늘 이대로 감
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-600/40 bg-emerald-600/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-800 dark:border-emerald-400/50 dark:bg-emerald-950/50 dark:text-emerald-200">
      <span className="inline-flex size-3.5 items-center justify-center rounded-full bg-emerald-600 text-[9px] text-white dark:bg-emerald-500">✓</span>
      완료
    </span>
  );
}

/** 오늘 수행 동작 리스트 · 확정 · 완료 상태 UI */
export function TodayRoutinePlanCard({ model, status, onConfirm }: Props) {
  const exercises = useMemo(() => buildExerciseListFromPlan(model.routine), [model.routine]);
  const sumMin = sumExerciseMinutes(exercises);
  const planLabel = formatEstimatedLabel(model.routine.estimatedMinutesMin, model.routine.estimatedMinutesMax);

  const shell =
    status === "completed"
      ? "rounded-2xl border-2 border-emerald-500/60 bg-gradient-to-b from-emerald-50/90 to-white shadow-[0_12px_40px_-12px_rgba(16,185,129,0.35)] motion-safe:animate-[routine-done-pop_0.65s_ease-out_1] dark:border-emerald-500/40 dark:from-emerald-950/30 dark:to-zinc-950"
      : status === "confirmed"
        ? "rounded-2xl border-2 border-emerald-500/45 bg-white shadow-md ring-2 ring-emerald-500/15 dark:border-emerald-500/35 dark:bg-zinc-950 dark:ring-emerald-500/20"
        : "rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950";

  return (
    <section className={shell} aria-labelledby="today-routine-plan-heading">
      <style jsx global>{`
        @keyframes routine-done-pop {
          0% {
            transform: scale(0.985);
            opacity: 0.92;
          }
          55% {
            transform: scale(1.008);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes routine-row-check {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          70% {
            transform: scale(1.08);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>

      <div className="flex flex-col gap-3 border-b border-neutral-200/90 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5 sm:py-5 dark:border-zinc-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p id="today-routine-plan-heading" className="text-[10px] font-bold uppercase tracking-[0.18em] text-apple-subtle dark:text-zinc-500">
              오늘 루틴 플랜
            </p>
            <StatusBadge status={status} />
          </div>
          <h3 className="font-display mt-1.5 text-lg font-bold tracking-[-0.02em] text-apple-ink sm:text-xl dark:text-zinc-100">{model.routine.title}</h3>
          <p className="mt-1 text-[12px] text-apple-subtle dark:text-zinc-400">예상 전체 {model.estimatedDurationLabel} · 동작별 합계 약 {sumMin}분</p>
          <p className="mt-2 flex flex-wrap items-start gap-2">
            <span className="shrink-0 rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-apple-subtle dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              왜 이 루틴?
            </span>
            <span className="min-w-0 text-[12px] leading-relaxed text-apple-ink/90 dark:text-zinc-300">{model.routine.recommendationReason}</span>
          </p>
        </div>
        {status === "suggested" && !model.todayWorkoutComplete ? (
          <button
            type="button"
            onClick={onConfirm}
            className="shrink-0 rounded-xl border border-black bg-black px-4 py-3 text-[12px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-black active:scale-[0.99] dark:border-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 sm:min-w-[11rem]"
          >
            오늘은 이걸로 확정
          </button>
        ) : null}
      </div>

      <div className="overflow-x-auto px-2 pb-4 pt-2 sm:px-3 sm:pb-5">
        <table className="w-full min-w-[320px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-neutral-200 text-[10px] font-bold uppercase tracking-[0.14em] text-apple-subtle dark:border-zinc-800 dark:text-zinc-500">
              <th className="py-2.5 pl-2 pr-2 sm:pl-3">운동</th>
              <th className="w-14 py-2.5 text-center sm:w-16">세트</th>
              <th className="w-20 py-2.5 text-center sm:w-24">횟수</th>
              <th className="w-20 py-2.5 pr-2 text-right sm:w-24 sm:pr-3">예상</th>
            </tr>
          </thead>
          <tbody>
            {exercises.map((row, i) => (
              <tr
                key={row.id}
                className={`border-b border-neutral-100 transition-colors dark:border-zinc-800/80 ${
                  status === "completed" ? "bg-emerald-50/40 dark:bg-emerald-950/15" : i % 2 === 1 ? "bg-neutral-50/50 dark:bg-zinc-900/40" : ""
                }`}
              >
                <td className="py-2.5 pl-2 pr-2 font-semibold text-apple-ink sm:pl-3 dark:text-zinc-100">
                  <span className="inline-flex items-center gap-2">
                    {status === "completed" ? (
                      <span
                        className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white motion-safe:animate-[routine-row-check_0.45s_ease-out_1] dark:bg-emerald-500"
                        aria-hidden
                      >
                        ✓
                      </span>
                    ) : null}
                    {row.name}
                  </span>
                </td>
                <td className="py-2.5 text-center tabular-nums text-apple-ink dark:text-zinc-200">{row.sets}</td>
                <td className="py-2.5 text-center text-apple-subtle dark:text-zinc-400">{row.repsLabel}</td>
                <td className="py-2.5 pr-2 text-right tabular-nums text-apple-subtle sm:pr-3 dark:text-zinc-400">~{row.estimatedMinutes}분</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="border-t border-neutral-200/80 px-4 py-3 text-[11px] leading-relaxed text-apple-subtle sm:px-5 dark:border-zinc-800 dark:text-zinc-500">
        {status === "suggested" &&
          "확정해 두면 오늘 뭐 할지 미리 정리돼요. 헬스장이든 홈트든 들어가서 하기만 하면 돼요."}
        {status === "confirmed" && !model.todayWorkoutComplete && "오늘 루틴은 확정됐어요. 아래 버튼으로 바로 이동해 보세요."}
        {status === "completed" && "오늘 루틴 완료! 수고했어요."}
        <span className="mt-1 block text-[10px] opacity-80">참고: 동작별 시간은 {planLabel} 기준으로 자동 배분한 값이에요.</span>
      </p>
    </section>
  );
}
