import type { SiteSettingsMerged } from "@/types/site-settings";
import Link from "next/link";
import type { ReactNode } from "react";
import { SignOutButton } from "./SignOutButton";

export type AppFooterMeta = {
  /** 장애·상태 안내 페이지 (팀 내부용 등) */
  statusUrl?: string;
  statusLabel?: string;
  feedbackMailto?: string;
  feedbackFormUrl?: string;
};

type Props = {
  email: string;
  showAdminLink: boolean;
  site: SiteSettingsMerged;
  children: ReactNode;
  footerMeta?: AppFooterMeta;
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

const navLink =
  "px-2 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-apple-ink transition-opacity hover:opacity-50 sm:px-3 sm:text-[12px]";

export function AppShell({ email, showAdminLink, site, children, footerMeta }: Props) {
  return (
    <div className="flex min-h-screen flex-col text-apple-ink">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 flex-wrap items-center gap-4 sm:gap-8">
            <Link
              href="/"
              className="font-display relative flex size-10 shrink-0 items-center justify-center overflow-hidden border border-apple-ink bg-apple-ink text-[15px] font-semibold text-white transition hover:bg-white hover:text-apple-ink"
              aria-label="홈"
            >
              {site.images.headerLogo.src.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={site.images.headerLogo.src}
                  alt={site.images.headerLogo.alt.trim() || "홈"}
                  className="size-full object-contain p-0.5"
                  loading="eager"
                  decoding="async"
                />
              ) : (
                <span aria-hidden>{initialFromEmail(email)}</span>
              )}
            </Link>
            <nav aria-label="주요 메뉴" className="flex flex-wrap items-center gap-x-1 gap-y-1 sm:gap-x-2">
              <Link href="/" className={navLink}>
                홈
              </Link>
              <Link href="/program" className={navLink}>
                {site.program.navLabel}
              </Link>
              <Link href="/records" className={navLink}>
                운동 기록
              </Link>
              <Link href="/help" className={navLink}>
                도움말
              </Link>
              <Link href="/settings" className={navLink}>
                계정
              </Link>
            </nav>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <span className="hidden max-w-[200px] truncate text-[11px] uppercase tracking-[0.12em] text-apple-subtle sm:inline">{email}</span>
            {showAdminLink ? (
              <Link href="/admin" className={navLink}>
                사이트 설정
              </Link>
            ) : null}
            <SignOutButton
              className={`${navLink} border border-transparent hover:border-neutral-300 hover:opacity-100`}
            />
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>

      <footer className="mt-auto border-t border-neutral-200 bg-white px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl text-center">
          <p className="font-display text-[11px] font-medium uppercase tracking-[0.28em] text-apple-ink">{site.copy.footer.primaryLine}</p>
          {site.copy.footer.secondaryLine.trim() ? (
            <p className="mt-3 text-[13px] leading-relaxed text-apple-subtle">{site.copy.footer.secondaryLine}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] font-normal">
            {site.copy.footer.links.map((item, i) => (
              <span key={`${item.href}-${i}`} className="contents">
                {i > 0 ? (
                  <span className="text-neutral-300" aria-hidden>
                    |
                  </span>
                ) : null}
                <FooterNavLink
                  href={item.href}
                  className="text-apple-ink underline decoration-neutral-300 underline-offset-[6px] transition hover:opacity-60"
                >
                  {item.label}
                </FooterNavLink>
              </span>
            ))}
          </div>
          {footerMeta?.statusUrl || footerMeta?.feedbackMailto || footerMeta?.feedbackFormUrl ? (
            <p className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-[11px] uppercase tracking-[0.14em] text-apple-subtle">
              {footerMeta.statusUrl ? (
                <>
                  <FooterNavLink
                    href={footerMeta.statusUrl}
                    className="underline decoration-neutral-300 underline-offset-4 transition hover:text-apple-ink"
                  >
                    {footerMeta.statusLabel?.trim() || "장애 시 상태 확인"}
                  </FooterNavLink>
                  {footerMeta.feedbackMailto || footerMeta.feedbackFormUrl ? (
                    <span className="text-neutral-300" aria-hidden>
                      |
                    </span>
                  ) : null}
                </>
              ) : null}
              {footerMeta.feedbackMailto ? (
                <a
                  href={footerMeta.feedbackMailto}
                  className="underline decoration-neutral-300 underline-offset-4 transition hover:text-apple-ink"
                >
                  문의(메일)
                </a>
              ) : null}
              {footerMeta.feedbackMailto && footerMeta.feedbackFormUrl ? (
                <span className="text-neutral-300" aria-hidden>
                  |
                </span>
              ) : null}
              {footerMeta.feedbackFormUrl ? (
                <FooterNavLink
                  href={footerMeta.feedbackFormUrl}
                  className="underline decoration-neutral-300 underline-offset-4 transition hover:text-apple-ink"
                >
                  문의(폼)
                </FooterNavLink>
              ) : null}
            </p>
          ) : null}
          <p className="mt-8 whitespace-pre-line text-[11px] uppercase tracking-[0.16em] text-apple-subtle">
            {footerCopyrightLine(site.copy.footer.copyrightLine)}
          </p>
        </div>
      </footer>
    </div>
  );
}
