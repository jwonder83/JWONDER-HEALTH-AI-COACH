"use client";

import { setMvpPremiumInBrowser } from "@/lib/subscription/mvp-premium-ls";
import type { SiteBillingPagesCopy } from "@/types/site-settings";
import Link from "next/link";
import { useEffect } from "react";

export function PaymentSuccessClient({ copy }: { copy: SiteBillingPagesCopy }) {
  useEffect(() => {
    setMvpPremiumInBrowser(true);
  }, []);

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center text-apple-ink dark:text-zinc-100">
      <p className="font-display text-2xl font-bold tracking-tight">{copy.successTitle}</p>
      <p className="mt-4 text-[15px] leading-relaxed text-apple-subtle dark:text-zinc-400">
        {copy.successBodyHtmlIntro}
        <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-[13px] dark:bg-zinc-800">localStorage.isPremium</code>
        {copy.successBodyHtmlOutro}
      </p>
      <ul className="mt-8 space-y-2 text-left text-[14px] leading-relaxed text-apple-ink dark:text-zinc-200">
        <li className="flex gap-2">
          <span className="text-emerald-600 dark:text-emerald-400">✓</span>
          {copy.successBullet1}
        </li>
        <li className="flex gap-2">
          <span className="text-emerald-600 dark:text-emerald-400">✓</span>
          {copy.successBullet2}
        </li>
        <li className="flex gap-2">
          <span className="text-emerald-600 dark:text-emerald-400">✓</span>
          {copy.successBullet3}
        </li>
      </ul>
      <Link href="/" className="mt-10 inline-block text-[15px] font-semibold underline underline-offset-4">
        {copy.homeLink}
      </Link>
    </div>
  );
}
