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
  { key: "checkin", label: "컨디션" },
  { key: "briefing", label: "오늘 정리" },
  { key: "cta", label: "기록" },
  { key: "session", label: "운동 중" },
  { key: "close", label: "마감" },
  { key: "nudge", label: "리마인드" },
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
      headline = "불러오는 중이에요.";
      nextActionLabel = "조금만 기다려 주세요.";
      nextActionHref = "#";
      break;
    case "checkin":
      headline = "오늘 몸 상태랑, 운동할 수 있는 시간만 골라 주세요.";
      nextActionLabel = "체크인 하고 가기";
      nextActionHref = input.habitLoopHomeHref ?? "#";
      break;
    case "briefing":
      headline = "방금 고른 내용으로 오늘 운동을 짜 뒀어요.";
      nextActionLabel = "브리핑 보고 기록으로";
      nextActionHref = input.habitLoopHomeHref ?? "#";
      break;
    case "workout_cta":
      headline = timeBandNudge
        ? `${intervention?.message ?? "오늘 한 줄이라도 남겨 볼까요."}`
        : "이제 세트만 적으면 돼요.";
      nextActionLabel = "기록하러 가기";
      nextActionHref = input.workoutEntryHref;
      break;
    case "workout_active":
      headline = "지금 운동 중이에요. 쉬는 타이밍도 여기서 볼 수 있어요.";
      nextActionLabel = "화면으로 돌아가기";
      nextActionHref = input.workoutEntryHref;
      break;
    case "closing":
      headline = "오늘은 여기까지 정리할게요.";
      nextActionLabel = "마감 쪽지 열기";
      nextActionHref = input.habitLoopHomeHref ?? "#";
      break;
    case "day_closed":
      headline = "오늘은 여기까지. 내일 아침에 어제 기록이 브리핑에 섞여 들어가요.";
      nextActionLabel = "내일 카드만 보기";
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
