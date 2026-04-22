import { volumeByBodyBucketBetween } from "@/lib/user-memory/bucket-volume";
import { endOfWeekSunday, startOfWeekMonday } from "@/lib/workouts/period-stats";
import type { WorkoutRow } from "@/types/workout";

type Input = {
  preferredExercises: string[];
  weakPoints: string[];
};

function rowsInLastDays(workouts: WorkoutRow[], now: Date, days: number): WorkoutRow[] {
  const cut = now.getTime() - days * 86400000;
  return workouts.filter((w) => new Date(w.created_at).getTime() >= cut);
}

function topFailingExercise(rows: WorkoutRow[]): { name: string; fails: number } | null {
  const counts = new Map<string, number>();
  for (const w of rows) {
    if (w.success) continue;
    const k = w.exercise_name.trim();
    if (!k) continue;
    const key = k.toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let best: { name: string; fails: number } | null = null;
  for (const [k, fails] of counts) {
    if (fails < 2) continue;
    const display = rows.find((w) => w.exercise_name.trim().toLowerCase() === k)?.exercise_name.trim() ?? k;
    if (!best || fails > best.fails) best = { name: display, fails };
  }
  return best;
}

function routineHintsMentionExercise(routineTitle: string, routineDescription: string, exercise: string): boolean {
  const hay = `${routineTitle} ${routineDescription}`.toLowerCase();
  const ex = exercise.trim().toLowerCase();
  if (!ex || ex.length < 2) return false;
  if (hay.includes(ex)) return true;
  const token = ex.split(/\s+/)[0];
  return token.length >= 2 && hay.includes(token);
}

/**
 * 코칭 프롬프트·홈 코치 한 줄용: 개인화 언급 + 행동 유도가 함께 든 문장들(우선순위 순).
 */
export function buildPersonalizationBullets(
  workouts: WorkoutRow[],
  now: Date,
  input: Input,
  routine?: { title: string; description: string } | null,
): string[] {
  const out: string[] = [];
  if (workouts.length === 0) return out;

  const thisMon = startOfWeekMonday(now);
  const lastMon = new Date(thisMon);
  lastMon.setDate(lastMon.getDate() - 7);
  const lastSun = endOfWeekSunday(lastMon);
  const prevMon = new Date(lastMon);
  prevMon.setDate(prevMon.getDate() - 7);
  const prevSun = endOfWeekSunday(prevMon);

  const lastLeg = volumeByBodyBucketBetween(workouts, lastMon, lastSun).get("legs")?.volume ?? 0;
  const prevLeg = volumeByBodyBucketBetween(workouts, prevMon, prevSun).get("legs")?.volume ?? 0;

  const recent14 = rowsInLastDays(workouts, now, 14);
  const failTop = topFailingExercise(recent14);
  const failCount = recent14.filter((w) => !w.success).length;

  const pref = input.preferredExercises[0]?.trim();
  const title = routine?.title ?? "";
  const desc = routine?.description ?? "";

  if (workouts.length >= 6 && prevLeg < 180 && lastLeg < 180 && prevLeg + lastLeg > 0) {
    out.push("지난주에도 하체 줄이 별로 없었어요. 오늘은 하체 한 판만 넣어도 좋아요.");
  } else if (workouts.length >= 5 && prevLeg > 220 && lastLeg < prevLeg * 0.35) {
    out.push("지난주에 하체가 확 줄었네요. 이번 주 일정만 다시 맞춰 볼까요.");
  }

  if (failTop && failCount >= 3) {
    out.push(
      `「${failTop.name}」에서 실패가 자꾸 나와요. 오늘은 무게만 조금 낮춰도 돼요.`,
    );
  } else if (failCount >= 4) {
    out.push(`지난 2주에 실패로 찍힌 게 ${failCount}번이에요. 오늘은 무게보다 동작이랑 템포부터 맞춰 보세요.`);
  }

  if (pref) {
    const inPlan = routineHintsMentionExercise(title, desc, pref);
    if (inPlan) {
      out.push(`「${pref}」를 자주 수행하고 계십니다. 오늘 플랜에도 포함됐으니 그 흐름으로 밀고 가세요.`);
    } else {
      out.push(`「${pref}」를 자주 수행하고 계십니다. 오늘 루틴 안에서 비슷한 패턴을 이어 가세요.`);
    }
  }

  const weak0 = input.weakPoints[0]?.trim();
  if (weak0 && !weak0.includes("아직 적어") && !weak0.includes("쌓이면")) {
    const weakLeg = /하체|다리|레그|스쿼트|데드|종아리/i.test(weak0);
    if (!(weakLeg && out.some((s) => /하체|다리/.test(s)))) {
      const short = weak0.length > 72 ? `${weak0.slice(0, 70)}…` : weak0;
      out.push(`${short} 오늘 세션에서 비중을 한 번 조정하세요.`);
    }
  }

  return out.slice(0, 5);
}
