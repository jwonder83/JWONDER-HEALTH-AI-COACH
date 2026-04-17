import { AdminLoginEditor } from "@/components/admin/AdminLoginEditor";
import { getSiteSettings } from "@/lib/site-settings/load-server";

export default async function AdminLoginPage() {
  const initialSettings = await getSiteSettings();
  return <AdminLoginEditor initialSettings={initialSettings} />;
}
