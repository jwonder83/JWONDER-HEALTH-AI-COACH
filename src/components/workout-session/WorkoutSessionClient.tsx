"use client";

import { navHeaderLinkMuted } from "@/components/nav/menu-styles";
import { getLastSameExercise, isNewVolumePr, rowVolume, volumeFromNumbers } from "@/lib/dashboard/insights";
import { buildOptimizedTodayRoutine } from "@/lib/routine/adaptive-routine-engine";
import { ONBOARDING_LS_KEY, type OnboardingProfile } from "@/lib/onboarding/types";
import { createClient } from "@/lib/supabase/client";
import { mapWorkoutRow } from "@/lib/workouts/map-db-row";
import { notifyWorkoutsMutated } from "@/lib/workouts/workouts-events";
import type { TodayRoutinePlan } from "@/lib/routine/today-routine-plan";
import type { WorkoutRow } from "@/types/workout";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type Phase = "idle" | "active" | "done";

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

const btnPrimary =
  "min-h-[56px] w-full rounded-xl border border-black bg-black text-[16px] font-bold text-white transition hover:bg-white hover:text-black disabled:opacity-50 dark:border-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200";

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
    void refresh();
  }, [refresh]);

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
    setPhase("active");
  }

  async function saveSet() {
    const name = exercise.trim();
    if (!name) {
      setToast("종목 이름을 입력해 주세요.");
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
      setToast("세트 저장됨");
    }
  }

  function finishSession() {
    if (startedAt !== null) {
      setFrozenDurationMs(Date.now() - startedAt);
    }
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

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-16 pt-6 text-apple-ink sm:px-6 sm:pt-8 dark:text-zinc-100">
      <header className="mb-8 flex shrink-0 items-center justify-between gap-3 border-b border-neutral-200 pb-4 dark:border-zinc-800">
        <Link href="/" className={`${navHeaderLinkMuted} -ml-2 !min-h-0 py-2`}>
          ← 홈
        </Link>
        {phase === "active" ? (
          <span className="font-display text-xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">{elapsedLabel}</span>
        ) : (
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-apple-subtle dark:text-zinc-500">운동 모드</span>
        )}
        <span className="w-14 shrink-0" aria-hidden />
      </header>

      {prHighlight ? (
        <div
          className="pointer-events-none fixed inset-x-4 top-24 z-40 flex justify-center sm:inset-x-auto sm:left-1/2 sm:w-[min(92vw,400px)] sm:-translate-x-1/2"
          role="alert"
        >
          <div className="w-full rounded-2xl border-2 border-amber-400/90 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 px-5 py-4 text-center shadow-[0_16px_48px_-10px_rgba(245,158,11,0.6)] ring-4 ring-amber-300/35">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-100/90">PR</p>
            <p className="mt-1 font-display text-[1.35rem] font-bold text-white">최고 기록 갱신!</p>
            <p className="mt-1 text-[14px] font-medium text-amber-50">이번 세트가 종목 최대 볼륨을 넘었어요.</p>
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
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400/90">오늘 세션</p>
            <h1 className="font-display mt-3 text-center text-[1.75rem] font-bold leading-tight tracking-[-0.03em] text-apple-ink sm:text-[2rem] dark:text-zinc-100">
              {routine.title}
            </h1>
            <p className="mt-3 text-center text-[15px] leading-relaxed text-apple-subtle dark:text-zinc-400">
              {routine.description.split("\n")[0]}
            </p>
            <button type="button" onClick={startSession} className={`${btnPrimary} mt-10 rounded-2xl text-[17px] active:scale-[0.99]`}>
              운동 시작하기
            </button>
            <p className="mt-4 text-center text-[12px] text-apple-subtle dark:text-zinc-500">세트마다 저장되며, 홈 기록과 동기화돼요.</p>
          </div>
        ) : null}

        {phase === "active" ? (
          <div className="mx-auto flex w-full max-w-lg flex-col gap-6 pb-8">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-apple-subtle dark:text-zinc-500">종목</label>
              <input
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                className={`mt-2 ${fieldBase} text-[18px] font-semibold`}
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
                이 종목의 저장된 기록이 없어요. 첫 세트를 남겨 보세요.
              </div>
            ) : null}

            <div>
              <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-apple-subtle dark:text-zinc-500">중량 (kg)</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {[-5, -2.5, 2.5, 5].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setWeight((w) => Math.max(0, Math.round((w + d) * 2) / 2))}
                    className={`${btnGhost} min-w-[4.5rem] flex-1 tabular-nums text-emerald-800 dark:text-emerald-400 sm:min-w-[5.5rem]`}
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
                className={`mt-3 ${fieldBase} py-4 text-center text-[2rem] font-bold tabular-nums`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                    className={`min-w-0 flex-1 ${fieldBase} py-3 text-center text-xl font-bold tabular-nums`}
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
                    className={`min-w-0 flex-1 ${fieldBase} py-3 text-center text-xl font-bold tabular-nums`}
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
                className={`flex-1 rounded-lg py-3 text-[15px] font-bold transition ${success ? "bg-emerald-600 text-white dark:bg-emerald-600" : "text-apple-subtle dark:text-zinc-500"}`}
              >
                성공
              </button>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className={`flex-1 rounded-lg py-3 text-[15px] font-bold transition ${!success ? "bg-rose-600 text-white" : "text-apple-subtle dark:text-zinc-500"}`}
              >
                실패
              </button>
            </div>

            <button type="button" disabled={saving} onClick={() => void saveSet()} className={`${btnPrimary} rounded-2xl`}>
              {saving ? "저장 중…" : "세트 저장"}
            </button>

            <button
              type="button"
              onClick={finishSession}
              className="w-full rounded-2xl border border-neutral-300 bg-white py-3 text-[14px] font-semibold text-apple-subtle transition hover:border-black hover:text-apple-ink dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-400 dark:hover:text-zinc-100"
            >
              운동 마치기
            </button>
          </div>
        ) : null}

        {phase === "done" ? (
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center">
            <div
              className={`flex size-28 items-center justify-center rounded-full border-4 border-emerald-500/40 bg-emerald-100 text-5xl text-emerald-800 transition duration-500 dark:border-emerald-500/35 dark:bg-emerald-950/50 dark:text-emerald-200 ${
                celebrate ? "scale-100 opacity-100" : "scale-50 opacity-0"
              }`}
              aria-hidden
            >
              ✓
            </div>
            <h2 className="font-display mt-8 text-2xl font-bold text-apple-ink dark:text-zinc-100">수고했어요</h2>
            <p className="mt-2 text-[15px] text-apple-subtle dark:text-zinc-400">이번 세션 요약</p>
            {summary.prCount > 0 ? (
              <p className="mt-2 text-[15px] font-semibold text-amber-800 dark:text-amber-300">PR 세트 {summary.prCount} — 이번에도 한계를 넘었어요.</p>
            ) : null}
            <dl className="mt-8 grid w-full gap-3 text-left">
              <div className="flex justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/80">
                <dt className="text-apple-subtle dark:text-zinc-500">세트</dt>
                <dd className="font-display text-xl font-bold tabular-nums text-apple-ink dark:text-zinc-100">{summary.sets}</dd>
              </div>
              <div className="flex justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/80">
                <dt className="text-apple-subtle dark:text-zinc-500">볼륨 합</dt>
                <dd className="font-display text-xl font-bold tabular-nums text-apple-ink dark:text-zinc-100">{summary.volume}</dd>
              </div>
              <div className="flex justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/80">
                <dt className="text-apple-subtle dark:text-zinc-500">PR 세트</dt>
                <dd className="font-display text-xl font-bold tabular-nums text-amber-700 dark:text-amber-300">{summary.prCount}</dd>
              </div>
              <div className="flex justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900/80">
                <dt className="text-apple-subtle dark:text-zinc-500">시간</dt>
                <dd className="font-display text-xl font-bold tabular-nums text-apple-ink dark:text-zinc-100">{elapsedLabel}</dd>
              </div>
            </dl>
            <Link href="/" className={`${btnPrimary} mt-10 flex items-center justify-center rounded-2xl`}>
              홈으로
            </Link>
          </div>
        ) : null}
      </main>
    </div>
  );
}
