import Link from "next/link";

const linkClass =
  "border border-neutral-200 bg-white px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-apple-ink transition hover:border-black sm:px-4";

export function AdminSubNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
        <span className="font-display text-[11px] font-medium uppercase tracking-[0.22em] text-apple-subtle">Admin</span>
        <nav aria-label="관리자 메뉴" className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <Link href="/admin" className={linkClass}>
            개요
          </Link>
          <Link href="/admin/site" className={linkClass}>
            사이트
          </Link>
          <Link href="/admin/program" className={linkClass}>
            프로그램
          </Link>
        </nav>
        <Link href="/" className={`${linkClass} ml-auto border-stone-200/90 hover:bg-stone-50`}>
          앱 홈
        </Link>
      </div>
    </header>
  );
}
