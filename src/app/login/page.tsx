import { LoginForm } from "@/app/login/login-form";
import { getSiteSettings } from "@/lib/site-settings/load-server";
import { isSupabasePublicEnvConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function safeInternalPath(v: string | string[] | undefined): string | null {
  const raw = Array.isArray(v) ? v[0] : v;
  if (!raw || typeof raw !== "string") return null;
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//") || t.includes("://")) return null;
  return t;
}

function firstString(v: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(v) ? v[0] : v;
  return typeof raw === "string" ? raw : undefined;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string | string[]; error?: string | string[] }>;
}) {
  const sp = await searchParams;
  const redirectAfter = safeInternalPath(sp.redirect);
  const urlError = firstString(sp.error);

  /* redirect()는 예외로 동작하므로 try/catch로 감싸면 안 됨 */
  if (isSupabasePublicEnvConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      redirect(redirectAfter ?? "/");
    }
  }

  const site = await getSiteSettings();
  const supabaseEnvReady = isSupabasePublicEnvConfigured();

  return (
    <LoginForm site={site} postLoginRedirect={redirectAfter} urlError={urlError} supabaseEnvReady={supabaseEnvReady} />
  );
}
