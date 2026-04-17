import { buildWeeklyRoutineMarkdown } from "@/lib/coaching/rule-routine";
import type { OnboardingProfile } from "@/lib/onboarding/types";
import { NextResponse } from "next/server";

function parseProfile(raw: unknown): OnboardingProfile | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;
  const goal = p.goal === "bulk" || p.goal === "cut" || p.goal === "maintain" ? p.goal : "";
  const experience =
    p.experience === "beginner" || p.experience === "intermediate" || p.experience === "advanced" ? p.experience : "";
  const days = p.daysPerWeek;
  const daysPerWeek =
    days === 2 || days === 3 || days === 4 || days === 5 || days === 6 ? days : undefined;
  const equipment = typeof p.equipment === "string" ? p.equipment : "";
  return { goal, experience, daysPerWeek, equipment };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON 본문이 필요합니다." }, { status: 400 });
  }
  const profile = parseProfile((body as { profile?: unknown }).profile);
  if (!profile) {
    return NextResponse.json({ error: "profile 객체가 필요합니다." }, { status: 400 });
  }
  const markdown = buildWeeklyRoutineMarkdown(profile);
  return NextResponse.json({ markdown });
}
