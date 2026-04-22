"use client";

import type { DailyCheckinCondition, DailyCheckinTimeBudget } from "@/lib/habit-loop/daily-checkin";
import { saveDailyCheckin } from "@/lib/habit-loop/daily-checkin";
import { useCallback, useEffect, useState, type ReactNode } from "react";

type Props = {
  userId: string;
  open: boolean;
  onCompleted: () => void;
};

const scrim =
  "fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(15,23,42,0.45)] p-5 sm:p-8 dark:bg-black/50";

const card =
  "w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.12)] sm:p-8 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)]";

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
      className={`min-h-[52px] rounded-xl border-2 px-4 text-[15px] font-bold transition active:scale-[0.98] ${
        selected
          ? "border-black bg-black text-white shadow-sm ring-2 ring-black/10 dark:border-white dark:bg-white dark:text-zinc-950 dark:ring-white/20"
          : "border-neutral-200 bg-neutral-50 text-apple-ink hover:border-neutral-400 hover:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
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
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-700/90 dark:text-violet-300/90">오늘 체크인</p>
        <h1
          id="checkin-title"
          className="font-display mt-3 text-[1.65rem] font-bold leading-tight tracking-[-0.03em] text-apple-ink sm:text-[1.85rem] dark:text-zinc-100"
        >
          {step === 1 ? "오늘 컨디션은 어떤가요?" : "오늘 운동 가능 시간은?"}
        </h1>
        <p id="checkin-desc" className="mt-2 text-[14px] leading-relaxed text-apple-subtle dark:text-zinc-400">
          {step === 1
            ? "대충이라도 맞춰 주면 오늘 운동 세기랑 시간 짜는 데 써요. 여기만 통과하면 돼요."
            : "오늘 현실적으로 쓸 수 있는 시간만 골라 주세요. 루틴 길이에 반영돼요."}
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
              className="order-2 min-h-[48px] rounded-xl border border-neutral-200 bg-white px-6 text-[14px] font-semibold text-apple-ink transition hover:border-black hover:bg-neutral-50 sm:order-1 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-400"
            >
              이전
            </button>
          ) : null}
          {step === 1 ? (
            <button
              type="button"
              disabled={!condition}
              onClick={() => setStep(2)}
              className="min-h-[48px] rounded-xl border border-black bg-black px-8 text-[15px] font-bold text-white transition enabled:hover:bg-neutral-800 disabled:opacity-40 dark:border-white dark:bg-white dark:text-zinc-950 dark:enabled:hover:bg-zinc-200"
            >
              다음
            </button>
          ) : (
            <button
              type="button"
              disabled={!timeBudget}
              onClick={submit}
              className="order-1 min-h-[48px] rounded-xl border border-black bg-black px-8 text-[15px] font-bold text-white transition enabled:hover:bg-neutral-800 disabled:opacity-40 sm:order-2 dark:border-white dark:bg-white dark:text-zinc-950 dark:enabled:hover:bg-zinc-200"
            >
              이대로 쓰기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
