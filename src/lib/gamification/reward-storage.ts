import { computeLevelProgress, computeWorkoutXp } from "@/lib/gamification/xp-level";
import type { WorkoutInput } from "@/types/workout";

const LS_PREFIX = "jws_reward_profile_v1:";

export type RewardProfile = {
  schemaVersion: 1;
  totalXp: number;
  lifetimeSetsLogged?: number;
};

export type XpGrantResult = {
  gainedXp: number;
  totalXp: number;
  levelBefore: number;
  levelAfter: number;
  leveledUp: boolean;
};

function keyFor(userId: string): string {
  return `${LS_PREFIX}${userId}`;
}

export function loadRewardProfile(userId: string): RewardProfile {
  if (typeof window === "undefined" || !userId) {
    return { schemaVersion: 1, totalXp: 0 };
  }
  try {
    const raw = window.localStorage.getItem(keyFor(userId));
    if (!raw) return { schemaVersion: 1, totalXp: 0 };
    const p = JSON.parse(raw) as RewardProfile;
    const totalXp = typeof p.totalXp === "number" && Number.isFinite(p.totalXp) ? Math.max(0, Math.floor(p.totalXp)) : 0;
    return {
      schemaVersion: 1,
      totalXp,
      lifetimeSetsLogged:
        typeof p.lifetimeSetsLogged === "number" && Number.isFinite(p.lifetimeSetsLogged)
          ? Math.max(0, Math.floor(p.lifetimeSetsLogged))
          : undefined,
    };
  } catch {
    return { schemaVersion: 1, totalXp: 0 };
  }
}

export function saveRewardProfile(userId: string, profile: RewardProfile): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    window.localStorage.setItem(keyFor(userId), JSON.stringify(profile));
  } catch {
    /* quota */
  }
}

/** 운동 1건 저장 후 XP 반영 — 홈·세션 화면 공통 */
export function recordWorkoutXp(userId: string, input: WorkoutInput, isPr: boolean): XpGrantResult {
  const gainedXp = computeWorkoutXp(input, isPr);
  const prev = loadRewardProfile(userId);
  const levelBefore = computeLevelProgress(prev.totalXp).level;
  const next: RewardProfile = {
    schemaVersion: 1,
    totalXp: prev.totalXp + gainedXp,
    lifetimeSetsLogged: (prev.lifetimeSetsLogged ?? 0) + 1,
  };
  saveRewardProfile(userId, next);
  const levelAfter = computeLevelProgress(next.totalXp).level;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("jws-reward-changed"));
  }
  return {
    gainedXp,
    totalXp: next.totalXp,
    levelBefore,
    levelAfter,
    leveledUp: levelAfter > levelBefore,
  };
}
