"use client";

import type { WorkoutFormCopyConfig } from "@/types/site-settings";
import type { WorkoutInput, WorkoutRow } from "@/types/workout";
import {
  getLastSameExercise,
  isNewVolumePr,
  maxVolumeForExercise,
  rowVolume,
  volumeFromNumbers,
} from "@/lib/dashboard/insights";
import { inferPrimaryMuscleGroup, muscleGroupLabel } from "@/lib/workouts/exercise-muscle-group";
import { useEffect, useId, useMemo, useState } from "react";

type Props = {
  onSaved?: (result?: { pr?: boolean }) => void;
  saveWorkout: (input: WorkoutInput) => Promise<{ error?: string; pr?: boolean }>;
  copy: WorkoutFormCopyConfig;
  /** 상단 카드 제목 블록 숨김(페이지 섹션 헤더와 중복 방지) */
  omitCardHeader?: boolean;
  /** 직전 기록·PR 힌트용 전체 기록 */
  allWorkouts?: WorkoutRow[];
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
  "mt-2 w-full border border-neutral-200 bg-white px-3.5 py-3 text-[17px] tracking-tight text-apple-ink shadow-sm transition-[border-color,box-shadow] duration-200 placeholder:text-apple-subtle hover:border-neutral-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-300 dark:focus:ring-white/20";

const panel =
  "border border-neutral-200 bg-white p-8 shadow-sm sm:p-10 dark:border-zinc-800 dark:bg-zinc-950";

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

export function WorkoutForm({ onSaved, saveWorkout, copy, omitCardHeader = false, allWorkouts = [] }: Props) {
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
    const payload = {
      ...form,
      exercise_name: form.exercise_name.trim(),
      weight_kg: Number(form.weight_kg),
      reps: Math.round(Number(form.reps)),
      sets: Math.round(Number(form.sets)),
    };
    const { error, pr } = await saveWorkout(payload);
    setLoading(false);
    if (error) {
      setStatus(error);
      return;
    }
    setForm({ ...empty, exercise_name: form.exercise_name });
    setStatus(copy.savedToast);
    onSaved?.({ pr: Boolean(pr) });
  }

  const volumePreview = useMemo(
    () => volumeFromNumbers(Number(form.weight_kg), form.reps, form.sets),
    [form.weight_kg, form.reps, form.sets],
  );

  const prevSame = useMemo(() => getLastSameExercise(allWorkouts, form.exercise_name), [allWorkouts, form.exercise_name]);
  const prevVol = prevSame ? rowVolume(prevSame) : 0;
  const deltaPct =
    prevVol > 0 && volumePreview > 0 ? Math.round(((volumePreview - prevVol) / prevVol) * 100 * 10) / 10 : prevSame ? null : null;
  const weightDeltaPct = useMemo(() => {
    if (!prevSame || Number(prevSame.weight_kg) <= 0) return null;
    const cw = Number(form.weight_kg);
    return Math.round(((cw - Number(prevSame.weight_kg)) / Number(prevSame.weight_kg)) * 100 * 10) / 10;
  }, [prevSame, form.weight_kg]);
  const bestVol = useMemo(() => maxVolumeForExercise(allWorkouts, form.exercise_name), [allWorkouts, form.exercise_name]);
  const muscleLabel = useMemo(
    () => muscleGroupLabel(inferPrimaryMuscleGroup(form.exercise_name)),
    [form.exercise_name],
  );

  function bumpWeight(delta: number) {
    setForm((f) => ({ ...f, weight_kg: Math.max(0, Math.round((Number(f.weight_kg) + delta) * 2) / 2) }));
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
          <button
            type="button"
            className="mt-2 text-[12px] font-semibold text-apple-ink underline underline-offset-4 hover:opacity-60"
            onClick={() => {
              const last = getLastSameExercise(allWorkouts, form.exercise_name);
              if (!last) {
                setStatus("저장된 기록에서 같은 종목을 찾지 못했어요.");
                return;
              }
              setForm((f) => ({
                ...f,
                weight_kg: Number(last.weight_kg),
                reps: last.reps,
                sets: last.sets,
                success: last.success,
              }));
              setStatus("직전 기록을 불러왔어요.");
            }}
          >
            직전 기록 불러오기
          </button>
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
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[-5, -2.5, 2.5, 5].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => bumpWeight(d)}
                className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-apple-ink hover:border-black"
              >
                {d > 0 ? `+${d}` : d}
              </button>
            ))}
          </div>
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
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[-1, 1].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setForm((f) => ({ ...f, reps: Math.max(1, f.reps + d) }))}
                className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-semibold text-apple-ink hover:border-black"
              >
                {d > 0 ? "+1" : "-1"}
              </button>
            ))}
          </div>
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
        <div className="sm:col-span-2 rounded-xl border border-neutral-200/80 bg-neutral-50 px-3 py-2.5 text-[13px] text-apple-subtle dark:border-zinc-700 dark:bg-zinc-900/60">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-apple-subtle dark:border-zinc-600 dark:bg-zinc-900">
              추정 부위 · {muscleLabel}
            </span>
            {form.exercise_name.trim() && isNewVolumePr(allWorkouts, form.exercise_name, volumePreview) ? (
              <span className="rounded-full border border-amber-300/80 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-950 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-100">
                PR 달성 예상
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-[13px]">
            <span className="font-semibold text-apple-ink dark:text-zinc-100">이번 세트 볼륨</span>{" "}
            <span className="tabular-nums text-apple-ink dark:text-zinc-100">{Math.round(volumePreview * 10) / 10}</span>
            {bestVol > 0 ? (
              <span className="ml-2 text-[12px]">· 종목 최고 {Math.round(bestVol * 10) / 10}</span>
            ) : null}
          </p>
          <p className="mt-1 flex flex-wrap gap-2 text-[12px]">
            {deltaPct !== null ? (
              <span
                className={`font-semibold tabular-nums ${deltaPct > 0 ? "text-emerald-700 dark:text-emerald-400" : deltaPct < 0 ? "text-rose-700 dark:text-rose-400" : "text-apple-subtle"}`}
              >
                볼륨 직전 대비 {deltaPct > 0 ? "+" : ""}
                {deltaPct}%
              </span>
            ) : null}
            {weightDeltaPct !== null ? (
              <span
                className={`font-semibold tabular-nums ${weightDeltaPct > 0 ? "text-teal-700 dark:text-teal-400" : weightDeltaPct < 0 ? "text-orange-700 dark:text-orange-300" : "text-apple-subtle"}`}
              >
                중량 직전 대비 {weightDeltaPct > 0 ? "+" : ""}
                {weightDeltaPct}%
              </span>
            ) : null}
          </p>
        </div>
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
