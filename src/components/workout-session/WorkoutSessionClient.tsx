"use client";

import { getLastSameExercise, isNewVolumePr, rowVolume, volumeFromNumbers } from "@/lib/dashboard/insights";
import { buildOptimizedTodayRoutine } from "@/lib/routine/adaptive-routine-engine";
import { ONBOARDING_LS_KEY, type OnboardingProfile } from "@/lib/onboarding/types";
import { createClient } from "@/lib/supabase/client";
import { mapWorkoutRow } from "@/lib/workouts/map-db-row";
import { notifyWorkoutsMutated } from "@/lib/workouts/workouts-events";
import { loadCoachModeEnabled, persistCoachModeEnabled } from "@/lib/workout-session/coach-mode-storage";
import type { TodayRoutinePlan } from "@/lib/routine/today-routine-plan";
import type { WorkoutRow } from "@/types/workout";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Phase = "idle" | "active" | "done";
type CoachBetweenPhase = "lifting" | "rest";

type SessionSet = {
  exercise: string;
  weight: number;
  reps: number;
  sets: number;
  success: boolean;
  pr: boolean;
  volume: number;
};

function loadOnboarding(): OnboardingProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ONBOARDING_LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingProfile;
  } catch {
    return null;
  }
}

function guessExerciseFromRoutineTitle(title: string): string {
  const t = title.toLowerCase();
  if (/하체|leg|스쿼트/.test(t)) return "스쿼트";
  if (/밀기|push|가슴|벤치/.test(t)) return "벤치 프레스";
  if (/당기기|pull|등|로우/.test(t)) return "랫풀다운";
  if (/전신|서킷/.test(t)) return "케틀벨 스윙";
  if (/코어|안정/.test(t)) return "플랭크";
  if (/회복|스트레칭|산책/.test(t)) return "가벼운 워킹";
  return "";
}

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

type Props = { userId: string };

const fieldBase =
  "w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-apple-ink shadow-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/15 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-500/30";

const btnGhost =
  "min-h-[48px] rounded-xl border border-neutral-200 bg-neutral-50 text-[15px] font-bold text-apple-ink transition hover:border-black hover:bg-white active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-700";

const btnPrimaryBase =
  "min-h-[56px] rounded-xl border border-black bg-black text-[16px] font-bold text-white transition hover:bg-white hover:text-black disabled:opacity-50 dark:border-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200";

const btnPrimary = `${btnPrimaryBase} w-full`;

const cardMuted =
  "rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/80";

export function WorkoutSessionClient({ userId }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [workouts, setWorkouts] = useState<WorkoutRow[]>([]);
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [nowTs, setNowTs] = useState(() => Date.now());
  const [frozenDurationMs, setFrozenDurationMs] = useState(0);
  const [exercise, setExercise] = useState("");
  const [weight, setWeight] = useState(20);
  const [reps, setReps] = useState(8);
  const [sets, setSets] = useState(3);
  const [success, setSuccess] = useState(true);
  const [sessionSets, setSessionSets] = useState<SessionSet[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [prHighlight, setPrHighlight] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [coachMode, setCoachMode] = useState(true);
  const [coachBetween, setCoachBetween] = useState<CoachBetweenPhase>("lifting");
  const [restStartedAt, setRestStartedAt] = useState<number | null>(null);
  const [coachCue, setCoachCue] = useState<string | null>(null);
  const coachModeRef = useRef(coachMode);
  coachModeRef.current = coachMode;

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      setWorkouts([]);
    } else {
      setWorkouts((data ?? []).map((r) => mapWorkoutRow(r as Record<string, unknown>)));
    }
    setHydrated(true);
  }, [userId]);

  useEffect(() => {
    setProfile(loadOnboarding());
    setCoachMode(loadCoachModeEnabled());
    void refresh();
  }, [refresh]);

  function setCoachModePersist(next: boolean) {
    setCoachMode(next);
    persistCoachModeEnabled(next);
    if (!next) {
      setCoachBetween("lifting");
      setRestStartedAt(null);
    }
  }

  const routine: TodayRoutinePlan = useMemo(
    () => buildOptimizedTodayRoutine(profile, workouts, new Date()),
    [profile, workouts],
  );

  useEffect(() => {
    if (phase !== "active" || startedAt === null) return;
    const id = window.setInterval(() => setNowTs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [phase, startedAt]);

  useEffect(() => {
    if (phase !== "done") {
      setCelebrate(false);
      return;
    }
    const t = window.setTimeout(() => setCelebrate(true), 80);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const prevSame = useMemo(() => getLastSameExercise(workouts, exercise), [workouts, exercise]);

  function startSession() {
    const guess = guessExerciseFromRoutineTitle(routine.title);
    setExercise((e) => (e.trim() ? e : guess));
    const t = Date.now();
    setStartedAt(t);
    setNowTs(t);
    setSessionSets([]);
    setCoachBetween("lifting");
    setRestStartedAt(null);
    setCoachCue(null);
    setPhase("active");
  }

  function resumeAfterRest() {
    setCoachBetween("lifting");
    setRestStartedAt(null);
    setCoachCue("자, 다음 세트 가보자고");
    window.setTimeout(() => setCoachCue(null), 7000);
  }

  async function saveSet() {
    setCoachCue(null);
    const name = exercise.trim();
    if (!name) {
      setToast("종목 이름부터 적어줘요");
      return;
    }
    setSaving(true);
    const w = Number(weight);
    const r = Math.round(Number(reps));
    const s = Math.round(Number(sets));
    const vol = volumeFromNumbers(w, r, s);
    const pr = isNewVolumePr(workouts, name, vol);
    const supabase = createClient();
    const { error } = await supabase.from("workouts").insert({
      user_id: userId,
      exercise_name: name,
      weight_kg: w,
      reps: r,
      sets: s,
      success,
    });
    setSaving(false);
    if (error) {
      setToast(error.message);
      return;
    }
    await refresh();
    notifyWorkoutsMutated();
    setSessionSets((prev) => [
      ...prev,
      { exercise: name, weight: w, reps: r, sets: s, success, pr, volume: Math.round(vol * 10) / 10 },
    ]);
    if (pr) {
      setPrHighlight(true);
      window.setTimeout(() => setPrHighlight(false), 5200);
    } else {
      setToast("저장 완료");
    }
    if (coachModeRef.current) {
      setCoachBetween("rest");
      setRestStartedAt(Date.now());
    }
  }

  function finishSession() {
    if (startedAt !== null) {
      setFrozenDurationMs(Date.now() - startedAt);
    }
    setCoachBetween("lifting");
    setRestStartedAt(null);
    setCoachCue(null);
    setPhase("done");
  }

  const summary = useMemo(() => {
    const vol = sessionSets.reduce((a, x) => a + x.volume, 0);
    const prn = sessionSets.filter((x) => x.pr).length;
    return {
      sets: sessionSets.length,
      volume: Math.round(vol * 10) / 10,
      prCount: prn,
    };
  }, [sessionSets]);

  const elapsedLabel = useMemo(() => {
    if (phase === "active" && startedAt !== null) return formatElapsed(nowTs - startedAt);
    if (phase === "done") return formatElapsed(frozenDurationMs);
    return "0:00";
  }, [phase, startedAt, nowTs, frozenDurationMs]);

  const inRestPhase = coachMode && phase === "active" && coachBetween === "rest" && restStartedAt !== null;
  const restElapsedMs = inRestPhase ? nowTs - restStartedAt : 0;
  const restElapsedLabel = formatElapsed(restElapsedMs);
  const longRestNudge = inRestPhase && restElapsedMs >= 90_000;
  const restBlocksSave = inRestPhase;

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-16 pt-6 text-apple-ink sm:px-6 sm:pt-8 md:max-w-3xl md:pb-20 lg:max-w-6xl lg:px-10 lg:pt-10 dark:text-zinc-100">
      <header className="mb-6 shrink-0 border-b border-neutral-200 pb-4 dark:border-zinc-800 sm:mb-8 lg:mb-10">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-apple-subtle dark:text-zinc-500">코치 모드</span>
          <button
            type="button"
            role="switch"
            aria-checked={coachMode}
            aria-label={coachMode ? "코치 모드 켜짐" : "코치 모드 꺼짐"}
            onClick={() => setCoachModePersist(!coachMode)}
            className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${coachMode ? "bg-emerald-600" : "bg-neutral-300 dark:bg-zinc-600"}`}
          >
            <span
              className={`absolute left-1 top-1 size-6 rounded-full bg-white shadow transition-transform ${coachMode ? "translate-x-6" : "translate-x-0"}`}
            />
            <span className="sr-only">{coachMode ? "켜짐" : "꺼짐"}</span>
          </button>
        </div>
        <div className="mt-4 flex justify-center">
          {phase === "active" ? (
            <span className="font-display text-xl font-bold tabular-nums text-emerald-700 sm:text-2xl md:text-3xl dark:text-emerald-400">
              {elapsedLabel}
            </span>
          ) : phase === "done" ? (
            <span className="font-display text-lg font-bold tabular-nums text-emerald-700 dark:text-emerald-400">{elapsedLabel}</span>
          ) : (
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-apple-subtle dark:text-zinc-500">운동 모드</span>
          )}
        </div>
      </header>

      {coachCue ? (
        <div
          className="mb-4 rounded-2xl border-2 border-emerald-500/60 bg-gradient-to-br from-emerald-50 to-teal-50 px-4 py-3.5 text-center shadow-md dark:border-emerald-600/50 dark:from-emerald-950/50 dark:to-teal-950/40"
          role="status"
          aria-live="polite"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-300/90">코치</p>
          <p className="mt-1 font-display text-[1.2rem] font-bold text-emerald-950 dark:text-emerald-100">{coachCue}</p>
        </div>
      ) : null}

      {prHighlight ? (
        <div
          className="pointer-events-none fixed inset-x-4 top-24 z-40 flex justify-center sm:inset-x-auto sm:left-1/2 sm:w-[min(92vw,400px)] sm:-translate-x-1/2"
          role="alert"
        >
          <div className="w-full rounded-2xl border-2 border-amber-400/90 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 px-5 py-4 text-center shadow-[0_16px_48px_-10px_rgba(245,158,11,0.6)] ring-4 ring-amber-300/35">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-100/90">PR</p>
            <p className="mt-1 font-display text-[1.35rem] font-bold text-white">PR 떴다</p>
            <p className="mt-1 text-[14px] font-medium text-amber-50">이번 세트가 이 종목 볼륨 최댓값 찍었어요.</p>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="pointer-events-none fixed left-1/2 top-28 z-50 -translate-x-1/2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-[13px] font-medium text-apple-ink shadow-lg dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100">
          {toast}
        </div>
      ) : null}

      <main className="flex min-h-[50vh] flex-col">
        {phase === "idle" ? (
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center md:max-w-none lg:py-4">
            <div className="md:grid md:grid-cols-[1fr_min(26rem,100%)] md:items-center md:gap-x-12 lg:gap-x-16 xl:grid-cols-[1fr_min(28rem,100%)]">
              <div className="md:text-left">
                <p className="text-center text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700 md:text-left dark:text-emerald-400/90">
                  오늘 한 판
                </p>
                <h1 className="font-display mt-3 text-center text-[1.75rem] font-bold leading-tight tracking-[-0.03em] text-apple-ink sm:text-[2rem] md:text-left lg:text-[2.25rem] dark:text-zinc-100">
                  {routine.title}
                </h1>
                <p className="mt-3 text-center text-[15px] leading-relaxed text-apple-subtle md:text-left md:text-[16px] lg:max-w-xl dark:text-zinc-400">
                  {routine.description.split("\n")[0]}
                </p>
              </div>
              <div className="mt-10 md:mt-0 md:flex md:flex-col md:justify-center">
                <button
                  type="button"
                  onClick={startSession}
                  className={`${btnPrimary} rounded-2xl text-[17px] active:scale-[0.99] lg:min-h-[60px] lg:text-[18px]`}
                >
                  가보자고
                </button>
                <p className="mt-4 text-center text-[12px] text-apple-subtle md:text-left dark:text-zinc-500">
                  세트마다 저장되고 홈이랑 싹 맞춰져요.
                </p>
                <p className="mt-2 text-center text-[11px] font-medium leading-relaxed text-apple-subtle md:text-left dark:text-zinc-500">
                  {coachMode
                    ? "코치 모드 ON: 세트 저장하면 휴식 타이머 돌고, 다음 세트 때 한 줄로 깨워줘요."
                    : "코치 모드 켜면 세트 사이 휴식도 재고, 다음 세트 타이밍도 잡아줘요."}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {phase === "active" ? (
          <div className="mx-auto w-full pb-8 lg:pb-12">
            {inRestPhase ? (
              <div
                className="mb-6 rounded-2xl border-2 border-sky-500/50 bg-gradient-to-br from-sky-50 via-indigo-50/80 to-violet-50 p-5 shadow-lg ring-2 ring-sky-400/20 dark:border-sky-700/50 dark:from-sky-950/40 dark:via-indigo-950/30 dark:to-violet-950/30 dark:ring-sky-500/15"
                role="region"
                aria-label="세트 간 휴식"
              >
                <p className="text-center text-[10px] font-bold uppercase tracking-[0.22em] text-sky-800 dark:text-sky-300/90">실시간 코치</p>
                <p className="mt-2 text-center font-display text-[1.35rem] font-bold text-sky-950 dark:text-sky-50" aria-live="polite">
                  휴식 시간입니다
                </p>
                <p className="mt-1 text-center text-[13px] font-medium text-sky-900/85 dark:text-sky-100/85">세트 사이 쉬는 타임 — 타이머로 얼마나 쉬었는지 보면 돼요.</p>
                <p className="mt-4 text-center font-display text-4xl font-bold tabular-nums tracking-tight text-indigo-900 dark:text-indigo-100 sm:text-5xl">
                  {restElapsedLabel}
                </p>
                {longRestNudge ? (
                  <p className="mt-3 text-center text-[12px] font-semibold text-indigo-800 dark:text-indigo-200/90">
                    1분 30초 넘게 쉬었어요. 몸 풀렸으면 다음 세트로 넘어가도 돼요.
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={resumeAfterRest}
                  className="mt-5 w-full min-h-[52px] rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 text-[16px] font-bold text-white shadow-md transition hover:opacity-95 active:scale-[0.99]"
                >
                  다음 세트 갈게
                </button>
              </div>
            ) : null}

            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-10 xl:gap-14">
              <div className="flex min-w-0 flex-col gap-6 lg:rounded-2xl lg:border lg:border-neutral-200 lg:bg-white lg:p-8 lg:shadow-sm dark:lg:border-zinc-800 dark:lg:bg-zinc-950/50">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-apple-subtle dark:text-zinc-500">종목</label>
                  <input
                    value={exercise}
                    onChange={(e) => setExercise(e.target.value)}
                    className={`mt-2 ${fieldBase} text-[18px] font-semibold lg:text-[19px]`}
                    placeholder="예: 스쿼트"
                    autoComplete="off"
                  />
                </div>

                {prevSame ? (
                  <div className="rounded-xl border border-amber-200/90 bg-amber-50 px-4 py-3 dark:border-amber-700/50 dark:bg-amber-950/30">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-800 dark:text-amber-200/90">이전 기록</p>
                    <p className="mt-1 text-[16px] font-semibold text-apple-ink dark:text-zinc-100">
                      {Number(prevSame.weight_kg)}kg × {prevSame.reps} × {prevSame.sets}
                      <span className="ml-2 text-[13px] font-medium text-amber-900/90 dark:text-amber-100/80">볼륨 {rowVolume(prevSame)}</span>
                    </p>
                  </div>
                ) : hydrated && exercise.trim() ? (
                  <div className={`${cardMuted} text-[14px] text-apple-subtle dark:text-zinc-400`}>
                    이 종목 기록 아직 없어요. 첫 세트부터 박아봐요.
                  </div>
                ) : null}

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-apple-subtle dark:text-zinc-500">중량 (kg)</label>
                  <div className="mt-2 flex flex-wrap gap-2 lg:gap-3">
                    {[-5, -2.5, 2.5, 5].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setWeight((w) => Math.max(0, Math.round((w + d) * 2) / 2))}
                        className={`${btnGhost} min-w-[4.5rem] flex-1 tabular-nums text-emerald-800 dark:text-emerald-400 sm:min-w-[5.5rem] lg:min-h-[52px] lg:flex-none lg:px-6`}
                      >
                        {d > 0 ? `+${d}` : d}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className={`mt-3 ${fieldBase} py-4 text-center text-[2rem] font-bold tabular-nums lg:py-5 lg:text-[2.5rem]`}
                  />
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-6 lg:rounded-2xl lg:border lg:border-neutral-200 lg:bg-white lg:p-8 lg:shadow-sm dark:lg:border-zinc-800 dark:lg:bg-zinc-950/50">
                <div className="grid grid-cols-2 gap-4 md:gap-5 lg:gap-6">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-apple-subtle dark:text-zinc-500">횟수</label>
                    <div className="mt-2 flex gap-2">
                      <button type="button" onClick={() => setReps((x) => Math.max(1, x - 1))} className={`${btnGhost} min-h-[52px] flex-1 text-lg`}>
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={reps}
                        onChange={(e) => setReps(Math.max(1, Number(e.target.value)))}
                        className={`min-w-0 flex-1 ${fieldBase} py-3 text-center text-xl font-bold tabular-nums lg:text-2xl`}
                      />
                      <button type="button" onClick={() => setReps((x) => x + 1)} className={`${btnGhost} min-h-[52px] flex-1 text-lg`}>
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-apple-subtle dark:text-zinc-500">세트</label>
                    <div className="mt-2 flex gap-2">
                      <button type="button" onClick={() => setSets((x) => Math.max(1, x - 1))} className={`${btnGhost} min-h-[52px] flex-1 text-lg`}>
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={sets}
                        onChange={(e) => setSets(Math.max(1, Number(e.target.value)))}
                        className={`min-w-0 flex-1 ${fieldBase} py-3 text-center text-xl font-bold tabular-nums lg:text-2xl`}
                      />
                      <button type="button" onClick={() => setSets((x) => x + 1)} className={`${btnGhost} min-h-[52px] flex-1 text-lg`}>
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-1 dark:border-zinc-700 dark:bg-zinc-900/80">
                  <button
                    type="button"
                    onClick={() => setSuccess(true)}
                    className={`flex-1 rounded-lg py-3 text-[15px] font-bold transition lg:py-3.5 ${success ? "bg-emerald-600 text-white dark:bg-emerald-600" : "text-apple-subtle dark:text-zinc-500"}`}
                  >
                    성공
                  </button>
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className={`flex-1 rounded-lg py-3 text-[15px] font-bold transition lg:py-3.5 ${!success ? "bg-rose-600 text-white" : "text-apple-subtle dark:text-zinc-500"}`}
                  >
                    실패
                  </button>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:flex-row-reverse md:items-stretch md:gap-4">
                  <button
                    type="button"
                    disabled={saving || restBlocksSave}
                    onClick={() => void saveSet()}
                    className={`${btnPrimaryBase} w-full flex-1 rounded-2xl md:min-h-[56px]`}
                  >
                    {saving ? "저장 중…" : restBlocksSave ? "휴식 중 — 위 버튼 먼저" : "세트 저장"}
                  </button>
                  <button
                    type="button"
                    onClick={finishSession}
                    className="w-full shrink-0 rounded-2xl border border-neutral-300 bg-white py-3 text-[14px] font-semibold text-apple-subtle transition hover:border-black hover:text-apple-ink md:max-w-[13rem] md:py-3.5 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-400 dark:hover:text-zinc-100"
                  >
                    오늘은 여기까지
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {phase === "done" ? (
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center md:max-w-none lg:max-w-5xl">
            <div className="w-full md:grid md:grid-cols-[auto_1fr] md:items-start md:gap-10 md:text-left lg:gap-14">
              <div
                className={`mx-auto flex size-28 items-center justify-center rounded-full border-4 border-emerald-500/40 bg-emerald-100 text-5xl text-emerald-800 transition duration-500 dark:border-emerald-500/35 dark:bg-emerald-950/50 dark:text-emerald-200 md:mx-0 md:size-32 md:text-6xl ${
                  celebrate ? "scale-100 opacity-100" : "scale-50 opacity-0"
                }`}
                aria-hidden
              >
                ✓
              </div>
              <div className="min-w-0 md:pt-1">
                <h2 className="font-display mt-8 text-2xl font-bold text-apple-ink md:mt-0 md:text-3xl dark:text-zinc-100">오늘도 고생했어요</h2>
                <p className="mt-2 text-[15px] text-apple-subtle md:text-[16px] dark:text-zinc-400">이번 세션 스탯</p>
                {summary.prCount > 0 ? (
                  <p className="mt-2 text-[15px] font-semibold text-amber-800 dark:text-amber-300">PR 세트 {summary.prCount}개 — 오늘도 한계 갈아끼웠네요.</p>
                ) : null}
                <dl className="mt-8 grid w-full gap-3 text-left sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
                  <div className="flex justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/80 sm:flex-col sm:justify-start sm:gap-1 sm:py-4">
                    <dt className="text-apple-subtle dark:text-zinc-500">세트</dt>
                    <dd className="font-display text-xl font-bold tabular-nums text-apple-ink dark:text-zinc-100">{summary.sets}</dd>
                  </div>
                  <div className="flex justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/80 sm:flex-col sm:justify-start sm:gap-1 sm:py-4">
                    <dt className="text-apple-subtle dark:text-zinc-500">볼륨 합</dt>
                    <dd className="font-display text-xl font-bold tabular-nums text-apple-ink dark:text-zinc-100">{summary.volume}</dd>
                  </div>
                  <div className="flex justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/80 sm:flex-col sm:justify-start sm:gap-1 sm:py-4">
                    <dt className="text-apple-subtle dark:text-zinc-500">PR 세트</dt>
                    <dd className="font-display text-xl font-bold tabular-nums text-amber-700 dark:text-amber-300">{summary.prCount}</dd>
                  </div>
                  <div className="flex justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/80 sm:flex-col sm:justify-start sm:gap-1 sm:py-4">
                    <dt className="text-apple-subtle dark:text-zinc-500">시간</dt>
                    <dd className="font-display text-xl font-bold tabular-nums text-apple-ink dark:text-zinc-100">{elapsedLabel}</dd>
                  </div>
                </dl>
                <Link
                  href="/"
                  className={`${btnPrimary} mt-10 flex items-center justify-center rounded-2xl md:mt-8 md:inline-flex md:w-auto md:min-w-[12rem] md:px-10`}
                >
                  홈 가기
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
