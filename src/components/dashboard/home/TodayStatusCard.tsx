"use client";

import { StreakMilestoneBadges } from "@/components/gamification/StreakMilestoneBadges";
import type { HomeActionViewModel } from "@/lib/dashboard/home-action-state";

const shell =
  "rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-sm ring-1 ring-black/[0.03] sm:p-5 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-white/[0.04]";

type Props = {
  model: Pick<
    HomeActionViewModel,
    | "hydrated"
    | "todayWorkoutComplete"
    | "goalProgressPercent"
    | "weeklySessionCurrent"
    | "weeklySessionTarget"
    | "streakDays"
    | "streakMotivationLine"
  >;
};

export function TodayStatusCard({ model }: Props) {
  const pct = model.goalProgressPercent;
  const barWidth = model.hydrated ? (pct !== null ? pct : model.todayWorkoutComplete ? 100 : 12) : 12;

  return (
    <section className={shell} aria-labelledby="today-status-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="today-status-heading" className="text-[10px] font-bold uppercase tracking-[0.2em] text-apple-subtle">
            오늘 한 줄 요약
          </h2>
          <p className="font-display mt-2 text-[1.25rem] font-bold leading-tight text-apple-ink sm:text-[1.4rem] dark:text-zinc-100">
            {!model.hydrated ? (
              <span className="text-apple-subtle">불러오는 중…</span>
            ) : model.todayWorkoutComplete ? (
              <>
                오늘 운동{" "}
                <span className="text-emerald-600 dark:text-emerald-400">클리어</span>
              </>
            ) : (
              <>
                오늘 운동 <span className="text-amber-600 dark:text-amber-400">아직</span>
              </>
            )}
          </p>
        </div>
        <div className="rounded-full border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-teal-50 px-3.5 py-2 text-center shadow-sm dark:border-emerald-900/50 dark:from-emerald-950/50 dark:to-teal-950/40">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-800/90 dark:text-emerald-300/90">연속 스택</p>
          <p className="font-display text-[1.25rem] font-bold tabular-nums text-emerald-900 dark:text-emerald-200">
            {model.hydrated ? `${model.streakDays}일` : "—"}
          </p>
        </div>
      </div>

      {model.hydrated && !model.todayWorkoutComplete ? (
        <p className="mt-3 rounded-xl border border-amber-300/70 bg-amber-50/90 px-3 py-2 text-[12px] font-semibold leading-relaxed text-amber-950 dark:border-amber-700/50 dark:bg-amber-950/35 dark:text-amber-100">
          코치 모드 켜둔 기분으로, 아래에서 바로 이어가면 돼요.
        </p>
      ) : null}

      {model.hydrated && model.streakMotivationLine ? (
        <p className="mt-3 rounded-xl border border-emerald-200/60 bg-emerald-50/80 px-3 py-2.5 text-[13px] font-medium leading-relaxed text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100">
          {model.streakMotivationLine}
        </p>
      ) : null}

      <p className="mt-3 text-[13px] leading-relaxed text-apple-subtle dark:text-zinc-400">
        {!model.hydrated ? (
          "기록 싹 불러오는 중…"
        ) : model.weeklySessionTarget != null ? (
          <>
            이번 주 목표 진행률{" "}
            <span className="font-semibold text-apple-ink tabular-nums dark:text-zinc-200">{pct ?? 0}%</span>
            <span className="tabular-nums">
              {" "}
              ({model.weeklySessionCurrent}/{model.weeklySessionTarget}세션)
            </span>
          </>
        ) : (
          <>주간 목표는 아래 「이번 주 목표」에서 슬쩍 정해 두면 돼요.</>
        )}
      </p>

      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-zinc-800" role="progressbar" aria-valuenow={pct ?? 0} aria-valuemin={0} aria-valuemax={100} aria-label="이번 주 목표 진행률">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-700 to-emerald-500 transition-[width] duration-500 dark:from-emerald-500 dark:to-teal-400"
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <StreakMilestoneBadges streakDays={model.streakDays} hydrated={model.hydrated} />
    </section>
  );
}
