import { HomeDashboard } from "@/components/dashboard/HomeDashboard";
import { getSiteSettings } from "@/lib/site-settings/load-server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  const site = await getSiteSettings();
  return <HomeDashboard userId={user.id} site={site} />;
}
