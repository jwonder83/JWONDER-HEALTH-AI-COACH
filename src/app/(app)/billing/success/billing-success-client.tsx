"use client";

import type { SiteBillingPagesCopy } from "@/types/site-settings";
import Link from "next/link";

/** 과거 외부 Checkout 성공 URL 호환. 단건 결제 완료는 `/success` 로 안내합니다. */
export function BillingSuccessClient({ copy }: { copy: SiteBillingPagesCopy }) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center text-apple-ink dark:text-zinc-100">
      <p className="font-display text-xl font-bold tracking-tight">{copy.billingLegacyTitle}</p>
      <p className="mt-4 text-[15px] leading-relaxed text-apple-subtle dark:text-zinc-400">{copy.billingLegacyBody}</p>
      <div className="mt-10 flex flex-col gap-3 text-[14px] font-semibold">
        <Link href="/success" className="underline underline-offset-4">
          {copy.billingLegacyCtaSuccess}
        </Link>
        <Link href="/settings" className="text-apple-subtle underline underline-offset-4 dark:text-zinc-400">
          {copy.billingLegacyCtaSettings}
        </Link>
      </div>
    </div>
  );
}
