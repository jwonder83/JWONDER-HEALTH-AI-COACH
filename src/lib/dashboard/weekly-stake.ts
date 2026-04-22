export type WeeklyStakeModel = {
  active: true;
  weeklyTarget: number;
  currentRows: number;
  /** 0–100, 주간 세트 목표 대비 */
  progressPercent: number;
  /** 이번 주(월~일) 남은 캘린더 일수(오늘 포함) */
  daysRemainingInWeek: number;
  /** 오늘 0세트로 끝낼 때 “달성 여지”가 줄어드는 정도(메시지·UI용 %p) */
  opportunityLossPercent: number;
  /** 진행률 바 감소 프리뷰 애니메이션 끝의 scaleX (0~1) */
  dipEndScale: number;
  /** 주간 페이스 대비 뒤처짐(강도·시간 조정 트리거) */
  behindPace: boolean;
  /** 오늘 미수행 + 밀림 시 루틴에 적용할 시간 스케일 */
  routineTimeFactor: number;
  lossHeadline: string;
  lossSubline: string;
};

function mondayIndexFromDate(d: Date): number {
  return (d.getDay() + 6) % 7;
}

/** 월요일~일요일 기준 오늘 포함 남은 일 수 */
export function calendarDaysLeftInWeek(now: Date): number {
  return 7 - mondayIndexFromDate(now);
}

/**
 * 주간 세트 목표 대비 “안 하면 손해” 지표.
 * 목표 미설정·비로드 시 null.
 */
export function computeWeeklyStake(
  weeklySessionTarget: number | null,
  weeklySessionCurrent: number,
  hydrated: boolean,
  todayWorkoutComplete: boolean,
  now = new Date(),
): WeeklyStakeModel | null {
  if (!hydrated || !weeklySessionTarget || weeklySessionTarget < 1) return null;

  const currentRows = weeklySessionCurrent;
  const progressPercent = Math.min(100, Math.round((currentRows / weeklySessionTarget) * 100));

  const slot = mondayIndexFromDate(now) + 1;
  const expectedByToday = Math.max(1, Math.ceil((weeklySessionTarget * slot) / 7));
  const behindPace = !todayWorkoutComplete && currentRows < expectedByToday - 1;

  const daysRemaining = calendarDaysLeftInWeek(now);
  const opportunityLossPercent = Math.min(22, Math.max(6, Math.round(100 / Math.max(weeklySessionTarget, 4))));

  const dipEndScale =
    progressPercent <= 0
      ? 0.55
      : Math.max(0.35, Math.min(0.98, (progressPercent - opportunityLossPercent) / progressPercent));

  const lossHeadline = todayWorkoutComplete
    ? `오늘은 주간 목표 진행에 반영됐어요. (${progressPercent}%)`
    : `오늘 운동을 하지 않으면 주간 목표 달성 여지가 약 ${opportunityLossPercent}% 줄어듭니다.`;

  const lossSubline = todayWorkoutComplete
    ? "내일도 이 리듬을 이어가면 손해 없이 주간표를 채울 수 있어요."
    : behindPace
      ? `페이스 기준으로는 이번 주 ${expectedByToday}세트 부근까지 와 있어야 해요. 지금 ${currentRows}세트입니다.`
      : `지금 달성률 ${progressPercent}% · 오늘 한 세트만 남겨도 여지를 지킬 수 있어요.`;

  const routineTimeFactor = !todayWorkoutComplete && behindPace ? 0.94 : 1;

  return {
    active: true,
    weeklyTarget: weeklySessionTarget,
    currentRows,
    progressPercent,
    daysRemainingInWeek: daysRemaining,
    opportunityLossPercent,
    dipEndScale,
    behindPace,
    routineTimeFactor,
    lossHeadline,
    lossSubline,
  };
}
