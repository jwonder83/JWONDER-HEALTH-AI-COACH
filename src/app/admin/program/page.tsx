import { AdminProgramEditor } from "@/components/admin/AdminProgramEditor";
import { getSiteSettings } from "@/lib/site-settings/load-server";

export default async function AdminProgramPage() {
  const initialSettings = await getSiteSettings();
  return <AdminProgramEditor initialSettings={initialSettings} />;
}
