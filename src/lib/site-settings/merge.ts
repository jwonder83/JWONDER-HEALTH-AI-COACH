import type {
  HelpFaqItem,
  ImageSlot,
  ProgramBuiltinImages,
  ProgramBuiltinVideos,
  ProgramExternalVideoLink,
  ProgramGuideSettings,
  ProgramSectionTitles,
  ProgramTocItem,
  ProgramYoutubeSlot,
  LoginFormCopyConfig,
  SiteCopyConfig,
  SiteExperienceConfig,
  SiteFooterConfig,
  SiteFooterLink,
  SiteHelpCenter,
  SiteImagesConfig,
  SiteLegalPages,
  SiteSettingsMerged,
  WorkoutFormCopyConfig,
} from "@/types/site-settings";
import { DEFAULT_SITE_SETTINGS } from "./defaults";

function mergeImageSlot(base: ImageSlot, patch: unknown): ImageSlot {
  if (!patch || typeof patch !== "object") return base;
  const p = patch as Record<string, unknown>;
  const src = typeof p.src === "string" ? p.src.trim() : base.src;
  const alt = typeof p.alt === "string" ? p.alt : base.alt;
  return { src, alt };
}

function mergeImages(base: SiteImagesConfig, patch: unknown): SiteImagesConfig {
  if (!patch || typeof patch !== "object") return base;
  const p = patch as Record<string, unknown>;
  const keys: (keyof SiteImagesConfig)[] = [
    "headerLogo",
    "hero",
    "authPanel",
    "dashTile1",
    "dashTile2",
    "dashTile3",
    "coaching",
    "listEmpty",
  ];
  const out = { ...base };
  for (const k of keys) {
    out[k] = mergeImageSlot(base[k], p[k]);
  }
  return out;
}

function mergeString(base: string, v: unknown): string {
  return typeof v === "string" ? v : base;
}

function mergeTriple(base: [string, string, string], v: unknown): [string, string, string] {
  if (!Array.isArray(v) || v.length < 3) return base;
  const a = typeof v[0] === "string" ? v[0] : base[0];
  const b = typeof v[1] === "string" ? v[1] : base[1];
  const c = typeof v[2] === "string" ? v[2] : base[2];
  return [a, b, c];
}

function mergePanel(
  base: SiteCopyConfig["loginPanel"],
  patch: unknown,
): SiteCopyConfig["loginPanel"] {
  if (!patch || typeof patch !== "object") return base;
  const p = patch as Record<string, unknown>;
  return {
    eyebrow: mergeString(base.eyebrow, p.eyebrow),
    title: mergeString(base.title, p.title),
    description: mergeString(base.description, p.description),
  };
}

function mergeCard(
  base: SiteCopyConfig["loginCard"],
  patch: unknown,
): SiteCopyConfig["loginCard"] {
  if (!patch || typeof patch !== "object") return base;
  const p = patch as Record<string, unknown>;
  return {
    eyebrow: mergeString(base.eyebrow, p.eyebrow),
    title: mergeString(base.title, p.title),
    subtitle: mergeString(base.subtitle, p.subtitle),
  };
}

function mergeFaqItem(base: HelpFaqItem, patch: unknown): HelpFaqItem {
  if (!patch || typeof patch !== "object") return base;
  const p = patch as Record<string, unknown>;
  return {
    question: mergeString(base.question, p.question),
    answer: mergeString(base.answer, p.answer),
  };
}

function mergeHelpCenter(base: SiteHelpCenter, patch: unknown): SiteHelpCenter {
  if (!patch || typeof patch !== "object") return base;
  const p = patch as Record<string, unknown>;
  let faqItems = base.faqItems;
  if (Array.isArray(p.faqItems) && p.faqItems.length > 0) {
    const max = Math.min(8, Math.max(base.faqItems.length, p.faqItems.length));
    faqItems = [];
    for (let i = 0; i < max; i++) {
      const b = base.faqItems[i] ?? { question: "", answer: "" };
      faqItems.push(mergeFaqItem(b, p.faqItems[i]));
    }
  }
  return {
    pageTitle: mergeString(base.pageTitle, p.pageTitle),
    intro: mergeString(base.intro, p.intro),
    contactLine: mergeString(base.contactLine, p.contactLine),
    faqSectionTitle: mergeString(base.faqSectionTitle, p.faqSectionTitle),
    faqItems,
  };
}

function isSafeFooterHref(href: string): boolean {
  const t = href.trim();
  if (!t) return false;
  if (t.startsWith("/") && !t.startsWith("//")) return true;
  if (/^https?:\/\//i.test(t)) return true;
  return false;
}

function mergeFooterLink(base: SiteFooterLink, patch: unknown): SiteFooterLink {
  if (!patch || typeof patch !== "object") return base;
  const p = patch as Record<string, unknown>;
  const label = typeof p.label === "string" ? p.label : base.label;
  const hrefRaw = typeof p.href === "string" ? p.href.trim() : base.href;
  const href = isSafeFooterHref(hrefRaw) ? hrefRaw : base.href;
  return { label, href };
}

function mergeFooter(base: SiteFooterConfig, patch: unknown): SiteFooterConfig {
  if (!patch || typeof patch !== "object") return base;
  const p = patch as Record<string, unknown>;
  let links = base.links;
  if (Array.isArray(p.links) && p.links.length > 0) {
    const max = Math.min(12, p.links.length);
    const next: SiteFooterLink[] = [];
    for (let i = 0; i < max; i++) {
      const b = base.links[i] ?? { label: "링크", href: "/" };
      next.push(mergeFooterLink(b, p.links[i]));
    }
    links = next;
  }
  return {
    primaryLine: mergeString(base.primaryLine, p.primaryLine),
    secondaryLine: mergeString(base.secondaryLine, p.secondaryLine),
    links,
    copyrightLine: mergeString(base.copyrightLine, p.copyrightLine),
  };
}

function mergeLegalPages(base: SiteLegalPages, patch: unknown): SiteLegalPages {
  if (!patch || typeof patch !== "object") return base;
  const p = patch as Record<string, unknown>;
  return {
    termsTitle: mergeString(base.termsTitle, p.termsTitle),
    termsBody: mergeString(base.termsBody, p.termsBody),
    privacyTitle: mergeString(base.privacyTitle, p.privacyTitle),
    privacyBody: mergeString(base.privacyBody, p.privacyBody),
  };
}

function mergeLoginForm(base: LoginFormCopyConfig, patch: unknown): LoginFormCopyConfig {
  if (!patch || typeof patch !== "object") return base;
  const p = patch as Record<string, unknown>;
  return {
    emailLabel: mergeString(base.emailLabel, p.emailLabel),
    passwordLabel: mergeString(base.passwordLabel, p.passwordLabel),
    submitLabel: mergeString(base.submitLabel, p.submitLabel),
    submittingLabel: mergeString(base.submittingLabel, p.submittingLabel),
    noAccountPrompt: mergeString(base.noAccountPrompt, p.noAccountPrompt),
    signupLinkLabel: mergeString(base.signupLinkLabel, p.signupLinkLabel),
  };
}

function mergeWorkoutForm(base: WorkoutFormCopyConfig, patch: unknown): WorkoutFormCopyConfig {
  if (!patch || typeof patch !== "object") return base;
  const p = patch as Record<string, unknown>;
  return {
    eyebrow: mergeString(base.eyebrow, p.eyebrow),
    title: mergeString(base.title, p.title),
    subtitle: mergeString(base.subtitle, p.subtitle),
    exerciseLabel: mergeString(base.exerciseLabel, p.exerciseLabel),
    exercisePlaceholder: mergeString(base.exercisePlaceholder, p.exercisePlaceholder),
    weightLabel: mergeString(base.weightLabel, p.weightLabel),
    repsLabel: mergeString(base.repsLabel, p.repsLabel),
    setsLabel: mergeString(base.setsLabel, p.setsLabel),
    outcomeGroupLabel: mergeString(base.outcomeGroupLabel, p.outcomeGroupLabel),
    outcomeAriaLabel: mergeString(base.outcomeAriaLabel, p.outcomeAriaLabel),
    successLabel: mergeString(base.successLabel, p.successLabel),
    failLabel: mergeString(base.failLabel, p.failLabel),
    saveButtonLabel: mergeString(base.saveButtonLabel, p.saveButtonLabel),
    savingButtonLabel: mergeString(base.savingButtonLabel, p.savingButtonLabel),
    savedToast: mergeString(base.savedToast, p.savedToast),
  };
}

function mergeMainHero(
  base: SiteCopyConfig["mainHero"],
  patch: unknown,
): SiteCopyConfig["mainHero"] {
  if (!patch || typeof patch !== "object") return base;
  const p = patch as Record<string, unknown>;
  return {
    eyebrow: mergeString(base.eyebrow, p.eyebrow),
    titleLine1: mergeString(base.titleLine1, p.titleLine1),
    titleLine2: mergeString(base.titleLine2, p.titleLine2),
    subtitle: mergeString(base.subtitle, p.subtitle),
  };
}

function mergeMainNavSectionLabels(
  base: [string, string, string],
  p: Record<string, unknown>,
): [string, string, string] {
  let out = mergeTriple(base, p.mainNavSectionLabels);
  const legacy = p.mainNavCoachLabel;
  const hasTriple = Array.isArray(p.mainNavSectionLabels) && p.mainNavSectionLabels.length >= 3;
  if (!hasTriple && typeof legacy === "string" && legacy.trim()) {
    out = [out[0], out[1], mergeString(base[2], legacy)];
  }
  return out;
}

function mergeBool(base: boolean, v: unknown): boolean {
  return typeof v === "boolean" ? v : base;
}

function mergeYoutubeSlot(base: ProgramYoutubeSlot, patch: unknown): ProgramYoutubeSlot {
  if (!patch || typeof patch !== "object") return base;
  const o = patch as Record<string, unknown>;
  const videoId = typeof o.videoId === "string" && o.videoId.trim() ? o.videoId.trim() : base.videoId;
  const title = typeof o.title === "string" ? o.title : base.title;
  return { videoId, title };
}

function mergeProgramExternalVideoLink(base: ProgramExternalVideoLink, patch: unknown): ProgramExternalVideoLink {
  if (!patch || typeof patch !== "object") return base;
  const p = patch as Record<string, unknown>;
  const lead = typeof p.lead === "string" ? p.lead : base.lead;
  const anchorLabel = typeof p.anchorLabel === "string" ? p.anchorLabel : base.anchorLabel;
  let href = base.href;
  if (typeof p.href === "string") {
    const t = p.href.trim();
    if (t === "") href = "";
    else if (isSafeFooterHref(t)) href = t;
  }
  return { lead, anchorLabel, href };
}

function mergeProgramBuiltinImages(base: ProgramBuiltinImages, patch: unknown): ProgramBuiltinImages {
  if (!patch || typeof patch !== "object") return base;
  const p = patch as Record<string, unknown>;
  const keys = Object.keys(base) as (keyof ProgramBuiltinImages)[];
  const out = { ...base };
  for (const k of keys) {
    out[k] = mergeImageSlot(base[k], p[k]);
  }
  return out;
}

function mergeProgramBuiltinVideos(base: ProgramBuiltinVideos, patch: unknown): ProgramBuiltinVideos {
  if (!patch || typeof patch !== "object") return base;
  const p = patch as Record<string, unknown>;
  const keys = Object.keys(base) as (keyof ProgramBuiltinVideos)[];
  const out = { ...base };
  for (const k of keys) {
    out[k] = mergeYoutubeSlot(base[k], p[k]);
  }
  return out;
}

function mergeSectionTitles(base: ProgramSectionTitles, patch: unknown): ProgramSectionTitles {
  if (!patch || typeof patch !== "object") return base;
  const p = patch as Record<string, unknown>;
  const keys = Object.keys(base) as (keyof ProgramSectionTitles)[];
  const out = { ...base };
  for (const k of keys) {
    out[k] = mergeString(base[k], p[k]);
  }
  return out;
}

function mergeProgramToc(base: ProgramTocItem[], patch: unknown): ProgramTocItem[] {
  if (!Array.isArray(patch) || patch.length !== base.length) return base;
  return base.map((b, i) => {
    const item = patch[i];
    if (!item || typeof item !== "object") return b;
    const o = item as Record<string, unknown>;
    const id = typeof o.id === "string" && o.id.trim() ? o.id.trim() : b.id;
    const label = typeof o.label === "string" ? o.label : b.label;
    return { id, label };
  });
}

function mergeProgram(base: ProgramGuideSettings, patch: unknown): ProgramGuideSettings {
  if (!patch || typeof patch !== "object") return base;
  const p = patch as Record<string, unknown>;
  return {
    navLabel: mergeString(base.navLabel, p.navLabel),
    promoLinkLabel: mergeString(base.promoLinkLabel, p.promoLinkLabel),
    pageEyebrow: mergeString(base.pageEyebrow, p.pageEyebrow),
    pageTitle: mergeString(base.pageTitle, p.pageTitle),
    pageLead: mergeString(base.pageLead, p.pageLead),
    showBuiltInSections: mergeBool(base.showBuiltInSections, p.showBuiltInSections),
    prefixMarkdown: mergeString(base.prefixMarkdown, p.prefixMarkdown),
    appendixMarkdown: mergeString(base.appendixMarkdown, p.appendixMarkdown),
    toc: mergeProgramToc(base.toc, p.toc),
    builtinImages: mergeProgramBuiltinImages(base.builtinImages, p.builtinImages),
    builtinVideos: mergeProgramBuiltinVideos(base.builtinVideos, p.builtinVideos),
    volumeExternalLink: mergeProgramExternalVideoLink(base.volumeExternalLink, p.volumeExternalLink),
    sectionTitles: mergeSectionTitles(base.sectionTitles, p.sectionTitles),
  };
}

function mergeUIntInRange(base: number, v: unknown, min: number, max: number): number {
  if (typeof v !== "number" || !Number.isFinite(v)) return base;
  return Math.min(max, Math.max(min, Math.round(v)));
}

function mergeNavExperienceLabels(
  base: SiteExperienceConfig["navLabels"],
  patch: unknown,
): SiteExperienceConfig["navLabels"] {
  if (!patch || typeof patch !== "object") return base;
  const p = patch as Record<string, unknown>;
  return {
    home: mergeString(base.home, p.home),
    workout: mergeString(base.workout, p.workout),
    performance: mergeString(base.performance, p.performance),
    help: mergeString(base.help, p.help),
    settings: mergeString(base.settings, p.settings),
  };
}

function mergeExperience(base: SiteExperienceConfig, patch: unknown): SiteExperienceConfig {
  if (!patch || typeof patch !== "object") return base;
  const p = patch as Record<string, unknown>;
  let morning = mergeUIntInRange(base.interventionMorningEndHour, p.interventionMorningEndHour, 0, 23);
  let afternoon = mergeUIntInRange(base.interventionAfternoonEndHour, p.interventionAfternoonEndHour, 0, 23);
  let evening = mergeUIntInRange(base.interventionEveningEndHour, p.interventionEveningEndHour, 0, 23);
  if (afternoon < morning) afternoon = morning;
  if (evening < afternoon) evening = afternoon;
  return {
    missedDayHourLocal: mergeUIntInRange(base.missedDayHourLocal, p.missedDayHourLocal, 0, 23),
    workoutRestTargetSeconds: mergeUIntInRange(base.workoutRestTargetSeconds, p.workoutRestTargetSeconds, 15, 600),
    briefingHighLoadDayMinRows: mergeUIntInRange(base.briefingHighLoadDayMinRows, p.briefingHighLoadDayMinRows, 1, 60),
    briefingHighLoadDayMinVolume: mergeUIntInRange(
      base.briefingHighLoadDayMinVolume,
      p.briefingHighLoadDayMinVolume,
      100,
      50000,
    ),
    interventionMorningEndHour: morning,
    interventionAfternoonEndHour: afternoon,
    interventionEveningEndHour: evening,
    navLabels: mergeNavExperienceLabels(base.navLabels, p.navLabels),
  };
}

function mergeCopy(base: SiteCopyConfig, patch: unknown): SiteCopyConfig {
  if (!patch || typeof patch !== "object") return base;
  const p = patch as Record<string, unknown>;
  return {
    appTitle: mergeString(base.appTitle, p.appTitle),
    appDescription: mergeString(base.appDescription, p.appDescription),
    loginPanel: mergePanel(base.loginPanel, p.loginPanel),
    loginCard: mergeCard(base.loginCard, p.loginCard),
    loginForm: mergeLoginForm(base.loginForm, p.loginForm),
    signupPanel: mergePanel(base.signupPanel, p.signupPanel),
    signupCard: mergeCard(base.signupCard, p.signupCard),
    mainHero: mergeMainHero(base.mainHero, p.mainHero),
    mainNavSectionLabels: mergeMainNavSectionLabels(base.mainNavSectionLabels, p),
    mainDashTileCaptions: mergeTriple(base.mainDashTileCaptions, p.mainDashTileCaptions),
    webCoachingEyebrow: mergeString(base.webCoachingEyebrow, p.webCoachingEyebrow),
    webCoachingTitle: mergeString(base.webCoachingTitle, p.webCoachingTitle),
    webCoachingHint: mergeString(base.webCoachingHint, p.webCoachingHint),
    webCoachingButtonLabel: mergeString(base.webCoachingButtonLabel, p.webCoachingButtonLabel),
    listEmptyTitle: mergeString(base.listEmptyTitle, p.listEmptyTitle),
    listEmptySubtitle: mergeString(base.listEmptySubtitle, p.listEmptySubtitle),
    workoutForm: mergeWorkoutForm(base.workoutForm, p.workoutForm),
    helpCenter: mergeHelpCenter(base.helpCenter, p.helpCenter),
    legalPages: mergeLegalPages(base.legalPages, p.legalPages),
    coachingHistoryTitle: mergeString(base.coachingHistoryTitle, p.coachingHistoryTitle),
    footer: mergeFooter(base.footer, p.footer),
  };
}

/** DB에 저장된 JSON과 기본값을 합칩니다. */
export function mergeSiteSettingsFromDb(dbJson: unknown): SiteSettingsMerged {
  if (!dbJson || typeof dbJson !== "object") {
    return structuredClone(DEFAULT_SITE_SETTINGS);
  }
  const root = dbJson as Record<string, unknown>;
  return {
    images: mergeImages(DEFAULT_SITE_SETTINGS.images, root.images),
    copy: mergeCopy(DEFAULT_SITE_SETTINGS.copy, root.copy),
    program: mergeProgram(DEFAULT_SITE_SETTINGS.program, root.program),
    experience: mergeExperience(DEFAULT_SITE_SETTINGS.experience, root.experience),
  };
}
