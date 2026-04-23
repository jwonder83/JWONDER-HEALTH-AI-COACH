"use client";

import Link from "next/link";

/** 과거 외부 Checkout 성공 URL 호환. 단건 결제 완료는 `/success` 로 안내합니다. */
export function BillingSuccessClient() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center text-apple-ink dark:text-zinc-100">
      <p className="font-display text-xl font-bold tracking-tight">이 결제 확인 경로는 사용되지 않아요</p>
      <p className="mt-4 text-[15px] leading-relaxed text-apple-subtle dark:text-zinc-400">
        구독·단건 결제는 PortOne(아임포트)으로 진행됩니다. 결제가 끝나면 자동으로{" "}
        <span className="font-semibold text-apple-ink dark:text-zinc-200">/success</span> 페이지로 이동해요.
      </p>
      <div className="mt-10 flex flex-col gap-3 text-[14px] font-semibold">
        <Link href="/success" className="underline underline-offset-4">
          결제 완료 페이지로
        </Link>
        <Link href="/settings" className="text-apple-subtle underline underline-offset-4 dark:text-zinc-400">
          설정으로
        </Link>
      </div>
    </div>
  );
}
