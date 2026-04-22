"use client";

import type { BriefingDecisionKind, DailyStatusBriefing, FatigueLevel } from "@/lib/dashboard/daily-status-briefing";
import Link from "next/link";

const shell =
  "rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/95 via-white to-indigo-50/60 p-4 shadow-md ring-1 ring-violet-500/[0.06] sm:p-5 dark:border-violet-900/45 dark:from-violet-950/35 dark:via-zinc-950 dark:to-indigo-950/30 dark:ring-white/[0.05]";

function fatigueLabel(level: FatigueLevel): string {
  if (level === "high") return "높음";
  if (level === "medium") return "중간";
  return "낮음";
}

function fatigueBarClass(level: FatigueLevel): string {
  if (level === "high") return "from-rose-500 to-orange-500";
  if (level === "medium") return "from-amber-400 to-amber-600";
  return "from-emerald-400 to-teal-500";
}

function fatigueTextClass(level: FatigueLevel): string {
  if (level === "high") return "text-rose-700 dark:text-rose-300";
  if (level === "medium") return "text-amber-800 dark:text-amber-300";
  return "text-emerald-800 dark:text-emerald-300";
}

function decisionKindLabel(kind: BriefingDecisionKind): string {
  if (kind === "rest") return "휴식 결정";
  if (kind === "intensity_cap") return "강도 하향";
  return "표준 진행";
}

function decisionKindBadgeClass(kind: BriefingDecisionKind): string {
  if (kind === "rest")
    return "border-sky-600/35 bg-sky-500/15 text-sky-900 dark:border-sky-400/40 dark:bg-sky-950/50 dark:text-sky-100";
  if (kind === "intensity_cap")
    return "border-amber-700/35 bg-amber-500/15 text-amber-950 dark:border-amber-400/40 dark:bg-amber-950/45 dark:text-amber-100";
  return "border-emerald-700/30 bg-emerald-500/12 text-emerald-900 dark:border-emerald-500/35 dark:bg-emerald-950/40 dark:text-emerald-100";
}

type Props = {
  briefing: DailyStatusBriefing | null;
  hydrated: boolean;
  /** 체크인 후 확정 플랜 한 줄(상태→결정→실행) */
  confirmedPlanLine?: string | null;
};

export function DailyStatusBriefingCard({ briefing, hydrated, confirmedPlanLine }: Props) {
  return (
    <section className={shell} aria-labelledby="daily-briefing-heading" aria-busy={!hydrated}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="daily-briefing-heading" className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-700/90 dark:text-violet-300/90">
            하루 브리핑 · 행동 결정
          </h2>
          <p className="mt-1 text-[11px] font-medium text-apple-subtle">데이터 → 해석 → 결정</p>
        </div>
        {!hydrated || !briefing ? null : (
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${decisionKindBadgeClass(briefing.decisionKind)}`}
          >
            {decisionKindLabel(briefing.decisionKind)}
          </span>
        )}
      </div>

      {!hydrated ? (
        <div className="mt-4 space-y-3 animate-pulse" aria-hidden>
          <div className="h-2 rounded-full bg-violet-200/60 dark:bg-violet-900/40" />
          <div className="h-16 rounded-xl bg-violet-100/80 dark:bg-violet-950/40" />
          <div className="h-2 rounded-full bg-indigo-200/50 dark:bg-indigo-900/40" />
        </div>
      ) : !briefing ? null : (
        <>
          {confirmedPlanLine ? (
            <div className="mt-4 rounded-xl border border-violet-300/80 bg-white/90 px-3.5 py-3.5 shadow-sm dark:border-violet-800/50 dark:bg-zinc-900/50">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-800/90 dark:text-violet-300/90">확정 플랜</p>
              <p className="mt-2 text-[15px] font-extrabold leading-snug tracking-[-0.02em] text-apple-ink dark:text-zinc-50 sm:text-[16px]">
                {confirmedPlanLine}
              </p>
            </div>
          ) : null}
          {/* 1. 상태 분석 */}
          <div className="mt-4 rounded-xl border border-violet-200/80 bg-white/85 px-3.5 py-3 dark:border-violet-900/45 dark:bg-zinc-900/45">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet-700/85 dark:text-violet-300/85">상태 분석</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${fatigueTextClass(briefing.fatigue)} border-current/25 bg-white/90 dark:bg-zinc-900/70`}
              >
                피로 {fatigueLabel(briefing.fatigue)}
              </span>
              <span className="rounded-full border border-neutral-200/90 bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold text-apple-subtle dark:border-zinc-600 dark:bg-zinc-900/70">
                7일 세트 {briefing.metrics.sessionRowsLast7}개
              </span>
            </div>
            <p className={`mt-2 text-[13px] font-semibold leading-snug text-apple-ink dark:text-zinc-100`}>{briefing.statusSummary}</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-apple-subtle">피로도</p>
                  <p className={`text-[12px] font-bold tabular-nums ${fatigueTextClass(briefing.fatigue)}`}>
                    {briefing.fatigueScore}
                    <span className="text-[10px] font-semibold text-apple-subtle">/100</span>
                  </p>
                </div>
                <div
                  className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]"
                  role="meter"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={briefing.fatigueScore}
                  aria-label={`피로도 게이지 ${briefing.fatigueScore}점`}
                >
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${fatigueBarClass(briefing.fatigue)} transition-[width] duration-500 ease-out`}
                    style={{ width: `${briefing.fatigueScore}%` }}
                  />
                </div>
                <div className="mt-2 flex gap-1" aria-hidden>
                  {(["low", "medium", "high"] as const).map((lvl) => (
                    <span
                      key={lvl}
                      className={`h-1 flex-1 rounded-full ${
                        briefing.fatigue === lvl
                          ? lvl === "high"
                            ? "bg-rose-500"
                            : lvl === "medium"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          : "bg-neutral-200 dark:bg-zinc-800"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-apple-subtle">오늘 목표 강도</p>
                  <p className="text-[12px] font-bold tabular-nums text-indigo-800 dark:text-indigo-200">
                    {briefing.decisionKind === "rest" ? "휴식" : `${briefing.recommendedIntensityPercent}%`}
                  </p>
                </div>
                <div
                  className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]"
                  role="meter"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={briefing.decisionKind === "rest" ? 0 : briefing.recommendedIntensityPercent}
                  aria-label={
                    briefing.decisionKind === "rest"
                      ? "오늘 목표 강도 휴식"
                      : `오늘 목표 운동 강도 ${briefing.recommendedIntensityPercent}퍼센트`
                  }
                >
                  <div
                    className={`h-full rounded-full bg-gradient-to-r transition-[width] duration-500 ease-out ${
                      briefing.decisionKind === "rest" ? "from-zinc-400 to-zinc-500" : "from-indigo-500 to-violet-500"
                    }`}
                    style={{ width: briefing.decisionKind === "rest" ? "0%" : `${briefing.recommendedIntensityPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] leading-snug text-apple-subtle">
                  {briefing.decisionKind === "rest"
                    ? "무리한 볼륨 없이 회복에 집중하세요."
                    : `중량·횟수는 평소의 ${briefing.recommendedIntensityPercent}%에 맞추면 됩니다.`}
                </p>
              </div>
            </div>
          </div>

          {/* 2. 오늘 결정 */}
          <div className="mt-4 rounded-xl border-2 border-violet-400/45 bg-gradient-to-br from-white to-violet-50/90 px-3.5 py-3.5 shadow-sm dark:border-violet-600/40 dark:from-zinc-900 dark:to-violet-950/35">
            <p className="text-[10px] font-bold uppercase tracking-wide text-violet-800 dark:text-violet-200">오늘 결정</p>
            <p className="mt-2 text-[16px] font-extrabold leading-snug tracking-[-0.02em] text-apple-ink dark:text-zinc-50 sm:text-[17px]" aria-live="polite">
              {briefing.aiMessage}
            </p>
          </div>

          {/* 3. 해석 + 데이터 근거 */}
          <div className="mt-3 rounded-xl border border-violet-200/70 bg-white/80 px-3.5 py-3 dark:border-violet-900/40 dark:bg-zinc-900/40">
            <p className="text-[10px] font-bold uppercase tracking-wide text-violet-700/80 dark:text-violet-300/80">해석</p>
            <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-apple-ink dark:text-zinc-100">{briefing.interpretationLine}</p>
            <p className="mt-3 flex flex-wrap items-baseline gap-1.5 text-[11px] leading-relaxed text-apple-subtle dark:text-zinc-400">
              <span className="shrink-0 rounded border border-violet-300/70 bg-violet-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-violet-800 dark:border-violet-600/50 dark:bg-violet-950/60 dark:text-violet-200">
                데이터
              </span>
              <span>{briefing.reasonLine}</span>
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {briefing.decisionKind === "rest" ? (
              <>
                <Link
                  href="/program"
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-4 text-[13px] font-bold text-white shadow-md shadow-sky-500/20 ring-2 ring-sky-400/25 transition hover:opacity-95 active:scale-[0.99] sm:flex-none"
                >
                  회복·가벼운 루틴 보기
                </Link>
                <Link
                  href="/workout"
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border-2 border-violet-400/80 bg-white/95 px-4 text-[13px] font-bold text-violet-900 dark:border-violet-500 dark:bg-zinc-900/80 dark:text-violet-100 sm:flex-none"
                >
                  짧게만 기록하기
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/workout"
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 text-[13px] font-bold text-white shadow-md shadow-violet-500/25 ring-2 ring-violet-400/30 transition hover:opacity-95 active:scale-[0.99] sm:flex-none"
                >
                  이 결정으로 시작
                </Link>
                <Link
                  href="/program"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl border-2 border-violet-300/80 bg-white/90 px-4 text-[13px] font-bold text-violet-900 dark:border-violet-700 dark:bg-zinc-900/70 dark:text-violet-200"
                >
                  프로그램 훑기
                </Link>
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}
