"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function SignOutButton({ className, label = "로그아웃" }: { className?: string; label?: string }) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button type="button" onClick={() => void signOut()} className={className}>
      {label}
    </button>
  );
}
