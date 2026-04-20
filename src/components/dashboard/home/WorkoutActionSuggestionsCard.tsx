"use client";

import type { WorkoutActionSuggestion } from "@/lib/dashboard/workout-action-suggestions";
import Link from "next/link";

const shell =
  "rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-sm ring-1 ring-black/[0.03] sm:p-5 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-white/[0.04]";

type Props = {
  suggestions: WorkoutActionSuggestion[];
  hydrated: boolean;
  hasAnyWorkoutRow: boolean;
};

export function WorkoutActionSuggestionsCard({ suggestions, hydrated, hasAnyWorkoutRow }: Props) {
  return (
    <section className={shell} aria-labelledby="action-suggestions-heading">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="action-suggestions-heading" className="text-[10px] font-bold uppercase tracking-[0.2em] text-apple-subtle">
            오늘 할 일 제안
          </h2>
          <p className="mt-1 text-[13px] font-semibold text-apple-ink dark:text-zinc-100">막힘 → 바로 해볼 것</p>
        </div>
        <p className="max-w-[220px] text-right text-[10px] font-medium leading-snug text-apple-subtle">
          분석은 분석, 손은 이미 운동복에 가 있어야 해요.
        </p>
      </div>

      {!hydrated ? (
        <div className="mt-4 space-y-3 animate-pulse" aria-hidden>
          <div className="h-24 rounded-xl bg-neutral-100 dark:bg-zinc-900" />
          <div className="h-24 rounded-xl bg-neutral-100 dark:bg-zinc-900" />
        </div>
      ) : suggestions.length === 0 ? (
        <p className="mt-4 text-[13px] leading-relaxed text-apple-subtle">
          {!hasAnyWorkoutRow
            ? "기록이 좀 쌓이면 정체 종목이랑 부족한 부위를 짚어서, 뭐 바꿔볼지 콕 집어 줄게요."
            : "지금 데이터로는 딱히 막힌 느낌이 안 나요. 조금만 더 쌓이면 여기서 바로 액션 뽑아줄게요."}
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-4" role="list">
          {suggestions.map((s) => (
            <li key={s.id}>
              <article
                className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-50/40 dark:border-zinc-800 dark:bg-zinc-900/40"
                aria-label={`${s.problemTitle}에서 ${s.solutionTitle}로 이어지는 제안`}
              >
                <div className="grid gap-0 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
                  <div className="border-b border-amber-200/80 bg-gradient-to-br from-amber-50/95 to-orange-50/40 p-4 sm:border-b-0 sm:border-r dark:border-amber-900/35 dark:from-amber-950/40 dark:to-orange-950/20">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-amber-800/90 dark:text-amber-300/90">막힘</p>
                    <h3 className="mt-1.5 font-display text-[1.05rem] font-bold leading-snug text-amber-950 dark:text-amber-50">{s.problemTitle}</h3>
                    <p className="mt-2 text-[12px] font-medium leading-relaxed text-amber-950/85 dark:text-amber-100/90">{s.problemSummary}</p>
                  </div>

                  <div
                    className="flex items-center justify-center border-b border-neutral-200/70 bg-white/60 px-2 py-2 text-lg font-bold text-apple-subtle sm:border-b-0 sm:border-r sm:border-neutral-200/70 dark:border-zinc-800 dark:bg-zinc-950/50"
                    aria-hidden
                  >
                    →
                  </div>

                  <div className="border-t border-emerald-200/70 bg-gradient-to-br from-emerald-50/90 to-teal-50/35 p-4 dark:border-emerald-900/30 dark:from-emerald-950/35 dark:to-teal-950/20 sm:border-t-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-800/90 dark:text-emerald-300/90">이렇게 가자</p>
                    <h3 className="mt-1.5 font-display text-[1.05rem] font-bold leading-snug text-emerald-950 dark:text-emerald-50">{s.solutionTitle}</h3>
                    <p className="mt-2 text-[12px] font-semibold leading-relaxed text-emerald-950/90 dark:text-emerald-100/90">{s.solutionBody}</p>
                  </div>
                </div>

                <div className="border-t border-neutral-200/80 bg-white/95 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/80">
                  <p className="text-[11px] leading-relaxed text-apple-subtle">{s.reasonDetail}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={s.primaryHref}
                      className="inline-flex min-h-[42px] flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 text-[13px] font-bold text-white shadow-sm ring-2 ring-emerald-400/25 transition hover:opacity-95 sm:flex-none"
                    >
                      {s.primaryLabel}
                    </Link>
                    <Link
                      href={s.secondaryHref}
                      className="inline-flex min-h-[42px] items-center justify-center rounded-xl border-2 border-emerald-300/80 bg-white px-4 text-[13px] font-bold text-emerald-900 dark:border-emerald-800 dark:bg-zinc-900 dark:text-emerald-200"
                    >
                      {s.secondaryLabel}
                    </Link>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
