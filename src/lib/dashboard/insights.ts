import type { WorkoutRow } from "@/types/workout";

export function rowVolume(w: WorkoutRow): number {
  return volumeFromNumbers(w.weight_kg, w.reps, w.sets);
}

export function volumeFromNumbers(weightKg: number, reps: number, sets: number): number {
  return Number(weightKg) * reps * sets;
}

function localDayKey(iso: string): string {
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return "";
  }
}

export function hasWorkoutToday(workouts: WorkoutRow[], now = new Date()): boolean {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const key = `${y}-${m}-${d}`;
  return workouts.some((w) => localDayKey(w.created_at) === key);
}

/** 동일 종목명(공백 무시) 기준 직전 기록 */
export function getLastSameExercise(workouts: WorkoutRow[], exerciseName: string): WorkoutRow | null {
  const t = exerciseName.trim().toLowerCase();
  if (!t) return null;
  const sorted = [...workouts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  for (const w of sorted) {
    if (w.exercise_name.trim().toLowerCase() === t) return w;
  }
  return null;
}

/** 해당 종목에서 과거 최대 볼륨 (동일 종목명) */
export function maxVolumeForExercise(workouts: WorkoutRow[], exerciseName: string): number {
  const t = exerciseName.trim().toLowerCase();
  if (!t) return 0;
  let max = 0;
  for (const w of workouts) {
    if (w.exercise_name.trim().toLowerCase() !== t) continue;
    max = Math.max(max, rowVolume(w));
  }
  return max;
}

export function isNewVolumePr(workouts: WorkoutRow[], exerciseName: string, candidateVolume: number): boolean {
  const prev = maxVolumeForExercise(workouts, exerciseName);
  return candidateVolume > prev;
}

/** 최근 N건 (시간 내림차순) */
export function recentWorkouts(workouts: WorkoutRow[], n: number): WorkoutRow[] {
  return [...workouts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, n);
}

/** 최근 7일(당일 포함) 일별 총 볼륨 — 그래프용 */
export function last7DaysVolumeSeries(workouts: WorkoutRow[], now = new Date()): { key: string; label: string; volume: number }[] {
  const out: { key: string; label: string; volume: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 12, 0, 0, 0);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const key = `${y}-${m}-${day}`;
    const label = `${m}/${day}`;
    let vol = 0;
    for (const w of workouts) {
      if (localDayKey(w.created_at) === key) vol += rowVolume(w);
    }
    out.push({ key, label, volume: vol });
  }
  return out;
}

/**
 * OpenAI 없이 규칙 기반 한 줄 코칭 (홈·퍼포먼스 상단).
 */
export function computeOneLineInsight(workouts: WorkoutRow[]): string {
  if (workouts.length === 0) {
    return "오늘 한 세트만 남겨도 주간 리듬이 시작돼요. 가벼운 복합 동작부터 시작해 보세요.";
  }

  const sorted = [...workouts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const last14 = sorted.filter((w) => Date.now() - new Date(w.created_at).getTime() < 14 * 86400000);

  const lower = ["스쿼트", "데드", "런지", "레그", "힙", "하체", "leg", "squat", "deadlift"];
  const upper = ["벤치", "프레스", "풀업", "로우", "curl", "삼두", "이두", "bench", "pull"];

  let lowerN = 0;
  let upperN = 0;
  for (const w of last14) {
    const n = w.exercise_name.toLowerCase();
    if (lower.some((k) => n.includes(k))) lowerN++;
    if (upper.some((k) => n.includes(k))) upperN++;
  }

  if (last14.length >= 4 && lowerN * 2 < upperN) {
    return "최근 상체 위주로 보여요. 하체·고관절 패턴을 주 2회 넣으면 전신 균형과 회복에 도움이 됩니다.";
  }
  if (last14.length >= 4 && upperN * 2 < lowerN) {
    return "하체 비중이 높아요. 수평 밀기·당기기(로우·벤치류)를 한 세션씩 섞어 보세요.";
  }

  const mon = new Date();
  mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7));
  mon.setHours(0, 0, 0, 0);
  const weekCount = workouts.filter((w) => new Date(w.created_at) >= mon).length;
  if (weekCount >= 5) {
    return "이번 주 기록이 꾸준해요. 한 가지 변수(중량·RIR·템포)만 바꿔 과부하를 이어가 보세요.";
  }
  if (weekCount <= 1 && workouts.length >= 3) {
    return "이번 주 접속이 드물어 보여요. 주 3회·짧은 세션만 잡아도 볼륨 추세가 살아납니다.";
  }

  const top = sorted[0]?.exercise_name?.trim();
  if (top) {
    return `최근 「${top}」 비중이 높아요. 대칭 부위·대체 종목을 한 세트씩만 추가해 볼 만해요.`;
  }
  return "기록이 쌓이고 있어요. 다음엔 RPE나 쉬는 시간을 메모해 두면 코칭이 더 정확해집니다.";
}
