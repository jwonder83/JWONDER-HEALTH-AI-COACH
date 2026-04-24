import { SectionTitleBlock } from "@/components/ui/SectionTitleBlock";
import { getSiteSettings } from "@/lib/site-settings/load-server";

export default async function PrivacyPage() {
  const site = await getSiteSettings();
  const { privacyTitle, privacyBody } = site.copy.legalPages;
  const paragraphs = privacyBody.split(/\n\n+/).filter(Boolean);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8 sm:py-14">
      <SectionTitleBlock step="P" eyebrow={site.copy.legalPages.privacyEyebrow} title={privacyTitle} />
      <article className="mt-2 space-y-4 border border-neutral-200 bg-white p-6 text-[15px] leading-relaxed text-apple-ink shadow-sm">
        {paragraphs.map((p, i) => (
          <p key={i} className="whitespace-pre-wrap">
            {p}
          </p>
        ))}
      </article>
    </div>
  );
}
