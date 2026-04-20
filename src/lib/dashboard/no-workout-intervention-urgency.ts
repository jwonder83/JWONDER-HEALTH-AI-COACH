export type NoWorkoutUrgencyPhase = "morning" | "afternoon" | "evening" | "night";

export type NoWorkoutUrgencyLevel = "info" | "warn" | "critical";

export type NoWorkoutInterventionUrgency = {
  phase: NoWorkoutUrgencyPhase;
  /** 시간대별 적극 개입 헤드라인 */
  interventionHeadline: string;
  urgency: NoWorkoutUrgencyLevel;
};

export type NoWorkoutInterventionHourBounds = {
  morningEndHour: number;
  afternoonEndHour: number;
  eveningEndHour: number;
};

const DEFAULT_INTERVENTION_HOURS: NoWorkoutInterventionHourBounds = {
  morningEndHour: 12,
  afternoonEndHour: 18,
  eveningEndHour: 21,
};

function clampHour(v: unknown, fallback: number): number {
  if (typeof v !== "number" || !Number.isFinite(v)) return fallback;
  return Math.min(23, Math.max(0, Math.round(v)));
}

function normalizeInterventionHours(
  patch?: Partial<NoWorkoutInterventionHourBounds> | null,
): NoWorkoutInterventionHourBounds {
  if (!patch) return DEFAULT_INTERVENTION_HOURS;
  let morning = clampHour(patch.morningEndHour, DEFAULT_INTERVENTION_HOURS.morningEndHour);
  let afternoon = clampHour(patch.afternoonEndHour, DEFAULT_INTERVENTION_HOURS.afternoonEndHour);
  let evening = clampHour(patch.eveningEndHour, DEFAULT_INTERVENTION_HOURS.eveningEndHour);
  if (afternoon < morning) afternoon = morning;
  if (evening < afternoon) evening = afternoon;
  return { morningEndHour: morning, afternoonEndHour: afternoon, eveningEndHour: evening };
}

/**
 * 로컬 시각 기준 — 오늘 운동 미완료 시 개입 강도·문구.
 * 시간대 경계는 사이트 설정(기본: 오전~12 / 오후~18 / 저녁~21 / 밤).
 */
export function getNoWorkoutInterventionUrgency(
  now: Date,
  streakDays: number,
  hours?: Partial<NoWorkoutInterventionHourBounds> | null,
): NoWorkoutInterventionUrgency {
  const { morningEndHour, afternoonEndHour, eveningEndHour } = normalizeInterventionHours(hours);
  const h = now.getHours();
  let phase: NoWorkoutUrgencyPhase;
  if (h < morningEndHour) phase = "morning";
  else if (h < afternoonEndHour) phase = "afternoon";
  else if (h < eveningEndHour) phase = "evening";
  else phase = "night";

  let interventionHeadline: string;
  if (phase === "morning") {
    interventionHeadline = "오늘 계획된 운동을 시작할 차례입니다.";
  } else if (phase === "afternoon") {
    interventionHeadline = "아직 오늘 운동이 기록되지 않았습니다.";
  } else if (phase === "evening") {
    interventionHeadline =
      streakDays > 0
        ? "오늘 기록이 없으면 연속 일수가 초기화될 수 있습니다."
        : "오늘 한 세트도 남기지 않으면 공백일이 됩니다.";
  } else {
    interventionHeadline = "가능하다면 10분 내외의 가벼운 루틴이라도 진행해 보세요.";
  }

  const urgency: NoWorkoutUrgencyLevel =
    phase === "morning" || phase === "afternoon" ? "info" : phase === "evening" ? "warn" : "critical";

  return { phase, interventionHeadline, urgency };
}
