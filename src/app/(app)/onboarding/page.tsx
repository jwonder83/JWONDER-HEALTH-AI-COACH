import { OnboardingClient } from "./onboarding-client";
import { getSiteSettings } from "@/lib/site-settings/load-server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const site = await getSiteSettings();
  return <OnboardingClient copy={site.copy.onboarding} />;
}
