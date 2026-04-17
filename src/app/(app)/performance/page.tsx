import { PerformanceClient } from "./performance-client";
import { mapWorkoutRow } from "@/lib/workouts/map-db-row";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PerformancePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) {
    return <PerformanceClient initialRows={[]} />;
  }
  const rows = (data ?? []).map((r) => mapWorkoutRow(r as Record<string, unknown>));
  return <PerformanceClient initialRows={rows} />;
}
