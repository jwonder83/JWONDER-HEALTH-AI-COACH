"use client";

import type { AiManagedLoopSnapshot } from "@/lib/habit-loop/ai-managed-loop";
import Link from "next/link";

type Props = {
  loop: AiManagedLoopSnapshot;
};

function stepDotClass(i: number, current: number, timeBandOnStep2: boolean): string {
  const done = i < current;
  const cur = i === current;
  const base = "size-2.5 rounded-full border transition sm:size-3";
  if (done) return `${base} border-emerald-500 bg-emerald-500 dark:border-emerald-400 dark:bg-emerald-400`;
  if (cur) {
    if (i === 2 && timeBandOnStep2) return `${base} border-rose-500 bg-rose-500 shadow-[0_0_0_3px_rgba(244,63,94,0.25)] dark:border-rose-400 dark:bg-rose-400`;
    return `${base} border-violet-600 bg-violet-600 shadow-[0_0_0_3px_rgba(124,58,237,0.2)] dark:border-violet-400 dark:bg-violet-400`;
  }
  return `${base} border-neutral-300 bg-white dark:border-zinc-600 dark:bg-zinc-800`;
}

/**
 * 홈 상단 — AI가 끝까지 이어주는 하루 루프(단계 + 다음 행동).
 */
export function AiManagedLoopRibbon({ loop }: Props) {
  const { steps, stepIndex, headline, nextActionLabel, nextActionHref, timeBandNudge, phase } = loop;

  return (
    <div
      className="mb-2 rounded-xl border border-violet-200/80 bg-gradient-to-r from-violet-50/95 via-white to-indigo-50/75 px-3 py-2.5 shadow-sm dark:border-violet-900/45 dark:from-violet-950/35 dark:via-zinc-950 dark:to-indigo-950/25"
      role="region"
      aria-label="AI 관리 루프"
      data-ai-loop-phase={phase}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-violet-800/90 dark:text-violet-200/90">AI 루프</p>
        <span className="hidden text-[10px] text-apple-subtle sm:inline dark:text-zinc-500">끊김 없이 다음 행동</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2" aria-hidden={phase === "hydrating"}>
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-1.5 sm:gap-2">
            <span
              className={stepDotClass(i, stepIndex, timeBandNudge && stepIndex === 2)}
              title={s.label}
              aria-label={`${s.label}${i === stepIndex ? " 현재" : i < stepIndex ? " 완료" : ""}`}
            />
            <span
              className={`hidden text-[10px] font-bold sm:inline ${i === stepIndex ? "text-violet-950 dark:text-violet-100" : "text-apple-subtle dark:text-zinc-500"}`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 ? <span className="hidden text-apple-subtle sm:inline dark:text-zinc-600">→</span> : null}
          </div>
        ))}
      </div>
      <p className="mt-2 text-[0.92rem] font-bold leading-snug tracking-[-0.02em] text-apple-ink dark:text-zinc-50 sm:text-[0.98rem]">{headline}</p>
      <div className="mt-2 flex flex-col gap-2 border-t border-violet-200/50 pt-2 dark:border-violet-800/40 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] font-semibold leading-snug text-violet-950/90 dark:text-violet-100/95">
          <span className="mr-1 text-[10px] font-extrabold uppercase tracking-wide text-violet-700/80 dark:text-violet-300/80">다음</span>
          {nextActionLabel}
        </p>
        {nextActionHref !== "#" ? (
          <Link
            href={nextActionHref}
            className="inline-flex min-h-[40px] shrink-0 items-center justify-center rounded-lg border border-violet-700 bg-violet-700 px-4 text-center text-[12px] font-extrabold text-white transition hover:bg-violet-800 active:scale-[0.98] dark:border-violet-500 dark:bg-violet-600 dark:hover:bg-violet-500"
          >
            이동
          </Link>
        ) : null}
      </div>
    </div>
  );
}
