import { SectionTitleBlock } from "@/components/ui/SectionTitleBlock";
import { getSiteSettings } from "@/lib/site-settings/load-server";
import Link from "next/link";

export default async function HelpPage() {
  const site = await getSiteSettings();
  const h = site.copy.helpCenter;
  const statusUrl = process.env.NEXT_PUBLIC_STATUS_URL?.trim();
  const statusLabel = process.env.NEXT_PUBLIC_STATUS_LABEL?.trim();
  const feedbackEmail = process.env.NEXT_PUBLIC_FEEDBACK_EMAIL?.trim();
  const feedbackFormUrl = process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL?.trim();
  const hasExtraLinks = Boolean(statusUrl || feedbackEmail || feedbackFormUrl);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8 sm:py-14">
      <SectionTitleBlock step="?" eyebrow="도움" title={h.pageTitle} />
      <p className="mt-2 whitespace-pre-wrap text-[14px] leading-snug text-apple-subtle sm:text-[15px]">{h.intro}</p>
      <p className="mt-4 text-[14px] leading-snug text-apple-subtle sm:text-[15px]">
        스플릿·델로드·RPE 등은{" "}
        <Link href="/program" className="font-semibold text-apple-ink underline decoration-neutral-400 underline-offset-[5px] hover:opacity-60">
          {site.program.promoLinkLabel}
        </Link>
      </p>
      <p className="mt-5 rounded-lg border-l-2 border-black/80 bg-neutral-50 px-4 py-3 text-[14px] font-medium text-apple-ink">{h.contactLine}</p>

      {hasExtraLinks ? (
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white/90 px-4 py-4 shadow-sm sm:px-5">
          <p className="text-[12px] font-medium tracking-[-0.01em] text-apple-subtle">더보기</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] text-apple-subtle">
            {statusUrl ? (
              <a
                href={statusUrl}
                className="font-semibold text-apple-ink underline decoration-neutral-400 underline-offset-[5px] transition hover:opacity-60"
                rel="noopener noreferrer"
                target="_blank"
              >
                {statusLabel || "장애 시 상태 확인"}
              </a>
            ) : null}
            {feedbackEmail ? (
              <a
                href={`mailto:${feedbackEmail}`}
                className="font-semibold text-apple-ink underline decoration-neutral-400 underline-offset-[5px] transition hover:opacity-60"
              >
                피드백·문의(메일)
              </a>
            ) : null}
            {feedbackFormUrl ? (
              <a
                href={feedbackFormUrl}
                className="font-semibold text-apple-ink underline decoration-neutral-400 underline-offset-[5px] transition hover:opacity-60"
                rel="noopener noreferrer"
                target="_blank"
              >
                피드백·문의(폼)
              </a>
            ) : null}
          </p>
        </div>
      ) : null}

      <h2 className="mt-10 text-[13px] font-semibold tracking-[-0.01em] text-apple-subtle">{h.faqSectionTitle}</h2>
      <ul className="mt-4 space-y-3">
        {h.faqItems.map((item, i) => (
          <li key={i} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <details className="group">
              <summary className="cursor-pointer list-none px-4 py-3 text-[15px] font-bold marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="text-apple-subtle">Q.</span> {item.question}
              </summary>
              <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-3 text-[15px] leading-relaxed text-apple-ink">{item.answer}</div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
