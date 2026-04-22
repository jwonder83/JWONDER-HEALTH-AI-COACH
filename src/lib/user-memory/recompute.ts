import { buildDailyStatusBriefing } from "@/lib/dashboard/daily-status-briefing";
import { applyFailureReboundToDailyBriefing } from "@/lib/habit-loop/failure-rebound";
import type { OnboardingProfile } from "@/lib/onboarding/types";
import type { UserMemoryProfile } from "@/types/user-memory";
import type { WorkoutRow } from "@/types/workout";
import { volumeByBodyBucket } from "./bucket-volume";
import { buildPersonalizationBullets } from "./personalization-bullets";

function goalLabel(onboarding: OnboardingProfile | null | undefined, prev: UserMemoryProfile | null | undefined): string {
  const g = onboarding?.goal;
  if (g === "bulk") return "벌크업(근비대)";
  if (g === "cut") return "다이어트(컷)";
  if (g === "maintain") return "유지·건강";
  if (prev?.goal?.trim()) return prev.goal;
  return "미설정";
}

function experienceLabel(onboarding: OnboardingProfile | null | undefined, prev: UserMemoryProfile | null | undefined): string {
  const e = onboarding?.experience;
  if (e === "beginner") return "입문";
  if (e === "intermediate") return "중급";
  if (e === "advanced") return "상급";
  if (prev?.experience_level?.trim()) return prev.experience_level;
  return "미설정";
}

function topPreferredExercises(workouts: WorkoutRow[], now: Date, windowDays: number, minCount: number, maxItems: number): string[] {
  const cut = now.getTime() - windowDays * 86400000;
  const counts = new Map<string, number>();
  for (const w of workouts) {
    if (new Date(w.created_at).getTime() < cut) continue;
    const name = w.exercise_name.trim();
    if (!name) continue;
    const k = name.toLowerCase();
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].filter(([, c]) => c >= minCount).sort((a, b) => b[1] - a[1]);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const [k] of sorted) {
    const orig = workouts.find((w) => w.exercise_name.trim().toLowerCase() === k)?.exercise_name.trim();
    const label = orig ?? k;
    if (seen.has(label.toLowerCase())) continue;
    seen.add(label.toLowerCase());
    out.push(label);
    if (out.length >= maxItems) break;
  }
  return out;
}

function computeWeakPoints(workouts: WorkoutRow[], now: Date): string[] {
  const volMap = volumeByBodyBucket(workouts, now, 21);
  const entries = [...volMap.values()].filter((e) => e.volume > 0);
  if (entries.length === 0) return ["기록이 좀 쌓이면 부위별 볼륨도 짚어 볼게요."];
  const maxV = Math.max(...entries.map((e) => e.volume));
  if (maxV < 150) return ["아직 쌓인 볼륨이 적어서 부위 편차는 대충만 봐도 돼요."];
  const weak = entries
    .filter((e) => e.volume < maxV * 0.28)
    .sort((a, b) => a.volume - b.volume)
    .slice(0, 3)
    .map((e) => `${e.label} 쪽 볼륨이 다른 데보다 좀 적어요.`);
  return weak.length ? weak : ["큰 부위들 볼륨은 대체로 고르게 가고 있어요."];
}

function sanitizeInjuries(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map((x) => x.trim().slice(0, 200))
    .slice(0, 10);
}

export type RecomputeUserMemoryInput = {
  now?: Date;
  onboarding?: OnboardingProfile | null;
  previous?: UserMemoryProfile | null;
  /** API에서 클라이언트가 넘긴 부상 이력만 병합(문자열 배열) */
  injuryPatch?: unknown;
  /** 있으면 선호 종목이 오늘 플랜에 담겼는지 등 문구를 맞춤 */
  todayRoutine?: { title: string; description: string } | null;
  /** 데일리 체크인 기반 피로 신호(0–100). 있으면 브리핑 점수와 블렌딩 */
  dailyCheckinFatigue?: number | null;
};

/**
 * 운동 기록·온보딩으로 사용자 메모리 프로필을 재계산합니다.
 * 서버 코칭 API에서도 동일 함수로 산출해 일관성을 유지합니다.
 */
export function recomputeUserMemoryProfile(workouts: WorkoutRow[], input: RecomputeUserMemoryInput = {}): UserMemoryProfile {
  const now = input.now ?? new Date();
  const prev = input.previous ?? null;
  const onboarding = input.onboarding ?? null;
  const injuries = sanitizeInjuries(input.injuryPatch ?? prev?.injury_history ?? []);

  const goal = goalLabel(onboarding, prev);
  const experience_level = experienceLabel(onboarding, prev);

  if (workouts.length === 0) {
    const check = input.dailyCheckinFatigue;
    const fatigue_level =
      typeof check === "number" && Number.isFinite(check)
        ? Math.min(100, Math.max(0, Math.round(check)))
        : prev?.fatigue_level ?? 12;
    return {
      schemaVersion: 2,
      updatedAt: now.toISOString(),
      goal,
      experience_level,
      preferred_exercises: [],
      weak_points: ["운동 기록이 쌓이면 선호 종목·부족 부위를 자동으로 채웁니다."],
      injury_history: injuries,
      consistency_score: 0,
      fatigue_level,
      personalization_bullets: [],
    };
  }

  const briefing = applyFailureReboundToDailyBriefing(buildDailyStatusBriefing(workouts, now), workouts, now);
  const active7 = briefing.metrics.activeDaysLast7;
  const consistency_score = Math.min(100, Math.max(0, Math.round((active7 / 7) * 100)));
  const checkFatigue = input.dailyCheckinFatigue;
  const fatigue_level =
    typeof checkFatigue === "number" && Number.isFinite(checkFatigue)
      ? Math.min(
          100,
          Math.max(0, Math.round(0.5 * checkFatigue + 0.5 * Math.round(briefing.fatigueScore))),
        )
      : Math.min(100, Math.max(0, Math.round(briefing.fatigueScore)));

  const preferred_exercises = topPreferredExercises(workouts, now, 30, 2, 8);
  const weak_points = computeWeakPoints(workouts, now);
  const personalization_bullets = buildPersonalizationBullets(
    workouts,
    now,
    { preferredExercises: preferred_exercises, weakPoints: weak_points },
    input.todayRoutine ?? null,
  );

  return {
    schemaVersion: 2,
    updatedAt: now.toISOString(),
    goal,
    experience_level,
    preferred_exercises,
    weak_points,
    injury_history: injuries,
    consistency_score,
    fatigue_level,
    personalization_bullets,
  };
}
