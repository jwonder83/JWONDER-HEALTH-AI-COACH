"use client";

import { useEffect } from "react";

type Props = {
  message: string | null;
  onDismiss: () => void;
  durationMs?: number;
  /** PR·성취 등 강조 토스트 */
  variant?: "default" | "achievement";
};

export function Toast({ message, onDismiss, durationMs = 4200, variant = "default" }: Props) {
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => onDismiss(), durationMs);
    return () => window.clearTimeout(t);
  }, [message, onDismiss, durationMs]);

  if (!message) return null;

  const isAchievement = variant === "achievement";

  return (
    <div
      role="status"
      className={
        isAchievement
          ? "fixed bottom-6 left-1/2 z-[100] w-[min(92vw,440px)] -translate-x-1/2 border-2 border-amber-300/90 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 px-5 py-4 text-center shadow-[0_12px_40px_-8px_rgba(245,158,11,0.55)] ring-4 ring-amber-300/40"
          : "fixed bottom-6 left-1/2 z-[100] w-[min(92vw,420px)] -translate-x-1/2 border border-neutral-900 bg-neutral-900 px-4 py-3 text-center shadow-lg motion-safe:transition motion-safe:duration-300"
      }
    >
      {isAchievement ? (
        <p className="text-[16px] font-bold leading-snug text-white">
          <span className="mr-1.5 inline-block text-xl" aria-hidden>
            ✨
          </span>
          {message}
        </p>
      ) : (
        <p className="text-[14px] font-medium text-white">{message}</p>
      )}
    </div>
  );
}
