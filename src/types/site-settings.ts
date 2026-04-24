import type { SiteHomeHubCopy } from "@/types/site-home-hub-copy";

export type { SiteHomeHubCopy };

export type ImageSlot = {
  src: string;
  alt: string;
};

export type HelpFaqItem = {
  question: string;
  answer: string;
};

/** /help — 어드민에서 편집 */
export type SiteHelpCenter = {
  pageTitle: string;
  intro: string;
  contactLine: string;
  faqSectionTitle: string;
  faqItems: HelpFaqItem[];
};

/** /legal/terms, /legal/privacy — 어드민에서 편집 (플레인 텍스트) */
export type SiteLegalPages = {
  termsEyebrow: string;
  privacyEyebrow: string;
  termsTitle: string;
  termsBody: string;
  privacyTitle: string;
  privacyBody: string;
};

/** 하단 푸터 — 어드민에서 편집 (내부 경로 `/…` 또는 http(s) URL) */
export type SiteFooterLink = {
  label: string;
  href: string;
};

export type SiteFooterConfig = {
  /** 푸터 카드 상단 강조 한 줄 */
  primaryLine: string;
  /** 선택: 부가 한 줄 (비우면 표시 안 함) */
  secondaryLine: string;
  /** 링크 행 (순서대로 표시, 최대 12개) */
  links: SiteFooterLink[];
  /** 하단 문구. `{year}` 를 현재 연도로 치환합니다. */
  copyrightLine: string;
};

/** /login 폼 라벨·버튼 — 어드민에서 편집 */
export type LoginFormCopyConfig = {
  emailLabel: string;
  passwordLabel: string;
  submitLabel: string;
  submittingLabel: string;
  /** "계정이 없나요?" 등 안내 한 줄 */
  noAccountPrompt: string;
  signupLinkLabel: string;
};

/** 로그인 페이지 하단 등 부가 문구 */
export type SiteLoginExtrasCopy = {
  adminLinkLabel: string;
};

/** /signup 폼 라벨·버튼·안내 (카드·패널은 signupPanel / signupCard) */
export type SiteSignupFormCopy = {
  emailLabel: string;
  passwordLabel: string;
  submitLabel: string;
  submittingLabel: string;
  successLineBefore: string;
  successLoginCta: string;
  successLineAfter: string;
  errorGeneric: string;
  footerPrompt: string;
  footerLoginLabel: string;
};

/** 홈(/) 대시보드 전용 — 히어로 CTA·요약·바로가기·섹션 힌트 등 */
export type SiteMainDashboardCopy = {
  heroCtaTodayCard: string;
  heroPerformanceLinkLabel: string;
  summaryTotalLabel: string;
  summaryTotalUnit: string;
  summaryTotalSub: string;
  summaryWeekLabel: string;
  summaryWeekUnit: string;
  summaryWeekSub: string;
  summaryVolumeLabel: string;
  summaryVolumeUnit: string;
  summaryVolumeSubFallback: string;
  /** `{exercise}` 치환 — 1위 종목이 있을 때 부제 */
  summaryVolumeSubTopTemplate: string;
  shortcutsSectionTitle: string;
  shortcutWriteTitle: string;
  shortcutWriteSubtitle: string;
  shortcutPerformanceTitle: string;
  shortcutPerformanceSubtitle: string;
  shortcutHelpTitle: string;
  shortcutHelpSubtitle: string;
  emptyStateTitle: string;
  emptyStateSubtitle: string;
  emptyStateCta: string;
  clearAllRecordsLabel: string;
  navPageSectionsAriaLabel: string;
  sectionEyebrowInput: string;
  sectionEyebrowList: string;
  sectionEyebrowCoach: string;
  /** 입력 섹션 설명에서 프로그램 링크 앞 문장 */
  sectionHintInputBeforeProgram: string;
  sectionHintList: string;
  sessionCoachRestDay: string;
  /** `{percent}` 치환 (추천 강도 %) */
  sessionCoachActiveDayTemplate: string;
  toastPrOnFormSave: string;
  /** `{level}` `{xp}` */
  xpToastLevelUpTemplate: string;
  /** `{xp}` */
  xpToastPrTemplate: string;
  /** `{xp}` */
  xpToastGainTemplate: string;
  confirmDeleteAllRecords: string;
  confirmDeleteOneRecord: string;
  recordsCountSuffix: string;
};

/** 헤더·푸터 보조 링크 — 어드민에서 편집 */
export type SiteAppShellCopy = {
  homeAriaLabel: string;
  mainNavAriaLabel: string;
  adminLinkLabel: string;
  signOutLabel: string;
  homeLogoFallbackAlt: string;
  footerFeedbackMail: string;
  footerFeedbackForm: string;
  footerStatusFallback: string;
};

/** /settings */
export type SiteSettingsPageCopy = {
  sectionStep: string;
  sectionEyebrow: string;
  title: string;
  description: string;
  emailHeading: string;
  passwordHelp: string;
  btnSending: string;
  btnRequestReset: string;
  msgResetSent: string;
  msgGenericError: string;
};

export type SitePerformanceStoryCopy = {
  reportEyebrow: string;
  reportTitle: string;
  reportSubtitle: string;
  summaryEyebrow: string;
  thisWeekVolumeLabel: string;
  lastWeekVolumeLabel: string;
  weekDeltaLabel: string;
  rowCountLabel: string;
  highlightsTitle: string;
  chartVolumeTitle: string;
  chartVolumeSubtitle: string;
  chartWeekBarTitleTemplate: string;
  chartActiveDaysBarTitleTemplate: string;
  chartActiveDaysTitle: string;
  chartActiveDaysSubtitle: string;
  chartActiveDaysUnitSuffix: string;
  section7DayTitle: string;
  section7DaySubtitle: string;
};

export type SiteBodyWeightPanelCopy = {
  eyebrow: string;
  title: string;
  subtitleLocal: string;
  emptyHint: string;
  dateLabel: string;
  weightLabel: string;
  placeholder: string;
  saveButton: string;
  deleteButton: string;
  msgBadDate: string;
  msgBadRange: string;
  msgSavedLocal: string;
};

/** /performance */
export type SitePerformancePageCopy = {
  sectionStep: string;
  eyebrow: string;
  title: string;
  description: string;
  /** `{count}` 접미 앞 통계 배지 등 */
  countBadgeTemplate: string;
  searchLabel: string;
  searchPlaceholder: string;
  dateFromLabel: string;
  dateToLabel: string;
  resetButton: string;
  statSetsLabel: string;
  statVolumeLabel: string;
  /** `{count}` */
  csvDownloadTemplate: string;
  listPreviewTitle: string;
  emptyFiltered: string;
  outcomeSuccess: string;
  outcomeFail: string;
  story: SitePerformanceStoryCopy;
  bodyWeight: SiteBodyWeightPanelCopy;
};

/** /help 페이지에서 helpCenter 외 고정 문구 */
export type SiteHelpPageExtrasCopy = {
  pageEyebrow: string;
  programHintBeforeLink: string;
  moreLinksTitle: string;
  feedbackMailLabel: string;
  feedbackFormLabel: string;
  statusFallbackLabel: string;
};

export type SiteOnboardingCopy = {
  errorRoutineMd: string;
  eyebrow: string;
  title: string;
  intro: string;
  goalLegend: string;
  goalBulk: string;
  goalCut: string;
  goalMaintain: string;
  expLegend: string;
  expBeginner: string;
  expIntermediate: string;
  expAdvanced: string;
  daysLegend: string;
  /** `{n}` 주 n회 */
  daysPerWeekTemplate: string;
  equipmentLegend: string;
  equipmentPlaceholder: string;
  back: string;
  next: string;
  generating: string;
  submit: string;
  savedTitle: string;
  homeCta: string;
};

export type SiteBillingPagesCopy = {
  successTitle: string;
  successBodyHtmlIntro: string;
  successBodyHtmlOutro: string;
  successBullet1: string;
  successBullet2: string;
  successBullet3: string;
  homeLink: string;
  cancelTitle: string;
  cancelSubtitle: string;
  settingsLink: string;
  billingLegacyTitle: string;
  billingLegacyBody: string;
  billingLegacyCtaSuccess: string;
  billingLegacyCtaSettings: string;
};

/** /workout 세션 UI */
export type SiteWorkoutSessionCopy = {
  flowTagline: string;
  flowStep1: string;
  flowStep2: string;
  flowStep3: string;
  flowAriaLabel: string;
  coachModeLabel: string;
  coachModeAriaOn: string;
  coachModeAriaOff: string;
  coachModeSrOn: string;
  coachModeSrOff: string;
  workoutModeIdleLabel: string;
  coachCueResumeNext: string;
  toastExerciseRequired: string;
  coachCueRestTemplate: string;
  toastXpLevelTemplate: string;
  toastXpPrTemplate: string;
  toastXpGainTemplate: string;
  notifyEyebrow: string;
  prBannerEyebrow: string;
  prBannerTitle: string;
  prBannerSubtitle: string;
  idleStepEyebrow: string;
  startButton: string;
  idleHintFlow: string;
  idleHintCoachOn: string;
  idleHintCoachOff: string;
  activeStepEyebrow: string;
  restRegionAria: string;
  restEyebrow: string;
  restTitleTemplate: string;
  restProgressTemplate: string;
  restRemainingPartTemplate: string;
  restNextOk: string;
  restLongNudge: string;
  restNextButton: string;
  exerciseLabel: string;
  exercisePlaceholder: string;
  prevSameEyebrow: string;
  volumeWord: string;
  noPrevSameHint: string;
  weightLabel: string;
  repsLabel: string;
  setsLabel: string;
  weightQuickEntry: string;
  weightFineTune: string;
  repsQuickEntry: string;
  outcomeSuccess: string;
  outcomeFail: string;
  saveSet: string;
  savingSet: string;
  saveBlockedRest: string;
  finishSession: string;
  doneStepEyebrow: string;
  doneTitle: string;
  doneResultEyebrow: string;
  doneSessionLine: string;
  /** `{count}` */
  donePrSetsTemplate: string;
  summarySets: string;
  summaryVolume: string;
  summaryPrSets: string;
  summaryTime: string;
  linkHome: string;
};

/** 메인 대시보드 운동 입력 카드 문구 */
export type WorkoutFormCopyConfig = {
  eyebrow: string;
  title: string;
  subtitle: string;
  exerciseLabel: string;
  exercisePlaceholder: string;
  weightLabel: string;
  repsLabel: string;
  setsLabel: string;
  outcomeGroupLabel: string;
  outcomeAriaLabel: string;
  successLabel: string;
  failLabel: string;
  saveButtonLabel: string;
  savingButtonLabel: string;
  savedToast: string;
};

export type SiteImagesConfig = {
  /** 상단 헤더 홈 링크 — `src` 비우면 계정 이메일 이니셜 표시 */
  headerLogo: ImageSlot;
  hero: ImageSlot;
  authPanel: ImageSlot;
  dashTile1: ImageSlot;
  dashTile2: ImageSlot;
  dashTile3: ImageSlot;
  coaching: ImageSlot;
  listEmpty: ImageSlot;
};

export type SiteCopyConfig = {
  appTitle: string;
  appDescription: string;
  loginPanel: { eyebrow: string; title: string; description: string };
  loginCard: { eyebrow: string; title: string; subtitle: string };
  loginForm: LoginFormCopyConfig;
  signupPanel: { eyebrow: string; title: string; description: string };
  signupCard: { eyebrow: string; title: string; subtitle: string };
  mainHero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
  };
  /** 스티키 내비: 기록 / 목록 / 코칭 앵커 문구 */
  mainNavSectionLabels: [string, string, string];
  mainDashTileCaptions: [string, string, string];
  /** AI 코칭 블록 상단 소제목 */
  webCoachingEyebrow: string;
  webCoachingTitle: string;
  /** 본문(기술 안내 등) */
  webCoachingHint: string;
  webCoachingButtonLabel: string;
  listEmptyTitle: string;
  listEmptySubtitle: string;
  workoutForm: WorkoutFormCopyConfig;
  helpCenter: SiteHelpCenter;
  legalPages: SiteLegalPages;
  /** AI 코칭 블록 내 최근 저장 목록 제목 */
  coachingHistoryTitle: string;
  footer: SiteFooterConfig;
  loginExtras: SiteLoginExtrasCopy;
  signupForm: SiteSignupFormCopy;
  mainDashboard: SiteMainDashboardCopy;
  appShell: SiteAppShellCopy;
  settingsPage: SiteSettingsPageCopy;
  performancePage: SitePerformancePageCopy;
  helpPageExtras: SiteHelpPageExtrasCopy;
  onboarding: SiteOnboardingCopy;
  billingPages: SiteBillingPagesCopy;
  workoutSession: SiteWorkoutSessionCopy;
  homeHub: SiteHomeHubCopy;
};

export type ProgramYoutubeSlot = {
  /** YouTube 동영상 ID (watch?v= 뒤 값) */
  videoId: string;
  /** 임베드·접근성용 제목 */
  title: string;
};

/** 볼륨 섹션 등 — 새 탭으로 열리는 외부 영상·강의 링크 */
export type ProgramExternalVideoLink = {
  /** 링크 앞 짧은 안내 문구 */
  lead: string;
  /** 앵커에 보이는 제목 */
  anchorLabel: string;
  /** `https://` 또는 사이트 내부 경로(`/…`) */
  href: string;
};

/** 내장 가이드 본문에서 쓰는 이미지(각각 URL·alt) */
export type ProgramBuiltinImages = {
  hero: ImageSlot;
  barbell: ImageSlot;
  plates: ImageSlot;
  calm: ImageSlot;
  athlete: ImageSlot;
  stretch: ImageSlot;
  kettle: ImageSlot;
  rack: ImageSlot;
};

export type ProgramBuiltinVideos = {
  framework: ProgramYoutubeSlot;
  split: ProgramYoutubeSlot;
  volumeMain: ProgramYoutubeSlot;
  deload: ProgramYoutubeSlot;
  warmupMain: ProgramYoutubeSlot;
  cooldown: ProgramYoutubeSlot;
  rpe: ProgramYoutubeSlot;
  squat: ProgramYoutubeSlot;
  deadlift: ProgramYoutubeSlot;
  bench: ProgramYoutubeSlot;
};

export type ProgramSectionTitles = {
  framework: string;
  split: string;
  volume: string;
  deload: string;
  order: string;
  warmup: string;
  rpe: string;
  alternatives: string;
  checklist: string;
  micro: string;
  stats: string;
  safety: string;
};

/** 목차 항목 — `id`는 섹션 `id` 및 앵커 `#${id}` 와 동일해야 합니다. */
export type ProgramTocItem = { id: string; label: string };

/** /program — 어드민에서 편집(내장 가이드 + 마크다운 전후) */
/** 홈 상태·브리핑·운동 세션·헤더 메뉴 등 앱 동작 튜닝 — 어드민 「사이트」에서 편집 */
export type SiteExperienceConfig = {
  /** 로컬 시각 이 시각 이후면 홈에서 `missed` UI (0–23) */
  missedDayHourLocal: number;
  /** 운동 세션 코치 권장 휴식(초) */
  workoutRestTargetSeconds: number;
  /** 일별 브리핑·연속 고부하: 이 세트 수 이상이면 고부하 후보 */
  briefingHighLoadDayMinRows: number;
  /** 일별 브리핑·연속 고부하: 일 볼륨 합(kg×회×세트) 기준 */
  briefingHighLoadDayMinVolume: number;
  /** 개입 배너: 오전 구간이 끝나는 시각(시) */
  interventionMorningEndHour: number;
  interventionAfternoonEndHour: number;
  interventionEveningEndHour: number;
  /** 상단 앱 셸 주요 메뉴 라벨 */
  navLabels: {
    home: string;
    workout: string;
    performance: string;
    help: string;
    settings: string;
  };
};

export type ProgramGuideSettings = {
  /** 헤더 주요 메뉴에 표시되는 짧은 레이블 */
  navLabel: string;
  /** 홈·도움말 등에서 `/program`으로 가는 링크 문구 */
  promoLinkLabel: string;
  pageEyebrow: string;
  pageTitle: string;
  /** 짧은 리드(HTML 없음, 줄바꿈 허용) */
  pageLead: string;
  /** 내장 클리닉 본문(표·유튜브) 표시 */
  showBuiltInSections: boolean;
  /** 내장 본문 위에 붙는 마크다운(GFM) */
  prefixMarkdown: string;
  /** 내장 본문 아래에 붙는 마크다운(GFM) */
  appendixMarkdown: string;
  /** 내장 본문 목차(순서·개수는 기본과 동일하게 유지, 라벨만 바꾸는 용도 권장) */
  toc: ProgramTocItem[];
  builtinImages: ProgramBuiltinImages;
  builtinVideos: ProgramBuiltinVideos;
  /** 볼륨 랜드마크 블록 아래 심화 영상(외부 링크) — URL 비우면 해당 줄 숨김 */
  volumeExternalLink: ProgramExternalVideoLink;
  /** 각 섹션 H2 제목 */
  sectionTitles: ProgramSectionTitles;
};

export type SiteSettingsMerged = {
  images: SiteImagesConfig;
  copy: SiteCopyConfig;
  program: ProgramGuideSettings;
  experience: SiteExperienceConfig;
};
