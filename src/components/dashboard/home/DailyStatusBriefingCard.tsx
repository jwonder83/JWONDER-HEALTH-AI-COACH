"use client";

import type { DailyStatusBriefing, FatigueLevel } from "@/lib/dashboard/daily-status-briefing";
import Link from "next/link";

const shell =
  "rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/95 via-white to-indigo-50/60 p-4 shadow-md ring-1 ring-violet-500/[0.06] sm:p-5 dark:border-violet-900/45 dark:from-violet-950/35 dark:via-zinc-950 dark:to-indigo-950/30 dark:ring-white/[0.05]";

function fatigueLabel(level: FatigueLevel): string {
  if (level === "high") return "높음";
  if (level === "medium") return "중간";
  return "낮음";
}

function fatigueBarClass(level: FatigueLevel): string {
  if (level === "high") return "from-rose-500 to-orange-500";
  if (level === "medium") return "from-amber-400 to-amber-600";
  return "from-emerald-400 to-teal-500";
}

function fatigueTextClass(level: FatigueLevel): string {
  if (level === "high") return "text-rose-700 dark:text-rose-300";
  if (level === "medium") return "text-amber-800 dark:text-amber-300";
  return "text-emerald-800 dark:text-emerald-300";
}

type Props = {
  briefing: DailyStatusBriefing | null;
  hydrated: boolean;
};

export function DailyStatusBriefingCard({ briefing, hydrated }: Props) {
  return (
    <section className={shell} aria-labelledby="daily-briefing-heading" aria-busy={!hydrated}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="daily-briefing-heading" className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-700/90 dark:text-violet-300/90">
            오늘 컨디션 브리핑
          </h2>
          <p className="mt-1 text-[11px] font-medium text-apple-subtle">숫자 → 해석 → 오늘 뭐 할지</p>
        </div>
        {!hydrated || !briefing ? null : (
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${fatigueTextClass(briefing.fatigue)} border-current/25 bg-white/80 dark:bg-zinc-900/60`}
          >
            피로 {fatigueLabel(briefing.fatigue)}
          </span>
        )}
      </div>

      {!hydrated ? (
        <div className="mt-4 space-y-3 animate-pulse" aria-hidden>
          <div className="h-2 rounded-full bg-violet-200/60 dark:bg-violet-900/40" />
          <div className="h-16 rounded-xl bg-violet-100/80 dark:bg-violet-950/40" />
          <div className="h-2 rounded-full bg-indigo-200/50 dark:bg-indigo-900/40" />
        </div>
      ) : !briefing ? null : (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-wide text-apple-subtle">피로도</p>
                <p className={`text-[12px] font-bold tabular-nums ${fatigueTextClass(briefing.fatigue)}`}>
                  {briefing.fatigueScore}
                  <span className="text-[10px] font-semibold text-apple-subtle">/100</span>
                </p>
              </div>
              <div
                className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]"
                role="meter"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={briefing.fatigueScore}
                aria-label={`피로도 게이지 ${briefing.fatigueScore}점`}
              >
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${fatigueBarClass(briefing.fatigue)} transition-[width] duration-500 ease-out`}
                  style={{ width: `${briefing.fatigueScore}%` }}
                />
              </div>
              <div className="mt-2 flex gap-1" aria-hidden>
                {(["low", "medium", "high"] as const).map((lvl) => (
                  <span
                    key={lvl}
                    className={`h-1 flex-1 rounded-full ${
                      briefing.fatigue === lvl
                        ? lvl === "high"
                          ? "bg-rose-500"
                          : lvl === "medium"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        : "bg-neutral-200 dark:bg-zinc-800"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-bold uppercase tracking-wide text-apple-subtle">추천 강도</p>
                <p className="text-[12px] font-bold tabular-nums text-indigo-800 dark:text-indigo-200">
                  {briefing.recommendedIntensityPercent}%
                </p>
              </div>
              <div
                className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]"
                role="meter"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={briefing.recommendedIntensityPercent}
                aria-label={`추천 운동 강도 ${briefing.recommendedIntensityPercent}퍼센트`}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-500 ease-out"
                  style={{ width: `${briefing.recommendedIntensityPercent}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] leading-snug text-apple-subtle">
                중량·횟수는 평소의 {briefing.recommendedIntensityPercent}% 느낌으로만 맞춰도 충분해요.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-violet-200/70 bg-white/90 px-3.5 py-3 dark:border-violet-900/40 dark:bg-zinc-900/50">
            <p className="text-[10px] font-bold uppercase tracking-wide text-violet-700/80 dark:text-violet-300/80">코치 한 줄</p>
            <p className="mt-1.5 text-[13px] font-semibold leading-relaxed text-apple-ink dark:text-zinc-100" aria-live="polite">
              {briefing.aiMessage}
            </p>
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-apple-subtle">{briefing.reasonLine}</p>

          <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold text-apple-subtle">
            <span className="rounded-lg border border-neutral-200/90 bg-white/80 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900/60">
              7일 세트 {briefing.metrics.sessionRowsLast7}개
            </span>
            <span className="rounded-lg border border-neutral-200/90 bg-white/80 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900/60">
              활동 {briefing.metrics.activeDaysLast7}일 / 휴식 {briefing.metrics.restDaysLast7}일
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/workout"
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-[13px] font-bold text-white shadow-md shadow-violet-500/25 ring-2 ring-violet-400/30 transition hover:opacity-95 active:scale-[0.99] sm:flex-none"
            >
              이 강도로 가볼래
            </Link>
            <Link
              href="/program"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border-2 border-violet-300/80 bg-white/90 px-4 text-[13px] font-bold text-violet-900 dark:border-violet-700 dark:bg-zinc-900/70 dark:text-violet-200"
            >
              프로그램 훑기
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
