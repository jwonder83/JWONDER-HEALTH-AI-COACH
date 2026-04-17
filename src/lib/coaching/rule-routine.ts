import type { OnboardingProfile } from "@/lib/onboarding/types";

const goalKo: Record<string, string> = {
  bulk: "근비대·근력",
  cut: "다이어트·유지근육",
  maintain: "건강·유지",
  "": "균형",
};

export function buildWeeklyRoutineMarkdown(p: OnboardingProfile): string {
  const g = goalKo[p.goal] ?? "균형";
  const days = p.daysPerWeek ? `${p.daysPerWeek}일` : "3~4일";
  const exp =
    p.experience === "beginner" ? "초급(기본 패턴 익히기)" : p.experience === "advanced" ? "상급(볼륨·강도 조절)" : "중급";
  const eq = p.equipment.trim() || "바벨·덤벨·머신 등 일반 헬스장 장비";

  return [
    `## 주간 루틴 초안 (${g} · ${exp} · 주 ${days})`,
    "",
    `사용 장비: ${eq}`,
    "",
    "| 요일 | 초점 | 예시 종목 |",
    "|------|------|-----------|",
    "| 월 | 하체·밀기 | 스쿼트 또는 레그프레스, 런지, 카프 |",
    "| 화 | 휴식 또는 가벼운 유산소 | — |",
    "| 수 | 상체 당기기 | 랫풀다운/바벨로우, 페이스풀, 이두 |",
    "| 목 | 하체·힙힌지 | 루마니안 데드, 힙쓰러스트, 코어 |",
    "| 금 | 상체 밀기 | 벤치·오버헤드 프레스, 삼두 |",
    "| 토 | 선택(약점) | 약한 패턴 2~3종목만 |",
    "| 일 | 휴식 | — |",
    "",
    "> 실제 요일은 **운동 가능한 날**에 맞춰 월~일 행만 골라 쓰면 됩니다. 첫 2주는 중량보다 **동작 질·일정 준수**를 우선하세요.",
  ].join("\n");
}
