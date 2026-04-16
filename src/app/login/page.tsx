import { LoginForm } from "@/app/login/login-form";
import { getSiteSettings } from "@/lib/site-settings/load-server";
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

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      redirect(redirectAfter ?? "/");
    }
  } catch {
    /* env 미설정 시 로그인 폼에서 안내 */
  }

  const site = await getSiteSettings();

  return <LoginForm site={site} postLoginRedirect={redirectAfter} urlError={urlError} />;
}
