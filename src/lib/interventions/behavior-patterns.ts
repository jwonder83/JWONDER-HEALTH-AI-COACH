import type { RoutineAdjustment } from "@/lib/routine/today-routine-plan";
import type { WorkoutRow } from "@/types/workout";

const KO_DOW = ["일", "월", "화", "수", "목", "금", "토"] as const;

function dayKeyFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function localDayKey(iso: string): string {
  return dayKeyFromDate(new Date(iso));
}

function hasWorkoutOnDay(workouts: WorkoutRow[], d: Date): boolean {
  const k = dayKeyFromDate(d);
  return workouts.some((w) => localDayKey(w.created_at) === k);
}

/** 가장 최근 날짜가 [0]인, 해당 요일의 달력상 n회(주 단위) */
export function lastNCalendarWeekdays(now: Date, targetDow: number, n: number): Date[] {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
  while (d.getDay() !== targetDow) d.setDate(d.getDate() - 1);
  const out: Date[] = [];
  for (let i = 0; i < n; i++) {
    out.push(new Date(d));
    d.setDate(d.getDate() - 7);
  }
  return out;
}

export type WeekdaySkipFinding = {
  dow: number;
  label: string;
  misses: number;
  window: number;
};

/** 최근 window주 동일 요일 중 무기록이 반복되면 패턴으로 간주 */
export function detectWeekdaySkipPattern(
  workouts: WorkoutRow[],
  now: Date,
  window = 6,
): WeekdaySkipFinding | null {
  if (workouts.length < 8) return null;

  const hits: WeekdaySkipFinding[] = [];
  for (let dow = 0; dow < 7; dow++) {
    const dates = lastNCalendarWeekdays(now, dow, window);
    const misses = dates.filter((dt) => !hasWorkoutOnDay(workouts, dt)).length;
    if (misses >= 4) {
      hits.push({ dow, label: KO_DOW[dow], misses, window });
    }
  }
  if (hits.length === 0) return null;

  const todayDow = now.getDay();
  hits.sort((a, b) => {
    if (b.misses !== a.misses) return b.misses - a.misses;
    const pa = a.dow === todayDow ? 1 : 0;
    const pb = b.dow === todayDow ? 1 : 0;
    return pb - pa;
  });
  return hits[0] ?? null;
}

export type WeekdayFailRateFinding = {
  dow: number;
  label: string;
  failRate: number;
  sample: number;
};

/** 특정 요일에 세트 실패(success=false) 비율이 높은 패턴 */
export function detectWeekdayHighFailRate(
  workouts: WorkoutRow[],
  now: Date,
  lookbackDays = 42,
): WeekdayFailRateFinding | null {
  if (workouts.length < 12) return null;

  const cut = now.getTime() - lookbackDays * 86400000;
  const byDow = Array.from({ length: 7 }, () => ({ ok: 0, bad: 0 }));

  for (const w of workouts) {
    const t = new Date(w.created_at).getTime();
    if (t < cut) continue;
    const dow = new Date(w.created_at).getDay();
    if (!w.success) byDow[dow].bad += 1;
    else byDow[dow].ok += 1;
  }

  const hits: WeekdayFailRateFinding[] = [];
  for (let dow = 0; dow < 7; dow++) {
    const { ok, bad } = byDow[dow];
    const sample = ok + bad;
    if (sample < 10) continue;
    const failRate = bad / sample;
    if (failRate < 0.35) continue;
    hits.push({ dow, label: KO_DOW[dow], failRate, sample });
  }
  if (hits.length === 0) return null;

  const todayDow = now.getDay();
  hits.sort((a, b) => {
    if (b.failRate !== a.failRate) return b.failRate - a.failRate;
    const pa = a.dow === todayDow ? 1 : 0;
    const pb = b.dow === todayDow ? 1 : 0;
    return pb - pa;
  });
  return hits[0] ?? null;
}

export type BehaviorTimeScale = { factor: number; reasons: string[] };

export function computeBehaviorTimeScale(workouts: WorkoutRow[], now: Date): BehaviorTimeScale {
  const reasons: string[] = [];
  let factor = 1;

  const skip = detectWeekdaySkipPattern(workouts, now);
  if (skip && skip.dow === now.getDay()) {
    factor = Math.min(factor, 0.52);
    reasons.push(`동일 요일(${skip.label}) 최근 ${skip.window}회 중 기록 없음 ${skip.misses}회`);
  }

  const fail = detectWeekdayHighFailRate(workouts, now);
  if (fail && fail.dow === now.getDay()) {
    factor = Math.min(factor, 0.86);
    reasons.push(
      `동일 요일(${fail.label}) 최근 ${fail.sample}세트 중 실패 비율 약 ${Math.round(fail.failRate * 100)}%`,
    );
  }

  return { factor, reasons };
}

/** 시간 조정 반영 후 최종 분 범위로 문제→해결 문구를 만든다. */
export function buildWeekdayBehaviorAdjustments(
  workouts: WorkoutRow[],
  now: Date,
  estimatedMinutesMin: number,
  estimatedMinutesMax: number,
  timeScaleApplied: boolean,
): RoutineAdjustment[] {
  const out: RoutineAdjustment[] = [];
  const skip = detectWeekdaySkipPattern(workouts, now);
  if (skip && skip.dow === now.getDay()) {
    const problem = `최근 ${skip.window}주간 ${skip.label}요일에 운동을 자주 놓치는 패턴이에요.`;
    const solution = timeScaleApplied
      ? `오늘 루틴 예상 시간을 약 ${estimatedMinutesMin}~${estimatedMinutesMax}분으로 줄였어요.`
      : `오늘은 짧게라도 기록만 남기면 패턴을 깨기 쉬워요.`;
    out.push({
      type: "weekday_skip",
      message: `${problem} ${solution}`,
      reason: `최근 ${skip.window}회 중 같은 요일 무기록 ${skip.misses}회`,
      problemLine: problem,
      solutionLine: solution,
    });
  }

  const fail = detectWeekdayHighFailRate(workouts, now);
  const skipDominatesToday = skip && skip.dow === now.getDay();
  if (fail && fail.dow === now.getDay() && !skipDominatesToday) {
    const problem = `최근 ${fail.label}요일 세트에서 실패가 유독 많아요(약 ${Math.round(fail.failRate * 100)}%).`;
    const solution =
      timeScaleApplied && fail.failRate >= 0.42
        ? `오늘은 볼륨 대신 완수에 맞춰 예상 시간을 조금 줄였어요.`
        : `오늘은 중량·세트를 한 단계 낮추고 완수율부터 맞춰 보세요.`;
    out.push({
      type: "weekday_low_success",
      message: `${problem} ${solution}`,
      reason: `최근 ${fail.sample}세트 중 실패 ${Math.round(fail.failRate * 100)}%`,
      problemLine: problem,
      solutionLine: solution,
    });
  }

  return out;
}
