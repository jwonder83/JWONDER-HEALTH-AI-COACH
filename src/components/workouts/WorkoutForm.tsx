"use client";

import type { WorkoutFormCopyConfig } from "@/types/site-settings";
import type { WorkoutInput } from "@/types/workout";
import { useState } from "react";

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

const fieldClass =
  "mt-2 w-full rounded-2xl border border-orange-100/90 bg-white px-3.5 py-3 text-[17px] tracking-tight text-apple-ink shadow-sm transition-[border-color,box-shadow] duration-200 placeholder:text-apple-subtle hover:border-apple/25 focus:border-apple/50 focus:outline-none focus:ring-4 focus:ring-apple/15";

const panel =
  "rounded-[2rem] border border-orange-100/80 bg-white/90 p-8 shadow-[0_16px_48px_-20px_rgba(233,75,60,0.15),0_2px_0_rgba(255,255,255,0.95)_inset] ring-1 ring-orange-50/80 backdrop-blur-md sm:rounded-[2.25rem] sm:p-10";

export function WorkoutForm({ onSaved, saveWorkout, copy, omitCardHeader = false }: Props) {
  const [form, setForm] = useState<WorkoutInput>(empty);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <section className={panel}>
      {omitCardHeader ? (
        <div className="mb-8 border-b border-orange-100/80 pb-6">
          <p className="text-[14px] font-medium leading-relaxed text-apple-subtle sm:text-[15px]">{copy.subtitle}</p>
        </div>
      ) : (
        <div className="mb-9 border-b border-orange-100/90 pb-9">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-apple">{copy.eyebrow}</p>
          <h2 className="font-display mt-3 text-[1.5rem] font-bold tracking-[-0.02em] text-apple-ink sm:text-[1.75rem]">{copy.title}</h2>
          <p className="mt-3 max-w-md text-[17px] font-normal leading-[1.47] tracking-[-0.012em] text-apple-subtle">{copy.subtitle}</p>
        </div>
      )}
      <form className="grid gap-6 sm:grid-cols-2" onSubmit={handleSubmit}>
        <label className="block text-[13px] font-medium text-apple-subtle sm:col-span-2">
          {copy.exerciseLabel}
          <input
            className={fieldClass}
            placeholder={copy.exercisePlaceholder}
            value={form.exercise_name}
            onChange={(e) => setForm((f) => ({ ...f, exercise_name: e.target.value }))}
            required
          />
        </label>
        <label className="block text-[13px] font-medium text-apple-subtle">
          {copy.weightLabel}
          <input
            className={fieldClass}
            type="number"
            min={0}
            step={0.5}
            value={form.weight_kg}
            onChange={(e) => setForm((f) => ({ ...f, weight_kg: Number(e.target.value) }))}
            required
          />
        </label>
        <label className="block text-[13px] font-medium text-apple-subtle">
          {copy.repsLabel}
          <input
            className={fieldClass}
            type="number"
            min={1}
            value={form.reps}
            onChange={(e) => setForm((f) => ({ ...f, reps: Number(e.target.value) }))}
            required
          />
        </label>
        <label className="block text-[13px] font-medium text-apple-subtle">
          {copy.setsLabel}
          <input
            className={fieldClass}
            type="number"
            min={1}
            value={form.sets}
            onChange={(e) => setForm((f) => ({ ...f, sets: Number(e.target.value) }))}
            required
          />
        </label>
        <div className="sm:col-span-2">
          <p className="text-[13px] font-medium text-apple-subtle">{copy.outcomeGroupLabel}</p>
          <div
            role="radiogroup"
            aria-label={copy.outcomeAriaLabel}
            className="mt-2 inline-flex w-full max-w-xs rounded-2xl border border-orange-100 bg-u-lavender/25 p-1 sm:max-w-sm"
          >
            <button
              type="button"
              role="radio"
              aria-checked={form.success}
              onClick={() => setForm((f) => ({ ...f, success: true }))}
              className={
                form.success
                  ? "flex-1 rounded-xl bg-white py-2.5 text-[15px] font-semibold text-apple-ink shadow-sm ring-1 ring-orange-100/80 transition-all duration-200 active:scale-[0.99]"
                  : "flex-1 rounded-xl py-2.5 text-[15px] font-medium text-apple-subtle transition-colors duration-200 hover:text-apple-ink"
              }
            >
              {copy.successLabel}
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={!form.success}
              onClick={() => setForm((f) => ({ ...f, success: false }))}
              className={
                !form.success
                  ? "flex-1 rounded-xl bg-white py-2.5 text-[15px] font-semibold text-apple-ink shadow-sm ring-1 ring-orange-100/80 transition-all duration-200 active:scale-[0.99]"
                  : "flex-1 rounded-xl py-2.5 text-[15px] font-medium text-apple-subtle transition-colors duration-200 hover:text-apple-ink"
              }
            >
              {copy.failLabel}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-gradient-to-br from-apple to-[#ff8a7a] px-9 py-2.5 text-[15px] font-bold text-white shadow-[0_2px_0_rgba(255,255,255,0.35)_inset,0_12px_32px_-8px_rgba(233,75,60,0.45)] transition-all duration-200 hover:brightness-105 active:scale-[0.98] disabled:opacity-45"
          >
            {loading ? copy.savingButtonLabel : copy.saveButtonLabel}
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
