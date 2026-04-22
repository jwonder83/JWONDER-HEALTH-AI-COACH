"use client";

import type { AiPresenceModel } from "@/lib/dashboard/ai-presence-track";
import Link from "next/link";

type Props = {
  model: AiPresenceModel | null;
  hydrated: boolean;
  /** 주간 목표 대비 0–100 */
  weekProgressPercent: number | null;
};

function milestoneClass(streak: number, n: number): string {
  const unlocked = streak >= n;
  if (unlocked) {
    return "border-emerald-500/70 bg-emerald-50 text-emerald-900 dark:border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-100";
  }
  return "border-neutral-200 bg-white/80 text-apple-subtle dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500";
}

export function AiPresenceStickyBar({ model, hydrated, weekProgressPercent }: Props) {
  if (!hydrated) {
    return (
      <div className="flex items-center gap-3 py-1" aria-busy="true">
        <div className="h-2 flex-1 animate-pulse rounded-full bg-neutral-200 dark:bg-zinc-800" />
        <div className="h-8 w-24 shrink-0 animate-pulse rounded-lg bg-neutral-200 dark:bg-zinc-800" />
      </div>
    );
  }

  if (!model) return null;

  const shell =
    model.tone === "warning"
      ? "border-rose-200/90 bg-gradient-to-r from-rose-50/95 via-white to-orange-50/80 dark:border-rose-900/50 dark:from-rose-950/40 dark:via-zinc-950 dark:to-orange-950/25"
      : model.tone === "success"
        ? "border-emerald-200/90 bg-gradient-to-r from-emerald-50/95 via-white to-teal-50/75 dark:border-emerald-900/45 dark:from-emerald-950/35 dark:via-zinc-950 dark:to-teal-950/25"
        : "border-violet-200/80 bg-gradient-to-r from-violet-50/90 via-white to-indigo-50/70 dark:border-violet-900/45 dark:from-violet-950/30 dark:via-zinc-950 dark:to-indigo-950/25";

  const p = weekProgressPercent ?? 0;

  return (
    <div
      className={`rounded-xl border px-3 py-2.5 shadow-sm sm:px-4 sm:py-3 ${shell}`}
      role="region"
      aria-label="AI 상태 추적"
      data-ai-presence-tone={model.tone}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-apple-subtle dark:text-zinc-500">AI 추적</p>
          <p className="font-display mt-0.5 text-[0.95rem] font-bold leading-tight tracking-[-0.02em] text-apple-ink dark:text-zinc-100 sm:text-[1.05rem]">
            {model.headline}
          </p>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[12px] font-semibold text-apple-ink dark:text-zinc-200">
            {model.weeklyLine ? <span className="tabular-nums">{model.weeklyLine}</span> : null}
            {model.weeklyRemainLine ? (
              <span className="text-apple-subtle dark:text-zinc-400">· {model.weeklyRemainLine}</span>
            ) : null}
          </div>
          {weekProgressPercent !== null ? (
            <div className="mt-2 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-neutral-200 dark:bg-zinc-800" role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100}>
              <div
                className={`h-full rounded-full transition-[width] duration-700 ease-out ${
                  model.tone === "warning" ? "bg-rose-600 dark:bg-rose-500" : model.tone === "success" ? "bg-emerald-600 dark:bg-emerald-500" : "bg-violet-600 dark:bg-violet-500"
                }`}
                style={{ width: `${p}%` }}
              />
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:max-w-[13rem] sm:items-end">
          <div className="flex items-center justify-end gap-1">
            {([3, 7, 30] as const).map((n) => (
              <span
                key={n}
                className={`flex size-7 items-center justify-center rounded-full border text-[9px] font-extrabold tabular-nums ${milestoneClass(model.streakDays, n)}`}
                title={`연속 ${n}일`}
              >
                {n}
              </span>
            ))}
          </div>
          <Link
            href="/workout"
            className="inline-flex min-h-[36px] items-center justify-center rounded-lg border border-black bg-black px-3 text-[12px] font-bold text-white transition hover:bg-neutral-800 dark:border-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            운동
          </Link>
        </div>
      </div>
      <p
        className={`mt-2 border-t border-black/[0.06] pt-2 text-[12px] font-medium leading-snug dark:border-white/10 sm:text-[13px] ${
          model.tone === "warning"
            ? "text-rose-900 dark:text-rose-100"
            : model.tone === "success"
              ? "text-emerald-900 dark:text-emerald-100"
              : "text-apple-subtle dark:text-zinc-400"
        }`}
      >
        {model.coachLine}
      </p>
    </div>
  );
}
