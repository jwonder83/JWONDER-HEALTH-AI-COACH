"use client";

import { SectionTitleBlock } from "@/components/ui/SectionTitleBlock";
import {
  endOfMonth,
  endOfWeekSunday,
  rollupPeriod,
  startOfMonth,
  startOfWeekMonday,
} from "@/lib/workouts/period-stats";
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

export function RecordsClient({ initialRows }: Props) {
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

  const weekLine = useMemo(() => {
    const mon = startOfWeekMonday();
    const sun = endOfWeekSunday(mon);
    const r = rollupPeriod(initialRows, mon, sun);
    const top = r.topExercise ? ` · 가장 많이 한 종목 ${r.topExercise}` : "";
    return `이번 주 총 볼륨 ${Math.round(r.volume * 10) / 10} · 기록 ${r.rowCount}건${top}`;
  }, [initialRows]);

  const monthLine = useMemo(() => {
    const s = startOfMonth();
    const e = endOfMonth();
    const r = rollupPeriod(initialRows, s, e);
    const top = r.topExercise ? ` · 가장 많이 한 종목 ${r.topExercise}` : "";
    return `이번 달 총 볼륨 ${Math.round(r.volume * 10) / 10} · 기록 ${r.rowCount}건${top}`;
  }, [initialRows]);

  const monthInsight = useMemo(() => {
    const s = startOfMonth();
    const e = endOfMonth();
    const sTs = s.getTime();
    const eTs = e.getTime();
    const inRange = initialRows.filter((w) => {
      const t = new Date(w.created_at).getTime();
      return t >= sTs && t <= eTs;
    });
    if (inRange.length === 0) return null;
    const counts = new Map<string, number>();
    for (const w of inRange) {
      const name = w.exercise_name.trim() || "기타";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    let top: string | null = null;
    let max = 0;
    for (const [k, v] of counts) {
      if (v > max) {
        max = v;
        top = k;
      }
    }
    if (!top || max === 0) return null;
    const pct = Math.round((max / inRange.length) * 100);
    if (pct >= 38) {
      return `이번 달 기록의 약 ${pct}%가 「${top}」예요. 반대쪽 부위·운동도 골고루 넣었는지 한 번 점검해 보세요.`;
    }
    return "이번 달은 종목이 비교적 고르게 섞여 있어요. 한 줄 요약과 함께 보면 좋아요.";
  }, [initialRows]);

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

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.25rem] border border-orange-100/90 bg-white/90 px-4 py-3 shadow-sm ring-1 ring-orange-50/60">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-apple">주간 한 줄</p>
          <p className="mt-1.5 text-[13px] font-medium leading-snug text-apple-ink">{weekLine}</p>
        </div>
        <div className="rounded-[1.25rem] border border-orange-100/90 bg-u-lavender/25 px-4 py-3 shadow-sm ring-1 ring-orange-50/60">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-apple">월간 한 줄</p>
          <p className="mt-1.5 text-[13px] font-medium leading-snug text-apple-ink">{monthLine}</p>
        </div>
      </div>

      {monthInsight ? (
        <div className="mt-3 rounded-[1.25rem] border border-orange-100/80 bg-u-mint/30 px-4 py-3 text-[13px] leading-snug text-apple-ink ring-1 ring-orange-50/50 sm:text-[14px]">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-apple">월간 인사이트</span>
          <p className="mt-1.5 font-medium">{monthInsight}</p>
        </div>
      ) : null}

      <div className="mt-2 rounded-[1.75rem] border border-orange-100/90 bg-white/95 p-5 shadow-[0_16px_48px_-20px_rgba(233,75,60,0.14)] sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label htmlFor={idQ} className="block text-[12px] font-semibold text-apple-subtle">
            운동명 포함
            <input
              id={idQ}
              name="q"
              className="mt-1.5 w-full rounded-xl border border-orange-100/90 px-3 py-2 text-[15px] text-apple-ink shadow-sm focus:border-apple/40 focus:outline-none focus:ring-2 focus:ring-apple/20"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="예: 스쿼트"
            />
          </label>
          <label htmlFor={idFrom} className="block text-[12px] font-semibold text-apple-subtle">
            시작일
            <input
              id={idFrom}
              name="from"
              type="date"
              className="mt-1.5 w-full rounded-xl border border-orange-100/90 px-3 py-2 text-[15px] text-apple-ink shadow-sm focus:border-apple/40 focus:outline-none focus:ring-2 focus:ring-apple/20"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label htmlFor={idTo} className="block text-[12px] font-semibold text-apple-subtle">
            종료일
            <input
              id={idTo}
              name="to"
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
