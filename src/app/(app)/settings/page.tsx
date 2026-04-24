import { SettingsForm } from "./settings-form";
import { getSiteSettings } from "@/lib/site-settings/load-server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  const site = await getSiteSettings();
  return <SettingsForm email={user.email ?? ""} copy={site.copy.settingsPage} />;
}
