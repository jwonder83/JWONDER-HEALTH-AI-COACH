import { navMenuEyebrow, navPillLink } from "@/components/nav/menu-styles";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import Link from "next/link";

export function AdminSubNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
        <span className={navMenuEyebrow}>Admin</span>
        <nav aria-label="관리자 메뉴" className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <Link href="/admin" className={navPillLink}>
            개요
          </Link>
          <Link href="/admin/site" className={navPillLink}>
            사이트
          </Link>
          <Link href="/admin/login" className={navPillLink}>
            로그인
          </Link>
          <Link href="/admin/program" className={navPillLink}>
            프로그램
          </Link>
        </nav>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <ThemeToggle />
          <Link href="/" className={navPillLink}>
            홈
          </Link>
        </div>
      </div>
    </header>
  );
}
