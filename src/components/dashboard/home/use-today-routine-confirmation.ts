"use client";

import {
  dateKeyFromDate,
  readPersistedRoutineFlow,
  resolveInitialRoutineStatus,
  routineKeyFromPlan,
  ROUTINE_CONFIRMATION_LS_KEY,
  writePersistedRoutineFlow,
  type RoutineFlowStatus,
} from "@/lib/routine/today-routine-confirmation";
import type { TodayRoutinePlan } from "@/lib/routine/today-routine-plan";
import { useCallback, useEffect, useMemo, useState } from "react";

type Args = {
  routine: TodayRoutinePlan;
  todayWorkoutComplete: boolean;
};

/**
 * 오늘 루틴 확정(suggested → confirmed) 및 완료(completed)를 localStorage에 동기화.
 */
export function useTodayRoutineConfirmation({ routine, todayWorkoutComplete }: Args) {
  const dateKey = useMemo(() => dateKeyFromDate(new Date()), []);
  const routineKey = useMemo(() => routineKeyFromPlan(routine), [routine]);

  const [status, setStatus] = useState<RoutineFlowStatus>("suggested");

  useEffect(() => {
    const persisted = readPersistedRoutineFlow();
    setStatus(resolveInitialRoutineStatus(persisted, dateKey, routineKey, todayWorkoutComplete));
  }, [dateKey, routineKey, todayWorkoutComplete]);

  useEffect(() => {
    if (!todayWorkoutComplete) return;
    setStatus("completed");
    writePersistedRoutineFlow({ dateKey, routineKey, status: "completed" });
  }, [todayWorkoutComplete, dateKey, routineKey]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === ROUTINE_CONFIRMATION_LS_KEY || e.key === null) {
        const persisted = readPersistedRoutineFlow();
        setStatus(resolveInitialRoutineStatus(persisted, dateKey, routineKey, todayWorkoutComplete));
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [dateKey, routineKey, todayWorkoutComplete]);

  const confirm = useCallback(() => {
    if (todayWorkoutComplete) return;
    writePersistedRoutineFlow({ dateKey, routineKey, status: "confirmed" });
    setStatus("confirmed");
  }, [dateKey, routineKey, todayWorkoutComplete]);

  return { status, confirm };
}
