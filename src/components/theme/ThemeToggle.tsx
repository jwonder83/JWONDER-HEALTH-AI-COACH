"use client";

import { navMenuTracking } from "@/components/nav/menu-styles";
import { useEffect, useState } from "react";

const LS = "jws_theme_v1";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LS);
    const prefersDark =
      stored === "dark" ||
      (stored !== "light" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
    setReady(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    localStorage.setItem(LS, next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!ready}
      aria-label={dark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className={`rounded-full border border-neutral-200 bg-white px-3 py-2 text-[11px] font-semibold ${navMenuTracking} text-apple-ink transition-colors hover:border-black hover:bg-neutral-50 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/60 ${className}`}
    >
      {dark ? "라이트" : "다크"}
    </button>
  );
}
