"use client";

import { last7DaysVolumeSeries } from "@/lib/dashboard/insights";
import { buildPerformanceStoryReport } from "@/lib/reports/build-performance-story";
import type { WorkoutRow } from "@/types/workout";
import { useMemo } from "react";

type Props = {
  rows: WorkoutRow[];
};

export function PerformanceStoryReport({ rows }: Props) {
  const report = useMemo(() => buildPerformanceStoryReport(rows), [rows]);
  const series7 = useMemo(() => last7DaysVolumeSeries(rows), [rows]);
  const maxWeekVol = useMemo(() => Math.max(1, ...report.weeksSeries.map((w) => w.volume)), [report.weeksSeries]);
  const maxDayVol = useMemo(() => Math.max(1, ...series7.map((s) => s.volume)), [series7]);
  const maxDays = 7;

  return (
    <article className="rounded-[1.75rem] border border-neutral-200/90 bg-gradient-to-b from-white to-neutral-50/90 p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-950/80">
      <header className="border-b border-neutral-200/80 pb-5 dark:border-zinc-800">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-700/90 dark:text-amber-400/90">AI 스타일 리포트</p>
        <h2 className="font-display mt-2 text-[1.5rem] font-bold leading-tight tracking-[-0.03em] text-apple-ink dark:text-zinc-100 sm:text-[1.75rem]">
          이번 주 운동 스토리
        </h2>
        <p className="mt-2 text-[13px] leading-relaxed text-apple-subtle dark:text-zinc-400">
          숫자를 풀어 쓴 요약이에요. 규칙 기반이며, 나중에 GPT와 연결해도 같은 화면 구조를 쓸 수 있어요.
        </p>
      </header>

      <div className="mt-6 rounded-2xl border border-neutral-200/80 bg-white/90 px-5 py-5 dark:border-zinc-800 dark:bg-zinc-900/50 sm:px-6 sm:py-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-apple-subtle dark:text-zinc-500">요약</p>
        <p className="mt-3 text-[17px] font-medium leading-[1.55] tracking-[-0.015em] text-apple-ink dark:text-zinc-100 sm:text-[18px]">
          {report.summary}
        </p>
        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-neutral-100 bg-neutral-50/90 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-900/80">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-apple-subtle dark:text-zinc-500">이번 주 볼륨</dt>
            <dd className="font-display mt-1 text-xl font-bold tabular-nums text-apple-ink dark:text-zinc-100">{report.thisWeekVolume}</dd>
          </div>
          <div className="rounded-xl border border-neutral-100 bg-neutral-50/90 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-900/80">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-apple-subtle dark:text-zinc-500">지난주 볼륨</dt>
            <dd className="font-display mt-1 text-xl font-bold tabular-nums text-apple-ink dark:text-zinc-100">{report.lastWeekVolume}</dd>
          </div>
          <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/80 px-3 py-3 dark:border-emerald-900/40 dark:bg-emerald-950/30">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-900/80 dark:text-emerald-300/90">주간 변화</dt>
            <dd className="font-display mt-1 text-xl font-bold tabular-nums text-emerald-900 dark:text-emerald-200">
              {report.weekOverWeekVolumePct === null
                ? rows.length === 0
                  ? "—"
                  : "신규"
                : `${report.weekOverWeekVolumePct > 0 ? "+" : ""}${report.weekOverWeekVolumePct}%`}
            </dd>
          </div>
          <div className="rounded-xl border border-neutral-100 bg-neutral-50/90 px-3 py-3 dark:border-zinc-800 dark:bg-zinc-900/80">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-apple-subtle dark:text-zinc-500">기록 행 수</dt>
            <dd className="font-display mt-1 text-xl font-bold tabular-nums text-apple-ink dark:text-zinc-100">
              {report.thisWeekRows}
              <span className="text-sm font-medium text-apple-subtle dark:text-zinc-500"> / {report.lastWeekRows}</span>
            </dd>
          </div>
        </dl>
      </div>

      <section className="mt-8" aria-labelledby="report-highlights">
        <h3 id="report-highlights" className="text-[11px] font-bold uppercase tracking-[0.2em] text-apple-subtle dark:text-zinc-500">
          주요 포인트
        </h3>
        <ul className="mt-3 space-y-3">
          {report.highlights.map((line, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-xl border border-neutral-200/70 bg-white px-4 py-3 text-[15px] font-medium leading-snug text-apple-ink dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-100"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-black text-[12px] font-bold text-white dark:bg-zinc-100 dark:text-black" aria-hidden>
                {i + 1}
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2" aria-label="주간 시각화">
        <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-apple-subtle dark:text-zinc-500">주간 볼륨 추이</h3>
          <p className="mt-1 text-[12px] text-apple-subtle dark:text-zinc-500">최근 8주 · kg×회×세트 합</p>
          <div className="mt-5 flex h-44 items-end justify-between gap-1 sm:gap-1.5">
            {report.weeksSeries.map((w) => {
              const h = Math.max(4, Math.round((w.volume / maxWeekVol) * 140));
              return (
                <div key={w.weekStart} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                  <div
                    className="w-full max-w-[40px] rounded-t-md bg-gradient-to-t from-neutral-800 to-neutral-600 dark:from-zinc-200 dark:to-zinc-400"
                    style={{ height: `${h}px` }}
                    title={`${w.label}주 · ${w.volume}`}
                  />
                  <span className="text-[9px] font-medium text-apple-subtle dark:text-zinc-500">{w.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-apple-subtle dark:text-zinc-500">운동 빈도</h3>
          <p className="mt-1 text-[12px] text-apple-subtle dark:text-zinc-500">같은 기간 · 운동한 날 수(0~7일)</p>
          <div className="mt-5 flex h-44 items-end justify-between gap-1 sm:gap-1.5">
            {report.weeksSeries.map((w) => {
              const h = Math.max(4, Math.round((w.activeDays / maxDays) * 140));
              return (
                <div key={`d-${w.weekStart}`} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                  <div
                    className="w-full max-w-[40px] rounded-t-md bg-gradient-to-t from-sky-700 to-sky-500 dark:from-sky-400 dark:to-sky-300"
                    style={{ height: `${h}px` }}
                    title={`${w.label}주 · ${w.activeDays}일`}
                  />
                  <span className="text-[9px] font-medium tabular-nums text-apple-subtle dark:text-zinc-500">{w.activeDays}일</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-neutral-200/90 bg-white p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-950" aria-labelledby="daily-volume">
        <h3 id="daily-volume" className="text-[11px] font-bold uppercase tracking-[0.18em] text-apple-subtle dark:text-zinc-500">
          최근 7일 일별 볼륨
        </h3>
        <p className="mt-1 text-[12px] text-apple-subtle dark:text-zinc-500">요일 단위로 촘촘히 보는 미세 추세</p>
        <div className="mt-4 flex h-36 items-end justify-between gap-1 sm:gap-2">
          {series7.map((s) => {
            const barH = Math.max(4, Math.round((s.volume / maxDayVol) * 120));
            return (
              <div key={s.key} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <div
                  className="w-full max-w-[44px] rounded-t-md bg-neutral-800/90 dark:bg-zinc-300"
                  style={{ height: `${barH}px` }}
                  title={`${s.label}: ${Math.round(s.volume * 10) / 10}`}
                />
                <span className="text-[10px] font-medium text-apple-subtle dark:text-zinc-500">{s.label}</span>
              </div>
            );
          })}
        </div>
      </section>
    </article>
  );
}
