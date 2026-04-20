"use client";

import { useMemo } from "react";
import type { RoutineAdjustment } from "@/lib/routine/today-routine-plan";

type Props = {
  adjustments?: RoutineAdjustment[];
  className?: string;
};

/** 패턴 분석 기반 자동 개입 — 문제 + 해결을 한 블록으로 표시 */
export function BehaviorInterventionBanner({ adjustments, className = "" }: Props) {
  const rows = useMemo(
    () => adjustments?.filter((a) => a.problemLine && a.solutionLine) ?? [],
    [adjustments],
  );

  if (rows.length === 0) return null;

  return (
    <section
      className={`rounded-2xl border border-amber-200/90 bg-gradient-to-b from-amber-50/95 to-white px-4 py-3 shadow-sm dark:border-amber-900/50 dark:from-amber-950/35 dark:to-zinc-950 sm:px-5 sm:py-4 ${className}`.trim()}
      aria-label="행동 패턴 자동 개입"
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-800/90 dark:text-amber-200/90">
        패턴 분석 · 자동 개입
      </p>
      <ul className="mt-2 flex flex-col gap-3">
        {rows.map((a, i) => (
          <li key={`${a.type}-${i}`} className="text-[13px] leading-relaxed tracking-[-0.02em] text-apple-ink dark:text-zinc-100">
            <span className="block text-apple-ink/95 dark:text-zinc-200">{a.problemLine}</span>
            <span className="mt-1.5 block font-semibold text-emerald-800 dark:text-emerald-300">→ {a.solutionLine}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
