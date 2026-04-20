import type { OnboardingProfile } from "@/lib/onboarding/types";

/** POST 본문 등에서 온 unknown을 온보딩 프로필로 안전 파싱 */
export function parseOnboardingProfile(raw: unknown): OnboardingProfile | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;
  const goal = p.goal === "bulk" || p.goal === "cut" || p.goal === "maintain" ? p.goal : "";
  const experience =
    p.experience === "beginner" || p.experience === "intermediate" || p.experience === "advanced" ? p.experience : "";
  const days = p.daysPerWeek;
  const daysPerWeek = days === 2 || days === 3 || days === 4 || days === 5 || days === 6 ? days : undefined;
  const equipment = typeof p.equipment === "string" ? p.equipment : "";
  return { goal, experience, daysPerWeek, equipment };
}
