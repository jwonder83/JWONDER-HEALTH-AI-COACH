"use client";

import {
  getNoWorkoutInterventionUrgency,
  type NoWorkoutInterventionHourBounds,
  type NoWorkoutUrgencyPhase,
} from "@/lib/dashboard/no-workout-intervention-urgency";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Props = {
  /** 오늘 루틴 예상 시간 라벨 (예: 약 40–55분) */
  estimatedDurationLabel: string;
  routineTitle: string;
  /** 플랜 확정 후에만 운동 화면으로 바로 보냄 */
  planConfirmed: boolean;
  /** 결정형 코치 한 줄(히어로와 동일 소스) */
  coachLine: string;
  /** 데이터 기반 근거 */
  coachLineReason: string;
  /** 연속 일수 — 저녁 개입 문구 분기 */
  streakDays: number;
  interventionHours: NoWorkoutInterventionHourBounds;
};

function scrollToTodayPlan() {
  document.getElementById("today-routine-plan-heading")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function scrollToTodayWorkoutHero() {
  document.getElementById("today-workout")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function phaseLabel(phase: NoWorkoutUrgencyPhase): string {
  if (phase === "morning") return "오전";
  if (phase === "afternoon") return "오후";
  if (phase === "evening") return "저녁";
  return "밤";
}

/**
 * 오늘 운동 미완료일 때만 표시 — 시각·시간대별 적극 개입.
 * 완료 시 HomeActionHub에서 렌더하지 않음.
 */
export function NoWorkoutCoachIntervention({
  estimatedDurationLabel,
  routineTitle,
  planConfirmed,
  coachLine,
  coachLineReason,
  streakDays,
  interventionHours,
}: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const { phase, interventionHeadline, urgency } = useMemo(
    () => getNoWorkoutInterventionUrgency(now, streakDays, interventionHours),
    [now, streakDays, interventionHours],
  );

  const shell =
    urgency === "critical"
      ? "rounded-2xl border-2 border-rose-600/95 bg-gradient-to-br from-rose-50 via-orange-50/95 to-amber-50/90 p-4 shadow-[0_16px_48px_-10px_rgba(244,63,94,0.45)] ring-2 ring-rose-500/45 sm:p-5 dark:border-rose-500/70 dark:from-rose-950/55 dark:via-zinc-900 dark:to-zinc-950 dark:ring-rose-500/35"
      : urgency === "warn"
        ? "rounded-2xl border-2 border-orange-600/90 bg-gradient-to-br from-orange-50 via-amber-50/95 to-amber-50/90 p-4 shadow-[0_14px_44px_-12px_rgba(234,88,12,0.38)] ring-2 ring-orange-400/40 sm:p-5 dark:border-orange-500/65 dark:from-orange-950/45 dark:via-zinc-900 dark:to-zinc-950 dark:ring-orange-500/30"
        : "rounded-2xl border-2 border-amber-600/80 bg-gradient-to-br from-amber-50 via-amber-50/95 to-orange-50/90 p-4 shadow-[0_12px_40px_-12px_rgba(245,158,11,0.35)] ring-2 ring-amber-400/35 sm:p-5 dark:border-amber-500/55 dark:from-amber-950/50 dark:via-zinc-900 dark:to-zinc-950 dark:ring-amber-500/25";

  const ink =
    urgency === "critical"
      ? "text-rose-950 dark:text-rose-50"
      : urgency === "warn"
        ? "text-orange-950 dark:text-orange-50"
        : "text-amber-950 dark:text-amber-50";

  const subInk =
    urgency === "critical"
      ? "text-rose-950/90 dark:text-rose-50/95"
      : urgency === "warn"
        ? "text-orange-950/90 dark:text-orange-50/95"
        : "text-amber-950/90 dark:text-amber-50/95";

  const primaryBtn =
    urgency === "critical"
      ? "inline-flex min-h-[54px] w-full flex-1 items-center justify-center rounded-xl border-2 border-rose-950 bg-rose-950 px-5 text-[16px] font-bold text-white shadow-lg transition hover:bg-rose-900 hover:shadow-xl active:scale-[0.99] dark:border-rose-300 dark:bg-rose-500 dark:text-white dark:hover:bg-rose-400 sm:min-h-[58px] sm:max-w-md sm:text-[17px]"
      : urgency === "warn"
        ? "inline-flex min-h-[54px] w-full flex-1 items-center justify-center rounded-xl border-2 border-orange-950 bg-orange-950 px-5 text-[16px] font-bold text-white shadow-lg transition hover:bg-orange-900 hover:shadow-xl active:scale-[0.99] dark:border-orange-300 dark:bg-orange-500 dark:text-white dark:hover:bg-orange-400 sm:min-h-[58px] sm:max-w-md sm:text-[17px]"
        : "inline-flex min-h-[54px] w-full flex-1 items-center justify-center rounded-xl border-2 border-amber-950 bg-amber-950 px-5 text-[16px] font-bold text-white shadow-lg transition hover:bg-amber-900 hover:shadow-xl active:scale-[0.99] dark:border-amber-300 dark:bg-amber-400 dark:text-amber-950 dark:hover:bg-amber-300 sm:min-h-[58px] sm:max-w-md sm:text-[17px]";

  const secondaryBtn =
    urgency === "critical"
      ? "inline-flex min-h-[50px] w-full flex-1 items-center justify-center rounded-xl border-2 border-rose-800/55 bg-white/95 px-5 text-[15px] font-bold text-rose-950 shadow-md transition hover:bg-white active:scale-[0.99] dark:border-rose-400/50 dark:bg-zinc-900/85 dark:text-rose-100 sm:min-h-[54px] sm:max-w-md"
      : urgency === "warn"
        ? "inline-flex min-h-[50px] w-full flex-1 items-center justify-center rounded-xl border-2 border-orange-800/50 bg-white/95 px-5 text-[15px] font-bold text-orange-950 shadow-md transition hover:bg-white active:scale-[0.99] dark:border-orange-400/45 dark:bg-zinc-900/85 dark:text-orange-50 sm:min-h-[54px] sm:max-w-md"
        : "inline-flex min-h-[50px] w-full flex-1 items-center justify-center rounded-xl border-2 border-amber-800/45 bg-white/95 px-5 text-[15px] font-bold text-amber-950 shadow-md transition hover:bg-white active:scale-[0.99] dark:border-amber-400/45 dark:bg-zinc-900/85 dark:text-amber-100 sm:min-h-[54px] sm:max-w-md";

  return (
    <section
      className={`relative overflow-hidden ${shell}`}
      aria-labelledby="no-workout-intervention-urgent"
      aria-live={urgency === "critical" ? "assertive" : "polite"}
    >
      {urgency === "critical" ? (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-rose-500/50 motion-safe:animate-pulse"
          aria-hidden
        />
      ) : null}

      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p
            className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
              urgency === "critical"
                ? "text-rose-900/90 dark:text-rose-200/90"
                : urgency === "warn"
                  ? "text-orange-900/88 dark:text-orange-200/90"
                  : "text-amber-900/85 dark:text-amber-200/90"
            }`}
          >
            오늘 한 줄
          </p>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              urgency === "critical"
                ? "border-rose-800/30 bg-rose-500/15 text-rose-900 dark:border-rose-400/35 dark:bg-rose-500/20 dark:text-rose-100"
                : urgency === "warn"
                  ? "border-orange-800/30 bg-orange-500/15 text-orange-950 dark:border-orange-400/35 dark:bg-orange-500/20 dark:text-orange-50"
                  : "border-amber-800/25 bg-amber-500/12 text-amber-950 dark:border-amber-400/35 dark:bg-amber-500/15 dark:text-amber-100"
            }`}
          >
            {phaseLabel(phase)}
          </span>
        </div>

        <h2
          id="no-workout-intervention-urgent"
          className={`font-display mt-2 text-[1.2rem] font-extrabold leading-tight sm:text-[1.38rem] ${ink}`}
        >
          {interventionHeadline}
        </h2>

        <p className={`mt-2 text-[14px] font-bold leading-snug sm:text-[15px] ${subInk}`}>{coachLine}</p>

        <p className={`mt-1.5 text-[13px] font-semibold leading-snug sm:text-[14px] ${subInk}`}>
          「{routineTitle}」 · 대략 {estimatedDurationLabel}
          {planConfirmed ? " · 플랜 고정됨" : " · 아래에서 플랜만 정하면 됨"}
        </p>

        <p className={`mt-3 flex flex-wrap items-baseline gap-1.5 text-[12px] leading-relaxed opacity-95 ${subInk}`}>
          <span
            className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] ${
              urgency === "critical"
                ? "border-rose-900/25 bg-white/75 text-rose-950 dark:border-rose-400/40 dark:bg-zinc-900/80 dark:text-rose-100"
                : urgency === "warn"
                  ? "border-orange-900/25 bg-white/75 text-orange-950 dark:border-orange-400/40 dark:bg-zinc-900/80 dark:text-orange-50"
                  : "border-amber-900/25 bg-white/70 text-amber-950 dark:border-amber-400/40 dark:bg-zinc-900/80 dark:text-amber-100"
            }`}
          >
            이유
          </span>
          <span>{coachLineReason}</span>
        </p>

        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-3">
          {planConfirmed ? (
            <>
              <Link href="/workout" className={primaryBtn} aria-label="지금 시작하기 — 운동 기록 화면으로 이동">
                지금 시작하기
              </Link>
              <Link href="/workout" className={secondaryBtn} aria-label="빠른 루틴 실행 — 운동 기록 화면으로 이동">
                빠른 루틴 실행
              </Link>
            </>
          ) : (
            <>
              <button type="button" onClick={scrollToTodayPlan} className={primaryBtn}>
                지금 시작하기
              </button>
              <button type="button" onClick={scrollToTodayWorkoutHero} className={secondaryBtn}>
                빠른 루틴 실행
              </button>
            </>
          )}
        </div>

        {phase === "night" && streakDays > 0 ? (
          <p className={`mt-3 text-center text-[12px] font-semibold ${subInk}`}>한 종목·한 세트만 넣어도 연속은 이어져요.</p>
        ) : null}

        <div className="mt-3 flex justify-center sm:justify-start">
          <Link
            href="/program"
            className={`text-[12px] font-bold underline-offset-2 transition hover:underline ${subInk} opacity-90`}
          >
            프로그램 보기
          </Link>
        </div>
      </div>
    </section>
  );
}
