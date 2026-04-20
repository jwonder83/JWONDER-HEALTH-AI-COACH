import { rowVolume } from "@/lib/dashboard/insights";
import type { OnboardingProfile } from "@/lib/onboarding/types";
import {
  aggregateVolumeByMuscle,
  muscleGroupLabel,
  type MuscleGroupId,
} from "@/lib/workouts/exercise-muscle-group";
import type { WorkoutRow } from "@/types/workout";
import { planTodayRoutine, type RoutineAdjustment, type TodayRoutinePlan } from "@/lib/routine/today-routine-plan";

function rowsLastDays(rows: WorkoutRow[], now: Date, days: number): WorkoutRow[] {
  const cut = now.getTime() - days * 86400000;
  return rows.filter((w) => new Date(w.created_at).getTime() >= cut);
}

const ADD_BY_MUSCLE: Record<MuscleGroupId, string> = {
  back: "랫풀다운·시티드 케이블로우 3×10~12",
  legs: "워킹런지·레그컬 3×12",
  chest: "푸시업·인클라인 덤벨프레스 3×10",
  shoulders: "레터럴 레이즈·페이스풀 3×15",
  arms: "로프 푸시다운·해머 컬 3×12",
  core: "데드버그·팔크 3×10",
  full: "케틀벨 스윙·파머스캐리 3×12",
};

function pickSubstituteHint(exerciseDisplay: string): string {
  const s = exerciseDisplay.toLowerCase();
  if (/스쿼트|squat|레그프레스|leg press/.test(s)) return "고블릿 스쿼트·프론트 스쿼트·핵스쿼트";
  if (/벤치|bench|bp/.test(s)) return "덤벨 프레스·딥스·스미스 인클라인";
  if (/데드|dead|rdl|루마니안/.test(s)) return "럭키아 RDL·힙쓰러스트·백 익스텐션";
  if (/로우|row|풀|pull|렛|lat/.test(s)) return "원암 덤벨로우·체스트서포티드 로우";
  if (/프레스|press|오버헤드|ohp/.test(s)) return "아놀드 프레스·랜드마인 프레스";
  if (/런지|lunge/.test(s)) return "스텝업·불가리안 스플릿 스쿼트";
  return "유사 패턴의 대체 동작(각도·그립만 바꿔도 자극이 달라져요)";
}

/** 최근 기록에서 볼륨이 거의 평탄한 종목 → 정체로 간주 */
export function detectStagnantExercises(
  rows: WorkoutRow[],
  now = new Date(),
  lookbackDays = 28,
  flatRatio = 0.04,
): { name: string; hint: string }[] {
  const recent = rowsLastDays(rows, now, lookbackDays);
  const byKey = new Map<string, WorkoutRow[]>();
  for (const w of recent) {
    const k = w.exercise_name.trim().toLowerCase();
    if (!k) continue;
    if (!byKey.has(k)) byKey.set(k, []);
    byKey.get(k)!.push(w);
  }

  const out: { name: string; hint: string }[] = [];
  for (const [, list] of byKey) {
    if (list.length < 4) continue;
    const sorted = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const last3 = sorted.slice(0, 3).map(rowVolume);
    const max = Math.max(...last3);
    const min = Math.min(...last3);
    if (max <= 0) continue;
    if ((max - min) / max <= flatRatio) {
      const display = sorted[0].exercise_name.trim();
      out.push({ name: display, hint: pickSubstituteHint(display) });
    }
  }
  out.sort((a, b) => a.name.localeCompare(b.name));
  return out.slice(0, 2);
}

function detectWeakMuscleLine(
  rows: WorkoutRow[],
  now: Date,
): { message: string; label: string; id: MuscleGroupId } | null {
  const slice = rowsLastDays(rows, now, 14);
  if (slice.length < 5) return null;
  const agg = aggregateVolumeByMuscle(slice);
  const total = agg.reduce((a, s) => a + s.volume, 0);
  if (total < 400) return null;
  const sorted = [...agg].sort((a, b) => a.volume - b.volume);
  const weakest = sorted[0];
  if (!weakest) return null;
  const share = (weakest.volume / total) * 100;
  if (share >= 11) return null;
  const add = ADD_BY_MUSCLE[weakest.id] ?? ADD_BY_MUSCLE.full;
  const label = muscleGroupLabel(weakest.id);
  return {
    id: weakest.id,
    label,
    message: `최근 ${label} 운동이 부족해 보여 루틴에 ${add}를 넣었어요.`,
  };
}

function profileScheduleHints(profile: OnboardingProfile | null): RoutineAdjustment[] {
  if (!profile?.goal) return [];
  const d = profile.daysPerWeek;
  if (d === 2) {
    return [{ type: "schedule_hint", message: "주 2일이시면 오늘은 복합 위주로 밀도 있게 가져가는 편이 좋아요." }];
  }
  if (d && d >= 5) {
    return [{ type: "schedule_hint", message: `주 ${d}일 가동이시니, 보조 운동은 짧게 줄이고 메인 볼륨을 지키는 쪽을 추천해요.` }];
  }
  if (profile.experience === "beginner") {
    return [{ type: "schedule_hint", message: "초급이시면 RPE 6~7에서 폼·호흡을 먼저 맞추는 게 이득이에요." }];
  }
  if (profile.experience === "advanced") {
    return [{ type: "schedule_hint", message: "상급이시면 마지막 세트만 RPE 8~9까지 당겨 과부하를 확인해 보세요." }];
  }
  return [];
}

/**
 * 기본 루틴 + 기록 기반 자동 수정 제안 + 읽기 쉬운 메시지.
 * GPT 연동 시 동일 `RoutineEngineInput`으로 교체 구현체를 주입하면 됨.
 */
export function buildOptimizedTodayRoutine(
  profile: OnboardingProfile | null,
  workouts: WorkoutRow[],
  now = new Date(),
): TodayRoutinePlan {
  const base = planTodayRoutine(profile, now);
  const adjustments: RoutineAdjustment[] = [];
  const liveMessages: string[] = [];

  const stagnant = detectStagnantExercises(workouts, now);
  for (const s of stagnant) {
    const msg = `「${s.name}」 볼륨이 한동안 비슷해요. ${s.hint}로 바꿔 과부하를 주는 걸 제안해요.`;
    adjustments.push({ type: "substitute_stale", message: msg });
    liveMessages.push(msg);
  }

  const weak = detectWeakMuscleLine(workouts, now);
  if (weak) {
    adjustments.push({ type: "add_weak_muscle", message: weak.message });
    liveMessages.push(weak.message);
  }

  for (const h of profileScheduleHints(profile)) {
    adjustments.push(h);
    if (liveMessages.length < 3) liveMessages.push(h.message);
  }

  let description = base.description;
  if (weak) {
    description += `\n\n(자동 보강) ${weak.label}: ${ADD_BY_MUSCLE[weak.id]}.`;
  }
  if (stagnant.length > 0) {
    description += `\n\n(자동 제안) 정체 의심 종목: ${stagnant[0].name} → ${stagnant[0].hint}.`;
  }

  let maxMin = base.estimatedMinutesMax;
  let minMin = base.estimatedMinutesMin;
  if (profile?.experience === "advanced" && profile.goal === "bulk") {
    maxMin = Math.min(maxMin + 5, 95);
    minMin = Math.min(minMin + 5, 90);
  }

  return {
    ...base,
    description,
    estimatedMinutesMin: minMin,
    estimatedMinutesMax: maxMin,
    liveMessages: liveMessages.slice(0, 3),
    adjustments: adjustments.slice(0, 5),
    source: "rules",
  };
}

export type RoutineEngineInput = {
  profile: OnboardingProfile | null;
  workouts: WorkoutRow[];
  now: Date;
};

export interface RoutineEngine {
  buildToday(input: RoutineEngineInput): TodayRoutinePlan;
}

export const rulesRoutineEngine: RoutineEngine = {
  buildToday: (input) => buildOptimizedTodayRoutine(input.profile, input.workouts, input.now),
};
