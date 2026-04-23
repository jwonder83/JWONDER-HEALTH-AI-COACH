export type SubscriptionPlan = "free" | "monthly" | "yearly";

/** 로컬에 저장되는 구독 스냅샷(향후 서버·정기결제 연동 시 확장) */
export type SubscriptionPersisted = {
  isPremium: boolean;
  trialActive: boolean;
  trialEndsAt: string | null;
  subscriptionType: SubscriptionPlan;
  currentPeriodEnd: string | null;
  updatedAt: string;
};

export type PaywallReason =
  | "ai_daily_limit"
  | "routine_weekly_limit"
  | "workout_complete"
  | "streak_3"
  | "report_unlock"
  | "generic";

export const SUBSCRIPTION_CHANGED_EVENT = "jws-subscription-changed";
