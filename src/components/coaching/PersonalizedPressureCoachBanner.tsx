"use client";

import type { PersonalizedPressureMessage } from "@/lib/coaching/personalized-pressure-message";
import Link from "next/link";

type Props = {
  pressure: PersonalizedPressureMessage;
};

/** 히스토리 기반으로 살짝 독촉하는 배너 */
export function PersonalizedPressureCoachBanner({ pressure }: Props) {
  return (
    <div
      className="mb-8 rounded-2xl border-2 border-rose-500/80 bg-gradient-to-br from-rose-50 via-white to-amber-50/90 p-5 shadow-[0_12px_40px_-12px_rgba(244,63,94,0.35)] ring-2 ring-rose-400/25 dark:border-rose-600/70 dark:from-rose-950/50 dark:via-zinc-950 dark:to-amber-950/25 dark:ring-rose-500/20 sm:p-6"
      role="region"
      aria-label="개인화 압박 코치 메시지"
    >
      <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-rose-800/90 dark:text-rose-200/90">지난 기록 기준</p>
      <p className="mt-3 text-[15px] font-bold leading-relaxed text-rose-950 dark:text-rose-50 sm:text-[16px]">{pressure.pastLine}</p>
      <p className="mt-3 text-[14px] font-semibold leading-relaxed text-apple-ink dark:text-zinc-200">{pressure.presentLine}</p>
      <p className="mt-3 text-[16px] font-extrabold leading-snug tracking-[-0.02em] text-rose-800 dark:text-rose-100 sm:text-[17px]">{pressure.actionLine}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/workout"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-rose-700 px-5 text-[13px] font-bold text-white shadow-md transition hover:bg-rose-800 dark:bg-rose-600 dark:hover:bg-rose-500"
        >
          지금 진행하기
        </Link>
        <Link
          href="#section-input"
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl border-2 border-rose-400/70 bg-white/90 px-5 text-[13px] font-bold text-rose-900 transition hover:bg-rose-50 dark:border-rose-600 dark:bg-zinc-900 dark:text-rose-100 dark:hover:bg-zinc-800"
        >
          홈에서 세트 남기기
        </Link>
      </div>
    </div>
  );
}
