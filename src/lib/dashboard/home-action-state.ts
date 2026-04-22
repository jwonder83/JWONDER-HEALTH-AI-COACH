import { buildDailyStatusBriefing, type DailyStatusBriefing } from "@/lib/dashboard/daily-status-briefing";
import { buildWorkoutActionSuggestions, type WorkoutActionSuggestion } from "@/lib/dashboard/workout-action-suggestions";
import { hasWorkoutToday, recentWorkouts } from "@/lib/dashboard/insights";
import { buildOptimizedTodayRoutine } from "@/lib/routine/adaptive-routine-engine";
import { formatEstimatedLabel, type TodayRoutinePlan } from "@/lib/routine/today-routine-plan";
import { applyDailyCheckinToRoutinePlan } from "@/lib/habit-loop/apply-checkin-to-routine";
import type { DailyCheckinRecord } from "@/lib/habit-loop/daily-checkin";
import { conditionLabelKo, conditionToFatigueSignal } from "@/lib/habit-loop/daily-checkin";
import { applyWeeklyStakeToRoutine } from "@/lib/habit-loop/apply-weekly-stake-to-routine";
import { mergeDailyCheckinIntoBriefing } from "@/lib/habit-loop/merge-checkin-briefing";
import { computeWeeklyStake, type WeeklyStakeModel } from "@/lib/dashboard/weekly-stake";
import type { OnboardingProfile } from "@/lib/onboarding/types";
import { DEFAULT_SITE_SETTINGS } from "@/lib/site-settings/defaults";
import { endOfWeekSunday, rollupPeriod, startOfWeekMonday } from "@/lib/workouts/period-stats";
import type { SiteExperienceConfig } from "@/types/site-settings";
import {
  getStreakMotivationLine,
  isStreakAtRiskEvening,
  isStreakGentleNudge,
} from "@/lib/workouts/streak-engagement";
import { isRecoveryEaseRoutineDay } from "@/lib/dashboard/recovery-workout-ux";
import { recomputeUserMemoryProfile } from "@/lib/user-memory/recompute";
import { computeLoggingStreakMerged } from "@/lib/workouts/streak";
import type { UserMemoryProfile } from "@/types/user-memory";
import type { WorkoutRow } from "@/types/workout";

export type LocalWeeklyGoal = {
  weeklySessionTarget?: number;
};

export type { TodayRoutinePlan } from "@/lib/routine/today-routine-plan";
export type { BriefingDecisionKind, DailyStatusBriefing, FatigueLevel } from "@/lib/dashboard/daily-status-briefing";
export type { UserWorkoutUiState } from "@/lib/dashboard/user-workout-ui-state";
export type { WorkoutActionSuggestion, WorkoutActionSuggestionKind } from "@/lib/dashboard/workout-action-suggestions";
export type { WeeklyStakeModel } from "@/lib/dashboard/weekly-stake";

export type RecentActivityItem = {
  id: string;
  exerciseName: string;
  detail: string;
  createdAt: string;
};

export type HomeActionViewModel = {
  hydrated: boolean;
  todayWorkoutComplete: boolean;
  /** 주간 목표 대비 진행률(0–100). 목표 미설정 시 null */
  goalProgressPercent: number | null;
  weeklySessionCurrent: number;
  weeklySessionTarget: number | null;
  streakDays: number;
  /** 저녁 시간대·오늘 미기록 시 연속 끊김 직전 알림 */
  streakAtRisk: boolean;
  /** 오전~오후 부드러운 연속 유지 멘트 */
  streakGentleNudge: boolean;
  /** 성취·동기부여 한 줄(카드·배너에 사용) */
  streakMotivationLine: string | null;
  /** 어제 캘린더 공백 후 오늘 복귀 UX(가벼운 루틴·스트릭 유지 톤) */
  recoveryAfterMissedYesterday: boolean;
  routine: TodayRoutinePlan;
  estimatedDurationLabel: string;
  /** 결정형 코치 한 줄(명령·확정 톤) */
  coachLine: string;
  /** coachLine 근거 — 최근 기록·빈도·볼륨·휴식·목표 등 데이터 요약 */
  coachLineReason: string;
  recentActivities: RecentActivityItem[];
  /** 하루 상태 브리핑(피로도·추천 강도). 서버/로컬 데이터 로드 전에는 null */
  dailyBriefing: DailyStatusBriefing | null;
  /** 정체·부위 부족 → 실행 제안(로드 전에는 빈 배열) */
  actionSuggestions: WorkoutActionSuggestion[];
  /** 운동 세션 코치 권장 휴식(초) — 홈 카피와 동기화 */
  workoutRestTargetSeconds: number;
  /** 체크인 완료 후 표시하는 확정 플랜 한 줄(상태→결정) */
  confirmedPlanLine: string | null;
  /** 오늘 데일리 체크인 제출 여부 */
  hasDailyCheckin: boolean;
  /** 마지막 운동 이후 캘린더 일수(null이면 기록 없음) */
  daysSinceLastWorkout: number | null;
  /** 주간 목표 “손해” 압박 모델(목표 미설정 시 null) */
  weeklyStake: WeeklyStakeModel | null;
};

export type BuildHomeActionViewModelOpts = {
  now?: Date;
  experience?: SiteExperienceConfig;
  /** 오늘 제출된 데일리 체크인(로컬). 없으면 브리핑·루틴은 기록 기준만 사용 */
  dailyCheckin?: DailyCheckinRecord | null;
};

function buildCoachLine(args: {
  todayDone: boolean;
  routineTitle: string;
  streak: number;
  goalProgressPercent: number | null;
  memory: UserMemoryProfile;
}): string {
  if (args.todayDone) {
    if (args.streak >= 3) {
      return `${args.streak}일 연속 기록입니다. 오늘은 여기까지 마무리하고 가벼운 스트레칭과 수분 보충을 권장합니다.`;
    }
    return "오늘 세션을 완료했습니다. 짧게 정리 스트레칭으로 마무리하세요.";
  }

  if (args.memory.personalization_bullets.length > 0) {
    return args.memory.personalization_bullets[0];
  }

  const t = args.routineTitle;
  if (args.goalProgressPercent !== null && args.goalProgressPercent < 40) {
    return `오늘은 「${t}」을(를) 지금 시작하세요. 주간 목표 진행률을 끌어올릴 수 있습니다.`;
  }
  if (args.streak === 0) {
    return `오늘은 「${t}」로 첫 세트를 남기세요.`;
  }
  return `오늘은 「${t}」 루틴을 이어 가세요.`;
}

function rowsLastNDays(workouts: WorkoutRow[], now: Date, days: number): number {
  const cut = now.getTime() - days * 86400000;
  return workouts.filter((w) => new Date(w.created_at).getTime() >= cut).length;
}

function calendarDaysSinceLastWorkout(workouts: WorkoutRow[], now: Date): number | null {
  if (workouts.length === 0) return null;
  const sorted = [...workouts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const last = new Date(sorted[0].created_at);
  const a = new Date(last.getFullYear(), last.getMonth(), last.getDate());
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function buildCoachLineReason(args: {
  todayDone: boolean;
  streak: number;
  goalProgressPercent: number | null;
  weeklySessionCurrent: number;
  weeklySessionTarget: number | null;
  workouts: WorkoutRow[];
  now: Date;
  memory: UserMemoryProfile;
  recoveryAfterMissedYesterday: boolean;
}): string {
  if (args.todayDone) {
    return "오늘 날짜에 저장된 세트가 있어 완료 상태로 표시했습니다.";
  }
  if (args.workouts.length === 0) {
    return "저장된 운동 기록이 없어 오늘 루틴으로 첫 데이터를 쌓는 단계입니다.";
  }
  const mon = startOfWeekMonday(args.now);
  const sun = endOfWeekSunday(mon);
  const thisWeek = rollupPeriod(args.workouts, mon, sun);
  const prevMon = new Date(mon);
  prevMon.setDate(prevMon.getDate() - 7);
  const prevSun = endOfWeekSunday(prevMon);
  const lastWeek = rollupPeriod(args.workouts, prevMon, prevSun);
  const last7 = rowsLastNDays(args.workouts, args.now, 7);
  const sinceLast = calendarDaysSinceLastWorkout(args.workouts, args.now);
  const latest = recentWorkouts(args.workouts, 1)[0];
  const latestName = latest?.exercise_name.trim();

  const bits: string[] = [];
  if (latestName) {
    bits.push(`가장 최근 기록은 「${latestName}」`);
  }
  if (sinceLast !== null) {
    bits.push(`마지막 활동 후 ${sinceLast}일`);
  }
  bits.push(`최근 7일 세트 ${last7}개`);
  bits.push(`이번 주 세트 ${thisWeek.rowCount}개`);
  bits.push(args.streak > 0 ? `연속 기록 ${args.streak}일` : "연속 기록 0일");
  if (lastWeek.volume > 40) {
    const p = Math.round(((thisWeek.volume - lastWeek.volume) / lastWeek.volume) * 1000) / 10;
    bits.push(`전주 동일 기간 대비 볼륨 합 ${p > 0 ? "+" : ""}${p}%`);
  }
  if (args.goalProgressPercent !== null && args.weeklySessionTarget != null) {
    bits.push(`주간 목표 ${args.weeklySessionTarget}세션 중 ${args.weeklySessionCurrent}(${args.goalProgressPercent}%)`);
  }
  if (args.memory.preferred_exercises.length > 0) {
    bits.push(`선호 종목 ${args.memory.preferred_exercises.slice(0, 3).join(", ")}`);
  }
  if (args.memory.personalization_bullets.length > 0) {
    bits.push(`메모리 기반 개인화 ${args.memory.personalization_bullets.length}건`);
  }
  if (args.recoveryAfterMissedYesterday) {
    bits.push("복귀 모드(어제 공백·가벼운 루틴·스트릭 유지 표시)");
  }
  return `${bits.join(" · ")}입니다.`;
}

function buildConfirmedPlanLine(
  briefing: DailyStatusBriefing,
  routine: TodayRoutinePlan,
  checkin: DailyCheckinRecord | null,
): string | null {
  if (!checkin) return null;
  const cond = conditionLabelKo(checkin.condition);
  if (briefing.decisionKind === "rest") {
    return `오늘은 컨디션이 ${cond}입니다. 회복·가벼운 루틴을 우선하고, 무리한 볼륨은 피하세요.`;
  }
  const pct = briefing.recommendedIntensityPercent;
  return `오늘은 컨디션이 ${cond}입니다. → 강도 ${pct}%로 「${routine.title}」을(를) 진행하세요.`;
}

export function buildHomeActionViewModel(
  workouts: WorkoutRow[],
  profile: OnboardingProfile | null,
  goals: LocalWeeklyGoal,
  hydrated: boolean,
  opts?: BuildHomeActionViewModelOpts,
): HomeActionViewModel {
  const now = opts?.now ?? new Date();
  const exp = opts?.experience ?? DEFAULT_SITE_SETTINGS.experience;
  const checkin = opts?.dailyCheckin ?? null;
  const todayDone = hasWorkoutToday(workouts, now);
  const recoveryAfterMissedYesterday = isRecoveryEaseRoutineDay(workouts, now);
  const streak = computeLoggingStreakMerged(workouts, now);
  const streakAtRisk = isStreakAtRiskEvening(workouts, hydrated, now);
  const streakGentleNudge = isStreakGentleNudge(workouts, hydrated, now);
  const streakMotivationLine = getStreakMotivationLine(streak, {
    atRisk: streakAtRisk,
    gentle: streakGentleNudge,
    todayDone,
    recoveryAfterMiss: recoveryAfterMissedYesterday,
  });
  const mon = startOfWeekMonday(now);
  const sun = endOfWeekSunday(mon);
  const week = rollupPeriod(workouts, mon, sun);
  const target = goals.weeklySessionTarget && goals.weeklySessionTarget > 0 ? goals.weeklySessionTarget : null;
  const goalPct =
    target !== null ? Math.min(100, Math.round((week.rowCount / target) * 100)) : null;

  const weeklyStake = computeWeeklyStake(target, week.rowCount, hydrated, todayDone, now);

  let routine = buildOptimizedTodayRoutine(profile, workouts, now);
  routine = applyDailyCheckinToRoutinePlan(routine, checkin);
  routine = applyWeeklyStakeToRoutine(routine, weeklyStake);
  const checkinFatigueSignal = checkin ? conditionToFatigueSignal(checkin.condition) : null;
  const userMemory = recomputeUserMemoryProfile(workouts, {
    now,
    onboarding: profile,
    todayRoutine: { title: routine.title, description: routine.description },
    dailyCheckinFatigue: checkinFatigueSignal,
  });
  const estimatedDurationLabel = formatEstimatedLabel(routine.estimatedMinutesMin, routine.estimatedMinutesMax);
  const coachLine = buildCoachLine({
    todayDone,
    routineTitle: routine.title,
    streak,
    goalProgressPercent: goalPct,
    memory: userMemory,
  });
  const coachLineReason = buildCoachLineReason({
    todayDone,
    streak,
    goalProgressPercent: goalPct,
    weeklySessionCurrent: week.rowCount,
    weeklySessionTarget: target,
    workouts,
    now,
    memory: userMemory,
    recoveryAfterMissedYesterday,
  });

  const recent = recentWorkouts(workouts, 3).map((w) => ({
    id: w.id,
    exerciseName: w.exercise_name.trim(),
    detail: `${Number(w.weight_kg)}kg × ${w.reps} × ${w.sets}`,
    createdAt: w.created_at,
  }));

  const baseDailyBriefing = hydrated
    ? buildDailyStatusBriefing(workouts, now, {
        highLoadDayMinRows: exp.briefingHighLoadDayMinRows,
        highLoadDayMinVolume: exp.briefingHighLoadDayMinVolume,
      })
    : null;
  const dailyBriefing =
    baseDailyBriefing && checkin ? mergeDailyCheckinIntoBriefing(baseDailyBriefing, checkin) : baseDailyBriefing;
  const actionSuggestions = hydrated ? buildWorkoutActionSuggestions(workouts, now) : [];

  const sinceLast = calendarDaysSinceLastWorkout(workouts, now);
  const confirmedPlanLine = dailyBriefing ? buildConfirmedPlanLine(dailyBriefing, routine, checkin) : null;

  return {
    hydrated,
    todayWorkoutComplete: todayDone,
    goalProgressPercent: goalPct,
    weeklySessionCurrent: week.rowCount,
    weeklySessionTarget: target,
    streakDays: streak,
    streakAtRisk,
    streakGentleNudge,
    streakMotivationLine,
    recoveryAfterMissedYesterday,
    routine,
    estimatedDurationLabel,
    coachLine,
    coachLineReason,
    recentActivities: recent,
    dailyBriefing,
    actionSuggestions,
    workoutRestTargetSeconds: exp.workoutRestTargetSeconds,
    confirmedPlanLine,
    hasDailyCheckin: Boolean(checkin),
    daysSinceLastWorkout: sinceLast,
    weeklyStake,
  };
}
