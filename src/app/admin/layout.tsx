import { AdminSubNav } from "@/components/admin/AdminSubNav";
import { isUserAdmin } from "@/lib/site-settings/admin-check";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
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

  return (
    <div className="min-h-screen bg-white pb-20 text-apple-ink">
      <AdminSubNav />
      {children}
    </div>
  );
}
