import type { UserMemoryProfile } from "@/types/user-memory";
import type { WorkoutRow } from "@/types/workout";

function byDateAsc(a: WorkoutRow, b: WorkoutRow) {
  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
}

function byDateDesc(a: WorkoutRow, b: WorkoutRow) {
  return -byDateAsc(a, b);
}

/** 기록만으로 규칙 기반 한국어 코칭 문단 생성 */
export function buildLocalCoachingText(rows: WorkoutRow[], memory?: UserMemoryProfile | null): string {
  const sorted = [...rows].sort(byDateDesc);
  const recent = sorted.slice(0, 20);
  const lines: string[] = [];

  lines.push("## 기록 기반 피드백");
  lines.push("");
  if (memory?.personalization_bullets?.length) {
    lines.push("### 사용자 메모리 기반 개인 멘트(우선 반영)");
    lines.push("");
    for (const b of memory.personalization_bullets.slice(0, 5)) {
      lines.push(`- ${b}`);
    }
    lines.push("");
  }
  lines.push(`최근 기준으로 ${recent.length}건을 살펴봤어요.`);

  const failCount = recent.filter((r) => !r.success).length;
  if (failCount > 0) {
    lines.push(
      `실패로 표시된 세트가 ${failCount}건 있어요. 무리한 중량·휴식 부족·폼/가동범위·전날 컨디션 등을 한 번씩 점검해 보는 걸 추천해요. (원인은 추정일 뿐이에요.)`,
    );
  } else {
    lines.push("최근 구간에서는 실패 표시가 없어요. 컨디션 관리가 잘 되고 있는 편으로 보여요.");
  }
  lines.push("");

  const byName = new Map<string, WorkoutRow[]>();
  for (const r of rows) {
    const key = r.exercise_name.trim();
    if (!key) continue;
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key)!.push(r);
  }

  lines.push("## 운동별 중량 흐름");
  lines.push("");

  for (const [name, list] of byName) {
    const asc = [...list].sort(byDateAsc);
    if (asc.length < 2) {
      lines.push(`- **${name}**: 기록이 1건뿐이라 증감은 다음에 판단할 수 있어요.`);
      continue;
    }
    const prev = asc[asc.length - 2];
    const last = asc[asc.length - 1];
    const wPrev = Number(prev.weight_kg);
    const wLast = Number(last.weight_kg);
    let trend = "유지에 가까워요";
    if (wLast > wPrev + 0.01) trend = "마지막 기록 기준으로 중량이 올라갔어요";
    else if (wLast < wPrev - 0.01) trend = "마지막 기록 기준으로 중량이 내려갔어요";
    lines.push(
      `- **${name}**: ${trend} (${wPrev}kg → ${wLast}kg, ${last.reps}회 × ${last.sets}세트, ${last.success ? "성공" : "실패"})`,
    );
  }

  lines.push("");
  lines.push("## 다음 운동 제안 (일반 원칙)");
  lines.push("");
  const last = sorted[0];
  if (last) {
    const w = Number(last.weight_kg);
    if (!last.success) {
      lines.push(
        `- 마지막이 실패였다면: 같은 운동에서 중량을 약 5~10% 낮추거나, 세트 수를 1줄이고 레프는 1~2회 줄여서 **기술과 속도를 우선**해 보세요.`,
      );
    } else {
      lines.push(
        `- 마지막이 성공이었다면: 같은 레프·세트를 유지한 채 **2.5~5% 정도만** 중량을 올려 보거나, 중량은 유지하고 레프를 1회 늘려 보는 식으로 소폭 진행해 보세요.`,
      );
      lines.push(`- 참고로 마지막 기록은 ${last.exercise_name} ${w}kg × ${last.reps} × ${last.sets}세트예요.`);
    }
  }

  return lines.join("\n");
}
