"use client";

import { useSubscription } from "@/components/subscription/SubscriptionProvider";

const btnClass =
  "inline-flex items-center justify-center rounded-full border border-black bg-black px-6 py-3 text-[13px] font-bold text-white transition hover:bg-white hover:text-black disabled:opacity-50";

export function MvpPremiumSubscribeButton() {
  const { requestPortOnePremium, portOneBusy } = useSubscription();

  return (
    <button type="button" className={btnClass} disabled={portOneBusy} onClick={requestPortOnePremium}>
      {portOneBusy ? "결제창 여는 중…" : "프리미엄 구독하기 (₩4,900)"}
    </button>
  );
}
