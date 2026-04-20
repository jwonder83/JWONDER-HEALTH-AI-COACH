/** 홈·코치 등 동일 탭에서 운동 데이터가 바뀌었을 때 구독 컴포넌트가 다시 불러오도록 알립니다. */
export const WORKOUTS_MUTATED_EVENT = "jws-workouts-mutated";

export function notifyWorkoutsMutated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(WORKOUTS_MUTATED_EVENT));
}
