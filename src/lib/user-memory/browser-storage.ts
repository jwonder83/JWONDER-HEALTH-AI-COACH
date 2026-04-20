"use client";

import type { UserMemoryProfile } from "@/types/user-memory";

export const USER_MEMORY_LS_KEY = "jws_user_memory_v1";

function keyForUser(userId: string): string {
  return `${USER_MEMORY_LS_KEY}:${userId}`;
}

export function loadUserMemoryFromBrowser(userId: string): UserMemoryProfile | null {
  if (typeof window === "undefined" || !userId) return null;
  try {
    const raw = window.localStorage.getItem(keyForUser(userId));
    if (!raw) return null;
    const p = JSON.parse(raw) as UserMemoryProfile;
    if (typeof p !== "object" || p === null) return null;
    if (typeof p.goal !== "string") return null;
    return p;
  } catch {
    return null;
  }
}

export function saveUserMemoryToBrowser(userId: string, profile: UserMemoryProfile): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    window.localStorage.setItem(keyForUser(userId), JSON.stringify(profile));
  } catch {
    /* quota 등 */
  }
}
