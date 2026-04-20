"use client";

import type { CoachPresenceMessage } from "@/lib/coaching/persistent-presence";
import Link from "next/link";

export type AiCoachPresenceProps = {
  /** 규칙 또는 API에서 조립한 메시지 페이로드 */
  message: CoachPresenceMessage;
  className?: string;
  /** 스크린리더용 라벨 (기본: AI 코치) */
  label?: string;
};

const situationLabel: Record<CoachPresenceMessage["situation"], string> = {
  first_record: "첫 기록",
  streak_motivation: "동기 부여",
  post_workout: "오늘 분석",
  pre_workout: "시작 추천",
};

export function AiCoachPresence({ message, className = "", label = "AI 코치" }: AiCoachPresenceProps) {
  const tag = situationLabel[message.situation];

  return (
    <aside
      className={`border-b border-neutral-200/90 bg-gradient-to-r from-neutral-50 via-white to-neutral-50 dark:border-zinc-800 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900 ${className}`.trim()}
      aria-label={label}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-start gap-3 sm:items-center">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-[10px] font-bold uppercase tracking-wider text-apple-ink shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            aria-hidden
          >
            AI
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-apple-subtle">{label}</span>
              <span className="rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-apple-subtle dark:border-zinc-700 dark:bg-zinc-900">
                {tag}
              </span>
              {message.source === "gpt" ? (
                <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400">GPT</span>
              ) : null}
            </div>
            <p className="mt-1.5 text-[14px] font-medium leading-relaxed text-apple-ink sm:text-[15px]" aria-live="polite">
              {message.body}
            </p>
          </div>
        </div>
        {message.cta ? (
          <div className="flex shrink-0 sm:ml-auto">
            {message.cta.href.startsWith("/") ? (
              <Link
                href={message.cta.href}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-black bg-black px-4 text-[13px] font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.99] sm:w-auto sm:px-5"
              >
                {message.cta.label}
              </Link>
            ) : (
              <a
                href={message.cta.href}
                className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl border border-black bg-black px-4 text-[13px] font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.99] sm:w-auto sm:px-5"
              >
                {message.cta.label}
              </a>
            )}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
