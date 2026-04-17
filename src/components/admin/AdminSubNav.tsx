import { ThemeToggle } from "@/components/theme/ThemeToggle";
import Link from "next/link";

const linkClass =
  "border border-neutral-200 bg-white px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-apple-ink transition hover:border-black sm:px-4 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-400";

export function AdminSubNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
        <span className="font-display text-[11px] font-medium uppercase tracking-[0.22em] text-apple-subtle dark:text-zinc-500">Admin</span>
        <nav aria-label="관리자 메뉴" className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <Link href="/admin" className={linkClass}>
            개요
          </Link>
          <Link href="/admin/site" className={linkClass}>
            사이트
          </Link>
          <Link href="/admin/login" className={linkClass}>
            로그인
          </Link>
          <Link href="/admin/program" className={linkClass}>
            프로그램
          </Link>
        </nav>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <ThemeToggle />
          <Link href="/" className={`${linkClass} border-stone-200/90 hover:bg-stone-50 dark:border-zinc-700 dark:hover:bg-zinc-800`}>
            홈
          </Link>
        </div>
      </div>
    </header>
  );
}
