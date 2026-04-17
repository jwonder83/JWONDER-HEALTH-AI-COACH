export type OnboardingProfile = {
  goal: "bulk" | "cut" | "maintain" | "";
  experience: "beginner" | "intermediate" | "advanced" | "";
  daysPerWeek?: 2 | 3 | 4 | 5 | 6;
  equipment: string;
  completedAt?: string;
};

export const ONBOARDING_LS_KEY = "jws_onboarding_v1";
