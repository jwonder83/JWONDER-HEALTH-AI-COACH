import type { WorkoutRow } from "@/types/workout";

export function mapWorkoutRow(r: Record<string, unknown>): WorkoutRow {
  return {
    id: String(r.id),
    user_id: String(r.user_id),
    exercise_name: String(r.exercise_name),
    weight_kg: Number(r.weight_kg),
    reps: Math.round(Number(r.reps)),
    sets: Math.round(Number(r.sets)),
    success: Boolean(r.success),
    created_at: String(r.created_at),
  };
}
