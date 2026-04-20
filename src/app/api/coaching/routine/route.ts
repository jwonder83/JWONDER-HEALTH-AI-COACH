import { buildWeeklyRoutineMarkdown } from "@/lib/coaching/rule-routine";
import { parseOnboardingProfile } from "@/lib/onboarding/parse-body";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON 본문이 필요합니다." }, { status: 400 });
  }
  const profile = parseOnboardingProfile((body as { profile?: unknown }).profile);
  if (!profile) {
    return NextResponse.json({ error: "profile 객체가 필요합니다." }, { status: 400 });
  }
  const markdown = buildWeeklyRoutineMarkdown(profile);
  return NextResponse.json({ markdown });
}
