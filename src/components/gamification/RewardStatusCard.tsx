"use client";

import { computeLevelProgress } from "@/lib/gamification/xp-level";
import { loadRewardProfile } from "@/lib/gamification/reward-storage";
import { STREAK_MILESTONE_DAYS } from "@/lib/workouts/streak-engagement";
import { computeLoggingStreakMerged } from "@/lib/workouts/streak";
import type { WorkoutRow } from "@/types/workout";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type LastXpFloat = { gained: number; leveledUp: boolean };

type Props = {
  userId: string;
  workouts: WorkoutRow[];
  hydrated: boolean;
  lastXpFloat?: LastXpFloat | null;
};

export function RewardStatusCard({ userId, workouts, hydrated, lastXpFloat }: Props) {
  const [totalXp, setTotalXp] = useState(0);
  const [milestoneFlash, setMilestoneFlash] = useState(false);
  const prevStreakRef = useRef<number | null>(null);

  const reload = useCallback(() => {
    if (!userId) return;
    setTotalXp(loadRewardProfile(userId).totalXp);
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    function onReward() {
      reload();
    }
    window.addEventListener("jws-reward-changed", onReward);
    return () => window.removeEventListener("jws-reward-changed", onReward);
  }, [reload]);

  const streak = useMemo(() => (hydrated ? computeLoggingStreakMerged(workouts, new Date()) : 0), [workouts, hydrated]);
  const level = useMemo(() => computeLevelProgress(totalXp), [totalXp]);

  useEffect(() => {
    if (!hydrated) return;
    const prev = prevStreakRef.current;
    prevStreakRef.current = streak;
    if (prev === null) return;
    const crossed = STREAK_MILESTONE_DAYS.some((d) => prev < d && streak >= d);
    if (crossed) {
      setMilestoneFlash(true);
      const t = window.setTimeout(() => setMilestoneFlash(false), 900);
      return () => window.clearTimeout(t);
    }
  }, [streak, hydrated]);

  const floatKey = lastXpFloat ? `${lastXpFloat.gained}-${lastXpFloat.leveledUp}` : "none";

  return (
    <section
      className={`relative mt-6 overflow-hidden rounded-2xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/15 via-white to-violet-500/10 p-4 shadow-[0_20px_50px_-18px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/20 sm:p-6 dark:border-amber-600/40 dark:from-amber-950/50 dark:via-zinc-950 dark:to-violet-950/30 dark:ring-amber-900/30 ${
        lastXpFloat?.leveledUp ? "motion-safe:animate-[reward-card-glow_1.1s_ease-out_1]" : ""
      } ${milestoneFlash ? "motion-safe:animate-[reward-badge-burst_0.85s_ease-out_1]" : ""}`}
      aria-label="보상 · 레벨 · 뱃지"
    >
      <style jsx global>{`
        @keyframes reward-card-glow {
          0% {
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.45);
          }
          70% {
            box-shadow: 0 0 0 14px rgba(245, 158, 11, 0);
          }
          100% {
            box-shadow: 0 20px 50px -18px rgba(245, 158, 11, 0.35);
          }
        }
        @keyframes reward-badge-burst {
          0% {
            transform: scale(0.99);
          }
          40% {
            transform: scale(1.01);
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes xp-float-up {
          0% {
            opacity: 0;
            transform: translate(-50%, 8px) scale(0.92);
          }
          18% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1.05);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -36px) scale(1);
          }
        }
        @keyframes xp-bar-shine {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
        @keyframes reward-sparkle {
          0%,
          100% {
            opacity: 0.35;
            transform: rotate(0deg) scale(1);
          }
          50% {
            opacity: 1;
            transform: rotate(18deg) scale(1.15);
          }
        }
      `}</style>

      {lastXpFloat ? (
        <output
          key={floatKey}
          className="pointer-events-none absolute left-1/2 top-14 z-10 whitespace-nowrap text-[15px] font-black tabular-nums text-amber-600 motion-safe:animate-[xp-float-up_2.4s_ease-out_1] dark:text-amber-300"
          aria-live="polite"
        >
          +{lastXpFloat.gained} XP{lastXpFloat.leveledUp ? " · 레벨 업!" : ""}
        </output>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-800/90 dark:text-amber-200/90">보상 트랙</p>
          <p className="font-display mt-1 text-[1.35rem] font-black tracking-[-0.03em] text-apple-ink dark:text-zinc-50 sm:text-[1.55rem]">
            Lv.<span className="tabular-nums text-violet-700 dark:text-violet-300">{hydrated ? level.level : "—"}</span>
            <span className="ml-2 text-[13px] font-semibold text-apple-subtle dark:text-zinc-400">XP · 레벨</span>
          </p>
          <p className="mt-1 max-w-md text-[12px] leading-relaxed text-apple-subtle dark:text-zinc-400">
            세트를 저장할 때마다 XP가 쌓입니다. 연속 일수로 3·7·30일 뱃지가 열려요.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 rounded-2xl border border-amber-300/60 bg-white/90 px-4 py-3 text-right shadow-sm dark:border-amber-800/50 dark:bg-zinc-900/90">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800/80 dark:text-amber-200/80">총 XP</span>
          <span className="font-display text-2xl font-black tabular-nums text-amber-950 dark:text-amber-100">
            {hydrated ? totalXp.toLocaleString("ko-KR") : "—"}
          </span>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex justify-between text-[11px] font-semibold text-apple-subtle dark:text-zinc-500">
          <span>다음 레벨까지</span>
          <span className="tabular-nums text-apple-ink dark:text-zinc-200">
            {hydrated ? `${level.xpIntoLevel} / ${level.xpForNextLevel} XP` : "—"}
          </span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-neutral-200/90 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-[length:200%_100%] motion-safe:transition-[width] motion-safe:duration-700"
            style={{
              width: `${hydrated ? level.progressPct : 0}%`,
              backgroundImage: "linear-gradient(90deg, #7c3aed, #f59e0b, #a78bfa, #f59e0b)",
              animation: hydrated ? "xp-bar-shine 2.8s linear infinite" : undefined,
            }}
          />
        </div>
      </div>

      <div className="mt-6 border-t border-amber-200/60 pt-4 dark:border-amber-900/40">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-apple-subtle dark:text-zinc-500">연속 뱃지</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {STREAK_MILESTONE_DAYS.map((days) => {
            const unlocked = streak >= days;
            return (
              <div
                key={days}
                className={`relative flex min-w-[5.5rem] flex-col items-center rounded-2xl border-2 px-3 py-2.5 transition ${
                  unlocked
                    ? "border-amber-400 bg-gradient-to-br from-amber-100 to-orange-50 text-amber-950 shadow-md dark:border-amber-500 dark:from-amber-950/70 dark:to-orange-950/40 dark:text-amber-50"
                    : "border-neutral-200 bg-neutral-50/80 text-apple-subtle opacity-75 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500"
                }`}
              >
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">연속</span>
                <span className="font-display text-xl font-black tabular-nums">{days}일</span>
                <span className={`mt-0.5 text-[10px] font-bold ${unlocked ? "text-emerald-700 dark:text-emerald-300" : ""}`}>
                  {unlocked ? "획득" : "잠금"}
                </span>
                {unlocked ? (
                  <span className="absolute -right-1 -top-1 text-lg motion-safe:animate-[reward-sparkle_1.2s_ease-in-out_2]">✦</span>
                ) : null}
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[12px] font-medium text-apple-subtle dark:text-zinc-400">
          현재 연속 <span className="font-bold tabular-nums text-apple-ink dark:text-zinc-200">{hydrated ? streak : "—"}</span>일
        </p>
      </div>
    </section>
  );
}
