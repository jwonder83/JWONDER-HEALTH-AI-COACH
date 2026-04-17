"use client";

import type { WorkoutFormCopyConfig } from "@/types/site-settings";
import type { WorkoutInput } from "@/types/workout";
import { useEffect, useId, useState } from "react";

type Props = {
  onSaved: () => void;
  saveWorkout: (input: WorkoutInput) => Promise<{ error?: string }>;
  copy: WorkoutFormCopyConfig;
  /** 상단 카드 제목 블록 숨김(페이지 섹션 헤더와 중복 방지) */
  omitCardHeader?: boolean;
};

const empty: WorkoutInput = {
  exercise_name: "",
  weight_kg: 0,
  reps: 8,
  sets: 3,
  success: true,
};

const LS_PRESETS = "jws_workout_presets_v1";
const MAX_PRESETS = 8;

const fieldClass =
  "mt-2 w-full border border-neutral-200 bg-white px-3.5 py-3 text-[17px] tracking-tight text-apple-ink shadow-sm transition-[border-color,box-shadow] duration-200 placeholder:text-apple-subtle hover:border-neutral-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/15";

const panel =
  "border border-neutral-200 bg-white p-8 shadow-sm sm:p-10";

function presetKey(p: WorkoutInput): string {
  return `${p.exercise_name.trim()}|${p.weight_kg}|${p.reps}|${p.sets}|${p.success}`;
}

function isValidPreset(p: unknown): p is WorkoutInput {
  if (!p || typeof p !== "object") return false;
  const o = p as Record<string, unknown>;
  return (
    typeof o.exercise_name === "string" &&
    typeof o.weight_kg === "number" &&
    typeof o.reps === "number" &&
    typeof o.sets === "number" &&
    typeof o.success === "boolean" &&
    o.exercise_name.trim().length > 0 &&
    o.reps >= 1 &&
    o.sets >= 1
  );
}

export function WorkoutForm({ onSaved, saveWorkout, copy, omitCardHeader = false }: Props) {
  const uid = useId();
  const idExercise = `${uid}-exercise`;
  const idWeight = `${uid}-weight`;
  const idReps = `${uid}-reps`;
  const idSets = `${uid}-sets`;

  const [form, setForm] = useState<WorkoutInput>(empty);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [presets, setPresets] = useState<WorkoutInput[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(LS_PRESETS);
      if (!raw) return;
      const arr = JSON.parse(raw) as unknown[];
      if (!Array.isArray(arr)) return;
      const next = arr.filter(isValidPreset).slice(0, MAX_PRESETS);
      setPresets(next);
    } catch {
      /* ignore */
    }
  }, []);

  function persistPresets(next: WorkoutInput[]) {
    setPresets(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_PRESETS, JSON.stringify(next));
    }
  }

  function addCurrentAsPreset() {
    const trimmed = form.exercise_name.trim();
    if (!trimmed) {
      setStatus("종목 이름을 입력한 뒤 프리셋에 추가할 수 있어요.");
      return;
    }
    const row: WorkoutInput = {
      ...form,
      exercise_name: trimmed,
      weight_kg: Number(form.weight_kg),
      reps: Math.round(Number(form.reps)),
      sets: Math.round(Number(form.sets)),
    };
    const k = presetKey(row);
    const deduped = presets.filter((p) => presetKey(p) !== k);
    persistPresets([row, ...deduped].slice(0, MAX_PRESETS));
    setStatus("프리셋에 저장했어요.");
  }

  function removePreset(p: WorkoutInput) {
    const k = presetKey(p);
    persistPresets(presets.filter((x) => presetKey(x) !== k));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    const { error } = await saveWorkout({
      ...form,
      exercise_name: form.exercise_name.trim(),
      weight_kg: Number(form.weight_kg),
      reps: Math.round(Number(form.reps)),
      sets: Math.round(Number(form.sets)),
    });
    setLoading(false);
    if (error) {
      setStatus(error);
      return;
    }
    setForm({ ...empty, exercise_name: form.exercise_name });
    setStatus(copy.savedToast);
    onSaved();
  }

  function handleOutcomeKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setForm((f) => ({ ...f, success: false }));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setForm((f) => ({ ...f, success: true }));
    } else if (e.key === "Home") {
      e.preventDefault();
      setForm((f) => ({ ...f, success: true }));
    } else if (e.key === "End") {
      e.preventDefault();
      setForm((f) => ({ ...f, success: false }));
    }
  }

  return (
    <section className={panel}>
      {omitCardHeader ? (
        <div className="mb-8 border-b border-neutral-200/80 pb-6">
          <p className="text-[14px] font-medium leading-relaxed text-apple-subtle sm:text-[15px]">{copy.subtitle}</p>
        </div>
      ) : (
        <div className="mb-9 border-b border-neutral-200/90 pb-9">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-apple-subtle">{copy.eyebrow}</p>
          <h2 className="font-display mt-3 text-[1.5rem] font-bold tracking-[-0.02em] text-apple-ink sm:text-[1.75rem]">{copy.title}</h2>
          <p className="mt-3 max-w-md text-[17px] font-normal leading-[1.47] tracking-[-0.012em] text-apple-subtle">{copy.subtitle}</p>
        </div>
      )}

      {presets.length > 0 ? (
        <div className="mb-6 rounded-2xl border border-neutral-200/80 bg-neutral-50 px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-apple-subtle">프리셋</p>
          <p className="mt-1 text-[12px] text-apple-subtle">자주 쓰는 종목·중량을 한 번에 불러옵니다. (이 기기에만 저장)</p>
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="운동 프리셋 목록">
            {presets.map((p) => (
              <li key={presetKey(p)} className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setForm({ ...p, exercise_name: p.exercise_name.trim() });
                    setStatus(null);
                  }}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-neutral-200/90 bg-white px-3 py-1.5 text-left text-[12px] font-semibold text-apple-ink shadow-sm transition hover:border-black hover:bg-neutral-50"
                >
                  <span className="truncate">{p.exercise_name.trim()}</span>
                  <span className="shrink-0 tabular-nums text-apple-subtle">
                    {p.weight_kg}kg · {p.reps}×{p.sets}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={`${p.exercise_name.trim()} 프리셋 삭제`}
                  onClick={() => removePreset(p)}
                  className="rounded-full border border-transparent px-1.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <form className="grid gap-6 sm:grid-cols-2" onSubmit={handleSubmit}>
        <label htmlFor={idExercise} className="block text-[13px] font-medium text-apple-subtle sm:col-span-2">
          {copy.exerciseLabel}
          <input
            id={idExercise}
            name="exercise_name"
            autoComplete="off"
            className={fieldClass}
            placeholder={copy.exercisePlaceholder}
            value={form.exercise_name}
            onChange={(e) => setForm((f) => ({ ...f, exercise_name: e.target.value }))}
            required
          />
        </label>
        <label htmlFor={idWeight} className="block text-[13px] font-medium text-apple-subtle">
          {copy.weightLabel}
          <input
            id={idWeight}
            name="weight_kg"
            className={fieldClass}
            type="number"
            min={0}
            step={0.5}
            value={form.weight_kg}
            onChange={(e) => setForm((f) => ({ ...f, weight_kg: Number(e.target.value) }))}
            required
          />
        </label>
        <label htmlFor={idReps} className="block text-[13px] font-medium text-apple-subtle">
          {copy.repsLabel}
          <input
            id={idReps}
            name="reps"
            className={fieldClass}
            type="number"
            min={1}
            value={form.reps}
            onChange={(e) => setForm((f) => ({ ...f, reps: Number(e.target.value) }))}
            required
          />
        </label>
        <label htmlFor={idSets} className="block text-[13px] font-medium text-apple-subtle">
          {copy.setsLabel}
          <input
            id={idSets}
            name="sets"
            className={fieldClass}
            type="number"
            min={1}
            value={form.sets}
            onChange={(e) => setForm((f) => ({ ...f, sets: Number(e.target.value) }))}
            required
          />
        </label>
        <div className="sm:col-span-2">
          <fieldset className="min-w-0 border-0 p-0">
            <legend className="text-[13px] font-medium text-apple-subtle">{copy.outcomeGroupLabel}</legend>
            <div
              role="radiogroup"
              aria-label={copy.outcomeAriaLabel}
              onKeyDown={handleOutcomeKeyDown}
              className="mt-2 inline-flex w-full max-w-xs rounded-2xl border border-neutral-200 bg-neutral-100 p-1 sm:max-w-sm"
            >
              <button
                type="button"
                role="radio"
                tabIndex={form.success ? 0 : -1}
                aria-checked={form.success}
                onClick={() => setForm((f) => ({ ...f, success: true }))}
                className={
                  form.success
                    ? "flex-1 rounded-xl bg-white py-2.5 text-[15px] font-semibold text-apple-ink shadow-sm ring-1 ring-neutral-200 transition-all duration-200 active:scale-[0.99]"
                    : "flex-1 rounded-xl py-2.5 text-[15px] font-medium text-apple-subtle transition-colors duration-200 hover:text-apple-ink"
                }
              >
                {copy.successLabel}
              </button>
              <button
                type="button"
                role="radio"
                tabIndex={!form.success ? 0 : -1}
                aria-checked={!form.success}
                onClick={() => setForm((f) => ({ ...f, success: false }))}
                className={
                  !form.success
                    ? "flex-1 rounded-xl bg-white py-2.5 text-[15px] font-semibold text-apple-ink shadow-sm ring-1 ring-neutral-200 transition-all duration-200 active:scale-[0.99]"
                    : "flex-1 rounded-xl py-2.5 text-[15px] font-medium text-apple-subtle transition-colors duration-200 hover:text-apple-ink"
                }
              >
                {copy.failLabel}
              </button>
            </div>
          </fieldset>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="border border-black bg-black px-9 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-white hover:text-black active:scale-[0.98] disabled:opacity-45"
          >
            {loading ? copy.savingButtonLabel : copy.saveButtonLabel}
          </button>
          <button
            type="button"
            onClick={addCurrentAsPreset}
            className="border border-neutral-300 bg-white px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-apple-ink shadow-sm transition hover:border-black hover:bg-neutral-50"
          >
            프리셋에 저장
          </button>
          {status ? (
            <span
              className={
                status.includes("오류") || status.includes("실패")
                  ? "text-[15px] font-medium text-rose-600"
                  : "text-[15px] font-medium text-emerald-600"
              }
            >
              {status}
            </span>
          ) : null}
        </div>
      </form>
    </section>
  );
}
