import { WorkoutSessionClient } from "@/components/workout-session/WorkoutSessionClient";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function WorkoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  return <WorkoutSessionClient userId={user.id} />;
}
