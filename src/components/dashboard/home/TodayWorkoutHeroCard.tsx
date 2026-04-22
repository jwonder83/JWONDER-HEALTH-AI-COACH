"use client";

import type { HomeActionViewModel } from "@/lib/dashboard/home-action-state";
import type { UserWorkoutUiState } from "@/lib/dashboard/user-workout-ui-state";
import type { RoutineFlowStatus } from "@/lib/routine/today-routine-confirmation";
import Link from "next/link";

const shellBase =
  "relative overflow-hidden rounded-2xl border-2 border-black bg-gradient-to-br from-neutral-900 via-black to-neutral-900 p-5 text-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)] sm:p-7 dark:border-zinc-100 dark:from-zinc-950 dark:via-black dark:to-zinc-950";

const shellNudge =
  "ring-4 ring-amber-400/35 shadow-[0_24px_56px_-18px_rgba(245,158,11,0.28)] dark:ring-amber-500/30";

type Props = {
  model: Pick<
    HomeActionViewModel,
    | "todayWorkoutComplete"
    | "routine"
    | "estimatedDurationLabel"
    | "coachLine"
    | "coachLineReason"
    | "coachTrustConfidencePercent"
    | "coachDecisionConfirmedLine"
    | "coachTrustPrimaryReason"
  >;
  workoutSectionId: string;
  routineFlowStatus: RoutineFlowStatus;
  userWorkoutUiState: UserWorkoutUiState;
  /** 홈 상단 단일 CTA와 겹치지 않도록 하단 주 버튼 숨김 */
  hidePrimaryCta?: boolean;
};

function LiveRoutineFeed({ routine }: { routine: HomeActionViewModel["routine"] }) {
  const adjustments = routine.adjustments?.filter(Boolean) ?? [];
  if (adjustments.length > 0) {
    return (
      <div className="mt-4 rounded-xl border border-white/15 bg-white/5 px-3 py-3 backdrop-blur-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/90">루틴 피드</p>
        <ul className="mt-2 space-y-3 text-[13px] leading-snug text-white/85">
          {adjustments.map((a, i) => (
            <li key={`${a.type}-${i}`} className="flex gap-2">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-emerald-400" aria-hidden />
              <div className="min-w-0">
                <p>{a.message}</p>
                <p className="mt-1 flex flex-wrap items-baseline gap-1.5 text-[11px] leading-relaxed text-white/55">
                  <span className="shrink-0 rounded border border-white/20 bg-white/5 px-1 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white/50">
                    이유
                  </span>
                  <span>{a.reason}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
        {routine.source === "rules" ? (
          <p className="mt-2 text-[10px] text-white/45">지금은 규칙 엔진이 짜 준 피드예요. GPT 붙이면 여기 문구가 더 말 잘해요.</p>
        ) : null}
      </div>
    );
  }

  const msgs = routine.liveMessages?.filter(Boolean) ?? [];
  if (msgs.length === 0) return null;
  return (
    <div className="mt-4 rounded-xl border border-white/15 bg-white/5 px-3 py-3 backdrop-blur-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/90">루틴 피드</p>
      <ul className="mt-2 space-y-2 text-[13px] leading-snug text-white/85">
        {msgs.map((m, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-emerald-400" aria-hidden />
            <span>{m}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 flex flex-wrap items-baseline gap-1.5 text-[11px] leading-relaxed text-white/55">
        <span className="shrink-0 rounded border border-white/20 bg-white/5 px-1 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white/50">
          이유
        </span>
        <span>{routine.recommendationReason}</span>
      </p>
      {routine.source === "rules" ? (
        <p className="mt-2 text-[10px] text-white/45">규칙 기반 피드 · GPT 연결 시 같은 자리에 문구만 갈아끼워져요.</p>
      ) : null}
    </div>
  );
}

function scrollToTodayPlan() {
  document.getElementById("today-routine-plan-heading")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

const shellCompletedRing =
  "ring-4 ring-emerald-400/35 shadow-[0_24px_60px_-16px_rgba(16,185,129,0.38)] dark:ring-emerald-500/30";
const shellMissedRing =
  "ring-4 ring-rose-500/40 shadow-[0_24px_56px_-18px_rgba(244,63,94,0.28)] dark:ring-rose-500/35";
const shellActiveRing =
  "ring-4 ring-indigo-400/35 shadow-[0_24px_56px_-18px_rgba(99,102,241,0.28)] dark:ring-indigo-400/30";

export function TodayWorkoutHeroCard({
  model,
  workoutSectionId,
  routineFlowStatus,
  userWorkoutUiState,
  hidePrimaryCta = false,
}: Props) {
  const done = model.todayWorkoutComplete;
  const planLocked = routineFlowStatus === "confirmed" || routineFlowStatus === "completed";

  const shellRing =
    done || userWorkoutUiState === "completed"
      ? ` ${shellCompletedRing}`
      : userWorkoutUiState === "missed"
        ? ` ${shellMissedRing}`
        : userWorkoutUiState === "active"
          ? ` ${shellActiveRing}`
          : !done
            ? ` ${shellNudge}`
            : "";

  const shell = `${shellBase}${shellRing}`;

  return (
    <section className={shell} id={workoutSectionId} aria-labelledby="today-workout-heading" data-user-workout-state={userWorkoutUiState}>
      <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-white/5 blur-2xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-10 -left-10 size-48 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden />

      <div className="relative">
        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/60">오늘 픽</p>
        <h2 id="today-workout-heading" className="font-display mt-2 text-[1.5rem] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[1.75rem]">
          {model.routine.title}
        </h2>
        {routineFlowStatus === "confirmed" && !done ? (
          <p className="mt-2 inline-flex rounded-lg border border-amber-300/40 bg-amber-400/15 px-3 py-1.5 text-[12px] font-semibold text-amber-100">
            오늘 운동 · 고정됨 — 이제 몸만 움직이면 돼요
          </p>
        ) : null}
        {userWorkoutUiState === "active" && !done ? (
          <p className="mt-2 inline-flex rounded-lg border border-indigo-300/45 bg-indigo-500/25 px-3 py-1.5 text-[12px] font-semibold text-indigo-50">
            세션 진행 중 — 운동 화면에서 세트만 이어서 저장하면 돼요
          </p>
        ) : null}
        <p className="mt-2 max-w-prose whitespace-pre-line text-[14px] leading-relaxed text-white/75 sm:text-[15px]">
          {model.routine.description}
        </p>
        {userWorkoutUiState === "missed" && !done ? (
          <p className="mt-2 text-[13px] font-semibold leading-snug text-rose-200">
            오늘은 아직 미완이에요. 세트 하나만 저장하면 완료로 바뀌어요.
          </p>
        ) : null}

        <div className="mt-4 rounded-xl border border-white/12 bg-white/[0.07] px-3 py-3 sm:px-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/85">오늘 결정</p>
            {model.coachTrustConfidencePercent > 0 ? (
              <span className="rounded-full border border-emerald-400/35 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-extrabold tabular-nums text-emerald-50">
                신뢰도 {model.coachTrustConfidencePercent}%
              </span>
            ) : null}
          </div>
          <p className="mt-1.5 text-[15px] font-bold leading-relaxed text-white sm:text-[16px]">
            {model.coachDecisionConfirmedLine || model.coachLine}
          </p>
          {model.coachTrustPrimaryReason ? (
            <p className="mt-2 flex flex-wrap items-baseline gap-1.5 text-[11px] leading-relaxed text-emerald-100/90">
              <span className="shrink-0 rounded border border-white/25 bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white/70">
                핵심 근거
              </span>
              <span>{model.coachTrustPrimaryReason}</span>
            </p>
          ) : null}
          <p className="mt-2 border-t border-white/10 pt-2 text-[13px] font-semibold leading-snug text-white/85">{model.coachLine}</p>
          <p className="mt-2 flex flex-wrap items-baseline gap-1.5 text-[11px] leading-relaxed text-white/55">
            <span className="shrink-0 rounded border border-emerald-400/35 bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-100/90">
              데이터
            </span>
            <span>{model.coachLineReason}</span>
          </p>
        </div>

        <LiveRoutineFeed routine={model.routine} />

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] font-medium text-white/85 sm:text-[13px]">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 tabular-nums backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
            대충 {model.estimatedDurationLabel}
          </span>
          {routineFlowStatus === "confirmed" && !done ? (
            <span className="rounded-full border border-emerald-400/45 bg-emerald-500/20 px-3 py-1 text-emerald-100">오늘 플랜 고정됨</span>
          ) : null}
          {routineFlowStatus === "suggested" && !done ? (
            <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-white/80">아래에서 플랜만 골라 주세요</span>
          ) : null}
          {done ? (
            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-emerald-200">오늘 세션은 찍혔어요</span>
          ) : null}
        </div>

        {hidePrimaryCta ? (
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/workout"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-white/35 bg-white/10 px-4 text-[12px] font-bold text-white transition hover:bg-white/15"
            >
              운동 화면 바로가기
            </Link>
            <Link
              href="/program"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-white/25 px-4 text-[12px] font-semibold text-white/85 transition hover:bg-white/10"
            >
              프로그램
            </Link>
          </div>
        ) : (
          <div className={`mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 ${done ? "" : "sm:justify-center"}`}>
            {done ? (
              <Link
                href="/workout"
                className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-white px-6 text-[15px] font-bold tracking-[-0.01em] text-black shadow-lg transition hover:bg-neutral-100 active:scale-[0.99] sm:min-h-[56px] sm:max-w-xs sm:text-[16px]"
              >
                추가로 한 세트 더
              </Link>
            ) : done || planLocked ? (
              <Link
                href="/workout"
                className={`inline-flex min-h-[58px] w-full items-center justify-center rounded-xl bg-gradient-to-b px-6 text-[17px] font-bold tracking-[-0.01em] text-amber-950 shadow-[0_10px_36px_-8px_rgba(251,191,36,0.65)] transition hover:shadow-lg active:scale-[0.99] sm:min-h-[60px] sm:max-w-md sm:flex-1 sm:text-[18px] ${
                  userWorkoutUiState === "idle" || userWorkoutUiState === "missed"
                    ? "from-amber-200 to-amber-400 ring-4 ring-amber-200/90 hover:from-amber-100 hover:to-amber-300 dark:from-amber-300 dark:to-amber-500 dark:ring-amber-300/70"
                    : "from-amber-300 to-amber-400 ring-2 ring-amber-200/80 hover:from-amber-200 hover:to-amber-300 dark:from-amber-400 dark:to-amber-500 dark:ring-amber-300/50"
                }`}
              >
                {userWorkoutUiState === "active" ? "세션 이어가기" : "운동 시작하기"}
              </Link>
            ) : (
              <button
                type="button"
                onClick={scrollToTodayPlan}
                className="inline-flex min-h-[58px] w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-white/45 bg-white/5 px-6 text-[16px] font-bold tracking-[-0.01em] text-white/90 backdrop-blur-sm transition hover:border-white/70 hover:bg-white/10 active:scale-[0.99] sm:min-h-[60px] sm:max-w-md sm:flex-1 sm:text-[17px]"
              >
                먼저 아래에서 플랜 정하기
              </button>
            )}
            <Link
              href="/program"
              className={
                done
                  ? "inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/35 bg-transparent px-5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/90 transition hover:bg-white/10 sm:min-h-[56px]"
                  : "inline-flex min-h-[50px] w-full items-center justify-center rounded-xl border-2 border-white/40 bg-white/10 px-5 text-[12px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm transition hover:border-white/60 hover:bg-white/15 sm:min-h-[56px] sm:w-auto sm:min-w-[11rem]"
              }
            >
              {done ? "프로그램 훑기" : "참고만 보기"}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
