import { BillingSuccessClient } from "./billing-success-client";
import { getSiteSettings } from "@/lib/site-settings/load-server";
import { Suspense } from "react";

export default async function BillingSuccessPage() {
  const site = await getSiteSettings();
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-16 text-center text-[15px] text-apple-subtle dark:text-zinc-400">
          불러오는 중…
        </div>
      }
    >
      <BillingSuccessClient copy={site.copy.billingPages} />
    </Suspense>
  );
}
