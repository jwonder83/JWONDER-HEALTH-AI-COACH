import { AdminSiteEditor } from "@/components/admin/AdminSiteEditor";
import { isUserAdmin } from "@/lib/site-settings/admin-check";
import { getSiteSettings } from "@/lib/site-settings/load-server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login?redirect=/admin");
  }
  if (!isUserAdmin(user.email)) {
    redirect("/");
  }

  const initialSettings = await getSiteSettings();

  return <AdminSiteEditor initialSettings={initialSettings} />;
}
