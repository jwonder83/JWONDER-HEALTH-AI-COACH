"use client";

import type { HomeActionViewModel } from "@/lib/dashboard/home-action-state";
import type { UserWorkoutUiState } from "@/lib/dashboard/user-workout-ui-state";
import type { RoutineFlowStatus } from "@/lib/routine/today-routine-confirmation";
import Link from "next/link";

type Props = {
  model: Pick<
    HomeActionViewModel,
    "hydrated" | "todayWorkoutComplete" | "routine" | "estimatedDurationLabel" | "coachDecisionConfirmedLine"
  >;
  routineFlowStatus: RoutineFlowStatus;
  userWorkoutUiState: UserWorkoutUiState;
};

function scrollToRoutinePlan() {
  document.getElementById("today-routine-plan-heading")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

/**
 * 홈 최상단 — 오늘 해야 할 단 하나의 행동(대형 CTA)만 강조.
 */
export function TodaySingleActionFocus({ model, routineFlowStatus, userWorkoutUiState }: Props) {
  const done = model.todayWorkoutComplete;
  const planLocked = routineFlowStatus === "confirmed" || routineFlowStatus === "completed";

  const eyebrow = done || planLocked ? "오늘 운동 (고정)" : "오늘 운동";
  const ctaLabel =
    userWorkoutUiState === "active" && !done ? "세션 이어가기" : done ? "추가로 기록하기" : "운동 시작하기";

  const subline = !done && model.coachDecisionConfirmedLine ? model.coachDecisionConfirmedLine : null;

  if (!model.hydrated) {
    return (
      <section className="rounded-2xl border-2 border-neutral-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8" aria-busy="true">
        <div className="h-3 w-28 animate-pulse rounded-full bg-neutral-200 dark:bg-zinc-800" />
        <div className="mt-4 h-10 max-w-md animate-pulse rounded-lg bg-neutral-100 dark:bg-zinc-900" />
        <div className="mt-8 h-16 w-full animate-pulse rounded-2xl bg-neutral-200 dark:bg-zinc-800" />
      </section>
    );
  }

  return (
    <section
      id="today-single-action"
      className="scroll-mt-36 rounded-2xl border-2 border-black bg-gradient-to-b from-white via-white to-neutral-50 p-6 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.18)] ring-1 ring-black/5 dark:border-zinc-100 dark:from-zinc-950 dark:via-zinc-950 dark:to-black dark:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] dark:ring-white/10 sm:scroll-mt-44 sm:p-8"
      aria-labelledby="today-single-action-title"
    >
      <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-amber-700/90 dark:text-amber-300/90">{eyebrow}</p>
      <h2
        id="today-single-action-title"
        className="font-display mt-2 text-[1.65rem] font-bold leading-[1.12] tracking-[-0.03em] text-apple-ink dark:text-zinc-50 sm:text-[2rem]"
      >
        {model.routine.title}
      </h2>
      {subline ? (
        <p className="mt-2 text-[14px] font-semibold leading-snug text-apple-ink/90 dark:text-zinc-300">{subline}</p>
      ) : null}
      <p className="mt-1 text-[13px] font-medium tabular-nums text-apple-subtle dark:text-zinc-400">{model.estimatedDurationLabel}</p>

      <div className="mt-6 sm:mt-8">
        <Link
          href="/workout"
          className={`inline-flex w-full min-h-[4.25rem] items-center justify-center rounded-2xl px-6 text-[1.25rem] font-extrabold tracking-[-0.02em] shadow-lg transition active:scale-[0.99] sm:min-h-[4.75rem] sm:text-[1.4rem] ${
            done
              ? "border-2 border-neutral-300 bg-white text-apple-ink hover:border-black hover:bg-neutral-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-400"
              : userWorkoutUiState === "active"
                ? "bg-gradient-to-b from-indigo-500 to-indigo-700 text-white ring-4 ring-indigo-300/50 hover:from-indigo-400 hover:to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 dark:ring-indigo-500/30"
                : userWorkoutUiState === "missed" || userWorkoutUiState === "idle"
                  ? "bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-amber-950 ring-4 ring-amber-200/90 hover:from-amber-200 hover:via-amber-300 hover:to-amber-400 dark:from-amber-400 dark:via-amber-500 dark:to-amber-600 dark:text-amber-950 dark:ring-amber-400/40"
                  : "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          }`}
        >
          {ctaLabel}
        </Link>
        {!done && !planLocked ? (
          <button
            type="button"
            onClick={scrollToRoutinePlan}
            className="mt-3 w-full text-center text-[12px] font-semibold text-apple-subtle underline decoration-neutral-300 decoration-1 underline-offset-4 transition hover:text-apple-ink dark:text-zinc-500 dark:decoration-zinc-600 dark:hover:text-zinc-300"
          >
            플랜만 바꾸기 (선택)
          </button>
        ) : null}
      </div>
    </section>
  );
}
