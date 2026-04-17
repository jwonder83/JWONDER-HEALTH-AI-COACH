import { buildAiCoaching } from "@/lib/coaching/build-ai-coaching";
import type { WorkoutRow } from "@/types/workout";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

function parseWorkoutsFromBody(raw: unknown): WorkoutRow[] | null {
  if (!raw || typeof raw !== "object") return null;
  const w = (raw as { workouts?: unknown }).workouts;
  if (!Array.isArray(w) || w.length === 0) return null;
  const out: WorkoutRow[] = [];
  for (const item of w.slice(0, 50)) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    if (typeof o.exercise_name !== "string") continue;
    if (typeof o.created_at !== "string") continue;
    if (typeof o.success !== "boolean") continue;
    const id = typeof o.id === "string" ? o.id : randomUUID();
    const user_id = typeof o.user_id === "string" ? o.user_id : "local";
    out.push({
      id,
      user_id,
      exercise_name: o.exercise_name,
      weight_kg: Number(o.weight_kg),
      reps: Math.round(Number(o.reps)),
      sets: Math.round(Number(o.sets)),
      success: o.success,
      created_at: o.created_at,
    });
  }
  return out.length ? out : null;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "JSON 본문이 필요합니다. { \"workouts\": [ ... ] } 형식으로 보내세요." },
      { status: 400 },
    );
  }

  const rows = parseWorkoutsFromBody(body);
  if (!rows || rows.length === 0) {
    return NextResponse.json(
      { error: "workouts 배열에 최소 1개 이상의 기록이 필요합니다." },
      { status: 400 },
    );
  }

  try {
    const coaching = await buildAiCoaching(rows);
    return NextResponse.json({ coaching });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "코칭 생성 중 오류";
    const status = msg.includes("OPENAI_API_KEY") || msg.includes("OpenAI") ? 503 : 502;
    return NextResponse.json({ error: msg }, { status });
  }
}
