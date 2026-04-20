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

/** 최근 14일 볼륨 기준 부위 불균형(11% 미만) — UI·행동 제안용 */
export type WeakMuscleGap = {
  id: MuscleGroupId;
  label: string;
  sharePct: number;
  windowRowCount: number;
  suggestedAddition: string;
};

export function detectWeakMuscleGap(rows: WorkoutRow[], now = new Date()): WeakMuscleGap | null {
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
    sharePct: Math.round(share * 10) / 10,
    windowRowCount: slice.length,
    suggestedAddition: add,
  };
}

function detectWeakMuscleLine(
  rows: WorkoutRow[],
  now: Date,
): { message: string; label: string; id: MuscleGroupId; sharePct: number; windowRowCount: number } | null {
  const g = detectWeakMuscleGap(rows, now);
  if (!g) return null;
  return {
    id: g.id,
    label: g.label,
    message: `최근 ${g.label} 쪽이 좀 비어 있어요. 루틴에 ${g.suggestedAddition} 정도만 슬쩍 얹어볼까요?`,
    sharePct: g.sharePct,
    windowRowCount: g.windowRowCount,
  };
}

function profileScheduleHints(profile: OnboardingProfile | null): RoutineAdjustment[] {
  if (!profile?.goal) return [];
  const d = profile.daysPerWeek;
  if (d === 2) {
    return [
      {
        type: "schedule_hint",
        message: "주 2일이면 오늘은 복합 위주로 밀도만 살짝 올려도 충분해요.",
        reason: "온보딩에서 주간 운동일을 2일로 설정했어요.",
      },
    ];
  }
  if (d && d >= 5) {
    return [
      {
        type: "schedule_hint",
        message: `주 ${d}일이면 회복 타이트해질 수 있어요. 보조는 짧게, 메인 볼륨은 지키는 쪽으로 가볼까요?`,
        reason: `온보딩 주간 운동일이 ${d}일 이상으로 회복 여유가 상대적으로 줄어요.`,
      },
    ];
  }
  if (profile.experience === "beginner") {
    return [
      {
        type: "schedule_hint",
        message: "초급이면 RPE 6~7에서 폼이랑 호흡부터 맞추는 게 제일 이득이에요.",
        reason: "온보딩 경험치가 초급으로 저장되어 있어요.",
      },
    ];
  }
  if (profile.experience === "advanced") {
    return [
      {
        type: "schedule_hint",
        message: "상급이면 마지막 세트만 RPE 8~9까지 당겨서 과부하 체크해 봐요.",
        reason: "온보딩 경험치가 상급으로 저장되어 있어요.",
      },
    ];
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
    const msg = `「${s.name}」 볼륨이 너무 무난 편이에요. ${s.hint}로 갈아타서 자극 좀 바꿔볼까요?`;
    adjustments.push({
      type: "substitute_stale",
      message: msg,
      reason: `최근 28일에 같은 종목 4번+ 찍었는데, 최근 3세트 볼륨 변동이 4% 미만이에요.`,
    });
    liveMessages.push(msg);
  }

  const weak = detectWeakMuscleLine(workouts, now);
  if (weak) {
    adjustments.push({
      type: "add_weak_muscle",
      message: weak.message,
      reason: `최근 14일 세트 ${weak.windowRowCount}개 합쳤을 때 ${weak.label} 볼륨 비중이 약 ${weak.sharePct}%라 11% 미만 규칙에 걸렸어요.`,
    });
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
  let timeAdjustNote = "";
  if (profile?.experience === "advanced" && profile.goal === "bulk") {
    maxMin = Math.min(maxMin + 5, 95);
    minMin = Math.min(minMin + 5, 90);
    timeAdjustNote = " 상급·벌크 프로필이라 예상 시간 상·하한을 각각 5분 늘렸어요.";
  }

  const dataBits: string[] = [];
  if (weak) {
    dataBits.push(`최근 14일 세트 ${weak.windowRowCount}건 중 ${weak.label} 볼륨 비중 약 ${weak.sharePct}% (11% 미만)`);
  }
  if (stagnant.length > 0) {
    dataBits.push(`「${stagnant[0].name}」 등 최근 28일 패턴에서 볼륨 정체 신호`);
  }
  let recommendationReason = base.recommendationReason;
  if (dataBits.length > 0) {
    recommendationReason = `${base.recommendationReason} — ${dataBits.join(" · ")}${timeAdjustNote}`.trim();
  } else if (timeAdjustNote) {
    recommendationReason = `${base.recommendationReason}${timeAdjustNote}`.trim();
  }

  return {
    ...base,
    description,
    estimatedMinutesMin: minMin,
    estimatedMinutesMax: maxMin,
    recommendationReason,
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
