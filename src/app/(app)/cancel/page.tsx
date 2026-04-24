import { getSiteSettings } from "@/lib/site-settings/load-server";
import Link from "next/link";

export default async function PaymentCancelPage() {
  const site = await getSiteSettings();
  const b = site.copy.billingPages;
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center text-apple-ink dark:text-zinc-100">
      <p className="font-display text-2xl font-bold tracking-tight">{b.cancelTitle}</p>
      <p className="mt-4 text-[15px] text-apple-subtle dark:text-zinc-400">{b.cancelSubtitle}</p>
      <Link href="/settings" className="mt-10 inline-block text-[15px] font-semibold underline underline-offset-4">
        {b.settingsLink}
      </Link>
    </div>
  );
}
