import { detectStagnantExercises, detectWeakMuscleGap } from "@/lib/routine/adaptive-routine-engine";
import type { WorkoutRow } from "@/types/workout";

export type WorkoutActionSuggestionKind = "staleness" | "weak_muscle";

export type WorkoutActionSuggestion = {
  id: string;
  kind: WorkoutActionSuggestionKind;
  problemTitle: string;
  problemSummary: string;
  solutionTitle: string;
  solutionBody: string;
  reasonDetail: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
};

function slugPart(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9가-힣-]/gi, "")
    .slice(0, 48);
}

/**
 * 정체 종목·부위 불균형을 감지해 실행 가능한 행동 제안으로 변환합니다.
 */
export function buildWorkoutActionSuggestions(workouts: WorkoutRow[], now = new Date()): WorkoutActionSuggestion[] {
  const out: WorkoutActionSuggestion[] = [];
  const stagnant = detectStagnantExercises(workouts, now);
  let staleIdx = 0;
  for (const s of stagnant) {
    const slug = slugPart(s.name) || `ex-${staleIdx}`;
    out.push({
      id: `staleness-${slug}-${staleIdx++}`,
      kind: "staleness",
      problemTitle: `「${s.name}」 볼륨이 너무 무난함`,
      problemSummary: "최근 3세트 볼륨이 거의 복붙이라 자극이 심심해졌을 수 있어요.",
      solutionTitle: "비슷한 동작으로 갈아타기",
      solutionBody: `${s.hint} 중에서 오늘 하나만 골라, 평소 중량 80~90%로 감각부터 다시 잡아봐요.`,
      reasonDetail: "최근 28일에 같은 종목 4번 이상 찍었는데, 최근 3세트 볼륨 변동이 4% 미만이에요.",
      primaryHref: "/workout",
      primaryLabel: "운동 탭에서 바로 적용",
      secondaryHref: "/program",
      secondaryLabel: "프로그램 훑기",
    });
  }

  const gap = detectWeakMuscleGap(workouts, now);
  if (gap) {
    out.push({
      id: `weak-muscle-${gap.id}`,
      kind: "weak_muscle",
      problemTitle: `${gap.label} 쪽이 좀 비어 있음`,
      problemSummary: `최근 14일 볼륨 기준으로 ${gap.label} 비중이 약 ${gap.sharePct}%예요.`,
      solutionTitle: "루틴에 슬쩍 넣을 것",
      solutionBody: `${gap.suggestedAddition}를 다음 상·하체 날에 1~2종목만 얹어봐요.`,
      reasonDetail: `최근 14일 세트 ${gap.windowRowCount}개 합쳤을 때 ${gap.label} 볼륨이 전체의 11% 미만이에요.`,
      primaryHref: "/program",
      primaryLabel: "프로그램에서 체크",
      secondaryHref: "/workout",
      secondaryLabel: "바로 운동 가기",
    });
  }

  return out;
}
