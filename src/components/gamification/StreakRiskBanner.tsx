"use client";

import Link from "next/link";

type Props = {
  streakDays: number;
  /** 저녁·오늘 미기록 시 표시 */
  visible: boolean;
  /** 어제 공백 후 복귀일 — 문구를 부드럽게 바꿈 */
  recoveryDay?: boolean;
};

/** 연속 기록이 오늘 안에 끊길 수 있을 때 강조 배너 */
export function StreakRiskBanner({ streakDays, visible, recoveryDay = false }: Props) {
  if (!visible || streakDays < 1) return null;

  if (recoveryDay) {
    return (
      <div
        role="status"
        className="rounded-2xl border-2 border-teal-400/55 bg-gradient-to-r from-teal-50 via-cyan-50 to-teal-50 px-4 py-3 shadow-md ring-2 ring-teal-300/25 dark:border-teal-700/60 dark:from-teal-950/55 dark:via-cyan-950/35 dark:to-teal-950/45 dark:ring-teal-800/30"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-900/85 dark:text-teal-200/90">복귀 · 연속 유지</p>
        <p className="mt-1 text-[15px] font-semibold leading-snug text-teal-950 dark:text-teal-50">
          어제는 비었지만, 흐름은 <span className="tabular-nums">{streakDays}일</span> 맥락으로 이어져 있어요.
        </p>
        <p className="mt-1 text-[13px] text-teal-900/88 dark:text-teal-100/85">오늘은 짧은 세트로 리듬만 되찾아도 충분해요.</p>
        <Link
          href="/workout"
          className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-teal-600 px-4 text-[13px] font-bold text-white transition hover:bg-teal-500 dark:bg-teal-500 dark:hover:bg-teal-400"
        >
          가벼운 한 세트 시작
        </Link>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="rounded-2xl border-2 border-amber-400/60 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 px-4 py-3 shadow-md ring-2 ring-amber-300/30 dark:border-amber-600/70 dark:from-amber-950/60 dark:via-orange-950/40 dark:to-amber-950/50 dark:ring-amber-700/30"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-900/80 dark:text-amber-200/90">연속 스택</p>
      <p className="mt-1 text-[15px] font-semibold leading-snug text-amber-950 dark:text-amber-50">
        오늘 0세트면 내일부터 <span className="tabular-nums">{streakDays}일</span> 연속이 리셋될 수 있어요.
      </p>
      <p className="mt-1 text-[13px] text-amber-900/85 dark:text-amber-100/85">세트 하나만 박아도 스택은 그대로예요.</p>
      <Link
        href="/workout"
        className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-amber-600 px-4 text-[13px] font-bold text-white transition hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-400"
      >
        지금 가서 한 세트
      </Link>
    </div>
  );
}
