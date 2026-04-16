import { SignupForm } from "@/app/signup/signup-form";
import { getSiteSettings } from "@/lib/site-settings/load-server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SignupPage() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      redirect("/");
    }
  } catch {
    /* env 미설정 */
  }

  const site = await getSiteSettings();

  return <SignupForm site={site} />;
}
