"use client";

import {
  computeOneLineInsight,
  hasWorkoutToday,
  recentWorkouts,
} from "@/lib/dashboard/insights";
import { ONBOARDING_LS_KEY, type OnboardingProfile } from "@/lib/onboarding/types";
import { endOfWeekSunday, rollupPeriod, startOfWeekMonday } from "@/lib/workouts/period-stats";
import { computeLoggingStreak } from "@/lib/workouts/streak";
import type { WorkoutRow } from "@/types/workout";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const LS_GOALS = "jws_goals_v1";

function loadGoals(): { weeklySessionTarget?: number } {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LS_GOALS);
    if (!raw) return {};
    const p = JSON.parse(raw) as { weeklySessionTarget?: number };
    return {
      weeklySessionTarget:
        typeof p.weeklySessionTarget === "number" && p.weeklySessionTarget > 0 ? p.weeklySessionTarget : undefined,
    };
  } catch {
    return {};
  }
}

function loadOnboarding(): OnboardingProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ONBOARDING_LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingProfile;
  } catch {
    return null;
  }
}

const card =
  "rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-sm ring-1 ring-black/[0.03] sm:p-5 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-white/[0.04]";

type Props = { workouts: WorkoutRow[] };

export function CoachHub({ workouts }: Props) {
  const [goals, setGoals] = useState<{ weeklySessionTarget?: number }>({});
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);

  useEffect(() => {
    setGoals(loadGoals());
    setProfile(loadOnboarding());
  }, []);

  const streak = useMemo(() => computeLoggingStreak(workouts), [workouts]);
  const todayDone = useMemo(() => hasWorkoutToday(workouts), [workouts]);
  const insight = useMemo(() => computeOneLineInsight(workouts), [workouts]);
  const last5 = useMemo(() => recentWorkouts(workouts, 5), [workouts]);

  const mon = useMemo(() => startOfWeekMonday(), []);
  const sun = useMemo(() => endOfWeekSunday(mon), [mon]);
  const week = useMemo(() => rollupPeriod(workouts, mon, sun), [workouts, mon, sun]);

  const goalPct =
    goals.weeklySessionTarget && goals.weeklySessionTarget > 0
      ? Math.min(100, Math.round((week.rowCount / goals.weeklySessionTarget) * 100))
      : null;

  const todayHint = useMemo(() => {
    if (!profile?.goal) return "목표와 가능한 요일을 정하면 맞춤 힌트를 드릴게요.";
    const g =
      profile.goal === "bulk"
        ? "오늘은 하체 또는 밀기 중 하나를 메인으로."
        : profile.goal === "cut"
          ? "복합 2~3종목 + 가벼운 액세서리로 볼륨은 유지하세요."
          : "전신 균형 위주로 가볍게 돌려보세요.";
    return g;
  }, [profile]);

  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-12">
      <div className={`${card} lg:col-span-4`}>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-apple-subtle">오늘</p>
        <p className="font-display mt-2 text-[1.35rem] font-bold text-apple-ink sm:text-[1.5rem]">
          {todayDone ? "운동 기록됨" : "아직 미기록"}
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-apple-subtle">
          {goalPct !== null ? `이번 주 목표 ${goalPct}% · ${week.rowCount}/${goals.weeklySessionTarget}세션` : "목표는 카드 아래 「이번 주 목표」에서 설정할 수 있어요."}
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-black transition-[width] duration-500"
            style={{ width: `${goalPct ?? (todayDone ? 100 : week.rowCount > 0 ? 40 : 8)}%` }}
          />
        </div>
      </div>

      <div className={`${card} lg:col-span-4`}>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-apple-subtle">연속 기록</p>
        <p className="font-display mt-2 text-[1.35rem] font-bold tabular-nums text-apple-ink sm:text-[1.5rem]">{streak}일</p>
        <p className="mt-2 text-[13px] text-apple-subtle">오늘 또는 어제에 기록이 있으면 이어집니다.</p>
      </div>

      <div className={`${card} lg:col-span-4`}>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-apple-subtle">오늘 할 운동</p>
        <p className="mt-2 text-[14px] font-medium leading-snug text-apple-ink">{todayHint}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/onboarding"
            className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-apple-ink transition hover:border-black"
          >
            프로필
          </Link>
          <Link
            href="/program"
            className="rounded-full border border-black bg-black px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-black"
          >
            가이드
          </Link>
        </div>
      </div>

      <div className={`${card} lg:col-span-7`}>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-apple-subtle">코치 한 줄</p>
        <p className="mt-2 text-[15px] font-medium leading-relaxed text-apple-ink sm:text-[16px]">{insight}</p>
        <p className="mt-3 text-[12px] text-apple-subtle">상세 피드백은 아래 AI 코칭에서 기록을 보내 생성할 수 있어요.</p>
      </div>

      <div className={`${card} lg:col-span-5`}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-apple-subtle">최근 기록</p>
          <Link href="/performance" className="text-[11px] font-semibold text-apple-ink underline underline-offset-4 hover:opacity-60">
            퍼포먼스
          </Link>
        </div>
        {last5.length === 0 ? (
          <p className="mt-4 text-[13px] text-apple-subtle">아직 저장된 세트가 없어요. 아래 입력란에서 첫 기록을 남겨 보세요.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {last5.map((w) => (
              <li key={w.id} className="flex items-center justify-between gap-2 text-[13px]">
                <span className="truncate font-semibold text-apple-ink">{w.exercise_name}</span>
                <span className="shrink-0 tabular-nums text-apple-subtle">
                  {Number(w.weight_kg)}kg×{w.reps}×{w.sets}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
