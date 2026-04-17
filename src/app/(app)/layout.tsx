import { AppShell } from "@/components/layout/AppShell";
import { isUserAdmin } from "@/lib/site-settings/admin-check";
import { getSiteSettings } from "@/lib/site-settings/load-server";
import { isSupabasePublicEnvConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function AppLayout({ children }: { children: ReactNode }) {
  if (!isSupabasePublicEnvConfigured()) {
    redirect("/login?error=config");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  try {
    const site = await getSiteSettings();
    const showAdminLink = isUserAdmin(user.email);
    return (
      <AppShell email={user.email ?? ""} showAdminLink={showAdminLink} site={site}>
        {children}
      </AppShell>
    );
  } catch {
    redirect("/login?error=server");
  }
}
