import Link from "next/link";

const linkClass =
  "rounded-full border border-orange-100/90 bg-white/90 px-3.5 py-2 text-[12px] font-semibold text-apple-ink shadow-sm transition hover:border-apple/30 hover:bg-apple/10 hover:text-apple sm:px-4";

export function AdminSubNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-orange-100/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
        <span className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-apple">Admin</span>
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
