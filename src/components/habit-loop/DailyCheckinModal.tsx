"use client";

import type { DailyCheckinCondition, DailyCheckinTimeBudget } from "@/lib/habit-loop/daily-checkin";
import { saveDailyCheckin } from "@/lib/habit-loop/daily-checkin";
import { useCallback, useEffect, useState, type ReactNode } from "react";

type Props = {
  userId: string;
  open: boolean;
  onCompleted: () => void;
};

const scrim = "fixed inset-0 z-[120] flex flex-col bg-slate-950 text-white";
const card = "mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-10 sm:px-10";
const qTitle = "font-display text-2xl font-bold tracking-[-0.03em] sm:text-[1.75rem]";
const sub = "mt-2 text-[14px] leading-relaxed text-white/75";
const grid = "mt-8 grid gap-3 sm:grid-cols-3";

function Choice({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[52px] rounded-2xl border-2 px-4 text-[15px] font-bold transition active:scale-[0.98] ${
        selected
          ? "border-emerald-300 bg-emerald-400/20 text-white ring-2 ring-emerald-400/50"
          : "border-white/20 bg-white/5 text-white/90 hover:border-white/40 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

export function DailyCheckinModal({ userId, open, onCompleted }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [condition, setCondition] = useState<DailyCheckinCondition | null>(null);
  const [timeBudget, setTimeBudget] = useState<DailyCheckinTimeBudget | null>(null);

  const reset = useCallback(() => {
    setStep(1);
    setCondition(null);
    setTimeBudget(null);
  }, []);

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const submit = useCallback(() => {
    if (!condition || !timeBudget) return;
    saveDailyCheckin(userId, { condition, timeMinutes: timeBudget });
    onCompleted();
  }, [condition, onCompleted, timeBudget, userId]);

  if (!open) return null;

  return (
    <div className={scrim} role="dialog" aria-modal="true" aria-labelledby="checkin-title" aria-describedby="checkin-desc">
      <div className={card}>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300/90">데일리 체크인 · 필수</p>
        <h1 id="checkin-title" className={`${qTitle} mt-3`}>
          {step === 1 ? "오늘 컨디션은 어떤가요?" : "오늘 운동 가능 시간은?"}
        </h1>
        <p id="checkin-desc" className={sub}>
          {step === 1
            ? "솔직하게 고르면 오늘 강도·시간 플랜이 맞춰져요. 스킵할 수 없어요."
            : "가능한 범위만 선택하세요. 플랜 예상 시간에 반영됩니다."}
        </p>

        {step === 1 ? (
          <div className={grid}>
            <Choice selected={condition === "good"} onClick={() => setCondition("good")}>
              좋음
            </Choice>
            <Choice selected={condition === "normal"} onClick={() => setCondition("normal")}>
              보통
            </Choice>
            <Choice selected={condition === "bad"} onClick={() => setCondition("bad")}>
              나쁨
            </Choice>
          </div>
        ) : (
          <div className={grid}>
            <Choice selected={timeBudget === 20} onClick={() => setTimeBudget(20)}>
              20분
            </Choice>
            <Choice selected={timeBudget === 40} onClick={() => setTimeBudget(40)}>
              40분
            </Choice>
            <Choice selected={timeBudget === 60} onClick={() => setTimeBudget(60)}>
              60분
            </Choice>
          </div>
        )}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-end">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="order-2 min-h-[52px] rounded-2xl border border-white/25 px-6 text-[14px] font-semibold text-white/85 hover:bg-white/10 sm:order-1"
            >
              이전
            </button>
          ) : null}
          {step === 1 ? (
            <button
              type="button"
              disabled={!condition}
              onClick={() => setStep(2)}
              className="min-h-[52px] rounded-2xl bg-emerald-400 px-8 text-[15px] font-bold text-slate-950 shadow-lg shadow-emerald-500/25 transition enabled:hover:bg-emerald-300 disabled:opacity-40"
            >
              다음
            </button>
          ) : (
            <button
              type="button"
              disabled={!timeBudget}
              onClick={submit}
              className="order-1 min-h-[52px] rounded-2xl bg-white px-8 text-[15px] font-bold text-slate-950 transition enabled:hover:bg-emerald-100 disabled:opacity-40 sm:order-2"
            >
              오늘 플랜 확정
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
