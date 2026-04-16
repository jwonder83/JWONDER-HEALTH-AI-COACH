import type { WorkoutRow } from "@/types/workout";
import { buildLocalCoachingText } from "./analyze-workouts";

type OpenAIChatResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
  error?: { message?: string };
};

function formatWorkoutsTable(rows: WorkoutRow[]): string {
  const sorted = [...rows].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const slice = sorted.slice(0, 45);
  const header = "| 날짜(ISO) | 운동명 | kg | reps | sets | 성공 |";
  const sep = "|---|---|---|---|---|---|";
  const lines = slice.map((r) => {
    const ok = r.success ? "예" : "아니오";
    const name = r.exercise_name.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
    return `| ${r.created_at} | ${name} | ${r.weight_kg} | ${r.reps} | ${r.sets} | ${ok} |`;
  });
  return [header, sep, ...lines].join("\n");
}

const SYSTEM_PROMPT = `당신은 한국어로 답하는 헬스·스rength 트레이닝 코치입니다.
사용자의 운동 기록을 바탕으로 격려와 구체적인 개선 제안을 해 주세요.
의학적 진단·부상 판정은 하지 말고, 통증·이상이 있으면 전문가 상담을 권하는 문장을 포함하세요.
마크다운(##, ###, 목록)을 사용해 가독성 있게 작성하세요.`;

/** OpenAI Chat Completions로 AI 코칭 텍스트 생성 */
export async function buildAiCoaching(rows: WorkoutRow[]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY 가 설정되지 않았습니다. .env.local 에 OpenAI API 키를 추가하세요.",
    );
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const localSummary = buildLocalCoachingText(rows);
  const table = formatWorkoutsTable(rows);

  const userContent = `아래는 사용자의 최근 운동 기록 표입니다.

## 기록 표
${table}

---

## 참고용 자동 요약 (코드 생성)
아래 요약의 숫자·추세와 모순되지 않게 코칭해 주세요.

${localSummary}

---

위 자료를 바탕으로 한국어로 코칭을 작성해 주세요. 포함할 내용:
1. 전체적인 흐름에 대한 짧은 평가와 격려
2. 운동별로 중요한 패턴이 있으면 언급
3. 다음 1~2주 안에 시도해 볼 수 있는 구체적인 제안 2~4가지`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.65,
      max_tokens: 2800,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
    }),
  });

  const json = (await res.json()) as OpenAIChatResponse;

  if (!res.ok) {
    const errMsg = json.error?.message ?? `OpenAI API 오류 (HTTP ${res.status})`;
    throw new Error(errMsg);
  }

  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("OpenAI 응답에 코칭 텍스트가 없습니다.");
  }

  return text;
}
