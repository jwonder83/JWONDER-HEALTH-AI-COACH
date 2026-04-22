/**
 * 홈 상단 시간대별 반복 개입 — 운동 완료 시 중단.
 * 구간: 오전 06~12, 오후 12~18, 저녁 18~21, 밤 21~24 (0~06은 비표시).
 */

export type TimeBand = "morning" | "afternoon" | "evening" | "night";

export type TimeBandIntervention = {
  band: TimeBand;
  message: string;
  /** 0 가장 약함 → 3 가장 강함 (스타일 단계) */
  urgency: 0 | 1 | 2 | 3;
  label: string;
};

const MESSAGES: Record<TimeBand, { message: string; urgency: 0 | 1 | 2 | 3; label: string }> = {
  morning: {
    message: "오늘 운동 플랜이 준비되었습니다.",
    urgency: 0,
    label: "오전",
  },
  afternoon: {
    message: "아직 운동을 시작하지 않았습니다.",
    urgency: 1,
    label: "오후",
  },
  evening: {
    message: "오늘 놓치면 목표 달성에 실패합니다.",
    urgency: 2,
    label: "저녁",
  },
  night: {
    message: "10분이라도 간단 루틴을 진행하세요.",
    urgency: 3,
    label: "밤",
  },
};

function hourLocal(d: Date): number {
  return d.getHours();
}

export function resolveTimeBand(now: Date): TimeBand | null {
  const h = hourLocal(now);
  if (h < 6 || h >= 24) return null;
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  if (h < 21) return "evening";
  return "night";
}

export function getTimeBandIntervention(args: {
  now: Date;
  hydrated: boolean;
  /** 오늘 로컬일 기준 세트 기록 완료 시 개입 전부 중단 */
  todayWorkoutComplete: boolean;
}): TimeBandIntervention | null {
  if (!args.hydrated || args.todayWorkoutComplete) return null;
  const band = resolveTimeBand(args.now);
  if (!band) return null;
  const row = MESSAGES[band];
  return { band, message: row.message, urgency: row.urgency, label: row.label };
}
