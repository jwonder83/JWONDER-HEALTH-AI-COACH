import type { WorkoutRow } from "@/types/workout";

/** 부위별 볼륨 집계용 단순 분류(종목명 키워드 기반 추정) */
export type MuscleGroupId = "chest" | "back" | "shoulders" | "arms" | "legs" | "core" | "full";

const LABELS: Record<MuscleGroupId, string> = {
  chest: "가슴",
  back: "등",
  shoulders: "어깨",
  arms: "팔",
  legs: "하체",
  core: "코어",
  full: "전신·복합",
};

type Rule = { keys: string[]; group: MuscleGroupId };

/** 앞쪽 규칙이 우선(더 구체적인 키워드를 먼저) */
const RULES: Rule[] = [
  { keys: ["curl", "컬", "이두", "삼두", "tricep", "bicep", "wrist", "리스트"], group: "arms" },
  { keys: ["lateral", "레터럴", "사이드", "숄더", "shoulder", "델트", "delt", "ohp", "오버헤드"], group: "shoulders" },
  { keys: ["bench", "벤치", "chest", "가슴", "pec", "플라이", "fly", "pushup", "푸시업", "dip", "딥스"], group: "chest" },
  { keys: ["pull", "풀", "lat", "렛", "row", "로우", "back", "등", "deadlift", "데드", "shrug", "슈러그"], group: "back" },
  { keys: ["squat", "스쿼트", "lunge", "런지", "leg", "레그", "ham", "햄", "quad", "쿼드", "calf", "카프", "hip", "힙"], group: "legs" },
  { keys: ["plank", "플랭크", "core", "코어", "ab", "복근", "crunch"], group: "core" },
];

export function muscleGroupLabel(id: MuscleGroupId): string {
  return LABELS[id];
}

export function inferPrimaryMuscleGroup(exerciseName: string): MuscleGroupId {
  const n = exerciseName.trim().toLowerCase();
  if (!n) return "full";
  for (const r of RULES) {
    if (r.keys.some((k) => n.includes(k.toLowerCase()))) return r.group;
  }
  return "full";
}

export type MuscleVolumeSlice = {
  id: MuscleGroupId;
  label: string;
  volume: number;
};

/** 기록 전체를 부위별 볼륨으로 합산 */
export function aggregateVolumeByMuscle(workouts: WorkoutRow[]): MuscleVolumeSlice[] {
  const acc = new Map<MuscleGroupId, number>();
  for (const w of workouts) {
    const g = inferPrimaryMuscleGroup(w.exercise_name);
    const v = Number(w.weight_kg) * w.reps * w.sets;
    acc.set(g, (acc.get(g) ?? 0) + v);
  }
  const order: MuscleGroupId[] = ["chest", "back", "shoulders", "arms", "legs", "core", "full"];
  return order
    .map((id) => ({ id, label: LABELS[id], volume: acc.get(id) ?? 0 }))
    .filter((s) => s.volume > 0);
}
