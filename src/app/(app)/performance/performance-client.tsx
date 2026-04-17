"use client";

import { BodyWeightPanel } from "@/components/bodyweight/BodyWeightPanel";
import { computeOneLineInsight, last7DaysVolumeSeries } from "@/lib/dashboard/insights";
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

  const series7 = useMemo(() => last7DaysVolumeSeries(initialRows), [initialRows]);
  const maxVol = useMemo(() => Math.max(1, ...series7.map((s) => s.volume)), [series7]);
  const coachLine = useMemo(() => computeOneLineInsight(initialRows), [initialRows]);

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
        eyebrow="PERFORMANCE"
        title="퍼포먼스"
        description="주간·월간 볼륨과 최근 7일 추세를 보고, 필터·CSV로 보냅니다."
        right={
          <span className="rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-[11px] font-semibold tabular-nums text-apple-ink shadow-sm sm:text-[12px]">
            {stats.count}건
          </span>
        }
      />

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-apple-subtle dark:text-zinc-500">코치 인사이트</p>
        <p className="mt-2 text-[14px] font-medium leading-relaxed text-apple-ink sm:text-[15px] dark:text-zinc-100">{coachLine}</p>
        <p className="mt-2 text-[11px] text-apple-subtle dark:text-zinc-500">규칙 기반 문구이며 외부 AI를 호출하지 않습니다.</p>
      </div>

      <BodyWeightPanel />

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-apple-subtle">최근 7일 볼륨</p>
        <p className="mt-1 text-[12px] text-apple-subtle">일별 kg×회×세트 합산</p>
        <div className="mt-4 flex h-40 items-end justify-between gap-1.5 sm:gap-2">
          {series7.map((s) => {
            const barH = Math.max(6, Math.round((s.volume / maxVol) * 128));
            return (
              <div key={s.key} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <div
                  className="w-full max-w-[44px] rounded-t-md bg-black/85 sm:max-w-none"
                  style={{ height: `${barH}px` }}
                  title={`${s.label}: ${Math.round(s.volume * 10) / 10}`}
                />
                <span className="text-[10px] font-medium text-apple-subtle">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.25rem] border border-neutral-200/90 bg-white/90 px-4 py-3 shadow-sm ring-1 ring-neutral-100">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-apple-subtle">주간 한 줄</p>
          <p className="mt-1.5 text-[13px] font-medium leading-snug text-apple-ink">{weekLine}</p>
        </div>
        <div className="rounded-[1.25rem] border border-neutral-200/90 bg-neutral-50 px-4 py-3 shadow-sm ring-1 ring-neutral-100">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-apple-subtle">월간 한 줄</p>
          <p className="mt-1.5 text-[13px] font-medium leading-snug text-apple-ink">{monthLine}</p>
        </div>
      </div>

      {monthInsight ? (
        <div className="mt-3 rounded-[1.25rem] border border-neutral-200/80 bg-neutral-50 px-4 py-3 text-[13px] leading-snug text-apple-ink ring-1 ring-neutral-100 sm:text-[14px]">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-apple-subtle">월간 인사이트</span>
          <p className="mt-1.5 font-medium">{monthInsight}</p>
        </div>
      ) : null}

      <div className="mt-2 rounded-[1.75rem] border border-neutral-200/90 bg-white/95 p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label htmlFor={idQ} className="block text-[12px] font-semibold text-apple-subtle">
            운동명 포함
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
            시작일
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
            종료일
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
              className="w-full rounded-full border border-neutral-200 bg-neutral-100 py-2.5 text-[12px] font-bold uppercase tracking-[0.1em] text-apple-ink transition hover:bg-neutral-200"
            >
              필터 초기화
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 border-t border-neutral-200/90 pt-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200/90 bg-neutral-50 px-4 py-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-apple-subtle">건수</p>
            <p className="font-display mt-1 text-2xl font-bold tabular-nums">{stats.count}</p>
          </div>
          <div className="rounded-2xl border border-neutral-200/90 bg-neutral-100 px-4 py-3 text-center sm:col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-apple-subtle">추정 볼륨 (kg×회×세트 합)</p>
            <p className="font-display mt-1 text-2xl font-bold tabular-nums">{Math.round(stats.volume * 10) / 10}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={downloadCsv}
          disabled={filtered.length === 0}
          className="mt-6 w-full border border-black bg-black py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          CSV 내려받기 ({filtered.length}건)
        </button>
      </div>

      <div className="mt-10 overflow-hidden rounded-[1.75rem] border border-neutral-200/90 bg-white shadow-sm">
        <div className="border-b border-neutral-200 bg-black px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white">미리보기</div>
        <ul className="max-h-[min(480px,50vh)] divide-y divide-neutral-200 overflow-y-auto">
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
