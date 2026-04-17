import { SignupForm } from "@/app/signup/signup-form";
import { getSiteSettings } from "@/lib/site-settings/load-server";
import { isSupabasePublicEnvConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SignupPage() {
  if (isSupabasePublicEnvConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      redirect("/");
    }
  }

  const site = await getSiteSettings();
  const supabaseEnvReady = isSupabasePublicEnvConfigured();

  return <SignupForm site={site} supabaseEnvReady={supabaseEnvReady} />;
}
