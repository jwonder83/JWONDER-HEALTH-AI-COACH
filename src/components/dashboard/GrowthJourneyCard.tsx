"use client";

import { buildGrowthSnapshot } from "@/lib/dashboard/growth-snapshot";
import { LS_GOALS, loadLocalGoals, saveLocalGoals, type LocalGoals } from "@/lib/dashboard/local-goals";
import type { WorkoutRow } from "@/types/workout";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const PRESETS: { label: string; months: 1 | 3 | 6 }[] = [
  { label: "3개월 벌크업 · 체중 증가", months: 3 },
  { label: "3개월 컷 · 체지방 감소", months: 3 },
  { label: "6개월 벌크업", months: 6 },
  { label: "1개월 재정비 · 유지", months: 1 },
];

type Props = {
  workouts: WorkoutRow[];
  hydrated: boolean;
};

export function GrowthJourneyCard({ workouts, hydrated }: Props) {
  const [goals, setGoals] = useState<LocalGoals>({});
  const [open, setOpen] = useState(false);

  const reload = useCallback(() => setGoals(loadLocalGoals()), []);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === LS_GOALS || e.key === null) reload();
    }
    function onGoalsChanged() {
      reload();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("jws-goals-changed", onGoalsChanged);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("jws-goals-changed", onGoalsChanged);
    };
  }, [reload]);

  const snapshot = useMemo(() => buildGrowthSnapshot(workouts, new Date(), goals), [workouts, goals]);

  function applyPreset(p: { label: string; months: 1 | 3 | 6 }) {
    setGoals((prev) => {
      const next: LocalGoals = {
        ...prev,
        longTermLabel: p.label,
        longTermMonths: p.months,
        longTermStartedAt: new Date().toISOString().slice(0, 10),
      };
      saveLocalGoals(next);
      window.dispatchEvent(new Event("jws-goals-changed"));
      return next;
    });
    setOpen(false);
  }

  function clearLongTerm() {
    setGoals((prev) => {
      const next: LocalGoals = { ...prev, longTermLabel: undefined, longTermMonths: undefined, longTermStartedAt: undefined };
      saveLocalGoals(next);
      window.dispatchEvent(new Event("jws-goals-changed"));
      return next;
    });
  }

  const hasLongTerm = Boolean(goals.longTermLabel || goals.longTermMonths);

  return (
    <section className="mt-6 rounded-2xl border border-neutral-200 bg-gradient-to-br from-white via-violet-50/40 to-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:from-zinc-950 dark:via-violet-950/20 dark:to-zinc-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-700/90 dark:text-violet-300/90">성장 트래킹</p>
          <h2 className="font-display mt-1.5 text-[1.2rem] font-bold tracking-[-0.02em] text-apple-ink dark:text-zinc-100 sm:text-[1.35rem]">
            {hydrated ? snapshot.longTermTitle : "불러오는 중…"}
          </h2>
          <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-apple-subtle dark:text-zinc-400">
            {hasLongTerm
              ? "세트·볼륨·PR을 한 카드에 모았어요. 주간 세트 목표가 있으면 달성률 분모가 더 정확해져요."
              : "「목표 설정」에서 벌크·컷 등을 고르면 제목이 맞춰지고, 없어도 기본 3개월 추적으로 성장 곡선을 보여 드려요."}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="rounded-xl border border-violet-300/80 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-violet-900 transition hover:border-violet-500 dark:border-violet-700 dark:bg-zinc-900 dark:text-violet-100"
          >
            {open ? "닫기" : "목표 설정"}
          </button>
          {hasLongTerm ? (
            <button
              type="button"
              onClick={clearLongTerm}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold text-apple-subtle transition hover:border-rose-300 hover:text-rose-700 dark:border-zinc-700 dark:bg-zinc-900"
            >
              장기 목표 초기화
            </button>
          ) : null}
        </div>
      </div>

      {open ? (
        <div className="mt-4 flex flex-wrap gap-2 rounded-xl border border-violet-200/80 bg-violet-50/60 p-3 dark:border-violet-900/50 dark:bg-violet-950/30">
          <p className="w-full text-[11px] font-semibold text-violet-900 dark:text-violet-200">프리셋 (시작일은 오늘로 잡습니다)</p>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              className="rounded-lg border border-violet-300/70 bg-white px-3 py-2 text-[12px] font-semibold text-violet-950 shadow-sm transition hover:bg-violet-600 hover:text-white dark:border-violet-700 dark:bg-zinc-900 dark:text-violet-100 dark:hover:bg-violet-600"
            >
              {p.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-5">
        <div className="flex items-baseline justify-between gap-2 text-[11px] font-semibold text-apple-subtle dark:text-zinc-500">
          <span>장기 루틴 달성률</span>
          <span className="tabular-nums text-apple-ink dark:text-zinc-200">{hydrated ? `${snapshot.longProgressPercent}%` : "—"}</span>
        </div>
        <div
          className="mt-2 h-2.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-zinc-800"
          role="progressbar"
          aria-valuenow={hydrated ? snapshot.longProgressPercent : 0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="장기 목표 진행률"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-[width] duration-700 dark:from-violet-500 dark:to-fuchsia-400"
            style={{ width: `${hydrated ? snapshot.longProgressPercent : 0}%` }}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-apple-subtle dark:text-zinc-500">
          기간 내 세트 수 ÷ (기간×주당 목표 세트)로 근사했어요. 주간 목표는 아래 「이번 주 목표」와 같습니다.
        </p>
      </div>

      <ul className="mt-5 space-y-2 border-t border-neutral-200/90 pt-4 dark:border-zinc-800">
        {!hydrated ? (
          <li className="text-[13px] text-apple-subtle">불러오는 중…</li>
        ) : snapshot.summaryLines.length ? (
          snapshot.summaryLines.map((line, i) => (
            <li
              key={`${i}-${line.slice(0, 24)}`}
              className="flex gap-2 text-[13px] font-medium leading-relaxed text-apple-ink before:mt-2 before:size-1.5 before:shrink-0 before:rounded-full before:bg-violet-500 before:content-[''] dark:text-zinc-200"
            >
              {line}
            </li>
          ))
        ) : (
          <li className="text-[13px] text-apple-subtle dark:text-zinc-400">운동 기록이 쌓이면 성장 요약이 여기 표시돼요.</li>
        )}
      </ul>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200/90 pt-4 text-[12px] text-apple-subtle dark:border-zinc-800 dark:text-zinc-500">
        <span>
          이번 달 누적 볼륨{" "}
          <span className="font-bold tabular-nums text-apple-ink dark:text-zinc-200">
            {hydrated ? Math.round(snapshot.thisMonthVolume * 10) / 10 : "—"}
          </span>
          <span className="text-apple-subtle"> · 세트 {hydrated ? snapshot.thisMonthRows : "—"}건</span>
        </span>
        <Link href="/performance" className="font-semibold text-violet-700 underline-offset-4 hover:underline dark:text-violet-300">
          성과 상세 →
        </Link>
      </div>
    </section>
  );
}
