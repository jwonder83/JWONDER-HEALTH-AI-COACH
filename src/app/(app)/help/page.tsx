import { SectionTitleBlock } from "@/components/ui/SectionTitleBlock";
import { getSiteSettings } from "@/lib/site-settings/load-server";

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
      <SectionTitleBlock step="?" eyebrow="HELP" title={h.pageTitle} />
      <p className="mt-2 whitespace-pre-wrap text-[16px] leading-relaxed text-apple-subtle">{h.intro}</p>
      <p className="mt-6 border-l-4 border-apple bg-apple/5 px-4 py-3 text-[15px] font-medium text-apple-ink">{h.contactLine}</p>

      {hasExtraLinks ? (
        <div className="mt-8 rounded-2xl border border-orange-100/90 bg-white/90 px-4 py-4 shadow-sm sm:px-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-apple">추가 안내</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] text-apple-subtle">
            {statusUrl ? (
              <a
                href={statusUrl}
                className="font-semibold text-apple-muted underline decoration-apple/25 underline-offset-[5px] transition hover:text-apple"
                rel="noopener noreferrer"
                target="_blank"
              >
                {statusLabel || "장애 시 상태 확인"}
              </a>
            ) : null}
            {feedbackEmail ? (
              <a
                href={`mailto:${feedbackEmail}`}
                className="font-semibold text-apple-muted underline decoration-apple/25 underline-offset-[5px] transition hover:text-apple"
              >
                피드백·문의(메일)
              </a>
            ) : null}
            {feedbackFormUrl ? (
              <a
                href={feedbackFormUrl}
                className="font-semibold text-apple-muted underline decoration-apple/25 underline-offset-[5px] transition hover:text-apple"
                rel="noopener noreferrer"
                target="_blank"
              >
                피드백·문의(폼)
              </a>
            ) : null}
          </p>
        </div>
      ) : null}

      <h2 className="mt-12 text-[13px] font-bold uppercase tracking-[0.18em] text-apple">{h.faqSectionTitle}</h2>
      <ul className="mt-4 space-y-3">
        {h.faqItems.map((item, i) => (
          <li key={i} className="overflow-hidden rounded-2xl border border-orange-100/90 bg-white shadow-sm">
            <details className="group">
              <summary className="cursor-pointer list-none px-4 py-3 text-[15px] font-bold marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="text-apple">Q.</span> {item.question}
              </summary>
              <div className="border-t border-orange-100/80 bg-u-lavender/20 px-4 py-3 text-[15px] leading-relaxed text-apple-ink">{item.answer}</div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
