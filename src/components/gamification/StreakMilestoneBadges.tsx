"use client";

import { getNextMilestoneRemaining, getStreakMilestoneBadges } from "@/lib/workouts/streak-engagement";
import type { SiteStreakMilestoneBadgesCopy } from "@/types/site-home-hub-copy";

type Props = {
  streakDays: number;
  hydrated: boolean;
  copy: SiteStreakMilestoneBadgesCopy;
};

const ring = {
  locked: "border-neutral-200 bg-neutral-50 text-apple-subtle dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500",
  bronze: "border-amber-300/80 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-950 shadow-sm dark:border-amber-700/60 dark:from-amber-950/50 dark:to-amber-900/30 dark:text-amber-100",
  silver: "border-slate-300/90 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 shadow-sm dark:border-slate-600 dark:from-slate-900 dark:to-slate-800 dark:text-slate-100",
  gold: "border-yellow-400/90 bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 text-amber-950 shadow-md dark:border-amber-500/50 dark:from-amber-950/60 dark:to-yellow-900/40 dark:text-amber-50",
};

function tierClass(days: number, unlocked: boolean): string {
  if (!unlocked) return ring.locked;
  if (days >= 30) return ring.gold;
  if (days >= 7) return ring.silver;
  return ring.bronze;
}

export function StreakMilestoneBadges({ streakDays, hydrated, copy }: Props) {
  if (!hydrated) return null;
  const badges = getStreakMilestoneBadges(streakDays);
  const next = getNextMilestoneRemaining(streakDays);

  return (
    <div className="mt-4 border-t border-neutral-100 pt-4 dark:border-zinc-800">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-apple-subtle dark:text-zinc-500">{copy.titleEyebrow}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {badges.map((b) => (
          <div
            key={b.days}
            className={`flex min-w-[4.5rem] flex-col items-center rounded-xl border px-2.5 py-2 transition ${tierClass(b.days, b.unlocked)}`}
          >
            <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">{copy.streakWord}</span>
            <span className="font-display text-lg font-bold tabular-nums">{b.label}</span>
            {b.unlocked ? (
              <span className="mt-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">{copy.unlocked}</span>
            ) : (
              <span className="mt-0.5 text-[9px] opacity-70">{copy.locked}</span>
            )}
          </div>
        ))}
      </div>
      {next ? (
        <p className="mt-2 text-[12px] font-medium text-apple-subtle dark:text-zinc-400">
          {copy.nextBadgeTemplate.replace("{next}", String(next.next)).replace("{remaining}", String(next.remaining))}
        </p>
      ) : streakDays >= 30 ? (
        <p className="mt-2 text-[12px] font-semibold text-amber-800 dark:text-amber-200">{copy.fullComboLine}</p>
      ) : null}
    </div>
  );
}
