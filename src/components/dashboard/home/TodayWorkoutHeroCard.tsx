"use client";

import type { HomeActionViewModel } from "@/lib/dashboard/home-action-state";
import type { RoutineFlowStatus } from "@/lib/routine/today-routine-confirmation";
import Link from "next/link";

const shellBase =
  "relative overflow-hidden rounded-2xl border-2 border-black bg-gradient-to-br from-neutral-900 via-black to-neutral-900 p-5 text-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)] sm:p-7 dark:border-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-950";

const shellNudge =
  "ring-4 ring-amber-400/35 shadow-[0_24px_56px_-18px_rgba(245,158,11,0.28)] dark:ring-amber-500/30";

type Props = {
  model: Pick<
    HomeActionViewModel,
    "todayWorkoutComplete" | "routine" | "estimatedDurationLabel" | "coachLine" | "coachLineReason"
  >;
  workoutSectionId: string;
  routineFlowStatus: RoutineFlowStatus;
};

function LiveRoutineFeed({ routine }: { routine: HomeActionViewModel["routine"] }) {
  const adjustments = routine.adjustments?.filter(Boolean) ?? [];
  if (adjustments.length > 0) {
    return (
      <div className="mt-4 rounded-xl border border-white/15 bg-white/5 px-3 py-3 backdrop-blur-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/90">루틴 피드</p>
        <ul className="mt-2 space-y-3 text-[13px] leading-snug text-white/85">
          {adjustments.map((a, i) => (
            <li key={`${a.type}-${i}`} className="flex gap-2">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-emerald-400" aria-hidden />
              <div className="min-w-0">
                <p>{a.message}</p>
                <p className="mt-1 flex flex-wrap items-baseline gap-1.5 text-[11px] leading-relaxed text-white/55">
                  <span className="shrink-0 rounded border border-white/20 bg-white/5 px-1 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white/50">
                    왜?
                  </span>
                  <span>{a.reason}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
        {routine.source === "rules" ? (
          <p className="mt-2 text-[10px] text-white/45">지금은 규칙 엔진이 짜 준 피드예요. GPT 붙이면 여기 문구가 더 말 잘해요.</p>
        ) : null}
      </div>
    );
  }

  const msgs = routine.liveMessages?.filter(Boolean) ?? [];
  if (msgs.length === 0) return null;
  return (
    <div className="mt-4 rounded-xl border border-white/15 bg-white/5 px-3 py-3 backdrop-blur-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/90">루틴 피드</p>
      <ul className="mt-2 space-y-2 text-[13px] leading-snug text-white/85">
        {msgs.map((m, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-emerald-400" aria-hidden />
            <span>{m}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 flex flex-wrap items-baseline gap-1.5 text-[11px] leading-relaxed text-white/55">
        <span className="shrink-0 rounded border border-white/20 bg-white/5 px-1 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white/50">
          왜?
        </span>
        <span>{routine.recommendationReason}</span>
      </p>
      {routine.source === "rules" ? (
        <p className="mt-2 text-[10px] text-white/45">규칙 기반 피드 · GPT 연결 시 같은 자리에 문구만 갈아끼워져요.</p>
      ) : null}
    </div>
  );
}

export function TodayWorkoutHeroCard({ model, workoutSectionId, routineFlowStatus }: Props) {
  const done = model.todayWorkoutComplete;
  const confirmed = routineFlowStatus === "confirmed" || routineFlowStatus === "completed";
  const shell = `${shellBase}${done ? "" : ` ${shellNudge}`}`;

  return (
    <section className={shell} id={workoutSectionId} aria-labelledby="today-workout-heading">
      <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-white/5 blur-2xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-10 -left-10 size-48 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden />

      <div className="relative">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/60">오늘 픽</p>
        <h2 id="today-workout-heading" className="font-display mt-2 text-[1.5rem] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[1.75rem]">
          {model.routine.title}
        </h2>
        <p className="mt-2 max-w-prose whitespace-pre-line text-[14px] leading-relaxed text-white/75 sm:text-[15px]">
          {model.routine.description}
        </p>

        <div className="mt-4 rounded-xl border border-white/12 bg-white/[0.07] px-3 py-3 sm:px-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/85">코치 한 줄</p>
          <p className="mt-1.5 text-[14px] font-medium leading-relaxed text-white sm:text-[15px]">{model.coachLine}</p>
          <p className="mt-2 flex flex-wrap items-baseline gap-1.5 text-[11px] leading-relaxed text-white/55">
            <span className="shrink-0 rounded border border-white/20 bg-white/5 px-1 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white/50">
              근거
            </span>
            <span>{model.coachLineReason}</span>
          </p>
        </div>

        <LiveRoutineFeed routine={model.routine} />

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] font-medium text-white/85 sm:text-[13px]">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 tabular-nums backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
            대충 {model.estimatedDurationLabel}
          </span>
          {confirmed && !done ? (
            <span className="rounded-full border border-amber-300/50 bg-amber-400/20 px-3 py-1 text-amber-100">루틴 확정 · 바로 가도 됨</span>
          ) : null}
          {done ? (
            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-emerald-200">오늘 세션은 찍혔어요</span>
          ) : null}
        </div>

        <div className={`mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 ${done ? "" : "sm:justify-center"}`}>
          <Link
            href="/workout"
            className={
              done
                ? "inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-white px-6 text-[15px] font-bold tracking-[-0.01em] text-black shadow-lg transition hover:bg-neutral-100 active:scale-[0.99] sm:min-h-[56px] sm:max-w-xs sm:text-[16px]"
                : "inline-flex min-h-[58px] w-full items-center justify-center rounded-xl bg-gradient-to-b from-amber-300 to-amber-400 px-6 text-[17px] font-bold tracking-[-0.01em] text-amber-950 shadow-[0_10px_36px_-8px_rgba(251,191,36,0.65)] ring-2 ring-amber-200/80 transition hover:from-amber-200 hover:to-amber-300 hover:shadow-lg active:scale-[0.99] sm:min-h-[60px] sm:max-w-md sm:flex-1 sm:text-[18px] dark:from-amber-400 dark:to-amber-500 dark:text-amber-950 dark:ring-amber-300/50"
            }
          >
            {done ? "추가로 한 세트 더" : "운동하러 가기"}
          </Link>
          <Link
            href="/program"
            className={
              done
                ? "inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/35 bg-transparent px-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/90 transition hover:bg-white/10 sm:min-h-[56px]"
                : "inline-flex min-h-[50px] w-full items-center justify-center rounded-xl border-2 border-white/40 bg-white/10 px-5 text-[12px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/15 sm:min-h-[56px] sm:w-auto sm:min-w-[11rem]"
            }
          >
            {done ? "프로그램 훑기" : "가벼운 추천 보기"}
          </Link>
        </div>
      </div>
    </section>
  );
}
