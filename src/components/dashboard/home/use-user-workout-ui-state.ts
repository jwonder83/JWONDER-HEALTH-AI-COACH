"use client";

import { hasWorkoutToday } from "@/lib/dashboard/insights";
import {
  readWorkoutSessionActive,
  WORKOUT_SESSION_CHANGE_EVENT,
  WORKOUT_SESSION_STORAGE_KEY,
} from "@/lib/workout-session/session-bridge";
import { resolveUserWorkoutUiState, type UserWorkoutUiState } from "@/lib/dashboard/user-workout-ui-state";
import type { WorkoutRow } from "@/types/workout";
import { useEffect, useMemo, useState } from "react";

/**
 * 홈 대시보드용 — 오늘 기록 + 세션 탭 상태 + 시각으로 UI 상태 산출.
 */
export function useUserWorkoutUiState(workouts: WorkoutRow[], hydrated: boolean, missedDayHourLocal?: number): UserWorkoutUiState {
  const [now, setNow] = useState(() => new Date());
  const [sessionActive, setSessionActive] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    const read = () => setSessionActive(readWorkoutSessionActive());
    read();
    window.addEventListener(WORKOUT_SESSION_CHANGE_EVENT, read);
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === WORKOUT_SESSION_STORAGE_KEY) read();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.clearInterval(id);
      window.removeEventListener(WORKOUT_SESSION_CHANGE_EVENT, read);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const todayComplete = useMemo(() => hasWorkoutToday(workouts, now), [workouts, now]);

  return useMemo(() => {
    if (!hydrated) return "idle";
    return resolveUserWorkoutUiState({
      todayWorkoutComplete: todayComplete,
      workoutSessionActive: sessionActive,
      now,
      missedHourThreshold: missedDayHourLocal,
    });
  }, [hydrated, todayComplete, sessionActive, now, missedDayHourLocal]);
}
