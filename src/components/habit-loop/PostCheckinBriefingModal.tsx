"use client";

import { useHomeActionViewModel } from "@/components/dashboard/home/use-home-action-view-model";
import Link from "next/link";
import type { SiteExperienceConfig } from "@/types/site-settings";
import type { WorkoutRow } from "@/types/workout";

type Props = {
  userId: string;
  workouts: WorkoutRow[];
  hydrated: boolean;
  experience: SiteExperienceConfig;
  open: boolean;
  onDismiss: () => void;
  /** 브리핑만 닫고 오늘 할 일 카드로 스크롤 — 루프 이탈 없이 이어가기 */
  onSecondaryExit: () => void;
  /** 브리핑 후 실행 단계 — 홈 기록 섹션으로 이동 */
  onContinueToWorkout: () => void;
};

const scrim =
  "fixed inset-0 z-[121] flex items-end justify-center bg-[rgba(15,23,42,0.45)] p-4 pb-8 sm:items-center sm:p-6 sm:pb-6 dark:bg-black/50";

const panel =
  "w-full max-w-md rounded-2xl border border-violet-200/90 bg-gradient-to-b from-violet-50/98 via-white to-white p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.16)] sm:max-w-lg sm:p-7 dark:border-violet-900/50 dark:from-violet-950/50 dark:via-zinc-950 dark:to-zinc-950 dark:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.55)]";

export function PostCheckinBriefingModal({
  userId,
  workouts,
  hydrated,
  experience,
  open,
  onDismiss,
  onSecondaryExit,
  onContinueToWorkout,
}: Props) {
  const model = useHomeActionViewModel({ userId, workouts, hydrated, experience });

  if (!open) return null;

  const briefing = model.dailyBriefing;
  const ready = model.hydrated && model.hasDailyCheckin && briefing;

  return (
    <div className={scrim} role="dialog" aria-modal="true" aria-labelledby="post-checkin-briefing-title">
      <div className={panel}>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-700/90 dark:text-violet-300/90">체크인 다음</p>
        <h2
          id="post-checkin-briefing-title"
          className="font-display mt-2 text-[1.45rem] font-bold leading-tight tracking-[-0.03em] text-apple-ink dark:text-zinc-50 sm:text-[1.6rem]"
        >
          오늘 브리핑
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-apple-subtle dark:text-zinc-400">
          방금 고른 걸로 오늘 운동을 정리해 뒀어요.
        </p>

        {!ready ? (
          <div className="mt-6 space-y-3 animate-pulse" aria-busy="true">
            <div className="h-14 rounded-xl bg-violet-100/80 dark:bg-violet-950/40" />
            <div className="h-20 rounded-xl bg-violet-100/60 dark:bg-violet-950/30" />
            <div className="h-12 rounded-xl bg-neutral-100 dark:bg-zinc-800" />
          </div>
        ) : (
          <>
            {model.confirmedPlanLine ? (
              <div className="mt-5 rounded-xl border border-violet-300/75 bg-white/95 px-3.5 py-3.5 shadow-sm dark:border-violet-800/50 dark:bg-zinc-900/60">
                <p className="text-[10px] font-bold uppercase tracking-wide text-violet-800 dark:text-violet-200">오늘 플랜</p>
                <p className="mt-2 text-[15px] font-extrabold leading-snug text-apple-ink dark:text-zinc-50">{model.confirmedPlanLine}</p>
              </div>
            ) : null}

            <div className="mt-4 rounded-xl border-2 border-violet-400/40 bg-white/90 px-3.5 py-3.5 dark:border-violet-600/35 dark:bg-zinc-900/50">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-violet-800 dark:text-violet-200">정리</p>
                {model.coachTrustConfidencePercent > 0 ? (
                  <span className="rounded-full border border-indigo-400/50 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-extrabold tabular-nums text-indigo-900 dark:border-indigo-500/40 dark:bg-indigo-950/50 dark:text-indigo-100">
                    맞을 것 같음 {model.coachTrustConfidencePercent}%
                  </span>
                ) : null}
              </div>
              {model.coachDecisionConfirmedLine ? (
                <p className="mt-2 text-[16px] font-extrabold leading-snug tracking-[-0.02em] text-apple-ink dark:text-zinc-50">
                  {model.coachDecisionConfirmedLine}
                </p>
              ) : null}
              {model.coachTrustPrimaryReason ? (
                <p className="mt-2 text-[12px] font-semibold text-violet-900/90 dark:text-violet-200/95">
                  <span className="mr-1.5 rounded border border-violet-400/55 bg-violet-100/90 px-1 py-0.5 text-[9px] font-bold uppercase text-violet-900 dark:border-violet-600 dark:bg-violet-950 dark:text-violet-100">
                    근거
                  </span>
                  {model.coachTrustPrimaryReason}
                </p>
              ) : null}
              <p className="mt-2 border-t border-violet-200/60 pt-2 text-[14px] font-bold leading-snug text-apple-ink dark:text-zinc-200 dark:border-violet-800/40">
                {briefing.aiMessage}
              </p>
            </div>

            <p className="mt-3 text-[12px] font-medium leading-relaxed text-apple-subtle dark:text-zinc-400">{briefing.interpretationLine}</p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-stretch">
              {briefing.decisionKind === "rest" ? (
                <>
                  <button
                    type="button"
                    onClick={onContinueToWorkout}
                    className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-[14px] font-bold text-white shadow-md shadow-violet-500/20 transition hover:opacity-95 active:scale-[0.99]"
                  >
                    가볍게 한 줄 남기기
                  </button>
                  <Link
                    href="/program"
                    onClick={onDismiss}
                    className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border-2 border-violet-300/80 bg-white/95 px-4 text-[14px] font-bold text-violet-900 transition hover:bg-violet-50 dark:border-violet-600 dark:bg-zinc-900 dark:text-violet-100 dark:hover:bg-zinc-800"
                  >
                    프로그램만 보기
                  </Link>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onContinueToWorkout}
                  className="inline-flex min-h-[50px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-[15px] font-bold text-white shadow-md shadow-violet-500/25 ring-2 ring-violet-400/25 transition hover:opacity-95 active:scale-[0.99] sm:flex-1"
                >
                  {model.todayWorkoutComplete ? "기록 칸으로" : "기록하러 가기"}
                </button>
              )}
              <button
                type="button"
                onClick={onSecondaryExit}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 text-[13px] font-semibold text-apple-ink transition hover:border-neutral-400 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 sm:min-w-[7rem]"
              >
                오늘 할 일로
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
