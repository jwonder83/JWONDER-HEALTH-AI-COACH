import { rowVolume } from "@/lib/dashboard/insights";
import {
  aggregateVolumeByMuscle,
  inferPrimaryMuscleGroup,
  muscleGroupLabel,
  type MuscleGroupId,
} from "@/lib/workouts/exercise-muscle-group";
import { endOfWeekSunday, rollupPeriod, startOfWeekMonday, volumeForRow } from "@/lib/workouts/period-stats";
import type { WorkoutRow } from "@/types/workout";

function localDayKey(iso: string): string {
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return "";
  }
}

export function rowsInPeriod(rows: WorkoutRow[], start: Date, end: Date): WorkoutRow[] {
  const s = start.getTime();
  const e = end.getTime();
  return rows.filter((r) => {
    const t = new Date(r.created_at).getTime();
    return t >= s && t <= e;
  });
}

export function distinctWorkoutDays(rows: WorkoutRow[], start: Date, end: Date): number {
  const keys = new Set<string>();
  for (const w of rowsInPeriod(rows, start, end)) {
    keys.add(localDayKey(w.created_at));
  }
  return keys.size;
}

export type WeekVolumePoint = {
  /** 주 시작(월) 라벨 */
  label: string;
  weekStart: string;
  volume: number;
  rowCount: number;
  activeDays: number;
};

/** 최근 n주(이번 주 포함), 오래된 주 → 최신 순으로 정렬 */
export function lastNWeeksSeries(rows: WorkoutRow[], n: number, now = new Date()): WeekVolumePoint[] {
  const thisMon = startOfWeekMonday(now);
  const out: WeekVolumePoint[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const mon = new Date(thisMon);
    mon.setDate(mon.getDate() - i * 7);
    const sun = endOfWeekSunday(mon);
    const r = rollupPeriod(rows, mon, sun);
    const label = `${mon.getMonth() + 1}/${mon.getDate()}`;
    out.push({
      label,
      weekStart: mon.toISOString().slice(0, 10),
      volume: Math.round(r.volume * 10) / 10,
      rowCount: r.rowCount,
      activeDays: distinctWorkoutDays(rows, mon, sun),
    });
  }
  return out;
}

function exerciseVolumeByName(rows: WorkoutRow[]): Map<string, { display: string; volume: number }> {
  const m = new Map<string, { display: string; volume: number }>();
  for (const w of rows) {
    const display = w.exercise_name.trim() || "이름 없음";
    const key = display.toLowerCase();
    const v = volumeForRow(w);
    const cur = m.get(key);
    if (cur) m.set(key, { display: cur.display, volume: cur.volume + v });
    else m.set(key, { display, volume: v });
  }
  return m;
}

export type TopExerciseGrowth = {
  name: string;
  /** 지난주 대비 볼륨 증가율(%) — 지난주 0이면 null */
  pctVsLastWeek: number | null;
  thisWeekVolume: number;
  lastWeekVolume: number;
};

/** 지난주 대비 볼륨 증가가 가장 큰 종목(노이즈 제거용 최소 지난주 볼륨) */
export function findTopGrowingExercise(
  rows: WorkoutRow[],
  thisMon: Date,
  lastMon: Date,
  minLastWeekVol = 80,
): TopExerciseGrowth | null {
  const thisSun = endOfWeekSunday(thisMon);
  const lastSun = endOfWeekSunday(lastMon);
  const thisRows = rowsInPeriod(rows, thisMon, thisSun);
  const lastRows = rowsInPeriod(rows, lastMon, lastSun);
  if (thisRows.length === 0) return null;

  const thisMap = exerciseVolumeByName(thisRows);
  const lastMap = exerciseVolumeByName(lastRows);

  let bestByPct: TopExerciseGrowth | null = null;
  let maxPct = -Infinity;
  let bestDelta: TopExerciseGrowth | null = null;
  let maxDelta = -Infinity;

  for (const [, { display, volume: tv }] of thisMap) {
    const lk = display.toLowerCase();
    const lastV = lastMap.get(lk)?.volume ?? 0;
    const tvR = Math.round(tv * 10) / 10;
    const lastR = Math.round(lastV * 10) / 10;
    if (lastV >= minLastWeekVol) {
      const pct = Math.round(((tv - lastV) / lastV) * 100 * 10) / 10;
      if (pct > maxPct) {
        maxPct = pct;
        bestByPct = { name: display, pctVsLastWeek: pct, thisWeekVolume: tvR, lastWeekVolume: lastR };
      }
    }
    const delta = tv - lastV;
    if (delta > maxDelta && tv > 0) {
      maxDelta = delta;
      const pctAll = lastV > 0 ? Math.round(((tv - lastV) / lastV) * 100 * 10) / 10 : null;
      bestDelta = { name: display, pctVsLastWeek: pctAll, thisWeekVolume: tvR, lastWeekVolume: lastR };
    }
  }

  if (bestByPct && maxPct >= 5) return bestByPct;
  if (bestDelta && maxDelta > 0 && (bestDelta.pctVsLastWeek === null || bestDelta.pctVsLastWeek >= 3)) return bestDelta;
  return null;
}

export type WeakMuscleHint = {
  id: MuscleGroupId;
  label: string;
  sharePct: number;
  note: string;
};

/** 이번 주 볼륨 기준 부위 비중이 낮은 항목 추정 */
export function findWeakMuscleGroups(thisWeekRows: WorkoutRow[], minTotalVolume = 400): WeakMuscleHint[] {
  const slices = aggregateVolumeByMuscle(thisWeekRows);
  const total = slices.reduce((a, s) => a + s.volume, 0);
  if (total < minTotalVolume) return [];

  const hints: WeakMuscleHint[] = [];
  const byId = new Map(slices.map((s) => [s.id, s]));
  const share = (id: MuscleGroupId) => ((byId.get(id)?.volume ?? 0) / total) * 100;

  const targets: MuscleGroupId[] = ["legs", "back", "chest", "shoulders", "arms", "core"];
  for (const id of targets) {
    const p = share(id);
    if (id === "core" && p < 5) {
      hints.push({ id, label: muscleGroupLabel(id), sharePct: Math.round(p * 10) / 10, note: "코어는 안정·부상 예방에 도움이 돼요." });
    } else if (id !== "core" && p < 10) {
      hints.push({
        id,
        label: muscleGroupLabel(id),
        sharePct: Math.round(p * 10) / 10,
        note: "이번 주 기록에서 비중이 낮아요.",
      });
    }
  }
  hints.sort((a, b) => a.sharePct - b.sharePct);
  return hints.slice(0, 2);
}

function muscleVolumeForPeriod(rows: WorkoutRow[], start: Date, end: Date, group: MuscleGroupId): number {
  let v = 0;
  for (const w of rowsInPeriod(rows, start, end)) {
    if (inferPrimaryMuscleGroup(w.exercise_name) === group) v += rowVolume(w);
  }
  return v;
}

export type PerformanceStoryReport = {
  /** 읽는 리포트 본문 1~2문장 */
  summary: string;
  /** 주요 변화·주의 포인트 */
  highlights: string[];
  weekOverWeekVolumePct: number | null;
  thisWeekVolume: number;
  lastWeekVolume: number;
  thisWeekRows: number;
  lastWeekRows: number;
  topGrowing: TopExerciseGrowth | null;
  weakMuscles: WeakMuscleHint[];
  weeksSeries: WeekVolumePoint[];
  /** 규칙 기반 | 추후 gpt */
  source: "rules" | "gpt";
};

export function buildPerformanceStoryReport(rows: WorkoutRow[], now = new Date()): PerformanceStoryReport {
  const thisMon = startOfWeekMonday(now);
  const thisSun = endOfWeekSunday(thisMon);
  const lastMon = new Date(thisMon);
  lastMon.setDate(lastMon.getDate() - 7);
  const lastSun = endOfWeekSunday(lastMon);

  const thisRoll = rollupPeriod(rows, thisMon, thisSun);
  const lastRoll = rollupPeriod(rows, lastMon, lastSun);
  const thisV = Math.round(thisRoll.volume * 10) / 10;
  const lastV = Math.round(lastRoll.volume * 10) / 10;

  let wow: number | null = null;
  if (lastV > 0) wow = Math.round(((thisV - lastV) / lastV) * 100 * 10) / 10;
  else if (thisV > 0) wow = null;

  const thisWeekRowsList = rowsInPeriod(rows, thisMon, thisSun);

  const legsThis = muscleVolumeForPeriod(rows, thisMon, thisSun, "legs");
  const legsLast = muscleVolumeForPeriod(rows, lastMon, lastSun, "legs");
  const legsWow =
    legsLast > 0 ? Math.round(((legsThis - legsLast) / legsLast) * 100 * 10) / 10 : legsThis > 0 ? null : 0;

  const topGrowing = findTopGrowingExercise(rows, thisMon, lastMon);
  const weakMuscles = findWeakMuscleGroups(thisWeekRowsList);

  const highlights: string[] = [];

  if (topGrowing && (topGrowing.pctVsLastWeek === null || topGrowing.pctVsLastWeek >= 5)) {
    if (topGrowing.pctVsLastWeek !== null) {
      highlights.push(
        `가장 많이 성장한 종목은 「${topGrowing.name}」예요. 지난주 대비 볼륨이 약 ${topGrowing.pctVsLastWeek}% 늘었습니다.`,
      );
    } else if (topGrowing.lastWeekVolume === 0 && topGrowing.thisWeekVolume > 0) {
      highlights.push(`이번 주 새로 쌓인 볼륨이 「${topGrowing.name}」에서 두드러져요.`);
    }
  }

  for (const w of weakMuscles) {
    highlights.push(`${w.label} 쪽은 이번 주 전체의 약 ${w.sharePct}%예요. ${w.note}`);
  }

  if (highlights.length === 0) {
    if (thisRoll.rowCount === 0) {
      highlights.push("이번 주 아직 기록이 없어요. 한 세트만 남겨도 리포트가 살아납니다.");
    } else {
      highlights.push("부위 밸런스는 무난해 보여요. 다음 주엔 한 종목만 변수(중량·세트)를 바꿔 보는 것도 좋아요.");
    }
  }

  const summaryParts: string[] = [];
  if (rows.length === 0) {
    summaryParts.push("아직 저장된 기록이 없어요. 홈에서 세트를 남기면 이곳에 주간 스토리가 채워집니다.");
  } else if (thisRoll.rowCount === 0 && lastRoll.rowCount === 0) {
    summaryParts.push("이번 주와 지난 주 모두 기록이 비어 있어요. 오늘 운동을 시작하면 추세를 읽어 드릴게요.");
  } else if (wow === null && thisV > 0) {
    summaryParts.push(`이번 주는 새로 볼륨이 쌓이기 시작했어요. 총 ${thisV} 합산입니다.`);
  } else if (wow !== null) {
    if (wow >= 8) {
      summaryParts.push(`이번 주는 지난주 대비 약 ${wow}% 성장했습니다.`);
    } else if (wow <= -8) {
      summaryParts.push(`이번 주는 지난주보다 볼륨이 약 ${Math.abs(wow)}% 줄었습니다. 델로드일 수도 있으니 컨디션만 점검해 보세요.`);
    } else {
      summaryParts.push(`이번 주는 지난주와 비슷한 볼륨이에요(약 ${wow > 0 ? "+" : ""}${wow}%).`);
    }
  } else {
    summaryParts.push("지난주 기록을 바탕으로 이번 주 리듬을 이어가 보세요.");
  }

  if (legsWow !== null && legsWow >= 15 && legsThis > 200) {
    summaryParts.push("특히 하체 운동량이 크게 늘었습니다.");
  } else if (legsWow !== null && legsWow <= -15 && legsLast > 200) {
    summaryParts.push("하체 볼륨은 지난주보다 줄었어요. 다음 세션에서 가볍게라도 패턴을 유지해 보세요.");
  }

  const weeksSeries = lastNWeeksSeries(rows, 8, now);

  return {
    summary: summaryParts.join(" ").trim(),
    highlights,
    weekOverWeekVolumePct: wow,
    thisWeekVolume: thisV,
    lastWeekVolume: lastV,
    thisWeekRows: thisRoll.rowCount,
    lastWeekRows: lastRoll.rowCount,
    topGrowing,
    weakMuscles,
    weeksSeries,
    source: "rules",
  };
}
