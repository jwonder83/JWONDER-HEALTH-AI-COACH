import type { SubscriptionPersisted } from "@/types/subscription";

export function defaultFreeSubscription(): SubscriptionPersisted {
  const now = new Date().toISOString();
  return {
    isPremium: false,
    trialActive: false,
    trialEndsAt: null,
    subscriptionType: "free",
    currentPeriodEnd: null,
    updatedAt: now,
  };
}

/** 유료 기능 접근: 정기 결제 활성 또는(트라이얼 기간 내) */
export function hasPremiumAccess(state: SubscriptionPersisted | null): boolean {
  if (!state) return false;
  if (state.isPremium) return true;
  if (state.trialActive && state.trialEndsAt) {
    return new Date(state.trialEndsAt).getTime() > Date.now();
  }
  return false;
}
