"use client";

import { AiCoachPresence } from "@/components/coaching/AiCoachPresence";
import { createClient } from "@/lib/supabase/client";
import { buildCoachPresenceMessage } from "@/lib/coaching/persistent-presence";
import { mapWorkoutRow } from "@/lib/workouts/map-db-row";
import { WORKOUTS_MUTATED_EVENT } from "@/lib/workouts/workouts-events";
import type { WorkoutRow } from "@/types/workout";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

type Props = {
  userId: string;
  children: ReactNode;
};

function hideCoachForPath(pathname: string): boolean {
  const p = pathname.split("?")[0] ?? "";
  if (p.startsWith("/legal")) return true;
  if (p.startsWith("/workout")) return true;
  return false;
}

/**
 * 앱 셸 안에서 운동 스냅샷을 한 번 불러와 상황별 코치 메시지를 보여 줍니다.
 * 개별 화면에서 메시지를 덮어쓰려면 같은 트리 안에 별도 `<AiCoachPresence message={…} />`를 두고
 * 이 래퍼에서는 `hideCoachForPath`에 해당 경로를 추가하세요.
 */
export function AppCoachSurface({ userId, children }: Props) {
  const pathname = usePathname() || "/";
  const [workouts, setWorkouts] = useState<WorkoutRow[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setWorkouts([]);
    } else {
      setWorkouts((data ?? []).map((r) => mapWorkoutRow(r as Record<string, unknown>)));
    }
    setHydrated(true);
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh, pathname]);

  useEffect(() => {
    function onMutated() {
      void refresh();
    }
    window.addEventListener(WORKOUTS_MUTATED_EVENT, onMutated);
    return () => window.removeEventListener(WORKOUTS_MUTATED_EVENT, onMutated);
  }, [refresh]);

  const message = useMemo(
    () =>
      buildCoachPresenceMessage({
        pathname,
        workouts,
        hydrated,
      }),
    [pathname, workouts, hydrated],
  );

  const show = !hideCoachForPath(pathname);

  return (
    <>
      {show ? <AiCoachPresence message={message} /> : null}
      {children}
    </>
  );
}
