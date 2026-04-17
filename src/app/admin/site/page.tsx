import { AdminSiteEditor } from "@/components/admin/AdminSiteEditor";
import { getSiteSettings } from "@/lib/site-settings/load-server";

export default async function AdminSitePage() {
  const initialSettings = await getSiteSettings();
  return <AdminSiteEditor initialSettings={initialSettings} />;
}
