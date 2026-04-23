"use client";

import { setMvpPremiumInBrowser } from "@/lib/subscription/mvp-premium-ls";
import Link from "next/link";
import { useEffect } from "react";

export default function PaymentSuccessPage() {
  useEffect(() => {
    setMvpPremiumInBrowser(true);
  }, []);

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center text-apple-ink dark:text-zinc-100">
      <p className="font-display text-2xl font-bold tracking-tight">결제가 완료되었습니다 🎉</p>
      <p className="mt-4 text-[15px] leading-relaxed text-apple-subtle dark:text-zinc-400">
        프리미엄이 활성화되었어요. 이 기기에서는 <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-[13px] dark:bg-zinc-800">localStorage.isPremium</code> 로
        잠금이 풀립니다.
      </p>
      <ul className="mt-8 space-y-2 text-left text-[14px] leading-relaxed text-apple-ink dark:text-zinc-200">
        <li className="flex gap-2">
          <span className="text-emerald-600 dark:text-emerald-400">✓</span>
          AI 코칭 일일 제한 없이 이어가기
        </li>
        <li className="flex gap-2">
          <span className="text-emerald-600 dark:text-emerald-400">✓</span>
          루틴 자동 최적화·주간 리포트
        </li>
        <li className="flex gap-2">
          <span className="text-emerald-600 dark:text-emerald-400">✓</span>
          운동 직후 세션 기반 심층 분석 힌트
        </li>
      </ul>
      <Link href="/" className="mt-10 inline-block text-[15px] font-semibold underline underline-offset-4">
        홈으로
      </Link>
    </div>
  );
}
