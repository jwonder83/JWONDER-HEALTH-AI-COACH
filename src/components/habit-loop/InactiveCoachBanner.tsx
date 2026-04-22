"use client";

import Link from "next/link";

type Props = {
  daysSinceLast: number;
};

/** `StreakRiskBanner`와 동일한 리듬의 앰버·링·CTA */
export function InactiveCoachBanner({ daysSinceLast }: Props) {
  return (
    <aside
      role="status"
      aria-live="polite"
      className="rounded-2xl border-2 border-amber-400/60 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 px-4 py-3 shadow-md ring-2 ring-amber-300/30 dark:border-amber-600/70 dark:from-amber-950/60 dark:via-orange-950/40 dark:to-amber-950/50 dark:ring-amber-700/30 sm:px-5 sm:py-4"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-900/80 dark:text-amber-200/90">비활성 개입</p>
      <p className="mt-1 text-[15px] font-semibold leading-snug text-amber-950 dark:text-amber-50">
        <span className="tabular-nums">{daysSinceLast}일</span> 동안 운동 기록이 없어요.
      </p>
      <p className="mt-1 text-[13px] font-medium leading-snug text-amber-900/85 dark:text-amber-100/85">오늘은 가볍게 다시 시작하세요.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href="/workout"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-amber-600 px-4 text-[13px] font-bold text-white transition hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-400"
        >
          빠른 루틴 시작
        </Link>
        <Link
          href="/program"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl border-2 border-amber-700/35 bg-white/95 px-4 text-[13px] font-bold text-amber-950 transition hover:bg-amber-50 dark:border-amber-500/45 dark:bg-zinc-900/80 dark:text-amber-100 dark:hover:bg-amber-950/30"
        >
          프로그램 보기
        </Link>
      </div>
    </aside>
  );
}
