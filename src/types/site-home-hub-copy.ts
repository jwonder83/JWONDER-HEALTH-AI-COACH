/** 홈 상단 액션 허브·리본·카드 등 — 어드민 「사이트」에서 편집 */

export type SiteOnboardingBannerCopy = {
  bodyPrefix: string;
  bodyStrong: string;
  bodySuffix: string;
  ctaStart: string;
  ctaLater: string;
};

export type SiteHomeSecondaryCopy = {
  /** HomeActionHub 하단 섹션 소제목 */
  sectionEyebrow: string;
};

export type SiteUserWorkoutRibbonCopy = {
  stateIdle: string;
  stateActive: string;
  stateCompleted: string;
  stateMissed: string;
  /** `{label}` 치환 */
  ariaLabelTemplate: string;
  messageIdleBefore: string;
  messageIdleHighlight: string;
  messageIdleAfter: string;
  messageActive: string;
  messageCompleted: string;
  messageMissed: string;
  ctaStartWorkout: string;
  ctaResumeSession: string;
  ctaViewAnalysis: string;
  ctaQuickStart: string;
  ctaFindShortRoutine: string;
};

export type SiteStreakMilestoneBadgesCopy = {
  titleEyebrow: string;
  streakWord: string;
  unlocked: string;
  locked: string;
  /** `{next}` `{remaining}` */
  nextBadgeTemplate: string;
  fullComboLine: string;
};

export type SiteNoWorkoutInterventionCopy = {
  phaseMorning: string;
  phaseAfternoon: string;
  phaseEvening: string;
  phaseNight: string;
  eyebrowTodayLine: string;
  reasonBadge: string;
  routineLinePlanLockedSuffix: string;
  routineLinePlanOpenSuffix: string;
  nightStreakHint: string;
  ctaStartNow: string;
  ctaQuickRoutine: string;
  programLink: string;
};

export type SiteTodayWorkoutHeroCopy = {
  routineFeedEyebrow: string;
  reasonChip: string;
  rulesEngineFootnote: string;
  liveFeedFootnote: string;
  pickEyebrow: string;
  badgeTodayLocked: string;
  badgeSessionActive: string;
  missedHint: string;
  decisionEyebrow: string;
  /** `{percent}` */
  trustTemplate: string;
  primaryReasonBadge: string;
  dataBadge: string;
  approxDurationPrefix: string;
  chipPlanConfirmed: string;
  chipPickPlan: string;
  chipSessionLogged: string;
  linkWorkoutScreen: string;
  linkProgram: string;
  ctaOneMoreSet: string;
  ctaResumeSession: string;
  ctaStartWorkout: string;
  ctaPickPlanFirst: string;
  linkProgramBrowse: string;
  linkReferenceOnly: string;
};

export type SiteTodayRoutinePlanCopy = {
  statusSuggested: string;
  statusConfirmed: string;
  statusCompleted: string;
  cardHeading: string;
  confirmedTitle: string;
  confirmedSubtitle: string;
  /** `예상 전체 {duration} · 동작별 합계 약 {minutes}분` — {duration} {minutes} */
  estimateLineTemplate: string;
  decisionReasonBadge: string;
  btnUsePlan: string;
  linkChangePlan: string;
  thExercise: string;
  thSets: string;
  thReps: string;
  thEstimate: string;
  /** `~{minutes}분` 접미사만 아님 전체 셀은 코드에서 ~ 붙임 — thEstimateMinutesSuffix */
  rowMinutesSuffix: string;
  footnoteWhenConfirmed: string;
  hintWhenSuggested: string;
  hintWhenConfirmed: string;
  hintWhenDoneTitle: string;
  /** `{days}` */
  hintWhenDoneStreakTemplate: string;
  /** `{planLabel}` */
  footnoteAutoTimeTemplate: string;
};

export type SiteTodayStatusCardCopy = {
  titleEyebrow: string;
  loadingMain: string;
  lineCompleted: string;
  lineCompletedWord: string;
  lineActive: string;
  lineActiveWord: string;
  lineMissed: string;
  lineMissedWord: string;
  lineBefore: string;
  lineBeforeWord: string;
  streakEyebrow: string;
  streakDaysSuffix: string;
  recoveryModeBadge: string;
  idleNudgeBefore: string;
  idleNudgeBold: string;
  idleNudgeAfter: string;
  /** `{seconds}` */
  activeNudgeTemplate: string;
  missedNudge: string;
  completedNudge: string;
  weeklyLoading: string;
  /** `{pct}` `{current}` `{target}` */
  weeklyProgressTemplate: string;
  weeklyNoGoalHint: string;
  progressAriaLabel: string;
};

export type SiteWorkoutListInsightsCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  volumeEyebrow: string;
  volumeUnitHint: string;
  prEyebrow: string;
  prCountSuffix: string;
  prHint: string;
  rowsEyebrow: string;
  rowsHint: string;
  muscleEyebrow: string;
  volumePrefix: string;
  weightPrefix: string;
  deltaFlat: string;
  success: string;
  fail: string;
  delete: string;
  /** `{reps}` `{sets}` — "회" "세트" 포함 가능 */
  repsSetsTemplate: string;
  volumeInlinePrefix: string;
};

/** 홈 최상단 단일 CTA (TodaySingleActionFocus) */
export type SiteHomeSingleActionCopy = {
  eyebrowWhenPlanLocked: string;
  eyebrowDefault: string;
  ctaWhenSessionActive: string;
  ctaWhenDone: string;
  ctaStart: string;
  linkChangePlanOptional: string;
};

export type SiteHomeHubCopy = {
  singleAction: SiteHomeSingleActionCopy;
  onboardingBanner: SiteOnboardingBannerCopy;
  secondary: SiteHomeSecondaryCopy;
  userRibbon: SiteUserWorkoutRibbonCopy;
  streakBadges: SiteStreakMilestoneBadgesCopy;
  noWorkout: SiteNoWorkoutInterventionCopy;
  todayHero: SiteTodayWorkoutHeroCopy;
  todayPlan: SiteTodayRoutinePlanCopy;
  todayStatus: SiteTodayStatusCardCopy;
  workoutList: SiteWorkoutListInsightsCopy;
};
