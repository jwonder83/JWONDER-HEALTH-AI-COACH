"use client";

import type { HomeActionViewModel } from "@/lib/dashboard/home-action-state";
import Link from "next/link";

const shell =
  "relative overflow-hidden rounded-2xl border-2 border-black bg-gradient-to-br from-neutral-900 via-black to-neutral-900 p-5 text-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)] sm:p-7 dark:border-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-950";

type Props = {
  model: Pick<HomeActionViewModel, "todayWorkoutComplete" | "routine" | "estimatedDurationLabel">;
  workoutSectionId: string;
};

function LiveRoutineFeed({ routine }: { routine: HomeActionViewModel["routine"] }) {
  const msgs = routine.liveMessages?.filter(Boolean) ?? [];
  if (msgs.length === 0) return null;
  return (
    <div className="mt-4 rounded-xl border border-white/15 bg-white/5 px-3 py-3 backdrop-blur-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/90">자동 루틴 피드</p>
      <ul className="mt-2 space-y-2 text-[13px] leading-snug text-white/85">
        {msgs.map((m, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-emerald-400" aria-hidden />
            <span>{m}</span>
          </li>
        ))}
      </ul>
      {routine.source === "rules" ? (
        <p className="mt-2 text-[10px] text-white/45">규칙 기반 자동 조정 · GPT 연동 시 같은 자리에 문구가 교체돼요.</p>
      ) : null}
    </div>
  );
}

export function TodayWorkoutHeroCard({ model, workoutSectionId }: Props) {
  const done = model.todayWorkoutComplete;

  return (
    <section className={shell} id={workoutSectionId} aria-labelledby="today-workout-heading">
      <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-white/5 blur-2xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-10 -left-10 size-48 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden />

      <div className="relative">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/60">오늘의 운동</p>
        <h2 id="today-workout-heading" className="font-display mt-2 text-[1.5rem] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[1.75rem]">
          {model.routine.title}
        </h2>
        <p className="mt-2 max-w-prose whitespace-pre-line text-[14px] leading-relaxed text-white/75 sm:text-[15px]">
          {model.routine.description}
        </p>

        <LiveRoutineFeed routine={model.routine} />

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] font-medium text-white/85 sm:text-[13px]">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 tabular-nums backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
            예상 {model.estimatedDurationLabel}
          </span>
          {done ? (
            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-emerald-200">오늘 세션 기록됨</span>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Link
            href="/workout"
            className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-white px-6 text-[15px] font-bold tracking-[-0.01em] text-black shadow-lg transition hover:bg-neutral-100 active:scale-[0.99] sm:min-h-[56px] sm:max-w-xs sm:text-[16px]"
          >
            {done ? "추가 세트 기록" : "운동 시작하기"}
          </Link>
          <Link
            href="/program"
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/35 bg-transparent px-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/90 transition hover:bg-white/10 sm:min-h-[56px]"
          >
            프로그램 가이드
          </Link>
        </div>
      </div>
    </section>
  );
}
