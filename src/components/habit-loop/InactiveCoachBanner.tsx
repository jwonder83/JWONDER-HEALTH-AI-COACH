"use client";

import Link from "next/link";

type Props = {
  daysSinceLast: number;
};

export function InactiveCoachBanner({ daysSinceLast }: Props) {
  return (
    <aside
      className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-r from-amber-50 via-orange-50/90 to-rose-50 px-4 py-4 shadow-md sm:px-5 sm:py-4 dark:border-amber-600/45 dark:from-amber-950/50 dark:via-orange-950/35 dark:to-rose-950/35"
      role="status"
      aria-live="polite"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-900 dark:text-amber-200/90">비활성 개입</p>
      <p className="mt-2 font-display text-[1.1rem] font-bold tracking-[-0.02em] text-amber-950 dark:text-amber-50 sm:text-[1.2rem]">
        {daysSinceLast}일 동안 운동 기록이 없어요.
      </p>
      <p className="mt-1 text-[13px] font-semibold leading-snug text-amber-950/90 dark:text-amber-100/90">오늘은 가볍게 다시 시작하세요.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/workout"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-amber-700 px-5 text-[13px] font-bold text-white shadow transition hover:bg-amber-800 active:scale-[0.99] dark:bg-amber-600 dark:hover:bg-amber-500"
        >
          빠른 루틴 시작
        </Link>
        <Link
          href="/program"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl border-2 border-amber-800/30 bg-white/90 px-5 text-[13px] font-bold text-amber-950 dark:border-amber-400/40 dark:bg-zinc-900/80 dark:text-amber-100"
        >
          프로그램 보기
        </Link>
      </div>
    </aside>
  );
}
