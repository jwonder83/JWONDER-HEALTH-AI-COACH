"use client";

import { SectionTitleBlock } from "@/components/ui/SectionTitleBlock";
import type { WorkoutRow } from "@/types/workout";
import { useMemo, useState } from "react";

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

export function RecordsClient({ initialRows }: Props) {
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
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-8 sm:py-14">
      <SectionTitleBlock
        step="02"
        eyebrow="RECORDS"
        title="통계·보내기"
        description="종목·기간으로 좁혀 보고, CSV로 내려받을 수 있습니다."
        right={
          <span className="rounded-full border border-orange-100 bg-u-mint/45 px-3 py-1 text-[11px] font-semibold tabular-nums text-apple-ink shadow-sm sm:text-[12px]">
            {stats.count}건
          </span>
        }
      />

      <div className="mt-2 rounded-[1.75rem] border border-orange-100/90 bg-white/95 p-5 shadow-[0_16px_48px_-20px_rgba(233,75,60,0.14)] sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-[12px] font-semibold text-apple-subtle">
            운동명 포함
            <input
              className="mt-1.5 w-full rounded-xl border border-orange-100/90 px-3 py-2 text-[15px] text-apple-ink shadow-sm focus:border-apple/40 focus:outline-none focus:ring-2 focus:ring-apple/20"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="예: 스쿼트"
            />
          </label>
          <label className="block text-[12px] font-semibold text-apple-subtle">
            시작일
            <input
              type="date"
              className="mt-1.5 w-full rounded-xl border border-orange-100/90 px-3 py-2 text-[15px] text-apple-ink shadow-sm focus:border-apple/40 focus:outline-none focus:ring-2 focus:ring-apple/20"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label className="block text-[12px] font-semibold text-apple-subtle">
            종료일
            <input
              type="date"
              className="mt-1.5 w-full rounded-xl border border-orange-100/90 px-3 py-2 text-[15px] text-apple-ink shadow-sm focus:border-apple/40 focus:outline-none focus:ring-2 focus:ring-apple/20"
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
              className="w-full rounded-full border border-orange-100 bg-u-lavender/30 py-2.5 text-[12px] font-bold uppercase tracking-[0.1em] text-apple-ink transition hover:bg-u-lavender/50"
            >
              필터 초기화
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 border-t border-orange-100/90 pt-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-orange-100/90 bg-u-mint/50 px-4 py-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-apple">건수</p>
            <p className="font-display mt-1 text-2xl font-bold tabular-nums">{stats.count}</p>
          </div>
          <div className="rounded-2xl border border-orange-100/90 bg-u-mango/35 px-4 py-3 text-center sm:col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-apple">추정 볼륨 (kg×회×세트 합)</p>
            <p className="font-display mt-1 text-2xl font-bold tabular-nums">{Math.round(stats.volume * 10) / 10}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={downloadCsv}
          disabled={filtered.length === 0}
          className="mt-6 w-full rounded-full bg-gradient-to-br from-apple to-[#ff8a7a] py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-white shadow-lg transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
        >
          CSV 내려받기 ({filtered.length}건)
        </button>
      </div>

      <div className="mt-10 overflow-hidden rounded-[1.75rem] border border-orange-100/90 bg-white shadow-[0_12px_40px_-16px_rgba(233,75,60,0.12)]">
        <div className="bg-gradient-to-r from-apple to-[#ff8a7a] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white">미리보기</div>
        <ul className="max-h-[min(480px,50vh)] divide-y divide-orange-100/80 overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="px-4 py-8 text-center text-[14px] text-apple-subtle">조건에 맞는 기록이 없습니다.</li>
          ) : (
            filtered.map((w) => (
              <li key={w.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-[14px]">
                <span className="font-semibold text-apple-ink">{w.exercise_name}</span>
                <span className="tabular-nums text-apple-subtle">
                  {Number(w.weight_kg)}kg · {w.reps}×{w.sets} · {w.success ? "성공" : "실패"}
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
