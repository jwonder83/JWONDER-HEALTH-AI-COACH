import { SectionTitleBlock } from "@/components/ui/SectionTitleBlock";
import { getSiteSettings } from "@/lib/site-settings/load-server";

export default async function HelpPage() {
  const site = await getSiteSettings();
  const h = site.copy.helpCenter;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8 sm:py-14">
      <SectionTitleBlock step="?" eyebrow="HELP" title={h.pageTitle} />
      <p className="mt-2 whitespace-pre-wrap text-[16px] leading-relaxed text-apple-subtle">{h.intro}</p>
      <p className="mt-6 border-l-4 border-apple bg-apple/5 px-4 py-3 text-[15px] font-medium text-apple-ink">{h.contactLine}</p>

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
