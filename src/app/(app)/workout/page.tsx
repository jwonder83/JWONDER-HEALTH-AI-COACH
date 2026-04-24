import { WorkoutSessionClient } from "@/components/workout-session/WorkoutSessionClient";
import { getSiteSettings } from "@/lib/site-settings/load-server";
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
  const site = await getSiteSettings();
  return (
    <WorkoutSessionClient
      userId={user.id}
      restTargetSeconds={site.experience.workoutRestTargetSeconds}
      missedDayHourLocal={site.experience.missedDayHourLocal}
      sessionCopy={site.copy.workoutSession}
    />
  );
}
