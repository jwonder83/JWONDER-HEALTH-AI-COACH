"use client";

import type { FailureReboundModel } from "@/lib/habit-loop/failure-rebound";
import {
  getStreakStrictModeEnabled,
  setStreakStrictModeEnabled,
} from "@/lib/workouts/streak";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Props = {
  rebound: FailureReboundModel | null;
};

/** 어제 공백 후 복귀일 — 난이도·부담을 낮추고 다시 이어가도록 유도 */
export function RecoveryReturnBanner({ rebound }: Props) {
  const [strict, setStrict] = useState(false);

  useEffect(() => {
    setStrict(getStreakStrictModeEnabled());
  }, []);

  const toggleStrict = useCallback(() => {
    const next = !getStreakStrictModeEnabled();
    setStreakStrictModeEnabled(next);
    setStrict(next);
  }, []);

  const headline = rebound?.headlineLine ?? "어제 운동을 놓쳤습니다.";
  const action = rebound?.actionLine ?? "→ 오늘은 가벼운 루틴으로 조정했습니다.";
  const detail =
    rebound?.detailLine ??
    "플랜 예상 시간이 자동으로 줄었어요. 한 세트만 남겨도 연속 흐름은 이어져요.";

  return (
    <div
      role="status"
      className="rounded-2xl border border-teal-300/80 bg-gradient-to-br from-teal-50/95 via-white to-cyan-50/90 px-4 py-3 shadow-sm dark:border-teal-800/60 dark:from-teal-950/40 dark:via-zinc-950 dark:to-cyan-950/30 sm:px-5 sm:py-4"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-800/90 dark:text-teal-300/90">회복 중심 · 자동 난이도</p>
      <p className="mt-1.5 text-[14px] font-semibold leading-snug text-teal-950 dark:text-teal-50">
        {headline}
        <span className="mt-1 block font-bold text-teal-800 dark:text-teal-200">{action}</span>
      </p>
      <p className="mt-2 text-[12px] leading-relaxed text-teal-900/85 dark:text-teal-100/80">{detail}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/workout"
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-teal-600 text-[13px] font-bold text-white transition hover:bg-teal-500 dark:bg-teal-500 dark:hover:bg-teal-400 sm:w-auto sm:px-6"
        >
          운동 화면으로
        </Link>
        <button
          type="button"
          onClick={toggleStrict}
          className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-teal-400/70 bg-white/90 px-3 text-[11px] font-bold text-teal-900 transition hover:bg-teal-50 dark:border-teal-700 dark:bg-zinc-900/80 dark:text-teal-100 dark:hover:bg-zinc-800"
        >
          {strict ? "완화 모드로 (어제 빠져도 연속 이을 수 있음)" : "엄격 연속 (어제 공백이면 0일부터)"}
        </button>
      </div>
    </div>
  );
}
