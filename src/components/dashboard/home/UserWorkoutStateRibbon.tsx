"use client";

import type { UserWorkoutUiState } from "@/lib/dashboard/user-workout-ui-state";
import Link from "next/link";

type Props = {
  state: UserWorkoutUiState;
};

function stateLabel(s: UserWorkoutUiState): string {
  if (s === "idle") return "운동 전";
  if (s === "active") return "운동 중";
  if (s === "completed") return "운동 완료";
  return "운동 미완";
}

function habitPhase(s: UserWorkoutUiState): "pre" | "active" | "completed" | "missed" {
  if (s === "idle") return "pre";
  if (s === "active") return "active";
  if (s === "completed") return "completed";
  return "missed";
}

export function UserWorkoutStateRibbon({ state }: Props) {
  const shell =
    state === "completed"
      ? "border-emerald-400/50 bg-gradient-to-r from-emerald-50 via-white to-teal-50 dark:border-emerald-700/45 dark:from-emerald-950/40 dark:via-zinc-950 dark:to-teal-950/25"
      : state === "active"
        ? "border-indigo-400/55 bg-gradient-to-r from-indigo-50 via-white to-violet-50 dark:border-indigo-600/45 dark:from-indigo-950/40 dark:via-zinc-950 dark:to-violet-950/25"
        : state === "missed"
          ? "border-rose-500/55 bg-gradient-to-r from-rose-50 via-white to-orange-50 dark:border-rose-600/50 dark:from-rose-950/45 dark:via-zinc-950 dark:to-orange-950/25"
          : "border-amber-400/45 bg-gradient-to-r from-amber-50/95 via-white to-neutral-50 dark:border-amber-600/40 dark:from-amber-950/35 dark:via-zinc-950 dark:to-zinc-900";

  const pill =
    state === "completed"
      ? "border-emerald-600/30 bg-emerald-600/15 text-emerald-900 dark:border-emerald-500/35 dark:bg-emerald-500/20 dark:text-emerald-100"
      : state === "active"
        ? "border-indigo-600/30 bg-indigo-600/15 text-indigo-950 dark:border-indigo-400/35 dark:bg-indigo-500/20 dark:text-indigo-100"
        : state === "missed"
          ? "border-rose-600/35 bg-rose-600/15 text-rose-950 dark:border-rose-500/40 dark:bg-rose-500/20 dark:text-rose-50"
          : "border-amber-700/25 bg-amber-500/12 text-amber-950 dark:border-amber-500/35 dark:bg-amber-500/15 dark:text-amber-100";

  return (
    <aside
      className={`rounded-2xl border-2 px-4 py-3.5 shadow-sm sm:px-5 sm:py-4 ${shell}`}
      aria-label={`오늘 운동 상태: ${stateLabel(state)}`}
      data-user-workout-state={state}
      data-habit-phase={habitPhase(state)}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${pill} ${
              state === "active" ? "motion-safe:animate-pulse" : ""
            }`}
          >
            {stateLabel(state)}
          </span>
          {state === "idle" ? (
            <p className="min-w-0 text-[13px] font-semibold leading-snug text-apple-ink dark:text-zinc-100">
              오늘은 아직 기록 전이에요. 아래에서 <span className="text-amber-800 dark:text-amber-300">플랜 확정 → 운동 시작</span>만 이어가면 돼요.
            </p>
          ) : null}
          {state === "active" ? (
            <p className="min-w-0 text-[13px] font-semibold leading-snug text-apple-ink dark:text-zinc-100">
              세션 진행 중이에요. 코치 휴식·세트 입력 화면으로 돌아가 이어서 저장하세요.
            </p>
          ) : null}
          {state === "completed" ? (
            <p className="min-w-0 text-[13px] font-semibold leading-snug text-apple-ink dark:text-zinc-100">
              오늘 볼륨이 쌓였어요. 성취·분석은 성과 탭에서 확인해 보세요.
            </p>
          ) : null}
          {state === "missed" ? (
            <p className="min-w-0 text-[13px] font-semibold leading-snug text-rose-950 dark:text-rose-50">
              오늘은 아직 세트가 없어요. 짧게라도 루틴을 돌리면 스트릭·기록이 살아납니다.
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {state === "idle" ? (
            <Link
              href="/workout"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-black px-4 text-[13px] font-bold text-white transition hover:bg-neutral-800 active:scale-[0.99] dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              운동 시작하기
            </Link>
          ) : null}
          {state === "active" ? (
            <Link
              href="/workout"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 text-[13px] font-bold text-white shadow-md ring-2 ring-indigo-400/30 transition hover:opacity-95 active:scale-[0.99]"
            >
              세션 이어가기
            </Link>
          ) : null}
          {state === "completed" ? (
            <Link
              href="/performance"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border-2 border-emerald-700/40 bg-white px-4 text-[13px] font-bold text-emerald-900 transition hover:bg-emerald-50 active:scale-[0.99] dark:border-emerald-500/50 dark:bg-zinc-900 dark:text-emerald-100 dark:hover:bg-emerald-950/40"
            >
              분석 보기
            </Link>
          ) : null}
          {state === "missed" ? (
            <>
              <Link
                href="/workout"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-rose-700 px-4 text-[13px] font-bold text-white shadow-md transition hover:bg-rose-800 active:scale-[0.99] dark:bg-rose-600 dark:hover:bg-rose-500"
              >
                빠른 루틴 시작
              </Link>
              <Link
                href="/program"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border-2 border-rose-400/60 bg-white px-4 text-[13px] font-bold text-rose-900 transition hover:bg-rose-50 active:scale-[0.99] dark:border-rose-500/50 dark:bg-zinc-900 dark:text-rose-100 dark:hover:bg-rose-950/30"
              >
                짧은 루틴 찾기
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
