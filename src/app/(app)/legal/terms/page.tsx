import { SectionTitleBlock } from "@/components/ui/SectionTitleBlock";
import { getSiteSettings } from "@/lib/site-settings/load-server";

export default async function TermsPage() {
  const site = await getSiteSettings();
  const { termsTitle, termsBody } = site.copy.legalPages;
  const paragraphs = termsBody.split(/\n\n+/).filter(Boolean);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8 sm:py-14">
      <SectionTitleBlock step="T" eyebrow="LEGAL" title={termsTitle} />
      <article className="mt-2 space-y-4 rounded-[1.75rem] border border-orange-100/90 bg-white/95 p-6 text-[15px] leading-relaxed text-apple-ink shadow-[0_16px_48px_-20px_rgba(233,75,60,0.12)]">
        {paragraphs.map((p, i) => (
          <p key={i} className="whitespace-pre-wrap">
            {p}
          </p>
        ))}
      </article>
    </div>
  );
}
