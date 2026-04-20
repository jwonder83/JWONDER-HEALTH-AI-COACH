"use client";

import { buildHomeActionViewModel, type LocalWeeklyGoal } from "@/lib/dashboard/home-action-state";
import { ONBOARDING_LS_KEY, type OnboardingProfile } from "@/lib/onboarding/types";
import type { WorkoutRow } from "@/types/workout";
import { useEffect, useMemo, useState } from "react";

const LS_GOALS = "jws_goals_v1";

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
  workouts: WorkoutRow[];
  hydrated: boolean;
};

/**
 * 홈 상단 행동 유도 카드들에 필요한 파생 상태.
 * 목표/온보딩은 localStorage와 동기화(다른 카드에서 저장 시 storage 이벤트로 갱신).
 */
export function useHomeActionViewModel({ workouts, hydrated }: Args) {
  const [goals, setGoals] = useState<LocalWeeklyGoal>({});
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);

  useEffect(() => {
    function reloadLocal() {
      setGoals(loadGoals());
      setProfile(loadOnboarding());
    }
    reloadLocal();

    function onStorage(e: StorageEvent) {
      if (e.key === LS_GOALS || e.key === ONBOARDING_LS_KEY || e.key === null) {
        reloadLocal();
      }
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", reloadLocal);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", reloadLocal);
    };
  }, []);

  const model = useMemo(
    () => buildHomeActionViewModel(workouts, profile, goals, hydrated),
    [workouts, profile, goals, hydrated],
  );

  return model;
}
