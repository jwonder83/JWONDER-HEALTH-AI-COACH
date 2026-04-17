"use client";

import { useEffect } from "react";

type Props = {
  message: string | null;
  onDismiss: () => void;
  durationMs?: number;
};

export function Toast({ message, onDismiss, durationMs = 4200 }: Props) {
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => onDismiss(), durationMs);
    return () => window.clearTimeout(t);
  }, [message, onDismiss, durationMs]);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-[100] w-[min(92vw,420px)] -translate-x-1/2 border border-neutral-900 bg-neutral-900 px-4 py-3 text-center text-[14px] font-medium text-white shadow-lg motion-safe:transition motion-safe:duration-300"
    >
      {message}
    </div>
  );
}
