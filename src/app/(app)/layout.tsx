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
    const footerMeta = {
      statusUrl: process.env.NEXT_PUBLIC_STATUS_URL?.trim() || undefined,
      statusLabel: process.env.NEXT_PUBLIC_STATUS_LABEL?.trim() || undefined,
      feedbackMailto: process.env.NEXT_PUBLIC_FEEDBACK_EMAIL?.trim()
        ? `mailto:${process.env.NEXT_PUBLIC_FEEDBACK_EMAIL.trim()}`
        : undefined,
      feedbackFormUrl: process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL?.trim() || undefined,
    };
    return (
      <AppShell email={user.email ?? ""} showAdminLink={showAdminLink} site={site} footerMeta={footerMeta}>
        {children}
      </AppShell>
    );
  } catch {
    redirect("/login?error=server");
  }
}
