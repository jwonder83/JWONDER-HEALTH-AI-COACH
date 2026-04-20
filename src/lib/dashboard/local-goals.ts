export const LS_GOALS = "jws_goals_v1";

export type LocalGoals = {
  /** 이번 주에 목표로 하는 기록(행) 개수 */
  weeklySessionTarget?: number;
  /** 참고용 목표 체중(kg) */
  targetWeightKg?: number;
  /** 장기 목표 한 줄 라벨 (예: 3개월 벌크업) */
  longTermLabel?: string;
  /** 장기 목표 기간(월) — 진행률 분모 */
  longTermMonths?: 1 | 3 | 6;
  /** 장기 목표 시작일(ISO). 없으면 스냅샷에서 첫 기록일 등으로 추정 */
  longTermStartedAt?: string;
};

export function loadLocalGoals(): LocalGoals {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LS_GOALS);
    if (!raw) return {};
    const p = JSON.parse(raw) as LocalGoals;
    const months = p.longTermMonths;
    const longTermMonths =
      months === 1 || months === 3 || months === 6 ? months : undefined;
    return {
      weeklySessionTarget:
        typeof p.weeklySessionTarget === "number" && p.weeklySessionTarget > 0 ? p.weeklySessionTarget : undefined,
      targetWeightKg: typeof p.targetWeightKg === "number" && p.targetWeightKg > 0 ? p.targetWeightKg : undefined,
      longTermLabel: typeof p.longTermLabel === "string" && p.longTermLabel.trim() ? p.longTermLabel.trim().slice(0, 80) : undefined,
      longTermMonths,
      longTermStartedAt:
        typeof p.longTermStartedAt === "string" && /^\d{4}-\d{2}-\d{2}/.test(p.longTermStartedAt)
          ? p.longTermStartedAt
          : undefined,
    };
  } catch {
    return {};
  }
}

export function saveLocalGoals(g: LocalGoals): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_GOALS, JSON.stringify(g));
  } catch {
    /* quota */
  }
}
