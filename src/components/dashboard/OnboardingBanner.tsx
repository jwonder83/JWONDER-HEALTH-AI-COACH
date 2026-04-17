"use client";

import { ONBOARDING_LS_KEY } from "@/lib/onboarding/types";
import Link from "next/link";
import { useEffect, useState } from "react";

export function OnboardingBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ONBOARDING_LS_KEY);
      if (!raw) {
        setShow(true);
        return;
      }
      const done = JSON.parse(raw) as { completedAt?: string };
      setShow(!done?.completedAt);
    } catch {
      setShow(true);
    }
    const d = localStorage.getItem("jws_onboarding_banner_dismiss_v1");
    setDismissed(d === "1");
  }, []);

  if (!show || dismissed) return null;

  return (
    <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-200/90 bg-amber-50/95 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:border-amber-900/50 dark:bg-amber-950/40">
      <p className="text-[13px] font-medium leading-snug text-amber-950 dark:text-amber-100">
        목표와 주당 횟수를 알려 주시면, <strong>루틴 초안</strong>(규칙 기반·AI 없음)을 바로 받을 수 있어요.
      </p>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Link
          href="/onboarding"
          className="inline-flex items-center justify-center rounded-full border border-black bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white dark:border-amber-200 dark:bg-amber-200 dark:text-black"
        >
          시작하기
        </Link>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem("jws_onboarding_banner_dismiss_v1", "1");
            setDismissed(true);
          }}
          className="rounded-full border border-amber-300/80 bg-white px-4 py-2 text-[11px] font-semibold text-amber-900 dark:border-amber-800 dark:bg-zinc-900 dark:text-amber-100"
        >
          나중에
        </button>
      </div>
    </div>
  );
}
