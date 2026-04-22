import { getTimeBandIntervention } from "@/lib/interventions/time-band-intervention";
import type { UserWorkoutUiState } from "@/lib/dashboard/user-workout-ui-state";

/**
 * AI 코치가 하루를 끝까지 밀어주는 단일 루프(웹 홈 기준).
 * 1 체크인 → 2 브리핑 → 3 기록 CTA → 4 세션 중 → 5 마감 → 6 시간대 개입(병행) → 7 익일 반영(완료 후)
 */
export type AiManagedLoopPhase =
  | "hydrating"
  | "checkin"
  | "briefing"
  | "workout_cta"
  | "workout_active"
  | "closing"
  | "day_closed";

export type AiManagedLoopSnapshot = {
  phase: AiManagedLoopPhase;
  /** 0~6, UI 스테퍼용 */
  stepIndex: number;
  steps: readonly { key: string; label: string }[];
  /** 한 줄 요약 — 현재 단계 */
  headline: string;
  /** 항상 이어질 다음 행동 */
  nextActionLabel: string;
  /** CTA 링크(홈 앵커 또는 운동 탭) */
  nextActionHref: string;
  /** 미완료일 때 시간대 개입이 켜져 있는지 */
  timeBandNudge: boolean;
};

const STEPS = [
  { key: "checkin", label: "체크인" },
  { key: "briefing", label: "브리핑" },
  { key: "cta", label: "기록" },
  { key: "session", label: "세션" },
  { key: "close", label: "마감" },
  { key: "nudge", label: "개입" },
  { key: "next", label: "내일" },
] as const;

export function resolveAiManagedLoopPhase(input: {
  hydrated: boolean;
  hasDailyCheckin: boolean;
  checkinModalOpen: boolean;
  postBriefingOpen: boolean;
  closingReportOpen: boolean;
  todayWorkoutComplete: boolean;
  userWorkoutUiState: UserWorkoutUiState;
}): AiManagedLoopPhase {
  if (!input.hydrated) return "hydrating";
  if (input.checkinModalOpen || !input.hasDailyCheckin) return "checkin";
  if (input.postBriefingOpen) return "briefing";
  if (input.closingReportOpen) return "closing";
  if (input.todayWorkoutComplete && input.userWorkoutUiState === "completed") return "day_closed";
  if (input.userWorkoutUiState === "active") return "workout_active";
  return "workout_cta";
}

function phaseToStepIndex(phase: AiManagedLoopPhase): number {
  switch (phase) {
    case "hydrating":
      return 0;
    case "checkin":
      return 0;
    case "briefing":
      return 1;
    case "workout_cta":
      return 2;
    case "workout_active":
      return 3;
    case "closing":
      return 4;
    case "day_closed":
      return 6;
    default:
      return 2;
  }
}

export function buildAiManagedLoopSnapshot(input: {
  hydrated: boolean;
  hasDailyCheckin: boolean;
  checkinModalOpen: boolean;
  postBriefingOpen: boolean;
  closingReportOpen: boolean;
  todayWorkoutComplete: boolean;
  userWorkoutUiState: UserWorkoutUiState;
  now: Date;
  /** 기록 CTA 기본 경로 — 홈이면 /#section-input, 전용 운동 페이지면 #앵커 */
  workoutEntryHref: string;
  /** 체크인·브리핑 단계에서 모달이 없을 때 이동할 경로(예: 전용 /workout 페이지에서는 `/`) */
  habitLoopHomeHref?: string;
}): AiManagedLoopSnapshot {
  const phase = resolveAiManagedLoopPhase(input);
  const intervention =
    input.hydrated && !input.todayWorkoutComplete
      ? getTimeBandIntervention({
          now: input.now,
          hydrated: input.hydrated,
          todayWorkoutComplete: input.todayWorkoutComplete,
        })
      : null;
  const timeBandNudge = Boolean(intervention && intervention.urgency >= 1);

  let headline = "";
  let nextActionLabel = "";
  let nextActionHref = input.workoutEntryHref;

  switch (phase) {
    case "hydrating":
      headline = "앱을 준비하는 중이에요.";
      nextActionLabel = "잠시만 기다려 주세요.";
      nextActionHref = "#";
      break;
    case "checkin":
      headline = "오늘 컨디션·가능 시간을 알려주세요.";
      nextActionLabel = "데일리 체크인 완료";
      nextActionHref = input.habitLoopHomeHref ?? "#";
      break;
    case "briefing":
      headline = "체크인이 반영된 오늘 브리핑을 확인해요.";
      nextActionLabel = "브리핑 확인 후 운동 시작";
      nextActionHref = input.habitLoopHomeHref ?? "#";
      break;
    case "workout_cta":
      headline = timeBandNudge
        ? `시간대 코치: ${intervention?.message ?? "오늘 세트를 남겨 주세요."}`
        : "오늘 세트를 남기면 루프가 이어져요.";
      nextActionLabel = "세트 기록하기";
      nextActionHref = input.workoutEntryHref;
      break;
    case "workout_active":
      headline = "운동 세션 진행 중 — 코치가 세트·휴식을 맞춰 드려요.";
      nextActionLabel = "세션 이어하기";
      nextActionHref = input.workoutEntryHref;
      break;
    case "closing":
      headline = "오늘 마감 리포트로 하루를 정리해요.";
      nextActionLabel = "마감 확인하기";
      nextActionHref = input.habitLoopHomeHref ?? "#";
      break;
    case "day_closed":
      headline = "오늘 루프 완료. 내일 아침 체크인 때 어제 결과가 반영돼요.";
      nextActionLabel = "내일 할 일 미리 보기";
      nextActionHref = "/#today-single-action";
      break;
  }

  return {
    phase,
    stepIndex: phaseToStepIndex(phase),
    steps: STEPS,
    headline,
    nextActionLabel,
    nextActionHref,
    timeBandNudge,
  };
}
