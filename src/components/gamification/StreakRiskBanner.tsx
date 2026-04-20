"use client";

import Link from "next/link";

type Props = {
  streakDays: number;
  /** 저녁·오늘 미기록 시 표시 */
  visible: boolean;
};

/** 연속 기록이 오늘 안에 끊길 수 있을 때 강조 배너 */
export function StreakRiskBanner({ streakDays, visible }: Props) {
  if (!visible || streakDays < 1) return null;

  return (
    <div
      role="status"
      className="rounded-2xl border-2 border-amber-400/60 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 px-4 py-3 shadow-md ring-2 ring-amber-300/30 dark:border-amber-600/70 dark:from-amber-950/60 dark:via-orange-950/40 dark:to-amber-950/50 dark:ring-amber-700/30"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-900/80 dark:text-amber-200/90">연속 기록</p>
      <p className="mt-1 text-[15px] font-semibold leading-snug text-amber-950 dark:text-amber-50">
        오늘 기록이 없으면 내일부터 <span className="tabular-nums">{streakDays}일</span> 연속이 끊길 수 있어요.
      </p>
      <p className="mt-1 text-[13px] text-amber-900/85 dark:text-amber-100/85">한 세트만 남겨도 다시 이어져요.</p>
      <Link
        href="/workout"
        className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-amber-600 px-4 text-[13px] font-bold text-white transition hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-400"
      >
        지금 운동 시작
      </Link>
    </div>
  );
}
