"use client";

import type { WeeklyStakeModel } from "@/lib/dashboard/weekly-stake";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";

type Props = {
  stake: WeeklyStakeModel | null;
  hydrated: boolean;
  todayWorkoutComplete: boolean;
};

const shell =
  "rounded-2xl border-2 border-rose-400/55 bg-gradient-to-br from-rose-50/95 via-white to-orange-50/75 p-4 shadow-md ring-1 ring-rose-500/15 sm:p-5 dark:border-rose-700/50 dark:from-rose-950/40 dark:via-zinc-950 dark:to-orange-950/25 dark:ring-rose-900/25";

const shellDone =
  "rounded-2xl border-2 border-emerald-400/55 bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/75 p-4 shadow-md ring-1 ring-emerald-500/12 sm:p-5 dark:border-emerald-700/50 dark:from-emerald-950/35 dark:via-zinc-950 dark:to-teal-950/25";

const shellMuted =
  "rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5 dark:border-zinc-800 dark:bg-zinc-950";

export function WeeklyStakeCard({ stake, hydrated, todayWorkoutComplete }: Props) {
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (!stake || todayWorkoutComplete) return;
    setAnimKey((k) => k + 1);
  }, [todayWorkoutComplete, stake?.progressPercent, stake?.currentRows, stake?.weeklyTarget]);

  if (!hydrated) return null;

  if (!stake) {
    return (
      <section className={shellMuted} aria-labelledby="weekly-stake-empty-heading">
        <h2 id="weekly-stake-empty-heading" className="text-[10px] font-bold uppercase tracking-[0.18em] text-apple-subtle dark:text-zinc-500">
          주간 손해 방지
        </h2>
        <p className="mt-2 text-[14px] font-semibold leading-snug text-apple-ink dark:text-zinc-100">
          주간 세트 목표를 켜면 “안 하면 손해” 미터가 열려요.
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-apple-subtle dark:text-zinc-500">예: 주 5회(세트 5건)처럼 숫자만 정해도 됩니다.</p>
        <Link
          href="#section-weekly-goals"
          className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-black bg-black px-4 text-[13px] font-bold text-white transition hover:bg-neutral-800 dark:border-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          목표 설정하기
        </Link>
      </section>
    );
  }

  const p = stake.progressPercent;
  const barShell = "relative h-3 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-zinc-800";

  return (
    <section
      className={todayWorkoutComplete ? shellDone : shell}
      aria-labelledby="weekly-stake-heading"
      data-weekly-stake-behind={stake.behindPace ? "true" : "false"}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2
          id="weekly-stake-heading"
          className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
            todayWorkoutComplete ? "text-emerald-900/85 dark:text-emerald-200/90" : "text-rose-900/85 dark:text-rose-200/90"
          }`}
        >
          {todayWorkoutComplete ? "주간 손해 없음" : "주간 목표 · 손해 경고"}
        </h2>
        <span className="rounded-full border border-neutral-200 bg-white/90 px-2.5 py-0.5 text-[10px] font-bold tabular-nums text-apple-ink dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
          {stake.currentRows}/{stake.weeklyTarget}건 · {p}%
        </span>
      </div>
      <p className={`mt-3 text-[15px] font-bold leading-snug sm:text-[16px] ${todayWorkoutComplete ? "text-emerald-950 dark:text-emerald-100" : "text-rose-950 dark:text-rose-50"}`}>
        {stake.lossHeadline}
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-apple-subtle dark:text-zinc-400">{stake.lossSubline}</p>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] font-semibold text-apple-subtle dark:text-zinc-500">
          <span>주간 진행률</span>
          {!todayWorkoutComplete ? <span className="text-rose-700 dark:text-rose-300">오늘 미수행 시 여지 감소</span> : <span className="text-emerald-800 dark:text-emerald-300">오늘 반영 완료</span>}
        </div>
        <div className={`${barShell} mt-2`}>
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-black transition-[width] duration-700 ease-out dark:bg-white"
            style={{ width: `${p}%` }}
          />
          {!todayWorkoutComplete && p > 0 ? (
            <div
              key={animKey}
              className="weekly-stake-dip-once absolute inset-y-0 left-0 rounded-full bg-rose-500/45 dark:bg-rose-500/35"
              style={
                {
                  width: `${p}%`,
                  ["--stake-end-scale" as string]: String(stake.dipEndScale),
                } as CSSProperties
              }
            />
          ) : null}
          {!todayWorkoutComplete && p === 0 ? (
            <div
              key={animKey}
              className="weekly-stake-dip-once absolute inset-y-0 left-0 w-[min(72%,8rem)] rounded-full bg-rose-500/35 dark:bg-rose-500/25"
              style={{ ["--stake-end-scale" as string]: String(stake.dipEndScale) } as CSSProperties}
            />
          ) : null}
        </div>
        {!todayWorkoutComplete ? (
          <p className="mt-2 text-[11px] font-medium text-rose-900/80 dark:text-rose-200/85">
            이번 주 남은 일: <span className="tabular-nums font-bold">{stake.daysRemainingInWeek}</span>일 · 오늘은 한 세트만으로도 손해를 줄일 수 있어요.
          </p>
        ) : null}
      </div>

      {!todayWorkoutComplete ? (
        <Link
          href="/workout"
          className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-rose-700 text-[14px] font-bold text-white transition hover:bg-rose-800 dark:bg-rose-600 dark:hover:bg-rose-500 sm:w-auto sm:px-8"
        >
          지금 세트 남기기
        </Link>
      ) : null}
    </section>
  );
}
