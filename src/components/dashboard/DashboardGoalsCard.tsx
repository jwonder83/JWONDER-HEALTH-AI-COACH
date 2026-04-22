"use client";

import { loadLocalGoals, saveLocalGoals, type LocalGoals } from "@/lib/dashboard/local-goals";
import { computeLoggingStreakMerged } from "@/lib/workouts/streak";
import {
  endOfMonth,
  endOfWeekSunday,
  rollupPeriod,
  startOfMonth,
  startOfWeekMonday,
} from "@/lib/workouts/period-stats";
import type { WorkoutRow } from "@/types/workout";
import { useEffect, useMemo, useState } from "react";

export type { LocalGoals } from "@/lib/dashboard/local-goals";

type Props = { workouts: WorkoutRow[] };

export function DashboardGoalsCard({ workouts }: Props) {
  const [goals, setGoals] = useState<LocalGoals>({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setGoals(loadLocalGoals());
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

  const streak = useMemo(() => computeLoggingStreakMerged(workouts), [workouts]);

  return (
    <div id="section-weekly-goals" className="mt-6 border border-neutral-200 bg-white p-4 shadow-inner sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-apple-subtle">이번 주 스탯</p>
          <p className="font-display mt-1 text-[1.125rem] font-bold text-apple-ink sm:text-[1.25rem]">
            세트 {week.rowCount}개 · 볼륨 합{" "}
            <span className="tabular-nums">{Math.round(week.volume * 10) / 10}</span>
          </p>
          {week.topExercise ? (
            <p className="mt-1 text-[13px] text-apple-subtle">
              제일 많이 찍은 종목: <span className="font-semibold text-apple-ink">{week.topExercise}</span>
            </p>
          ) : (
            <p className="mt-1 text-[13px] text-apple-subtle">이번 주는 아직 조용해요.</p>
          )}
          {streak > 0 ? (
            <p className="mt-2 text-[12px] font-medium text-apple-subtle">
              연속 스택{" "}
              <span className="font-display text-[15px] font-bold tabular-nums text-apple-ink">{streak}</span>일 · 오늘
              또는 어제 기준
            </p>
          ) : workouts.length > 0 ? (
            <p className="mt-2 text-[12px] text-apple-subtle">
              연속 이어가려면 <span className="font-semibold text-apple-ink">오늘 or 어제</span>에 세트 하나만.
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="shrink-0 border border-neutral-300 bg-white px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-apple-ink transition hover:border-black"
        >
          {open ? "접기" : "목표 편집"}
        </button>
      </div>

      {goals.weeklySessionTarget || goals.targetWeightKg ? (
        <div className="mt-4 space-y-3 border-t border-neutral-200 pt-4">
          {goals.weeklySessionTarget ? (
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-apple-subtle">
                <span>주간 세트 목표</span>
                <span className="tabular-nums">
                  {week.rowCount} / {goals.weeklySessionTarget}건
                </span>
              </div>
              <div
                className="mt-1.5 h-0.5 overflow-hidden bg-neutral-200"
                role="progressbar"
                aria-valuenow={week.rowCount}
                aria-valuemin={0}
                aria-valuemax={goals.weeklySessionTarget}
                aria-label="주간 세트 목표 진행"
              >
                <div
                  className="h-full bg-black transition-all duration-500"
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
                  · 최근 찍힌 중량{" "}
                  <span className="font-semibold tabular-nums text-apple-ink">{lastWeight}kg</span> (참고)
                </>
              ) : null}
            </p>
          ) : null}
        </div>
      ) : null}

      {open ? (
        <div className="mt-4 space-y-3 border-t border-neutral-200 pt-4">
          <label className="block text-[12px] font-medium text-apple-subtle">
            주간 세트 목표(개)
            <input
              type="number"
              min={1}
              className="mt-1 w-full border border-neutral-200 px-3 py-2 text-[15px] text-apple-ink shadow-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/15"
              placeholder="예: 5 (주 5세트)"
              defaultValue={goals.weeklySessionTarget ?? ""}
              onBlur={(e) => {
                const v = parseInt(e.target.value, 10);
                setGoals((prev) => {
                  const next: LocalGoals = {
                    ...prev,
                    weeklySessionTarget: Number.isFinite(v) && v > 0 ? v : undefined,
                  };
                  saveLocalGoals(next);
                  window.dispatchEvent(new Event("jws-goals-changed"));
                  return next;
                });
              }}
            />
          </label>
          <label className="block text-[12px] font-medium text-apple-subtle">
            목표 체중(kg·참고용)
            <input
              type="number"
              min={1}
              step={0.1}
              className="mt-1 w-full border border-neutral-200 px-3 py-2 text-[15px] text-apple-ink shadow-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/15"
              placeholder="예: 72"
              defaultValue={goals.targetWeightKg ?? ""}
              onBlur={(e) => {
                const v = parseFloat(e.target.value);
                setGoals((prev) => {
                  const next: LocalGoals = {
                    ...prev,
                    targetWeightKg: Number.isFinite(v) && v > 0 ? v : undefined,
                  };
                  saveLocalGoals(next);
                  window.dispatchEvent(new Event("jws-goals-changed"));
                  return next;
                });
              }}
            />
          </label>
          <p className="text-[11px] leading-relaxed text-apple-subtle">
            이 브라우저에만 저장돼요. 이번 달 볼륨 합{" "}
            <span className="font-semibold tabular-nums text-apple-ink">{Math.round(month.volume * 10) / 10}</span>, 기록{" "}
            <span className="font-semibold tabular-nums text-apple-ink">{month.rowCount}</span>건
          </p>
        </div>
      ) : null}
    </div>
  );
}
