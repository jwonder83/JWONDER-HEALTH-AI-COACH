import { rowVolume } from "@/lib/dashboard/insights";
import type { WorkoutRow } from "@/types/workout";

export type BodyBucket = { id: string; label: string; test: (name: string) => boolean };

/** 운동명(한·영) 키워드로 부위군 분류 — 첫 일치만 부여 */
const BUCKETS: BodyBucket[] = [
  {
    id: "legs",
    label: "하체",
    test: (n) =>
      /스쿼트|스쿗|스쿼|레그|런지|런징|데드|데드리프트|rdl|루마니안|스모|하체|leg|hip|글루트|힙|종아리|카프|스텝|스플릿/i.test(n),
  },
  {
    id: "back",
    label: "등·후면",
    test: (n) =>
      /로우|풀다운|풀업|랫|페이스풀|바벨로우|케이블.*로우|등|광배|랫풀|티바|시티드로우|체스트서포티드/i.test(n),
  },
  {
    id: "chest",
    label: "가슴",
    test: (n) => /벤치|인클|덤벨프레스|푸시업|푸쉬업|가슴|체스트|펙|플라이|딥스/i.test(n),
  },
  {
    id: "shoulders",
    label: "어깨",
    test: (n) => /숄더|오버헤드|ohp|military|레터럴|사이드|후면|전면|델트|어깨|숄프레스/i.test(n),
  },
  {
    id: "arms",
    label: "팔",
    test: (n) => /컬|curl|이두|삼두|tricep|bicep|암|팔|wrist|리스트/i.test(n),
  },
  {
    id: "core",
    label: "코어",
    test: (n) => /플랭크|코어|윈드|dead bug|ab roll|행잉|레그레이즈|크런치|사이드플랭크/i.test(n),
  },
];

function bucketForExercise(name: string): BodyBucket | null {
  const n = name.trim().toLowerCase();
  if (!n) return null;
  for (const b of BUCKETS) {
    if (b.test(n)) return b;
  }
  return null;
}

/** 최근 windowDays일 구간에서 부위군별 볼륨 합 */
export function volumeByBodyBucket(workouts: WorkoutRow[], now: Date, windowDays: number): Map<string, { label: string; volume: number }> {
  const cut = now.getTime() - windowDays * 86400000;
  const map = new Map<string, { label: string; volume: number }>();
  for (const w of workouts) {
    if (new Date(w.created_at).getTime() < cut) continue;
    const b = bucketForExercise(w.exercise_name);
    if (!b) continue;
    const cur = map.get(b.id) ?? { label: b.label, volume: 0 };
    cur.volume += rowVolume(w);
    map.set(b.id, cur);
  }
  return map;
}

/** rangeStart~rangeEnd(포함) 구간의 부위군별 볼륨 — 주간 비교·개인화 멘트용 */
export function volumeByBodyBucketBetween(
  workouts: WorkoutRow[],
  rangeStart: Date,
  rangeEnd: Date,
): Map<string, { label: string; volume: number }> {
  const s = rangeStart.getTime();
  const e = rangeEnd.getTime();
  const map = new Map<string, { label: string; volume: number }>();
  for (const w of workouts) {
    const t = new Date(w.created_at).getTime();
    if (t < s || t > e) continue;
    const b = bucketForExercise(w.exercise_name);
    if (!b) continue;
    const cur = map.get(b.id) ?? { label: b.label, volume: 0 };
    cur.volume += rowVolume(w);
    map.set(b.id, cur);
  }
  return map;
}
