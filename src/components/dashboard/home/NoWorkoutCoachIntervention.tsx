"use client";

import Link from "next/link";

type Props = {
  /** 오늘 루틴 예상 시간 라벨 (예: 약 40–55분) */
  estimatedDurationLabel: string;
  routineTitle: string;
};

/**
 * 오늘 운동 미완료일 때만 표시 — 능동 코치 톤으로 빠른 행동 유도.
 * 완료 시 HomeActionHub에서 렌더하지 않음.
 */
export function NoWorkoutCoachIntervention({ estimatedDurationLabel, routineTitle }: Props) {
  return (
    <section
      className="rounded-2xl border-2 border-amber-600/75 bg-gradient-to-br from-amber-50 via-amber-50/95 to-orange-50/90 p-4 shadow-[0_12px_40px_-12px_rgba(245,158,11,0.35)] ring-2 ring-amber-400/30 sm:p-5 dark:border-amber-500/55 dark:from-amber-950/50 dark:via-zinc-900 dark:to-zinc-950 dark:ring-amber-500/25"
      aria-labelledby="no-workout-intervention-heading"
      aria-live="polite"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-900/85 dark:text-amber-200/90">오늘 플래그</p>
      <h2 id="no-workout-intervention-heading" className="font-display mt-2 text-[1.2rem] font-bold leading-tight text-amber-950 dark:text-amber-50 sm:text-[1.35rem]">
        오늘 세션 아직 안 박았죠?
      </h2>
      <p className="mt-2 text-[14px] font-medium leading-relaxed text-amber-950/90 dark:text-amber-50/95 sm:text-[15px]">
        오늘 픽은 「{routineTitle}」·대충 {estimatedDurationLabel} 느낌이에요. 20분만 투자해도 분위기 달라져요.
      </p>
      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-3">
        <Link
          href="/workout"
          className="inline-flex min-h-[54px] w-full flex-1 items-center justify-center rounded-xl border-2 border-amber-950 bg-amber-950 px-5 text-[16px] font-bold text-white shadow-lg transition hover:bg-amber-900 hover:shadow-xl active:scale-[0.99] dark:border-amber-300 dark:bg-amber-400 dark:text-amber-950 dark:hover:bg-amber-300 sm:min-h-[58px] sm:max-w-md sm:text-[17px]"
        >
          바로 루틴 가기
        </Link>
        <Link
          href="/program"
          className="inline-flex min-h-[50px] w-full items-center justify-center rounded-xl border-2 border-amber-800/40 bg-white/90 px-5 text-[13px] font-bold uppercase tracking-[0.1em] text-amber-950 transition hover:border-amber-950 hover:bg-white dark:border-amber-400/50 dark:bg-zinc-900/80 dark:text-amber-100 dark:hover:border-amber-300 sm:w-auto sm:min-w-[12rem]"
        >
          가벼운 추천 보기
        </Link>
      </div>
    </section>
  );
}
