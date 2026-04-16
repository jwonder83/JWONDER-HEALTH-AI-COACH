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
};

export type SiteSettingsMerged = {
  images: SiteImagesConfig;
  copy: SiteCopyConfig;
};
