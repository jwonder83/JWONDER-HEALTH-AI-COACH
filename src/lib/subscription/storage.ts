import { defaultFreeSubscription } from "@/lib/subscription/access";
import type { SubscriptionPersisted } from "@/types/subscription";
import { SUBSCRIPTION_CHANGED_EVENT } from "@/types/subscription";

function keyFor(userId: string): string {
  return `jws-subscription-v1:${userId}`;
}

export function loadSubscriptionFromBrowser(userId: string): SubscriptionPersisted {
  if (typeof window === "undefined") return defaultFreeSubscription();
  try {
    const raw = window.localStorage.getItem(keyFor(userId));
    if (!raw) return defaultFreeSubscription();
    const p = JSON.parse(raw) as Partial<SubscriptionPersisted>;
    const base = defaultFreeSubscription();
    return {
      ...base,
      isPremium: Boolean(p.isPremium),
      trialActive: Boolean(p.trialActive),
      trialEndsAt: typeof p.trialEndsAt === "string" ? p.trialEndsAt : null,
      subscriptionType:
        p.subscriptionType === "monthly" || p.subscriptionType === "yearly"
          ? p.subscriptionType
          : "free",
      currentPeriodEnd: typeof p.currentPeriodEnd === "string" ? p.currentPeriodEnd : null,
      updatedAt: typeof p.updatedAt === "string" ? p.updatedAt : base.updatedAt,
    };
  } catch {
    return defaultFreeSubscription();
  }
}

export function saveSubscriptionToBrowser(userId: string, next: SubscriptionPersisted): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(keyFor(userId), JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(SUBSCRIPTION_CHANGED_EVENT, { detail: { userId } }));
  } catch {
    /* ignore */
  }
}
