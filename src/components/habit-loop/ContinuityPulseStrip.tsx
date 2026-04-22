"use client";

import type { UserWorkoutUiState } from "@/lib/dashboard/user-workout-ui-state";
import Link from "next/link";

type Props = {
  hydrated: boolean;
  streakDays: number;
  weeklySessionCurrent: number;
  weeklySessionTarget: number | null;
  streakMotivationLine: string | null;
  userWorkoutUiState: UserWorkoutUiState;
  hasDailyCheckin: boolean;
};

function habitPhase(state: UserWorkoutUiState): "pre" | "active" | "completed" | "missed" {
  if (state === "idle") return "pre";
  if (state === "active") return "active";
  if (state === "completed") return "completed";
  return "missed";
}

function shellForPhase(phase: ReturnType<typeof habitPhase>): string {
  const base =
    "rounded-2xl border-2 p-4 shadow-sm ring-1 sm:p-5 dark:ring-white/[0.04]";
  if (phase === "completed") {
    return `${base} border-emerald-400/60 bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/80 ring-emerald-500/10 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-zinc-950 dark:to-teal-950/25 dark:ring-emerald-500/10`;
  }
  if (phase === "active") {
    return `${base} border-indigo-400/55 bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/70 ring-indigo-500/10 dark:border-indigo-600/45 dark:from-indigo-950/40 dark:via-zinc-950 dark:to-violet-950/25 dark:ring-indigo-500/10`;
  }
  if (phase === "missed") {
    return `${base} border-rose-400/65 bg-gradient-to-br from-rose-50/95 via-white to-orange-50/75 ring-rose-500/12 dark:border-rose-600/50 dark:from-rose-950/45 dark:via-zinc-950 dark:to-orange-950/25 dark:ring-rose-500/10`;
  }
  return `${base} border-amber-300/70 bg-gradient-to-br from-amber-50/90 via-white to-neutral-50 ring-amber-500/10 dark:border-amber-700/45 dark:from-amber-950/35 dark:via-zinc-950 dark:to-zinc-900 dark:ring-amber-500/10`;
}

function milestoneClass(streak: number, n: number): string {
  const unlocked = streak >= n;
  if (unlocked) {
    return "border-emerald-400/70 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-900 shadow-sm dark:border-emerald-600 dark:from-emerald-950/50 dark:to-teal-950/40 dark:text-emerald-100";
  }
  return "border-neutral-200 bg-neutral-50 text-apple-subtle dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500";
}

export function ContinuityPulseStrip({
  hydrated,
  streakDays,
  weeklySessionCurrent,
  weeklySessionTarget,
  streakMotivationLine,
  userWorkoutUiState,
  hasDailyCheckin,
}: Props) {
  if (!hydrated) return null;

  const phase = habitPhase(userWorkoutUiState);
  const weeklyLeft =
    weeklySessionTarget !== null && weeklySessionTarget > 0
      ? Math.max(0, weeklySessionTarget - weeklySessionCurrent)
      : null;

  const stateHint =
    phase === "pre"
      ? hasDailyCheckin
        ? "체크인 완료 · 이제 실행만 남았어요."
        : "체크인 후 플랜이 열려요."
      : phase === "active"
        ? "세트만 차곡차곡 채우면 돼요."
        : phase === "completed"
          ? "오늘은 여기까지. 내일 체크인부터 다시 가요."
          : "스트릭이 위험해요. 짧게라도 복귀해요.";

  const eyebrowClass =
    phase === "completed"
      ? "text-emerald-800/90 dark:text-emerald-300/90"
      : phase === "active"
        ? "text-indigo-800/90 dark:text-indigo-300/90"
        : phase === "missed"
          ? "text-rose-800/90 dark:text-rose-300/90"
          : "text-amber-900/80 dark:text-amber-200/90";

  return (
    <section className={shellForPhase(phase)} aria-label="연속 기록과 주간 진행" data-habit-phase={phase}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${eyebrowClass}`}>지속 추적</p>
          <p className="font-display mt-1 text-[1.05rem] font-bold leading-snug tracking-[-0.02em] text-apple-ink dark:text-zinc-100 sm:text-[1.15rem]">
            {streakDays >= 2
              ? `${streakDays}일 연속 운동(기록) 중`
              : streakDays === 1
                ? "연속 1일 — 오늘 이어가면 2일차"
                : "연속 기록을 시작해 볼까요?"}
          </p>
          {weeklyLeft !== null ? (
            <p className="mt-1 text-[13px] font-medium leading-snug text-apple-subtle dark:text-zinc-400">
              이번 주 세션 목표까지 <span className="font-semibold text-apple-ink dark:text-zinc-200">{weeklyLeft}세션</span> 남음 · 현재{" "}
              {weeklySessionCurrent}/{weeklySessionTarget}
            </p>
          ) : (
            <p className="mt-1 text-[12px] leading-relaxed text-apple-subtle dark:text-zinc-500">
              주간 세션 목표를 설정하면 남은 분량이 여기 뜹니다.
            </p>
          )}
          {streakMotivationLine ? (
            <p className="mt-2 text-[13px] font-medium leading-relaxed text-apple-ink dark:text-zinc-200">{streakMotivationLine}</p>
          ) : null}
          <p className="mt-2 text-[11px] font-medium text-apple-subtle dark:text-zinc-500">{stateHint}</p>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-wide text-apple-subtle dark:text-zinc-500">streak</span>
            <div className="flex gap-1.5">
              {[
                { n: 3, label: "3" },
                { n: 7, label: "7" },
                { n: 30, label: "30" },
              ].map((m) => (
                <span
                  key={m.n}
                  className={`flex size-9 items-center justify-center rounded-full border text-[11px] font-extrabold tabular-nums ${milestoneClass(streakDays, m.n)}`}
                  title={`${m.n}일 달성`}
                >
                  {m.label}
                </span>
              ))}
            </div>
          </div>
          <Link
            href="/workout"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-black bg-black px-4 text-[13px] font-bold text-white transition hover:bg-neutral-800 active:scale-[0.99] dark:border-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            루틴 실행
          </Link>
        </div>
      </div>
    </section>
  );
}
