import { PaymentSuccessClient } from "./payment-success-client";
import { getSiteSettings } from "@/lib/site-settings/load-server";

export default async function PaymentSuccessPage() {
  const site = await getSiteSettings();
  return <PaymentSuccessClient copy={site.copy.billingPages} />;
}
