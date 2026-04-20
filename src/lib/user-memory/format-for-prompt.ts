import type { UserMemoryProfile } from "@/types/user-memory";

/** LLM·로컬 코칭에 넣을 짧은 한국어 블록 */
export function formatUserMemoryForPrompt(m: UserMemoryProfile): string {
  const lines = [
    `- 목표: ${m.goal}`,
    `- 경험 수준: ${m.experience_level}`,
    `- 최근 자주 한 운동: ${m.preferred_exercises.length ? m.preferred_exercises.join(", ") : "(데이터 부족)"}`,
    `- 보완이 필요해 보이는 부위/패턴: ${m.weak_points.join(" / ")}`,
    `- 부상·주의 이력(사용자 입력·이전 저장): ${m.injury_history.length ? m.injury_history.join("; ") : "없음"}`,
    `- 최근 7일 일관성 점수: ${m.consistency_score}/100`,
    `- 누적 부담(피로 지표): ${m.fatigue_level}/100`,
  ];
  return lines.join("\n");
}
