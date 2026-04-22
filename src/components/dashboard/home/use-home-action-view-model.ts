"use client";

import { buildHomeActionViewModel, type LocalWeeklyGoal } from "@/lib/dashboard/home-action-state";
import { LS_GOALS } from "@/lib/dashboard/local-goals";
import { PLAN_FEEDBACK_CHANGED_EVENT } from "@/lib/plan-feedback/closing-report-plan-feedback";
import { DAILY_CHECKIN_CHANGED_EVENT, loadDailyCheckin, type DailyCheckinRecord } from "@/lib/habit-loop/daily-checkin";
import { ONBOARDING_LS_KEY, type OnboardingProfile } from "@/lib/onboarding/types";
import type { SiteExperienceConfig } from "@/types/site-settings";
import { STREAK_PREFERENCE_CHANGED_EVENT } from "@/lib/workouts/streak";
import type { WorkoutRow } from "@/types/workout";
import { useEffect, useMemo, useState } from "react";

function loadGoals(): LocalWeeklyGoal {
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

type Args = {
  userId: string;
  workouts: WorkoutRow[];
  hydrated: boolean;
  experience: SiteExperienceConfig;
};

/**
 * 홈 상단 행동 유도 카드들에 필요한 파생 상태.
 * 목표/온보딩은 localStorage와 동기화(다른 카드에서 저장 시 storage 이벤트로 갱신).
 */
export function useHomeActionViewModel({ userId, workouts, hydrated, experience }: Args) {
  const [goals, setGoals] = useState<LocalWeeklyGoal>({});
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [dailyCheckin, setDailyCheckin] = useState<DailyCheckinRecord | null>(null);
  const [streakPreferenceTick, setStreakPreferenceTick] = useState(0);
  const [planFeedbackTick, setPlanFeedbackTick] = useState(0);

  useEffect(() => {
    const bump = () => setStreakPreferenceTick((n) => n + 1);
    window.addEventListener(STREAK_PREFERENCE_CHANGED_EVENT, bump);
    return () => window.removeEventListener(STREAK_PREFERENCE_CHANGED_EVENT, bump);
  }, []);

  useEffect(() => {
    const bump = () => setPlanFeedbackTick((n) => n + 1);
    window.addEventListener(PLAN_FEEDBACK_CHANGED_EVENT, bump);
    return () => window.removeEventListener(PLAN_FEEDBACK_CHANGED_EVENT, bump);
  }, []);

  useEffect(() => {
    function reloadLocal() {
      setGoals(loadGoals());
      setProfile(loadOnboarding());
      setDailyCheckin(userId ? loadDailyCheckin(userId) : null);
    }
    reloadLocal();

    function onCheckin() {
      if (userId) setDailyCheckin(loadDailyCheckin(userId));
    }

    function onStorage(e: StorageEvent) {
      if (e.key === LS_GOALS || e.key === ONBOARDING_LS_KEY || e.key === null) {
        reloadLocal();
      }
    }
    function onGoalsChanged() {
      setGoals(loadGoals());
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", reloadLocal);
    window.addEventListener(DAILY_CHECKIN_CHANGED_EVENT, onCheckin);
    window.addEventListener("jws-goals-changed", onGoalsChanged);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", reloadLocal);
      window.removeEventListener(DAILY_CHECKIN_CHANGED_EVENT, onCheckin);
      window.removeEventListener("jws-goals-changed", onGoalsChanged);
    };
  }, [userId]);

  const model = useMemo(
    () => buildHomeActionViewModel(workouts, profile, goals, hydrated, { experience, dailyCheckin }),
    [workouts, profile, goals, hydrated, experience, dailyCheckin, streakPreferenceTick, planFeedbackTick],
  );

  return model;
}
