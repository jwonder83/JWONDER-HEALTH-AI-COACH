import { hasWorkoutToday } from "@/lib/dashboard/insights";
import { yesterdayMissedWithPriorHistory } from "@/lib/dashboard/recovery-workout-ux";
import { countConsecutiveMissedCalendarDaysBeforeToday } from "@/lib/habit-loop/failure-rebound";
import { detectWeakMuscleGap } from "@/lib/routine/adaptive-routine-engine";
import { muscleGroupLabel } from "@/lib/workouts/exercise-muscle-group";
import type { WorkoutRow } from "@/types/workout";

const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function hasWorkoutOnLocalDay(workouts: WorkoutRow[], day: Date): boolean {
  const k = localDateKey(day);
  return workouts.some((w) => localDateKey(new Date(w.created_at)) === k);
}

/** 오늘 요일과 같은 요일의, 오늘 이전 최근 `count`번의 캘린더 날짜(과거→최근 순 아님, 최근부터) */
function lastSameWeekdayOccurrences(now: Date, weekday: number, count: number): Date[] {
  const out: Date[] = [];
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 12, 0, 0, 0);
  let guard = 0;
  while (out.length < count && guard < 400) {
    if (d.getDay() === weekday) out.push(new Date(d));
    d.setDate(d.getDate() - 1);
    guard++;
  }
  return out;
}

function topPreferredExerciseNames(workouts: WorkoutRow[], now: Date, windowDays: number, minCount: number, maxItems: number): string[] {
  const cut = now.getTime() - windowDays * 86400000;
  const counts = new Map<string, number>();
  for (const w of workouts) {
    if (new Date(w.created_at).getTime() < cut) continue;
    const name = w.exercise_name.trim();
    if (!name) continue;
    const k = name.toLowerCase();
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].filter(([, c]) => c >= minCount).sort((a, b) => b[1] - a[1]);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const [k] of sorted) {
    const orig = workouts.find((w) => w.exercise_name.trim().toLowerCase() === k)?.exercise_name.trim();
    const label = orig ?? k;
    if (seen.has(label.toLowerCase())) continue;
    seen.add(label.toLowerCase());
    out.push(label);
    if (out.length >= maxItems) break;
  }
  return out;
}

export type PersonalizedPressureMessage = {
  pastLine: string;
  presentLine: string;
  actionLine: string;
  /** 한 블록으로 합친 표시용 */
  fullText: string;
};

/**
 * 과거(데이터) → 현재(해석) → 행동(명령) 구조의 개인화 압박 멘트.
 * 신호가 없으면 null (UI 비표시).
 */
export function buildPersonalizedPressureMessage(workouts: WorkoutRow[], now = new Date()): PersonalizedPressureMessage | null {
  if (workouts.length < 4) return null;
  if (hasWorkoutToday(workouts, now)) return null;

  const wd = now.getDay();
  const wdLabel = WEEKDAY_KO[wd];
  const sameWd = lastSameWeekdayOccurrences(now, wd, 3);
  const last1 = sameWd[0];
  const last2 = sameWd[1];
  const missLastWd1 = Boolean(last1 && !hasWorkoutOnLocalDay(workouts, last1));
  const missLastWd2 = Boolean(last2 && !hasWorkoutOnLocalDay(workouts, last2));

  const consecutiveMiss = countConsecutiveMissedCalendarDaysBeforeToday(workouts, now);
  const yMiss = yesterdayMissedWithPriorHistory(workouts, now);
  const weak = detectWeakMuscleGap(workouts, now);
  const preferred = topPreferredExerciseNames(workouts, now, 28, 2, 1);

  let pastLine: string | null = null;

  if (consecutiveMiss >= 2) {
    pastLine = `최근 ${consecutiveMiss}일 연속으로 운동 기록이 비어 있었습니다.`;
  } else if (missLastWd1 && missLastWd2) {
    pastLine = `지난주에도 ${wdLabel}요일 운동을 놓쳤습니다.`;
  } else if (missLastWd1) {
    pastLine = `직전 ${wdLabel}요일에도 세트를 남기지 않았습니다.`;
  } else if (yMiss) {
    pastLine = "어제도 운동 기록을 남기지 않았습니다.";
  } else if (weak) {
    pastLine = `최근 2주 기록을 보면 ${muscleGroupLabel(weak.id)} 쪽 볼륨 비중이 유독 낮았습니다.`;
  } else if (preferred.length > 0) {
    pastLine = `최근 자주 하신 「${preferred[0]}」 위주로만 몸이 기울어 있습니다.`;
  }

  if (!pastLine) return null;

  const presentLine =
    weak || consecutiveMiss >= 1
      ? "같은 패턴이 반복되면 AI가 기억하는 ‘나’와 목표가 어긋납니다."
      : "오늘까지 미루면 그 흐름이 또 고정됩니다.";

  const actionLine = "→ 오늘은 반드시 진행하세요.";

  const fullText = `${pastLine}\n\n${presentLine}\n${actionLine}`;

  return { pastLine, presentLine, actionLine, fullText };
}
