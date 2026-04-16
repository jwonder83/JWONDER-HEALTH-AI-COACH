import type { SiteSettingsMerged } from "@/types/site-settings";
import Link from "next/link";
import type { ReactNode } from "react";
import { SignOutButton } from "./SignOutButton";

type Props = {
  email: string;
  showAdminLink: boolean;
  site: SiteSettingsMerged;
  children: ReactNode;
};

function initialFromEmail(e: string) {
  const t = e.trim();
  if (!t) return "?";
  return t.charAt(0).toUpperCase();
}

function footerCopyrightLine(template: string) {
  return template.replaceAll("{year}", String(new Date().getFullYear()));
}

function FooterNavLink({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  const t = href.trim();
  if (t.startsWith("/")) {
    return (
      <Link href={t} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={t} className={className} rel="noopener noreferrer" target="_blank">
      {children}
    </a>
  );
}

const navBtn =
  "rounded-full border border-orange-100/90 bg-white/90 px-3.5 py-2 text-[12px] font-semibold tracking-tight text-apple-ink shadow-sm transition hover:border-apple/30 hover:bg-apple/10 hover:text-apple sm:px-4";

export function AppShell({ email, showAdminLink, site, children }: Props) {
  return (
    <div className="flex min-h-screen flex-col text-apple-ink">
      <header className="sticky top-0 z-30 px-3 pt-3 sm:px-5 sm:pt-4">
        <div className="mx-auto max-w-6xl rounded-[1.75rem] border border-orange-100/80 bg-white/85 px-4 py-3 shadow-[0_8px_32px_-12px_rgba(233,75,60,0.18),0_2px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-xl sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
              <Link
                href="/"
                className="font-display flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-apple to-[#ff8a7a] text-lg font-bold text-white shadow-md shadow-apple/25"
                aria-label="홈"
              >
                {initialFromEmail(email)}
              </Link>
              <nav aria-label="주요 메뉴" className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <Link href="/" className={navBtn}>
                  홈
                </Link>
                <Link href="/records" className={navBtn}>
                  통계·보내기
                </Link>
                <Link href="/help" className={navBtn}>
                  도움말
                </Link>
                <Link href="/settings" className={navBtn}>
                  계정
                </Link>
              </nav>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <span className="hidden max-w-[200px] truncate text-[12px] text-apple-subtle sm:inline">{email}</span>
              {showAdminLink ? (
                <Link href="/admin" className={navBtn}>
                  사이트 설정
                </Link>
              ) : null}
              <SignOutButton
                className={`${navBtn} border-stone-200/90 hover:border-stone-300 hover:bg-stone-50 hover:text-apple-ink`}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="mt-auto px-4 pb-8 pt-12 sm:px-6">
        <div className="mx-auto max-w-6xl rounded-[1.5rem] border border-orange-100/80 bg-white/80 px-6 py-8 text-center shadow-[0_12px_40px_-16px_rgba(233,75,60,0.12)] backdrop-blur-md">
          <p className="font-display text-[12px] font-bold uppercase tracking-[0.18em] text-apple">{site.copy.footer.primaryLine}</p>
          {site.copy.footer.secondaryLine.trim() ? (
            <p className="mt-2 text-[13px] leading-relaxed text-apple-subtle">{site.copy.footer.secondaryLine}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[14px] font-medium">
            {site.copy.footer.links.map((item, i) => (
              <span key={`${item.href}-${i}`} className="contents">
                {i > 0 ? (
                  <span className="text-orange-200" aria-hidden>
                    ✦
                  </span>
                ) : null}
                <FooterNavLink
                  href={item.href}
                  className="text-apple-muted underline decoration-apple/25 underline-offset-[6px] transition hover:text-apple"
                >
                  {item.label}
                </FooterNavLink>
              </span>
            ))}
          </div>
          <p className="mt-6 whitespace-pre-line text-[12px] text-apple-subtle">{footerCopyrightLine(site.copy.footer.copyrightLine)}</p>
        </div>
      </footer>
    </div>
  );
}
