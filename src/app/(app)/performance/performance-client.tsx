"use client";

import { BodyWeightPanel } from "@/components/bodyweight/BodyWeightPanel";
import { navToolbarButton } from "@/components/nav/menu-styles";
import { PerformanceStoryReport } from "@/components/performance/PerformanceStoryReport";
import { SectionTitleBlock } from "@/components/ui/SectionTitleBlock";
import type { WorkoutRow } from "@/types/workout";
import { useId, useMemo, useState } from "react";

type Props = {
  initialRows: WorkoutRow[];
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

export function PerformanceClient({ initialRows }: Props) {
  const fid = useId();
  const idQ = `${fid}-q`;
  const idFrom = `${fid}-from`;
  const idTo = `${fid}-to`;

  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    const tq = q.trim().toLowerCase();
    const fromTs = from ? startOfDay(new Date(from)) : null;
    const toTs = to ? startOfDay(new Date(to)) + 86400000 - 1 : null;
    return initialRows.filter((w) => {
      if (tq && !w.exercise_name.toLowerCase().includes(tq)) return false;
      const ts = new Date(w.created_at).getTime();
      if (fromTs !== null && ts < fromTs) return false;
      if (toTs !== null && ts > toTs) return false;
      return true;
    });
  }, [initialRows, q, from, to]);

  const stats = useMemo(() => {
    let volume = 0;
    for (const w of filtered) {
      volume += Number(w.weight_kg) * w.reps * w.sets;
    }
    return { count: filtered.length, volume };
  }, [filtered]);

  function downloadCsv() {
    const header = ["created_at", "exercise_name", "weight_kg", "reps", "sets", "success"];
    const lines = [header.join(",")];
    for (const w of filtered) {
      lines.push(
        [
          JSON.stringify(w.created_at),
          JSON.stringify(w.exercise_name),
          w.weight_kg,
          w.reps,
          w.sets,
          w.success ? "true" : "false",
        ].join(","),
      );
    }
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workouts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-apple-ink dark:text-zinc-100 sm:px-8 sm:py-14">
      <SectionTitleBlock
        step="02"
        eyebrow="리포트"
        title="운동 리포트"
        description="지난주와 비교한 요약, 차트, 필터, CSV까지 한곳에서."
        right={
          <span className="rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-[11px] font-semibold tabular-nums text-apple-ink shadow-sm sm:text-[12px] dark:border-zinc-700 dark:bg-zinc-900">
            {stats.count}건
          </span>
        }
      />

      <div className="mt-8">
        <PerformanceStoryReport rows={initialRows} />
      </div>

      <BodyWeightPanel />

      <div className="mt-8 rounded-[1.75rem] border border-neutral-200/90 bg-white/95 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label htmlFor={idQ} className="block text-[12px] font-semibold text-apple-subtle">
            종목 검색
            <input
              id={idQ}
              name="q"
              className="mt-1.5 w-full rounded-xl border border-neutral-200/90 px-3 py-2 text-[15px] text-apple-ink shadow-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/15"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="예: 스쿼트"
            />
          </label>
          <label htmlFor={idFrom} className="block text-[12px] font-semibold text-apple-subtle">
            시작 날짜
            <input
              id={idFrom}
              name="from"
              type="date"
              className="mt-1.5 w-full rounded-xl border border-neutral-200/90 px-3 py-2 text-[15px] text-apple-ink shadow-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/15"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label htmlFor={idTo} className="block text-[12px] font-semibold text-apple-subtle">
            끝 날짜
            <input
              id={idTo}
              name="to"
              type="date"
              className="mt-1.5 w-full rounded-xl border border-neutral-200/90 px-3 py-2 text-[15px] text-apple-ink shadow-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/15"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setQ("");
                setFrom("");
                setTo("");
              }}
              className={`w-full ${navToolbarButton}`}
            >
              초기화
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 border-t border-neutral-200/90 pt-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200/90 bg-neutral-50 px-4 py-3 text-center">
            <p className="text-[11px] font-medium tracking-[-0.01em] text-apple-subtle">세트</p>
            <p className="font-display mt-1 text-2xl font-bold tabular-nums">{stats.count}</p>
          </div>
          <div className="rounded-2xl border border-neutral-200/90 bg-neutral-100 px-4 py-3 text-center sm:col-span-2">
            <p className="text-[11px] font-medium tracking-[-0.01em] text-apple-subtle">볼륨 합</p>
            <p className="font-display mt-1 text-2xl font-bold tabular-nums">{Math.round(stats.volume * 10) / 10}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={downloadCsv}
          disabled={filtered.length === 0}
          className="mt-6 w-full rounded-lg border border-black bg-black py-3 text-[13px] font-semibold tracking-[-0.02em] text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          CSV 받기 ({filtered.length}건)
        </button>
      </div>

      <div className="mt-10 overflow-hidden rounded-[1.75rem] border border-neutral-200/90 bg-white shadow-sm">
        <div className="border-b border-neutral-200 bg-black px-4 py-2.5 text-[12px] font-medium tracking-[-0.01em] text-white">미리보기</div>
        <ul className="max-h-[min(480px,50vh)] divide-y divide-neutral-200 overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="px-4 py-8 text-center text-[14px] text-apple-subtle">필터 맞는 게 없어요.</li>
          ) : (
            filtered.map((w) => (
              <li key={w.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-[14px]">
                <span className="font-semibold text-apple-ink">{w.exercise_name}</span>
                <span className="tabular-nums text-apple-subtle">
                  {Number(w.weight_kg)}kg · {w.reps}×{w.sets} · {w.success ? "성공" : "노답"}
                </span>
                <time className="w-full text-[12px] text-apple-subtle sm:w-auto">{formatDate(w.created_at)}</time>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
