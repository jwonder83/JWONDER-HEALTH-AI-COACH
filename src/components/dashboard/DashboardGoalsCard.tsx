"use client";

import {
  endOfMonth,
  endOfWeekSunday,
  rollupPeriod,
  startOfMonth,
  startOfWeekMonday,
} from "@/lib/workouts/period-stats";
import type { WorkoutRow } from "@/types/workout";
import { useEffect, useMemo, useState } from "react";

const LS_GOALS = "jws_goals_v1";

export type LocalGoals = {
  /** 이번 주에 목표로 하는 기록(행) 개수 */
  weeklySessionTarget?: number;
  /** 참고용 목표 체중(kg) */
  targetWeightKg?: number;
};

function loadGoals(): LocalGoals {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LS_GOALS);
    if (!raw) return {};
    const p = JSON.parse(raw) as LocalGoals;
    return {
      weeklySessionTarget:
        typeof p.weeklySessionTarget === "number" && p.weeklySessionTarget > 0 ? p.weeklySessionTarget : undefined,
      targetWeightKg: typeof p.targetWeightKg === "number" && p.targetWeightKg > 0 ? p.targetWeightKg : undefined,
    };
  } catch {
    return {};
  }
}

function saveGoals(g: LocalGoals) {
  localStorage.setItem(LS_GOALS, JSON.stringify(g));
}

type Props = { workouts: WorkoutRow[] };

export function DashboardGoalsCard({ workouts }: Props) {
  const [goals, setGoals] = useState<LocalGoals>({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setGoals(loadGoals());
  }, []);

  const mon = useMemo(() => startOfWeekMonday(), []);
  const sun = useMemo(() => endOfWeekSunday(mon), [mon]);
  const week = useMemo(() => rollupPeriod(workouts, mon, sun), [workouts, mon, sun]);

  const mStart = useMemo(() => startOfMonth(), []);
  const mEnd = useMemo(() => endOfMonth(), []);
  const month = useMemo(() => rollupPeriod(workouts, mStart, mEnd), [workouts, mStart, mEnd]);

  const lastWeight = useMemo(() => {
    const sorted = [...workouts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const last = sorted[0];
    return last ? Number(last.weight_kg) : null;
  }, [workouts]);

  const weekProgress =
    goals.weeklySessionTarget && goals.weeklySessionTarget > 0
      ? Math.min(100, Math.round((week.rowCount / goals.weeklySessionTarget) * 100))
      : null;

  return (
    <div className="mt-6 rounded-[1.5rem] border border-orange-100/90 bg-white/90 p-4 shadow-inner ring-1 ring-orange-50/70 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-apple">이번 주</p>
          <p className="font-display mt-1 text-[1.125rem] font-bold text-apple-ink sm:text-[1.25rem]">
            기록 {week.rowCount}건 · 볼륨 합{" "}
            <span className="tabular-nums">{Math.round(week.volume * 10) / 10}</span>
          </p>
          {week.topExercise ? (
            <p className="mt-1 text-[13px] text-apple-subtle">
              가장 많이 남긴 종목: <span className="font-semibold text-apple-ink">{week.topExercise}</span>
            </p>
          ) : (
            <p className="mt-1 text-[13px] text-apple-subtle">이번 주에는 아직 기록이 없어요.</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="shrink-0 rounded-full border border-orange-100 bg-u-lavender/30 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-apple-ink transition hover:bg-u-lavender/50"
        >
          {open ? "목표 닫기" : "목표 설정"}
        </button>
      </div>

      {goals.weeklySessionTarget || goals.targetWeightKg ? (
        <div className="mt-4 space-y-3 border-t border-orange-100/80 pt-4">
          {goals.weeklySessionTarget ? (
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-apple-subtle">
                <span>주간 기록 목표</span>
                <span className="tabular-nums">
                  {week.rowCount} / {goals.weeklySessionTarget}건
                </span>
              </div>
              <div
                className="mt-1.5 h-2 overflow-hidden rounded-full bg-orange-100/80"
                role="progressbar"
                aria-valuenow={week.rowCount}
                aria-valuemin={0}
                aria-valuemax={goals.weeklySessionTarget}
                aria-label="주간 기록 목표 진행"
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-apple to-[#ff8a7a] transition-all duration-500"
                  style={{ width: `${weekProgress ?? 0}%` }}
                />
              </div>
            </div>
          ) : null}
          {goals.targetWeightKg ? (
            <p className="text-[12px] text-apple-subtle">
              목표 체중 <span className="font-semibold tabular-nums text-apple-ink">{goals.targetWeightKg}kg</span>
              {lastWeight != null ? (
                <>
                  {" "}
                  · 최근 저장 중량{" "}
                  <span className="font-semibold tabular-nums text-apple-ink">{lastWeight}kg</span> (참고)
                </>
              ) : null}
            </p>
          ) : null}
        </div>
      ) : null}

      {open ? (
        <div className="mt-4 space-y-3 border-t border-orange-100/80 pt-4">
          <label className="block text-[12px] font-medium text-apple-subtle">
            주간 기록 목표(건)
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-xl border border-orange-100/90 px-3 py-2 text-[15px] text-apple-ink shadow-sm focus:border-apple/40 focus:outline-none focus:ring-2 focus:ring-apple/20"
              placeholder="예: 12"
              defaultValue={goals.weeklySessionTarget ?? ""}
              onBlur={(e) => {
                const v = parseInt(e.target.value, 10);
                setGoals((prev) => {
                  const next: LocalGoals = {
                    ...prev,
                    weeklySessionTarget: Number.isFinite(v) && v > 0 ? v : undefined,
                  };
                  saveGoals(next);
                  return next;
                });
              }}
            />
          </label>
          <label className="block text-[12px] font-medium text-apple-subtle">
            목표 체중(kg, 참고)
            <input
              type="number"
              min={1}
              step={0.1}
              className="mt-1 w-full rounded-xl border border-orange-100/90 px-3 py-2 text-[15px] text-apple-ink shadow-sm focus:border-apple/40 focus:outline-none focus:ring-2 focus:ring-apple/20"
              placeholder="예: 72"
              defaultValue={goals.targetWeightKg ?? ""}
              onBlur={(e) => {
                const v = parseFloat(e.target.value);
                setGoals((prev) => {
                  const next: LocalGoals = {
                    ...prev,
                    targetWeightKg: Number.isFinite(v) && v > 0 ? v : undefined,
                  };
                  saveGoals(next);
                  return next;
                });
              }}
            />
          </label>
          <p className="text-[11px] leading-relaxed text-apple-subtle">
            이 기기 브라우저에만 저장됩니다. 이번 달 볼륨 합{" "}
            <span className="font-semibold tabular-nums text-apple-ink">{Math.round(month.volume * 10) / 10}</span>, 기록{" "}
            <span className="font-semibold tabular-nums text-apple-ink">{month.rowCount}</span>건
          </p>
        </div>
      ) : null}
    </div>
  );
}
