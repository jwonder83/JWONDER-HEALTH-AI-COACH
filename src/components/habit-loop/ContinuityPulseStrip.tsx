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

function milestoneTone(streak: number, n: number): string {
  if (streak >= n) return "bg-emerald-500 text-white ring-2 ring-emerald-300/60";
  return "bg-white/15 text-white/50 ring-1 ring-white/10";
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
        ? "코칭 모드로 세트를 이어가요."
        : phase === "completed"
          ? "오늘 루프 완주. 내일 체크인으로 다시 시작해요."
          : "스트릭이 위험해요. 짧게라도 복귀해요.";

  return (
    <section
      className="rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-4 py-3.5 text-white shadow-md sm:px-5 sm:py-4"
      aria-label="연속 기록과 주간 진행"
      data-habit-phase={phase}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300/90">지속 추적</p>
          <p className="mt-1 text-[14px] font-bold leading-snug">
            {streakDays >= 2 ? `${streakDays}일 연속 운동(기록) 중` : streakDays === 1 ? "연속 1일 — 오늘 이어가면 2일차" : "연속 기록을 시작해 볼까요?"}
          </p>
          {weeklyLeft !== null ? (
            <p className="mt-1 text-[12px] font-medium text-white/75">
              이번 주 세션 목표까지 <span className="font-bold text-amber-200">{weeklyLeft}세션</span> 남음 · 현재 {weeklySessionCurrent}/{weeklySessionTarget}
            </p>
          ) : (
            <p className="mt-1 text-[12px] text-white/65">주간 세션 목표를 설정하면 남은 분량이 여기 뜹니다.</p>
          )}
          {streakMotivationLine ? <p className="mt-2 text-[12px] leading-relaxed text-emerald-100/90">{streakMotivationLine}</p> : null}
          <p className="mt-2 text-[11px] font-medium text-white/55">{stateHint}</p>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-wide text-white/45">streak</span>
            <div className="flex gap-1.5">
              {[
                { n: 3, label: "3" },
                { n: 7, label: "7" },
                { n: 30, label: "30" },
              ].map((m) => (
                <span
                  key={m.n}
                  className={`flex size-9 items-center justify-center rounded-full text-[11px] font-extrabold tabular-nums ${milestoneTone(streakDays, m.n)}`}
                  title={`${m.n}일 달성`}
                >
                  {m.label}
                </span>
              ))}
            </div>
          </div>
          <Link
            href="/workout"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-white px-4 text-[13px] font-bold text-slate-900 transition hover:bg-emerald-100"
          >
            루틴 실행
          </Link>
        </div>
      </div>
    </section>
  );
}
