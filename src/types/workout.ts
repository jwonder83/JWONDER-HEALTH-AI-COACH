export type WorkoutRow = {
  id: string;
  user_id: string;
  exercise_name: string;
  weight_kg: number;
  reps: number;
  sets: number;
  success: boolean;
  created_at: string;
};

export type WorkoutInput = {
  exercise_name: string;
  weight_kg: number;
  reps: number;
  sets: number;
  success: boolean;
};
