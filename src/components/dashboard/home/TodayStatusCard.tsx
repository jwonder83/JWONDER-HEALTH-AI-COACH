"use client";

import { StreakMilestoneBadges } from "@/components/gamification/StreakMilestoneBadges";
import type { HomeActionViewModel } from "@/lib/dashboard/home-action-state";
import type { UserWorkoutUiState } from "@/lib/dashboard/user-workout-ui-state";

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
    | "workoutRestTargetSeconds"
  >;
  uiState: UserWorkoutUiState;
};

function shellFor(uiState: UserWorkoutUiState, hydrated: boolean): string {
  const base =
    "rounded-2xl border-2 p-4 shadow-sm ring-1 sm:p-5 dark:ring-white/[0.04]";
  if (!hydrated) {
    return `${base} border-neutral-200/90 bg-white ring-black/[0.03] dark:border-zinc-800 dark:bg-zinc-950`;
  }
  if (uiState === "completed") {
    return `${base} border-emerald-400/60 bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/80 ring-emerald-500/10 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-zinc-950 dark:to-teal-950/25 dark:ring-emerald-500/10`;
  }
  if (uiState === "active") {
    return `${base} border-indigo-400/55 bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/70 ring-indigo-500/10 dark:border-indigo-600/45 dark:from-indigo-950/40 dark:via-zinc-950 dark:to-violet-950/25 dark:ring-indigo-500/10`;
  }
  if (uiState === "missed") {
    return `${base} border-rose-400/65 bg-gradient-to-br from-rose-50/95 via-white to-orange-50/75 ring-rose-500/12 dark:border-rose-600/50 dark:from-rose-950/45 dark:via-zinc-950 dark:to-orange-950/25 dark:ring-rose-500/10`;
  }
  return `${base} border-amber-300/70 bg-gradient-to-br from-amber-50/90 via-white to-neutral-50 ring-amber-500/10 dark:border-amber-700/45 dark:from-amber-950/35 dark:via-zinc-950 dark:to-zinc-900 dark:ring-amber-500/10`;
}

export function TodayStatusCard({ model, uiState }: Props) {
  const pct = model.goalProgressPercent;
  const barWidth = model.hydrated ? (pct !== null ? pct : model.todayWorkoutComplete ? 100 : 12) : 12;
  const shell = shellFor(uiState, model.hydrated);

  return (
    <section className={shell} aria-labelledby="today-status-heading" data-user-workout-state={model.hydrated ? uiState : undefined}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="today-status-heading" className="text-[10px] font-bold uppercase tracking-[0.2em] text-apple-subtle">
            오늘 한 줄 요약
          </h2>
          <p className="font-display mt-2 text-[1.25rem] font-bold leading-tight text-apple-ink sm:text-[1.4rem] dark:text-zinc-100">
            {!model.hydrated ? (
              <span className="text-apple-subtle">불러오는 중…</span>
            ) : uiState === "completed" ? (
              <>
                오늘 운동 <span className="text-emerald-600 dark:text-emerald-400">완료</span>
              </>
            ) : uiState === "active" ? (
              <>
                지금 <span className="text-indigo-600 dark:text-indigo-400">운동 중</span>
              </>
            ) : uiState === "missed" ? (
              <>
                오늘 운동 <span className="text-rose-600 dark:text-rose-400">미완</span>
              </>
            ) : (
              <>
                오늘 운동 <span className="text-amber-600 dark:text-amber-400">전</span>
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

      {model.hydrated && uiState === "idle" && !model.todayWorkoutComplete ? (
        <p className="mt-3 rounded-xl border border-amber-300/70 bg-amber-50/90 px-3 py-2 text-[12px] font-semibold leading-relaxed text-amber-950 dark:border-amber-700/50 dark:bg-amber-950/35 dark:text-amber-100">
          운동 전 단계예요. 플랜 확정 후 <span className="font-bold">운동 시작하기</span>로 바로 들어가면 돼요.
        </p>
      ) : null}

      {model.hydrated && uiState === "active" ? (
        <p className="mt-3 rounded-xl border border-indigo-300/70 bg-indigo-50/90 px-3 py-2 text-[12px] font-semibold leading-relaxed text-indigo-950 dark:border-indigo-700/50 dark:bg-indigo-950/35 dark:text-indigo-100">
          코칭 UI는 운동 화면에 있어요. 세트 저장 후 휴식 {model.workoutRestTargetSeconds}초 → 다음 세트 흐름을 이어가세요.
        </p>
      ) : null}

      {model.hydrated && uiState === "missed" ? (
        <p className="mt-3 rounded-xl border border-rose-300/80 bg-rose-50/95 px-3 py-2 text-[12px] font-bold leading-relaxed text-rose-950 dark:border-rose-700/50 dark:bg-rose-950/40 dark:text-rose-50">
          오늘은 아직 세트가 없습니다. 위 리본에서 빠른 루틴을 시작하거나, 아래 플랜으로 바로 들어가세요.
        </p>
      ) : null}

      {model.hydrated && uiState === "completed" ? (
        <p className="mt-3 rounded-xl border border-emerald-300/60 bg-emerald-50/85 px-3 py-2 text-[12px] font-semibold leading-relaxed text-emerald-950 dark:border-emerald-800/45 dark:bg-emerald-950/35 dark:text-emerald-100">
          성취 모드: 주간 목표·스트릭이 갱신됐을 수 있어요. 성과 탭에서 분석을 확인해 보세요.
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

      <div
        className="mt-4 h-2.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-zinc-800"
        role="progressbar"
        aria-valuenow={pct ?? 0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="이번 주 목표 진행률"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-700 to-emerald-500 transition-[width] duration-500 dark:from-emerald-500 dark:to-teal-400"
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <StreakMilestoneBadges streakDays={model.streakDays} hydrated={model.hydrated} />
    </section>
  );
}
