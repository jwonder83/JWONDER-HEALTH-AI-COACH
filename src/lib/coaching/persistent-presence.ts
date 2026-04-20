import { hasWorkoutToday, rowVolume } from "@/lib/dashboard/insights";
import { endOfWeekSunday, rollupPeriod, startOfWeekMonday } from "@/lib/workouts/period-stats";
import { computeLoggingStreak } from "@/lib/workouts/streak";
import type { WorkoutRow } from "@/types/workout";

/** 규칙 엔진이 판별한 상황 — UI 배지·추후 GPT 프롬프트 분기에 사용 */
export type CoachPresenceSituation =
  | "first_record"
  | "streak_motivation"
  | "post_workout"
  | "pre_workout";

/** 메시지 출처 — 추후 `gpt`로 교체·병합 가능 */
export type CoachMessageSource = "rules" | "gpt";

export type CoachCta = {
  label: string;
  href: string;
};

/** `AiCoachPresence`에 그대로 넘기는 페이로드 — 추후 GPT가 동일 필드로 덮어쓰기 쉬움 */
export type CoachPresenceMessage = {
  situation: CoachPresenceSituation;
  /** 한두 문장, 구어체 */
  body: string;
  /** 데이터·규칙 기반 근거(신뢰용) */
  reason: string;
  cta?: CoachCta;
  source: CoachMessageSource;
};

/** GPT 등 외부 API로 보낼 수 있는 직렬화 가능한 스냅샷 */
export type CoachPresenceContextSnapshot = {
  situation: CoachPresenceSituation;
  pathname: string;
  surface: CoachUiSurface;
  hydrated: boolean;
  hasAnyWorkout: boolean;
  todayWorkoutComplete: boolean;
  todaySessionRowCount: number;
  todayVolumeApprox: number;
  streakDays: number;
  streakLikelyBroken: boolean;
  weeklyRowCount: number;
};

export type CoachUiSurface = "home" | "program" | "performance" | "settings" | "help" | "onboarding" | "other";

export function coachSurfaceFromPathname(pathname: string): CoachUiSurface {
  const p = pathname.split("?")[0] ?? "/";
  if (p === "/" || p === "") return "home";
  if (p.startsWith("/program")) return "program";
  if (p.startsWith("/performance")) return "performance";
  if (p.startsWith("/settings")) return "settings";
  if (p.startsWith("/help")) return "help";
  if (p.startsWith("/onboarding")) return "onboarding";
  return "other";
}

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

function todayKey(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function calendarDaysBetween(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

/** 기록은 있는데 연속 앵커가 끊긴 상태(최근에 쉰 흔적)로 보일 때 */
export function isStreakLikelyBroken(workouts: WorkoutRow[], now = new Date()): boolean {
  if (workouts.length === 0) return false;
  if (computeLoggingStreak(workouts, now) > 0) return false;
  const sorted = [...workouts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const last = new Date(sorted[0].created_at);
  return calendarDaysBetween(last, now) >= 2;
}

function countTodayRows(workouts: WorkoutRow[], now: Date): number {
  const key = todayKey(now);
  return workouts.filter((w) => localDayKey(w.created_at) === key).length;
}

function todayVolume(workouts: WorkoutRow[], now: Date): number {
  const key = todayKey(now);
  let v = 0;
  for (const w of workouts) {
    if (localDayKey(w.created_at) === key) v += rowVolume(w);
  }
  return Math.round(v * 10) / 10;
}

function daysSinceLastWorkout(workouts: WorkoutRow[], now: Date): number | null {
  if (workouts.length === 0) return null;
  const sorted = [...workouts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const last = new Date(sorted[0].created_at);
  return calendarDaysBetween(last, now);
}

function rowsLastNDays(workouts: WorkoutRow[], now: Date, days: number): number {
  const cut = now.getTime() - days * 86400000;
  return workouts.filter((w) => new Date(w.created_at).getTime() >= cut).length;
}

export type CoachResolverInput = {
  pathname: string;
  workouts: WorkoutRow[];
  hydrated: boolean;
  now?: Date;
};

/**
 * 상황 우선순위: 기록 없음 → (기록 있음)연속 끊김 → 오늘 완료 → 운동 전
 * 추후 GPT 연동 시 동일 `CoachPresenceContextSnapshot`을 프롬프트에 넣고
 * `CoachPresenceMessage`를 덮어쓰거나 `source: 'gpt'`로 반환하면 됨.
 */
export function detectCoachSituation(input: CoachResolverInput): CoachPresenceSituation {
  const { workouts, hydrated, now = new Date() } = input;
  if (!hydrated) return "pre_workout";
  if (workouts.length === 0) return "first_record";
  if (isStreakLikelyBroken(workouts, now)) return "streak_motivation";
  if (hasWorkoutToday(workouts, now)) return "post_workout";
  return "pre_workout";
}

function surfaceLine(surface: CoachUiSurface, situation: CoachPresenceSituation): string | null {
  if (situation === "first_record" || situation === "streak_motivation") return null;
  if (surface === "program" && situation === "pre_workout") {
    return "워밍업 체크하고 홈에서 세트 남기면 딱이에요.";
  }
  if (surface === "performance" && situation === "post_workout") {
    return "성과 화면에서 오늘 날짜만 골라보면 정리돼요.";
  }
  if (surface === "settings") {
    return "설정 바꾸면 코칭 톤도 같이 맞춰 줄게요.";
  }
  if (surface === "help") {
    return "막히면 FAQ부터 보고, 그다음 문의로 연락해요.";
  }
  if (surface === "onboarding") {
    return "프로필만 채워도 루틴 추천이 훨씬 정확해져요.";
  }
  return null;
}

export function buildCoachPresenceContextSnapshot(input: CoachResolverInput): CoachPresenceContextSnapshot {
  const now = input.now ?? new Date();
  const pathname = input.pathname.split("?")[0] || "/";
  const surface = coachSurfaceFromPathname(pathname);
  const todayWorkoutComplete = input.hydrated && hasWorkoutToday(input.workouts, now);
  const mon = startOfWeekMonday(now);
  const sun = endOfWeekSunday(mon);
  const week = rollupPeriod(input.workouts, mon, sun);

  return {
    situation: detectCoachSituation(input),
    pathname,
    surface,
    hydrated: input.hydrated,
    hasAnyWorkout: input.workouts.length > 0,
    todayWorkoutComplete,
    todaySessionRowCount: countTodayRows(input.workouts, now),
    todayVolumeApprox: todayVolume(input.workouts, now),
    streakDays: computeLoggingStreak(input.workouts, now),
    streakLikelyBroken: input.hydrated && isStreakLikelyBroken(input.workouts, now),
    weeklyRowCount: week.rowCount,
  };
}

export function buildCoachPresenceMessage(input: CoachResolverInput): CoachPresenceMessage {
  const now = input.now ?? new Date();
  const snap = buildCoachPresenceContextSnapshot({ ...input, now });
  const surface = snap.surface;
  const extra = surfaceLine(surface, snap.situation);

  if (!input.hydrated) {
    return {
      situation: "pre_workout",
      body: "기록을 불러오는 동안 잠시 대기하세요.",
      reason: "운동 목록을 아직 동기화하는 중입니다.",
      source: "rules",
    };
  }

  const last7 = rowsLastNDays(input.workouts, now, 7);
  const sinceLast = daysSinceLastWorkout(input.workouts, now);

  let base: CoachPresenceMessage;

  switch (snap.situation) {
    case "first_record":
      base = {
        situation: "first_record",
        body: "지금 첫 세트를 남기세요.",
        reason: "저장된 운동 기록이 아직 없습니다.",
        cta: { label: "첫 세트 남기기", href: "/workout" },
        source: "rules",
      };
      break;
    case "streak_motivation":
      base = {
        situation: "streak_motivation",
        body:
          sinceLast !== null && sinceLast >= 2
            ? `오늘 한 세트를 기록하세요. ${sinceLast}일째 휴식입니다.`
            : "오늘 한 세트만 기록하세요. 연속 기록을 다시 켭니다.",
        reason:
          sinceLast !== null
            ? `연속 0일이며 마지막 기록은 ${sinceLast}일 전입니다.`
            : "마지막 기록 이후 연속이 0입니다.",
        cta: { label: "세트 남기기", href: "/workout" },
        source: "rules",
      };
      break;
    case "post_workout": {
      const n = snap.todaySessionRowCount;
      const vol = snap.todayVolumeApprox;
      base = {
        situation: "post_workout",
        body:
          n > 0
            ? `오늘 ${n}세트, 볼륨 합 약 ${vol}까지 썼습니다. 스트레칭하고 수분을 보충하세요.`
            : "오늘 기록이 있습니다. 짧게 몸만 풀고 마무리하세요.",
        reason:
          n > 0
            ? `오늘 날짜 세트 ${n}개, 볼륨 합(kg×회×세트) 약 ${vol}로 집계됐습니다.`
            : "오늘 날짜로 저장된 세트가 있습니다.",
        cta: { label: "성과 화면 가기", href: "/performance" },
        source: "rules",
      };
      break;
    }
    default: {
      const mon = startOfWeekMonday(now);
      const sun = endOfWeekSunday(mon);
      const thisWeek = rollupPeriod(input.workouts, mon, sun);
      const prevMon = new Date(mon);
      prevMon.setDate(prevMon.getDate() - 7);
      const prevSun = endOfWeekSunday(prevMon);
      const lastWeek = rollupPeriod(input.workouts, prevMon, prevSun);
      let volBit = "";
      if (lastWeek.volume > 40) {
        const p = Math.round(((thisWeek.volume - lastWeek.volume) / lastWeek.volume) * 1000) / 10;
        volBit = ` · 전주 대비 볼륨 합 ${p > 0 ? "+" : ""}${p}%`;
      }
      base = {
        situation: "pre_workout",
        body: "지금 워밍업에 들어가세요.",
        reason: `이번 주 ${thisWeek.rowCount}세트 · 최근 7일 ${last7}세트 · 연속 ${snap.streakDays}일${volBit}`.trim(),
        cta: { label: "운동하러 가기", href: "/workout" },
        source: "rules",
      };
      break;
    }
  }

  if (extra) {
    return { ...base, body: `${base.body} ${extra}` };
  }
  return base;
}

/** 추후 GPT: 스냅샷 JSON → 서버 액션/API → `CoachPresenceMessage` 병합 */
export type CoachMessageResolver = {
  resolve: (input: CoachResolverInput) => CoachPresenceMessage | Promise<CoachPresenceMessage>;
};

export const rulesCoachResolver: CoachMessageResolver = {
  resolve: (input) => buildCoachPresenceMessage(input),
};
