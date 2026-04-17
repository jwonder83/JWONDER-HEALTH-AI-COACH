"use client";

import { loadBodyWeights, saveBodyWeights, todayKey, upsertBodyWeight, type BodyWeightEntry } from "@/lib/bodyweight/storage";
import { useEffect, useId, useMemo, useState } from "react";

export function BodyWeightPanel() {
  const fid = useId();
  const idDay = `${fid}-day`;
  const idKg = `${fid}-kg`;
  const [rows, setRows] = useState<BodyWeightEntry[]>([]);
  const [day, setDay] = useState("");
  const [kg, setKg] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setRows(loadBodyWeights());
    setDay(todayKey());
  }, []);

  const spark = useMemo(() => {
    const last = rows.slice(-14);
    const max = Math.max(1, ...last.map((r) => r.kg));
    return last.map((r) => ({ ...r, h: Math.round((r.kg / max) * 48) }));
  }, [rows]);

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const n = Number(kg);
    if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      setMsg("날짜를 확인해 주세요.");
      return;
    }
    if (!Number.isFinite(n) || n < 20 || n > 300) {
      setMsg("체중은 20~300kg 사이로 입력해 주세요.");
      return;
    }
    setRows(upsertBodyWeight(day, n));
    setKg("");
    setMsg("저장했습니다. (이 기기에만 저장)");
  }

  function removeDay(d: string) {
    const next = rows.filter((r) => r.day !== d);
    saveBodyWeights(next);
    setRows(loadBodyWeights());
  }

  return (
    <div className="mt-6 rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-apple-subtle dark:text-zinc-500">체중 추적</p>
      <p className="mt-1 text-[12px] leading-relaxed text-apple-subtle dark:text-zinc-400">
        브라우저에만 저장됩니다. 서버·AI와 연동되지 않습니다.
      </p>

      {spark.length > 0 ? (
        <div className="mt-4 flex h-14 items-end gap-1">
          {spark.map((bar) => (
            <div key={bar.day} className="flex flex-1 flex-col items-center gap-0.5" title={`${bar.day}: ${bar.kg}kg`}>
              <div
                className="w-full max-w-[20px] rounded-t bg-black/80 dark:bg-zinc-100"
                style={{ height: `${Math.max(4, bar.h)}px` }}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-[13px] text-apple-subtle dark:text-zinc-500">기록이 없습니다. 아래에서 추가해 보세요.</p>
      )}

      <form className="mt-4 flex flex-wrap items-end gap-3" onSubmit={onAdd}>
        <label className="block text-[12px] font-semibold text-apple-subtle dark:text-zinc-400" htmlFor={idDay}>
          날짜
          <input
            id={idDay}
            type="date"
            className="mt-1 block w-full min-w-[10rem] rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[15px] text-apple-ink dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            required
          />
        </label>
        <label className="block text-[12px] font-semibold text-apple-subtle dark:text-zinc-400" htmlFor={idKg}>
          체중 (kg)
          <input
            id={idKg}
            type="number"
            step={0.1}
            min={20}
            max={300}
            placeholder="예: 72.4"
            className="mt-1 block w-full min-w-[6rem] rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[15px] text-apple-ink dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            value={kg}
            onChange={(e) => setKg(e.target.value)}
          />
        </label>
        <button
          type="submit"
          className="rounded-full border border-black bg-black px-5 py-2.5 text-[12px] font-semibold text-white transition hover:bg-white hover:text-black dark:border-zinc-100 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
        >
          저장
        </button>
      </form>
      {msg ? <p className="mt-2 text-[13px] text-emerald-700 dark:text-emerald-400">{msg}</p> : null}

      {rows.length > 0 ? (
        <ul className="mt-4 max-h-40 divide-y divide-neutral-200 overflow-y-auto text-[13px] dark:divide-zinc-800">
          {[...rows]
            .sort((a, b) => (a.day < b.day ? 1 : -1))
            .slice(0, 20)
            .map((r) => (
              <li key={r.day} className="flex items-center justify-between gap-2 py-2">
                <span className="tabular-nums text-apple-ink dark:text-zinc-200">{r.day}</span>
                <span className="font-semibold tabular-nums text-apple-ink dark:text-zinc-100">{r.kg} kg</span>
                <button
                  type="button"
                  className="text-[11px] font-semibold text-rose-600 hover:underline dark:text-rose-400"
                  onClick={() => removeDay(r.day)}
                >
                  삭제
                </button>
              </li>
            ))}
        </ul>
      ) : null}
    </div>
  );
}
