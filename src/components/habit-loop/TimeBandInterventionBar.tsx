"use client";

import { getTimeBandIntervention, type TimeBandIntervention } from "@/lib/interventions/time-band-intervention";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Props = {
  hydrated: boolean;
  todayWorkoutComplete: boolean;
  /** 기본 /workout — 홈 루프에서는 /#section-input */
  primaryCtaHref?: string;
};

function shellClass(intervention: TimeBandIntervention): string {
  const u = intervention.urgency;
  if (u === 0) {
    return "border-indigo-200/90 bg-gradient-to-r from-indigo-50/95 via-white to-violet-50/70 text-indigo-950 dark:border-indigo-800/50 dark:from-indigo-950/35 dark:via-zinc-950 dark:to-violet-950/25 dark:text-indigo-100";
  }
  if (u === 1) {
    return "border-amber-300/90 bg-gradient-to-r from-amber-50/98 via-white to-orange-50/75 text-amber-950 dark:border-amber-700/45 dark:from-amber-950/40 dark:via-zinc-950 dark:to-orange-950/30 dark:text-amber-50";
  }
  if (u === 2) {
    return "border-rose-400/90 bg-gradient-to-r from-rose-50/98 via-orange-50/90 to-amber-50/80 text-rose-950 shadow-md shadow-rose-200/40 dark:border-rose-700/55 dark:from-rose-950/45 dark:via-zinc-950 dark:to-orange-950/35 dark:text-rose-50";
  }
  return "border-rose-600/95 bg-gradient-to-r from-rose-100 via-rose-50 to-orange-50 text-rose-950 shadow-lg shadow-rose-300/50 ring-2 ring-rose-400/30 dark:border-rose-600 dark:from-rose-950/70 dark:via-zinc-950 dark:to-red-950/40 dark:text-rose-50 dark:ring-rose-500/25";
}

function animationClass(urgency: TimeBandIntervention["urgency"]): string {
  if (urgency === 0) return "";
  if (urgency === 1) return "time-band-intervention--1";
  if (urgency === 2) return "time-band-intervention--2";
  return "time-band-intervention--3";
}

/**
 * 홈 상단 고정 — 시간대마다 문구·톤이 강해짐. 운동 완료 시 비표시.
 */
export function TimeBandInterventionBar({ hydrated, todayWorkoutComplete, primaryCtaHref = "/workout" }: Props) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const intervention = useMemo(
    () => getTimeBandIntervention({ now: new Date(), hydrated, todayWorkoutComplete }),
    [hydrated, todayWorkoutComplete, tick],
  );

  if (!hydrated) {
    return (
      <div className="mb-2 h-11 w-full animate-pulse rounded-lg bg-neutral-200/80 dark:bg-zinc-800" aria-hidden />
    );
  }

  if (!intervention) return null;

  return (
    <div
      className={`mb-2 rounded-xl border px-3 py-2.5 sm:px-4 sm:py-3 ${shellClass(intervention)} ${animationClass(intervention.urgency)}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-time-band={intervention.band}
      data-urgency={intervention.urgency}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] opacity-80">AI 개입 · {intervention.label}</p>
          <p className="mt-0.5 text-[0.95rem] font-bold leading-snug tracking-[-0.02em] sm:text-[1.02rem]">{intervention.message}</p>
        </div>
        <Link
          href={primaryCtaHref}
          className={`inline-flex min-h-[48px] shrink-0 items-center justify-center rounded-xl px-5 py-3 text-center text-[13px] font-extrabold tracking-[-0.02em] transition active:scale-[0.98] sm:min-h-[52px] sm:min-w-[10.5rem] sm:px-6 sm:text-[14px] ${
            intervention.urgency >= 2
              ? "bg-rose-700 text-white shadow-md hover:bg-rose-800 dark:bg-rose-600 dark:hover:bg-rose-500"
              : intervention.urgency === 1
                ? "bg-amber-600 text-white shadow hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400"
                : "bg-indigo-700 text-white shadow hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          }`}
        >
          운동 시작하기
        </Link>
      </div>
    </div>
  );
}
