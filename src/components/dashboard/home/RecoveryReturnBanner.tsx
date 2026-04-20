"use client";

import Link from "next/link";

/** 어제 공백 후 복귀일 — 난이도·부담을 낮추고 다시 이어가도록 유도 */
export function RecoveryReturnBanner() {
  return (
    <div
      role="status"
      className="rounded-2xl border border-teal-300/80 bg-gradient-to-br from-teal-50/95 via-white to-cyan-50/90 px-4 py-3 shadow-sm dark:border-teal-800/60 dark:from-teal-950/40 dark:via-zinc-950 dark:to-cyan-950/30 sm:px-5 sm:py-4"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-800/90 dark:text-teal-300/90">회복 중심</p>
      <p className="mt-1.5 text-[14px] font-semibold leading-snug text-teal-950 dark:text-teal-50">
        어제 운동을 놓쳤습니다.
        <span className="mt-1 block font-bold text-teal-800 dark:text-teal-200">→ 오늘은 가벼운 루틴으로 다시 시작하세요.</span>
      </p>
      <p className="mt-2 text-[12px] leading-relaxed text-teal-900/85 dark:text-teal-100/80">
        플랜 예상 시간이 자동으로 줄었어요. 한 세트만 남겨도 연속 흐름은 이어져요.
      </p>
      <Link
        href="/workout"
        className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-teal-600 text-[13px] font-bold text-white transition hover:bg-teal-500 dark:bg-teal-500 dark:hover:bg-teal-400 sm:w-auto sm:px-6"
      >
        운동 화면으로
      </Link>
    </div>
  );
}
